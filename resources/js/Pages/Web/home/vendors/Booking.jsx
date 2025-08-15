import React from "react";
import SideMenu from "../../components/vendors/SideMenu";
import BookingContent from "../../components/vendors/bookings/BookingContent";

const Booking = () => {
    return (
        <div className="bg-[#E5E5E5] h-auto">
            <div className="flex flex-row gap-10 h-auto">
                <SideMenu />
                <BookingContent />
            </div>
        </div>
    );
};

export default Booking;
