import React, { useEffect } from "react";
import SideMenu from "../../components/SuperAdmin/Dashboard1/SideMenu";
import RightSide from '../../components/SuperAdmin/Warehouse/RightSide';
import { usePage } from '@inertiajs/react';

const Warehouse = ({ warehouses, filters, error }) => {
    const { flash } = usePage().props;

    // Show flash messages
    useEffect(() => {
        if (flash.success) {
            alert(flash.success);
        }
        if (flash.error) {
            alert(flash.error);
        }
    }, [flash]);
    return (
        <div className="flex flex-row bg-[#081028] min-h-screen sm:flex-col md:flex-row lg:flex-row poppins">
            <div className="sm:w-full md:w-auto lg:w-auto">
                <SideMenu />
            </div>
            <div className="sm:w-full md:w-auto lg:w-auto">
                <RightSide
                    warehouses={warehouses}
                    filters={filters}
                    error={error}
                />
            </div>
        </div>
    );
};

export default Warehouse;
