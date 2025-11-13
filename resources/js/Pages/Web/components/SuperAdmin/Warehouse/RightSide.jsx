import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
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

const warehouseStatusFilterOptions = [
    { value: "all", label: "All Status" },
    { value: "approved", label: "Approved" },
    { value: "pending", label: "Pending" },
    { value: "rejected", label: "Rejected" },
    { value: "suspended", label: "Suspended" },
];

const RightSide = ({ warehouses = {}, filters = {}, error }) => {
    const [selectedType, setSelectedType] = useState(filters.type_filter || ""); // State for warehouse type filter
    const [selectedStatus, setSelectedStatus] = useState(filters.status_filter || ""); // State for warehouse status filter
    const [searchTerm, setSearchTerm] = useState(filters.search || ""); // State for search term
    const [searchTimeout, setSearchTimeout] = useState(null); // Debounce timeout

    // Handle type filter selection
    const handleTypeFilterChange = (e) => {
        const newType = e.target.value;
        setSelectedType(newType);

        // Update URL with new filter
        router.get('/superadmin/Warehouse', {
            search: searchTerm,
            type_filter: newType === 'all' ? '' : newType,
            status_filter: selectedStatus === 'all' ? '' : selectedStatus
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    // Handle status filter selection
    const handleStatusFilterChange = (e) => {
        const newStatus = e.target.value;
        setSelectedStatus(newStatus);

        // Update URL with new filter
        router.get('/superadmin/Warehouse', {
            search: searchTerm,
            type_filter: selectedType === 'all' ? '' : selectedType,
            status_filter: newStatus === 'all' ? '' : newStatus
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    // Handle search input
    const handleSearchChange = (e) => {
        const newSearch = e.target.value;
        setSearchTerm(newSearch);

        // Clear existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set new timeout for debounced search
        const timeout = setTimeout(() => {
            router.get('/superadmin/Warehouse', {
                search: newSearch,
                type_filter: selectedType === 'all' ? '' : selectedType,
                status_filter: selectedStatus === 'all' ? '' : selectedStatus
            }, {
                preserveState: true,
                preserveScroll: true
            });
        }, 500); // 500ms debounce

        setSearchTimeout(timeout);
    };

    // Handle clear filters
    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedType('');
        setSelectedStatus('');

        router.get('/superadmin/Warehouse', {}, {
            preserveState: true,
            preserveScroll: true
        });
    };

    // Handle pagination
    const handlePagination = (url) => {
        if (url) {
            router.get(url, {}, {
                preserveState: true,
                preserveScroll: true
            });
        }
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

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
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Search warehouses..."
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
                <div className="w-[150px]">
                    <select
                        value={selectedStatus}
                        onChange={handleStatusFilterChange}
                        className="w-full bg-[#0B1739] border border-[#343B4F] text-[#ffffff] text-[12px] rounded-[4px] p-2 focus:outline-none focus:ring-0 focus:border-[#343B4F] cursor-pointer"
                    >
                        {warehouseStatusFilterOptions.map((option, index) => (
                            <option key={index} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleClearFilters}
                    className="bg-[#FF572233] hover:bg-[#FF57224D] text-[#FF5722] text-[12px] px-4 py-2 rounded-[4px] border border-[#FF572280] transition-colors duration-200"
                >
                    Clear Filters
                </button>
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
                            <button
                                onClick={() => handlePagination(warehouses.prev_page_url)}
                                disabled={!warehouses.prev_page_url}
                                className={`border border-[#0B1739] bg-[#0A1330] p-[6px] ${
                                    !warehouses.prev_page_url ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#1A2444] cursor-pointer'
                                }`}
                            >
                                <img src={ArrowLeftB} className="size-[14px]" />
                            </button>
                            <button
                                onClick={() => handlePagination(warehouses.next_page_url)}
                                disabled={!warehouses.next_page_url}
                                className={`border border-[#0B1739] bg-[#0A1330] p-[6px] ${
                                    !warehouses.next_page_url ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#1A2444] cursor-pointer'
                                }`}
                            >
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
