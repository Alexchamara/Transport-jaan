<?php

namespace App\Services\Courier;

use App\Models\Courier\CourierLabelExternalSyncLog;
use App\Models\Courier\CourierLabelPrintItem;
use App\Models\Courier\CourierLabelPrintJob;
use App\Models\Courier\CourierShipment;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class CourierLabelComplianceService
{
    public function __construct(private readonly CourierLabelSchemaRegistry $schemaRegistry)
    {
    }

    public function policies(): array
    {
        return [
            'mode' => 'full_integration',
            'blockedTypes' => ['customs_cn22', 'customs_cn23', 'commercial_invoice_tag'],
            'requiredForTypes' => ['customs_cn22', 'customs_cn23', 'commercial_invoice_tag'],
        ];
    }

    public function validate(string $labelType, array $payload, ?CourierShipment $shipment = null): array
    {
        if (!$this->schemaRegistry->requiresCompliance($labelType)) {
            return [
                'state' => 'not_required',
                'ok' => true,
                'errors' => [],
                'warnings' => [],
            ];
        }

        $errors = [];
        $warnings = [];

        $required = $this->schemaRegistry->schemaForType($labelType)['requiredFields'] ?? [];
        foreach ($required as $dotKey) {
            $value = Arr::get($payload, $dotKey);
            if ($value === null || $value === '' || (is_array($value) && count($value) === 0)) {
                $errors[] = [
                    'code' => 'required_field_missing',
                    'field' => $dotKey,
                    'message' => sprintf('Required field missing: %s', $dotKey),
                ];
            }
        }

        $weight = (float) Arr::get($payload, 'commodity.weightKg', Arr::get($payload, 'weightKg', 0));
        $value = (float) Arr::get($payload, 'commodity.value', Arr::get($payload, 'invoice.value', 0));
        if ($weight <= 0) {
            $errors[] = [
                'code' => 'invalid_weight',
                'field' => 'commodity.weightKg',
                'message' => 'Commodity weight must be greater than zero.',
            ];
        }
        if ($value <= 0) {
            $errors[] = [
                'code' => 'invalid_value',
                'field' => 'commodity.value',
                'message' => 'Commodity value must be greater than zero.',
            ];
        }

        $shipperIdentity = trim((string) Arr::get($payload, 'shipper.identity', Arr::get($payload, 'sender.identity', '')));
        $receiverIdentity = trim((string) Arr::get($payload, 'receiver.identity', Arr::get($payload, 'recipient.nic', '')));
        if ($shipperIdentity === '') {
            $errors[] = [
                'code' => 'shipper_identity_missing',
                'field' => 'shipper.identity',
                'message' => 'Shipper identity is required for customs labels.',
            ];
        }
        if ($receiverIdentity === '') {
            $errors[] = [
                'code' => 'receiver_identity_missing',
                'field' => 'receiver.identity',
                'message' => 'Receiver identity is required for customs labels.',
            ];
        }

        if ($shipment && strtoupper((string) optional($shipment->recipientAddress)->country) === 'LK') {
            $warnings[] = [
                'code' => 'domestic_country_for_customs_type',
                'message' => 'Customs label type selected for domestic country code.',
            ];
        }

        return [
            'state' => count($errors) > 0 ? 'invalid' : 'valid',
            'ok' => count($errors) === 0,
            'errors' => $errors,
            'warnings' => $warnings,
        ];
    }

    public function logExternalSync(
        int $vendorId,
        string $labelType,
        array $requestPayload,
        array $responsePayload,
        ?CourierLabelPrintJob $job = null,
        ?CourierLabelPrintItem $item = null
    ): CourierLabelExternalSyncLog {
        return CourierLabelExternalSyncLog::query()->create([
            'vendor_user_id' => $vendorId,
            'print_job_id' => $job?->id,
            'print_item_id' => $item?->id,
            'label_type' => $labelType,
            'provider' => 'customs_gateway_v1',
            'status' => (string) ($responsePayload['status'] ?? 'accepted'),
            'external_reference' => (string) ($responsePayload['reference'] ?? Str::upper(Str::random(12))),
            'request_hash' => hash('sha256', json_encode($this->redactPayload($requestPayload), JSON_UNESCAPED_UNICODE)),
            'response_hash' => hash('sha256', json_encode($this->redactPayload($responsePayload), JSON_UNESCAPED_UNICODE)),
            'meta' => [
                'request' => $this->redactPayload($requestPayload),
                'response' => $this->redactPayload($responsePayload),
            ],
            'synced_at' => now(),
        ]);
    }

    private function redactPayload(array $payload): array
    {
        $redacted = $payload;
        foreach (['recipient.nic', 'receiver.identity', 'shipper.identity', 'invoice.number'] as $dotKey) {
            if (Arr::has($redacted, $dotKey)) {
                Arr::set($redacted, $dotKey, '[REDACTED]');
            }
        }

        return $redacted;
    }
}
