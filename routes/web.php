<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VendorSettingsController;
use App\Http\Controllers\WebController;
use App\Http\Controllers\FlightBookingController;
use App\Http\Controllers\TrainController;
use App\Http\Controllers\BusController;
use App\Http\Controllers\BusBookingController;
use App\Http\Controllers\WarehouseControllers\Client\WarehouseBookingController;
use App\Http\Controllers\User\UserDashboardController;
use Illuminate\Foundation\Application;
use App\Http\Controllers\WarehouseControllers\Vendor\WarehouseUnitController;
use App\Http\Controllers\MultiModel\MultiModelBookingController;

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
use App\Http\Controllers\Client\ClientSettingsController;
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

// Media serving route for storage files (public access)
Route::get('/storage/{path}', [\App\Http\Controllers\SuperAdmin\WebsiteSettingsController::class, 'serveFile'])
    ->name('storage.serve')
    ->where('path', '.*');

// Public logo endpoint - accessible to all pages
Route::get('/website/logo/current', [\App\Http\Controllers\SuperAdmin\WebsiteSettingsController::class, 'getCurrentLogo'])
    ->name('website.logo.current');

Route::get('/signup', [WebController::class, 'signup'])->name('signup.signup');
Route::get('/signin', [WebController::class, 'signin'])->name('signin.signin');

Route::get('/', [WebController::class, 'landingPage'])->name('landingPage.home');
Route::get('/dashboard-redirect', [WebController::class, 'signin.signin'])->name('dashboard.redirect');
Route::get('/landingPage/blog', [WebController::class, 'blog'])->name('landingPage.blog');
Route::get('/landingPage/blogExample', [WebController::class, 'blogExample'])->name('landingPage.blogExample');

Route::get('/landingPage/terms-and-conditions', [WebController::class, 'termsAndConditions'])->name('landingPage.termsAndConditions');

Route::get('/landingPage/privacy-policy', [WebController::class, 'privacyPolicy'])->name('landingPage.privacyPolicy');

Route::get('/landingPage/return-policy', [WebController::class, 'returnPolicy'])->name('landingPage.returnPolicy');

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

// Courier Booking Dashboard (protected - requires auth)
Route::middleware(['auth'])->group(function () {
    Route::get('/courierBookingDashboard', [ClientCourierController::class, 'dashboard'])->name('courierBookingDashboard');
    Route::get('/courier-shipment/{id}', [ClientCourierController::class, 'show'])->name('courier.shipment.show');
    Route::post('/courier-shipment/{id}/update-status', [ClientCourierController::class, 'updateStatus'])->name('courier.shipment.updateStatus');
    Route::post('/courier-shipment/{id}/cancel', [ClientCourierController::class, 'cancelShipment'])->name('courier.shipment.cancel');
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
Route::get('/trainTicketBookingDetails/json', [TrainController::class, 'searchJson'])->name('trainTicketBookingDetails.json');
Route::get('/trainTicketBookingPreview', [TrainController::class, 'preview'])->name('trainTicketBookingPreview.trainTicketBookingPreview');
Route::post('/train-bookings', [TrainController::class, 'store'])->name('train-bookings.store')->middleware('auth');
Route::get('/train-booking-success/{reference}', [TrainController::class, 'bookingSuccess'])->name('train.booking.success')->middleware('auth');
// Bus booking routes (all routes are public - no auth required)
Route::get('/busTicketBookingDetails', [BusBookingController::class, 'search'])->name('busTicketBookingDetails.busTicketBookingDetails');
Route::get('/busTicketBookingDetails/json', [BusBookingController::class, 'searchJson'])->name('busTicketBookingDetails.json');
Route::post('/bus-bookings', [BusBookingController::class, 'store'])->name('bus-bookings.store')->middleware('auth');
Route::get('/bus-booking-success/{reference}', [BusBookingController::class, 'bookingSuccess'])->name('bus.booking.success')->middleware('auth');
Route::get('/busTicketBookingPreview', [BusBookingController::class, 'preview'])->name('busTicketBookingPreview.busTicketBookingPreview');

// Bus ticket routes
Route::get('/bus-ticket/download/{reference}', [BusBookingController::class, 'downloadTicket'])->name('bus.ticket.download')->middleware('auth');
Route::get('/bus-ticket/view/{reference}', [BusBookingController::class, 'viewTicket'])->name('bus.ticket.view')->middleware('auth');
Route::post('/bus-ticket/email/{reference}', [BusBookingController::class, 'emailTicket'])->name('bus.ticket.email')->middleware('auth');

// Bus booking cancellation routes
Route::get('/bus-bookings/{reference}/cancellation-policy', [BusBookingController::class, 'getCancellationPolicy'])->name('bus.booking.cancellation.policy')->middleware('auth');
Route::post('/bus-bookings/{reference}/cancel', [BusBookingController::class, 'cancelBooking'])->name('bus.booking.cancel')->middleware('auth');

// Train booking cancellation routes
Route::get('/train-bookings/{reference}/cancellation-policy', [TrainController::class, 'getCancellationPolicy'])->name('train.booking.cancellation.policy')->middleware('auth');
Route::post('/train-bookings/{reference}/cancel', [TrainController::class, 'cancelBooking'])->name('train.booking.cancel')->middleware('auth');

// Flight booking cancellation routes
Route::get('/flight-bookings/{reference}/cancellation-policy', [FlightBookingController::class, 'getCancellationPolicy'])->name('flight.booking.cancellation.policy')->middleware('auth');
Route::post('/flight-bookings/{reference}/cancel', [FlightBookingController::class, 'cancelBooking'])->name('flight.booking.cancel')->middleware('auth');

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
Route::get('/multiModel/plan-journey', [WebController::class, 'multiModelPlanJourney'])->name('multiModelPlanJourney.planJourney');
Route::get('/multiModel/available-vehicles', [WebController::class, 'multiModelAvailableVehicles'])->name('multiModelAvailableVehicles.availableVehicles');
Route::post('/multiModel/fetch-available-vehicles', [WebController::class, 'fetchAvailableVehicles'])->name('fetchAvailableVehicles');
Route::get('/multiModel/reviewJourney', [WebController::class, 'ReviewJourney'])->name('ReviewJourney.reviewJourney');
Route::get('/multiModel/travellerDetails', [WebController::class, 'TravellerDetails'])->name('TravellerDetails.travellerDetails');
Route::get('/multiModel/payment', [WebController::class, 'Payment'])->name('Payment.payment');
Route::get('/multiModel/vehicleDetails/{vehicle}', [WebController::class, 'MultimodelVehicleDetails'])->name('MultimodelVehicleDetails.multimodelVehicleDetails');

// Multi-Model Booking API Routes
Route::prefix('multiModel')->name('multiModel.')->group(function () {
    // Journey management
    Route::post('/journey/store', [MultiModelBookingController::class, 'storeJourneyPlan'])->name('journey.store');
    Route::get('/journey/get', [MultiModelBookingController::class, 'getJourneyPlan'])->name('journey.get');
    
    // Vehicle selection for legs
    Route::post('/leg/{legIndex}/available-vehicles', [MultiModelBookingController::class, 'getAvailableVehiclesForLeg'])->name('leg.vehicles');
    Route::post('/leg/{legIndex}/select-vehicle', [MultiModelBookingController::class, 'selectVehicleForLeg'])->name('leg.select');
    Route::delete('/leg/{legIndex}/remove-vehicle', [MultiModelBookingController::class, 'removeVehicleFromLeg'])->name('leg.remove');
    
    // Cart management
    Route::get('/cart', [MultiModelBookingController::class, 'getCart'])->name('cart.get');
    
    // Personal info (no auth required - stores in session)
    Route::post('/personal-info', [MultiModelBookingController::class, 'storePersonalInfo'])->name('personalInfo.store');
    
    // Checkout and payment (protected)
    Route::middleware(['auth'])->group(function () {
        Route::get('/checkout', [MultiModelBookingController::class, 'showCheckout'])->name('checkout');
        Route::get('/payment-page', [MultiModelBookingController::class, 'showPayment'])->name('payment.show');
        Route::post('/confirm', [MultiModelBookingController::class, 'confirmBooking'])->name('booking.confirm');
        Route::get('/booking/{id}/summary', [MultiModelBookingController::class, 'showSummary'])->name('booking.summary');
    });
    
    // Vendor approval endpoints (protected - requires vendor role)
    Route::middleware(['auth', 'vendor.verified'])->group(function () {
        Route::post('/vendor/booking/approve/{bookingId}/{bookingType}', [MultiModelBookingController::class, 'approveBooking'])->name('vendor.booking.approve');
        Route::post('/vendor/booking/reject/{bookingId}/{bookingType}', [MultiModelBookingController::class, 'rejectBooking'])->name('vendor.booking.reject');
    });
});

// bus section
Route::get('/multiModel/bus/busDetails', [WebController::class, 'BusDetails'])->name('BusDetails.busDetails');
Route::get('/multiModel/bus/payment', [WebController::class, 'BusPayment'])->name('BusPayment.busPayment');
Route::get('/multiModel/bus/confirmPayment', [WebController::class, 'BusConfirmPayment'])->name('BusConfirmPayment.busConfirmPayment');

// train section
Route::get('/multiModel/train/trainDetails', [WebController::class, 'TrainDetails'])->name('TrainDetails.trainDetails');
Route::get('/multiModel/train/payment', [WebController::class, 'TrainPayment'])->name('TrainPayment.trainPayment');
Route::get('/multiModel/train/confirmPayment', [WebController::class, 'TrainConfirmPayment'])->name('TrainConfirmPayment.trainConfirmPayment');

// yatch section
Route::get('/multiModel/yatch/yatchDetails', [WebController::class, 'YatchDetails'])->name('YatchDetails.yatchDetails');
Route::get('/multiModel/yatch/payment', [WebController::class, 'YatchPayment'])->name('YatchPayment.yatchPayment');
Route::get('/multiModel/yatch/confirmPayment', [WebController::class, 'YatchConfirmPayment'])->name('YatchConfirmPayment.yatchConfirmPayment');




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
        
        // Cancellation routes
        Route::get('/booking/{id}/cancel-preview', [\App\Http\Controllers\WarehouseBookingCancellationController::class, 'preview'])->name('cancel-preview');
        Route::post('/booking/{id}/cancel', [\App\Http\Controllers\WarehouseBookingCancellationController::class, 'cancel'])->name('cancel');
    });
});

