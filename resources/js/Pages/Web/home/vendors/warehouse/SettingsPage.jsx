import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import Settings from "../../../components/vendors/warehouse/Settings";

const SettingsPage = () => {
    return (
        <VendorShellLayout activeService="Warehousing">
            <Settings />
        </VendorShellLayout>
    );
};

export default SettingsPage;
