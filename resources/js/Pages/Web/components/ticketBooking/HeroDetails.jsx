import React from "react";
import { Link } from "@inertiajs/react";
import TrainCard from "./TrainCard";

export default function HeroDetails() {
    const trips = [
        {
            id: 1,
            name: "Baby Shan Travels",
            class: "Luxury (A/C)",
            route: "Route number: 064/64R",
            depart: "7:45 AM",
            arrive: "3:45 PM",
            days: "3 Sep",
            duration: "8h 0m",
            price: 1800,
            status: "View Seats",
            soldOut: false,
        },
        {
            id: 2,
            name: "Mathu Express - Highway",
            class: "Luxury (A/C)",
            route: "Route number: 087",
            depart: "5:40 PM",
            arrive: "10:40 PM",
            days: "3 Sep",
            duration: "5h 0m",
            price: 1635,
            status: "Sold Out",
            soldOut: true,
        },
        {
            id: 3,
            name: "North West (NON-AC)",
            class: "Semi Luxury (NL)",
            route: "Route number: 87/750/75/69",
            depart: "6:45 PM",
            arrive: "9:47 PM",
            days: "3 Sep",
            duration: "3h 2m",
            price: 1900,
            status: "View Seats",
            soldOut: false,
        },
        {
            id: 4,
            name: "Laksiri Express (Non-AC)",
            class: "Luxury (A/C)",
            route: "Route number: 87/750/75/69",
            depart: "7:15 PM",
            arrive: "4:15 AM",
            days: "3 Sep",
            duration: "9h 0m",
            price: 1900,
            status: "View Seats",
            soldOut: false,
        },
        {
            id: 5,
            name: "Laksiri Express",
            class: "Luxury (A/C)",
            route: "Route number: 87/750/75/69",
            depart: "7:15 PM",
            arrive: "4:15 AM",
            days: "3 Sep",
            duration: "9h 0m",
            price: 2500,
            status: "Sold Out",
            soldOut: true,
        },
    ];

    return (
        <section className="mx-auto w-full max-w-6xl px-6 py-8">
            <div className="mb-20">
                <TrainCard />
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
                            "Seats Availability",
                            "Name",
                        ].map((f) => (
                            <button
                                key={f}
                                className="rounded border border-gray-300 px-5 py-2 text-lg font-semibold text-gray-800 hover:bg-gray-50"
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="ml-auto flex items-center gap-4 text-lg text-gray-600">
                        <span>Colombo → Negombo</span>
                        <span>•</span>
                        <span>03/09/2025</span>
                    </div>
                </div>
            </div>

            {/* Results list */}
            <div className="space-y-6">
                {trips.map((trip) => (
                    <Link
                        href="/trainTicketBookingPreview"
                        key={trip.id}
                        className="block rounded-xl border border-gray-300 bg-white p-8 shadow-md transition hover:shadow-xl"
                    >
                        <div className="grid grid-cols-12 items-center gap-8">
                            {/* Left meta */}
                            <div className="col-span-12 sm:col-span-5">
                                <div className="flex items-center justify-between gap-6">
                                    <div>
                                        <div className="mb-3 flex items-center gap-3">
                                            <span
                                                className={`inline-flex items-center rounded-md bg-[#0955AC]/10 px-4 py-2 text-lg font-bold text-[#0955AC] ring-1 ring-inset ring-[#0955AC]/40`}
                                            >
                                                {trip.class}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-extrabold text-gray-900">
                                            {trip.name}
                                        </h3>
                                        <p className="mt-2 text-lg text-gray-600">
                                            {trip.route}
                                        </p>
                                    </div>

                                    <div className="hidden gap-3 sm:flex">
                                        {[
                                            "AC",
                                            "W",
                                            "TV",
                                            "USB",
                                            "CCTV",
                                            "WIFI",
                                        ].map((a) => (
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

                            {/* Times */}
                            <div className="col-span-12 sm:col-span-4">
                                <div className="flex items-center justify-center sm:justify-start">
                                    <div className="text-center sm:text-left">
                                        <div className="text-lg font-bold text-gray-900">
                                            {trip.depart}
                                        </div>
                                        <div className="text-base text-gray-600">
                                            {trip.days}
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
                                            {trip.days}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 flex flex-wrap gap-6 text-lg text-[#0955AC]">
                                    <button className="hover:underline">
                                        View bus stops & times
                                    </button>
                                    <button className="hover:underline text-gray-600">
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
                                            Available seats: 36/45
                                        </div>
                                    </div>
                                    <button
                                        disabled={trip.soldOut}
                                        className={`w-full rounded-lg px-6 py-4 text-lg font-bold text-white sm:w-auto ${
                                            trip.soldOut
                                                ? "bg-red-500/70 cursor-not-allowed"
                                                : "bg-[#0955AC] hover:bg-[#074489]"
                                        }`}
                                    >
                                        {trip.status}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
