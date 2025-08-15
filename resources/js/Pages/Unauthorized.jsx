import { Head, Link } from '@inertiajs/react';

export default function Unauthorized({ error }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <Head title="Unauthorized" />
            <div className="bg-white p-10 rounded shadow-md text-center max-w-md">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                <p className="text-gray-700 mb-4">{error || 'You are not authorized to view this page.'}</p>
                <Link href="/" className="text-blue-600 underline">Go back to Home</Link>
            </div>
        </div>
    );
}
