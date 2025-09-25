import React from 'react'
import Header from '../../layouts/Header';
import HeroDetailsTwo from '../../components/ticketBooking/HeroDetailsTwo';
import Footer from '../../layouts/Footer';

const BusTicketBookingDetails = ({ stations, schedules, searchParams }) => {
  return (
    <div>
     <Header />
     <HeroDetailsTwo 
       stations={stations} 
       schedules={schedules} 
       searchParams={searchParams} 
     />
     <Footer />
    </div>
  )
}

export default BusTicketBookingDetails;