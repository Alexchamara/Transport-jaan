import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react'; 
import { useState } from 'react';

export default function ComplaintDetail({ complaint }) {
    const [showResolveForm, setShowResolveForm] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        status: complaint.status,
        resolution_notes: complaint.resolution_notes || '',
        driver_action: 'none'
    });

    const updateStatus = (newStatus) => {
        router.post(`/complaints/${complaint.id}/status`, {
            status: newStatus
        });
    };

    const handleResolve = (e) => {
        e.preventDefault();
        post(`/complaints/${complaint.id}/resolve`);
    };

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        investigating: 'bg-blue-100 text-blue-800',
        resolved: 'bg-green-100 text-green-800',
        dismissed: 'bg-gray-100 text-gray-800'
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Complaint #${complaint.id}`} />

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold mb-2">Complaint #{complaint.id}</h2>
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${statusColors[complaint.status]}`}>
                                {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                            </span>
                            <span className="text-sm text-gray-500">
                                Filed on {new Date(complaint.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <h3 className="font-semibold mb-2">Complainant Details</h3>
                            <div className="bg-gray-50 p-4 rounded">
                                <p><span className="font-medium">Name:</span> {complaint.user?.name}</p>
                                <p><span className="font-medium">Email:</span> {complaint.user?.email}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Driver Details</h3>
                            <div className="bg-gray-50 p-4 rounded">
                                <p><span className="font-medium">Name:</span> {complaint.driver?.user?.name}</p>
                                <p><span className="font-medium">Email:</span> {complaint.driver?.user?.email}</p>
                                <p><span className="font-medium">Status:</span> {complaint.driver?.status}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="font-semibold mb-2">Complaint Details</h3>
                        <div className="bg-gray-50 p-4 rounded">
                            <p className="font-medium mb-2">{complaint.subject}</p>
                            <p className="whitespace-pre-wrap">{complaint.description}</p>
                            
                            {complaint.trip_id && (
                                <div className="mt-4">
                                    <p className="font-medium">Related Trip:</p>
                                    <p>Trip #{complaint.trip_id}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {complaint.resolved_at && (
                        <div className="mb-8">
                            <h3 className="font-semibold mb-2">Resolution</h3>
                            <div className="bg-gray-50 p-4 rounded">
                                <p><span className="font-medium">Resolved by:</span> {complaint.resolved_by?.name}</p>
                                <p><span className="font-medium">Date:</span> {new Date(complaint.resolved_at).toLocaleDateString()}</p>
                                <p className="font-medium mt-2">Notes:</p>
                                <p className="whitespace-pre-wrap">{complaint.resolution_notes}</p>
                            </div>
                        </div>
                    )}

                    {complaint.status !== 'resolved' && complaint.status !== 'dismissed' && (
                        <div className="mt-8">
                            <h3 className="font-semibold mb-4">Manage Complaint</h3>
                            
                            <div className="flex gap-3 mb-6">
                                {complaint.status === 'pending' && (
                                    <button 
                                        onClick={() => updateStatus('investigating')}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    >
                                        Mark as Investigating
                                    </button>
                                )}
                                
                                <button 
                                    onClick={() => setShowResolveForm(true)}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    Resolve Complaint
                                </button>
                            </div>
                            
                            {showResolveForm && (
                                <form onSubmit={handleResolve} className="bg-gray-50 p-4 rounded">
                                    <div className="mb-4">
                                        <label className="block mb-2 font-medium">Resolution Status:</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value="resolved"
                                                    checked={data.status === 'resolved'}
                                                    onChange={() => setData('status', 'resolved')}
                                                    className="mr-2"
                                                />
                                                Resolved (Valid Complaint)
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value="dismissed"
                                                    checked={data.status === 'dismissed'}
                                                    onChange={() => setData('status', 'dismissed')}
                                                    className="mr-2"
                                                />
                                                Dismissed (Invalid Complaint)
                                            </label>
                                        </div>
                                        {errors.status && (
                                            <p className="text-red-500 text-sm mt-1">{errors.status}</p>
                                        )}
                                    </div>
                                    
                                    {data.status === 'resolved' && (
                                        <div className="mb-4">
                                            <label className="block mb-2 font-medium">Driver Action:</label>
                                            <select
                                                value={data.driver_action}
                                                onChange={(e) => setData('driver_action', e.target.value)}
                                                className="w-full border-gray-300 rounded-md shadow-sm"
                                            >
                                                <option value="none">No Action Required</option>
                                                <option value="warn">Issue Warning</option>
                                                <option value="suspend">Suspend Driver</option>
                                                <option value="ban">Ban Driver</option>
                                            </select>
                                        </div>
                                    )}
                                    
                                    <div className="mb-4">
                                        <label className="block mb-2 font-medium">Resolution Notes:</label>
                                        <textarea
                                            value={data.resolution_notes}
                                            onChange={(e) => setData('resolution_notes', e.target.value)}
                                            className="w-full border-gray-300 rounded-md shadow-sm"
                                            rows={5}
                                            placeholder="Explain how this complaint was resolved or why it was dismissed..."
                                        ></textarea>
                                        {errors.resolution_notes && (
                                            <p className="text-red-500 text-sm mt-1">{errors.resolution_notes}</p>
                                        )}
                                    </div>
                                    
                                    <div className="flex gap-3">
                                        <button
                                            type="submit"
                                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                            disabled={processing}
                                        >
                                            Submit Resolution
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowResolveForm(false)}
                                            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}