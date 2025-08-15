// Add this component if it doesn't exist or update it to include status toggle functionality

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth, warehouses, flash }) {
    const handleStatusToggle = (warehouseId, currentStatus) => {
        if (confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this warehouse?`)) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = route('vendor.warehouses.toggle-status', warehouseId);
            
            const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            const methodInput = document.createElement('input');
            methodInput.type = 'hidden';
            methodInput.name = '_method';
            methodInput.value = 'PATCH';
            
            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = '_token';
            tokenInput.value = csrfToken;
            
            form.appendChild(methodInput);
            form.appendChild(tokenInput);
            document.body.appendChild(form);
            form.submit();
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">My Warehouses</h2>}
        >
            <Head title="My Warehouses" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {flash.success && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
                            {flash.success}
                        </div>
                    )}
                    
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-medium">Your Warehouses</h2>
                            <Link
                                href={route('vendor.warehouses.create')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                            >
                                Add New Warehouse
                            </Link>
                        </div>
                        
                        {warehouses.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {warehouses.map(warehouse => (
                                            <tr key={warehouse.id}>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">{warehouse.name}</div>
                                                    <div className="text-sm text-gray-500">{warehouse.address}</div>
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        {warehouse.type.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    {warehouse.total_area} sq. ft.
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    ${warehouse.price} / {warehouse.pricing_model}
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <button 
                                                        onClick={() => handleStatusToggle(warehouse.id, warehouse.is_active)}
                                                        className={`px-3 py-1 text-xs rounded-full font-medium 
                                                            ${warehouse.is_active 
                                                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                                : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                                                    >
                                                        {warehouse.is_active ? 'Active' : 'Inactive'}
                                                    </button>
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={route('vendor.warehouses.edit', warehouse.id)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Are you sure you want to delete this warehouse?')) {
                                                                    const form = document.createElement('form');
                                                                    form.method = 'POST';
                                                                    form.action = route('vendor.warehouses.destroy', warehouse.id);
                                                                    
                                                                    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
                                                                    const methodInput = document.createElement('input');
                                                                    methodInput.type = 'hidden';
                                                                    methodInput.name = '_method';
                                                                    methodInput.value = 'DELETE';
                                                                    
                                                                    const tokenInput = document.createElement('input');
                                                                    tokenInput.type = 'hidden';
                                                                    tokenInput.name = '_token';
                                                                    tokenInput.value = csrfToken;
                                                                    
                                                                    form.appendChild(methodInput);
                                                                    form.appendChild(tokenInput);
                                                                    document.body.appendChild(form);
                                                                    form.submit();
                                                                }
                                                            }}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-4">You haven't added any warehouses yet.</p>
                                <Link
                                    href={route('vendor.warehouses.create')}
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Add your first warehouse
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}