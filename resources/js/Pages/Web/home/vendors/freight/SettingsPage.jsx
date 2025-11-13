import React from "react";
import SideMenu from "../../../components/vendors/freight/SideMenu";
import Settings from "../../../components/vendors/freight/Settings";

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
