<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WebController;
use App\Http\Controllers\FlightBookingController;
use App\Http\Controllers\WarehouseControllers\Client\WarehouseBookingController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\WarehouseControllers\Vendor\WarehouseUnitController;

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
Route::post('/flight-bookings', [FlightBookingController::class, 'store'])->name('flight-bookings.store');

// Warehouse (public landing)
Route::get('/warehouse', [WebController::class, 'warehouse'])->name('warehouse.home');
Route::get('/warehouseList', [WebController::class, 'warehouseList'])->name('warehouse.list');
Route::get('/warehouseDetails', [WebController::class, 'warehouseDetails'])->name('warehouse.details');

// Warehouse booking flow
Route::prefix('warehouse-bookings')->name('warehouse-bookings.')->group(function () {
    // Public routes (category selection)
    Route::get('/', [WarehouseBookingController::class, 'category'])->name('category');

    // Warehouse listing by type (public)
    Route::get('/bookings/{type}', [WarehouseBookingController::class, 'index'])->name('index');

    // Warehouse details and booking form (public, but form submission requires auth)
    Route::get('/bookings/{type}/{id}', [WarehouseBookingController::class, 'details'])->name('details');

    // Public checkout and payment pages
    Route::get('/checkout', [WarehouseBookingController::class, 'checkout'])->name('checkout');
    Route::get('/payments', [WarehouseBookingController::class, 'payments'])->name('payments');

    // Booking endpoints used by frontend
    Route::post('/book', [WarehouseBookingController::class, 'store'])->name('book');
    Route::post('/store', [WarehouseBookingController::class, 'store'])->name('store');

    // Protected routes (require authentication)
    Route::middleware(['auth'])->group(function () {
        // Booking summary/confirmation
        Route::get('/summary/{bookingId?}', [WarehouseBookingController::class, 'summary'])->name('summary');

        // User's booking management
        Route::get('/my-bookings', [WarehouseBookingController::class, 'list'])->name('list');
        Route::get('/booking/{id}', [WarehouseBookingController::class, 'show'])->name('show');
        Route::patch('/booking/{id}/cancel', [WarehouseBookingController::class, 'cancel'])->name('cancel');
    });
});

/*
|--------------------------------------------------------------------------
| Public Vehicle Browsing
|--------------------------------------------------------------------------
*/
Route::get('/clientRent', [ClientVehicleController::class, 'home'])->name('client.home');
Route::get('/vehicleList', [ClientVehicleController::class, 'vehicleList'])->name('vehicle.list');
Route::get('/vehicleDetails/{vehicle}', [ClientVehicleController::class, 'vehicleDetails'])->name('vehicle.details');
// API Routes for frontend functionality
Route::prefix('api')->name('api.')->group(function () {
    // Warehouse API endpoints
    Route::get('/warehouse-units/{id}', [WarehouseBookingController::class, 'getWarehouseUnit'])->name('warehouse-units.show');
});

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
| Super Admin Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'superadmin'])->prefix('superadmin')->name('superadmin.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\SuperAdmin\SuperAdminDashboardController::class, 'index'])->name('dashboard');

    Route::get('/Analytics', function () {
        return Inertia::render('Web/home/SuperAdmin/Analytics');
    })->name('Analytics');

    Route::get('/Users', function () {
        return Inertia::render('Web/home/SuperAdmin/Users');
    })->name('Users');

    Route::get('/AddUser', function () {
        return Inertia::render('Web/home/SuperAdmin/AddUser');
    })->name('AddUser');

    Route::get('/Vehicles', function () {
        return Inertia::render('Web/home/SuperAdmin/Vehicles');
    })->name('Vehicles');

    Route::get('/LandVehicleDetails', function () {
        return Inertia::render('Web/home/SuperAdmin/LandVehicleDetails');
    })->name('LandVehicleDetails');

    Route::get('/SeaVehicleDetails', function () {
        return Inertia::render('Web/home/SuperAdmin/SeaVehicleDetails');
    })->name('SeaVehicleDetails');

    Route::get('/AirVehicleDetails', function () {
        return Inertia::render('Web/home/SuperAdmin/AirVehicleDetails');
    })->name('AirVehicleDetails');

    Route::get('/Vender', [\App\Http\Controllers\SuperAdmin\VendorUserController::class, 'index'])->name('NewVender');

    // Vendor User Management API Routes
    Route::prefix('vendors')->name('vendors.')->group(function () {
        Route::get('/', [\App\Http\Controllers\SuperAdmin\VendorUserController::class, 'index'])->name('index');
        Route::post('/{user}/verify', [\App\Http\Controllers\SuperAdmin\VendorUserController::class, 'verify'])->name('verify');
        Route::post('/{user}/block', [\App\Http\Controllers\SuperAdmin\VendorUserController::class, 'block'])->name('block');
        Route::post('/{user}/unblock', [\App\Http\Controllers\SuperAdmin\VendorUserController::class, 'unblock'])->name('unblock');
        Route::post('/{user}/reject', [\App\Http\Controllers\SuperAdmin\VendorUserController::class, 'reject'])->name('reject');
    });
});

