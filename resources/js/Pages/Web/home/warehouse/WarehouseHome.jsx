import React from "react";
import Header from "../../../../Pages/Web/home/client/ClientHeader";
import Hero from "../../components/warehouse/Hero";
import AboutUs from "../../components/warehouse/AboutUs";
import Collection from "../../components/warehouse/Collection";
import FAQ from "../../components/freight/FAQ";
import Review from "../../components/freight/Review";
import Footer from "../../layouts/Footer";


const WarehouseHome = () => {
    return (
        <div>
            <Header />
            <Hero />
            <AboutUs />
            <Collection />
            <FAQ />
            <Review />
            <Footer />
        </div>
    );
};

export default WarehouseHome;
