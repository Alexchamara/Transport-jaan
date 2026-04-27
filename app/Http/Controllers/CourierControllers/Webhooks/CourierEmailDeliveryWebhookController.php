<?php

namespace App\Http\Controllers\CourierControllers\Webhooks;

use App\Http\Controllers\Controller;
use App\Models\Courier\CourierCustomerEmailDispatch;
use App\Models\Courier\CourierEmailSuppression;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class CourierEmailDeliveryWebhookController extends Controller
{
    public function ingest(Request $request): JsonResponse
    {
        $configuredSecret = (string) config('courier.notifications_v2.delivery_webhook_secret', '');
        if ($configuredSecret !== '') {
            $providedSecret = (string) (
                $request->header('X-Courier-Webhook-Secret')
                ?: $request->header('X-Webhook-Secret')
                ?: $request->input('secret', '')
            );

            if (!hash_equals($configuredSecret, $providedSecret)) {
                return response()->json(['ok' => false, 'message' => 'Unauthorized webhook request.'], 401);
            }
        }

        $payload = $request->all();
        $eventType = $this->normalizeEventType((string) (
            Arr::get($payload, 'event')
            ?? Arr::get($payload, 'type')
            ?? Arr::get($payload, 'data.event')
            ?? Arr::get($payload, 'record.event')
            ?? ''
        ));
        $email = $this->normalizeEmail((string) (
            Arr::get($payload, 'email')
            ?? Arr::get($payload, 'recipient')
            ?? Arr::get($payload, 'data.email')
            ?? Arr::get($payload, 'record.recipient')
            ?? ''
        ));
        $providerMessageId = trim((string) (
            Arr::get($payload, 'provider_message_id')
            ?? Arr::get($payload, 'message_id')
            ?? Arr::get($payload, 'data.message_id')
            ?? Arr::get($payload, 'record.message_id')
            ?? ''
        ));
        $reasonCode = trim((string) (
            Arr::get($payload, 'failed_reason_code')
            ?? Arr::get($payload, 'reason_code')
            ?? Arr::get($payload, 'data.reason')
            ?? Arr::get($payload, 'record.reason')
            ?? ''
        ));
        $occurredAtInput = (string) (
            Arr::get($payload, 'occurred_at')
            ?? Arr::get($payload, 'event_at')
            ?? Arr::get($payload, 'timestamp')
            ?? Arr::get($payload, 'record.timestamp')
            ?? ''
        );
        $occurredAt = $this->parseTimestamp($occurredAtInput) ?? now();

        $dispatch = $this->findDispatchFromPayload($payload, $providerMessageId);
        $vendorUserId = null;

        if ($dispatch) {
            $vendorUserId = (int) ($dispatch->vendor_user_id ?? 0) ?: null;
            $dispatch->forceFill([
                'provider_message_id' => $providerMessageId !== '' ? $providerMessageId : $dispatch->provider_message_id,
                'provider_event' => $eventType !== '' ? $eventType : $dispatch->provider_event,
                'provider_event_at' => $occurredAt,
                'failed_reason_code' => $reasonCode !== '' ? $reasonCode : $dispatch->failed_reason_code,
                'delivery_meta' => array_merge(
                    is_array($dispatch->delivery_meta) ? $dispatch->delivery_meta : [],
                    ['webhook_payload' => $payload]
                ),
            ]);

            if ($this->isHardFailureEvent($eventType)) {
                $dispatch->status = CourierCustomerEmailDispatch::STATUS_FAILED;
                $dispatch->last_error = mb_substr($reasonCode !== '' ? $reasonCode : ('Delivery event: ' . $eventType), 0, 1500);
            }

            $dispatch->save();
        }

        $suppressed = false;
        if ($this->isSuppressionEvent($eventType) && $email !== '') {
            $suppressionVendorId = $vendorUserId ?: $this->resolveVendorIdFromPayload($payload);
            $this->upsertSuppression(
                email: $email,
                vendorUserId: $suppressionVendorId,
                eventType: $eventType,
                reasonCode: $reasonCode,
                providerMessageId: $providerMessageId,
                payload: $payload,
                occurredAt: $occurredAt,
            );
            $suppressed = true;
        }

        return response()->json([
            'ok' => true,
            'suppressed' => $suppressed,
            'event' => $eventType,
        ]);
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function findDispatchFromPayload(array $payload, string $providerMessageId): ?CourierCustomerEmailDispatch
    {
        $dispatchId = (int) (
            Arr::get($payload, 'dispatch_id')
            ?? Arr::get($payload, 'data.dispatch_id')
            ?? 0
        );
        if ($dispatchId > 0) {
            return CourierCustomerEmailDispatch::query()->find($dispatchId);
        }

        $dedupeKey = trim((string) (
            Arr::get($payload, 'dedupe_key')
            ?? Arr::get($payload, 'data.dedupe_key')
            ?? ''
        ));
        if ($dedupeKey !== '') {
            return CourierCustomerEmailDispatch::query()->where('dedupe_key', $dedupeKey)->first();
        }

        if ($providerMessageId !== '') {
            return CourierCustomerEmailDispatch::query()->where('provider_message_id', $providerMessageId)->latest('id')->first();
        }

        return null;
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function resolveVendorIdFromPayload(array $payload): ?int
    {
        $vendorId = (int) (
            Arr::get($payload, 'vendor_user_id')
            ?? Arr::get($payload, 'data.vendor_user_id')
            ?? 0
        );

        return $vendorId > 0 ? $vendorId : null;
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function upsertSuppression(
        string $email,
        ?int $vendorUserId,
        string $eventType,
        string $reasonCode,
        string $providerMessageId,
        array $payload,
        Carbon $occurredAt
    ): void {
        $query = CourierEmailSuppression::query()
            ->where('email', $email);

        if ($vendorUserId) {
            $query->where('vendor_user_id', $vendorUserId);
        } else {
            $query->whereNull('vendor_user_id');
        }

        $record = $query->first();
        if (!$record) {
            $record = new CourierEmailSuppression();
            $record->vendor_user_id = $vendorUserId;
            $record->email = $email;
        }

        $record->forceFill([
            'reason' => $reasonCode !== '' ? $reasonCode : $eventType,
            'source' => 'provider_webhook',
            'provider_event' => $eventType,
            'provider_message_id' => $providerMessageId !== '' ? $providerMessageId : null,
            'metadata' => [
                'payload' => $payload,
            ],
            'suppressed_at' => $occurredAt,
            'expires_at' => null,
        ])->save();
    }

    private function normalizeEmail(string $value): string
    {
        $email = mb_strtolower(trim($value));
        return filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : '';
    }

    private function normalizeEventType(string $value): string
    {
        return mb_strtolower(trim($value));
    }

    private function parseTimestamp(string $value): ?Carbon
    {
        $value = trim($value);
        if ($value === '') {
            return null;
        }

        try {
            return Carbon::parse($value);
        } catch (\Throwable) {
            return null;
        }
    }

    private function isSuppressionEvent(string $eventType): bool
    {
        return in_array($eventType, [
            'bounce',
            'hard_bounce',
            'complaint',
            'spam',
            'spam_report',
            'unsubscribe',
        ], true);
    }

    private function isHardFailureEvent(string $eventType): bool
    {
        return in_array($eventType, [
            'bounce',
            'hard_bounce',
            'complaint',
            'rejected',
        ], true);
    }
}

