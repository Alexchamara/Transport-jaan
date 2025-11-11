import React from 'react'
import { usePage } from '@inertiajs/react';
import Header from "./ClientHeader";
import HeroEnhanced from "../../components/client/courierBooking/HeroEnhanced";

const CourierBookingDashboard = () => {
  const { shipments, statistics, monthlyData } = usePage().props;

  return (
    <div>
     <Header />
     <HeroEnhanced 
       shipments={shipments || []}
       statistics={statistics || {}}
       monthlyData={monthlyData || []}
     />
    </div>
  )
}

export default CourierBookingDashboard;