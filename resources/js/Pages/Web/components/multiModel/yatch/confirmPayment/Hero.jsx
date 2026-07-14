import React from "react";
import tick from "../../../../assets/multiModel/confirmPayment/tick.svg";
import download from "../../../../assets/multiModel/confirmPayment/download.svg";
import { Link } from "@inertiajs/react";

const Hero = () => {
    return (
        <div className="md:px-10 md:py-10 p-5">
            <div>
                <h1 className="bebas-neue text-4xl md:text-5xl lg:text-6xl leading-tight">
                    booking <span className="text-[#0955AC]">confirmation</span>{" "}
                </h1>
                <h3 className="text-sm md:text-base font-medium text-[#00000080]">
                    Review your booking
                </h3>
            </div>
            <div className="grid xl:grid-cols-2 grid-cols-1 gap-6 md:gap-10 mt-5 poppins">
                {/* left side */}
                <div className="w-full min-h-[500px] md:h-[557px] bg-[#F4F3F3] rounded-[20px] p-5 flex flex-col items-center justify-between">
                    <div className="flex flex-col items-center w-full">
                        <div className="size-[60px] md:size-[80px] bg-[#DCFCE7] rounded-full flex justify-center items-center">
                            <img
                                src={tick}
                                className="w-6 h-6 md:w-[48px] md:h-[48px]"
                            />
                        </div>
                        <h1 className="text-lg md:text-xl lg:text-2xl font-normal mt-2 text-center">
                            Payment Successful!
                        </h1>
                        <h3 className="text-sm md:text-base font-normal text-[#4A5565] text-center">
                            Your booking has been confirmed
                        </h3>

                        <div className="w-full min-h-[150px] md:h-[170px] bg-[#EFF6FF] border border-[#BEDBFF] rounded-[16px] p-4 md:p-5 text-xs md:text-sm text-[#364153] mt-6 md:mt-10">
                            <h1 className="text-[#0A0A0A] text-sm md:text-base font-normal">
                                Important Information
                            </h1>

                            <div className="flex flex-col gap-2 mt-3">
                                <div className="flex flex-row gap-2 justify-start items-start">
                                    <div className="size-[5px] bg-[#155DFC] rounded-full mt-1.5 flex-shrink-0"></div>
                                    <h1>
                                        Please arrive at least 30 minutes before
                                        departure time
                                    </h1>
                                </div>
                                <div className="flex flex-row gap-2 justify-start items-start">
                                    <div className="size-[5px] bg-[#155DFC] rounded-full mt-1.5 flex-shrink-0"></div>
                                    <h1>
                                        Carry a valid ID proof along with this
                                        booking confirmation
                                    </h1>
                                </div>
                                <div className="flex flex-row gap-2 justify-start items-start">
                                    <div className="size-[5px] bg-[#155DFC] rounded-full mt-1.5 flex-shrink-0"></div>
                                    <h1>
                                        Free cancellation available up to 24
                                        hours before departure
                                    </h1>
                                </div>
                                <div className="flex flex-row gap-2 justify-start items-start">
                                    <div className="size-[5px] bg-[#155DFC] rounded-full mt-1.5 flex-shrink-0"></div>
                                    <h1>
                                        Contact customer service for any changes
                                        to your booking
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 justify-center items-center w-full mt-6">
                        <div className="w-full  h-[50px] border border-[#D1D5DC] rounded-[10px] flex flex-row justify-center items-center cursor-pointer gap-3 md:gap-5">
                            <img
                                src={download}
                                className="w-4 h-4 md:w-5 md:h-5"
                            />
                            <h1 className="text-sm md:text-base">
                                Download Ticket
                            </h1>
                        </div>
                        <Link
                            href="/multiModel/available-vehicles"
                            className="w-full  h-[50px] bg-[#0955AC] rounded-[10px] flex flex-row justify-center items-center cursor-pointer text-[#FFFFFF]"
                        >
                            <h1 className="text-sm md:text-base">
                                Return to Home
                            </h1>
                        </Link>
                    </div>
                </div>
                {/* right side */}
                <div className="w-full min-h-[500px] md:h-[557px] bg-[#F4F3F3] rounded-[20px] text-[#0A0A0A] p-5 md:p-10 flex flex-col">
                    <div className="flex flex-col md:flex-row justify-between w-full items-start md:items-center text-sm md:text-base pb-2 border-b border-[#E5E7EB] gap-4">
                        <div className="flex flex-col">
                            <h1 className="text-[#4A5565]">
                                Booking Reference
                            </h1>
                            <h1 className="text-lg md:text-2xl">BKG4HF3HA5U</h1>
                        </div>
                        <div className="w-full md:w-[97px] h-[36px] bg-[#DCFCE7] rounded-[10px] flex justify-center items-center text-[#008236] cursor-pointer text-sm md:text-base py-2 px-4">
                            <h1>Confirmed</h1>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-6 md:mt-10 gap-4">
                        <div className="flex flex-col">
                            <h1 className="text-[#4A5565] text-xs md:text-sm">
                                Service
                            </h1>
                            <h1 className="text-sm md:text-base">
                                SEA PEARL LUXURY YACHT
                            </h1>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-[#4A5565] text-xs md:text-sm">
                                Route
                            </h1>
                            <h1 className="text-sm md:text-base">
                                Colombo Harbor → Trincomalee Harbor
                            </h1>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-6 md:mt-10 gap-4">
                        <div className="flex flex-col">
                            <h1 className="text-[#4A5565] text-xs md:text-sm">
                                Date & Time
                            </h1>
                            <h1 className="text-sm md:text-base">
                                02 / 07 / 2025 - 07:00 AM
                            </h1>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-[#4A5565] text-xs md:text-sm">
                                Class
                            </h1>
                            <h1 className="text-sm md:text-base">Luxury Charter</h1>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between pb-5 pt-5 border-b border-t border-[#E5E7EB] items-start md:items-center mt-10 md:mt-[130px] gap-4">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-[#4A5565] text-sm md:text-[14px]">
                                Base Price
                            </h1>
                            <h1 className="text-[#4A5565] text-sm md:text-[14px]">
                                Service Fee
                            </h1>
                        </div>
                        <div className="flex flex-col gap-2 items-start md:items-end">
                            <h1 className="text-sm md:text-[14px]">Rs 1500</h1>
                            <h1 className="text-sm md:text-[14px]">Rs 26</h1>
                        </div>
                    </div>

                    <div className="flex flex-row justify-between items-center mt-1">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-base md:text-[16px]">Total Paid</h1>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                            <h1 className="text-lg md:text-[16px]">Rs 876</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-xs md:text-[14px] font-[400] flex flex-col justify-center items-center mt-10 poppins gap-2">
                <h1 className="text-[#4A5565]">Need help with your booking?</h1>
                <h1 className="text-[#155DFC]">
                    Call Customer Support: +94 11 234 5678
                </h1>
            </div>
        </div>
    );
};

export default Hero;
