<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\WebController;
use App\Http\Controllers\ProfileController;

use App\Http\Controllers\VehicleControllers\Client\ClientVehicleController;
use App\Http\Controllers\VehicleControllers\Client\VehicleLikeController;
use App\Http\Controllers\VehicleControllers\Client\VehicleReviewController;
use App\Http\Controllers\VehicleControllers\Client\ClientBookingController;
use App\Http\Controllers\Vendor\VehicleController;

/*
|--------------------------------------------------------------------------
| Public Routes (marketing / landing)
|--------------------------------------------------------------------------
*/
Route::get('/signup', [WebController::class, 'signup'])->name('signup.signup');
Route::get('/signin', [WebController::class, 'signin'])->name('signin.signin');

Route::get('/', [WebController::class, 'landingPage'])->name('landingPage.home');
Route::get('/landingPage/blog', [WebController::class, 'blog'])->name('landingPage.blog');
Route::get('/landingPage/blogExample', [WebController::class, 'blogExample'])->name('landingPage.blogExample');

Route::get('/courier-service', [WebController::class, 'courierService'])->name('courier.service');
Route::get('/book-a-ticket', [WebController::class, 'bookATicket'])->name('book.a.ticket');
Route::get('/booking-home', [WebController::class, 'bookingHome'])->name('booking.home');
Route::get('/cargo-freight', [WebController::class, 'cargoFreight'])->name('cargo.freight');
Route::get('/freight-home', [WebController::class, 'freightHomepage'])->name('freight.home');
Route::post('/freight-quotes', [WebController::class, 'freightQuoteStore'])->name('freight-quotes.store');
Route::get('/flight-booking', [WebController::class, 'freightTicketBooking'])->name('flight.ticket');

Route::get('/drivers-home', [WebController::class, 'driversHome'])->name('drivers.home');
Route::get('/driver-search-results', [WebController::class, 'driverSearchResults'])->name('driver.search.results');
Route::get('/driver-details', [WebController::class, 'driverDetails'])->name('driver.details');

/*
|--------------------------------------------------------------------------
| Public Vehicle Browsing
|--------------------------------------------------------------------------
*/
// Route::get('/clientRent', [WebController::class, 'index'])->name('home');
Route::get('/clientRent', [ClientVehicleController::class, 'home'])->name('client.home');
Route::get('/vehicleList', [ClientVehicleController::class, 'vehicleList'])->name('vehicle.list');
Route::get('/vehicleDetails/{vehicle}', [ClientVehicleController::class, 'vehicleDetails'])->name('vehicle.details');

/*
|--------------------------------------------------------------------------
| Booking Flow (Client)
|--------------------------------------------------------------------------
*/
Route::get('/bookings/quote', [ClientBookingController::class, 'quote'])->name('bookings.quote');
Route::get('/vehicles/{vehicle}/extras', [ClientBookingController::class, 'extras'])
    ->name('vehicles.extras');

Route::patch('/bookings/{booking}/addons', [ClientBookingController::class, 'updateAddons'])
    ->name('bookings.updateAddons');

Route::middleware(['auth', 'role:client'])->group(function () {
    Route::get('/bookings/checkout', [ClientBookingController::class, 'showCheckout'])->name('bookings.checkout');
    Route::post('/bookings', [ClientBookingController::class, 'store'])->name('bookings.store');
    Route::get('/bookings/{booking}/payments', [ClientBookingController::class, 'payments'])->name('bookings.payments');
    Route::post('/bookings/{booking}/confirm', [ClientBookingController::class, 'confirm'])->name('bookings.confirm');
    Route::get('/bookings/{booking}/summary', [ClientBookingController::class, 'summary'])->name('bookings.summary');
    Route::post('/bookings/{booking}/cancel', [ClientBookingController::class, 'cancel'])->name('bookings.cancel');

    Route::post('/vehicle-like/toggle', [VehicleLikeController::class, 'toggle'])->name('vehicle.like.toggle');
    Route::get('/vehicles/{vehicle}/reviews', [VehicleReviewController::class, 'index'])->name('vehicles.reviews.index');
    Route::post('/vehicles/{vehicle}/reviews', [VehicleReviewController::class, 'store'])->name('vehicles.reviews.store');
});

/*
|--------------------------------------------------------------------------
| Vendor App (Inertia UI)  /vendors/...
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:vendor'])
    ->prefix('vendors')
    ->name('vendors.')
    ->group(function () {
        Route::get('/dashboard', fn() => Inertia::render('Web/home/vendors/Dashboard'))->name('dashboard');
        Route::get('/mainDashboard', fn() => Inertia::render('Web/home/vendors/MainDashboard'))->name('mainDashboard');
        Route::get('/bookings', fn() => Inertia::render('Web/home/vendors/Booking'))->name('bookings');
        Route::get('/clients', fn() => Inertia::render('Web/home/vendors/Client'))->name('clients');
        Route::get('/expenses', fn() => Inertia::render('Web/home/vendors/Expenses'))->name('expenses');
        Route::get('/payment', fn() => Inertia::render('Web/home/vendors/Payment'))->name('payment');
        Route::get('/tracking', fn() => Inertia::render('Web/home/vendors/Tracking'))->name('tracking');
        Route::get('/calendar', fn() => Inertia::render('Web/home/vendors/Calendar'))->name('calendar');

        Route::get('/units', fn() => Inertia::render('Web/home/vendors/Unit'))->name('units');
        Route::get('/addUnit', fn() => Inertia::render('Web/home/vendors/AddUnit'))->name('addUnit');
        Route::get('/unitDetails', fn() => Inertia::render('Web/home/vendors/UnitDetails'))->name('unitDetails');

        Route::get('/warehouse', [WebController::class, 'warehouse'])->name('warehouse.home');
        Route::get('/warehouse/unit', fn() => Inertia::render('Web/home/vendors/warehouse/Unit'))->name('warehouse.unit');
    });

/*
|--------------------------------------------------------------------------
| Vendor Backend (JSON / actions)  /vendor/...
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])
    ->prefix('vendor')
    ->name('vendor.')
    ->group(function () {
        Route::get('/vehicles', [VehicleController::class, 'index'])->name('vehicles.index');
        Route::get('/vehicles/list', [VehicleController::class, 'list'])->name('vehicles.list');
        Route::post('/vehicles', [VehicleController::class, 'store'])->name('vehicles.store.compat');
        Route::post('/vehicles/store', [VehicleController::class, 'store'])->name('vehicles.store');
        Route::delete('/vehicles/{vehicle}', [VehicleController::class, 'destroy'])->name('vehicles.destroy');
    });

/*
|--------------------------------------------------------------------------
| Client dashboard
|--------------------------------------------------------------------------
*/
Route::get('/ClientDashboard', fn() => Inertia::render('Web/home/client/ClientDashboard'))->name('ClientDashboard');

/*
|--------------------------------------------------------------------------
| Profile / App Shell
|--------------------------------------------------------------------------
*/
// Route::get('/dashboard', fn () => Inertia::render('Dashboard'))
//     ->middleware(['auth', 'verified'])
//     ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
