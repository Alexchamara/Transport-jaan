<?php

namespace App\Mail;

use App\Models\FreightQuote;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class FreightQuoteSubmitted extends Mailable
{
    use Queueable, SerializesModels;

       public $quote;

    /**
     * Create a new message instance.
     */
    public function __construct(FreightQuote $quote)
    {
        $this->quote = $quote;
    }

    /**
     * Get the message envelope.
     */
     public function envelope(): Envelope
    {
        return new Envelope(
            from: 'no-reply@jaan.lk', // Your configured from address
            to: ['alexchamara56@gmail.com'],
            cc: ['alexchamara76@gmail.com'],
            subject: 'New Freight Quote Request - Quote #' . $this->quote->id,
            replyTo: ['alexchamara56@gmail.com'], // Set reply-to to main email
        );
    }
    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.freight-quote-submitted',
            with: [
                'quote' => $this->quote,
            ]
        );
    }
    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