// vendor routes
Route::middleware(['auth', 'role:vendor'])->prefix('vendors')->name('vendors.')->group(function () {
    Route::get('/mainDashboard', function () {
        return Inertia::render('Web/home/vendors/MainDashboard');
    })->name('mainDashboard');
});

// Warehouse (vendor-only) under /vendors/warehouse/*
Route::middleware(['auth', 'role:vendor'])->prefix('vendors/warehouse')->name('vendors.warehouse.')->group(function () {
    Route::get('/dashboard', fn() => Inertia::render('Web/home/vendors/warehouse/Dashboard'))->name('dashboard');
    Route::get('/units', fn() => Inertia::render('Web/home/vendors/warehouse/Unit'))->name('units');
    Route::get('/addUnit', fn() => Inertia::render('Web/home/vendors/warehouse/AddUnit'))->name('addUnit');
    Route::get('/editUnit/{id}', fn($id) => Inertia::render('Web/home/vendors/warehouse/EditUnit', ['unitId' => $id]))->name('editUnit');
    Route::get('/unitDetails/{id}', fn($id) => Inertia::render('Web/home/vendors/warehouse/UnitDetails', ['unitId' => $id]))->name('unitDetails');
    Route::get('/bookings', fn() => Inertia::render('Web/home/vendors/warehouse/Booking'))->name('bookings');
    Route::get('/clients', fn() => Inertia::render('Web/home/vendors/warehouse/Client'))->name('clients');
    Route::get('/expenses', fn() => Inertia::render('Web/home/vendors/warehouse/Expenses'))->name('expenses');
    Route::get('/payment', fn() => Inertia::render('Web/home/vendors/warehouse/Payment'))->name('payment');
    Route::get('/tracking', fn() => Inertia::render('Web/home/vendors/warehouse/Tracking'))->name('tracking');
    Route::get('/calendar', fn() => Inertia::render('Web/home/vendors/warehouse/Calendar'))->name('calendar');

    // API routes for warehouse units
    Route::get('/api/units', [WarehouseUnitController::class, 'index'])->name('api.units.index');
    Route::post('/api/units', [WarehouseUnitController::class, 'store'])->name('api.units.store');
    Route::get('/api/units/{id}', [WarehouseUnitController::class, 'show'])->name('api.units.show');
    Route::put('/api/units/{id}', [WarehouseUnitController::class, 'update'])->name('api.units.update');
    Route::patch('/api/units/{id}', [WarehouseUnitController::class, 'update'])->name('api.units.patch');
    Route::patch('/api/units/{id}/status', [WarehouseUnitController::class, 'updateStatus'])->name('api.units.updateStatus');
    Route::delete('/api/units/{id}', [WarehouseUnitController::class, 'destroy'])->name('api.units.destroy');

    // API routes for warehouse bookings management
    Route::get('/api/bookings', [\App\Http\Controllers\VendorWarehouseBookingController::class, 'index'])->name('api.bookings.index');
    Route::get('/api/bookings/stats', [\App\Http\Controllers\VendorWarehouseBookingController::class, 'getStats'])->name('api.bookings.stats');
    Route::get('/api/bookings/{bookingId}', [\App\Http\Controllers\VendorWarehouseBookingController::class, 'show'])->name('api.bookings.show');
    Route::patch('/api/bookings/{bookingId}/approve', [\App\Http\Controllers\VendorWarehouseBookingController::class, 'approve'])->name('api.bookings.approve');
    Route::patch('/api/bookings/{bookingId}/reject', [\App\Http\Controllers\VendorWarehouseBookingController::class, 'reject'])->name('api.bookings.reject');
    Route::patch('/api/bookings/{bookingId}/complete', [\App\Http\Controllers\VendorWarehouseBookingController::class, 'complete'])->name('api.bookings.complete');
    Route::put('/api/bookings/{bookingId}', [\App\Http\Controllers\VendorWarehouseBookingController::class, 'update'])->name('api.bookings.update');
});

