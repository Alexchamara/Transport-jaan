import React from "react";
import { usePage } from "@inertiajs/react";

import Header from "../../home/client/ClientHeader";
import Hero from "../../components/flight/Hero";
import ContentOne from "../../components/flight/ContentOne";
import Why from "../../components/flight/Why";
import Recommended from "../../components/flight/Recommended";
import EasyPayment from "../../components/flight/EasyPayment";
import FAQ from "../../components/freight/FAQ";
import Review from "../../components/freight/Review";
import Footer from "../../layouts/Footer";

const TicketBooking = () => {
  const { url } = usePage(); // e.g. "/ticketBooking?type=flight"

  let initialType = "flight"; // default

  if (typeof url === "string") {
    const parts = url.split("?");
    if (parts.length > 1) {
      const params = new URLSearchParams(parts[1]);
      const type = params.get("type"); // "flight" | "train" | "bus" | null
      if (type === "train" || type === "bus" || type === "flight") {
        initialType = type;
      }
    }
  }

  return (
    <div>
      <Header />
      {/* Pass the decided type to Hero */}
      <Hero initialType={initialType} />
      <ContentOne />
      <Why />
      <Recommended />
      <EasyPayment />
      <FAQ />
      <Review />
      <Footer />
    </div>
  );
};

export default TicketBooking;
