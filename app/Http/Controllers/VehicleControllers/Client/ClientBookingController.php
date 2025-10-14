<?php

namespace App\Http\Controllers\VehicleControllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingAddon;
use App\Models\BookingPayment;
use App\Models\BookingSchedule;
use App\Models\Vehicle;
use App\Models\VehicleFeaturePricing;
use App\Models\BookingCustomer;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ClientBookingController extends Controller
{
    /** QUOTE: GET /bookings/quote (JSON) */
    public function quote(Request $request)
    {
        [$vehicle, $pickup , $dropoff, $addonsReq] = $this->validateInputsForQuote($request);

        // NEW: allow the caller to exclude a booking (e.g., the one they just created)
        $excludeId = $request->integer('exclude_booking_id');
        $userId    = Auth::id();

        // ✅ Availability check (read-only quote)
        $overlap = Booking::where('vehicle_id', $vehicle->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))               // NEW
            // Ignore my *own* pending draft when just quoting again
            ->when($userId, function ($q) use ($userId) {                                  // NEW
                $q->where(function ($qq) use ($userId) {
                    $qq->where('client_id', '!=', $userId)
                       ->orWhere('status', 'confirmed'); // still block confirmed (even if mine)
                });
            })
            ->whereHas('schedule', function ($q) use ($pickup , $dropoff) {
                $q->where('pickup_at', '<', $dropoff)
                  ->where('dropoff_at', '>', $pickup );
            })
            ->exists();

        if ($overlap) {
            return response()->json([
                'message' => 'Vehicle is not available for the selected dates.'
            ], 422);
        }

        $calc = $this->calculateTotals($vehicle, $pickup , $dropoff, $addonsReq);
        return response()->json($calc);
    }

    /** ✅ NEW: extras for a vehicle (JSON) */
    public function extras(Vehicle $vehicle)
    {
        $extras = VehicleFeaturePricing::forVehicle($vehicle->id)
            ->orderBy('additional_feature_name')
            ->get(['additional_feature_name', 'additional_feature_price'])
            ->map(fn($row) => [
                'name' => $row->additional_feature_name,
                'price' => (float) $row->additional_feature_price,
            ])
            ->values();

        return response()->json(['extras' => $extras]);
    }

    public function updateAddons(Request $request, Booking $booking)
    {
        $this->authorizeBooking($booking);

        $data = $request->validate([
            'addons' => ['array'],
            'addons.*.name' => ['required_with:addons', 'string'],
            'addons.*.qty' => ['nullable', 'integer', 'min:1'],
        ]);

        $booking->load('vehicle', 'schedule');

        if (!$booking->vehicle || !$booking->schedule) {
            return response()->json(['message' => 'Booking missing vehicle or schedule.'], 422);
        }

        $calc = $this->calculateTotals(
            $booking->vehicle,
            Carbon::parse($booking->schedule->pickup_at),
            Carbon::parse($booking->schedule->dropoff_at),
            $data['addons'] ?? []
        );

        DB::transaction(function () use ($booking, $calc) {
            $booking->update([
                'price_per_day'   => $calc['price_per_day'],
                'rental_days'     => $calc['rental_days'],
                'addons_total'    => $calc['addons_total'],
                'subtotal'        => $calc['subtotal'],
                'deposit_amount'  => $calc['deposit_amount'],
                'advance_amount'  => $calc['advance_amount'],
                'total_amount'    => $calc['total'],
                'currency'        => $calc['currency'],
                'addons_snapshot' => $calc['addons_lines'],
            ]);

            BookingAddon::where('booking_id', $booking->id)->delete();
            foreach ($calc['addons_lines'] as $line) {
                BookingAddon::create([
                    'booking_id' => $booking->id,
                    'name'       => $line['name'],
                    'price'      => $line['price'],
                    'qty'        => $line['qty'],
                    'line_total' => $line['line_total'],
                ]);
            }
        });

        return response()->json([
            'booking' => $booking->fresh(['vehicle', 'schedule', 'addons']),
        ]);
    }

    /** RENDER: Checkout page */
    public function showCheckout(Request $request)
    {
        $tripFromSession     = (array) $request->session()->get('booking_trip', []);
        $personalFromSession = (array) $request->session()->get('booking_personal', []);

        $vehicleIdFromReq  = $request->integer('vehicle_id');
        $vehicleIdFromSess = isset($tripFromSession['vehicle_id']) ? (int) $tripFromSession['vehicle_id'] : null;

        $vehicle = $vehicleIdFromReq
            ? Vehicle::find($vehicleIdFromReq)
            : ($vehicleIdFromSess ? Vehicle::find($vehicleIdFromSess) : null);

        $extras = [];
        if ($vehicle) {
            $extras = VehicleFeaturePricing::forVehicle($vehicle->id)
                ->orderBy('additional_feature_name')
                ->get(['additional_feature_name', 'additional_feature_price'])
                ->map(fn($row) => [
                    'name'  => $row->additional_feature_name,
                    'price' => (float) $row->additional_feature_price,
                ])
                ->values();
        }

        $booking = null;
        if($vehicle){
            $booking =\App\Models\Booking::with('vehicle')
            ->where('vehicle_id',$vehicle->id)
            ->latest()
            -> first();
            if($booking){
                $booking->load('customer');
            }
        }

        $query = array_merge(
            $request->only([
                'vehicle_id',
                'pickup_location',
                'dropoff_location',
                'pickup_date',
                'pickup_time',
                'dropoff_date',
                'dropoff_time',
                'addons',
                'first_name',
                'last_name',
                'email',
                'phone',
                'country_code',
                'age',
                'city',
                'zip_code',
                'notes',
                'address',
                'exclude_booking_id', // NEW: forward this into the page props
            ]),
            $tripFromSession,
            $personalFromSession
        );

         $user = $request->user();

        return Inertia::render('Web/components/LandVehicleDetails/VehicleCheckoutContent', [
            'vehicle' => $vehicle,
            'extras'  => $extras,
            'query'   => $query,
            'booking' => $booking,
            'user' =>$user,
        ]);
    }

    /** CREATE BOOKING (draft customer): POST /bookings */
    public function store(Request $request)
    {
        $userId = Auth::id();
        abort_unless($userId, 403, 'Please login to continue.');

        [$vehicle, $pickup , $dropoff, $addonsReq] = $this->validateInputsForStoreDraft($request);

        $request->session()->put('booking_trip', array_merge(
            $request->only([
                'vehicle_id',
                'pickup_location',
                'dropoff_location',
                'pickup_date',
                'pickup_time',
                'dropoff_date',
                'dropoff_time',
            ]),
            ['addons' => $addonsReq]
        ));
        $request->session()->put('booking_personal', $request->only([
            'first_name',
            'last_name',
            'email',
            'phone',
            'country_code',
            'age',
            'city',
            'zip_code',
            'notes',
            'address'
        ]));

        $booking = DB::transaction(function () use ($vehicle, $pickup , $dropoff, $addonsReq, $userId, $request) {
            $existing = Booking::where('client_id', $userId)
                ->where('vehicle_id', $vehicle->id)
                ->where('status', 'pending')
                ->with('schedule')
                ->lockForUpdate()
                ->first();

            $overlap = Booking::where('vehicle_id', $vehicle->id)
                ->whereIn('status', ['pending', 'confirmed'])
                ->when($existing, fn($q) => $q->where('id', '!=', $existing->id))
                ->whereHas('schedule', function ($q) use ($pickup , $dropoff) {
                    $q->where('pickup_at', '<', $dropoff)
                      ->where('dropoff_at', '>', $pickup );
                })
                ->lockForUpdate()
                ->exists();

            if ($overlap) {
                abort(422, 'Vehicle is not available for the selected dates.');
            }

            $calc = $this->calculateTotals($vehicle, $pickup , $dropoff, $addonsReq);

            if ($existing) {
                $existing->update([
                    'price_per_day'   => $calc['price_per_day'],
                    'rental_days'     => $calc['rental_days'],
                    'addons_total'    => $calc['addons_total'],
                    'subtotal'        => $calc['subtotal'],
                    'deposit_amount'  => $calc['deposit_amount'],
                    'advance_amount'  => $calc['advance_amount'],
                    'total_amount'    => $calc['total'],
                    'currency'        => $vehicle->currency,
                    'addons_snapshot' => $calc['addons_lines'],
                    'vehicle_snapshot'=> $calc['vehicle_snapshot'],
                    'notes'           => $request->string('notes')->toString() ?: null,
                ]);

                if ($existing->schedule) {
                    $existing->schedule->update([
                        'pickup_at'        => $pickup ,
                        'pickup_location'  => $request->string('pickup_location')->toString() ?: null,
                        'dropoff_at'       => $dropoff,
                        'dropoff_location' => $request->string('dropoff_location')->toString() ?: null,
                    ]);
                } else {
                    BookingSchedule::create([
                        'booking_id'       => $existing->id,
                        'pickup_at'        => $pickup ,
                        'pickup_location'  => $request->string('pickup_location')->toString() ?: null,
                        'dropoff_at'       => $dropoff,
                        'dropoff_location' => $request->string('dropoff_location')->toString() ?: null,
                    ]);
                }

                BookingAddon::where('booking_id', $existing->id)->delete();
                foreach ($calc['addons_lines'] as $line) {
                    BookingAddon::create([
                        'booking_id' => $existing->id,
                        'name'       => $line['name'],
                        'price'      => $line['price'],
                        'qty'        => $line['qty'],
                        'line_total' => $line['line_total'],
                    ]);
                }

                return $existing->fresh(['schedule', 'addons']);
            }

            $booking = Booking::create([
                'client_id'       => $userId,
                'vehicle_id'      => $vehicle->id,
                'status'          => 'pending',
                'price_per_day'   => $calc['price_per_day'],
                'rental_days'     => $calc['rental_days'],
                'addons_total'    => $calc['addons_total'],
                'subtotal'        => $calc['subtotal'],
                'deposit_amount'  => $calc['deposit_amount'],
                'advance_amount'  => $calc['advance_amount'],
                'total_amount'    => $calc['total'],
                'currency'        => $vehicle->currency,
                'addons_snapshot' => $calc['addons_lines'],
                'vehicle_snapshot'=> $calc['vehicle_snapshot'],
                'notes'           => $request->string('notes')->toString() ?: null,
            ]);

            BookingSchedule::create([
                'booking_id'       => $booking->id,
                'pickup_at'        => $pickup ,
                'pickup_location'  => $request->string('pickup_location')->toString() ?: null,
                'dropoff_at'       => $dropoff,
                'dropoff_location' => $request->string('dropoff_location')->toString() ?: null,
            ]);

            foreach ($calc['addons_lines'] as $line) {
                BookingAddon::create([
                    'booking_id' => $booking->id,
                    'name'       => $line['name'],
                    'price'      => $line['price'],
                    'qty'        => $line['qty'],
                    'line_total' => $line['line_total'],
                ]);
            }

            return $booking->fresh(['schedule', 'addons']);
        });

        return redirect()->route('client.bookings.payments', $booking->id)
            ->with('success', 'Booking created. Continue with payment.');
    }

    /** RENDER: Payments page */
    public function payments(Booking $booking)
    {
        $this->authorizeBooking($booking);
        $booking->load('vehicle', 'schedule', 'addons', 'customer');

        return Inertia::render('Web/components/LandVehicleDetails/Payments', [
            'booking' => $booking,
        ]);
    }

    /** CONFIRM: POST /bookings/{booking}/confirm */
    public function confirm(Request $request, Booking $booking)
    {
        $this->authorizeBooking($booking);

        $validated = $request->validate([
            'payment_method' => ['required', 'in:Credit Card,PayPal,Bank Transfer'],
            'payment_option' => ['required', 'in:full,advance'],
            'slip_number'    => ['nullable', 'string', 'max:255'],
            'slip_pdf'       => ['nullable', 'file', 'mimetypes:application/pdf', 'max:10240'],
        ]);

        $payNow = $validated['payment_option'] === 'full'
            ? $booking->total_amount
            : min($booking->advance_amount ?: 0, $booking->total_amount);

        $slipPath = null;
        if (($validated['payment_method'] === 'Bank Transfer') && $request->file('slip_pdf')) {
            $slipPath = $request->file('slip_pdf')->store('bank_slips', 'public');
        }

        DB::transaction(function () use ($booking, $validated, $payNow, $slipPath, $request) {
            BookingPayment::create([
                'booking_id'   => $booking->id,
                'method'       => $validated['payment_method'],
                'option'       => $validated['payment_option'],
                'amount_paid'  => $payNow,
                'status'       => 'paid',
                'slip_number'  => $validated['slip_number'] ?? null,
                'slip_path'    => $slipPath,
                'tx_reference' => null,
            ]);

            $rawPersonal = (array) $request->session()->pull('booking_personal', []);
            if ($rawPersonal && !$booking->customer) {
                $personal = Validator::make($rawPersonal, [
                    'first_name'   => ['nullable', 'string', 'max:255'],
                    'last_name'    => ['nullable', 'string', 'max:255'],
                    'email'        => ['nullable', 'email', 'max:255'],
                    'phone'        => ['nullable', 'regex:/^\+?\d{7,15}$/', 'max:20'],
                    'country_code' => ['nullable', 'string', 'max:5'],
                    'city'         => ['nullable', 'string', 'max:255'],
                    'zip_code'     => ['nullable', 'string', 'max:20'],
                    'age'          => ['nullable', 'integer', 'min:18', 'max:120'],
                    'address'      => ['nullable', 'string', 'max:255'],
                    'notes'        => ['nullable', 'string'],
                ])->validate();

                if (collect($personal)->filter(fn($v) => filled($v))->isNotEmpty()) {
                    BookingCustomer::create(array_merge($personal, ['booking_id' => $booking->id]));
                }
            }

            $booking->load('schedule');
            $overlap = Booking::where('vehicle_id', $booking->vehicle_id)
                ->whereIn('status', ['pending', 'confirmed'])
                ->where('id', '!=', $booking->id)
                ->whereHas('schedule', function ($q) use ($booking) {
                    $q->where('pickup_at', '<', $booking->schedule->dropoff_at)
                      ->where('dropoff_at', '>', $booking->schedule->pickup_at);
                })
                ->lockForUpdate()
                ->exists();
            if ($overlap) {
                abort(422, 'Vehicle is no longer available for those dates.');
            }

            $booking->update(['status' => 'confirmed']);
            $request->session()->forget(['booking_trip']);
        });

        return redirect()->route('client.bookings.summary', $booking->id)
            ->with('success', 'Booking confirmed!');
    }

    /** RENDER: Summary page */
    public function summary(Booking $booking)
    {
        $this->authorizeBooking($booking);
        $booking->load('vehicle', 'vehicle.provider', 'schedule', 'addons', 'payments', 'customer');

        return Inertia::render('Web/home/land/Summary', [
            'booking' => $booking,
        ]);
    }

    /** Cancel (optional) */
    public function cancel(Booking $booking)
    {
        $this->authorizeBooking($booking);
        if (!in_array($booking->status, ['pending', 'confirmed'])) {
            return back()->with('error', 'Only pending/confirmed bookings can be cancelled.');
        }
        $booking->update(['status' => 'cancelled']);
        return back()->with('success', 'Booking cancelled.');
    }

    /* ------------ Helpers ------------ */

    private function authorizeBooking(Booking $booking): void
    {
        $user = Auth::user();
        if (!$user) abort(403);
        if ($user->role !== 'admin' && $user->id !== $booking->client_id) abort(403);
    }

    private function validateInputsForQuote(Request $request): array
    {
        $data = $request->validate([
            'vehicle_id'    => ['required', 'integer', 'exists:vehicles,id'],
            'pickup_date'   => ['required', 'date'],
            'pickup_time'   => ['required', 'date_format:H:i'],
            'dropoff_date'  => ['required', 'date', 'after_or_equal:pickup_date'],
            'dropoff_time'  => ['required', 'date_format:H:i'],
            'addons'        => ['array'],
            'addons.*.name' => ['required_with:addons', 'string'],
            'addons.*.qty'  => ['nullable', 'integer', 'min:1'],
        ]);

        $vehicle = Vehicle::findOrFail($data['vehicle_id']);

        $tz        = 'Asia/Colombo';
        $pickup  = Carbon::parse(($data['pickup_date'] . ' ' . $data['pickup_time']), $tz)->utc();
        $dropoff= Carbon::parse(($data['dropoff_date'] . ' ' . $data['dropoff_time']), $tz)->utc();

        if ($pickup ->gte($dropoff))
            abort(422, 'Drop-off must be after pick-up.');

        $addonsReq = $request->input('addons', []);
        return [$vehicle, $pickup , $dropoff, $addonsReq];
    }

    private function validateInputsForStoreDraft(Request $request): array
    {
        $data = $request->validate([
            'vehicle_id'       => ['required', 'integer', 'exists:vehicles,id'],
            'pickup_location'  => ['nullable', 'string'],
            'dropoff_location' => ['nullable', 'string'],
            'pickup_date'      => ['required', 'date'],
            'pickup_time'      => ['required', 'date_format:H:i'],
            'dropoff_date'     => ['required', 'date', 'after_or_equal:pickup_date'],
            'dropoff_time'     => ['required', 'date_format:H:i'],
            'addons'           => ['array'],
            'addons.*.name'    => ['required_with:addons', 'string'],
            'addons.*.qty'     => ['nullable', 'integer', 'min:1'],
        ]);

        $vehicle = Vehicle::findOrFail($data['vehicle_id']);

        $tz        = 'Asia/Colombo';
        $pickup  = Carbon::parse(($data['pickup_date'] . ' ' . $data['pickup_time']), $tz)->utc();
        $dropoff= Carbon::parse(($data['dropoff_date'] . ' ' . $data['dropoff_time']), $tz)->utc();

        if ($pickup ->gte($dropoff))
            abort(422, 'Drop-off must be after pick-up.');

        $addonsReq = $request->input('addons', []);
        return [$vehicle, $pickup , $dropoff, $addonsReq];
    }

    private function calculateTotals(Vehicle $vehicle, Carbon $pickup , Carbon $dropoff, array $addonsReq): array
    {
            // $seconds     = max(0, $dropoff->diffInSeconds($pickup ));
        $days = max(1, $pickup->diffInDays($dropoff));
        $pricePerDay = (float) ($vehicle->rental_price_per_day ?? 0);

        $addonsLines = [];
        $addonsTotal = 0.0;

        if (!empty($addonsReq)) {
            $normalize = fn($s) => mb_strtolower(trim((string) $s));

            $names = collect($addonsReq)->pluck('name')->filter()->map($normalize)->unique()->values();

            $catalog = VehicleFeaturePricing::where('vehicle_id', $vehicle->id)
                ->whereIn(DB::raw('LOWER(TRIM(additional_feature_name))'), $names)
                ->get();

            $catalogByName = $catalog->mapWithKeys(fn($row) => [
                $normalize($row->additional_feature_name) => $row
            ]);

            foreach ($addonsReq as $row) {
                $rawName  = (string) ($row['name'] ?? '');
                $nameKey  = $normalize($rawName);
                $qty      = max(1, (int) ($row['qty'] ?? 1));
                $price    = isset($catalogByName[$nameKey])
                    ? (float) $catalogByName[$nameKey]->additional_feature_price
                    : 0.0;
                $lineTotal = $price * $qty;

                $addonsLines[] = [
                    'name'       => $rawName,
                    'price'      => $price,
                    'qty'        => $qty,
                    'line_total' => $lineTotal,
                ];
                $addonsTotal += $lineTotal;
            }
        }

        $subtotal = $pricePerDay * $days + $addonsTotal;
        $deposit  = (float) ($vehicle->deposit_amount ?? 0);
        $advance  = (float) ($vehicle->advance_payment_amount ?? 0);
        $total    = $subtotal;

        return [
            'rental_days'     => $days,
            'price_per_day'   => $pricePerDay,
            'addons_total'    => $addonsTotal,
            'subtotal'        => $subtotal,
            'deposit_amount'  => $deposit,
            'advance_amount'  => $advance,
            'total'           => $total,
            'currency'        => $vehicle->currency,
            'addons_lines'    => $addonsLines,
            'vehicle_snapshot'=> [
                'manufacturer'        => $vehicle->manufacturer,
                'model'               => $vehicle->model,
                'registration_number' => $vehicle->registration_number,
                'price_per_day'       => $pricePerDay,
            ],
        ];
    }
}
