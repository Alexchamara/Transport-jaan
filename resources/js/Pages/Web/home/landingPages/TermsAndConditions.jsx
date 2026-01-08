import React from "react";

const TermsAndConditions = () => {
    return (
        <div className="bg-black text-white min-h-screen poppins">
            <div className="container mx-auto px-20 py-20">
                <div className="flex items-center gap-5 mb-8">
                    <button
                        onClick={() => window.history.back()}
                        className="px-4 py-2 bg-[#FF7003] text-white font-bold rounded hover:bg-orange-600 transition"
                    >
                        Back
                    </button>
                    <h1 className="text-4xl font-bold ml-4 text-[#FF7003]">
                        Terms and Conditions
                    </h1>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-lg">
                    <p className="mb-4 text-gray-300">
                        Welcome to Company Name. By using our services, you agree
                        to the following terms and conditions. Please read them
                        carefully.
                    </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-[#FF7003]">
                        Acceptance of Terms
                    </h2>
                    <p className="mb-4 text-gray-300">
                        By accessing and using our transport and logistics platform, including services for land vehicles, sea vehicles, air vehicles, warehouse, freight, multi-modal transport, ticket booking, and courier services, you
                        accept and agree to be bound by the terms and provision of
                        this agreement.
                    </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-[#FF7003]">
                        Booking and Payments
                    </h2>
                    <ul className="list-disc list-inside mb-4 text-gray-300">
                        <li>
                            All bookings for land vehicles (cars, vans, buses, trucks), sea vehicles (ferries, boats, cargo ships), air vehicles (private jets, helicopters, cargo planes), warehouse storage, freight shipping, multi-modal transport, ticket reservations, and courier services are subject to availability and
                            confirmation.
                        </li>
                        <li>
                            Payments must be made in full at the time of booking
                            using accepted payment methods.
                        </li>
                        <li>Prices are subject to change without notice.</li>
                    </ul>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-[#FF7003]">
                        Cancellation and Refunds
                    </h2>
                    <p className="mb-4 text-gray-300">
                        Cancellations must be made within the specified timeframe for each service type. Refunds are processed according to our cancellation policy,
                        which varies by service (land vehicles, sea vehicles, air vehicles, warehouse, freight, multi-modal, ticket booking, courier).
                    </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-[#FF7003]">
                        User Responsibilities
                    </h2>
                    <ul className="list-disc list-inside mb-4 text-gray-300">
                        <li>
                            Provide accurate and complete information during
                            booking for all services.
                        </li>
                        <li>Arrive at designated locations on time for transport and pickup services.</li>
                        <li>
                            Comply with all transport regulations, safety
                            guidelines, and terms specific to each service mode (land, sea, air, warehouse, freight, etc.).
                        </li>
                    </ul>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-[#FF7003]">Liability</h2>
                    <p className="mb-4 text-gray-300">
                        Company Name is not liable for delays, cancellations, or
                        losses caused by unforeseen circumstances across all services. We recommend appropriate insurance for comprehensive coverage.
                    </p>
                </div>
                <h2 className="text-2xl font-semibold mb-4">
                    Changes to Terms
                </h2>
                <p className="mb-4">
                    We reserve the right to modify these terms at any time.
                    Continued use of our services constitutes acceptance of the
                    updated terms.
                </p>
                <p className="text-sm text-gray-600">
                    Last updated: January 8, 2026
                </p>
            </div>
        </div>
    );
};

export default TermsAndConditions;
