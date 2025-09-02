import React, { useState } from "react";
import dashLogo from "../../../assets/vendors/dashboard/dashLogo.svg";
import bookLogo from "../../../assets/vendors/dashboard/bookLogo.svg";
import uniLogo from "../../../assets/vendors/dashboard/uniLogo.svg";
import calendarLogo from "../../../assets/vendors/dashboard/calendarLogo.svg";
import clientsLogo from "../../../assets/vendors/dashboard/clientsLogo.svg";
import driversLogo from "../../../assets/vendors/dashboard/driversLogo.svg";
import finLogo from "../../../assets/vendors/dashboard/finLogo.svg";
import trackLogo from "../../../assets/vendors/dashboard/trackLogo.svg";
import messgLogo from "../../../assets/vendors/dashboard/messgLogo.svg";
import logOutLogo from "../../../assets/vendors/dashboard/logOutLogo.svg";

const SideMenu = () => {
    const [showFinancialDropdown, setShowFinancialDropdown] = useState(false);
    const currentPath = window.location.pathname;

    return (
        <div className="poppins min-w-[289px] h-[1070px] bg-[#FFFFFF] flex flex-col items-center py-10 px-10 rounded-tr-[10px] rounded-br-[10px]">
            <h1 className="text-[25px] font-[700] text-center uppercase">
                Company <br /> <span className="text-[#0955AC]">Logo</span>{" "}
            </h1>

            <div className="relative figtree flex flex-col items-start gap-10 text-[24px] font-[500] text-[#00000066] h-full py-10">
                <div
                    className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-4 py-2 ${
                        currentPath === "/vendors/multimodal/dashboard"
                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                            : "text-[#00000066]"
                    }`}
                    onClick={() => (window.location.href = "/multimodal/dashboard")}
                >
                    <img src={dashLogo} className="w-[25px]" />
                    <h1>Dashboard</h1>
                </div>
                <div
                    className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-4 py-2 ${
                        currentPath === "/vendors/multimodal/bookings"
                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                            : "text-[#00000066]"
                    }`}
                    onClick={() => (window.location.href = "/multimodal/bookings")}
                >
                    <img src={bookLogo} className="w-[25px]" />
                    <h1>Bookings</h1>
                </div>
                <div
                    className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-4 py-2 ${
                        currentPath === "/vendors/multimodal/units"
                            ? "bg-[#0955AC29] text-[#000000]  font-[700]"
                            : "text-[#00000066]"
                    }`}
                    onClick={() => (window.location.href = "/multimodal/units")}
                >
                    <img src={uniLogo} className="w-[25px]" />
                    <h1>Units</h1>
                </div>
                <div
                    className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-4 py-2 ${
                        currentPath === "/vendors/multimodal/calendar"
                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                            : "text-[#00000066]"
                    }`}
                    onClick={() => (window.location.href = "/multimodal/calendar")}
                >
                    <img src={calendarLogo} className="w-[25px]" />
                    <h1>Calendar</h1>
                </div>
                <div
                    className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-4 py-2 ${
                        currentPath === "/vendors/multimodal/clients"
                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                            : "text-[#00000066]"
                    }`}
                    onClick={() => (window.location.href = "/multimodal/clients")}
                >
                    <img src={clientsLogo} className="w-[25px]" />
                    <h1>Clients</h1>
                </div>
                {/* <div
                    className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-4 py-2 ${
                        currentPath === "/vendors/drivers"
                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                            : "text-[#00000066]"
                    }`}
                    onClick={() => (window.location.href = "/vendors/drivers")}
                >
                    <img src={driversLogo} className="w-[25px]" />
                    <h1>Drivers</h1>
                </div> */}
                <div
                    className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-4 py-2 ${
                        ["/vendors/multimodal/payment", "/multimodal/expenses"].includes(currentPath)
                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                            : "text-[#00000066]"
                    }`}
                >
                    <img src={finLogo} className="w-[25px]" />
                    <h1
                        onClick={() =>
                            setShowFinancialDropdown((prev) => !prev)
                        }
                    >
                        Financial
                    </h1>
                </div>
                {showFinancialDropdown && (
                    <div className="ml-10 mb-2 w-40 bg-white flex flex-col text-[24px] font-[500]">
                        <div
                            className={`px-4 py-2 cursor-pointer rounded-lg ${
                                currentPath === "/vendors/multimodal/payment"
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                            }`}
                            onClick={() => (window.location.href = "/multimodal/payment")}
                        >
                            Payment
                        </div>
                        <div
                            className={`px-4 py-2 cursor-pointer rounded-lg ${
                                currentPath === "/vendors/multimodal/expenses"
                                    ? "bg-[#0955AC29] text-[#000000] font-[700]"
                                    : "text-[#00000066]"
                            }`}
                            onClick={() => (window.location.href = "/multimodal/expenses")}
                        >
                            Expenses
                        </div>
                    </div>
                )}
                <div
                    className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-4 py-2 ${
                        currentPath === "/vendors/multimodal/tracking"
                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                            : "text-[#00000066]"
                    }`}
                    onClick={() => (window.location.href = "/multimodal/tracking")}
                >
                    <img src={trackLogo} className="w-[25px]" />
                    <h1>Tracking</h1>
                </div>
                <div
                    className={`flex flex-row justify-start items-center gap-5 cursor-pointer w-full rounded-lg px-4 py-2 ${
                        currentPath === "/vendors/multimodal/message"
                            ? "bg-[#0955AC29] text-[#000000] font-[700]"
                            : "text-[#00000066]"
                    }`}
                    onClick={() => (window.location.href = "/multimodal/message")}
                >
                    <img src={messgLogo} className="w-[25px]" />
                    <h1>Message</h1>
                </div>
                <div className="absolute bottom-10 flex flex-row justify-start items-center gap-5 cursor-pointer">
                    <img src={logOutLogo} className="w-[25px]" />
                    <h1>Logout</h1>
                </div>
            </div>
        </div>
    );
};

export default SideMenu;
