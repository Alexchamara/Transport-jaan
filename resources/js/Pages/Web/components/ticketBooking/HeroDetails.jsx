import React, { useState } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import TrainCard from "./TrainCard";

export default function HeroDetails({
    outboundSchedules: propOutbound,
    returnSchedules: propReturn,
    searchParams: propSearchParams,
    fromStationName: propFromStation,
    toStationName: propToStation,
    hasActiveFilters: propHasFilters,
    isShowingAllTrains: propShowAll,
    inline = false,
}) {
    // Use props if provided (inline mode), otherwise fall back to usePage (standalone page mode)
    let pageProps = {};
    try {
        if (!inline) {
            const page = usePage();
            pageProps = page.props || {};
        }
    } catch (e) {
        // usePage might fail when embedded inline outside Inertia page context
    }

    const searchParams = propSearchParams ?? pageProps.searchParams ?? {};
    const outboundSchedules = propOutbound ?? pageProps.outboundSchedules ?? [];
    const returnSchedules = propReturn ?? pageProps.returnSchedules ?? [];
    const fromStationName = propFromStation ?? pageProps.fromStationName ?? '';
    const toStationName = propToStation ?? pageProps.toStationName ?? '';
    const hasActiveFilters = propHasFilters ?? pageProps.hasActiveFilters ?? false;
    const isShowingAllTrains = propShowAll ?? pageProps.isShowingAllTrains ?? false;

    const [sortBy, setSortBy] = useState('fare');

    // Sort schedules based on selected criteria
    const sortSchedules = (schedules, criteria) => {
        return [...schedules].sort((a, b) => {
            switch (criteria) {
                case 'fare':
                    return a.price - b.price;
                case 'departure':
                    return a.depart.localeCompare(b.depart);
                case 'arrival':
                    return a.arrive.localeCompare(b.arrive);
                case 'seats':
                    return b.available_seats - a.available_seats;
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });
    };

    const sortedOutboundSchedules = sortSchedules(outboundSchedules, sortBy);

    return (
        <section className="mx-auto w-full max-w-6xl px-6 py-8">

            {/* Search Summary */}
            {hasActiveFilters && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">Search Results</h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-600">From:</span>
                                    <p className="text-[#0955AC] font-semibold">{fromStationName || searchParams.from}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600">To:</span>
                                    <p className="text-[#0955AC] font-semibold">{toStationName || searchParams.to}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600">Date:</span>
                                    <p className="text-[#0955AC] font-semibold">{searchParams.departureDate}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600">Passengers:</span>
                                    <p className="text-[#0955AC] font-semibold">
                                        {searchParams.adults} Adults, {searchParams.children} Children, {searchParams.infants} Infants
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => router.get('/trainTicketBookingDetails')}
                            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-colors border border-gray-300 font-semibold ml-4"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}

            {isShowingAllTrains && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="text-sm font-semibold text-blue-800">
                                Showing all available trains
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                                Use the search form above to filter trains by route, date, and passengers.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Search form for modification */}
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
                            { key: 'fare', label: 'Fare' },
                            { key: 'departure', label: 'Departure' },
                            { key: 'arrival', label: 'Arrival' },
                            { key: 'seats', label: 'Seats Availability' },
                            { key: 'name', label: 'Name' },
                        ].map((filter) => (
                            <button
                                key={filter.key}
                                onClick={() => setSortBy(filter.key)}
                                className={`rounded border px-5 py-2 text-lg font-semibold transition-colors ${sortBy === filter.key
                                        ? 'border-[#0955AC] bg-[#0955AC] text-white'
                                        : 'border-gray-300 text-gray-800 hover:bg-gray-50'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                    {hasActiveFilters && (
                        <div className="ml-auto flex items-center gap-4 text-lg text-gray-600">
                            <span>{fromStationName} → {toStationName}</span>
                            <span>•</span>
                            <span>{searchParams.departureDate}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Results list */}
            <div className="space-y-6">
                {sortedOutboundSchedules.length > 0 ? (
                    sortedOutboundSchedules.map((trip) => (
                        <Link
                            href={`/trainTicketBookingPreview?schedule_id=${trip.id}&adults=${searchParams.adults}&children=${searchParams.children}&infants=${searchParams.infants}`}
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
                                            <p className="text-sm text-gray-500">
                                                Train: {trip.train_number} | {trip.operator}
                                            </p>
                                        </div>

                                        <div className="hidden gap-3 sm:flex">
                                            {trip.facilities && trip.facilities.map((facility, index) => (
                                                <span
                                                    key={index}
                                                    title={facility}
                                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-base font-semibold text-gray-700"
                                                >
                                                    {facility}
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
                                                {trip.date}
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
                                                {trip.date}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-5 flex flex-wrap gap-6 text-lg text-[#0955AC]">
                                        <button className="hover:underline">
                                            View train stops & times
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
                                                Available seats: {trip.available_seats}/{trip.total_capacity}
                                            </div>
                                        </div>
                                        <button
                                            disabled={trip.soldOut}
                                            className={`w-full rounded-lg px-6 py-4 text-lg font-bold text-white sm:w-auto ${trip.soldOut
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
                    ))
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-500 text-lg">
                            No trains found for your search criteria.
                        </div>
                        <p className="text-gray-400 mt-2">
                            Please try different dates or stations.
                        </p>
                    </div>
                )}
            </div>

            {/* Return journey schedules for round trip */}
            {searchParams.tripType === 'roundtrip' && returnSchedules.length > 0 && (
                <div className="mt-12">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">
                        Return Journey - {toStationName} → {fromStationName}
                    </h3>
                    <div className="space-y-6">
                        {returnSchedules.map((trip) => (
                            <Link
                                href={`/trainTicketBookingPreview?schedule_id=${trip.id}&adults=${searchParams.adults}&children=${searchParams.children}&infants=${searchParams.infants}`}
                                key={trip.id}
                                className="block rounded-xl border border-gray-300 bg-white p-8 shadow-md transition hover:shadow-xl"
                            >
                                {/* Same structure as outbound trips */}
                                <div className="grid grid-cols-12 items-center gap-8">
                                    <div className="col-span-12 sm:col-span-5">
                                        <div className="flex items-center justify-between gap-6">
                                            <div>
                                                <div className="mb-3 flex items-center gap-3">
                                                    <span className="inline-flex items-center rounded-md bg-[#0955AC]/10 px-4 py-2 text-lg font-bold text-[#0955AC] ring-1 ring-inset ring-[#0955AC]/40">
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
                                                {trip.facilities && trip.facilities.map((facility, index) => (
                                                    <span
                                                        key={index}
                                                        title={facility}
                                                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-base font-semibold text-gray-700"
                                                    >
                                                        {facility}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-12 sm:col-span-4">
                                        <div className="flex items-center justify-center sm:justify-start">
                                            <div className="text-center sm:text-left">
                                                <div className="text-lg font-bold text-gray-900">
                                                    {trip.depart}
                                                </div>
                                                <div className="text-base text-gray-600">
                                                    {trip.date}
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
                                                    {trip.date}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-12 sm:col-span-3">
                                        <div className="flex flex-col items-end gap-4 sm:items-end">
                                            <div className="text-right">
                                                <div className="text-2xl font-extrabold text-gray-900">
                                                    LKR {trip.price.toLocaleString()}
                                                </div>
                                                <div className="text-lg text-gray-600">
                                                    Available seats: {trip.available_seats}/{trip.total_capacity}
                                                </div>
                                            </div>
                                            <button
                                                disabled={trip.soldOut}
                                                className={`w-full rounded-lg px-6 py-4 text-lg font-bold text-white sm:w-auto ${trip.soldOut
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
                </div>
            )}
        </section>
    );
}
