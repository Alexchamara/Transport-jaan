import React from "react";
import SideMenu from '../../../components/vendors/warehouse/SideMenu';
import UnitDetailsContent from '../../../components/vendors/warehouse/units/UnitDetailsContent';
import { usePage } from '@inertiajs/react';

const UnitDetails = () => {
    const { props } = usePage();
    const { unitId } = props;

    return (
        <div className="bg-[#E5E5E5] h-auto">
            <div className="flex flex-row gap-10 h-auto">
                <SideMenu />
                <UnitDetailsContent unitId={unitId} />
            </div>
        </div>
    );
};

export default UnitDetails;
