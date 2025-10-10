import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';

export default function ApprovalPending() {
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Auto-refresh the page EVERY time it's visited to prevent stale CSRF token
    useEffect(() => {
        // Use a URL parameter to track if we just refreshed
        const urlParams = new URLSearchParams(window.location.search);
        const justRefreshed = urlParams.get('refreshed');

        if (!justRefreshed) {
            // Show loader and refresh with parameter
            setIsRefreshing(true);
            setTimeout(() => {
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('refreshed', '1');
                window.location.href = currentUrl.toString();
            }, 500);
        }
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();

        // Use router.post with preserveScroll to handle logout
        router.post(route('logout'), {}, {
            preserveScroll: true,
            onSuccess: () => {
                window.location.href = '/';
            },
            onError: (errors) => {
                console.error('Logout error:', errors);
                // Force reload and try again if there's an error
                window.location.href = route('logout');
            }
        });
    };

    // Simple loader overlay
    if (isRefreshing) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head title="Approval Pending" />
            <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100">
                <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white shadow-md overflow-hidden sm:rounded-lg">
                    <div className="mb-4 text-sm text-gray-600 text-center">
                        <div className="flex justify-center mb-4">
                            <svg className="w-16 h-16 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Approval Pending</h2>
                        <p className="text-gray-600 mb-6">
                            Your account is currently pending approval from our administrators.
                            Once your account is approved, you will be able to access all features.
                        </p>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                            <p className="text-yellow-700">
                                This usually takes 1-2 business days. We'll notify you by email when your account is approved.
                            </p>
                        </div>
                        <div className="flex items-center justify-between">
                            <a
                                href="/"
                                className="inline-flex items-center px-4 py-2 bg-gray-100 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-200"
                            >
                                Return to Home
                            </a>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700"
                            >
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