/*
|--------------------------------------------------------------------------
| Public Vehicle Browsing
|--------------------------------------------------------------------------
*/
Route::get('/clientRent', [ClientVehicleController::class, 'home'])->name('client.home');
Route::get('/vehicleList', [ClientVehicleController::class, 'vehicleList'])->name('vehicle.list');
Route::get('/vehicleList/json', [ClientVehicleController::class, 'vehicleListJson'])->name('vehicle.list.json');
Route::get('/seaVehicleList', [ClientVehicleController::class, 'seaVehicleList'])->name('seaVehicle.list');
Route::get('/seaVehicleList/json', [ClientVehicleController::class, 'seaVehicleListJson'])->name('seaVehicle.list.json');
Route::get('/airVehicleList', [ClientVehicleController::class, 'airVehicleList'])->name('airVehicle.list');
Route::get('/airVehicleList/json', [ClientVehicleController::class, 'airVehicleListJson'])->name('airVehicle.list.json');
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

    // Authenticated client routes (must be client role)
    // NOTE: this route group is for client users. It previously used `role:vendor` which
    // prevented client accounts from accessing these pages (air/land booking checkout/payments).
    // Change to `role:client` so authenticated clients can reach the booking flows.
    Route::middleware(['auth', 'role:client'])->group(function () {
        Route::get('/bookings/checkout', [ClientBookingController::class, 'showCheckout'])->name('bookings.checkout');
        Route::post('/bookings', [ClientBookingController::class, 'store'])->name('bookings.store');
        Route::get('/bookings/{booking}/payments', [ClientBookingController::class, 'payments'])->name('bookings.payments');
        Route::post('/bookings/{booking}/confirm', [ClientBookingController::class, 'confirm'])->name('bookings.confirm');
        Route::get('/bookings/{booking}/summary', [ClientBookingController::class, 'summary'])->name('bookings.summary');
        Route::post('/bookings/{booking}/cancel', [ClientBookingController::class, 'cancel'])->name('bookings.cancel');
        
        // Vehicle booking cancellation routes
        Route::get('/bookings/{booking}/cancellation-policy', [ClientBookingController::class, 'getCancellationPolicy'])->name('bookings.cancellation-policy');
        Route::post('/bookings/{booking}/cancel-booking', [ClientBookingController::class, 'cancelBooking'])->name('bookings.cancel-booking');
        Route::get('/bookings/{booking}/vendor/cancellation-policy', [ClientBookingController::class, 'getVendorCancellationPolicy'])->name('bookings.vendor.cancellation-policy');
        Route::post('/bookings/{booking}/vendor/cancel-booking', [ClientBookingController::class, 'cancelBookingAsVendor'])->name('bookings.vendor.cancel-booking');

        Route::get('/airBookings/quote', [ClientBookingController::class, 'airVehicleQuote'])->name('airBookings.quote');
        Route::get('/airBookings/checkout', [ClientBookingController::class, 'showAirVehicleCheckout'])->name('airBookings.checkout');
        Route::post('/airBookings', [ClientBookingController::class, 'airVehicleStore'])->name('airBookings.store');
        // Use a consistent route parameter name so Laravel's route-model binding
        // can inject the AirVehicleBookings model into controller methods.
        Route::get('/airBookings/{airVehicleBooking}/payments', [ClientBookingController::class, 'airVehiclePayments'])->name('airBookings.payments');
        Route::post('/airBookings/{airVehicleBooking}/confirm', [ClientBookingController::class, 'airVehicleConfirm'])->name('airBookings.confirm');
        Route::get('/airBookings/{airVehicleBooking}/summary', [ClientBookingController::class, 'airVehicleSummary'])->name('airBookings.summary');
        Route::post('/airBookings/{airVehicleBooking}/cancel', [ClientBookingController::class, 'airVehicleCancel'])->name('airBookings.cancel');

        // Sea Vehicle Booking Routes
        Route::get('/seaBookings/quote', [ClientBookingController::class, 'seaVehicleQuote'])->name('seaBookings.quote');
        Route::get('/seaBookings/checkout', [ClientBookingController::class, 'showSeaVehicleCheckout'])->name('seaBookings.checkout');
        Route::post('/seaBookings', [ClientBookingController::class, 'seaVehicleStore'])->name('seaBookings.store');
        // Use a consistent route parameter name so Laravel's route-model binding
        // can inject the SeaVehicleBookings model into controller methods.
        Route::get('/seaBookings/{seaVehicleBooking}/payments', [ClientBookingController::class, 'seaVehiclePayments'])->name('seaBookings.payments');
        Route::post('/seaBookings/{seaVehicleBooking}/confirm', [ClientBookingController::class, 'seaVehicleConfirm'])->name('seaBookings.confirm');
        Route::get('/seaBookings/{seaVehicleBooking}/summary', [ClientBookingController::class, 'seaVehicleSummary'])->name('seaBookings.summary');
        Route::post('/seaBookings/{seaVehicleBooking}/cancel', [ClientBookingController::class, 'seaVehicleCancel'])->name('seaBookings.cancel');



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

    // Profile Routes
    Route::get('/profile', [\App\Http\Controllers\SuperAdmin\ProfileController::class, 'index'])->name('profile');
    Route::put('/profile', [\App\Http\Controllers\SuperAdmin\ProfileController::class, 'update'])->name('profile.update');

    Route::get('/Analytics', function () {
        return Inertia::render('Web/home/SuperAdmin/Analytics');
    })->name('Analytics');

    Route::get('/Users', [\App\Http\Controllers\SuperAdmin\UserController::class, 'index'])->name('Users');

    // User Management Routes
    Route::prefix('users')->name('users.')->group(function () { 
        Route::get('/', [\App\Http\Controllers\SuperAdmin\UserController::class, 'index'])->name('index');
        Route::get('/clients', [\App\Http\Controllers\SuperAdmin\UserController::class, 'clients'])->name('clients');
        Route::get('/service-providers', [\App\Http\Controllers\SuperAdmin\ServiceProviderController::class, 'index'])->name('serviceProviders');
        Route::get('/service-providers/{user}/review', [\App\Http\Controllers\SuperAdmin\ServiceProviderController::class, 'show'])->name('serviceProviders.review');
        Route::post('/service-providers/{registration}/approve-service', [\App\Http\Controllers\SuperAdmin\ServiceProviderController::class, 'approveService'])->name('serviceProviders.approveService');
        Route::post('/service-providers/{registration}/reject-service', [\App\Http\Controllers\SuperAdmin\ServiceProviderController::class, 'rejectService'])->name('serviceProviders.rejectService');
        Route::post('/service-providers/{registration}/request-service-revision', [\App\Http\Controllers\SuperAdmin\ServiceProviderController::class, 'requestServiceRevision'])->name('serviceProviders.requestServiceRevision');
        Route::post('/service-providers/{registration}/handle-resubmitted', [\App\Http\Controllers\SuperAdmin\ServiceProviderController::class, 'handleResubmittedService'])->name('serviceProviders.handleResubmitted');
        Route::post('/service-providers/{user}/approve-all', [\App\Http\Controllers\SuperAdmin\ServiceProviderController::class, 'approveAll'])->name('serviceProviders.approveAll');
        Route::post('/service-providers/{user}/reject-all', [\App\Http\Controllers\SuperAdmin\ServiceProviderController::class, 'rejectAll'])->name('serviceProviders.rejectAll');
        Route::post('/service-providers/{user}/request-revision', [\App\Http\Controllers\SuperAdmin\ServiceProviderController::class, 'requestRevision'])->name('serviceProviders.requestRevision');
        Route::post('/service-providers/{user}/add-note', [\App\Http\Controllers\SuperAdmin\ServiceProviderController::class, 'addNote'])->name('serviceProviders.addNote');
        Route::post('/service-providers/{user}/block', [\App\Http\Controllers\SuperAdmin\ServiceProviderController::class, 'blockVendor'])->name('serviceProviders.block');
        Route::post('/service-providers/{user}/unblock', [\App\Http\Controllers\SuperAdmin\ServiceProviderController::class, 'unblockVendor'])->name('serviceProviders.unblock');
        Route::get('/service-providers/{registration}/download-document/{fieldKey}', [\App\Http\Controllers\SuperAdmin\ServiceProviderController::class, 'downloadDocument'])->name('serviceProviders.downloadDocument');
        Route::get('/service-providers/{user}/download-all-documents', [\App\Http\Controllers\SuperAdmin\ServiceProviderController::class, 'downloadAllDocuments'])->name('serviceProviders.downloadAllDocs');
        Route::get('/export', [\App\Http\Controllers\SuperAdmin\UserController::class, 'export'])->name('export');
        Route::get('/clients/export', [\App\Http\Controllers\SuperAdmin\UserController::class, 'export'])->name('clients.export');
        Route::get('/service-providers/export', [\App\Http\Controllers\SuperAdmin\UserController::class, 'export'])->name('serviceProviders.export');

        // Driver Management Routes
        Route::get('/drivers', [\App\Http\Controllers\SuperAdmin\DriverController::class, 'index'])->name('drivers');
        Route::get('/drivers/{driver}', [\App\Http\Controllers\SuperAdmin\DriverController::class, 'show'])->name('drivers.show');
        Route::post('/drivers/{driver}/status', [\App\Http\Controllers\SuperAdmin\DriverController::class, 'changeStatus'])->name('drivers.changeStatus');
        Route::post('/drivers/{driver}/verify-license', [\App\Http\Controllers\SuperAdmin\DriverController::class, 'verifyLicense'])->name('drivers.verifyLicense');
        Route::post('/drivers/{driver}/approve', [\App\Http\Controllers\SuperAdmin\DriverController::class, 'approveDriver'])->name('drivers.approve');
        Route::delete('/drivers/{driver}', [\App\Http\Controllers\SuperAdmin\DriverController::class, 'destroy'])->name('drivers.destroy');

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

    // Settings Routes
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/cancellation', [\App\Http\Controllers\CancellationSettingsController::class, 'edit'])->name('cancellation.edit');
        Route::put('/cancellation', [\App\Http\Controllers\CancellationSettingsController::class, 'update'])->name('cancellation.update');
        
        Route::get('/commission', [\App\Http\Controllers\SuperAdmin\CommissionController::class, 'edit'])->name('commission.edit');
        
        Route::get('/website', [\App\Http\Controllers\SuperAdmin\WebsiteSettingsController::class, 'index'])->name('website.index');
        Route::post('/website/logo', [\App\Http\Controllers\SuperAdmin\WebsiteSettingsController::class, 'uploadLogo'])->name('website.uploadLogo');
        Route::get('/website/current-logo', [\App\Http\Controllers\SuperAdmin\WebsiteSettingsController::class, 'getCurrentLogo'])->name('website.currentLogo');
    });

    // Commission API Routes
    Route::prefix('commissions')->name('commissions.')->group(function () {
        Route::get('/', [\App\Http\Controllers\SuperAdmin\CommissionController::class, 'index'])->name('index');
        Route::post('/', [\App\Http\Controllers\SuperAdmin\CommissionController::class, 'store'])->name('store');
        Route::get('/{commission}', [\App\Http\Controllers\SuperAdmin\CommissionController::class, 'show'])->name('show');
        Route::put('/{commission}', [\App\Http\Controllers\SuperAdmin\CommissionController::class, 'update'])->name('update');
        Route::delete('/{commission}', [\App\Http\Controllers\SuperAdmin\CommissionController::class, 'destroy'])->name('destroy');
        Route::patch('/{commission}/status', [\App\Http\Controllers\SuperAdmin\CommissionController::class, 'updateStatus'])->name('updateStatus');
        Route::post('/bulk-delete', [\App\Http\Controllers\SuperAdmin\CommissionController::class, 'bulkDelete'])->name('bulkDelete');
    });

    // Commission Earnings Routes
    Route::prefix('commission-earnings')->name('commission-earnings.')->group(function () {
        Route::get('/', [\App\Http\Controllers\SuperAdmin\CommissionEarningsController::class, 'index'])->name('index');
        Route::get('/report', [\App\Http\Controllers\SuperAdmin\CommissionEarningsController::class, 'report'])->name('report');
        Route::get('/export', [\App\Http\Controllers\SuperAdmin\CommissionEarningsController::class, 'export'])->name('export');
        Route::get('/service/{serviceType}', [\App\Http\Controllers\SuperAdmin\CommissionEarningsController::class, 'byServiceType'])->name('byServiceType');
        Route::get('/vendor/{vendorId}', [\App\Http\Controllers\SuperAdmin\CommissionEarningsController::class, 'vendorEarnings'])->name('vendorEarnings');
    });

    // Payments Routes
    Route::get('/payments', [\App\Http\Controllers\SuperAdmin\PaymentsController::class, 'index'])->name('payments');
    Route::get('/payments/stats', [\App\Http\Controllers\SuperAdmin\PaymentsController::class, 'getPaymentStats'])->name('payments.stats');
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
    Route::get('/clients', [\App\Http\Controllers\WarehouseControllers\Vendor\WarehouseClientController::class, 'index'])->name('clients');
    Route::get('/expenses', fn() => Inertia::render('Web/home/vendors/warehouse/Expenses'))->name('expenses');
    Route::get('/payment', fn() => Inertia::render('Web/home/vendors/warehouse/Payment'))->name('payment');
    Route::get('/tracking', fn() => Inertia::render('Web/home/vendors/warehouse/Tracking'))->name('tracking');
    Route::get('/calendar', [\App\Http\Controllers\WarehouseControllers\Vendor\WarehouseCalendarController::class, 'index'])->name('calendar');

    // Notification routes
    Route::get('/notifications', [\App\Http\Controllers\WarehouseControllers\Vendor\WarehouseNotificationController::class, 'index'])->name('notifications');
    Route::get('/notifications/data', [\App\Http\Controllers\WarehouseControllers\Vendor\WarehouseNotificationController::class, 'getData'])->name('notifications.data');
    Route::get('/notifications/unread-count', [\App\Http\Controllers\WarehouseControllers\Vendor\WarehouseNotificationController::class, 'unreadCount'])->name('notifications.unread-count');
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\WarehouseControllers\Vendor\WarehouseNotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/mark-all-read', [\App\Http\Controllers\WarehouseControllers\Vendor\WarehouseNotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    Route::delete('/notifications/{id}', [\App\Http\Controllers\WarehouseControllers\Vendor\WarehouseNotificationController::class, 'destroy'])->name('notifications.destroy');

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

    // API routes for warehouse reservations management
    Route::get('/reservations', fn() => Inertia::render('Web/home/vendors/warehouse/Reservation'))->name('reservations');
    Route::get('/api/reservations', [\App\Http\Controllers\WarehouseControllers\Vendor\WarehouseReservationController::class, 'index'])->name('api.reservations.index');
    Route::get('/api/reservations/stats', [\App\Http\Controllers\WarehouseControllers\Vendor\WarehouseReservationController::class, 'getStats'])->name('api.reservations.stats');
    Route::get('/api/reservations/chart-data', [\App\Http\Controllers\WarehouseControllers\Vendor\WarehouseReservationController::class, 'getChartData'])->name('api.reservations.chart-data');
    Route::get('/api/reservations/{reservationId}', [\App\Http\Controllers\WarehouseControllers\Vendor\WarehouseReservationController::class, 'show'])->name('api.reservations.show');
    Route::patch('/api/reservations/{reservationId}/confirm', [\App\Http\Controllers\WarehouseControllers\Vendor\WarehouseReservationController::class, 'confirm'])->name('api.reservations.confirm');
    Route::patch('/api/reservations/{reservationId}/cancel', [\App\Http\Controllers\WarehouseControllers\Vendor\WarehouseReservationController::class, 'cancel'])->name('api.reservations.cancel');
    Route::patch('/api/reservations/{reservationId}/complete', [\App\Http\Controllers\WarehouseControllers\Vendor\WarehouseReservationController::class, 'complete'])->name('api.reservations.complete');
    Route::put('/api/reservations/{reservationId}', [\App\Http\Controllers\WarehouseControllers\Vendor\WarehouseReservationController::class, 'update'])->name('api.reservations.update');

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

// Payments page (Legacy route for backward compatibility)
Route::get('/SuperAdmin/payments', [\App\Http\Controllers\SuperAdmin\PaymentsController::class, 'index'])->name('payments.index');

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
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard'); // primary route
        Route::get('/', [DashboardController::class, 'index']); // legacy path

        // Notification routes
        Route::get('/notifications', [NotificationController::class, 'page'])->name('notifications');
        Route::get('/notifications/data', [NotificationController::class, 'index'])->name('notifications.index');
        Route::get('/notifications/count', [NotificationController::class, 'unreadCount'])->name('notifications.count');
        Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.markAsRead');
        Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.markAllAsRead');
        Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');

        // Bookings page with DB-fed props (table + chart)
        Route::get('/bookings', [VendorBookingController::class, 'page'])->name('bookings');
        
        // API endpoint to update booking
        Route::patch('/api/bookings/{bookingId}', [VendorBookingController::class, 'update'])->name('api.bookings.update');

        // Clients page with actual booking data filtered by vehicle type
        Route::get('/clients', [VendorBookingController::class, 'clients'])->name('clients');

        // Payment page with actual transaction data
        Route::get('/payment', [VendorBookingController::class, 'payments'])->name('payment');

        // Vendor booking cancellation API routes
        Route::get('/bookings/{booking}/vendor/cancellation-policy', [ClientBookingController::class, 'getVendorCancellationPolicy'])->name('bookings.vendor.cancellation-policy');
        Route::post('/bookings/{booking}/vendor/cancel-booking', [ClientBookingController::class, 'cancelBookingAsVendor'])->name('bookings.vendor.cancel-booking');

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
        Route::post('/drivers/{driver}/renew-license', [DriverController::class, 'renewLicense'])->name('drivers.renew-license');

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
        Route::get('/dashboard', [UserDashboardController::class, 'view'])->name('dashboard');
        Route::get('/flight-view', [UserDashboardController::class, 'flightView'])->name('fight_view');
        Route::get('/booking-view', [UserDashboardController::class, 'bookingView'])->name('booking_view');
        Route::get('/freight-bookings', [UserDashboardController::class, 'freightBookings'])->name('freight_bookings');
        Route::get('/airticket-book', [UserDashboardController::class, 'airticketBook'])->name('airticket_book');
        Route::get('/airticket-view', [UserDashboardController::class, 'airticketBookView'])->name('airticket_view');
        Route::delete('/booking/{id}', [UserDashboardController::class, 'destroy'])->name('booking_view.destroy');
    });

