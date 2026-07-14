<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VendorNewBookingMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Primitives only (no Eloquent models) so the queued job is safe to dispatch
     * from inside the booking-confirmation transaction and works uniformly for
     * land / air / sea bookings.
     */
    public function __construct(
        public string $vendorName,
        public string $bookingRef,
        public string $bookingKind,
        public string $vehicleName,
        public string $clientName,
        public string $pickupAt,
        public string $dropoffAt,
        public string $currency,
        public string $totalAmount,
        public string $actionUrl,
    ) {}

    public function build()
    {
        return $this->subject("New booking received — {$this->vehicleName}")
            ->markdown('mail.vendor.new-booking');
    }
}
