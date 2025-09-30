<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use App\Models\FreightQuote;
use App\Mail\FreightQuoteSubmitted;
use Inertia\Inertia;
use App\Models\Vehicle;
use App\Models\Warehouse\WarehouseUnit;



class WebController extends Controller
{
    public function index()
    {
        return Inertia::render('Web/home/HomePage');
    }

    public function vehicleList(Request $request)
    {
        $query = \App\Models\Vehicle::with(['images', 'land', 'vendor'])
            ->where('category', 'land');

        if ($request->has('brand')) {
            $query->where('manufacturer', 'like', '%' . $request->brand . '%');
        }

        if ($request->has('bodyType')) {
            $query->whereHas('landSpec', function ($q) use ($request) {
                $q->where('body_type', $request->bodyType);
            });
        }

        $vehicles = $query->get()->map(function ($vehicle) {
            return [
                'id' => $vehicle->id,
                'name' => $vehicle->model,
                'brand' => $vehicle->manufacturer,
                'price' => 89,
                'image' => $vehicle->images->first() ? asset('storage/' . $vehicle->images->first()->image_path) : null,
                'bodyType' => $vehicle->landSpec ? $vehicle->landSpec->body_type : null,
                'vendor' => $vehicle->provider ? [
                    'id' => $vehicle->provider->id,
                    'name' => $vehicle->provider->business_name
                ] : null
            ];
        });

        return Inertia::render('Web/home/vehicleList', [
            'vehicles' => [],
            'searchParams' => $request->all()
        ]);
    }

    public function vehicleDetails(Request $request)
    {
        return Inertia::render('Web/home/land/VehicleDetails', [
            'vehicle' => $request->vehicle,
            'searchParams' => $request->except('vehicle')
        ]);
    }

    public function courierService()
    {
        return Inertia::render('Web/home/CourierService');
    }

    public function bookATicket()
    {
        return Inertia::render('Web/home/BookATicket');
    }

    public function bookingHome()
    {
        return Inertia::render('Web/home/BookingHomePage');
    }

    public function cargoFreight()
    {
        return Inertia::render('Web/home/cargoAndFreight/HomePage');
    }

    public function driversHome()
    {
        return Inertia::render('Web/home/DriversHomePage');
    }

    public function driverSearchResults(Request $request)
    {
        return Inertia::render('Web/home/DriverSearchResults', [
            'searchParams' => $request->all()
        ]);
    }

    public function driverDetails(Request $request)
    {
        return Inertia::render('Web/home/DriverDetails', [
            'driver' => $request->driver,
        ]);
    }

    public function vehicleCheckout()
    {
        return Inertia::render('Web/home/land/VehicleCheckout');
    }

    public function vehiclePayments()
    {
        return Inertia::render('Web/home/land/VehiclePayments');
    }

    public function summary()
    {
        return Inertia::render('Web/home/land/Summary');
    }

    public function freightHomepage()
    {
        return Inertia::render('Web/home/freight/Homepage');
    }






    public function freightQuoteStore(Request $request)
    {
        try {
            // Validate the request
            $validated = $request->validate([
                'origin'            => 'required|string|max:255',
                'destination'       => 'required|string|max:255',
                'load_type'         => 'required|string|max:100',
                'goods_description' => 'required|string',
                'length_cm'         => 'nullable|numeric|min:0',
                'width_cm'          => 'nullable|numeric|min:0',
                'height_cm'         => 'nullable|numeric|min:0',
                'total_weight_kg'   => 'required|numeric|min:0',
                'preferred_method'  => 'required|string|in:Air,Sea,Road',
                'shipping_date'     => 'required|date|after_or_equal:today',
                'notes'             => 'nullable|string',
            ]);

            // Create the freight quote
            $quote = FreightQuote::create(array_merge($validated, [
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]));


            try {
                Mail::send(new FreightQuoteSubmitted($quote));


                Log::info('Freight quote email sent successfully', [
                    'quote_id' => $quote->id,
                    'recipients' => ['alexchamara56@gmail@gmail.com', 'alexchamara76@gmail.com']
                ]);
            } catch (\Exception $emailException) {

                Log::error('Failed to send freight quote email', [
                    'quote_id' => $quote->id,
                    'error' => $emailException->getMessage()
                ]);
            }

            return back()->with('success', 'Freight quote submitted successfully! Quote ID: #' . $quote->id . '. We will contact you soon with a quotation.');
        } catch (\Illuminate\Validation\ValidationException $e) {

            return back()->withErrors($e->validator)->withInput();
        } catch (\Exception $e) {

            Log::error('Freight Quote Submission Error: ' . $e->getMessage());

            return back()->with('error', 'There was an error submitting your quote. Please try again or contact support.')
                ->withInput();
        }
    }




    public function freightTicketBooking()
    {
        return Inertia::render('Web/home/ticketBooking/TicketBooking');
    }

