import React from "react";
import SideMenu from "./SideMenu";
import BookingCalendar from "./BookingCalendar";

const CalendarPage = ({ allBookings = [], statistics = {} }) => {
    return (
        <div className="flex flex-row gap-0 w-full h-full min-h-screen bg-[#F5F5F5]">
            <SideMenu />
            <div className="flex-1 overflow-auto">
                <BookingCalendar allBookings={allBookings} statistics={statistics} />
            </div>
        </div>
    );
};

export default CalendarPage;
