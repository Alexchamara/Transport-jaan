import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import UnitDetailsContent from "../../../components/vendors/ticketBooking/units/UnitDetailsContent";

const UnitDetails = () => {
    return (
        <VendorShellLayout activeService="Ticket Booking">
            <UnitDetailsContent />
        </VendorShellLayout>
    );
};

export default UnitDetails;
