<?php

namespace App\Http\Controllers\CourierControllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Courier\CourierContact;
use App\Models\Courier\CourierShipment;
use App\Models\Courier\VendorCourierClientProfile;
use App\Models\VendorServiceRegistration;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class VendorCourierDashboardController extends Controller
{
    private const BOOKING_STATUS_OPTIONS = [
        'new_request',
        'quote_pending',
        'quoted',
        'awaiting_client_confirmation',
        'confirmed',
        'cancelled',
        'rejected',
        'expired',
    ];

    private const BOOKING_ACTION_META = [
        'accept_booking' => [
            'status' => CourierShipment::STATUS_CONFIRMED,
            'event' => 'booking_confirmed',
            'nextBookingStatus' => 'confirmed',
        ],
        'request_revision' => [
            'status' => null,
            'event' => 'booking_revision_requested',
            'nextBookingStatus' => 'quote_pending',
        ],
        'send_quote' => [
            'status' => null,
            'event' => 'booking_quoted',
            'nextBookingStatus' => 'quoted',
        ],
        'mark_awaiting_confirmation' => [
            'status' => null,
            'event' => 'booking_awaiting_client_confirmation',
            'nextBookingStatus' => 'awaiting_client_confirmation',
        ],
        'cancel_booking' => [
            'status' => CourierShipment::STATUS_CANCELLED,
            'event' => 'booking_cancelled',
            'nextBookingStatus' => 'cancelled',
        ],
        'reject_booking' => [
            'status' => CourierShipment::STATUS_CANCELLED,
            'event' => 'booking_rejected',
            'nextBookingStatus' => 'rejected',
        ],
        'expire_booking' => [
            'status' => CourierShipment::STATUS_CANCELLED,
            'event' => 'booking_expired',
            'nextBookingStatus' => 'expired',
        ],
        'reopen_booking' => [
            'status' => CourierShipment::STATUS_PENDING,
            'event' => 'booking_reopened',
            'nextBookingStatus' => 'new_request',
        ],
    ];

    private const BOOKING_ALLOWED_ACTIONS = [
        'new_request' => ['send_quote', 'request_revision', 'accept_booking', 'reject_booking', 'expire_booking'],
        'quote_pending' => ['send_quote', 'request_revision', 'reject_booking', 'expire_booking'],
        'quoted' => ['mark_awaiting_confirmation', 'accept_booking', 'request_revision', 'reject_booking'],
        'awaiting_client_confirmation' => ['accept_booking', 'request_revision', 'cancel_booking'],
        'confirmed' => ['cancel_booking'],
        'cancelled' => ['reopen_booking'],
        'rejected' => ['reopen_booking'],
        'expired' => ['reopen_booking'],
    ];

    private const SHIPMENT_STAGE_OPTIONS = [
        'new_assignments',
        'ready_for_pickup',
        'picked_up',
        'in_transit',
        'out_for_delivery',
        'exception',
        'delivered',
        'cancelled',
    ];

    private const ACTION_META = [
        'accept_assignment' => [
            'status' => CourierShipment::STATUS_CONFIRMED,
            'event' => 'accepted',
            'nextStage' => 'ready_for_pickup',
        ],
        'ready_for_pickup' => [
            'status' => CourierShipment::STATUS_CONFIRMED,
            'event' => 'ready_for_pickup',
            'nextStage' => 'ready_for_pickup',
        ],
        'picked_up' => [
            'status' => CourierShipment::STATUS_IN_TRANSIT,
            'event' => 'picked_up',
            'nextStage' => 'picked_up',
        ],
        'in_transit' => [
            'status' => CourierShipment::STATUS_IN_TRANSIT,
            'event' => 'in_transit',
            'nextStage' => 'in_transit',
        ],
        'out_for_delivery' => [
            'status' => CourierShipment::STATUS_IN_TRANSIT,
            'event' => 'out_for_delivery',
            'nextStage' => 'out_for_delivery',
        ],
        'mark_exception' => [
            'status' => CourierShipment::STATUS_IN_TRANSIT,
            'event' => 'exception',
            'nextStage' => 'exception',
        ],
        'mark_delivered' => [
            'status' => CourierShipment::STATUS_DELIVERED,
            'event' => 'delivered',
            'nextStage' => 'delivered',
        ],
        'cancel_shipment' => [
            'status' => CourierShipment::STATUS_CANCELLED,
            'event' => 'cancelled',
            'nextStage' => 'cancelled',
        ],
    ];

    private const ALLOWED_STAGE_ACTIONS = [
        'new_assignments' => ['accept_assignment', 'ready_for_pickup', 'cancel_shipment'],
        'ready_for_pickup' => ['picked_up', 'mark_exception', 'cancel_shipment'],
        'picked_up' => ['in_transit', 'mark_exception'],
        'in_transit' => ['out_for_delivery', 'mark_exception'],
        'out_for_delivery' => ['mark_delivered', 'mark_exception'],
        'exception' => ['in_transit', 'cancel_shipment'],
        'delivered' => [],
        'cancelled' => [],
    ];

    public function dashboard(Request $request)
    {
        [$filters, $shipments] = $this->buildFilteredShipments($request);

        if ($request->query('export') === 'csv') {
            return $this->downloadCsv($shipments);
        }

        return Inertia::render('Web/home/vendors/courierService/Dashboard', [
            'courierDashboard' => $this->buildDashboardPayload($shipments, $filters),
        ]);
    }

    public function bookings(Request $request)
    {
        [$filters, $shipments] = $this->buildFilteredShipments($request);

        return Inertia::render('Web/home/vendors/courierService/Booking', [
            'courierBookings' => $this->buildBookingsPayload($shipments, $filters),
        ]);
    }

    public function updateBookingLifecycle(Request $request, CourierShipment $shipment)
    {
        $vendorId = (int) optional($request->user())->id;

        if ((int) $shipment->assigned_vendor_user_id !== $vendorId) {
            abort(403, 'You are not allowed to modify this booking.');
        }

        $validated = $request->validate([
            'action' => ['required', 'string', 'in:' . implode(',', array_keys(self::BOOKING_ACTION_META))],
        ]);

        $result = $this->applyBookingAction($shipment, $validated['action']);

        if (!$result['ok']) {
            return back()->with('error', $result['message']);
        }

        return back()->with('success', 'Booking updated successfully.');
    }

    public function bulkUpdateBookingLifecycle(Request $request)
    {
        $vendorId = (int) optional($request->user())->id;

        if (!$this->hasApprovedCourierRegistration($vendorId)) {
            abort(403, 'Courier service registration approval is required to manage bookings.');
        }

        $validated = $request->validate([
            'shipmentIds' => ['required', 'array', 'min:1', 'max:200'],
            'shipmentIds.*' => ['required', 'integer'],
            'action' => ['required', 'string', 'in:' . implode(',', array_keys(self::BOOKING_ACTION_META))],
        ]);

        $ids = collect($validated['shipmentIds'])->unique()->values();
        $action = $validated['action'];

        $shipments = CourierShipment::query()
            ->where('assigned_vendor_user_id', $vendorId)
            ->whereIn('id', $ids)
            ->with('trackingEvents:id,shipment_id,status,recorded_at')
            ->get();

        $successCount = 0;
        $blockedCount = 0;

        foreach ($shipments as $shipment) {
            $result = $this->applyBookingAction($shipment, $action);

            if ($result['ok']) {
                $successCount++;
            } else {
                $blockedCount++;
            }
        }

        if ($successCount === 0) {
            return back()->with('error', 'No bookings were updated. Selected action is not allowed for current booking statuses.');
        }

        $message = $successCount . ' booking(s) updated successfully.';

        if ($blockedCount > 0) {
            $message .= ' ' . $blockedCount . ' booking(s) skipped due to lifecycle rules.';
        }

        return back()->with('success', $message);
    }

    public function clients(Request $request)
    {
        [$filters, $clientsPayload] = $this->buildClientsPayload($request);

        return Inertia::render('Web/home/vendors/courierService/Client', [
            'courierClients' => $clientsPayload,
        ]);
    }

    public function updateClientProfile(Request $request, CourierContact $contact)
    {
        $vendorId = (int) optional($request->user())->id;

        if (!$this->hasApprovedCourierRegistration($vendorId)) {
            abort(403, 'Courier service registration approval is required to manage clients.');
        }

        $belongsToVendor = CourierShipment::query()
            ->where('assigned_vendor_user_id', $vendorId)
            ->where('sender_contact_id', $contact->id)
            ->exists();

        if (!$belongsToVendor) {
            abort(403, 'You are not allowed to modify this client profile.');
        }

        $validated = $request->validate([
            'action' => ['required', 'string', 'in:toggle_watchlist,set_priority,set_owner,add_note,set_tier'],
            'priorityTag' => ['nullable', 'string', 'in:vip,standard,watchlist'],
            'accountOwner' => ['nullable', 'string', 'max:120'],
            'note' => ['nullable', 'string', 'max:1200'],
            'clientTier' => ['nullable', 'string', 'in:enterprise,sme,individual'],
        ]);

        $profile = VendorCourierClientProfile::firstOrCreate([
            'vendor_user_id' => $vendorId,
            'contact_id' => $contact->id,
        ]);

        $action = $validated['action'];

        if ($action === 'toggle_watchlist') {
            $profile->watchlist = !$profile->watchlist;
        }

        if ($action === 'set_priority') {
            $profile->priority_tag = $validated['priorityTag'] ?? 'standard';
        }

        if ($action === 'set_owner') {
            $profile->account_owner = $validated['accountOwner'] ?? null;
        }

        if ($action === 'set_tier') {
            $profile->client_tier = $validated['clientTier'] ?? null;
        }

        if ($action === 'add_note' && !empty($validated['note'])) {
            $existing = trim((string) $profile->internal_notes);
            $newLine = '[' . now()->format('Y-m-d H:i') . '] ' . trim((string) $validated['note']);
            $profile->internal_notes = $existing === '' ? $newLine : ($existing . "\n" . $newLine);
        }

        $profile->save();

        return back()->with('success', 'Client profile updated successfully.');
    }

    public function shipments(Request $request)
    {
        [$filters, $shipments] = $this->buildFilteredShipments($request);

        return Inertia::render('Web/home/vendors/courierService/Unit', [
            'courierShipments' => $this->buildShipmentsPayload($shipments, $filters),
        ]);
    }

    public function updateShipmentStage(Request $request, CourierShipment $shipment)
    {
        $vendorId = (int) optional($request->user())->id;

        if ((int) $shipment->assigned_vendor_user_id !== $vendorId) {
            abort(403, 'You are not allowed to modify this shipment.');
        }

        $validated = $request->validate([
            'action' => ['required', 'string', 'in:' . implode(',', array_keys(self::ACTION_META))],
        ]);

        $action = $validated['action'];
        $result = $this->applyShipmentAction($shipment, $action);

        if (!$result['ok']) {
            return back()->with('error', $result['message']);
        }

        return back()->with('success', 'Shipment updated successfully.');
    }

    public function bulkUpdateShipmentStage(Request $request)
    {
        $vendorId = (int) optional($request->user())->id;

        if (!$this->hasApprovedCourierRegistration($vendorId)) {
            abort(403, 'Courier service registration approval is required to manage shipments.');
        }

        $validated = $request->validate([
            'shipmentIds' => ['required', 'array', 'min:1', 'max:200'],
            'shipmentIds.*' => ['required', 'integer'],
            'action' => ['required', 'string', 'in:' . implode(',', array_keys(self::ACTION_META))],
        ]);

        $action = $validated['action'];
        $ids = collect($validated['shipmentIds'])->unique()->values();

        $shipments = CourierShipment::query()
            ->where('assigned_vendor_user_id', $vendorId)
            ->whereIn('id', $ids)
            ->with('trackingEvents:id,shipment_id,status,recorded_at')
            ->get();

        $successCount = 0;
        $blockedCount = 0;

        foreach ($shipments as $shipment) {
            $result = $this->applyShipmentAction($shipment, $action);

            if ($result['ok']) {
                $successCount++;
            } else {
                $blockedCount++;
            }
        }

        if ($successCount === 0) {
            return back()->with('error', 'No shipments were updated. Selected action is not allowed for current stages.');
        }

        $message = $successCount . ' shipment(s) updated successfully.';

        if ($blockedCount > 0) {
            $message .= ' ' . $blockedCount . ' shipment(s) skipped due to stage rules.';
        }

        return back()->with('success', $message);
    }

    private function buildFilteredShipments(Request $request): array
    {
        $vendorId = (int) optional($request->user())->id;

        if (!$this->hasApprovedCourierRegistration($vendorId)) {
            abort(403, 'Courier service registration approval is required to access this dashboard.');
        }

        $filters = [
            'q' => trim((string) $request->query('q', '')),
            'status' => trim((string) $request->query('status', '')),
            'service' => trim((string) $request->query('service', '')),
            'category' => trim((string) $request->query('category', '')),
            'bookingStatus' => trim((string) $request->query('bookingStatus', '')),
            'paymentStatus' => trim((string) $request->query('paymentStatus', '')),
            'fromDate' => trim((string) $request->query('fromDate', '')),
            'toDate' => trim((string) $request->query('toDate', '')),
            'bookingRange' => trim((string) $request->query('bookingRange', 'this_year')),
            'earningRange' => trim((string) $request->query('earningRange', 'last_12_months')),
            'statusRange' => trim((string) $request->query('statusRange', 'this_week')),
            'stage' => trim((string) $request->query('stage', '')),
            'perPage' => max(5, (int) $request->query('perPage', 10)),
            'page' => max(1, (int) $request->query('page', 1)),
        ];

        $query = CourierShipment::query()
            ->with([
                'sender:id,name',
                'recipient:id,name',
                'senderAddress:id,country,city,state',
                'recipientAddress:id,country,city,state',
                'packages:id,shipment_id,service_tier_label,service_tier_key,service_eta,courier_provider_name',
                'trackingEvents:id,shipment_id,status,recorded_at',
            ])
            ->where('assigned_vendor_user_id', $vendorId)
            ->orderByDesc('created_at');

        $this->applyFilters($query, $filters);

        $shipments = $query->get();

        if ($filters['stage'] !== '' && in_array($filters['stage'], self::SHIPMENT_STAGE_OPTIONS, true)) {
            $shipments = $shipments
                ->filter(fn (CourierShipment $shipment) => $this->getShipmentStage($shipment) === $filters['stage'])
                ->values();
        }

        return [$filters, $shipments];
    }

    private function buildShipmentsPayload(Collection $shipments, array $filters): array
    {
        $rows = $shipments->map(function (CourierShipment $shipment) {
            $latestEvent = $this->getLatestTrackingEvent($shipment);
            $stage = $this->getShipmentStage($shipment);
            $estimatedDelivery = $this->estimateDeliveryDateTime($shipment);
            $deliveredAt = $this->getDeliveredAt($shipment);
            $timelineState = $this->getTimelineState($shipment, $estimatedDelivery, $deliveredAt);
            $assignmentHealth = $this->resolveAssignmentHealth($shipment);

            return [
                'id' => $shipment->id,
                'bookingNumber' => $shipment->reference,
                'trackingNumber' => $this->trackingNumber($shipment),
                'category' => $this->resolveCategory($shipment),
                'service' => $this->normalizeServiceLabel($shipment->service_level),
                'status' => $shipment->status,
                'statusLabel' => $this->statusLabel($shipment->status),
                'stage' => $stage,
                'stageLabel' => $this->stageLabel($stage),
                'sender' => $shipment->sender?->name,
                'recipient' => $shipment->recipient?->name,
                'origin' => trim(implode(', ', array_filter([
                    optional($shipment->senderAddress)->city,
                    optional($shipment->senderAddress)->country,
                ]))),
                'destination' => trim(implode(', ', array_filter([
                    optional($shipment->recipientAddress)->city,
                    optional($shipment->recipientAddress)->country,
                ]))),
                'pickupWindow' => $this->formatPickupWindow($shipment),
                'estimatedDelivery' => optional($estimatedDelivery)->format('Y-m-d H:i'),
                'lastScan' => optional(optional($latestEvent)->recorded_at)->format('Y-m-d H:i'),
                'lastScanStatus' => optional($latestEvent)->status,
                'assignedAt' => optional($shipment->assigned_at)->format('Y-m-d H:i'),
                'exception' => $this->hasException($shipment),
                'slaStatus' => $this->resolveSlaStatus($shipment, $estimatedDelivery, $timelineState),
                'assignmentHealth' => $assignmentHealth,
                'allowedActions' => $assignmentHealth === 'assigned'
                    ? $this->getAllowedActionsForStage($stage)
                    : [],
                'details' => [
                    'deliveryNotes' => $shipment->delivery_notes,
                    'internalNotes' => $shipment->internal_notes,
                    'packageCount' => $shipment->packages->count(),
                    'totalWeight' => (float) $shipment->packages->sum('weight_kg'),
                ],
            ];
        })->values();

        $summary = [
            'totalAssigned' => $rows->count(),
            'newAssignments' => $rows->where('stage', 'new_assignments')->count(),
            'readyForPickup' => $rows->where('stage', 'ready_for_pickup')->count(),
            'inTransit' => $rows->whereIn('stage', ['picked_up', 'in_transit', 'out_for_delivery'])->count(),
            'exception' => $rows->where('stage', 'exception')->count(),
            'deliveredToday' => $rows->filter(function ($row) {
                if (!$row['lastScan'] || $row['stage'] !== 'delivered') {
                    return false;
                }

                return Carbon::parse($row['lastScan'])->isToday();
            })->count(),
        ];

        $perPage = max(5, min(50, (int) ($filters['perPage'] ?? 10)));
        $total = $rows->count();
        $totalPages = max(1, (int) ceil($total / $perPage));
        $page = min((int) $filters['page'], $totalPages);
        $pagedRows = $rows->slice(($page - 1) * $perPage, $perPage)->values();

        return [
            'summary' => $summary,
            'rows' => $pagedRows,
            'filters' => array_merge($filters, ['page' => $page, 'perPage' => $perPage]),
            'pagination' => [
                'page' => $page,
                'perPage' => $perPage,
                'total' => $total,
                'totalPages' => $totalPages,
            ],
            'filterOptions' => [
                'stages' => collect(self::SHIPMENT_STAGE_OPTIONS)
                    ->map(fn ($stage) => ['value' => $stage, 'label' => $this->stageLabel($stage)])
                    ->values(),
                'statuses' => $shipments
                    ->pluck('status')
                    ->filter()
                    ->unique()
                    ->map(fn ($status) => [
                        'value' => $status,
                        'label' => $this->statusLabel($status),
                    ])
                    ->values(),
                'services' => $shipments
                    ->pluck('service_level')
                    ->filter()
                    ->unique()
                    ->sort()
                    ->values(),
                'categories' => [
                    ['value' => 'domestic', 'label' => 'Domestic'],
                    ['value' => 'logistic', 'label' => 'Logistic'],
                ],
                'perPageOptions' => [10, 20, 50],
            ],
        ];
    }

    private function buildBookingsPayload(Collection $shipments, array $filters): array
    {
        $rows = $shipments->map(function (CourierShipment $shipment) {
            $bookingStatus = $this->resolveBookingStatus($shipment);
            $estimatedDelivery = $this->estimateDeliveryDateTime($shipment);
            $confirmHours = $this->resolveBookingConfirmHours($shipment);

            return [
                'id' => $shipment->id,
                'bookingNumber' => $shipment->reference,
                'createdAt' => optional($shipment->created_at)->format('Y-m-d H:i'),
                'client' => $shipment->sender?->name,
                'clientCompany' => $shipment->sender?->company_name,
                'trackingNumber' => $this->trackingNumber($shipment),
                'category' => $this->resolveCategory($shipment),
                'service' => $this->normalizeServiceLabel($shipment->service_level),
                'route' => trim(implode(' to ', array_filter([
                    trim(implode(', ', array_filter([
                        optional($shipment->senderAddress)->city,
                        optional($shipment->senderAddress)->country,
                    ]))),
                    trim(implode(', ', array_filter([
                        optional($shipment->recipientAddress)->city,
                        optional($shipment->recipientAddress)->country,
                    ]))),
                ]))),
                'quoteAmount' => (float) ($shipment->estimated_cost ?? 0),
                'currency' => (string) ($shipment->currency_code ?? 'LKR'),
                'paymentStatus' => $this->derivePaymentStatus($shipment),
                'bookingStatus' => $bookingStatus,
                'bookingStatusLabel' => $this->bookingStatusLabel($bookingStatus),
                'pickupWindow' => $this->formatPickupWindow($shipment),
                'eta' => optional($estimatedDelivery)->format('Y-m-d H:i'),
                'allowedActions' => $this->getAllowedBookingActionsForStatus($bookingStatus),
                'confirmHours' => $confirmHours,
            ];
        })->values();

        $summary = [
            'newRequestsToday' => $rows->filter(fn ($row) => $row['bookingStatus'] === 'new_request' && str_starts_with((string) $row['createdAt'], now()->format('Y-m-d')))->count(),
            'awaitingConfirmation' => $rows->where('bookingStatus', 'awaiting_client_confirmation')->count(),
            'confirmedToday' => $rows->filter(fn ($row) => $row['bookingStatus'] === 'confirmed' && str_starts_with((string) $row['createdAt'], now()->format('Y-m-d')))->count(),
            'cancellationsToday' => $rows->filter(fn ($row) => in_array($row['bookingStatus'], ['cancelled', 'rejected', 'expired'], true) && str_starts_with((string) $row['createdAt'], now()->format('Y-m-d')))->count(),
            'conversionRate' => $rows->count() > 0
                ? round(($rows->where('bookingStatus', 'confirmed')->count() / $rows->count()) * 100, 1)
                : 0,
            'avgConfirmationHours' => $rows->filter(fn ($row) => $row['confirmHours'] !== null)->count() > 0
                ? round($rows->filter(fn ($row) => $row['confirmHours'] !== null)->avg('confirmHours'), 1)
                : 0,
        ];

        $statusFilter = trim((string) ($filters['bookingStatus'] ?? ''));
        $paymentFilter = trim((string) ($filters['paymentStatus'] ?? ''));

        if ($statusFilter !== '' && in_array($statusFilter, self::BOOKING_STATUS_OPTIONS, true)) {
            $rows = $rows->where('bookingStatus', $statusFilter)->values();
        }

        if ($paymentFilter !== '') {
            $rows = $rows->where('paymentStatus', $paymentFilter)->values();
        }

        $perPage = max(5, min(50, (int) ($filters['perPage'] ?? 10)));
        $total = $rows->count();
        $totalPages = max(1, (int) ceil($total / $perPage));
        $page = min((int) ($filters['page'] ?? 1), $totalPages);
        $pagedRows = $rows->slice(($page - 1) * $perPage, $perPage)->values();

        return [
            'summary' => $summary,
            'rows' => $pagedRows,
            'filters' => [
                'q' => (string) ($filters['q'] ?? ''),
                'category' => (string) ($filters['category'] ?? ''),
                'service' => (string) ($filters['service'] ?? ''),
                'bookingStatus' => $statusFilter,
                'paymentStatus' => $paymentFilter,
                'fromDate' => (string) ($filters['fromDate'] ?? ''),
                'toDate' => (string) ($filters['toDate'] ?? ''),
                'perPage' => $perPage,
                'page' => $page,
            ],
            'pagination' => [
                'page' => $page,
                'perPage' => $perPage,
                'total' => $total,
                'totalPages' => $totalPages,
            ],
            'filterOptions' => [
                'bookingStatuses' => collect(self::BOOKING_STATUS_OPTIONS)
                    ->map(fn ($status) => ['value' => $status, 'label' => $this->bookingStatusLabel($status)])
                    ->values(),
                'paymentStatuses' => [
                    ['value' => 'paid', 'label' => 'Paid'],
                    ['value' => 'pending', 'label' => 'Pending'],
                    ['value' => 'failed', 'label' => 'Failed'],
                ],
                'categories' => [
                    ['value' => 'domestic', 'label' => 'Domestic'],
                    ['value' => 'logistic', 'label' => 'Logistic'],
                ],
                'services' => $shipments->pluck('service_level')->filter()->unique()->sort()->values(),
                'perPageOptions' => [10, 20, 50],
                'actionOptions' => collect(array_keys(self::BOOKING_ACTION_META))
                    ->map(fn ($action) => [
                        'value' => $action,
                        'label' => Str::title(str_replace('_', ' ', $action)),
                    ])
                    ->values(),
            ],
        ];
    }

    private function resolveBookingStatus(CourierShipment $shipment): string
    {
        $latestEventStatus = strtolower((string) optional($this->getLatestTrackingEvent($shipment))->status);

        return match ($latestEventStatus) {
            'booking_quote_pending', 'booking_revision_requested' => 'quote_pending',
            'booking_quoted' => 'quoted',
            'booking_awaiting_client_confirmation' => 'awaiting_client_confirmation',
            'booking_confirmed' => 'confirmed',
            'booking_cancelled' => 'cancelled',
            'booking_rejected' => 'rejected',
            'booking_expired' => 'expired',
            'booking_reopened' => 'new_request',
            default => match ($shipment->status) {
                CourierShipment::STATUS_PENDING => 'new_request',
                CourierShipment::STATUS_CONFIRMED,
                CourierShipment::STATUS_IN_TRANSIT,
                CourierShipment::STATUS_DELIVERED => 'confirmed',
                CourierShipment::STATUS_CANCELLED => 'cancelled',
                default => 'new_request',
            },
        };
    }

    private function bookingStatusLabel(string $status): string
    {
        return ucwords(str_replace('_', ' ', $status));
    }

    private function derivePaymentStatus(CourierShipment $shipment): string
    {
        if ($shipment->status === CourierShipment::STATUS_CANCELLED) {
            return 'failed';
        }

        if ((float) ($shipment->estimated_cost ?? 0) <= 0 || $shipment->status === CourierShipment::STATUS_PENDING) {
            return 'pending';
        }

        return 'paid';
    }

    private function resolveBookingConfirmHours(CourierShipment $shipment): ?float
    {
        $confirmedEvent = $shipment->trackingEvents
            ->filter(fn ($event) => strtolower((string) $event->status) === 'booking_confirmed')
            ->sortBy('recorded_at')
            ->first();

        if (!$confirmedEvent || !$confirmedEvent->recorded_at || !$shipment->created_at) {
            return null;
        }

        return round($shipment->created_at->diffInMinutes($confirmedEvent->recorded_at) / 60, 2);
    }

    private function getAllowedBookingActionsForStatus(string $bookingStatus): array
    {
        return self::BOOKING_ALLOWED_ACTIONS[$bookingStatus] ?? [];
    }

    private function canPerformBookingAction(string $bookingStatus, string $action): bool
    {
        return in_array($action, $this->getAllowedBookingActionsForStatus($bookingStatus), true);
    }

    private function applyBookingAction(CourierShipment $shipment, string $action): array
    {
        $shipment->loadMissing('trackingEvents:id,shipment_id,status,recorded_at');

        $bookingStatus = $this->resolveBookingStatus($shipment);

        if (!$this->canPerformBookingAction($bookingStatus, $action)) {
            return [
                'ok' => false,
                'message' => 'Action "' . str_replace('_', ' ', $action) . '" is not allowed from booking status "' . $this->bookingStatusLabel($bookingStatus) . '".',
            ];
        }

        $meta = self::BOOKING_ACTION_META[$action];

        DB::transaction(function () use ($shipment, $meta, $action) {
            $updateData = [];

            if (!empty($meta['status'])) {
                $updateData['status'] = $meta['status'];
            }

            if (!empty($updateData)) {
                $shipment->update($updateData);
            }

            $shipment->trackingEvents()->create([
                'status' => $meta['event'],
                'description' => 'Booking action: ' . str_replace('_', ' ', $action),
                'recorded_at' => now(),
            ]);
        });

        return ['ok' => true, 'message' => 'Updated'];
    }

    private function buildClientsPayload(Request $request): array
    {
        $vendorId = (int) optional($request->user())->id;

        if (!$this->hasApprovedCourierRegistration($vendorId)) {
            abort(403, 'Courier service registration approval is required to access clients.');
        }

        $filters = [
            'q' => trim((string) $request->query('q', '')),
            'category' => trim((string) $request->query('category', '')),
            'tier' => trim((string) $request->query('tier', '')),
            'risk' => trim((string) $request->query('risk', '')),
            'watchlist' => trim((string) $request->query('watchlist', '')),
            'perPage' => max(5, (int) $request->query('perPage', 10)),
            'page' => max(1, (int) $request->query('page', 1)),
        ];

        $shipments = CourierShipment::query()
            ->with([
                'sender:id,name,email,phone,company_name',
                'senderAddress:id,contact_id,city,country',
                'recipientAddress:id,contact_id,city,country',
                'trackingEvents:id,shipment_id,status,recorded_at',
            ])
            ->where('assigned_vendor_user_id', $vendorId)
            ->orderByDesc('created_at')
            ->get();

        $clientGroups = $shipments
            ->filter(fn (CourierShipment $shipment) => $shipment->sender_contact_id !== null)
            ->groupBy('sender_contact_id');

        $profiles = VendorCourierClientProfile::query()
            ->where('vendor_user_id', $vendorId)
            ->whereIn('contact_id', $clientGroups->keys())
            ->get()
            ->keyBy('contact_id');

        $rows = $clientGroups->map(function (Collection $items, $contactId) use ($profiles) {
            $first = $items->first();
            $profile = $profiles->get($contactId);

            $total = $items->count();
            $deliveredCount = $items->where('status', CourierShipment::STATUS_DELIVERED)->count();
            $activeCount = $items->whereNotIn('status', [CourierShipment::STATUS_DELIVERED, CourierShipment::STATUS_CANCELLED])->count();
            $exceptionCount = $items->filter(fn (CourierShipment $shipment) => $this->hasException($shipment))->count();

            $domesticCount = $items->filter(function (CourierShipment $shipment) {
                return $this->resolveCategory($shipment) === 'Domestic';
            })->count();

            $logisticCount = $total - $domesticCount;

            $deliveredRate = $total > 0 ? round(($deliveredCount / $total) * 100, 1) : 0;
            $exceptionRate = $total > 0 ? round(($exceptionCount / $total) * 100, 1) : 0;

            $slaGood = $items->filter(function (CourierShipment $shipment) {
                $eta = $this->estimateDeliveryDateTime($shipment);
                $timeline = $this->getTimelineState($shipment, $eta, $this->getDeliveredAt($shipment));
                return in_array($timeline, ['on_time', 'early'], true);
            })->count();

            $slaPerformance = $total > 0 ? round(($slaGood / $total) * 100, 1) : 0;
            $risk = $this->resolveClientRisk($exceptionRate, $deliveredRate);

            $derivedTier = $this->resolveClientTier($total);
            $tier = $profile?->client_tier ?: $derivedTier;

            $categoryMix = 'Mixed';
            if ($logisticCount === 0) {
                $categoryMix = 'Domestic';
            } elseif ($domesticCount === 0) {
                $categoryMix = 'Logistic';
            }

            $lastShipment = optional($items->sortByDesc('created_at')->first()->created_at)->format('Y-m-d H:i');

            return [
                'id' => (int) $contactId,
                'name' => $first->sender?->name,
                'company' => $first->sender?->company_name,
                'email' => $first->sender?->email,
                'phone' => $first->sender?->phone,
                'clientTier' => $tier,
                'categoryMix' => $categoryMix,
                'priorityTag' => $profile?->priority_tag ?: ($risk === 'critical' ? 'watchlist' : 'standard'),
                'watchlist' => (bool) ($profile?->watchlist),
                'accountOwner' => $profile?->account_owner,
                'internalNotes' => $profile?->internal_notes,
                'totalShipments' => $total,
                'activeShipments' => $activeCount,
                'deliveredRate' => $deliveredRate,
                'exceptionRate' => $exceptionRate,
                'slaPerformance' => $slaPerformance,
                'lastShipmentDate' => $lastShipment,
                'riskLevel' => $risk,
                'openExceptions' => $exceptionCount,
                'domesticCount' => $domesticCount,
                'logisticCount' => $logisticCount,
            ];
        })->values();

        if ($filters['q'] !== '') {
            $needle = strtolower($filters['q']);
            $rows = $rows->filter(function ($row) use ($needle) {
                return str_contains(strtolower((string) $row['name']), $needle)
                    || str_contains(strtolower((string) $row['company']), $needle)
                    || str_contains(strtolower((string) $row['email']), $needle)
                    || str_contains(strtolower((string) $row['phone']), $needle);
            })->values();
        }

        if ($filters['category'] !== '') {
            $rows = $rows->filter(function ($row) use ($filters) {
                return strtolower((string) $row['categoryMix']) === strtolower($filters['category'])
                    || strtolower((string) $row['categoryMix']) === 'mixed';
            })->values();
        }

        if ($filters['tier'] !== '') {
            $rows = $rows->where('clientTier', $filters['tier'])->values();
        }

        if ($filters['risk'] !== '') {
            $rows = $rows->where('riskLevel', $filters['risk'])->values();
        }

        if ($filters['watchlist'] === 'only') {
            $rows = $rows->where('watchlist', true)->values();
        }

        $summary = [
            'totalActiveClients' => $rows->count(),
            'watchlistClients' => $rows->where('watchlist', true)->count(),
            'criticalRiskClients' => $rows->where('riskLevel', 'critical')->count(),
            'clientsWithOpenExceptions' => $rows->filter(fn ($row) => $row['openExceptions'] > 0)->count(),
            'enterpriseClients' => $rows->where('clientTier', 'enterprise')->count(),
            'avgSlaPerformance' => $rows->count() > 0
                ? round($rows->avg('slaPerformance'), 1)
                : 0,
        ];

        $perPage = max(5, min(50, (int) $filters['perPage']));
        $total = $rows->count();
        $totalPages = max(1, (int) ceil($total / $perPage));
        $page = min((int) $filters['page'], $totalPages);
        $pagedRows = $rows->slice(($page - 1) * $perPage, $perPage)->values();

        return [$filters, [
            'summary' => $summary,
            'rows' => $pagedRows,
            'filters' => array_merge($filters, ['page' => $page, 'perPage' => $perPage]),
            'pagination' => [
                'page' => $page,
                'perPage' => $perPage,
                'total' => $total,
                'totalPages' => $totalPages,
            ],
            'filterOptions' => [
                'tiers' => [
                    ['value' => 'enterprise', 'label' => 'Enterprise'],
                    ['value' => 'sme', 'label' => 'SME'],
                    ['value' => 'individual', 'label' => 'Individual'],
                ],
                'risks' => [
                    ['value' => 'critical', 'label' => 'Critical'],
                    ['value' => 'at_risk', 'label' => 'At Risk'],
                    ['value' => 'stable', 'label' => 'Stable'],
                ],
                'categories' => [
                    ['value' => 'domestic', 'label' => 'Domestic'],
                    ['value' => 'logistic', 'label' => 'Logistic'],
                ],
                'perPageOptions' => [10, 20, 50],
                'priorityTags' => [
                    ['value' => 'vip', 'label' => 'VIP'],
                    ['value' => 'standard', 'label' => 'Standard'],
                    ['value' => 'watchlist', 'label' => 'Watchlist'],
                ],
            ],
        ]];
    }

    private function applyShipmentAction(CourierShipment $shipment, string $action): array
    {
        $shipment->loadMissing('trackingEvents:id,shipment_id,status,recorded_at');

        $assignmentHealth = $this->resolveAssignmentHealth($shipment);

        if ($assignmentHealth !== 'assigned') {
            return [
                'ok' => false,
                'message' => 'Shipment assignment is not active. Update is blocked.',
            ];
        }

        $currentStage = $this->getShipmentStage($shipment);

        if (!$this->canPerformAction($currentStage, $action)) {
            return [
                'ok' => false,
                'message' => 'Action "' . str_replace('_', ' ', $action) . '" is not allowed from stage "' . $this->stageLabel($currentStage) . '".',
            ];
        }

        $next = self::ACTION_META[$action];

        DB::transaction(function () use ($shipment, $next, $action) {
            $shipment->update([
                'status' => $next['status'],
            ]);

            $shipment->trackingEvents()->create([
                'status' => $next['event'],
                'description' => 'Vendor action: ' . str_replace('_', ' ', $action),
                'recorded_at' => now(),
            ]);
        });

        return ['ok' => true, 'message' => 'Updated'];
    }

    private function canPerformAction(string $stage, string $action): bool
    {
        $allowed = self::ALLOWED_STAGE_ACTIONS[$stage] ?? [];
        return in_array($action, $allowed, true);
    }

    private function getAllowedActionsForStage(string $stage): array
    {
        return self::ALLOWED_STAGE_ACTIONS[$stage] ?? [];
    }

    private function resolveAssignmentHealth(CourierShipment $shipment): string
    {
        if (!$shipment->assigned_vendor_user_id) {
            return 'unassigned';
        }

        if (!$shipment->assigned_vendor_registration_id) {
            return 'registration_missing';
        }

        if (!$shipment->assigned_at) {
            return 'pending_confirmation';
        }

        return 'assigned';
    }

    private function resolveSlaStatus(CourierShipment $shipment, ?Carbon $estimatedDelivery, ?string $timelineState): string
    {
        if (!$estimatedDelivery) {
            return 'unknown';
        }

        if ($timelineState === 'delayed') {
            return 'delayed';
        }

        if ($timelineState === 'early') {
            return 'early';
        }

        if ($shipment->status === CourierShipment::STATUS_DELIVERED) {
            return 'on_time';
        }

        $hoursToEta = now()->diffInHours($estimatedDelivery, false);

        if ($hoursToEta >= 0 && $hoursToEta <= 6) {
            return 'at_risk';
        }

        return 'on_track';
    }

    private function resolveClientRisk(float $exceptionRate, float $deliveredRate): string
    {
        if ($exceptionRate >= 20 || $deliveredRate < 65) {
            return 'critical';
        }

        if ($exceptionRate >= 10 || $deliveredRate < 80) {
            return 'at_risk';
        }

        return 'stable';
    }

    private function resolveClientTier(int $totalShipments): string
    {
        if ($totalShipments >= 50) {
            return 'enterprise';
        }

        if ($totalShipments >= 15) {
            return 'sme';
        }

        return 'individual';
    }

    private function applyFilters(Builder $query, array $filters): void
    {
        if ($filters['q'] !== '') {
            $raw = strtoupper($filters['q']);
            $normalized = str_starts_with($raw, 'TRK-')
                ? 'CR-' . substr($raw, 4)
                : $raw;

            $query->where(function (Builder $nested) use ($raw, $normalized) {
                $nested->whereRaw('UPPER(reference) LIKE ?', ['%' . $raw . '%'])
                    ->orWhereRaw('UPPER(reference) LIKE ?', ['%' . $normalized . '%']);
            });
        }

        if ($filters['status'] !== '') {
            $query->where('status', $filters['status']);
        }

        if ($filters['service'] !== '') {
            $query->where('service_level', $filters['service']);
        }

        if ($filters['fromDate'] !== '') {
            $query->whereDate('created_at', '>=', $filters['fromDate']);
        }

        if ($filters['toDate'] !== '') {
            $query->whereDate('created_at', '<=', $filters['toDate']);
        }

        if ($filters['category'] === 'domestic') {
            $query
                ->whereHas('senderAddress', function (Builder $sender) {
                    $sender->whereRaw('UPPER(country) = ?', ['LK']);
                })
                ->whereHas('recipientAddress', function (Builder $recipient) {
                    $recipient->whereRaw('UPPER(country) = ?', ['LK']);
                });
        }

        if ($filters['category'] === 'logistic') {
            $query->where(function (Builder $nested) {
                $nested
                    ->whereHas('senderAddress', function (Builder $sender) {
                        $sender->whereRaw('UPPER(country) <> ?', ['LK']);
                    })
                    ->orWhereHas('recipientAddress', function (Builder $recipient) {
                        $recipient->whereRaw('UPPER(country) <> ?', ['LK']);
                    });
            });
        }
    }

    private function buildDashboardPayload(Collection $shipments, array $filters): array
    {
        $timelineRows = $shipments
            ->map(function (CourierShipment $shipment) {
                $estimatedDelivery = $this->estimateDeliveryDateTime($shipment);
                $deliveredAt = $this->getDeliveredAt($shipment);

                return [
                    'shipment' => $shipment,
                    'timelineState' => $this->getTimelineState($shipment, $estimatedDelivery, $deliveredAt),
                ];
            });

        $rows = $shipments
            ->map(function (CourierShipment $shipment) {
                $estimatedDelivery = $this->estimateDeliveryDateTime($shipment);
                $deliveredAt = $this->getDeliveredAt($shipment);
                $timeline = $this->getTimelineState($shipment, $estimatedDelivery, $deliveredAt);

                return [
                    'id' => $shipment->id,
                    'bookingNumber' => $shipment->reference,
                    'bookingDate' => optional($shipment->created_at)->format('Y-m-d H:i'),
                    'trackingNumber' => $this->trackingNumber($shipment),
                    'service' => $this->normalizeServiceLabel($shipment->service_level),
                    'status' => $shipment->status,
                    'statusLabel' => $this->statusLabel($shipment->status),
                    'category' => $this->resolveCategory($shipment),
                    'estimatedDelivery' => optional($estimatedDelivery)->format('Y-m-d H:i'),
                    'client' => $shipment->sender?->name,
                    'timelineState' => $timeline,
                    'hasException' => $this->hasException($shipment),
                    'pendingPickup' => $this->isPendingPickup($shipment),
                    'labelCreated' => $this->isLabelCreated($shipment),
                    'deliveredAt' => optional($deliveredAt)->format('Y-m-d H:i'),
                ];
            })
            ->values();

        $pageSize = 12;
        $total = $rows->count();
        $totalPages = max(1, (int) ceil($total / $pageSize));
        $page = min($filters['page'], $totalPages);

        $pagedRows = $rows
            ->slice(($page - 1) * $pageSize, $pageSize)
            ->values();

        $metrics = [
            'delayed' => $rows->where('timelineState', 'delayed')->count(),
            'exceptions' => $rows->where('hasException', true)->count(),
            'labelCreated' => $rows->where('labelCreated', true)->count(),
            'pendingPickups' => $rows->where('pendingPickup', true)->count(),
            'delivered' => $rows->where('status', CourierShipment::STATUS_DELIVERED)->count(),
            'onTime' => $rows->where('timelineState', 'on_time')->count(),
            'early' => $rows->where('timelineState', 'early')->count(),
        ];

        $bookingOverview = $this->buildMonthlyBookingsSeries($shipments, $filters['bookingRange']);
        $earningSummary = $this->buildMonthlyEarningsSeries($shipments, $filters['earningRange']);

        $statusRangeShipments = $this->filterShipmentsByRange($shipments, $filters['statusRange']);
        $statusTimelineRows = $statusRangeShipments
            ->map(function (CourierShipment $shipment) {
                $estimatedDelivery = $this->estimateDeliveryDateTime($shipment);
                $deliveredAt = $this->getDeliveredAt($shipment);

                return [
                    'timelineState' => $this->getTimelineState($shipment, $estimatedDelivery, $deliveredAt),
                ];
            });

        $totalTimeline = max(1, $statusTimelineRows->count());
        $statusBreakdown = [
            [
                'name' => 'On Time',
                'value' => (int) round(($statusTimelineRows->where('timelineState', 'on_time')->count() / $totalTimeline) * 100),
                'color' => '#3DD0FF',
                'change' => 'up',
            ],
            [
                'name' => 'Delayed',
                'value' => (int) round(($statusTimelineRows->where('timelineState', 'delayed')->count() / $totalTimeline) * 100),
                'color' => '#0955AC',
                'change' => 'down',
            ],
            [
                'name' => 'Early',
                'value' => (int) round(($statusTimelineRows->where('timelineState', 'early')->count() / $totalTimeline) * 100),
                'color' => '#C4C4C4',
                'change' => 'up',
            ],
        ];

        return [
            'metrics' => $metrics,
            'rows' => $pagedRows,
            'filters' => array_merge($filters, ['page' => $page]),
            'pagination' => [
                'page' => $page,
                'pageSize' => $pageSize,
                'total' => $total,
                'totalPages' => $totalPages,
            ],
            'filterOptions' => [
                'statuses' => $shipments
                    ->pluck('status')
                    ->filter()
                    ->unique()
                    ->map(fn ($status) => [
                        'value' => $status,
                        'label' => $this->statusLabel($status),
                    ])
                    ->values(),
                'services' => $shipments
                    ->pluck('service_level')
                    ->filter()
                    ->unique()
                    ->sort()
                    ->values(),
                'categories' => [
                    ['value' => 'domestic', 'label' => 'Domestic'],
                    ['value' => 'logistic', 'label' => 'Logistic'],
                ],
            ],
            'charts' => [
                'bookingOverview' => $bookingOverview,
                'earningSummary' => $earningSummary,
                'statusBreakdown' => $statusBreakdown,
            ],
        ];
    }

    private function buildMonthlyBookingsSeries(Collection $shipments, string $range): Collection
    {
        return $this->buildMonthlySeries($shipments, $range, function (Collection $monthlyShipments) {
            return $monthlyShipments->count();
        }, 'bookings');
    }

    private function buildMonthlyEarningsSeries(Collection $shipments, string $range): Collection
    {
        return $this->buildMonthlySeries($shipments, $range, function (Collection $monthlyShipments) {
            return round($monthlyShipments->sum(fn (CourierShipment $shipment) => (float) ($shipment->estimated_cost ?? 0)), 2);
        }, 'value');
    }

    private function buildMonthlySeries(Collection $shipments, string $range, callable $resolver, string $valueKey): Collection
    {
        $months = $this->resolveMonthlyPoints($range);

        return $months->map(function (Carbon $pointDate) use ($shipments, $resolver, $valueKey) {
            $monthShipments = $shipments
                ->filter(fn (CourierShipment $shipment) => optional($shipment->created_at)?->isSameMonth($pointDate));

            return [
                'name' => $pointDate->format('M'),
                $valueKey => $resolver($monthShipments),
            ];
        })->values();
    }

    private function resolveMonthlyPoints(string $range): Collection
    {
        $normalized = strtolower($range);

        if ($normalized === 'last_6_months') {
            return collect(range(5, 0))->map(fn ($monthsAgo) => now()->startOfMonth()->subMonths($monthsAgo));
        }

        if ($normalized === 'this_year') {
            $start = now()->startOfYear();
            $months = collect();

            while ($start->lte(now()->startOfMonth())) {
                $months->push($start->copy());
                $start->addMonth();
            }

            return $months;
        }

        return collect(range(11, 0))->map(fn ($monthsAgo) => now()->startOfMonth()->subMonths($monthsAgo));
    }

    private function filterShipmentsByRange(Collection $shipments, string $range): Collection
    {
        $normalized = strtolower($range);
        $now = now();

        $start = match ($normalized) {
            'this_month' => $now->copy()->startOfMonth(),
            'this_year' => $now->copy()->startOfYear(),
            default => $now->copy()->startOfWeek(),
        };

        return $shipments->filter(function (CourierShipment $shipment) use ($start, $now) {
            if (!$shipment->created_at) {
                return false;
            }

            return $shipment->created_at->between($start, $now);
        })->values();
    }

    private function downloadCsv(Collection $shipments)
    {
        $filename = 'courier-dashboard-report-' . now()->format('Ymd_His') . '.csv';

        return response()->streamDownload(function () use ($shipments) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Booking Number',
                'Booking Date',
                'Tracking Number',
                'Category',
                'Service',
                'Status',
                'Estimated Delivery',
                'Delivered At',
            ]);

            foreach ($shipments as $shipment) {
                $estimatedDelivery = $this->estimateDeliveryDateTime($shipment);
                $deliveredAt = $this->getDeliveredAt($shipment);

                fputcsv($handle, [
                    $shipment->reference,
                    optional($shipment->created_at)->format('Y-m-d H:i'),
                    $this->trackingNumber($shipment),
                    $this->resolveCategory($shipment),
                    $this->normalizeServiceLabel($shipment->service_level),
                    $this->statusLabel($shipment->status),
                    optional($estimatedDelivery)->format('Y-m-d H:i'),
                    optional($deliveredAt)->format('Y-m-d H:i'),
                ]);
            }

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    private function normalizeServiceLabel(?string $service): string
    {
        $value = strtolower((string) $service);

        if (str_contains($value, 'express') || str_contains($value, 'same day')) {
            return 'Express';
        }

        return 'Economy';
    }

    private function trackingNumber(CourierShipment $shipment): string
    {
        return 'TRK-' . str_replace('CR-', '', (string) $shipment->reference);
    }

    private function getLatestTrackingEvent(CourierShipment $shipment)
    {
        return $shipment->trackingEvents
            ->sortByDesc(function ($event) {
                return optional($event->recorded_at)?->timestamp ?? 0;
            })
            ->first();
    }

    private function getShipmentStage(CourierShipment $shipment): string
    {
        $latestEventStatus = strtolower((string) optional($this->getLatestTrackingEvent($shipment))->status);

        if (in_array($latestEventStatus, self::SHIPMENT_STAGE_OPTIONS, true)) {
            return $latestEventStatus;
        }

        if (in_array($latestEventStatus, ['assigned', 'accepted'], true)) {
            return 'new_assignments';
        }

        if ($latestEventStatus === 'picked_up') {
            return 'picked_up';
        }

        if ($latestEventStatus === 'out_for_delivery') {
            return 'out_for_delivery';
        }

        if ($latestEventStatus === 'exception') {
            return 'exception';
        }

        if ($latestEventStatus === 'delivered') {
            return 'delivered';
        }

        return match ($shipment->status) {
            CourierShipment::STATUS_PENDING => 'new_assignments',
            CourierShipment::STATUS_CONFIRMED => 'ready_for_pickup',
            CourierShipment::STATUS_IN_TRANSIT => 'in_transit',
            CourierShipment::STATUS_DELIVERED => 'delivered',
            CourierShipment::STATUS_CANCELLED => 'cancelled',
            default => 'new_assignments',
        };
    }

    private function stageLabel(string $stage): string
    {
        return ucwords(str_replace('_', ' ', $stage));
    }

    private function formatPickupWindow(CourierShipment $shipment): ?string
    {
        if (!$shipment->pickup_date) {
            return null;
        }

        $date = Carbon::parse($shipment->pickup_date)->format('Y-m-d');
        $start = $shipment->pickup_window_start ? Carbon::parse($shipment->pickup_window_start)->format('H:i') : null;
        $end = $shipment->pickup_window_end ? Carbon::parse($shipment->pickup_window_end)->format('H:i') : null;

        if ($start && $end) {
            return $date . ' ' . $start . ' - ' . $end;
        }

        return $date;
    }

    private function statusLabel(?string $status): string
    {
        return match ($status) {
            CourierShipment::STATUS_PENDING => 'Pending',
            CourierShipment::STATUS_CONFIRMED => 'Confirmed',
            CourierShipment::STATUS_IN_TRANSIT => 'In Transit',
            CourierShipment::STATUS_DELIVERED => 'Delivered',
            CourierShipment::STATUS_CANCELLED => 'Cancelled',
            default => ucwords(str_replace('_', ' ', (string) $status)),
        };
    }

    private function resolveCategory(CourierShipment $shipment): string
    {
        if (in_array($shipment->assignment_category, ['domestic', 'logistic'], true)) {
            return ucfirst($shipment->assignment_category);
        }

        $senderCountry = strtoupper((string) optional($shipment->senderAddress)->country);
        $recipientCountry = strtoupper((string) optional($shipment->recipientAddress)->country);

        if ($senderCountry === 'LK' && $recipientCountry === 'LK') {
            return 'Domestic';
        }

        return 'Logistic';
    }

    private function estimateDeliveryDateTime(CourierShipment $shipment): ?Carbon
    {
        if (!$shipment->pickup_date) {
            return null;
        }

        $estimated = Carbon::parse($shipment->pickup_date)->setTime(18, 0, 0);
        $service = strtolower((string) $shipment->service_level);

        if (str_contains($service, 'same day')) {
            return $estimated;
        }

        if (str_contains($service, 'express')) {
            return $estimated->addDay();
        }

        return $estimated->addDays(3);
    }

    private function getDeliveredAt(CourierShipment $shipment): ?Carbon
    {
        $event = $shipment->trackingEvents
            ->filter(fn ($tracking) => strtolower((string) $tracking->status) === 'delivered')
            ->sortByDesc('recorded_at')
            ->first();

        if (!$event || !$event->recorded_at) {
            return null;
        }

        return Carbon::parse($event->recorded_at);
    }

    private function getTimelineState(CourierShipment $shipment, ?Carbon $estimatedDelivery, ?Carbon $deliveredAt): ?string
    {
        if (!$estimatedDelivery) {
            return null;
        }

        if ($deliveredAt) {
            if ($deliveredAt->lt($estimatedDelivery)) {
                return 'early';
            }

            if ($deliveredAt->gt($estimatedDelivery)) {
                return 'delayed';
            }

            return 'on_time';
        }

        if ($shipment->status !== CourierShipment::STATUS_DELIVERED && now()->gt($estimatedDelivery)) {
            return 'delayed';
        }

        return null;
    }

    private function hasException(CourierShipment $shipment): bool
    {
        $exceptionStatuses = ['exception', 'failed', 'returned', 'cancelled'];

        if (in_array(strtolower((string) $shipment->status), $exceptionStatuses, true)) {
            return true;
        }

        return $shipment->trackingEvents
            ->contains(fn ($event) => in_array(strtolower((string) $event->status), $exceptionStatuses, true));
    }

    private function isPendingPickup(CourierShipment $shipment): bool
    {
        $status = strtolower((string) $shipment->status);
        return in_array($status, [CourierShipment::STATUS_PENDING, CourierShipment::STATUS_CONFIRMED], true);
    }

    private function isLabelCreated(CourierShipment $shipment): bool
    {
        $status = strtolower((string) $shipment->status);
        return in_array($status, [CourierShipment::STATUS_PENDING, CourierShipment::STATUS_CONFIRMED, CourierShipment::STATUS_IN_TRANSIT], true);
    }

    private function hasApprovedCourierRegistration(int $vendorId): bool
    {
        if ($vendorId <= 0) {
            return false;
        }

        return VendorServiceRegistration::query()
            ->where('user_id', $vendorId)
            ->where('status', 'approved')
            ->whereHas('serviceCategory', function (Builder $query) {
                $query->where('slug', 'courier-services');
            })
            ->exists();
    }
}
