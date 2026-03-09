import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import DashContent from "../../../components/vendors/courierService/dashboard/DashContent";

const Dashboard = () => {
    return (
        <VendorShellLayout activeService="Courier Service">
            <DashContent />
        </VendorShellLayout>
    );
};

export default Dashboard;
