import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import leftArrow from "../../../../assets/multiModel/busDetails/leftArrow.svg";
import share from "../../../../assets/multiModel/busDetails/share.svg";
import heart from "../../../../assets/multiModel/busDetails/heart.svg";

import milage from "../../../../assets/multiModel/busDetails/milage.svg";
import fuel from "../../../../assets/multiModel/busDetails/fuel.svg";
import ac from "../../../../assets/multiModel/busDetails/ac.svg";
import seats from "../../../../assets/multiModel/busDetails/seats.svg";

import wifi from "../../../../assets/multiModel/busDetails/wifi.svg";
import acBlue from "../../../../assets/multiModel/busDetails/acBlue.svg";
import seatsBlue from "../../../../assets/multiModel/busDetails/seatsBlue.svg";

import profilePic from "../../../../assets/multiModel/busDetails/profilePic.svg";
import star from "../../../../assets/multiModel/busDetails/star.svg";

import bus1 from "../../../../assets/multiModel/busDetails/bus1.svg";

import close from "../../../../assets/multiModel/busDetails/close.svg";

const Hero = () => {
    const [showPopup, setShowPopup] = useState(false);
    return (
        <div className="flex flex-col justify-center items-center px-10 py-10">
            <div className="max-w-[1400px] w-full">
                <Link href="/multiModel/available-vehicles" className="size-[40px] bg-[#0955AC] rounded-[10px] flex justify-center items-center cursor-pointer">
                    <img src={leftArrow} alt="Left Arrow" />
                </Link>

                <div className="grid grid-cols-3 gap-5 mt-5">
                    <div className="col-span-2">
                        <div className="w-full h-[777px] bg-[#F4F3F3] shadow-xl rounded-[20px] p-8">
                            <div className="flex flex-row justify-between items-center">
                                <div className="flex flex-col">
                                    <h1 className="text-[24px] text-[#0A0A0A]">
                                        HIGHWAY EXPRESS (Route 501)
                                    </h1>
                                    <div className="flex flex-row items-center gap-2">
                                        <div className="size-[10px] bg-[#00C950] rounded-full" />
                                        <h1 className="text-[#00A63E] text-[14px] font-[400]">
                                            Available
                                        </h1>
                                    </div>
                                </div>
                                <div className="flex flex-row gap-3 items-center">
                                    <img
                                        src={share}
                                        alt="Share"
                                        className="cursor-pointer"
                                    />
                                    <div className="w-[103px] h-[36px] bg-[#155DFC] rounded-[10px] text-[#FFFFFF]  flex flex-row items-center justify-center gap-2 px-4 py-2 cursor-pointer">
                                        <img
                                            src={heart}
                                            alt="Heart"
                                            className=""
                                        />
                                        <h1>Wishlist</h1>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5">
                                <div>
                                    <h1 className="text-[#155DFC]">
                                        Bus Details
                                    </h1>
                                    <div className="w-[80px] h-[2px] bg-[#155DFC] mt-2" />
                                </div>

                                <div>
                                    <h1 className="text-[18px] text-[#0A0A0A] mt-5">
                                        Description
                                    </h1>
                                    <p className="text-[14px] text-[#4A5565] text-justify mt-3">
                                        Highway Express operates premium AC
                                        luxury coaches on the Colombo-Galle
                                        route. Our buses feature comfortable
                                        reclining seats, air conditioning,
                                        entertainment systems, and complimentary
                                        Wi-Fi. With departures every hour, we
                                        ensure you reach your destination safely
                                        and comfortably. The scenic coastal
                                        route offers stunning views of the
                                        Indian Ocean throughout your journey.
                                    </p>
                                    <h1 className="text-[18px] text-[#0A0A0A] mt-5">
                                        Bus Specifications
                                    </h1>

                                    <div className="flex flex-row gap-5 items-center mt-3">
                                        <div className="w-[185px] h-[103px] bg-[#F9FAFB] rounded-[10px] flex justify-center items-center flex-col gap-2 p-4">
                                            <img src={milage} />
                                            <h1 className="text-[#6A7282] text-[12px]">
                                                Max Speed
                                            </h1>
                                            <h1 className="text-[14px] text-[#0A0A0A]">
                                                100 km/h
                                            </h1>
                                        </div>
                                        <div className="w-[185px] h-[103px] bg-[#F9FAFB] rounded-[10px] flex justify-center items-center flex-col gap-2 p-4">
                                            <img src={fuel} />
                                            <h1 className="text-[#6A7282] text-[12px]">
                                                Fuel Type
                                            </h1>
                                            <h1 className="text-[14px] text-[#0A0A0A]">
                                                Diesel
                                            </h1>
                                        </div>
                                        <div className="w-[185px] h-[103px] bg-[#F9FAFB] rounded-[10px] flex justify-center items-center flex-col gap-2 p-4">
                                            <img src={ac} />
                                            <h1 className="text-[#6A7282] text-[12px]">
                                                Type
                                            </h1>
                                            <h1 className="text-[14px] text-[#0A0A0A]">
                                                AC Luxury
                                            </h1>
                                        </div>
                                        <div className="w-[185px] h-[103px] bg-[#F9FAFB] rounded-[10px] flex justify-center items-center flex-col gap-2 p-4">
                                            <img src={seats} />
                                            <h1 className="text-[#6A7282] text-[12px]">
                                                Capacity
                                            </h1>
                                            <h1 className="text-[14px] text-[#0A0A0A]">
                                                42 Seats
                                            </h1>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10">
                                <h1 className="text-[18px] text-[#0A0A0A] mt-5">
                                    Route Information
                                </h1>

                                <div className="w-full h-[52px] bg-[#F9FAFB] rounded-[10px] mt-3 flex flex-row justify-between items-center px-5 text-[14px] text-[#0A0A0A]">
                                    <h1>Colombo → Galle</h1>
                                    <h1 className="text-[#4A5565]">
                                        119 km / 2 hrs
                                    </h1>
                                </div>

                                <div className="w-full h-[52px] bg-[#F9FAFB] rounded-[10px] mt-3 flex flex-row justify-between items-center px-5 text-[14px] text-[#0A0A0A]">
                                    <h1>Galle → Matara</h1>
                                    <h1 className="text-[#4A5565]">
                                        44 km / 45 mins
                                    </h1>
                                </div>
                            </div>

                            <div className="mt-10">
                                <h1 className="text-[18px] text-[#0A0A0A] mt-5">
                                    Amenities
                                </h1>
                                <div className="flex flex-row text-[14px] text-[#0A0A0A] gap-20 mt-3">
                                    <div className="flex flex-row gap-2 items-center">
                                        <img src={wifi} />
                                        <h1>Free Wi-Fi</h1>
                                    </div>
                                    <div className="flex flex-row gap-2 items-center">
                                        <img src={acBlue} />
                                        <h1>Air Conditioning</h1>
                                    </div>
                                    <div className="flex flex-row gap-2 items-center">
                                        <img src={seatsBlue} />
                                        <h1>Reclining Seats</h1>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-1">
                        <div className="w-full h-[777px] bg-[#F4F3F3] shadow-xl rounded-[20px] p-5">
                            <h1 className="bebas-neue text-[50px]/[100%]">
                                Your{" "}
                                <span className="text-[#0955AC]">journey</span>{" "}
                                details
                            </h1>
                            <h1 className="text-[14px] text-[#0A0A0A]">
                                Rs 850{" "}
                                <span className="text-[#6A7282]">/person</span>
                            </h1>

                            <div className="mt-5 flex flex-col gap-5 border-b-[1px] border-[#D1D5DC] pb-5">
                                <div>
                                    <label className="text-[12px] text-[#4A5565]">
                                        Departure Point
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full h-[40px] bg-transparent focus:ring-0 rounded-[10px] border border-[#D1D5DC] mt-2 px-3 placeholder:text-[12px]"
                                        placeholder="Colombo Central Bus Stand"
                                    />
                                </div>

                                <div className="flex flex-row items-center justify-center gap-5">
                                    <div>
                                        <label className="text-[12px] text-[#4A5565]">
                                            Travel Date
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full h-[40px] bg-transparent focus:ring-0 rounded-[10px] border border-[#D1D5DC] mt-2 px-3"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[12px] text-[#4A5565]">
                                            Travel Time
                                        </label>
                                        <input
                                            type="time"
                                            className="w-full h-[40px] bg-transparent focus:ring-0 rounded-[10px] border border-[#D1D5DC] mt-2 px-3"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-[12px] text-[#4A5565]">
                                        Number of Passengers
                                    </label>
                                    <input
                                        type="number"
                                        className="w-[50px] h-[50px] bg-transparent focus:ring-0 rounded-[10px] border border-[#D1D5DC] mt-2 px-3"
                                        placeholder="1"
                                    />
                                </div>
                            </div>

                            <div className="text-[#0A0A0A] mt-5">
                                <h1 className="text-[14px]">
                                    Pricing Breakdown
                                </h1>
                                <div className="grid grid-cols-2 mt-5 text-[12px]">
                                    <div className="flex flex-col gap-2 text-[#4A5565]">
                                        <h1>
                                            Base Fare{" "}
                                            <span className="text-[#155DFC]">
                                                (x1)
                                            </span>
                                        </h1>
                                        <h1>Service Fee</h1>
                                    </div>
                                    <div className="flex flex-col gap-2 justify-center items-end text-[#0A0A0A]">
                                        <h1>Rs 850</h1>
                                        <h1>Rs 50</h1>
                                    </div>
                                </div>

                                <h1 className="text-[14px] mt-5">Add Extras</h1>
                                <div className="grid grid-cols-2 mt-5 text-[12px]">
                                    <div className="flex flex-col gap-2">
                                        <h1>Extra Luggage</h1>
                                        <h1>Meal Package</h1>
                                        <h1>Insurance</h1>
                                    </div>
                                    <div className="flex flex-col gap-2 justify-center items-end">
                                        <h1>Rs 100</h1>
                                        <h1>Rs 200</h1>
                                        <h1>Rs 150</h1>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 justify-center items-center mt-5 text-[12px] pt-5 border-t-[1px] border-[#D1D5DC]">
                                    <div className="flex flex-col gap-2">
                                        <h1>Total Price</h1>
                                    </div>
                                    <div className="flex flex-col gap-2 text-[18px] justify-center items-end">
                                        <h1>Rs 900</h1>
                                    </div>
                                </div>

                                <div className="w-full h-[42px] bg-[#0955AC] rounded-[10px] mt-3 flex justify-center items-center text-[#FFFFFF] text-[14px] font-[600] cursor-pointer" onClick={() => setShowPopup(true)}>
                                    BOOK NOW
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full flex flex-row items-center gap-3 h-[160px] bg-[#F4F3F3] rounded-[20px] shadow-xl mt-10 p-5 font-[500] text-[#0A0A0A]">
                    <div>
                        <h1 className="text-[16px]">Service Provider</h1>
                        <div className="flex flex-row gap-2 items-center mt-3">
                            <img src={profilePic} alt="Profile" />
                            <div className="flex flex-col">
                                <h1 className="text-[16px] font-[500]">
                                    Highway Express Pvt Ltd
                                </h1>
                                <div className="flex flex-row gap-2 text-[14px]">
                                    <img
                                        src={star}
                                        className="w-[12px]"
                                        alt="Rating"
                                    />
                                    <h1>
                                        4.7{" "}
                                        <span className="text-[#6A7282]">
                                            (1,280 Reviews)
                                        </span>
                                    </h1>
                                </div>
                                <h1 className="text-[#6A7282] text-[14px]">
                                    Operating since 2010
                                </h1>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row justify-center items-center mt-10 gap-3">
                        <div className="bg-[#0955AC] rounded-[10px] text-[#FFFFFF] flex justify-center text-[14px] font-[400] items-center cursor-pointer px-4 py-2">
                            CONTACT NUMBER
                        </div>
                        <div className="border-[1px] border-[#0955AC] rounded-[10px] text-[#0955AC] flex justify-center text-[14px] font-[400] items-center cursor-pointer px-4 py-2">
                            VIEW PROFILE
                        </div>
                    </div>
                </div>

                <div className="mt-10">
                    <h1 className="text-[24px] font-[600] figtree">
                        OTHER <span className="text-[#0955AC]">AVAILABLE</span>{" "}
                        BUSES
                    </h1>
                    <div className="flex flex-row justify-between items-center mt-5">
                        <div className="w-[389px] h-[152px] shadow-lg flex flex-row justify-start gap-3 items-center border-[0.8px] border-[#E5E7EB] rounded-[10px] px-4 py-2">
                            <img
                                src={bus1}
                                alt="Bus 1"
                                className="w-[96px] h-[121px] rounded-[10px]"
                            />
                            <div className="flex flex-col gap-2 text-[14px] font-[400] text-[#0A0A0A] w-full">
                                <h1 className="uppercase">LUXURY COACH</h1>
                                <h1 className="text-[12px]">Route 501</h1>
                                <h1>Rs 750</h1>

                                <div className="w-full h-[28px] bg-[#0955AC] rounded-[4px] flex justify-center items-center px-4 py-2 cursor-pointer">
                                    <h1 className="text-[#FFFFFF] text-[12px] font-[400]">
                                        VIEW DETAILS
                                    </h1>
                                </div>
                            </div>
                        </div>

                        <div className="w-[389px] h-[152px] shadow-lg flex flex-row justify-start gap-3 items-center border-[0.8px] border-[#E5E7EB] rounded-[10px] px-4 py-2">
                            <img
                                src={bus1}
                                alt="Bus 1"
                                className="w-[96px] h-[121px] rounded-[10px]"
                            />
                            <div className="flex flex-col gap-2 text-[14px] font-[400] text-[#0A0A0A] w-full">
                                <h1 className="uppercase">LUXURY COACH</h1>
                                <h1 className="text-[12px]">Route 501</h1>
                                <h1>Rs 750</h1>

                                <div className="w-full h-[28px] bg-[#0955AC] rounded-[4px] flex justify-center items-center px-4 py-2 cursor-pointer">
                                    <h1 className="text-[#FFFFFF] text-[12px] font-[400]">
                                        VIEW DETAILS
                                    </h1>
                                </div>
                            </div>
                        </div>

                        <div className="w-[389px] h-[152px] shadow-lg flex flex-row justify-start gap-3 items-center border-[0.8px] border-[#E5E7EB] rounded-[10px] px-4 py-2">
                            <img
                                src={bus1}
                                alt="Bus 1"
                                className="w-[96px] h-[121px] rounded-[10px]"
                            />
                            <div className="flex flex-col gap-2 text-[14px] font-[400] text-[#0A0A0A] w-full">
                                <h1 className="uppercase">LUXURY COACH</h1>
                                <h1 className="text-[12px]">Route 501</h1>
                                <h1>Rs 750</h1>

                                <div className="w-full h-[28px] bg-[#0955AC] rounded-[4px] flex justify-center items-center px-4 py-2 cursor-pointer">
                                    <h1 className="text-[#FFFFFF] text-[12px] font-[400]">
                                        VIEW DETAILS
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {showPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
                        <div className="w-[768px] h-[697px] bg-[#FFFFFF] shadow-lg rounded-[16px] py-5 text-[#0A0A0A]">
                    <div className="flex flex-row justify-between border-b-[1px] border-[#E5E7EB] pb-5 items-center px-5">
                        <div className="flex flex-col">
                            <h1 className="text-[20px] font-[400]">
                                Select Your Seats - AC Luxury
                            </h1>
                            <h1 className="text-[14px] text-[#4A5565]">
                                Highway Express | Colombo to Ellla
                            </h1>
                        </div>
                        <img src={close} alt="Close" onClick={() => setShowPopup(false)} />
                    </div>

                    <div className="px-5">
                        <div className="flex flex-row justify-center items-center gap-5 text-[14px] mt-5">
                            <div className="flex flex-row items-center gap-2">
                                <div className="size-[35px] border-[1.6px] border-[#D1D5DC] bg-[#FFFFFF] rounded-[4px]"></div>
                                <h1>Available</h1>
                            </div>
                            <div className="flex flex-row items-center gap-2">
                                <div className="size-[35px] bg-[#0955AC] rounded-[4px]"></div>
                                <h1>Selected</h1>
                            </div>
                            <div className="flex flex-row items-center gap-2">
                                <div className="size-[35px] bg-[#D1D5DC] rounded-[4px]"></div>
                                <h1>Booked</h1>
                            </div>
                        </div>
                        <div className="flex flex-col mt-10 items-center overflow-y-auto max-h-[480px]">
                            <div className="flex justify-end w-full">
                                <div className="w-[64px] h-[48px] bg-[#1E2939] rounded-t-[10px] flex justify-center items-center px-4 py-2">
                                    <h1 className="text-[#FFFFFFFF] text-[12px]">
                                        Driver
                                    </h1>
                                </div>
                            </div>
                            <div className="grid grid-cols-6 justify-center gap-2 items-center w-full max-w-[480px] text-[12px]">
                                {/* 1st row */}
                                <div className="flex justify-center items-center">
                                    1
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#D1D5DC] flex justify-center items-center">
                                    1A
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#D1D5DC] flex justify-center items-center">
                                    1B
                                </div>
                                <div className="size-[48px] border-l-[1.6px] border-r-[1.6px] border-[#D1D5DC]  flex justify-center items-center text-[#99A1AF]">
                                    Aisle
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#0955AC] flex justify-center items-center text-[#FFFFFF]">
                                    1C
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#0955AC] flex justify-center items-center text-[#FFFFFF]">
                                    1D
                                </div>

                                {/* 2nd row */}
                                <div className="flex justify-center items-center">
                                    2
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    2A
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    2B
                                </div>
                                <div className="size-[48px] border-l-[1.6px] border-r-[1.6px] border-[#D1D5DC]  flex justify-center items-center text-[#99A1AF]">
                                    Aisle
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    2C
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    2D
                                </div>

                                {/* 3rd row */}
                                <div className="flex justify-center items-center">
                                    3
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    3A
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    3B
                                </div>
                                <div className="size-[48px] border-l-[1.6px] border-r-[1.6px] border-[#D1D5DC]  flex justify-center items-center text-[#99A1AF]">
                                    Aisle
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#D1D5DC] flex justify-center items-center">
                                    3C
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    3D
                                </div>

                                {/* 4th row */}
                                <div className="flex justify-center items-center">
                                    4
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    4A
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    4B
                                </div>
                                <div className="size-[48px] border-l-[1.6px] border-r-[1.6px] border-[#D1D5DC]  flex justify-center items-center text-[#99A1AF]">
                                    Aisle
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    4C
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#D1D5DC] flex justify-center items-center">
                                    4D
                                </div>

                                {/* 5th row */}
                                <div className="flex justify-center items-center">
                                    5
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#D1D5DC] flex justify-center items-center">
                                    5A
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    5B
                                </div>
                                <div className="size-[48px] border-l-[1.6px] border-r-[1.6px] border-[#D1D5DC]  flex justify-center items-center text-[#99A1AF]">
                                    Aisle
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    5C
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    5D
                                </div>

                                {/* 6th row */}
                                <div className="flex justify-center items-center">
                                    6
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#D1D5DC] flex justify-center items-center">
                                    6A
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#D1D5DC] flex justify-center items-center">
                                    6B
                                </div>
                                <div className="size-[48px] border-l-[1.6px] border-r-[1.6px] border-[#D1D5DC]  flex justify-center items-center text-[#99A1AF]">
                                    Aisle
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#0955AC] flex justify-center items-center text-[#FFFFFF]">
                                    6C
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#0955AC] flex justify-center items-center text-[#FFFFFF]">
                                    6D
                                </div>

                                {/* 7th row */}
                                <div className="flex justify-center items-center">
                                    7
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    7A
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    7B
                                </div>
                                <div className="size-[48px] border-l-[1.6px] border-r-[1.6px] border-[#D1D5DC]  flex justify-center items-center text-[#99A1AF]">
                                    Aisle
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    7C
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    7D
                                </div>

                                {/* 8th row */}
                                <div className="flex justify-center items-center">
                                    8
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    8A
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    8B
                                </div>
                                <div className="size-[48px] border-l-[1.6px] border-r-[1.6px] border-[#D1D5DC]  flex justify-center items-center text-[#99A1AF]">
                                    Aisle
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#D1D5DC] flex justify-center items-center">
                                    8C
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    8D
                                </div>

                                {/* 9th row */}
                                <div className="flex justify-center items-center">
                                    9
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    9A
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    9B
                                </div>
                                <div className="size-[48px] border-l-[1.6px] border-r-[1.6px] border-[#D1D5DC]  flex justify-center items-center text-[#99A1AF]">
                                    Aisle
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    9C
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#D1D5DC] flex justify-center items-center">
                                    9D
                                </div>

                                {/* 10th row */}
                                <div className="flex justify-center items-center">
                                    10
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#D1D5DC] flex justify-center items-center">
                                    10A
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    10B
                                </div>
                                <div className="size-[48px] border-l-[1.6px] border-r-[1.6px] border-[#D1D5DC]  flex justify-center items-center text-[#99A1AF]">
                                    Aisle
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    10C
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    10D
                                </div>

                                {/* 11th row */}
                                <div className="flex justify-center items-center">
                                    11
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#D1D5DC] flex justify-center items-center">
                                    11A
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    11B
                                </div>
                                <div className="size-[48px] border-l-[1.6px] border-r-[1.6px] border-[#D1D5DC]  flex justify-center items-center text-[#99A1AF]">
                                    Aisle
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    11C
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    11D
                                </div>

                                {/* final row */}
                                <div className="flex justify-center items-center"></div>
                                <div className="size-[48px] rounded-[4px] bg-[#D1D5DC] flex justify-center items-center">
                                    12A
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    12B
                                </div>
                                <div className="size-[48px] border-l-[1.6px] border-r-[1.6px] border-[#D1D5DC]  flex justify-center items-center text-[#99A1AF]">
                                    Aisle
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    12C
                                </div>
                                <div className="size-[48px] rounded-[4px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] flex justify-center items-center">
                                    12D
                                </div>
                            </div>
                            <div className="w-full min-h-[120px] flex flex-col justify-between bg-[#F9FAFB] rounded-[10px] mt-10 p-5 text-[14px]">
                                <div className="flex justify-between flex-row">
                                    <h1>Selected Seats:</h1>
                                    <h1>None</h1>
                                </div>

                                <div className="flex justify-between flex-row">
                                    <h1>Price per seat:</h1>
                                    <h1>Rs 850</h1>
                                </div>

                                <div className="flex justify-between border-t-[0.8px] border-[#D1D5DC] flex-row">
                                    <h1 className="text-[16px]">Total:</h1>
                                    <h1 className="text-[16px]">Rs 0</h1>
                                </div>
                            </div>
                            <div className="flex flex-row gap-5 w-full">
                                <div className="w-full h-[42px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] rounded-[10px] mt-5 flex justify-center items-center text-[14px] font-[600] cursor-pointer px-4 py-2" onClick={() => setShowPopup(false)}>
                                    Cancel
                                </div>

                                <Link href="/multiModel/bus/payment" className="w-full h-[42px] bg-[#0955AC] rounded-[10px] mt-5 flex justify-center items-center text-[#FFFFFF] text-[14px] font-[600] cursor-pointer px-4 py-2">
                                    Confirm
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default Hero;
