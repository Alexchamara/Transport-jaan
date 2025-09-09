import React, { useState, useEffect } from "react";
import { Inertia } from "@inertiajs/inertia";
import search from "../../../../assets/vendors/dashboard/searchIcon.svg";
import settings from "../../../../assets/vendors/dashboard/settings.svg";
import bell from "../../../../assets/vendors/dashboard/bell.svg";
import proPic from "../../../../assets/vendors/dashboard/proPic.svg";

import filterIcon from "../../../../assets/vendors/dashboard/icons/filterIcon.svg";
import miniSearchIcon from "../../../../assets/vendors/dashboard/icons/miniSearchIcon.svg";
import miniDownArrow from "../../../../assets/vendors/dashboard/icons/miniDownArrow.svg";

import car1 from "../../../../assets/vendors/dashboard/icons/car1.svg";
import availableIcon from "../../../../assets/vendors/units/availableIcon.svg";

import icon1 from "../../../../assets/vendors/units/icons/icon1.svg";
import icon2 from "../../../../assets/vendors/units/icons/icon2.svg";
import icon3 from "../../../../assets/vendors/units/icons/icon3.svg";
import icon4 from "../../../../assets/vendors/units/icons/icon4.svg";

import editIcon from "../../../../assets/vendors/units/edit.svg";
import deleteIcon from "../../../../assets/vendors/units/delete.svg";

import AddUnit from "../../../../home/vendors/multimodal/AddUnit";

