import React from "react";
import { usePage } from "@inertiajs/react";
import VendorLayout from "./VendorLayout";
import DashContent from "../../components/vendors/dashboard/DashContent";

const Dashboard = () => {
  const {
    cards,
    bookingOverview,
    earningSummary,
    realStatus,
    carTypes,
    bookings,
    bookings_meta,
    filters,
    vendorUser,
    recentActivities,
    unreadNotifications,
  } = usePage().props;

  return (
    <VendorLayout activeService="Vehicle Rental">
      <DashContent
        cards={cards}
        bookingOverview={bookingOverview}
        earningSummary={earningSummary}
        realStatus={realStatus}
        carTypes={carTypes}
        bookings={bookings}
        bookingsMeta={bookings_meta}
        filters={filters}
        vendorUser={vendorUser}
        recentActivities={recentActivities}
        unreadNotifications={unreadNotifications}
      />
    </VendorLayout>
  );
};

export default Dashboard;
