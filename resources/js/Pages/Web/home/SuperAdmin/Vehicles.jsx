import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import SideMenu from "../../components/SuperAdmin/Dashboard1/SideMenu";

const Vehicles = ({ vehicles, categories, filters, stats, auth }) => {
    const [selectedVehicles, setSelectedVehicles] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        if (value === '' || value === 'all') {
            delete newFilters[key];
        }

        router.get(route('superadmin.Vehicles'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle search
    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            handleFilterChange('search', e.target.value);
        }
    };

    // Handle vehicle selection
    const handleVehicleSelect = (vehicleId) => {
        setSelectedVehicles(prev => {
            const newSelected = prev.includes(vehicleId)
                ? prev.filter(id => id !== vehicleId)
                : [...prev, vehicleId];
            setShowBulkActions(newSelected.length > 0);
            return newSelected;
        });
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedVehicles.length === vehicles.data.length) {
            setSelectedVehicles([]);
            setShowBulkActions(false);
        } else {
            const allIds = vehicles.data.map(vehicle => vehicle.id);
            setSelectedVehicles(allIds);
            setShowBulkActions(true);
        }
    };

    // Handle approval status change
    const handleApprovalChange = (vehicleId, status, reason = '') => {
        router.put(route('superadmin.vehicles.approval', vehicleId), {
            approval_status: status,
            rejection_reason: reason
        }, {
            onSuccess: () => {
                setSelectedVehicles([]);
                setShowBulkActions(false);
            }
        });
    };

    // Handle bulk approve
    const handleBulkApprove = () => {
        router.post(route('superadmin.vehicles.bulkApprove'), {
            vehicle_ids: selectedVehicles
        }, {
            onSuccess: () => {
                setSelectedVehicles([]);
                setShowBulkActions(false);
            }
        });
    };

    // Handle bulk reject
    const handleBulkReject = () => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        router.post(route('superadmin.vehicles.bulkReject'), {
            vehicle_ids: selectedVehicles,
            rejection_reason: rejectionReason
        }, {
            onSuccess: () => {
                setSelectedVehicles([]);
                setShowBulkActions(false);
                setRejectionReason('');
            }
        });
    };

    // Status badge component
    const StatusBadge = ({ status, type = 'status' }) => {
        const getStatusClass = () => {
            if (type === 'approval') {
                switch (status) {
                    case 'approved': return 'bg-green-100 text-green-800';
                    case 'pending': return 'bg-yellow-100 text-yellow-800';
                    case 'rejected': return 'bg-red-100 text-red-800';
                    default: return 'bg-gray-100 text-gray-800';
                }
            } else {
                switch (status) {
                    case 'active': return 'bg-green-100 text-green-800';
                    case 'inactive': return 'bg-red-100 text-red-800';
                    case 'draft': return 'bg-gray-100 text-gray-800';
                    default: return 'bg-gray-100 text-gray-800';
                }
            }
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass()}`}>
                {status?.charAt(0).toUpperCase() + status?.slice(1)}
            </span>
        );
    };

    return (
        <>
            <Head title="Vehicle Management" />
            <div className="flex flex-row bg-[#081028] min-h-screen text-white">
                <div className="w-auto">
                    <SideMenu />
                </div>

                <div className="flex-1 p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold mb-2">Vehicle Management</h1>
                        <p className="text-gray-400">Manage and approve vehicles across all categories</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
                            <div className="text-sm text-gray-400">Total Vehicles</div>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-400">{stats.pending_approval}</div>
                            <div className="text-sm text-gray-400">Pending Approval</div>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
                            <div className="text-sm text-gray-400">Approved</div>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
                            <div className="text-sm text-gray-400">Rejected</div>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-purple-400">{stats.active}</div>
                            <div className="text-sm text-gray-400">Active</div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-gray-800 p-4 rounded-lg mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {/* Search */}
                            <div>
                                <input
                                    type="text"
                                    placeholder="Search vehicles..."
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                                    defaultValue={filters.search || ''}
                                    onKeyDown={handleSearch}
                                />
                            </div>

                            {/* Category Filter */}
                            <div>
                                <select
                                    value={filters.category_type || ''}
                                    onChange={(e) => handleFilterChange('category_type', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category.type} value={category.type}>
                                            {category.type.charAt(0).toUpperCase() + category.type.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Approval Status Filter */}
                            <div>
                                <select
                                    value={filters.approval_status || ''}
                                    onChange={(e) => handleFilterChange('approval_status', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                >
                                    <option value="">All Approval Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <select
                                    value={filters.status || ''}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>

                            {/* Sort */}
                            <div>
                                <select
                                    value={`${filters.sort_by || 'created_at'}_${filters.sort_order || 'desc'}`}
                                    onChange={(e) => {
                                        const [sortBy, sortOrder] = e.target.value.split('_');
                                        router.get(route('superadmin.Vehicles'), {
                                            ...filters,
                                            sort_by: sortBy,
                                            sort_order: sortOrder
                                        }, { preserveState: true, preserveScroll: true });
                                    }}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                                >
                                    <option value="created_at_desc">Newest First</option>
                                    <option value="created_at_asc">Oldest First</option>
                                    <option value="model_asc">Model A-Z</option>
                                    <option value="model_desc">Model Z-A</option>
                                    <option value="rental_price_per_day_asc">Price Low-High</option>
                                    <option value="rental_price_per_day_desc">Price High-Low</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {showBulkActions && (
                        <div className="bg-blue-800 p-4 rounded-lg mb-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm">{selectedVehicles.length} vehicles selected</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleBulkApprove}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm"
                                    >
                                        Bulk Approve
                                    </button>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Rejection reason..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                                        />
                                        <button
                                            onClick={handleBulkReject}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-sm"
                                        >
                                            Bulk Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Vehicles Table */}
                    <div className="bg-gray-800 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-700">
                                    <tr>
                                        <th className="p-3 text-left">
                                            <input
                                                type="checkbox"
                                                checked={selectedVehicles.length === vehicles.data.length && vehicles.data.length > 0}
                                                onChange={handleSelectAll}
                                                className="rounded"
                                            />
                                        </th>
                                        <th className="p-3 text-left">Vehicle</th>
                                        <th className="p-3 text-left">Category</th>
                                        <th className="p-3 text-left">Owner</th>
                                        <th className="p-3 text-left">Price/Day</th>
                                        <th className="p-3 text-left">Status</th>
                                        <th className="p-3 text-left">Approval</th>
                                        <th className="p-3 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {vehicles.data.map((vehicle) => (
                                        <tr key={vehicle.id} className="hover:bg-gray-750">
                                            <td className="p-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedVehicles.includes(vehicle.id)}
                                                    onChange={() => handleVehicleSelect(vehicle.id)}
                                                    className="rounded"
                                                />
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-3">
                                                    {vehicle.media && vehicle.media.length > 0 ? (
                                                        <img
                                                            src={vehicle.media[0].url}
                                                            alt={vehicle.model}
                                                            className="w-12 h-12 rounded object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-gray-600 rounded flex items-center justify-center">
                                                            <span className="text-xs text-gray-400">No Image</span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-medium">{vehicle.manufacturer} {vehicle.model}</div>
                                                        <div className="text-sm text-gray-400">{vehicle.registration_number}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <span className="capitalize">{vehicle.category?.type}</span>
                                            </td>
                                            <td className="p-3">
                                                <div>
                                                    <div className="font-medium">{vehicle.provider?.name}</div>
                                                    <div className="text-sm text-gray-400">{vehicle.provider?.email}</div>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="font-medium">${vehicle.rental_price_per_day}</div>
                                                <div className="text-sm text-gray-400">{vehicle.currency}</div>
                                            </td>
                                            <td className="p-3">
                                                <StatusBadge status={vehicle.status} />
                                            </td>
                                            <td className="p-3">
                                                <StatusBadge status={vehicle.approval_status} type="approval" />
                                            </td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <Link
                                                        href={route('superadmin.vehicles.show', vehicle.id)}
                                                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                                                    >
                                                        View
                                                    </Link>
                                                    {vehicle.approval_status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleApprovalChange(vehicle.id, 'approved')}
                                                                className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    const reason = prompt('Rejection reason:');
                                                                    if (reason) handleApprovalChange(vehicle.id, 'rejected', reason);
                                                                }}
                                                                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {vehicles.last_page > 1 && (
                            <div className="p-4 border-t border-gray-700">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-400">
                                        Showing {vehicles.from} to {vehicles.to} of {vehicles.total} results
                                    </div>
                                    <div className="flex gap-2">
                                        {vehicles.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-2 rounded text-sm ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : link.url
                                                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {vehicles.data.length === 0 && (
                        <div className="bg-gray-800 p-8 rounded-lg text-center">
                            <div className="text-gray-400 mb-4">No vehicles found</div>
                            <p className="text-sm text-gray-500">Try adjusting your filters to see more results.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Vehicles;
