import React, { useState } from "react";
import bg from "../../assets/booking/bg.png";
import locationBlue from "../../assets/vehicleList/locationBlue.png";
import calendarBlue from "../../assets/vehicleList/calendarBlue.png";
import classIcon from "../../assets/booking/class.png";

const HeroSection = () => {
    const [selectedTicketType, setSelectedTicketType] =
        useState("Train tickets");

    const ticketTypes = [
        { id: "air", label: "Air tickets" },
        { id: "cruise", label: "Cruise tickets" },
        { id: "train", label: "Train tickets" },
    ];

    return (
      // image size is the issue when develop this responsive
        <div className="relative h-screen lg:h-[788px]">  
            <img src={bg} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-[#000000B8]" />
            <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4">
                    <div className="text-white flex flex-col items-center justify-center gap-8">
                        <div className="absolute top-[-40px] left-[180px] w-[125px] h-[5px] rounded-sm bg-[white]" />
                        <h1 className="bebas-neue lg:text-[75px] text-[50px] font-[400]">
                            Book <span className="text-[#286BB6]">Your</span>{" "}
                            Train Journey{" "}
                            <span className="text-[#286BB6]">in</span> Seconds.
                        </h1>
                        <p className="poppins lg:text-[28px]/[50px] font-[300] text-[#FFFFFFC9] text-center">
                            Book train tickets across major routes in just a few
                            clicks — <br /> affordable, reliable, and
                            hassle-free. Whether you're commuting <br /> daily
                            or exploring new places, start your ride with us.
                        </p>

                        {/* Search Form */}
                        <form
                            // onSubmit={onSubmit}
                            className="figtree bg-white px-10 py-10 rounded-[15px] shadow-2xl shadow-[#00000040] w-full md:w-[615px] lg:w-[715px] xl:w-[915px] h-auto xl:h-[318px] text-[#286BB6] text-[13px] font-[400]"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8 justify-center items-center">
                                {/* From */}
                                <div>
                                    <label
                                        htmlFor="from"
                                        className="block mb-1"
                                    >
                                        From
                                    </label>
                                    <div className="relative flex items-center">
                                        <img
                                            src={locationBlue}
                                            className="absolute inset-y-5 left-0 flex items-center pl-3 pointer-events-none"
                                            alt="location"
                                        />
                                        <input
                                            type="text"
                                            id="pickupLocation"
                                            // value={formData.pickupLocation}
                                            // onChange={handleInputChange}
                                            placeholder="Search a location"
                                            className="shadow-sm appearance-none w-full xl:w-[376px] border-[1px] border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline pl-12 placeholder:text-[#286BB6]"
                                        />
                                    </div>
                                </div>
                                {/* Pick-up Date */}
                                <div>
                                    <label
                                        htmlFor="pickupDate"
                                        className="block mb-1"
                                    >
                                        Pick-up Date
                                    </label>
                                    <div className="relative flex items-center">
                                        <input
                                            type="date"
                                            id="pickupDate"
                                            // value={formData.pickupDate}
                                            // onChange={handleInputChange}
                                            className="shadow-sm w-full xl:w-[376px] border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline pr-12 [&::-webkit-calendar-picker-indicator]:hidden"
                                        />
                                        <img
                                            src={calendarBlue}
                                            className="absolute inset-y-5 right-20 flex items-center pr-3 cursor-pointer"
                                            alt="calendar"
                                            // onClick={() =>
                                            //     handleCalendarClick(
                                            //         "pickupDate"
                                            //     )
                                            // }
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
                                {/* Drop-off Location */}
                                <div>
                                    <label
                                        htmlFor="dropoffLocation"
                                        className="block mb-1"
                                    >
                                        To
                                    </label>
                                    <div className="relative flex items-center">
                                        <img
                                            src={locationBlue}
                                            className="absolute inset-y-5 left-0 flex items-center pl-3 pointer-events-none"
                                            alt="location"
                                        />
                                        <input
                                            type="text"
                                            id="dropoffLocation"
                                            // value={formData.dropoffLocation}
                                            // onChange={handleInputChange}
                                            placeholder="Search a location"
                                            className="shadow-sm w-full xl:w-[376px] border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline pl-12 placeholder:text-[#286BB6]"
                                        />
                                    </div>
                                </div>
                                {/* Drop-off Date */}
                                <div>
                                    <label
                                        htmlFor="dropoffDate"
                                        className="block mb-1"
                                    >
                                        Class
                                    </label>
                                    <div className="relative flex items-center">
                                        <input
                                            type="text"
                                            id="dropoffDate"
                                            placeholder="1st Class"
                                            // value={formData.dropoffDate}
                                            // onChange={handleInputChange}
                                            className="shadow-sm border-[#0000001A] placeholder:text-[#286BB6] rounded-[8px] p-[16px] w-full xl:w-[376px] leading-tight focus:outline-none focus:shadow-outline pr-12 [&::-webkit-calendar-picker-indicator]:hidden"
                                        />
                                        <img
                                            src={classIcon}
                                            className="absolute inset-y-5 right-20 flex items-center pr-3 cursor-pointer"
                                            alt="calendar"
                                            // onClick={() =>
                                            //     handleCalendarClick(
                                            //         "dropoffDate"
                                            //     )
                                            // }
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center mt-12">
                                {/* Find a Vehicle Button */}
                                <button
                                    type="submit"
                                    className="bg-[#0955AC] text-white font-bold h-[56px] w-full xl:w-[459px] rounded-[8px] focus:outline-none focus:shadow-outline cursor-pointer"
                                >
                                    Book a Train
                                </button>
                            </div>
                        </form>

                        <div className="absolute rotate-90 hidden left-[-160px] text-[20px] bebas-neue lg:flex flex-row gap-5 text-[#0955AC]">
                            {ticketTypes.map((ticketType) => (
                                <div
                                    key={ticketType.id}
                                    onClick={() =>
                                        setSelectedTicketType(ticketType.label)
                                    }
                                    className={`w-[118px] h-[74px] rounded-tl-[20px] rounded-tr-[20px] flex justify-center py-5 cursor-pointer transition-all duration-200 ${
                                        selectedTicketType === ticketType.label
                                            ? "bg-[#0955AC] text-white border-2 border-[#0955AC]"
                                            : "bg-[#D9D9D980] text-[#0955AC]"
                                    }`}
                                >
                                    <h1>{ticketType.label}</h1>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
