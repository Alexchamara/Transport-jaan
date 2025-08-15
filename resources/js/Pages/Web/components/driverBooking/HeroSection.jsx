import React, { useState } from "react";
import { router } from "@inertiajs/react";
import bg from "../../assets/driverBooking/bg.svg";
import calendarBlue from "../../assets/vehicleList/calendarBlue.png"
import locationBlue from "../../assets/vehicleList/locationBlue.png"

const HeroSection = () => {
    const [formData, setFormData] = useState({
        pickupLocation: "",
        pickupDate: "",
        dropoffLocation: "",
        dropoffDate: "",
    });

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleCalendarClick = (fieldName) => {
        document.getElementById(fieldName).showPicker();
    };

    const onSubmit = (e) => {
        e.preventDefault();
        router.visit("/driver-search-results", {
            method: "get",
            data: formData,
        });
    };

    return (
        <div className="relative h-[900px] lg:h-[728px]">
            <img src={bg} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-[#0000005C]" />
            <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-[40px] lg:gap-[80px] justify-center items-center">
                        <div className="lg:w-[616px] h-auto">
                            <div className="w-[125px] h-[5px] bg-white rounded-sm" />
                            <h1 className="bebas-neue text-[28px] md:text-[68px]/[70px] font-[400] text-[white]">
                                Trusted <br className="block md:hidden" /> transportation partners <br className="block md:hidden" />  across every
                                travel mode.
                            </h1>
                            <p className=" text-[12px] md:text-[18px]/[20px] font-[400] text-[white] text-justify">
                                Easily book trusted drivers for land and air
                                travel — all from one platform. Whether you're
                                heading across town, cruising the coastline, or
                                flying to your next destination, we've got the
                                right vehicle and driver for you.
                            </p>
                        </div>
                        <div className="flex flex-col items-center lg:items-end text-[16px] figtree">
                            <div className="lg:w-[335px] w-full h-[58px] flex flex-row font-[700] text-[#0955AC]">
                                <div className="lg:w-[171px] w-full h-auto bg-white rounded-tl-[15px] rounded-tr-[15px] flex justify-center items-center">
                                    <h1 className="border-b-[2px] border-[#286BB6]">
                                        Land Vehicle
                                    </h1>
                                </div>
                                <div className="lg:w-[164px] w-full h-auto bg-white rounded-tl-[15px] rounded-tr-[15px] flex justify-center items-center">
                                    <h1 className="border-b-[2px] border-[#286BB6]">
                                        Air Vehicle
                                    </h1>
                                </div>
                            </div>
                            <div className="lg:w-[508px] lg:h-[292px] bg-[white] lg:rounded-tl-[15px] rounded-bl-[15px] rounded-br-[15px]">
                                {/* Search Form */}
                                <form
                                    onSubmit={onSubmit}
                                    className="figtree p-4 sm:p-6 rounded-[15px] w-full 2xl:w-[505px] h-full text-[#286BB6] text-[13px] font-[400]"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                        {/* Pick-up Location */}
                                        <div>
                                            <label
                                                htmlFor="pickupLocation"
                                                className="block mb-1"
                                            >
                                                Pick-up Location
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
                                                    value={formData.pickupLocation}
                                                    onChange={handleInputChange}
                                                    placeholder="Search a location"
                                                    className="shadow-sm appearance-none w-full border-[1px] border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline pl-12 placeholder:text-[#286BB6]"
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
                                                    value={formData.pickupDate}
                                                    onChange={handleInputChange}
                                                    className="shadow-sm w-full border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline pr-12 [&::-webkit-calendar-picker-indicator]:hidden"
                                                />
                                                <img
                                                    src={calendarBlue}
                                                    className="absolute inset-y-5 right-0 flex items-center pr-3 cursor-pointer"
                                                    alt="calendar"
                                                    onClick={() => handleCalendarClick("pickupDate")}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                        {/* Drop-off Location */}
                                        <div>
                                            <label
                                                htmlFor="dropoffLocation"
                                                className="block mb-1"
                                            >
                                                Drop-off Location
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
                                                    value={formData.dropoffLocation}
                                                    onChange={handleInputChange}
                                                    placeholder="Search a location"
                                                    className="shadow-sm w-full border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline pl-12 placeholder:text-[#286BB6]"
                                                />
                                            </div>
                                        </div>
                                        {/* Drop-off Date */}
                                        <div>
                                            <label
                                                htmlFor="dropoffDate"
                                                className="block mb-1"
                                            >
                                                Drop-off Date
                                            </label>
                                            <div className="relative flex items-center">
                                                <input
                                                    type="date"
                                                    id="dropoffDate"
                                                    value={formData.dropoffDate}
                                                    onChange={handleInputChange}
                                                    className="shadow-sm border-[#0000001A] rounded-[8px] p-[16px] w-full leading-tight focus:outline-none focus:shadow-outline pr-12 [&::-webkit-calendar-picker-indicator]:hidden"
                                                />
                                                <img
                                                    src={calendarBlue}
                                                    className="absolute inset-y-5 right-0 flex items-center pr-3 cursor-pointer"
                                                    alt="calendar"
                                                    onClick={() => handleCalendarClick("dropoffDate")}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Find a Vehicle Button */}
                                    <button
                                        type="submit"
                                        className="bg-[#0955AC] text-white font-bold h-[56px] w-full rounded-[8px] focus:outline-none focus:shadow-outline cursor-pointer"
                                    >
                                        Find a Vehicle
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
