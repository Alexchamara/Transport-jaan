import React, { useState } from "react";
import locationBlue from "../../assets/vehicleList/locationBlue.png";
import blueCube from "../../assets/courierService/blueCube.png";
import cm from "../../assets/courierService/cm.png";
import kg from "../../assets/courierService/kg.png";

const ShippingSolution = () => {
    const [selectedTab, setSelectedTab] = useState("shipping-routes");

    const handleTabClick = (tab) => {
        setSelectedTab(tab);
    };

    const getTabStyle = (tab) => {
        const baseStyle =
            "lg:h-[76px] lg:w-[200px] xl:w-[245px] border-[1px] border-b-[0px] border-[#0955AC] flex justify-center items-center cursor-pointer py-5 px-5 relative";
        const selectedStyle = "bg-[#0955AC] text-[#FFFFFF]";
        const unselectedStyle = "bg-[#D9D9D9] text-[#000000]";

        if (tab === "shipping-routes") {
            return `${baseStyle} rounded-tl-[22px] rounded-tr-[22px] lg:rounded-tr-[0px] md:rounded-tr-[0px] ${
                selectedTab === tab ? selectedStyle : unselectedStyle
            }`;
        } else if (tab === "drop-point") {
            return `${baseStyle} rounded-tr-[22px]rounded-tr-[0px] ${
                selectedTab === tab ? selectedStyle : unselectedStyle
            }`;
        } else {
            return `${baseStyle}  ${
                selectedTab === tab ? selectedStyle : unselectedStyle
            }`;
        }
    };

    return (
        <div className="bg-[#E7E7E7] py-5 px-4 sm:px-6 lg:px-8 xl:px-20">
            <div className="flex flex-col justify-center items-center">
                <h1 className="bebas-neue text-[40px]/[130%] font-[400] text-center">
                    Global <span className="text-[#0955AC]"> Shipping</span> Solution
                </h1>

                <div className="flex flex-col py-10 w-full max-w-[1285px] mx-auto">
                    <div className="bebas-neue flex flex-col sm:flex-row text-[24px] font-[400] relative">
                        <div
                            className={getTabStyle("shipping-routes")}
                            onClick={() => handleTabClick("shipping-routes")}
                        >
                            shipping routes
                            {selectedTab === "shipping-routes" && (
                                <div className="absolute bottom-[20px] left-1/2 transform -translate-x-1/2 w-[50%] h-[2px] bg-white"></div>
                            )}
                        </div>
                        <div
                            className={getTabStyle("tracking")}
                            onClick={() => handleTabClick("tracking")}
                        >
                            tracking
                            {selectedTab === "tracking" && (
                                <div className="absolute bottom-[20px] left-1/2 transform -translate-x-1/2 w-[50%] h-[2px] bg-white"></div>
                            )}
                        </div>
                        <div
                            className={getTabStyle("drop-point")}
                            onClick={() => handleTabClick("drop-point")}
                        >
                            drop point
                            {selectedTab === "drop-point" && (
                                <div className="absolute bottom-[20px] left-1/2 transform -translate-x-1/2 w-[50%] h-[2px] bg-white"></div>
                            )}
                        </div>
                    </div>

                    <div className="lg:h-[343px] w-full border-[1px] lg:rounded-tr-[22px] rounded-b-[22px] border-[#0955AC] bg-[#0955ACAB] flex justify-center items-center">
                        <form className="px-5 sm:px-8 lg:px-10 py-8 lg:py-10 w-full">
                            {/* From / To */}
                            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                                <div className="flex-1">
                                    <label htmlFor="from" className="block mb-1 text-white">
                                        From
                                    </label>
                                    <div className="relative flex items-center">
                                        <img
                                            src={locationBlue}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                                            alt="location"
                                        />
                                        <input
                                            type="text"
                                            id="from"
                                            value={""}
                                            onChange={""}
                                            placeholder="Search a location"
                                            className="shadow-sm appearance-none w-full lg:w-[280px] xl:w-[300px] h-[56px] border-[1px] border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline pl-12 placeholder:text-[#286BB6]"
                                        />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="to" className="block mb-1 text-white">
                                        To
                                    </label>
                                    <div className="relative flex items-center">
                                        <img
                                            src={locationBlue}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                                            alt="location"
                                        />
                                        <input
                                            type="text"
                                            id="to"
                                            value={""}
                                            onChange={""}
                                            placeholder="Search a location"
                                            className="shadow-sm appearance-none w-full lg:w-[280px] xl:w-[300px] h-[56px] border-[1px] border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline pl-12 placeholder:text-[#286BB6]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Second Row */}
                            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 py-8 lg:py-10 lg:items-end justify-between">
                                {/* Weight */}
                                <div>
                                    <label htmlFor="Weight" className="block mb-1 text-white">
                                        Weight
                                    </label>
                                    <div className="relative flex items-center">
                                        <img
                                            src={blueCube}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                                            alt="weight"
                                        />
                                        <input
                                            type="text"
                                            id="Weight"
                                            value={""}
                                            onChange={""}
                                            placeholder="Enter Weight"
                                            className="shadow-sm appearance-none w-full xl:w-[265px] h-[56px] border-[1px] border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline pl-12 placeholder:text-[#286BB6]"
                                        />
                                    </div>
                                </div>

                                {/* Volume */}
                                <div>
                                    <label htmlFor="Length" className="block mb-1 text-white">
                                        Volume
                                    </label>
                                    <div className="relative flex items-center">
                                        <input
                                            type="text"
                                            id="Length"
                                            value={""}
                                            onChange={""}
                                            placeholder="Length"
                                            className="shadow-sm appearance-none w-full xl:w-[204px] h-[56px] border-[1px] border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline pl-5 placeholder:text-[#286BB6]"
                                        />
                                        <img
                                            src={cm}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                                            alt="cm"
                                        />
                                    </div>
                                </div>

                                {/* Width */}
                                <div>
                                    <label htmlFor="Width" className="block mb-1 text-white">
                                        Width
                                    </label>
                                    <div className="relative flex items-center">
                                        <input
                                            type="text"
                                            id="Width"
                                            value={""}
                                            onChange={""}
                                            placeholder="Width"
                                            className="shadow-sm appearance-none w-full xl:w-[204px] h-[56px] border-[1px] border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline pl-5 placeholder:text-[#286BB6]"
                                        />
                                        <img
                                            src={kg}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                                            alt="kg"
                                        />
                                    </div>
                                </div>

                                {/* Width (duplicate) */}
                                <div>
                                    <label htmlFor="width" className="block mb-1 text-white">
                                        Width
                                    </label>
                                    <div className="relative flex items-center">
                                        <input
                                            type="text"
                                            id="width"
                                            value={""}
                                            onChange={""}
                                            placeholder="Width"
                                            className="shadow-sm appearance-none w-full xl:w-[204px] h-[56px] border-[1px] border-[#0000001A] rounded-[8px] p-[16px] leading-tight focus:outline-none focus:shadow-outline pl-5 placeholder:text-[#286BB6]"
                                        />
                                        <img
                                            src={kg}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                                            alt="kg"
                                        />
                                    </div>
                                </div>

                                <button className="bg-[#0955AC] text-white font-bold size-[56px] w-full sm:w-[56px] flex items-center justify-center rounded-[8px] focus:outline-none focus:shadow-outline cursor-pointer mt-6 lg:mt-0">
                                    →
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingSolution;