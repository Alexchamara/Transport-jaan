import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

const FreightCompanies = ({ freightCompanies }) => {
    return (
        <AuthenticatedLayout>
            <Head title="Freight Companies Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h2 className="text-2xl font-semibold mb-6">Freight Companies Management</h2>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Company Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Registration Number
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {freightCompanies.map((company) => (
                                            <tr key={company.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {company.logo && (
                                                            <img
                                                                src={company.logo}
                                                                alt="Company Logo"
                                                                className="h-10 w-10 rounded-full mr-3"
                                                            />
                                                        )}
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {company.business_name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {company.business_type}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {company.registration_number}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {company.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            company.status === 'approved'
                                                                ? 'bg-green-100 text-green-800'
                                                                : company.status === 'pending'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    {company.status === 'pending' && (
                                                        <div className="flex space-x-2">
                                                            <Link
                                                                href={route('admin.freight.approve', company.id)}
                                                                method="post"
                                                                as="button"
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                Approve
                                                            </Link>
                                                            <Link
                                                                href={route('admin.freight.reject', company.id)}
                                                                method="post"
                                                                as="button"
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                Reject
                                                            </Link>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default FreightCompanies; 