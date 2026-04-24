<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Courier\CourierShipment;
use App\Models\Courier\CourierTrackingEvent;
use App\Models\Courier\SuperAdminCourierActionAudit;
use App\Models\VendorServiceRegistration;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CourierOperationsController extends Controller
{
    private const FORCEABLE_STATUSES = [
        CourierShipment::STATUS_PENDING,
        CourierShipment::STATUS_CONFIRMED,
        CourierShipment::STATUS_IN_TRANSIT,
        CourierShipment::STATUS_DELIVERED,
        CourierShipment::STATUS_CANCELLED,
    ];

    public function index(Request $request)
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', 'string'],
            'assignment' => ['nullable', 'string'],
            'frozen' => ['nullable', 'string', 'in:all,yes,no'],
            'perPage' => ['nullable', 'integer', 'min:10', 'max:50'],
        ]);

        $filters = [
            'q' => trim((string) ($validated['q'] ?? '')),
            'status' => trim((string) ($validated['status'] ?? 'all')),
            'assignment' => trim((string) ($validated['assignment'] ?? 'all')),
            'frozen' => trim((string) ($validated['frozen'] ?? 'all')),
            'perPage' => (int) ($validated['perPage'] ?? 15),
        ];

        if (! in_array($filters['status'], array_merge(['all'], self::FORCEABLE_STATUSES), true)) {
            $filters['status'] = 'all';
        }

        if (! in_array($filters['assignment'], ['all', CourierShipment::ASSIGNMENT_STATUS_ASSIGNED, CourierShipment::ASSIGNMENT_STATUS_UNASSIGNED], true)) {
            $filters['assignment'] = 'all';
        }

        $query = CourierShipment::query()
            ->with([
                'sender:id,name,email,phone',
                'recipient:id,name,email,phone',
                'assignedVendor:id,name,email',
                'senderAddress:id,country',
                'recipientAddress:id,country',
            ])
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        if ($filters['q'] !== '') {
            $search = $filters['q'];
            $query->where(function (Builder $builder) use ($search): void {
                $builder
                    ->where('reference', 'like', '%' . $search . '%')
                    ->orWhereHas('sender', function (Builder $sender) use ($search): void {
                        $sender
                            ->where('name', 'like', '%' . $search . '%')
                            ->orWhere('email', 'like', '%' . $search . '%')
                            ->orWhere('phone', 'like', '%' . $search . '%');
                    })
                    ->orWhereHas('recipient', function (Builder $recipient) use ($search): void {
                        $recipient
                            ->where('name', 'like', '%' . $search . '%')
                            ->orWhere('email', 'like', '%' . $search . '%')
                            ->orWhere('phone', 'like', '%' . $search . '%');
                    });
            });
        }

        if ($filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if ($filters['assignment'] !== 'all') {
            $query->where('assignment_status', $filters['assignment']);
        }

        $paginator = $query->paginate($filters['perPage'])->withQueryString();
        $shipmentIds = collect($paginator->items())
            ->map(static fn (CourierShipment $shipment) => (int) $shipment->id)
            ->all();

        $frozenMap = SuperAdminCourierActionAudit::resolveFrozenMap($shipmentIds);

        if ($filters['frozen'] === 'yes') {
            $allowedIds = array_keys(array_filter($frozenMap, static fn (bool $value) => $value));
            $paginator->setCollection(
                collect($paginator->items())
                    ->filter(static fn (CourierShipment $shipment) => in_array((int) $shipment->id, $allowedIds, true))
                    ->values()
            );
        } elseif ($filters['frozen'] === 'no') {
            $blockedIds = array_keys(array_filter($frozenMap, static fn (bool $value) => $value));
            $paginator->setCollection(
                collect($paginator->items())
                    ->reject(static fn (CourierShipment $shipment) => in_array((int) $shipment->id, $blockedIds, true))
                    ->values()
            );
        }

        $shipments = collect($paginator->items())
            ->map(function (CourierShipment $shipment) use ($frozenMap) {
                $shipmentId = (int) $shipment->id;

                return [
                    'id' => $shipmentId,
                    'reference' => (string) $shipment->reference,
                    'status' => (string) ($shipment->status ?? ''),
                    'assignmentStatus' => (string) ($shipment->assignment_status ?? ''),
                    'assignmentCategory' => (string) ($shipment->assignment_category ?? ''),
                    'isFrozen' => (bool) ($frozenMap[$shipmentId] ?? false),
                    'requestedByUserId' => (int) ($shipment->requested_by_user_id ?? 0),
                    'assignedVendorUserId' => $shipment->assigned_vendor_user_id ? (int) $shipment->assigned_vendor_user_id : null,
                    'assignedVendorRegistrationId' => $shipment->assigned_vendor_registration_id ? (int) $shipment->assigned_vendor_registration_id : null,
                    'assignedVendor' => $shipment->assignedVendor ? [
                        'id' => (int) $shipment->assignedVendor->id,
                        'name' => (string) ($shipment->assignedVendor->name ?? ''),
                        'email' => (string) ($shipment->assignedVendor->email ?? ''),
                    ] : null,
                    'sender' => $shipment->sender ? [
                        'name' => (string) ($shipment->sender->name ?? ''),
                        'email' => (string) ($shipment->sender->email ?? ''),
                        'phone' => (string) ($shipment->sender->phone ?? ''),
                    ] : null,
                    'recipient' => $shipment->recipient ? [
                        'name' => (string) ($shipment->recipient->name ?? ''),
                        'email' => (string) ($shipment->recipient->email ?? ''),
                        'phone' => (string) ($shipment->recipient->phone ?? ''),
                    ] : null,
                    'createdAt' => optional($shipment->created_at)->format('Y-m-d H:i:s'),
                ];
            })
            ->values();

        $paginator->setCollection($shipments);

        $statsQuery = CourierShipment::query();

        $stats = [
            'total' => (clone $statsQuery)->count(),
            'pending' => (clone $statsQuery)->where('status', CourierShipment::STATUS_PENDING)->count(),
            'inTransit' => (clone $statsQuery)->where('status', CourierShipment::STATUS_IN_TRANSIT)->count(),
            'delivered' => (clone $statsQuery)->where('status', CourierShipment::STATUS_DELIVERED)->count(),
            'cancelled' => (clone $statsQuery)->where('status', CourierShipment::STATUS_CANCELLED)->count(),
        ];

        return Inertia::render('Web/home/SuperAdmin/CourierOperations', [
            'shipments' => $paginator,
            'stats' => $stats,
            'filters' => $filters,
            'statusOptions' => self::FORCEABLE_STATUSES,
            'vendorOptions' => $this->resolveEligibleVendors(),
        ]);
    }

    public function reassign(Request $request, CourierShipment $shipment)
    {
        $validated = $request->validate([
            'vendorUserId' => ['required', 'integer', 'exists:users,id'],
            'reason' => ['required', 'string', 'min:10', 'max:1500'],
        ]);

        $vendorUserId = (int) $validated['vendorUserId'];
        if ((int) $shipment->assigned_vendor_user_id === $vendorUserId) {
            return back()->with('error', 'Shipment is already assigned to the selected vendor.');
        }

        $registration = $this->resolveEligibleRegistration($shipment, $vendorUserId);
        if (! $registration) {
            return back()->with('error', 'Selected vendor is not approved for this shipment category.');
        }

        $actorId = (int) optional($request->user())->id ?: null;
        $reason = trim((string) $validated['reason']);
        $previousVendorUserId = $shipment->assigned_vendor_user_id ? (int) $shipment->assigned_vendor_user_id : null;
        $previousRegistrationId = $shipment->assigned_vendor_registration_id ? (int) $shipment->assigned_vendor_registration_id : null;

        DB::transaction(function () use ($shipment, $registration, $vendorUserId, $actorId, $reason, $previousVendorUserId, $previousRegistrationId): void {
            $shipment->fill([
                'assigned_vendor_user_id' => $vendorUserId,
                'assigned_vendor_registration_id' => (int) $registration->id,
                'assignment_status' => CourierShipment::ASSIGNMENT_STATUS_ASSIGNED,
                'assigned_at' => now(),
            ]);
            $shipment->save();

            CourierTrackingEvent::query()->create([
                'shipment_id' => $shipment->id,
                'status' => 'superadmin_reassigned',
                'recorded_at' => now(),
                'description' => 'SuperAdmin reassigned shipment. Reason: ' . $reason,
                'meta' => [
                    'actor_user_id' => $actorId,
                    'previous_vendor_user_id' => $previousVendorUserId,
                    'new_vendor_user_id' => $vendorUserId,
                    'previous_registration_id' => $previousRegistrationId,
                    'new_registration_id' => (int) $registration->id,
                ],
            ]);

            SuperAdminCourierActionAudit::recordEvent(
                $shipment,
                SuperAdminCourierActionAudit::ACTION_REASSIGNED,
                (string) $shipment->status,
                (string) $shipment->status,
                $actorId,
                $reason,
                [
                    'previous_vendor_user_id' => $previousVendorUserId,
                    'new_vendor_user_id' => $vendorUserId,
                    'previous_registration_id' => $previousRegistrationId,
                    'new_registration_id' => (int) $registration->id,
                ]
            );
        });

        return back()->with('success', 'Shipment reassigned successfully.');
    }

    public function forceTransition(Request $request, CourierShipment $shipment)
    {
        $validated = $request->validate([
            'targetStatus' => ['required', 'string', 'in:' . implode(',', self::FORCEABLE_STATUSES)],
            'reason' => ['required', 'string', 'min:10', 'max:1500'],
        ]);

        $targetStatus = (string) $validated['targetStatus'];
        $reason = trim((string) $validated['reason']);
        $fromStatus = (string) ($shipment->status ?? CourierShipment::STATUS_PENDING);
        $actorId = (int) optional($request->user())->id ?: null;

        if ($targetStatus === $fromStatus) {
            return back()->with('error', 'Shipment is already in the selected status.');
        }

        DB::transaction(function () use ($shipment, $targetStatus, $reason, $fromStatus, $actorId): void {
            $shipment->status = $targetStatus;
            $shipment->save();

            CourierTrackingEvent::query()->create([
                'shipment_id' => $shipment->id,
                'status' => 'superadmin_forced_transition',
                'recorded_at' => now(),
                'description' => sprintf(
                    'SuperAdmin forced status transition from %s to %s. Reason: %s',
                    $fromStatus,
                    $targetStatus,
                    $reason
                ),
                'meta' => [
                    'actor_user_id' => $actorId,
                    'from_status' => $fromStatus,
                    'to_status' => $targetStatus,
                ],
            ]);

            SuperAdminCourierActionAudit::recordEvent(
                $shipment,
                SuperAdminCourierActionAudit::ACTION_FORCE_TRANSITION,
                $fromStatus,
                $targetStatus,
                $actorId,
                $reason,
                [
                    'from_status' => $fromStatus,
                    'to_status' => $targetStatus,
                ]
            );
        });

        return back()->with('success', 'Shipment status transitioned successfully.');
    }

    public function freeze(Request $request, CourierShipment $shipment)
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'min:10', 'max:1500'],
        ]);

        if ($shipment->isOperationsFrozen()) {
            return back()->with('error', 'Shipment operations are already frozen.');
        }

        $reason = trim((string) $validated['reason']);
        $actorId = (int) optional($request->user())->id ?: null;
        $currentStatus = (string) ($shipment->status ?? CourierShipment::STATUS_PENDING);

        DB::transaction(function () use ($shipment, $reason, $actorId, $currentStatus): void {
            CourierTrackingEvent::query()->create([
                'shipment_id' => $shipment->id,
                'status' => 'superadmin_operations_frozen',
                'recorded_at' => now(),
                'description' => 'SuperAdmin froze shipment operations. Reason: ' . $reason,
                'meta' => [
                    'actor_user_id' => $actorId,
                ],
            ]);

            SuperAdminCourierActionAudit::recordEvent(
                $shipment,
                SuperAdminCourierActionAudit::ACTION_OPERATIONS_FROZEN,
                $currentStatus,
                $currentStatus,
                $actorId,
                $reason,
                []
            );
        });

        return back()->with('success', 'Shipment operations frozen.');
    }

    public function unfreeze(Request $request, CourierShipment $shipment)
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'min:10', 'max:1500'],
        ]);

        if (! $shipment->isOperationsFrozen()) {
            return back()->with('error', 'Shipment operations are not currently frozen.');
        }

        $reason = trim((string) $validated['reason']);
        $actorId = (int) optional($request->user())->id ?: null;
        $currentStatus = (string) ($shipment->status ?? CourierShipment::STATUS_PENDING);

        DB::transaction(function () use ($shipment, $reason, $actorId, $currentStatus): void {
            CourierTrackingEvent::query()->create([
                'shipment_id' => $shipment->id,
                'status' => 'superadmin_operations_unfrozen',
                'recorded_at' => now(),
                'description' => 'SuperAdmin unfroze shipment operations. Reason: ' . $reason,
                'meta' => [
                    'actor_user_id' => $actorId,
                ],
            ]);

            SuperAdminCourierActionAudit::recordEvent(
                $shipment,
                SuperAdminCourierActionAudit::ACTION_OPERATIONS_UNFROZEN,
                $currentStatus,
                $currentStatus,
                $actorId,
                $reason,
                []
            );
        });

        return back()->with('success', 'Shipment operations unfrozen.');
    }

    public function cancelOverride(Request $request, CourierShipment $shipment)
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'min:10', 'max:1500'],
        ]);

        $fromStatus = (string) ($shipment->status ?? CourierShipment::STATUS_PENDING);
        if ($fromStatus === CourierShipment::STATUS_CANCELLED) {
            return back()->with('error', 'Shipment is already cancelled.');
        }

        $reason = trim((string) $validated['reason']);
        $actorId = (int) optional($request->user())->id ?: null;

        DB::transaction(function () use ($shipment, $fromStatus, $reason, $actorId): void {
            $shipment->status = CourierShipment::STATUS_CANCELLED;
            $shipment->save();

            CourierTrackingEvent::query()->create([
                'shipment_id' => $shipment->id,
                'status' => 'superadmin_cancel_override',
                'recorded_at' => now(),
                'description' => 'SuperAdmin cancelled the shipment via override. Reason: ' . $reason,
                'meta' => [
                    'actor_user_id' => $actorId,
                    'from_status' => $fromStatus,
                    'to_status' => CourierShipment::STATUS_CANCELLED,
                ],
            ]);

            SuperAdminCourierActionAudit::recordEvent(
                $shipment,
                SuperAdminCourierActionAudit::ACTION_CANCEL_OVERRIDE,
                $fromStatus,
                CourierShipment::STATUS_CANCELLED,
                $actorId,
                $reason,
                [
                    'from_status' => $fromStatus,
                    'to_status' => CourierShipment::STATUS_CANCELLED,
                ]
            );
        });

        return back()->with('success', 'Shipment cancelled via superadmin override.');
    }

    public function auditHistory(CourierShipment $shipment)
    {
        $events = SuperAdminCourierActionAudit::query()
            ->with('actor:id,name,email')
            ->where('shipment_id', $shipment->id)
            ->orderByDesc('id')
            ->limit(100)
            ->get()
            ->map(function (SuperAdminCourierActionAudit $audit) {
                return [
                    'id' => (int) $audit->id,
                    'actionType' => (string) $audit->action_type,
                    'fromStatus' => $audit->from_status,
                    'toStatus' => $audit->to_status,
                    'reason' => (string) $audit->reason,
                    'metadata' => $audit->metadata ?? [],
                    'previousHash' => (string) ($audit->previous_hash ?? ''),
                    'recordHash' => (string) $audit->record_hash,
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
            'shipmentId' => (int) $shipment->id,
            'events' => $events,
        ]);
    }

    private function resolveEligibleRegistration(CourierShipment $shipment, int $vendorUserId): ?VendorServiceRegistration
    {
        $assignmentCategory = (string) ($shipment->assignment_category ?? '');
        if (! in_array($assignmentCategory, ['domestic', 'international'], true)) {
            $assignmentCategory = $this->inferAssignmentCategoryFromAddresses($shipment);
        }

        return VendorServiceRegistration::query()
            ->with(['serviceCategory:id,slug', 'serviceSubCategory:id,slug'])
            ->where('user_id', $vendorUserId)
            ->where('status', 'approved')
            ->whereHas('serviceCategory', function (Builder $builder): void {
                $builder->where('slug', 'courier-services');
            })
            ->when($assignmentCategory !== '', function (Builder $builder) use ($assignmentCategory): void {
                $builder->whereHas('serviceSubCategory', function (Builder $subCategory) use ($assignmentCategory): void {
                    $subCategory->where('slug', $assignmentCategory);
                });
            })
            ->orderByDesc('id')
            ->first();
    }

    private function resolveEligibleVendors(): array
    {
        return VendorServiceRegistration::query()
            ->with(['user:id,name,email', 'serviceCategory:id,slug', 'serviceSubCategory:id,slug'])
            ->where('status', 'approved')
            ->whereHas('serviceCategory', function (Builder $builder): void {
                $builder->where('slug', 'courier-services');
            })
            ->orderByDesc('id')
            ->limit(500)
            ->get()
            ->map(function (VendorServiceRegistration $registration) {
                return [
                    'registrationId' => (int) $registration->id,
                    'vendorUserId' => (int) $registration->user_id,
                    'vendorName' => (string) ($registration->user->name ?? ''),
                    'vendorEmail' => (string) ($registration->user->email ?? ''),
                    'category' => (string) ($registration->serviceSubCategory->slug ?? ''),
                ];
            })
            ->filter(static fn (array $row) => ($row['vendorUserId'] ?? 0) > 0)
            ->values()
            ->all();
    }

    private function inferAssignmentCategoryFromAddresses(CourierShipment $shipment): string
    {
        $shipment->loadMissing(['senderAddress:id,country', 'recipientAddress:id,country']);

        $senderCountry = strtoupper((string) ($shipment->senderAddress->country ?? 'LK'));
        $recipientCountry = strtoupper((string) ($shipment->recipientAddress->country ?? 'LK'));

        return $senderCountry === 'LK' && $recipientCountry === 'LK' ? 'domestic' : 'international';
    }
}
