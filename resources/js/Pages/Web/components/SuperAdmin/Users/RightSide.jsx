import React, { useState } from "react";
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

const RightSide = ({ users = [], counts = {}, filters = {} }) => {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    };

    const performSearch = () => {
        router.get('/superadmin/Users', {
            search: searchTerm,
            role: roleFilter,
            status: statusFilter
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleFilterChange = (filterType, value) => {
        const newFilters = {
            search: searchTerm,
            role: roleFilter,
            status: statusFilter,
            [filterType]: value
        };

        if (filterType === 'role') setRoleFilter(value);
        if (filterType === 'status') setStatusFilter(value);

        router.get('/superadmin/Users', newFilters, {
            preserveState: true,
            replace: true
        });
    };

    return (
        <div className="flex flex-col gap-5 poppins">
            <div className="flex flex-col gap-5">
                <div className="w-[1125px] h-[42px] flex flex-row justify-between items-center px-4 md:px-12 lg:px-47 my-6 md:my-10 lg:my-[25px]">
                    <div className="flex flex-row justify-center items-center gap-6">
                        <h1 className="text-white text-base md:text-lg lg:text-[24px] font-poppins">
                            Users
                        </h1>
                        <div className="flex flex-row items-center border border-[#343B4F] bg-[#0B1739] rounded-[4px] overflow-hidden px-2">
                            <img
                                src={Search}
                                alt="Search"
                                className="size-[12px]"
                            />
                            <input
                                placeholder="Search for..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={handleSearch}
                                className="bg-transparent text-[#ffffff] text-[12px] outline-none border-none focus:outline-none focus:ring-0 p-2 w-full"
                            />
                        </div>
                    </div>

                    <Link className="text-white flex flex-row justify-end items-center gap-1 md:gap-2 border border-[#0E43FB] bg-[#0E43FB] px-2 md:px-4 py-2 rounded-[5px] text-xs md:text-sm" href="/SuperAdmin/AddUser">
                        <h1>Add user</h1>
                    </Link>
                </div>

                {/* Filter buttons */}
                <div className="flex flex-row gap-4 mx-12">
                    <select
                        value={roleFilter}
                        onChange={(e) => handleFilterChange('role', e.target.value)}
                        className="text-[15px] px-[9px] py-[6px] rounded-[5px] border border-[#343B4F] bg-[#0B1739] text-white"
                    >
                        <option value="all">All Roles</option>
                        <option value="client">Clients</option>
                        <option value="vendor">Vendors</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="text-[15px] px-[9px] py-[6px] rounded-[5px] border border-[#343B4F] bg-[#0B1739] text-white"
                    >
                        <option value="all">All Status</option>
                        <option value="verified">Verified</option>
                        <option value="unverified">Unverified</option>
                        <option value="blocked">Blocked</option>
                        <option value="rejected">Rejected</option>
                    </select>
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

                {/* Card3 */}
                <div className="w-[243px] h-[80px] border border-[#343B4F] bg-[#0B1739] my-4 rounded-[10px]">
                    <div className="w-[220px] flex flex-row justify-between items-center">
                        <div className="px-2 py-4 flex flex-row items-center gap-2">
                            <div className=" flex justify-center items-center w-8 h-8 bg-[#05C168]/20 rounded-full">
                                <img src={Heart} />
                            </div>
                            <div>
                                <h1 className="text-white text-[16px] font-500">
                                    Vendors
                                </h1>
                                <h2 className="text-[#AEB9E1] text-[12px] font-400">
                                    {counts.vendors || 0}
                                </h2>
                            </div>
                        </div>
                        <img src={DotsThreeY} />
                    </div>
                </div>

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

            <div className="w-[1125px] h-auto mx-[48px] ">
                <div className="w-[1035px] h-auto border border-[#343B4F] bg-[#0B1739] rounded-[10px]">
                    <AllUsers users={users} />
                </div>
            </div>

            <div>
                <div className="flex flex-row justify-between items-center mt-5 mx-[48px] w-[1032px]">
                    <h1 className="text-white text-[12px] font-500">
                        {users.length > 0 ? `1 - ${users.length}` : '0'} of {counts.total || 0}
                    </h1>
                    <h1 className="text-[#AEB9E1] text-[12px] font-500 flex flex-row justify-center items-center gap-6">
                        Rows per page:
                        <span className=" flex flex-row justify-center items-center gap-1 text-white border border-[#0B1739] bg-[#0A1330] py-[6px] px-[8px] ">
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
