import React from "react";
import DriverInfo from "./DriverInfo";
import DriverPic from "./DriverPic";

const HeroSection = () => {
    return (
        <div className="flex flex-row gap-10">
            <DriverPic />
            <DriverInfo />
        </div>
    );
};

export default HeroSection;
