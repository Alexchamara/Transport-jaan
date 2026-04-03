<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Courier\CourierCodSettlementSetting;
use App\Models\Courier\CourierVendorCodCapability;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourierCodSettingsController extends Controller
{
    public function index(Request $request)
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string', 'in:all,pending,approved,rejected,not_requested'],
            'search' => ['nullable', 'string', 'max:120'],
        ]);

        $statusFilter = (string) ($validated['status'] ?? 'all');
        $search = trim((string) ($validated['search'] ?? ''));

        $settings = CourierCodSettlementSetting::query()->firstOrCreate(
            ['id' => 1],
            CourierCodSettlementSetting::defaults()
        );

        $query = CourierVendorCodCapability::query()
            ->with(['vendor:id,name,email,status', 'requester:id,name', 'reviewer:id,name'])
            ->orderByRaw("case when status = 'pending' then 0 when status = 'rejected' then 1 when status = 'approved' then 2 else 3 end")
            ->orderByDesc('requested_at')
            ->orderByDesc('id');

        if ($statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        if ($search !== '') {
            $query->whereHas('vendor', function (Builder $builder) use ($search) {
                $builder
                    ->where('name', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%');
            });
        }

        $paginator = $query->paginate(20)->withQueryString();

        $requests = collect($paginator->items())
            ->map(function (CourierVendorCodCapability $capability) {
                return [
                    'id' => (int) $capability->id,
                    'status' => (string) $capability->status,
                    'statusLabel' => $capability->statusLabel(),
                    'vendorId' => (int) ($capability->vendor_user_id ?? 0),
                    'vendorName' => (string) ($capability->vendor->name ?? ''),
                    'vendorEmail' => (string) ($capability->vendor->email ?? ''),
                    'requestedAt' => optional($capability->requested_at)->format('Y-m-d H:i:s'),
                    'requestedBy' => (string) ($capability->requester->name ?? ''),
                    'requestedNote' => (string) ($capability->requested_note ?? ''),
                    'reviewedAt' => optional($capability->reviewed_at)->format('Y-m-d H:i:s'),
                    'reviewedBy' => (string) ($capability->reviewer->name ?? ''),
                    'approvedAt' => optional($capability->approved_at)->format('Y-m-d H:i:s'),
                    'decisionReason' => (string) ($capability->decision_reason ?? ''),
                ];
            })
            ->values();

        $stats = [
            'total' => CourierVendorCodCapability::query()->count(),
            'pending' => CourierVendorCodCapability::query()->where('status', CourierVendorCodCapability::STATUS_PENDING)->count(),
            'approved' => CourierVendorCodCapability::query()->where('status', CourierVendorCodCapability::STATUS_APPROVED)->count(),
            'rejected' => CourierVendorCodCapability::query()->where('status', CourierVendorCodCapability::STATUS_REJECTED)->count(),
        ];

        return Inertia::render('Web/home/SuperAdmin/CourierCodSettings', [
            'settings' => [
                'is_cod_enabled' => (bool) $settings->is_cod_enabled,
                'settlement_cycle_days' => (int) $settings->settlement_cycle_days,
                'holding_days' => (int) $settings->holding_days,
                'reserve_percentage' => (float) $settings->reserve_percentage,
                'minimum_payout_amount' => (float) $settings->minimum_payout_amount,
                'currency_code' => (string) $settings->currency_code,
                'notes' => (string) ($settings->notes ?? ''),
            ],
            'requests' => $requests,
            'filters' => [
                'status' => $statusFilter,
                'search' => $search,
            ],
            'pagination' => [
                'currentPage' => $paginator->currentPage(),
                'lastPage' => $paginator->lastPage(),
                'perPage' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
            'stats' => $stats,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'is_cod_enabled' => ['required', 'boolean'],
            'settlement_cycle_days' => ['required', 'integer', 'min:1', 'max:31'],
            'holding_days' => ['required', 'integer', 'min:0', 'max:31'],
            'reserve_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'minimum_payout_amount' => ['required', 'numeric', 'min:0'],
            'currency_code' => ['required', 'string', 'size:3'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $settings = CourierCodSettlementSetting::query()->firstOrCreate(
            ['id' => 1],
            CourierCodSettlementSetting::defaults()
        );

        $settings->fill([
            'is_cod_enabled' => (bool) $validated['is_cod_enabled'],
            'settlement_cycle_days' => (int) $validated['settlement_cycle_days'],
            'holding_days' => (int) $validated['holding_days'],
            'reserve_percentage' => (float) $validated['reserve_percentage'],
            'minimum_payout_amount' => (float) $validated['minimum_payout_amount'],
            'currency_code' => strtoupper((string) $validated['currency_code']),
            'notes' => isset($validated['notes']) ? trim((string) $validated['notes']) : null,
            'updated_by_user_id' => (int) optional($request->user())->id ?: null,
        ]);
        $settings->save();

        return back()->with('success', 'COD settlement settings updated successfully.');
    }

    public function approveCapability(Request $request, CourierVendorCodCapability $capability)
    {
        $validated = $request->validate([
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        $note = trim((string) ($validated['note'] ?? ''));

        $capability->fill([
            'status' => CourierVendorCodCapability::STATUS_APPROVED,
            'reviewed_at' => now(),
            'reviewed_by_user_id' => (int) optional($request->user())->id ?: null,
            'approved_at' => now(),
            'decision_reason' => $note !== '' ? $note : null,
        ]);

        $capability->save();

        return back()->with('success', 'COD capability approved successfully.');
    }

    public function rejectCapability(Request $request, CourierVendorCodCapability $capability)
    {
        $validated = $request->validate([
            'note' => ['required', 'string', 'max:500'],
        ]);

        $note = trim((string) ($validated['note'] ?? ''));

        $capability->fill([
            'status' => CourierVendorCodCapability::STATUS_REJECTED,
            'reviewed_at' => now(),
            'reviewed_by_user_id' => (int) optional($request->user())->id ?: null,
            'approved_at' => null,
            'decision_reason' => $note,
        ]);

        $capability->save();

        return back()->with('success', 'COD capability request rejected.');
    }
}
