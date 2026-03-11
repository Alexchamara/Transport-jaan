import React, { useEffect } from "react";
import { Head, usePage } from "@inertiajs/react";
import SideMenu from "../../components/SuperAdmin/Dashboard1/SideMenu";
import VehicleDashboardRightSide from "../../components/SuperAdmin/Vehicles/VehicleDashboardRightSide";

const Vehicles = ({ vehicles, categories, filters, stats, dashboardData, auth }) => {
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
        <>
            <Head title="Vehicle Management" />
            <div className="flex flex-row bg-[#081028] min-h-screen sm:flex-col md:flex-row lg:flex-row poppins">
                <div className="sm:w-full md:w-auto lg:w-auto">
                    <SideMenu />
                </div>
                <div className="flex-1 overflow-x-hidden">
                    <VehicleDashboardRightSide
                        vehicles={vehicles}
                        filters={filters}
                        stats={stats}
                        dashboardData={dashboardData}
                    />
                </div>
            </div>
        </>
    );
};

export default Vehicles;