/*
|--------------------------------------------------------------------------
| General Dashboard Route (redirects based on role)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard/view', [UserDashboardController::class, 'view'])->name('dashboard.view');
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard', [
            'user' => Auth::user()
        ]);
    })->name('dashboard');
});

// Client Dashboard Route with proper verification
Route::get('/client/dashboard', [ClientDashboardController::class, 'dashboard'])->name('client.dashboard');

// Main client dashboard route (referenced by auth controllers)
Route::get('/client/main-dashboard', [ClientDashboardController::class, 'dashboard'])->name('client.mainDashboard');

// Legacy client dashboard routes (public shell) - keep for backward compatibility
Route::get('/ClientDashboard', fn() => Inertia::render('Web/home/client/ClientDashboard'))->middleware(\App\Http\Middleware\ClientVerificationCheck::class)->name('ClientDashboard');
Route::get('/clientDashboard', [ClientDashboardController::class, 'dashboard'])->name('clientDashboard');

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
Route::redirect('/dashboard', '/vendors/dashboard')->name('dashboard.legacy');

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
Route::redirect('/SuperAdmin/settings/cancellation', '/superadmin/settings/cancellation')->name('SuperAdmin.settings.cancellation.legacy');
// Route::get('/mainDashboard', function () {
//     return Inertia::render('Web/home/vendors/MainDashboard');
// })->name('mainDashboard');

Route::get('/unitDetails', function () {
    return Inertia::render('Web/home/vendors/UnitDetails');
})->name('unitDetails');

Route::middleware(['auth'])->group(function () {
    Route::get('/settingsPage', [VendorSettingsController::class, 'show'])->name('settingsPage');
    Route::post('/settingsPage', [VendorSettingsController::class, 'update'])->name('vendor.settings.update');
    Route::delete('/settingsPage/image', [VendorSettingsController::class, 'removeImage'])->name('vendor.settings.removeImage');
});

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
    return Inertia::render('Web/home/vendors/warehouse/Bookings');
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

Route::get('/SuperAdmin/Dashboard', function () {
    return Inertia::render('Web/home/SuperAdmin/Dashboard');
})->name('SuperAdmin.Dashboard');

Route::get('/SuperAdmin/Analytics', function () {
    return Inertia::render('Web/home/SuperAdmin/Analytics');
})->name('SuperAdmin.Analytics');

Route::get('/SuperAdmin/Vehicles', function () {
    return Inertia::render('Web/home/SuperAdmin/Vehicles');
})->name('SuperAdmin.Vehicles');

Route::get('/superadmin/Warehouse', [\App\Http\Controllers\SuperAdmin\WarehouseController::class, 'index'])->name('superadmin.Warehouse');

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

// SuperAdmin Reports Routes
Route::get('/SuperAdmin/reports/filter-options', [\App\Http\Controllers\SuperAdmin\ReportsController::class, 'getFilterOptions'])->name('SuperAdmin.reports.filterOptions');

Route::get('/SuperAdmin/reports/vehicles', [\App\Http\Controllers\SuperAdmin\ReportsController::class, 'vehicleBookings'])->name('SuperAdmin.reports.vehicles');

Route::get('/SuperAdmin/reports/vehicles/land', [\App\Http\Controllers\SuperAdmin\ReportsController::class, 'landVehicleBookings'])->name('SuperAdmin.reports.vehicles.land');

Route::get('/SuperAdmin/reports/vehicles/air', [\App\Http\Controllers\SuperAdmin\ReportsController::class, 'airVehicleBookings'])->name('SuperAdmin.reports.vehicles.air');

Route::get('/SuperAdmin/reports/vehicles/sea', [\App\Http\Controllers\SuperAdmin\ReportsController::class, 'seaVehicleBookings'])->name('SuperAdmin.reports.vehicles.sea');

Route::get('/SuperAdmin/reports/tickets', [\App\Http\Controllers\SuperAdmin\ReportsController::class, 'ticketBookings'])->name('SuperAdmin.reports.tickets');

Route::get('/SuperAdmin/reports/warehouse', [\App\Http\Controllers\SuperAdmin\ReportsController::class, 'warehouseBookings'])->name('SuperAdmin.reports.warehouse');

Route::get('/SuperAdmin/reports/multimodal', [\App\Http\Controllers\SuperAdmin\ReportsController::class, 'multimodalBookings'])->name('SuperAdmin.reports.multimodal');

Route::get('/SuperAdmin/reports/courier', [\App\Http\Controllers\SuperAdmin\ReportsController::class, 'courierBookings'])->name('SuperAdmin.reports.courier');

Route::get('/SuperAdmin/reports/freight', [\App\Http\Controllers\SuperAdmin\ReportsController::class, 'freightBookings'])->name('SuperAdmin.reports.freight');

Route::get('/SuperAdmin/reports/client', [\App\Http\Controllers\SuperAdmin\ReportsController::class, 'clientReport'])->name('SuperAdmin.reports.client');

Route::get('/SuperAdmin/reports/service-provider', [\App\Http\Controllers\SuperAdmin\ReportsController::class, 'serviceProviderReport'])->name('SuperAdmin.reports.service-provider');

// vendor - warehouse rent
Route::get('/warehouse/unit', function () {
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

Route::get('/warehouse/calendar', [\App\Http\Controllers\WarehouseControllers\Vendor\WarehouseCalendarController::class, 'index'])->name('warehouse.calendar');

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


Route::get('/multimodal', function () {
    return Inertia::render('Web/home/multiModel/HomePage');
})->name('multimodal.home');


// Client dashboard - redirect to proper route
Route::get('/clientDashboard', function () {
    return redirect()->route('client.dashboard');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/clientDashboardSettings', [ClientSettingsController::class, 'show'])->name('clientDashboardSettings');
    Route::post('/clientDashboardSettings', [ClientSettingsController::class, 'update'])->name('client.settings.update');
    Route::delete('/clientDashboardSettings/image', [ClientSettingsController::class, 'removeImage'])->name('client.settings.removeImage');
});

Route::get('/clientTicketBookingDashboard', [UserDashboardController::class, 'ticketBookingDashboard'])->middleware(\App\Http\Middleware\ClientVerificationCheck::class)->name('clientTicketBookingDashboard');

Route::get('/clientVehicleDashboard', function () {
    $user = Auth::user();
    
    // Get user's vehicle bookings
    $bookings = \App\Models\Booking::with(['vehicle', 'client'])
        ->where('client_id', $user->id)
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function($booking) {
            return [
                'id' => $booking->id,
                'vehicle_name' => $booking->vehicle->name ?? $booking->vehicle->model ?? 'Vehicle',
                'vehicle_category' => $booking->vehicle->vehicle_category ?? 'land',
                'start_date' => $booking->created_at->format('Y-m-d H:i'),
                'end_date' => $booking->created_at->addDays($booking->rental_days ?? 1)->format('Y-m-d H:i'),
                'pickup_location' => $booking->vehicle->location ?? 'N/A',
                'status' => $booking->status,
                'total_amount' => $booking->total_amount,
                'hours' => 0,
                'created_at' => $booking->created_at,
            ];
        });
    
    // Get available vehicles
    $vehicles = \App\Models\Vehicle::with(['provider'])
        ->where('status', 'active')
        ->get()
        ->map(function($vehicle) {
            return [
                'id' => $vehicle->id,
                'name' => $vehicle->name ?? $vehicle->model,
                'model' => $vehicle->model,
                'vehicle_category' => $vehicle->vehicle_category,
                'location' => $vehicle->location ?? 'N/A',
                'price' => $vehicle->price_per_day ?? 0,
                'price_per_day' => $vehicle->price_per_day ?? 0,
                'price_per_hour' => 0,
                'rating' => 0,
                'status' => $vehicle->status,
            ];
        });
    
    // Calculate monthly booking data
    $monthlyData = [];
    for ($i = 0; $i < 12; $i++) {
        $month = now()->subMonths(11 - $i);
        $monthBookings = \App\Models\Booking::with('vehicle')
            ->where('client_id', $user->id)
            ->whereYear('created_at', $month->year)
            ->whereMonth('created_at', $month->month)
            ->get();
        
        $monthlyData[] = [
            'month' => $month->format('M'),
            'land' => $monthBookings->filter(function($b) {
                $category = $b->vehicle->vehicle_category ?? 'land';
                return !in_array(strtolower($category), ['air', 'sea']);
            })->count(),
            'air' => $monthBookings->filter(function($b) {
                $category = $b->vehicle->vehicle_category ?? '';
                return strtolower($category) === 'air';
            })->count(),
            'sea' => $monthBookings->filter(function($b) {
                $category = $b->vehicle->vehicle_category ?? '';
                return strtolower($category) === 'sea';
            })->count(),
        ];
    }
    
    return Inertia::render('Web/home/client/ClientVehicleDashboard', [
        'bookings' => $bookings,
        'vehicles' => $vehicles,
        'monthlyData' => $monthlyData,
    ]);
})->middleware(\App\Http\Middleware\ClientVerificationCheck::class)->name('clientVehicleDashboard');

// Vendor All Bookings Dashboard
Route::get('/vendorAllBookings', [\App\Http\Controllers\VendorAllBookingsController::class, 'index'])
    ->middleware('auth')
    ->name('vendorAllBookings');

// Vendor Booking Calendar
Route::get('/vendorAllBookings/calendar', [\App\Http\Controllers\VendorAllBookingsController::class, 'calendar'])
    ->middleware('auth')
    ->name('vendorCalendar');

Route::get('/vendorAllBookings/clients', [\App\Http\Controllers\VendorAllBookingsController::class, 'clients'])
    ->middleware('auth')
    ->name('vendorAllBookingsClients');

Route::get('/vendorAllBookings/bookings', [\App\Http\Controllers\VendorAllBookingsController::class, 'bookings'])
    ->middleware('auth')
    ->name('vendorAllBookingsPage');

Route::get('/vendorAllBookings/payment', [\App\Http\Controllers\VendorAllBookingsController::class, 'payment'])
    ->middleware('auth')
    ->name('vendorAllBookingsPayment');

Route::get('/vendorAllBookings/expenses', [\App\Http\Controllers\VendorAllBookingsController::class, 'expenses'])
    ->middleware('auth')
    ->name('vendorAllBookingsExpenses');

// Vendor Profile & Service Registration Routes
Route::middleware(['auth'])->prefix('vendor/profile')->name('vendor.profile.')->group(function () {
    Route::get('/', [\App\Http\Controllers\VendorProfileController::class, 'index'])->name('index');
    Route::post('/save', [\App\Http\Controllers\VendorProfileController::class, 'saveProfile'])->name('save');
    Route::post('/service/{subCategory}', [\App\Http\Controllers\VendorProfileController::class, 'saveServiceRegistration'])->name('service.save');
    Route::delete('/service/{subCategory}', [\App\Http\Controllers\VendorProfileController::class, 'removeServiceRegistration'])->name('service.remove');
    Route::post('/submit', [\App\Http\Controllers\VendorProfileController::class, 'submit'])->name('submit');
    Route::post('/submit-new-services', [\App\Http\Controllers\VendorProfileController::class, 'submitNewServices'])->name('submit-new-services');
    Route::delete('/logo', [\App\Http\Controllers\VendorProfileController::class, 'removeLogo'])->name('logo.remove');
});

Route::get('/clientAllBookings', function () {
    $clientId = Auth::id();
    
    // Fetch all booking types with relationships
    $vehicleBookings = \App\Models\Booking::where('client_id', $clientId)
        ->with(['vehicle.provider', 'client', 'customer', 'schedule', 'payments'])
        ->get()
        ->map(function($booking) {
            $vehicle = $booking->vehicle;
            $provider = $vehicle?->provider;
            $client = $booking->client;
            $customer = $booking->customer;
            $schedule = $booking->schedule;
            
            return [
                'id' => $booking->id,
                'booking_type' => 'vehicle',
                'service_name' => $vehicle->name ?? 'Vehicle Rental',
                'vehicle_name' => $vehicle->name ?? null,
                'vehicle_category' => $vehicle->category ?? null,
                'status' => $booking->status,
                'total_amount' => $booking->total_amount,
                'amount' => $booking->total_amount,
                'booking_date' => $booking->created_at->format('Y-m-d'),
                'start_date' => $booking->start_date,
                'end_date' => $booking->end_date,
                'pickup_location' => $schedule->pickup_location ?? null,
                'dropoff_location' => $schedule->dropoff_location ?? null,
                'booking_code' => $booking->booking_code ?? 'BK-' . $booking->id,
                'reference_number' => $booking->booking_code ?? 'REF-' . $booking->id,
                'currency' => $booking->currency ?? 'LKR',
                'created_at' => $booking->created_at,
                
                // User/Client Information
                'user' => $client ? [
                    'name' => $client->name,
                    'email' => $client->email,
                    'phone' => $client->phone,
                    'address' => $client->address,
                ] : null,
                'customer_name' => $customer->name ?? $client->name ?? null,
                'customer_email' => $customer->email ?? $client->email ?? null,
                'customer_phone' => $customer->phone ?? $client->phone ?? null,
                'customer_address' => $customer->address ?? $client->address ?? null,
                
                // Vendor/Provider Information
                'vendor' => $provider ? [
                    'name' => $provider->name,
                    'email' => $provider->email,
                    'phone' => $provider->phone,
                    'address' => $provider->address,
                ] : null,
                'vendor_name' => $provider->name ?? null,
                'vendor_email' => $provider->email ?? null,
                'vendor_phone' => $provider->phone ?? null,
                'vendor_address' => $provider->address ?? null,
                'company_name' => $provider->company_name ?? $provider->name ?? null,
                
                // Payment Information
                'payment_method' => $booking->payments->first()->payment_method ?? 'Not specified',
                'payment_status' => $booking->payments->first()->status ?? $booking->status,
                
                // Additional Details
                'notes' => $booking->notes,
                'subtotal' => $booking->subtotal,
                'deposit_amount' => $booking->deposit_amount,
                'price_per_day' => $booking->price_per_day,
                'rental_days' => $booking->rental_days,
            ];
        });

    // Fetch train bookings
    $trainBookings = \App\Models\TrainBooking::where('user_id', $clientId)
        ->with(['user', 'trainSchedule.train'])
        ->get()
        ->map(function($booking) {
            return [
                'id' => $booking->id,
                'booking_type' => 'train',
                'service_name' => 'Train Ticket - ' . ($booking->trainSchedule?->train?->name ?? 'Train'),
                'status' => $booking->status,
                'total_amount' => $booking->total_amount,
                'amount' => $booking->total_amount,
                'booking_date' => $booking->created_at->format('Y-m-d'),
                'reference_number' => $booking->booking_reference,
                'booking_code' => $booking->booking_reference,
                'currency' => 'LKR',
                'created_at' => $booking->created_at,
                'user' => $booking->user ? [
                    'name' => $booking->user->name,
                    'email' => $booking->user->email,
                    'phone' => $booking->user->phone,
                    'address' => $booking->user->address,
                ] : null,
                'customer_name' => $booking->passenger_name,
                'customer_email' => $booking->passenger_email,
                'customer_phone' => $booking->passenger_phone,
                'payment_status' => $booking->payment_status,
                'notes' => "Adults: {$booking->adults}, Children: {$booking->children}, Infants: {$booking->infants}",
            ];
        });

    // Fetch bus bookings
    $busBookings = \App\Models\BusBooking::where('user_id', $clientId)
        ->with(['user', 'busSchedule'])
        ->get()
        ->map(function($booking) {
            return [
                'id' => $booking->id,
                'booking_type' => 'bus',
                'service_name' => 'Bus Ticket',
                'status' => $booking->status,
                'total_amount' => $booking->total_price,
                'amount' => $booking->total_price,
                'booking_date' => $booking->booking_date?->format('Y-m-d') ?? $booking->created_at->format('Y-m-d'),
                'reference_number' => $booking->booking_reference,
                'booking_code' => $booking->booking_reference,
                'currency' => 'LKR',
                'created_at' => $booking->created_at,
                'user' => $booking->user ? [
                    'name' => $booking->user->name,
                    'email' => $booking->user->email,
                    'phone' => $booking->user->phone,
                    'address' => $booking->user->address,
                ] : null,
                'customer_name' => $booking->passenger_name,
                'customer_email' => $booking->passenger_email,
                'customer_phone' => $booking->passenger_phone,
                'notes' => "Passengers: {$booking->passenger_count}, Seats: " . implode(', ', $booking->seat_numbers ?? []),
            ];
        });

    // Fetch flight bookings
    $flightBookings = \App\Models\FlightBooking::when(
        Schema::hasColumn('flight_bookings', 'user_id'),
        fn($q) => $q->where('user_id', $clientId),
        fn($q) => $q->where('email', Auth::user()->email)
    )
        ->with(['user'])
        ->get()
        ->map(function($booking) {
            return [
                'id' => $booking->id,
                'booking_type' => 'flight',
                'service_name' => 'Flight Booking',
                'status' => $booking->status,
                'booking_date' => $booking->created_at->format('Y-m-d'),
                'start_date' => $booking->departure_date,
                'end_date' => $booking->return_date,
                'pickup_location' => $booking->departure_airport,
                'dropoff_location' => $booking->arriving_airport,
                'reference_number' => 'FL-' . $booking->id,
                'booking_code' => 'FL-' . $booking->id,
                'currency' => 'LKR',
                'created_at' => $booking->created_at,
                'user' => $booking->user ? [
                    'name' => $booking->user->name,
                    'email' => $booking->user->email,
                    'phone' => $booking->user->phone,
                    'address' => $booking->user->address,
                ] : null,
                'customer_name' => $booking->name,
                'customer_email' => $booking->email,
                'customer_phone' => $booking->phone,
                'notes' => "Trip: {$booking->trip_type}. " . ($booking->special_requests ? "Requests: {$booking->special_requests}" : ''),
            ];
        });

    // Fetch courier shipments
    $courierShipments = \App\Models\Courier\CourierShipment::where('requested_by_user_id', $clientId)
        ->with(['requestedBy', 'sender', 'recipient', 'senderAddress', 'recipientAddress', 'packages'])
        ->get()
        ->map(function($shipment) {
            $senderAddr = $shipment->senderAddress;
            $recipientAddr = $shipment->recipientAddress;
            
            return [
                'id' => $shipment->id,
                'booking_type' => 'courier',
                'service_name' => 'Courier Service - ' . ucfirst($shipment->service_level ?? 'Standard'),
                'status' => $shipment->status,
                'total_amount' => $shipment->actual_cost ?? $shipment->estimated_cost ?? 0,
                'amount' => $shipment->actual_cost ?? $shipment->estimated_cost ?? 0,
                'booking_date' => $shipment->created_at->format('Y-m-d'),
                'start_date' => $shipment->pickup_date ? $shipment->pickup_date->format('Y-m-d') : null,
                'pickup_date' => $shipment->pickup_date ? $shipment->pickup_date->format('Y-m-d') : null,
                'pickup_location' => $senderAddr ? trim(($senderAddr->address_line_1 ?? '') . ' ' . ($senderAddr->address_line_2 ?? '') . ', ' . ($senderAddr->city ?? '') . ', ' . ($senderAddr->state ?? '')) : 'Not specified',
                'dropoff_location' => $recipientAddr ? trim(($recipientAddr->address_line_1 ?? '') . ' ' . ($recipientAddr->address_line_2 ?? '') . ', ' . ($recipientAddr->city ?? '') . ', ' . ($recipientAddr->state ?? '')) : 'Not specified',
                'reference_number' => $shipment->reference,
                'booking_code' => $shipment->reference,
                'currency' => $shipment->currency_code ?? 'LKR',
                'created_at' => $shipment->created_at,
                'user' => $shipment->requestedBy ? [
                    'name' => $shipment->requestedBy->name,
                    'email' => $shipment->requestedBy->email,
                    'phone' => $shipment->requestedBy->phone,
                    'address' => $shipment->requestedBy->address,
                ] : null,
                'customer_name' => $shipment->sender?->name ?? $shipment->requestedBy?->name,
                'customer_email' => $shipment->sender?->email ?? $shipment->requestedBy?->email,
                'customer_phone' => $shipment->sender?->phone ?? $shipment->requestedBy?->phone,
                'vendor_name' => 'Courier Service Provider',
                'notes' => $shipment->delivery_notes,
                'payment_method' => 'Courier Payment',
                
                // Additional courier-specific fields
                'service_level' => ucfirst($shipment->service_level ?? 'Standard'),
                'insurance_required' => $shipment->insurance_required ? 'Yes' : 'No',
                'declared_value' => $shipment->declared_value,
                'package_count' => $shipment->packages->count(),
                'tracking_reference' => $shipment->reference,
            ];
        });

    // Fetch warehouse bookings
    $warehouseBookings = \App\Models\Warehouse\WarehouseBooking::where('user_id', $clientId)
        ->with(['user', 'warehouseUnit.owner'])
        ->get()
        ->map(function($booking) {
            $unit = $booking->warehouseUnit;
            return [
                'id' => $booking->id,
                'booking_type' => 'warehouse',
                'service_name' => 'Warehouse Storage',
                'status' => $booking->status,
                'total_amount' => $booking->final_amount,
                'amount' => $booking->final_amount,
                'booking_date' => $booking->created_at->format('Y-m-d'),
                'start_date' => $booking->start_date,
                'end_date' => $booking->end_date,
                'reference_number' => $booking->booking_reference,
                'booking_code' => $booking->booking_reference,
                'currency' => 'LKR',
                'created_at' => $booking->created_at,
                'user' => $booking->user ? [
                    'name' => $booking->user->name,
                    'email' => $booking->user->email,
                    'phone' => $booking->user->phone,
                    'address' => $booking->user->address,
                ] : null,
                'customer_name' => $booking->contact_person ?? $booking->company_name,
                'customer_email' => $booking->email,
                'customer_phone' => $booking->phone,
                'company_name' => $booking->company_name,
                'vendor_name' => $unit?->owner?->name ?? 'Warehouse Provider',
                'vendor_email' => $unit?->owner?->email,
                'vendor_phone' => $unit?->owner?->phone,
                'payment_method' => $booking->payment_method,
                'payment_status' => $booking->payment_status,
                'notes' => "Storage: {$booking->storage_type}, Space: {$booking->required_space} sq ft. " . ($booking->notes ?? ''),
                'subtotal' => $booking->total_amount,
                'deposit_amount' => $booking->security_deposit,
            ];
        });

    // Combine all bookings
    $allBookings = collect($vehicleBookings)
        ->merge($trainBookings)
        ->merge($busBookings)
        ->merge($flightBookings)
        ->merge($courierShipments)
        ->merge($warehouseBookings)
        ->sortByDesc('created_at')
        ->values();

    // Calculate statistics
    $statistics = [
        'total_bookings' => $allBookings->count(),
        'active_bookings' => $allBookings->whereIn('status', ['confirmed', 'paid', 'active'])->count(),
        'total_spent' => $allBookings->sum('total_amount'),
        'this_month' => $allBookings->filter(function($b) {
            return \Carbon\Carbon::parse($b['created_at'])->isCurrentMonth();
        })->count(),
    ];

    // Monthly data for charts
    $monthlyData = [];
    for ($i = 5; $i >= 0; $i--) {
        $month = now()->subMonths($i);
        $monthBookings = $allBookings->filter(function($b) use ($month) {
            return \Carbon\Carbon::parse($b['created_at'])->isSameMonth($month);
        });
        
        $monthlyData[] = [
            'month' => $month->format('M'),
            'vehicle' => $monthBookings->where('booking_type', 'vehicle')->count(),
            'tickets' => $monthBookings->whereIn('booking_type', ['train', 'bus', 'flight'])->count(),
            'logistics' => $monthBookings->whereIn('booking_type', ['warehouse', 'courier', 'freight'])->count(),
        ];
    }

    return Inertia::render('Web/home/client/ClientAllBookings', [
        'allBookings' => $allBookings,
        'statistics' => $statistics,
        'monthlyData' => $monthlyData,
    ]);
})->middleware(\App\Http\Middleware\ClientVerificationCheck::class)->name('clientAllBookings');

// Courier booking dashboard moved to protected routes with controller

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
// Courier booking dashboard moved to protected routes with controller above
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


