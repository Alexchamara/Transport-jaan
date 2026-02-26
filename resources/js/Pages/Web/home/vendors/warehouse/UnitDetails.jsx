import React from "react";
import SideMenu from '../../../components/vendors/warehouse/SideMenu';
import UnitDetailsContent from '../../../components/vendors/warehouse/units/UnitDetailsContent';
import { usePage } from '@inertiajs/react';

const UnitDetails = () => {
    const { props } = usePage();
    const { unitId } = props;

    return (
        <div className="bg-[#E5E5E5] min-h-screen w-full flex gap-0">
            <div className="h-screen w-64 flex-shrink-0 overflow-hidden">
                <SideMenu />
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden h-screen">
                <UnitDetailsContent unitId={unitId} />
            </div>
        </div>
    );
};

export default UnitDetails;
