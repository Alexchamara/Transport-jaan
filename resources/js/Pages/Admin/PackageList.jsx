import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function PackageList({ packages }) {
    const [filter, setFilter] = useState('all');
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [currentPackageId, setCurrentPackageId] = useState(null);
    
    const filteredPackages = packages.filter(pkg => {
        if (filter === 'all') return true;
        return pkg.status === filter;
    });
    
    const handleApprove = (id) => {
        if (confirm('Are you sure you want to approve this service package?')) {
            router.post(`/admin/packages/${id}/approve`);
        }
    };
    
    const openRejectModal = (id) => {
        setCurrentPackageId(id);
        setRejectionReason('');
        setRejectModalOpen(true);
    };
    
    const handleReject = () => {
        router.post(`/admin/packages/${currentPackageId}/reject`, {
            rejection_reason: rejectionReason
        });
        setRejectModalOpen(false);
    };
    
    const statusBadge = (status) => {
        const badges = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'approved': 'bg-green-100 text-green-800',
            'rejected': 'bg-red-100 text-red-800'
        };
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs ${badges[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };
    
    return (
        <AuthenticatedLayout>
            <Head title="Service Packages" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-800">
                                Driver Service Packages
                            </h2>
                            
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilter('pending')}
                                    className={`px-3 py-1 rounded ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
                                >
                                    Pending
                                </button>
                                <button
                                    onClick={() => setFilter('approved')}
                                    className={`px-3 py-1 rounded ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
                                >
                                    Approved
                                </button>
                                <button
                                    onClick={() => setFilter('rejected')}
                                    className={`px-3 py-1 rounded ${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
                                >
                                    Rejected
                                </button>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200">
                                <thead>
                                    <tr>
                                        <th className="py-2 px-4 border-b text-left">ID</th>
                                        <th className="py-2 px-4 border-b text-left">Driver</th>
                                        <th className="py-2 px-4 border-b text-left">Title</th>
                                        <th className="py-2 px-4 border-b text-left">Type</th>
                                        <th className="py-2 px-4 border-b text-left">Price</th>
                                        <th className="py-2 px-4 border-b text-left">Status</th>
                                        <th className="py-2 px-4 border-b text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPackages.map(pkg => (
                                        <tr key={pkg.id} className="hover:bg-gray-50">
                                            <td className="py-2 px-4 border-b">{pkg.id}</td>
                                            <td className="py-2 px-4 border-b">
                                                {pkg.driver?.user?.name || 'Unknown Driver'}
                                            </td>
                                            <td className="py-2 px-4 border-b">{pkg.title}</td>
                                            <td className="py-2 px-4 border-b capitalize">{pkg.type}</td>
                                            <td className="py-2 px-4 border-b">${pkg.price}</td>
                                            <td className="py-2 px-4 border-b">
                                                {statusBadge(pkg.status)}
                                                {pkg.status === 'rejected' && pkg.rejection_reason && (
                                                    <div className="text-xs text-red-600 mt-1">
                                                        Reason: {pkg.rejection_reason}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-2 px-4 border-b">
                                                {pkg.status === 'pending' && (
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleApprove(pkg.id)}
                                                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => openRejectModal(pkg.id)}
                                                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    
                                    {filteredPackages.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="py-4 text-center text-gray-500">
                                                No packages found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Rejection Modal */}
            {rejectModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-medium mb-4">Reject Service Package</h3>
                        <div className="mb-4">
                            <label className="block mb-2 text-sm font-medium">
                                Reason for Rejection:
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full border-gray-300 rounded-md shadow-sm"
                                rows={4}
                                placeholder="Please provide a reason for rejecting this service package..."
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setRejectModalOpen(false)}
                                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectionReason.trim()}
                                className={`${
                                    !rejectionReason.trim() ? 'bg-red-300' : 'bg-red-500 hover:bg-red-600'
                                } text-white px-4 py-2 rounded`}
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}