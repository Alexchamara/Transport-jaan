<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\TrainSchedule;
use App\Models\TrainStation;
use App\Models\Train;
use App\Models\TrainBooking;
use Carbon\Carbon;

class TrainController extends Controller
{
    public function search(Request $request)
    {
        $fromStation = $request->input('from');
        $toStation = $request->input('to');
        $departureDate = $request->input('departureDate');
        $returnDate = $request->input('returnDate');
        $tripType = $request->input('tripType', 'oneway');
        $adults = $request->input('adults', 1);
        $children = $request->input('children', 0);
        $infants = $request->input('infants', 0);

        // Parse station names and get station IDs
        $fromStationRecord = null;
        $toStationRecord = null;

        if ($fromStation) {
            $fromStationName = $this->extractStationName($fromStation);
            $fromStationRecord = TrainStation::where('name', 'like', '%' . $fromStationName . '%')->first();
        }

        if ($toStation) {
            $toStationName = $this->extractStationName($toStation);
            $toStationRecord = TrainStation::where('name', 'like', '%' . $toStationName . '%')->first();
        }

        $outboundSchedules = collect();
        $returnSchedules = collect();

        // Check if any search criteria is provided
        $hasSearchCriteria = $fromStation || $toStation || $departureDate;

        if ($hasSearchCriteria && $fromStationRecord && $toStationRecord && $departureDate) {
            // Get filtered outbound schedules based on search criteria
            $outboundSchedules = TrainSchedule::with(['train', 'departureStation', 'arrivalStation'])
                ->where('departure_station_id', $fromStationRecord->id)
                ->where('arrival_station_id', $toStationRecord->id)
                ->where('date', Carbon::parse($departureDate)->format('Y-m-d'))
                ->where('status', 'active')
                ->get()
                ->map(function ($schedule) {
                    return [
                        'id' => $schedule->id,
                        'name' => $schedule->train->name,
                        'class' => $schedule->train->class_type,
                        'route' => 'Route number: ' . $schedule->train->route_number,
                        'depart' => Carbon::parse($schedule->departure_time)->format('g:i A'),
                        'arrive' => Carbon::parse($schedule->arrival_time)->format('g:i A'),
                        'date' => Carbon::parse($schedule->date)->format('j M'),
                        'duration' => $this->formatDuration($schedule->duration_minutes),
                        'price' => $schedule->price,
                        'available_seats' => $schedule->available_seats,
                        'total_capacity' => $schedule->train->capacity,
                        'status' => $schedule->available_seats > 0 ? 'View Seats' : 'Sold Out',
                        'soldOut' => $schedule->available_seats == 0,
                        'facilities' => $schedule->train->facilities ?? [],
                        'train_number' => $schedule->train->train_number,
                        'operator' => $schedule->train->operator,
                    ];
                });

            // Get return schedules for round trip
            if ($tripType === 'roundtrip' && $returnDate) {
                $returnSchedules = TrainSchedule::with(['train', 'departureStation', 'arrivalStation'])
                    ->where('departure_station_id', $toStationRecord->id)
                    ->where('arrival_station_id', $fromStationRecord->id)
                    ->where('date', Carbon::parse($returnDate)->format('Y-m-d'))
                    ->where('status', 'active')
                    ->get()
                    ->map(function ($schedule) {
                        return [
                            'id' => $schedule->id,
                            'name' => $schedule->train->name,
                            'class' => $schedule->train->class_type,
                            'route' => 'Route number: ' . $schedule->train->route_number,
                            'depart' => Carbon::parse($schedule->departure_time)->format('g:i A'),
                            'arrive' => Carbon::parse($schedule->arrival_time)->format('g:i A'),
                            'date' => Carbon::parse($schedule->date)->format('j M'),
                            'duration' => $this->formatDuration($schedule->duration_minutes),
                            'price' => $schedule->price,
                            'available_seats' => $schedule->available_seats,
                            'total_capacity' => $schedule->train->capacity,
                            'status' => $schedule->available_seats > 0 ? 'View Seats' : 'Sold Out',
                            'soldOut' => $schedule->available_seats == 0,
                            'facilities' => $schedule->train->facilities ?? [],
                            'train_number' => $schedule->train->train_number,
                            'operator' => $schedule->train->operator,
                        ];
                    });
            }
        } elseif (!$hasSearchCriteria) {
            // If no search criteria provided, show all available trains
            $outboundSchedules = TrainSchedule::with(['train', 'departureStation', 'arrivalStation'])
                ->where('status', 'active')
                ->where('date', '>=', Carbon::today()->format('Y-m-d'))
                ->orderBy('date')
                ->orderBy('departure_time')
                ->limit(20) // Limit to prevent overwhelming the UI
                ->get()
                ->map(function ($schedule) {
                    return [
                        'id' => $schedule->id,
                        'name' => $schedule->train->name,
                        'class' => $schedule->train->class_type,
                        'route' => 'Route number: ' . $schedule->train->route_number,
                        'depart' => Carbon::parse($schedule->departure_time)->format('g:i A'),
                        'arrive' => Carbon::parse($schedule->arrival_time)->format('g:i A'),
                        'date' => Carbon::parse($schedule->date)->format('j M'),
                        'duration' => $this->formatDuration($schedule->duration_minutes),
                        'price' => $schedule->price,
                        'available_seats' => $schedule->available_seats,
                        'total_capacity' => $schedule->train->capacity,
                        'status' => $schedule->available_seats > 0 ? 'View Seats' : 'Sold Out',
                        'soldOut' => $schedule->available_seats == 0,
                        'facilities' => $schedule->train->facilities ?? [],
                        'train_number' => $schedule->train->train_number,
                        'operator' => $schedule->train->operator,
                    ];
                });
        }

        return Inertia::render('Web/home/ticketBooking/TrainTicketBookingDetails', [
            'searchParams' => [
                'from' => $fromStation,
                'to' => $toStation,
                'departureDate' => $departureDate,
                'returnDate' => $returnDate,
                'tripType' => $tripType,
                'adults' => (int)$adults,
                'children' => (int)$children,
                'infants' => (int)$infants,
            ],
            'outboundSchedules' => $outboundSchedules,
            'returnSchedules' => $returnSchedules,
            'fromStationName' => $fromStationRecord ? $fromStationRecord->name : $fromStation,
            'toStationName' => $toStationRecord ? $toStationRecord->name : $toStation,
            'hasActiveFilters' => $hasSearchCriteria && ($fromStationRecord && $toStationRecord && $departureDate),
            'isShowingAllTrains' => !$hasSearchCriteria,
        ]);
    }

