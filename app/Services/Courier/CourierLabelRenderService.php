<?php

namespace App\Services\Courier;

use App\Models\Courier\CourierLabelSize;
use App\Models\Courier\CourierLabelTemplate;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\View;

class CourierLabelRenderService
{
    public const LAYOUT_SINGLE_UP = 'single_up';
    public const LAYOUT_TWO_UP = 'pod_two_up_continuous';
    public const LAYOUT_THERMAL_CONTINUOUS = 'thermal_continuous';
    public const LAYOUT_MANIFEST_BATCH = 'manifest_batch_sheet';

    public function __construct(private readonly CourierLabelSchemaRegistry $schemaRegistry)
    {
    }

    public function renderLabelHtml(array $payload, CourierLabelTemplate $template, ?CourierLabelSize $size = null): string
    {
        $labelType = (string) ($template->label_type ?: 'pod');
        $schema = array_replace($this->schemaRegistry->defaultSchemaForTemplate($labelType), is_array($template->schema) ? $template->schema : []);
        $effectiveSize = $size ?: $template->size;
        $layoutPreset = (string) ($template->layout_preset ?: $this->schemaRegistry->defaultLayoutByType($labelType));

        if ($layoutPreset === self::LAYOUT_MANIFEST_BATCH) {
            return View::make('courier.labels.manifest_batch', [
                'payload' => $payload,
                'schema' => $schema,
                'template' => $template,
            ])->render();
        }

        if ($layoutPreset === self::LAYOUT_SINGLE_UP || $layoutPreset === self::LAYOUT_THERMAL_CONTINUOUS) {
            return View::make('courier.labels.single_up_generic', [
                'payload' => $payload,
                'schema' => $schema,
                'template' => $template,
            ])->render();
        }

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

    private function buildTwoUpLayout(?CourierLabelSize $size): array
    {
        $heightMm = $size ? (float) $size->height_mm : 152.4;
        $pageHeight = max(40.0, $heightMm);
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
            'size' => [0, 0, $widthPt, $heightPt],
            'orientation' => in_array($orientation, ['portrait', 'landscape'], true) ? $orientation : 'portrait',
        ];
    }
}
