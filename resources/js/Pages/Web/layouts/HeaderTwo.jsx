import React, { useState } from "react";
import { usePage, Link } from "@inertiajs/react";
import burgerIcon from "../assets/landingPages/burgerIcon.svg";

const HeaderTwo = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { auth } = usePage().props;

    // Scroll to section by id
    const handleScroll = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
            setMenuOpen(false); // close sidebar if open
        }
    };

    return (
        <div className="px-10 py-10 bg-[#000000] flex flex-row justify-between items-center poppins text-[#FFFFFF]">

          <div className="text-[31px] font-[700] uppercase cursor-pointer">
               <h1>Company Logo</h1>
          </div>
            {/* navbar section - desktop only */}
            <div className="lg:flex hidden flex-row items-center justify-between gap-40">
                <div className="flex flex-row gap-5 xl:text-[17px] text-[10px] font-[400]">
                    <div
                        className="xl:w-[101px] h-[38px] border-[1.2px] border-[#FFFFFF91] rounded-[100px] bg-[#0A063000] flex justify-center items-center cursor-pointer px-4 py-2"
                        onClick={() => handleScroll("home")}
                    >
                        Home
                    </div>
                    <div
                        className="xl:w-[121px] h-[38px] border-[1.2px] border-[#FFFFFF91] rounded-[100px] bg-[#0A063000] flex justify-center items-center cursor-pointer px-4 py-2"
                        onClick={() => handleScroll("about")}
                    >
                        About Us
                    </div>
                    <div
                        className="xl:w-[114px] h-[38px] border-[1.2px] border-[#FFFFFF91] rounded-[100px] bg-[#0A063000] flex justify-center items-center cursor-pointer px-4 py-2"
                        onClick={() => handleScroll("services")}
                    >
                        Services
                    </div>
                    <div
                        className="xl:w-[81px] h-[38px] border-[1.2px] border-[#FFFFFF91] rounded-[100px] bg-[#0A063000] flex justify-center items-center cursor-pointer px-4 py-2"
                        onClick={() => handleScroll("blog")}
                    >
                        Blog
                    </div>
                    <div
                        className="xl:w-[137px] h-[38px] border-[1.2px] border-[#FFFFFF91] rounded-[100px] bg-[#0A063000] flex justify-center items-center cursor-pointer px-4 py-2"
                        onClick={() => handleScroll("contact")}
                    >
                        Contact Us
                    </div>
                </div>
                <div className="flex flex-row gap-5 xl:text-[17px] text-[10px] font-[700]">
                        
                     <div className="xl:w-[137px] h-[38px] bg-[#FF7003] border-[1.2px] border-[#FF7003] rounded-[100px] flex justify-center items-center cursor-pointer px-4 py-2">
                        Login
                     </div>
                               
                    <div className="xl:w-[137px] h-[38px] text-[#FF7003] border-[1.2px] border-[#FF7003] rounded-[100px] flex justify-center items-center cursor-pointer px-4 py-2">
                        Register
                    </div>
                            
                </div>
            </div>
            {/* end */}

            {/* burger menu - mobile only */}
            <div className="lg:hidden">
                <div
                    className="size-[30px] rounded-full border-[0.3px] border-[#FFFFFF] flex justify-center items-center cursor-pointer"
                    onClick={() => setMenuOpen(true)}
                >
                    <img src={burgerIcon} />
                </div>
            </div>

            {/* Sidebar mobile menu */}
            {menuOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-40 z-40"
                        onClick={() => setMenuOpen(false)}
                    ></div>
                    {/* Sidebar */}
                    <div className="fixed top-0 left-0 h-full w-64 bg-[#0A0630] z-50 shadow-lg flex flex-col p-6 animate-slideIn">
                        <div className="flex justify-end mb-6">
                            <button
                                className="text-white text-2xl"
                                onClick={() => setMenuOpen(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="flex flex-col gap-4 text-white text-[17px] font-[400]">
                            <div
                                className="border-b border-[#FFFFFF91] py-2 cursor-pointer"
                                onClick={() => handleScroll("home")}
                            >
                                Home
                            </div>
                            <div
                                className="border-b border-[#FFFFFF91] py-2 cursor-pointer"
                                onClick={() => handleScroll("about")}
                            >
                                About Us
                            </div>
                            <div
                                className="border-b border-[#FFFFFF91] py-2 cursor-pointer"
                                onClick={() => handleScroll("services")}
                            >
                                Services
                            </div>
                            <div
                                className="border-b border-[#FFFFFF91] py-2 cursor-pointer"
                                onClick={() => handleScroll("blog")}
                            >
                                Blog
                            </div>
                            <div
                                className="border-b border-[#FFFFFF91] py-2 cursor-pointer"
                                onClick={() => handleScroll("contact")}
                            >
                                Contact Us
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 mt-6 text-white text-[17px] font-[700]">
                             
                            <div className="xl:w-[137px] h-[38px] bg-[#FF7003] border-[1.2px] border-[#FF7003] rounded-[100px] flex justify-center items-center cursor-pointer px-4 py-2">
                                    Login
                            </div>
                                   
                             <div className="xl:w-[137px] h-[38px] text-[#FF7003] border-[1.2px] border-[#FF7003] rounded-[100px] flex justify-center items-center cursor-pointer px-4 py-2">
                                     Register
                            </div>
                                  
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default HeaderTwo;
