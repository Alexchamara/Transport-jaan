import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import TrackingContent from "../../../components/vendors/warehouse/tracking/TrackingContent";

const Tracking = () => {
    return (
        <VendorShellLayout activeService="Warehousing">
            <TrackingContent />
        </VendorShellLayout>
    );
};

export default Tracking;
