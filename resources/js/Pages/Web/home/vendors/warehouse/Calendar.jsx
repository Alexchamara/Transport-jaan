import React from "react";
import { usePage } from "@inertiajs/react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import CalendarContent from "../../../components/vendors/warehouse/calendar/CalendarContent";

const Calendar = () => {
    const { events, clients, currentMonth, currentYear, currentDay, selectedUserId } = usePage().props;

    return (
        <VendorShellLayout activeService="Warehousing">
            <CalendarContent
                events={events}
                clients={clients}
                currentMonth={currentMonth}
                currentYear={currentYear}
                currentDay={currentDay}
                selectedUserId={selectedUserId}
            />
        </VendorShellLayout>
    );
};

export default Calendar;
