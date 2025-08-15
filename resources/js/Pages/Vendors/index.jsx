import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function VendorDashboard({ user, vehicleCategories }) {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: user.id,
        business_name: '',
        business_registration_no: '',
        registration_document: null,
        business_logo: null,
        category_id: '',
        no_of_vehicles: '',
        air_certificate: null,
        meritime_lisence: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        // Create FormData for file upload
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== null && data[key] !== '') {
                formData.append(key, data[key]);
            }
        });

        post(route('vendor.store'), {
            data: formData,
            forceFormData: true,
            onSuccess: () => {
                reset(); // Reset all fields including text and selects
                // Reset file inputs manually (Inertia doesn't auto-clear them)
                document.querySelectorAll('input[type="file"]').forEach((input) => {
                    input.value = '';
                });
            },
            onError: (errors) => {
                console.log('Form errors:', errors);
            }
        });

        // Remove this redirect - let Inertia handle the response
        // window.location.href='/vendor-dashboard';
    };

    return (
        <AuthenticatedLayout
            header={
                <>
                    <h2 className="text-xl font-semibold text-gray-800">Vendor Dashboard</h2>
                    <p>Welcome, {user.name}! This is your vendor panel.</p>
                </>
            }
        >
            <Head title="Vendor Dashboard" />

            {/* Flash message */}
            {flash?.success && (
                <div className="mb-4 max-w-4xl mx-auto bg-green-100 text-green-800 p-4 rounded shadow">
                    ✅ {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="mb-4 max-w-4xl mx-auto bg-red-100 text-red-800 p-4 rounded shadow">
                    ❌ {flash.error}
                </div>
            )}

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 bg-white p-6 rounded shadow">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Text Fields */}
                            {[
                                { label: 'Business Name', key: 'business_name' },
                                { label: 'Registration No', key: 'business_registration_no' },
                                { label: 'No. of Vehicles', key: 'no_of_vehicles', type: 'number' },
                            ].map(({ label, key, type = 'text' }) => (
                                <div key={key}>
                                    <label className="block text-sm font-medium">{label}</label>
                                    <input
                                        type={type}
                                        value={data[key]}
                                        onChange={(e) => setData(key, e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded px-3 py-2"
                                        required={['business_name', 'business_registration_no', 'no_of_vehicles'].includes(key)}
                                    />
                                    {errors[key] && <p className="text-red-600 text-sm mt-1">{errors[key]}</p>}
                                </div>
                            ))}

                            {/* Select Category */}
                            <div>
                                <label className="block text-sm font-medium">Vehicle Category</label>
                                <select
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded px-3 py-2"
                                    required
                                >
                                    <option value="">-- Select Category --</option>
                                    {vehicleCategories?.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && <p className="text-red-600 text-sm mt-1">{errors.category_id}</p>}
                            </div>

                            {/* File Fields */}
                            {[
                                { label: 'Registration Document', key: 'registration_document' },
                                { label: 'Business Logo', key: 'business_logo' },
                                { label: 'Air Certificate', key: 'air_certificate' },
                                { label: 'Maritime License', key: 'meritime_lisence' },
                            ].map(({ label, key }) => (
                                <div key={key}>
                                    <label className="block text-sm font-medium">{label}</label>
                                    <input
                                        type="file"
                                        onChange={(e) => setData(key, e.target.files[0] || null)}
                                        className="mt-1 block w-full"
                                        accept={key === 'business_logo' ? 'image/*' : '.pdf,.jpg,.jpeg,.png'}
                                    />
                                    {errors[key] && <p className="text-red-600 text-sm mt-1">{errors[key]}</p>}
                                </div>
                            ))}
                        </div>

                        <div className="mt-6">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                disabled={processing}
                            >
                                {processing ? 'Submitting...' : 'Submit Vendor Info'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
