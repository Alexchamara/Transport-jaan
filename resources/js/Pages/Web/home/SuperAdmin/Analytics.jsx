import React from "react";
import SideMenu from "../../components/SuperAdmin/Dashboard1/SideMenu";
import RightSide from "../../components/SuperAdmin/Dashboard2/RightSide";

const Analytics = () => {
    return (
        <div className="flex flex-row bg-[#081028] min-h-screen sm:flex-col md:flex-row lg:flex-row poppins">
            <div className="sm:w-full md:w-auto lg:w-auto">
                <SideMenu />
            </div>
            <div className="flex-1 overflow-x-hidden">
                <RightSide />
            </div>
        </div>
    );
};

export default Analytics;
