<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\VehicleMaintenance;
use App\Models\Booking;
use App\Models\AirVehicleBookings;
use App\Models\SeaVehicleBookings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class VehicleMaintenanceController extends Controller
{
    /** POST /vendor/vehicles/{vehicle}/maintenance */
    public function store(Request $request, Vehicle $vehicle)
    {
        $this->authorizeOwner($request, $vehicle);

        $data = $request->validate([
            'start_date' => ['required', 'date'],
            'end_date'   => ['required', 'date', 'after_or_equal:start_date'],
            'reason'     => ['nullable', 'string', 'max:1000'],
        ]);

        $from = Carbon::parse($data['start_date'])->startOfDay();
        $to   = Carbon::parse($data['end_date'])->endOfDay();

        VehicleMaintenance::create([
            'vehicle_id' => $vehicle->id,
            'start_date' => $from->toDateString(),
            'end_date'   => $to->toDateString(),
            'reason'     => $data['reason'] ?? 'Scheduled maintenance',
            'created_by' => $request->user()->id,
        ]);

        return response()->json(['ok' => true, 'message' => 'Maintenance window saved.']);
    }

    /** GET /vendor/vehicles/{vehicle}/bookings/overlaps?start=YYYY-MM-DD&end=YYYY-MM-DD */
    public function overlaps(Request $request, Vehicle $vehicle)
    {
        $this->authorizeOwner($request, $vehicle);

        $data = $request->validate([
            'start' => ['required', 'date'],
            'end'   => ['required', 'date', 'after_or_equal:start'],
        ]);

        $from = Carbon::parse($data['start'])->startOfDay();
        $to   = Carbon::parse($data['end'])->endOfDay();

        // Pick the booking model that matches this vehicle's type (land/air/sea)
        $model = $this->bookingModelForVehicle($vehicle);

        $bookings = $model::with(['schedule', 'customer'])
            ->where('vehicle_id', $vehicle->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->whereHas('schedule', function ($q) use ($from, $to) {
                $q->where('pickup_at', '<', $to)
                  ->where('dropoff_at', '>', $from);
            })
            ->orderByDesc('id')
            ->get();

        $result = $bookings->map(function ($b) {
            $cust  = $b->customer;
            $email = $this->getCustomerEmail($cust);
            $name  = $this->buildCustomerName($cust, $email);
            $phone = $this->getCustomerPhone($cust);

            $startRaw = $b->schedule->pickup_at  ?? null;
            $endRaw   = $b->schedule->dropoff_at ?? null;
            $start    = $startRaw ? ( $startRaw instanceof Carbon ? $startRaw : Carbon::parse($startRaw) )->toDateString() : null;
            $end      = $endRaw   ? ( $endRaw   instanceof Carbon ? $endRaw   : Carbon::parse($endRaw)   )->toDateString() : null;

            return [
                'id'         => $b->id,
                'reference'  => $b->reference ?? (string) $b->id,
                // keep same key your UI expects
                'client'     => [
                    'name'  => $name,
                    'email' => $email,
                    'phone' => $phone,
                ],
                'start_date' => $start,
                'end_date'   => $end,
            ];
        })->values();

        return response()->json($result);
    }

    /** POST /vendor/vehicles/maintenance/notify */
    public function notify(Request $request)
    {
        $data = $request->validate([
            'vehicle_id'     => ['required', 'integer', 'exists:vehicles,id'],
            'start_date'     => ['required', 'date'],
            'end_date'       => ['required', 'date', 'after_or_equal:start_date'],
            'reason'         => ['nullable', 'string', 'max:1000'],
            'booking_ids'    => ['required', 'array'],
            'booking_ids.*'  => ['integer'],
        ]);

        $vehicle = Vehicle::findOrFail($data['vehicle_id']);
        $this->authorizeOwner($request, $vehicle);

        // Resolve the booking model for this vehicle's type (land/air/sea).
        // Filtering by vehicle_id ensures only this vehicle's bookings are matched.
        $model = $this->bookingModelForVehicle($vehicle);

        $bookings = $model::with('customer')
            ->where('vehicle_id', $vehicle->id)
            ->whereIn('id', $data['booking_ids'])
            ->get();

        $sent = 0;
        foreach ($bookings as $booking) {
            $cust  = $booking->customer;
            if (!$cust) continue;

            $email = $this->getCustomerEmail($cust);
            if (!$email) continue;

            $name = $this->buildCustomerName($cust, $email);

            try {
                Mail::raw(
                    "Hello {$name},\n\n"
                    ."Your booking ".($booking->reference ?? ('#' . $booking->id))." overlaps a maintenance window for {$vehicle->manufacturer} {$vehicle->model}.\n"
                    ."From: {$data['start_date']}  To: {$data['end_date']}\n"
                    ."Reason: ".($data['reason'] ?: 'Scheduled maintenance')."\n\n"
                    ."Please contact support to adjust your booking.\n",
                    function ($m) use ($email, $name) {
                        $m->to($email, $name)->subject('Booking affected by maintenance');
                    }
                );
                $sent++;
            } catch (\Throwable $e) {
                // ignore send failures for this loop
            }
        }

        return response()->json(['ok' => true, 'sent' => $sent]);
    }

    /* ----------------------- helpers ----------------------- */

    private function authorizeOwner(Request $request, Vehicle $vehicle): void
    {
        abort_unless((int) $vehicle->provider_id === (int) $request->user()->id, 403);
    }

    /** Resolve the booking model class for a vehicle's type (land/air/sea). */
    private function bookingModelForVehicle(Vehicle $vehicle): string
    {
        return match ($vehicle->type) {
            'air' => AirVehicleBookings::class,
            'sea' => SeaVehicleBookings::class,
            default => Booking::class,
        };
    }

    /** Prefer booking_customer.email / email_address */
    private function getCustomerEmail($cust): ?string
    {
        if (!$cust) return null;
        foreach (['email', 'email_address', 'contact_email'] as $k) {
            if (!empty($cust->{$k})) return (string) $cust->{$k};
        }
        return null;
    }

    /** Prefer phone fields if present */
    private function getCustomerPhone($cust): ?string
    {
        if (!$cust) return null;
        foreach (['phone', 'phone_number', 'mobile', 'contact_phone'] as $k) {
            if (!empty($cust->{$k})) return (string) $cust->{$k};
        }
        return null;
    }

    /**
     * Build a display name from common booking_customer columns.
     * Falls back to the email local-part or "Customer".
     */
    private function buildCustomerName($cust, ?string $emailFallback = null): string
    {
        if ($cust) {
            // single-field candidates
            foreach (['full_name','name','customer_name','display_name'] as $k) {
                $v = trim((string) ($cust->{$k} ?? ''));
                if ($v !== '') return $v;
            }

            // pair/combined candidates
            $pairs = [
                ['first_name','last_name'],
                ['firstname','lastname'],
                ['given_name','family_name'],
                ['givenName','familyName'],
                ['firstName','lastName'],
            ];
            foreach ($pairs as [$a,$b]) {
                $first = trim((string) ($cust->{$a} ?? ''));
                $last  = trim((string) ($cust->{$b} ?? ''));
                $joined = trim($first.' '.$last);
                if ($joined !== '') return $joined;
            }
        }

        // fallback to email local-part
        if ($emailFallback && str_contains($emailFallback, '@')) {
            $local = substr($emailFallback, 0, strpos($emailFallback, '@'));
            if ($local !== '') return $local;
        }
        return 'Customer';
    }
}
