import React from 'react'
import SideMenu from '../../../components/vendors/courierService/SideMenu';
import CalendarContent from '../../../components/vendors/courierService/calendar/CalendarContent';

const Calendar = () => {
  return (
    <div className="bg-[#E5E5E5] min-h-screen">
            <div className="flex flex-row gap-0 h-auto">
                <SideMenu />
                <div className="flex-1 flex flex-col min-w-0 bg-[#E5E5E5]">
                    <CalendarContent />
                </div>
            </div>
        </div>
  )
}

export default Calendar;