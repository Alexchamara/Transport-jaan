<?php

namespace App\Services\Courier;

use App\Models\Courier\CourierVendorCodIntegrityIncident;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class CourierCodIntegrityAlertService
{
    public function incidentOpened(CourierVendorCodIntegrityIncident $incident, array $context = []): array
    {
        return $this->dispatch(
            'COURIER COD INTEGRITY INCIDENT OPENED',
            'warning',
            $incident,
            array_merge($context, ['event' => 'incident_opened'])
        );
    }

    public function incidentAssigned(CourierVendorCodIntegrityIncident $incident, array $context = []): array
    {
        return $this->dispatch(
            'COURIER COD INTEGRITY INCIDENT ASSIGNED',
            'warning',
            $incident,
            array_merge($context, ['event' => 'incident_assigned'])
        );
    }

    public function incidentResolved(CourierVendorCodIntegrityIncident $incident, array $context = []): array
    {
        return $this->dispatch(
            'COURIER COD INTEGRITY INCIDENT RESOLVED',
            'info',
            $incident,
            array_merge($context, ['event' => 'incident_resolved'])
        );
    }

    private function dispatch(string $message, string $level, CourierVendorCodIntegrityIncident $incident, array $context): array
    {
        if (!(bool) config('courier.cod_integrity.alerts.enabled', true)) {
            return [
                'enabled' => false,
                'deduped' => false,
                'emailDelivered' => false,
                'webhookDelivered' => false,
            ];
        }

        $dedupeMinutes = max(0, (int) config('courier.cod_integrity.alerts.dedupe_window_minutes', 30));
        $dedupeKey = $this->dedupeKey($incident, $context);

        if ($dedupeMinutes > 0 && Cache::has($dedupeKey)) {
            return [
                'enabled' => true,
                'deduped' => true,
                'emailDelivered' => false,
                'webhookDelivered' => false,
            ];
        }

        if ($dedupeMinutes > 0) {
            Cache::put($dedupeKey, 1, now()->addMinutes($dedupeMinutes));
        }

        $payload = $this->payload($incident, $context);

        if ($level === 'warning') {
            Log::warning($message, $payload);
        } else {
            Log::info($message, $payload);
        }

        $emailDelivered = $this->dispatchEmailAlert($message, $payload);
        $webhookDelivered = $this->dispatchWebhookAlert($payload);

        return [
            'enabled' => true,
            'deduped' => false,
            'emailDelivered' => $emailDelivered,
            'webhookDelivered' => $webhookDelivered,
        ];
    }

    private function payload(CourierVendorCodIntegrityIncident $incident, array $context): array
    {
        $incident->loadMissing([
            'capability:id,vendor_user_id,status,category',
            'creator:id,name,email',
            'assignee:id,name,email',
            'resolver:id,name,email',
        ]);

        $capability = $incident->capability;

        return [
            'incident_id' => (int) $incident->id,
            'incident_status' => CourierVendorCodIntegrityIncident::normalizeStatus((string) $incident->status),
            'incident_severity' => CourierVendorCodIntegrityIncident::normalizeSeverity((string) $incident->severity),
            'incident_title' => (string) ($incident->title ?? ''),
            'detected_issue_count' => (int) ($incident->detected_issue_count ?? 0),
            'detected_at' => optional($incident->detected_at)->toIso8601String(),
            'capability_id' => (int) ($incident->courier_vendor_cod_capability_id ?? 0),
            'capability_status' => (string) ($capability->status ?? ''),
            'category' => (string) ($incident->category ?? ''),
            'vendor_user_id' => (int) ($incident->vendor_user_id ?? 0),
            'assigned_to_user_id' => (int) ($incident->assigned_to_user_id ?? 0) ?: null,
            'resolved_by_user_id' => (int) ($incident->resolved_by_user_id ?? 0) ?: null,
            'resolution_note' => (string) ($incident->resolution_note ?? ''),
            'context' => $context,
            'triggered_at' => now()->toIso8601String(),
        ];
    }

    private function dispatchEmailAlert(string $message, array $payload): bool
    {
        $emails = $this->emailRecipients();
        if (count($emails) === 0) {
            return false;
        }

        try {
            Mail::raw($this->buildEmailBody($message, $payload), function ($email) use ($emails, $payload) {
                $email->to($emails)->subject('[Courier][COD Integrity] Incident ' . ((int) ($payload['incident_id'] ?? 0)));
            });

            return true;
        } catch (Throwable $exception) {
            Log::warning('Failed to deliver COD integrity email alert.', [
                'incident_id' => $payload['incident_id'] ?? null,
                'error' => $exception->getMessage(),
            ]);

            return false;
        }
    }

    private function dispatchWebhookAlert(array $payload): bool
    {
        $url = trim((string) config('courier.cod_integrity.alerts.webhook_url', ''));
        if ($url === '') {
            return false;
        }

        try {
            $response = Http::timeout(8)->asJson()->post($url, $payload);
            if ($response->successful()) {
                return true;
            }

            Log::warning('COD integrity webhook alert returned non-success status.', [
                'incident_id' => $payload['incident_id'] ?? null,
                'status' => $response->status(),
                'body' => mb_substr((string) $response->body(), 0, 300),
            ]);

            return false;
        } catch (Throwable $exception) {
            Log::warning('Failed to deliver COD integrity webhook alert.', [
                'incident_id' => $payload['incident_id'] ?? null,
                'error' => $exception->getMessage(),
            ]);

            return false;
        }
    }

    private function emailRecipients(): array
    {
        $csv = (string) config('courier.cod_integrity.alerts.emails_csv', '');

        return collect(explode(',', $csv))
            ->map(fn ($email) => trim(mb_strtolower((string) $email)))
            ->filter(static fn (string $email) => $email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL))
            ->unique()
            ->values()
            ->all();
    }

    private function dedupeKey(CourierVendorCodIntegrityIncident $incident, array $context): string
    {
        return 'courier:cod_integrity:alert:' . sha1(implode('|', [
            (string) ($context['event'] ?? 'incident_event'),
            (string) ($incident->id ?? 0),
            CourierVendorCodIntegrityIncident::normalizeStatus((string) $incident->status),
            CourierVendorCodIntegrityIncident::normalizeSeverity((string) $incident->severity),
            (string) ($context['source'] ?? 'unknown'),
        ]));
    }

    private function buildEmailBody(string $message, array $payload): string
    {
        return implode("\n", [
            $message,
            '',
            'Incident ID: ' . (int) ($payload['incident_id'] ?? 0),
            'Status: ' . (string) ($payload['incident_status'] ?? ''),
            'Severity: ' . (string) ($payload['incident_severity'] ?? ''),
            'Title: ' . (string) ($payload['incident_title'] ?? ''),
            'Capability ID: ' . (int) ($payload['capability_id'] ?? 0),
            'Category: ' . (string) ($payload['category'] ?? ''),
            'Issue Count: ' . (int) ($payload['detected_issue_count'] ?? 0),
            'Detected At: ' . (string) ($payload['detected_at'] ?? ''),
            'Triggered At: ' . (string) ($payload['triggered_at'] ?? ''),
        ]);
    }
}
