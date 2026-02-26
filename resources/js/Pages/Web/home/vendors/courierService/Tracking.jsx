import React from "react";
import SideMenu from "../../../components/vendors/courierService/SideMenu";
import TrackingContent from "../../../components/vendors/courierService/tracking/TrackingContent";

const Tracking = () => {
    return (
        <div className="bg-[#E5E5E5] min-h-screen">
            <div className="flex flex-row gap-0 h-auto">
                <SideMenu />
                <div className="flex-1 flex flex-col min-w-0 bg-[#E5E5E5]">
                    <TrackingContent />
                </div>
            </div>
        </div>
    );
};

export default Tracking;
