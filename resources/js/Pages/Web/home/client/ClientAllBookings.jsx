import React from "react";
import { Link } from "@inertiajs/react";
import ClientHeader from "./ClientHeader";
import Hero from "../../components/client/allBooking/Hero";

const ClientAllBookings = ({ allBookings = [], statistics = {}, monthlyData = [] }) => {
    return (
        <div className="bg-[#E5E5E5] min-h-screen">
            <ClientHeader />

            {/* Back Button */}
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-1 mb-3">
                <Link
                    href="/"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Home
                </Link>
            </div>

            <Hero 
                allBookings={allBookings} 
                statistics={statistics} 
                monthlyData={monthlyData} 
            />
        </div>
    );
};

export default ClientAllBookings;
