import React from "react";

const ReturnPolicyPage = () => {
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
                        Return and Refund Policy
                    </h1>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-lg">
                    <p className="mb-4 text-gray-300">
                        At Company Name, we strive to provide excellent service.
                        This policy outlines our return and refund procedures for
                        bookings across all our services.
                    </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-[#FF7003]">
                        Cancellation Policy
                    </h2>
                    <ul className="list-disc list-inside mb-4 text-gray-300">
                        <li>
                            <strong className="text-white">Land Vehicles:</strong> Cancellations made 24
                            hours before rental start receive a full refund. Within 24
                            hours, 50% refund applies.
                        </li>
                        <li>
                            <strong className="text-white">Sea Vehicles:</strong> Cancellations made 48
                            hours before charter receive a full refund. Within 48
                            hours, 75% refund applies.
                        </li>
                        <li>
                            <strong className="text-white">Air Vehicles:</strong> Refunds vary by charter
                            policy; contact us for assistance.
                        </li>
                        <li>
                            <strong className="text-white">Warehouse:</strong> Cancellations before storage
                            commencement receive full refund; after commencement, prorated refund.
                        </li>
                        <li>
                            <strong className="text-white">Freight:</strong> Cancellations before pickup
                            receive full refund; after pickup, no refund.
                        </li>
                        <li>
                            <strong className="text-white">Multi-modal:</strong> Complex arrangements; contact us for cancellation terms.
                        </li>
                        <li>
                            <strong className="text-white">Ticket Booking:</strong> For buses, trains, ferries, and flights - cancellations 24 hours before departure receive full refund; within 24 hours, 50% refund.
                        </li>
                        <li>
                            <strong className="text-white">Courier:</strong> Cancellations before pickup
                            receive full refund; after pickup, no refund.
                        </li>
                    </ul>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-[#FF7003]">Refund Process</h2>
                    <p className="mb-4 text-gray-300">
                        Refunds are processed within 7-14 business days after
                        cancellation approval. Refunds will be issued to the
                        original payment method.
                    </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-[#FF7003]">Exceptions</h2>
                    <p className="mb-4 text-gray-300">
                        No refunds for no-shows or cancellations due to force
                        majeure events. Special promotions may have different terms.
                    </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-[#FF7003]">Contact Us</h2>
                    <p className="mb-4 text-gray-300">
                        For cancellation requests or questions, email
                        support@companyname.com or call our hotline.
                    </p>
                </div>
                <p className="text-sm text-gray-600">
                    Last updated: January 8, 2026
                </p>
            </div>
        </div>
    );
};

export default ReturnPolicyPage;
