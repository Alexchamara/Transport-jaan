import React, { useState, useEffect } from "react";
import { Inertia } from "@inertiajs/inertia";
import search from "../../../../assets/vendors/dashboard/searchIcon.svg";
import settings from "../../../../assets/vendors/dashboard/settings.svg";
import bell from "../../../../assets/vendors/dashboard/bell.svg";
import proPic from "../../../../assets/vendors/dashboard/proPic.svg";

import filterIcon from "../../../../assets/vendors/dashboard/icons/filterIcon.svg";
import miniSearchIcon from "../../../../assets/vendors/dashboard/icons/miniSearchIcon.svg";
import miniDownArrow from "../../../../assets/vendors/dashboard/icons/miniDownArrow.svg";


import { Truck, Weight, Ruler, Package, Fuel, CheckCircle2, Pencil, Trash2 } from "lucide-react";

import AddUnit from "../../../../home/vendors/freight/AddUnit";

const UnitContent = () => {
    // Sample data array for freight units
    const units = [
        {
            id: 1,
            carrier: "Tata",
            unitType: "14ft Lorry",
            rate: 130,
            status: "Available",
            unitsCount: 3,
            maxLoad: "1.5 t",
            dimensions: "14 ft",
            bodyType: "Open",
            fuelType: "Diesel",
        },
        {
            id: 2,
            carrier: "Ashok Leyland",
            unitType: "20ft Truck",
            rate: 180,
            status: "Available",
            unitsCount: 2,
            maxLoad: "3.0 t",
            dimensions: "20 ft",
            bodyType: "Box",
            fuelType: "Diesel",
        },
        {
            id: 3,
            carrier: "Isuzu",
            unitType: "Reefer Van",
            rate: 220,
            status: "Available",
            unitsCount: 1,
            maxLoad: "2.0 t",
            dimensions: "12 ft",
            bodyType: "Reefer",
            fuelType: "Diesel",
        },
        {
            id: 4,
            carrier: "Mitsubishi",
            unitType: "Canter",
            rate: 160,
            status: "Available",
            unitsCount: 4,
            maxLoad: "2.5 t",
            dimensions: "14 ft",
            bodyType: "Box",
            fuelType: "Diesel",
        },
        {
            id: 5,
            carrier: "Fuso",
            unitType: "Cargo Van",
            rate: 140,
            status: "Available",
            unitsCount: 3,
            maxLoad: "1.2 t",
            dimensions: "10 ft",
            bodyType: "Covered",
            fuelType: "Diesel",
        },
        {
            id: 6,
            carrier: "Hino",
            unitType: "24ft Truck",
            rate: 260,
            status: "Available",
            unitsCount: 1,
            maxLoad: "5.0 t",
            dimensions: "24 ft",
            bodyType: "Box",
            fuelType: "Diesel",
        },
        {
            id: 7,
            carrier: "DFSK",
            unitType: "Mini Truck",
            rate: 90,
            status: "Available",
            unitsCount: 5,
            maxLoad: "0.8 t",
            dimensions: "8 ft",
            bodyType: "Open",
            fuelType: "Petrol",
        },
        {
            id: 8,
            carrier: "Tata",
            unitType: "Tipper",
            rate: 300,
            status: "Available",
            unitsCount: 1,
            maxLoad: "8.0 t",
            dimensions: "—",
            bodyType: "Tipper",
            fuelType: "Diesel",
        },
        {
            id: 9,
            carrier: "Hyundai",
            unitType: "Reefer Truck",
            rate: 280,
            status: "Available",
            unitsCount: 1,
            maxLoad: "4.0 t",
            dimensions: "18 ft",
            bodyType: "Reefer",
            fuelType: "Diesel",
        },
        {
            id: 10,
            carrier: "Isuzu",
            unitType: "Flatbed",
            rate: 210,
            status: "Available",
            unitsCount: 2,
            maxLoad: "3.5 t",
            dimensions: "20 ft",
            bodyType: "Flatbed",
            fuelType: "Diesel",
        },
        {
            id: 11,
            carrier: "Yutong",
            unitType: "Passenger Coach",
            rate: 350,
            status: "Available",
            unitsCount: 1,
            maxLoad: "50 pax",
            dimensions: "40 ft",
            bodyType: "Passenger",
            fuelType: "Diesel",
        },
        {
            id: 12,
            carrier: "Nissan",
            unitType: "Pickup",
            rate: 110,
            status: "Available",
            unitsCount: 3,
            maxLoad: "1.0 t",
            dimensions: "8 ft",
            bodyType: "Open",
            fuelType: "Petrol",
        },
        {
            id: 13,
            carrier: "Volvo",
            unitType: "Prime Mover",
            rate: 500,
            status: "Available",
            unitsCount: 1,
            maxLoad: "40 t",
            dimensions: "—",
            bodyType: "Trailer",
            fuelType: "Diesel",
        },
        {
            id: 14,
            carrier: "Mercedes",
            unitType: "Box Truck",
            rate: 260,
            status: "Available",
            unitsCount: 1,
            maxLoad: "4.5 t",
            dimensions: "20 ft",
            bodyType: "Box",
            fuelType: "Diesel",
        },
        {
            id: 15,
            carrier: "Toyota",
            unitType: "HiAce Van",
            rate: 150,
            status: "Available",
            unitsCount: 2,
            maxLoad: "1.2 t",
            dimensions: "10 ft",
            bodyType: "Covered",
            fuelType: "Diesel",
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
                <h1 className="figtree text-[35px] font-[700]">Freight Units</h1>
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
                                placeholder="Search client, shipment, unit type, etc."
                            />
                        </div>
                        <div className="w-[139px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
                            <img
                                src={filterIcon}
                                className="size-[12px]"
                                alt="Filter"
                            />
                            <h1 className="text-[14px] font-[500] text-[#7B7B7ACC]">
                                Freight type
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
                            className="relative w-full h-auto min-h-[157px] bg-white rounded-[12px] flex lg:flex-row flex-col items-stretch my-6 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-center lg:w-[140px] w-full bg-[#F5F8FC] rounded-l-[12px] py-6">
                                <Truck size={48} aria-label="Freight Unit" role="img" />
                            </div>
                            {/* text section */}
                            <div className="px-5 py-5 flex flex-row justify-between items-center w-full lg:pr-[140px]">
                                <div>
                                    <div className="bebas-neue text-[30px] font-[400]">
                                        <h1>
                                            {unit.carrier}{" "}
                                            <span className="text-[#0955AC]">
                                                {unit.unitType}
                                            </span>
                                        </h1>
                                        <h1>
                                            ${unit.rate}
                                            <span className="figtree text-[#00000080] text-[15px] font-[600]">
                                                /km
                                            </span>
                                        </h1>
                                    </div>
                                    <div className="poppins flex flex-row justify-start items-center gap-8 text-[14px] font-[600]">
                                        <div className="flex flex-row justify-center items-center gap-3">
                                            <CheckCircle2 size={24} aria-label="Status" role="img" className="text-[#3C9A34]" />
                                            <h1 className="text-[#3C9A34]">
                                                {unit.status}
                                            </h1>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex lg:flex-row flex-col justify-center items-center pl-[40px] gap-20">
                                    <div className="poppins grid grid-cols-2 lg:grid-cols-4 gap-8 text-[15px] font-[500]">
                                        <div className="flex flex-col justify-center items-center gap-3">
                                            <Weight size={26} aria-label="Max Load" role="img" />
                                            <h1>{unit.maxLoad}</h1>
                                        </div>
                                        <div className="flex flex-col justify-center items-center gap-3">
                                            <Ruler size={26} aria-label="Dimensions" role="img" />
                                            <h1>{unit.dimensions}</h1>
                                        </div>
                                        <div className="flex flex-col justify-center items-center gap-3">
                                            <Package size={26} aria-label="Body Type" role="img" />
                                            <h1>{unit.bodyType}</h1>
                                        </div>
                                        <div className="flex flex-col justify-center items-center gap-3">
                                            <Fuel size={26} aria-label="Fuel Type" role="img" />
                                            <h1>{unit.fuelType}</h1>
                                        </div>
                                    </div>
                                    <button
                                        className="figtree min-w-[140px] h-[44px] bg-[#0955AC] rounded-[5px] text-[20px] text-[#FFFFFF] font-[700]"
                                        onClick={() =>
                                            (window.location.href = "/freight/unitDetails")
                                        }
                                    >
                                        View
                                    </button>
                                </div>
                            </div>
                            {/* action buttons */}
                            <div className="lg:absolute right-0 top-0 lg:bottom-0 w-full lg:w-auto min-w-[120px] bg-[#EAF2FC] flex flex-row lg:flex-col justify-center items-center gap-3 lg:rounded-tr-[12px] lg:rounded-br-[12px] p-2 lg:p-3 border-t lg:border-t-0 border-[#E6E8EB]">
                                <div className="flex flex-row lg:flex-col gap-3">
                                    <button className="size-[36px] border-[1.5px] border-[#0955AC] bg-white rounded-[8px] flex justify-center items-center hover:bg-[#F5F8FC] shrink-0" aria-label="Edit">
                                        <Pencil size={20} />
                                    </button>
                                    <button className="size-[36px] border-[1.5px] border-[#FF0000] bg-white rounded-[8px] flex justify-center items-center hover:bg-[#FFF5F5] shrink-0" aria-label="Delete">
                                        <Trash2 size={20} />
                                    </button>
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
