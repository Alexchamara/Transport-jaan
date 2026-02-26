import React from "react";
import SideMenu from "./SideMenu";
import BookingCalendar from "./BookingCalendar";

const CalendarPage = () => {
    return (
        <div className="flex flex-row gap-0 w-full h-full min-h-screen bg-[#E5E5E5]">
            <SideMenu />
            <div className="flex-1 flex flex-col min-w-0">
                <BookingCalendar />
            </div>
        </div>
    );
};

export default CalendarPage;
