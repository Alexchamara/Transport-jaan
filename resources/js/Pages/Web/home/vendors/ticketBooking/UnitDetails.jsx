import React from "react";
import SideMenu from '../../../components/vendors/ticketBooking/SideMenu';
import UnitDetailsContent from '../../../components/vendors/ticketBooking/units/UnitDetailsContent';

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
