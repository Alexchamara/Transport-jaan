import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function RejectedNotice({ user, message }) {
    return (
        <AuthenticatedLayout user={user}>
            <Head title="Application Rejected" />

            <div className="max-w-2xl mx-auto mt-20 bg-white p-8 shadow-md rounded">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Application Rejected</h2>
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
