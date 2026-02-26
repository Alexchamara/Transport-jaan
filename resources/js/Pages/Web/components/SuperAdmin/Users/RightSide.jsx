import React, { useState, useEffect } from "react";
import Search from "../../../assets/superAdmin/Search.png";
import UserGroup from "../../../assets/superAdmin/User group Icon.svg";
import DotsThreeY from "../../../assets/superAdmin/DotsThreeY.svg";
import UserIconYellow from "../../../assets/superAdmin/Users Icon Yellow.svg";
import Heart from "../../../assets/superAdmin/Heart Icon.svg";
import Dots from "../../../assets/superAdmin/Dots Icon.svg";
import AllUsers from "../../SuperAdmin/Users/AllUsers";
import DropDownB from "../../../assets/superAdmin/Chevron DownB.svg";
import ArrowLeftB from "../../../assets/superAdmin/Arrow LeftB.svg";
import ArrowRight from "../../../assets/superAdmin/Arrow Right.svg";
import { Link, router } from "@inertiajs/react";

const RightSide = ({ users = [], counts = {}, filters = {}, pagination = {}, pageTitle = 'Users', baseRoute = '/superadmin/Users', showClientsCard = true, showVendorsCard = true, showRoleFilter = true }) => {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [perPage, setPerPage] = useState(filters.per_page || 10);
    const [showExportModal, setShowExportModal] = useState(false);

    // Sync local state with props when they change
    useEffect(() => {
        setSearchTerm(filters.search || '');
        setRoleFilter(filters.role || 'all');
        setStatusFilter(filters.status || 'all');
        setPerPage(filters.per_page || 10);
    }, [filters]);

    // Debounced search - trigger search automatically when user types
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            // Only perform search if searchTerm has changed from the filter prop
            if (searchTerm !== (filters.search || '')) {
                performSearch();
            }
        }, 500); // Wait 500ms after user stops typing

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    // Handle page visibility change to refresh stale data
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && (!users || users.length === 0) && counts && counts.total > 0) {
                console.log('Auto-refreshing: Page became visible with stale data');
                router.get(baseRoute, {
                    search: searchTerm,
                    role: roleFilter,
                    status: statusFilter,
                    per_page: perPage,
                }, {
                    preserveState: false,
                    replace: true
                });
            }
        };

        // Handle browser back/forward navigation
        const handlePopState = () => {
            console.log('Auto-refreshing: Browser navigation detected');
            router.get(baseRoute, {
                search: searchTerm,
                role: roleFilter,
                status: statusFilter,
                per_page: perPage,
            }, {
                preserveState: false,
                replace: true
            });
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('popstate', handlePopState);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [users, counts, searchTerm, roleFilter, statusFilter, perPage]);

    const performSearch = () => {
        router.get(baseRoute, {
            search: searchTerm,
            role: roleFilter,
            status: statusFilter,
            per_page: perPage,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleFilterChange = (filterType, value) => {
        const newFilters = {
            search: searchTerm,
            role: roleFilter,
            status: statusFilter,
            per_page: perPage,
            [filterType]: value
        };

        if (filterType === 'role') setRoleFilter(value);
        if (filterType === 'status') setStatusFilter(value);

        router.get(baseRoute, newFilters, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handlePerPageChange = (newPerPage) => {
        setPerPage(newPerPage);
        router.get(baseRoute, {
            search: searchTerm,
            role: roleFilter,
            status: statusFilter,
            per_page: newPerPage,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handlePageChange = (page) => {
        router.get(baseRoute, {
            search: searchTerm,
            role: roleFilter,
            status: statusFilter,
            per_page: perPage,
            page: page,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleExport = (format) => {
        // Get current filtered data parameters
        const exportParams = new URLSearchParams({
            search: searchTerm,
            role: roleFilter,
            status: statusFilter,
            format: format, // pdf, excel, or csv
        });

        // Trigger download
        window.location.href = `${baseRoute}/export?${exportParams.toString()}`;
        setShowExportModal(false);
    };

    return (
        <div className="flex flex-col gap-5 poppins">
            <div className="flex flex-col gap-5">
                <div className="w-[1125px] h-[42px] flex flex-row justify-between items-center px-4 md:px-12 lg:px-47 my-6 md:my-10 lg:my-[25px]">
                    <h1 className="text-white text-base md:text-lg lg:text-[24px] font-poppins">
                        {pageTitle}
                    </h1>

                    <Link
                        className="text-white flex flex-row justify-end items-center gap-1 md:gap-2 border border-[#0E43FB] bg-[#0E43FB] px-2 md:px-4 py-2 rounded-[5px] text-xs md:text-sm"
                        href={route('superadmin.users.create')}
                    >
                        <h1>Add user</h1>
                    </Link>
                </div>


            </div>

            {/* Cards */}
            <div className="w-[1060px] flex flex-row justify-center items-center gap-[22px] mx-[35px]">
                {/* Card1 */}
                <div className="w-[243px] h-[80px] border border-[#343B4F] bg-[#0B1739] my-4 rounded-[10px]">
                    <div className="w-[220px] flex flex-row justify-between items-center">
                        <div className="px-2 py-4 flex flex-row items-center gap-2">
                            <div className=" flex justify-center items-center w-8 h-8 bg-[#CB3CFF]/20 rounded-full">
                                <img src={UserGroup} />
                            </div>
                            <div>
                                <h1 className="text-white text-[16px] font-500">
                                    Total Users
                                </h1>
                                <h2 className="text-[#AEB9E1] text-[12px] font-400">
                                    {counts.total || 0}
                                </h2>
                            </div>
                        </div>
                        <img src={DotsThreeY} />
                    </div>
                </div>

                {/* Card2 */}
                {showClientsCard && (
                <div className="w-[243px] h-[80px] border border-[#343B4F] bg-[#0B1739] my-4 rounded-[10px]">
                    <div className="w-[220px] flex flex-row justify-between items-center">
                        <div className="px-2 py-4 flex flex-row items-center gap-2">
                            <div className=" flex justify-center items-center w-8 h-8 bg-[#FDB52A]/20 rounded-full">
                                <img src={UserIconYellow} />
                            </div>
                            <div>
                                <h1 className="text-white text-[16px] font-500">
                                    Clients
                                </h1>
                                <h2 className="text-[#AEB9E1] text-[12px] font-400">
                                    {counts.clients || 0}
                                </h2>
                            </div>
                        </div>
                        <img src={DotsThreeY} />
                    </div>
                </div>
                )}

                {/* Card3 */}
                {showVendorsCard && (
                <div className="w-[243px] h-[80px] border border-[#343B4F] bg-[#0B1739] my-4 rounded-[10px]">
                    <div className="w-[220px] flex flex-row justify-between items-center">
                        <div className="px-2 py-4 flex flex-row items-center gap-2">
                            <div className=" flex justify-center items-center w-8 h-8 bg-[#05C168]/20 rounded-full">
                                <img src={Heart} />
                            </div>
                            <div>
                                <h1 className="text-white text-[16px] font-500">
                                    Service Providers
                                </h1>
                                <h2 className="text-[#AEB9E1] text-[12px] font-400">
                                    {counts.vendors || 0}
                                </h2>
                            </div>
                        </div>
                        <img src={DotsThreeY} />
                    </div>
                </div>
                )}

                {/* Card4 */}
                <div className="w-[243px] h-[80px] border border-[#343B4F] bg-[#0B1739] my-4 rounded-[10px]">
                    <div className="w-[220px] flex flex-row justify-between items-center">
                        <div className="px-2 py-4 flex flex-row items-center gap-2">
                            <div className=" flex justify-center items-center w-8 h-8 bg-[#086CD9]/20 rounded-full">
                                <img src={Dots} />
                            </div>
                            <div>
                                <h1 className="text-white text-[16px] font-500">
                                    Verified
                                </h1>
                                <h2 className="text-[#AEB9E1] text-[12px] font-400">
                                    {counts.verified || 0}
                                </h2>
                            </div>
                        </div>
                        <img src={DotsThreeY} />
                    </div>
                </div>
            </div>

             {/* Search and Filter Controls */}
            <div className="w-[1125px] mx-[48px] mb-4">
                <div className="w-[860px] mx-auto">
                    <div className="flex flex-row gap-4 items-center">
                    {/* Search Input */}
                    <div className="flex flex-row items-center border border-[#343B4F] bg-[#0B1739] rounded-[5px] px-3 py-2 w-[500px]">
                        <img
                            src={Search}
                            alt="Search"
                            className="size-[14px] mr-2"
                        />
                        <input
                            placeholder="Search by name, email, phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent text-[#ffffff] text-[14px] outline-none border-none focus:outline-none focus:ring-0 w-full"
                        />
                    </div>

                    {/* Status Dropdown */}
                    <select
                        value={statusFilter}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="min-w-[140px] text-[14px] px-4 py-2 rounded-[5px] border border-[#343B4F] bg-[#0B1739] text-white cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="verified">Verified</option>
                        <option value="unverified">Unverified</option>
                        <option value="blocked">Blocked</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    {/* Role Filter (only show if showRoleFilter is true) */}
                    {showRoleFilter && (
                    <select
                        value={roleFilter}
                        onChange={(e) => handleFilterChange('role', e.target.value)}
                        className="min-w-[140px] text-[14px] px-4 py-2 rounded-[5px] border border-[#343B4F] bg-[#0B1739] text-white cursor-pointer"
                    >
                        <option value="all">All Roles</option>
                        <option value="client">Clients</option>
                        <option value="vendor">Service Providers</option>
                        <option value="freight">Freight Users</option>
                    </select>
                    )}

                    {/* Filters Button */}
                    {/* <button className="flex flex-row items-center gap-2 px-4 py-2 border border-[#343B4F] bg-[#0B1739] text-white rounded-[5px] hover:bg-[#181A2A] transition-colors">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 4H14M4 8H12M6 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <span className="text-[14px]">Filters</span>
                    </button> */}

                    {/* Export Button */}
                    <button 
                        onClick={() => setShowExportModal(true)}
                        className="flex flex-row items-center gap-2 px-4 py-2 border border-[#343B4F] bg-[#0B1739] text-white rounded-[5px] hover:bg-[#181A2A] transition-colors"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 10V2M8 10L10.5 7.5M8 10L5.5 7.5M2 14H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-[14px]">Export</span>
                    </button>
                </div>
            </div>
            </div>

            <div className="w-[1125px] h-auto mx-[48px] ">
                <div className="w-[1035px] h-auto border border-[#343B4F] bg-[#0B1739] rounded-[10px]">
                    <AllUsers users={users} />
                </div>
            </div>

            <div>
                <div className="flex flex-row justify-between items-center mt-5 mx-[48px] w-[1032px]">
                    <h1 className="text-white text-[12px] font-500">
                        {pagination.from || 0} - {pagination.to || 0} of {pagination.total || 0}
                    </h1>
                    <h1 className="text-[#AEB9E1] text-[12px] font-500 flex flex-row justify-center items-center gap-6">
                        Rows per page:
                        <select
                            value={perPage}
                            onChange={(e) => handlePerPageChange(parseInt(e.target.value))}
                            className="flex flex-row justify-center items-center gap-1 text-white border border-[#0B1739] bg-[#0A1330] py-[6px] px-[8px] cursor-pointer"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <div className="flex flex-row justify-center items-center gap-2">
                            <button 
                                onClick={() => handlePageChange(pagination.current_page - 1)}
                                disabled={pagination.current_page <= 1}
                                className="border border-[#0B1739] bg-[#0A1330] p-[6px] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <img src={ArrowLeftB} className="size-[14px]" />
                            </button>
                            <button 
                                onClick={() => handlePageChange(pagination.current_page + 1)}
                                disabled={pagination.current_page >= pagination.last_page}
                                className="border border-[#0B1739] bg-[#0A1330] p-[6px] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <img src={ArrowRight} className="size-[14px]" />
                            </button>
                        </div>
                    </h1>
                </div>
            </div>

            {/* Export Modal */}
            {showExportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-[420px] p-6">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Export {pageTitle}</h2>
                            <button 
                                onClick={() => setShowExportModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>

                        {/* Modal Subtitle */}
                        <p className="text-sm text-gray-600 mb-6">
                            Export all {pagination.total || 0} filtered users
                        </p>

                        {/* Export Options */}
                        <div className="space-y-3">
                            {/* Export as PDF */}
                            <button
                                onClick={() => handleExport('pdf')}
                                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6 2H14L18 6V16C18 17.1046 17.1046 18 16 18H4C2.89543 18 2 17.1046 2 16V4C2 2.89543 2.89543 2 4 2H6Z" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-gray-900">Export as PDF</p>
                                        <p className="text-sm text-gray-500">Printable document format</p>
                                    </div>
                                </div>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7.5 15L12.5 10L7.5 5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>

                            {/* Export as Excel */}
                            <button
                                onClick={() => handleExport('excel')}
                                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6 2H14L18 6V16C18 17.1046 17.1046 18 16 18H4C2.89543 18 2 17.1046 2 16V4C2 2.89543 2.89543 2 4 2H6Z" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-gray-900">Export as Excel</p>
                                        <p className="text-sm text-gray-500">Spreadsheet format (.xlsx)</p>
                                    </div>
                                </div>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7.5 15L12.5 10L7.5 5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>

                            {/* Export as CSV */}
                            <button
                                onClick={() => handleExport('csv')}
                                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6 2H14L18 6V16C18 17.1046 17.1046 18 16 18H4C2.89543 18 2 17.1046 2 16V4C2 2.89543 2.89543 2 4 2H6Z" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-gray-900">Export as CSV</p>
                                        <p className="text-sm text-gray-500">Comma-separated values</p>
                                    </div>
                                </div>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7.5 15L12.5 10L7.5 5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RightSide;
