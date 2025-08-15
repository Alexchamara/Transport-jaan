import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ServicePackageForm({ user, driver, servicePackageTypes = [] }) {
const { data, setData, post, processing, errors } = useForm({
    driver_id: driver?.user_id || '',  // set from props
    type_id: '',
    title: '',
    description: '',
    price: '',
    duration_in_hours: '',
});


    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('driver.service_package.store'));
    };

    return (
        <AuthenticatedLayout user={user}>
            <Head title="Create Service Package" />

            <div className="max-w-3xl mx-auto mt-12 bg-white p-8 rounded shadow">
                <h1 className="text-2xl font-bold text-green-700 mb-6">
                    Create a New Service Package
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Hidden Driver ID Field */}
            <input type="hidden" name="driver_id" value={data.driver_id} />

                    {/* Grid layout for other fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Package Type */}
                        <div>
                            <label className="block text-gray-700 font-medium">Package Type</label>
                            <select
                                value={data.type_id}
                                onChange={(e) => setData('type_id', e.target.value)}
                                className="w-full mt-1 p-2 border border-gray-300 rounded"
                            >
                                <option value="">-- Select Package Type --</option>
                                {servicePackageTypes.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                            {errors.type_id && <p className="text-red-500 text-sm mt-1">{errors.type_id}</p>}
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-gray-700 font-medium">Title</label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="w-full mt-1 p-2 border border-gray-300 rounded"
                                placeholder="Enter package title"
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-gray-700 font-medium">Price (LKR)</label>
                            <input
                                type="number"
                                value={data.price}
                                onChange={(e) => setData('price', e.target.value)}
                                className="w-full mt-1 p-2 border border-gray-300 rounded"
                                placeholder="e.g., 2000"
                                min="0"
                                step="0.01"
                            />
                            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block text-gray-700 font-medium">Duration (in hours)</label>
                            <input
                                type="number"
                                value={data.duration_in_hours}
                                onChange={(e) => setData('duration_in_hours', e.target.value)}
                                className="w-full mt-1 p-2 border border-gray-300 rounded"
                                placeholder="e.g., 2"
                                min="0.5"
                                step="0.5"
                            />
                            {errors.duration_in_hours && (
                                <p className="text-red-500 text-sm mt-1">{errors.duration_in_hours}</p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-gray-700 font-medium">Description</label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="w-full mt-1 p-2 border border-gray-300 rounded"
                            rows="4"
                            placeholder="Write details about the package"
                        ></textarea>
                        {errors.description && (
                            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="text-right">
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
                            disabled={processing}
                        >
                            {processing ? 'Submitting...' : 'Submit Package'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
