import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import DashContent from "../../../components/vendors/warehouse/dashboard/DashContent";

const Dashboard = () => {
    return (
        <VendorShellLayout activeService="Warehousing">
            <DashContent />
        </VendorShellLayout>
    );
};

export default Dashboard;
