import React from "react";
import box from "../../assets/landingPages/box.svg";

const Why = () => {
    return (
        <div>
            <div className="poppins py-10 px-10">
                {/* heading */}
                <div className="flex flex-row justify-center items-center gap-5">
                    <div className="xl:w-[112px] w-[30px] h-[1.8px] bg-[#FF7003]" />
                    <h1 className="text-[#FF7003] text-[20px] xl:text-[40px] font-[600] text-center uppercase">
                        Why choose <br className="block xl:hidden" /> us
                    </h1>
                    <div className="xl:w-[112px] w-[30px] h-[1.8px] bg-[#FF7003]" />
                </div>
                {/* description */}
                <div className="flex justify-center items-center py-10">
                    <p className="text-[12px] xl:text-[17px]/[33px] text-[#F5B7877D] text-center font-[500] xl:w-[937px]">
                        We provide a simple and reliable platform to manage all{" "}
                        <br />
                        your transport and logistics needs in one place.
                    </p>
                </div>

                {/* card section */}
                <div className="py-10 md:px-20 flex flex-col gap-10">
                    {/* 1st row */}
                    <div className="flex lg:flex-row flex-col gap-6 justify-center items-center">
                        {/* card 1 */}
                        <div className="xl:w-[280px] h-[220px] border-[0.2px] border-[#FFFFFF] rounded-[10px] px-5 xl:px-7 py-4 flex flex-col gap-2 shadow-[0px_0px_25px_6px_rgba(255,255,255,0.18)_inset,0px_0px_60px_0px_rgba(255,112,3,0.12)]">
                            <img src={box} className="size-[36px]" />
                            <h1 className="text-[16px] font-[600]">
                                One Platform, Many Services
                            </h1>
                            <p className="text-[10px] xl:text-[11px]/[22px] text-[#FFFFFFA6] font-[500] text-justify">
                                Book land, air, sea, courier, and warehouse
                                services easily through a single, unified
                                digital platform.
                            </p>
                        </div>
                        {/* card 2 */}
                        <div className="xl:w-[280px] h-[220px] border-[1px] border-[#FFFFFF] rounded-[10px] px-5 xl:px-7 py-4 flex flex-col gap-2 shadow-[0px_0px_25px_6px_rgba(255,255,255,0.18)_inset,0px_0px_60px_0px_rgba(255,112,3,0.12)]">
                            <img src={box} className="size-[36px]" />
                            <h1 className="text-[16px] font-[600]">
                                Trusted Service Providers
                            </h1>
                            <p className="text-[10px] xl:text-[11px]/[22px] text-[#FFFFFFA6] font-[500] text-justify">
                                We work only with verified and reliable service
                                providers to ensure safe, secure, and
                                professional logistics solutions.
                            </p>
                        </div>
                        {/* card 3 */}
                        <div className="xl:w-[280px] h-[220px] border-[1px] border-[#FFFFFF] rounded-[10px] px-5 xl:px-7 py-4 flex flex-col gap-2 shadow-[0px_0px_25px_6px_rgba(255,255,255,0.18)_inset,0px_0px_60px_0px_rgba(255,112,3,0.12)]">
                            <img src={box} className="size-[36px]" />
                            <h1 className="text-[16px] font-[600]">
                                Easy Booking Process
                            </h1>
                            <p className="text-[10px] xl:text-[11px]/[22px] text-[#FFFFFFA6] font-[500] text-justify">
                                Search, compare, and book services quickly with
                                clear pricing and a user-friendly booking
                                experience.
                            </p>
                        </div>
                    </div>
                    {/* 2nd row */}
                    <div className="flex lg:flex-row flex-col gap-6 justify-center items-center">
                        {/* card 1 */}
                        <div className="xl:w-[280px] h-[220px] border-[1px] border-[#FFFFFF] rounded-[10px] px-5 xl:px-7 py-4 flex flex-col gap-2 shadow-[0px_0px_25px_6px_rgba(255,255,255,0.18)_inset,0px_0px_60px_0px_rgba(255,112,3,0.12)]">
                            <img src={box} className="size-[36px]" />
                            <h1 className="text-[16px] font-[600]">
                                Real-Time Tracking
                            </h1>
                            <p className="text-[10px] xl:text-[11px]/[22px] text-[#FFFFFFA6] font-[500] text-justify">
                                Track your shipments at every stage and stay
                                updated with live status notifications and
                                alerts
                            </p>
                        </div>
                        {/* card 2 */}
                        <div className="xl:w-[280px] h-[220px] border-[1px] border-[#FFFFFF] rounded-[10px] px-5 xl:px-7 py-4 flex flex-col gap-2 shadow-[0px_0px_25px_6px_rgba(255,255,255,0.18)_inset,0px_0px_60px_0px_rgba(255,112,3,0.12)]">
                            <img src={box} className="size-[36px]" />
                            <h1 className="text-[16px] font-[600]">
                                Secure Payments
                            </h1>
                            <p className="text-[10px] xl:text-[11px]/[22px] text-[#FFFFFFA6] font-[500] text-justify">
                                Make safe online payments with trusted payment
                                gateways and transparent billing at every step.
                            </p>
                        </div>
                        {/* card 3 */}
                        <div className="xl:w-[280px] h-[220px] border-[1px] border-[#FFFFFF] rounded-[10px] px-5 xl:px-7 py-4 flex flex-col gap-2 shadow-[0px_0px_25px_6px_rgba(255,255,255,0.18)_inset,0px_0px_60px_0px_rgba(255,112,3,0.12)]">
                            <img src={box} className="size-[36px]" />
                            <h1 className="text-[16px] font-[600]">
                                Business-Friendly Solutions
                            </h1>
                            <p className="text-[10px] xl:text-[11px]/[22px] text-[#FFFFFFA6] font-[500] text-justify">
                                Flexible options designed to support
                                individuals, small businesses, and large
                                enterprises efficiently.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Why;
