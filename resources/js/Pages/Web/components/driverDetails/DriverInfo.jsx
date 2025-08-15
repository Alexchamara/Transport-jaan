import React from "react";
import heart from "../../assets/driverBooking/heart.svg";

const DriverInfo = () => {
    return (
        <div className="w-[537px] h-[505px] bg-[#F4F3F3] rounded-[12px] px-20 py-5">
            <div className="flex flex-row justify-between items-center">
                {" "}
                <h1 className="bebas-neue text-[50px] font-[400]">
                    hyundai tucson
                </h1>
                <img src={heart} />
            </div>
            <div className="rating-views flex items-center gap-3 text-[24px] text-[#FFCD29] mt-1">
                {/* Rating Stars */}
                ★★★★☆
                <span className="text-[12px] font-[400] text-[#00000059]">
                    100+ views
                </span>
            </div>
            <p className="vehicle-description text-gray-700 mt-2">
                The Hyundai Tucson is a compact SUV offered with various trims
                and powertrains, including gasoline, hybrid, and plug-in hybrid
                options. The Hyundai Tucson is a compact SUV offered with
                various trims and powertrains, including gasoline, hybrid, and
                plug-in hybrid options.
            </p>
        </div>
    );
};

export default DriverInfo;
