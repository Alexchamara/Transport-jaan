import React, { useState } from "react";
import Search from "../../../assets/superAdmin/Search.png";
import Credentials from "./Credentials";
import PersonalInformation from "./PersonalInformation";
import BasicInformation from "./BasicInformation";
import TeamInformation from "./TeamInformation";
import Billing from "./Billing";
import Notification from "./Notification";

const RightSide = () => {
    const [activeSection, setActiveSection] = useState("personal"); // Default to personal

    return (
        <div className="poppins flex flex-col gap-5">
            <div className="poppins flex flex-row gap-5">
                <div className="flex flex-col gap-5">
                    <div className="w-[1125px] h-[42px] flex flex-row justify-between items-center px-4 md:px-12 lg:px-47 my-6 md:my-10 lg:my-[25px]">
                        <div className="flex flex-row justify-center items-center gap-6">
                            <h1 className="text-white text-base md:text-lg lg:text-[24px] font-poppins">
                                Add User
                            </h1>
                            <div className="flex flex-row items-center border border-[#343B4F] bg-[#0B1739] rounded-[4px] overflow-hidden px-2">
                                <img
                                    src={Search}
                                    alt="Search"
                                    className="size-[12px]"
                                />
                                <input
                                    placeholder="Search for..."
                                    className="bg-transparent text-[#ffffff] text-[12px] outline-none border-none focus:outline-none focus:ring-0 p-2 w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-row h-auto">
                <div className="flex flex-row px-12">
                    <Credentials setActiveSection={setActiveSection} activeSection={activeSection} />
                </div>
                <div>
                    <div className="w-[1px] h-full bg-[#343B4F]"></div>
                </div>
                <div className="px-12">
                    {activeSection === "personal" && (
                        <div className="flex flex-col gap-20">
                            <PersonalInformation />
                            <BasicInformation />
                        </div>
                    )}
                    {activeSection === "team" && <TeamInformation />}
                    {activeSection === "billing" && <Billing />}
                    {activeSection === "notification" && <Notification />}
                </div>
            </div>
        </div>
    );
};

export default RightSide;