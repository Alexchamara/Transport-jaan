import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import DashContent from "../../../components/vendors/courierService/dashboard/DashContent";

const Booking = () => {
    return (
        <VendorShellLayout activeService="Courier Service">
            <DashContent mode="bookings" />
        </VendorShellLayout>
    );
};

export default Booking;
