<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WebController;
use App\Http\Controllers\FlightBookingController;
use App\Http\Controllers\TrainController;
use App\Http\Controllers\BusController;
use App\Http\Controllers\BusBookingController;
use App\Http\Controllers\WarehouseControllers\Client\WarehouseBookingController;
use App\Http\Controllers\User\UserDashboardController;
use Illuminate\Foundation\Application;
use App\Http\Controllers\WarehouseControllers\Vendor\WarehouseUnitController;

// Vendor controllers
use App\Http\Controllers\Vendor\VehicleController;
use App\Http\Controllers\Vendor\DashboardController;
use App\Http\Controllers\Vendor\BookingController as VendorBookingController;
use App\Http\Controllers\Vendor\VehicleMaintenanceController;
use App\Http\Controllers\Vendor\DriverController;
use App\Http\Controllers\Vendor\NotificationController;

// PDFs
use App\Http\Controllers\VehiclePolicyController;

// Client-side browsing/controllers
use App\Http\Controllers\VehicleControllers\Client\ClientVehicleController;
use App\Http\Controllers\VehicleControllers\Client\VehicleLikeController;
use App\Http\Controllers\VehicleControllers\Client\VehicleReviewController;
use App\Http\Controllers\VehicleControllers\Client\ClientBookingController;
use App\Http\Controllers\Client\ClientDashboardController;
use App\Http\Controllers\CourierControllers\Client\ClientCourierController;

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
Route::get('/dashboard-redirect', [WebController::class, 'signin.signin'])->name('dashboard.redirect');
Route::get('/landingPage/blog', [WebController::class, 'blog'])->name('landingPage.blog');
Route::get('/landingPage/blogExample', [WebController::class, 'blogExample'])->name('landingPage.blogExample');

Route::get('/courier-service', [WebController::class, 'courierService'])->name('courier.service');
Route::prefix('couriers')->name('couriers.')->group(function () {
    Route::get('/create', [ClientCourierController::class, 'create'])->name('create');
    Route::post('/review', [ClientCourierController::class, 'review'])->name('review');
    Route::get('/details', [ClientCourierController::class, 'details'])->name('details');
    Route::post('/details', [ClientCourierController::class, 'storeDetails'])->name('details.store');
    Route::get('/summary', [ClientCourierController::class, 'summary'])->name('summary');
    Route::post('/', [ClientCourierController::class, 'store'])->name('store');
    Route::get('/{shipment}/bill', [ClientCourierController::class, 'downloadBill'])
        ->whereNumber('shipment')
        ->name('bill');
});
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
Route::get('/trainTicketBookingDetails', [TrainController::class, 'search'])->name('TrainTicketBookingDetails.TrainTicketBookingDetails');
Route::get('/trainTicketBookingPreview', [TrainController::class, 'preview'])->name('trainTicketBookingPreview.trainTicketBookingPreview')->middleware('auth');
Route::post('/train-bookings', [TrainController::class, 'store'])->name('train-bookings.store')->middleware('auth');
Route::get('/train-booking-success/{reference}', [TrainController::class, 'bookingSuccess'])->name('train.booking.success')->middleware('auth');
// Bus booking routes (all routes are public - no auth required)
Route::get('/busTicketBookingDetails', [BusBookingController::class, 'search'])->name('busTicketBookingDetails.busTicketBookingDetails');
Route::post('/bus-bookings', [BusBookingController::class, 'store'])->name('bus-bookings.store')->middleware('auth');
Route::get('/bus-booking-success/{reference}', [BusBookingController::class, 'bookingSuccess'])->name('bus.booking.success')->middleware('auth');
Route::get('/busTicketBookingPreview', [BusBookingController::class, 'preview'])->name('busTicketBookingPreview.busTicketBookingPreview')->middleware('auth');
Route::get('/flightBooking', [WebController::class, 'flightBooking'])->name('flightBooking.flightBooking');
Route::post('/flight-bookings', [FlightBookingController::class, 'store'])->name('flight-bookings.store')->middleware('auth');

