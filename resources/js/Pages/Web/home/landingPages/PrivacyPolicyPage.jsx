import React from "react";

const PrivacyPolicyPage = () => {
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
                        Privacy Policy
                    </h1>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-lg">
                    <p className="mb-4 text-gray-300">
                        At Company Name, we are committed to protecting your
                        privacy. This Privacy Policy explains how we collect, use,
                        and safeguard your information when you use our transport
                        and logistics services.
                    </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-[#FF7003]">
                        Information We Collect
                    </h2>
                    <ul className="list-disc list-inside mb-4 text-gray-300">
                        <li>
                            Personal information such as name, email, phone number,
                            and address provided during booking for land vehicles, sea vehicles, air vehicles, warehouse, freight, multi-modal, ticket booking, and courier services.
                        </li>
                        <li>
                            Payment information processed securely through our
                            payment partners.
                        </li>
                        <li>
                            Booking history and preferences across all services to improve our offerings.
                        </li>
                        <li>
                            Device and usage data for analytics and security
                            purposes.
                        </li>
                    </ul>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-[#FF7003]">
                        How We Use Your Information
                    </h2>
                    <ul className="list-disc list-inside mb-4 text-gray-300">
                        <li>
                            To process and confirm your bookings for land vehicles, sea vehicles, air vehicles, warehouse storage, freight shipping, multi-modal transport, ticket reservations, and courier services.
                        </li>
                        <li>
                            To communicate with you about your bookings, updates,
                            and promotions.
                        </li>
                        <li>
                            To enhance our services and provide personalized
                            recommendations.
                        </li>
                        <li>To comply with legal obligations and prevent fraud.</li>
                    </ul>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-[#FF7003]">
                        Data Sharing and Security
                    </h2>
                    <p className="mb-4 text-gray-300">
                        We do not sell or rent your personal information to third
                        parties. We may share data with trusted partners for booking
                        fulfillment, payment processing, and logistics coordination across land, sea, air, and warehouse services. All data is encrypted
                        and stored securely.
                    </p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg mb-6 shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-[#FF7003]">Your Rights</h2>
                    <p className="mb-4 text-gray-300">
                        You have the right to access, update, or delete your
                        personal information. Contact us at
                        privacy@companyname.com for any privacy-related inquiries.
                    </p>
                </div>
                <p className="text-sm text-gray-600">
                    Last updated: January 8, 2026
                </p>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
