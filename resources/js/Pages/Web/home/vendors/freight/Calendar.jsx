import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import CalendarContent from "../../../components/vendors/freight/calendar/CalendarContent";

const Calendar = () => {
    return (
        <VendorShellLayout activeService="Freight">
            <CalendarContent />
        </VendorShellLayout>
    );
};

export default Calendar;
