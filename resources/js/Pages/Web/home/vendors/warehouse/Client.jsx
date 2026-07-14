import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import ClientContent from "../../../components/vendors/warehouse/clients/ClientContent";

const Client = () => {
    return (
        <VendorShellLayout activeService="Warehousing">
            <ClientContent />
        </VendorShellLayout>
    );
};

export default Client;
