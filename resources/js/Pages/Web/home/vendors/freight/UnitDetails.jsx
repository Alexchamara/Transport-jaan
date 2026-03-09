import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import UnitDetailsContent from "../../../components/vendors/freight/units/UnitDetailsContent";

const UnitDetails = () => {
    return (
        <VendorShellLayout activeService="Freight">
            <UnitDetailsContent />
        </VendorShellLayout>
    );
};

export default UnitDetails;
