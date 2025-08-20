<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WebController extends Controller
{
    public function index()
    {
        return Inertia::render('Web/home/HomePage');
    }

    public function vehicleList(Request $request)
    {
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
}
