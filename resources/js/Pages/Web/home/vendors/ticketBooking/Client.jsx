import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import ClientContent from "../../../components/vendors/ticketBooking/clients/ClientContent";

const Client = () => {
    return (
        <VendorShellLayout activeService="Ticket Booking">
            <ClientContent />
        </VendorShellLayout>
    );
};

export default Client;
