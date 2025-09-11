import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const WarehouseCheckoutContent = () => {
    const [countryCode, setCountryCode] = useState("lk");
    const [bookingData, setBookingData] = useState(null);
    const [warehouseInfo, setWarehouseInfo] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        agree_terms: false
    });

    // Load saved booking data from session storage when component mounts
    useEffect(() => {
        const savedData = sessionStorage.getItem('warehouseBookingData');
        
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                setBookingData(parsedData);
                
                // Populate form fields with saved data if available
                setFormData({
                    company_name: parsedData.company_name || '',
                    contact_person: parsedData.contact_person || '',
                    email: parsedData.email || '',
                    phone: parsedData.phone || '',
                    agree_terms: false
                });
                
                // If warehouse_id is available, fetch warehouse details
                if (parsedData.warehouse_id) {
                    fetchWarehouseDetails(parsedData.warehouse_id);
                }
            } catch (error) {
                console.error('Error parsing saved booking data:', error);
                toast.error('Error loading saved booking information');
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
    
    /**
     * Fetches warehouse details from the server based on warehouse ID
     * 
     * This function:
     * 1. Makes an API request to get warehouse details
     * 2. Updates the warehouseInfo state with the response
     * 3. Handles errors gracefully without disrupting the UI
     * 
     * @param {number|string} warehouseId - The ID of the warehouse to fetch
     */
    const fetchWarehouseDetails = async (warehouseId) => {
        try {
            // Set loading state if needed
            setIsSubmitting(true);
            
            // Try to fetch warehouse details
            const response = await axios.get(`/api/warehouse-units/${warehouseId}`, {
                timeout: 10000 // 10 second timeout
            });
            
            if (response.data) {
                setWarehouseInfo(response.data);
            }
        } catch (error) {
            console.error('Error fetching warehouse details:', error);
            // Don't show error to user as this is background data fetching
            // Just log it and continue with what data we have
            if (error.response) {
                // Server responded with an error status (4xx, 5xx)
                console.error('Server error:', error.response.data);
            } else if (error.request) {
                // Request made but no response received (network issues)
                console.error('Network error - no response received');
            } else {
                // Error in setting up the request
                console.error('Request setup error:', error.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    /**
     * Handles input changes in the checkout form
     * 
     * This function:
     * 1. Updates the form data state with new values
     * 2. Clears errors for the field being edited
     * 
     * @param {Event} e - The input change event
     */
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        
        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));
        
        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[name];
                return newErrors;
            });
        }
    };
    
    /**
     * Validates the checkout form
     * 
     * Currently validates:
     * - Terms and conditions acceptance
     * 
     * @returns {boolean} True if form is valid, false otherwise
     */
    const validateCheckoutForm = () => {
        const newErrors = {};
        let isValid = true;
        
        // Validate terms acceptance
        if (!formData.agree_terms) {
            newErrors.agree_terms = 'You must accept the terms and conditions';
            isValid = false;
        }
        
        setErrors(newErrors);
        return isValid;
    };
    
    /**
     * Handles navigation to the payment page
     * 
     * This function:
     * 1. Validates the checkout form
     * 2. If valid, updates the session storage with latest form data
     * 3. Navigates to the payment page
     * 4. If invalid, shows error notification
     */
    const handlePaymentBooking = () => {
        if (validateCheckoutForm()) {
            // Update session storage with latest form data
            const updatedBookingData = {
                ...bookingData,
                ...formData
            };
            
            sessionStorage.setItem('warehouseBookingData', JSON.stringify(updatedBookingData));
            
            router.visit("/warehouse-bookings/payments", {
                method: "get",
                preserveScroll: true,
            });
        } else {
            toast.error('Please fix the errors before proceeding');
        }
    };

    const handleConfirmBooking = () => {
        router.visit("/warehouse-bookings/summary", {
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
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
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
                            className="flex flex-col justify-center items-center gap-3 cursor-pointer"
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
                            className="md:flex flex-col hidden justify-center items-center gap-3 cursor-pointer"
                            onClick={handlePaymentBooking}
                        >
                            <div className="w-[22px] h-[22px] rounded-full border-[2px] border-[#1565c0]" />
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
                            Customer Information
                        </h1>

                        <div className="grid lg:grid-cols-2 gap-5 py-5 poppins">
                            <div>
                                <label className="text-[10px]/[24px] font-[600]">
                                    Company Name :
                                </label>
                                <div className={`md:w-[374px] w-auto h-[49px] border-[1px] ${errors.company_name ? 'border-red-500' : 'border-[#0000004D]'} rounded-[5px]`}>
                                    <input
                                        name="company_name"
                                        value={formData.company_name}
                                        onChange={handleInputChange}
                                        className="w-full h-full px-3 rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080]"
                                        placeholder="Your Company Ltd."
                                    />
                                </div>
                                {errors.company_name && (
                                    <p className="text-red-500 text-[10px] mt-1">{errors.company_name}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-[10px]/[24px] font-[600]">
                                    Contact Person :
                                </label>
                                <div className={`md:w-[374px] w-auto h-[49px] border-[1px] ${errors.contact_person ? 'border-red-500' : 'border-[#0000004D]'} rounded-[5px]`}>
                                    <input
                                        name="contact_person"
                                        value={formData.contact_person}
                                        onChange={handleInputChange}
                                        className="w-full h-full px-3 rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080]"
                                        placeholder="John Doe"
                                    />
                                </div>
                                {errors.contact_person && (
                                    <p className="text-red-500 text-[10px] mt-1">{errors.contact_person}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-[10px]/[24px] font-[600]">
                                    Email :
                                </label>
                                <div className={`md:w-[374px] w-auto h-[49px] border-[1px] ${errors.email ? 'border-red-500' : 'border-[#0000004D]'} rounded-[5px]`}>
                                    <input
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full h-full px-3 rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080]"
                                        placeholder="john@company.com"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-red-500 text-[10px] mt-1">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-[10px]/[24px] font-[600]">
                                    Phone Number :
                                </label>
                                <div className="md:w-[374px] w-auto h-[49px]">
                                    <PhoneInput
                                        country={countryCode}
                                        value={formData.phone}
                                        onChange={(phone) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                phone: phone
                                            }));
                                        }}
                                        containerStyle={{
                                            width: "100%",
                                            height: "49px",
                                        }}
                                        inputStyle={{
                                            width: "100%",
                                            height: "49px",
                                            borderRadius: "5px",
                                            border: errors.phone ? "1px solid #ef4444" : "1px solid #0000004D",
                                            fontSize: "12px",
                                            fontWeight: "500",
                                        }}
                                        buttonStyle={{
                                            borderRadius: "5px 0 0 5px",
                                            border: "1px solid #0000004D",
                                            borderRight: "none",
                                        }}
                                        placeholder="Enter phone number"
                                    />
                                    {errors.phone && (
                                        <p className="text-red-500 text-[10px] mt-1">{errors.phone}</p>
                                    )}
                                </div>
                            </div>
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
                        <h1 className="text-[20px] font-[700] mb-5">
                            Storage Requirements
                        </h1>

                        <div className="grid lg:grid-cols-2 gap-5 poppins">
                            <div>
                                <label className="text-[10px]/[24px] font-[600]">
                                    Storage Type :
                                </label>
                                <div className="md:w-[374px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                                    <select 
                                        disabled 
                                        className="w-full h-full px-3 rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent text-[12px] font-[500] text-[#808080] bg-gray-100"
                                    >
                                        <option>{bookingData?.storage_type || 'General Storage'}</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px]/[24px] font-[600]">
                                    Required Space (sq ft) :
                                </label>
                                <div className="md:w-[374px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                                    <input
                                        type="number"
                                        value={bookingData?.required_space || ''}
                                        readOnly
                                        className="w-full h-full px-3 rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080] bg-gray-100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px]/[24px] font-[600]">
                                    Storage Duration :
                                </label>
                                <div className="md:w-[374px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                                    <select 
                                        disabled 
                                        className="w-full h-full px-3 rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent text-[12px] font-[500] text-[#808080] bg-gray-100"
                                    >
                                        <option>{bookingData?.storage_duration || '1 Month'}</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px]/[24px] font-[600]">
                                    Access Frequency :
                                </label>
                                <div className="md:w-[374px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                                    <select 
                                        disabled 
                                        className="w-full h-full px-3 rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent text-[12px] font-[500] text-[#808080] bg-gray-100"
                                    >
                                        <option>{bookingData?.access_frequency || 'Weekly'}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="lg:col-span-2">
                                <label className="text-[10px]/[24px] font-[600]">
                                    Goods Description :
                                </label>
                                <div className="w-full min-h-[98px] border-[1px] border-[#0000004D] rounded-[5px]">
                                    <textarea
                                        className="w-full h-full px-3 py-3 rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080] resize-none bg-gray-100"
                                        placeholder="Describe the items you plan to store..."
                                        rows="4"
                                        value={bookingData?.goods_description || ''}
                                        readOnly
                                    />
                                </div>
                            </div>
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
                        <h1 className="text-[20px] font-[700] mb-5">
                            Schedule Information
                        </h1>

                        <div className="grid lg:grid-cols-2 gap-5 poppins">
                            <div>
                                <label className="text-[10px]/[24px] font-[600]">
                                    Move-in Date :
                                </label>
                                <div className="md:w-[374px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                                    <input
                                        type="date"
                                        className="w-full h-full px-3 rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent text-[12px] font-[500] text-[#808080]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px]/[24px] font-[600]">
                                    Move-in Time :
                                </label>
                                <div className="md:w-[374px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                                    <input
                                        type="time"
                                        className="w-full h-full px-3 rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent text-[12px] font-[500] text-[#808080]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px]/[24px] font-[600]">
                                    Move-out Date (Optional) :
                                </label>
                                <div className="md:w-[374px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                                    <input
                                        type="date"
                                        className="w-full h-full px-3 rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent text-[12px] font-[500] text-[#808080]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px]/[24px] font-[600]">
                                    Move-out Time (Optional) :
                                </label>
                                <div className="md:w-[374px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                                    <input
                                        type="time"
                                        className="w-full h-full px-3 rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent text-[12px] font-[500] text-[#808080]"
                                    />
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
                                name="agree_terms"
                                checked={formData.agree_terms}
                                onChange={handleInputChange}
                                className={`size-[20px] border-[0.5px] ${errors.agree_terms ? 'border-red-500 ring-1 ring-red-500' : 'border-[#0955AC]'} bg-[#FFFFFF] rounded-[4px] cursor-pointer focus:ring-transparent`}
                                type="checkbox"
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
                                    I confirm that the information provided is accurate and I am authorized to make this booking.
                                </h1>
                                {errors.agree_terms && (
                                    <p className="text-red-500 text-[10px] mt-1">{errors.agree_terms}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div
                            onClick={() => window.history.back()}
                            className="rounded-[5px] flex justify-center items-center text-[#0955AC] font-[700] text-[12px] lg:w-[874px] h-[50px] border-[2px] border-[#0955AC] px-5 cursor-pointer transition-colors"
                        >
                            Back
                        </div>

                        <div
                            onClick={handlePaymentBooking}
                            className="rounded-[5px] flex mt-5 justify-center items-center text-[#FFFFFF] font-[700] text-[12px] lg:w-[874px] h-[50px] bg-[#0955AC] px-5 cursor-pointer hover:bg-[#074a8f] transition-colors"
                        >
                            CONTINUE TO PAYMENT
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
                            Storage Summary
                        </h1>

                        <div className="md:px-10 py-5">
                            <div className="poppins text-[12px] w-full h-auto bg-[#0955AC0D] rounded-[5px] flex flex-col py-10 px-10">
                                <h1 className="font-[600] mb-5 text-[#000000D9]">
                                    Storage Details
                                </h1>
                                <div className="w-full h-[1px] bg-[#CDD0D4]" />
                                <div className="flex flex-col md:flex-row justify-between w-full px-5 py-5 font-[500]">
                                    <div>
                                        <h1 className="text-[#000000CC]">
                                            Storage Space
                                        </h1>
                                        <div className="flex flex-col md:flex-row gap-3 text-[#00000061]">
                                            <h1>1,000 sq ft</h1>
                                            <h1 className="text-[#0955AC]">
                                                (General Storage)
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="text-[#000000CC]">
                                        $850/month
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row justify-between w-full px-5 font-[500]">
                                    <div>
                                        <h1 className="text-[#000000CC]">
                                            Security Package
                                        </h1>
                                        <div className="flex flex-col md:flex-row gap-3 text-[#00000061]">
                                            <h1>24/7 Monitoring</h1>
                                            <h1 className="text-[#0955AC]">
                                                (Standard)
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="text-[#000000CC]">
                                        Included
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row justify-between w-full px-5 py-5 font-[500]">
                                    <div>
                                        <h1 className="text-[#000000CC]">
                                            Setup Fee
                                        </h1>
                                        <div className="flex flex-col md:flex-row gap-3 text-[#00000061]">
                                            <h1>One-time charge</h1>
                                        </div>
                                    </div>
                                    <div className="text-[#000000CC]">
                                        $150
                                    </div>
                                </div>
                                <div className="w-full h-[1px] bg-[#CDD0D4]" />

                                <h1 className="font-[600] mt-5 text-[#000000D9]">
                                    Add-ons
                                </h1>

                                {/* checkbox section */}
                                <div className="flex flex-col justify-center text-[12px] font-[500] mt-5">
                                    <div className="flex flex-col md:flex-row justify-between w-full px-5">
                                        <div className="flex flex-row md:justify-center items-center gap-4">
                                            <h1>Climate Control</h1>
                                        </div>
                                        <h1>+$50/month</h1>
                                    </div>
                                </div>

                                <div className="w-full h-[1px] bg-[#CDD0D4] mt-5" />

                                <div className="flex flex-col md:flex-row justify-between w-full px-5 py-5 font-[500]">
                                    <div>
                                        <h1 className="text-[#000000CC]">
                                            Monthly Total
                                        </h1>
                                        <div className="flex flex-col md:flex-row gap-3 text-[#00000061] mt-3">
                                            <h1>Storage + Add-ons</h1>
                                        </div>
                                    </div>
                                    <div className="text-[#000000CC] text-[12px] font-[500]">
                                        $900
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row justify-between w-full px-5 pb-5 font-[500]">
                                    <div>
                                        <h1 className="text-[#000000CC]">
                                            6 Month Total
                                        </h1>
                                        <div className="flex flex-col md:flex-row gap-3 text-[#00000061] mt-3">
                                            <h1>Including setup fee</h1>
                                        </div>
                                    </div>
                                    <div className="text-[#000000CC] text-[16px] font-[700]">
                                        $5,550
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

export default WarehouseCheckoutContent;