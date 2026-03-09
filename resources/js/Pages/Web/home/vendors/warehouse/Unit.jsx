import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import UnitContent from "../../../components/vendors/warehouse/units/UnitContent";

const Unit = () => {
    return (
        <VendorShellLayout activeService="Warehousing">
            <UnitContent />
        </VendorShellLayout>
    );
};

export default Unit;
