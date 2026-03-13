<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\FlightBooking;
use App\Models\BusBooking;
use App\Models\TrainBooking;
use App\Models\AirVehicleBookings;
use App\Models\SeaVehicleBookings;
use App\Models\Warehouse\WarehouseBooking;
use App\Models\Courier\CourierShipment;
use App\Models\FreightQuote;
use App\Models\MultiModel\MultiModelBooking;
use App\Models\MultiModel\MultiModelJourney;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportsController extends Controller
{
    /**
     * Display all vehicle bookings report
     */
    public function vehicleBookings()
    {
        // Get Land bookings
        $landBookings = Booking::with(['customer', 'schedule'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_reference' => 'LV-' . str_pad($booking->id, 6, '0', STR_PAD_LEFT),
                    'vehicle_type' => 'Land',
                    'status' => $booking->status,
                    'final_amount' => (float)$booking->total_amount,
                    'created_at' => $booking->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Get Air vehicle bookings
        $airBookings = AirVehicleBookings::with(['customer', 'schedule'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_reference' => 'AV-' . str_pad($booking->id, 6, '0', STR_PAD_LEFT),
                    'vehicle_type' => 'Air',
                    'status' => $booking->status,
                    'final_amount' => (float) ($booking->total_amount ?? 0),
                    'created_at' => $booking->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Get Sea bookings
        $seaBookings = SeaVehicleBookings::with(['customer', 'schedule'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_reference' => 'SV-' . str_pad($booking->id, 6, '0', STR_PAD_LEFT),
                    'vehicle_type' => 'Sea',
                    'status' => $booking->status,
                    'final_amount' => (float)$booking->total_amount,
                    'created_at' => $booking->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Combine all bookings and sort by date
        $allBookings = $landBookings->concat($airBookings)->concat($seaBookings)
            ->sortByDesc('created_at')
            ->values();

        $stats = [
            'totalBookings' => Booking::count() + AirVehicleBookings::count() + SeaVehicleBookings::count(),
            'landTotal' => Booking::count(),
            'airTotal' => AirVehicleBookings::count(),
            'seaTotal' => SeaVehicleBookings::count(),
            'landRevenue' => Booking::sum('total_amount'),
            'airRevenue' => AirVehicleBookings::sum('total_amount'),
            'seaRevenue' => SeaVehicleBookings::sum('total_amount'),
        ];

        return Inertia::render('Web/home/SuperAdmin/VehicleReports', [
            'bookings' => $allBookings,
            'stats' => $stats,
        ]);
    }

    /**
     * Display land vehicle bookings report
     */
    public function landVehicleBookings()
    {
        $bookings = Booking::with(['customer', 'schedule'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_reference' => 'LV-' . str_pad($booking->id, 6, '0', STR_PAD_LEFT),
                    'status' => $booking->status,
                    'final_amount' => (float)$booking->total_amount,
                    'payment_status' => 'paid',
                    'created_at' => $booking->created_at->format('Y-m-d H:i:s'),
                    'customer' => $booking->customer ? [
                        'name' => $booking->customer->first_name . ' ' . $booking->customer->last_name,
                        'email' => $booking->customer->email,
                        'phone' => $booking->customer->phone,
                    ] : null,
                    'schedule' => $booking->schedule ? [
                        'pickup_location' => $booking->schedule->pickup_location,
                        'dropoff_location' => $booking->schedule->dropoff_location,
                        'pickup_date' => $booking->schedule->pickup_at,
                        'dropoff_date' => $booking->schedule->dropoff_at,
                    ] : null,
                ];
            });

        $stats = [
            'totalBookings' => Booking::count(),
            'totalRevenue' => Booking::sum('total_amount'),
            'confirmedBookings' => Booking::where('status', 'confirmed')->count(),
            'pendingBookings' => Booking::where('status', 'pending')->count(),
        ];

        return Inertia::render('Web/home/SuperAdmin/LandVehicleReports', [
            'bookings' => $bookings,
            'stats' => $stats,
        ]);
    }

    /**
     * Display air vehicle bookings report
     */
    public function airVehicleBookings()
    {
        $bookings = AirVehicleBookings::with(['customer', 'schedule'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_reference' => 'AV-' . str_pad($booking->id, 6, '0', STR_PAD_LEFT),
                    'status' => $booking->status,
                    'final_amount' => (float) ($booking->total_amount ?? 0),
                    'created_at' => $booking->created_at->format('Y-m-d H:i:s'),
                    'customer' => [
                        'name' => trim((($booking->customer->first_name ?? '') . ' ' . ($booking->customer->last_name ?? ''))) ?: 'N/A',
                        'email' => $booking->customer->email ?? 'N/A',
                        'phone' => $booking->customer->phone ?? 'N/A',
                    ],
                    'route' => [
                        'from' => $booking->schedule->pickup_location ?? 'N/A',
                        'to' => $booking->schedule->dropoff_location ?? 'N/A',
                    ],
                    'departure_date' => $booking->schedule->pickup_at ?? null,
                ];
            });

        $stats = [
            'totalBookings' => AirVehicleBookings::count(),
            'totalRevenue' => AirVehicleBookings::sum('total_amount'),
            'confirmedBookings' => AirVehicleBookings::where('status', 'confirmed')->count(),
            'pendingBookings' => AirVehicleBookings::where('status', 'pending')->count(),
        ];

        return Inertia::render('Web/home/SuperAdmin/AirVehicleReports', [
            'bookings' => $bookings,
            'stats' => $stats,
        ]);
    }

    /**
     * Display sea vehicle bookings report
     */
    public function seaVehicleBookings()
    {
        $bookings = SeaVehicleBookings::with(['customer', 'schedule'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_reference' => 'SV-' . str_pad($booking->id, 6, '0', STR_PAD_LEFT),
                    'status' => $booking->status,
                    'final_amount' => (float)$booking->total_amount,
                    'created_at' => $booking->created_at->format('Y-m-d H:i:s'),
                    'customer' => $booking->customer ? [
                        'name' => $booking->customer->first_name . ' ' . $booking->customer->last_name,
                        'email' => $booking->customer->email,
                        'phone' => $booking->customer->phone,
                    ] : null,
                    'schedule' => $booking->schedule ? [
                        'pickup_location' => $booking->schedule->pickup_location,
                        'dropoff_location' => $booking->schedule->dropoff_location,
                        'pickup_date' => $booking->schedule->pickup_at,
                        'dropoff_date' => $booking->schedule->dropoff_at,
                    ] : null,
                ];
            });

        $stats = [
            'totalBookings' => SeaVehicleBookings::count(),
            'totalRevenue' => SeaVehicleBookings::sum('total_amount'),
            'confirmedBookings' => SeaVehicleBookings::where('status', 'confirmed')->count(),
            'pendingBookings' => SeaVehicleBookings::where('status', 'pending')->count(),
        ];

        return Inertia::render('Web/home/SuperAdmin/SeaVehicleReports', [
            'bookings' => $bookings,
            'stats' => $stats,
        ]);
    }

    /**
     * Display ticket bookings report (flights, buses, trains)
     */
    public function ticketBookings()
    {
        $flightBookings = FlightBooking::count();
        $busBookings = BusBooking::count();
        $trainBookings = TrainBooking::count();

        $allTickets = collect();

        // Get flight bookings
        FlightBooking::orderBy('created_at', 'desc')->get()->each(function ($booking) use ($allTickets) {
            $allTickets->push([
                'id' => $booking->id,
                'type' => 'Flight',
                'booking_reference' => $booking->booking_reference ?? 'FB-' . str_pad($booking->id, 6, '0', STR_PAD_LEFT),
                'status' => $booking->status,
                'customer_name' => $booking->name,
                'customer_email' => $booking->email,
                'created_at' => $booking->created_at->format('Y-m-d H:i:s'),
                'route' => ($booking->departure_airport ?? 'N/A') . ' → ' . ($booking->arriving_airport ?? 'N/A'),
            ]);
        });

        // Get bus bookings
        BusBooking::orderBy('created_at', 'desc')->get()->each(function ($booking) use ($allTickets) {
            $allTickets->push([
                'id' => $booking->id,
                'type' => 'Bus',
                'booking_reference' => 'BB-' . str_pad($booking->id, 6, '0', STR_PAD_LEFT),
                'status' => $booking->status ?? 'pending',
                'customer_name' => $booking->passenger_name ?? 'N/A',
                'customer_email' => $booking->email ?? 'N/A',
                'created_at' => $booking->created_at->format('Y-m-d H:i:s'),
                'route' => 'N/A',
            ]);
        });

        // Get train bookings
        TrainBooking::orderBy('created_at', 'desc')->get()->each(function ($booking) use ($allTickets) {
            $allTickets->push([
                'id' => $booking->id,
                'type' => 'Train',
                'booking_reference' => 'TB-' . str_pad($booking->id, 6, '0', STR_PAD_LEFT),
                'status' => $booking->status ?? 'pending',
                'customer_name' => $booking->passenger_name ?? 'N/A',
                'customer_email' => $booking->email ?? 'N/A',
                'created_at' => $booking->created_at->format('Y-m-d H:i:s'),
                'route' => 'N/A',
            ]);
        });

        $stats = [
            'totalBookings' => $flightBookings + $busBookings + $trainBookings,
            'flightBookings' => $flightBookings,
            'busBookings' => $busBookings,
            'trainBookings' => $trainBookings,
        ];

        return Inertia::render('Web/home/SuperAdmin/TicketReports', [
            'bookings' => $allTickets->sortByDesc('created_at')->values(),
            'stats' => $stats,
        ]);
    }

    /**
     * Display warehouse bookings report
     */
    public function warehouseBookings()
    {
        $bookings = WarehouseBooking::orderBy('created_at', 'desc')
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_reference' => $booking->booking_reference,
                    'status' => $booking->status,
                    'final_amount' => (float)$booking->final_amount,
                    'payment_status' => $booking->payment_status,
                    'company_name' => $booking->company_name,
                    'contact_person' => $booking->contact_person,
                    'email' => $booking->email,
                    'phone' => $booking->phone,
                    'storage_type' => $booking->storage_type,
                    'required_space' => (float)$booking->required_space,
                    'start_date' => $booking->start_date,
                    'end_date' => $booking->end_date,
                    'duration_months' => $booking->duration_months,
                    'monthly_rate' => (float)$booking->monthly_rate,
                    'created_at' => $booking->created_at->format('Y-m-d H:i:s'),
                ];
            });

        $stats = [
            'totalBookings' => WarehouseBooking::count(),
            'totalRevenue' => WarehouseBooking::sum('final_amount'),
            'activeBookings' => WarehouseBooking::where('status', 'active')->count(),
            'pendingBookings' => WarehouseBooking::where('status', 'pending')->count(),
        ];

        return Inertia::render('Web/home/SuperAdmin/WarehouseReports', [
            'bookings' => $bookings,
            'stats' => $stats,
        ]);
    }

    /**
     * Display multimodal bookings report
     */
    public function multimodalBookings()
    {
        $bookings = MultiModelJourney::with(['user', 'legs', 'bookings'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($journey) {
                $customerData = $journey->customer_data ?? [];
                return [
                    'id' => $journey->id,
                    'booking_reference' => $journey->reference ?? 'MM-' . str_pad($journey->id, 6, '0', STR_PAD_LEFT),
                    'status' => $journey->status,
                    'total_amount' => (float)($journey->total_amount ?? 0),
                    'passenger_name' => $customerData['name'] ?? ($journey->user ? $journey->user->name : 'N/A'),
                    'passenger_email' => $customerData['email'] ?? ($journey->user ? $journey->user->email : 'N/A'),
                    'passenger_phone' => $customerData['phone'] ?? 'N/A',
                    'journey_count' => 1, // Each journey is one journey
                    'leg_count' => $journey->legs ? $journey->legs->count() : 0,
                    'created_at' => $journey->created_at->format('Y-m-d H:i:s'),
                ];
            });

        $stats = [
            'totalBookings' => MultiModelJourney::count(),
            'totalRevenue' => MultiModelJourney::sum('total_amount'),
            'confirmedBookings' => MultiModelJourney::where('status', 'confirmed')->count(),
            'pendingBookings' => MultiModelJourney::where('status', 'pending')->count(),
        ];

        return Inertia::render('Web/home/SuperAdmin/MultimodalReports', [
            'bookings' => $bookings,
            'stats' => $stats,
        ]);
    }

    /**
     * Display courier bookings report
     */
    public function courierBookings()
    {
        $bookings = CourierShipment::with(['sender', 'recipient', 'senderAddress', 'recipientAddress'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($shipment) {
                return [
                    'id' => $shipment->id,
                    'tracking_number' => $shipment->reference,
                    'status' => $shipment->status,
                    'total_amount' => (float)($shipment->actual_cost ?? $shipment->estimated_cost ?? 0),
                    'sender_name' => $shipment->sender ? $shipment->sender->name : 'N/A',
                    'sender_email' => $shipment->sender ? $shipment->sender->email : 'N/A',
                    'sender_phone' => $shipment->sender ? $shipment->sender->phone : 'N/A',
                    'receiver_name' => $shipment->recipient ? $shipment->recipient->name : 'N/A',
                    'receiver_phone' => $shipment->recipient ? $shipment->recipient->phone : 'N/A',
                    'pickup_address' => $shipment->senderAddress ? $shipment->senderAddress->line1 . ', ' . $shipment->senderAddress->city : 'N/A',
                    'delivery_address' => $shipment->recipientAddress ? $shipment->recipientAddress->line1 . ', ' . $shipment->recipientAddress->city : 'N/A',
                    'created_at' => $shipment->created_at->format('Y-m-d H:i:s'),
                ];
            });

        $stats = [
            'totalShipments' => CourierShipment::count(),
            'totalRevenue' => CourierShipment::whereNotNull('actual_cost')->sum('actual_cost') + 
                             CourierShipment::whereNull('actual_cost')->sum('estimated_cost'),
            'inTransit' => CourierShipment::where('status', 'in_transit')->count(),
            'delivered' => CourierShipment::where('status', 'delivered')->count(),
        ];

        return Inertia::render('Web/home/SuperAdmin/CourierReports', [
            'bookings' => $bookings,
            'stats' => $stats,
        ]);
    }

    /**
     * Display freight bookings report
     */
    public function freightBookings()
    {
        $bookings = FreightQuote::orderBy('created_at', 'desc')
            ->get()
            ->map(function ($quote) {
                return [
                    'id' => $quote->id,
                    'quote_reference' => 'FQ-' . str_pad($quote->id, 6, '0', STR_PAD_LEFT),
                    'status' => $quote->status ?? 'pending',
                    'company_name' => 'N/A',
                    'contact_name' => 'N/A',
                    'contact_email' => 'N/A',
                    'contact_phone' => 'N/A',
                    'origin' => $quote->origin,
                    'destination' => $quote->destination,
                    'cargo_type' => $quote->load_type,
                    'weight' => (float)($quote->total_weight_kg ?? 0),
                    'created_at' => $quote->created_at->format('Y-m-d H:i:s'),
                ];
            });

        $stats = [
            'totalQuotes' => FreightQuote::count(),
            'totalWeight' => FreightQuote::sum('total_weight_kg'),
            'pendingQuotes' => FreightQuote::where('status', 'pending')->count(),
            'approvedQuotes' => FreightQuote::where('status', 'approved')->count(),
        ];

        return Inertia::render('Web/home/SuperAdmin/FreightReports', [
            'bookings' => $bookings,
            'stats' => $stats,
        ]);
    }

    // Helper methods (reused from SuperAdminDashboardController)
    private function getLandBookings()
    {
        return Booking::with(['customer', 'schedule'])
            ->select('id', 'status', 'total_amount', 'created_at')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_reference' => 'LV-' . str_pad($booking->id, 6, '0', STR_PAD_LEFT),
                    'status' => $booking->status,
                    'final_amount' => (float)$booking->total_amount,
                    'payment_status' => 'paid',
                    'created_at' => $booking->created_at,
                ];
            })
            ->values()
            ->toArray();
    }

    private function getAirBookings()
    {
        return FlightBooking::select('id', 'booking_reference', 'status', 'created_at')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_reference' => $booking->booking_reference ?? 'FB-' . str_pad($booking->id, 6, '0', STR_PAD_LEFT),
                    'status' => $booking->status,
                    'final_amount' => 0,
                    'payment_status' => 'pending',
                    'created_at' => $booking->created_at,
                ];
            })
            ->values()
            ->toArray();
    }

    private function getSeaBookings()
    {
        return SeaVehicleBookings::with(['customer', 'schedule'])
            ->select('id', 'client_id', 'status', 'total_amount', 'created_at')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_reference' => 'SV-' . str_pad($booking->id, 6, '0', STR_PAD_LEFT),
                    'status' => $booking->status,
                    'final_amount' => (float)$booking->total_amount,
                    'payment_status' => 'paid',
                    'created_at' => $booking->created_at,
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Get filter options for reports
     */
    public function getFilterOptions()
    {
        return response()->json([
            'statuses' => ['pending', 'confirmed', 'cancelled', 'completed'],
            'vehicleTypes' => ['Land', 'Air', 'Sea'],
            'dates' => ['All', 'Last 7 Days', 'Last 30 Days', 'This Year'],
            'ticketStatuses' => ['pending', 'confirmed', 'cancelled', 'completed'],
            'warehouseStatuses' => ['pending', 'confirmed', 'cancelled', 'completed', 'cancelled_by_vendor'],
            'multimodalStatuses' => ['pending', 'confirmed', 'cancelled', 'completed'],
            'courierStatuses' => ['pending', 'in_transit', 'delivered', 'cancelled'],
            'freightStatuses' => ['pending', 'quoted', 'accepted', 'rejected', 'expired'],
        ]);
    }
}
