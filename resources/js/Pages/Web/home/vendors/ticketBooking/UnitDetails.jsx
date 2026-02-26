import React from "react";
import SideMenu from '../../../components/vendors/ticketBooking/SideMenu';
import UnitDetailsContent from '../../../components/vendors/ticketBooking/units/UnitDetailsContent';

const UnitDetails = () => {
    return (
        <div className="bg-[#E5E5E5] min-h-screen w-full flex gap-0">
            <div className="h-screen w-64 flex-shrink-0 overflow-hidden">
                <SideMenu />
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden h-screen bg-[#E5E5E5]">
                <UnitDetailsContent />
            </div>
        </div>
    );
};

export default UnitDetails;
