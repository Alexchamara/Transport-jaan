import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import UnitContent from "../../../components/vendors/ticketBooking/units/UnitContent";

const Unit = () => {
    return (
        <VendorShellLayout activeService="Ticket Booking">
            <UnitContent />
        </VendorShellLayout>
    );
};

export default Unit;
