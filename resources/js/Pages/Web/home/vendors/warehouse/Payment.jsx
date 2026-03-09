import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import PaymentContent from "../../../components/vendors/warehouse/financial/payments/PaymentContent";

const Payment = () => {
    return (
        <VendorShellLayout activeService="Warehousing">
            <PaymentContent />
        </VendorShellLayout>
    );
};

export default Payment;
