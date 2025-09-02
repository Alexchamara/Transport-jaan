import React from "react";
import SideMenu from "../../../components/vendors/multimodal/SideMenu";
import PaymentContent from "../../../components/vendors/multimodal/financial/payments/PaymentContent";

const Payment = () => {
    return (
        <div className="bg-[#E5E5E5] h-auto">
            <div className="flex flex-row gap-10 h-auto">
                <SideMenu />
                <PaymentContent />
            </div>
        </div>
    );
};

export default Payment;
