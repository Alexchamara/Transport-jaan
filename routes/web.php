<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WebController;

// Vendor controllers
use App\Http\Controllers\Vendor\VehicleController;
use App\Http\Controllers\Vendor\DashboardController;
use App\Http\Controllers\Vendor\BookingController as VendorBookingController;
use App\Http\Controllers\Vendor\VehicleMaintenanceController;
use App\Http\Controllers\Vendor\DriverController;

// PDFs
use App\Http\Controllers\VehiclePolicyController;

// Client-side browsing/controllers
use App\Http\Controllers\VehicleControllers\Client\ClientVehicleController;
use App\Http\Controllers\VehicleControllers\Client\VehicleLikeController;
use App\Http\Controllers\VehicleControllers\Client\VehicleReviewController;
use App\Http\Controllers\VehicleControllers\Client\ClientBookingController;

/*
|--------------------------------------------------------------------------
| Small helper to render an Inertia view
|--------------------------------------------------------------------------
*/
$render = function (string $view) {
    return function () use ($view) {
        return Inertia::render($view);
    };
};

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

Route::get('/vehicle-checkout', [WebController::class, 'vehicleCheckout'])->name('vehicle.checkout');
Route::get('/vehicle-payments', [WebController::class, 'vehiclePayments'])->name('vehicle.vehiclePayments');

Route::get('/summary', [WebController::class, 'summary'])->name('summary');

// Ticket booking (public screens)
Route::get('/ticketBooking', [WebController::class, 'ticketBooking'])->name('ticketBooking.ticketBooking');
Route::get('/trainTicketBookingDetails', [WebController::class, 'TrainTicketBookingDetails'])->name('TrainTicketBookingDetails.TrainTicketBookingDetails');
Route::get('/trainTicketBookingPreview', [WebController::class, 'trainTicketBookingPreview'])->name('trainTicketBookingPreview.trainTicketBookingPreview');
Route::get('/busTicketBookingDetails', [WebController::class, 'busTicketBookingDetails'])->name('busTicketBookingDetails.busTicketBookingDetails');
Route::get('/busTicketBookingPreview', [WebController::class, 'busTicketBookingPreview'])->name('busTicketBookingPreview.busTicketBookingPreview');
Route::get('/flightBooking', [WebController::class, 'flightBooking'])->name('flightBooking.flightBooking');

// Warehouse (public landing)
Route::get('/warehouse', [WebController::class, 'warehouse'])->name('warehouse.home');

/*
|--------------------------------------------------------------------------
| Public Vehicle Browsing
|--------------------------------------------------------------------------
*/
Route::get('/clientRent', [ClientVehicleController::class, 'home'])->name('client.home');
Route::get('/vehicleList', [ClientVehicleController::class, 'vehicleList'])->name('vehicle.list');
Route::get('/vehicleDetails/{vehicle}', [ClientVehicleController::class, 'vehicleDetails'])->name('vehicle.details');

/*
|--------------------------------------------------------------------------
| Client booking flow (some public screens + protected actions)
|--------------------------------------------------------------------------
*/
Route::prefix('client')->as('client.')->group(function () {
    Route::get('/bookings/quote', [ClientBookingController::class, 'quote'])->name('bookings.quote');
    Route::get('/vehicles/{vehicle}/extras', [ClientBookingController::class, 'extras'])->name('vehicles.extras');
    Route::patch('/bookings/{booking}/addons', [ClientBookingController::class, 'updateAddons'])->name('bookings.updateAddons');

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

        Route::get('/vehicles/{vehicle}/policy/preview', [ClientVehicleController::class, 'policyPreview'])->name('vehicles.policy.preview');
    });
});

