import React from "react";
import { usePage } from "@inertiajs/react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import UnitDetailsContent from "../../../components/vendors/warehouse/units/UnitDetailsContent";

const UnitDetails = () => {
    const { unitId } = usePage().props;

    return (
        <VendorShellLayout activeService="Warehousing">
            <UnitDetailsContent unitId={unitId} />
        </VendorShellLayout>
    );
};

export default UnitDetails;
