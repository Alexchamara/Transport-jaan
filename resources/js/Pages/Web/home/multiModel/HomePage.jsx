import React from 'react'
import Header from '../../layouts/Header'
import Hero from "../../components/multiModel/Hero";
import Destinations from '../../components/multiModel/Destinations';
import AboutUs from "../../components/multiModel/AboutUs";
import Journey from '../../components/multiModel/Journey';
import FAQ from "../../components/multiModel/FAQ";

const HomePage = () => {
  return (
    <div>
     <Header />
     <Hero />
     <Destinations />
     <AboutUs />
     <Journey />
     <FAQ />
    </div>
  )
}

export default HomePage;