/*
|--------------------------------------------------------------------------
| Vendor App (Inertia UI)  /vendors/...
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:vendor'])
    ->prefix('vendors')
    ->name('vendors.')
    ->group(function () use ($render) {
        // Dashboard with real props
        Route::get('/dashbord', [DashboardController::class, 'index'])->name('dashboard'); // legacy spelling
        Route::get('/dashboard', [DashboardController::class, 'index']); // alias

        // Bookings page with DB-fed props (table + chart)
        Route::get('/bookings', [VendorBookingController::class, 'page'])->name('bookings');

        // Other pages (shells)
        Route::get('/mainDashboard', $render('Web/home/vendors/MainDashboard'))->name('mainDashboard');
        Route::get('/clients',       $render('Web/home/vendors/Client'))->name('clients');
        Route::get('/expenses',      $render('Web/home/vendors/Expenses'))->name('expenses');
        Route::get('/payment',       $render('Web/home/vendors/Payment'))->name('payment');
        Route::get('/tracking',      $render('Web/home/vendors/Tracking'))->name('tracking');
        Route::get('/calendar',      $render('Web/home/vendors/Calendar'))->name('calendar');

        // Units UI
        Route::get('/units',         $render('Web/home/vendors/Unit'))->name('units');
        Route::get('/addUnit',       $render('Web/home/vendors/AddUnit'))->name('addUnit');
        Route::get('/addUnit/{vehicle}', [VehicleController::class, 'edit'])->name('addUnit.edit');
        Route::get('/unitDetails',   $render('Web/home/vendors/UnitDetails'))->name('unitDetails');
        Route::get('/unitDetails/{vehicle}', [VehicleController::class, 'detailsPage'])->name('unitDetails.show');

        // Warehouse UI
        Route::get('/warehouse',     [WebController::class, 'warehouse'])->name('warehouse.home');
        Route::get('/warehouse/unit',$render('Web/home/vendors/warehouse/Unit'))->name('warehouse.unit');

        // Drivers UI
        Route::get('/drivers',       $render('Web/components/vendors/driver/Driver'))->name('drivers');
    });

/*
|--------------------------------------------------------------------------
| Vendor Backend (JSON / actions)  /vendor/...
|--------------------------------------------------------------------------
*/
Route::middleware(['auth']) // remove 'auth' here temporarily if testing unauthenticated
    ->prefix('vendor')
    ->name('vendor.')
    ->group(function () {
        // Vehicles CRUD
        Route::get('/vehicles', [VehicleController::class, 'index'])->name('vehicles.index');
        Route::get('/vehicles/list', [VehicleController::class, 'list'])->name('vehicles.list');
        Route::post('/vehicles', [VehicleController::class, 'store'])->name('vehicles.store.compat'); // legacy compat
        Route::post('/vehicles/store', [VehicleController::class, 'store'])->name('vehicles.store');
        Route::get('/vehicles/{vehicle}', [VehicleController::class, 'show'])->name('vehicles.show');
        Route::put('/vehicles/{vehicle}', [VehicleController::class, 'update'])->name('vehicles.update');
        Route::delete('/vehicles/{vehicle}', [VehicleController::class, 'destroy'])->name('vehicles.destroy');

        // Maintenance
        Route::post('/vehicles/{vehicle}/maintenance', [VehicleMaintenanceController::class, 'store'])->name('vehicles.maintenance.store');
        Route::get('/vehicles/{vehicle}/bookings/overlaps', [VehicleMaintenanceController::class, 'overlaps'])->name('vehicles.bookings.overlaps');
        Route::post('/vehicles/maintenance/notify', [VehicleMaintenanceController::class, 'notify'])->name('vehicles.maintenance.notify');

        // PDF policy
        Route::post('/vehicles/{vehicle}/policy', [VehiclePolicyController::class, 'store'])->name('vehicles.policy.store');
        Route::delete('/vehicles/{vehicle}/policy', [VehiclePolicyController::class, 'destroy'])->name('vehicles.policy.destroy');
        Route::get('/vehicles/{vehicle}/policy/view', [VehiclePolicyController::class, 'stream'])->name('vehicles.policy.stream');

        // Drivers JSON CRUD
        Route::get('/drivers', [DriverController::class, 'index'])->name('drivers.index');
        Route::post('/drivers', [DriverController::class, 'store'])->name('drivers.store');
        Route::get('/drivers/{driver}', [DriverController::class, 'show'])->name('drivers.show');
        Route::match(['put', 'post'], '/drivers/{driver}', [DriverController::class, 'update'])->name('drivers.update');
        Route::delete('/drivers/{driver}', [DriverController::class, 'destroy'])->name('drivers.destroy');

        // Image preview + download (auth-aware)
        Route::get('/drivers/{driver}/license/stream',   [DriverController::class, 'streamLicense'])->name('drivers.license.stream');
        Route::get('/drivers/{driver}/license/download', [DriverController::class, 'downloadLicense'])->name('drivers.license.download');
        Route::get('/drivers/{driver}/nic/stream',       [DriverController::class, 'streamNic'])->name('drivers.nic.stream');
        Route::get('/drivers/{driver}/nic/download',     [DriverController::class, 'downloadNic'])->name('drivers.nic.download');
    });

