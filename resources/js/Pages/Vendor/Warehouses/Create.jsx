import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import WarehouseForm from './WarehouseForm';

export default function Create() {
    const handleSubmit = (formData) => {
        // Log the form data for debugging
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        // Send the form data to the server
        router.post(route('vendor.warehouses.store'), formData, {
            forceFormData: true,
            onSuccess: () => {
                console.log('Form submitted successfully');
            },
            onError: (errors) => {
                console.error('Form submission errors:', errors);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Add New Warehouse
                </h2>
            }
        >
            <Head title="Add New Warehouse" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <WarehouseForm onSubmit={handleSubmit} />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 