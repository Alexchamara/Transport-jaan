import React from "react";
import SideMenu from "../../components/vendors/SideMenu";
import DashContent from "../../components/vendors/dashboard/DashContent";

const Dashboard = () => {
    return (
        <div className="bg-[#E5E5E5] h-auto">
            <div className="flex flex-row gap-10 h-auto">
                <SideMenu />
                <DashContent/>
            </div>
        </div>
    );
};

export default Dashboard;
