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
        <div className="md:px-20 px-10 py-10">
            <div className="relative border-t-[1px] border-b-[2px] flex flex-col items-center justify-center py-20">
                <h1 className="text-[25px] font-[700] uppercase">
                    <CompanyLogo className="h-[100px] object-contain" fallbackClassName="text-[25px] font-[700] uppercase" />
                </h1>

                <div className="mt-40 flex flex-col justify-center items-center">
                    <h1 className="text-[50px] font-[700] uppercase">
                        Your journey starts here
                    </h1>
                    <p className="text-[15px] font-[500] md:-pb-40 pb-80">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Donec semper eu risus ut ornare. In.Lorem
                    </p>

                    {/* Social icons – positioned on the right */}
                    <div className="flex flex-col gap-5 absolute right-0 top-40 md:pb-10">
                        <div className="size-[35px] rounded-full border-[1.5px] border-[#FF7003] flex justify-center items-center cursor-pointer">
                            <img src={linkedin} alt="LinkedIn" />
                        </div>
                        <div className="size-[35px] rounded-full border-[1.5px] border-[#FF7003] flex justify-center items-center cursor-pointer">
                            <img src={fb} alt="Facebook" />
                        </div>
                        <div className="size-[35px] rounded-full border-[1.5px] border-[#FF7003] flex justify-center items-center cursor-pointer">
                            <img src={twitter} alt="Twitter" />
                        </div>
                    </div>

                    {/* Footer navigation – same smooth-scroll as navbar */}
                    <div className="absolute bottom-5 left-0 md:left-1/2 md:-translate-x-1/2 flex md:flex-row flex-col gap-10 text-[17px]">
                        {navItems.map((item) => (
                            <Link
                                key={item.id}
                                href={`#${item.id}`}
                                onClick={(e) => {
                                    e.preventDefault(); // stop Inertia navigation
                                    handleScroll(item.id);
                                }}
                                className="cursor-pointer hover:text-[#FF7003] transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Copyright & legal links */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-5 md:text-[15px] text-[10px] font-[400]">
                <h1 className="order-2 md:order-1 mt-3 md:mt-0 ">
                    © {currentYear} JAAN Network (Pvt) Ltd. | All rights
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
