import React from "react";
import bg1 from "../../../assets/landingPages/blog/bg1.svg";
import bg2 from "../../../assets/landingPages/blog/bg2.svg";

import admin from "../../../assets/landingPages/blog/admin.svg";
import calendar from "../../../assets/landingPages/blog/calendar.svg";
import clock from "../../../assets/landingPages/blog/clock.svg";

const Hero = () => {
    return (
        <div className="flex md:flex-row flex-col">
            <div
                className="w-full h-[594px] bg-cover bg-center flex flex-col justify-end items-start px-20 py-10"
                style={{ backgroundImage: `url(${bg1})` }}
            >
                <div className="w-[114px] h-[26px] bg-[#286BB6] rounded-[3px] flex justify-center items-center text-[11px] font-[600] cursor-pointer">
                    Ticket Bookings
                </div>
                <div className="flex flex-col gap-5 py-5">
                    <p className="text-[27px]/[46px] font-[600]">
                        Lorem ipsum dolor sit amet, consectetur <br /> Lorem
                        ipsum dolor sit.
                    </p>
                    <p className="text-[12px]/[23px] font-[400]">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Donec semper eu risus ut ornare. In <br /> bibendum
                        tempus sapien, tristique consectetu
                    </p>
                </div>
                <div className="flex md:flex-row justify-center items-start flex-col gap-5 uppercase text-[13px] font-[600]">
                    <div className="flex flex-row gap-2 justify-center items-center">
                        <img src={admin} />
                        <h1>by Admin</h1>
                    </div>
                    <div className="flex flex-row gap-2 justify-center items-center">
                        <img src={calendar} />
                        <h1>27 August, 2024</h1>
                    </div>
                    <div className="flex flex-row gap-2 justify-center items-center">
                        <img src={clock} />
                        <h1>20 Mins</h1>
                    </div>
                </div>
            </div>
            <div
                className="w-full h-[594px] bg-cover bg-center flex flex-col justify-end items-start px-20 py-10"
                style={{ backgroundImage: `url(${bg2})` }}
            >
                <div className="w-[114px] h-[26px] bg-[#286BB6] rounded-[3px] flex justify-center items-center text-[11px] font-[600] cursor-pointer">
                    Car Rental
                </div>
                <div className="flex flex-col gap-5 py-5">
                    <p className="text-[27px]/[46px] font-[600]">
                        Lorem ipsum dolor sit amet, consectetur <br /> Lorem
                        ipsum dolor sit.
                    </p>
                    <p className="text-[12px]/[23px] font-[400]">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Donec semper eu risus ut ornare. In <br /> bibendum
                        tempus sapien, tristique consectetu
                    </p>
                </div>
                <div className="flex md:flex-row justify-center items-start flex-col gap-5 uppercase text-[13px] font-[600]">
                    <div className="flex flex-row gap-2 justify-center items-center">
                        <img src={admin} />
                        <h1>by Admin</h1>
                    </div>
                    <div className="flex flex-row gap-2 justify-center items-center">
                        <img src={calendar} />
                        <h1>27 August, 2024</h1>
                    </div>
                    <div className="flex flex-row gap-2 justify-center items-center">
                        <img src={clock} />
                        <h1>20 Mins</h1>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
