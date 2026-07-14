import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <div className="flex flex-col justify-center items-center">
            <div className="max-w-[1300px] w-full xl:px-5 px-10 pt-10">
                <div className="poppins flex flex-row justify-between items-center">
                    <h1 className="text-[26px] font-[700] uppercase">
                        Company <span className="text-[#0955AC]"><br className="block sm:hidden"/>Logo</span>
                    </h1>

                    {/* Desktop Navigation */}
                    <div className="hidden xl:flex w-[703px] h-[70px] bg-[#0955AC12] rounded-[100px] flex-row justify-between items-center px-6 py-4 text-[18px] font-[700] text-[#0955AC] cursor-pointer uppercase">
                        <div>Home</div>
                        <div>Destinations</div>
                        <div>About us</div>
                        <div>Services</div>
                        <div>FAQ</div>
                        <div>Contact us</div>
                    </div>

                    {/* Desktop Buttons */}
                    <div className="hidden xl:flex flex-row gap-3 items-center justify-center">
                        <div className="w-[137px] h-[44px] bg-[#0955AC] rounded-[100px] border-[1px] border-[#0955AC] flex justify-center items-center px-4 py-2 text-[18px] font-[700] text-[#FFFFFF] cursor-pointer">
                            LOGIN
                        </div>
                        <div className="w-[137px] h-[44px] bg-[#FFFFFF] rounded-[100px] border-[1px] border-[#0955AC] flex justify-center items-center px-4 py-2 text-[18px] font-[700] text-[#0955AC] cursor-pointer">
                            Register
                        </div>
                    </div>

                    {/* Mobile Burger Icon */}
                    <div className="xl:hidden cursor-pointer" onClick={toggleMenu}>
                        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="xl:hidden fixed top-0 right-0 w-3/4 h-full bg-white shadow-lg z-50 flex flex-col items-center justify-center space-y-6 text-[18px] font-[700] text-[#0955AC] uppercase">
                        {/* Close Button */}
                        <div className="absolute top-4 right-4 cursor-pointer" onClick={toggleMenu}>
                            <FaTimes size={24} />
                        </div>
                        <div onClick={toggleMenu} className="cursor-pointer">Home</div>
                        <div onClick={toggleMenu} className="cursor-pointer">Destinations</div>
                        <div onClick={toggleMenu} className="cursor-pointer">About us</div>
                        <div onClick={toggleMenu} className="cursor-pointer">Services</div>
                        <div onClick={toggleMenu} className="cursor-pointer">FAQ</div>
                        <div onClick={toggleMenu} className="cursor-pointer">Contact us</div>
                        <div onClick={toggleMenu} className="w-[137px] h-[44px] bg-[#0955AC] rounded-[100px] border-[1px] border-[#0955AC] flex justify-center items-center px-4 py-2 text-[#FFFFFF] cursor-pointer">
                            LOGIN
                        </div>
                        <div onClick={toggleMenu} className="w-[137px] h-[44px] bg-[#FFFFFF] rounded-[100px] border-[1px] border-[#0955AC] flex justify-center items-center px-4 py-2 text-[#0955AC] cursor-pointer">
                            Register
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Header;
