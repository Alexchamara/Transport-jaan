import React from "react";
import SideMenu from "../../../components/vendors/courierService/SideMenu";
import Settings from "../../../components/vendors/courierService/Settings";

const SettingsPage = () => {
    return (
        <div className="bg-[#E5E5E5] h-auto">
            <div className="flex flex-row gap-10 h-auto">
                <SideMenu />
                <Settings />
            </div>
        </div>
    );
};

export default SettingsPage;
