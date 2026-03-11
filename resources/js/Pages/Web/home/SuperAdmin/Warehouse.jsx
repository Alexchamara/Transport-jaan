import React, { useEffect } from "react";
import SideMenu from "../../components/SuperAdmin/Dashboard1/SideMenu";
import WarehouseDashboardRightSide from '../../components/SuperAdmin/Warehouse/WarehouseDashboardRightSide';
import { usePage } from '@inertiajs/react';

const Warehouse = ({ warehouses, filters, error, dashboardData }) => {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) {
            alert(flash.success);
        }
        if (flash?.error) {
            alert(flash.error);
        }
    }, [flash]);

    return (
        <div className="flex flex-row bg-[#081028] min-h-screen sm:flex-col md:flex-row lg:flex-row poppins">
            <div className="sm:w-full md:w-auto lg:w-auto">
                <SideMenu />
            </div>
            <div className="flex-1 overflow-x-hidden">
                <WarehouseDashboardRightSide
                    warehouses={warehouses}
                    filters={filters}
                    error={error}
                    dashboardData={dashboardData}
                />
            </div>
        </div>
    );
};

export default Warehouse;
