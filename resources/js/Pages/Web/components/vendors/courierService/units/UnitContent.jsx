import React, { useState, useEffect, useRef } from "react";
import { usePage, Link } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import {
    Search,
    Settings,
    Bell,
    UserCircle2,
    Filter,
    ChevronDown,
    Truck,
    CheckCircle2,
    Gauge,
    Cog,
    Users,
    Droplet,
    Pencil,
    Trash2,
} from "lucide-react";

import proPic from "../../../../assets/vendors/dashboard/proPic.svg"; // Added
import logOutLogo from "../../../../assets/vendors/dashboard/logOutLogo.svg"; // Added

import AddUnit from "../../../../home/vendors/courierService/AddUnit";

import UserDropdown from "../../UserDropdown";

const UnitContent = () => {
    const { auth } = usePage().props;
    const user = auth?.user;

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
                <h1 className="figtree text-[35px] font-[700]">
                    Courier Service Units
                </h1>
                <div className="flex flex-row gap-5 relative items-center">
                    {/* <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <Search size={28} />
          </div>
          <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <Settings size={28} />
          </div>
          <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <Bell size={28} />
          </div> */}

                    <div className="flex flex-row gap-5 relative items-center">
                        <UserDropdown />
                    </div>
                </div>
            </div>
            {/* end of header section */}

            {/* Search, Filter section */}
            <div className="flex flex-row justify-between mt-10 mb-5">
                <div className="flex flex-row items-center justify-between w-full">
                    <div className="flex flex-row gap-5 justify-center items-center">
                        <div className="w-[253px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row justify-center items-center py-2 px-5">
                            <Search size={16} />
                            <input
                                type="text"
                                className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC]"
                                placeholder="Search unit, vehicle, capacity..."
                            />
                        </div>
                        <div className="w-[139px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
                            <Filter size={12} />
                            <h1 className="text-[14px] font-[500] text-[#7B7B7ACC]">
                                Unit type
                            </h1>
                            <ChevronDown size={14} />
                        </div>
                        <div className="w-[125px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
                            <Filter size={12} />
                            <h1 className="text-[14px] font-[500] text-[#7B7B7ACC]">
                                Status
                            </h1>
                            <ChevronDown size={14} />
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
                            className="relative w-auto h-auto min-h-[157px] bg-[#FFFFFF] rounded-[10px] flex lg:flex-row flex-col items-stretch lg:items-stretch my-10 overflow-hidden pr-[160px]"
                            style={{ boxShadow: "4px 4px 4px #0000001A" }}
                        >
                            <div className="w-[140px] lg:self-stretch flex items-center justify-center text-[#0955AC] bg-[#F8FAFF] border-r border-[#0000001A]">
                                <Truck size={80} />
                            </div>
                            {/* text section */}
                            <div className="flex-1 px-5 py-5 flex flex-row justify-between items-stretch">
                                {/* left: title & quick badges */}
                                <div className="flex-1 pr-6">
                                    <div className="bebas-neue text-[30px] leading-[1.1] font-[400]">
                                        <h1>
                                            {unit.brand}{" "}
                                            <span className="text-[#0955AC]">
                                                {unit.model}
                                            </span>
                                        </h1>
                                    </div>

                                    {/* pricing & quick meta */}
                                    <div className="mt-2 flex flex-wrap items-center gap-3">
                                        <div className="figtree text-[18px] font-[700]">
                                            ${unit.price}
                                            <span className="text-[#00000080] text-[14px] font-[600]">
                                                /km
                                            </span>
                                        </div>
                                        <div className="px-2 h-[22px] rounded-[4px] bg-[#EAF2FF] border border-[#0955AC33] text-[#0955AC] text-[12px] font-[600] flex items-center">
                                            Units available: {unit.unitsCount}
                                        </div>
                                        <div className="px-2 h-[22px] rounded-[4px] bg-[#E9F7EE] border border-[#3C9A3433] text-[#3C9A34] text-[12px] font-[700] flex items-center">
                                            {unit.status}
                                        </div>
                                    </div>

                                    {/* route/service badges (example placeholders; wire to your data if available) */}
                                    <div className="mt-3 flex flex-wrap gap-2 text-[12px]">
                                        <span className="px-2 py-[2px] rounded-[4px] bg-[#F3F3F3] border border-[#0000001A] text-[#00000099]">
                                            Urban
                                        </span>
                                        <span className="px-2 py-[2px] rounded-[4px] bg-[#F3F3F3] border border-[#0000001A] text-[#00000099]">
                                            Intercity
                                        </span>
                                        <span className="px-2 py-[2px] rounded-[4px] bg-[#F3F3F3] border border-[#0000001A] text-[#00000099]">
                                            Same‑day
                                        </span>
                                    </div>
                                </div>

                                {/* middle: courier specs */}
                                <div className="flex flex-col lg:flex-row gap-10 items-center justify-center px-6 border-l border-[#0000001A]">
                                    <div className="poppins grid grid-cols-2 gap-x-12 gap-y-6 text-[15px] font-[600]">
                                        <div className="flex items-center gap-3">
                                            <Users className="w-[22px] h-[22px]" />
                                            <div className="flex flex-col leading-tight">
                                                <span className="text-[#00000080] text-[12px] font-[600]">
                                                    Load capacity
                                                </span>
                                                <span>{unit.capacity}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Droplet className="w-[22px] h-[22px]" />
                                            <div className="flex flex-col leading-tight">
                                                <span className="text-[#00000080] text-[12px] font-[600]">
                                                    Fuel
                                                </span>
                                                <span>{unit.fuelType}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Cog className="w-[22px] h-[22px]" />
                                            <div className="flex flex-col leading-tight">
                                                <span className="text-[#00000080] text-[12px] font-[600]">
                                                    Transmission
                                                </span>
                                                <span>{unit.transmission}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Gauge className="w-[22px] h-[22px]" />
                                            <div className="flex flex-col leading-tight">
                                                <span className="text-[#00000080] text-[12px] font-[600]">
                                                    Mileage
                                                </span>
                                                <span>{unit.mileage}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        className="figtree min-w-[140px] h-[44px] bg-[#0955AC] rounded-[5px] text-[18px] text-[#FFFFFF] font-[700]"
                                        onClick={() =>
                                            (window.location.href =
                                                "/courierService/unitDetails")
                                        }
                                    >
                                        Assign
                                    </button>
                                </div>
                            </div>

                            {/* actions rail */}
                            <div className="absolute right-0 w-[160px] h-full bg-[#D8E4F2] flex flex-col lg:flex-col justify-center items-center gap-3 rounded-tr-[10px] rounded-br-[10px]">
                                <div className="size-[36px] border-[1.5px] border-[#0955AC] bg-[#D8E4F2] rounded-[5px] flex justify-center items-center cursor-pointer hover:bg-white/60">
                                    <Pencil className="size-[24px]" />
                                </div>
                                <div className="size-[36px] border-[1.5px] border-[#FF0000] bg-[#D8E4F2] rounded-[5px] flex justify-center items-center cursor-pointer hover:bg-white/60">
                                    <Trash2 className="size-[24px]" />
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
                                <span className="text-lg">&lt;</span>
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
                                <span className="text-lg">&gt;</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default UnitContent;