// Admin routes for warehouse approval (requires admin role)
Route::middleware(['auth', 'role:admin'])->prefix('admin/warehouse')->name('admin.warehouse.')->group(function () {
    Route::patch('/api/units/{id}/approve', [WarehouseUnitController::class, 'approve'])->name('api.units.approve');
    Route::patch('/api/units/{id}/reject', [WarehouseUnitController::class, 'reject'])->name('api.units.reject');

    Route::get('/unitDetails', fn() => Inertia::render('Web/home/vendors/warehouse/UnitDetails'))->name('unitDetails');
});

// Backward-compat: if any UI still links to /warehouse/*, redirect to /vendors/warehouse/* (protect with same middleware)
Route::middleware(['auth', 'role:vendor'])->get('/warehouse/{path}', function (string $path) {
    return redirect('/vendors/warehouse/' . ltrim($path, '/'));
})->where('path', '.*');

// Bookings page with DB-fed props (table + chart)
Route::get('/bookings', [VendorBookingController::class, 'page'])->name('bookings');

// Other pages (shells)
Route::get('/mainDashboard', fn() => Inertia::render('Web/home/vendors/MainDashboard'))->name('mainDashboard');
Route::get('/clients', fn() => Inertia::render('Web/home/vendors/Client'))->name('clients');
Route::get('/expenses', fn() => Inertia::render('Web/home/vendors/Expenses'))->name('expenses');
Route::get('/payment', fn() => Inertia::render('Web/home/vendors/Payment'))->name('payment');
Route::get('/tracking', fn() => Inertia::render('Web/home/vendors/Tracking'))->name('tracking');
Route::get('/calendar', fn() => Inertia::render('Web/home/vendors/Calendar'))->name('calendar');

// Units UI
Route::get('/units', fn() => Inertia::render('Web/home/vendors/Unit'))->name('units');
Route::get('/addUnit', fn() => Inertia::render('Web/home/vendors/AddUnit'))->name('addUnit');
Route::get('/addUnit/{vehicle}', [VehicleController::class, 'edit'])->name('addUnit.edit');
Route::get('/unitDetails', fn() => Inertia::render('Web/home/vendors/UnitDetails'))->name('unitDetails');
Route::get('/unitDetails/{vehicle}', [VehicleController::class, 'detailsPage'])->name('unitDetails.show');

// Warehouse UI
Route::get('/warehouse', [WebController::class, 'warehouse'])->name('warehouse.home');
Route::get('/warehouse/unit', fn() => Inertia::render('Web/home/vendors/warehouse/Unit'))->name('warehouse.unit');

