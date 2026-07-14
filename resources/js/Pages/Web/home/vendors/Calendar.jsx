import React from "react";
import VendorLayout from "./VendorLayout";
import CalendarContent from '../../components/vendors/calendar/CalendarContent';

const Calendar = ({ events, clients, currentMonth, currentYear, selectedUserId }) => {
  return (
    <VendorLayout activeService="Vehicle Rental">
      <CalendarContent
        events={events || []}
        clients={clients || []}
        currentMonth={currentMonth}
        currentYear={currentYear}
        selectedUserId={selectedUserId}
      />
    </VendorLayout>
  );
};

export default Calendar;
