import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import ClientContent from "../../../components/vendors/courierService/clients/ClientContent";

const Client = () => {
    return (
        <VendorShellLayout activeService="Courier Service">
            <ClientContent />
        </VendorShellLayout>
    );
};

export default Client;
