import React from 'react'
import SideMenu from '../../../components/vendors/warehouse/SideMenu';
import CalendarContent from '../../../components/vendors/warehouse/calendar/CalendarContent';

const Calendar = () => {
  return (
    <div className="bg-[#E5E5E5] h-auto">
            <div className="flex flex-row gap-10 h-auto">
                <SideMenu />
                <CalendarContent />
            </div>
        </div>
  )
}

export default Calendar;