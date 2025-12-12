import React from "react";
import { router } from "@inertiajs/react";
import bg from "../../assets/warehouse/bg.svg";

const Hero = () => {
    const handleFindWarehouse = () => {
        router.visit('/warehouseList');
    };
    return (
        <div
            className="w-full h-auto min-h-[829px] flex flex-col justify-center items-center"
            style={{ backgroundImage: `url(${bg})` }}
        >
            <div className="flex flex-col justify-center items-center gap-20 py-20 px-5 md:px-10 lg:px-40 text-[#FFFFFF] text-center">
                <div className="lg:px-[100px]">
                    <div className="w-[102px] h-[5px] bg-[#FFFFFF] rounded-sm" />
                    <h1 className="text-[58px]/[50px] xl:text-[78px]/[70px] font-[400] bebas-neue mt-5">
                        Find and Rent the Perfect Warehouse for Your Business
                    </h1>
                </div>
                <p className="text-[14px]/[33px] font-[500] lg:px-[240px] poppins">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Donec semper eu risus ut ornare. In bibendum tempus sapien,
                    tristique consectetur purus pellentesque ac. Quisque
                    facilisis laoreet feugiat. Sed dapibus volutpat ex, eget
                    iaculis nunc tincidunt sit amet. Quisque congue sapien nec
                    aliquet faucibus. Morbi lectus eros,
                </p>
                <div className="text-[16px] font-[700] figtree flex md:flex-row flex-col justify-center items-center gap-10">
                    <div 
                        className="w-[190px] h-[45px] bg-[#0955AC] border-[2px] border-[#0955AC] flex justify-center items-center rounded-[9px] cursor-pointer"
                        onClick={handleFindWarehouse}
                    >
                        FIND A WAREHOUSE
                    </div>
                    {/* <div className="w-[190px] h-[45px] border-[2px] border-[#FFFFFF] flex justify-center items-center rounded-[9px] cursor-pointer">
                        GET A QUOTE
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default Hero;
