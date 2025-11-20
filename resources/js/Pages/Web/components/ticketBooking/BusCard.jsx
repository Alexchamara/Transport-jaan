import React, { useState } from "react";
import { router } from "@inertiajs/react";

const BusCard = () => {
    const [busFrom, setBusFrom] = useState("");
    const [busTo, setBusTo] = useState("");
    const [busDate, setBusDate] = useState("");

    const stationOptions = [
        "Colombo Central Bus Stand",
        "Pettah Bus Station",
        "Kandy Bus Terminal",
        "Galle Bus Station",
        "Matara Bus Station",
        "Anuradhapura Bus Station",
        "Kurunegala Bus Station",
        "Ratnapura Bus Station",
        "Badulla Bus Station",
        "Jaffna Bus Station",
        "Negombo Bus Station",
        "Gampaha Bus Station",
        "Kalutara Bus Station",
        "Hambantota Bus Station",
        "Trincomalee Bus Station",
        "Batticaloa Bus Station",
        "Polonnaruwa Bus Station",
        "Nuwara Eliya Bus Station",
        "Bandarawela Bus Station",
        "Chilaw Bus Station"
    ];

    const onSubmitBus = (e) => {
        e.preventDefault();
        
        if (!busFrom || !busTo || !busDate) {
            alert('Please fill in all fields');
            return;
        }

        // Navigate to bus booking details with search parameters
        router.get('/busTicketBookingDetails', {
            from: busFrom,
            to: busTo,
            date: busDate
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
                            className="w-full border rounded-[10px] p-3 truncate"
                            required
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
                            className="w-full border rounded-[10px] p-3 truncate"
                            required
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
                            required
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div className="md:pt-5">
                        <button
                            type="submit"
                            className="w-full bg-[#0955AC] text-white font-semibold rounded-[10px] py-3 hover:bg-blue-700"
                        >
                            Search
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default BusCard;
