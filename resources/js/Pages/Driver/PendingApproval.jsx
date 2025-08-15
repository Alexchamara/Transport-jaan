import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function PendingApproval({ user, message }) {
    return (
        <AuthenticatedLayout user={user}>
            <Head title="Pending Approval" />

            <div className="max-w-2xl mx-auto mt-20 bg-white p-8 shadow-md rounded text-center">
                <h2 className="text-2xl font-bold text-yellow-600 mb-4">Pending Approval</h2>
                <p className="text-gray-700">{message}</p>

                <div className="mt-6">
                    <a
                        href="/"
                        className="text-blue-600 underline hover:text-blue-800"
                    >
                        Return to Home
                    </a>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
