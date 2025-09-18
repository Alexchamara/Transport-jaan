import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const WarehousePayments = () => {
    const [selectedPayment, setSelectedPayment] = useState("Credit Card");
    const [slipNumber, setSlipNumber] = useState("");
    const [slipPdf, setSlipPdf] = useState(null);
    const [bookingData, setBookingData] = useState(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [paymentOption, setPaymentOption] = useState("full"); // full or deposit
    const [errors, setErrors] = useState({});
    
    // Load saved booking data from session storage when component mounts
    useEffect(() => {
        const savedData = sessionStorage.getItem('warehouseBookingData');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                setBookingData(parsedData);
            } catch (error) {
                console.error('Error parsing saved booking data:', error);
                toast.error('Error loading booking information');
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
    }, []);

    const handleConfirmBooking = () => {
        // Validate required fields
        const newErrors = {};
        
        if (!termsAccepted) {
            newErrors.terms = 'You must accept the terms and conditions';
        }
        
        if (selectedPayment === "Bank Transfer") {
            if (!slipNumber.trim()) {
                newErrors.slipNumber = 'Reference number is required for bank transfers';
            }
            
            if (!slipPdf) {
                newErrors.slipPdf = 'Payment receipt is required for bank transfers';
            }
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error('Please fix the errors before proceeding');
            return;
        }
        
        // All validations passed - save payment data
        const paymentData = {
            payment_method: selectedPayment,
            payment_option: paymentOption,
            reference_number: slipNumber || null,
            payment_receipt: slipPdf ? 'uploaded' : null,
        };
        
        // Update session storage with payment data
        if (bookingData) {
            const updatedBookingData = {
                ...bookingData,
                payment: paymentData
            };
            sessionStorage.setItem('warehouseBookingData', JSON.stringify(updatedBookingData));
            
            // Save to database via API
            const formattedData = {
                warehouse_id: updatedBookingData.warehouse_id || (updatedBookingData.warehouse?.id) || updatedBookingData.id,
                company_name: updatedBookingData.company_name || updatedBookingData.companyName || '',
                contact_person: updatedBookingData.contact_person || updatedBookingData.contactPerson || `${updatedBookingData.firstName || ''} ${updatedBookingData.lastName || ''}`.trim(),
                email: updatedBookingData.email || updatedBookingData.contactEmail || '',
                phone: updatedBookingData.phone || updatedBookingData.contactPhone || updatedBookingData.phoneNumber || '',
                company_address: updatedBookingData.company_address || updatedBookingData.companyAddress || '',
                storage_type: updatedBookingData.storage_type || updatedBookingData.storageType || 'General Storage',
                required_space: updatedBookingData.required_space || updatedBookingData.requiredSpace || updatedBookingData.spaceNeeded || 1000,
                goods_type: updatedBookingData.goods_type || updatedBookingData.goodsType || 'General',
                goods_description: updatedBookingData.goods_description || updatedBookingData.goodsDescription || 'General goods',
                estimated_weight: updatedBookingData.estimated_weight || updatedBookingData.estimatedWeight || null,
                special_requirements: updatedBookingData.special_requirements || updatedBookingData.specialRequirements || null,
                amenities: updatedBookingData.amenities || null,
                start_date: updatedBookingData.start_date || updatedBookingData.startDate || updatedBookingData.moveInDate || '2025-09-15',
                end_date: updatedBookingData.end_date || updatedBookingData.endDate || null,
                duration_months: updatedBookingData.duration_months || updatedBookingData.durationMonths || updatedBookingData.storageDuration || null,
                access_hours: updatedBookingData.access_hours || updatedBookingData.accessHours || '24/7',
                special_instructions: updatedBookingData.special_instructions || updatedBookingData.specialInstructions || null,
                monthly_rate: updatedBookingData.monthly_rate || updatedBookingData.monthlyRate || updatedBookingData.price || 1000,
                security_deposit: updatedBookingData.security_deposit || updatedBookingData.securityDeposit || 0,
                setup_fee: updatedBookingData.setup_fee || updatedBookingData.setupFee || 0,
                total_amount: updatedBookingData.total_amount || updatedBookingData.totalAmount || 1000,
                tax_amount: updatedBookingData.tax_amount || updatedBookingData.taxAmount || 0,
                final_amount: updatedBookingData.final_amount || updatedBookingData.finalAmount || 1000,
                terms_accepted: termsAccepted,
                insurance_required: updatedBookingData.insurance_required || updatedBookingData.insuranceRequired || false,
                notes: updatedBookingData.notes || null,
                payment_method: paymentData.payment_method.toLowerCase().replace(' ', '_'),
                payment_option: paymentData.payment_option,
                payment_reference: paymentData.reference_number
            };
            
            console.log('Original booking data:', updatedBookingData);
            console.log('Formatted data to send:', formattedData);
            
            // Show loading message
            toast.info('Processing your booking...');
            
            // Send booking data to server using axios
            axios.post('/warehouse-bookings/book', formattedData)
                .then(response => {
                    const data = response.data;
                    if (data.success) {
                        // Show success message
                        toast.success('Booking created successfully!');
                        
                        // Clear form data from session storage
                        sessionStorage.removeItem('warehouseBookingData');
                        
                        // Navigate to summary page (with booking ID if available)
                        setTimeout(() => {
                            if (data.booking_id) {
                                router.visit(`/warehouse-bookings/summary/${data.booking_id}`, {
                                    method: "get",
                                    preserveScroll: true,
                                });
                            } else {
                                router.visit("/warehouse-bookings/summary", {
                                    method: "get",
                                    preserveScroll: true,
                                });
                            }
                        }, 1500);
                    } else {
                        toast.error(data.message || 'Failed to create booking');
                    }
                })
                .catch(error => {
                    console.error('Error saving booking:', error);
                    toast.error('An error occurred while processing your booking');
                    
                    // Still navigate to summary page (fallback)
                    setTimeout(() => {
                        router.visit("/warehouse-bookings/summary", {
                            method: "get",
                            preserveScroll: true,
                        });
                    }, 1500);
                });
        } else {
            // No booking data found
            toast.error('No booking information found');
        }
    };

    const handleBackBooking = () => {
        router.visit("/warehouse-bookings/checkout", {
            method: "get",
            preserveScroll: true,
        });
    };

    const handlePaymentBooking = () => {
        router.visit("/warehouse-bookings/payments", {
            method: "get",
            preserveScroll: true,
        });
    };

    const handleWarehouseList = () => {
        router.visit("/warehouse-bookings/", {
            method: "get",
            preserveScroll: true,
        });
    };

    return (
        <div>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className="flex flex-col xl:flex-row justify-center items-center xl:items-start px-10 py-10 gap-10">
                <div className="flex flex-col gap-10">
                    <div className="flex flex-row items-start justify-center pb-10">
                        <div
                            className="md:flex flex-col hidden justify-center items-center gap-3 cursor-pointer"
                            onClick={handleWarehouseList}
                        >
                            <div
                                className="w-[18px] h-[18px] rounded-full bg-[#1565c0]"
                                style={{
                                    boxShadow: "0 0 10px 8px #1565c088", // blur
                                }}
                            />
                            <h1 className="figtree text-[16px] font-[700] text-[#0955AC]">
                                Select Warehouse
                            </h1>
                        </div>
                        <div className="lg:w-[136px] w-[50px] md:block hidden h-[2px] bg-[#0955AC] mt-3" />
                        <div
                            className="md:flex flex-col hidden justify-center items-center gap-3 cursor-pointer"
                            onClick={handleBackBooking}
                        >
                            <div
                                className="w-[18px] h-[18px] rounded-full bg-[#1565c0]"
                                style={{
                                    boxShadow: "0 0 10px 8px #1565c088", // blur
                                }}
                            />
                            <h1 className="figtree text-[16px] font-[700] text-[#0955AC]">
                                Booking Info
                            </h1>
                        </div>
                        <div className="lg:w-[136px] w-[50px] md:block hidden h-[2px] bg-[#0955AC] mt-3" />
                        <div
                            className="flex flex-col justify-center items-center gap-3 cursor-pointer"
                            onClick={handlePaymentBooking}
                        >
                            <div
                                className="w-[18px] h-[18px] rounded-full bg-[#1565c0]"
                                style={{
                                    boxShadow: "0 0 10px 8px #1565c088", // blur
                                }}
                            />
                            <h1 className="figtree text-[16px] font-[700] text-[#0955AC]">
                                Payments
                            </h1>
                        </div>
                        <div className="lg:w-[136px] w-[50px] md:block hidden h-[2px] bg-[#0955AC] mt-3" />
                        <div
                            className="md:flex flex-col justify-center hidden items-center cursor-pointer"
                            onClick={handleConfirmBooking}
                        >
                            <div className="w-[22px] h-[22px] rounded-full border-[2px] border-[#1565c0]" />
                            <h1 className="figtree text-[16px] font-[700] text-[#0955AC]">
                                Booking Confirmation
                            </h1>
                        </div>
                    </div>

                    <div
                        className="border-l-[0.2px] rounded-[10px] lg:w-[874px] lg:h-auto bg-[#FFFFFF] px-10 py-10"
                        style={{
                            borderLeftWidth: "0.2px",
                            borderTopWidth: "0.2px",
                            boxShadow: "4px 4px 4px #0000001A",
                        }}
                    >
                        <h1 className="text-[20px] font-[700]">
                            Payment Methods
                        </h1>

                        {/* method selector */}
                        <div className="flex flex-row flex-wrap items-center gap-10 text-[10px] font-[600] text-[#00000080] py-2">
                            <label className="flex flex-row justify-center items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="Credit Card"
                                    checked={selectedPayment === "Credit Card"}
                                    onChange={() =>
                                        setSelectedPayment("Credit Card")
                                    }
                                    className="peer appearance-none w-[14px] h-[14px] rounded-full border border-[#0955AC] bg-[#0955AC] focus:ring-transparent  focus:outline-none transition-colors cursor-pointer"
                                />
                                <span className="peer-checked:text-[#000000] text-[#00000080] text-[16px] font-[600]">
                                    Credit Card
                                </span>
                            </label>

                            <label className="flex flex-row justify-center items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="PayPal"
                                    checked={selectedPayment === "PayPal"}
                                    onChange={() =>
                                        setSelectedPayment("PayPal")
                                    }
                                    className="peer appearance-none w-[14px] h-[14px] rounded-full border border-[#0955AC] bg-[#0955AC] focus:outline-none focus:ring-transparent  transition-colors cursor-pointer"
                                />
                                <span className="peer-checked:text-[#000000] text-[#00000080] text-[16px] font-[600]">
                                    PayPal
                                </span>
                            </label>

                            <label className="flex flex-row justify-center items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="Bank Transfer"
                                    checked={
                                        selectedPayment === "Bank Transfer"
                                    }
                                    onChange={() =>
                                        setSelectedPayment("Bank Transfer")
                                    }
                                    className="peer appearance-none w-[14px] h-[14px] rounded-full border border-[#0955AC] bg-[#0955AC] focus:outline-none focus:ring-transparent transition-colors cursor-pointer"
                                />
                                <span className="peer-checked:text-[#000000] text-[#00000080] text-[16px] font-[600]">
                                    Bank Transfer
                                </span>
                            </label>
                        </div>

                        {/* only show when Bank Transfer is selected */}
                        {selectedPayment === "Bank Transfer" && (
                            <div className="mt-4 grid lg:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px]/[24px] font-[600]">
                                        Reference Number :
                                    </label>
                                    <div className="md:w-[374px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                                        <input
                                            value={slipNumber}
                                            onChange={(e) =>
                                                setSlipNumber(e.target.value)
                                            }
                                            className="w-full h-full px-3 rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080]"
                                            placeholder="Enter reference number"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px]/[24px] font-[600]">
                                        Upload Payment Receipt (PDF) :
                                    </label>
                                    <div className="md:w-[374px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px] flex items-center px-3">
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) =>
                                                setSlipPdf(
                                                    e.target.files?.[0] ?? null
                                                )
                                            }
                                            className="w-full text-[12px] file:mr-3 file:rounded file:border-0 file:px-3 file:py-2 file:bg-[#F3F4F6] file:text-[12px] file:cursor-pointer"
                                        />
                                    </div>
                                    {/* optional: small hint */}
                                    <p className="text-[10px] text-[#00000080] mt-1">
                                        Only PDF files are allowed.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div
                        className="border-l-[0.2px] rounded-[10px] lg:w-[874px] lg:h-[316px] bg-[#FFFFFF] px-10 py-10"
                        style={{
                            borderLeftWidth: "0.2px",
                            borderTopWidth: "0.2px",
                            boxShadow: "4px 4px 4px #0000001A",
                        }}
                    >
                        <h1 className="text-[20px] font-[700]">
                            Select Payment Option
                        </h1>

                        <div className="flex flex-col gap-5 py-10">
                            <div className="flex flex-row items-start gap-4">
                                <input
                                    type="radio"
                                    name="paymentOption"
                                    value="full"
                                    checked={paymentOption === "full"}
                                    onChange={() => setPaymentOption("full")}
                                    className="peer appearance-none w-[14px] h-[14px] rounded-full border border-[#0955AC] bg-[#0955AC] focus:ring-transparent focus:outline-none transition-colors mt-[1.5px] cursor-pointer"
                                />
                                <div className="poppins text-[12px] flex flex-col justify-center items-start">
                                    <h1 className="font-[600]">
                                        Pay full amount now
                                    </h1>
                                    <h1 className="font-[500]">
                                        Complete the entire payment before storage begins.
                                    </h1>
                                </div>
                            </div>
                            <div className="flex flex-row items-start gap-4">
                                <input
                                    type="radio"
                                    name="paymentOption"
                                    value="deposit"
                                    checked={paymentOption === "deposit"}
                                    onChange={() => setPaymentOption("deposit")}
                                    className="peer appearance-none w-[14px] h-[14px] rounded-full border border-[#0955AC] bg-[#0955AC] focus:ring-transparent focus:outline-none transition-colors mt-[1.5px] cursor-pointer"
                                />
                                <div className="poppins text-[12px] flex flex-col justify-center items-start">
                                    <h1 className="font-[600]">
                                        Pay deposit now, remaining monthly
                                    </h1>
                                    <h1 className="font-[500]">
                                        Pay initial deposit and setup fee now, then monthly payments.
                                    </h1>
                                </div>
                            </div>

                            <div className="w-full md:h-[74px] bg-[#E2F6DC] rounded-[7px] text-[12px] px-5 py-5">
                                <div className="flex flex-col md:flex-row md:gap-5">
                                    <h1 className="font-[500] text-[#000000B2] w-[180px]">
                                        Initial payment:
                                    </h1>
                                    <h1 className="font-[600]">$1,050.00 (Setup + First Month)</h1>
                                </div>
                                <div className="flex flex-col md:flex-row md:gap-5">
                                    <h1 className="font-[500] text-[#000000B2] w-[180px]">
                                        Monthly payments:
                                    </h1>
                                    <h1 className="font-[600]">
                                        $900.00 (due on 23rd of each month)
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>

                        <div
                        className="border-l-[0.2px] rounded-[10px] lg:w-[874px] lg:h-[72px] bg-[#D8E4F2] px-5 py-5"
                        style={{
                            borderLeftWidth: "0.2px",
                            borderTopWidth: "0.2px",
                            boxShadow: "4px 4px 4px #0000001A",
                        }}
                    >
                        <div className="flex flex-row gap-5 text-[10px] font-[400]">
                            <input
                                className="size-[20px] border-[0.5px] border-[#0955AC] bg-[#FFFFFF] rounded-[4px] cursor-pointer focus:ring-transparent"
                                type="checkbox"
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                            />
                            <div>
                                <h1 className="">
                                    I agree to the{" "}
                                    <span className="text-[#0955AC]">
                                        Terms and Conditions
                                    </span>{" "}
                                    and{" "}
                                    <span className="text-[#0955AC]">
                                        Privacy Policy.
                                    </span>
                                </h1>
                                <h1>
                                    I confirm that I am authorized to make this payment and that all information is accurate.
                                </h1>
                                {errors.terms && (
                                    <div className="text-red-500 text-xs mt-1">
                                        {errors.terms}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>                    <div>
                        <div
                            onClick={handleBackBooking}
                            className="rounded-[5px] flex justify-center items-center text-[#0955AC] font-[700] text-[12px] lg:w-[874px] h-[50px] border-[2px] border-[#0955AC] px-5 cursor-pointer transition-colors"
                        >
                            {" "}
                            Back{" "}
                        </div>

                        <div
                            onClick={handleConfirmBooking}
                            className="rounded-[5px] flex mt-5 justify-center items-center text-[#FFFFFF] font-[700] text-[12px] lg:w-[874px] h-[50px] bg-[#0955AC] px-5 cursor-pointer hover:bg-[#074a8f] transition-colors"
                        >
                            {" "}
                            CONFIRM BOOKING{" "}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-10">
                    {/* right side mini card 1 */}
                    <div
                        className="md:w-[459px] h-auto bg-[#F4F3F3] rounded-[10px] px-5"
                        style={{
                            boxShadow: "4px 4px 4px #0000001A",
                        }}
                    >
                        {/* upper section */}
                        <div className="flex flex-col md:flex-row gap-3 items-center border-b-[1px] pb-5 border-[#00000026]">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                                <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <h1 className="figtree text-[20px] font-[700] ">
                                    Central Storage Facility - Bay A
                                </h1>
                                <div className="poppins flex flex-row gap-5 text-[9px] text-[#000000B2] font-[500]">
                                    <div className="flex flex-col gap-2 justify-center items-center">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <h1>5,000 sq ft</h1>
                                    </div>
                                    <div className="flex flex-col gap-2 justify-center items-center">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        <h1>Secure</h1>
                                    </div>
                                    <div className="flex flex-col gap-2 justify-center items-center">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <h1>Climate Control</h1>
                                    </div>
                                    <div className="flex flex-col gap-2 justify-center items-center">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <h1>24/7 Access</h1>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* end */}
                        {/* bottom section */}
                        <div className="py-10 px-20">
                            <div className="flex flex-row gap-5 justify-center items-start">
                                <div className="flex flex-col items-center mt-2">
                                    <div className="size-[17px] bg-[#0955AC] rounded-full"></div>
                                    <div className="h-[77px] w-[1.5px] bg-[#0955AC]"></div>
                                    <div className="size-[17px] bg-[#0955AC] rounded-full"></div>
                                </div>
                                <div className="figtree flex flex-col gap-10 text-[14px] font-[500] text-[#00000080]">
                                    <div>
                                        <h1 className="text-[16px] font-[700] text-[#000000]">
                                            Move-in: Central Storage Facility
                                        </h1>
                                        <h1>Move-in Date: June 23rd, 2025</h1>
                                        <h1>Move-in Time: 10:00 AM</h1>
                                    </div>
                                    <div>
                                        <h1 className="text-[16px] font-[700] text-[#000000]">
                                            Storage Duration: 6 Months
                                        </h1>
                                        <h1>Storage Type: General Storage</h1>
                                        <h1>Required Space: 1,000 sq ft</h1>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* end */}
                    </div>
                    {/* right side mini card 2 */}
                    <div
                        className="poppins md:w-[459px] h-auto bg-[#F4F3F3] rounded-[10px] px-10 py-10"
                        style={{
                            boxShadow: "4px 4px 4px #0000001A",
                        }}
                    >
                        <h1 className="font-[600] text-[20px]">
                            Payment Details
                        </h1>

                        <div className="md:px-10 py-5">
                            <div className="poppins text-[12px] w-full h-auto bg-[#0955AC0D] rounded-[5px] flex flex-col py-10 px-10">
                                <h1 className="font-[600] mb-5 text-[#000000D9]">
                                    Pricing Breakdown
                                </h1>
                                <div className="w-full h-[1px] bg-[#CDD0D4]" />
                                <div className="flex flex-col md:flex-row justify-between w-full px-5 py-5 font-[500]">
                                    <div>
                                        <h1 className="text-[#000000CC]">
                                            Storage Space Rate
                                        </h1>
                                        <div className="flex flex-col md:flex-row gap-3 text-[#00000061]">
                                            <h1>$850/month</h1>
                                            <h1 className="text-[#0955AC]">
                                                (x6 months)
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="text-[#000000CC]">
                                        $5100
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row justify-between w-full px-5 font-[500]">
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
                                <div className="flex flex-col md:flex-row justify-between w-full px-5 py-5 font-[500]">
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

                                <h1 className="font-[600] mt-5 text-[#000000D9]">
                                    Add Extras
                                </h1>

                                {/* checkbox section */}
                                <div className="flex flex-col justify-center text-[12px] font-[500] mt-5">
                                    <div className="flex flex-col md:flex-row justify-between w-full px-5">
                                        <div className="flex flex-row md:justify-center items-center gap-4">
                                            <h1>Climate Control</h1>
                                        </div>
                                        <h1>$300 (6 months)</h1>
                                    </div>
                                    <div className="flex flex-col md:flex-row justify-between w-full px-5 mt-2">
                                        <div className="flex flex-row md:justify-center items-center gap-4">
                                            <h1>Insurance Coverage</h1>
                                        </div>
                                        <h1>Included</h1>
                                    </div>
                                </div>

                                <div className="w-full h-[1px] bg-[#CDD0D4] mt-5" />

                                <div className="flex flex-col md:flex-row justify-between w-full px-5 py-5 font-[500]">
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

                                <div className="flex flex-col md:flex-row justify-between w-full px-5 pb-5 font-[500]">
                                    <div>
                                        <h1 className="text-[#000000CC]">
                                            Total 6-Month Cost
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarehousePayments;