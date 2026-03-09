import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import PaymentContent from "../../../components/vendors/financial/payments/PaymentContent";

const PaymentPage = () => (
    <VendorShellLayout activeService="All Bookings">
        <PaymentContent />
    </VendorShellLayout>
);

export default PaymentPage;