// Drivers UI
Route::get('/drivers', fn() => Inertia::render('Web/components/vendors/driver/Driver'))->name('drivers');

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
        Route::get('/mainDashboard', fn() => Inertia::render('Web/home/vendors/MainDashboard'))->name('mainDashboard');
        Route::get('/clients', fn() => Inertia::render('Web/home/vendors/Client'))->name('clients');
        Route::get('/expenses', fn() => Inertia::render('Web/home/vendors/Expenses'))->name('expenses');
        Route::get('/payment', fn() => Inertia::render('Web/home/vendors/Payment'))->name('payment');
        Route::get('/tracking', fn() => Inertia::render('Web/home/vendors/Tracking'))->name('tracking');
        Route::get('/calendar', fn() => Inertia::render('Web/home/vendors/Calendar'))->name('calendar');

        // Units UI
        Route::get('/units',         $render('Web/home/vendors/Unit'))->name('units');
        Route::get('/addUnit',       $render('Web/home/vendors/AddUnit'))->name('addUnit');
        Route::get('/addUnit/{vehicle}', [VehicleController::class, 'edit'])->name('addUnit.edit');
        Route::get('/unitDetails',   $render('Web/home/vendors/UnitDetails'))->name('unitDetails');
        Route::get('/unitDetails/{vehicle}', [VehicleController::class, 'detailsPage'])->name('unitDetails.show');

        // Warehouse UI
        Route::get('/warehouse', [WebController::class, 'warehouse'])->name('warehouse.home');
        Route::get('/warehouse/unit', fn() => Inertia::render('Web/home/vendors/warehouse/Unit'))->name('warehouse.unit');

        // Drivers UI
        Route::get('/drivers', fn() => Inertia::render('Web/components/vendors/driver/Driver'))->name('drivers');
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
Route::get('/ClientDashboard', fn() => Inertia::render('Web/home/client/ClientDashboard'))->name('ClientDashboard');

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

// SuperAdmin legacy redirects
Route::redirect('/SuperAdmin/Dashboard', '/superadmin/dashboard')->name('SuperAdmin.Dashboard.legacy');
Route::redirect('/SuperAdmin/Analytics', '/superadmin/Analytics')->name('SuperAdmin.Analytics.legacy');
Route::redirect('/SuperAdmin/Users', '/superadmin/Users')->name('SuperAdmin.Users.legacy');
Route::redirect('/SuperAdmin/AddUser', '/superadmin/AddUser')->name('SuperAdmin.AddUser.legacy');
Route::redirect('/SuperAdmin/Vehicles', '/superadmin/Vehicles')->name('SuperAdmin.Vehicles.legacy');
Route::redirect('/SuperAdmin/LandVehicleDetails', '/superadmin/LandVehicleDetails')->name('SuperAdmin.LandVehicleDetails.legacy');
Route::redirect('/SuperAdmin/SeaVehicleDetails', '/superadmin/SeaVehicleDetails')->name('SuperAdmin.SeaVehicleDetails.legacy');
Route::redirect('/SuperAdmin/AirVehicleDetails', '/superadmin/AirVehicleDetails')->name('SuperAdmin.AirVehicleDetails.legacy');
Route::redirect('/SuperAdmin/Vender', '/superadmin/Vender')->name('SuperAdmin.NewVender.legacy');

// Route::get('/mainDashboard', function () {
//     return Inertia::render('Web/home/vendors/MainDashboard');
// })->name('mainDashboard');

Route::get('/unitDetails', function () {
    return Inertia::render('Web/home/vendors/UnitDetails');
})->name('unitDetails');

Route::get('/settingsPage', function () {
    return Inertia::render('Web/home/vendors/SettingsPage');
})->name('settingsPage');

// end

// vendor dashboard - warehouse
Route::get('/warehouse/bookings', function () {
    return Inertia::render('Web/home/vendors/warehouse/Booking');
})->name('warehouse.bookings');

Route::get('/warehouse/units', function () {
    return Inertia::render('Web/home/vendors/warehouse/Unit');
})->name('warehouse.units');

Route::get('/warehouse/dashboard', function () {
    return Inertia::render('Web/home/vendors/warehouse/Dashboard');
})->name('warehouse.dashboard');

Route::get('/warehouse/clients', function () {
    return Inertia::render('Web/home/vendors/warehouse/Client');
})->name('warehouse.clients');

Route::get('/warehouse/expenses', function () {
    return Inertia::render('Web/home/vendors/warehouse/Expenses');
})->name('warehouse.expenses');

Route::get('/warehouse/payment', function () {
    return Inertia::render('Web/home/vendors/warehouse/Payment');
})->name('warehouse.payment');

Route::get('/warehouse/tracking', function () {
    return Inertia::render('Web/home/vendors/warehouse/Tracking');
})->name('warehouse.tracking');

Route::get('/warehouse/calendar', function () {
    return Inertia::render('Web/home/vendors/warehouse/Calendar');
})->name('warehouse.calendar');

Route::get('/warehouse/addUnit', function () {
    return Inertia::render('Web/home/vendors/warehouse/AddUnit');
})->name('warehouse.addUnit');

