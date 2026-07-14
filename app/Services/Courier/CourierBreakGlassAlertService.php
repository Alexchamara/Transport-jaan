<?php

namespace App\Services\Courier;

use App\Models\Courier\CourierTemporaryAccessGrant;
use App\Models\User;
use App\Models\VendorUserMembership;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class CourierBreakGlassAlertService
{
    public function dispatchActivatedAlerts(
        int $vendorUserId,
        int $workspaceId,
        array $policy,
        CourierTemporaryAccessGrant $grant,
        ?User $actorUser,
        User $targetUser
    ): array {
        $breakGlassPolicy = is_array($policy['breakGlass'] ?? null) ? $policy['breakGlass'] : [];

        $payload = [
            'event' => 'courier.break_glass.activated',
            'vendorUserId' => $vendorUserId,
            'workspaceId' => $workspaceId,
            'grantId' => (int) ($grant->id ?? 0),
            'targetUser' => [
                'id' => (int) ($targetUser->id ?? 0),
                'name' => (string) ($targetUser->name ?? ''),
                'email' => (string) ($targetUser->email ?? ''),
            ],
            'actorUser' => [
                'id' => (int) ($actorUser?->id ?? 0),
                'name' => (string) ($actorUser?->name ?? ''),
                'email' => (string) ($actorUser?->email ?? ''),
            ],
            'grant' => [
                'grantType' => (string) ($grant->grant_type ?? ''),
                'status' => (string) ($grant->status ?? ''),
                'elevatedRoleName' => (string) ($grant->elevated_role_name ?? ''),
                'ticketRef' => (string) ($grant->ticket_ref ?? ''),
                'reason' => (string) ($grant->reason ?? ''),
                'durationMinutes' => (int) ($grant->duration_minutes ?? 0),
                'startsAt' => optional($grant->starts_at)->toIso8601String(),
                'expiresAt' => optional($grant->expires_at)->toIso8601String(),
            ],
            'sentAt' => now()->toIso8601String(),
        ];

        $delivery = [
            'emailRecipients' => [],
            'webhookDelivered' => false,
        ];

        $emailRecipients = $this->resolveEmailRecipients($vendorUserId, $breakGlassPolicy, $grant, $actorUser, $targetUser);
        if (count($emailRecipients) > 0) {
            try {
                Mail::raw($this->buildEmailBody($payload), function ($message) use ($emailRecipients, $payload) {
                    $message->to($emailRecipients)
                        ->subject('[Courier][Break-Glass] Emergency access activated: ' . ($payload['grant']['ticketRef'] ?: 'N/A'));
                });

                $delivery['emailRecipients'] = $emailRecipients;
            } catch (Throwable $exception) {
                Log::warning('Failed to deliver break-glass email alert.', [
                    'vendor_user_id' => $vendorUserId,
                    'grant_id' => (int) ($grant->id ?? 0),
                    'error' => $exception->getMessage(),
                ]);
            }
        }

        $webhookUrl = $this->resolveWebhookUrl($breakGlassPolicy);
        if ($webhookUrl !== '') {
            try {
                $response = Http::timeout(8)->asJson()->post($webhookUrl, $payload);
                if ($response->successful()) {
                    $delivery['webhookDelivered'] = true;
                } else {
                    Log::warning('Break-glass webhook alert returned a non-success status.', [
                        'vendor_user_id' => $vendorUserId,
                        'grant_id' => (int) ($grant->id ?? 0),
                        'status' => $response->status(),
                        'body' => mb_substr((string) $response->body(), 0, 300),
                    ]);
                }
            } catch (Throwable $exception) {
                Log::warning('Failed to deliver break-glass webhook alert.', [
                    'vendor_user_id' => $vendorUserId,
                    'grant_id' => (int) ($grant->id ?? 0),
                    'error' => $exception->getMessage(),
                ]);
            }
        }

        return $delivery;
    }

    private function resolveEmailRecipients(
        int $vendorUserId,
        array $breakGlassPolicy,
        CourierTemporaryAccessGrant $grant,
        ?User $actorUser,
        User $targetUser
    ): array {
        $policyEmails = collect($breakGlassPolicy['alertEmails'] ?? [])
            ->map(fn ($email) => $this->normalizeEmail($email));

        $configEmails = collect(explode(',', (string) config('services.courier.break_glass_alert_emails_csv', '')));
        $configEmails = $configEmails->map(fn ($email) => $this->normalizeEmail($email));

        $recipients = collect()
            ->merge($policyEmails)
            ->merge($configEmails);

        if ((bool) ($breakGlassPolicy['notifyOwners'] ?? true)) {
            $ownerEmails = VendorUserMembership::query()
                ->where('vendor_user_id', $vendorUserId)
                ->where('status', 'active')
                ->where('membership_role', 'owner')
                ->with('user:id,email')
                ->get()
                ->pluck('user.email')
                ->map(fn ($email) => $this->normalizeEmail($email));

            $recipients = $recipients->merge($ownerEmails);
        }

        if ((bool) ($breakGlassPolicy['notifyRequester'] ?? true)) {
            $requesterId = (int) ($grant->requested_by_user_id ?? 0);
            if ($requesterId > 0) {
                $requester = User::query()->find($requesterId);
                if ($requester) {
                    $recipients->push($this->normalizeEmail($requester->email));
                }
            }

            if ($actorUser) {
                $recipients->push($this->normalizeEmail($actorUser->email));
            }
        }

        if ((bool) ($breakGlassPolicy['notifyTarget'] ?? true)) {
            $recipients->push($this->normalizeEmail($targetUser->email));
        }

        return $recipients
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    private function resolveWebhookUrl(array $breakGlassPolicy): string
    {
        $policyUrl = trim((string) ($breakGlassPolicy['alertWebhookUrl'] ?? ''));
        if ($policyUrl !== '') {
            return $policyUrl;
        }

        return trim((string) config('services.courier.break_glass_webhook_url', ''));
    }

    private function normalizeEmail(mixed $email): ?string
    {
        $normalized = trim(mb_strtolower((string) $email));
        if ($normalized === '' || !filter_var($normalized, FILTER_VALIDATE_EMAIL)) {
            return null;
        }

        return $normalized;
    }

    private function buildEmailBody(array $payload): string
    {
        $grant = $payload['grant'] ?? [];
        $targetUser = $payload['targetUser'] ?? [];
        $actorUser = $payload['actorUser'] ?? [];

        return implode("\n", [
            'COURIER BREAK-GLASS ALERT',
            '',
            'Emergency temporary access has been activated.',
            '',
            'Ticket: ' . ($grant['ticketRef'] ?? 'N/A'),
            'Role: ' . ($grant['elevatedRoleName'] ?? 'N/A'),
            'Duration: ' . ((int) ($grant['durationMinutes'] ?? 0)) . ' minutes',
            'Target User: ' . ($targetUser['name'] ?? 'N/A') . ' <' . ($targetUser['email'] ?? 'N/A') . '>',
            'Activated By: ' . ($actorUser['name'] ?? 'N/A') . ' <' . ($actorUser['email'] ?? 'N/A') . '>',
            'Starts At: ' . ($grant['startsAt'] ?? 'N/A'),
            'Expires At: ' . ($grant['expiresAt'] ?? 'N/A'),
            '',
            'Reason:',
            (string) ($grant['reason'] ?? 'N/A'),
            '',
            'Event Time: ' . ($payload['sentAt'] ?? now()->toIso8601String()),
        ]);
    }
}
