import React from "react";
import Hero from "../../components/landingPages/Hero";
import About from "../../components/landingPages/About";
import Service from "../../components/landingPages/Service";
import Why from "../../components/landingPages/Why";
import FAQ from "../../components/landingPages/FAQ";
import Blog from "../../components/landingPages/Blog";
import Stories from "../../components/landingPages/Stories";
import Contact from "../../components/landingPages/Contact";
import FooterTwo from "../../layouts/FooterTwo";

const LandingPage = () => {
    return (
        <div className="bg-[#000000] text-[#FFFFFF]">
            <div id="home">
                <Hero />
            </div>
            <div id="about">
                <About />
            </div>
            <div id="services">
                <Service />
            </div>
            <Why />
            <div id="blog">
                <Blog />
            </div>
            <FAQ />
            <Stories />
            <div id="contact">
                <Contact />
            </div>
            <FooterTwo />
        </div>
    );
};

export default LandingPage;
