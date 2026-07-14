import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import BookingContent from "../../../components/vendors/courierService/bookings/BookingContent";

const Booking = () => {
    return (
        <VendorShellLayout activeService="Courier Service">
            <BookingContent />
        </VendorShellLayout>
    );
};

export default Booking;
