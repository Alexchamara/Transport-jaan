import React, { useState, useEffect } from "react";
import { router, Link } from "@inertiajs/react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from "../../layouts/Header";
import Footer from "../../layouts/Footer";

const INITIAL_PRICING_STATE = {
    monthly_rate: 0,
    security_deposit: 0,
    setup_fee: 0,
    tax_rate: 0,
    add_ons_cost: 0,
    monthly_total: 0,
    subtotal: 0,
    tax_amount: 0,
    total_amount: 0,
    final_amount: 0,
    duration: 1,
    duration_months: 1,
    space_utilization: 0,
    required_space: 0
};

const BookingSummary = ({ booking }) => {
    const [bookingData, setBookingData] = useState(null);
    const [warehouseData, setWarehouseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pricingDetails, setPricingDetails] = useState(INITIAL_PRICING_STATE);
    
    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                setLoading(true);
                
                // If we have booking data from props (from backend), use that
                if (booking) {
                    setBookingData(booking);
                    
                    // Fetch warehouse details if warehouse_unit_id is available
                    if (booking.warehouse_unit_id) {
                        try {
                            const warehouseResponse = await fetch(`/api/warehouse-units/${booking.warehouse_unit_id}`);
                            if (warehouseResponse.ok) {
                                const warehouseResult = await warehouseResponse.json();
                                setWarehouseData(warehouseResult.data || warehouseResult);
                            }
                        } catch (warehouseError) {
                            console.error('Error fetching warehouse details:', warehouseError);
                        }
                    }
                    
                    // Clear sessionStorage after getting data from backend
                    sessionStorage.removeItem('warehouseBookingData');
                    setLoading(false);
                    return;
                }
                
                // Otherwise try to get it from sessionStorage
                const savedData = sessionStorage.getItem('warehouseBookingData');
                if (savedData) {
                    try {
                        const parsedData = JSON.parse(savedData);
                        setBookingData(parsedData);
                        
                        // Clear sessionStorage after successful booking
                        sessionStorage.removeItem('warehouseBookingData');
                        setLoading(false);
                    } catch (error) {
                        console.error('Error parsing saved booking data:', error);
                        setError('Error loading booking information');
                        toast.error('Error loading booking information');
                        setLoading(false);
                    }
                } else {
                    // No saved data, redirect back to booking page
                    setError('No booking information found');
                    toast.error('No booking information found. Please start the booking process again.');
                    setTimeout(() => {
                        router.visit('/warehouse-bookings/', {
                            method: 'get'
                        });
                    }, 2000);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error in fetchBookingDetails:', error);
                setError('Failed to load booking details');
                setLoading(false);
            }
        };
        
        fetchBookingDetails();
    }, [booking]);

    const parseDuration = (duration) => {
        if (duration === null || duration === undefined || duration === '') {
            return 1;
        }

        if (typeof duration === 'number' && Number.isFinite(duration)) {
            return Math.max(1, Math.floor(duration));
        }

        const value = String(duration).trim();
        if (!value) return 1;

        if (!Number.isNaN(Number(value))) {
            return Math.max(1, parseInt(value, 10));
        }

        const match = value.match(/(\d+)/);
        return match ? Math.max(1, parseInt(match[1], 10)) : 1;
    };

    const calculatePricing = (warehouse = null, bookingContext = null) => {
        const currentBooking = bookingContext || bookingData;
        const currentWarehouse = warehouse || warehouseData;

        if (!currentBooking && !currentWarehouse) {
            setPricingDetails(INITIAL_PRICING_STATE);
            return;
        }

        try {
            const durationMonths = parseDuration(
                currentBooking?.storage_duration ??
                currentBooking?.duration_months ??
                currentWarehouse?.default_duration ??
                1
            );

            const rawRequiredSpace = Number(currentBooking?.required_space);
            const fallbackSpace = Number(
                currentBooking?.available_space ??
                currentWarehouse?.available_space ??
                currentWarehouse?.total_area ??
                0
            );
            const requiredSpace = Number.isFinite(rawRequiredSpace) && rawRequiredSpace > 0
                ? rawRequiredSpace
                : Math.max(fallbackSpace, 0);

            const baseMonthlyRate = parseFloat(
                currentBooking?.monthly_rate ??
                currentWarehouse?.monthly_rate ??
                currentWarehouse?.price ??
                currentWarehouse?.base_price ??
                0
            ) || 0;

            const securityDeposit = parseFloat(
                currentBooking?.security_deposit ??
                currentWarehouse?.security_deposit ??
                (baseMonthlyRate * 0.5) ??
                0
            ) || 0;

            const setupFee = parseFloat(
                currentBooking?.setup_fee ??
                currentWarehouse?.setup_fee ??
                (baseMonthlyRate * 0.2) ??
                0
            ) || 0;

            const resolveTaxRate = (rate) => {
                if (rate === null || rate === undefined) {
                    return 0.08;
                }
                const normalized = typeof rate === 'string' ? rate.replace(/[^0-9.]/g, '') : rate;
                const numeric = Number(normalized);
                if (!Number.isFinite(numeric)) {
                    return 0;
                }
                return numeric > 1 ? numeric / 100 : numeric;
            };

            const taxRate = resolveTaxRate(
                currentBooking?.tax_rate ??
                currentWarehouse?.tax_rate
            );

            const totalArea = parseFloat(
                currentWarehouse?.total_area ??
                currentBooking?.total_area ??
                (requiredSpace || 1)
            ) || 1;

            const addOnsCost = Number(currentBooking?.add_ons_cost) || 0;

            const spaceUtilization = Math.min(requiredSpace / totalArea, 1);
            const monthlyRate = baseMonthlyRate * spaceUtilization;
            const monthlyTotal = monthlyRate + addOnsCost;
            const subtotal = monthlyTotal * durationMonths;
            const taxAmount = subtotal * taxRate;
            const totalBeforeFees = subtotal + taxAmount;
            const finalAmount = totalBeforeFees + securityDeposit + setupFee;

            setPricingDetails({
                monthly_rate: monthlyRate,
                security_deposit: securityDeposit,
                setup_fee: setupFee,
                tax_rate: taxRate,
                add_ons_cost: addOnsCost,
                monthly_total: monthlyTotal,
                subtotal,
                tax_amount: taxAmount,
                total_amount: totalBeforeFees,
                final_amount: finalAmount,
                duration: durationMonths,
                duration_months: durationMonths,
                space_utilization: spaceUtilization,
                required_space: requiredSpace
            });
        } catch (pricingError) {
            console.error('Error calculating pricing summary:', pricingError);
            setPricingDetails(INITIAL_PRICING_STATE);
        }
    };

    useEffect(() => {
        if (!bookingData && !warehouseData) {
            setPricingDetails(INITIAL_PRICING_STATE);
            return;
        }

        calculatePricing(warehouseData, bookingData);
    }, [bookingData, warehouseData]);

    const monthlyDue = pricingDetails.monthly_total || (pricingDetails.monthly_rate + pricingDetails.add_ons_cost);
    const initialPaymentDue = (monthlyDue || 0) + (pricingDetails.security_deposit || 0) + (pricingDetails.setup_fee || 0);

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
    
    const formatCurrency = (amount) => {
        if (typeof amount !== 'number') return 'LKR 0.00';
        return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    
    const formatSqFt = (value) => {
        const numeric = Number(value);
        if (!Number.isFinite(numeric) || numeric <= 0) {
            return '0';
        }
        return numeric.toLocaleString();
    };
    
    const getBookingReference = () => {
        return bookingData?.booking_reference || 
               (booking?.id ? `WH-${String(booking.id).padStart(6, '0')}` : 
               `WH-${Math.floor(100000 + Math.random() * 900000)}`);
    };
    
    const getMoveInDate = () => {
        return bookingData?.start_date || bookingData?.move_in_date || null;
    };
    
    const getMoveOutDate = () => {
        return bookingData?.end_date || bookingData?.move_out_date || null;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="animate-pulse text-xl text-gray-500">Loading booking information...</div>
            </div>
        );
    }
    
    if (error || !bookingData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="text-xl text-red-500">{error || 'No booking information available'}</div>
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
                                        Booking Reference: {getBookingReference()}
                                    </h1>
                                    {bookingData?.status && (
                                        <h1 className="text-[14px]/[24px] font-[500] text-[#000000B2]">
                                            Status: <span className="capitalize">{bookingData.status}</span>
                                        </h1>
                                    )}
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
                                                    {warehouseData?.name || bookingData.warehouse_name || "Central Storage Facility - Bay A"}
                                                </h2>
                                                <p className="text-[14px] text-gray-600">
                                                    {warehouseData?.address || bookingData.location || "123 Warehouse Road, Industrial Zone, Colombo"}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[12px] text-gray-700">
                                                <div className="flex flex-col items-center gap-1">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                    <span>{formatSqFt(bookingData.required_space || 5000)} sq ft</span>
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
                                                        Move-in: {warehouseData?.name || bookingData.warehouse_name || "Central Storage Facility"}
                                                    </h3>
                                                    <p className="text-gray-600">
                                                        Move-in Date: {getMoveInDate() ? formatDate(getMoveInDate()) : "Not specified"}
                                                    </p>
                                                </div>
                                                <div>
                                                    <h3 className="text-[16px] font-[700] text-[#000000]">
                                                        Storage Details
                                                    </h3>
                                                    <p className="text-gray-600">
                                                        Duration: {bookingData.duration_months ? `${bookingData.duration_months} month${bookingData.duration_months > 1 ? 's' : ''}` : (bookingData.storage_duration || "Not specified")}
                                                    </p>
                                                    <p className="text-gray-600">Storage Type: {bookingData.storage_type || "General Storage"}</p>
                                                    <p className="text-gray-600">Required Space: {formatSqFt(bookingData.required_space || 1000)} sq ft</p>
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
                                            <h3 className="text-[14px] font-semibold text-gray-700">Contact Person</h3>
                                            <p className="text-[16px]">{bookingData.contact_person || "N/A"}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-[14px] font-semibold text-gray-700">Email Address</h3>
                                            <p className="text-[16px]">{bookingData.email || "N/A"}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-[14px] font-semibold text-gray-700">Phone Number</h3>
                                            <p className="text-[16px]">{bookingData.phone || "N/A"}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-[14px] font-semibold text-gray-700">Company Address</h3>
                                            <p className="text-[16px]">{bookingData.company_address || "N/A"}</p>
                                        </div>
                                    </div>
                                    
                                    {/* Schedule Information */}
                                    <div className="mt-6 border-t border-gray-200 pt-6">
                                        <h2 className="text-[18px] font-[600] mb-4">Schedule Information</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h3 className="text-[14px] font-semibold text-gray-700">Move-in Date</h3>
                                                <p className="text-[16px]">
                                                    {getMoveInDate() ? formatDate(getMoveInDate()) : "Not specified"}
                                                </p>
                                            </div>
                                            {getMoveOutDate() && (
                                                <div>
                                                    <h3 className="text-[14px] font-semibold text-gray-700">Move-out Date</h3>
                                                    <p className="text-[16px]">
                                                        {formatDate(getMoveOutDate())}
                                                    </p>
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-[14px] font-semibold text-gray-700">Access Hours</h3>
                                                <p className="text-[16px]">{bookingData.access_hours || "24/7"}</p>
                                            </div>
                                            {bookingData.special_instructions && (
                                                <div>
                                                    <h3 className="text-[14px] font-semibold text-gray-700">Special Instructions</h3>
                                                    <p className="text-[16px]">{bookingData.special_instructions}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {bookingData.company_name && (
                                        <div className="mt-6 border-t border-gray-200 pt-6">
                                            <h2 className="text-[18px] font-[600] mb-4">Company Information</h2>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="text-[14px] font-semibold text-gray-700">Company Name</h3>
                                                    <p className="text-[16px]">{bookingData.company_name}</p>
                                                </div>
                                                <div>
                                                    <h3 className="text-[14px] font-semibold text-gray-700">Goods Description</h3>
                                                    <p className="text-[16px]">{bookingData.goods_description || "General storage items"}</p>
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
                                            <p className="text-[16px]">{getPaymentMethodLabel(bookingData.payment_method || "Credit Card")}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-[14px] font-semibold text-gray-700">Payment Status</h3>
                                            <p className="text-[16px] capitalize">{bookingData.payment_status || "Pending"}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-[14px] font-semibold text-gray-700">Total Amount</h3>
                                            <p className="text-[16px] font-semibold">{formatCurrency(pricingDetails.final_amount || bookingData?.final_amount || bookingData?.total_amount || 0)}</p>
                                        </div>
                                        {bookingData.transaction_reference && (
                                            <div>
                                                <h3 className="text-[14px] font-semibold text-gray-700">Transaction Reference</h3>
                                                <p className="text-[16px]">{bookingData.transaction_reference}</p>
                                            </div>
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
                                        <h1 className="font-[600] mb-4 text-[#000000D9]">Pricing Breakdown</h1>
                                        <div className="w-full h-[1px] bg-[#CDD0D4]" />

                                        <div className="flex flex-col md:flex-row justify-between w-full px-4 py-4 font-[500]">
                                            <div>
                                                <h1 className="text-[#000000CC]">Monthly Storage Rate</h1>
                                                <div className="flex flex-col md:flex-row gap-3 text-[#00000061]">
                                                    <h1>{formatCurrency(pricingDetails.monthly_rate)}/month</h1>
                                                    <h1 className="text-[#0955AC]">
                                                        ({pricingDetails.duration || 1} month{(pricingDetails.duration || 1) > 1 ? 's' : ''})
                                                    </h1>
                                                </div>
                                            </div>
                                            <div className="text-[#000000CC]">{formatCurrency(pricingDetails.subtotal)}</div>
                                        </div>

                                        {pricingDetails.security_deposit > 0 && (
                                            <div className="flex flex-col md:flex-row justify-between w-full px-4 font-[500]">
                                                <div>
                                                    <h1 className="text-[#000000CC]">Security Deposit</h1>
                                                    <div className="flex flex-col md:flex-row gap-3 text-[#00000061]">
                                                        <h1>Refundable deposit</h1>
                                                        <h1 className="text-[#0955AC]">(One-time)</h1>
                                                    </div>
                                                </div>
                                                <div className="text-[#000000CC]">{formatCurrency(pricingDetails.security_deposit)}</div>
                                            </div>
                                        )}

                                        {pricingDetails.setup_fee > 0 && (
                                            <div className="flex flex-col md:flex-row justify-between w-full px-4 py-4 font-[500]">
                                                <div>
                                                    <h1 className="text-[#000000CC]">Setup Fee</h1>
                                                    <div className="flex flex-col md:flex-row gap-3 text-[#00000061]">
                                                        <h1>Initial setup and processing</h1>
                                                        <h1 className="text-[#0955AC]">(One-time)</h1>
                                                    </div>
                                                </div>
                                                <div className="text-[#000000CC]">{formatCurrency(pricingDetails.setup_fee)}</div>
                                            </div>
                                        )}

                                        {pricingDetails.add_ons_cost > 0 && (
                                            <div className="flex flex-col md:flex-row justify-between w-full px-4 py-4 font-[500]">
                                                <div>
                                                    <h1 className="text-[#000000CC]">Add-ons</h1>
                                                    <div className="flex flex-col md:flex-row gap-3 text-[#00000061]">
                                                        <h1>Additional services</h1>
                                                        <h1 className="text-[#0955AC]">(Monthly)</h1>
                                                    </div>
                                                </div>
                                                <div className="text-[#000000CC]">+{formatCurrency(pricingDetails.add_ons_cost * pricingDetails.duration)}</div>
                                            </div>
                                        )}

                                        {pricingDetails.tax_amount > 0 && (
                                            <div className="flex flex-col md:flex-row justify-between w-full px-4 py-4 font-[500]">
                                                <div>
                                                    <h1 className="text-[#000000CC]">Tax</h1>
                                                    <div className="flex flex-col md:flex-row gap-3 text-[#00000061]">
                                                        <h1>VAT and other taxes</h1>
                                                        <h1 className="text-[#0955AC]">({((pricingDetails.tax_rate || 0) * 100).toFixed(1)}%)</h1>
                                                    </div>
                                                </div>
                                                <div className="text-[#000000CC]">{formatCurrency(pricingDetails.tax_amount)}</div>
                                            </div>
                                        )}

                                        <div className="w-full h-[1px] bg-[#CDD0D4] my-4" />

                                        {pricingDetails.required_space > 0 && warehouseData?.total_area && (
                                            <div className="bg-blue-50 p-3 rounded mb-4">
                                                <h2 className="text-[11px] font-[600] text-blue-800 mb-1">Space Utilization</h2>
                                                <p className="text-[10px] text-blue-600">
                                                    {`Using ${(pricingDetails.space_utilization * 100).toFixed(1)}% of total capacity (${formatSqFt(pricingDetails.required_space)} / ${formatSqFt(warehouseData.total_area)} sq ft)`}
                                                </p>
                                            </div>
                                        )}

                                        <h1 className="font-[600] text-[#000000D9]">Payment Summary</h1>

                                        <div className="bg-gray-50 p-4 rounded my-4">
                                            <h2 className="text-[11px] font-[600] text-gray-800 mb-3">Monthly Charges</h2>
                                            <div className="space-y-2 text-[10px]">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Base Monthly Rate</span>
                                                    <span className="font-[500]">{formatCurrency(pricingDetails.monthly_rate)}</span>
                                                </div>
                                                {pricingDetails.add_ons_cost > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Add-ons</span>
                                                        <span className="font-[500]">+{formatCurrency(pricingDetails.add_ons_cost)}</span>
                                                    </div>
                                                )}
                                                <div className="border-t pt-2 flex justify-between font-[600]">
                                                    <span>Monthly Subtotal</span>
                                                    <span>{formatCurrency(monthlyDue || 0)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-yellow-50 p-4 rounded mb-4">
                                            <h2 className="text-[11px] font-[600] text-yellow-800 mb-3">One-time Charges</h2>
                                            <div className="space-y-2 text-[10px]">
                                                {pricingDetails.security_deposit > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-yellow-700">Security Deposit (Refundable)</span>
                                                        <span className="font-[500]">{formatCurrency(pricingDetails.security_deposit)}</span>
                                                    </div>
                                                )}
                                                {pricingDetails.setup_fee > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="text-yellow-700">Setup & Processing Fee</span>
                                                        <span className="font-[500]">{formatCurrency(pricingDetails.setup_fee)}</span>
                                                    </div>
                                                )}
                                                <div className="border-t pt-2 flex justify-between font-[600]">
                                                    <span>One-time Total</span>
                                                    <span>{formatCurrency((pricingDetails.security_deposit || 0) + (pricingDetails.setup_fee || 0))}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row justify-between w-full px-4 pb-4 font-[500]">
                                            <div>
                                                <h1 className="text-[#000000CC]">Initial Payment Due</h1>
                                                <div className="flex flex-col md:flex-row gap-3 text-[#00000061] mt-3">
                                                    <h1>First month + one-time fees</h1>
                                                </div>
                                            </div>
                                            <div className="text-[#000000CC] text-[12px] font-[600]">
                                                {formatCurrency(initialPaymentDue)}
                                            </div>
                                        </div>

                                        <div className="bg-green-50 p-4 rounded mb-4">
                                            <h2 className="text-[11px] font-[600] text-green-800 mb-3">Contract Summary ({pricingDetails.duration || 1} Month{(pricingDetails.duration || 1) > 1 ? 's' : ''})</h2>
                                            <div className="space-y-2 text-[10px]">
                                                <div className="flex justify-between">
                                                    <span className="text-green-700">Total Monthly Charges</span>
                                                    <span className="font-[500]">{formatCurrency(pricingDetails.subtotal)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-green-700">Tax ({((pricingDetails.tax_rate || 0) * 100).toFixed(1)}%)</span>
                                                    <span className="font-[500]">{formatCurrency(pricingDetails.tax_amount)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-green-700">One-time Fees</span>
                                                    <span className="font-[500]">{formatCurrency((pricingDetails.security_deposit || 0) + (pricingDetails.setup_fee || 0))}</span>
                                                </div>
                                                <div className="border-t-2 border-green-300 pt-2 flex justify-between font-[700] text-[12px]">
                                                    <span>Total Contract Value</span>
                                                    <span className="text-green-800">{formatCurrency(pricingDetails.final_amount)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative flex flex-col md:flex-row items-start justify-start px-4">
                                            <span className="absolute top-[5px] left-[20px] w-[2px] h-[2px] bg-[#0955AC] rounded-full" />
                                            <p className="text-[8.5px] text-[#00000061] ml-4">
                                                Pricing reflects your booking selections. Final charges may adjust if booking details change.
                                            </p>
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