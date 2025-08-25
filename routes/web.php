<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WebController;
use App\Http\Controllers\VehicleControllers\Client\ClientVehicleController;
use App\Http\Controllers\VehicleControllers\Client\VehicleLikeController;
use App\Http\Controllers\VehicleControllers\Client\VehicleReviewController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// -------------------------------
// 🌐 Public Routes
// -------------------------------

// Auth
Route::get('/signup', [WebController::class, 'signup'])->name('signup.signup');
Route::get('/signin', [WebController::class, 'signin'])->name('signin.signin');

// Landing pages
Route::get('/', [WebController::class, 'landingPage'])->name('landingPage.home');
Route::get('/landingPage/blog', [WebController::class, 'blog'])->name('landingPage.blog');
Route::get('/landingPage/blogExample', [WebController::class, 'blogExample'])->name('blogExample.blog');

Route::get('/courier-service', [WebController::class, 'courierService'])->name('courier.service');
Route::get('/book-a-ticket', [WebController::class, 'bookATicket'])->name('book.a.ticket');
Route::get('/booking-home', [WebController::class, 'bookingHome'])->name('booking.home');
Route::get('/cargo-freight', [WebController::class, 'cargoFreight'])->name('cargo.freight');
Route::get('/drivers-home', [WebController::class, 'driversHome'])->name('drivers.home');
Route::get('/driver-search-results', [WebController::class, 'driverSearchResults'])->name('driver.search.results');
Route::get('/driver-details', [WebController::class, 'driverDetails'])->name('driver.details');
Route::get('/vehicle-checkout', [WebController::class, 'vehicleCheckout'])->name('vehicle.checkout');
Route::get('/vehicle-payments', [WebController::class, 'vehiclePayments'])->name('vehicle.payments');

Route::get('/summary', [WebController::class, 'summary'])->name('summary');
Route::get('/freight-home', [WebController::class, 'freightHomepage'])->name('freight.home');
Route::post('/freight-quotes', [WebController::class, 'freightQuoteStore'])->name('freight-quotes.store');
Route::get('/flight-booking', [WebController::class, 'freightTicketBooking'])->name('flight.ticket');

// -------------------------------
// 🚗 Client-facing vehicle browsing (public)
// -------------------------------
Route::get('/clientRent', [ClientVehicleController::class, 'home'])->name('client.home');
Route::get('/vehicleList', [ClientVehicleController::class, 'vehicleList'])->name('vehicle.list');
Route::get('/vehicleDetails/{vehicle}', [ClientVehicleController::class, 'vehicleDetails'])->name('vehicle.details');

// -------------------------------
// 👤 Client routes (authenticated clients)
// -------------------------------
Route::middleware(['auth', 'role:client'])->group(function () {
    // Like
    Route::post('/vehicle-like/toggle', [VehicleLikeController::class, 'toggle'])->name('vehicle.like.toggle');

    // Vehicle Reviews
    Route::get('/vehicles/{vehicle}/reviews', [VehicleReviewController::class, 'index'])
        ->name('vehicles.reviews.index');
    Route::post('/vehicles/{vehicle}/reviews', [VehicleReviewController::class, 'store'])
        ->name('vehicles.reviews.store');
});

// -------------------------------
// 🛍️ Vendor routes
// -------------------------------
Route::middleware(['auth', 'role:vendor'])->prefix('vendors')->name('vendors.')->group(function () {
    // Vendor dashboards/pages
    Route::get('/dashboard', fn () => Inertia::render('Web/home/vendors/Dashboard'))->name('dashboard');
    Route::get('/mainDashboard', fn () => Inertia::render('Web/home/vendors/MainDashboard'))->name('mainDashboard');
    Route::get('/bookings', fn () => Inertia::render('Web/home/vendors/Booking'))->name('bookings');
    Route::get('/clients', fn () => Inertia::render('Web/home/vendors/Client'))->name('clients');
    Route::get('/expenses', fn () => Inertia::render('Web/home/vendors/Expenses'))->name('expenses');
    Route::get('/payment', fn () => Inertia::render('Web/home/vendors/Payment'))->name('payment');
    Route::get('/tracking', fn () => Inertia::render('Web/home/vendors/Tracking'))->name('tracking');
    Route::get('/calendar', fn () => Inertia::render('Web/home/vendors/Calendar'))->name('calendar');
    Route::get('/units', fn () => Inertia::render('Web/home/vendors/Unit'))->name('units'); // (kept one)
    Route::get('/addUnit', fn () => Inertia::render('Web/home/vendors/AddUnit'))->name('addUnit');
    Route::get('/unitDetails', fn () => Inertia::render('Web/home/vendors/UnitDetails'))->name('unitDetails'); // fixed name

    // Warehouse
    Route::get('/warehouse', [WebController::class, 'warehouse'])->name('warehouse.home');
    Route::get('/warehouse/unit', fn () => Inertia::render('Web/home/vendors/warehouse/Unit'))->name('warehouse.unit');

    // (Optional) If you really need vendor-specific landing/auth variants under /vendors:
    Route::get('/', [WebController::class, 'landingPage'])->name('landingPage.home');
    Route::get('/landingPage/blog', [WebController::class, 'blog'])->name('landingPage.blog');
    Route::get('/landingPage/blogExample', [WebController::class, 'blogExample'])->name('blogExample.blog');
    Route::get('/signup', [WebController::class, 'signup'])->name('signup.signup');
    Route::get('/signin', [WebController::class, 'signin'])->name('signin.signin');
    Route::get('/registerNew', [WebController::class, 'register'])->name('register.register');
});

// -------------------------------
// 👤 Client dashboard (if needed under vendors group? probably public or client auth)
// -------------------------------
Route::get('/ClientDashboard', fn () => Inertia::render('Web/home/client/ClientDashboard'))->name('ClientDashboard');

// Auth scaffolding
require __DIR__ . '/auth.php';
