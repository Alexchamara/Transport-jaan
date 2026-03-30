<?php

namespace App\Http\Controllers\CourierControllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Courier\CourierShipment;
use App\Models\VendorActivityLog;
use Illuminate\Http\Request;

class CourierServiceApiGatewayController extends Controller
{
    public function status(Request $request)
    {
        return response()->json([
            'ok' => true,
            'service' => 'courier_service',
            'scope' => (string) $request->attributes->get('courier_api_scope'),
            'credentialId' => (int) $request->attributes->get('courier_api_credential_id'),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    public function ingestShipmentWebhook(Request $request)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $credentialId = (int) $request->attributes->get('courier_api_credential_id');

        $validated = $request->validate([
            'trackingNumber' => ['required', 'string', 'max:60'],
            'status' => ['required', 'string', 'in:pending,confirmed,in_transit,delivered,cancelled'],
            'eventId' => ['nullable', 'string', 'max:120'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $shipment = CourierShipment::query()
            ->where('reference', (string) $validated['trackingNumber'])
            ->where('assigned_vendor_user_id', $vendorUserId)
            ->first();

        if ($shipment) {
            $shipment->update([
                'status' => (string) $validated['status'],
                'internal_notes' => trim((string) ($validated['notes'] ?? $shipment->internal_notes)),
            ]);
        }

        VendorActivityLog::query()->create([
            'vendor_id' => $vendorUserId,
            'admin_id' => null,
            'action' => 'courier_api_webhook_received',
            'target_type' => 'shipment',
            'target_id' => (int) ($shipment?->id ?? 0) ?: null,
            'description' => 'Courier API webhook event processed via scoped API key.',
            'metadata' => [
                'credential_id' => $credentialId,
                'tracking_number' => (string) $validated['trackingNumber'],
                'status' => (string) $validated['status'],
                'event_id' => (string) ($validated['eventId'] ?? ''),
                'webhook_scope' => (string) $request->attributes->get('courier_webhook_scope', ''),
            ],
        ]);

        return response()->json([
            'ok' => true,
            'updated' => (bool) $shipment,
            'shipmentId' => $shipment ? (int) $shipment->id : null,
        ]);
    }
}