// Warehouse (public landing)
Route::get('/warehouse', [WebController::class, 'warehouse'])->name('warehouse.home');
Route::get('/warehouses/search', [WebController::class, 'warehouseList'])->name('warehouses.search');
Route::get('/warehouseList', [WebController::class, 'warehouseList'])->name('warehouse.list');
Route::get('/warehouseDetails', [WebController::class, 'warehouseDetails'])->name('warehouse.details');
Route::get('/freight-booking/create', [WebController::class, 'freightHomepage'])->name('freight.booking.create');

// multi - model (client-side)
Route::get('/multiModel', [WebController::class, 'multiModelHomepage'])->name('multiModelHomepage.home');





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
Route::get('/seaVehicleList', [ClientVehicleController::class, 'seaVehicleList'])->name('seaVehicle.list');
Route::get('/airVehicleList', [ClientVehicleController::class, 'airVehicleList'])->name('airVehicle.list');
Route::get('/vehicleDetails/{vehicle}', [ClientVehicleController::class, 'vehicleDetails'])->name('vehicle.details');
Route::get('/airVehicleDetails/{vehicle}', [ClientVehicleController::class, 'airVehicleDetails'])->name('airVehicle.details');
Route::get('/seaVehicleDetails/{vehicle}', [ClientVehicleController::class, 'seaVehicleDetails'])->name('seaVehicle.details');
// API Routes for frontend functionality
Route::prefix('api')->name('api.')->group(function () {
    // Public warehouse units list
    Route::get('/warehouse-units', [WarehouseBookingController::class, 'getWarehouseUnits'])->name('warehouse-units.index');

    // Warehouse API endpoints
    Route::get('/warehouse-units/{id}', [WarehouseBookingController::class, 'getWarehouseUnit'])->name('warehouse-units.show');
    Route::get('/warehouse-units/{id}/availability', [WarehouseBookingController::class, 'getWarehouseAvailability'])->name('warehouse-units.availability');

    // Warehouse like toggle (requires auth)
    Route::middleware(['auth'])->group(function () {
        Route::post('/warehouse/like-toggle', [WarehouseBookingController::class, 'toggleLike'])->name('client.warehouse.like.toggle');
    });
});

