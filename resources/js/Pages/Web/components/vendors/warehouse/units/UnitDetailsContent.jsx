import React, { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { API_BASE_URL } from "../../../../../../config/api";

import WarehouseImages from "./WarehouseImages";
import WarehouseInfo from "./WarehouseInfo";

import search from "../../../../assets/vendors/dashboard/searchIcon.svg";
import settings from "../../../../assets/vendors/dashboard/settings.svg";
import bell from "../../../../assets/vendors/dashboard/bell.svg";
import proPic from "../../../../assets/vendors/dashboard/proPic.svg";

import backArrow from "../../../../assets/vendors/units/backArrow.svg";

const UnitDetailsContent = ({ unitId }) => {
  const { auth } = usePage().props;
  const user = auth?.user;

    const [warehouseData, setWarehouseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (unitId) {
            fetchWarehouseDetails(unitId);
        } else {
            setError('Warehouse unit ID not provided');
            setLoading(false);
        }
    }, [unitId]);

    const fetchWarehouseDetails = async (id) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}vendors/warehouse/api/units/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch warehouse details: ${response.status}`);
            }

            const data = await response.json();
            setWarehouseData(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching warehouse details:', err);
            setError(err.message || 'Failed to load warehouse details');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-auto pr-5 py-10">
            {/* Header section */}
            <div className="flex flex-row gap-5 justify-between items-center">
                <h1 className="figtree text-[35px] font-[700]">Warehouse Units</h1>
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
                        <h1 className="text-[20px] font-[700]">{user?.name || 'Vendor'}</h1>
                        <h1 className="text-[16px] font-[600] text-[#7B7B7A]">
                            Vendor
                        </h1>
                    </div>
                </div>
            </div>
            {/* end of header section */}
            <div>
                <div
                    className="flex flex-row gap-5 items-center cursor-pointer"
                    onClick={() => (window.location.href = "/vendors/warehouse/units")}
                >
                    <img src={backArrow} alt="Back" />
                    <h1 className="text-[22px] font-[500] text-[#00000080]">
                        Warehouse Units / Unit Details
                    </h1>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="py-20 flex justify-center items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0955AC]"></div>
                        <span className="ml-3 text-[#7B7B7A]">Loading warehouse details...</span>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="py-20 flex justify-center items-center">
                        <div className="text-center">
                            <div className="text-red-500 text-lg font-semibold mb-2">Error</div>
                            <div className="text-[#7B7B7A] mb-4">{error}</div>
                            <button 
                                onClick={() => fetchWarehouseDetails(unitId)}
                                className="px-4 py-2 bg-[#0955AC] text-white rounded-md hover:bg-[#074A94] transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {/* Content */}
                {!loading && !error && warehouseData && (
                    <div className="py-10 md:px-10 flex flex-col xl:flex-row justify-center gap-10">
                        <div className="flex flex-col gap-10 justify-start items-center bg-[#FFFFFF] py-20 px-20 rounded-[10px]">
                            <WarehouseImages images={warehouseData.images} />
                            <WarehouseInfo warehouseData={warehouseData} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UnitDetailsContent;
