import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import WarehouseForm from './WarehouseForm';
import { useForm } from '@inertiajs/react';

export default function Edit({ warehouse }) {
    const { put } = useForm();

    const handleSubmit = (formData) => {
        put(route('vendor.warehouses.update', warehouse.id), {
            data: formData,
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Edit Warehouse: {warehouse.name}
                </h2>
            }
        >
            <Head title={`Edit Warehouse: ${warehouse.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <WarehouseForm 
                                warehouse={warehouse}
                                onSubmit={handleSubmit}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 