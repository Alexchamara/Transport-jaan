import React from "react";
import SideMenu from "../../components/vendors/SideMenu";
import TrackingContent from "../../components/vendors/tracking/TrackingContent";

const Tracking = () => {
    return (
        <div className="bg-[#E5E5E5] h-auto">
            <div className="flex flex-row gap-10 h-auto">
                <SideMenu />
                <TrackingContent />
            </div>
        </div>
    );
};

export default Tracking;
