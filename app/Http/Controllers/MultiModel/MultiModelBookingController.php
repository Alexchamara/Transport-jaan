<?php

namespace App\Http\Controllers\MultiModel;

use App\Http\Controllers\Controller;
use App\Models\MultiModel\MultiModelJourney;
use App\Models\MultiModel\MultiModelLeg;
use App\Models\MultiModel\MultiModelBooking;
use App\Models\Vehicle;
use App\Models\VehicleFeaturePricing;
use App\Models\Booking;
use App\Models\BookingSchedule;
use App\Models\BookingCustomer;
use App\Models\BookingPayment;
use App\Models\AirVehicleBookings;
use App\Models\AirVehicleBookingSchedule;
use App\Models\AirVehicleBookingCustomer;
use App\Models\AirVehicleBookingPayment;
use App\Models\SeaVehicleBookings;
use App\Models\SeaVehicleBookingSchedule;
use App\Models\SeaVehicleBookingCustomer;
use App\Models\SeaVehicleBookingPayment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class MultiModelBookingController extends Controller
{
    /**
     * Store journey plan in session
     * POST /multiModel/journey/store
     */
    public function storeJourneyPlan(Request $request)
    {
        $validated = $request->validate([
            'legs' => ['required', 'array', 'min:1'],
            'legs.*.from_location' => ['required', 'string'],
            'legs.*.to_location' => ['required', 'string'],
            'legs.*.start_date' => ['required', 'date'],
            'legs.*.start_time' => ['required', 'date_format:H:i'],
            'legs.*.end_date' => ['required', 'date'],
            'legs.*.end_time' => ['required', 'date_format:H:i'],
            'legs.*.vehicle_type' => ['required', 'in:land,sea,air'],
            'legs.*.trip_id' => ['nullable', 'integer'], // Add trip_id validation
        ]);

        // Store in session
        $request->session()->put('multimodel_journey', $validated);

        return response()->json([
            'success' => true,
            'message' => 'Journey plan saved',
            'legs_count' => count($validated['legs'])
        ]);
    }

    /**
     * Get journey plan from session
     * GET /multiModel/journey/get
     */
    public function getJourneyPlan(Request $request)
    {
        $journey = $request->session()->get('multimodel_journey');

        if (!$journey) {
            return response()->json([
                'success' => false,
                'message' => 'No journey plan found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'journey' => $journey
        ]);
    }

    /**
     * Get available vehicles for a specific leg
     * POST /multiModel/leg/{legIndex}/available-vehicles
     */
    public function getAvailableVehiclesForLeg(Request $request, $legIndex)
    {
        $journey = $request->session()->get('multimodel_journey');

        if (!$journey || !isset($journey['legs'][$legIndex])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid leg index'
            ], 404);
        }

        $leg = $journey['legs'][$legIndex];
        
        $tz = 'Asia/Colombo';
        $startDateTime = Carbon::parse($leg['start_date'] . ' ' . $leg['start_time'], $tz)->utc();
        $endDateTime = Carbon::parse($leg['end_date'] . ' ' . $leg['end_time'], $tz)->utc();

        // Fetch vehicles based on type
        $vehicles = Vehicle::where('type', $leg['vehicle_type'])
            ->where('status', 'active')
            ->where('approval_status', 'approved')
            ->with(['landSpec', 'seaSpec', 'airSpec', 'images', 'reviews', 'provider'])
            ->get()
            ->filter(function ($vehicle) use ($startDateTime, $endDateTime) {
                return $vehicle->isAvailable($startDateTime, $endDateTime);
            })
            ->map(function ($vehicle) use ($startDateTime, $endDateTime) {
                $primaryImage = $vehicle->images->first();
                $days = max(1, $startDateTime->diffInDays($endDateTime));
                
                return [
                    'id' => $vehicle->id,
                    'name' => $vehicle->model,
                    'manufacturer' => $vehicle->manufacturer,
                    'year' => $vehicle->year,
                    'type' => $vehicle->type,
                    'price' => (float) $vehicle->rental_price_per_day,
                    'pricePerDay' => (float) $vehicle->rental_price_per_day,
                    'estimatedTotal' => (float) $vehicle->rental_price_per_day * $days,
                    'days' => $days,
                    'passengerCapacity' => $vehicle->passenger_capacity,
                    'location' => $vehicle->location,
                    'rating' => round($vehicle->reviews->avg('rating') ?? 0, 1),
                    'totalReviews' => $vehicle->reviews->count(),
                    'image' => $primaryImage ? $primaryImage->url : null,
                    'provider' => $vehicle->provider ? [
                        'id' => $vehicle->provider->id,
                        'name' => $vehicle->provider->business_name ?? $vehicle->provider->name,
                    ] : null,
                    'specs' => $this->getVehicleSpecs($vehicle),
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'vehicles' => $vehicles,
            'leg' => $leg
        ]);
    }

    /**
     * Select vehicle for a specific leg (or whole journey)
     * POST /multiModel/leg/{legIndex}/select-vehicle
     */
    public function selectVehicleForLeg(Request $request, $legIndex)
    {
        $validated = $request->validate([
            'vehicle_id' => ['required', 'integer', 'exists:vehicles,id'],
            'selection_type' => ['required', 'in:single_leg,whole_journey'],
            'addons' => ['nullable', 'array'],
            'addons.*.name' => ['required_with:addons', 'string'],
            'addons.*.qty' => ['nullable', 'integer', 'min:1'],
        ]);

        $journey = $request->session()->get('multimodel_journey');

        if (!$journey || !isset($journey['legs'][$legIndex])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid leg index'
            ], 404);
        }

        $vehicle = Vehicle::findOrFail($validated['vehicle_id']);
        
        // Get or initialize cart
        $cart = $request->session()->get('multimodel_cart', ['selections' => []]);

        if ($validated['selection_type'] === 'single_leg') {
            // Select for just this leg
            $leg = $journey['legs'][$legIndex];
            $cart['selections'][$legIndex] = $this->createLegSelection(
                $vehicle,
                $leg,
                $validated['addons'] ?? []
            );
        } else {
            // Select for whole journey (all remaining legs from this point)
            for ($i = $legIndex; $i < count($journey['legs']); $i++) {
                $leg = $journey['legs'][$i];
                
                // Check if vehicle is available for this leg
                $tz = 'Asia/Colombo';
                $startDateTime = Carbon::parse($leg['start_date'] . ' ' . $leg['start_time'], $tz)->utc();
                $endDateTime = Carbon::parse($leg['end_date'] . ' ' . $leg['end_time'], $tz)->utc();
                
                if ($vehicle->isAvailable($startDateTime, $endDateTime)) {
                    $cart['selections'][$i] = $this->createLegSelection(
                        $vehicle,
                        $leg,
                        $validated['addons'] ?? []
                    );
                }
            }
        }

        $request->session()->put('multimodel_cart', $cart);

        return response()->json([
            'success' => true,
            'message' => 'Vehicle selected',
            'cart' => $cart
        ]);
    }

    /**
     * Get current cart
     * GET /multiModel/cart
     */
    public function getCart(Request $request)
    {
        $journey = $request->session()->get('multimodel_journey');
        $cart = $request->session()->get('multimodel_cart', ['selections' => []]);

        $totalAmount = 0;
        $readyToCheckout = false;

        if ($journey && !empty($cart['selections'])) {
            // Calculate total
            foreach ($cart['selections'] as $selection) {
                $totalAmount += $selection['total_amount'];
            }

            // Check if all legs have selections
            $readyToCheckout = count($cart['selections']) === count($journey['legs']);
        }

        return response()->json([
            'success' => true,
            'cart' => $cart,
            'journey' => $journey,
            'total' => $totalAmount,
            'total_amount' => $totalAmount,
            'ready_to_checkout' => $readyToCheckout,
            'legs_selected' => count($cart['selections'] ?? []),
            'total_legs' => count($journey['legs'] ?? [])
        ]);
    }

    /**
     * Remove vehicle from a leg
     * DELETE /multiModel/leg/{legIndex}/remove-vehicle
     */
    public function removeVehicleFromLeg(Request $request, $legIndex)
    {
        $cart = $request->session()->get('multimodel_cart', ['selections' => []]);

        if (isset($cart['selections'][$legIndex])) {
            unset($cart['selections'][$legIndex]);
            $request->session()->put('multimodel_cart', $cart);

            return response()->json([
                'success' => true,
                'message' => 'Vehicle removed from leg'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No vehicle selected for this leg'
        ], 404);
    }

    /**
     * Proceed to checkout
     * GET /multiModel/checkout
     */
    public function showCheckout(Request $request)
    {
        $journey = $request->session()->get('multimodel_journey');
        $cart = $request->session()->get('multimodel_cart', ['selections' => []]);

        if (!$journey || empty($cart['selections'])) {
            return redirect()->route('multiModelHomepage.home')
                ->with('error', 'Please select vehicles for your journey first');
        }

        // Check if all legs have selections
        if (count($cart['selections']) !== count($journey['legs'])) {
            return redirect()->route('multiModelAvailableVehicles.availableVehicles')
                ->with('error', 'Please select vehicles for all legs of your journey');
        }

        $user = $request->user();
        $personalInfo = $request->session()->get('multimodel_personal', []);

        return Inertia::render('Web/home/multiModel/TravellerDetails', [
            'journey' => $journey,
            'cart' => $cart,
            'user' => $user,
            'personalInfo' => $personalInfo
        ]);
    }

    /**
     * Store personal information
     * POST /multiModel/personal-info
     */
    public function storePersonalInfo(Request $request)
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'regex:/^\+?\d{7,15}$/', 'max:20'],
            'country_code' => ['nullable', 'string', 'max:5'],
            'age' => ['nullable', 'integer', 'min:18', 'max:120'],
            'city' => ['nullable', 'string', 'max:255'],
            'zip_code' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $request->session()->put('multimodel_personal', $validated);

        return response()->json([
            'success' => true,
            'message' => 'Personal information saved'
        ]);
    }

    /**
     * Show payment page
     * GET /multiModel/payment
     */
    public function showPayment(Request $request)
    {
        $journey = $request->session()->get('multimodel_journey');
        $cart = $request->session()->get('multimodel_cart', ['selections' => []]);
        $personalInfo = $request->session()->get('multimodel_personal');

        if (!$journey || empty($cart['selections']) || !$personalInfo) {
            return redirect()->route('multiModelHomepage.home')
                ->with('error', 'Please complete your booking information');
        }

        $user = $request->user();

        // Calculate totals
        $subtotal = 0;
        $totalDeposit = 0;
        $totalAdvance = 0;

        foreach ($cart['selections'] as $selection) {
            $subtotal += $selection['total_amount'];
            $totalDeposit += $selection['deposit_amount'];
            $totalAdvance += $selection['advance_amount'];
        }

        return Inertia::render('Web/home/multiModel/Payment', [
            'journey' => $journey,
            'cart' => $cart,
            'personal_info' => $personalInfo,
            'user' => $user,
            'pricing' => [
                'subtotal' => $subtotal,
                'deposit' => $totalDeposit,
                'advance' => $totalAdvance,
                'total' => $subtotal,
            ]
        ]);
    }

    /**
     * Confirm and create booking
     * POST /multiModel/confirm
     */
    public function confirmBooking(Request $request)
    {
        $userId = Auth::id();
        
        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'Please login to complete your booking',
                'redirect_url' => route('login')
            ], 401);
        }

        $validated = $request->validate([
            'payment_method' => ['required', 'in:Credit Card,PayPal,Bank Transfer,Other'],
            'payment_option' => ['required', 'in:full,advance'],
            'slip_number' => ['nullable', 'string', 'max:255'],
            'slip_pdf' => ['nullable', 'file', 'mimes:pdf,jpeg,jpg,png', 'max:5120'],
        ]);

        $journey = $request->session()->get('multimodel_journey');
        $cart = $request->session()->get('multimodel_cart', ['selections' => []]);
        $personalInfo = $request->session()->get('multimodel_personal');

        if (!$journey || empty($cart['selections']) || !$personalInfo) {
            return response()->json([
                'success' => false,
                'message' => 'Missing booking information'
            ], 422);
        }

        $slipPath = null;
        if (($validated['payment_method'] === 'Bank Transfer') && $request->file('slip_pdf')) {
            $slipPath = $request->file('slip_pdf')->store('bank_slips', 'public');
        }

        // Create booking in transaction
        $multiModelJourney = DB::transaction(function () use ($userId, $journey, $cart, $personalInfo, $validated, $slipPath) {
            // Calculate totals
            $totalAmount = 0;
            $totalDeposit = 0;
            $totalAdvance = 0;

            foreach ($cart['selections'] as $selection) {
                $totalAmount += $selection['total_amount'];
                $totalDeposit += $selection['deposit_amount'];
                $totalAdvance += $selection['advance_amount'];
            }

            $payNow = $validated['payment_option'] === 'full'
                ? $totalAmount
                : min($totalAdvance, $totalAmount);

            // Create main journey record
            $multiModelJourney = MultiModelJourney::create([
                'user_id' => $userId,
                'reference' => 'MMJ-' . strtoupper(uniqid()),
                'status' => 'pending',
                'total_legs' => count($journey['legs']),
                'total_amount' => $totalAmount,
                'deposit_amount' => $totalDeposit,
                'advance_amount' => $totalAdvance,
                'payment_method' => $validated['payment_method'],
                'payment_option' => $validated['payment_option'],
                'amount_paid' => $payNow,
                'payment_status' => 'paid',
                'slip_number' => $validated['slip_number'] ?? null,
                'slip_path' => $slipPath,
                'customer_data' => $personalInfo,
            ]);

            // Create legs and bookings in existing tables
            foreach ($cart['selections'] as $legIndex => $selection) {
                $legData = $journey['legs'][$legIndex];
                $vehicle = Vehicle::find($selection['vehicle_id']);

                // Parse datetimes with fallback for missing time fields
                $startTime = $legData['start_time'] ?? '00:00';
                $endTime = $legData['end_time'] ?? '23:59';
                $startDatetime = Carbon::parse($legData['start_date'] . ' ' . $startTime, 'Asia/Colombo')->utc();
                $endDatetime = Carbon::parse($legData['end_date'] . ' ' . $endTime, 'Asia/Colombo')->utc();

                $leg = MultiModelLeg::create([
                    'multi_model_journey_id' => $multiModelJourney->id,
                    'leg_order' => $legIndex + 1,
                    'from_location' => $legData['from_location'],
                    'to_location' => $legData['to_location'],
                    'start_datetime' => $startDatetime,
                    'end_datetime' => $endDatetime,
                    'vehicle_type' => $legData['vehicle_type'],
                    'vehicle_id' => $selection['vehicle_id'],
                    'vehicle_snapshot' => $selection['vehicle_data'],
                    'status' => 'pending',
                ]);

                // Create individual booking for this leg
                MultiModelBooking::create([
                    'multi_model_leg_id' => $leg->id,
                    'multi_model_journey_id' => $multiModelJourney->id,
                    'user_id' => $userId,
                    'vehicle_id' => $selection['vehicle_id'],
                    'status' => 'pending',
                    'rental_days' => $selection['rental_days'],
                    'price_per_day' => $selection['price_per_day'],
                    'addons_total' => $selection['addons_total'],
                    'subtotal' => $selection['subtotal'],
                    'deposit_amount' => $selection['deposit_amount'],
                    'advance_amount' => $selection['advance_amount'],
                    'total_amount' => $selection['total_amount'],
                    'currency' => $selection['currency'],
                    'addons_snapshot' => $selection['addons_lines'],
                    'vehicle_snapshot' => $selection['vehicle_data'],
                ]);

                // Create booking in existing vehicle rental tables based on vehicle type
                $vehicleCategory = strtolower($vehicle->vehicle_category ?? 'land');
                $startDate = Carbon::parse($legData['start_date'], 'Asia/Colombo');
                $endDate = Carbon::parse($legData['end_date'], 'Asia/Colombo');

                $bookingData = [
                    'client_id' => $userId,
                    'vehicle_id' => $selection['vehicle_id'],
                    'status' => 'pending',
                    'price_per_day' => $selection['price_per_day'],
                    'rental_days' => $selection['rental_days'],
                    'addons_total' => $selection['addons_total'],
                    'subtotal' => $selection['subtotal'],
                    'deposit_amount' => $selection['deposit_amount'],
                    'advance_amount' => $selection['advance_amount'],
                    'total_amount' => $selection['total_amount'],
                    'currency' => $selection['currency'],
                    'addons_snapshot' => $selection['addons_lines'],
                    'vehicle_snapshot' => $selection['vehicle_data'],
                    'notes' => "Multi-Model Journey: {$multiModelJourney->reference} (Leg " . ($legIndex + 1) . "/{$multiModelJourney->total_legs})",
                ];

                if ($vehicleCategory === 'air') {
                    // Create Air Vehicle Booking
                    $airBooking = \App\Models\AirVehicleBookings::create($bookingData);
                    
                    // Create schedule
                    \App\Models\AirVehicleBookingSchedule::create([
                        'air_vehicle_booking_id' => $airBooking->id,
                        'pickup_location' => $legData['from_location'],
                        'pickup_at' => $startDatetime,
                        'dropoff_location' => $legData['to_location'],
                        'dropoff_at' => $endDatetime,
                    ]);

                    // Create customer
                    \App\Models\AirVehicleBookingCustomer::create([
                        'air_vehicle_booking_id' => $airBooking->id,
                        'name' => $personalInfo['first_name'] . ' ' . $personalInfo['last_name'],
                        'email' => $personalInfo['email'],
                        'phone' => $personalInfo['phone'],
                    ]);

                    // Create payment record
                    \App\Models\AirVehicleBookingPayment::create([
                        'air_vehicle_booking_id' => $airBooking->id,
                        'payment_method' => $validated['payment_method'],
                        'status' => 'paid',
                        'amount' => $payNow,
                    ]);

                } elseif ($vehicleCategory === 'sea') {
                    // Create Sea Vehicle Booking
                    $seaBooking = SeaVehicleBookings::create($bookingData);
                    
                    // Create schedule
                    \App\Models\SeaVehicleBookingSchedule::create([
                        'sea_vehicle_booking_id' => $seaBooking->id,
                        'pickup_location' => $legData['from_location'],
                        'pickup_at' => $startDatetime,
                        'dropoff_location' => $legData['to_location'],
                        'dropoff_at' => $endDatetime,
                    ]);

                    // Create customer
                    \App\Models\SeaVehicleBookingCustomer::create([
                        'sea_vehicle_booking_id' => $seaBooking->id,
                        'name' => $personalInfo['first_name'] . ' ' . $personalInfo['last_name'],
                        'email' => $personalInfo['email'],
                        'phone' => $personalInfo['phone'],
                    ]);

                    // Create payment record
                    \App\Models\SeaVehicleBookingPayment::create([
                        'sea_vehicle_booking_id' => $seaBooking->id,
                        'payment_method' => $validated['payment_method'],
                        'status' => 'paid',
                        'amount' => $payNow,
                    ]);

                } else {
                    // Create Land Vehicle Booking
                    $landBooking = Booking::create($bookingData);
                    
                    // Create schedule
                    \App\Models\BookingSchedule::create([
                        'booking_id' => $landBooking->id,
                        'pickup_location' => $legData['from_location'],
                        'pickup_at' => $startDatetime,
                        'dropoff_location' => $legData['to_location'],
                        'dropoff_at' => $endDatetime,
                    ]);

                    // Create customer
                    \App\Models\BookingCustomer::create([
                        'booking_id' => $landBooking->id,
                        'name' => $personalInfo['first_name'] . ' ' . $personalInfo['last_name'],
                        'email' => $personalInfo['email'],
                        'phone' => $personalInfo['phone'],
                    ]);

                    // Create payment record
                    \App\Models\BookingPayment::create([
                        'booking_id' => $landBooking->id,
                        'payment_method' => $validated['payment_method'],
                        'status' => 'paid',
                        'amount' => $payNow,
                    ]);
                }
            }

            return $multiModelJourney;
        });

        // Clear session
        $request->session()->forget(['multimodel_journey', 'multimodel_cart', 'multimodel_personal']);

        return response()->json([
            'success' => true,
            'message' => 'Booking confirmed successfully',
            'journey_id' => $multiModelJourney->id,
            'reference' => $multiModelJourney->reference,
            'redirect_url' => route('multiModel.booking.summary', $multiModelJourney->id)
        ]);
    }

    /**
     * Show booking summary
     * GET /multiModel/booking/{id}/summary
     */
    public function showSummary($id)
    {
        $multiModelJourney = MultiModelJourney::with(['legs.vehicle', 'legs.bookings'])
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        return Inertia::render('Web/home/multiModel/Summary', [
            'journey' => $multiModelJourney
        ]);
    }

    /**
     * Approve a multi-model booking (Vendor only)
     * POST /multiModel/vendor/booking/approve/{bookingId}/{bookingType}
     */
    public function approveBooking($bookingId, $bookingType)
    {
        $vendorId = Auth::id();
        
        try {
            DB::transaction(function () use ($bookingId, $bookingType, $vendorId) {
                $booking = null;
                
                // Find the booking based on type
                if ($bookingType === 'land') {
                    $booking = Booking::with('vehicle')->findOrFail($bookingId);
                } elseif ($bookingType === 'air') {
                    $booking = AirVehicleBookings::with('vehicle')->findOrFail($bookingId);
                } elseif ($bookingType === 'sea') {
                    $booking = SeaVehicleBookings::with('vehicle')->findOrFail($bookingId);
                }
                
                if (!$booking) {
                    throw new \Exception('Booking not found');
                }
                
                // Check if vendor owns this vehicle
                if ($booking->vehicle->provider_id !== $vendorId) {
                    throw new \Exception('Unauthorized: You do not own this vehicle');
                }
                
                // Check if booking is pending
                if ($booking->status !== 'pending') {
                    throw new \Exception('Booking is not in pending status');
                }
                
                // Update booking status to confirmed
                $booking->update(['status' => 'confirmed']);
                
                // Update related multi_model_booking and leg status if exists
                $multiModelBooking = MultiModelBooking::where('vehicle_id', $booking->vehicle_id)
                    ->where('user_id', $booking->client_id)
                    ->where('status', 'pending')
                    ->whereHas('leg', function($q) use ($booking) {
                        $q->where('vehicle_id', $booking->vehicle_id);
                    })
                    ->first();
                    
                if ($multiModelBooking) {
                    $multiModelBooking->update(['status' => 'confirmed']);
                    $multiModelBooking->leg->update(['status' => 'confirmed']);
                    
                    // Check if all bookings in journey are confirmed
                    $journey = $multiModelBooking->journey;
                    $allConfirmed = $journey->bookings()->where('status', '!=', 'confirmed')->count() === 0;
                    
                    if ($allConfirmed) {
                        $journey->update(['status' => 'confirmed']);
                    }
                }
            });
            
            return response()->json([
                'success' => true,
                'message' => 'Booking approved successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Reject a multi-model booking (Vendor only)
     * POST /multiModel/vendor/booking/reject/{bookingId}/{bookingType}
     */
    public function rejectBooking(Request $request, $bookingId, $bookingType)
    {
        $vendorId = Auth::id();
        
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);
        
        try {
            DB::transaction(function () use ($bookingId, $bookingType, $vendorId, $validated) {
                $booking = null;
                
                // Find the booking based on type
                if ($bookingType === 'land') {
                    $booking = Booking::with('vehicle')->findOrFail($bookingId);
                } elseif ($bookingType === 'air') {
                    $booking = AirVehicleBookings::with('vehicle')->findOrFail($bookingId);
                } elseif ($bookingType === 'sea') {
                    $booking = SeaVehicleBookings::with('vehicle')->findOrFail($bookingId);
                }
                
                if (!$booking) {
                    throw new \Exception('Booking not found');
                }
                
                // Check if vendor owns this vehicle
                if ($booking->vehicle->provider_id !== $vendorId) {
                    throw new \Exception('Unauthorized: You do not own this vehicle');
                }
                
                // Check if booking is pending
                if ($booking->status !== 'pending') {
                    throw new \Exception('Booking is not in pending status');
                }
                
                // Update booking status to cancelled
                $booking->update([
                    'status' => 'cancelled',
                    'notes' => ($booking->notes ?? '') . "\n\nRejection reason: " . $validated['reason']
                ]);
                
                // Update related multi_model_booking and leg status if exists
                $multiModelBooking = MultiModelBooking::where('vehicle_id', $booking->vehicle_id)
                    ->where('user_id', $booking->client_id)
                    ->where('status', 'pending')
                    ->whereHas('leg', function($q) use ($booking) {
                        $q->where('vehicle_id', $booking->vehicle_id);
                    })
                    ->first();
                    
                if ($multiModelBooking) {
                    $multiModelBooking->update(['status' => 'cancelled']);
                    $multiModelBooking->leg->update(['status' => 'cancelled']);
                    
                    // Update journey status
                    $journey = $multiModelBooking->journey;
                    $journey->update(['status' => 'cancelled']);
                }
            });
            
            return response()->json([
                'success' => true,
                'message' => 'Booking rejected successfully'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /* ------------ Private Helper Methods ------------ */

    private function createLegSelection(Vehicle $vehicle, array $leg, array $addons = [])
    {
        $tz = 'Asia/Colombo';
        $startDateTime = Carbon::parse($leg['start_date'] . ' ' . $leg['start_time'], $tz)->utc();
        $endDateTime = Carbon::parse($leg['end_date'] . ' ' . $leg['end_time'], $tz)->utc();

        $days = max(1, $startDateTime->diffInDays($endDateTime));
        $pricePerDay = (float) ($vehicle->rental_price_per_day ?? 0);

        // Calculate addons
        $addonsLines = [];
        $addonsTotal = 0.0;

        if (!empty($addons)) {
            $normalize = fn($s) => mb_strtolower(trim((string) $s));
            $names = collect($addons)->pluck('name')->filter()->map($normalize)->unique()->values();

            $catalog = VehicleFeaturePricing::where('vehicle_id', $vehicle->id)
                ->whereIn(DB::raw('LOWER(TRIM(additional_feature_name))'), $names)
                ->get();

            $catalogByName = $catalog->mapWithKeys(fn($row) => [
                $normalize($row->additional_feature_name) => $row
            ]);

            foreach ($addons as $row) {
                $rawName = (string) ($row['name'] ?? '');
                $nameKey = $normalize($rawName);
                $qty = max(1, (int) ($row['qty'] ?? 1));
                $price = isset($catalogByName[$nameKey])
                    ? (float) $catalogByName[$nameKey]->additional_feature_price
                    : 0.0;
                $lineTotal = $price * $qty;

                $addonsLines[] = [
                    'name' => $rawName,
                    'price' => $price,
                    'qty' => $qty,
                    'line_total' => $lineTotal,
                ];
                $addonsTotal += $lineTotal;
            }
        }

        $subtotal = $pricePerDay * $days + $addonsTotal;
        $deposit = (float) ($vehicle->deposit_amount ?? 0);
        $advance = (float) ($vehicle->advance_payment_amount ?? 0);

        return [
            'vehicle_id' => $vehicle->id,
            'vehicle_data' => [
                'name' => $vehicle->model,
                'manufacturer' => $vehicle->manufacturer,
                'registration_number' => $vehicle->registration_number,
                'type' => $vehicle->type,
                'image' => $vehicle->images->first()?->url,
            ],
            'leg_data' => $leg,
            'rental_days' => $days,
            'price_per_day' => $pricePerDay,
            'addons_total' => $addonsTotal,
            'addons_lines' => $addonsLines,
            'subtotal' => $subtotal,
            'deposit_amount' => $deposit,
            'advance_amount' => $advance,
            'total_amount' => $subtotal,
            'currency' => $vehicle->currency ?? 'USD',
        ];
    }

    private function getVehicleSpecs($vehicle)
    {
        if ($vehicle->type === 'land' && $vehicle->landSpec) {
            return [
                'bodyType' => $vehicle->landSpec->body_type,
                'transmission' => $vehicle->landSpec->transmission,
                'fuelType' => $vehicle->landSpec->fuel_type,
                'seatingCapacity' => $vehicle->landSpec->seating_capacity,
                'doors' => $vehicle->landSpec->doors,
            ];
        } elseif ($vehicle->type === 'sea' && $vehicle->seaSpec) {
            return [
                'length' => $vehicle->seaSpec->length,
                'beam' => $vehicle->seaSpec->beam,
                'draft' => $vehicle->seaSpec->draft,
                'cabins' => $vehicle->seaSpec->cabins,
                'engineType' => $vehicle->seaSpec->engine_type,
            ];
        } elseif ($vehicle->type === 'air' && $vehicle->airSpec) {
            return [
                'aircraftType' => $vehicle->airSpec->aircraft_type,
                'maxAltitude' => $vehicle->airSpec->max_altitude,
                'range' => $vehicle->airSpec->range,
                'cruiseSpeed' => $vehicle->airSpec->cruise_speed,
            ];
        }

        return null;
    }
}