    public function preview(Request $request)
    {
        // Check if the user is logged in
        if (!auth()->check()) {
            return redirect()->route('signin.signin')->with('message', 'Please log in to make a booking.');
        }

        $scheduleId = $request->input('schedule_id');
        $returnScheduleId = $request->input('return_schedule_id');
        $adults = $request->input('adults', 1);
        $children = $request->input('children', 0);
        $infants = $request->input('infants', 0);

        $outboundSchedule = null;
        $returnSchedule = null;

        if ($scheduleId) {
            $outboundSchedule = TrainSchedule::with(['train', 'departureStation', 'arrivalStation'])
                ->find($scheduleId);
        }

        if ($returnScheduleId) {
            $returnSchedule = TrainSchedule::with(['train', 'departureStation', 'arrivalStation'])
                ->find($returnScheduleId);
        }

        $totalPrice = 0;
        if ($outboundSchedule) {
            $totalPrice += ($outboundSchedule->price * $adults) +
                          ($outboundSchedule->price * 0.5 * $children); // 50% for children
        }
        if ($returnSchedule) {
            $totalPrice += ($returnSchedule->price * $adults) +
                          ($returnSchedule->price * 0.5 * $children);
        }

        return Inertia::render('Web/home/ticketBooking/TrainTicketBookingPreview', [
            'outboundSchedule' => $outboundSchedule ? [
                'id' => $outboundSchedule->id,
                'train_name' => $outboundSchedule->train->name,
                'train_number' => $outboundSchedule->train->train_number,
                'class' => $outboundSchedule->train->class_type,
                'departure_station' => $outboundSchedule->departureStation->name,
                'arrival_station' => $outboundSchedule->arrivalStation->name,
                'departure_time' => Carbon::parse($outboundSchedule->departure_time)->format('H:i'),
                'arrival_time' => Carbon::parse($outboundSchedule->arrival_time)->format('H:i'),
                'date' => Carbon::parse($outboundSchedule->date)->format('M j, Y'),
                'duration' => $this->formatDuration($outboundSchedule->duration_minutes),
                'price' => $outboundSchedule->price,
            ] : null,
            'returnSchedule' => $returnSchedule ? [
                'id' => $returnSchedule->id,
                'train_name' => $returnSchedule->train->name,
                'train_number' => $returnSchedule->train->train_number,
                'class' => $returnSchedule->train->class_type,
                'departure_station' => $returnSchedule->departureStation->name,
                'arrival_station' => $returnSchedule->arrivalStation->name,
                'departure_time' => Carbon::parse($returnSchedule->departure_time)->format('H:i'),
                'arrival_time' => Carbon::parse($returnSchedule->arrival_time)->format('H:i'),
                'date' => Carbon::parse($returnSchedule->date)->format('M j, Y'),
                'duration' => $this->formatDuration($returnSchedule->duration_minutes),
                'price' => $returnSchedule->price,
            ] : null,
            'passengers' => [
                'adults' => (int)$adults,
                'children' => (int)$children,
                'infants' => (int)$infants,
                'total' => (int)$adults + (int)$children + (int)$infants,
            ],
            'totalPrice' => $totalPrice,
        ]);
    }

