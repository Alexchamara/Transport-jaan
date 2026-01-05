import React from "react";
import car from "../../../assets/multiModel/reviewJourney/miniCar.svg";
import bus from "../../../assets/multiModel/reviewJourney/miniBus.svg";
import tram from "../../../assets/multiModel/reviewJourney/miniTram.svg";

import map from "../../../assets/multiModel/reviewJourney/map.svg";

import line from "../../../assets/multiModel/reviewJourney/line.svg";
import leftArrow from "../../../assets/multiModel/payment/leftArrow.svg";
import { Link } from "@inertiajs/react";

const Hero = () => {
    return (
        <div className="px-10 py-10">
            <div className="grid xl:grid-cols-3 grid-cols-1 gap-10">
                {/* left side */}
                <div className="xl:col-span-2">
                    <div className="flex flex-col md:flex-row items-start gap-5">
                        <Link href="/multiModel/available-vehicles">
                            <img src={leftArrow} />
                        </Link>
                        <div>
                            <h1 className="bebas-neue text-[50px]/[100%]">
                                Review{" "}
                                <span className="text-[#0955AC]">Your</span>{" "}
                                Journey
                            </h1>
                            <h3 className="text-[14px] font-[500] text-[#00000080]">
                                From Colombo to Nuwara Eliya
                            </h3>
                        </div>
                    </div>

                    <h1 className="text-[25px] font-[600] figtree py-10">
                        Itinerary Timeline
                    </h1>

                    <div className="flex flex-row items-center gap-5">
                        <div className="hidden lg:flex flex-col items-center">
                            <div className="size-[15px] border-[1px] border-[#0043CE] rounded-full flex justify-center items-center">
                                <div className="size-[3px] rounded-full bg-[#0043CE]" />
                            </div>
                            <div className="h-[420px]  w-0 border-l border-dotted border-[#0955AC]"></div>
                            <div className="size-[15px] border-[1px] border-[#0043CE] rounded-full flex justify-center items-center">
                                <div className="size-[3px] rounded-full bg-[#0043CE]" />
                            </div>
                        </div>

                        <div className="flex flex-col w-full">
                            <div className="w-full md:h-[102px] bg-[#F4F3F3] shadow-2xl rounded-[10px] text-[#0955AC] text-[12px] font-[600] flex flex-col md:flex-row items-center justify-between px-5 py-5">
                                {/* left part */}
                                <div className="relative w-full md:w-[60px] h-[60px] bg-[#0955AC1A] rounded-[10px] flex flex-col justify-center items-center">
                                    <img src={car} alt="car icon" />
                                    <h1>Car</h1>
                                </div>

                                {/* middle part */}
                                <div className="flex flex-row items-center">
                                    <div className="size-[20px] bg-[#FFFFFF] border-[1px] border-[#0043CE] rounded-full flex justify-center items-center">
                                        <div className="size-[4px] bg-[#0043CE] rounded-full" />
                                    </div>
                                    <div className="flex flex-col items-center text-[12px] text-[#00000080] font-[500]">
                                        <h1>Colombo to Ella</h1>
                                        <div className="w-full sm:w-[281px] h-[1px] bg-[#0955AC]"></div>
                                        <h1>5 hrs</h1>
                                    </div>
                                    <div className="size-[20px] bg-[#FFFFFF] border-[1px] border-[#0043CE] rounded-full flex justify-center items-center">
                                        <div className="size-[4px] bg-[#0043CE] rounded-full" />
                                    </div>
                                </div>

                                {/* right part */}
                                <div className="flex flex-col justify-center items-center">
                                    <h1 className="text-[25px] font-[600] text-[#000000]">
                                        $90.00
                                    </h1>
                                    <h1 className="text-[12px] text-[#00000080] font-[400]">
                                        10.00 AM - 15.00 PM
                                    </h1>
                                </div>
                            </div>

                            <div className="-ml-[28px] text-[20px] font-[600] text-[#0955AC] py-10 flex flex-row items-center gap-2">
                                <div className="hidden lg:block w-[60px] h-[1px] bg-[#0955AC]" />
                                <h1>12 Nov - 14 Nov</h1>
                            </div>

                            <div className="flex flex-row gap-5 items-center">
                                <div className="hidden -ml-[35px] bg-[#FFFFFF] size-[15px] border-[1px] border-[#0043CE] rounded-full lg:flex justify-center items-center">
                                    <div className="size-[3px] rounded-full bg-[#0043CE]" />
                                </div>

                                <div className="w-full md:h-[102px] bg-[#F4F3F3] shadow-2xl rounded-[10px] text-[#0955AC] text-[12px] font-[600] flex flex-col md:flex-row items-center justify-between px-5 py-5">
                                    {/* left part */}
                                    <div className="relative w-full md:w-[60px] h-[60px] bg-[#0955AC1A] rounded-[10px] flex flex-col justify-center items-center">
                                        <img src={tram} alt="car icon" />
                                        <h1>Train</h1>
                                    </div>

                                    {/* middle part */}
                                    <div className="flex flex-row items-center">
                                        <div className="size-[20px] bg-[#FFFFFF] border-[1px] border-[#0043CE] rounded-full flex justify-center items-center">
                                            <div className="size-[4px] bg-[#0043CE] rounded-full" />
                                        </div>
                                        <div className="flex flex-col items-center text-[12px] text-[#00000080] font-[500]">
                                            <h1>Colombo to Ella</h1>
                                            <div className="w-full sm:w-[281px] h-[1px] bg-[#0955AC]"></div>
                                            <h1>5 hrs</h1>
                                        </div>
                                        <div className="size-[20px] bg-[#FFFFFF] border-[1px] border-[#0043CE] rounded-full flex justify-center items-center">
                                            <div className="size-[4px] bg-[#0043CE] rounded-full" />
                                        </div>
                                    </div>

                                    {/* right part */}
                                    <div className="flex flex-col justify-center items-center">
                                        <h1 className="text-[25px] font-[600] text-[#000000]">
                                            $90.00
                                        </h1>
                                        <h1 className="text-[12px] text-[#00000080] font-[400]">
                                            10.00 AM - 15.00 PM
                                        </h1>
                                    </div>
                                </div>
                            </div>

                            <div className="-ml-[28px] text-[20px] font-[600] text-[#0955AC] py-10 flex flex-row items-center gap-2">
                                <div className="hidden lg:block w-[60px] h-[1px] bg-[#0955AC]" />
                                <h1>12 Nov - 14 Nov</h1>
                            </div>

                            <div className="w-full md:h-[102px] bg-[#F4F3F3] shadow-2xl rounded-[10px] text-[#0955AC] text-[12px] font-[600] flex flex-col md:flex-row items-center justify-between px-5 py-5">
                                {/* left part */}
                                <div className="relative w-full md:w-[60px] h-[60px] bg-[#0955AC1A] rounded-[10px] flex flex-col justify-center items-center">
                                    <img src={bus} alt="car icon" />
                                    <h1>Bus</h1>
                                </div>

                                {/* middle part */}
                                <div className="flex flex-row items-center">
                                    <div className="size-[20px] bg-[#FFFFFF] border-[1px] border-[#0043CE] rounded-full flex justify-center items-center">
                                        <div className="size-[4px] bg-[#0043CE] rounded-full" />
                                    </div>
                                    <div className="flex flex-col items-center text-[12px] text-[#00000080] font-[500]">
                                        <h1>Colombo to Ella</h1>
                                        <div className="w-full sm:w-[281px] h-[1px] bg-[#0955AC]"></div>
                                        <h1>5 hrs</h1>
                                    </div>
                                    <div className="size-[20px] bg-[#FFFFFF] border-[1px] border-[#0043CE] rounded-full flex justify-center items-center">
                                        <div className="size-[4px] bg-[#0043CE] rounded-full" />
                                    </div>
                                </div>

                                {/* right part */}
                                <div className="flex flex-col justify-center items-center">
                                    <h1 className="text-[25px] font-[600] text-[#000000]">
                                        $90.00
                                    </h1>
                                    <h1 className="text-[12px] text-[#00000080] font-[400]">
                                        10.00 AM - 15.00 PM
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* right side */}
                <div className="xl:col-span-1 flex flex-col gap-5">
                    <div className="h-auto bg-[#F4F3F3] rounded-[10px]">
                        <img src={map} alt="map" className="rounded-[10px]" />
                    </div>
                    <div className=" h-auto bg-[#FAFAFA] shadow-2xl rounded-[12px] py-5">
                        <h1 className="text-[#333843] text-[20px] font-[600] w-full bg-[#E0E2E7] p-5 rounded-t-[12px]">
                            Trip Summary
                        </h1>
                        <div className="flex flex-row justify-between px-5 text-[14px] font-[600] text-[#333843] mt-5">
                            <h1>Total</h1>
                            <h1>$135.00 Incl. VAT</h1>
                        </div>

                        <div className="bg-[#0955AC1A] mx-2 mt-5 rounded-[10px]">
                            <div className="px-5 py-5 flex flex-row gap-2">
                                <div className="flex flex-col">
                                    <div className="size-[12px] bg-[#0955AC] rounded-full" />
                                    <img
                                        src={line}
                                        alt="line"
                                        className="w-[1px] ml-[5px]"
                                    />
                                    <div className="size-[12px] bg-[#0955AC] rounded-full" />
                                    <img
                                        src={line}
                                        alt="line"
                                        className="w-[1px] ml-[5px]"
                                    />
                                    <div className="size-[12px] bg-[#0955AC] rounded-full" />
                                </div>

                                <div className="flex flex-col text-[14px]/[14px] gap-2 font-[600] w-full">
                                    <h1>Car</h1>
                                    <div className="flex flex-row justify-between items-center w-full">
                                        <h1 className="font-[400] text-[#667085]">
                                            Amount
                                        </h1>
                                        <h1 className="font-[500] text-[#333843] text-[14px]">
                                            $90.00
                                        </h1>
                                    </div>

                                    <h1 className="mt-5">Train</h1>
                                    <div className="flex flex-row justify-between items-center w-full">
                                        <h1 className="font-[400] text-[#667085]">
                                            Amount
                                        </h1>
                                        <h1 className="font-[500] text-[#333843] text-[14px]">
                                            $20.00
                                        </h1>
                                    </div>

                                    <h1 className="mt-5">Bus</h1>
                                    <div className="flex flex-row justify-between items-center w-full">
                                        <h1 className="font-[400] text-[#667085]">
                                            Amount
                                        </h1>
                                        <h1 className="font-[500] text-[#333843] text-[14px]">
                                            $15.00
                                        </h1>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-row justify-center items-center gap-5 mt-5">
                            <Link
                                href="/multiModel/available-vehicles"
                                className="md:w-[139px] md:h-[28px] bg-[#0955AC] rounded-[4px] text-[#FFFFFF] text-[10px] font-[700] flex justify-center items-center  cursor-pointer px-2 py-2"
                            >
                                Edit Journey
                            </Link>
                            <Link
                                href="/multiModel/travellerDetails"
                                className="md:w-[139px] md:h-[28px] bg-[#0955AC] rounded-[4px] text-[#FFFFFF] text-[10px] font-[700] flex justify-center items-center cursor-pointer px-2 py-2"
                            >
                                Add Passenger Details
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
