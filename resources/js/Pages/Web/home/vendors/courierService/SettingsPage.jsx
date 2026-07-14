import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import Settings from "../../../components/vendors/courierService/Settings";

const SettingsPage = () => {
    return (
        <VendorShellLayout activeService="Courier Service">
            <Settings />
        </VendorShellLayout>
    );
};

export default SettingsPage;
