<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
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

    public function summary()
    {
        return Inertia::render('Web/home/land/Summary');
    }

    public function freightHomepage()
    {
        return Inertia::render('Web/home/freight/Homepage');
    }

    public function freightTicketBooking()
    {
        return Inertia::render('Web/home/flight/TicketBooking');
    }

    public function landingPage()
    {
        return Inertia::render('Web/home/landingPages/LandingPage');
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
