<?php

namespace App\Observers;

use App\Mail\VendorNewBookingMail;
use App\Models\AirVehicleBookings;
use App\Models\Booking;
use App\Models\Notification;
use App\Models\SeaVehicleBookings;
use App\Models\User;
use App\Services\VehicleCommissionService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;

/**
 * Shared observer for land (Booking), air (AirVehicleBookings) and sea
 * (SeaVehicleBookings) rentals. Registered for all three in AppServiceProvider.
 *
 * Vendors are notified on the transition into 'confirmed' (a real booking),
 * never on the 'pending' draft created during checkout — so abandoned carts
 * don't spam the vendor.
 */
class BookingObserver
{
    /**
     * Covers the rare case of a booking created already 'confirmed'
     * (normal flow is pending -> confirmed, handled in updated()).
     */
    public function created(Booking|AirVehicleBookings|SeaVehicleBookings $booking): void
    {
        if (strtolower((string) $booking->status) === 'confirmed') {
            $vendorId = $this->resolveVendorId($booking);
            if ($vendorId) {
                $this->notifyNewBooking($booking, $vendorId);
            }
        }
    }

    public function updated(Booking|AirVehicleBookings|SeaVehicleBookings $booking): void
    {
        if (!$booking->isDirty('status')) {
            return;
        }

        $new = strtolower((string) $booking->status);
        $old = strtolower((string) $booking->getOriginal('status'));
        if ($new === $old) {
            return;
        }

        $vendorId = $this->resolveVendorId($booking);
        if (!$vendorId) {
            return;
        }

        if ($new === 'confirmed') {
            $this->notifyNewBooking($booking, $vendorId);
            return;
        }

        if (in_array($new, ['cancelled', 'canceled'], true)) {
            $this->createNotification($booking, $vendorId, 'booking_cancelled', "Booking #{$booking->id} has been cancelled.");
            app(VehicleCommissionService::class)->reverseForBooking($booking);
            return;
        }

        $this->createNotification($booking, $vendorId, 'booking_updated', "Booking #{$booking->id} status changed to {$new}.");
    }

    private function notifyNewBooking($booking, int $vendorId): void
    {
        $vehicleName = $this->vehicleName($booking);
        $clientName  = $this->clientName($booking);

        $this->createNotification(
            $booking,
            $vendorId,
            'new_booking',
            "{$clientName} made a new booking for {$vehicleName}."
        );

        // Queue the vendor email; never let a mail failure break the booking flow.
        try {
            $vendor = User::find($vendorId);
            $email  = $vendor?->email;
            if ($email) {
                Mail::to($email)->queue(new VendorNewBookingMail(
                    vendorName:  (string) ($vendor->name ?? 'Vendor'),
                    bookingRef:  $this->bookingRef($booking),
                    bookingKind: $this->bookingKind($booking),
                    vehicleName: $vehicleName,
                    clientName:  $clientName,
                    pickupAt:    $this->fmt($booking->schedule?->pickup_at),
                    dropoffAt:   $this->fmt($booking->schedule?->dropoff_at),
                    currency:    (string) ($booking->currency ?? ''),
                    totalAmount: number_format((float) ($booking->total_amount ?? 0), 2),
                    actionUrl:   url('/vendors/bookings'),
                ));
            }
        } catch (\Throwable $e) {
            Log::warning('Vendor new-booking email failed: ' . $e->getMessage());
        }

        // Record the platform commission for this confirmed booking (idempotent).
        app(VehicleCommissionService::class)->recordForConfirmedBooking($booking, $vendorId);
    }

    private function createNotification($booking, int $vendorId, string $type, string $message): void
    {
        try {
            Notification::create([
                'user_id'    => $vendorId,
                'type'       => $type,
                // notifications.booking_id is FK-constrained to the land `bookings`
                // table, so only set it for land; air/sea carry the id in `data`.
                'booking_id' => $booking instanceof Booking ? $booking->id : null,
                'data'       => [
                    'message'      => $message,
                    'booking_kind' => $this->bookingKind($booking),
                    'ref_id'       => $booking->id,
                    'vehicle_name' => $this->vehicleName($booking),
                    'client_name'  => $this->clientName($booking),
                    'total_amount' => (float) ($booking->total_amount ?? 0),
                    'action_url'   => '/vendors/bookings',
                ],
            ]);
        } catch (\Throwable $e) {
            Log::warning('Vendor booking notification failed: ' . $e->getMessage());
        }
    }

    private function resolveVendorId($booking): ?int
    {
        $vehicle = $booking->vehicle;
        if (!$vehicle) {
            return null;
        }

        $ownerCol = collect(['provider_id', 'vendor_id', 'owner_id', 'user_id'])
            ->first(fn ($col) => Schema::hasColumn('vehicles', $col));

        if (!$ownerCol) {
            return null;
        }

        $vendorId = $vehicle->{$ownerCol};
        return $vendorId ? (int) $vendorId : null;
    }

    private function bookingKind($booking): string
    {
        return match (true) {
            $booking instanceof AirVehicleBookings => 'air',
            $booking instanceof SeaVehicleBookings => 'sea',
            default => 'land',
        };
    }

    private function bookingRef($booking): string
    {
        $prefix = match ($this->bookingKind($booking)) {
            'air' => 'ABK-',
            'sea' => 'SBK-',
            default => 'BKG-',
        };

        return $prefix . str_pad((string) $booking->id, 5, '0', STR_PAD_LEFT);
    }

    private function vehicleName($booking): string
    {
        $vehicle = $booking->vehicle;
        $name = trim((($vehicle->manufacturer ?? '') . ' ' . ($vehicle->model ?? '')));

        return $name !== '' ? $name : 'a vehicle';
    }

    private function clientName($booking): string
    {
        return (string) ($booking->client?->name ?? 'A client');
    }

    private function fmt($value): string
    {
        if (!$value) {
            return 'N/A';
        }

        try {
            return Carbon::parse($value)->format('Y-m-d H:i');
        } catch (\Throwable $e) {
            return 'N/A';
        }
    }
}
