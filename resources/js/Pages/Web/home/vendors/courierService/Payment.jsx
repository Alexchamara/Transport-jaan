import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import PaymentContent from "../../../components/vendors/courierService/financial/payments/PaymentContent";

const Payment = () => {
    return (
        <VendorShellLayout activeService="Courier Service">
            <PaymentContent />
        </VendorShellLayout>
    );
};

export default Payment;
