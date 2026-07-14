import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import ReservationContent from "../../../components/vendors/warehouse/reservations/ReservationContent";

const Reservation = () => {
    return (
        <VendorShellLayout activeService="Warehousing">
            <ReservationContent />
        </VendorShellLayout>
    );
};

export default Reservation;
