import React from "react";

import card1 from "../../assets/landingPages/servicesCards/img1.svg";
import card2 from "../../assets/landingPages/servicesCards/img2.svg";
import card3 from "../../assets/landingPages/servicesCards/img3.svg";
import card4 from "../../assets/landingPages/servicesCards/img4.svg";
import card5 from "../../assets/landingPages/servicesCards/img5.svg";
import card6 from "../../assets/multiModel/bg2.jpg";
import rightArrow from "../../assets/landingPages/servicesCards/rightArrow.svg";

import monostone from "../../assets/landingPages/servicesCards/monostone.svg";

const Service = () => {
    return (
        <div className="poppins py-10">
            <div className="flex flex-row justify-center items-center gap-5">
                <div className="md:w-[112px] w-[30px] h-[1.8px] bg-[#FF7003]" />
                <h1 className="text-[#FF7003] text-[20px] xl:text-[40px] font-[600] uppercase">
                    Services
                </h1>
                <div className="md:w-[112px] w-[30px] h-[1.8px] bg-[#FF7003]" />
            </div>
            <div className="flex lg:flex-row flex-col justify-center items-center pt-10">
                {/* Card 1 */}
                <div
                    className="w-[305px] h-[740px] relative group overflow-hidden"
                    onClick={() => (window.location.href = "/clientRent")}
                >
                    {/* Background image */}
                    <img src={card1} className="w-full h-full object-cover" />

                    {/* Default (non-hover) content */}
                    <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-end items-start px-10 py-20 z-10 transition-opacity duration-300 group-hover:opacity-0">
                        <h1 className="text-[40px] text-[#DF6203] font-[600]">
                            01
                        </h1>
                        <h1 className="text-[21px] font-[600]">
                            Vehicle Rental
                        </h1>
                        <div className="size-[38px] bg-[#D9D9D982] rounded-full flex justify-center items-center cursor-pointer mt-20">
                            <img src={rightArrow} />
                        </div>
                    </div>

                    {/* Hover content */}
                    <div className="absolute top-0 left-0 w-full h-full translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20 overflow-hidden">
                        {/* Colored background layer */}
                        <div className="absolute top-0 left-0 w-full h-full bg-[#D9D9D9] bg-opacity-90 z-0" />

                        {/* Monostone overlay image — FULL cover */}
                        <img
                            src={monostone}
                            alt="Overlay"
                            className="absolute top-0 left-0 w-full h-full object-cover z-0 pointer-events-none opacity-20"
                        />

                        {/* Foreground content */}
                        <div className="relative z-10 flex flex-col justify-end items-center h-full px-10 py-20">
                            <div className="text-[#0955AC]">
                                <h1 className="text-[40px] text-[#DF6203] font-[600]">
                                    01
                                </h1>
                                <h1 className="text-[21px] font-[600] mt-5">
                                    Vehicle Rental
                                </h1>
                                <p className="text-[12px]/[33px] font-[500] text-justify">
                                    Book cars, vans, and trucks easily for
                                    personal or business use with flexible
                                    rental options and trusted service
                                    providers.
                                </p>
                                <div className="size-[38px] bg-[#0955AC87] rounded-full flex justify-center items-center cursor-pointer mt-10">
                                    <img src={rightArrow} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Card 2 */}
                <div
                    className="w-[305px] h-[740px] relative group overflow-hidden"
                    onClick={() => (window.location.href = "/flight-booking")}
                >
                    {/* Background image */}
                    <img src={card2} className="w-full h-full object-cover" />

                    {/* Default (non-hover) content */}
                    <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-end items-start px-10 py-20 z-10 transition-opacity duration-300 group-hover:opacity-0">
                        <h1 className="text-[40px] text-[#DF6203] font-[600]">
                            02
                        </h1>
                        <h1 className="text-[21px] font-[600]">
                            Ticket Booking
                        </h1>
                        <div className="size-[38px] bg-[#D9D9D982] rounded-full flex justify-center items-center cursor-pointer mt-20">
                            <img src={rightArrow} />
                        </div>
                    </div>

                    {/* Hover content */}
                    <div className="absolute top-0 left-0 w-full h-full translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20 overflow-hidden">
                        {/* Colored background layer */}
                        <div className="absolute top-0 left-0 w-full h-full bg-[#D9D9D9] bg-opacity-90 z-0" />

                        {/* Monostone overlay image — FULL cover */}
                        <img
                            src={monostone}
                            alt="Overlay"
                            className="absolute top-0 left-0 w-full h-full object-cover z-0 pointer-events-none opacity-20"
                        />

                        {/* Foreground content */}
                        <div className="relative z-10 flex flex-col justify-end items-center h-full px-10 py-20">
                            <div className="text-[#0955AC]">
                                <h1 className="text-[40px] text-[#DF6203] font-[600]">
                                    02
                                </h1>
                                <h1 className="text-[21px] font-[600] mt-5">
                                    Ticket Booking
                                </h1>
                                <p className="text-[12px]/[33px] font-[500] text-justify">
                                    Book land, air, and sea travel tickets
                                    quickly with clear pricing, secure payments,
                                    and instant booking confirmation.
                                </p>
                                <div className="size-[38px] bg-[#0955AC87] rounded-full flex justify-center items-center cursor-pointer mt-10">
                                    <img src={rightArrow} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Card 3 */}
                {/* <div
                    className="w-[305px] h-[740px] relative group overflow-hidden"
                    onClick={() => (window.location.href = "/courier-service")}
                > */}
                <div
                    className="w-[305px] h-[740px] relative group overflow-hidden"
                    onClick={() => (window.location.href = "/couriers/create")}
                >
                    {/* Background image */}
                    <img src={card3} className="w-full h-full object-cover" />

                    {/* Default (non-hover) content */}
                    <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-end items-start px-10 py-20 z-10 transition-opacity duration-300 group-hover:opacity-0">
                        <h1 className="text-[40px] text-[#DF6203] font-[600]">
                            03
                        </h1>
                        <h1 className="text-[21px] font-[600]">
                            Courier booking
                        </h1>
                        <div className="size-[38px] bg-[#D9D9D982] rounded-full flex justify-center items-center cursor-pointer mt-20">
                            <img src={rightArrow} />
                        </div>
                    </div>

                    {/* Hover content */}
                    <div className="absolute top-0 left-0 w-full h-full translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20 overflow-hidden">
                        {/* Colored background layer */}
                        <div className="absolute top-0 left-0 w-full h-full bg-[#D9D9D9] bg-opacity-90 z-0" />

                        {/* Monostone overlay image — FULL cover */}
                        <img
                            src={monostone}
                            alt="Overlay"
                            className="absolute top-0 left-0 w-full h-full object-cover z-0 pointer-events-none opacity-20"
                        />

                        {/* Foreground content */}
                        <div className="relative z-10 flex flex-col justify-end items-center h-full px-10 py-20">
                            <div className="text-[#0955AC]">
                                <h1 className="text-[40px] text-[#DF6203] font-[600]">
                                    03
                                </h1>
                                <h1 className="text-[21px] font-[600] mt-5">
                                    Courier booking
                                </h1>
                                <p className="text-[12px]/[33px] font-[500] text-justify">
                                    Send documents and parcels locally or
                                    through international routes with fast pickup, reliable
                                    delivery, and real-time tracking.
                                </p>
                                <div className="size-[38px] bg-[#0955AC87] rounded-full flex justify-center items-center cursor-pointer mt-10">
                                    <img src={rightArrow} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Card 4 */}
                <div
                    className="w-[305px] h-[740px] relative group overflow-hidden"
                    onClick={() => (window.location.href = "/warehouseList")}
                >
                    {/* Background image */}
                    <img src={card4} className="w-full h-full object-cover" />

                    {/* Default (non-hover) content */}
                    <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-end items-start px-10 py-20 z-10 transition-opacity duration-300 group-hover:opacity-0">
                        <h1 className="text-[40px] text-[#DF6203] font-[600]">
                            04
                        </h1>
                        <h1 className="text-[21px] font-[600]">
                            Warehouse booking
                        </h1>
                        <div className="size-[38px] bg-[#D9D9D982] rounded-full flex justify-center items-center cursor-pointer mt-20">
                            <img src={rightArrow} />
                        </div>
                    </div>

                    {/* Hover content */}
                    <div className="absolute top-0 left-0 w-full h-full translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20 overflow-hidden">
                        {/* Colored background layer */}
                        <div className="absolute top-0 left-0 w-full h-full bg-[#D9D9D9] bg-opacity-90 z-0" />

                        {/* Monostone overlay image — FULL cover */}
                        <img
                            src={monostone}
                            alt="Overlay"
                            className="absolute top-0 left-0 w-full h-full object-cover z-0 pointer-events-none opacity-20"
                        />

                        {/* Foreground content */}
                        <div className="relative z-10 flex flex-col justify-end items-center h-full px-10 py-20">
                            <div className="text-[#0955AC]">
                                <h1 className="text-[40px] text-[#DF6203] font-[600]">
                                    04
                                </h1>
                                <h1 className="text-[21px] font-[600] mt-5">
                                    Warehouse booking
                                </h1>
                                <p className="text-[12px]/[33px] font-[500] text-justify">
                                    Reserve safe and flexible warehouse space
                                    for short-term or long-term storage based on
                                    your business needs.
                                </p>
                                <div className="size-[38px] bg-[#0955AC87] rounded-full flex justify-center items-center cursor-pointer mt-10">
                                    <img src={rightArrow} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Card 5 */}
                <div
                    className="w-[305px] h-[740px] relative group overflow-hidden"
                    onClick={() => (window.location.href = "/freight-home")}
                >
                    {/* Background image */}
                    <img src={card5} className="w-full h-full object-cover" />

                    {/* Default (non-hover) content */}
                    <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-end items-start px-10 py-20 z-10 transition-opacity duration-300 group-hover:opacity-0">
                        <h1 className="text-[40px] text-[#DF6203] font-[600]">
                            05
                        </h1>
                        <h1 className="text-[21px] font-[600]">
                            Freight Module
                        </h1>
                        <div className="size-[38px] bg-[#D9D9D982] rounded-full flex justify-center items-center cursor-pointer mt-20">
                            <img src={rightArrow} />
                        </div>
                    </div>

                    {/* Hover content */}
                    <div className="absolute top-0 left-0 w-full h-full translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20 overflow-hidden">
                        {/* Colored background layer */}
                        <div className="absolute top-0 left-0 w-full h-full bg-[#D9D9D9] bg-opacity-90 z-0" />

                        {/* Monostone overlay image — FULL cover */}
                        <img
                            src={monostone}
                            alt="Overlay"
                            className="absolute top-0 left-0 w-full h-full object-cover z-0 pointer-events-none opacity-20"
                        />

                        {/* Foreground content */}
                        <div className="relative z-10 flex flex-col justify-end items-center h-full px-10 py-20">
                            <div className="text-[#0955AC]">
                                <h1 className="text-[40px] text-[#DF6203] font-[600]">
                                    05
                                </h1>
                                <h1 className="text-[21px] font-[600] mt-5">
                                    Freight Module
                                </h1>
                                <p className="text-[12px]/[33px] font-[500] text-justify">
                                    Manage freight shipments efficiently with
                                    transparent pricing, multiple transport
                                    options, and end-to-end shipment visibility.
                                </p>
                                <div className="size-[38px] bg-[#0955AC87] rounded-full flex justify-center items-center cursor-pointer mt-10">
                                    <img src={rightArrow} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 6 */}
                <div
                    className="w-[305px] h-[740px] relative group overflow-hidden"
                    onClick={() => (window.location.href = "/multimodal")}
                >
                    {/* Background image */}
                    <img src={card6} className="w-full h-full object-cover" />

                    {/* Default (non-hover) content */}
                    <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-end items-start px-10 py-20 z-10 transition-opacity duration-300 group-hover:opacity-0">
                        <h1 className="text-[40px] text-[#DF6203] font-[600]">
                            06
                        </h1>
                        <h1 className="text-[21px] font-[600]">Multimodal</h1>
                        <div className="size-[38px] bg-[#D9D9D982] rounded-full flex justify-center items-center cursor-pointer mt-20">
                            <img src={rightArrow} />
                        </div>
                    </div>

                    {/* Hover content */}
                    <div className="absolute top-0 left-0 w-full h-full translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20 overflow-hidden">
                        {/* Colored background layer */}
                        <div className="absolute top-0 left-0 w-full h-full bg-[#D9D9D9] bg-opacity-90 z-0" />

                        {/* Monostone overlay image — FULL cover */}
                        <img
                            src={monostone}
                            alt="Overlay"
                            className="absolute top-0 left-0 w-full h-full object-cover z-0 pointer-events-none opacity-20"
                        />

                        {/* Foreground content */}
                        <div className="relative z-10 flex flex-col justify-end items-center h-full px-10 py-20">
                            <div className="text-[#0955AC]">
                                <h1 className="text-[40px] text-[#DF6203] font-[600]">
                                    06
                                </h1>
                                <h1 className="text-[21px] font-[600] mt-5">
                                    Multimodal
                                </h1>
                                <p className="text-[12px]/[33px] font-[500] text-justify">
                                    Combine land, air, and sea transport into
                                    one optimized booking for faster delivery
                                    and cost-effective logistics solutions.
                                </p>
                                <div className="size-[38px] bg-[#0955AC87] rounded-full flex justify-center items-center cursor-pointer mt-10">
                                    <img src={rightArrow} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Service;
