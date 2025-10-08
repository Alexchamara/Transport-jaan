import React from 'react';
import { Head } from '@inertiajs/react';

export default function ApprovalPending() {
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
                            <form method="POST" action="/logout">
                                <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')} />
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700"
                                >
                                    Log Out
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
