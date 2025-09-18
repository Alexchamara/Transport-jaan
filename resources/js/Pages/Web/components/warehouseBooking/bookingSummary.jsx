import React, { useState, useEffect } from "react";
import { router, Link } from "@inertiajs/react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from "../../layouts/Header";
import Footer from "../../layouts/Footer";

const BookingSummary = ({ booking }) => {
    const [bookingData, setBookingData] = useState(null);
    
    useEffect(() => {
        // If we have booking data from props (from backend), use that
        if (booking) {
            setBookingData(booking);
            // Clear sessionStorage after getting data from backend
            sessionStorage.removeItem('warehouseBookingData');
            return;
        }
        
        // Otherwise try to get it from sessionStorage
        const savedData = sessionStorage.getItem('warehouseBookingData');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                setBookingData(parsedData);
                
                // Clear sessionStorage after successful booking
                // This ensures if user refreshes the page, they'll be redirected
                // unless we have booking data from the backend
                sessionStorage.removeItem('warehouseBookingData');
            } catch (error) {
                console.error('Error parsing saved booking data:', error);
                toast.error('Error loading booking information');
                setTimeout(() => {
                    router.visit('/warehouse-bookings/', {
                        method: 'get'
                    });
                }, 2000);
            }
        } else {
            // No saved data, redirect back to booking page
            toast.error('No booking information found. Please start the booking process again.');
            setTimeout(() => {
                router.visit('/warehouse-bookings/', {
                    method: 'get'
                });
            }, 2000);
        }
    }, [booking]);

    const handleBackToHome = () => {
        router.visit("/warehouseList", {
            method: "get",
            preserveScroll: true,
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        const time = new Date(`2000-01-01T${timeString}`);
        return time.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPaymentMethodLabel = (method) => {
        switch (method) {
            case 'Credit Card': return 'Credit Card';
            case 'PayPal': return 'PayPal';
            case 'Bank Transfer': return 'Bank Transfer';
            default: return method;
        }
    };

    const getPaymentOptionLabel = (option) => {
        return option === 'full' ? 'Full Payment' : 'Deposit + Monthly Payments';
    };

    if (!bookingData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="animate-pulse text-xl text-gray-500">Loading booking information...</div>
            </div>
        );
    }

    return (
        <div>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <Header />

            <main className="py-10 px-4 md:px-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col gap-10">
                        {/* Progress Steps */}
                        <div className="flex flex-row items-start justify-center pb-10">
                            <div
                                className="md:flex flex-col hidden justify-center items-center gap-3 cursor-pointer"
                                onClick={handleBackToHome}
                            >
                                <div
                                    className="w-[18px] h-[18px] rounded-full bg-[#1565c0]"
                                    style={{
                                        boxShadow: "0 0 10px 8px #1565c088",
                                    }}
                                />
                                <h1 className="figtree text-[16px] font-[700] text-[#0955AC]">
                                    Select Warehouse
                                </h1>
                            </div>
                            <div className="lg:w-[136px] w-[50px] md:block hidden h-[2px] bg-[#0955AC] mt-3" />
                            <div
                                className="md:flex flex-col hidden justify-center items-center gap-3"
                            >
                                <div
                                    className="w-[18px] h-[18px] rounded-full bg-[#1565c0]"
                                    style={{
                                        boxShadow: "0 0 10px 8px #1565c088",
                                    }}
                                />
                                <h1 className="figtree text-[16px] font-[700] text-[#0955AC]">
                                    Booking Info
                                </h1>
                            </div>
                            <div className="lg:w-[136px] w-[50px] md:block hidden h-[2px] bg-[#0955AC] mt-3" />
                            <div
                                className="md:flex flex-col hidden justify-center items-center gap-3"
                            >
                                <div
                                    className="w-[18px] h-[18px] rounded-full bg-[#1565c0]"
                                    style={{
                                        boxShadow: "0 0 10px 8px #1565c088",
                                    }}
                                />
                                <h1 className="figtree text-[16px] font-[700] text-[#0955AC]">
                                    Payments
                                </h1>
                            </div>
                            <div className="lg:w-[136px] w-[50px] md:block hidden h-[2px] bg-[#0955AC] mt-3" />
                            <div className="flex flex-col justify-center items-center gap-3">
                                <div
                                    className="w-[18px] h-[18px] rounded-full bg-[#1565c0]"
                                    style={{
                                        boxShadow: "0 0 10px 8px #1565c088",
                                    }}
                                />
                                <h1 className="figtree text-[16px] font-[700] text-[#0955AC]">
                                    Booking Confirmation
                                </h1>
                            </div>
                        </div>

                        {/* Confirmation Message */}
                        <div
                            className="figtree h-auto bg-[#E2F6DC] rounded-[10px] px-10 py-10 w-full"
                            style={{
                                boxShadow: "4px 4px 4px #0000001A",
                            }}
                        >
                            <div className="flex md:flex-row flex-col justify-center gap-5 md:items-center">
                                <div className="size-[70px] border-[1.5px] border-[#13790A] rounded-[5px] flex justify-center items-center p-5">
                                    <svg className="w-[40px] h-[35px] text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-[20px]/[24px] font-[700] text-[#13790A]">
                                        YOUR BOOKING IS CONFIRMED!
                                    </h1>
                                    <h1 className="text-[14px]/[24px] font-[500] text-[#000000B2]">
                                        We've sent a confirmation email to your registered email address.
                                    </h1>
                                    <h1 className="text-[14px]/[24px] font-[500] text-[#000000B2]">
                                        Booking ID: {booking?.id || 'WH-' + Math.floor(100000 + Math.random() * 900000)}
                                    </h1>
                                </div>
                            </div>
                        </div>

                        {/* Booking Details */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Left Column - Warehouse Info */}
                            <div className="lg:col-span-2 space-y-6">
                                <div
                                    className="border-l-[0.2px] rounded-[10px] bg-[#FFFFFF] px-8 py-8"
                                    style={{
                                        borderLeftWidth: "0.2px",
                                        borderTopWidth: "0.2px",
                                        boxShadow: "4px 4px 4px #0000001A",
                                    }}
                                >
                                    <h1 className="text-[24px] font-[700] mb-6">
                                        Warehouse Details
                                    </h1>

                                    <div className="flex flex-col md:flex-row gap-6 items-start">
                                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                                            <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="space-y-4 flex-1">
                                            <div>
                                                <h2 className="text-[20px] font-[700]">
                                                    {bookingData.warehouse?.name || "Central Storage Facility - Bay A"}
                                                </h2>
                                                <p className="text-[14px] text-gray-600">
                                                    {bookingData.warehouse?.address || "123 Warehouse Road, Industrial Zone, Colombo"}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[12px] text-gray-700">
                                                <div className="flex flex-col items-center gap-1">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    <span>{bookingData.storage_details?.space_required || "5,000"} sq ft</span>
                                                </div>
                                                <div className="flex flex-col items-center gap-1">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                    <span>Secure</span>
                                                </div>
                                                <div className="flex flex-col items-center gap-1">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                    <span>Climate Control</span>
                                                </div>
                                                <div className="flex flex-col items-center gap-1">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>24/7 Access</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 border-t border-gray-200 pt-6">
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="flex flex-col items-center">
                                                <div className="size-[17px] bg-[#0955AC] rounded-full"></div>
                                                <div className="h-[77px] w-[1.5px] bg-[#0955AC]"></div>
                                                <div className="size-[17px] bg-[#0955AC] rounded-full"></div>
                                            </div>
                                            <div className="flex flex-col gap-8 text-[14px]">
                                                <div>
                                                    <h3 className="text-[16px] font-[700] text-[#000000]">
                                                        Move-in: {bookingData.warehouse?.name || "Central Storage Facility"}
                                                    </h3>
                                                    <p className="text-gray-600">Move-in Date: {formatDate(bookingData.storage_details?.start_date || "2025-06-23")}</p>
                                                    <p className="text-gray-600">Move-in Time: {bookingData.storage_details?.start_time || "10:00 AM"}</p>
                                                </div>
                                                <div>
                                                    <h3 className="text-[16px] font-[700] text-[#000000]">
                                                        Storage Duration: {bookingData.storage_details?.duration || "6"} {bookingData.storage_details?.duration_unit || "Months"}
                                                    </h3>
                                                    <p className="text-gray-600">Storage Type: {bookingData.storage_details?.storage_type || "General Storage"}</p>
                                                    <p className="text-gray-600">Required Space: {bookingData.storage_details?.space_required || "1,000"} sq ft</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Personal Information */}
                                <div
                                    className="border-l-[0.2px] rounded-[10px] bg-[#FFFFFF] px-8 py-8"
                                    style={{
                                        borderLeftWidth: "0.2px",
                                        borderTopWidth: "0.2px",
                                        boxShadow: "4px 4px 4px #0000001A",
                                    }}
                                >
                                    <h1 className="text-[24px] font-[700] mb-6">
                                        Personal Information
                                    </h1>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-[14px] font-semibold text-gray-700">Full Name</h3>
                                            <p className="text-[16px]">{bookingData.personal_info?.first_name || ""} {bookingData.personal_info?.last_name || ""}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-[14px] font-semibold text-gray-700">Email Address</h3>
                                            <p className="text-[16px]">{bookingData.personal_info?.email || ""}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-[14px] font-semibold text-gray-700">Phone Number</h3>
                                            <p className="text-[16px]">{bookingData.personal_info?.phone || ""}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-[14px] font-semibold text-gray-700">Address</h3>
                                            <p className="text-[16px]">{bookingData.personal_info?.address || ""}</p>
                                        </div>
                                    </div>

                                    {bookingData.company_info && (
                                        <div className="mt-6 border-t border-gray-200 pt-6">
                                            <h2 className="text-[18px] font-[600] mb-4">Company Information</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="text-[14px] font-semibold text-gray-700">Company Name</h3>
                                                    <p className="text-[16px]">{bookingData.company_info?.company_name || ""}</p>
                                                </div>
                                                <div>
                                                    <h3 className="text-[14px] font-semibold text-gray-700">Position</h3>
                                                    <p className="text-[16px]">{bookingData.company_info?.position || ""}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Payment Information */}
                                <div
                                    className="border-l-[0.2px] rounded-[10px] bg-[#FFFFFF] px-8 py-8"
                                    style={{
                                        borderLeftWidth: "0.2px",
                                        borderTopWidth: "0.2px",
                                        boxShadow: "4px 4px 4px #0000001A",
                                    }}
                                >
                                    <h1 className="text-[24px] font-[700] mb-6">
                                        Payment Information
                                    </h1>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-[14px] font-semibold text-gray-700">Payment Method</h3>
                                            <p className="text-[16px]">{getPaymentMethodLabel(bookingData.payment?.payment_method || "Credit Card")}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-[14px] font-semibold text-gray-700">Payment Option</h3>
                                            <p className="text-[16px]">{getPaymentOptionLabel(bookingData.payment?.payment_option || "full")}</p>
                                        </div>
                                        
                                        {bookingData.payment?.payment_method === "Bank Transfer" && (
                                            <>
                                                <div>
                                                    <h3 className="text-[14px] font-semibold text-gray-700">Reference Number</h3>
                                                    <p className="text-[16px]">{bookingData.payment?.reference_number || ""}</p>
                                                </div>
                                                <div>
                                                    <h3 className="text-[14px] font-semibold text-gray-700">Payment Receipt</h3>
                                                    <p className="text-[16px]">{bookingData.payment?.payment_receipt ? "Uploaded" : "Not provided"}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Price Summary */}
                            <div className="lg:col-span-1">
                                <div
                                    className="poppins h-auto bg-[#F4F3F3] rounded-[10px] px-8 py-8 sticky top-8"
                                    style={{
                                        boxShadow: "4px 4px 4px #0000001A",
                                    }}
                                >
                                    <h1 className="font-[600] text-[20px] mb-6">
                                        Payment Details
                                    </h1>

                                    <div className="poppins text-[12px] w-full h-auto bg-[#0955AC0D] rounded-[5px] flex flex-col py-6 px-6">
                                        <h1 className="font-[600] mb-4 text-[#000000D9]">
                                            Pricing Breakdown
                                        </h1>
                                        <div className="w-full h-[1px] bg-[#CDD0D4]" />
                                        <div className="flex flex-col md:flex-row justify-between w-full px-4 py-4 font-[500]">
                                            <div>
                                                <h1 className="text-[#000000CC]">
                                                    Storage Space Rate
                                                </h1>
                                                <div className="flex flex-col md:flex-row gap-3 text-[#00000061]">
                                                    <h1>$850/month</h1>
                                                    <h1 className="text-[#0955AC]">
                                                        (x{bookingData.storage_details?.duration || "6"} {bookingData.storage_details?.duration_unit === "Months" ? "months" : "months"})
                                                    </h1>
                                                </div>
                                            </div>
                                            <div className="text-[#000000CC]">
                                                $5100
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row justify-between w-full px-4 font-[500]">
                                            <div>
                                                <h1 className="text-[#000000CC]">
                                                    Long-term discount
                                                </h1>
                                                <div className="flex flex-col md:flex-row gap-3 text-[#00000061]">
                                                    <h1>6+ month discount</h1>
                                                    <h1 className="text-[#0955AC]">
                                                        (5%)
                                                    </h1>
                                                </div>
                                            </div>
                                            <div className="text-[#000000CC]">
                                                -$255
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row justify-between w-full px-4 py-4 font-[500]">
                                            <div>
                                                <h1 className="text-[#000000CC]">
                                                    Security Deposit
                                                </h1>
                                                <div className="flex flex-col md:flex-row gap-3 text-[#00000061]">
                                                    <h1>Refunded upon</h1>
                                                    <h1 className="text-[#0955AC]">
                                                        move-out
                                                    </h1>
                                                </div>
                                            </div>
                                            <div className="text-[#000000CC]">
                                                $850
                                            </div>
                                        </div>
                                        <div className="w-full h-[1px] bg-[#CDD0D4]" />

                                        <h1 className="font-[600] mt-4 text-[#000000D9]">
                                            Add Extras
                                        </h1>

                                        {/* checkbox section */}
                                        <div className="flex flex-col justify-center text-[12px] font-[500] mt-4">
                                            <div className="flex flex-col md:flex-row justify-between w-full px-4">
                                                <div className="flex flex-row md:justify-center items-center gap-4">
                                                    <h1>Climate Control</h1>
                                                </div>
                                                <h1>$300 (6 months)</h1>
                                            </div>
                                            <div className="flex flex-col md:flex-row justify-between w-full px-4 mt-2">
                                                <div className="flex flex-row md:justify-center items-center gap-4">
                                                    <h1>Insurance Coverage</h1>
                                                </div>
                                                <h1>Included</h1>
                                            </div>
                                        </div>

                                        <div className="w-full h-[1px] bg-[#CDD0D4] mt-4" />

                                        <div className="flex flex-col md:flex-row justify-between w-full px-4 py-4 font-[500]">
                                            <div>
                                                <h1 className="text-[#000000CC]">
                                                    Initial Payment
                                                </h1>
                                                <div className="flex flex-col md:flex-row gap-3 text-[#00000061] mt-3">
                                                    <h1>Setup + First Month</h1>
                                                </div>
                                            </div>
                                            <div className="text-[#000000CC] text-[12px] font-[500]">
                                                $1050
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row justify-between w-full px-4 pb-4 font-[500]">
                                            <div>
                                                <h1 className="text-[#000000CC]">
                                                    Total {bookingData.storage_details?.duration || "6"}-Month Cost
                                                </h1>
                                                <div className="flex flex-col md:flex-row gap-3 text-[#00000061] mt-3">
                                                    <h1>Including all fees</h1>
                                                </div>
                                            </div>
                                            <div className="text-[#000000CC] text-[16px] font-[700]">
                                                $6,045
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                                            <div className="flex items-center gap-3 mb-2">
                                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                <h3 className="text-[14px] font-semibold">Your booking is confirmed!</h3>
                                            </div>
                                            <p className="text-sm text-gray-600">A confirmation email has been sent to your email address with all booking details.</p>
                                        </div>

                                        <button
                                            onClick={handleBackToHome}
                                            className="w-full bg-[#0955AC] hover:bg-[#074a8f] text-white font-bold py-3 px-4 rounded-md transition-colors"
                                        >
                                            Back to Warehouse Listings
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BookingSummary;