import React from "react";
import VendorLayout from "./VendorLayout";
import TrackingContent from "../../components/vendors/tracking/TrackingContent";

const Tracking = () => (
  <VendorLayout activeService="Vehicle Rental">
    <TrackingContent />
  </VendorLayout>
);

export default Tracking;
