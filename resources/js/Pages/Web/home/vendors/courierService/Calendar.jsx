import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import CalendarContent from "../../../components/vendors/courierService/calendar/CalendarContent";

const Calendar = () => {
    return (
        <VendorShellLayout activeService="Courier Service">
            <CalendarContent />
        </VendorShellLayout>
    );
};

export default Calendar;
