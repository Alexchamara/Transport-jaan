import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import PaymentContent from "../../../components/vendors/ticketBooking/financial/payments/PaymentContent";

const Payment = () => {
    return (
        <VendorShellLayout activeService="Ticket Booking">
            <PaymentContent />
        </VendorShellLayout>
    );
};

export default Payment;