    public function store(Request $request)
    {
        // Check if the user is logged in
        if (!auth()->check()) {
            return redirect()->route('signin.signin')->with('message', 'Please log in to make a booking.');
        }

        $request->validate([
            'train_schedule_id' => 'required|exists:train_schedules,id',
            'passenger_name' => 'required|string|max:255',
            'passenger_email' => 'required|email|max:255',
            'passenger_phone' => 'required|string|max:20',
            'adults' => 'required|integer|min:1',
            'children' => 'nullable|integer|min:0',
            'infants' => 'nullable|integer|min:0',
        ]);

        $schedule = TrainSchedule::findOrFail($request->train_schedule_id);

        $adults = $request->adults;
        $children = $request->children ?? 0;
        $infants = $request->infants ?? 0;
        $totalPassengers = $adults + $children + $infants;

        // Calculate total amount
        $totalAmount = ($schedule->price * $adults) + ($schedule->price * 0.5 * $children);

        $booking = TrainBooking::create([
            'user_id' => auth()->id(),
            'train_schedule_id' => $request->train_schedule_id,
            'passenger_name' => $request->passenger_name,
            'passenger_email' => $request->passenger_email,
            'passenger_phone' => $request->passenger_phone,
            'adults' => $adults,
            'children' => $children,
            'infants' => $infants,
            'total_passengers' => $totalPassengers,
            'total_amount' => $totalAmount,
            'status' => 'confirmed',
            'payment_status' => 'pending',
        ]);

        // Update available seats
        $schedule->update([
            'available_seats' => $schedule->available_seats - $totalPassengers
        ]);

        return redirect()->route('train.booking.success', $booking->booking_reference);
    }

    public function bookingSuccess($reference)
    {
        $booking = TrainBooking::with(['trainSchedule.train', 'trainSchedule.departureStation', 'trainSchedule.arrivalStation'])
            ->where('booking_reference', $reference)
            ->firstOrFail();

        return Inertia::render('Web/home/ticketBooking/TrainBookingSuccess', [
            'booking' => [
                'reference' => $booking->booking_reference,
                'passenger_name' => $booking->passenger_name,
                'passenger_email' => $booking->passenger_email,
                'passenger_phone' => $booking->passenger_phone,
                'total_amount' => $booking->total_amount,
                'adults' => $booking->adults,
                'children' => $booking->children,
                'infants' => $booking->infants,
                'status' => $booking->status,
                'train' => [
                    'name' => $booking->trainSchedule->train->name,
                    'number' => $booking->trainSchedule->train->train_number,
                    'class' => $booking->trainSchedule->train->class_type,
                ],
                'schedule' => [
                    'departure_station' => $booking->trainSchedule->departureStation->name,
                    'arrival_station' => $booking->trainSchedule->arrivalStation->name,
                    'departure_time' => Carbon::parse($booking->trainSchedule->departure_time)->format('H:i'),
                    'arrival_time' => Carbon::parse($booking->trainSchedule->arrival_time)->format('H:i'),
                    'date' => Carbon::parse($booking->trainSchedule->date)->format('M j, Y'),
                    'duration' => $this->formatDuration($booking->trainSchedule->duration_minutes),
                ]
            ]
        ]);
    }

    private function extractStationName($stationString)
    {
        // Extract station name from "Station Name (CODE)" format
        if (preg_match('/^(.+?)\s*\([A-Z]+\)$/', $stationString, $matches)) {
            return trim($matches[1]);
        }
        return $stationString;
    }

    private function formatDuration($minutes)
    {
        $hours = floor($minutes / 60);
        $mins = $minutes % 60;

        if ($hours > 0) {
            return sprintf('%dh %dm', $hours, $mins);
        }
        return sprintf('%dm', $mins);
    }
}
