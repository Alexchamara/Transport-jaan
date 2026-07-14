import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import TrackingContent from "../../../components/vendors/courierService/tracking/TrackingContent";

const Tracking = () => {
    return (
        <VendorShellLayout activeService="Courier Service">
            <TrackingContent />
        </VendorShellLayout>
    );
};

export default Tracking;
