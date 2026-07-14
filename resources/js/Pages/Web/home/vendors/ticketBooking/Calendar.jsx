import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import CalendarContent from "../../../components/vendors/ticketBooking/calendar/CalendarContent";

const Calendar = () => {
    return (
        <VendorShellLayout activeService="Ticket Booking">
            <CalendarContent />
        </VendorShellLayout>
    );
};

export default Calendar;