// Warehouse Reviews (requires auth)
Route::middleware(['auth'])->group(function () {
    Route::post('/warehouse-reviews', [WarehouseBookingController::class, 'storeReview'])->name('warehouse.reviews.store');
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
    Route::patch('/bookings/{airVehicleBooking}/addons', [ClientBookingController::class, 'updateAirVehicleAddons'])->name('bookings.updateAirVehicleAddons');

    Route::middleware(['auth', 'role:client'])->group(function () {
        Route::get('/bookings/checkout', [ClientBookingController::class, 'showCheckout'])->name('bookings.checkout');
        Route::post('/bookings', [ClientBookingController::class, 'store'])->name('bookings.store');
        Route::get('/bookings/{booking}/payments', [ClientBookingController::class, 'payments'])->name('bookings.payments');
        Route::post('/bookings/{booking}/confirm', [ClientBookingController::class, 'confirm'])->name('bookings.confirm');
        Route::get('/bookings/{booking}/summary', [ClientBookingController::class, 'summary'])->name('bookings.summary');
        Route::post('/bookings/{booking}/cancel', [ClientBookingController::class, 'cancel'])->name('bookings.cancel');

        Route::get('/airBookings/quote', [ClientBookingController::class, 'airVehicleQuote'])->name('airBookings.quote');
        Route::get('/airBookings/checkout', [ClientBookingController::class, 'showAirVehicleCheckout'])->name('airBookings.checkout');
        Route::post('/airBookings', [ClientBookingController::class, 'airVehicleStore'])->name('airBookings.store');
        Route::get('/airBookings/{airBooking}/payments', [ClientBookingController::class, 'airVehiclePayments'])->name('airBookings.payments');
        Route::post('/airBookings/{airBooking}/confirm', [ClientBookingController::class, 'airVehicleConfirm'])->name('airBookings.confirm');
        Route::get('/airBookings/{airBooking}/summary', [ClientBookingController::class, 'airVehicleSummary'])->name('airBookings.summary');
        Route::post('/airBookings/{airBooking}/cancel', [ClientBookingController::class, 'airVehicleCancel'])->name('airBookings.cancel');


        Route::post('/vehicle-like/toggle', [VehicleLikeController::class, 'toggle'])->name('vehicle.like.toggle');
        Route::get('/vehicles/{vehicle}/reviews', [VehicleReviewController::class, 'index'])->name('vehicles.reviews.index');
        Route::post('/vehicles/{vehicle}/reviews', [VehicleReviewController::class, 'store'])->name('vehicles.reviews.store');

        Route::get('/vehicles/{vehicle}/policy/preview', [ClientVehicleController::class, 'policyPreview'])->name('vehicles.policy.preview');

        Route::get('/warehouses/dashboard-data', [WarehouseBookingController::class, 'dashboardData'])->name('warehouses.dashboard-data');
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

    Route::get('/Users', [\App\Http\Controllers\SuperAdmin\UserController::class, 'index'])->name('Users');

    // User Management Routes
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [\App\Http\Controllers\SuperAdmin\UserController::class, 'index'])->name('index');
        Route::get('/create', [\App\Http\Controllers\SuperAdmin\UserController::class, 'create'])->name('create');
        Route::post('/', [\App\Http\Controllers\SuperAdmin\UserController::class, 'store'])->name('store');
        Route::get('/{user}', [\App\Http\Controllers\SuperAdmin\UserController::class, 'show'])->name('show');
        Route::get('/{user}/edit', [\App\Http\Controllers\SuperAdmin\UserController::class, 'edit'])->name('edit');
        Route::put('/{user}', [\App\Http\Controllers\SuperAdmin\UserController::class, 'update'])->name('update');
        Route::delete('/{user}', [\App\Http\Controllers\SuperAdmin\UserController::class, 'destroy'])->name('destroy');
        Route::post('/bulk-delete', [\App\Http\Controllers\SuperAdmin\UserController::class, 'bulkDelete'])->name('bulkDelete');
        Route::post('/{user}/status', [\App\Http\Controllers\SuperAdmin\UserController::class, 'changeStatus'])->name('changeStatus');
    });

    Route::get('/AddUser', function () {
        return Inertia::render('Web/home/SuperAdmin/AddUser');
    })->name('AddUser');

    // Vehicle Management Routes
    Route::get('/Vehicles', [\App\Http\Controllers\SuperAdmin\VehicleController::class, 'index'])->name('Vehicles');
    Route::get('/vehicles/{vehicle}', [\App\Http\Controllers\SuperAdmin\VehicleController::class, 'show'])->name('vehicles.show');
    Route::put('/vehicles/{vehicle}/approval', [\App\Http\Controllers\SuperAdmin\VehicleController::class, 'updateApprovalStatus'])->name('vehicles.approval');
    Route::put('/vehicles/{vehicle}/status', [\App\Http\Controllers\SuperAdmin\VehicleController::class, 'updateStatus'])->name('vehicles.status');
    Route::delete('/vehicles/{vehicle}', [\App\Http\Controllers\SuperAdmin\VehicleController::class, 'destroy'])->name('vehicles.destroy');
    Route::post('/vehicles/bulk-approve', [\App\Http\Controllers\SuperAdmin\VehicleController::class, 'bulkApprove'])->name('vehicles.bulkApprove');
    Route::post('/vehicles/bulk-reject', [\App\Http\Controllers\SuperAdmin\VehicleController::class, 'bulkReject'])->name('vehicles.bulkReject');
    Route::get('/vehicles/export', [\App\Http\Controllers\SuperAdmin\VehicleController::class, 'export'])->name('vehicles.export');

    // Warehouse Management Routes
    Route::get('/Warehouse', [\App\Http\Controllers\SuperAdmin\WarehouseController::class, 'index'])->name('Warehouse');
    Route::get('/warehouses/{warehouse}', [\App\Http\Controllers\SuperAdmin\WarehouseController::class, 'show'])->name('warehouses.show');
    Route::put('/warehouses/{warehouse}/status', [\App\Http\Controllers\SuperAdmin\WarehouseController::class, 'updateStatus'])->name('warehouses.updateStatus');

    // Legacy vehicle detail routes (can be updated later to use the main vehicle show route)
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
Route::middleware(['auth', 'vendor.verified'])->prefix('vendors')->name('vendors.')->group(function () {
    Route::get('/mainDashboard', function () {
        return Inertia::render('Web/home/vendors/MainDashboard');
    })->name('mainDashboard');
});

// Warehouse (vendor-only) under /vendors/warehouse/*
Route::middleware(['auth', 'vendor.verified'])->prefix('vendors/warehouse')->name('vendors.warehouse.')->group(function () {
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

    // Debug route
    Route::get('/api/debug/{id}', function($id) {
        return response()->json([
            'user_authenticated' => Auth::check(),
            'user_id' => Auth::id(),
            'user_role' => Auth::user()?->role,
            'requested_id' => $id,
            'warehouse_exists' => \App\Models\Warehouse\WarehouseUnit::where('id', $id)->exists(),
            'user_warehouse_exists' => \App\Models\Warehouse\WarehouseUnit::where('id', $id)->where('user_id', Auth::id())->exists(),
            'timestamp' => now(),
        ]);
    })->name('api.debug');

    // Test login endpoint for debugging
    Route::get('/api/test-login', function() {
        $user = \App\Models\User::find(1);
        if ($user) {
            Auth::login($user);
            return response()->json([
                'success' => true,
                'user_id' => Auth::id(),
                'user_role' => Auth::user()->role,
                'message' => 'User logged in successfully'
            ]);
        }
        return response()->json(['error' => 'User not found'], 404);
    })->name('api.test-login');

    // API routes for warehouse bookings management
    Route::get('/api/bookings', [\App\Http\Controllers\VendorWarehouseBookingController::class, 'index'])->name('api.bookings.index');
    Route::get('/api/bookings/stats', [\App\Http\Controllers\VendorWarehouseBookingController::class, 'getStats'])->name('api.bookings.stats');
    Route::get('/api/bookings/chart-data', [\App\Http\Controllers\VendorWarehouseBookingController::class, 'getChartData'])->name('api.bookings.chart-data');
    Route::get('/api/bookings/{bookingId}', [\App\Http\Controllers\VendorWarehouseBookingController::class, 'show'])->name('api.bookings.show');
    Route::patch('/api/bookings/{bookingId}/approve', [\App\Http\Controllers\VendorWarehouseBookingController::class, 'approve'])->name('api.bookings.approve');
    Route::patch('/api/bookings/{bookingId}/reject', [\App\Http\Controllers\VendorWarehouseBookingController::class, 'reject'])->name('api.bookings.reject');
    Route::patch('/api/bookings/{bookingId}/complete', [\App\Http\Controllers\VendorWarehouseBookingController::class, 'complete'])->name('api.bookings.complete');
    Route::put('/api/bookings/{bookingId}', [\App\Http\Controllers\VendorWarehouseBookingController::class, 'update'])->name('api.bookings.update');

    // Payment endpoints
    Route::get('/api/payment-transactions', [\App\Http\Controllers\VendorWarehouseBookingController::class, 'getPaymentTransactions'])->name('api.payments.transactions');
    Route::get('/api/payment-stats', [\App\Http\Controllers\VendorWarehouseBookingController::class, 'getPaymentStats'])->name('api.payments.stats');
});

// Admin routes for warehouse approval (requires admin role)
Route::middleware(['auth', 'role:admin'])->prefix('admin/warehouse')->name('admin.warehouse.')->group(function () {
    Route::patch('/api/units/{id}/approve', [WarehouseUnitController::class, 'approve'])->name('api.units.approve');
    Route::patch('/api/units/{id}/reject', [WarehouseUnitController::class, 'reject'])->name('api.units.reject');

    Route::get('/unitDetails', fn() => Inertia::render('Web/home/vendors/warehouse/UnitDetails'))->name('unitDetails');
});

// Backward-compat: if any UI still links to /warehouse/*, redirect to /vendors/warehouse/* (protect with same middleware)
Route::middleware(['auth', 'vendor.verified'])->get('/warehouse/{path}', function (string $path) {
    return redirect('/vendors/warehouse/' . ltrim($path, '/'));
})->where('path', '.*');

// Bookings page with DB-fed props (table + chart)
Route::get('/bookings', [VendorBookingController::class, 'page'])->name('bookings');

// Clients page with actual booking data
Route::get('/clients', [VendorBookingController::class, 'clients'])->name('clients.public');

// Payment page with actual transaction data
Route::get('/payment', [VendorBookingController::class, 'payments'])->name('payment.public');

// Other pages (shells)
Route::get('/mainDashboard', fn() => Inertia::render('Web/home/vendors/MainDashboard'))->name('mainDashboard');
Route::get('/expenses', fn() => Inertia::render('Web/home/vendors/Expenses'))->name('expenses');
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
Route::middleware(['auth', 'vendor.verified'])
    ->prefix('vendors')
    ->name('vendors.')
    ->group(function () use ($render) {
        // Dashboard with real props
        Route::get('/dashbord', [DashboardController::class, 'index'])->name('dashboard'); // legacy spelling
        Route::get('/dashboard', [DashboardController::class, 'index']); // alias

        // Notification routes
        Route::get('/notifications', [NotificationController::class, 'page'])->name('notifications');
        Route::get('/notifications/data', [NotificationController::class, 'index'])->name('notifications.index');
        Route::get('/notifications/count', [NotificationController::class, 'unreadCount'])->name('notifications.count');
        Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.markAsRead');
        Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.markAllAsRead');
        Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

        // Bookings page with DB-fed props (table + chart)
        Route::get('/bookings', [VendorBookingController::class, 'page'])->name('bookings');

        // Clients page with actual booking data filtered by vehicle type
        Route::get('/clients', [VendorBookingController::class, 'clients'])->name('clients');

        // Payment page with actual transaction data
        Route::get('/payment', [VendorBookingController::class, 'payments'])->name('payment');

        // Other pages (shells)
        Route::get('/mainDashboard', fn() => Inertia::render('Web/home/vendors/MainDashboard'))->name('mainDashboard');
        Route::get('/expenses', fn() => Inertia::render('Web/home/vendors/Expenses'))->name('expenses');
        Route::get('/tracking', fn() => Inertia::render('Web/home/vendors/Tracking'))->name('tracking');
        Route::get('/calendar', [VendorBookingController::class, 'calendar'])->name('calendar');

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
| Client dashboard
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:client'])
    ->prefix('client')
    ->name('client.')
    ->group(function () {
        Route::get('/dashboard', function () {
            return Inertia::render('Web/home/client/ClientMainDashboard');
        })->name('mainDashboard');
    });

/*
|--------------------------------------------------------------------------
| User Dashboard Routes (Client Services)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', \App\Http\Middleware\ClientVerificationCheck::class])
    ->prefix('user')
    ->name('user.')
    ->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\User\UserDashboardController::class, 'view'])->name('dashboard');
        Route::get('/flight-view', [\App\Http\Controllers\User\UserDashboardController::class, 'flightView'])->name('fight_view');
        Route::get('/booking-view', [\App\Http\Controllers\User\UserDashboardController::class, 'bookingView'])->name('booking_view');
        Route::get('/freight-bookings', [\App\Http\Controllers\User\UserDashboardController::class, 'freightBookings'])->name('freight_bookings');
        Route::get('/airticket-book', [\App\Http\Controllers\User\UserDashboardController::class, 'airticketBook'])->name('airticket_book');
        Route::get('/airticket-view', [\App\Http\Controllers\User\UserDashboardController::class, 'airticketBookView'])->name('airticket_view');
        Route::delete('/booking/{id}', [\App\Http\Controllers\User\UserDashboardController::class, 'destroy'])->name('booking_view.destroy');
    });

/*
|--------------------------------------------------------------------------
| General Dashboard Route (redirects based on role)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard/view', [\App\Http\Controllers\User\UserDashboardController::class, 'view'])->name('dashboard.view');
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard', [
            'user' => auth()->user()
        ]);
    })->name('dashboard');
});

// Client Dashboard Route with proper verification
Route::get('/client/dashboard', [\App\Http\Controllers\Client\ClientDashboardController::class, 'dashboard'])->name('client.dashboard');

// Main client dashboard route (referenced by auth controllers)
Route::get('/client/main-dashboard', [\App\Http\Controllers\Client\ClientDashboardController::class, 'dashboard'])->name('client.mainDashboard');

// Legacy client dashboard routes (public shell) - keep for backward compatibility
Route::get('/ClientDashboard', fn() => Inertia::render('Web/home/client/ClientDashboard'))->middleware(\App\Http\Middleware\ClientVerificationCheck::class)->name('ClientDashboard');
Route::get('/clientDashboard', [\App\Http\Controllers\Client\ClientDashboardController::class, 'dashboard'])->name('clientDashboard');

/*
|--------------------------------------------------------------------------
| Profile / App Shell
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // API route for user profile data
    Route::get('/api/user/profile', function () {
        return response()->json([
            'success' => true,
            'user' => Auth::user()
        ]);
    })->name('api.user.profile');
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
Route::redirect('/SuperAdmin/Warehouse', '/superadmin/Warehouse')->name('SuperAdmin.Warehouse.legacy');
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

//SuperAdmin

Route::get('/SuperAdmin/Dashboard', function () {
    return Inertia::render('Web/home/SuperAdmin/Dashboard');
})->name('SuperAdmin.Dashboard');

Route::get('/SuperAdmin/Analytics', function () {
    return Inertia::render('Web/home/SuperAdmin/Analytics');
})->name('SuperAdmin.Analytics');

Route::get('/SuperAdmin/Users', function () {
    return Inertia::render('Web/home/SuperAdmin/Users');
})->name('SuperAdmin.Users');

Route::get('/SuperAdmin/AddUser', function () {
    return Inertia::render('Web/home/SuperAdmin/AddUser');
})->name('SuperAdmin.AddUser');

// vendor dashboard - warehouse
Route::get('/warehouse/bookings', function () {
    return Inertia::render('Web/home/vendors/warehouse/Booking');
})->name('warehouse.bookings');
Route::get('/SuperAdmin/Vehicles', function () {
    return Inertia::render('Web/home/SuperAdmin/Vehicles');
})->name('SuperAdmin.Vehicles');
Route::get('/SuperAdmin/Vehicles', function () {
    return Inertia::render('Web/home/SuperAdmin/Vehicles');
})->name('SuperAdmin.Vehicles');

// Route::get('/SuperAdmin/LandVehicleDetails', function () {
//     return Inertia::render('Web/home/SuperAdmin/LandVehicleDetails');
// })->name('SuperAdmin.LandVehicleDetails');

// Route::get('/SuperAdmin/SeaVehicleDetails', function () {
//     return Inertia::render('Web/home/SuperAdmin/SeaVehicleDetails');
// })->name('SuperAdmin.SeaVehicleDetails');

// Route::get('/SuperAdmin/AirVehicleDetails', function () {
//     return Inertia::render('Web/home/SuperAdmin/AirVehicleDetails');
// })->name('SuperAdmin.AirVehicleDetails');

Route::get('/SuperAdmin/Vender', function () {
    return Inertia::render('Web/home/SuperAdmin/NewVender');
})->name('SuperAdmin.NewVender');


Route::get('/SuperAdmin/Vehicles', function () {
    return Inertia::render('Web/home/SuperAdmin/Vehicles');
})->name('SuperAdmin.Vehicles');

// Route::get('/SuperAdmin/LandVehicleDetails', function () {
//     return Inertia::render('Web/home/SuperAdmin/LandVehicleDetails');
// })->name('SuperAdmin.LandVehicleDetails');

// Route::get('/SuperAdmin/SeaVehicleDetails', function () {
//     return Inertia::render('Web/home/SuperAdmin/SeaVehicleDetails');
// })->name('SuperAdmin.SeaVehicleDetails');

// Route::get('/SuperAdmin/AirVehicleDetails', function () {
//     return Inertia::render('Web/home/SuperAdmin/AirVehicleDetails');
// })->name('SuperAdmin.AirVehicleDetails');

Route::get('/SuperAdmin/Vender', function () {
    return Inertia::render('Web/home/SuperAdmin/NewVender');
})->name('SuperAdmin.NewVender');


// Route::get('/SuperAdmin/SeaVehicleDetails', function () {
//     return Inertia::render('Web/home/SuperAdmin/SeaVehicleDetails');
// })->name('SuperAdmin.SeaVehicleDetails');

// Route::get('/SuperAdmin/AirVehicleDetails', function () {
//     return Inertia::render('Web/home/SuperAdmin/AirVehicleDetails');
// })->name('SuperAdmin.AirVehicleDetails');

Route::get('/SuperAdmin/Vender', function () {
    return Inertia::render('Web/home/SuperAdmin/NewVender');
})->name('SuperAdmin.NewVender');

Route::get('/SuperAdmin/Dashboard', function () {
    return Inertia::render('Web/home/SuperAdmin/Dashboard');
})->name('SuperAdmin.Dashboard');

Route::get('/SuperAdmin/Analytics', function () {
    return Inertia::render('Web/home/SuperAdmin/Analytics');
})->name('SuperAdmin.Analytics');

Route::get('/SuperAdmin/Users', function () {
    return Inertia::render('Web/home/SuperAdmin/Users');
})->name('SuperAdmin.Users');

Route::get('/SuperAdmin/AddUser', function () {
    return Inertia::render('Web/home/SuperAdmin/AddUser');
})->name('SuperAdmin.AddUser');

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
})->name('courierService.units');

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
})->name('freight.clients');

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
    return Inertia::render('Web/home/multimodal/MultimodalUnits');
})->name('multimodal.units');

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













// Client dashboard - redirect to proper route
Route::get('/clientDashboard', function () {
    return redirect()->route('client.dashboard');
});

Route::get('/clientDashboardSettings', function () {
    return Inertia::render('Web/home/client/ClientDashboardSettings');
})->middleware(\App\Http\Middleware\ClientVerificationCheck::class)->name('clientDashboardSettings');

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
Route::get('/clientDashboard', function() { return redirect()->route('client.dashboard'); });
Route::get('/clientDashboardSettings',   $render('Web/home/client/ClientDashboardSettings'))->middleware(\App\Http\Middleware\ClientVerificationCheck::class)->name('clientDashboardSettings');
Route::get('/clientTicketBookingDashboard', $render('Web/home/client/ClientTicketBookingDashboard'))->middleware(\App\Http\Middleware\ClientVerificationCheck::class)->name('clientTicketBookingDashboard');
Route::get('/courierBookingDashboard',   $render('Web/home/client/CourierBookingDashboard'))->middleware(\App\Http\Middleware\ClientVerificationCheck::class)->name('courierBookingDashboard');
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
