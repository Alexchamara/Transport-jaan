import React from 'react'
import Header from '../../layouts/Header'
import Hero from '../../components/flight/Hero'
import ContentOne from '../../components/flight/ContentOne'
import Why from '../../components/flight/Why'
import Recommended from '../../components/flight/Recommended'
import EasyPayment from '../../components/flight/EasyPayment'
import FAQ from "../../components/freight/FAQ";
import Review from "../../components/freight/Review";
import Footer from "../../layouts/Footer";

const TicketBooking = () => {
  return (
    <div>
      <Header />
      <Hero />
      <ContentOne />
      <Why />
      <Recommended />
      <EasyPayment />
      <FAQ />
      <Review />
      <Footer />
    </div>
  )
}

export default TicketBooking;