Route::get('/warehouse/unitDetails', function () {
    return Inertia::render('Web/home/vendors/warehouse/UnitDetails');
})->name('warehouse.unitDetails');

Route::get('/warehouse/settingsPage', function () {
    return Inertia::render('Web/home/vendors/warehouse/SettingsPage');
})->name('warehouse.settingsPage');

// vendor dashboard - warehouse (all protected under auth + role:vendor in group above)


// vendor dashboard - ticket booking
Route::get('/ticketBooking/bookings', function () {
    return Inertia::render('Web/home/vendors/ticketBooking/Booking');
})->name('ticketBooking.bookings');

Route::get('/ticketBooking/units', function () {
    return Inertia::render('Web/home/vendors/ticketBooking/Unit');
})->name('ticketBooking.units');

Route::get('/ticketBooking/dashboard', function () {
    return Inertia::render('Web/home/vendors/ticketBooking/Dashboard');
})->name('ticketBooking.dashboard');

Route::get('/ticketBooking/clients', function () {
    return Inertia::render('Web/home/vendors/ticketBooking/Client');
})->name('ticketBooking.clients');

Route::get('/ticketBooking/expenses', function () {
    return Inertia::render('Web/home/vendors/ticketBooking/Expenses');
})->name('ticketBooking.expenses');

Route::get('/ticketBooking/payment', function () {
    return Inertia::render('Web/home/vendors/ticketBooking/Payment');
})->name('ticketBooking.payment');

Route::get('/ticketBooking/tracking', function () {
    return Inertia::render('Web/home/vendors/ticketBooking/Tracking');
})->name('ticketBooking.tracking');

Route::get('/ticketBooking/calendar', function () {
    return Inertia::render('Web/home/vendors/ticketBooking/Calendar');
})->name('ticketBooking.calendar');

Route::get('/ticketBooking/addUnit', function () {
    return Inertia::render('Web/home/vendors/ticketBooking/AddUnit');
})->name('ticketBooking.addUnit');

Route::get('/ticketBooking/unitDetails', function () {
    return Inertia::render('Web/home/vendors/ticketBooking/UnitDetails');
})->name('ticketBooking.unitDetails');

Route::get('/ticketBooking/settingsPage', function () {
    return Inertia::render('Web/home/vendors/ticketBooking/SettingsPage');
})->name('ticketBooking.settingsPage');



// vendor dashboard - courier service
Route::get('/courierService/bookings', function () {
    return Inertia::render('Web/home/vendors/courierService/Booking');
})->name('courierService.bookings');

Route::get('/courierService/units', function () {
    return Inertia::render('Web/home/vendors/courierService/Unit');
})->name('ticketBooking.units');

Route::get('/courierService/dashboard', function () {
    return Inertia::render('Web/home/vendors/courierService/Dashboard');
})->name('courierService.dashboard');

Route::get('/courierService/clients', function () {
    return Inertia::render('Web/home/vendors/courierService/Client');
})->name('courierService.clients');

Route::get('/courierService/expenses', function () {
    return Inertia::render('Web/home/vendors/courierService/Expenses');
})->name('courierService.expenses');

Route::get('/courierService/payment', function () {
    return Inertia::render('Web/home/vendors/courierService/Payment');
})->name('courierService.payment');

Route::get('/courierService/tracking', function () {
    return Inertia::render('Web/home/vendors/courierService/Tracking');
})->name('courierService.tracking');

Route::get('/courierService/calendar', function () {
    return Inertia::render('Web/home/vendors/courierService/Calendar');
})->name('courierService.calendar');

Route::get('/courierService/addUnit', function () {
    return Inertia::render('Web/home/vendors/courierService/AddUnit');
})->name('courierService.addUnit');

Route::get('/courierService/unitDetails', function () {
    return Inertia::render('Web/home/vendors/courierService/UnitDetails');
})->name('courierService.unitDetails');

Route::get('/courierService/settingsPage', function () {
    return Inertia::render('Web/home/vendors/courierService/SettingsPage');
})->name('courierService.settingsPage');



// vendor dashboard - freight
Route::get('/freight/bookings', function () {
    return Inertia::render('Web/home/vendors/freight/Booking');
})->name('freight.bookings');

