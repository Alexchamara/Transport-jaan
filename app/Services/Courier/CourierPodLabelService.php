<?php

namespace App\Services\Courier;

use App\Models\Courier\CourierLabelPrintJob;
use App\Models\Courier\CourierLabelSize;
use App\Models\Courier\CourierLabelTemplate;
use App\Models\Courier\CourierPackage;
use App\Models\Courier\CourierShipment;
use App\Models\Courier\VendorCourierSetting;
use App\Models\VendorProfile;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class CourierPodLabelService
{
    public const LAYOUT_POD_TWO_UP_CONTINUOUS = 'pod_two_up_continuous';

    public const OUTPUT_FORMAT_PDF = 'pdf';

    public const MODE_SYNC = 'sync';

    public const MODE_ASYNC = 'async';

    public const CATEGORY_DOMESTIC = 'domestic';

    public const CATEGORY_INTERNATIONAL = 'international';

    public function defaultPolicy(): array
    {
        return [
            'syncThreshold' => 25,
            'hardLimit' => 500,
        ];
    }

    public function defaultTemplateSchema(): array
    {
        return [
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
    }

    public function defaultTemplateSchemaForType(string $labelType): array
    {
        $registry = app(CourierLabelSchemaRegistry::class);
        return $registry->defaultSchemaForTemplate($labelType);
    }

    public function makeFallbackSize(): CourierLabelSize
    {
        $size = new CourierLabelSize();
        $size->name = '4x6';
        $size->width_mm = 101.6;
        $size->height_mm = 152.4;
        $size->is_active = true;
        $size->is_system = true;

        return $size;
    }

    public function resolveCategory(CourierShipment $shipment): string
    {
        $senderCountry = strtoupper((string) optional($shipment->senderAddress)->country);
        $recipientCountry = strtoupper((string) optional($shipment->recipientAddress)->country);

        if ($senderCountry === 'LK' && $recipientCountry === 'LK') {
            return self::CATEGORY_DOMESTIC;
        }

        return self::CATEGORY_INTERNATIONAL;
    }

    public function buildPayload(CourierShipment $shipment, CourierPackage $package, int $vendorId, string $labelType = 'pod'): array
    {
        $trackingNumber = $this->trackingNumber($shipment);
        $declaredValue = (float) ($shipment->declared_value ?? 0);
        $currency = (string) ($shipment->currency_code ?? 'LKR');
        $weight = $package->weight_kg !== null ? (float) $package->weight_kg : 0.0;

        return [
            'labelType' => $labelType,
            'reference' => (string) ($shipment->reference ?? ''),
            'trackingNumber' => $trackingNumber,
            'orderNumber' => (string) ($shipment->order_number ?? ''),
            'serviceLevel' => (string) ($shipment->service_level ?? ''),
            'category' => $this->resolveCategory($shipment),
            'issuedDate' => now()->format('Y-m-d'),
            'codAmount' => $shipment->is_cod_enabled ? (float) ($shipment->cod_requested_amount ?? 0) : null,
            'currencyCode' => $currency,
            'weightKg' => $package->weight_kg !== null ? (float) $package->weight_kg : null,
            'district' => (string) ($shipment->destination_district ?? ''),
            'nearestCity' => (string) ($shipment->destination_nearest_city ?? optional($shipment->recipientAddress)->city ?? ''),
            'description' => (string) ($package->description ?? ''),
            'sender' => [
                'name' => (string) ($shipment->sender?->name ?? ''),
                'phone' => (string) ($shipment->sender?->phone ?? ''),
                'address' => trim(implode(', ', array_filter([
                    $shipment->senderAddress?->line1,
                    $shipment->senderAddress?->line2,
                    $shipment->senderAddress?->city,
                    $shipment->senderAddress?->state,
                    $shipment->senderAddress?->postal_code,
                ]))),
            ],
            'recipient' => [
                'name' => (string) ($shipment->recipient?->name ?? ''),
                'phonePrimary' => (string) ($shipment->recipient?->phone ?? ''),
                'phoneSecondary' => (string) ($shipment->recipient_alt_phone ?? ''),
                'address' => trim(implode(', ', array_filter([
                    $shipment->recipientAddress?->line1,
                    $shipment->recipientAddress?->line2,
                    $shipment->recipientAddress?->city,
                    $shipment->recipientAddress?->state,
                    $shipment->recipientAddress?->postal_code,
                ]))),
                'nic' => (string) ($shipment->recipient_nic ?? ''),
            ],
            'pod' => [
                'receiverName' => (string) ($shipment->pod_receiver_name ?? ''),
                'receiverNic' => (string) ($shipment->pod_receiver_nic ?? ''),
                'date' => '',
                'signature' => '',
            ],
            'routeCode' => (string) ($shipment->service_level ?? ''),
            'destinationHub' => (string) ($shipment->destination_nearest_city ?? ''),
            'batchNumber' => (string) ($shipment->reference ?? ''),
            'bagCount' => max(1, (int) ($package->quantity ?? 1)),
            'pickupWindow' => trim(implode(' - ', array_filter([
                optional($shipment->pickup_window_start)->format('H:i'),
                optional($shipment->pickup_window_end)->format('H:i'),
            ]))),
            'returnReason' => (string) ($shipment->delivery_notes ?? ''),
            'handlingMarks' => (string) ($shipment->internal_notes ?? ''),
            'invoice' => [
                'number' => (string) ($shipment->order_number ?? ''),
                'date' => now()->format('Y-m-d'),
                'value' => $declaredValue > 0 ? $declaredValue : (float) ($shipment->estimated_cost ?? 0),
            ],
            'commodity' => [
                'description' => (string) ($package->description ?? ''),
                'weightKg' => $weight,
                'value' => $declaredValue > 0 ? $declaredValue : (float) ($shipment->estimated_cost ?? 0),
            ],
            'shipper' => [
                'identity' => (string) (optional($shipment->sender)->nic ?? optional($shipment->sender)->national_id ?? ''),
            ],
            'receiver' => [
                'identity' => (string) ($shipment->recipient_nic ?? ''),
            ],
            'brand' => $this->resolveBranding($vendorId),
            'qrCode' => $this->generateQrCode($trackingNumber),
            'code128Svg' => $this->generateCode128Svg($trackingNumber),
        ];
    }

    public function renderLabelHtml(array $payload, CourierLabelTemplate $template, ?CourierLabelSize $size = null): string
    {
        $schema = array_replace($this->defaultTemplateSchema(), is_array($template->schema) ? $template->schema : []);
        $effectiveSize = $size ?: ($template->size ?: $this->makeFallbackSize());
        $layout = $this->buildTwoUpLayout($effectiveSize);

        return View::make('courier.labels.pod_two_up', [
            'payload' => $payload,
            'schema' => $schema,
            'template' => $template,
            'layout' => $layout,
        ])->render();
    }

    public function renderLabelsPdf(array $pagesHtml, CourierLabelSize $size, string $orientation = 'portrait'): string
    {
        $pages = array_map(static fn (string $html) => '<div class="label-page">' . $html . '</div>', $pagesHtml);

        $fullHtml = '<html><head><style>'
            . '@page { margin: 0; }'
            . 'body { margin: 0; padding: 0; }'
            . '.label-page { page-break-after: always; }'
            . '.label-page:last-child { page-break-after: auto; }'
            . '</style></head><body>'
            . implode('', $pages)
            . '</body></html>';

        $pdf = Pdf::loadHTML($fullHtml);
        $paper = $this->buildPaper($size, $orientation);
        $pdf->setPaper($paper['size'], $paper['orientation']);

        return $pdf->output();
    }

    public function storePdf(string $pdfBinary, int $vendorId, string $prefix = 'pod_labels'): array
    {
        $directory = 'courier/pod-labels/' . $vendorId . '/' . now()->format('Y/m/d');
        $fileName = $prefix . '_' . Str::uuid()->toString() . '.pdf';
        $path = $directory . '/' . $fileName;

        Storage::disk('public')->put($path, $pdfBinary);

        return [
            'disk' => 'public',
            'path' => $path,
            'name' => $fileName,
            'url' => '/storage/' . ltrim($path, '/'),
            'checksum' => hash('sha256', $pdfBinary),
        ];
    }

    public function markJobGenerated(CourierLabelPrintJob $job, array $stored, int $totalItems, int $failedItems = 0): void
    {
        $job->update([
            'status' => $failedItems > 0 ? 'generated_with_errors' : 'generated',
            'generated_items' => max(0, $totalItems - $failedItems),
            'failed_items' => $failedItems,
            'file_disk' => (string) ($stored['disk'] ?? 'public'),
            'file_path' => (string) ($stored['path'] ?? ''),
            'file_name' => (string) ($stored['name'] ?? ''),
            'checksum' => (string) ($stored['checksum'] ?? ''),
            'generated_at' => now(),
            'printed_at' => now(),
        ]);
    }

    public function buildJobArtifactUrl(CourierLabelPrintJob $job): ?string
    {
        if (!$job->file_path) {
            return null;
        }

        return '/storage/' . ltrim((string) $job->file_path, '/');
    }

    private function resolveBranding(int $vendorId): array
    {
        $profile = VendorProfile::query()->where('user_id', $vendorId)->first();
        $setting = VendorCourierSetting::query()->where('vendor_user_id', $vendorId)->first();
        $settings = is_array($setting?->settings) ? $setting->settings : [];
        $profileSettings = is_array($settings['profile'] ?? null) ? $settings['profile'] : [];

        $line = trim(implode(' / ', array_filter([
            (string) ($profileSettings['supportHotline'] ?? ''),
            (string) ($profileSettings['supportEmail'] ?? ''),
            (string) ($profile?->website ?? ''),
        ])));

        $name = $this->normalizeLabelText((string) ($profileSettings['displayName'] ?? $profile?->company_name ?? 'Courier Service'), 52);
        if ($name === '') {
            $name = 'Courier Service';
        }

        $address = $this->normalizeLabelText(trim(implode(', ', array_filter([
            $profile?->address_line1,
            $profile?->address_line2,
            $profile?->city,
            $profile?->state,
            $profile?->postal_code,
        ]))), 120);

        $contactLine = $this->normalizeLabelText($line, 100);

        return [
            'name' => $name,
            'address' => $address,
            'contactLine' => $contactLine,
            'logoUrl' => $profile?->logo ? '/storage/' . ltrim((string) $profile->logo, '/') : null,
        ];
    }

    private function trackingNumber(CourierShipment $shipment): string
    {
        return 'TRK-' . str_replace('CR-', '', (string) $shipment->reference);
    }

    private function generateQrCode(string $data): string
    {
        try {
            $qrCode = QrCode::format('png')->size(180)->errorCorrection('H')->generate($data);
            return 'data:image/png;base64,' . base64_encode($qrCode);
        } catch (\Throwable) {
            $svg = QrCode::format('svg')->size(180)->errorCorrection('H')->generate($data);
            return 'data:image/svg+xml;base64,' . base64_encode($svg);
        }
    }

    private function generateCode128Svg(string $data): string
    {
        // Code 128 (Set B) module widths for values 0..106 (stop includes termination bar).
        $widthMap = [
            '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
            '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
            '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
            '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
            '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
            '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
            '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
            '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
            '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
            '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
            '114131', '311141', '411131', '211412', '211214', '211232', '2331112',
        ];

        $normalized = preg_replace('/[^\x20-\x7E]/', '', trim($data)) ?: 'TRACKING';
        $startCode = 104; // Code Set B.
        $codes = [$startCode];

        foreach (str_split($normalized) as $character) {
            $codes[] = ord($character) - 32;
        }

        $checksum = $startCode;
        foreach (array_slice($codes, 1) as $index => $value) {
            $checksum += $value * ($index + 1);
        }
        $codes[] = $checksum % 103;
        $codes[] = 106; // Stop.

        $moduleWidth = 1.1;
        $quietZone = 10 * $moduleWidth;
        $height = 54;
        $x = $quietZone;
        $svgParts = [];

        foreach ($codes as $value) {
            $pattern = $widthMap[$value] ?? '';
            if ($pattern === '') {
                continue;
            }

            $isBar = true;
            foreach (str_split($pattern) as $widthDigit) {
                $width = ((int) $widthDigit) * $moduleWidth;
                if ($isBar) {
                    $svgParts[] = '<rect x="' . round($x, 2) . '" y="8" width="' . round($width, 2) . '" height="' . $height . '" fill="#111827" />';
                }
                $x += $width;
                $isBar = !$isBar;
            }
        }

        $x += $quietZone;

        $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' . round($x, 2) . '" height="78" viewBox="0 0 ' . round($x, 2) . ' 78">'
            . '<rect width="100%" height="100%" fill="white" />'
            . implode('', $svgParts)
            . '<text x="' . round($quietZone, 2) . '" y="74" font-size="10" font-family="monospace" fill="#111827">' . e($normalized) . '</text>'
            . '</svg>';

        return 'data:image/svg+xml;base64,' . base64_encode($svg);
    }

    private function buildTwoUpLayout(CourierLabelSize $size): array
    {
        $pageHeight = max(40.0, (float) ($size->height_mm ?? 152.4));
        $verticalGap = 4.0;
        $copyHeight = max(18.0, ($pageHeight - $verticalGap) / 2.0);

        return [
            'copyCount' => 2,
            'copyHeightMm' => round($copyHeight, 2),
            'verticalGapMm' => $verticalGap,
        ];
    }

    private function buildPaper(CourierLabelSize $size, string $orientation): array
    {
        $widthMm = (float) ($size->width_mm ?? 0);
        $heightMm = (float) ($size->height_mm ?? 0);
        if (!is_finite($widthMm) || $widthMm <= 0) {
            $widthMm = 101.6;
        }
        if (!is_finite($heightMm) || $heightMm <= 0) {
            $heightMm = 152.4;
        }
        $widthPt = ($widthMm * 72) / 25.4;
        $heightPt = ($heightMm * 72) / 25.4;

        return [
            // Dompdf expects custom paper as [x0, y0, x1, y1].
            'size' => [0, 0, $widthPt, $heightPt],
            'orientation' => in_array($orientation, ['portrait', 'landscape'], true) ? $orientation : 'portrait',
        ];
    }

    private function normalizeLabelText(string $value, int $maxLength): string
    {
        $normalized = preg_replace('/\s+/u', ' ', trim($value)) ?: '';
        if ($normalized === '') {
            return '';
        }

        if (mb_strlen($normalized) <= $maxLength) {
            return $normalized;
        }

        return mb_substr($normalized, 0, $maxLength - 1) . '…';
    }
}
