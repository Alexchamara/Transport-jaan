import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import PaymentContent from "../../../components/vendors/freight/financial/payments/PaymentContent";

const Payment = () => {
    return (
        <VendorShellLayout activeService="Freight">
            <PaymentContent />
        </VendorShellLayout>
    );
};

export default Payment;
