import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import Settings from "../../../components/vendors/ticketBooking/Settings";

const SettingsPage = () => {
    return (
        <VendorShellLayout activeService="Ticket Booking">
            <Settings />
        </VendorShellLayout>
    );
};

export default SettingsPage;
