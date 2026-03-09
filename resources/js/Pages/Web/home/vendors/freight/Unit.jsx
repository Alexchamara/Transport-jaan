import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import UnitContent from "../../../components/vendors/freight/units/UnitContent";

const Unit = () => {
    return (
        <VendorShellLayout activeService="Freight">
            <UnitContent />
        </VendorShellLayout>
    );
};

export default Unit;
