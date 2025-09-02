import React from "react";
import SideMenu from '../../../components/vendors/freight/SideMenu';
import UnitDetailsContent from '../../../components/vendors/freight/units/UnitDetailsContent';

const UnitDetails = () => {
    return (
        <div className="bg-[#E5E5E5] h-auto">
            <div className="flex flex-row gap-10 h-auto">
                <SideMenu />
                <UnitDetailsContent />
            </div>
        </div>
    );
};

export default UnitDetails;
