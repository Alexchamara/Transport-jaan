<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Courier\SuperAdminCourierPricingGovernanceAudit;
use App\Models\Courier\VendorCourierSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CourierPricingGovernanceController extends Controller
{
    private const CATEGORIES = ['domestic', 'international'];

    public function index(Request $request)
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string', 'in:all,pending,no_pending'],
            'category' => ['nullable', 'string', 'in:all,domestic,international'],
            'authority' => ['nullable', 'string', 'in:all,vendor,superadmin'],
            'search' => ['nullable', 'string', 'max:120'],
            'perPage' => ['nullable', 'integer', 'min:10', 'max:100'],
        ]);

        $filters = [
            'status' => (string) ($validated['status'] ?? 'all'),
            'category' => (string) ($validated['category'] ?? 'all'),
            'authority' => (string) ($validated['authority'] ?? 'all'),
            'search' => trim((string) ($validated['search'] ?? '')),
            'perPage' => (int) ($validated['perPage'] ?? 20),
        ];

        $records = VendorCourierSetting::query()
            ->select(['id', 'vendor_user_id', 'settings', 'updated_at'])
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->get();

        $rows = collect();
        $userIds = [];

        foreach ($records as $record) {
            $vendorUserId = (int) $record->vendor_user_id;
            if ($vendorUserId <= 0) {
                continue;
            }

            $settings = is_array($record->settings) ? $record->settings : [];
            $pricing = $this->normalizePricingContainer(
                is_array($settings['pricing'] ?? null) ? $settings['pricing'] : []
            );

            foreach (self::CATEGORIES as $category) {
                if ($filters['category'] !== 'all' && $filters['category'] !== $category) {
                    continue;
                }

                $governance = $pricing['governance'][$category] ?? $this->defaultPricingGovernance()[$category];
                $pending = is_array($governance['pendingApproval'] ?? null)
                    ? $governance['pendingApproval']
                    : null;

                if ($filters['status'] === 'pending' && !$pending) {
                    continue;
                }

                if ($filters['status'] === 'no_pending' && $pending) {
                    continue;
                }

                $authority = (string) ($governance['approvalAuthority'] ?? 'vendor');
                if ($filters['authority'] !== 'all' && $filters['authority'] !== $authority) {
                    continue;
                }

                $requestedByUserId = isset($pending['requestedBy']) && (int) $pending['requestedBy'] > 0
                    ? (int) $pending['requestedBy']
                    : null;
                $publishedByUserId = isset($governance['publishedBy']) && (int) $governance['publishedBy'] > 0
                    ? (int) $governance['publishedBy']
                    : null;

                $userIds[] = $vendorUserId;
                if ($requestedByUserId) {
                    $userIds[] = $requestedByUserId;
                }
                if ($publishedByUserId) {
                    $userIds[] = $publishedByUserId;
                }

                $rows->push([
                    'id' => $vendorUserId . ':' . $category,
                    'vendorUserId' => $vendorUserId,
                    'category' => $category,
                    'authority' => $authority,
                    'requireApproval' => (bool) ($governance['requireApproval'] ?? false),
                    'approverRoles' => is_array($governance['approverRoles'] ?? null) ? $governance['approverRoles'] : [],
                    'draftVersion' => (int) ($governance['draftVersion'] ?? 1),
                    'publishedVersion' => (int) ($governance['publishedVersion'] ?? 1),
                    'publishedAt' => $governance['publishedAt'] ?? null,
                    'publishedByUserId' => $publishedByUserId,
                    'pendingApproval' => $pending ? [
                        'requestedAt' => $pending['requestedAt'] ?? null,
                        'requestedByUserId' => $requestedByUserId,
                        'note' => trim((string) ($pending['note'] ?? '')),
                        'hasSnapshot' => is_array($pending['snapshot'] ?? null),
                    ] : null,
                    'versionHistory' => collect($governance['versionHistory'] ?? [])
                        ->filter(fn ($entry) => is_array($entry))
                        ->map(function (array $entry): array {
                            return [
                                'version' => max(1, (int) ($entry['version'] ?? 1)),
                                'publishedAt' => $entry['publishedAt'] ?? null,
                                'event' => trim((string) ($entry['event'] ?? 'published_now')),
                            ];
                        })
                        ->take(10)
                        ->values()
                        ->all(),
                    'updatedAt' => optional($record->updated_at)->format('Y-m-d H:i:s'),
                ]);
            }
        }

        $usersById = User::query()
            ->whereIn('id', array_values(array_unique(array_map('intval', $userIds))))
            ->get(['id', 'name', 'email'])
            ->keyBy('id');

        $rows = $rows
            ->map(function (array $row) use ($usersById): array {
                $vendor = $usersById->get((int) $row['vendorUserId']);
                $requestedBy = $usersById->get((int) ($row['pendingApproval']['requestedByUserId'] ?? 0));
                $publishedBy = $usersById->get((int) ($row['publishedByUserId'] ?? 0));

                $row['vendorName'] = (string) ($vendor->name ?? 'Unknown Vendor');
                $row['vendorEmail'] = (string) ($vendor->email ?? '');
                $row['pendingApproval'] = $row['pendingApproval']
                    ? array_merge($row['pendingApproval'], [
                        'requestedByName' => (string) ($requestedBy->name ?? ''),
                        'requestedByEmail' => (string) ($requestedBy->email ?? ''),
                    ])
                    : null;
                $row['publishedByName'] = (string) ($publishedBy->name ?? '');
                $row['publishedByEmail'] = (string) ($publishedBy->email ?? '');

                return $row;
            })
            ->filter(function (array $row) use ($filters): bool {
                if ($filters['search'] === '') {
                    return true;
                }

                $needle = strtolower($filters['search']);
                $haystack = strtolower(implode(' ', [
                    $row['vendorName'] ?? '',
                    $row['vendorEmail'] ?? '',
                    $row['pendingApproval']['requestedByName'] ?? '',
                    $row['pendingApproval']['requestedByEmail'] ?? '',
                    $row['category'] ?? '',
                ]));

                return str_contains($haystack, $needle);
            })
            ->sort(function (array $left, array $right): int {
                $leftPending = $left['pendingApproval'] ? 1 : 0;
                $rightPending = $right['pendingApproval'] ? 1 : 0;

                if ($leftPending !== $rightPending) {
                    return $rightPending <=> $leftPending;
                }

                $leftRequestedAt = $this->toSortableTimestamp($left['pendingApproval']['requestedAt'] ?? null);
                $rightRequestedAt = $this->toSortableTimestamp($right['pendingApproval']['requestedAt'] ?? null);
                if ($leftRequestedAt !== $rightRequestedAt) {
                    return $rightRequestedAt <=> $leftRequestedAt;
                }

                $leftUpdatedAt = $this->toSortableTimestamp($left['updatedAt'] ?? null);
                $rightUpdatedAt = $this->toSortableTimestamp($right['updatedAt'] ?? null);
                if ($leftUpdatedAt !== $rightUpdatedAt) {
                    return $rightUpdatedAt <=> $leftUpdatedAt;
                }

                return strcmp((string) ($left['id'] ?? ''), (string) ($right['id'] ?? ''));
            })
            ->values();

        $stats = [
            'totalCategories' => $rows->count(),
            'pendingRequests' => $rows->filter(fn (array $row) => is_array($row['pendingApproval'] ?? null))->count(),
            'superadminAuthority' => $rows->where('authority', 'superadmin')->count(),
            'vendorAuthority' => $rows->where('authority', 'vendor')->count(),
            'vendorsWithPending' => $rows
                ->filter(fn (array $row) => is_array($row['pendingApproval'] ?? null))
                ->pluck('vendorUserId')
                ->unique()
                ->count(),
        ];

        $page = LengthAwarePaginator::resolveCurrentPage();
        $perPage = max(10, min(100, $filters['perPage']));
        $paginatedRows = $rows->forPage($page, $perPage)->values();

        $queue = new LengthAwarePaginator(
            $paginatedRows,
            $rows->count(),
            $perPage,
            $page,
            [
                'path' => $request->url(),
                'query' => $request->query(),
            ]
        );

        return Inertia::render('Web/home/SuperAdmin/CourierPricingGovernance', [
            'queue' => $queue,
            'stats' => $stats,
            'filters' => $filters,
            'categoryOptions' => ['all', ...self::CATEGORIES],
            'authorityOptions' => ['all', 'vendor', 'superadmin'],
        ]);
    }

    public function updatePolicy(Request $request, int $vendorUserId, string $category)
    {
        $category = $this->normalizeCategory($category);

        $validated = $request->validate([
            'approvalAuthority' => ['required', 'string', 'in:vendor,superadmin'],
            'requireApproval' => ['nullable', 'boolean'],
            'approverRoles' => ['nullable', 'array'],
            'approverRoles.*' => ['nullable', 'string', 'max:80'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $actorId = (int) optional($request->user())->id ?: null;
        $reason = trim((string) ($validated['note'] ?? ''));
        $approvalAuthority = (string) $validated['approvalAuthority'];

        DB::transaction(function () use ($vendorUserId, $category, $validated, $actorId, $reason, $approvalAuthority): void {
            $setting = VendorCourierSetting::query()->firstOrCreate(
                ['vendor_user_id' => $vendorUserId],
                ['settings' => $this->defaultCourierSettings()]
            );

            $settings = is_array($setting->settings) ? $setting->settings : [];
            $pricing = $this->normalizePricingContainer(
                is_array($settings['pricing'] ?? null) ? $settings['pricing'] : []
            );

            $governance = $pricing['governance'][$category] ?? $this->defaultPricingGovernance()[$category];
            $fromState = $this->serializeGovernanceState($governance);

            $governance['approvalAuthority'] = $approvalAuthority;
            $governance['requireApproval'] = array_key_exists('requireApproval', $validated)
                ? (bool) $validated['requireApproval']
                : (bool) ($governance['requireApproval'] ?? false);

            if ($approvalAuthority === 'superadmin') {
                $governance['requireApproval'] = true;
            }

            if (array_key_exists('approverRoles', $validated) && is_array($validated['approverRoles'])) {
                $governance['approverRoles'] = collect($validated['approverRoles'])
                    ->map(fn ($role) => trim((string) $role))
                    ->filter()
                    ->unique()
                    ->values()
                    ->all();
            }

            $pricing['governance'][$category] = $this->normalizeGovernanceRow($governance, $category);
            $pricing = $this->appendPricingGovernanceLog(
                $pricing,
                'superadmin_policy_updated',
                $actorId,
                [
                    'approvalAuthority' => $pricing['governance'][$category]['approvalAuthority'] ?? 'vendor',
                    'requireApproval' => (bool) ($pricing['governance'][$category]['requireApproval'] ?? false),
                ],
                $category
            );

            $settings['pricing'] = $pricing;
            $setting->update(['settings' => $settings]);

            $toState = $this->serializeGovernanceState($pricing['governance'][$category] ?? []);

            SuperAdminCourierPricingGovernanceAudit::recordEvent(
                $vendorUserId,
                $category,
                SuperAdminCourierPricingGovernanceAudit::ACTION_POLICY_UPDATED,
                $actorId,
                $reason !== '' ? $reason : 'SuperAdmin updated pricing governance policy.',
                $fromState,
                $toState,
                [
                    'source' => 'superadmin_pricing_governance',
                ]
            );
        });

        return back()->with('success', ucfirst($category) . ' pricing governance policy updated.');
    }

    public function approve(Request $request, int $vendorUserId, string $category)
    {
        $category = $this->normalizeCategory($category);

        $validated = $request->validate([
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $setting = VendorCourierSetting::query()
            ->where('vendor_user_id', $vendorUserId)
            ->first();

        if (!$setting) {
            return back()->with('error', 'Courier pricing settings were not found for the selected vendor.');
        }

        $actorId = (int) optional($request->user())->id ?: null;
        $note = trim((string) ($validated['note'] ?? ''));

        $error = null;

        DB::transaction(function () use ($setting, $vendorUserId, $category, $actorId, $note, &$error): void {
            $settings = is_array($setting->settings) ? $setting->settings : [];
            $pricing = $this->normalizePricingContainer(
                is_array($settings['pricing'] ?? null) ? $settings['pricing'] : []
            );

            $governance = $pricing['governance'][$category] ?? $this->defaultPricingGovernance()[$category];
            if (($governance['approvalAuthority'] ?? 'vendor') !== 'superadmin') {
                $error = 'Approval authority is not delegated to SuperAdmin for this pricing category.';
                return;
            }

            $pendingApproval = is_array($governance['pendingApproval'] ?? null)
                ? $governance['pendingApproval']
                : null;
            if (!$pendingApproval || !is_array($pendingApproval['snapshot'] ?? null)) {
                $error = 'No pending pricing publish request was found.';
                return;
            }

            $requestedBy = (int) ($pendingApproval['requestedBy'] ?? 0);
            if ($actorId > 0 && $requestedBy > 0 && $actorId === $requestedBy) {
                $error = 'Four-eyes control violation: requester cannot approve their own pricing request.';
                return;
            }

            $fromState = $this->serializeGovernanceState($governance);

            $pricing = $this->publishPricingSnapshot(
                $pricing,
                $pendingApproval['snapshot'],
                $actorId,
                'superadmin_publish_approved',
                $category,
                [
                    'note' => $note,
                    'requestedBy' => $requestedBy > 0 ? $requestedBy : null,
                ]
            );

            $settings['pricing'] = $pricing;
            $setting->update(['settings' => $settings]);

            $toState = $this->serializeGovernanceState($pricing['governance'][$category] ?? []);

            SuperAdminCourierPricingGovernanceAudit::recordEvent(
                $vendorUserId,
                $category,
                SuperAdminCourierPricingGovernanceAudit::ACTION_APPROVED,
                $actorId,
                $note !== '' ? $note : 'SuperAdmin approved pending pricing publish request.',
                $fromState,
                $toState,
                [
                    'source' => 'superadmin_pricing_governance',
                    'requestedBy' => $requestedBy > 0 ? $requestedBy : null,
                    'requestedAt' => $pendingApproval['requestedAt'] ?? null,
                ]
            );
        });

        if ($error !== null) {
            return back()->with('error', $error);
        }

        return back()->with('success', ucfirst($category) . ' pricing publish request approved and published.');
    }

    public function reject(Request $request, int $vendorUserId, string $category)
    {
        $category = $this->normalizeCategory($category);

        $validated = $request->validate([
            'note' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        $setting = VendorCourierSetting::query()
            ->where('vendor_user_id', $vendorUserId)
            ->first();

        if (!$setting) {
            return back()->with('error', 'Courier pricing settings were not found for the selected vendor.');
        }

        $actorId = (int) optional($request->user())->id ?: null;
        $note = trim((string) ($validated['note'] ?? ''));
        $error = null;

        DB::transaction(function () use ($setting, $vendorUserId, $category, $actorId, $note, &$error): void {
            $settings = is_array($setting->settings) ? $setting->settings : [];
            $pricing = $this->normalizePricingContainer(
                is_array($settings['pricing'] ?? null) ? $settings['pricing'] : []
            );

            $governance = $pricing['governance'][$category] ?? $this->defaultPricingGovernance()[$category];
            if (($governance['approvalAuthority'] ?? 'vendor') !== 'superadmin') {
                $error = 'Approval authority is not delegated to SuperAdmin for this pricing category.';
                return;
            }

            $pendingApproval = is_array($governance['pendingApproval'] ?? null)
                ? $governance['pendingApproval']
                : null;
            if (!$pendingApproval) {
                $error = 'No pending pricing publish request was found.';
                return;
            }

            $fromState = $this->serializeGovernanceState($governance);
            $governance['pendingApproval'] = null;
            $pricing['governance'][$category] = $this->normalizeGovernanceRow($governance, $category);
            $pricing = $this->appendPricingGovernanceLog(
                $pricing,
                'superadmin_publish_rejected',
                $actorId,
                ['note' => $note],
                $category
            );

            $settings['pricing'] = $pricing;
            $setting->update(['settings' => $settings]);

            $toState = $this->serializeGovernanceState($pricing['governance'][$category] ?? []);

            SuperAdminCourierPricingGovernanceAudit::recordEvent(
                $vendorUserId,
                $category,
                SuperAdminCourierPricingGovernanceAudit::ACTION_REJECTED,
                $actorId,
                $note,
                $fromState,
                $toState,
                [
                    'source' => 'superadmin_pricing_governance',
                    'requestedBy' => isset($pendingApproval['requestedBy']) ? (int) $pendingApproval['requestedBy'] : null,
                    'requestedAt' => $pendingApproval['requestedAt'] ?? null,
                ]
            );
        });

        if ($error !== null) {
            return back()->with('error', $error);
        }

        return back()->with('success', ucfirst($category) . ' pricing publish request rejected.');
    }

    public function forcePublish(Request $request, int $vendorUserId, string $category)
    {
        $category = $this->normalizeCategory($category);

        $validated = $request->validate([
            'note' => ['required', 'string', 'min:10', 'max:500'],
        ]);

        $setting = VendorCourierSetting::query()
            ->where('vendor_user_id', $vendorUserId)
            ->first();

        if (!$setting) {
            return back()->with('error', 'Courier pricing settings were not found for the selected vendor.');
        }

        $actorId = (int) optional($request->user())->id ?: null;
        $note = trim((string) ($validated['note'] ?? ''));

        DB::transaction(function () use ($setting, $vendorUserId, $category, $actorId, $note): void {
            $settings = is_array($setting->settings) ? $setting->settings : [];
            $pricing = $this->normalizePricingContainer(
                is_array($settings['pricing'] ?? null) ? $settings['pricing'] : []
            );

            $governance = $pricing['governance'][$category] ?? $this->defaultPricingGovernance()[$category];
            $fromState = $this->serializeGovernanceState($governance);

            $pendingApproval = is_array($governance['pendingApproval'] ?? null)
                ? $governance['pendingApproval']
                : null;

            $snapshot = is_array($pendingApproval['snapshot'] ?? null)
                ? $pendingApproval['snapshot']
                : $this->extractPricingSnapshot($pricing, $category);

            $pricing = $this->publishPricingSnapshot(
                $pricing,
                $snapshot,
                $actorId,
                'superadmin_force_publish',
                $category,
                [
                    'note' => $note,
                    'forcePublished' => true,
                ]
            );

            $settings['pricing'] = $pricing;
            $setting->update(['settings' => $settings]);

            $toState = $this->serializeGovernanceState($pricing['governance'][$category] ?? []);

            SuperAdminCourierPricingGovernanceAudit::recordEvent(
                $vendorUserId,
                $category,
                SuperAdminCourierPricingGovernanceAudit::ACTION_FORCE_PUBLISHED,
                $actorId,
                $note,
                $fromState,
                $toState,
                [
                    'source' => 'superadmin_pricing_governance',
                    'pendingRequestPresent' => $pendingApproval !== null,
                ]
            );
        });

        return back()->with('success', ucfirst($category) . ' pricing force-published successfully.');
    }

    public function rollback(Request $request, int $vendorUserId, string $category)
    {
        $category = $this->normalizeCategory($category);

        $validated = $request->validate([
            'rollbackVersion' => ['nullable', 'integer', 'min:1'],
            'note' => ['required', 'string', 'min:10', 'max:500'],
        ]);

        $setting = VendorCourierSetting::query()
            ->where('vendor_user_id', $vendorUserId)
            ->first();

        if (!$setting) {
            return back()->with('error', 'Courier pricing settings were not found for the selected vendor.');
        }

        $actorId = (int) optional($request->user())->id ?: null;
        $note = trim((string) ($validated['note'] ?? ''));
        $targetVersion = array_key_exists('rollbackVersion', $validated) && $validated['rollbackVersion'] !== null
            ? (int) $validated['rollbackVersion']
            : null;

        $error = null;

        DB::transaction(function () use ($setting, $vendorUserId, $category, $actorId, $note, $targetVersion, &$error): void {
            $settings = is_array($setting->settings) ? $setting->settings : [];
            $pricing = $this->normalizePricingContainer(
                is_array($settings['pricing'] ?? null) ? $settings['pricing'] : []
            );

            $governance = $pricing['governance'][$category] ?? $this->defaultPricingGovernance()[$category];

            if (is_array($governance['pendingApproval'] ?? null)) {
                $error = 'Cannot rollback while a pending pricing approval request exists. Resolve it first.';
                return;
            }

            $target = $this->resolvePricingRollbackTarget($governance, $targetVersion);
            if (!$target || !is_array($target['snapshot'] ?? null)) {
                $error = 'No eligible published pricing version was found to rollback.';
                return;
            }

            $fromState = $this->serializeGovernanceState($governance);
            $resolvedTargetVersion = (int) ($target['version'] ?? 0);

            $pricing = $this->publishPricingSnapshot(
                $pricing,
                $target['snapshot'],
                $actorId,
                'superadmin_publish_rolled_back',
                $category,
                [
                    'rolledBackFromVersion' => $resolvedTargetVersion,
                    'note' => $note,
                ]
            );

            $settings['pricing'] = $pricing;
            $setting->update(['settings' => $settings]);

            $toState = $this->serializeGovernanceState($pricing['governance'][$category] ?? []);

            SuperAdminCourierPricingGovernanceAudit::recordEvent(
                $vendorUserId,
                $category,
                SuperAdminCourierPricingGovernanceAudit::ACTION_ROLLBACK,
                $actorId,
                $note,
                $fromState,
                $toState,
                [
                    'source' => 'superadmin_pricing_governance',
                    'rolledBackFromVersion' => $resolvedTargetVersion,
                ]
            );
        });

        if ($error !== null) {
            return back()->with('error', $error);
        }

        return back()->with('success', ucfirst($category) . ' pricing rolled back successfully.');
    }

    public function auditHistory(Request $request, int $vendorUserId, string $category)
    {
        $category = $this->normalizeCategory($category);

        $validated = $request->validate([
            'perPage' => ['nullable', 'integer', 'min:10', 'max:100'],
        ]);

        $perPage = (int) ($validated['perPage'] ?? 25);

        $paginator = SuperAdminCourierPricingGovernanceAudit::query()
            ->with('actor:id,name,email')
            ->where('vendor_user_id', $vendorUserId)
            ->where('pricing_category', $category)
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        $events = collect($paginator->items())
            ->map(function (SuperAdminCourierPricingGovernanceAudit $audit): array {
                return [
                    'id' => (int) $audit->id,
                    'actionType' => (string) $audit->action_type,
                    'reason' => (string) $audit->reason,
                    'fromState' => $audit->from_state ?? [],
                    'toState' => $audit->to_state ?? [],
                    'metadata' => $audit->metadata ?? [],
                    'previousHash' => (string) ($audit->previous_hash ?? ''),
                    'recordHash' => (string) ($audit->record_hash ?? ''),
                    'createdAt' => optional($audit->created_at)->format('Y-m-d H:i:s'),
                    'actor' => [
                        'id' => (int) ($audit->actor->id ?? 0),
                        'name' => (string) ($audit->actor->name ?? ''),
                        'email' => (string) ($audit->actor->email ?? ''),
                    ],
                ];
            })
            ->values();

        return response()->json([
            'vendorUserId' => $vendorUserId,
            'category' => $category,
            'events' => $events,
            'pagination' => [
                'currentPage' => $paginator->currentPage(),
                'lastPage' => $paginator->lastPage(),
                'perPage' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    private function normalizeCategory(string $category): string
    {
        $normalized = strtolower(trim($category));
        if (!in_array($normalized, self::CATEGORIES, true)) {
            abort(404, 'Invalid pricing category.');
        }

        return $normalized;
    }

    private function toSortableTimestamp(?string $value): int
    {
        if (!$value) {
            return 0;
        }

        $timestamp = strtotime($value);

        return $timestamp !== false ? $timestamp : 0;
    }

    /**
     * @return array<string, mixed>
     */
    private function defaultCourierSettings(): array
    {
        return [
            'pricing' => [
                'governance' => $this->defaultPricingGovernance(),
            ],
        ];
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    private function defaultPricingGovernance(): array
    {
        return [
            'domestic' => [
                'requireApproval' => false,
                'approvalAuthority' => 'vendor',
                'approverRoles' => ['courier_owner', 'courier_admin'],
                'draftVersion' => 1,
                'publishedVersion' => 1,
                'publishedAt' => null,
                'publishedBy' => null,
                'pendingApproval' => null,
                'scheduledPublish' => null,
                'versionHistory' => [],
                'changeLog' => [],
            ],
            'international' => [
                'requireApproval' => false,
                'approvalAuthority' => 'vendor',
                'approverRoles' => ['courier_owner', 'courier_admin'],
                'draftVersion' => 1,
                'publishedVersion' => 1,
                'publishedAt' => null,
                'publishedBy' => null,
                'pendingApproval' => null,
                'scheduledPublish' => null,
                'versionHistory' => [],
                'changeLog' => [],
            ],
        ];
    }

    /**
     * @param array<string, mixed> $pricing
     * @return array<string, mixed>
     */
    private function normalizePricingContainer(array $pricing): array
    {
        foreach (['localization', 'formula', 'serviceCatalog', 'zoneMaster', 'cityZoneMap', 'policyModules', 'categories'] as $sectionKey) {
            if (!is_array($pricing[$sectionKey] ?? null)) {
                $pricing[$sectionKey] = [];
            }

            foreach (self::CATEGORIES as $category) {
                if (!is_array($pricing[$sectionKey][$category] ?? null)) {
                    $pricing[$sectionKey][$category] = [];
                }
            }
        }

        if (!is_array($pricing['laneMatrix'] ?? null)) {
            $pricing['laneMatrix'] = [];
        }

        $laneEnabled = $pricing['laneMatrix']['enabled'] ?? false;
        if (!is_array($laneEnabled)) {
            $laneEnabled = [
                'domestic' => (bool) $laneEnabled,
                'international' => (bool) $laneEnabled,
            ];
        }

        $pricing['laneMatrix']['enabled'] = [
            'domestic' => (bool) ($laneEnabled['domestic'] ?? false),
            'international' => (bool) ($laneEnabled['international'] ?? false),
        ];

        foreach (self::CATEGORIES as $category) {
            if (!is_array($pricing['laneMatrix'][$category] ?? null)) {
                $pricing['laneMatrix'][$category] = [];
            }
        }

        $pricing['governance'] = $this->normalizeGovernanceByCategory(
            is_array($pricing['governance'] ?? null) ? $pricing['governance'] : []
        );

        return $pricing;
    }

    /**
     * @param array<string, mixed> $input
     * @return array<string, array<string, mixed>>
     */
    private function normalizeGovernanceByCategory(array $input): array
    {
        $default = $this->defaultPricingGovernance();
        $hasCategoryShape = is_array($input['domestic'] ?? null) || is_array($input['international'] ?? null);
        if (!$hasCategoryShape) {
            $input = [
                'domestic' => $input,
                'international' => $input,
            ];
        }

        $normalized = [];
        foreach (self::CATEGORIES as $category) {
            $normalized[$category] = $this->normalizeGovernanceRow(
                array_replace(
                    $default[$category] ?? [],
                    is_array($input[$category] ?? null) ? $input[$category] : []
                ),
                $category
            );
        }

        return $normalized;
    }

    /**
     * @param array<string, mixed> $governance
     * @return array<string, mixed>
     */
    private function normalizeGovernanceRow(array $governance, string $category): array
    {
        $default = $this->defaultPricingGovernance()[$category] ?? [];
        $governance = array_replace($default, $governance);

        $approvalAuthority = strtolower(trim((string) ($governance['approvalAuthority'] ?? 'vendor')));
        if (!in_array($approvalAuthority, ['vendor', 'superadmin'], true)) {
            $approvalAuthority = 'vendor';
        }

        $governance['approvalAuthority'] = $approvalAuthority;
        $governance['requireApproval'] = (bool) ($governance['requireApproval'] ?? false);
        if ($approvalAuthority === 'superadmin') {
            $governance['requireApproval'] = true;
        }

        $governance['approverRoles'] = collect($governance['approverRoles'] ?? ($default['approverRoles'] ?? []))
            ->map(fn ($role) => trim((string) $role))
            ->filter()
            ->unique()
            ->values()
            ->all();

        $governance['draftVersion'] = max(1, (int) ($governance['draftVersion'] ?? 1));
        $governance['publishedVersion'] = max(1, (int) ($governance['publishedVersion'] ?? 1));
        $governance['publishedBy'] = isset($governance['publishedBy']) && $governance['publishedBy'] !== null
            ? (int) $governance['publishedBy']
            : null;

        $pendingApproval = is_array($governance['pendingApproval'] ?? null)
            ? $governance['pendingApproval']
            : null;
        if ($pendingApproval && !is_array($pendingApproval['snapshot'] ?? null)) {
            $pendingApproval = null;
        }

        if ($pendingApproval) {
            $pendingApproval = [
                'snapshot' => is_array($pendingApproval['snapshot'] ?? null) ? $pendingApproval['snapshot'] : [],
                'requestedAt' => $pendingApproval['requestedAt'] ?? null,
                'requestedBy' => isset($pendingApproval['requestedBy']) ? (int) $pendingApproval['requestedBy'] : null,
                'note' => trim((string) ($pendingApproval['note'] ?? '')),
            ];
        }

        $governance['pendingApproval'] = $pendingApproval;

        $governance['versionHistory'] = collect($governance['versionHistory'] ?? [])
            ->filter(fn ($entry) => is_array($entry))
            ->map(function ($entry) {
                $item = is_array($entry) ? $entry : [];

                return [
                    'version' => max(1, (int) ($item['version'] ?? 1)),
                    'publishedAt' => $item['publishedAt'] ?? null,
                    'publishedBy' => isset($item['publishedBy']) ? (int) $item['publishedBy'] : null,
                    'event' => trim((string) ($item['event'] ?? 'published_now')),
                    'snapshot' => is_array($item['snapshot'] ?? null) ? $item['snapshot'] : [],
                    'meta' => is_array($item['meta'] ?? null) ? $item['meta'] : [],
                ];
            })
            ->take(25)
            ->values()
            ->all();

        $governance['changeLog'] = collect($governance['changeLog'] ?? [])
            ->filter(fn ($entry) => is_array($entry))
            ->take(50)
            ->values()
            ->all();

        return $governance;
    }

    /**
     * @param array<string, mixed> $pricing
     * @return array<string, mixed>
     */
    private function appendPricingGovernanceLog(
        array $pricing,
        string $event,
        ?int $actorId,
        array $meta = [],
        ?string $category = null
    ): array {
        $pricing = $this->normalizePricingContainer($pricing);
        $category = in_array((string) $category, self::CATEGORIES, true) ? (string) $category : 'domestic';
        $governance = $pricing['governance'][$category] ?? $this->defaultPricingGovernance()[$category];

        $governance['changeLog'] = collect($governance['changeLog'] ?? [])
            ->prepend([
                'event' => $event,
                'at' => now()->toDateTimeString(),
                'actorUserId' => $actorId,
                'meta' => $meta,
            ])
            ->take(50)
            ->values()
            ->all();

        $pricing['governance'][$category] = $governance;

        return $pricing;
    }

    /**
     * @param array<string, mixed> $pricing
     * @param array<string, mixed> $snapshot
     * @param array<string, mixed> $eventMeta
     * @return array<string, mixed>
     */
    private function publishPricingSnapshot(
        array $pricing,
        array $snapshot,
        ?int $actorId,
        string $event = 'published_now',
        ?string $category = null,
        array $eventMeta = []
    ): array {
        $category = in_array((string) $category, self::CATEGORIES, true)
            ? (string) $category
            : (in_array((string) ($snapshot['category'] ?? ''), self::CATEGORIES, true)
                ? (string) $snapshot['category']
                : 'domestic');

        $pricing = $this->applyPricingSnapshot($pricing, $snapshot, $category);
        $governance = $pricing['governance'][$category] ?? $this->defaultPricingGovernance()[$category];

        $governance['publishedVersion'] = max(1, (int) ($governance['publishedVersion'] ?? 1)) + 1;
        $governance['publishedAt'] = now()->toDateTimeString();
        $governance['publishedBy'] = $actorId;
        $governance['scheduledPublish'] = null;
        $governance['pendingApproval'] = null;
        $governance['versionHistory'] = collect($governance['versionHistory'] ?? [])
            ->prepend([
                'version' => (int) $governance['publishedVersion'],
                'publishedAt' => $governance['publishedAt'],
                'publishedBy' => $actorId,
                'event' => $event,
                'snapshot' => $this->extractPricingSnapshot($pricing, $category),
                'meta' => $eventMeta,
            ])
            ->take(25)
            ->values()
            ->all();

        $pricing['governance'][$category] = $this->normalizeGovernanceRow($governance, $category);

        return $this->appendPricingGovernanceLog($pricing, $event, $actorId, [
            'publishedVersion' => $governance['publishedVersion'],
            ...$eventMeta,
        ], $category);
    }

    /**
     * @param array<string, mixed> $pricing
     * @return array<string, mixed>
     */
    private function applyPricingSnapshot(array $pricing, array $snapshot, ?string $category = null): array
    {
        $pricing = $this->normalizePricingContainer($pricing);

        $categoryFromSnapshot = in_array((string) ($snapshot['category'] ?? ''), self::CATEGORIES, true)
            ? (string) $snapshot['category']
            : null;
        $category = in_array((string) $category, self::CATEGORIES, true) ? (string) $category : $categoryFromSnapshot;

        if ($category === null) {
            return $pricing;
        }

        $pricing['localization'][$category] = is_array($snapshot['localization'] ?? null)
            ? $snapshot['localization']
            : ($pricing['localization'][$category] ?? []);
        $pricing['formula'][$category] = is_array($snapshot['formula'] ?? null)
            ? $snapshot['formula']
            : ($pricing['formula'][$category] ?? []);
        $pricing['serviceCatalog'][$category] = is_array($snapshot['serviceCatalog'] ?? null)
            ? $snapshot['serviceCatalog']
            : ($pricing['serviceCatalog'][$category] ?? []);
        $pricing['zoneMaster'][$category] = is_array($snapshot['zoneMaster'] ?? null)
            ? $snapshot['zoneMaster']
            : ($pricing['zoneMaster'][$category] ?? []);
        $pricing['cityZoneMap'][$category] = is_array($snapshot['cityZoneMap'] ?? null)
            ? $snapshot['cityZoneMap']
            : ($pricing['cityZoneMap'][$category] ?? []);
        $pricing['laneMatrix']['enabled'][$category] = (bool) ($snapshot['laneMatrix']['enabled'] ?? false);
        $pricing['laneMatrix'][$category] = is_array($snapshot['laneMatrix']['rows'] ?? null)
            ? $snapshot['laneMatrix']['rows']
            : ($pricing['laneMatrix'][$category] ?? []);
        $pricing['policyModules'][$category] = is_array($snapshot['policyModules'] ?? null)
            ? $snapshot['policyModules']
            : ($pricing['policyModules'][$category] ?? []);
        $pricing['categories'][$category] = is_array($snapshot['categories'] ?? null)
            ? $snapshot['categories']
            : ($pricing['categories'][$category] ?? []);

        return $this->normalizePricingContainer($pricing);
    }

    /**
     * @param array<string, mixed> $pricing
     * @return array<string, mixed>
     */
    private function extractPricingSnapshot(array $pricing, string $category): array
    {
        $pricing = $this->normalizePricingContainer($pricing);

        return [
            'category' => $category,
            'localization' => is_array($pricing['localization'][$category] ?? null)
                ? $pricing['localization'][$category]
                : [],
            'formula' => is_array($pricing['formula'][$category] ?? null)
                ? $pricing['formula'][$category]
                : [],
            'serviceCatalog' => is_array($pricing['serviceCatalog'][$category] ?? null)
                ? $pricing['serviceCatalog'][$category]
                : [],
            'zoneMaster' => is_array($pricing['zoneMaster'][$category] ?? null)
                ? $pricing['zoneMaster'][$category]
                : [],
            'cityZoneMap' => is_array($pricing['cityZoneMap'][$category] ?? null)
                ? $pricing['cityZoneMap'][$category]
                : [],
            'laneMatrix' => [
                'enabled' => (bool) ($pricing['laneMatrix']['enabled'][$category] ?? false),
                'rows' => is_array($pricing['laneMatrix'][$category] ?? null)
                    ? $pricing['laneMatrix'][$category]
                    : [],
            ],
            'policyModules' => is_array($pricing['policyModules'][$category] ?? null)
                ? $pricing['policyModules'][$category]
                : [],
            'categories' => is_array($pricing['categories'][$category] ?? null)
                ? $pricing['categories'][$category]
                : [],
        ];
    }

    /**
     * @param array<string, mixed> $governance
     * @return array<string, mixed>|null
     */
    private function resolvePricingRollbackTarget(array $governance, ?int $targetVersion = null): ?array
    {
        $history = collect($governance['versionHistory'] ?? [])
            ->filter(fn ($entry) => is_array($entry) && is_array($entry['snapshot'] ?? null))
            ->map(function ($entry): array {
                $item = is_array($entry) ? $entry : [];

                return [
                    'version' => max(1, (int) ($item['version'] ?? 1)),
                    'snapshot' => is_array($item['snapshot'] ?? null) ? $item['snapshot'] : [],
                ];
            })
            ->sortByDesc(fn ($entry) => (int) ($entry['version'] ?? 0))
            ->values();

        if ($history->isEmpty()) {
            return null;
        }

        if ($targetVersion !== null && $targetVersion > 0) {
            return $history->first(fn ($entry) => (int) ($entry['version'] ?? 0) === $targetVersion);
        }

        $currentPublishedVersion = max(1, (int) ($governance['publishedVersion'] ?? 1));
        $previous = $history->first(fn ($entry) => (int) ($entry['version'] ?? 0) < $currentPublishedVersion);
        if ($previous) {
            return $previous;
        }

        return $history->skip(1)->first();
    }

    /**
     * @param array<string, mixed> $governance
     * @return array<string, mixed>
     */
    private function serializeGovernanceState(array $governance): array
    {
        $pending = is_array($governance['pendingApproval'] ?? null)
            ? $governance['pendingApproval']
            : null;

        return [
            'requireApproval' => (bool) ($governance['requireApproval'] ?? false),
            'approvalAuthority' => (string) ($governance['approvalAuthority'] ?? 'vendor'),
            'approverRoles' => is_array($governance['approverRoles'] ?? null)
                ? array_values($governance['approverRoles'])
                : [],
            'draftVersion' => (int) ($governance['draftVersion'] ?? 1),
            'publishedVersion' => (int) ($governance['publishedVersion'] ?? 1),
            'publishedAt' => $governance['publishedAt'] ?? null,
            'publishedBy' => isset($governance['publishedBy']) ? (int) $governance['publishedBy'] : null,
            'hasPendingApproval' => $pending !== null,
            'pendingRequestedAt' => $pending['requestedAt'] ?? null,
            'pendingRequestedBy' => isset($pending['requestedBy']) ? (int) $pending['requestedBy'] : null,
        ];
    }
}
