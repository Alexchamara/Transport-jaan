import React from "react";
import proPic from "../../assets/driverBooking/proPic.png";

const DriverPic = () => {
    return (
        <div className="w-[537px] h-[505px]">
            <div className="w-[358px] h-[349px] bg-[#F4F3F3] flex justify-center rounded-[12px] pt-5">
                <img src={proPic} />
            </div>
        </div>
    );
};

export default DriverPic;
