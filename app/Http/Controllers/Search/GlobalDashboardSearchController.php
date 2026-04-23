<?php

namespace App\Http\Controllers\Search;

use App\Http\Controllers\Controller;
use App\Models\AirVehicleBookings;
use App\Models\Booking;
use App\Models\BusBooking;
use App\Models\Courier\CourierShipment;
use App\Models\Courier\CourierVendorCodCapability;
use App\Models\Courier\VendorCourierSetting;
use App\Models\FlightBooking;
use App\Models\SeaVehicleBookings;
use App\Models\ServiceWorkspace;
use App\Models\TrainBooking;
use App\Models\User;
use App\Models\Warehouse\WarehouseBooking;
use App\Services\Rbac\ServiceWorkspaceManager;
use App\Support\SuperAdminCourierWorkspace;
use Closure;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Spatie\Permission\PermissionRegistrar;
use Throwable;

class GlobalDashboardSearchController extends Controller
{
    public function __construct(
        private readonly ServiceWorkspaceManager $workspaceManager,
        private readonly PermissionRegistrar $permissionRegistrar,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'limit' => ['nullable', 'integer', 'min:5', 'max:40'],
        ]);

        $query = trim((string) ($validated['q'] ?? ''));
        $limit = (int) ($validated['limit'] ?? 20);

        if ($query === '' || Str::length($query) < 1) {
            return response()->json([
                'data' => [],
                'meta' => [
                    'query' => $query,
                    'count' => 0,
                    'limit' => $limit,
                ],
            ]);
        }

        $actor = $request->user();

        if (!$actor instanceof User) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $role = strtolower((string) ($actor->role ?? ''));
        $isSuperAdmin = $role === 'superadmin';
        $isClient = $role === 'client';

        $vendorUserId = null;
        $vendorCourierWorkspaceId = 0;

        if (!$isSuperAdmin && !$isClient) {
            $vendorUser = $this->workspaceManager->resolveVendorUserForActor($actor);
            $vendorUserId = $vendorUser?->id ? (int) $vendorUser->id : null;

            if ($vendorUserId) {
                $vendorCourierWorkspaceId = (int) ServiceWorkspace::query()
                    ->where('vendor_user_id', $vendorUserId)
                    ->where('service_key', ServiceWorkspaceManager::COURIER_SERVICE_KEY)
                    ->value('id');
            }
        }

        $superAdminPermissions = [];
        $allowSuperAdminBootstrap = false;
        $courierPermissions = [];
        $allowCourierFallback = false;

        if ($isSuperAdmin) {
            $workspaceId = SuperAdminCourierWorkspace::idForUser($actor);
            $this->permissionRegistrar->setPermissionsTeamId($workspaceId);

            $prefix = (string) config('courier.superadmin_rbac.permission_prefix', 'superadmin.courier.');

            $superAdminPermissions = $actor->getAllPermissions()
                ->pluck('name')
                ->filter(fn ($name) => str_starts_with((string) $name, $prefix))
                ->unique()
                ->values()
                ->all();

            $allowSuperAdminBootstrap = (bool) config('courier.superadmin_rbac.bootstrap_allow_all', true)
                && count($superAdminPermissions) === 0;
        } elseif ($vendorCourierWorkspaceId > 0) {
            $this->permissionRegistrar->setPermissionsTeamId($vendorCourierWorkspaceId);

            $courierPermissions = $actor->getAllPermissions()
                ->pluck('name')
                ->filter(fn ($name) => str_starts_with((string) $name, 'courier.'))
                ->unique()
                ->values()
                ->all();

            $allowCourierFallback = count($courierPermissions) === 0;
        }

        $isVendorWorkspaceActor = !$isClient && !$isSuperAdmin && (bool) $vendorUserId;
        if ($isVendorWorkspaceActor && $vendorCourierWorkspaceId <= 0) {
            $allowCourierFallback = true;
        }

        $canViewCourierOperations = $isSuperAdmin
            && $this->hasScopedPermission(
                $superAdminPermissions,
                'superadmin.courier.operations.view',
                $allowSuperAdminBootstrap
            );

        $canViewCodSettings = $isSuperAdmin
            && $this->hasScopedPermission(
                $superAdminPermissions,
                'superadmin.courier.cod.settings.view',
                $allowSuperAdminBootstrap
            );

        $canViewReports = $isSuperAdmin
            && $this->hasScopedPermission(
                $superAdminPermissions,
                'superadmin.courier.reports.view',
                $allowSuperAdminBootstrap
            );

        $canVendorViewCourierBookings = $isVendorWorkspaceActor
            && $this->hasScopedPermission($courierPermissions, 'courier.bookings.view', $allowCourierFallback);

        $canVendorViewCourierSettings = $isVendorWorkspaceActor
            && $this->hasScopedPermission($courierPermissions, 'courier.settings.view', $allowCourierFallback);

        $entries = collect();
        $staticEntries = $this->buildStaticDashboardEntries(
            isClient: $isClient,
            isSuperAdmin: $isSuperAdmin,
            isVendorWorkspaceActor: $isVendorWorkspaceActor,
            canViewReports: $canViewReports,
            canViewCodSettings: $canViewCodSettings,
            canViewCourierOperations: $canViewCourierOperations,
            canViewPricingGovernance: $isSuperAdmin
                && $this->hasScopedPermission(
                    $superAdminPermissions,
                    'superadmin.courier.pricing.governance.view',
                    $allowSuperAdminBootstrap
                ),
            canVendorViewCourierSettings: $canVendorViewCourierSettings
        );

        $staticEntries
            ->filter(fn (array $entry) => $this->entryMatchesQuery($entry, $query))
            ->each(fn (array $entry) => $entries->push($entry));

        if ($canVendorViewCourierSettings && $vendorUserId) {
            $this->buildVendorCourierSettingsFieldEntries($vendorUserId)
                ->filter(fn (array $entry) => $this->entryMatchesQuery($entry, $query))
                ->each(fn (array $entry) => $entries->push($entry));
        }

        // Courier shipments
        if ($isClient || $canViewCourierOperations || $canVendorViewCourierBookings) {
            $shipments = $this->runScoutSearch(
                CourierShipment::class,
                $query,
                min($limit, 15),
                function (Builder $builder) use ($isClient, $actor, $canVendorViewCourierBookings, $vendorUserId): void {
                    if ($isClient) {
                        $builder->where('requested_by_user_id', (int) $actor->id);
                        return;
                    }

                    if ($canVendorViewCourierBookings && $vendorUserId) {
                        $builder->where('assigned_vendor_user_id', (int) $vendorUserId);
                    }
                }
            );

            $shipmentContext = $isClient ? 'client' : ($isSuperAdmin ? 'superadmin' : 'vendor');

            $shipments->each(function (CourierShipment $shipment) use ($entries, $shipmentContext): void {
                $entries->push(
                    $this->mapCourierShipmentEntry(
                        $shipment,
                        $shipmentContext
                    )
                );
            });
        }

        // COD capabilities
        if ($canViewCodSettings || $canVendorViewCourierSettings) {
            $capabilities = $this->runScoutSearch(
                CourierVendorCodCapability::class,
                $query,
                min($limit, 12),
                function (Builder $builder) use ($canVendorViewCourierSettings, $vendorUserId): void {
                    $builder->with(['vendor:id,name']);

                    if ($canVendorViewCourierSettings && $vendorUserId) {
                        $builder->where('vendor_user_id', (int) $vendorUserId);
                    }
                }
            );

            $capabilities->each(function (CourierVendorCodCapability $capability) use ($entries, $canViewCodSettings): void {
                $entries->push($this->mapCodCapabilityEntry($capability, $canViewCodSettings ? 'superadmin' : 'vendor'));
            });
        }

        // Users (Super Admin)
        if ($isSuperAdmin) {
            $users = $this->runScoutSearch(
                User::class,
                $query,
                min($limit, 15),
                fn (Builder $builder) => $builder->whereNotNull('name')
            );

            $users->each(function (User $user) use ($entries): void {
                $entries->push($this->mapUserEntry($user));
            });
        }

        // Vehicle bookings (land/air/sea)
        if ($isClient || $isVendorWorkspaceActor || $canViewReports) {
            $vehicleScope = function (Builder $builder) use ($isClient, $actor, $vendorUserId): void {
                if ($isClient) {
                    $builder->where('client_id', (int) $actor->id);
                    return;
                }

                if ($vendorUserId) {
                    $builder->whereHas('vehicle', function (Builder $vehicleQuery) use ($vendorUserId): void {
                        $vehicleQuery->where('provider_id', (int) $vendorUserId);
                    });
                }
            };

            $landBookings = $this->runScoutSearch(Booking::class, $query, min($limit, 15), $vehicleScope);
            $airBookings = $this->runScoutSearch(AirVehicleBookings::class, $query, min($limit, 15), $vehicleScope);
            $seaBookings = $this->runScoutSearch(SeaVehicleBookings::class, $query, min($limit, 15), $vehicleScope);

            $vehicleContext = $isClient ? 'client' : ($isVendorWorkspaceActor ? 'vendor' : 'superadmin');

            $landBookings->each(function (Booking $booking) use ($entries, $vehicleContext): void {
                $entries->push($this->mapVehicleBookingEntry($booking, $vehicleContext, 'land'));
            });

            $airBookings->each(function (AirVehicleBookings $booking) use ($entries, $vehicleContext): void {
                $entries->push($this->mapVehicleBookingEntry($booking, $vehicleContext, 'air'));
            });

            $seaBookings->each(function (SeaVehicleBookings $booking) use ($entries, $vehicleContext): void {
                $entries->push($this->mapVehicleBookingEntry($booking, $vehicleContext, 'sea'));
            });
        }

        // Ticket bookings (client + super admin reports)
        if ($isClient || $canViewReports) {
            $ticketScope = function (Builder $builder) use ($isClient, $actor): void {
                if ($isClient) {
                    $builder->where('user_id', (int) $actor->id);
                }
            };

            $trainBookings = $this->runScoutSearch(TrainBooking::class, $query, min($limit, 12), $ticketScope);
            $busBookings = $this->runScoutSearch(BusBooking::class, $query, min($limit, 12), $ticketScope);
            $flightBookings = $this->runScoutSearch(FlightBooking::class, $query, min($limit, 12), $ticketScope);

            $ticketContext = $isClient ? 'client' : 'superadmin';

            $trainBookings->each(function (TrainBooking $booking) use ($entries, $ticketContext): void {
                $entries->push($this->mapTrainBookingEntry($booking, $ticketContext));
            });

            $busBookings->each(function (BusBooking $booking) use ($entries, $ticketContext): void {
                $entries->push($this->mapBusBookingEntry($booking, $ticketContext));
            });

            $flightBookings->each(function (FlightBooking $booking) use ($entries, $ticketContext): void {
                $entries->push($this->mapFlightBookingEntry($booking, $ticketContext));
            });
        }

        // Warehouse bookings
        if ($isClient || $isVendorWorkspaceActor || $canViewReports) {
            $warehouseBookings = $this->runScoutSearch(
                WarehouseBooking::class,
                $query,
                min($limit, 12),
                function (Builder $builder) use ($isClient, $actor, $vendorUserId): void {
                    if ($isClient) {
                        $builder->where('user_id', (int) $actor->id);
                        return;
                    }

                    if ($vendorUserId) {
                        $builder->whereHas('warehouseUnit', function (Builder $unitQuery) use ($vendorUserId): void {
                            $unitQuery->where('user_id', (int) $vendorUserId);
                        });
                    }
                }
            );

            $warehouseContext = $isClient ? 'client' : ($isVendorWorkspaceActor ? 'vendor' : 'superadmin');

            $warehouseBookings->each(function (WarehouseBooking $booking) use ($entries, $warehouseContext): void {
                $entries->push($this->mapWarehouseBookingEntry($booking, $warehouseContext));
            });
        }

        $normalized = $entries
            ->filter(fn ($entry) => is_array($entry) && !empty($entry['title']) && !empty($entry['path']))
            ->unique(fn ($entry) => ($entry['id'] ?? '') . '::' . ($entry['path'] ?? ''))
            ->sortByDesc(fn (array $entry) => $this->scoreEntryForQuery($entry, $query))
            ->values()
            ->take($limit * 4);

        return response()->json([
            'data' => $normalized,
            'meta' => [
                'query' => $query,
                'count' => $normalized->count(),
                'limit' => $limit,
            ],
        ]);
    }

    private function hasScopedPermission(array $permissions, string $permission, bool $allowWhenMissingAssignments = false): bool
    {
        if (in_array($permission, $permissions, true)) {
            return true;
        }

        return $allowWhenMissingAssignments && count($permissions) === 0;
    }

    private function runScoutSearch(string $modelClass, string $query, int $limit, ?Closure $queryCallback = null): Collection
    {
        try {
            $searchBuilder = $modelClass::search($query);

            if ($queryCallback) {
                $searchBuilder->query($queryCallback);
            }

            $results = $searchBuilder->take($limit)->get();

            // If Scout index is stale or not yet imported, return DB fallback results
            // so global search still works across accessible dashboards.
            if ($results->isNotEmpty()) {
                return $results;
            }

            return $this->runFallbackSearch($modelClass, $query, $limit, $queryCallback);
        } catch (Throwable $error) {
            Log::warning('Global dashboard Scout search failed; using DB fallback.', [
                'model' => $modelClass,
                'query' => $query,
                'message' => $error->getMessage(),
            ]);

            return $this->runFallbackSearch($modelClass, $query, $limit, $queryCallback);
        }
    }

    private function buildStaticDashboardEntries(
        bool $isClient,
        bool $isSuperAdmin,
        bool $isVendorWorkspaceActor,
        bool $canViewReports,
        bool $canViewCodSettings,
        bool $canViewCourierOperations,
        bool $canViewPricingGovernance,
        bool $canVendorViewCourierSettings
    ): Collection {
        $entries = collect();

        if ($isVendorWorkspaceActor && $canVendorViewCourierSettings) {
            $courierPricingTopics = [
                [
                    'key' => 'currency-formula',
                    'label' => 'Currency and Formula',
                    'description' => 'Configure localized currency display and formula controls.',
                    'keywords' => ['currency', 'formula', 'pricing', 'domestic', 'international'],
                ],
                [
                    'key' => 'policy-modules',
                    'label' => 'Policy Modules',
                    'description' => 'Define policy modules applied to courier pricing calculations.',
                    'keywords' => ['policy modules', 'policies', 'pricing', 'domestic', 'international'],
                ],
                [
                    'key' => 'contracts',
                    'label' => 'Customer Contracts',
                    'description' => 'Manage contract-specific price rules and agreements.',
                    'keywords' => ['contracts', 'customer contracts', 'pricing', 'domestic', 'international'],
                ],
                [
                    'key' => 'service-catalog',
                    'label' => 'Service Catalog',
                    'description' => 'Configure explicit service-level policies and SLA options.',
                    'keywords' => ['service catalog', 'service levels', 'sla', 'pricing', 'domestic', 'international'],
                ],
                [
                    'key' => 'governance',
                    'label' => 'Pricing Governance',
                    'description' => 'Review pricing governance controls and approval checkpoints.',
                    'keywords' => ['pricing governance', 'governance', 'pricing', 'domestic', 'international'],
                ],
                [
                    'key' => 'rate-cards',
                    'label' => 'Rate Cards',
                    'description' => 'Manage domestic courier rate cards and SLA pricing rows.',
                    'keywords' => ['rate cards', 'pricing', 'domestic', 'international', 'sla'],
                ],
                [
                    'key' => 'zone-master',
                    'label' => 'Zone Master',
                    'description' => 'Maintain courier zone definitions used by pricing logic.',
                    'keywords' => ['zone master', 'zones', 'pricing', 'domestic', 'international'],
                ],
                [
                    'key' => 'lane-matrix',
                    'label' => 'Lane Matrix',
                    'description' => 'Configure lane matrix mapping for route-based calculations.',
                    'keywords' => ['lane matrix', 'routes', 'pricing', 'domestic', 'international'],
                ],
                [
                    'key' => 'preview',
                    'label' => 'Formula Preview',
                    'description' => 'Preview pricing formula outcomes before publishing.',
                    'keywords' => ['formula preview', 'formula', 'pricing', 'domestic', 'international'],
                ],
            ];

            foreach ($courierPricingTopics as $topic) {
                $entries->push([
                    'id' => 'static-vendor-courier-pricing-' . (string) $topic['key'],
                    'title' => 'Courier Service ' . (string) $topic['label'],
                    'path' => '/courierService/settingsPage/pricing/' . (string) $topic['key'] . '/domestic',
                    'manualPath' => 'Courier Service > Settings > Pricing > ' . (string) $topic['label'],
                    'group' => 'Courier Service',
                    'description' => (string) $topic['description'],
                    'keywords' => array_values(array_filter([
                        'courier service',
                        'settings',
                        'pricing',
                        ...(array) $topic['keywords'],
                    ])),
                ]);
            }
        }

        if ($isClient) {
            $entries->push(
                [
                    'id' => 'static-client-courier-dashboard',
                    'title' => 'Courier Dashboard',
                    'path' => '/courierBookingDashboard',
                    'manualPath' => 'Client Dashboard > Courier Booking',
                    'group' => 'Client',
                    'description' => 'Manage client courier shipments and status.',
                    'keywords' => ['courier', 'dashboard', 'shipments', 'delivery'],
                ],
                [
                    'id' => 'static-client-create-courier',
                    'title' => 'Create Courier Shipment',
                    'path' => '/couriers/create',
                    'manualPath' => 'Client Dashboard > Courier Booking > Create',
                    'group' => 'Client',
                    'description' => 'Start a new courier shipment request.',
                    'keywords' => ['create shipment', 'courier', 'booking'],
                ]
            );
        }

        if ($isSuperAdmin) {
            if ($canViewCourierOperations) {
                $entries->push([
                    'id' => 'static-superadmin-courier-operations',
                    'title' => 'Courier Operations Control',
                    'path' => '/superadmin/courier-operations',
                    'manualPath' => 'Super Admin > Services > Courier Management > Operations Control',
                    'group' => 'Courier Management',
                    'description' => 'Monitor and operate courier execution controls.',
                    'keywords' => ['courier operations', 'operations control', 'shipments'],
                ]);
            }

            if ($canViewPricingGovernance) {
                $entries->push([
                    'id' => 'static-superadmin-pricing-governance',
                    'title' => 'Courier Pricing Governance',
                    'path' => '/superadmin/pricing-governance',
                    'manualPath' => 'Super Admin > Services > Courier Management > Pricing Governance',
                    'group' => 'Courier Management',
                    'description' => 'Govern courier pricing policies and lifecycle.',
                    'keywords' => ['pricing governance', 'courier pricing', 'governance'],
                ]);
            }

            if ($canViewCodSettings) {
                $entries->push(
                    [
                        'id' => 'static-superadmin-cod-settlement',
                        'title' => 'COD Settlement',
                        'path' => '/superadmin/settings/cod-settlement',
                        'manualPath' => 'Super Admin > Finance > COD Settlement',
                        'group' => 'Finance',
                        'description' => 'Open COD settlement operations and controls.',
                        'keywords' => ['cod', 'settlement', 'finance', 'courier'],
                    ],
                    [
                        'id' => 'static-superadmin-cod-capability-requests',
                        'title' => 'COD Capability Requests',
                        'path' => '/superadmin/settings/cod-settlement#vendor-cod-capability-requests',
                        'manualPath' => 'Super Admin > COD Settlement > COD Capability Requests',
                        'group' => 'Finance',
                        'description' => 'Review and process vendor COD capability approval requests.',
                        'keywords' => ['cod', 'capability requests', 'vendor', 'settlement'],
                    ]
                );
            }

            if ($canViewReports) {
                $entries->push(
                    [
                        'id' => 'static-superadmin-report-courier',
                        'title' => 'Courier Report',
                        'path' => '/superadmin/reports/courier',
                        'manualPath' => 'Super Admin > Reports > Service Reports > Courier',
                        'group' => 'Reports',
                        'description' => 'Inspect courier shipment and SLA reports.',
                        'keywords' => ['courier report', 'reports', 'shipments', 'sla'],
                    ],
                    [
                        'id' => 'static-superadmin-report-warehouse',
                        'title' => 'Warehousing Report',
                        'path' => '/superadmin/reports/warehouse',
                        'manualPath' => 'Super Admin > Reports > Service Reports > Warehousing',
                        'group' => 'Reports',
                        'description' => 'Analyze warehouse performance and demand.',
                        'keywords' => ['warehouse report', 'reports', 'storage'],
                    ],
                    [
                        'id' => 'static-superadmin-report-tickets',
                        'title' => 'Ticket Booking Report',
                        'path' => '/superadmin/reports/tickets',
                        'manualPath' => 'Super Admin > Reports > Service Reports > Ticket Booking',
                        'group' => 'Reports',
                        'description' => 'Analyze ticket booking report metrics.',
                        'keywords' => ['ticket report', 'reports', 'bus', 'train', 'flight'],
                    ]
                );
            }
        }

        return $entries;
    }

    private function entryMatchesQuery(array $entry, string $query): bool
    {
        $tokens = collect(preg_split('/\s+/', Str::lower(trim($query))) ?: [])
            ->filter(fn ($token) => $token !== '')
            ->values();

        if ($tokens->isEmpty()) {
            return true;
        }

        $haystack = Str::lower(
            implode(' ', array_filter([
                (string) ($entry['title'] ?? ''),
                (string) ($entry['description'] ?? ''),
                (string) ($entry['group'] ?? ''),
                (string) ($entry['manualPath'] ?? ''),
                (string) ($entry['path'] ?? ''),
                implode(' ', array_map('strval', $entry['keywords'] ?? [])),
            ]))
        );

        foreach ($tokens as $token) {
            if (!str_contains($haystack, (string) $token)) {
                return false;
            }
        }

        return true;
    }

    private function scoreEntryForQuery(array $entry, string $query): int
    {
        $normalizedQuery = Str::lower(trim($query));
        if ($normalizedQuery === '') {
            return 0;
        }

        $title = Str::lower((string) ($entry['title'] ?? ''));
        $manualPath = Str::lower((string) ($entry['manualPath'] ?? ''));
        $path = Str::lower((string) ($entry['path'] ?? ''));
        $keywords = collect($entry['keywords'] ?? [])
            ->map(fn ($keyword) => Str::lower((string) $keyword))
            ->filter()
            ->values();

        $score = 0;

        if (Str::startsWith($title, $normalizedQuery)) {
            $score += 140;
        } elseif (str_contains($title, $normalizedQuery)) {
            $score += 100;
        }

        if (str_contains($manualPath, $normalizedQuery)) {
            $score += 40;
        }

        if (str_contains($path, $normalizedQuery)) {
            $score += 20;
        }

        foreach ($keywords as $keyword) {
            if (Str::startsWith($keyword, $normalizedQuery)) {
                $score += 14;
                continue;
            }

            if (str_contains($keyword, $normalizedQuery)) {
                $score += 8;
            }
        }

        $score += max(0, 30 - (int) floor(Str::length($title) / 4));

        return $score;
    }

    private function buildVendorCourierSettingsFieldEntries(int $vendorUserId): Collection
    {
        $record = VendorCourierSetting::query()
            ->select(['vendor_user_id', 'settings'])
            ->where('vendor_user_id', $vendorUserId)
            ->first();

        $settings = is_array($record?->settings) ? $record->settings : [];
        if ($settings === []) {
            return collect();
        }

        $modulePathMap = [
            'business' => '/courierService/settingsPage/business',
            'operations' => '/courierService/settingsPage/operations',
            'sla' => '/courierService/settingsPage/sla',
            'tracking' => '/courierService/settingsPage/tracking',
            'notifications' => '/courierService/settingsPage/notifications',
            'integrations' => '/courierService/settingsPage/integrations',
            'services' => '/courierService/settingsPage/services',
            'labels' => '/courierService/settingsPage/labels',
            'pricing' => '/courierService/settingsPage/pricing',
            'team' => '/courierService/settingsPage/team/policy-controls',
        ];

        $entries = collect();
        $dedupe = [];

        foreach ($settings as $moduleKey => $moduleSettings) {
            if (!is_array($moduleSettings)) {
                continue;
            }

            $moduleKeyString = (string) $moduleKey;
            $moduleLabel = $this->humanizeSettingToken($moduleKeyString);
            $modulePath = $modulePathMap[$moduleKeyString]
                ?? '/courierService/settingsPage/' . Str::kebab($moduleKeyString);
            $moduleEntries = collect();

            $leafPaths = $this->flattenCourierSettingFieldPaths($moduleSettings);

            foreach ($leafPaths as $leafPath) {
                $leafKey = (string) end($leafPath);
                if ($leafKey === '') {
                    continue;
                }

                $leafLabel = $this->humanizeSettingToken($leafKey);
                if ($leafLabel === '') {
                    continue;
                }

                $pathSegments = collect($leafPath)
                    ->slice(0, -1)
                    ->filter(fn ($segment) => !is_numeric((string) $segment))
                    ->map(fn ($segment) => $this->humanizeSettingToken((string) $segment))
                    ->filter(fn ($segment) => $segment !== '')
                    ->values()
                    ->all();

                $manualPath = 'Courier Service > Settings > ' . $moduleLabel;
                if ($pathSegments !== []) {
                    $manualPath .= ' > ' . implode(' > ', $pathSegments);
                }
                $manualPath .= ' > ' . $leafLabel;

                $entryKey = Str::lower($modulePath . '::' . $manualPath);
                if (isset($dedupe[$entryKey])) {
                    continue;
                }

                $dedupe[$entryKey] = true;

                $keywords = array_values(array_unique(array_filter([
                    'courier',
                    'settings',
                    $moduleLabel,
                    $leafLabel,
                    implode(' ', array_map('strval', $leafPath)),
                    implode(' ', $pathSegments),
                ])));

                $moduleEntries->push([
                    'id' => 'dynamic-vendor-settings-' . md5($entryKey),
                    'title' => 'Courier Service ' . $leafLabel,
                    'path' => $modulePath,
                    'manualPath' => $manualPath,
                    'group' => 'Courier Service',
                    'description' => 'Setting field in ' . $moduleLabel . ' module.',
                    'keywords' => $keywords,
                    'searchText' => $leafLabel,
                ]);
            }

            $entries = $entries->merge(
                $moduleEntries
                    ->sortBy(fn (array $entry) => substr_count((string) ($entry['manualPath'] ?? ''), ' > '))
                    ->take(64)
                    ->values()
            );
        }

        return $entries->take(640)->values();
    }

    private function flattenCourierSettingFieldPaths(array $value, array $prefix = [], int $depth = 0): array
    {
        if ($depth >= 6) {
            return [];
        }

        $paths = [];

        foreach ($value as $key => $child) {
            $segment = (string) $key;
            if ($segment === '' || is_numeric($segment)) {
                continue;
            }

            $nextPath = [...$prefix, $segment];

            if (is_array($child)) {
                if (!$this->isAssocArray($child)) {
                    continue;
                }

                $paths = [...$paths, ...$this->flattenCourierSettingFieldPaths($child, $nextPath, $depth + 1)];
                continue;
            }

            $paths[] = $nextPath;
        }

        return $paths;
    }

    private function isAssocArray(array $value): bool
    {
        if ($value === []) {
            return false;
        }

        return array_keys($value) !== range(0, count($value) - 1);
    }

    private function humanizeSettingToken(string $token): string
    {
        $normalized = preg_replace('/([a-z])([A-Z])/', '$1 $2', $token) ?? '';
        $normalized = preg_replace('/[_-]+/', ' ', $normalized) ?? '';
        $normalized = preg_replace('/\s+/', ' ', trim($normalized)) ?? '';

        if ($normalized === '') {
            return '';
        }

        $acronyms = [
            'api' => 'API',
            'url' => 'URL',
            'sla' => 'SLA',
            'cod' => 'COD',
            'pod' => 'POD',
            'id' => 'ID',
            '2fa' => '2FA',
            'otp' => 'OTP',
        ];

        $words = array_map(function (string $word) use ($acronyms): string {
            $lower = Str::lower($word);
            if (isset($acronyms[$lower])) {
                return $acronyms[$lower];
            }

            return Str::title($lower);
        }, preg_split('/\s+/', $normalized) ?: []);

        return trim(implode(' ', $words));
    }

    private function runFallbackSearch(string $modelClass, string $query, int $limit, ?Closure $queryCallback = null): Collection
    {
        /** @var Builder $builder */
        $builder = $modelClass::query();

        if ($queryCallback) {
            $queryCallback($builder);
        }

        $this->applyFallbackWhere($builder, $modelClass, $query);

        return $builder
            ->orderByDesc('id')
            ->limit($limit)
            ->get();
    }

    private function applyFallbackWhere(Builder $builder, string $modelClass, string $query): void
    {
        $like = '%' . str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $query) . '%';

        match ($modelClass) {
            CourierShipment::class => $this->applyLikeColumns($builder, [
                'reference',
                'status',
                'service_level',
                'delivery_notes',
                'internal_notes',
            ], $like),

            CourierVendorCodCapability::class => $this->applyLikeColumns($builder, [
                'category',
                'status',
                'requested_note',
                'decision_reason',
            ], $like),

            User::class => $this->applyLikeColumns($builder, [
                'name',
                'email',
                'phone',
                'role',
                'status',
            ], $like),

            Booking::class, AirVehicleBookings::class, SeaVehicleBookings::class => $this->applyLikeColumns($builder, [
                'status',
                'currency',
                'notes',
            ], $like),

            TrainBooking::class => $this->applyLikeColumns($builder, [
                'booking_reference',
                'passenger_name',
                'passenger_email',
                'passenger_phone',
                'status',
            ], $like),

            BusBooking::class => $this->applyLikeColumns($builder, [
                'booking_reference',
                'passenger_name',
                'passenger_email',
                'passenger_phone',
                'status',
            ], $like),

            FlightBooking::class => $this->applyLikeColumns($builder, [
                'booking_reference',
                'name',
                'email',
                'phone',
                'departure_airport',
                'arriving_airport',
                'status',
            ], $like),

            WarehouseBooking::class => $this->applyLikeColumns($builder, [
                'booking_reference',
                'company_name',
                'contact_person',
                'email',
                'phone',
                'status',
                'goods_type',
                'storage_type',
            ], $like),

            default => null,
        };
    }

    private function applyLikeColumns(Builder $builder, array $columns, string $like): void
    {
        $builder->where(function (Builder $query) use ($columns, $like): void {
            foreach ($columns as $index => $column) {
                if ($index === 0) {
                    $query->where($column, 'like', $like);
                    continue;
                }

                $query->orWhere($column, 'like', $like);
            }
        });
    }

    private function mapCourierShipmentEntry(CourierShipment $shipment, string $context): array
    {
        $reference = trim((string) ($shipment->reference ?? ''));
        $status = Str::of((string) ($shipment->status ?? 'unknown'))->replace('_', ' ')->title()->value();
        $serviceLevel = Str::of((string) ($shipment->service_level ?? 'standard'))->replace('_', ' ')->title()->value();

        $path = '/courierService/bookings';
        $manualPath = 'Courier Service > Bookings';
        $group = 'Courier Service';

        if ($context === 'client') {
            $path = '/courier-shipment/' . (int) $shipment->id;
            $manualPath = 'Client Dashboard > Courier Booking';
            $group = 'Client';
        }

        if ($context === 'superadmin') {
            $path = $this->withSearchQuery('/superadmin/courier-operations', $reference !== '' ? $reference : (string) $shipment->id);
            $manualPath = 'Super Admin > Services > Courier Management > Operations Control';
            $group = 'Courier Management';
        }

        if ($context === 'vendor') {
            $path = $this->withSearchQuery('/courierService/bookings', $reference !== '' ? $reference : (string) $shipment->id);
        }

        return [
            'id' => 'record-courier-shipment-' . (int) $shipment->id,
            'title' => $reference !== '' ? 'Shipment ' . $reference : 'Shipment #' . (int) $shipment->id,
            'path' => $path,
            'manualPath' => $manualPath,
            'group' => $group,
            'description' => 'Status: ' . $status . '. Service level: ' . $serviceLevel . '.',
            'keywords' => array_values(array_filter([
                $reference,
                (string) ($shipment->status ?? ''),
                (string) ($shipment->service_level ?? ''),
                'courier shipment',
                'delivery',
            ])),
        ];
    }

    private function mapCodCapabilityEntry(CourierVendorCodCapability $capability, string $context): array
    {
        $statusLabel = $capability->statusLabel();
        $categoryLabel = $capability->categoryLabel();
        $vendorName = trim((string) data_get($capability, 'vendor.name', ''));

        $path = '/courierService/settingsPage/services';
        $manualPath = 'Courier Service > Settings > Services';
        $group = 'Courier Service';

        if ($context === 'superadmin') {
            $path = '/superadmin/settings/cod-settlement#vendor-cod-capability-requests';
            $manualPath = 'Super Admin > Finance > COD Settlement > COD Capability Requests';
            $group = 'Finance';
        }

        return [
            'id' => 'record-cod-capability-' . (int) $capability->id,
            'title' => 'COD Capability ' . ($vendorName !== '' ? $vendorName . ' ' : '') . '(' . $categoryLabel . ')',
            'path' => $path,
            'manualPath' => $manualPath,
            'group' => $group,
            'description' => 'Status: ' . $statusLabel . '.',
            'keywords' => array_values(array_filter([
                (string) ($capability->status ?? ''),
                (string) ($capability->category ?? ''),
                $vendorName,
                'cod',
                'capability',
                'settlement',
            ])),
        ];
    }

    private function mapUserEntry(User $user): array
    {
        $role = strtolower((string) ($user->role ?? 'user'));
        $roleLabel = Str::of($role)->replace('_', ' ')->title()->value();

        $path = '/superadmin/users';
        $manualPath = 'Super Admin > Users';

        if ($role === 'client') {
            $path = '/superadmin/users/clients';
            $manualPath = 'Super Admin > Users > Clients';
        } elseif ($role === 'vendor') {
            $path = '/superadmin/users/service-providers';
            $manualPath = 'Super Admin > Users > Service Providers';
        } elseif ($role === 'driver') {
            $path = '/superadmin/users/drivers';
            $manualPath = 'Super Admin > Users > Drivers';
        }

        $name = trim((string) ($user->name ?? 'User'));
        $email = trim((string) ($user->email ?? ''));
        $phone = trim((string) ($user->phone ?? ''));

        return [
            'id' => 'record-user-' . (int) $user->id,
            'title' => $name . ' (' . $roleLabel . ')',
            'path' => $this->withSearchQuery($path, $email !== '' ? $email : $name),
            'manualPath' => $manualPath,
            'group' => 'Users',
            'description' => $email !== '' ? 'Email: ' . $email . ($phone !== '' ? ' | Phone: ' . $phone : '') : ($phone !== '' ? 'Phone: ' . $phone : 'User account record'),
            'keywords' => array_values(array_filter([
                $name,
                $email,
                $phone,
                (string) ($user->role ?? ''),
                (string) ($user->status ?? ''),
                'user',
            ])),
        ];
    }

    private function mapVehicleBookingEntry(Booking|AirVehicleBookings|SeaVehicleBookings $booking, string $context, string $variant): array
    {
        $prefix = match ($variant) {
            'air' => 'ABK',
            'sea' => 'SBK',
            default => 'BKG',
        };

        $variantLabel = match ($variant) {
            'air' => 'Air Vehicle',
            'sea' => 'Sea Vehicle',
            default => 'Vehicle',
        };

        $reference = $prefix . '-' . str_pad((string) $booking->id, 5, '0', STR_PAD_LEFT);
        $status = Str::of((string) ($booking->status ?? 'unknown'))->replace('_', ' ')->title()->value();

        $path = '/clientVehicleDashboard';
        $manualPath = 'Client Dashboard > Vehicle Rental';
        $group = 'Client';

        if ($context === 'vendor') {
            $path = '/vendorAllBookings/bookings';
            $manualPath = 'Vendor Dashboard > All Bookings';
            $group = 'Vendor';
        }

        if ($context === 'superadmin') {
            $path = match ($variant) {
                'air' => '/superadmin/reports/vehicles/air',
                'sea' => '/superadmin/reports/vehicles/sea',
                default => '/superadmin/reports/vehicles/land',
            };

            $manualPath = 'Super Admin > Reports > Service Reports > Vehicle Rental';
            $group = 'Reports';
        }

        return [
            'id' => 'record-' . $variant . '-vehicle-booking-' . (int) $booking->id,
            'title' => $variantLabel . ' Booking ' . $reference,
            'path' => $this->withSearchQuery($path, $reference),
            'manualPath' => $manualPath,
            'group' => $group,
            'description' => 'Status: ' . $status . '.',
            'keywords' => array_values(array_filter([
                $reference,
                (string) ($booking->status ?? ''),
                (string) ($booking->currency ?? ''),
                'vehicle booking',
                $variant,
            ])),
        ];
    }

    private function mapTrainBookingEntry(TrainBooking $booking, string $context): array
    {
        $reference = trim((string) ($booking->booking_reference ?? 'TRN-' . $booking->id));
        $status = Str::of((string) ($booking->status ?? 'unknown'))->replace('_', ' ')->title()->value();

        $path = $context === 'client' ? '/clientTicketBookingDashboard' : '/superadmin/reports/tickets';
        $manualPath = $context === 'client'
            ? 'Client Dashboard > Ticket Booking'
            : 'Super Admin > Reports > Service Reports > Ticket Booking';
        $group = $context === 'client' ? 'Client' : 'Reports';

        return [
            'id' => 'record-train-booking-' . (int) $booking->id,
            'title' => 'Train Booking ' . $reference,
            'path' => $this->withSearchQuery($path, $reference),
            'manualPath' => $manualPath,
            'group' => $group,
            'description' => 'Status: ' . $status . '.',
            'keywords' => array_values(array_filter([
                $reference,
                (string) ($booking->passenger_name ?? ''),
                (string) ($booking->status ?? ''),
                'train booking',
                'ticket',
            ])),
        ];
    }

    private function mapBusBookingEntry(BusBooking $booking, string $context): array
    {
        $reference = trim((string) ($booking->booking_reference ?? 'BUS-' . $booking->id));
        $status = Str::of((string) ($booking->status ?? 'unknown'))->replace('_', ' ')->title()->value();

        $path = $context === 'client' ? '/clientTicketBookingDashboard' : '/superadmin/reports/tickets';
        $manualPath = $context === 'client'
            ? 'Client Dashboard > Ticket Booking'
            : 'Super Admin > Reports > Service Reports > Ticket Booking';
        $group = $context === 'client' ? 'Client' : 'Reports';

        return [
            'id' => 'record-bus-booking-' . (int) $booking->id,
            'title' => 'Bus Booking ' . $reference,
            'path' => $this->withSearchQuery($path, $reference),
            'manualPath' => $manualPath,
            'group' => $group,
            'description' => 'Status: ' . $status . '.',
            'keywords' => array_values(array_filter([
                $reference,
                (string) ($booking->passenger_name ?? ''),
                (string) ($booking->status ?? ''),
                'bus booking',
                'ticket',
            ])),
        ];
    }

    private function mapFlightBookingEntry(FlightBooking $booking, string $context): array
    {
        $reference = trim((string) ($booking->booking_reference ?? 'FLT-' . $booking->id));
        $status = Str::of((string) ($booking->status ?? 'unknown'))->replace('_', ' ')->title()->value();

        $path = $context === 'client' ? '/clientTicketBookingDashboard' : '/superadmin/reports/tickets';
        $manualPath = $context === 'client'
            ? 'Client Dashboard > Ticket Booking'
            : 'Super Admin > Reports > Service Reports > Ticket Booking';
        $group = $context === 'client' ? 'Client' : 'Reports';

        $routeText = trim((string) ($booking->departure_airport ?? '') . ' → ' . (string) ($booking->arriving_airport ?? ''));

        return [
            'id' => 'record-flight-booking-' . (int) $booking->id,
            'title' => 'Flight Booking ' . $reference,
            'path' => $this->withSearchQuery($path, $reference),
            'manualPath' => $manualPath,
            'group' => $group,
            'description' => $routeText !== '→' && $routeText !== '' ? ('Route: ' . $routeText . '. Status: ' . $status . '.') : ('Status: ' . $status . '.'),
            'keywords' => array_values(array_filter([
                $reference,
                (string) ($booking->name ?? ''),
                (string) ($booking->departure_airport ?? ''),
                (string) ($booking->arriving_airport ?? ''),
                (string) ($booking->status ?? ''),
                'flight booking',
                'ticket',
            ])),
        ];
    }

    private function mapWarehouseBookingEntry(WarehouseBooking $booking, string $context): array
    {
        $reference = trim((string) ($booking->booking_reference ?? 'WH-' . $booking->id));
        $status = Str::of((string) ($booking->status ?? 'unknown'))->replace('_', ' ')->title()->value();

        $path = '/warehouseBookingDashboard';
        $manualPath = 'Client Dashboard > Warehouse Booking';
        $group = 'Client';

        if ($context === 'vendor') {
            $path = '/vendors/warehouse/bookings';
            $manualPath = 'Vendor Dashboard > Warehousing > Bookings';
            $group = 'Warehousing';
        }

        if ($context === 'superadmin') {
            $path = '/superadmin/reports/warehouse';
            $manualPath = 'Super Admin > Reports > Service Reports > Warehousing';
            $group = 'Reports';
        }

        return [
            'id' => 'record-warehouse-booking-' . (int) $booking->id,
            'title' => 'Warehouse Booking ' . $reference,
            'path' => $this->withSearchQuery($path, $reference),
            'manualPath' => $manualPath,
            'group' => $group,
            'description' => 'Status: ' . $status . '.',
            'keywords' => array_values(array_filter([
                $reference,
                (string) ($booking->company_name ?? ''),
                (string) ($booking->contact_person ?? ''),
                (string) ($booking->status ?? ''),
                'warehouse booking',
                'storage',
            ])),
        ];
    }

    private function withSearchQuery(string $path, string $query): string
    {
        if ($query === '') {
            return $path;
        }

        if (str_contains($path, '#')) {
            [$base, $fragment] = explode('#', $path, 2);
            $separator = str_contains($base, '?') ? '&' : '?';

            return $base . $separator . 'search=' . urlencode($query) . '#' . $fragment;
        }

        $separator = str_contains($path, '?') ? '&' : '?';

        return $path . $separator . 'search=' . urlencode($query);
    }
}
