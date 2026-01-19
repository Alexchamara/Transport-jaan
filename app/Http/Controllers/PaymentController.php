<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\BookingPayment;
use App\Models\AirVehicleBookingPayment;
use App\Models\SeaVehicleBookingPayment;

class PaymentController extends Controller
{
    public function index()
    {
        $bookingPayments = BookingPayment::all();
        $airVehiclePayments = AirVehicleBookingPayment::all();
        $seaVehiclePayments = SeaVehicleBookingPayment::all();

        return view('SuperAdmin.Payments', [
            'bookingPayments' => $bookingPayments,
            'airVehiclePayments' => $airVehiclePayments,
            'seaVehiclePayments' => $seaVehiclePayments,
        ]);
    }
}