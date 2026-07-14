import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import TrackingContent from "../../../components/vendors/freight/tracking/TrackingContent";

const Tracking = () => {
    return (
        <VendorShellLayout activeService="Freight">
            <TrackingContent />
        </VendorShellLayout>
    );
};

export default Tracking;
