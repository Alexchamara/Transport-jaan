import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import ClientContent from "../../../components/vendors/freight/clients/ClientContent";

const Client = () => {
    return (
        <VendorShellLayout activeService="Freight">
            <ClientContent />
        </VendorShellLayout>
    );
};

export default Client;
