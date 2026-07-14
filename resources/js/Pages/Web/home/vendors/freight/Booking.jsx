import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import BookingContent from "../../../components/vendors/freight/bookings/BookingContent";

const Booking = () => {
    return (
        <VendorShellLayout activeService="Freight">
            <BookingContent />
        </VendorShellLayout>
    );
};

export default Booking;
