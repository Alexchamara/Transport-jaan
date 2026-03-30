<?php

namespace App\Services\Courier;

use App\Models\Courier\CourierShipment;
use App\Models\VendorServiceRegistration;

class CourierVendorAssignmentService
{
    public function determineAssignment(CourierShipment $shipment): array
    {
        $shipment->loadMissing(['senderAddress', 'recipientAddress']);

        $category = $this->resolveCategory($shipment);
        $allowedSubCategorySlugs = $category === 'domestic' ? ['domestic'] : ['logistic'];

        $eligibleRegistrations = VendorServiceRegistration::query()
            ->where('status', 'approved')
            ->whereHas('serviceCategory', function ($query) {
                $query->where('slug', 'courier-services');
            })
            ->whereHas('serviceSubCategory', function ($query) use ($allowedSubCategorySlugs) {
                $query->whereIn('slug', $allowedSubCategorySlugs);
            })
            ->get(['id', 'user_id']);

        if ($eligibleRegistrations->isEmpty()) {
            return [
                'assignment_category' => $category,
                'assignment_status' => 'unassigned',
                'assigned_vendor_user_id' => null,
                'assigned_vendor_registration_id' => null,
                'assigned_at' => null,
            ];
        }

        $vendorIds = $eligibleRegistrations->pluck('user_id')->unique()->values();

        $activeWorkloadByVendor = CourierShipment::query()
            ->selectRaw('assigned_vendor_user_id, COUNT(*) as active_count')
            ->whereIn('assigned_vendor_user_id', $vendorIds)
            ->whereNotIn('status', [CourierShipment::STATUS_DELIVERED, CourierShipment::STATUS_CANCELLED])
            ->groupBy('assigned_vendor_user_id')
            ->pluck('active_count', 'assigned_vendor_user_id');

        $targetVendorId = $vendorIds
            ->sortBy(fn ($vendorId) => [
                (int) ($activeWorkloadByVendor[$vendorId] ?? 0),
                (int) $vendorId,
            ])
            ->first();

        $targetRegistration = $eligibleRegistrations
            ->firstWhere('user_id', $targetVendorId);

        return [
            'assignment_category' => $category,
            'assignment_status' => 'assigned',
            'assigned_vendor_user_id' => $targetVendorId,
            'assigned_vendor_registration_id' => $targetRegistration?->id,
            'assigned_at' => now(),
        ];
    }

    public function assignShipment(CourierShipment $shipment): void
    {
        $assignment = $this->determineAssignment($shipment);

        $assignmentChanged =
            (int) $shipment->assigned_vendor_user_id !== (int) ($assignment['assigned_vendor_user_id'] ?? 0)
            || (int) $shipment->assigned_vendor_registration_id !== (int) ($assignment['assigned_vendor_registration_id'] ?? 0)
            || (string) $shipment->assignment_status !== (string) $assignment['assignment_status'];

        $shipment->update($assignment);

        if ($assignmentChanged && $assignment['assignment_status'] === 'assigned') {
            $shipment->trackingEvents()->create([
                'status' => 'assigned',
                'description' => 'Shipment assigned to courier vendor for ' . ucfirst((string) $assignment['assignment_category']) . ' workflow',
                'recorded_at' => now(),
            ]);
        }
    }

    private function resolveCategory(CourierShipment $shipment): string
    {
        $senderCountry = strtoupper((string) optional($shipment->senderAddress)->country);
        $recipientCountry = strtoupper((string) optional($shipment->recipientAddress)->country);

        if ($senderCountry === 'LK' && $recipientCountry === 'LK') {
            return 'domestic';
        }

        return 'logistic';
    }
}
