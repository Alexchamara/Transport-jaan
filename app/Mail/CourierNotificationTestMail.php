<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CourierNotificationTestMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param array<string, string> $deliverability
     */
    public function __construct(
        public int $vendorId,
        public array $deliverability = [],
    ) {
    }

    public function envelope(): Envelope
    {
        $fromEmail = trim((string) ($this->deliverability['fromEmail'] ?? ''));
        $fromName = trim((string) ($this->deliverability['fromName'] ?? ''));
        $replyTo = trim((string) ($this->deliverability['replyTo'] ?? ''));
        $allowCustomFrom = (bool) config('courier.notifications_v2.allow_custom_from', false);

        return new Envelope(
            subject: 'Courier Notification Test Email',
            from: $allowCustomFrom && filter_var($fromEmail, FILTER_VALIDATE_EMAIL)
                ? new Address($fromEmail, $fromName !== '' ? $fromName : null)
                : null,
            replyTo: filter_var($replyTo, FILTER_VALIDATE_EMAIL)
                ? [new Address($replyTo)]
                : [],
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.courier.notification-test',
            with: [
                'vendorId' => $this->vendorId,
                'generatedAt' => now()->toDateTimeString(),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
