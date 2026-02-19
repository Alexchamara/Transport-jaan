import React from "react";
import { Link } from "@inertiajs/react";
import Header from "./ClientHeader";
import Hero from "../../components/client/warehouseBooking/Hero";

const WarehouseBookingDashboard = () => {
    return (
        <div className="bg-[#E5E5E5] min-h-screen">
            <Header />

            {/* Back Button */}
            <div className="container mx-auto px-4 py-6">
                <Link
                    href="/clientAllBookings"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Main Dashboard
                </Link>
            </div>

            <Hero />
        </div>
    );
};

export default WarehouseBookingDashboard;
