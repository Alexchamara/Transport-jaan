import React from "react";
import plane from "../../assets/driverBooking/plane.png";
import car from "../../assets/driverBooking/car.png";

const FeaturedService = () => {
    return (
        <div className="bg-[#E7E7E7] flex flex-col justify-center items-center px-5 py-10">
            <h1 className="bebas-neue text-[40px] font-[400]">
                Featured <span className="text-[#0955AC]">Services</span>
            </h1>

            <div className="figtree text-[16px]/[24px] font-[500] py-10 flex flex-col md:flex-row gap-20">
                <div className="w-[272px] h-[245px] border-[1px] border-[#0955AC] rounded-[8px] flex flex-col justify-center items-center">
                    <img src={plane} className="w-[172px] h-[145px]" />
                    <h1>Air Crafts</h1>
                </div>
                <div className="w-[272px] h-[245px] border-[1px] border-[#0955AC] rounded-[8px] flex flex-col justify-center items-center">
                    <img src={car} className="w-[172px] h-[145px]" />
                    <h1>Land Vehicles</h1>
                </div>
            </div>
        </div>
    );
};

export default FeaturedService;
