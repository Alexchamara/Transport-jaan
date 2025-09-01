import React, { useState, useEffect } from "react";
import { Inertia } from "@inertiajs/inertia";
import proPic from "../../../../assets/vendors/dashboard/proPic.svg";
import {
  Search as SearchIcon,
  Settings as SettingsIcon,
  Bell as BellIcon,
  Filter as FilterIcon,
  ChevronDown,
  Plane,
  TrainFront,
  BusFront,
  CheckCircle,
  Clock,
  BadgeCheck,
  Users,
  Fuel,
  Pencil,
  Trash2
} from "lucide-react";
// Helper to select transport icon per unit (Plane / Train / Bus) based on brand/model
const transportIconForUnit = (unit, size = 120) => {
  const brand = (unit.brand || "").toLowerCase();
  const model = (unit.model || "").toLowerCase();
  const isFlight = brand.includes("airlines") || /[a-z]{1,2}\d{2,4}/i.test(model);
  const isTrain = brand.includes("railways") || model.includes("intercity") || model.includes("line") || model.includes("rejina");
  if (isFlight) return <Plane size={size} />;
  if (isTrain) return <TrainFront size={size} />;
  return <BusFront size={size} />;
};

import AddUnit from "../../../../home/vendors/ticketBooking/AddUnit";

