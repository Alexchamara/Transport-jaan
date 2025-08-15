import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';

function handleApprove(id) {
    if (confirm('Are you sure you want to approve this vendor?')) {
        router.post(`/vendors/${id}/approve`);
    }
}

function handleDelete(id) {
    if (confirm('Are you sure you want to reject this vendor?')) {
        router.post(`/vendors/${id}/reject`);
    }
}

export default function VendorList({ vendor_lists }) {
    const [filter, setFilter] = useState('all');

    // Filter vendors based on status - fixed to match database values
    const filteredVendors = vendor_lists.filter(vendor => {
        if (filter === 'all') return true;
        if (filter === 'pending') return vendor.status === 'pending';
        if (filter === 'rejected') return vendor.status === 'rejected';
        if (filter === 'accepted') return vendor.status === 'accepted';
        return true;
    });

    return (
        <AuthenticatedLayout>
            <Head title="Vendor List" />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Vendor List</h2>

                        <div className="flex space-x-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                            >
                                All Vendors
                            </button>
                            <button
                                onClick={() => setFilter('pending')}
                                className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
                            >
                                Pending Vendors
                            </button>
                            <button
                                onClick={() => setFilter('accepted')}
                                className={`px-4 py-2 rounded ${filter === 'accepted' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                            >
                                Accepted Vendors
                            </button>
                            <button
                                onClick={() => setFilter('rejected')}
                                className={`px-4 py-2 rounded ${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
                            >
                                Rejected Vendors
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100 text-left">
                                    <th className="px-4 py-2 border">#</th>
                                    <th className="px-4 py-2 border">Name</th>
                                    <th className="px-4 py-2 border">Business Name</th>

                                    <th className="px-4 py-2 border">Document</th>
                                    <th className="px-4 py-2 border">Logo</th>
                                    <th className="px-4 py-2 border">Category</th>
                                    <th className="px-4 py-2 border">Vehicles</th>
                                    <th className="px-4 py-2 border">Air Cert</th>
                                    <th className="px-4 py-2 border">Maritime License</th>
                                    <th className="px-4 py-2 border">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVendors.length > 0 ? (
                                    filteredVendors.map((vendor, index) => (
                                        <tr key={vendor.id} className="border-t">
                                            <td className="px-4 py-2 border">{index + 1}</td>
                                            <td className="px-4 py-2 border">{vendor.user.name}</td>
                                            <td className="px-4 py-2 border">{vendor.business_name}
                                             <p className="text-red-600 text-xs "> Reg No :   {vendor.business_registration_no}</p>
                                            </td>
                                      


<td className="px-4 py-2 border">
                                            {vendor.registration_document ? (
                                                <a
                                                    href={`/vendor/document/${vendor.id}/registration-document`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 text-xs underline"
                                                >
                                                     <FontAwesomeIcon icon={faFilePdf} size="lg" />
                                                </a>
                                            ) : (
                                                "Not Available"
                                            )}
                                        </td>




                                            <td className="px-4 py-2 border">
                                                <img
                                                    src={`/storage/vendors/logos/${vendor.business_logo}`}
                                                    alt="Logo" className="w-12 h-12 object-cover" />
                                            </td>
                                            <td className="px-4 py-2 border">{vendor.category_id}</td>
                                            <td className="px-4 py-2 border">{vendor.no_of_vehicles}</td>






 <td className="px-4 py-2 border">
                                            {vendor.air_certificate ? (
                                                <a
                                                    href={`/vendor/document/${vendor.id}/air-certificate`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 underline"
                                                >
                                                     <FontAwesomeIcon icon={faFilePdf} size="lg" />
                                                </a>
                                            ) : (
                                                "Not Available"
                                            )}
                                        </td>







                                         <td className="px-4 py-2 border">
                                            {vendor.meritime_lisence ? (
                                                <a
                                                    href={`/vendor/document/${vendor.id}/meritime-lisence`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 underline"
                                                >
                                                     <FontAwesomeIcon icon={faFilePdf} size="lg" />
                                                </a>
                                            ) : (
                                                "Not Available"
                                            )}
                                        </td>
                                            <td className="px-4 py-2 border">
                                                {vendor.status === 'pending' ? (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleApprove(vendor.id)}
                                                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(vendor.id)}
                                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : vendor.status === 'rejected' ? (
                                                    <span className="text-red-600 font-semibold">Rejected</span>
                                                ) : (
                                                    <span className="text-green-600 font-semibold">Accepted</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="11" className="px-4 py-6 text-center text-gray-500">
                                            No vendors found matching the selected filter
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
