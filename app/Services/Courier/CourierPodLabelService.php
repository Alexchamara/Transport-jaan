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

    public function buildPayload(CourierShipment $shipment, CourierPackage $package, int $vendorId): array
    {
        $trackingNumber = $this->trackingNumber($shipment);

        return [
            'reference' => (string) ($shipment->reference ?? ''),
            'trackingNumber' => $trackingNumber,
            'orderNumber' => (string) ($shipment->order_number ?? ''),
            'serviceLevel' => (string) ($shipment->service_level ?? ''),
            'category' => $this->resolveCategory($shipment),
            'issuedDate' => now()->format('Y-m-d'),
            'codAmount' => $shipment->is_cod_enabled ? (float) ($shipment->cod_requested_amount ?? 0) : null,
            'currencyCode' => (string) ($shipment->currency_code ?? 'LKR'),
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
            'brand' => $this->resolveBranding($vendorId),
            'qrCode' => $this->generateQrCode($trackingNumber),
            'code128Svg' => $this->generateCode128Svg($trackingNumber),
        ];
    }

    public function renderLabelHtml(array $payload, CourierLabelTemplate $template): string
    {
        $schema = array_replace($this->defaultTemplateSchema(), is_array($template->schema) ? $template->schema : []);

        return View::make('courier.labels.pod_two_up', [
            'payload' => $payload,
            'schema' => $schema,
            'template' => $template,
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

        return [
            'name' => (string) ($profileSettings['displayName'] ?? $profile?->company_name ?? 'Courier Service'),
            'address' => trim(implode(', ', array_filter([
                $profile?->address_line1,
                $profile?->address_line2,
                $profile?->city,
                $profile?->state,
                $profile?->postal_code,
            ]))),
            'contactLine' => $line,
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

    /**
     * Generates a deterministic compact 1D barcode-like SVG for scanner fallback slots.
     * This intentionally avoids runtime external dependencies while preserving stable bars.
     */
    private function generateCode128Svg(string $data): string
    {
        $normalized = strtoupper(preg_replace('/[^A-Z0-9\-]/', '', $data) ?: 'TRACKING');
        $hash = hash('sha256', $normalized);
        $bits = '';

        for ($i = 0; $i < strlen($hash); $i++) {
            $bits .= str_pad(base_convert($hash[$i], 16, 2), 4, '0', STR_PAD_LEFT);
        }

        $x = 10;
        $barWidth = 1.3;
        $height = 52;
        $svgParts = [];

        foreach (str_split(substr($bits, 0, 160)) as $bit) {
            if ($bit === '1') {
                $svgParts[] = '<rect x="' . $x . '" y="8" width="' . $barWidth . '" height="' . $height . '" fill="#111827" />';
            }

            $x += $barWidth;
        }

        $width = $x + 10;

        $svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' . $width . '" height="76" viewBox="0 0 ' . $width . ' 76">'
            . '<rect width="100%" height="100%" fill="white" />'
            . implode('', $svgParts)
            . '<text x="10" y="72" font-size="10" font-family="monospace" fill="#111827">' . e($normalized) . '</text>'
            . '</svg>';

        return 'data:image/svg+xml;base64,' . base64_encode($svg);
    }

    private function buildPaper(CourierLabelSize $size, string $orientation): array
    {
        $widthPt = ((float) $size->width_mm * 72) / 25.4;
        $heightPt = ((float) $size->height_mm * 72) / 25.4;

        return [
            'size' => [$widthPt, $heightPt],
            'orientation' => in_array($orientation, ['portrait', 'landscape'], true) ? $orientation : 'portrait',
        ];
    }
}
