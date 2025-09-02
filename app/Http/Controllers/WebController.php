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

        // Apply filters if they exist
        if ($request->has('brand')) {
            $query->where('manufracture', 'like', '%' . $request->brand . '%');
        }

        if ($request->has('bodyType')) {
            $query->whereHas('land', function ($q) use ($request) {
                $q->where('body_type', $request->bodyType);
            });
        }

        $vehicles = $query->get()->map(function ($vehicle) {
            return [
                'id' => $vehicle->id,
                'name' => $vehicle->model,
                'brand' => $vehicle->manufracture,
                'price' => 89, // You might want to add a price field to your vehicles table
                'image' => $vehicle->images->first() ? asset('storage/' . $vehicle->images->first()->image_path) : null,
                'bodyType' => $vehicle->land ? $vehicle->land->body_type : null,
                'vendor' => $vehicle->vendor ? [
                    'id' => $vehicle->vendor->id,
                    'name' => $vehicle->vendor->business_name
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
        return Inertia::render('Web/home/flight/TicketBooking');
    }

    public function ticketBooking()
    {
        return Inertia::render('Web/home/ticketBooking/TicketBooking');
    }

    public function landingPage()
    {
        return Inertia::render('Web/home/landingPages/LandingPage',[
            'auth' => [
                'user' => Auth::user() ? [
                    'id' => Auth::user()->id,
                    'role' => Auth::user()->role,
                    // ...other user fields
                ]:null
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
}
