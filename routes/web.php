<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WebController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// -------------------------------
// 🌐 Public Routes
// -------------------------------

// Auth
Route::get('/signup', [WebController::class, 'signup'])->name('signup.signup');
Route::get('/signin', [WebController::class, 'signin'])->name('signin.signin');

// landing pages
Route::get('/', [WebController::class, 'landingPage'])->name('landingPage.home');
Route::get('/landingPage/blog', [WebController::class, 'blog'])->name('landingPage.blog');
Route::get('/landingPage/blogExample', [WebController::class, 'blogExample'])->name('blogExample.blog');

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

// ticket booking
Route::get('/ticketBooking', [WebController::class, 'ticketBooking'])->name('ticketBooking.ticketBooking');
Route::get('/trainTicketBookingDetails', [WebController::class, 'TrainTicketBookingDetails'])->name('TrainTicketBookingDetails.TrainTicketBookingDetails');
Route::get('/busTicketBookingDetails', [WebController::class, 'busTicketBookingDetails'])->name('busTicketBookingDetails.busTicketBookingDetails');
Route::get('/flightBooking', [WebController::class, 'flightBooking'])->name('flightBooking.flightBooking');




// client routes
Route::middleware(['auth', 'role:client'])->group(function () {});

//warehouse
Route::get('/warehouse', [WebController::class, 'warehouse'])->name('warehouse.home');


// vendor - vehicle rent
// Route::get('/vendors/bookings', function () {
//     return Inertia::render('Web/home/vendors/Booking');
// })->name('vendors.bookings');

// vendor routes
// Route::middleware(['auth', 'role:vendor'])->prefix('vendors')->name('vendors.')->group(function () {
//     Route::get('/bookings', function () {
//         return Inertia::render('Web/home/vendors/Booking');
//     })->name('bookings');

//     Route::get('/units', function () {
//         return Inertia::render('Web/home/vendors/Unit');
//     })->name('units');

//     Route::get('/dashboard', function () {
//         return Inertia::render('Web/home/vendors/Dashboard');
//     })->name('dashboard');

//     Route::get('/clients', function () {
//         return Inertia::render('Web/home/vendors/Client');
//     })->name('clients');

//     Route::get('/expenses', function () {
//         return Inertia::render('Web/home/vendors/Expenses');
//     })->name('expenses');

//     Route::get('/payment', function () {
//         return Inertia::render('Web/home/vendors/Payment');
//     })->name('payment');

//     Route::get('/tracking', function () {
//         return Inertia::render('Web/home/vendors/Tracking');
//     })->name('tracking');

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





// for now ==================================================

// vendors dashboard - vehicle rental
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
})->name('unitDetails');
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
