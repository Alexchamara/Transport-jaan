<?php

namespace App\Jobs;

use App\Models\Courier\VendorCourierLabel;
use App\Models\Notification;
use App\Services\Courier\CourierLabelService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class CourierGenerateLabelsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private array $labelIds;

    private int $vendorId;

    public function __construct(array $labelIds, int $vendorId)
    {
        $this->labelIds = array_values(array_filter(array_map('intval', $labelIds)));
        $this->vendorId = $vendorId;
    }

    public function handle(CourierLabelService $labelService): void
    {
        if (empty($this->labelIds)) {
            return;
        }

        $labels = VendorCourierLabel::query()
            ->with([
                'shipment.sender',
                'shipment.recipient',
                'shipment.senderAddress',
                'shipment.recipientAddress',
                'package',
                'template',
                'size',
            ])
            ->where('vendor_user_id', $this->vendorId)
            ->whereIn('id', $this->labelIds)
            ->get();

        if ($labels->isEmpty()) {
            return;
        }

        $groups = $labels->groupBy(function (VendorCourierLabel $label) {
            return implode(':', [
                (string) ($label->template_id ?? 'none'),
                (string) ($label->size_id ?? 'none'),
                (string) ($label->category ?? 'unknown'),
            ]);
        });

        foreach ($groups as $group) {
            $this->generateGroup($group, $labelService);
        }
    }

    private function generateGroup($labels, CourierLabelService $labelService): void
    {
        $labels = $labels->values();
        $template = $labels->first()?->template;
        $size = $labels->first()?->size ?? $labelService->makeFallbackSize();

        try {
            $pages = $labels->map(function (VendorCourierLabel $label, int $index) use ($labelService, $template) {
                $shipment = $label->shipment;
                $package = $label->package;
                $payload = $labelService->buildLabelPayload($shipment, $package, $index + 1);

                return $labelService->renderLabelHtml($template, $payload);
            })->all();

            $pdfBinary = $labelService->renderLabelsPdf($pages, $size, $template?->orientation);
            $stored = $labelService->storePdf($pdfBinary, $this->vendorId, 'labels');

            VendorCourierLabel::query()
                ->whereIn('id', $labels->pluck('id')->all())
                ->update([
                    'status' => 'generated',
                    'file_disk' => $stored['disk'],
                    'file_path' => $stored['path'],
                    'file_name' => $stored['name'],
                    'generated_at' => now(),
                    'printed_at' => now(),
                ]);

            Notification::create([
                'user_id' => $this->vendorId,
                'type' => 'courier_labels_ready',
                'data' => [
                    'message' => 'Courier labels are ready to print.',
                    'label_ids' => $labels->pluck('id')->all(),
                    'file_url' => $stored['url'],
                    'count' => $labels->count(),
                ],
            ]);
        } catch (Throwable $error) {
            VendorCourierLabel::query()
                ->whereIn('id', $labels->pluck('id')->all())
                ->update([
                    'status' => 'failed',
                    'metadata' => ['error' => $error->getMessage()],
                ]);
        }
    }
}
