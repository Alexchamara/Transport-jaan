import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import Settings from "../../../components/vendors/freight/Settings";

const SettingsPage = () => {
    return (
        <VendorShellLayout activeService="Freight">
            <Settings />
        </VendorShellLayout>
    );
};

export default SettingsPage;
