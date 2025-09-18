<?php

namespace App\Mail;

use App\Models\Booking;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class MaintenanceWindowMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public Vehicle $vehicle,
        public Booking $booking,
        public string $start,
        public string $end,
        public string $reason = 'Scheduled maintenance',
    ) {}

    public function build()
    {
        $subject = "Update on your booking #{$this->booking->id} – Vehicle maintenance";
        return $this->subject($subject)
            ->markdown('mail.maintenance.notice', [
                'user'    => $this->user,
                'vehicle' => $this->vehicle,
                'booking' => $this->booking,
                'start'   => $this->start,
                'end'     => $this->end,
                'reason'  => $this->reason,
                'altUrl'  => url("/vehicles?available=1&from={$this->start}&to={$this->end}"),
            ]);
    }
}
