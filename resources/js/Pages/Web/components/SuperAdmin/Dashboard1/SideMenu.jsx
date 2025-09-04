import React, { useState } from "react";
import { Search } from "lucide-react";
import homepng from "../../../assets/superAdmin/home.png";
import drop from "../../../assets/superAdmin/Chevron Down.png";
import dropl from "../../../assets/superAdmin/Chevron Right.png";
import features from "../../../assets/superAdmin/Features Icon.png";
import users from "../../../assets/superAdmin/Users Icon.png";
import pricing from "../../../assets/superAdmin/Pricing Icon.png";
import integrations from "../../../assets/superAdmin/Integrations Icon.png";
import settings from "../../../assets/superAdmin/Settings Icon.png";
import webi from "../../../assets/superAdmin/Webflow Icon.png";
import person from "../../../assets/superAdmin/person.png";
import arrow_r from "../../../assets/superAdmin/Arrow Right.png";

const SideMenu = () => {
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);
    const [activeSubsection, setActiveSubsection] = useState("Reports"); // Default to "Reports"

    const toggleDashboard = () => {
        setIsDashboardOpen((prev) => !prev);
    };

    // Function to handle subsection clicks
    const handleSubsectionClick = (subsection) => {
        setActiveSubsection(subsection);
    };

    return (
        <div className="w-[300px] h-[1200px] sm:w-[250px] md:w-[300px] lg:w-[300px]">
            <div className="flex flex-col gap-5 px-[28px] py-[32px] shadow-lg shadow-[#0105114D] sm:px-4 md:px-[28px] lg:px-[28px]">
                <h1 className="text-white text-[25px] font-bold poppins mb-8 sm:text-[20px] md:text-[25px] lg:text-[25px]">
                    COMPANY LOGO
                </h1>
                <div className="py-[8px]">
                    <div className="relative w-[244px] h-[42px] sm:w-[200px] md:w-[244px] lg:w-[244px]">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 sm:left-2 md:left-3 lg:left-3">
                            <Search size={16} />
                        </span>
                        <input
                            type="text"
                            placeholder="Search for..."
                            className="w-full h-full pl-10 pr-3 py-2 rounded-md border-2 border-[#343B4F] focus:outline-none bg-[#181A2A] text-white placeholder-[#AEB9E1]/400 sm:pl-8 md:pl-10 lg:pl-10"
                        />
                    </div>
                </div>
                <div className="w-[244px] flex flex-col py-[10px] sm:w-[200px] md:w-[244px] lg:w-[244px]">
                    <div
                        className="w-[244px] h-[42px] flex flex-row justify-between items-center gap-5 cursor-pointer hover:bg-[#181A2A] rounded-md px-4 sm:w-[200px] md:w-[244px] lg:w-[244px] sm:gap-3 md:gap-5 lg:gap-5"
                        onClick={toggleDashboard}
                        role="button"
                        aria-expanded={isDashboardOpen}
                        aria-controls="dashboard-dropdown"
                    >
                        <div className="flex flex-row justify-center items-center gap-2 sm:gap-1 md:gap-2 lg:gap-2">
                            <img src={homepng} className="size-[14px] sm:size-[12px] md:size-[14px] lg:size-[14px]" />
                            <h1 className="text-[#0955AC] font-[500] text-[18px] sm:text-[16px] md:text-[18px] lg:text-[18px]">
                                Dashboard
                            </h1>
                        </div>
                        <img
                            src={isDashboardOpen ? drop : dropl}
                            className="size-[12px] transition-transform duration-300 sm:size-[10px] md:size-[12px] lg:size-[12px]"
                            alt={isDashboardOpen ? "Collapse" : "Expand"}
                        />
                    </div>
                    <div
                        id="dashboard-dropdown"
                        className={`flex flex-col gap-2 px-[8px] transition-all duration-300 ease-in-out overflow-hidden ${
                            isDashboardOpen
                                ? "max-h-[300px] opacity-100 py-4 translate-y-0"
                                : "max-h-0 opacity-0 py-0 translate-y-[-10px]"
                        } sm:px-2 md:px-[8px] lg:px-[8px]`}
                    >
                        <h1
                            className={`text-[14px] font-[500] px-4 py-2 ${
                                activeSubsection === "All pages"
                                    ? "text-white border border-[#0A1330] bg-[#181A2A] border-l-[3px] border-l-[#0955AC]"
                                    : "text-[#AEB9E1]"
                            } cursor-pointer hover:bg-[#181A2A] sm:text-[12px] md:text-[14px] lg:text-[14px]`}
                            onClick={() => handleSubsectionClick("All pages")}
                        >
                            All pages
                        </h1>
                        <h1
                            className={`text-[14px] font-[500] px-4 py-2 ${
                                activeSubsection === "Reports"
                                    ? "text-white border border-[#0A1330] bg-[#181A2A] border-l-[3px] border-l-[#0955AC]"
                                    : "text-[#AEB9E1]"
                            } cursor-pointer hover:bg-[#181A2A] sm:text-[12px] md:text-[14px] lg:text-[14px]`}
                            onClick={() => handleSubsectionClick("Reports")}
                        >
                            Reports
                        </h1>
                        <h1
                            className={`text-[14px] font-[500] px-4 py-2 ${
                                activeSubsection === "Service"
                                    ? "text-white border border-[#0A1330] bg-[#181A2A] border-l-[3px] border-l-[#0955AC]"
                                    : "text-[#AEB9E1]"
                            } cursor-pointer hover:bg-[#181A2A] sm:text-[12px] md:text-[14px] lg:text-[14px]`}
                            onClick={() => handleSubsectionClick("Service")}
                        >
                            Service
                        </h1>
                        <h1
                            className={`text-[14px] font-[500] px-4 py-2 ${
                                activeSubsection === "Tasks"
                                    ? "text-white border border-[#0A1330] bg-[#181A2A] border-l-[3px] border-l-[#0955AC]"
                                    : "text-[#AEB9E1]"
                            } cursor-pointer hover:bg-[#181A2A] sm:text-[12px] md:text-[14px] lg:text-[14px]`}
                            onClick={() => handleSubsectionClick("Tasks")}
                        >
                            Tasks
                        </h1>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="w-[244px] h-[42px] flex flex-row justify-between items-center cursor-pointer hover:bg-[#181A2A] hover:rounded-[10px] px-4 sm:w-[200px] md:w-[244px] lg:w-[244px]">
                            <div className="flex flex-row justify-center items-center gap-2 sm:gap-1 md:gap-2 lg:gap-2">
                                <img src={features} className="size-[14px] sm:size-[12px] md:size-[14px] lg:size-[14px]" />
                                <h1 className="text-[#AEB9E1] font-[500] text-[18px] sm:text-[16px] md:text-[18px] lg:text-[18px]">
                                    Features
                                </h1>
                            </div>
                            <img
                                src={dropl}
                                className="size-[12px] justify-between sm:size-[10px] md:size-[12px] lg:size-[12px]"
                            />
                        </div>
                        <div className="w-[244px] h-[42px] flex flex-row justify-between items-center cursor-pointer hover:bg-[#181A2A] hover:rounded-[10px] px-4 sm:w-[200px] md:w-[244px] lg:w-[244px]">
                            <div className="flex flex-row justify-center items-center gap-2 sm:gap-1 md:gap-2 lg:gap-2">
                                <img src={users} className="size-[14px] sm:size-[12px] md:size-[14px] lg:size-[14px]" />
                                <h1 className="text-[#AEB9E1] font-[500] text-[18px] sm:text-[16px] md:text-[18px] lg:text-[18px]">
                                    Users
                                </h1>
                            </div>
                            <img
                                src={dropl}
                                className="size-[12px] justify-between sm:size-[10px] md:size-[12px] lg:size-[12px]"
                            />
                        </div>
                        <div className="w-[244px] h-[42px] flex flex-row justify-between items-center cursor-pointer hover:bg-[#181A2A] hover:rounded-[10px] px-4 sm:w-[200px] md:w-[244px] lg:w-[244px]">
                            <div className="flex flex-row justify-center items-center gap-2 sm:gap-1 md:gap-2 lg:gap-2">
                                <img src={pricing} className="size-[14px] sm:size-[12px] md:size-[14px] lg:size-[14px]" />
                                <h1 className="text-[#AEB9E1] font-[500] text-[18px] sm:text-[16px] md:text-[18px] lg:text-[18px]">
                                    Pricing
                                </h1>
                            </div>
                            <img
                                src={dropl}
                                className="size-[12px] justify-between sm:size-[10px] md:size-[12px] lg:size-[12px]"
                            />
                        </div>
                        <div className="w-[244px] h-[42px] flex flex-row justify-between items-center cursor-pointer hover:bg-[#181A2A] hover:rounded-[10px] px-4 sm:w-[200px] md:w-[244px] lg:w-[244px]">
                            <div className="flex flex-row justify-center items-center gap-2 sm:gap-1 md:gap-2 lg:gap-2">
                                <img
                                    src={integrations}
                                    className="size-[14px] sm:size-[12px] md:size-[14px] lg:size-[14px]"
                                />
                                <h1 className="text-[#AEB9E1] font-[500] text-[18px] sm:text-[16px] md:text-[18px] lg:text-[18px]">
                                    Integrations
                                </h1>
                            </div>
                            <img
                                src={dropl}
                                className="size-[12px] justify-between sm:size-[10px] md:size-[12px] lg:size-[12px]"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div className="h-[1px] w-full bg-[#ffffff]/20"></div>
            </div>
            
            <div>
                <div className="w-full h-[42px] flex flex-row justify-between items-center px-[47px] my-[15px] cursor-pointer hover:bg-[#181A2A] hover:rounded-[10px] px-4 sm:px-2 md:px-4 lg:px-[47px]">
                    <div className="flex flex-row justify-center items-center gap-2 sm:gap-1 md:gap-2 lg:gap-2">
                        <img src={settings} className="size-[14px] sm:size-[12px] md:size-[14px] lg:size-[14px]" />
                        <h1 className="text-[#AEB9E1] font-[500] text-[18px] sm:text-[16px] md:text-[18px] lg:text-[18px]">
                            Settings
                        </h1>
                    </div>
                    <img src={dropl} className="size-[12px] justify-between sm:size-[10px] md:size-[12px] lg:size-[12px]" />
                </div>

                <div className="w-full h-[42px] flex flex-row justify-between items-center px-[47px] my-[15px] cursor-pointer hover:bg-[#181A2A] hover:rounded-[10px] px-4 sm:px-2 md:px-4 lg:px-[47px]">
                    <div className="flex flex-row justify-center items-center gap-2 sm:gap-1 md:gap-2 lg:gap-2">
                        <img src={webi} className="size-[14px] sm:size-[12px] md:size-[14px] lg:size-[14px]" />
                        <h1 className="text-[#AEB9E1] font-[500] text-[18px] sm:text-[16px] md:text-[18px] lg:text-[18px]">
                            Template pages
                        </h1>
                    </div>
                    <img src={dropl} className="size-[12px] justify-between sm:size-[10px] md:size-[12px] lg:size-[12px]" />
                </div>

                <div className="w-full h-[42px] flex flex-row justify-between items-center px-[47px] my-[25px] cursor-pointer hover:bg-[#181A2A] hover:rounded-[10px] px-4 py-8 sm:px-2 md:px-4 lg:px-[47px]">
                    <div className="flex flex-row justify-center items-center gap-2 sm:gap-1 md:gap-2 lg:gap-2">
                        <img src={person} className="size-[40px] sm:size-[30px] md:size-[40px] lg:size-[40px]" />
                        <h1 className="flex flex-col text-white font-[500] text-[18px] sm:text-[16px] md:text-[18px] lg:text-[18px]">
                            Jhone Carter
                            <span className="text-[12px] text-[#AEB9E1] sm:text-[10px] md:text-[12px] lg:text-[12px]">
                                Account Settings
                            </span>
                        </h1>
                    </div>
                    <img src={dropl} className="size-[12px] justify-between sm:size-[10px] md:size-[12px] lg:size-[12px]" />
                </div>

                <div className="w-[241px] h-[42px] border border-[#0955AC] bg-[#0955AC] rounded-[5px] flex flex-row justify-center items-center mx-auto sm:w-[200px] md:w-[241px] lg:w-[241px]">
                    <button className="text-white text-[16px] px-[12px] py-[14px] sm:text-[14px] md:text-[16px] lg:text-[16px]">
                        Get template
                    </button>
                    <img src={arrow_r} className="size-[12px] sm:size-[10px] md:size-[12px] lg:size-[12px]" />
                </div>
            </div>
        </div>
    );
};

export default SideMenu;