    public function ticketBooking()
    {
        return Inertia::render('Web/home/ticketBooking/TicketBooking');
    }

    public function TrainTicketBookingDetails()
    {
        return Inertia::render('Web/home/ticketBooking/TrainTicketBookingDetails');
    }

    public function busTicketBookingDetails(Request $request)
    {
        // Get stations for dropdown
        $stations = \App\Models\BusStation::where('status', 'active')->get();

        $schedules = collect();
        $searchParams = [
            'from' => $request->input('from'),
            'to' => $request->input('to'),
            'date' => $request->input('date')
        ];

        if ($searchParams['from'] && $searchParams['to'] && $searchParams['date']) {
            // Find departure and arrival stations
            $departureStation = \App\Models\BusStation::where('name', $searchParams['from'])->first();
            $arrivalStation = \App\Models\BusStation::where('name', $searchParams['to'])->first();

            if ($departureStation && $arrivalStation) {
                $schedules = \App\Models\BusSchedule::with(['bus', 'departureStation', 'arrivalStation'])
                    ->where('departure_station_id', $departureStation->id)
                    ->where('arrival_station_id', $arrivalStation->id)
                    ->where('date', $searchParams['date'])
                    ->where('status', 'active')
                    ->orderBy('departure_time')
                    ->get()
                    ->map(function ($schedule) {
                        return [
                            'id' => $schedule->id,
                            'operator' => $schedule->bus->operator,
                            'busType' => $schedule->bus->bus_type,
                            'routeNo' => $schedule->bus->route_number,
                            'busNo' => $schedule->bus->bus_number,
                            'depart' => date('g:i A', strtotime($schedule->departure_time)),
                            'arrive' => date('g:i A', strtotime($schedule->arrival_time)),
                            'day' => date('j M', strtotime($schedule->date)),
                            'duration' => $schedule->getFormattedDurationAttribute(),
                            'price' => $schedule->price,
                            'seatsAvailable' => $schedule->available_seats,
                            'totalSeats' => $schedule->bus->capacity,
                            'expressway' => $schedule->is_expressway,
                            'soldOut' => $schedule->available_seats <= 0,
                            'facilities' => $schedule->bus->facilities ?? [],
                            'departureStation' => $schedule->departureStation->name,
                            'arrivalStation' => $schedule->arrivalStation->name,
                        ];
                    });
            }
        }

        return Inertia::render('Web/home/ticketBooking/BusTicketBookingDetails', [
            'stations' => $stations,
            'schedules' => $schedules,
            'searchParams' => $searchParams
        ]);
    }

    public function flightBooking()
    {
        return Inertia::render('Web/home/ticketBooking/FlightBooking');
    }

    public function trainTicketBookingPreview()
    {
        return Inertia::render('Web/home/ticketBooking/TrainTicketBookingPreview');
    }

    public function busTicketBookingPreview(Request $request)
    {
        $scheduleId = $request->get('id');
        $searchParams = [
            'from' => $request->get('from'),
            'to' => $request->get('to'),
            'date' => $request->get('date'),
            'passengers' => $request->get('passengers', 1)
        ];

        $schedule = null;
        $tripData = null;

        if ($scheduleId) {
            $schedule = \App\Models\BusSchedule::with(['bus', 'departureStation', 'arrivalStation'])
                ->find($scheduleId);

            if ($schedule) {
                $tripData = [
                    'id' => $schedule->id,
                    'operator' => $schedule->bus->operator,
                    'busType' => $schedule->bus->bus_type,
                    'routeNo' => $schedule->bus->route_number,
                    'busNo' => $schedule->bus->bus_number,
                    'depart' => date('g:i A', strtotime($schedule->departure_time)),
                    'arrive' => date('g:i A', strtotime($schedule->arrival_time)),
                    'day' => date('j M', strtotime($schedule->date)),
                    'duration' => $schedule->getFormattedDurationAttribute(),
                    'price' => $schedule->price,
                    'seatsAvailable' => $schedule->available_seats,
                    'totalSeats' => $schedule->bus->capacity,
                    'expressway' => $schedule->is_expressway,
                    'soldOut' => $schedule->available_seats <= 0,
                    'facilities' => $schedule->bus->facilities ?? [],
                    'departureStation' => $schedule->departureStation->name,
                    'arrivalStation' => $schedule->arrivalStation->name,
                ];
            }
        }

        return Inertia::render('Web/home/ticketBooking/BusTicketBookingPreview', [
            'trip' => $tripData,
            'searchParams' => $searchParams
        ]);
    }




    public function landingPage()
    {
        return Inertia::render('Web/home/landingPages/LandingPage', [
            'auth' => [
                'user' => Auth::user() ? [
                    'id' => Auth::user()->id,
                    'role' => Auth::user()->role,
                    // ...other user fields
                ] : null
            ]
        ]);
    }

    public function blog()
    {
        return Inertia::render('Web/home/landingPages/Blog');
    }

    public function blogExample()
    {
        return Inertia::render('Web/home/landingPages/BlogExample');
    }

    public function signin()
    {
        return Inertia::render('Web/home/auth/Signup');
    }

    public function signup()
    {
        return Inertia::render('Web/home/auth/Signin');
    }

    public function register()
    {
        return Inertia::render('Web/home/auth/Register');
    }

    public function warehouse()
    {
        return Inertia::render('Web/home/warehouse/WarehouseHome');
    }

    public function warehouseList(Request $request)
    {
        // Get approved and active warehouses from database
        $searchParams = $request->all();
        
        $query = WarehouseUnit::approved()
            ->active();

        // Apply filters based on search parameters

        // Location filter (from both search form and filter sidebar)
        if (isset($searchParams['location']) && !empty($searchParams['location'])) {
            $query->where('address', 'LIKE', '%' . $searchParams['location'] . '%');
        }
        if (isset($searchParams['warehouseLocation']) && !empty($searchParams['warehouseLocation'])) {
            $query->where('address', 'LIKE', '%' . $searchParams['warehouseLocation'] . '%');
        }

        // Warehouse type filter
        if (isset($searchParams['warehouseType']) && !empty($searchParams['warehouseType'])) {
            $query->where('type', $searchParams['warehouseType']);
        }

        // Required space filter (from search form)
        if (isset($searchParams['requiredSpace']) && !empty($searchParams['requiredSpace'])) {
            $query->where('total_area', '>=', $searchParams['requiredSpace']);
        }

        // Size filter (from filter sidebar)
        if (isset($searchParams['size']) && !empty($searchParams['size'])) {
            switch ($searchParams['size']) {
                case 'small':
                    $query->where('total_area', '<', 5000);
                    break;
                case 'medium':
                    $query->whereBetween('total_area', [5000, 20000]);
                    break;
                case 'large':
                    $query->whereBetween('total_area', [20000, 50000]);
                    break;
                case 'xlarge':
                    $query->where('total_area', '>=', 50000);
                    break;
            }
        }

        // Price filter
        if (isset($searchParams['price']) && !empty($searchParams['price'])) {
            switch ($searchParams['price']) {
                case '0-5000':
                    $query->where('price', '<=', 5000);
                    break;
                case '5000-15000':
                    $query->whereBetween('price', [5000, 15000]);
                    break;
                case '15000-30000':
                    $query->whereBetween('price', [15000, 30000]);
                    break;
                case '30000plus':
                    $query->where('price', '>=', 30000);
                    break;
            }
        }

        // Features filter (amenities in database)
        if (isset($searchParams['features']) && !empty($searchParams['features'])) {
            $features = is_array($searchParams['features']) ? $searchParams['features'] : [$searchParams['features']];
            foreach ($features as $feature) {
                $query->whereJsonContains('amenities', $feature);
            }
        }

        // Move-in date filter (you can add date-based filtering if needed)
        // if (isset($searchParams['moveinDate']) && !empty($searchParams['moveinDate'])) {
        //     // Add date-based filtering logic if your model supports availability dates
        // }

        // Lease duration filter (you can add duration-based filtering if needed)
        // if (isset($searchParams['leaseDuration']) && !empty($searchParams['leaseDuration'])) {
        //     // Add lease duration filtering logic if your model supports it
        // }

        $warehouses = $query->with(['images' => function($q) {
            $q->active()->ordered();
        }, 'mainImage'])->orderBy('created_at', 'desc')->get();

        return Inertia::render('Web/home/warehouse/WarehouseList', [
            'warehouses' => $warehouses,
            'searchParams' => $searchParams
        ]);
    }

    public function warehouseDetails(Request $request)
    {
        $warehouseData = $request->get('warehouse');

        if (!$warehouseData) {
            return redirect()->route('warehouse.list');
        }

        // Get related warehouses (same type, different warehouse)
        $relatedWarehouses = WarehouseUnit::approved()
            ->active()
            ->where('type', $warehouseData['type'] ?? '')
            ->where('id', '!=', $warehouseData['id'])
            ->limit(3)
            ->get();

        return Inertia::render('Web/home/warehouse/WarehouseDetails', [
            'warehouse' => $warehouseData,
            'relatedWarehouses' => $relatedWarehouses
        ]);
    }

    /**
     * Redirect to appropriate dashboard based on user role
     */
    public function redirectToDashboard()
    {
        if (!Auth::check()) {
            return redirect()->route('signin.signin');
        }

        $user = Auth::user();

        switch ($user->role) {
            case 'client':
                return redirect()->route('client.mainDashboard');
            case 'vendor':
                return redirect()->route('vendor.dashboard');
            case 'SuperAdmin':
                return redirect()->route('superadmin.dashboard');
            default:
                return redirect()->route('user.dashboard');
        }
    }
}
