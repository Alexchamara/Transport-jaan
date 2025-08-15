import React from "react";
import { Link } from "@inertiajs/react";
import bg from "../../assets/cargoAndFreight/bg.png";

const HeroSection = () => {
    return (
        <div className="relative h-screen lg:h-[788px]">
            <img src={bg} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-[#000000B8]" />
            <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4">
                    <div className="relative text-white flex flex-row items-center justify-between gap-8">
                        {/* text section */}
                        <div className="">
                            <div className="h-[5px] w-[125px] bg-[#FFFFFF] rounded-sm" />
                            <h1 className="mt-8 bebas-neue text-[38px] md:text-[78px]/[70px] font-[400] leading-tight pr-[100px]">
                                Effortless,{" "}
                                <span className="text-[#0955AC]">
                                    {" "}
                                    Freight{" "}
                                </span>
                                Booking{" "}
                                <span className="text-[#0955AC]"> and </span>
                                Tracking,{" "}
                                <span className="text-[#0955AC]"> all in </span>
                                one place.
                            </h1>
                            <p className="mt-10 poppins text-[14px] md:text-[18px]/[20px] text-justify">
                                Say goodbye to delays, inefficiencies, and
                                disconnected freight systems. Our all-in-one
                                logistics platform lets you <br/> manage your entire
                                freight process seamlessly — from vendor
                                selection and transport mode booking to customs<br/>
                                documentation and real-time shipment tracking.
                                Simplify complex logistics with smart freight
                                tools.
                            </p>
                            {/* button section */}
                            <div className="figtree mt-20 lg:gap-7 gap-5 flex flex-col md:flex-row w-full text-[12px] md:text-[16px] font-[700]">
                                <Link
                                    // href="/couriers/create"
                                    className="bg-[#0955AC] text-white rounded-lg transition duration-300  w-[100px] h-[25px] md:w-[202px] md:h-[56px] flex justify-center items-center"
                                >
                                    Explore More
                                </Link>
                                <Link
                                    // href="/track"
                                    className="bg-[#FFFFFF82] border-[2px] border-[#0955AC] text-[#0955AC] rounded-lg transition duration-300 w-[100px] h-[25px] md:w-[202px] md:h-[56px] flex justify-center items-center"
                                >
                                    Get a Quote
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
