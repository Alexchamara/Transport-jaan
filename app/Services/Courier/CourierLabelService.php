<?php

namespace App\Services\Courier;

use App\Models\Courier\CourierAddress;
use App\Models\Courier\CourierPackage;
use App\Models\Courier\CourierShipment;
use App\Models\Courier\VendorCourierLabelSize;
use App\Models\Courier\VendorCourierLabelTemplate;
use App\Models\Courier\VendorCourierSetting;
use App\Support\CourierLabelDefaults;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class CourierLabelService
{
    public const OUTPUT_FORMAT_PDF = 'pdf';

    public const TEMPLATE_TYPES = ['builder', 'html', 'upload'];

    public const CATEGORY_DOMESTIC = 'domestic';

    public const CATEGORY_LOGISTIC = 'logistic';

    public function resolveLabelSettings(int $vendorId): array
    {
        $record = VendorCourierSetting::query()->where('vendor_user_id', $vendorId)->first();
        $settings = is_array($record?->settings) ? $record->settings : [];
        $labels = is_array($settings['labels'] ?? null) ? $settings['labels'] : [];

        return CourierLabelDefaults::merge($labels);
    }

    public function normalizePrintPolicy(array $policy): array
    {
        $normalized = [
            'bulkAsyncThreshold' => (int) ($policy['bulkAsyncThreshold'] ?? 50),
            'bulkHardLimit' => (int) ($policy['bulkHardLimit'] ?? 200),
            'allowCustomSizes' => (bool) ($policy['allowCustomSizes'] ?? true),
            'allowTemplateUpload' => (bool) ($policy['allowTemplateUpload'] ?? true),
            'allowHtmlTemplates' => (bool) ($policy['allowHtmlTemplates'] ?? true),
            'allowPdfBackground' => (bool) ($policy['allowPdfBackground'] ?? true),
        ];

        if ($normalized['bulkAsyncThreshold'] < 1) {
            $normalized['bulkAsyncThreshold'] = 1;
        }

        if ($normalized['bulkHardLimit'] < $normalized['bulkAsyncThreshold']) {
            $normalized['bulkHardLimit'] = $normalized['bulkAsyncThreshold'];
        }

        return $normalized;
    }

    public function resolveCategory(CourierShipment $shipment): string
    {
        $senderCountry = strtoupper((string) optional($shipment->senderAddress)->country);
        $recipientCountry = strtoupper((string) optional($shipment->recipientAddress)->country);

        if ($senderCountry === 'LK' && $recipientCountry === 'LK') {
            return self::CATEGORY_DOMESTIC;
        }

        return self::CATEGORY_LOGISTIC;
    }

    public function resolveDefaultsForCategory(array $settings, string $category): array
    {
        $defaults = is_array($settings['defaults'] ?? null) ? $settings['defaults'] : [];
        $categoryDefaults = is_array($defaults[$category] ?? null) ? $defaults[$category] : [];

        return [
            'templateId' => $categoryDefaults['templateId'] ?? null,
            'sizeId' => $categoryDefaults['sizeId'] ?? null,
        ];
    }

    public function buildSamplePayload(): array
    {
        return [
            'reference' => 'CR-TEST1234',
            'trackingNumber' => 'TRK-TEST1234',
            'serviceLevel' => 'Express',
            'category' => self::CATEGORY_DOMESTIC,
            'sender' => [
                'name' => 'Sender Name',
                'company' => 'Sender Company',
                'phone' => '+94 11 123 4567',
                'address' => [
                    'line1' => '123 Sample Street',
                    'line2' => 'Suite 4B',
                    'city' => 'Colombo',
                    'state' => 'Western',
                    'postalCode' => '01000',
                    'country' => 'LK',
                ],
            ],
            'recipient' => [
                'name' => 'Recipient Name',
                'company' => 'Recipient Company',
                'phone' => '+94 77 123 4567',
                'address' => [
                    'line1' => '456 Demo Avenue',
                    'line2' => null,
                    'city' => 'Kandy',
                    'state' => 'Central',
                    'postalCode' => '20000',
                    'country' => 'LK',
                ],
            ],
            'package' => [
                'id' => 1,
                'type' => 'Box',
                'weightKg' => 2.5,
                'quantity' => 1,
                'dimensions' => [
                    'lengthCm' => 30,
                    'widthCm' => 20,
                    'heightCm' => 10,
                ],
                'description' => 'Sample package description',
            ],
            'generatedAt' => now()->format('Y-m-d H:i'),
            'qrCode' => $this->generateQrCode('TRK-TEST1234'),
        ];
    }

    public function buildLabelPayload(CourierShipment $shipment, CourierPackage $package, ?int $sequence = null): array
    {
        $trackingNumber = $this->trackingNumber($shipment);

        return [
            'reference' => $shipment->reference,
            'trackingNumber' => $trackingNumber,
            'serviceLevel' => (string) ($shipment->service_level ?? ''),
            'category' => $this->resolveCategory($shipment),
            'sender' => $this->mapContact($shipment->senderAddress, $shipment->sender),
            'recipient' => $this->mapContact($shipment->recipientAddress, $shipment->recipient),
            'package' => [
                'id' => $package->id,
                'type' => (string) ($package->package_type ?? ''),
                'weightKg' => $package->weight_kg !== null ? (float) $package->weight_kg : null,
                'quantity' => (int) ($package->quantity ?? 1),
                'dimensions' => [
                    'lengthCm' => $package->length_cm !== null ? (float) $package->length_cm : null,
                    'widthCm' => $package->width_cm !== null ? (float) $package->width_cm : null,
                    'heightCm' => $package->height_cm !== null ? (float) $package->height_cm : null,
                ],
                'description' => (string) ($package->description ?? ''),
            ],
            'sequence' => $sequence,
            'generatedAt' => now()->format('Y-m-d H:i'),
            'qrCode' => $this->generateQrCode($trackingNumber),
        ];
    }

    public function renderLabelHtml(?VendorCourierLabelTemplate $template, array $payload): string
    {
        $backgroundUrl = null;
        if ($template && $template->background_path) {
            $backgroundUrl = Storage::disk('public')->url($template->background_path);
        }

        $renderPayload = array_merge($payload, [
            'backgroundUrl' => $backgroundUrl,
        ]);

        $viewData = [
            'payload' => $payload,
            'template' => $template,
            'backgroundUrl' => $backgroundUrl,
        ];

        if ($template && $template->template_type === 'html' && $template->html_template) {
            $html = $this->renderTemplateString($template->html_template, $renderPayload);
            $css = $template->css_template ? $this->renderTemplateString($template->css_template, $renderPayload) : '';

            return '<style>' . $css . '</style>' . $html;
        }

        return View::make('courier.labels.default', $viewData)->render();
    }

    public function renderLabelsPdf(array $pagesHtml, VendorCourierLabelSize $size, ?string $orientation = null): string
    {
        $pages = array_map(function (string $html) {
            return '<div class="label-page">' . $html . '</div>';
        }, $pagesHtml);

        $fullHtml = '<html><head><style>'
            . '@page { margin: 0; }'
            . 'body { margin: 0; padding: 0; }'
            . '.label-page { page-break-after: always; position: relative; }'
            . '.label-page:last-child { page-break-after: auto; }'
            . '</style></head><body>'
            . implode('', $pages)
            . '</body></html>';

        $pdf = Pdf::loadHTML($fullHtml);
        $paper = $this->buildPaperSize($size, $orientation);
        $pdf->setPaper($paper['size'], $paper['orientation']);

        return $pdf->output();
    }

    public function storePdf(string $pdfBinary, int $vendorId, string $prefix = 'label'): array
    {
        $directory = 'courier/labels/' . $vendorId . '/' . now()->format('Y/m/d');
        $fileName = $prefix . '_' . Str::uuid()->toString() . '.pdf';
        $path = $directory . '/' . $fileName;

        Storage::disk('public')->put($path, $pdfBinary);

        return [
            'disk' => 'public',
            'path' => $path,
            'name' => $fileName,
            'url' => Storage::disk('public')->url($path),
        ];
    }

    public function makeFallbackSize(): VendorCourierLabelSize
    {
        $size = new VendorCourierLabelSize();
        $size->name = '4x6';
        $size->width_mm = 101.6;
        $size->height_mm = 152.4;
        $size->unit = 'mm';
        $size->is_active = true;
        $size->is_system = true;

        return $size;
    }

    private function mapContact(?CourierAddress $address, $contact): array
    {
        return [
            'name' => $contact?->name,
            'company' => $contact?->company_name,
            'phone' => $contact?->phone,
            'address' => [
                'line1' => $address?->line1,
                'line2' => $address?->line2,
                'city' => $address?->city,
                'state' => $address?->state,
                'postalCode' => $address?->postal_code,
                'country' => $address?->country,
            ],
        ];
    }

    private function trackingNumber(CourierShipment $shipment): string
    {
        return 'TRK-' . str_replace('CR-', '', (string) $shipment->reference);
    }

    private function generateQrCode(string $data): string
    {
        $qrCode = QrCode::format('svg')
            ->size(200)
            ->errorCorrection('H')
            ->generate($data);

        return 'data:image/svg+xml;base64,' . base64_encode($qrCode);
    }

    private function renderTemplateString(string $template, array $payload): string
    {
        $flat = $this->flattenPayload($payload);

        return preg_replace_callback('/{{\s*([a-zA-Z0-9_.-]+)\s*}}/', function (array $matches) use ($flat) {
            $key = $matches[1];
            $value = array_key_exists($key, $flat) ? $flat[$key] : null;

            if (is_array($value)) {
                return '';
            }

            return htmlspecialchars((string) ($value ?? ''), ENT_QUOTES, 'UTF-8');
        }, $template);
    }

    private function flattenPayload(array $payload, string $prefix = ''): array
    {
        $flat = [];

        foreach ($payload as $key => $value) {
            $path = $prefix === '' ? (string) $key : $prefix . '.' . $key;

            if (is_array($value)) {
                $flat = array_merge($flat, $this->flattenPayload($value, $path));
                continue;
            }

            $flat[$path] = $value;
        }

        return $flat;
    }

    private function buildPaperSize(VendorCourierLabelSize $size, ?string $orientation): array
    {
        $width = (float) $size->width_mm;
        $height = (float) $size->height_mm;

        if ($orientation === 'landscape') {
            [$width, $height] = [$height, $width];
        }

        $widthPoints = $this->mmToPoints($width);
        $heightPoints = $this->mmToPoints($height);

        return [
            'size' => [$widthPoints, $heightPoints],
            'orientation' => 'portrait',
        ];
    }

    private function mmToPoints(float $mm): float
    {
        return $mm * 72 / 25.4;
    }
}
