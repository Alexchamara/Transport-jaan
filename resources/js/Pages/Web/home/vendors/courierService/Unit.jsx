import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import UnitContent from "../../../components/vendors/courierService/units/UnitContent";

const Unit = () => {
    return (
        <VendorShellLayout activeService="Courier Service">
            <UnitContent />
        </VendorShellLayout>
    );
};

export default Unit;
