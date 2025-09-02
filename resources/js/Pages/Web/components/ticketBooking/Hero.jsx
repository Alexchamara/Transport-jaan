import React, { useState } from "react";
import bus from "../../assets/ticketBooking/bus2.jpg";
import train from "../../assets/ticketBooking/train.jpg";

const Hero = () => {
    // Mode toggle
    const [mode, setMode] = useState("train"); // 'train' | 'bus'

    // Train state
    const [tripType, setTripType] = useState("oneway");
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [infants, setInfants] = useState(0);

    // Bus state
    const [busFrom, setBusFrom] = useState("");
    const [busTo, setBusTo] = useState("");
    const [busDate, setBusDate] = useState("");

    const handleCount = (setter, value) => {
        setter((prev) => Math.max(0, prev + value));
    };

    const stationOptions = [
        "Colombo Fort",
        "Kandy",
        "Galle",
        "Matara",
        "Anuradhapura",
    ];

    const onSubmit = (e) => {
        e.preventDefault();
        if (mode === "train") {
            // Submit train search (stub)
            // TODO: hook up to your Inertia action / route
            console.log("Train search", {
                tripType,
                adults,
                children,
                infants,
            });
        } else {
            console.log("Bus search", {
                from: busFrom,
                to: busTo,
                date: busDate,
            });
        }
    };

    return (
        <div
            className="relative flex bg-cover bg-center h-[700px]"
            style={{
                backgroundImage: `url(${mode === "train" ? train : bus})`,
            }}
        >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
            <div className="flex justify-center items-start w-full relative z-10 py-40">
                <div className="max-w-5xl mx-auto bg-[#FFFFFF] bg-opacity-90 rounded-[20px] shadow-md w-full">
                    {/* Mode Tabs */}
                    <div className="flex">
                        <button
                            type="button"
                            onClick={() => setMode("train")}
                            className={`flex-1 py-5 font-[700] rounded-tl-[20px] ${
                                mode === "train"
                                    ? "bg-[#0955AC] text-white"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                        >
                            Trains
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("bus")}
                            className={`flex-1 py-5 font-[700] rounded-tr-[20px] ${
                                mode === "bus"
                                    ? "bg-[#0955AC] text-white"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                        >
                            Buses
                        </button>
                    </div>

                    {/* Unified Header */}
                    <div className="bg-[#0955AC] text-yellow-400 font-bold text-lg py-5 text-center">
                        {mode === "train" ? "Find Your Trains" : "Find Your Buses"}
                    </div>

                    {/* Content */}
                    <form onSubmit={onSubmit} className="p-10">
                        {mode === "train" ? (
                            <>
                                {/* Trip Type Tabs */}
                                <div className="grid grid-cols-3">
                                    {[
                                        "One way",
                                        "Round Trip",
                                        "Multi-city",
                                    ].map((type, index) => {
                                        const value = type
                                            .toLowerCase()
                                            .replace(" ", "");
                                        return (
                                            <button
                                                type="button"
                                                key={index}
                                                className={`py-5 ${
                                                    tripType === value
                                                        ? "bg-[#0955AC] text-white"
                                                        : "bg-gray-100 text-gray-700"
                                                }`}
                                                onClick={() =>
                                                    setTripType(value)
                                                }
                                            >
                                                {type}
                                            </button>
                                        );
                                    })}
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

                                {/* To */}
                                <div className="mt-4">
                                    <select className="w-full border rounded-[10px] p-5">
                                        {stationOptions.map((s) => (
                                            <option key={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Counters */}
                                <div className="grid grid-cols-3 gap-4 mt-4">
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center border rounded-[10px]">
                                            <button
                                                type="button"
                                                className="px-3 py-1"
                                                onClick={() =>
                                                    handleCount(setAdults, -1)
                                                }
                                            >
                                                -
                                            </button>
                                            <span className="px-4">
                                                {adults}
                                            </span>
                                            <button
                                                type="button"
                                                className="px-3 py-1"
                                                onClick={() =>
                                                    handleCount(setAdults, 1)
                                                }
                                            >
                                                +
                                            </button>
                                        </div>
                                        <p className="text-sm mt-1">
                                            Adults (≥10 years)
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center border rounded-[10px]">
                                            <button
                                                type="button"
                                                className="px-3 py-1"
                                                onClick={() =>
                                                    handleCount(setChildren, -1)
                                                }
                                            >
                                                -
                                            </button>
                                            <span className="px-4">
                                                {children}
                                            </span>
                                            <button
                                                type="button"
                                                className="px-3 py-1"
                                                onClick={() =>
                                                    handleCount(setChildren, 1)
                                                }
                                            >
                                                +
                                            </button>
                                        </div>
                                        <p className="text-sm mt-1">
                                            Children (6-10 years)
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center border rounded-[10px]">
                                            <button
                                                type="button"
                                                className="px-3 py-1"
                                                onClick={() =>
                                                    handleCount(setInfants, -1)
                                                }
                                            >
                                                -
                                            </button>
                                            <span className="px-4">
                                                {infants}
                                            </span>
                                            <button
                                                type="button"
                                                className="px-3 py-1"
                                                onClick={() =>
                                                    handleCount(setInfants, 1)
                                                }
                                            >
                                                +
                                            </button>
                                        </div>
                                        <p className="text-sm mt-1">
                                            Infant (&lt;6 years)
                                        </p>
                                    </div>
                                </div>

                                {/* Search Button */}
                                <button
                                    type="submit"
                                    className="w-full bg-[#0955AC] text-white font-semibold py-5 rounded-[10px] hover:bg-blue-700 mt-6"
                                >
                                    Search
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Bus Form */}
                                <div className="grid md:grid-cols-4 gap-4 items-end">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 tracking-widest mb-1">
                                            FROM
                                        </label>
                                        <select
                                            value={busFrom}
                                            onChange={(e) =>
                                                setBusFrom(e.target.value)
                                            }
                                            className="w-full border rounded-[10px] p-3"
                                        >
                                            <option value="" disabled>
                                                Enter your departure station
                                            </option>
                                            {stationOptions.map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 tracking-widest mb-1">
                                            TO
                                        </label>
                                        <select
                                            value={busTo}
                                            onChange={(e) =>
                                                setBusTo(e.target.value)
                                            }
                                            className="w-full border rounded-[10px] p-3"
                                        >
                                            <option value="" disabled>
                                                Enter your arrival station
                                            </option>
                                            {stationOptions.map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 tracking-widest mb-1">
                                            JOURNEY DATE
                                        </label>
                                        <input
                                            type="date"
                                            value={busDate}
                                            onChange={(e) =>
                                                setBusDate(e.target.value)
                                            }
                                            className="w-full border rounded-[10px] p-3"
                                        />
                                    </div>

                                    <div className="md:pt-5">
                                        <button
                                            type="submit"
                                            className="w-full bg-[#0955AC] text-white font-semibold rounded-[10px] py-3  hover:bg-blue-700"
                                        >
                                            Search
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Hero;
