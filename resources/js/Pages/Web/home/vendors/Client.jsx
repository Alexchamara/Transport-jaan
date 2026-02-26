import React from "react";
import VendorLayout from "./VendorLayout";
import ClientContent from "../../components/vendors/clients/ClientContent";

const Client = () => (
  <VendorLayout activeService="Vehicle Rental">
    <ClientContent />
  </VendorLayout>
);

export default Client;
