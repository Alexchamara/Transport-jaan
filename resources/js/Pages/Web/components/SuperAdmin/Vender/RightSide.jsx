import React, { useState } from "react";
import NewUser from "./NewUser"; // Adjust the import path as needed
import VerifiedUser from "./VerifiedUser"; // Adjust the import path as needed
import BlockedUser from './BlockedUser';
import Search from "../../../assets/superAdmin/Search.png";
import DropDownB from "../../../assets/superAdmin/Chevron DownB.svg";
import ArrowLeftB from "../../../assets/superAdmin/Arrow LeftB.svg";
import ArrowRight from "../../../assets/superAdmin/Arrow Right.svg";

// Error boundary to catch rendering errors
class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="text-white p-4">
                    <h2>Error: {this.state.error?.message}</h2>
                    <p>Check the console for details.</p>
                </div>
            );
        }
        return this.props.children;
    }
}

const RightSide = ({ newVendors = [], verifiedVendors = [], blockedVendors = [], totalVendors = 0 }) => {
    const [active, setActive] = useState("new"); // Default active tab

    const buttons = ["new", "verified", "blocked"];

    // Handle tab change
    const handleTabChange = (tab) => {
        setActive(tab);
        console.log("Active tab:", tab);
    };

    // Get current data based on active tab
    const getCurrentData = () => {
        switch (active) {
            case "new":
                return newVendors;
            case "verified":
                return verifiedVendors;
            case "blocked":
                return blockedVendors;
            default:
                return [];
        }
    };

    // Function to render the correct component
    const renderComponent = () => {
        console.log("Rendering component for tab:", active);
        const currentData = getCurrentData();

        switch (active) {
            case "new":
                return <NewUser vendors={currentData} />;
            case "verified":
                return <VerifiedUser vendors={currentData} />;
            case "blocked":
                return <BlockedUser vendors={currentData} />;
            default:
                return <NewUser vendors={currentData} />;
        }
    };

    return (
        <div className="flex flex-col gap-6 poppins h-auto">
            <div className="w-[1125px] h-[42px] flex flex-row justify-between items-center px-4 md:px-12 lg:px-47 my-6 md:my-10 lg:my-[25px]">
                <div className="flex flex-row justify-center items-center gap-6">
                    <h1 className="text-white text-base md:text-lg lg:text-[24px] font-poppins">
                        Service Providers
                    </h1>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-row gap-4 mx-12">
                {buttons.map((btn) => (
                    <button
                        key={btn}
                        onClick={() => handleTabChange(btn)}
                        className={`text-[15px] w-[130px] px-[9px] py-[6px] rounded-[5px] border
                            ${
                                active === btn
                                    ? "text-white border-[#0955AC] bg-[#0955AC]"
                                    : "text-[#AEB9E1] border-[#0B1739] bg-[#0A1330]"
                            }`}
                    >
                        {btn === "new" ? "New users" : btn === "verified" ? "Verified users" : "Blocked users"}
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="flex flex-row gap-2 items-center mx-12">
                <div className="w-[260px] flex flex-row items-center border border-[#343B4F] bg-[#0B1739] rounded-[4px] overflow-hidden px-2">
                    <img src={Search} alt="Search" className="size-[12px]" />
                    <input
                        placeholder="Search for..."
                        className="bg-transparent text-[#ffffff] text-[12px] outline-none border-none focus:outline-none focus:ring-0 p-2 w-full"
                    />
                </div>
            </div>

            {/* Render the selected component */}
            <div className="w-full max-w-[1125px] min-h-[800px] mx-[48px] mt-6">
                <div className="w-full max-w-[1035px] min-h-[800px] border border-[#343B4F] bg-[#0B1739] rounded-[10px] overflow-auto">
                    <ErrorBoundary>
                        {renderComponent()}
                    </ErrorBoundary>
                </div>
            </div>

            {/* Pagination */}
            <div>
                <div className="flex flex-row justify-between items-center mt-5 mx-[48px] w-[1032px]">
                    <h1 className="text-white text-[12px] font-500">
                        {getCurrentData().length > 0 ? `1 - ${getCurrentData().length}` : '0'} of {getCurrentData().length}
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
