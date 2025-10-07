import React, { useState } from "react";
import Search from "../../../assets/superAdmin/Search.png";
import Warehouse from './Warehouse'
import DropDownB from "../../../assets/superAdmin/Chevron DownB.svg";
import ArrowLeftB from "../../../assets/superAdmin/Arrow LeftB.svg";
import ArrowRight from "../../../assets/superAdmin/Arrow Right.svg";

const warehouseTypeFilterOptions = [
    { value: "all", label: "All Types" },
    { value: "cold_storage", label: "Cold Storage" },
    { value: "dry", label: "Dry Storage" },
    { value: "bonded", label: "Bonded Warehouse" },
    { value: "open_yard", label: "Open Yard" },
    { value: "climate_controlled", label: "Climate Controlled" },
    { value: "hazmat", label: "Hazmat Storage" },
];

const RightSide = ({ warehouses = {}, filters = {}, error }) => {
    const [selectedType, setSelectedType] = useState(filters.type_filter || ""); // State for warehouse type filter

    // Handle filter selection
    const handleTypeFilterChange = (e) => {
        setSelectedType(e.target.value);
        console.log("Selected Warehouse Type:", e.target.value);
    };

    return (
        <div className="flex flex-col gap-6 poppins h-auto">
            <div className="w-[1125px] h-[42px] flex flex-row justify-between items-center px-4 md:px-12 lg:px-47 my-6 md:my-10 lg:my-[25px]">
                <div className="flex flex-row justify-center items-center gap-6">
                    <h1 className="text-white text-base md:text-lg lg:text-[24px] font-poppins">
                        Warehouse
                    </h1>
                </div>
            </div>

            {/* Search and Filter */}
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
                        value={selectedType}
                        onChange={handleTypeFilterChange}
                        className="w-full bg-[#0B1739] border border-[#343B4F] text-[#ffffff] text-[12px] rounded-[4px] p-2 focus:outline-none focus:ring-0 focus:border-[#343B4F] cursor-pointer"
                    >
                        {warehouseTypeFilterOptions.map((option, index) => (
                            <option key={index} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Render Warehouse Component */}
            <div className="w-[1125px] h-[800px] mx-[48px] mt-6">
                <div className="w-[1035px] h-[800px] border border-[#343B4F] bg-[#0B1739] rounded-[10px]">
                    {error ? (
                        <div className="flex items-center justify-center h-full text-red-500">
                            <p>{error}</p>
                        </div>
                    ) : (
                        <Warehouse
                            typeFilter={selectedType}
                            warehouses={warehouses.data || []}
                        />
                    )}
                </div>
            </div>

            {/* Pagination */}
            <div>
                <div className="flex flex-row justify-between items-center mt-5 mx-[48px] w-[1032px]">
                    <h1 className="text-white text-[12px] font-500">
                        {warehouses.from || 1} - {warehouses.to || 0} of {warehouses.total || 0}
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