Route::get('/freight/units', function () {
    return Inertia::render('Web/home/vendors/freight/Unit');
})->name('freight.units');

Route::get('/freight/dashboard', function () {
    return Inertia::render('Web/home/vendors/freight/Dashboard');
})->name('freight.dashboard');

Route::get('/freight/clients', function () {
    return Inertia::render('Web/home/vendors/freight/Client');
})->name('courierService.clients');

Route::get('/freight/expenses', function () {
    return Inertia::render('Web/home/vendors/freight/Expenses');
})->name('freight.expenses');

Route::get('/freight/payment', function () {
    return Inertia::render('Web/home/vendors/freight/Payment');
})->name('freight.payment');

Route::get('/freight/tracking', function () {
    return Inertia::render('Web/home/vendors/freight/Tracking');
})->name('freight.tracking');

Route::get('/freight/calendar', function () {
    return Inertia::render('Web/home/vendors/freight/Calendar');
})->name('freight.calendar');

Route::get('/freight/addUnit', function () {
    return Inertia::render('Web/home/vendors/freight/AddUnit');
})->name('freight.addUnit');

Route::get('/freight/unitDetails', function () {
    return Inertia::render('Web/home/vendors/freight/UnitDetails');
})->name('freight.unitDetails');

Route::get('/freight/settingsPage', function () {
    return Inertia::render('Web/home/vendors/freight/SettingsPage');
})->name('freight.settingsPage');



// vendor dashboard - multimodal
Route::get('/multimodal/bookings', function () {
    return Inertia::render('Web/home/vendors/multimodal/Booking');
})->name('multimodal.bookings');

Route::get('/multimodal/units', function () {
    return Inertia::render('Web/home/vendors/multimodal/Unit');
})->name('freight.units');

Route::get('/multimodal/dashboard', function () {
    return Inertia::render('Web/home/vendors/multimodal/Dashboard');
})->name('multimodal.dashboard');

Route::get('/multimodal/clients', function () {
    return Inertia::render('Web/home/vendors/multimodal/Client');
})->name('multimodal.clients');

Route::get('/multimodal/expenses', function () {
    return Inertia::render('Web/home/vendors/multimodal/Expenses');
})->name('multimodal.expenses');

Route::get('/multimodal/payment', function () {
    return Inertia::render('Web/home/vendors/multimodal/Payment');
})->name('multimodal.payment');

Route::get('/multimodal/tracking', function () {
    return Inertia::render('Web/home/vendors/multimodal/Tracking');
})->name('multimodal.tracking');

Route::get('/multimodal/calendar', function () {
    return Inertia::render('Web/home/vendors/multimodal/Calendar');
})->name('multimodal.calendar');

Route::get('/multimodal/addUnit', function () {
    return Inertia::render('Web/home/vendors/multimodal/AddUnit');
})->name('multimodal.addUnit');

Route::get('/multimodal/unitDetails', function () {
    return Inertia::render('Web/home/vendors/multimodal/UnitDetails');
})->name('multimodal.unitDetails');


Route::get('/multimodal/settingsPage', function () {
    return Inertia::render('Web/home/vendors/multimodal/SettingsPage');
})->name('multimodal.settingsPage');


// end ==================================================













// Client dashboard
Route::get('/clientDashboard', function () {
    return Inertia::render('Web/home/client/ClientDashboard');
})->name('clientDashboard');

Route::get('/clientDashboardSettings', function () {
    return Inertia::render('Web/home/client/ClientDashboardSettings');
})->name('clientDashboardSettings');

Route::get('/clientTicketBookingDashboard', function () {
    return Inertia::render('Web/home/client/ClientTicketBookingDashboard');
})->name('clientTicketBookingDashboard');

Route::get('/courierBookingDashboard', function () {
    return Inertia::render('Web/home/client/CourierBookingDashboard');
})->name('courierBookingDashboard');

Route::get('/warehouseBookingDashboard', function () {
    return Inertia::render('Web/home/client/WarehouseBookingDashboard');
})->name('warehouseBookingDashboard');

Route::get('/freightBookingDashboard', function () {
    return Inertia::render('Web/home/client/FreightBookingDashboard');
})->name('freightBookingDashboard');










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
