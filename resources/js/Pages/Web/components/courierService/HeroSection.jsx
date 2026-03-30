import React, { useState } from "react";
import { Link } from "@inertiajs/react";
import bg from "../../assets/courierService/bg.png";
import person from "../../assets/courierService/person.png";

const HeroSection = () => {
    const [showTrackingModal, setShowTrackingModal] = useState(false);

    const handleTrackingClick = (e) => {
        e.preventDefault();
        setShowTrackingModal(true);
    };

    return (
        <div className="relative h-[700px] lg:h-[600px]">
            <img src={bg} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-[#000000B8]" />
            <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4">
                    <div className="relative text-white flex flex-row items-center justify-between gap-8">
                        {/* text section */}
                        <div className="">
                            <div className="h-[5px] w-[125px] bg-[#FFFFFF] rounded-sm" />
                            <h1 className="mt-8 bebas-neue text-[38px] md:text-[78px]/[70px] font-[400] leading-tight">
                                Fast,{" "}
                                <span className="text-[#0955AC]">
                                    {" "}
                                    Secure,{" "}
                                </span>
                                and{" "}
                                <span className="text-[#0955AC]">
                                    {" "}
                                    Affordable{" "}
                                </span>
                                Worldwide{" "}
                                <span className="text-[#0955AC]">
                                    {" "}
                                    Shipping{" "}
                                </span>
                            </h1>
                            <p className="mt-10 poppins text-[14px] md:text-[18px]/[20px] text-justify">
                                Experience hassle-free delivery to over 200
                                countries with our fast, secure, and affordable
                                courier services. From same-day deliveries to
                                logistic freight, we offer a range of
                                solutions to suit your needs. Start shipping
                                today with just a few clicks.
                            </p>
                            {/* button section */}
                            <div className="figtree mt-20 lg:gap-7 gap-5 flex flex-col md:flex-row w-full text-[12px] md:text-[16px] font-[700]">
                                <Link
                                    href="/couriers/create"
                                    className="bg-[#0955AC] text-white rounded-lg transition duration-300  w-[100px] h-[40px] md:w-[202px] md:h-[56px] flex justify-center items-center"
                                >
                                    Send a package
                                </Link>
                                <button
                                    onClick={handleTrackingClick}
                                    className="bg-[#FFFFFF82] border-[2px] border-[#0955AC] text-[#0955AC] rounded-lg transition duration-300 w-[100px] h-[40px] md:w-[202px] md:h-[56px] flex justify-center items-center hover:bg-[#FFFFFF] cursor-pointer"
                                >
                                    Track Parcel
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-end w-full h-auto overflow-visible">
                            <img
                                src={person}
                                alt="Courier service person"
                                className="h-[500px] hidden lg:block lg:absolute lg:top-[32px] xl:top-[-12px] right-0 object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tracking Coming Soon Modal */}
            {showTrackingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-[20px] p-8 max-w-md w-full shadow-2xl">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-[#0955AC] rounded-full flex items-center justify-center mb-4">
                                <svg 
                                    className="w-8 h-8 text-white" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                                    />
                                </svg>
                            </div>
                            <h2 className="text-[24px] font-[700] text-[#000000] mb-2">
                                Coming Soon!
                            </h2>
                            <p className="text-[16px] text-[#6B6B6B] mb-6">
                                Parcel tracking functionality will be available once the courier APIs are connected. Stay tuned!
                            </p>
                            <button
                                onClick={() => setShowTrackingModal(false)}
                                className="bg-[#0955AC] text-white font-[700] px-8 py-3 rounded-lg hover:bg-[#074494] transition-colors"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HeroSection;
