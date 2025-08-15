import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function ServicePackageView({ user, driver, packages,servicePackageTypes  }) {
    const { props } = usePage();
    const success = props.flash?.success;

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);

    const { data, setData, put, processing, errors, reset } = useForm({
        title: '',
         type_id: '',
        price: '',
        duration_in_hours: '',
        description: ''
    });

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this package?")) {
            router.delete(route('driver.service_package.delete', id));
        }
    };

   const openEditModal = (pkg) => {
    setEditingPackage(pkg);
    setData({
        title: pkg.title,
        type_id: pkg.type_id || pkg.type?.id || '', // <== SAFE fallback
        price: pkg.price,
        duration_in_hours: pkg.duration_in_hours,
        description: pkg.description
    });
    setShowEditModal(true);
};


    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingPackage(null);
        reset();
    };

  const handleEditSubmit = (e) => {
    e.preventDefault();

    put(route('service_package.update', editingPackage.id), {
        onSuccess: () => {
            closeEditModal(); // Close modal on success
        },
        onError: (errors) => {
            // Optionally handle validation errors here if needed
            console.error(errors);
        }
    });
};

    return (
        <AuthenticatedLayout user={user}>
            <Head title="My Service Packages" />

            <div className="max-w-6xl mx-auto mt-10 p-6 bg-white shadow rounded-lg">
                <h1 className="text-2xl font-bold text-green-700 mb-4">Your Service Packages</h1>

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 p-3 rounded mb-4">
                        {success}
                    </div>
                )}

                {packages.length === 0 ? (
                    <p className="text-gray-600">You haven't created any service packages yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Title</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Type</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Price (LKR)</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Duration (hrs)</th>
                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Description</th>
                                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {packages.map(pkg => (
                                    <tr key={pkg.id}>
                                        <td className="px-4 py-2 text-sm text-gray-800">{pkg.title}</td>
         <td className="px-4 py-2 text-sm text-gray-700"> {pkg.type?.name}</td>
                                        <td className="px-4 py-2 text-sm text-gray-700">LKR {pkg.price}</td>
                                        <td className="px-4 py-2 text-sm text-gray-700">{pkg.duration_in_hours}</td>
                                        <td className="px-4 py-2 text-sm text-gray-700">{pkg.description}</td>
                                        <td className="px-4 py-2 text-sm text-center space-x-2">
                                            <button
                                                onClick={() => openEditModal(pkg)}
                                                className="inline-block text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(pkg.id)}
                                                className="inline-block text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-6 text-right">
                    <Link
                        href={route('driver.service_package_form')}
                        className="inline-block bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
                    >
                        Add New Package
                    </Link>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Edit Service Package</h3>
                        </div>

                        <form onSubmit={handleEditSubmit} className="px-6 py-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={e => setData('title', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    />
                                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                                </div>





<div>

    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
   <select
    value={data.type_id}
    onChange={e => setData('type_id', e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
    required
>
    <option value="">-- Select Package Type --</option>
    {servicePackageTypes?.map(type => (
        <option key={type.id} value={type.id}>
            {type.name}
        </option>
    ))}
</select>


    {errors.type_id && <p className="text-red-500 text-xs mt-1">{errors.type_id}</p>}
</div>








                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Price (LKR)
                                    </label>
                                    <input
                                        type="number"
                                        value={data.price}
                                        onChange={e => setData('price', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Duration (hours)
                                    </label>
                                    <input
                                        type="number"
                                        value={data.duration_in_hours}
                                        onChange={e => setData('duration_in_hours', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        min="0.5"
                                        step="0.5"
                                        required
                                    />
                                    {errors.duration_in_hours && <p className="text-red-500 text-xs mt-1">{errors.duration_in_hours}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        rows="3"
                                        required
                                    />
                                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50"
                                >
                                    {processing ? 'Updating...' : 'Update Package'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
