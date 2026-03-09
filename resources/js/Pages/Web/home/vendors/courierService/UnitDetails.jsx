import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import UnitDetailsContent from "../../../components/vendors/units/UnitDetailsContent";

const UnitDetails = () => {
    return (
        <VendorShellLayout activeService="Courier Service">
            <UnitDetailsContent />
        </VendorShellLayout>
    );
};

export default UnitDetails;
