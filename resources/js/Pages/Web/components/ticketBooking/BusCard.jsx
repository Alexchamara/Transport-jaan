import React, { useState } from "react";
import { Link } from "@inertiajs/react";


const BusCard = () => {
    const [busFrom, setBusFrom] = useState("");
    const [busTo, setBusTo] = useState("");
    const [busDate, setBusDate] = useState("");

    const stationOptions = [
        "Colombo Fort",
        "Kandy",
        "Galle",
        "Matara",
        "Anuradhapura",
    ];
    const onSubmitBus = (e) => {
        e.preventDefault();
        console.log("Bus search", {
            from: busFrom,
            to: busTo,
            date: busDate,
        });
    };

    return (
        <div className="bg-[#FFFFFF] bg-opacity-90 rounded-[20px] shadow-md overflow-hidden">
            <div className="bg-[#0955AC] text-yellow-400 font-bold text-lg py-5 text-center">
                Find Your Buses
            </div>

            <form onSubmit={onSubmitBus} className="p-10">
                <div className="grid md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 tracking-widest mb-1">
                            FROM
                        </label>
                        <select
                            value={busFrom}
                            onChange={(e) => setBusFrom(e.target.value)}
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
                            onChange={(e) => setBusTo(e.target.value)}
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
                            onChange={(e) => setBusDate(e.target.value)}
                            className="w-full border rounded-[10px] p-3"
                        />
                    </div>

                    <div className="md:pt-5">
                        <Link href="busTicketBookingDetails">
                            <button
                                type="submit"
                                className="w-full bg-[#0955AC] text-white font-semibold rounded-[10px] py-3 hover:bg-blue-700"
                            >
                                Search
                            </button>
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default BusCard;
