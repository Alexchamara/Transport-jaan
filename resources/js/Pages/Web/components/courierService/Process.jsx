import React from "react";

import calendarIcon from "../../assets/courierService/calendarIcon.png";
import dBox from "../../assets/courierService/dBox.png";
import pac from "../../assets/courierService/pac.png";
import truck from "../../assets/courierService/truck.png";
import delivery from "../../assets/courierService/delivery.png";

const Process = () => {
    return (
        <div className="bg-[#E7E7E7] xl:px-20">
            <div className="flex flex-col justify-center items-center text-[14px]">
                <h1 className="bebas-neue text-[40px]/[130%] font-[400]">
                    OUR <span className="text-[#0955AC]"> DELIVERY</span>{" "}
                    PROCESS
                </h1>
                <p className="text-center text-[14px]/[33px] pb-20 md:pb-0 px-10 md:px-0">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Donec semper eu risus ut ornare. In bibendum <br /> tempus
                    sapien, tristique consectetur purus pellentesque ac
                </p>

                {/* process chart */}
                <div className="relative flex flex-col lg:flex-row w-auto justify-center items-center overflow-visible py-10">
                    <div className="h-[826px] lg:w-[425px] xl:w-[525px] flex flex-col gap-10 justify-center items-center">
                        <div className="absolute lg:top-[180px] lg:left-[60px] xl:left-[10px] xl:top-[70px] flex flex-col gap-5">
                            {" "}
                            {/* 1st card */}
                            <div className="bg-[#FFFFFF] border-[1px] border-[#0000001A] xl:w-[625px] w-auto md:w-[470px] xl:h-[170px] lg:h-[120px] rounded-[24px] p-5 flex">
                                <div className="flex flex-row justify-center items-center gap-5">
                                    <div className="bg-[#F5F5F5] w-[78px] h-[106px] rounded-[16px] flex justify-center items-center p-2">
                                        <img
                                            src={calendarIcon}
                                            className="size-[20px]"
                                        />
                                    </div>
                                    <div className="flex flex-col justify-center items-start">
                                        <h1 className="figtree lg:text-[18px] xl:text-[24px]/[150%] font-[700]">
                                            Booking
                                        </h1>
                                        <p className="poppins font-[400] lg:text-[10px] xl:text-[14px]/[33px] text-justify">
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipiscing elit. Donec
                                            semper eu risus ut ornare. In
                                            bibendum tempus sapien, tristique
                                            consectetur{" "}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* 2nd card */}
                            <div className="bg-[#FFFFFF] border-[1px] border-[#0000001A] w-auto xl:w-[625px] md:w-[470px] xl:h-[170px] lg:h-[120px] rounded-[24px] p-5 flex">
                                <div className="flex flex-row justify-center items-center gap-5">
                                    <div className="bg-[#F5F5F5] w-[57px] h-[106px] rounded-[16px] flex justify-center items-center p-2">
                                        <img
                                            src={pac}
                                            className="size-[20px]"
                                        />
                                    </div>
                                    <div className="flex flex-col justify-center items-start">
                                        <h1 className="figtree lg:text-[18px] xl:text-[24px]/[150%] font-[700]">
                                            Packing
                                        </h1>
                                        <p className="poppins font-[400] lg:text-[10px] xl:text-[14px]/[33px] text-justify">
                                            Book your desired car with just a
                                            few clicks and receive an instant
                                            confirmation via email or SMS.{" "}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* 3rd card */}
                            <div className="bg-[#FFFFFF] border-[1px] border-[#0000001A] xl:w-[625px] md:w-[470px] xl:h-[170px] lg:h-[120px] rounded-[24px] p-5 flex">
                                <div className="flex flex-row justify-center items-center gap-5">
                                    <div className="bg-[#F5F5F5] w-[67px] h-[106px] rounded-[16px] flex justify-center items-center p-2">
                                        <img
                                            src={truck}
                                            className="size-[20px]"
                                        />
                                    </div>
                                    <div className="flex flex-col justify-center items-start">
                                        <h1 className="figtree lg:text-[18px] xl:text-[24px]/[150%] font-[700]">
                                            Transportation
                                        </h1>
                                        <p className="poppins font-[400] lg:text-[10px] xl:text-[14px]/[33px] text-justify">
                                            Pick up your car at the designated
                                            location and enjoy your premium
                                            driving experience with our
                                            top-quality service.{" "}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* 4th card */}
                            <div className="bg-[#FFFFFF] border-[1px] border-[#0000001A] xl:w-[625px] md:w-[470px] xl:h-[170px] lg:h-[120px] rounded-[24px] p-5 flex">
                                <div className="flex flex-row justify-center items-center gap-5">
                                    <div className="bg-[#F5F5F5] w-[78px] h-[106px] rounded-[16px] flex justify-center items-center p-2">
                                        <img
                                            src={delivery}
                                            className="size-[20px]"
                                        />
                                    </div>
                                    <div className="flex flex-col justify-center items-start">
                                        <h1 className="figtree lg:text-[18px] xl:text-[24px]/[150%] font-[700]">
                                            Delivery
                                        </h1>
                                        <p className="poppins font-[400] lg:text-[10px] xl:text-[14px]/[33px] text-justify">
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipiscing elit. Donec
                                            semper eu risus ut ornare. In
                                            bibendum tempus sapien, tristique
                                            consectetur{" "}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex bg-white xl:h-[826px] xl:w-[782px] lg:h-[626px] lg:w-[582px] rounded-[24px] justify-center items-center">
                        <img
                            src={dBox}
                            className="lg:size-[286px] xl:size-[486px] ml-40"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Process;
