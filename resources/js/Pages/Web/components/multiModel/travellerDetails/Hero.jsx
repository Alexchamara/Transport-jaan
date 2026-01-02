import React, { useState, useEffect } from "react";
import car from "../../../assets/multiModel/reviewJourney/miniCar.svg";
import bus from "../../../assets/multiModel/reviewJourney/miniBus.svg";
import tram from "../../../assets/multiModel/reviewJourney/miniTram.svg";

import { Link } from "@inertiajs/react";

import map from "../../../assets/multiModel/reviewJourney/map.svg";

import line from "../../../assets/multiModel/reviewJourney/line.svg";

import plus from "../../../assets/multiModel/travellerDetails/plus.svg";

import trash from "../../../assets/multiModel/travellerDetails/trash.svg";

import bg from "../../../assets/multiModel/bg.png";
import bg2 from "../../../assets/multiModel/bg2.jpg";
import bg3 from "../../../assets/multiModel/bg3.jpg";
import bg4 from "../../../assets/multiModel/bg4.jpg";
import bg5 from "../../../assets/multiModel/bg5.jpg";
import bg6 from "../../../assets/multiModel/bg6.jpg";

const HERO_BACKGROUNDS = [bg, bg2, bg3, bg4, bg5, bg6];

const Hero = () => {
    const [activeBgIndex, setActiveBgIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveBgIndex((prev) => (prev + 1) % HERO_BACKGROUNDS.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="px-10 py-10">
            <div className="grid xl:grid-cols-3 grid-cols-1 gap-10">
                {/* left side */}
                <div className="xl:col-span-2">
                    <div>
                        <h1 className="bebas-neue text-[50px]/[100%]">
                            Passenger{" "}
                            <span className="text-[#0955AC]">Information</span>{" "}
                        </h1>
                        <h3 className="text-[14px] font-[500] text-[#00000080]">
                            Your info powers every step of your journey.
                        </h3>
                    </div>

                    <div className="mt-10 flex flex-col gap-10">
                        <div className="w-full min-h-[305px] shadow-lg bg-[#F4F3F3] rounded-[10px] px-5 md:px-10 py-5">
                            <h1 className="text-[20px] font-[700]">
                                Lead Passenger
                            </h1>
                            <p className="text-[10px] font-[500] text-[#00000080]">
                                This person will be the main contact for the
                                booking and will receive all travel updates.
                            </p>

                            <div className="poppins flex flex-col gap-3 mt-3">
                                <div className="flex flex-col md:flex-row justify-between gap-5 md:gap-10">
                                    <div className="flex flex-col w-full">
                                        <label className="text-[10px]/[24px] font-[600]">
                                            First Name:
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full xl:w-[350px] xl:h-[50px] border border-[#C4C4C4] rounded-[5px] px-3 placeholder:text-[#00000033] placeholder:text-[12px]"
                                            placeholder="Enter first name"
                                        />
                                    </div>
                                    <div className="flex flex-col w-full">
                                        <label className="text-[10px]/[24px] font-[600]">
                                            Last Name:
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full xl:w-[350px] xl:h-[50px] border border-[#C4C4C4] rounded-[5px] px-3 placeholder:text-[#00000033] placeholder:text-[12px]"
                                            placeholder="Enter last name"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row justify-between gap-5 md:gap-10">
                                    <div className="flex flex-col w-full">
                                        <label className="text-[10px]/[24px] font-[600]">
                                            Email Address:
                                        </label>
                                        <input
                                            type="email"
                                            className="w-full xl:w-[350px] xl:h-[50px] border border-[#C4C4C4] rounded-[5px] px-3 placeholder:text-[#00000033] placeholder:text-[12px]"
                                            placeholder="Enter email address"
                                        />
                                    </div>
                                    <div className="flex flex-col w-full">
                                        <label className="text-[10px]/[24px] font-[600]">
                                            Phone Number:
                                        </label>
                                        <div className="flex flex-row w-full">
                                            <input
                                                type="text"
                                                className="w-[35px] md:w-[65px] xl:h-[50px] border border-[#C4C4C4] rounded-[5px] px-3 placeholder:text-[#00000033] placeholder:text-[12px] mr-3"
                                                placeholder="+1"
                                            />

                                            <input
                                                type="text"
                                                className="w-full xl:w-[273px] xl:h-[50px] border border-[#C4C4C4] rounded-[5px] px-3 placeholder:text-[#00000033] placeholder:text-[12px]"
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full min-h-[181px] shadow-lg bg-[#F4F3F3] rounded-[10px] px-5 md:px-10 py-5">
                            <div className="flex flex-col md:flex-row md:justify-between items-start gap-3">
                                <h1 className="text-[20px] font-[700]">
                                    Additional Passenger
                                </h1>
                                <div className="flex flex-row justify-center items-center gap-1">
                                    <img src={trash} className="size-[12px]" />
                                    <h1 className="text-[#FF0000] font-[700] text-[12px]">
                                        Remove
                                    </h1>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row justify-between gap-5 md:gap-10 poppins mt-5">
                                <div className="flex flex-col w-full">
                                    <label className="text-[10px]/[24px] font-[600]">
                                        First Name:
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full xl:w-[360px] h-[50px] border border-[#C4C4C4] rounded-[5px] px-3 placeholder:text-[#00000033] placeholder:text-[12px]"
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div className="flex flex-col w-full">
                                    <label className="text-[10px]/[24px] font-[600]">
                                        Last Name:
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full xl:w-[360px] h-[50px] border border-[#C4C4C4] rounded-[5px] px-3 placeholder:text-[#00000033] placeholder:text-[12px]"
                                        placeholder="Enter last name"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="xl:w-[259px] shadow-lg xl:min-h-[44px] bg-[#0955AC] rounded-[4px] text-[16px] text-[#FFFFFF] font-[700] flex items-center justify-center gap-2 cursor-pointer px-4 py-2">
                            <img src={plus} />
                            <h1>Add another passenger</h1>
                        </div>

                        <Link
                            href="/multiModel/payment"
                            className="w-full shadow-lg xl:min-h-[49px] bg-[#0955AC] rounded-[4px] text-[16px] text-[#FFFFFF] font-[700] flex items-center justify-center gap-2 cursor-pointer px-4 py-2"
                        >
                            Continue to Payment
                        </Link>
                    </div>
                </div>
                {/* right side */}
                <div className="xl:col-span-1 flex flex-col gap-5">
                    <div className="relative shadow-lg overflow-hidden h-[300px] bg-[#F4F3F3] rounded-[10px] flex flex-col justify-between items-center px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-10 sm:py-14 lg:py-[90px]">
                        {HERO_BACKGROUNDS.map((bgImage, idx) => (
                            <div
                                key={idx}
                                className={`absolute inset-0 bg-cover shadow-lg bg-center transition-opacity duration-1000 ease-in-out rounded-[10px] ${
                                    idx === activeBgIndex
                                        ? "opacity-100"
                                        : "opacity-0"
                                }`}
                                style={{
                                    backgroundImage: `url(${bgImage})`,
                                }}
                            />
                        ))}
                        <div className="pointer-events-none absolute inset-0 h-full w-full bg-black/50 rounded-[10px] z-10" />

                        <div className="hidden lg:flex flex-col gap-2 absolute right-5 top-1/2 transform -translate-y-1/2 z-20">
                            {HERO_BACKGROUNDS.map((_, idx) => {
                                const isActiveBg = idx === activeBgIndex;
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setActiveBgIndex(idx)}
                                        className={
                                            "transition-all duration-200 rounded-full " +
                                            (isActiveBg
                                                ? "size-[12px] bg-[#0955AC]"
                                                : "size-[12px] bg-[#D9D9D9]/70 hover:bg-white/80")
                                        }
                                    />
                                );
                            })}
                        </div>
                    </div>

                    <div className="h-auto bg-[#FAFAFA] shadow-lg rounded-[12px] py-5">
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
                            <div className="md:w-[139px] md:h-[28px] bg-[#0955AC] rounded-[4px] text-[#FFFFFF] text-[10px] font-[700] flex justify-center items-center  cursor-pointer px-2 py-2">
                                Edit Journey
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
