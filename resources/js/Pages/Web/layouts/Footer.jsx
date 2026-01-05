import React from "react";
import { Link } from "@inertiajs/react";

import linkedin from "../assets/rentAVehicle/footer/linkedin.png";
import fb from "../assets/rentAVehicle/footer/fb.png";
import twitter from "../assets/rentAVehicle/footer/twitter.png";

import CurrentYear from "../components/rentAVehicle/CurrentYear";

const Footer = () => {
    const handleScroll = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <footer className="w-full py-6 sm:py-12 bg-[#0A142F] text-white">
            <div className="container mx-auto px-4 sm:px-6 mt-6 sm:mt-10">
                <div className="figtree grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
                    {/* Links Section */}
                    <div className="figtree md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-[16px] sm:text-[18px] font-[400] text-[#F8F8F8]">
                        {/* Products Section */}
                        <div>
                            <h3 className="text-[18px] sm:text-[20px] font-[700] mb-3 sm:mb-4">
                                Products
                            </h3>
                            <ul className="space-y-4">
                                <li>
                                    <Link
                                        href="/clientRent"
                                        className="hover:text-blue-400 transition-colors duration-200"
                                    >
                                        Vehicle Rental
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/ticketBooking"
                                        className="hover:text-blue-400 transition-colors duration-200"
                                    >
                                        Ticket Booking
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/courier-service"
                                        className="hover:text-blue-400 transition-colors duration-200"
                                    >
                                        Courier Service
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/drivers-home"
                                        className="hover:text-blue-400 transition-colors duration-200"
                                    >
                                        Drivers
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Information Section */}
                        <div>
                            <h3 className="text-[18px] sm:text-[20px] font-[700] mb-3 sm:mb-4">
                                Information
                            </h3>
                            <ul className="space-y-4">
                                <li>
                                    <Link
                                        href="#faq"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleScroll("faq");
                                        }}
                                        className="hover:text-blue-400 transition-colors duration-200 cursor-pointer"
                                    >
                                        FAQ
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/landingPage/blog"
                                        className="hover:text-blue-400 transition-colors duration-200"
                                    >
                                        Blog
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#support"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleScroll("support");
                                        }}
                                        className="hover:text-blue-400 transition-colors duration-200 cursor-pointer"
                                    >
                                        Support
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Company Section */}
                        <div>
                            <h3 className="text-[18px] sm:text-[20px] font-[700] mb-3 sm:mb-4">
                                Company
                            </h3>
                            <ul className="space-y-4">
                                <li>
                                    <Link
                                        href="#about"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleScroll("about");
                                        }}
                                        className="hover:text-blue-400 transition-colors duration-200 cursor-pointer"
                                    >
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#careers"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleScroll("careers");
                                        }}
                                        className="hover:text-blue-400 transition-colors duration-200 cursor-pointer"
                                    >
                                        Careers
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#contact"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleScroll("contact");
                                        }}
                                        className="hover:text-blue-400 transition-colors duration-200 cursor-pointer"
                                    >
                                        Contact Us
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Privacy & Legal Section */}
                        <div>
                            <h3 className="text-[18px] sm:text-[20px] font-[700] mb-3 sm:mb-4">
                                Privacy & Legal
                            </h3>
                            <ul className="space-y-4">
                                <li>
                                    <Link
                                        href="#privacy"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleScroll("privacy");
                                        }}
                                        className="hover:text-blue-400 transition-colors duration-200 cursor-pointer"
                                    >
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#terms"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleScroll("terms");
                                        }}
                                        className="hover:text-blue-400 transition-colors duration-200 cursor-pointer"
                                    >
                                        Terms & Conditions
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="#help"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleScroll("help");
                                        }}
                                        className="hover:text-blue-400 transition-colors duration-200 cursor-pointer"
                                    >
                                        Help Center
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Subscribe and Description Section */}
                    <div className="md:col-span-4 bg-[#FFFFFF] bg-opacity-10 p-6 sm:p-10 h-auto">
                        {/* Subscribe Section */}
                        <div>
                            <h4 className="text-[16px] font-[700] mb-2">
                                Subscribe
                            </h4>
                            <div className="flex flex-col sm:flex-row mt-5 items-center gap-2">
                                <input
                                    type="email"
                                    placeholder="Email address"
                                    className="w-full flex-1 px-3 sm:px-4 py-2 text-[#7A7E92] bg-[#FFFFFF] h-[45px] sm:h-[50px] rounded-t-[6px] sm:rounded-t-none sm:rounded-l-[6px] text-sm sm:text-base"
                                />
                                <button className="w-full sm:w-auto px-4 bg-[#0955AC] rounded-b-[6px] sm:rounded-b-none sm:rounded-r-[6px] cursor-pointer h-[45px] sm:h-[50px] flex items-center justify-center hover:bg-[#074a94] transition-colors duration-200">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 sm:h-6 sm:w-6 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Company Description */}
                        <div className="mt-6 sm:mt-10">
                            <p className="text-[#F8F8F8B5] text-justify text-sm sm:text-base">
                                Hello. we are "Company Name". Our goal is to
                                translate the positive effects from
                                revolutionizing how companies engage with their
                                clients & their team.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Copyright, Logo, and Social Icons */}
                <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Logo */}
                    <div className="text-center md:text-center">
                        <Link
                            href="/"
                            className="text-xl sm:text-2xl font-[700] hover:text-blue-400 transition-colors duration-200 poppins"
                        >
                            COMPANY
                            <br />
                            <span className="text-[#0955AC]">LOGO</span>
                        </Link>
                    </div>
                    {/* Copyright */}
                    <p className="figtree text-[14px] sm:text-[16px] text-[#FFFFFF] text-center">
                        &copy; <CurrentYear /> JAAN Network (Pvt) Ltd. | All
                        rights reserved.
                    </p>
                    {/* Social Icons */}
                    <div className="flex space-x-3 sm:space-x-4">
                        {/* LinkedIn Icon */}
                        <a
                            href="https://www.linkedin.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-400 flex items-center justify-center rounded-full border-[1.5px] border-[#FFFFFF] w-[32px] h-[32px] sm:w-[35px] sm:h-[35px] p-2 transition-colors duration-200"
                        >
                            <img
                                src={linkedin}
                                alt="LinkedIn icon"
                                className="h-[10px] w-[10px] sm:h-[11px] sm:w-[11px]"
                            />
                        </a>
                        {/* Facebook Icon */}
                        <a
                            href="https://www.facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-400 flex items-center justify-center rounded-full border-[1.5px] border-[#FFFFFF] w-[32px] h-[32px] sm:w-[35px] sm:h-[35px] p-2 transition-colors duration-200"
                        >
                            <img
                                src={fb}
                                alt="Facebook icon"
                                className="h-[11px] w-[5px] sm:h-[12px] sm:w-[6px]"
                            />
                        </a>
                        {/* Twitter Icon */}
                        <a
                            href="https://www.twitter.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-400 flex items-center justify-center rounded-full border-[1.5px] border-[#FFFFFF] w-[32px] h-[32px] sm:w-[35px] sm:h-[35px] p-2 transition-colors duration-200"
                        >
                            <img
                                src={twitter}
                                alt="Twitter icon"
                                className="h-[9px] w-[11px] sm:h-[10px] sm:w-[12px]"
                            />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
