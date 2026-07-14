import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import BookingContent from "../../../components/vendors/ticketBooking/bookings/BookingContent";

const Booking = () => {
    return (
        <VendorShellLayout activeService="Ticket Booking">
            <BookingContent />
        </VendorShellLayout>
    );
};

export default Booking;
