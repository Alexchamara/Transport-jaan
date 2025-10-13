<?php

namespace App\Observers;

use App\Models\Booking;
use App\Models\Notification;
use Illuminate\Support\Facades\Schema;

class BookingObserver
{
    /**
     * Handle the Booking "created" event.
     */
    public function created(Booking $booking): void
    {
        // Find the vendor/owner of the vehicle
        $vehicle = $booking->vehicle;

        if (!$vehicle) {
            return;
        }

        // Determine which column holds the vendor ID
        $ownerCol = collect(['provider_id', 'vendor_id', 'owner_id', 'user_id'])
            ->first(fn ($col) => Schema::hasColumn('vehicles', $col));

        if (!$ownerCol) {
            return;
        }

        $vendorId = $vehicle->{$ownerCol};

        if (!$vendorId) {
            return;
        }

        // Create notification for the vendor
        Notification::create([
            'user_id' => $vendorId,
            'type' => 'new_booking',
            'booking_id' => $booking->id,
            'data' => [
                'message' => 'New booking received',
                'booking_id' => $booking->id,
                'client_id' => $booking->client_id,
                'vehicle_id' => $booking->vehicle_id,
                'total_amount' => $booking->total_amount,
            ],
        ]);
    }

    /**
     * Handle the Booking "updated" event.
     */
    public function updated(Booking $booking): void
    {
        // Only notify if status changed
        if ($booking->isDirty('status')) {
            $vehicle = $booking->vehicle;

            if (!$vehicle) {
                return;
            }

            $ownerCol = collect(['provider_id', 'vendor_id', 'owner_id', 'user_id'])
                ->first(fn ($col) => Schema::hasColumn('vehicles', $col));

            if (!$ownerCol) {
                return;
            }

            $vendorId = $vehicle->{$ownerCol};

            if (!$vendorId) {
                return;
            }

            $notificationType = $booking->status === 'cancelled' || $booking->status === 'canceled'
                ? 'booking_cancelled'
                : 'booking_updated';

            Notification::create([
                'user_id' => $vendorId,
                'type' => $notificationType,
                'booking_id' => $booking->id,
                'data' => [
                    'message' => "Booking status changed to {$booking->status}",
                    'old_status' => $booking->getOriginal('status'),
                    'new_status' => $booking->status,
                ],
            ]);
        }
    }
}
