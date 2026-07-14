import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import BookingContent from "../../../components/vendors/warehouse/bookings/BookingContent";

const Bookings = () => {
    return (
        <VendorShellLayout activeService="Warehousing">
            <BookingContent />
        </VendorShellLayout>
    );
};

export default Bookings;
