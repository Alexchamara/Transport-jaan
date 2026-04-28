<?php

namespace App\Services\Courier;

class CourierLabelSchemaRegistry
{
    public const VERSION_V1 = 'v1';

    /**
     * Canonical list of label types enabled for the multi-type studio.
     */
    public function labelTypes(): array
    {
        return [
            ['key' => 'shipping_awb', 'label' => 'Shipping AWB', 'requiresCompliance' => false],
            ['key' => 'pod', 'label' => 'Proof Of Delivery', 'requiresCompliance' => false],
            ['key' => 'pickup', 'label' => 'Pickup Label', 'requiresCompliance' => false],
            ['key' => 'return_rto', 'label' => 'Return / RTO Label', 'requiresCompliance' => false],
            ['key' => 'sortation', 'label' => 'Sortation Label', 'requiresCompliance' => false],
            ['key' => 'manifest_batch', 'label' => 'Manifest / Batch Label', 'requiresCompliance' => false],
            ['key' => 'cod_sticker', 'label' => 'COD Sticker', 'requiresCompliance' => false],
            ['key' => 'customs_cn22', 'label' => 'Customs CN22', 'requiresCompliance' => true],
            ['key' => 'customs_cn23', 'label' => 'Customs CN23', 'requiresCompliance' => true],
            ['key' => 'commercial_invoice_tag', 'label' => 'Commercial Invoice Tag', 'requiresCompliance' => true],
            ['key' => 'special_handling', 'label' => 'Special Handling Label', 'requiresCompliance' => false],
        ];
    }

    public function labelTypeKeys(): array
    {
        return array_map(static fn (array $item) => (string) $item['key'], $this->labelTypes());
    }

    public function isSupportedType(string $labelType): bool
    {
        return in_array(strtolower(trim($labelType)), $this->labelTypeKeys(), true);
    }

    public function isCustomType(string $labelType): bool
    {
        $normalized = strtolower(trim($labelType));
        return $normalized !== '' && (bool) preg_match('/^[a-z0-9_\\-]{2,60}$/', $normalized);
    }

    public function acceptsType(string $labelType): bool
    {
        return $this->isSupportedType($labelType) || $this->isCustomType($labelType);
    }

    public function requiresCompliance(string $labelType): bool
    {
        $needle = strtolower(trim($labelType));
        foreach ($this->labelTypes() as $type) {
            if (strtolower((string) $type['key']) === $needle) {
                return (bool) ($type['requiresCompliance'] ?? false);
            }
        }

        return false;
    }

    public function defaultPresets(): array
    {
        return [
            ['code' => 'half_a4', 'label' => 'Half A4', 'widthMm' => 148.0, 'heightMm' => 210.0, 'paperClass' => 'a4', 'dpiProfile' => '300dpi'],
            ['code' => 'thermal_4x6', 'label' => 'Thermal 4x6', 'widthMm' => 101.6, 'heightMm' => 152.4, 'paperClass' => 'thermal', 'dpiProfile' => '203dpi'],
        ];
    }

    public function defaultLayoutByType(string $labelType): string
    {
        $normalized = strtolower(trim($labelType));
        if (in_array($normalized, ['manifest_batch'], true)) {
            return 'manifest_batch_sheet';
        }

        if (in_array($normalized, ['cod_sticker', 'special_handling'], true)) {
            return 'single_up';
        }

        if (in_array($normalized, ['shipping_awb', 'pod', 'pickup', 'return_rto', 'sortation', 'customs_cn22', 'customs_cn23', 'commercial_invoice_tag'], true)) {
            return 'pod_two_up_continuous';
        }

        return 'single_up';
    }

    /**
     * UI schema for no-code studio builder and backend validation constraints.
     */
    public function schemaForType(string $labelType): array
    {
        $normalized = strtolower(trim($labelType));
        $common = [
            'schemaVersion' => self::VERSION_V1,
            'computedFields' => ['trackingNumber', 'issuedDate', 'barcode', 'qrCode'],
            'optionalBlocks' => ['sender', 'recipient', 'route', 'cod', 'signature', 'invoice'],
            'validation' => [],
        ];

        return match ($normalized) {
            'shipping_awb' => array_merge($common, [
                'requiredFields' => ['trackingNumber', 'sender.name', 'recipient.name', 'recipient.address'],
                'optionalBlocks' => ['sender', 'recipient', 'route', 'cod', 'handling'],
            ]),
            'pod' => array_merge($common, [
                'requiredFields' => ['trackingNumber', 'sender.name', 'recipient.name', 'signature'],
                'optionalBlocks' => ['sender', 'recipient', 'cod', 'signature'],
            ]),
            'pickup' => array_merge($common, [
                'requiredFields' => ['trackingNumber', 'sender.name', 'pickupWindow'],
                'optionalBlocks' => ['sender', 'route'],
            ]),
            'return_rto' => array_merge($common, [
                'requiredFields' => ['trackingNumber', 'returnReason', 'sender.name', 'recipient.name'],
                'optionalBlocks' => ['sender', 'recipient', 'route'],
            ]),
            'sortation' => array_merge($common, [
                'requiredFields' => ['trackingNumber', 'routeCode', 'destinationHub'],
                'optionalBlocks' => ['route', 'handling'],
            ]),
            'manifest_batch' => array_merge($common, [
                'requiredFields' => ['batchNumber', 'routeCode', 'bagCount'],
                'optionalBlocks' => ['route'],
            ]),
            'cod_sticker' => array_merge($common, [
                'requiredFields' => ['trackingNumber', 'codAmount', 'currencyCode'],
                'optionalBlocks' => ['cod'],
            ]),
            'customs_cn22', 'customs_cn23' => array_merge($common, [
                'requiredFields' => ['trackingNumber', 'commodity.description', 'commodity.weightKg', 'commodity.value', 'shipper.identity', 'receiver.identity'],
                'optionalBlocks' => ['customs', 'invoice'],
                'validation' => [
                    'enforceCommodityConsistency' => true,
                    'enforceIdentityCompleteness' => true,
                ],
            ]),
            'commercial_invoice_tag' => array_merge($common, [
                'requiredFields' => ['trackingNumber', 'invoice.number', 'invoice.date', 'invoice.value'],
                'optionalBlocks' => ['invoice', 'customs'],
            ]),
            'special_handling' => array_merge($common, [
                'requiredFields' => ['trackingNumber', 'handlingMarks'],
                'optionalBlocks' => ['handling'],
            ]),
            default => array_merge($common, [
                'requiredFields' => ['trackingNumber'],
            ]),
        };
    }

    public function defaultSchemaForTemplate(string $labelType): array
    {
        $base = [
            'showProofOfDeliveryTitle' => true,
            'showCodAmount' => true,
            'showOrderNumber' => true,
            'showWeight' => true,
            'showDistrict' => true,
            'showNearestCity' => true,
            'showDescription' => true,
            'showBarcode' => true,
            'showQrCode' => true,
            'showSignatureBlock' => true,
        ];

        if (in_array($labelType, ['cod_sticker', 'special_handling'], true)) {
            $base['showSignatureBlock'] = false;
            $base['showDescription'] = false;
        }

        if (in_array($labelType, ['customs_cn22', 'customs_cn23', 'commercial_invoice_tag'], true)) {
            $base['showCodAmount'] = false;
            $base['showSignatureBlock'] = false;
            $base['showDescription'] = true;
        }

        return $base;
    }
}
