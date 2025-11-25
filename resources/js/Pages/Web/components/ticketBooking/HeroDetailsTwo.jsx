import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import BusCard from "./BusCard";

const HeroDetailsTwo = ({ stations = [], schedules = [], searchParams = {} }) => {
    const [sortBy, setSortBy] = useState('');

    // Use dynamic data if available, otherwise fall back to static data
    let trips = schedules && schedules.length > 0 ? schedules : [
        {
            id: 1,
            operator: "Baby Shan Travels",
            busType: "Luxury (A/C) — 45 Seater",
            routeNo: "064/64R",
            busNo: "NB-1234",
            depart: "7:45 AM",
            arrive: "3:45 PM",
            day: "3 Sep",
            duration: "8h 0m",
            price: 1800,
            seatsAvailable: 36,
            totalSeats: 45,
            expressway: false,
            soldOut: false,
        },
        {
            id: 2,
            operator: "Mathu Express — Highway",
            busType: "Luxury (A/C) — 49 Seater",
            routeNo: "087 (E01)",
            busNo: "NC-4567",
            depart: "5:40 PM",
            arrive: "10:40 PM",
            day: "3 Sep",
            duration: "5h 0m",
            price: 1635,
            seatsAvailable: 0,
            totalSeats: 49,
            expressway: true,
            soldOut: true,
        },
        {
            id: 3,
            operator: "North West (NON-AC)",
            busType: "Semi Luxury (NL) — 40 Seater",
            routeNo: "87/750/75/69",
            busNo: "NA-9912",
            depart: "6:45 PM",
            arrive: "9:47 PM",
            day: "3 Sep",
            duration: "3h 2m",
            price: 1900,
            seatsAvailable: 12,
            totalSeats: 40,
            expressway: false,
            soldOut: false,
        },
        {
            id: 4,
            operator: "Laksiri Express (Non-AC)",
            busType: "Luxury (A/C) — 45 Seater",
            routeNo: "87/750/75/69",
            busNo: "NC-2211",
            depart: "7:15 PM",
            arrive: "4:15 AM",
            day: "3 Sep",
            duration: "9h 0m",
            price: 1900,
            seatsAvailable: 22,
            totalSeats: 45,
            expressway: false,
            soldOut: false,
        },
        {
            id: 5,
            operator: "Laksiri Express",
            busType: "Luxury (A/C) — 45 Seater",
            routeNo: "87/750/75/69",
            busNo: "NC-7711",
            depart: "7:15 PM",
            arrive: "4:15 AM",
            day: "3 Sep",
            duration: "9h 0m",
            price: 2500,
            seatsAvailable: 0,
            totalSeats: 45,
            expressway: true,
            soldOut: true,
        },
    ];

    const amenities = ["A/C", "WiFi", "USB", "TV", "Recline", "Toilet"];

    // Apply sorting if selected
    if (sortBy === 'Fare') {
        trips = [...trips].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Departure') {
        trips = [...trips].sort((a, b) => {
            const timeA = new Date('1970/01/01 ' + a.depart).getTime();
            const timeB = new Date('1970/01/01 ' + b.depart).getTime();
            return timeA - timeB;
        });
    } else if (sortBy === 'Seats') {
        trips = [...trips].sort((a, b) => b.seatsAvailable - a.seatsAvailable);
    } else if (sortBy === 'Operator') {
        trips = [...trips].sort((a, b) => a.operator.localeCompare(b.operator));
    }

    const handleSort = (sortType) => {
        setSortBy(sortBy === sortType ? '' : sortType);
    };

    return (
        <section className="mx-auto w-full max-w-6xl px-6 py-8">
            {/* Back */}
            <div className="mb-4">
                <Link
                    href="/ticketBooking?type=bus"
                    className="inline-flex items-center gap-2 text-[#0955AC] text-base font-semibold"
                >
                    <span className="inline-block rounded-full border border-[#0955AC]/20 p-1 leading-none">
                        ←
                    </span>
                    Back
                </Link>
            </div>
            <div className="mb-20">
                <BusCard />
            </div>

            {/* Toolbar */}
            <div className="sticky top-0 z-10 -mx-6 mb-4 border-b bg-white/80 px-6 py-5 backdrop-blur">
                <div className="flex flex-wrap items-center gap-4">
                    <span className="text-lg font-bold text-gray-800">
                        Sort by:
                    </span>
                    <div className="flex flex-wrap gap-4">
                        {[
                            "Fare",
                            "Departure",
                            "Arrival",
                            "Seats",
                            "Operator",
                        ].map((f) => (
                            <button
                                key={f}
                                onClick={() => handleSort(f)}
                                className={`rounded border px-5 py-2 text-lg font-semibold transition hover:bg-gray-50 ${
                                    sortBy === f
                                        ? 'border-[#0955AC] text-[#0955AC] bg-[#0955AC]/10'
                                        : 'border-gray-300 text-gray-800'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="ml-auto flex items-center gap-4 text-lg text-gray-600">
                        <span>
                            {searchParams.from && searchParams.to
                                ? `${searchParams.from} → ${searchParams.to}`
                                : "Colombo → Negombo"}
                        </span>
                        <span>•</span>
                        <span>
                            {searchParams.date
                                ? new Date(searchParams.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                : "03/09/2025"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Results list */}
            <div className="space-y-6">
                {trips && trips.length > 0 ? trips.map((trip) => (
                    <Link
                        href="/busTicketBookingPreview"
                        key={trip.id}
                        className="block rounded-xl border border-gray-300 bg-white p-8 shadow-md transition hover:shadow-xl"
                    >
                        <div className="grid grid-cols-12 items-center gap-8">
                            {/* Left meta */}
                            <div className="col-span-12 sm:col-span-5">
                                <div className="flex items-center justify-between gap-6">
                                    <div>
                                        <div className="mb-3 flex flex-wrap items-center gap-3">
                                            {/* Bus type badge */}
                                            <span className="inline-flex items-center rounded-md bg-[#0955AC]/10 px-4 py-2 text-lg font-bold text-[#0955AC] ring-1 ring-inset ring-[#0955AC]/40">
                                                {trip.busType}
                                            </span>
                                            {/* Expressway tag */}
                                            {trip.expressway && (
                                                <span className="inline-flex items-center rounded-md bg-[#0955AC]/10 px-3 py-1.5 text-base font-semibold text-[#0955AC] ring-1 ring-inset ring-[#0955AC]/30">
                                                    Expressway
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-xl font-extrabold text-gray-900">
                                            {trip.operator}
                                        </h3>

                                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-lg text-gray-700">
                                            <span>
                                                <span className="font-semibold text-gray-900">
                                                    Route:
                                                </span>{" "}
                                                {trip.routeNo}
                                            </span>
                                            <span className="hidden sm:inline">
                                                •
                                            </span>
                                            <span>
                                                <span className="font-semibold text-gray-900">
                                                    Bus No:
                                                </span>{" "}
                                                {trip.busNo}
                                            </span>
                                        </div>

                                        {/* Amenities */}
                                        <div className="mt-3 hidden gap-3 sm:flex">
                                            {amenities.map((a) => (
                                                <span
                                                    key={a}
                                                    title={a}
                                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-base font-semibold text-gray-700"
                                                >
                                                    {a[0]}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Times */}
                            <div className="col-span-12 sm:col-span-4">
                                <div className="flex items-center justify-center sm:justify-start">
                                    <div className="text-center sm:text-left">
                                        <div className="text-lg font-bold text-gray-900">
                                            {trip.depart}
                                        </div>
                                        <div className="text-base text-gray-600">
                                            {trip.day}
                                        </div>
                                    </div>

                                    <span className="mx-4 inline-block h-3 w-3 rounded-full bg-gray-400 align-middle" />

                                    <div className="text-center">
                                        <div className="text-base text-gray-600">
                                            Duration
                                        </div>
                                        <div className="text-lg font-bold text-gray-800">
                                            {trip.duration}
                                        </div>
                                    </div>

                                    <span className="mx-4 inline-block h-3 w-3 rounded-full bg-gray-400 align-middle" />

                                    <div className="text-center sm:text-right">
                                        <div className="text-lg font-bold text-gray-900">
                                            {trip.arrive}
                                        </div>
                                        <div className="text-base text-gray-600">
                                            {trip.day}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-wrap gap-6 text-lg">
                                    <button className="text-[#0955AC] hover:underline">
                                        View boarding &amp; drop-off points
                                    </button>
                                    <button className="text-gray-600 hover:underline">
                                        View cancellation policy
                                    </button>
                                </div>
                            </div>

                            {/* Price / action */}
                            <div className="col-span-12 sm:col-span-3">
                                <div className="flex flex-col items-end gap-4 sm:items-end">
                                    <div className="text-right">
                                        <div className="text-2xl font-extrabold text-gray-900">
                                            LKR {trip.price.toLocaleString()}
                                        </div>
                                        <div className="text-lg text-gray-600">
                                            Seats available:{" "}
                                            {trip.seatsAvailable}/
                                            {trip.totalSeats}
                                        </div>
                                    </div>

                                    <Link
                                        href={trip.soldOut ? "#" : `/busTicketBookingPreview?id=${trip.id}&from=${searchParams.from || 'Colombo'}&to=${searchParams.to || 'Negombo'}&date=${searchParams.date || '2025-09-24'}`}
                                        className={`block w-full text-center rounded-lg px-6 py-4 text-lg font-bold text-white sm:w-auto ${
                                            trip.soldOut
                                                ? "bg-red-500/70 cursor-not-allowed pointer-events-none"
                                                : "bg-[#0955AC] hover:bg-[#074489]"
                                        }`}
                                        disabled={trip.soldOut}
                                    >
                                        {trip.soldOut
                                            ? "Sold Out"
                                            : "View Seats"}
                                    </Link>

                                    {/* Secondary actions */}
                                    {!trip.soldOut && (
                                        <div className="flex w-full flex-wrap justify-end gap-3 sm:w-auto">
                                            <button className="rounded-lg border border-[#0955AC]/30 px-4 py-2 text-base font-semibold text-[#0955AC] hover:bg-[#0955AC]/5">
                                                Hold for 10 min
                                            </button>
                                            <button className="rounded-lg border border-gray-300 px-4 py-2 text-base font-semibold text-gray-700 hover:bg-gray-50">
                                                View seat map
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer info row */}
                        <div className="mt-6 grid grid-cols-1 gap-3 text-base text-gray-600 sm:grid-cols-3">
                            <div>
                                <span className="font-semibold text-gray-900">
                                    Boarding:
                                </span>{" "}
                                Pettah Bus Stand, Kelaniya
                            </div>
                            <div>
                                <span className="font-semibold text-gray-900">
                                    Drop-off:
                                </span>{" "}
                                Negombo Main Bus Stand
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">
                                    Tracking:
                                </span>
                                <span className="rounded-md bg-[#0955AC]/10 px-2.5 py-1 text-sm font-semibold text-[#0955AC] ring-1 ring-inset ring-[#0955AC]/30">
                                    Live GPS
                                </span>
                            </div>
                        </div>
                    </Link>
                )) : (
                    <div className="text-center py-12">
                        <div className="text-gray-500 text-lg">
                            No bus schedules found for the selected route and date.
                        </div>
                        <p className="text-gray-400 mt-2">
                            Please try different stations or dates.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default HeroDetailsTwo;
