import React, { useState } from "react";
import Search from "../../../assets/superAdmin/Search.png";
import Land from "../../SuperAdmin/Vehicles/Land";
import Sea from "../../SuperAdmin/Vehicles/Sea";
import Air from "../../SuperAdmin/Vehicles/Air";
import DropDownB from "../../../assets/superAdmin/Chevron DownB.svg";
import ArrowLeftB from "../../../assets/superAdmin/Arrow LeftB.svg";
import ArrowRight from "../../../assets/superAdmin/Arrow Right.svg";

// Fallback filter options (aligned with land.jsx data)
const fallbackStatusFilterOptions = [
    { value: "all", label: "All Statuses" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
];

const fallbackApprovalFilterOptions = [
    { value: "all", label: "All Approvals" },
    { value: "Approved", label: "Approved" },
    { value: "Pending", label: "Pending" },
    { value: "Canceled", label: "Canceled" },
];

const RightSide = () => {
    const [active, setActive] = useState("Land"); // Default active tab
    const [selectedStatus, setSelectedStatus] = useState(""); // State for status filter
    const [selectedApproval, setSelectedApproval] = useState(""); // State for approval filter

    const buttons = ["Land", "Sea", "Air"];

    // Function to get filter options based on active tab
    const getFilterOptions = () => {
        let statusFilterOptions = fallbackStatusFilterOptions;
        let approvalFilterOptions = fallbackApprovalFilterOptions;

        try {
            if (active === "Land") {
                const landModule = require("../../SuperAdmin/Vehicles/Land");
                statusFilterOptions = landModule.statusFilterOptions || fallbackStatusFilterOptions;
                approvalFilterOptions = landModule.approvalFilterOptions || fallbackApprovalFilterOptions;
            } else if (active === "Sea") {
                const seaModule = require("../../SuperAdmin/Vehicles/Sea");
                statusFilterOptions = seaModule.statusFilterOptions || fallbackStatusFilterOptions;
                approvalFilterOptions = seaModule.approvalFilterOptions || fallbackApprovalFilterOptions;
            } else if (active === "Air") {
                const airModule = require("../../SuperAdmin/Vehicles/Air");
                statusFilterOptions = airModule.statusFilterOptions || fallbackStatusFilterOptions;
                approvalFilterOptions = airModule.approvalFilterOptions || fallbackApprovalFilterOptions;
            }
        } catch (e) {
            console.error(`Failed to import filter options for ${active}:`, e);
        }

        return { statusFilterOptions, approvalFilterOptions };
    };

    // Get the filter options for the active tab
    const { statusFilterOptions, approvalFilterOptions } = getFilterOptions();

    // Log filter options for debugging
    console.log("Status Filter Options:", statusFilterOptions);
    console.log("Approval Filter Options:", approvalFilterOptions);

    // Handle filter selections
    const handleStatusFilterChange = (e) => {
        setSelectedStatus(e.target.value);
        console.log("Selected Status Filter:", e.target.value);
    };

    const handleApprovalFilterChange = (e) => {
        setSelectedApproval(e.target.value);
        console.log("Selected Approval Filter:", e.target.value);
    };

    // Handle tab change with filter reset
    const handleTabChange = (tab) => {
        setActive(tab);
        setSelectedStatus(""); // Reset status filter
        setSelectedApproval(""); // Reset approval filter
    };

    // Function to render the correct component with filter props
    const renderComponent = () => {
        switch (active) {
            case "Land":
                return (
                    <Land
                        statusFilter={selectedStatus}
                        approvalFilter={selectedApproval}
                    />
                );
            case "Sea":
                return (
                    <Sea
                        statusFilter={selectedStatus}
                        approvalFilter={selectedApproval}
                    />
                );
            case "Air":
                return (
                    <Air
                        statusFilter={selectedStatus}
                        approvalFilter={selectedApproval}
                    />
                );
            default:
                return (
                    <Land
                        statusFilter={selectedStatus}
                        approvalFilter={selectedApproval}
                    />
                );
        }
    };

    return (
        <div className="flex flex-col gap-6 poppins h-auto">
            <div className="w-[1125px] h-[42px] flex flex-row justify-between items-center px-4 md:px-12 lg:px-47 my-6 md:my-10 lg:my-[25px]">
                <div className="flex flex-row justify-center items-center gap-6">
                    <h1 className="text-white text-base md:text-lg lg:text-[24px] font-poppins">
                        Vehicles
                    </h1>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-row gap-4 mx-12">
                {buttons.map((btn) => (
                    <button
                        key={btn}
                        onClick={() => handleTabChange(btn)}
                        className={`text-[15px] w-[80px] px-[9px] py-[6px] rounded-[5px] border
              ${
                  active === btn
                      ? "text-white border-[#0955AC] bg-[#0955AC]" // Active
                      : "text-[#AEB9E1] border-[#0B1739] bg-[#0A1330]" // Inactive
              }`}
                    >
                        {btn}
                    </button>
                ))}
            </div>
            <div className="flex flex-row gap-2 items-center mx-12">
                <div className="w-[260px] flex flex-row items-center border border-[#343B4F] bg-[#0B1739] rounded-[4px] overflow-hidden px-2">
                    <img src={Search} alt="Search" className="size-[12px]" />
                    <input
                        placeholder="Search for..."
                        className="bg-transparent text-[#ffffff] text-[12px] outline-none border-none focus:outline-none focus:ring-0 p-2 w-full"
                    />
                </div>
                <div className="w-[150px]">
                    <select
                        value={selectedStatus}
                        onChange={handleStatusFilterChange}
                        className="w-full bg-[#0B1739] border border-[#343B4F] text-[#ffffff] text-[12px] rounded-[4px] p-2 focus:outline-none focus:ring-0"
                    >
                        {statusFilterOptions.map((option, index) => (
                            <option key={index} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="w-[150px]">
                    <select
                        value={selectedApproval}
                        onChange={handleApprovalFilterChange}
                        className="w-full bg-[#0B1739] border border-[#343B4F] text-[#ffffff] text-[12px] rounded-[4px] p-2 focus:outline-none focus:ring-0"
                    >
                        {approvalFilterOptions.map((option, index) => (
                            <option key={index} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Render the selected component */}
            <div className="w-[1125px] h-[800px] mx-[48px] mt-6">
                <div className="w-[1035px] h-[800px] border border-[#343B4F] bg-[#0B1739] rounded-[10px]">
                    {renderComponent()}
                </div>
            </div>

            <div>
                <div className="flex flex-row justify-between items-center mt-5 mx-[48px] w-[1032px]">
                    <h1 className="text-white text-[12px] font-500">
                        1 - 10 of 460
                    </h1>
                    <h1 className="text-[#AEB9E1] text-[12px] font-500 flex flex-row justify-center items-center gap-6">
                        Rows per page:
                        <span className="flex flex-row justify-center items-center gap-1 text-white border border-[#0B1739] bg-[#0A1330] py-[6px] px-[8px]">
                            10 <img src={DropDownB} className="size-[12px]" />
                        </span>
                        <div className="flex flex-row justify-center items-center gap-2">
                            <button className="border border-[#0B1739] bg-[#0A1330] p-[6px]">
                                <img src={ArrowLeftB} className="size-[14px]" />
                            </button>
                            <button className="border border-[#0B1739] bg-[#0A1330] p-[6px]">
                                <img src={ArrowRight} className="size-[14px]" />
                            </button>
                        </div>
                    </h1>
                </div>
            </div>
        </div>
    );
};

export default RightSide;