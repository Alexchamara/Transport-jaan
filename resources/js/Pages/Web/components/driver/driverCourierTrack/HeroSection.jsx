import React from "react";
import bg from "../../../assets/trackCourier/bg.png";

const HeroSection = () => {
    return (
        <div className="relative h-screen md:h-[497px]">
            <img src={bg} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0955AC] to-[#0955AC4D]" />
            <div className="absolute inset-0 flex flex-col items-center">
                <div className="container mx-auto px-10 py-20">
                    <div className="w-[125px] h-[5px] bg-[#FFFFFF] mb-6 rounded-sm"></div>
                    <h1 className="bebas-neue text-[78px]/[70px] font-[400] mb-4">
                        <span className="text-[#FFFFFF]">track</span> order
                    </h1>
                    <p className="poppins py-5 md:w-1/2 text-[12px]/[20px] md:text-[18px]/[20px] font-[400] text-[#FFFFFF] text-justify mb-10 md:mb-20">
                        Experience hassle-free delivery to over 200 countries
                        with our fast, secure, and affordable courier services.
                        From same-day deliveries to international freight, we
                        offer a range of solutions to suit your needs. Start
                        shipping today with just a few clicks. journeys.
                    </p>
                </div>                
            </div>
        </div>
    );
};

export default HeroSection;
