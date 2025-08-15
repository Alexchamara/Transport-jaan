import React from "react";
import truckIcon from "../../assets/courierService/truckIcon.png";
import secIcon from "../../assets/courierService/secIcon.png";
import headphoneIcon from "../../assets/courierService/headphoneIcon.png";

import dDoor from "../../assets/courierService/dDoor.png";

const WhyOurService = () => {
    return (
        <div className="bg-[#E7E7E7] py-10 px-20">
            <div className="flex flex-col justify-center items-center">
                <h1 className="bebas-neue font-[400] text-[40px] py-20 px-5">
                    Why <span className="text-[#0955AC]"> should </span> you{" "}
                    <span className="text-[#0955AC]">choose </span> our{" "}
                    <span className="text-[#0955AC]">service</span>
                </h1>
                {/* All three cards */}
                <div className="flex flex-col md:flex-row gap-20 justify-center items-center poppins text-[10px]/[28px] xl:text-[12px]/[33px]">
                    {/* card one */}
                    <div className="xl:w-[362px] h-auto xl:h-[468px] border-[1px] rounded-[8px] bg-[#F5F5F5] border-[#0955AC] py-10 px-5 text-justify flex flex-col items-center">
                        <div className="flex flex-row justify-center items-center gap-5">
                            <div className="size-[50px] xl:size-[60px] rounded-full bg-[#0955AC] flex justify-center items-center">
                                <img
                                    src={truckIcon}
                                    className="w-[30px] h-[30px]"
                                />
                            </div>
                            <h1 className="bebas-neue text-[20px]/[45px] xl:text-[31px]/[58px] font-[400]">
                                Transport pricing
                            </h1>
                        </div>
                        <p className="py-5 px-5">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Donec semper eu risus ut ornare. In bibendum
                            tempus sapien, tristique consectetur purus
                            pellentesque ac. Quisque facilisis laoreet feugiat.
                            Sed dapibus volutpat ex, eget iaculis nunc tincidunt
                            sit amet. Quisque congue sapien nec aliquet
                            faucibus. Morbi lectus eros, accumsan eget malesuada
                            et, fermentum eget nisl. Fusce vel placerat libero.
                            Integer convallis sodales libero, vitae tristique
                            massa hendrerit in.
                        </p>
                    </div>
                    {/* card two */}
                    <div className="xl:w-[362px] h-auto xl:h-[468px] border-[1px] rounded-[8px] bg-[#FFFFFF] border-[#0955AC] py-10 px-5 text-justify flex flex-col items-center">
                        <div className="flex flex-row justify-center items-center gap-5">
                            <div className="size-[50px] xl:size-[60px] rounded-full bg-[#0955AC] flex justify-center items-center">
                                <img
                                    src={secIcon}
                                    className="w-[30px] h-[30px]"
                                />
                            </div>
                            <h1 className="bebas-neue text-[20px]/[45px] xl:text-[31px]/[58px] font-[400]">
                                Security for Package
                            </h1>
                        </div>
                        <p className="py-5 px-5">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Donec semper eu risus ut ornare. In bibendum
                            tempus sapien, tristique consectetur purus
                            pellentesque ac. Quisque facilisis laoreet feugiat.
                            Sed dapibus volutpat ex, eget iaculis nunc tincidunt
                            sit amet. Quisque congue sapien nec aliquet
                            faucibus. Morbi lectus eros, accumsan eget malesuada
                            et, fermentum eget nisl. Fusce vel placerat libero.
                            Integer convallis sodales libero, vitae tristique
                            massa hendrerit in.
                        </p>
                    </div>
                    {/* card three */}
                    <div className="xl:w-[362px] h-auto xl:h-[468px] border-[1px] rounded-[8px] bg-[#FFFFFF] border-[#0955AC] py-10 px-5 text-justify flex flex-col items-center">
                        <div className="flex flex-row justify-center items-center gap-5">
                            <div className="size-[50px] xl:size-[60px] rounded-full bg-[#0955AC] flex justify-center items-center">
                                <img
                                    src={headphoneIcon}
                                    className="w-[30px] h-[30px]"
                                />
                            </div>
                            <h1 className="bebas-neue text-[20px]/[45px] xl:text-[31px]/[58px] font-[400]">
                                Customer Service 24/7
                            </h1>
                        </div>
                        <p className="py-5 px-5">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Donec semper eu risus ut ornare. In bibendum
                            tempus sapien, tristique consectetur purus
                            pellentesque ac. Quisque facilisis laoreet feugiat.
                            Sed dapibus volutpat ex, eget iaculis nunc tincidunt
                            sit amet. Quisque congue sapien nec aliquet
                            faucibus. Morbi lectus eros, accumsan eget malesuada
                            et, fermentum eget nisl. Fusce vel placerat libero.
                            Integer convallis sodales libero, vitae tristique
                            massa hendrerit in.
                        </p>
                    </div>
                </div>
                {/* end of three cards */}

                <div className="flex flex-row justify-center items-center py-20 gap-12 xl:gap-28">
                    <img className="hidden md:block" src={dDoor} />

                    <div className="poppins text-[14px]/[33px] font-[400] text-justify">
                        <h1 className="bebas-neue text-[40px]/[58px]">
                            our{" "}
                            <span className="text-[#0955AC]">
                                delivery service
                            </span>{" "}
                            at your{" "}
                            <span className="text-[#0955AC]">doorstep</span>{" "}
                        </h1>
                        <p className="py-10 xl:w-[538px]">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Donec semper eu risus ut ornare. In bibendum
                            tempus sapien, tristique consectetur purus
                            pellentesque ac. Quisque facilisis laoreet feugiat.
                            Sed dapibus volutpat ex, eget iaculis nunc tincidunt
                            sit amet. Quisque congue sapien nec aliquet
                            faucibus. Morbi lectus eros, accumsan eget malesuada
                            et, fermentum eget nisl. Fusce vel placerat libero.
                            Integer convallis sodales libero, vitae tristique
                            massa hendrerit in.
                        </p>
                        <button className="poppins border-[2px] border-[#0955AC] bg-[#0955AC] w-[222px] h-[45px] rounded-[9px] text-[15px] font-[700] text-[#FFFFFF] cursor-pointer">
                            LEARN MORE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhyOurService;