const UnitContent = () => {
    // Sample data array for units
    const units = [
        // Flights
        {
            id: 1,
            brand: "SriLankan Airlines",
            model: "UL215",
            price: 350,
            status: "Available",
            unitsCount: 24, // seats left
            mileage: "5h 10m", // duration
            transmission: "Nonstop", // service type
            capacity: "180 Seats",
            fuelType: "Jet A-1",
        },
        {
            id: 2,
            brand: "Qatar Airways",
            model: "QR669",
            price: 780,
            status: "Available",
            unitsCount: 12,
            mileage: "5h 15m",
            transmission: "Nonstop",
            capacity: "236 Seats",
            fuelType: "Jet A-1",
        },
        {
            id: 3,
            brand: "Emirates",
            model: "EK649",
            price: 690,
            status: "Available",
            unitsCount: 18,
            mileage: "4h 45m",
            transmission: "Nonstop",
            capacity: "299 Seats",
            fuelType: "Jet A-1",
        },
        // Trains
        {
            id: 4,
            brand: "Sri Lanka Railways",
            model: "Intercity 8023",
            price: 15,
            status: "Available",
            unitsCount: 40,
            mileage: "3h 45m",
            transmission: "Express",
            capacity: "720 Seats",
            fuelType: "Diesel",
        },
        {
            id: 5,
            brand: "Sri Lanka Railways",
            model: "Rajarata Rejina",
            price: 12,
            status: "Available",
            unitsCount: 33,
            mileage: "5h 20m",
            transmission: "Express",
            capacity: "650 Seats",
            fuelType: "Diesel",
        },
        {
            id: 6,
            brand: "Sri Lanka Railways",
            model: "Coastal Line",
            price: 8,
            status: "Available",
            unitsCount: 50,
            mileage: "2h 20m",
            transmission: "Semi-Express",
            capacity: "600 Seats",
            fuelType: "Diesel",
        },
        // Buses
        {
            id: 7,
            brand: "CTB",
            model: "Matara → Colombo",
            price: 6,
            status: "Available",
            unitsCount: 12,
            mileage: "4h 30m",
            transmission: "AC",
            capacity: "49 Seats",
            fuelType: "Diesel",
        },
        {
            id: 8,
            brand: "Private Coach",
            model: "Kandy → Jaffna",
            price: 18,
            status: "Available",
            unitsCount: 8,
            mileage: "6h 40m",
            transmission: "AC Sleeper",
            capacity: "44 Seats",
            fuelType: "Diesel",
        },
        {
            id: 9,
            brand: "CTB",
            model: "Colombo → Trincomalee",
            price: 14,
            status: "Available",
            unitsCount: 16,
            mileage: "5h 50m",
            transmission: "AC",
            capacity: "49 Seats",
            fuelType: "Diesel",
        },
        // More Flights
        {
            id: 10,
            brand: "IndiGo",
            model: "6E1208",
            price: 120,
            status: "Available",
            unitsCount: 22,
            mileage: "1h 25m",
            transmission: "Nonstop",
            capacity: "180 Seats",
            fuelType: "Jet A-1",
        },
        {
            id: 11,
            brand: "Air India",
            model: "AI274",
            price: 260,
            status: "Available",
            unitsCount: 10,
            mileage: "5h 40m",
            transmission: "1 Stop",
            capacity: "180 Seats",
            fuelType: "Jet A-1",
        },
        // More Trains
        {
            id: 12,
            brand: "Sri Lanka Railways",
            model: "Podi Menike",
            price: 20,
            status: "Available",
            unitsCount: 28,
            mileage: "10h 00m",
            transmission: "Express",
            capacity: "720 Seats",
            fuelType: "Diesel",
        },
        // More Buses
        {
            id: 13,
            brand: "Private Coach",
            model: "Colombo → Kataragama",
            price: 10,
            status: "Available",
            unitsCount: 14,
            mileage: "6h 10m",
            transmission: "AC",
            capacity: "49 Seats",
            fuelType: "Diesel",
        },
        {
            id: 14,
            brand: "CTB",
            model: "Colombo → Kegalle",
            price: 4,
            status: "Available",
            unitsCount: 20,
            mileage: "2h 10m",
            transmission: "Non-AC",
            capacity: "54 Seats",
            fuelType: "Diesel",
        },
        {
            id: 15,
            brand: "SriLankan Airlines",
            model: "UL303",
            price: 520,
            status: "Available",
            unitsCount: 9,
            mileage: "3h 45m",
            transmission: "Nonstop",
            capacity: "288 Seats",
            fuelType: "Jet A-1",
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
                <h1 className="figtree text-[35px] font-[700]">Ticket Booking Units</h1>
                <div className="flex flex-row gap-5">
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <SearchIcon />
                    </div>
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <SettingsIcon />
                    </div>
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <BellIcon />
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
                            <SearchIcon className="size-[16px]" />
                            <input
                                type="text"
                                className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC]"
                                placeholder="Search transport, route, etc."
                            />
                        </div>
                        <div className="w-[139px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
                            <FilterIcon className="size-[12px]" />
                            <h1 className="text-[14px] font-[500] text-[#7B7B7ACC]">
                                Transport
                            </h1>
                            <ChevronDown />
                        </div>
                        <div className="w-[125px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
                            <FilterIcon className="size-[12px]" />
                            <h1 className="text-[14px] font-[500] text-[#7B7B7ACC]">
                                Status
                            </h1>
                            <ChevronDown />
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
                            <div className="w-[172px] h-[107px] flex items-center justify-center">
                              {transportIconForUnit(unit, 80)}
                            </div>
                            {/* text section */}
                            <div className="px-5 py-5 flex flex-row justify-center items-center">
                                <div>
                                    <div className="bebas-neue text-[30px] font-[400] max-w-[150px]">
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
                                            <CheckCircle className="w-[26px] h-[26px]" />
                                            <h1 className="text-[#3C9A34]">
                                                {unit.status}
                                            </h1>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex lg:flex-row flex-col justify-center items-center pl-[40px] gap-20 ">
                                    <div className="poppins flex lg:flex-row flex-col gap-10 text-[15px] font-[500]">
                                        <div className="flex flex-col justify-center items-center gap-7">
                                            <Clock className="w-[26px] h-[26px]" />
                                            <h1>{unit.mileage}</h1>
                                        </div>
                                        <div className="flex flex-col justify-center items-center gap-7">
                                            <BadgeCheck className="w-[26px] h-[26px]" />
                                            <h1>{unit.transmission}</h1>
                                        </div>
                                        <div className="flex flex-col justify-center items-center gap-7">
                                            <Users className="w-[26px] h-[26px]" />
                                            <h1>{unit.capacity}</h1>
                                        </div>
                                        <div className="flex flex-col justify-center items-center gap-7">
                                            <Fuel className="w-[26px] h-[26px]" />
                                            <h1>{unit.fuelType}</h1>
                                        </div>
                                    </div>
                                    <button
                                        className="figtree min-w-[140px] h-[44px] bg-[#0955AC] rounded-[5px] text-[20px] text-[#FFFFFF] font-[700]"
                                        onClick={() =>
                                            (window.location.href = "/ticketBooking/unitDetails")
                                        }
                                    >
                                        View
                                    </button>
                                </div>
                            </div>
                            {/* delete buttons */}
                            <div className="absolute right-0 w-auto min-w-[143px] h-full bg-[#D8E4F2] flex flex-row justify-center items-center gap-3 rounded-tr-[10px] rounded-br-[10px]">
                                <div className="size-[36px] border-[1.5px] border-[#0955AC] bg-[#D8E4F2] rounded-[5px] flex justify-center items-center cursor-pointer">
                                    <Pencil className="size-[24px]" />
                                </div>
                                <div className="size-[36px] border-[1.5px] border-[#FF0000] bg-[#D8E4F2] rounded-[5px] flex justify-center items-center cursor-pointer">
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
