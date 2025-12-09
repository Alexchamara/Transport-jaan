import React, { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import miniSearchIcon from "../../../assets/vendors/dashboard/icons/miniSearchIcon.svg";
import miniUp from "../../../assets/vendors/dashboard/icons/miniUp.svg";
import miniDown from "../../../assets/vendors/dashboard/icons/miniDown.svg";
import file from "../../../assets/vendors/clients/file.svg";
import proPic from "../../../assets/vendors/clients/proPic.svg";

const ClientTable = () => {
    const { clients: clientsData, currentFilter, stats } = usePage().props;

    // State for filter (land, air, sea, all)
    const [activeFilter, setActiveFilter] = useState(currentFilter || 'all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Get clients based on active filter
    const getFilteredClients = () => {
        if (activeFilter === 'all') {
            return [
                ...(clientsData?.land || []),
                ...(clientsData?.air || []),
                ...(clientsData?.sea || [])
            ];
        }
        return clientsData?.[activeFilter] || [];
    };

    const [clients, setClients] = useState(getFilteredClients());

    // Update clients when filter changes
    useEffect(() => {
        setClients(getFilteredClients());
        setCurrentPage(1);
    }, [activeFilter, clientsData]);

    // Search functionality
    const filteredClients = clients.filter(client =>
        client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const perPageOptions = [5, 10, 20, 50];
    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const currentClients = filteredClients.slice(startIdx, endIdx);

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

    // Handle filter change
    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        // Optionally, reload data from backend
        router.get(`/vendors/clients?filter=${filter}`, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Reset to first page when itemsPerPage changes
    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    return (
        <div className="relative">
            {/* Filter Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                    className={`px-4 sm:px-6 py-2 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                        activeFilter === 'all'
                            ? 'bg-[#0955AC] text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => handleFilterChange('all')}
                >
                    All Clients
                </button>
                <button
                    className={`px-4 sm:px-6 py-2 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                        activeFilter === 'land'
                            ? 'bg-[#0955AC] text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => handleFilterChange('land')}
                >
                    🚗 Land
                </button>
                <button
                    className={`px-4 sm:px-6 py-2 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                        activeFilter === 'air'
                            ? 'bg-[#0955AC] text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => handleFilterChange('air')}
                >
                    ✈️ Air
                </button>
                <button
                    className={`px-4 sm:px-6 py-2 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                        activeFilter === 'sea'
                            ? 'bg-[#0955AC] text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => handleFilterChange('sea')}
                >
                    ⛵ Sea
                </button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
                <div className="flex flex-row gap-5 justify-center items-center w-full sm:w-auto">
                    <div className="w-full sm:w-[253px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row justify-center items-center py-2 px-5">
                        <img src={miniSearchIcon} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC]"
                            placeholder="Search client name, email, phone..."
                        />
                    </div>
                </div>
            </div>

            {/* table headings - hidden on mobile */}
            {!isMobile && (
                <div className="figtree grid grid-cols-8 bg-[#D8E4F2] h-[42px] justify-center items-center rounded-[8px] text-[14px] font-[600] px-10 mt-10">
                    <div className="flex flex-row gap-5 items-center col-span-2">
                        <input
                            type="checkbox"
                            className="size-[20px] rounded-[4px] bg-[#CCCCCC73]"
                        />
                        <h1>Client Name</h1>
                        <div className="flex flex-col justify-center items-center">
                            <img src={miniUp} className="w-[6px] h-[4px]" />
                            <img src={miniDown} className="w-[6px] h-[4px]" />
                        </div>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                        <h1>Contact No</h1>
                    </div>
                    <div className="flex flex-row gap-2 items-center col-span-2">
                        <h1>Address</h1>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                        <h1>Vehicle Type</h1>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                        <h1>Bookings</h1>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                        <h1>Total Spent</h1>
                    </div>
                </div>
            )}

            {/* Desktop Table View */}
            {!isMobile && (
                <>
                    {/* table rows */}
                    {currentClients.length > 0 ? (
                        currentClients.map((client) => (
                            <div
                                key={client.id}
                                className="figtree grid grid-cols-8 min-h-[100px] border-b-[1.5px] border-[#00000033] px-10 items-center text-[14px] font-[500] py-4"
                            >
                                <div className="flex flex-row col-span-2 items-center gap-7">
                                    <input
                                        type="checkbox"
                                        className="size-[20px] rounded-[4px] bg-[#CCCCCC73]"
                                    />
                                    <div className="flex flex-row gap-3 justify-center items-center">
                                        <img src={client.image || proPic} className="size-[50px]" />
                                        <div>
                                            <h1 className="text-[15px] font-semibold">{client.name}</h1>
                                            <h1 className="text-[#616161] text-[12px]">
                                                {client.email}
                                            </h1>
                                        </div>
                                    </div>
                                </div>
                                <div className="">{client.phone}</div>
                                <div className="col-span-2">{client.address}</div>
                                <div className="">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        client.vehicle_type === 'Land' ? 'bg-green-100 text-green-700' :
                                        client.vehicle_type === 'Air' ? 'bg-blue-100 text-blue-700' :
                                        'bg-cyan-100 text-cyan-700'
                                    }`}>
                                        {client.vehicle_type}
                                    </span>
                                </div>
                                <div className="text-center">
                                    <span className="font-semibold">{client.bookings_count}</span>
                                </div>
                                <div className="text-right font-semibold">
                                    ${client.total_spent?.toFixed(2) || '0.00'}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            No clients found for the selected filter.
                        </div>
                    )}
                    {/* end */}
                </>
            )}

            {/* Mobile Card View */}
            {isMobile && (
                <div className="mt-10 space-y-4">
                    {currentClients.length > 0 ? (
                        currentClients.map((client) => (
                            <div
                                key={client.id}
                                className="bg-white rounded-lg p-4 shadow-md border"
                            >
                                <div className="flex items-start gap-4">
                                    <input
                                        type="checkbox"
                                        className="size-[20px] rounded-[4px] bg-[#CCCCCC73] mt-1 flex-shrink-0"
                                    />
                                    <img
                                        src={client.image || proPic}
                                        className="size-[60px] rounded-full object-cover flex-shrink-0"
                                        alt="client"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-[18px] font-[700] truncate">{client.name}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                                                client.vehicle_type === 'Land' ? 'bg-green-100 text-green-700' :
                                                client.vehicle_type === 'Air' ? 'bg-blue-100 text-blue-700' :
                                                'bg-cyan-100 text-cyan-700'
                                            }`}>
                                                {client.vehicle_type}
                                            </span>
                                        </div>
                                        <p className="text-[14px] text-[#616161] mb-2 truncate">{client.email}</p>
                                        <div className="space-y-1 text-[14px]">
                                            <div className="flex justify-between">
                                                <span className="font-[600]">Phone:</span>
                                                <span className="truncate ml-2">{client.phone}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-[600]">Address:</span>
                                                <span className="truncate ml-2">{client.address}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-[600]">Bookings:</span>
                                                <span className="font-semibold ml-2">{client.bookings_count}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-[600]">Total Spent:</span>
                                                <span className="font-semibold ml-2">${client.total_spent?.toFixed(2) || '0.00'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            No clients found for the selected filter.
                        </div>
                    )}
                </div>
            )}

            {/* Pagination Controls and Results per page */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-20">
                {/* Left: Results per page */}
                <div className="flex items-center">
                    <span className="mr-3 text-[#00000080] text-[14px] sm:text-[15px]">
                        Results per page
                    </span>
                    <select
                        className="rounded px-3 py-1 font-[600] text-[14px] sm:text-[16px] bg-[#F4F3F3] border-[1px] border-[#BEBEBE] w-[71px] h-[40px] focus:outline-none"
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
                <div className="flex items-center gap-2 flex-wrap">
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
                                className={`px-3 py-1 text-[14px] sm:text-[16px] font-[600] rounded-[4px] size-[40px] bg-[#F4F3F3] ${
                                    currentPage === num
                                        ? " text-[#0955AC] font-[600] border-[2px] border-[#0955AC]"
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
        </div>
    );
};

export default ClientTable;
