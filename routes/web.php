<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WebController;
use App\Http\Controllers\Vendor\VehicleController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/signup', [WebController::class, 'signup'])->name('signup.signup');
Route::get('/signin', [WebController::class, 'signin'])->name('signin.signin');

Route::get('/', [WebController::class, 'landingPage'])->name('landingPage.home');
Route::get('/landingPage/blog', [WebController::class, 'blog'])->name('landingPage.blog');
Route::get('/landingPage/blogExample', [WebController::class, 'blogExample'])->name('landingPage.blog');

Route::get('/clientRent', [WebController::class, 'index'])->name('home');
Route::get('/vehicleList', [WebController::class, 'vehicleList'])->name('vehicle.list');
Route::get('/vehicleDetails', [WebController::class, 'vehicleDetails'])->name('vehicle.details');
Route::get('/courier-service', [WebController::class, 'courierService'])->name('courier.service');
Route::get('/book-a-ticket', [WebController::class, 'bookATicket'])->name('book.a.ticket');
Route::get('/booking-home', [WebController::class, 'bookingHome'])->name('booking.home');
Route::get('/cargo-freight', [WebController::class, 'cargoFreight'])->name('cargo.freight');
Route::get('/drivers-home', [WebController::class, 'driversHome'])->name('drivers.home');
Route::get('/driver-search-results', [WebController::class, 'driverSearchResults'])->name('driver.search.results');
Route::get('/driver-details', [WebController::class, 'driverDetails'])->name('driver.details');
Route::get('/vehicle-checkout', [WebController::class, 'vehicleCheckout'])->name('vehicle.checkout');
Route::get('/vehicle-payments', [WebController::class, 'vehiclePayments'])->name('vehicle.vehiclePayments');

Route::get('/summary', [WebController::class, 'summary'])->name('summary');
Route::get('/freight-home', [WebController::class, 'freightHomepage'])->name('freight.home');
Route::post('/freight-quotes', [WebController::class, 'freightQuoteStore'])->name('freight-quotes.store');

Route::get('/flight-booking', [WebController::class, 'freightTicketBooking'])->name('flight.ticket');


// client routes
Route::middleware(['auth', 'role:client'])->group(function () {});

//warehouse
Route::get('/warehouse', [WebController::class, 'warehouse'])->name('warehouse.home');

/*
|--------------------------------------------------------------------------
| Vendor App Pages (Inertia UI)  /vendors/...
|--------------------------------------------------------------------------
| UI pages are behind auth + role:vendor to match your React router.
*/
Route::middleware(['auth', 'role:vendor'])
    ->prefix('vendors')
    ->name('vendors.')
    ->group(function () {
        Route::get('/bookings', fn () => Inertia::render('Web/home/vendors/Booking'))->name('bookings');
        Route::get('/dashboard', fn () => Inertia::render('Web/home/vendors/Dashboard'))->name('dashboard');
        Route::get('/clients', fn () => Inertia::render('Web/home/vendors/Client'))->name('clients');
        Route::get('/expenses', fn () => Inertia::render('Web/home/vendors/Expenses'))->name('expenses');
        Route::get('/payment', fn () => Inertia::render('Web/home/vendors/Payment'))->name('payment');
        Route::get('/tracking', fn () => Inertia::render('Web/home/vendors/Tracking'))->name('tracking');
        Route::get('/calendar', fn () => Inertia::render('Web/home/vendors/Calendar'))->name('calendar');
        Route::get('/mainDashboard', fn () => Inertia::render('Web/home/vendors/MainDashboard'))->name('mainDashboard');

        // Units UI
        Route::get('/units', fn () => Inertia::render('Web/home/vendors/Unit'))->name('units');
        Route::get('/addUnit', fn () => Inertia::render('Web/home/vendors/AddUnit'))->name('addUnit');

        // Warehouse UI
        Route::get('/warehouse/unit', fn () => Inertia::render('Web/home/vendors/warehouse/Unit'))->name('warehouse.unit');
    });

/*
|--------------------------------------------------------------------------
| Vendor Backend (JSON APIs & actions)  /vendor/...
|--------------------------------------------------------------------------
| The form in AddUnit posts to POST /vendor/vehicles/store
| Keep these under auth so Inertia can redirect on unauthenticated.
*/
Route::middleware(['auth'])
    ->prefix('vendor')
    ->name('vendor.')
    ->group(function () {
        // Index redirects to the Units UI (prevents 404 if someone hits /vendor/vehicles)
        Route::get('/vehicles', [VehicleController::class, 'index'])->name('vehicles.index');

        // JSON list used by Units grid
        Route::get('/vehicles/list', [VehicleController::class, 'list'])->name('vehicles.list');

        // Accept both endpoints for POST (compat + canonical)
        Route::post('/vehicles', [VehicleController::class, 'store'])->name('vehicles.store.compat');
        Route::post('/vehicles/store', [VehicleController::class, 'store'])->name('vehicles.store');

        // Delete vehicle
        Route::delete('/vehicles/{vehicle}', [VehicleController::class, 'destroy'])->name('vehicles.destroy');
    });

/*
|--------------------------------------------------------------------------
| App Shell / Profile
|--------------------------------------------------------------------------
*/
Route::get('/dashboard', fn () => Inertia::render('Dashboard'))
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile',   [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile',[ProfileController::class, 'destroy'])->name('profile.destroy');
});

//     Route::get('/calendar', function () {
//         return Inertia::render('Web/home/vendors/Calendar');
//     })->name('calendar');

//     Route::get('/addUnit', function () {
//         return Inertia::render('Web/home/vendors/AddUnit');
//     })->name('addUnit');

//     Route::get('/mainDashboard', function () {
//         return Inertia::render('Web/home/vendors/MainDashboard');
//     })->name('mainDashboard');
// });


// for now
Route::get('/bookings', function () {
    return Inertia::render('Web/home/vendors/Booking');
})->name('bookings');

Route::get('/units', function () {
    return Inertia::render('Web/home/vendors/Unit');
})->name('units');

Route::get('/dashboard', function () {
    return Inertia::render('Web/home/vendors/Dashboard');
})->name('dashboard');

Route::get('/clients', function () {
    return Inertia::render('Web/home/vendors/Client');
})->name('clients');

Route::get('/expenses', function () {
    return Inertia::render('Web/home/vendors/Expenses');
})->name('expenses');

Route::get('/payment', function () {
    return Inertia::render('Web/home/vendors/Payment');
})->name('payment');

Route::get('/tracking', function () {
    return Inertia::render('Web/home/vendors/Tracking');
})->name('tracking');

Route::get('/calendar', function () {
    return Inertia::render('Web/home/vendors/Calendar');
})->name('calendar');

Route::get('/addUnit', function () {
    return Inertia::render('Web/home/vendors/AddUnit');
})->name('addUnit');

Route::get('/mainDashboard', function () {
    return Inertia::render('Web/home/vendors/MainDashboard');
})->name('mainDashboard');

Route::get('/unitDetails', function () {
    return Inertia::render('Web/home/vendors/UnitDetails');
})->name('mainDashboard');
// end



// Client
Route::get('/ClientDashboard', function () {
    return Inertia::render('Web/home/client/ClientDashboard');
})->name('ClientDashboard');









// vendor - warehouse rent
Route::get('/warehouse/unit', function () {
    return Inertia::render('Web/home/vendors/warehouse/Unit');
})->name('warehouse.Unit');




// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

// Route::middleware('auth')->group(function () {
//     Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
//     Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
//     Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
// });

require __DIR__ . '/auth.php';
