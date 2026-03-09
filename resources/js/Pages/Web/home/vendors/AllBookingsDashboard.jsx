import React from "react";
import { usePage } from "@inertiajs/react";
import VendorShellLayout from "../../../../Components/vendors/VendorShellLayout";
import VendorAllBookings from "./allBookings/VendorAllBookings";

const AllBookingsDashboard = () => {
    const { allBookings, statistics, monthlyData } = usePage().props;

    return (
        <VendorShellLayout activeService="All Bookings">
            <VendorAllBookings
                allBookings={allBookings}
                statistics={statistics}
                monthlyData={monthlyData}
            />
        </VendorShellLayout>
    );
};

export default AllBookingsDashboard;
