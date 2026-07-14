import React, { useEffect } from "react";
import SideMenu from "../../components/SuperAdmin/Dashboard1/SideMenu";
import RightSide from "../../components/SuperAdmin/Users/RightSide";
import { usePage, router } from '@inertiajs/react';

const Users = ({ users, counts, filters, pagination }) => {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) {
            console.log('Success:', flash.success);
        }
        if (flash?.error) {
            console.error('Error:', flash.error);
        }
    }, [flash]);

    // Debug logging to track data loading
    useEffect(() => {
        console.log('Users component mounted/updated:', {
            usersCount: users?.length || 0,
            users: users,
            counts: counts,
            filters: filters
        });
    }, [users, counts, filters]);

    // Auto-refresh if component mounts with no data but should have data
    useEffect(() => {
        // Only run on initial mount (when users is undefined or empty but we expect data)
        if ((!users || users.length === 0) && (!counts || Object.keys(counts).length === 0)) {
            console.log('Users component: Auto-refreshing due to missing initial data');
            const currentFilters = filters || {};
            router.get('/superadmin/users', {
                search: currentFilters.search || '',
                role: currentFilters.role || 'all',
                status: currentFilters.status || 'all',
                per_page: currentFilters.per_page || 10,
            }, {
                preserveState: false,
                replace: true
            });
        }
    }, []); // Only run once on mount

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
                    pagination={pagination}
                />
            </div>
        </div>
    );
};

export default Users;
