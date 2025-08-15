import { useState } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Pagination from "@/Components/Pagination";

export default function Couriers({ couriers, filters }) {
    const { data, setData, get, processing } = useForm({
        tracking_number: filters.tracking_number || "",
        start_date: filters.start_date || "",
        end_date: filters.end_date || "",
        status: filters.status || "",
    });
    
    const statuses = [
        { value: "", label: "All Statuses" },
        { value: "pending", label: "Pending" },
        { value: "picked_up", label: "Picked Up" },
        { value: "in_transit", label: "In Transit" },
        { value: "delivered", label: "Delivered" },
        { value: "cancelled", label: "Cancelled" },
    ];
    
    const handleSearch = (e) => {
        e.preventDefault();
        get(route("admin.couriers"), {
            preserveState: true,
            preserveScroll: true,
        });
    };
    
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };
    
    return (
        <AuthenticatedLayout>
            <Head title="Manage Courier Pickups" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-6">Courier Pickup Management</h2>
                        
                        {/* Filter Form */}
                        <form onSubmit={handleSearch} className="mb-6 bg-gray-50 p-4 rounded-md">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                {/* Form fields remain the same */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tracking Number</label>
                                    <input
                                        type="text"
                                        className="w-full border-gray-300 rounded-md shadow-sm"
                                        value={data.tracking_number}
                                        onChange={(e) => setData("tracking_number", e.target.value)}
                                        placeholder="Search tracking #"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        className="w-full border-gray-300 rounded-md shadow-sm"
                                        value={data.start_date}
                                        onChange={(e) => setData("start_date", e.target.value)}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">End Date</label>
                                    <input
                                        type="date"
                                        className="w-full border-gray-300 rounded-md shadow-sm"
                                        value={data.end_date}
                                        onChange={(e) => setData("end_date", e.target.value)}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status</label>
                                    <select
                                        className="w-full border-gray-300 rounded-md shadow-sm"
                                        value={data.status}
                                        onChange={(e) => setData("status", e.target.value)}
                                    >
                                        {statuses.map(status => (
                                            <option key={status.value} value={status.value}>{status.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                                <Link
                                    href={route("admin.couriers.clear")}
                                    className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                                >
                                    Clear Filters
                                </Link>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                    disabled={processing}
                                >
                                    Filter Results
                                </button>
                            </div>
                        </form>
                        
                        {/* Couriers Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="py-2 px-4 border text-left">Tracking #</th>
                                        <th className="py-2 px-4 border text-left">Sender</th>
                                        <th className="py-2 px-4 border text-left">Receivers</th>
                                        <th className="py-2 px-4 border text-left">Parcel Details</th>
                                        <th className="py-2 px-4 border text-left">Status</th>
                                        <th className="py-2 px-4 border text-left">Date Created</th>
                                        <th className="py-2 px-4 border text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {couriers.data.length > 0 ? (
                                        couriers.data.map(courier => (
                                            <tr key={courier.id} className="hover:bg-gray-50">
                                                <td className="py-2 px-4 border">{courier.tracking_number}</td>
                                                <td className="py-2 px-4 border">
                                                    <div className="font-medium">{courier.sender_name}</div>
                                                    <div className="text-sm text-gray-600">{courier.sender_telephone}</div>
                                                </td>
                                                <td className="py-2 px-4 border">
                                                    <div>{courier.receivers.length} location(s)</div>
                                                    <div className="text-sm text-gray-600">
                                                        {courier.receivers.map(r => r.receiver_name).join(", ")}
                                                    </div>
                                                </td>
                                                <td className="py-2 px-4 border">
                                                    <div>Type: {courier.parcel_type === "other" 
                                                        ? courier.custom_parcel_type 
                                                        : courier.parcel_type.replace("_", " ")}</div>
                                                    <div>Count: {courier.parcel_count}</div>
                                                    <div>Weight: {courier.parcel_weight} kg</div>
                                                </td>
                                                <td className="py-2 px-4 border">
                                                    <span className={`inline-block px-2 py-1 rounded text-xs 
                                                        ${courier.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                                        ${courier.status === 'picked_up' ? 'bg-blue-100 text-blue-800' : ''}
                                                        ${courier.status === 'in_transit' ? 'bg-purple-100 text-purple-800' : ''}
                                                        ${courier.status === 'delivered' ? 'bg-green-100 text-green-800' : ''}
                                                        ${courier.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                                                    `}>
                                                        {courier.status.replace("_", " ")}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-4 border">
                                                    {formatDate(courier.created_at)}
                                                </td>
                                                <td className="py-2 px-4 border">
                                                    <a 
                                                        href={route("couriers.show", courier.id)} 
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        View Details
                                                    </a>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="py-4 text-center text-gray-500">
                                                No courier pickups found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        <div className="mt-6">
                            <Pagination links={couriers.links} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}