import React from "react";
import { Link } from "@inertiajs/react";

const FlightCard = () => {
    return (
        <form
            // onSubmit={onSubmit}
            className="figtree flex flex-col justify-center items-center bg-white p-4 sm:p-6 rounded-[15px] w-full h-auto text-[#286BB6] text-[13px] font-[400]"
            style={{
                boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
            }}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 justify-between w-full gap-4 mb-4">
                {/* Pick-up Location */}
                <div>
                    <label htmlFor="pickupLocation" className="block mb-1">
                        Pick-up Location
                    </label>
                    <input
                        type="text"
                        id="pickupLocation"
                        // value={formData.pickupLocation}
                        // onChange={handleInputChange}
                        placeholder="Search a location"
                        className="appearance-none w-full border-[1px] border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline placeholder:text-[#286BB6]"
                    />
                </div>
                {/* Pick-up Date */}
                <div>
                    <label htmlFor="pickupDate" className="block mb-1">
                        Pick-up Date
                    </label>
                    <input
                        type="text"
                        id="pickupDate"
                        // value={formData.pickupDate}
                        // onChange={handleInputChange}
                        placeholder="DD/MM/YYYY"
                        className="w-full border-[1px] border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline placeholder:text-[#286BB6]"
                        onFocus={(e) => (e.target.type = "date")}
                        onBlur={(e) => (e.target.type = "text")}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 justify-between w-full gap-4 mb-6">
                {/* Drop-off Location */}
                <div>
                    <label htmlFor="dropoffLocation" className="block mb-1">
                        Drop-off Location
                    </label>
                    <input
                        type="text"
                        id="dropoffLocation"
                        // value={formData.dropoffLocation}
                        // onChange={handleInputChange}
                        placeholder="Search a location"
                        className="w-full border-[1px] border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline placeholder:text-[#286BB6]"
                    />
                </div>
                {/* Drop-off Date */}
                <div>
                    <label htmlFor="dropoffDate" className="block mb-1">
                        Drop-off Date
                    </label>
                    <input
                        type="text"
                        id="dropoffDate"
                        // value={formData.dropoffDate}
                        // onChange={handleInputChange}
                        placeholder="DD/MM/YYYY"
                        className="border-[1px] border-[#0000001A] rounded-[8px] p-[16px] w-full leading-tight focus:outline-none focus:shadow-outline placeholder:text-[#286BB6]"
                        onFocus={(e) => (e.target.type = "date")}
                        onBlur={(e) => (e.target.type = "text")}
                    />
                </div>
            </div>

            {/* Find a Vehicle Button */}
            <Link
                href="/flightBooking"
                type="submit"
                // onClick={handleFindVehicleClick}
                className="bg-[#0955AC] text-white font-bold h-[56px] w-full rounded-[8px] focus:outline-none focus:shadow-outline cursor-pointer hover:bg-[#07448a] transition-colors flex justify-center items-center"
            >
                Start
            </Link>
        </form>
    );
};

export default FlightCard;
