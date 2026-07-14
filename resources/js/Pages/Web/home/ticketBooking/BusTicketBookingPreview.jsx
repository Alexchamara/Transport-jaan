import React, { useMemo, useState } from "react";
import { Link } from "@inertiajs/react";
import Header from "../../layouts/Header";

const COL_LEFT = 2; // two seats left of aisle
const COL_RIGHT = 2; // two seats right of aisle

const BoardingOptions = [
    "Pettah Bus Stand",
    "Kelaniya",
    "Kiribathgoda",
    "Ja-Ela",
];

const DestinationOptions = [
    "Negombo Main",
    "Kochchikade",
    "Katunayake",
    "Dankotuwa",
];

// seat statuses
const STATUS = {
    AVAILABLE: "available",
    BOOKED: "booked",
};

function buildSeatMap(seatLayout, bookedSeats) {
    // Build seat map from real data
    if (!seatLayout) {
        // Fallback to default layout
        seatLayout = {
            rows: 13,
            columns: 4,
            totalSeats: 52,
            aisle: 2
        };
    }

    let num = 1;
    const map = [];
    const bookedSeatNumbers = bookedSeats || [];
    
    for (let r = 0; r < seatLayout.rows; r++) {
        const row = [];
        
        // left 2 seats
        for (let c = 0; c < COL_LEFT; c++) {
            if (num <= seatLayout.totalSeats) {
                row.push({ 
                    id: num, 
                    status: bookedSeatNumbers.includes(num) || bookedSeatNumbers.includes(num.toString()) 
                        ? STATUS.BOOKED 
                        : STATUS.AVAILABLE 
                });
                num++;
            }
        }
        
        // aisle
        row.push(null);
        
        // right 2 seats
        for (let c = 0; c < COL_RIGHT; c++) {
            if (num <= seatLayout.totalSeats) {
                row.push({ 
                    id: num, 
                    status: bookedSeatNumbers.includes(num) || bookedSeatNumbers.includes(num.toString())
                        ? STATUS.BOOKED 
                        : STATUS.AVAILABLE 
                });
                num++;
            }
        }
        
        map.push(row);
    }

    return map;
}

const legend = [
    { label: "Available", color: "bg-[#62B36F]" },
    { label: "Already Booked", color: "bg-[#C7C7C7]" },
    { label: "Selected", color: "bg-[#0955AC]" },
];

