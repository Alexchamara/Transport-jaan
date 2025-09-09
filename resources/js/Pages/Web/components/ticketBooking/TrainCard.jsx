import React, { useState } from "react";
import { Link } from "@inertiajs/react";

const TrainCard = () => {
    const [tripType, setTripType] = useState("oneway");

    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);

    const stationOptions = [
        "Colombo Fort",
        "Kandy",
        "Galle",
        "Matara",
        "Anuradhapura",
    ];

    const handleCount = (setter, delta) => {
        setter((prev) => Math.max(0, prev + delta));
    };

    const onSubmitTrain = (e) => {
        e.preventDefault();
        console.log("Train search", {
            tripType,
            adults,
            children,
            infants,
        });
    };

    return (
        <div className="bg-white/95 rounded-[20px] shadow-xl ring-1 ring-[#0955AC]/15 overflow-hidden">
            <div className="bg-[#0955AC] text-yellow-400 font-bold text-lg py-5 text-center">
                Find Your Trains
            </div>

            <form onSubmit={onSubmitTrain} className="p-10">
                {/* Trip Type buttons */}
                <div className="grid grid-cols-2 rounded-[12px] overflow-hidden border border-[#0955AC]/20">
                    {["One way", "Round Trip"].map(
                        (type, index) => {
                            const value = type.toLowerCase().replace(" ", "");
                            const isActive = tripType === value;
                            return (
                                <button
                                    type="button"
                                    key={index}
                                    className={`${isActive
                                        ? "bg-[#0955AC] text-white"
                                        : "bg-gray-100 text-gray-700"
                                    } py-5 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0955AC]/60`}
                                    onClick={() => setTripType(value)}
                                >
                                    {type}
                                </button>
                            );
                        }
                    )}
                </div>

                {/* From & Date */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <select className="w-full border rounded-[10px] p-5">
                        {stationOptions.map((s) => (
                            <option key={s}>{s}</option>
                        ))}
                    </select>
                    <input
                        type="date"
                        className="w-full border rounded-[10px] p-5"
                    />
                </div>

                {/* To (+ Return Date when Round Trip) */}
                {tripType === "roundtrip" ? (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <select className="w-full border rounded-[10px] p-5">
                            {stationOptions.map((s) => (
                                <option key={s}>{s}</option>
                            ))}
                        </select>
                        <input
                            type="date"
                            className="w-full border rounded-[10px] p-5"
                        />
                    </div>
                ) : (
                    <div className="mt-4">
                        <select className="w-full border rounded-[10px] p-5">
                            {stationOptions.map((s) => (
                                <option key={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Counters */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center border rounded-[10px]">
                            <button
                                type="button"
                                className="px-3 py-1"
                                onClick={() => handleCount(setAdults, -1)}
                            >
                                -
                            </button>
                            <span className="px-4">{adults}</span>
                            <button
                                type="button"
                                className="px-3 py-1"
                                onClick={() => handleCount(setAdults, 1)}
                            >
                                +
                            </button>
                        </div>
                        <p className="text-sm mt-1">Adults (≥10 years)</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="flex items-center border rounded-[10px]">
                            <button
                                type="button"
                                className="px-3 py-1"
                                onClick={() => handleCount(setChildren, -1)}
                            >
                                -
                            </button>
                            <span className="px-4">{children}</span>
                            <button
                                type="button"
                                className="px-3 py-1"
                                onClick={() => handleCount(setChildren, 1)}
                            >
                                +
                            </button>
                        </div>
                        <p className="text-sm mt-1">Children (6-10 years)</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="flex items-center border rounded-[10px]">
                            <button
                                type="button"
                                className="px-3 py-1"
                                onClick={() => handleCount(setInfants, -1)}
                            >
                                -
                            </button>
                            <span className="px-4">{infants}</span>
                            <button
                                type="button"
                                className="px-3 py-1"
                                onClick={() => handleCount(setInfants, 1)}
                            >
                                +
                            </button>
                        </div>
                        <p className="text-sm mt-1">Infant (&lt;6 years)</p>
                    </div>
                </div>

                {/* Search Button */}
                <Link href="/trainTicketBookingDetails">
                    <button
                        type="submit"
                        className="w-full bg-[#0955AC] text-white font-semibold py-5 rounded-[10px] hover:bg-[#074489] mt-6"
                    >
                        Search
                    </button>
                </Link>
            </form>
        </div>
    );
};

export default TrainCard;
