import React from "react";
import Pencil from "../../../assets/superAdmin/Pencil IconW.svg";
import User from "../../../assets/superAdmin/Users Icon.png";
import Billing from "../../../assets/superAdmin/Card Icon.svg";
import Notification from "../../../assets/superAdmin/Notifications Icon.svg";

const Credentials = ({ setActiveSection, activeSection }) => {
    return (
        <div className="w-[250px] h-[238px] flex flex-col gap-6">
            <h1 className="text-white text-[16px] font-500">Credentials</h1>

            <div className="flex flex-col gap-6">
                <div
                    className={`flex flex-row items-center gap-2 px-4 border rounded-[8px] px-1 py-2 cursor-pointer ${
                        activeSection === "personal"
                            ? "border-[#0A1330] bg-[#0A1330]"
                            : "border-transparent"
                    }`}
                    onClick={() => setActiveSection("personal")}
                >
                    <img src={Pencil} className="size-[12px]" />
                    <h1
                        className={`text-[14px] font-500 ${
                            activeSection === "personal" ? "text-white" : "text-[#D1DBF9]"
                        }`}
                    >
                        Personal Information
                    </h1>
                </div>

                <div
                    className={`flex flex-row items-center gap-2 px-4 py-2 rounded-[8px] cursor-pointer ${
                        activeSection === "team"
                            ? "border-[#0A1330] bg-[#0A1330]"
                            : "border-transparent"
                    }`}
                    onClick={() => setActiveSection("team")}
                >
                    <img src={User} className="size-[12px]" />
                    <h1
                        className={`text-[14px] font-500 ${
                            activeSection === "team" ? "text-white" : "text-[#D1DBF9]"
                        }`}
                    >
                        Team
                    </h1>
                </div>

                <div
                    className={`flex flex-row items-center gap-2 px-4 py-2 rounded-[8px] cursor-pointer ${
                        activeSection === "billing"
                            ? "border-[#0A1330] bg-[#0A1330]"
                            : "border-transparent"
                    }`}
                    onClick={() => setActiveSection("billing")}
                >
                    <img src={Billing} className="size-[12px]" />
                    <h1
                        className={`text-[14px] font-500 ${
                            activeSection === "billing" ? "text-white" : "text-[#D1DBF9]"
                        }`}
                    >
                        Billing
                    </h1>
                </div>

                <div
                    className={`flex flex-row items-center gap-2 px-4 py-2 rounded-[8px] cursor-pointer ${
                        activeSection === "notification"
                            ? "border-[#0A1330] bg-[#0A1330]"
                            : "border-transparent"
                    }`}
                    onClick={() => setActiveSection("notification")}
                >
                    <img src={Notification} className="size-[12px]" />
                    <h1
                        className={`text-[14px] font-500 ${
                            activeSection === "notification" ? "text-white" : "text-[#D1DBF9]"
                        }`}
                    >
                        Notification
                    </h1>
                </div>
            </div>
        </div>
    );
};

export default Credentials;