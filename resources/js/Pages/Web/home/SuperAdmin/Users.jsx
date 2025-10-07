import React, { useEffect } from "react";
import SideMenu from "../../components/SuperAdmin/Dashboard1/SideMenu";
import RightSide from "../../components/SuperAdmin/Users/RightSide";
import { usePage } from '@inertiajs/react';

const Users = ({ users, counts, filters }) => {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) {
            console.log('Success:', flash.success);
        }
        if (flash?.error) {
            console.error('Error:', flash.error);
        }
    }, [flash]);

    return (
        <div className="flex flex-row bg-[#081028] min-h-screen sm:flex-col md:flex-row lg:flex-row poppins">
            {flash?.success && (
                <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg z-50">
                    {flash.error}
                </div>
            )}
            <div className="sm:w-full md:w-auto lg:w-auto">
                <SideMenu />
            </div>
            <div className="sm:w-full md:w-auto lg:w-auto">
                <RightSide
                    users={users}
                    counts={counts}
                    filters={filters}
                />
            </div>
        </div>
    );
};

export default Users;