const UnitContent = () => {
    // Sample data array for units
    const units = [
        {
            id: 1,
            brand: "Hyundai",
            model: "tucson",
            price: 130,
            status: "Available",
            unitsCount: 3,
            mileage: "4,000",
            transmission: "Auto",
            capacity: "4 Person",
            fuelType: "Electric",
        },
        {
            id: 2,
            brand: "Hyundai",
            model: "tucson",
            price: 130,
            status: "Available",
            unitsCount: 3,
            mileage: "4,000",
            transmission: "Auto",
            capacity: "4 Person",
            fuelType: "Electric",
        },
        {
            id: 3,
            brand: "Hyundai",
            model: "tucson",
            price: 130,
            status: "Available",
            unitsCount: 3,
            mileage: "4,000",
            transmission: "Auto",
            capacity: "4 Person",
            fuelType: "Electric",
        },
        {
            id: 4,
            brand: "Hyundai",
            model: "tucson",
            price: 130,
            status: "Available",
            unitsCount: 3,
            mileage: "4,000",
            transmission: "Auto",
            capacity: "4 Person",
            fuelType: "Electric",
        },
        {
            id: 5,
            brand: "Hyundai",
            model: "tucson",
            price: 130,
            status: "Available",
            unitsCount: 3,
            mileage: "4,000",
            transmission: "Auto",
            capacity: "4 Person",
            fuelType: "Electric",
        },
        {
            id: 6,
            brand: "Hyundai",
            model: "tucson",
            price: 130,
            status: "Available",
            unitsCount: 3,
            mileage: "4,000",
            transmission: "Auto",
            capacity: "4 Person",
            fuelType: "Electric",
        },
        {
            id: 7,
            brand: "Hyundai",
            model: "tucson",
            price: 130,
            status: "Available",
            unitsCount: 3,
            mileage: "4,000",
            transmission: "Auto",
            capacity: "4 Person",
            fuelType: "Electric",
        },
        {
            id: 8,
            brand: "Hyundai",
            model: "tucson",
            price: 130,
            status: "Available",
            unitsCount: 3,
            mileage: "4,000",
            transmission: "Auto",
            capacity: "4 Person",
            fuelType: "Electric",
        },
        {
            id: 9,
            brand: "Hyundai",
            model: "tucson",
            price: 130,
            status: "Available",
            unitsCount: 3,
            mileage: "4,000",
            transmission: "Auto",
            capacity: "4 Person",
            fuelType: "Electric",
        },
        {
            id: 10,
            brand: "Hyundai",
            model: "tucson",
            price: 130,
            status: "Available",
            unitsCount: 3,
            mileage: "4,000",
            transmission: "Auto",
            capacity: "4 Person",
            fuelType: "Electric",
        },
        {
            id: 11,
            brand: "Toyota",
            model: "camry",
            price: 150,
            status: "Available",
            unitsCount: 2,
            mileage: "6,000",
            transmission: "Auto",
            capacity: "5 Person",
            fuelType: "Hybrid",
        },
        {
            id: 12,
            brand: "Honda",
            model: "civic",
            price: 120,
            status: "Available",
            unitsCount: 4,
            mileage: "3,500",
            transmission: "Manual",
            capacity: "5 Person",
            fuelType: "Petrol",
        },
        {
            id: 13,
            brand: "BMW",
            model: "x5",
            price: 200,
            status: "Available",
            unitsCount: 1,
            mileage: "8,000",
            transmission: "Auto",
            capacity: "7 Person",
            fuelType: "Diesel",
        },
        {
            id: 14,
            brand: "Mercedes",
            model: "c-class",
            price: 180,
            status: "Available",
            unitsCount: 2,
            mileage: "5,500",
            transmission: "Auto",
            capacity: "5 Person",
            fuelType: "Petrol",
        },
        {
            id: 15,
            brand: "Audi",
            model: "a4",
            price: 160,
            status: "Available",
            unitsCount: 3,
            mileage: "4,500",
            transmission: "Auto",
            capacity: "5 Person",
            fuelType: "Petrol",
        },
    ];

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showAddUnit, setShowAddUnit] = useState(false);
    const perPageOptions = [5, 10, 20, 50];
    const totalPages = Math.ceil(units.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const currentUnits = units.slice(startIdx, endIdx);

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    // Helper for pagination numbers with ellipsis
    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, "...", totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(
                    1,
                    "...",
                    totalPages - 2,
                    totalPages - 1,
                    totalPages
                );
            } else {
                pages.push(
                    1,
                    "...",
                    currentPage - 1,
                    currentPage,
                    currentPage + 1,
                    "...",
                    totalPages
                );
            }
        }
        return pages;
    };

    // Reset to first page when itemsPerPage changes
    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    // Handle Add Unit button click
    const handleAddUnitClick = () => {
        setShowAddUnit(true);
    };

    return (
        <div className="w-full h-auto pr-5 py-10">
            {/* Header section */}
            <div className="flex flex-row gap-5 justify-between items-center">
                <h1 className="figtree text-[35px] font-[700]">Multimodal Units</h1>
                <div className="flex flex-row gap-5">
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <img src={search} alt="Search" />
                    </div>
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <img src={settings} alt="Settings" />
                    </div>
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <img src={bell} alt="Notifications" />
                    </div>
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <img src={proPic} alt="Profile" />
                    </div>
                    <div className="figtree flex flex-col justify-center items-start">
                        <h1 className="text-[20px] font-[700]">Steve Gibson</h1>
                        <h1 className="text-[16px] font-[600] text-[#7B7B7A]">
                            Vendor
                        </h1>
                    </div>
                </div>
            </div>
            {/* end of header section */}

            {/* Search, Filter section */}
            <div className="flex flex-row justify-between mt-10 mb-5">
                <div className="flex flex-row items-center justify-between w-full">
                    <div className="flex flex-row gap-5 justify-center items-center">
                        <div className="w-[253px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row justify-center items-center py-2 px-5">
                            <img src={miniSearchIcon} alt="Search" />
                            <input
                                type="text"
                                className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC]"
                                placeholder="Search client name, car, etc."
                            />
                        </div>
                        <div className="w-[139px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
                            <img
                                src={filterIcon}
                                className="size-[12px]"
                                alt="Filter"
                            />
                            <h1 className="text-[14px] font-[500] text-[#7B7B7ACC]">
                                Car type
                            </h1>
                            <img src={miniDownArrow} alt="Dropdown" />
                        </div>
                        <div className="w-[125px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
                            <img
                                src={filterIcon}
                                className="size-[12px]"
                                alt="Filter"
                            />
                            <h1 className="text-[14px] font-[500] text-[#7B7B7ACC]">
                                Status
                            </h1>
                            <img src={miniDownArrow} alt="Dropdown" />
                        </div>
                    </div>
                    <button
                        className="w-[125px] h-[35px] bg-[#0955AC] text-[14px] rounded-[6px] text-[#FFFFFF] font-[700]"
                        onClick={handleAddUnitClick}
                    >
                        Add Unit
                    </button>
                </div>
            </div>
            {/* end */}

            {/* Conditionally render AddUnit or Units list */}
            {showAddUnit ? (
                <AddUnit />
            ) : (
                <>
                    {/* Units cards */}
                    {currentUnits.map((unit) => (
                        <div
                            key={unit.id}
                            className="relative w-auto h-auto min-h-[157px] bg-[#FFFFFF] rounded-[10px] flex lg:flex-row flex-col items-center my-10"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <img src={car1} alt="Car" />
                            {/* text section */}
                            <div className="px-5 py-5 flex flex-row justify-center items-center">
                                <div>
                                    <div className="bebas-neue text-[30px] font-[400]">
                                        <h1>
                                            {unit.brand}{" "}
                                            <span className="text-[#0955AC]">
                                                {unit.model}
                                            </span>
                                        </h1>
                                        <h1>
                                            ${unit.price}
                                            <span className="figtree text-[#00000080] text-[15px] font-[600]">
                                                /day
                                            </span>
                                        </h1>
                                    </div>
                                    <div className="poppins flex flex-row justify-start items-center gap-8 text-[14px] font-[600]">
                                        <div className="flex flex-row justify-center items-center gap-3">
                                            <img
                                                src={availableIcon}
                                                className="w-[26px] h-[26px]"
                                                alt="Status"
                                            />
                                            <h1 className="text-[#3C9A34]">
                                                {unit.status}
                                            </h1>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex lg:flex-row flex-col justify-center items-center pl-[40px] gap-20">
                                    <div className="poppins flex lg:flex-row flex-col gap-10 text-[15px] font-[500]">
                                        <div className="flex flex-col justify-center items-center gap-7">
                                            <img
                                                src={icon1}
                                                className="w-[26px] h-[26px]"
                                                alt="Mileage"
                                            />
                                            <h1>{unit.mileage}</h1>
                                        </div>
                                        <div className="flex flex-col justify-center items-center gap-7">
                                            <img
                                                src={icon2}
                                                className="w-[26px] h-[26px]"
                                                alt="Transmission"
                                            />
                                            <h1>{unit.transmission}</h1>
                                        </div>
                                        <div className="flex flex-col justify-center items-center gap-7">
                                            <img
                                                src={icon3}
                                                className="w-[26px] h-[26px]"
                                                alt="Capacity"
                                            />
                                            <h1>{unit.capacity}</h1>
                                        </div>
                                        <div className="flex flex-col justify-center items-center gap-7">
                                            <img
                                                src={icon4}
                                                className="w-[26px] h-[26px]"
                                                alt="Fuel Type"
                                            />
                                            <h1>{unit.fuelType}</h1>
                                        </div>
                                    </div>
                                    <button
                                        className="figtree min-w-[140px] h-[44px] bg-[#0955AC] rounded-[5px] text-[20px] text-[#FFFFFF] font-[700]"
                                        onClick={() =>
                                            (window.location.href = "/multimodal/unitDetails")
                                        }
                                    >
                                        View
                                    </button>
                                </div>
                            </div>
                            {/* delete buttons */}
                            <div className="absolute right-0 w-auto min-w-[143px] h-full bg-[#D8E4F2] flex flex-row justify-center items-center gap-3 rounded-tr-[10px] rounded-br-[10px]">
                                <div className="size-[36px] border-[1.5px] border-[#0955AC] bg-[#D8E4F2] rounded-[5px] flex justify-center items-center cursor-pointer">
                                    <img
                                        src={editIcon}
                                        className="size-[24px]"
                                        alt="Edit"
                                    />
                                </div>
                                <div className="size-[36px] border-[1.5px] border-[#FF0000] bg-[#D8E4F2] rounded-[5px] flex justify-center items-center cursor-pointer">
                                    <img
                                        src={deleteIcon}
                                        className="size-[24px]"
                                        alt="Delete"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Pagination Controls and Results per page */}
                    <div className="flex justify-between items-center gap-2 mt-20">
                        {/* Left: Results per page */}
                        <div className="flex items-center">
                            <span className="mr-3 text-[#00000080] text-[15px]">
                                Results per page
                            </span>
                            <select
                                className="rounded px-3 py-1 font-[600] text-[16px] bg-[#F4F3F3] border-[1px] border-[#BEBEBE] w-[71px] h-[40px] focus:outline-none"
                                value={itemsPerPage}
                                onChange={(e) =>
                                    setItemsPerPage(Number(e.target.value))
                                }
                            >
                                {perPageOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Right: Pagination */}
                        <div className="flex items-center gap-2">
                            <button
                                className="px-3 py-1 size-[40px] rounded-[4px] bg-[#F4F3F3] disabled:opacity-50"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <span className="text-lg">&#60;</span>
                            </button>
                            {getPageNumbers().map((num, idx) =>
                                num === "..." ? (
                                    <span key={idx} className="px-2">
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        key={num}
                                        className={`px-3 py-1 text-[16px] font-[600] rounded-[4px] size-[40px] bg-[#F4F3F3] ${
                                            currentPage === num
                                                ? "text-[#0955AC] font-[600] border-[2px] border-[#0955AC]"
                                                : "bg-[#F4F3F3]"
                                        }`}
                                        onClick={() => goToPage(num)}
                                    >
                                        {num}
                                    </button>
                                )
                            )}
                            <button
                                className="px-3 py-1 size-[40px] rounded-[4px] bg-[#F4F3F3] disabled:opacity-50"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <span className="text-lg">&#62;</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default UnitContent;
