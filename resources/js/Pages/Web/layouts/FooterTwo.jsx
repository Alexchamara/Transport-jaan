import React from "react";
import { Link } from "@inertiajs/react";
import CompanyLogo from "../components/CompanyLogo";
import linkedin from "../assets/landingPages/in.svg";
import fb from "../assets/landingPages/fb.svg";
import twitter from "../assets/landingPages/twitter.svg";

const FooterTwo = () => {
    const currentYear = new Date().getFullYear();

    /** Re-used from the hero component */
    const handleScroll = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    };

    /** Navigation items – same IDs you scroll to from the navbar */
    const navItems = [
        { label: "Home", id: "home" },
        { label: "About Us", id: "about" },
        { label: "Services", id: "services" },
        { label: "Blog", id: "blog" },
        { label: "Contact Us", id: "contact" },
    ];

    return (
        <div className="md:px-20 px-10 pb-10">
            {/* Copyright & legal links */}
            <div className="flex flex-col border-t-[2px] pt-2 md:flex-row justify-between items-center mt-5 md:text-[15px] text-[10px] font-[400]">
                <h1 className="order-2 md:order-1 mt-3 md:mt-0 ">
                    © {currentYear} Xsarva (Pvt) Ltd. | All rights
                    reserved.
                </h1>
                <div className="flex flex-row gap-10 order-1 md:order-2">
                    <Link
                        href="/landingPage/return-policy"
                        className="cursor-pointer hover:text-[#FF7003]"
                    >
                        Return Policy
                    </Link>
                    <Link
                        href="/landingPage/privacy-policy"
                        className="cursor-pointer hover:text-[#FF7003]"
                    >
                        Privacy Policy
                    </Link>
                    <Link
                        href="/landingPage/terms-and-conditions"
                        className="cursor-pointer hover:text-[#FF7003]"
                    >
                        Terms of Service
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FooterTwo;
