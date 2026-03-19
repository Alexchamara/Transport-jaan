import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import TeamContent from "../../../components/vendors/courierService/team/TeamContent";

const Team = () => {
    return (
        <VendorShellLayout activeService="Courier Service">
            <TeamContent />
        </VendorShellLayout>
    );
};

export default Team;
