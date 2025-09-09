import React, { useMemo, useState } from "react";
import { Link } from "@inertiajs/react";
import Header from "../../layouts/Header";

const COL_LEFT = 2; // two seats left of aisle
const COL_RIGHT = 2; // two seats right of aisle
const ROWS = 13; // 13 rows as in screenshot
const PRICE_PER_SEAT_LKR = 1200;

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

// seat statuses (to demonstrate legend)
const STATUS = {
    LADIES: "ladies",
    NOT_PROVIDED: "not-provided",
    IN_PROGRESS: "in-progress",
    AVAILABLE: "available",
    BOOKED: "booked",
};

function buildSeatMap() {
    // Build a 13x(2+aisle+2) map with seat numbers and mock statuses
    let num = 1;
    const map = [];
    for (let r = 0; r < ROWS; r++) {
        const row = [];
        // left 2
        for (let c = 0; c < COL_LEFT; c++) {
            row.push({ id: num++, status: STATUS.AVAILABLE });
        }
        // aisle
        row.push(null);
        // right 2
        for (let c = 0; c < COL_RIGHT; c++) {
            row.push({ id: num++, status: STATUS.AVAILABLE });
        }
        map.push(row);
    }

    // Apply a few sample statuses to resemble the screenshot
    const mark = (ids, status) =>
        ids.forEach((id) => {
            for (const row of map) {
                for (const seat of row) {
                    if (seat && seat.id === id) seat.status = status;
                }
            }
        });

    mark([5, 48, 49], STATUS.AVAILABLE); // highlighted examples
    mark([21, 26, 33, 34, 37, 38, 41, 42], STATUS.BOOKED);
    mark([13, 14, 15, 16], STATUS.NOT_PROVIDED);
    mark([24, 28, 45, 46], STATUS.IN_PROGRESS);
    mark([1, 2], STATUS.LADIES);

    return map;
}

const legend = [
    { label: "Available for Ladies Only", color: "bg-[#94B3FF]" },
    { label: "Not Provided", color: "bg-[#F5F5DC]" },
    { label: "Booking In Progress", color: "bg-black" },
    { label: "Available", color: "bg-[#62B36F]" },
    { label: "Already Booked", color: "bg-[#C7C7C7]" },
];

const BusTicketBookingPreview = () => {
    const seatMap = useMemo(buildSeatMap, []);
    const [selected, setSelected] = useState([]);
    const [passengerName, setPassengerName] = useState("");
    const [mobile, setMobile] = useState("");
    const [email, setEmail] = useState("");
    const [boarding, setBoarding] = useState("");
    const [destination, setDestination] = useState("");
    const [reuseCredits, setReuseCredits] = useState(false);

    const toggleSeat = (seatId, status) => {
        if (
            status === STATUS.BOOKED ||
            status === STATUS.NOT_PROVIDED ||
            status === STATUS.IN_PROGRESS
        )
            return;
        setSelected((prev) =>
            prev.includes(seatId)
                ? prev.filter((id) => id !== seatId)
                : [...prev, seatId]
        );
    };

    const total = selected.length * PRICE_PER_SEAT_LKR;

    const canContinue =
        selected.length > 0 &&
        passengerName.trim().length > 2 &&
        mobile.trim().length >= 9 &&
        boarding &&
        destination;

    const onSubmit = (e) => {
        e.preventDefault();
        const payload = {
            seats: selected,
            total,
            passengerName,
            mobile,
            email,
            boarding,
            destination,
            reuseCredits,
        };
        console.log("Submit booking payload:", payload);
        // Wire this to your route/action when ready.
    };

    return (
        <div>
          <Header />
            <section className="mx-auto w-full max-w-[1300px] px-4 md:px-6 lg:px-8 py-20">
                {/* Back */}
                <div className="mb-4">
                    <Link
                        href="/busTicketBookingDetails"
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
                                        {Array.from({ length: ROWS }).map(
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
        "h-12 w-12 rounded-md text-sm font-semibold flex items-center justify-center";
    let cls = "bg-gray-200 text-gray-700";
    if (seat.status === STATUS.AVAILABLE)
        cls = "bg-gray-200 text-gray-800 hover:bg-[#62B36F]/70";
    if (seat.status === STATUS.BOOKED)
        cls = "bg-[#C7C7C7] text-gray-600 cursor-not-allowed";
    if (seat.status === STATUS.IN_PROGRESS)
        cls = "bg-black text-white cursor-not-allowed";
    if (seat.status === STATUS.NOT_PROVIDED)
        cls = "bg-[#F5F5DC] text-gray-800 cursor-not-allowed";
    if (seat.status === STATUS.LADIES) cls = "bg-[#94B3FF] text-gray-800";
    if (selected) cls = "bg-[#62B36F] text-white ring-2 ring-[#2f8240]";

    return (
        <button type="button" className={`${base} ${cls}`} onClick={onClick}>
            {seat.id}
        </button>
    );
};

export default BusTicketBookingPreview;
