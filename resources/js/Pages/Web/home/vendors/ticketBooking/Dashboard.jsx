import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import DashContent from "../../../components/vendors/ticketBooking/dashboard/DashContent";

const Dashboard = () => {
    return (
        <VendorShellLayout activeService="Ticket Booking">
            <DashContent />
        </VendorShellLayout>
    );
};

export default Dashboard;