const BusTicketBookingPreview = ({ trip, searchParams, bookedSeats, seatLayout }) => {
    const seatMap = useMemo(() => buildSeatMap(seatLayout, bookedSeats), [seatLayout, bookedSeats]);
    const [selected, setSelected] = useState([]);
    const [passengerName, setPassengerName] = useState("");
    const [mobile, setMobile] = useState("");
    const [email, setEmail] = useState("");
    const [boarding, setBoarding] = useState("");
    const [destination, setDestination] = useState("");
    const [reuseCredits, setReuseCredits] = useState(false);

    const toggleSeat = (seatId, status) => {
        // Only allow selection of available seats
        if (status === STATUS.BOOKED) {
            return;
        }
        setSelected((prev) =>
            prev.includes(seatId)
                ? prev.filter((id) => id !== seatId)
                : [...prev, seatId]
        );
    };

    const pricePerSeat = trip?.price || 0;
    const total = selected.length * pricePerSeat;

    const canContinue =
        selected.length > 0 &&
        passengerName.trim().length > 2 &&
        mobile.trim().length >= 9 &&
        boarding &&
        destination;

    const onSubmit = (e) => {
        e.preventDefault();

        // Get CSRF token from the page's meta tag
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        // Create booking data object
        const bookingData = {
            schedule_id: trip?.id,
            seat_numbers: selected,
            passenger_count: selected.length,
            passenger_name: passengerName,
            passenger_phone: mobile,
            passenger_email: email,
            boarding_point: boarding,
            destination_point: destination,
            total_price: total
        };

        // Add a loading indicator or disable the button here if needed

        // Use fetch for AJAX request with proper headers
        fetch('/bus-bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            },
            body: JSON.stringify(bookingData)
        })
        .then(response => {
            console.log('Response status:', response.status);
            if (response.redirected) {
                console.log('Redirected to:', response.url);
                window.location.href = response.url;
                return null;
            }

            // Try to parse as JSON, but handle errors gracefully
            return response.json().catch(e => {
                console.error('JSON parsing error:', e);
                return null;
            });
        })
        .then(data => {
            console.log('Response data:', data);
            if (data === null) {
                console.log('No data returned or already handled redirect');
                return;
            }

            if (data && data.redirect) {
                console.log('Redirecting to:', data.redirect);
                window.location.href = data.redirect;
            } else if (data && data.reference) {
                console.log('Redirecting to success page with reference:', data.reference);
                window.location.href = `/bus-booking-success/${data.reference}`;
            } else if (data && data.success) {
                console.log('Booking successful but no redirect or reference provided');
                alert('Booking successful!');
                window.location.href = '/flight-booking'; // Redirect to home page
            } else if (data && data.errors) {
                console.error('Validation errors:', data.errors);
                const errorMessage = Object.values(data.errors).flat().join("\n");
                alert(`Error: ${errorMessage}`);
            } else {
                console.warn('Unknown response format:', data);
                alert('Booking completed but encountered an unexpected response. Please check your bookings.');
                window.location.href = '/flight-booking';
            }
        })
        .catch(error => {
            console.error('Booking error:', error);
            alert('There was an error processing your booking. Please try again.');
        });

        // OLD FORM APPROACH (keeping as backup)
        /*
        // Create a form to submit the data
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/bus-bookings';
        form.style.display = 'none';
        */

        // Old form submission code removed
    };

    return (
        <div>
          <Header />
            <section className="mx-auto w-full max-w-[1300px] px-4 md:px-6 lg:px-8 py-20">
                {/* Back */}
                <div className="mb-4">
                    <Link
                        href={searchParams ? `/busTicketBookingDetails?from=${searchParams.from}&to=${searchParams.to}&date=${searchParams.date}&passengers=${searchParams.passengers}` : "/busTicketBookingDetails"}
                        className="inline-flex items-center gap-2 text-[#0955AC] text-base font-semibold"
                    >
                        <span className="inline-block rounded-full border border-[#0955AC]/20 p-1 leading-none">
                            ←
                        </span>
                        Back
                    </Link>
                </div>

                <h1 className="text-3xl md:text-4xl font-extrabold text-[#0955AC]">
                    Select seats &amp; fill form
                </h1>

                {/* Trip Information */}
                {trip && (
                    <div className="mt-6 bg-white p-4 border rounded-lg shadow-sm">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">From:</span>
                                <p className="font-medium">{trip.departureStation}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">To:</span>
                                <p className="font-medium">{trip.arrivalStation}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Date:</span>
                                <p className="font-medium">{trip.day}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Time:</span>
                                <p className="font-medium">{trip.depart} - {trip.arrive}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Operator:</span>
                                <p className="font-medium">{trip.operator}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Bus Type:</span>
                                <p className="font-medium">{trip.busType}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Duration:</span>
                                <p className="font-medium">{trip.duration}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Price per seat:</span>
                                <p className="font-medium text-[#0955AC]">LKR {trip.price}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Seat layout */}
                    <div className="lg:col-span-1">
                        <div className="flex justify-center">
                            <div className="inline-block items-center">
                                {/* Front label */}
                                <div className="mx-auto mb-3 w-[120px] rounded-md bg-gray-100 py-2 text-center text-gray-700 font-semibold">
                                    Front
                                </div>

                                {/* Grid with row numbers on left */}
                                <div className="flex">
                                    <div className="mr-4 flex flex-col items-end pr-2">
                                        {Array.from({ length: seatMap.length }).map(
                                            (_, i) => (
                                                <div
                                                    key={i}
                                                    className="h-12 leading-[48px] text-gray-600 font-medium"
                                                >
                                                    {i + 1}
                                                </div>
                                            )
                                        )}
                                    </div>

                                    <div className="grid gap-3">
                                        {seatMap.map((row, rIdx) => (
                                            <div
                                                key={rIdx}
                                                className="flex items-center gap-3"
                                            >
                                                {/* left 2 */}
                                                {row
                                                    .slice(0, COL_LEFT)
                                                    .filter(s => s !== null)
                                                    .map((s) => (
                                                        <SeatButton
                                                            key={s.id}
                                                            seat={s}
                                                            selected={selected.includes(
                                                                s.id
                                                            )}
                                                            onClick={() =>
                                                                toggleSeat(
                                                                    s.id,
                                                                    s.status
                                                                )
                                                            }
                                                        />
                                                    ))}
                                                {/* aisle spacer */}
                                                <div className="w-8" />
                                                {/* right 2 */}
                                                {row
                                                    .slice(COL_LEFT + 1)
                                                    .filter(s => s !== null)
                                                    .map((s) => (
                                                        <SeatButton
                                                            key={s.id}
                                                            seat={s}
                                                            selected={selected.includes(
                                                                s.id
                                                            )}
                                                            onClick={() =>
                                                                toggleSeat(
                                                                    s.id,
                                                                    s.status
                                                                )
                                                            }
                                                        />
                                                    ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Bottom row number for 13 */}
                                {/* <div className="mt-3 text-gray-600 font-medium text-right pr-2">
                                    13
                                </div> */}
                            </div>
                        </div>
                    </div>

                    {/* Right side: form & legend */}
                    <div className="lg:col-span-2">
                        <div className="rounded-[10px] border border-gray-200 bg-gray-50">
                            <div className="px-5 py-6 border-b border-gray-200 rounded-t-[10px] bg-[#0955AC]">
                                <h2 className="text-xl font-[700] text-[#FFFFFF]">
                                    Seat Details
                                </h2>
                            </div>

                            <form
                                onSubmit={onSubmit}
                                className="px-5 py-4 space-y-4"
                            >
                                {/* Seats */}
                                <div className="flex items-center justify-between">
                                    <span className="text-[#0955AC] font-[700]">
                                        Seats
                                    </span>
                                    {selected.length === 0 ? (
                                        <span className="text-red-500 text-sm">
                                            Please select your seats
                                        </span>
                                    ) : (
                                        <span className="text-gray-800 font-[700]">
                                            {selected
                                                .sort((a, b) => a - b)
                                                .join(", ")}
                                        </span>
                                    )}
                                </div>

                                {/* Total */}
                                <div className="flex items-center justify-between">
                                    <span className="text-[#0955AC] font-[700]">
                                        Total
                                    </span>
                                    <span className="text-[#0955AC]">
                                        {total.toLocaleString()} LKR
                                    </span>
                                </div>

                                {/* Passenger Name */}
                                <div className="text-[#0955AC]">
                                    <label className="mb-1 block text-sm font-[600] text-[#0955AC]">
                                        Passenger Name
                                    </label>
                                    <input
                                        type="text"
                                        value={passengerName}
                                        onChange={(e) =>
                                            setPassengerName(e.target.value)
                                        }
                                        placeholder="Enter passenger name"
                                        className="w-full rounded-[10px] border px-3 py-4 placeholder:text-[#0955AC] border-[#0955AC] focus:ring-[#0955AC]"
                                    />
                                </div>

                                {/* Mobile */}
                                <div className="text-[#0955AC]">
                                    <label className="mb-1 block text-sm font-[600] text-[#0955AC]">
                                        Mobile Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={mobile}
                                        onChange={(e) =>
                                            setMobile(e.target.value)
                                        }
                                        placeholder="071 234 5678"
                                        className="w-full rounded-[10px] border px-3 py-4 placeholder:text-[#0955AC] border-[#0955AC] focus:ring-[#0955AC]"
                                    />
                                </div>

                                {/* Email */}
                                <div className="text-[#0955AC]" >
                                    <label className="mb-1 block text-sm font-[600] text-[#0955AC]">
                                        Email (Optional)
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder="user@domain.com"
                                        className="w-full rounded-[10px] border px-3 py-4 placeholder:text-[#0955AC] border-[#0955AC] focus:ring-[#0955AC]"
                                    />
                                </div>

                                {/* Boarding */}
                                <div className="text-[#0955AC]">
                                    <label className="mb-1 block text-sm font-[600] text-[#0955AC]">
                                        Boarding Place
                                    </label>
                                    <select
                                        value={boarding}
                                        onChange={(e) =>
                                            setBoarding(e.target.value)
                                        }
                                        className="w-full rounded-[10px] border  px-3 py-4 placeholder:text-[#0955AC] border-[#0955AC] focus:ring-[#0955AC]"
                                    >
                                        <option value="">
                                            Select your boarding point
                                        </option>
                                        {BoardingOptions.map((opt) => (
                                            <option key={opt} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Destination */}
                                <div className="text-[#0955AC]">
                                    <label className="mb-1 block text-sm font-[600] text-[#0955AC]">
                                        Destination Place
                                    </label>
                                    <select
                                        value={destination}
                                        onChange={(e) =>
                                            setDestination(e.target.value)
                                        }
                                        className="w-full rounded-[10px] border px-3 py-4 border-[#0955AC] focus:ring-[#0955AC]"
                                    >
                                        <option value="">
                                            Select your destination point
                                        </option>
                                        {DestinationOptions.map((opt) => (
                                            <option key={opt} value={opt}>
                                                {opt}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Reuse credits */}
                                <label className="flex items-center gap-2 font-[700] mt-5">
                                    <input
                                        type="checkbox"
                                        checked={reuseCredits}
                                        onChange={(e) =>
                                            setReuseCredits(e.target.checked)
                                        }
                                        className="h-4 w-4 text-[#0955AC] focus:ring-[#0955AC] border-[#0955AC] rounded-[2px]"
                                    />
                                    <span className="text-sm text-[#0955AC]">
                                        Reuse Credits
                                    </span>
                                </label>

                                <button
                                    type="submit"
                                    disabled={!canContinue}
                                    className={`mt-2 w-full rounded-[10px] px-6 py-5 text-white font-[700] ${
                                        canContinue
                                            ? "bg-[#0955AC] hover:bg-[#074489]"
                                            : "bg-[#0955AC]/40 cursor-not-allowed"
                                    }`}
                                >
                                    Continue to pay
                                </button>
                            </form>
                        </div>

                        {/* Legend */}
                        <div className="mt-6 rounded-[10px] border border-gray-200 p-4">
                            <ul className="space-y-3">
                                {legend.map((l) => (
                                    <li
                                        key={l.label}
                                        className="flex items-center gap-3"
                                    >
                                        <span
                                            className={`inline-block h-6 w-6 rounded ${l.color}`}
                                        />
                                        <span className="text-gray-700">
                                            {l.label}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const SeatButton = ({ seat, selected, onClick }) => {
    const base =
        "h-12 w-12 rounded-md text-sm font-semibold flex items-center justify-center transition-all";
    
    // Determine seat color and cursor based on status
    let cls = "";
    let isDisabled = false;
    
    if (seat.status === STATUS.BOOKED) {
        cls = "bg-[#C7C7C7] text-gray-600 cursor-not-allowed";
        isDisabled = true;
    } else if (seat.status === STATUS.AVAILABLE) {
        cls = "bg-[#62B36F] text-white hover:bg-[#62B36F]/80 cursor-pointer";
    }
    
    // Override with selected state if seat is selected (and selectable)
    if (selected && !isDisabled) {
        cls = "bg-[#0955AC] text-white ring-2 ring-[#0955AC]/50 cursor-pointer";
    }

    return (
        <button 
            type="button" 
            className={`${base} ${cls}`} 
            onClick={isDisabled ? undefined : onClick}
            disabled={isDisabled}
            title={isDisabled ? "This seat is already booked" : "Click to select this seat"}
        >
            {seat.id}
        </button>
    );
};

export default BusTicketBookingPreview;