/*
|--------------------------------------------------------------------------
| Client dashboard (public shell)
|--------------------------------------------------------------------------
*/
Route::get('/ClientDashboard', $render('Web/home/client/ClientDashboard'))->name('ClientDashboard');

/*
|--------------------------------------------------------------------------
| Profile / App Shell
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

/*
|--------------------------------------------------------------------------
| Legacy redirects (keep all)
|--------------------------------------------------------------------------
*/
Route::redirect('/units', '/vendors/units')->name('units.legacy');
Route::redirect('/bookings', '/vendors/bookings')->name('bookings.legacy');
Route::redirect('/clients', '/vendors/clients')->name('clients.legacy');
Route::redirect('/expenses', '/vendors/expenses')->name('expenses.legacy');
Route::redirect('/payment', '/vendors/payment')->name('payment.legacy');
Route::redirect('/tracking', '/vendors/tracking')->name('tracking.legacy');
Route::redirect('/calendar', '/vendors/calendar')->name('calendar.legacy');
Route::redirect('/addUnit', '/vendors/addUnit')->name('addUnit.legacy');
Route::redirect('/unitDetails', '/vendors/unitDetails')->name('unitDetails.legacy');
Route::redirect('/dashboard', '/vendors/dashbord')->name('dashboard.legacy');

/*
|--------------------------------------------------------------------------
| Extra vendor dashboards (warehouse / ticket / courier / freight / multimodal)
|  — generated compactly (no routes removed)
|--------------------------------------------------------------------------
*/
$sections = [
    'warehouse'     => 'Web/home/vendors/warehouse',
    'ticketBooking' => 'Web/home/vendors/ticketBooking',
    'courierService'=> 'Web/home/vendors/courierService',
    'freight'       => 'Web/home/vendors/freight',
    'multimodal'    => 'Web/home/vendors/multimodal',
];

$pages = [
    // view folder => route path/name
    'Booking'      => 'bookings',
    'Unit'         => 'units',
    'Dashboard'    => 'dashboard',
    'Client'       => 'clients',
    'Expenses'     => 'expenses',
    'Payment'      => 'payment',
    'Tracking'     => 'tracking',
    'Calendar'     => 'calendar',
    'AddUnit'      => 'addUnit',
    'UnitDetails'  => 'unitDetails',
    'SettingsPage' => 'settingsPage',
];

foreach ($sections as $slug => $baseView) {
    Route::prefix($slug)->group(function () use ($slug, $baseView, $pages, $render) {
        foreach ($pages as $view => $route) {
            Route::get("/{$route}", $render("{$baseView}/{$view}"))->name("{$slug}.{$route}");
        }
    });
}

/*
|--------------------------------------------------------------------------
| Client dashboards (public shells)
|--------------------------------------------------------------------------
*/
Route::get('/clientDashboard',           $render('Web/home/client/ClientDashboard'))->name('clientDashboard');
Route::get('/clientDashboardSettings',   $render('Web/home/client/ClientDashboardSettings'))->name('clientDashboardSettings');
Route::get('/clientTicketBookingDashboard', $render('Web/home/client/ClientTicketBookingDashboard'))->name('clientTicketBookingDashboard');
Route::get('/courierBookingDashboard',   $render('Web/home/client/CourierBookingDashboard'))->name('courierBookingDashboard');
Route::get('/warehouseBookingDashboard', $render('Web/home/client/WarehouseBookingDashboard'))->name('warehouseBookingDashboard');
Route::get('/freightBookingDashboard',   $render('Web/home/client/FreightBookingDashboard'))->name('freightBookingDashboard');

/*
|--------------------------------------------------------------------------
| Keep your global compat route (not removed)
|--------------------------------------------------------------------------
*/
Route::post('/drivers/{driver}', [DriverController::class, 'update'])->name('drivers.update.compat');

/*
|--------------------------------------------------------------------------
| Storage streaming/downloading helpers
| (lets /storage/... work even without the public/storage symlink)
|--------------------------------------------------------------------------
*/
Route::get('/storage/{path}', function ($path) {
    if (!Storage::disk('public')->exists($path)) {
        abort(404);
    }
    return Storage::disk('public')->response($path);
})->where('path', '.*');

Route::get('/storage/download/{path}', function ($path) {
    if (!Storage::disk('public')->exists($path)) {
        abort(404);
    }
    $name = request()->query('name');
    return Storage::disk('public')->download($path, $name ?: basename($path));
})->where('path', '.*');

/*
|--------------------------------------------------------------------------
| Auth scaffolding
|--------------------------------------------------------------------------
*/
require __DIR__ . '/auth.php';
