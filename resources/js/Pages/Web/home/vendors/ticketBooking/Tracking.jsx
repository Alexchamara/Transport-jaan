import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import TrackingContent from "../../../components/vendors/ticketBooking/tracking/TrackingContent";

const Tracking = () => {
    return (
        <VendorShellLayout activeService="Ticket Booking">
            <TrackingContent />
        </VendorShellLayout>
    );
};

export default Tracking;
