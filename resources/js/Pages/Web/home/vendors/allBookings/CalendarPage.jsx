import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import BookingCalendar from "./BookingCalendar";

const CalendarPage = () => {
    return (
        <VendorShellLayout activeService="All Bookings">
            <BookingCalendar />
        </VendorShellLayout>
    );
};

export default CalendarPage;
