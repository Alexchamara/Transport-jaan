import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import DashContent from "../../../components/vendors/freight/dashboard/DashContent";

const Dashboard = () => {
    return (
        <VendorShellLayout activeService="Freight">
            <DashContent />
        </VendorShellLayout>
    );
};

export default Dashboard;
