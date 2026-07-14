import React from "react";
import { Link } from "@inertiajs/react";
import Header from "./ClientHeader";
import Hero from "../../components/client/ticketBooking/Hero";

const ClientTicketBookingDashboard = ({ bookings, monthlyData }) => {
    return (
        <div className="bg-[#E5E5E5] min-h-screen">
            <Header />

            {/* Back Button */}
            <div className="md:px-20">
                <div className="mx-auto max-w-[1300px] py-1">
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
            </div>

            <Hero bookings={bookings} monthlyData={monthlyData} />
        </div>
    );
};

export default ClientTicketBookingDashboard;
