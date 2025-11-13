import React from 'react'
import SideMenu from '../../components/vendors/SideMenu';
import CalendarContent from '../../components/vendors/calendar/CalendarContent';

const Calendar = ({ events, clients, currentMonth, currentYear, selectedUserId }) => {
  return (
    <div className="bg-[#E5E5E5] h-auto">
            <div className="flex flex-row gap-10 h-auto">
                <SideMenu />
                <CalendarContent
                    events={events || []}
                    clients={clients || []}
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    selectedUserId={selectedUserId}
                />
            </div>
        </div>
  )
}

export default Calendar;
