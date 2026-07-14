import React, { useState } from "react";
import { Link } from "@inertiajs/react";
// import leftArrow from "../../../../assets/multiModel/busDetails/leftArrow.svg";
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

import imgOne from "../../../../assets/multiModel/yatchDetails/imgOne.png";
import imgTwo from "../../../../assets/multiModel/yatchDetails/imgTwo.svg";
import imgThree from "../../../../assets/multiModel/yatchDetails/imgThree.svg";
import imgFour from "../../../../assets/multiModel/yatchDetails/imgFour.svg";
import imgFive from "../../../../assets/multiModel/yatchDetails/imgFive.svg";
import leftArrow from "../../../../assets/multiModel/busDetails/leftArrow.svg";

import bed from "../../../../assets/multiModel/yatchDetails/bed.svg";
import user from "../../../../assets/multiModel/yatchDetails/user.svg";

import hook from "../../../../assets/multiModel/busDetails/hook.svg";
import starTwo from "../../../../assets/multiModel/busDetails/starTwo.svg";
import water from "../../../../assets/multiModel/busDetails/water.svg";
import gas from "../../../../assets/multiModel/busDetails/gas.svg";

const Hero = () => {
    const [showPopup, setShowPopup] = useState(false);
    return (
        <div className="flex flex-col justify-center items-center px-4 py-5 md:px-10 md:py-10">
            <div className="max-w-[1400px] w-full">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 xl:gap-10 mt-5">
                    <div className="xl:col-span-2">
                        <div className="w-full h-auto bg-[#F4F3F3] shadow-lg rounded-[20px] p-5 xl:p-8">
                            <div className="xl:w-auto rounded-[22px]">
                                <div className="relative flex flex-col md:flex-row justify-center gap-[8px] items-center">
                                    <div className="absolute -top-3 -left-3 flex justify-center items-center bg-[#F4F3F3] rounded-[10px] size-[65px]">
                                        <Link
                                            href="/multiModel/available-vehicles"
                                            className="size-[40px] bg-[#0955AC] rounded-[10px] flex justify-center items-center cursor-pointer"
                                        >
                                            <img
                                                src={leftArrow}
                                                alt="Left Arrow"
                                            />
                                        </Link>
                                    </div>
                                    
                                    <img
                                        src={imgOne}
                                        className="w-full rounded-[22px] md:rounded-[0px] md:h-[280px] lg:h-[310px] xl:h-[280px] xl:w-full"
                                    />
                                    <div className="hidden md:flex flex-row md:flex-col gap-[8px] justify-center">
                                        <img src={imgTwo} className="w-full xl:w-full" />
                                        <img src={imgThree} className="w-full xl:w-full" />
                                    </div>
                                    <div className="hidden md:flex flex-row md:flex-col gap-[8px] justify-center">
                                        <img src={imgFour} className="w-full xl:w-full" />
                                        <img src={imgFive} className="w-full xl:w-full" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row justify-between items-start mt-10">
                                <div className="flex flex-col">
                                    <h1 className="bebas-neue text-[24px] xl:text-[30px] text-[#0A0A0A]">
                                        SEA PEARL{" "}
                                        <span className="text-[#0955AC]">
                                            LUXURY
                                        </span>{" "}
                                        YACHT
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

                            <div className="mt-10">
                                <h1 className="text-[18px] text-[#0A0A0A] mt-5">
                                    Voyage Information
                                </h1>

                                <div className="w-full xl:h-[52px] bg-[#F9FAFB] rounded-[10px] mt-3 flex flex-row justify-between items-center px-5 py-2 text-[14px] text-[#0A0A0A]">
                                    <div className="flex flex-col items-start">
                                        <h1>Colombo Harbor Marina</h1>
                                        <h1 className="text-[12px] text-[#6A7282]">
                                            8:00 AM Departure
                                        </h1>
                                    </div>
                                    <div className="flex flex-col items-end text-end">
                                        <h1>Trincomalee Harbor</h1>
                                        <h1 className="text-[12px] text-[#6A7282]">
                                            1:00 PM Arrival
                                        </h1>
                                    </div>
                                </div>

                                <div className="w-full xl:h-[52px] bg-[#F9FAFB] rounded-[10px] mt-3 flex flex-row justify-between items-center px-5 py-2 text-[14px] text-[#0A0A0A]">
                                    <h1>Voyage Duration</h1>
                                    <h1 className="text-[#4A5565] text-end">
                                        5 hours (180 km)
                                    </h1>
                                </div>
                            </div>

                            <div className="mt-10">
                                <h1 className="text-[18px] text-[#0A0A0A] mt-5">
                                    Yacht Amenities
                                </h1>
                                <div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 text-[14px] text-[#0A0A0A] gap-2 mt-3">
                                        <div className="flex flex-row gap-2 items-center">
                                            <img src={starTwo} />
                                            <h1>Luxury Cabins</h1>
                                        </div>
                                        <div className="flex flex-row gap-2 items-center">
                                            <img src={acBlue} />
                                            <h1>Air Conditioning</h1>
                                        </div>
                                        <div className="flex flex-row gap-2 items-center">
                                            <img src={seatsBlue} />
                                            <h1>Professional Crew</h1>
                                        </div>
                                        <div className="flex flex-row gap-2 items-center">
                                            <img src={gas} />
                                            <h1>Gourmet Catering</h1>
                                        </div>
                                        <div className="flex flex-row gap-2 items-center">
                                            <img src={water} />
                                            <h1>Water Sports</h1>
                                        </div>
                                        <div className="flex flex-row gap-2 items-center">
                                            <img src={hook} />
                                            <h1>Safety Equipment</h1>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10">
                                <h1 className="text-[18px] text-[#0A0A0A] mt-5">
                                    Charter Options
                                </h1>

                                <div className="w-full xl:h-[52px] bg-[#F9FAFB] rounded-[10px] mt-3 flex flex-row justify-between items-center px-5 py-2 text-[14px] text-[#0A0A0A]">
                                    <div className="flex flex-col items-start">
                                        <h1>Full Day Charter</h1>
                                        <h1 className="text-[12px] text-[#6A7282]">
                                            8:00 AM - 6:00 PM (10 hours)
                                        </h1>
                                    </div>
                                    <div className="flex flex-col items-end text-end">
                                        <h1>Rs 200,000</h1>
                                    </div>
                                </div>

                                <div className="w-full xl:h-[52px] bg-[#F9FAFB] rounded-[10px] mt-3 flex flex-row justify-between items-center px-5 py-2 text-[14px] text-[#0A0A0A]">
                                    <div className="flex flex-col items-start">
                                        <h1>Half Day Charter</h1>
                                        <h1 className="text-[12px] text-[#6A7282]">
                                            9:00 AM - 2:00 PM (5 hours)
                                        </h1>
                                    </div>
                                    <div className="flex flex-col items-end text-end">
                                        <h1>Rs 125,000</h1>
                                    </div>
                                </div>

                                <div className="w-full xl:h-[52px] bg-[#F9FAFB] rounded-[10px] mt-3 flex flex-row justify-between items-center px-5 py-2 text-[14px] text-[#0A0A0A]">
                                    <div className="flex flex-col items-start">
                                        <h1>Sunset Cruise</h1>
                                        <h1 className="text-[12px] text-[#6A7282]">
                                            4:00 PM - 7:00 PM (3 hours)
                                        </h1>
                                    </div>
                                    <div className="flex flex-col items-end text-end">
                                        <h1>Rs 85,000</h1>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full flex flex-col lg:flex-row items-center gap-3 xl:h-[160px] bg-[#F4F3F3] rounded-[20px] shadow-lg mt-10 p-5 font-[500] text-[#0A0A0A]">
                            <div>
                                <h1 className="text-[16px]">
                                    Service Provider
                                </h1>
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
                            <div className="flex flex-col sm:flex-row justify-center items-center mt-5 xl:mt-10 gap-3">
                                <div className="bg-[#0955AC] rounded-[10px] text-[#FFFFFF] flex justify-center text-[14px] font-[400] items-center cursor-pointer px-4 py-2">
                                    CONTACT NUMBER
                                </div>
                                <div className="border-[1px] border-[#0955AC] rounded-[10px] text-[#0955AC] flex justify-center text-[14px] font-[400] items-center cursor-pointer px-4 py-2">
                                    VIEW PROFILE
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="xl:col-span-1">
                        <div className="w-full h-auto bg-[#F4F3F3] shadow-lg rounded-[20px] px-5 pt-5 pb-10">
                            <h1 className="bebas-neue text-[32px] xl:text-[50px]/[100%]">
                                Your{" "}
                                <span className="text-[#0955AC]">journey</span>{" "}
                                details
                            </h1>
                            <h1 className="text-[14px] text-[#0A0A0A]">
                                Rs 850{" "}
                                <span className="text-[#6A7282]">/person</span>
                            </h1>

                            <div className="mt-5 flex flex-col gap-5 border-b-[1px] border-[#E5E7EB] pb-5">
                                <div>
                                    <label htmlFor="departurePoint" className="text-[12px] text-[#4A5565]">
                                        Departure Point
                                    </label>
                                    <input
                                        type="text"
                                        id="departurePoint"
                                        name="departurePoint"
                                        className="w-full h-[40px] bg-transparent focus:ring-0 rounded-[10px] border border-[#D1D5DC] mt-2 px-3 placeholder:text-[12px]"
                                        placeholder="Colombo Central Bus Stand"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full">
                                    <div className="w-full">
                                        <label htmlFor="travelDate" className="text-[12px] text-[#4A5565]">
                                            Travel Date
                                        </label>
                                        <input
                                            type="date"
                                            id="travelDate"
                                            name="travelDate"
                                            className="w-full h-[40px] bg-transparent focus:ring-0 rounded-[10px] border border-[#D1D5DC] mt-2 px-3"
                                        />
                                    </div>
                                    <div className="w-full">
                                        <label htmlFor="travelTime" className="text-[12px] text-[#4A5565]">
                                            Travel Time
                                        </label>
                                        <input
                                            type="time"
                                            id="travelTime"
                                            name="travelTime"
                                            className="w-full h-[40px] bg-transparent focus:ring-0 rounded-[10px] border border-[#D1D5DC] mt-2 px-3"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <label htmlFor="passengers" className="text-[12px] text-[#4A5565]">
                                        Number of Passengers
                                    </label>
                                    <input
                                        type="number"
                                        id="passengers"
                                        name="passengers"
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
                                        <h1>Crew & Service</h1>
                                        <h1>Fuel Surcharge</h1>
                                    </div>
                                    <div className="flex flex-col gap-2 justify-center items-end text-[#0A0A0A]">
                                        <h1>Rs 850</h1>
                                        <h1>Included</h1>
                                        <h1>Rs 10,000</h1>
                                    </div>
                                </div>

                                <h1 className="text-[14px] mt-5">Add Extras</h1>
                                <div className="grid grid-cols-2 mt-5 text-[12px]">
                                    <div className="flex flex-col gap-2">
                                        <h1>Gourmet Catering</h1>
                                        <h1>Water Sports Package</h1>
                                        <h1>Photography Service</h1>
                                        <h1>Premium Bar Service</h1>
                                    </div>
                                    <div className="flex flex-col gap-2 justify-center items-end">
                                        <h1>Rs 100</h1>
                                        <h1>Rs 200</h1>
                                        <h1>Rs 150</h1>
                                        <h1>Rs 150</h1>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 justify-center items-center mt-5 text-[12px] pt-5 border-t-[1px] border-[#E5E7EB]">
                                    <div className="flex flex-col">
                                        <h1>Deposit (30%)</h1>
                                        <h1 className="text-[12px] text-[#6A7282] xl:text-nowrap">
                                            Balance due 7 days before departure
                                        </h1>
                                    </div>
                                    <div className="flex flex-col gap-2 justify-center items-end">
                                        <h1>Rs 37,500</h1>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 justify-center items-start mt-5 text-[12px] pt-5 border-t-[1px] border-[#E5E7EB]">
                                    <div className="flex flex-col">
                                        <h1 className="text-[14px]">
                                            Total Charter Fee
                                        </h1>
                                        <h1 className="text-[12px] text-[#6A7282] xl:text-nowrap">
                                            Refundable deposit: Rs 10,000
                                        </h1>
                                    </div>
                                    <div className="flex flex-col gap-2 text-[18px] justify-center items-end">
                                        <h1>Rs 135,000</h1>
                                    </div>
                                </div>

                                <div className="flex flex-row items-center gap-1 mt-3">
                                    <div className="w-[5px] h-[5px] bg-[#FB2C36] rounded-full" />
                                    <h1 className="text-[10px] text-[#6A7282]">
                                        Weather dependent - Full refund if
                                        cancelled due to adverse conditions
                                    </h1>
                                </div>

                                <div
                                    className="w-full h-[42px] bg-[#0955AC] rounded-[10px] mt-5 flex justify-center items-center text-[#FFFFFF] text-[14px] font-[600] cursor-pointer"
                                    onClick={() => setShowPopup(true)}
                                >
                                    BOOK NOW
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {showPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
                        <div className="w-full max-w-[768px] max-h-[90vh] bg-[#FFFFFF] shadow-lg rounded-[16px] py-5 text-[#0A0A0A] overflow-hidden">
                            <div className="flex flex-row justify-between border-b-[1px] border-[#E5E7EB] pb-5 items-center px-5">
                                <div className="flex flex-col">
                                    <h1 className="text-[20px] font-[600]">
                                        Select Your Cabins - Luxury Yacht
                                    </h1>
                                    <h1 className="text-[14px] text-[#4A5565]">
                                        Sea Pearl | Colombo to Trincomalee
                                    </h1>
                                </div>
                                <img
                                    src={close}
                                    alt="Close"
                                    onClick={() => setShowPopup(false)}
                                    className="cursor-pointer"
                                />
                            </div>

                            <div
                                className="px-5 overflow-y-auto py-5"
                                style={{ maxHeight: "calc(90vh - 120px)" }}
                            >
                                <div className="flex flex-col sm:flex-row justify-center items-center gap-5 text-[14px] mt-5">
                                    <div className="flex flex-row items-center gap-2">
                                        <div className="size-[32px] border-[1.6px] border-[#D1D5DC] bg-[#FFFFFF] rounded-[4px]"></div>
                                        <h1>Available</h1>
                                    </div>
                                    <div className="flex flex-row items-center gap-2">
                                        <div className="size-[32px] bg-[#EFF6FF] border-[1.6px] border-[#155DFC] rounded-[4px]"></div>
                                        <h1>Selected</h1>
                                    </div>
                                    <div className="flex flex-row items-center gap-2">
                                        <div className="size-[32px] bg-[#F3F4F6] border-[1.6px] border-[#D1D5DC] rounded-[4px]"></div>
                                        <h1>Booked</h1>
                                    </div>
                                </div>

                                <div className="flex flex-col mt-5 items-center bg-gradient-to-b from-[#CEFAFE] to-[#DBEAFE]  rounded-[20px] p-6">
                                    {/* Bow (Front) Label */}
                                    <div className="w-full bg-[#FFFFFF] rounded-[10px] py-3 mb-5 text-center">
                                        <h1 className="text-[14px] font-[500]">
                                            ← Bow (Front)
                                        </h1>
                                    </div>

                                    {/* Yacht Cabins Layout */}
                                    <div className="w-full space-y-4">
                                        {/* Row 1 - Master Suite & VIP Cabin 1 */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Master Suite */}
                                            <div className="bg-white rounded-[10px] p-4 border-[2px] border-[#D1D5DC] hover:border-[#0955AC] cursor-pointer transition-all">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex justify-start gap-2 items-start">
                                                            <div className="size-[36px] rounded-[10px] bg-[#F3F4F6] flex justify-center items-center">
                                                                <img
                                                                    src={bed}
                                                                />
                                                            </div>

                                                            <div>
                                                                <h3 className="text-[14px] font-[600] text-[#0A0A0A]">
                                                                    Master Suite
                                                                </h3>
                                                                <div className="flex flex-row gap-1 justify-center">
                                                                    <img
                                                                        src={
                                                                            user
                                                                        }
                                                                    />
                                                                    <p className="text-[12px] text-[#6A7282]">
                                                                        Up to 2
                                                                        guests
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <ul className="text-[11px] text-[#4A5565] space-y-1 mb-3 mt-2">
                                                            <li>• King Bed</li>
                                                            <li>• En-suite</li>
                                                            <li>• Balcony</li>
                                                        </ul>
                                                        <div className="flex justify-between items-center pt-2 border-t border-[#E5E7EB]">
                                                            <span className="text-[11px] text-[#6A7282]">
                                                                Per cabin
                                                            </span>
                                                            <span className="text-[14px] font-[600] text-[#0A0A0A]">
                                                                Rs 35,000
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* VIP Cabin 1 */}
                                            <div className="bg-[#E5E7EB] rounded-[10px] p-4 border-[2px] border-[#D1D5DC] relative cursor-not-allowed">
                                                <div className="absolute top-2 right-2 bg-[#6A7282] text-white text-[10px] px-2 py-1 rounded">
                                                    Booked
                                                </div>
                                                <div className="flex items-start gap-3 opacity-60">
                                                    <div className="flex-1">
                                                        <div className="flex justify-start gap-2 items-start">
                                                            <div className="size-[36px] rounded-[10px] bg-[#F3F4F6] flex justify-center items-center">
                                                                <img
                                                                    src={bed}
                                                                />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-[14px] font-[600] text-[#0A0A0A]">
                                                                    VIP Cabin 1
                                                                </h3>
                                                                <div className="flex flex-row gap-1 justify-center">
                                                                    <img
                                                                        src={
                                                                            user
                                                                        }
                                                                    />
                                                                    <p className="text-[12px] text-[#6A7282]">
                                                                        Up to 2
                                                                        guests
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <ul className="text-[11px] text-[#4A5565] space-y-1 mb-3 mt-2">
                                                            <li>• Queen Bed</li>
                                                            <li>• En-suite</li>
                                                            <li>
                                                                • Ocean View
                                                            </li>
                                                        </ul>
                                                        <div className="flex justify-between items-center pt-2 border-t border-[#E5E7EB]">
                                                            <span className="text-[11px] text-[#6A7282]">
                                                                Per cabin
                                                            </span>
                                                            <span className="text-[14px] font-[600] text-[#0A0A0A]">
                                                                Rs 28,000
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row 2 - VIP Cabin 2 & Guest Cabin 1 */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* VIP Cabin 2 */}
                                            <div className="bg-white rounded-[10px] p-4 border-[2px] border-[#D1D5DC] hover:border-[#0955AC] cursor-pointer transition-all">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex justify-start gap-2 items-start">
                                                            <div className="size-[36px] rounded-[10px] bg-[#F3F4F6] flex justify-center items-center">
                                                                <img
                                                                    src={bed}
                                                                />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-[14px] font-[600] text-[#0A0A0A]">
                                                                    VIP Cabin 2
                                                                </h3>
                                                                <div className="flex flex-row gap-1 justify-center">
                                                                    <img
                                                                        src={
                                                                            user
                                                                        }
                                                                    />
                                                                    <p className="text-[12px] text-[#6A7282]">
                                                                        Up to 2
                                                                        guests
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <ul className="text-[11px] text-[#4A5565] space-y-1 mb-3 mt-2">
                                                            <li>• Queen Bed</li>
                                                            <li>• En-suite</li>
                                                            <li>
                                                                • Ocean View
                                                            </li>
                                                        </ul>
                                                        <div className="flex justify-between items-center pt-2 border-t border-[#E5E7EB]">
                                                            <span className="text-[11px] text-[#6A7282]">
                                                                Per cabin
                                                            </span>
                                                            <span className="text-[14px] font-[600] text-[#0A0A0A]">
                                                                Rs 28,000
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Guest Cabin 1 */}
                                            <div className="bg-[#E5E7EB] rounded-[10px] p-4 border-[2px] border-[#D1D5DC] relative cursor-not-allowed">
                                                <div className="absolute top-2 right-2 bg-[#6A7282] text-white text-[10px] px-2 py-1 rounded">
                                                    Booked
                                                </div>
                                                <div className="flex items-start gap-3 opacity-60">
                                                    <div className="flex-1">
                                                        <div className="flex justify-start gap-2 items-start">
                                                            <div className="size-[36px] rounded-[10px] bg-[#F3F4F6] flex justify-center items-center">
                                                                <img
                                                                    src={bed}
                                                                />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-[14px] font-[600] text-[#0A0A0A]">
                                                                    Guest Cabin
                                                                    1
                                                                </h3>
                                                                <div className="flex flex-row gap-1 justify-center">
                                                                    <img
                                                                        src={
                                                                            user
                                                                        }
                                                                    />
                                                                    <p className="text-[12px] text-[#6A7282]">
                                                                        Up to 2
                                                                        guests
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <ul className="text-[11px] text-[#4A5565] space-y-1 mb-3 mt-2">
                                                            <li>• Twin Beds</li>
                                                            <li>
                                                                • Shared Bath
                                                            </li>
                                                        </ul>
                                                        <div className="flex justify-between items-center pt-2 border-t border-[#E5E7EB]">
                                                            <span className="text-[11px] text-[#6A7282]">
                                                                Per cabin
                                                            </span>
                                                            <span className="text-[14px] font-[600] text-[#0A0A0A]">
                                                                Rs 18,000
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row 3 - Guest Cabin 2 (Single) */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Guest Cabin 2 */}
                                            <div className="bg-white rounded-[10px] p-4 border-[2px] border-[#D1D5DC] hover:border-[#0955AC] cursor-pointer transition-all">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex justify-start gap-2 items-start">
                                                            <div className="size-[36px] rounded-[10px] bg-[#F3F4F6] flex justify-center items-center">
                                                                <img
                                                                    src={bed}
                                                                />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-[14px] font-[600] text-[#0A0A0A]">
                                                                    Guest Cabin
                                                                    2
                                                                </h3>
                                                                <div className="flex flex-row gap-1 justify-center">
                                                                    <img
                                                                        src={
                                                                            user
                                                                        }
                                                                    />
                                                                    <p className="text-[12px] text-[#6A7282]">
                                                                        Up to 2
                                                                        guests
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <ul className="text-[11px] text-[#4A5565] space-y-1 mb-3 mt-2">
                                                            <li>• Twin Beds</li>
                                                            <li>
                                                                • Shared Bath
                                                            </li>
                                                        </ul>
                                                        <div className="flex justify-between items-center pt-2 border-t border-[#E5E7EB]">
                                                            <span className="text-[11px] text-[#6A7282]">
                                                                Per cabin
                                                            </span>
                                                            <span className="text-[14px] font-[600] text-[#0A0A0A]">
                                                                Rs 18,000
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div></div>
                                        </div>
                                    </div>

                                    {/* Stern (Rear) Label */}
                                    <div className="w-full bg-[#FFFFFF] rounded-[10px] py-3 mt-5 text-center">
                                        <h1 className="text-[14px] font-[500]">
                                            Stern (Rear) →
                                        </h1>
                                    </div>
                                </div>

                                {/* Note */}
                                <div className="w-full mt-4 text-[11px] text-[#6A7282] p-3 rounded-[10px]">
                                    <p className="font-[500] text-[#0A0A0A] mb-1">
                                        Note:
                                    </p>
                                    <p>
                                        All cabins include climate control,
                                        safety equipment, and daily
                                        housekeeping. En-suite cabins have
                                        private bathrooms. Shared bath cabins
                                        share facilities with one other cabin.
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 w-full mt-5">
                                    <button
                                        className="w-full h-[42px] bg-[#FFFFFF] border-[1.6px] border-[#D1D5DC] rounded-[10px] flex justify-center items-center text-[14px] font-[600] cursor-pointer hover:bg-[#F9FAFB] transition-all"
                                        onClick={() => setShowPopup(false)}
                                    >
                                        Cancel
                                    </button>

                                    <Link
                                        href="/multiModel/yatch/payment"
                                        className="w-full h-[42px] bg-[#0955AC] rounded-[10px] flex justify-center items-center text-[#FFFFFF] text-[14px] font-[600] cursor-pointer hover:bg-[#0744A0] transition-all"
                                    >
                                        Confirm
                                    </Link>
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
