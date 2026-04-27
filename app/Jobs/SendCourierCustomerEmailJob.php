<?php

namespace App\Jobs;

use App\Mail\CourierCustomerLifecycleMail;
use App\Models\Courier\CourierCustomerEmailDispatch;
use App\Models\Courier\CourierEmailSuppression;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Throwable;

class SendCourierCustomerEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 5;

    public function __construct(private int $dispatchId)
    {
    }

    public function backoff(): array
    {
        return [60, 300, 900, 1800];
    }

    public function handle(): void
    {
        $dispatch = CourierCustomerEmailDispatch::query()
            ->with([
                'shipment.sender',
                'shipment.recipient',
                'shipment.senderAddress',
                'shipment.recipientAddress',
                'shipment.requestedBy',
                'payment',
                'trackingEvent',
            ])
            ->find($this->dispatchId);

        if (!$dispatch instanceof CourierCustomerEmailDispatch) {
            return;
        }

        if (in_array((string) $dispatch->status, [
            CourierCustomerEmailDispatch::STATUS_SENT,
            CourierCustomerEmailDispatch::STATUS_SKIPPED,
        ], true)) {
            return;
        }

        $recipient = trim((string) $dispatch->recipient_email);
        if ($recipient === '' || !filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
            $dispatch->forceFill([
                'status' => CourierCustomerEmailDispatch::STATUS_SKIPPED,
                'failed_reason_code' => 'invalid_recipient',
                'last_error' => 'Recipient email is missing or invalid.',
            ])->save();

            return;
        }

        if ((string) $dispatch->channel !== 'email') {
            $dispatch->forceFill([
                'status' => CourierCustomerEmailDispatch::STATUS_SKIPPED,
                'failed_reason_code' => 'unsupported_channel',
                'last_error' => 'Dispatch is not configured for email sending.',
            ])->save();

            return;
        }

        $isSuppressed = CourierEmailSuppression::query()
            ->where('email', mb_strtolower($recipient))
            ->where(function ($query) use ($dispatch) {
                if ((int) ($dispatch->vendor_user_id ?? 0) > 0) {
                    $query->where('vendor_user_id', (int) $dispatch->vendor_user_id)
                        ->orWhereNull('vendor_user_id');
                } else {
                    $query->whereNull('vendor_user_id');
                }
            })
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->exists();

        if ($isSuppressed) {
            $dispatch->forceFill([
                'status' => CourierCustomerEmailDispatch::STATUS_SKIPPED,
                'failed_reason_code' => 'suppressed',
                'last_error' => 'Recipient is suppressed due to provider feedback.',
            ])->save();

            return;
        }

        $lockedDispatch = DB::transaction(function () use ($dispatch) {
            $row = CourierCustomerEmailDispatch::query()
                ->whereKey((int) $dispatch->id)
                ->lockForUpdate()
                ->first();

            if (!$row instanceof CourierCustomerEmailDispatch) {
                return null;
            }

            if (in_array((string) $row->status, [
                CourierCustomerEmailDispatch::STATUS_SENT,
                CourierCustomerEmailDispatch::STATUS_SKIPPED,
            ], true)) {
                return null;
            }

            $row->forceFill([
                'status' => CourierCustomerEmailDispatch::STATUS_PROCESSING,
                'attempts' => (int) ($row->attempts ?? 0) + 1,
            ])->save();

            return $row;
        });

        if (!$lockedDispatch instanceof CourierCustomerEmailDispatch) {
            return;
        }

        $shipment = $dispatch->shipment;
        if (!$shipment) {
            $dispatch->forceFill([
                'status' => CourierCustomerEmailDispatch::STATUS_SKIPPED,
                'last_error' => 'Shipment not found for email dispatch.',
            ])->save();

            return;
        }

        try {
            Mail::mailer((string) config('courier.notifications_v2.transactional_mailer', config('mail.default')))
                ->to($recipient)
                ->send(new CourierCustomerLifecycleMail(
                $dispatch,
                $shipment,
                $dispatch->payment,
                $dispatch->trackingEvent
            ));

            $dispatch->forceFill([
                'status' => CourierCustomerEmailDispatch::STATUS_SENT,
                'provider_event' => 'sent',
                'provider_event_at' => now(),
                'last_error' => null,
                'sent_at' => now(),
            ])->save();
        } catch (Throwable $exception) {
            $dispatch->forceFill([
                'status' => CourierCustomerEmailDispatch::STATUS_FAILED,
                'provider_event' => 'failed',
                'provider_event_at' => now(),
                'failed_reason_code' => 'send_exception',
                'last_error' => mb_substr($exception->getMessage(), 0, 1500),
            ])->save();

            throw $exception;
        }
    }
}
