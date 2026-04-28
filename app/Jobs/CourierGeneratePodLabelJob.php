<?php

namespace App\Jobs;

use App\Models\Courier\CourierLabelPrintItem;
use App\Models\Courier\CourierLabelPrintJob;
use App\Models\Notification;
use App\Services\Courier\CourierPodLabelService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class CourierGeneratePodLabelJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public function __construct(private readonly int $printJobId, private readonly int $vendorId)
    {
    }

    public function handle(CourierPodLabelService $service): void
    {
        $job = CourierLabelPrintJob::query()
            ->with([
                'template.size',
                'size',
                'items.shipment.sender',
                'items.shipment.recipient',
                'items.shipment.senderAddress',
                'items.shipment.recipientAddress',
                'items.package',
            ])
            ->where('vendor_user_id', $this->vendorId)
            ->find($this->printJobId);

        if (!$job) {
            return;
        }

        $items = $job->items->values();
        if ($items->isEmpty()) {
            $job->update(['status' => 'failed', 'metadata' => ['error' => 'No print items found.']]);
            return;
        }

        $template = $job->template;
        $size = $job->size ?? $template?->size ?? $service->makeFallbackSize();

        try {
            $pages = [];
            foreach ($items as $item) {
                $shipment = $item->shipment;
                $package = $item->package;
                if (!$shipment || !$package || !$template) {
                    $this->markItemFailed($item, 'missing_context', 'Shipment/package/template context is missing.');
                    continue;
                }

                $payload = $service->buildPayload($shipment, $package, $this->vendorId);
                $item->update([
                    'status' => 'generated',
                    'payload_snapshot' => $payload,
                    'generated_at' => now(),
                    'printed_at' => now(),
                ]);
                $pages[] = $service->renderLabelHtml($payload, $template);
            }

            if (count($pages) === 0) {
                $job->update(['status' => 'failed', 'metadata' => ['error' => 'No printable pages generated.']]);
                return;
            }

            $pdfBinary = $service->renderLabelsPdf($pages, $size, (string) ($template->orientation ?? 'portrait'));
            $stored = $service->storePdf($pdfBinary, $this->vendorId, 'pod_labels');
            $failed = CourierLabelPrintItem::query()
                ->where('print_job_id', $job->id)
                ->where('status', 'failed')
                ->count();

            $service->markJobGenerated($job, $stored, $items->count(), $failed);

            Notification::create([
                'user_id' => $this->vendorId,
                'type' => 'courier_pod_labels_ready',
                'data' => [
                    'message' => 'POD labels are ready to print.',
                    'print_job_id' => $job->id,
                    'file_url' => $service->buildJobArtifactUrl($job->fresh()),
                ],
            ]);
        } catch (Throwable $error) {
            $job->update([
                'status' => 'failed',
                'metadata' => ['error' => $error->getMessage()],
            ]);

            CourierLabelPrintItem::query()
                ->where('print_job_id', $job->id)
                ->where('status', 'queued')
                ->update([
                    'status' => 'failed',
                    'error_code' => 'generation_failed',
                    'error_message' => $error->getMessage(),
                ]);
        }
    }

    private function markItemFailed(CourierLabelPrintItem $item, string $code, string $message): void
    {
        $item->update([
            'status' => 'failed',
            'error_code' => $code,
            'error_message' => $message,
        ]);
    }
}
