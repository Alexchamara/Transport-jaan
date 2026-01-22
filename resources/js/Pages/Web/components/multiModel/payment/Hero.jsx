import React, { useState } from "react";
import leftArrow from "../../../assets/multiModel/payment/leftArrow.svg";
import lock from "../../../assets/multiModel/payment/lock.svg";
import line from "../../../assets/multiModel/payment/line.svg";

import logo1 from "../../../assets/multiModel/payment/logo1.svg";
import logo2 from "../../../assets/multiModel/payment/logo2.svg";
import logo3 from "../../../assets/multiModel/payment/logo3.svg";
import logo4 from "../../../assets/multiModel/payment/logo4.svg";

import line2 from "../../../assets/multiModel/reviewJourney/line.svg";
import tick from "../../../assets/multiModel/yatchDetails/tick.svg";


import save from "../../../assets/multiModel/payment/save.svg";
import { Link, router } from "@inertiajs/react";
import { Check } from "lucide-react";
import axios from "axios";

const Hero = ({ cart = {}, pricing = {} }) => {
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [bookingReference, setBookingReference] = useState(null);
    const [journeyId, setJourneyId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('Credit Card');
    const [paymentData, setPaymentData] = useState({
        cardholderName: '',
        cardNumber: '',
        expireDate: '',
        cvc: '',
        termsAgreed: false
    });
    const [errors, setErrors] = useState({});

    const handleInputChange = (field, value) => {
        setPaymentData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validatePaymentForm = () => {
        const newErrors = {};
        
        if (!paymentData.termsAgreed) {
            newErrors.terms = "You must agree to the terms and conditions";
        }

        if (paymentMethod === 'Credit Card') {
            if (!paymentData.cardholderName.trim()) {
                newErrors.cardholderName = "Cardholder name is required";
            }
            if (!paymentData.cardNumber.trim()) {
                newErrors.cardNumber = "Card number is required";
            } else if (!/^\d{12,19}$/.test(paymentData.cardNumber.replace(/[\s-]/g, ''))) {
                newErrors.cardNumber = "Invalid card number";
            }
            if (!paymentData.expireDate.trim()) {
                newErrors.expireDate = "Expiry date is required";
            } else if (!/^\d{2}\/\d{2}$/.test(paymentData.expireDate)) {
                newErrors.expireDate = "Format must be MM/YY";
            }
            if (!paymentData.cvc.trim()) {
                newErrors.cvc = "CVC is required";
            } else if (!/^\d{3,4}$/.test(paymentData.cvc)) {
                newErrors.cvc = "CVC must be 3-4 digits";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleConfirmPayment = async () => {
        if (!validatePaymentForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('/multiModel/confirm', {
                payment_method: paymentMethod,
                payment_option: 'full', // or 'advance' based on selection
            });

            if (response.data.success) {
                setBookingReference(response.data.reference);
                setJourneyId(response.data.journey_id);
                
                // Clear all locally stored data
                localStorage.removeItem('multiModelJourney');
                localStorage.removeItem('multimodel_journey');
                localStorage.removeItem('selectedVehicles');
                
                setShowSuccessModal(true);
            }
        } catch (error) {
            console.error('Booking error:', error);
            
            // Handle authentication error
            if (error.response?.status === 401) {
                alert('Please login to complete your booking');
                window.location.href = '/login';
                return;
            }
            
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert(error.response?.data?.message || 'Booking failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoToSummary = () => {
        if (journeyId) {
            router.visit(`/multiModel/booking/${journeyId}/summary`);
        } else {
            router.visit("/multiModel/available-vehicles");
        }
    };
    return (
        <div className="md:px-10 md:py-10 p-5">
            <div className="grid xl:grid-cols-3 grid-cols-1 gap-10">
                <div className="xl:col-span-2 flex flex-col justify-start items-center">
                    <div className="flex flex-col md:flex-row justify-between gap-2 md:items-center w-full">
                        <div className="flex flex-col md:flex-row items-start gap-5">
                            <Link href="/multiModel/vehicleDetails">
                                <img src={leftArrow} />
                            </Link>
                            <div>
                                <h1 className="bebas-neue text-[50px]/[100%]">
                                    Secure{" "}
                                    <span className="text-[#0955AC]">
                                        payment
                                    </span>{" "}
                                </h1>
                                <h3 className="text-[14px] font-[500] text-[#00000080]">
                                    Fast. Secure. Done
                                </h3>
                            </div>
                        </div>

                        <div className="text-[15px] text-[#2FCE20] font-[400] figtree flex flex-row items-center gap-2">
                            <img src={lock} className="size-[15px]" />
                            <h1>Secure SSL Encrypted Payment</h1>
                        </div>
                    </div>

                    <div className="hidden lg:block mt-5">
                        <img src={line} />
                        <div className="flex flex-row gap-[85px] text-[16px] font-[700] figtree -ml-[25px] text-[#0955AC] mt-1">
                            <h1>Select Journey</h1>
                            <h1>Select Vehicles</h1>
                            <h1>Passenger Info</h1>
                            <h1>Booking Confirmation</h1>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-start w-full mt-10">
                        <h1 className="text-[20px] font-[700] figtree">
                            Select Payment Method
                        </h1>
                        <div className="mt-5 flex flex-col md:flex-row justify-center items-center gap-5">
                            <div 
                                onClick={() => setPaymentMethod('Credit Card')}
                                className={`w-[115px] h-[62px] bg-[#F4F3F3] border-[1px] rounded-[10px] flex justify-center items-center cursor-pointer ${paymentMethod === 'Credit Card' ? 'border-[#0955AC] border-2' : 'border-[#DFDFDF]'}`}
                            >
                                <img src={logo1} />
                            </div>
                            <div 
                                onClick={() => setPaymentMethod('PayPal')}
                                className={`w-[115px] h-[62px] bg-[#F4F3F3] border-[1px] rounded-[10px] flex justify-center items-center cursor-pointer ${paymentMethod === 'PayPal' ? 'border-[#0955AC] border-2' : 'border-[#DFDFDF]'}`}
                            >
                                <img src={logo2} />
                            </div>
                            <div 
                                onClick={() => setPaymentMethod('Bank Transfer')}
                                className={`w-[115px] h-[62px] bg-[#F4F3F3] border-[1px] rounded-[10px] flex justify-center items-center cursor-pointer ${paymentMethod === 'Bank Transfer' ? 'border-[#0955AC] border-2' : 'border-[#DFDFDF]'}`}
                            >
                                <img src={logo3} />
                            </div>
                            <div 
                                onClick={() => setPaymentMethod('Other')}
                                className={`w-[115px] h-[62px] bg-[#F4F3F3] border-[1px] rounded-[10px] flex justify-center items-center cursor-pointer ${paymentMethod === 'Other' ? 'border-[#0955AC] border-2' : 'border-[#DFDFDF]'}`}
                            >
                                <img src={logo4} />
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 w-full">
                        <div className="w-full h-auto bg-[#F4F3F3] shadow-lg py-5 px-5">
                            <h1 className="text-[24px] font-[700] figtree">
                                Card details
                            </h1>

                            <div className="poppins text-[14px] font-[600]">
                                <div className="flex flex-col w-full mt-5">
                                    <label htmlFor="cardholderName">Cardholder's name</label>
                                    <input
                                        type="text"
                                        id="cardholderName"
                                        name="cardholderName"
                                        className="w-full xl:h-[50px] border border-[#0000004D] rounded-[10px] px-3 placeholder:text-[#00000033] placeholder:font-[400] bg-transparent mt-2"
                                        placeholder="Kasun Kalhara"
                                        value={paymentData.cardholderName}
                                        onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                                    />
                                    {errors.cardholderName && <span className="text-red-500 text-xs mt-1">{errors.cardholderName}</span>}
                                </div>
                                <div className="flex flex-col w-full mt-5">
                                    <label htmlFor="cardNumber">Card Number</label>
                                    <input
                                        type="text"
                                        id="cardNumber"
                                        name="cardNumber"
                                        className="w-full xl:h-[50px] border border-[#0000004D] rounded-[10px] px-3 placeholder:text-[#00000033] placeholder:font-[400] bg-transparent mt-2"
                                        placeholder="1234 5678 9012 3456"
                                        value={paymentData.cardNumber}
                                        onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                                    />
                                    {errors.cardNumber && <span className="text-red-500 text-xs mt-1">{errors.cardNumber}</span>}
                                </div>

                                <div className="flex flex-row gap-10">
                                    <div className="flex flex-col w-full mt-5">
                                        <label htmlFor="expireDate">Expire Date</label>
                                        <input
                                            type="text"
                                            id="expireDate"
                                            name="expireDate"
                                            className="w-full xl:h-[50px] border border-[#0000004D] rounded-[10px] px-3 placeholder:text-[#00000033] placeholder:font-[400] bg-transparent mt-2"
                                            placeholder="MM/YY"
                                            value={paymentData.expireDate}
                                            onChange={(e) => handleInputChange('expireDate', e.target.value)}
                                        />
                                        {errors.expireDate && <span className="text-red-500 text-xs mt-1">{errors.expireDate}</span>}
                                    </div>
                                    <div className="flex flex-col w-full mt-5">
                                        <label htmlFor="cvc">CVC</label>
                                        <input
                                            type="text"
                                            id="cvc"
                                            name="cvc"
                                            className="w-full xl:h-[50px] border border-[#0000004D] rounded-[10px] px-3 placeholder:text-[#00000033] placeholder:font-[400] bg-transparent mt-2"
                                            placeholder="123"
                                            value={paymentData.cvc}
                                            onChange={(e) => handleInputChange('cvc', e.target.value)}
                                        />
                                        {errors.cvc && <span className="text-red-500 text-xs mt-1">{errors.cvc}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-row gap-3 items-center w-full poppins text-[10px] font-[400] mt-10">
                        <input
                            type="checkbox"
                            id="termsAgreement"
                            name="termsAgreement"
                            className="size-[20px] border-[0.5px] border-[#0955AC] bg-[#FFFFFF] rounded-[4px]"
                            checked={paymentData.termsAgreed}
                            onChange={(e) => handleInputChange('termsAgreed', e.target.checked)}
                        />

                        <label htmlFor="termsAgreement">
                            I agree to the{" "}
                            <span className="text-[#0955AC]">
                                {" "}
                                Term and Condition{" "}
                            </span>{" "}
                            and{" "}
                            <span className="text-[#0955AC]">
                                Privacy Policy
                            </span>
                            .
                        </label>
                    </div>
                    {errors.terms && <span className="text-red-500 text-xs mt-1">{errors.terms}</span>}
                </div>
                <div className="xl:col-span-1">
                    <div className="w-full max-h-[794px] overflow-y-auto bg-[#F4F3F3] rounded-[12px] shadow-lg py-5 poppins">
                        <div className="px-5">
                            <div className="w-full h-auto md:h-[184px] border-[3px] border-dashed border-[#0955AC] rounded-[20px] bg-[#FFFFFF] p-5 text-[16px] font-[500]">
                                <h1 className="text-[24px] font-[500] text-[#0955AC]">
                                    Offers
                                </h1>
                                <div className="flex flex-row gap-2 items-center mt-5">
                                    <img src={save} />
                                    <h1>
                                        50% off up to $15 | Use code BOOKNOW
                                    </h1>
                                </div>

                                <div className="flex flex-row gap-2 items-center mt-5">
                                    <img src={save} />
                                    <h1>20% off | Use code FIRSTTIME</h1>
                                </div>
                            </div>

                            <div className="w-full h-auto md:h-[117px] bg-[#FFFFFF] border-[1px] border-[#80808080] rounded-[10px] p-5 flex md:flex-row flex-col gap-5 justify-between mt-4">
                                <div className="flex flex-row justify-center items-center gap-2">
                                    <img src={save} className="size-[30px]" />
                                    <h1 className="text-[18px] font-[500]">
                                        Apply Code
                                    </h1>
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="promoCode" className="sr-only">Promo Code</label>
                                    <input
                                        type="text"
                                        id="promoCode"
                                        name="promoCode"
                                        className="w-full xl:w-auto border-b-[1px] border-[#80808080] border-[0px] focus:ring-0 placeholder:text-[12px] placeholder:text-[#80808080] p-0"
                                        placeholder="Enter Code"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="h-auto bg-[#F4F3F3] py-5">
                            <h1 className="text-[#333843] text-[20px] font-[600] w-full p-5 rounded-t-[12px]">
                                Booking Summary
                            </h1>

                            <div className="grid grid-cols-2 border-b-[0.8px] border-[#E5E7EB] mx-5 text-[14px] py-5">
                                <div className="flex flex-col gap-2 items-start text-[#4A5565]">
                                    <h1>Subtotal</h1>
                                    <h1>Deposit</h1>
                                    <h1>Advance</h1>
                                </div>

                                <div className="flex flex-col gap-2 items-end text-[#0A0A0A]">
                                    <h1>Rs {pricing?.subtotal?.toLocaleString() || '0'}</h1>
                                    <h1>Rs {pricing?.deposit?.toLocaleString() || '0'}</h1>
                                    <h1>Rs {pricing?.advance?.toLocaleString() || '0'}</h1>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 mx-5 border-t-[0.8px] border-b-[0.8px] py-5 border-[#E5E7EB]">
                                <div className="flex flex-col gap-2 items-start text-[#333843] font-[400] text-[16px]">
                                    <h1>Total</h1>
                                </div>

                                <div className="flex flex-col gap-2 text-end items-end text-[#0A0A0A] font-[400] text-[16px] md:text-[24px]">
                                    <h1>Rs {pricing?.total?.toLocaleString() || '0'}</h1>
                                </div>
                            </div>

                            <div className="px-5 text-[12px] text-[#4A5565] flex flex-col gap-2 justify-center items-start py-5">
                                <div className="flex flex-row gap-2 items-center">
                                    <img src={tick} />
                                    <h1>Instant confirmation</h1>
                                </div>
                                <div className="flex flex-row gap-2 items-center">
                                    <img src={tick} />
                                    <h1>Free cancellation up to 24 hours</h1>
                                </div>
                                <div className="flex flex-row gap-2 items-center">
                                    <img src={tick} />
                                    <h1>Secure payment processing</h1>
                                </div>
                            </div>

                            <div className="flex flex-col text-center justify-center items-center gap-5">
                                <button 
                                    onClick={handleConfirmPayment}
                                    disabled={loading}
                                    className="xl:w-[300px] md:h-[42px] bg-[#0955AC] hover:bg-[#073d7a] disabled:bg-gray-400 disabled:cursor-not-allowed rounded-[10px] text-[#FFFFFF] text-[14px] font-[400] flex justify-center items-center cursor-pointer px-4 py-2 transition-colors"
                                >
                                    {loading ? 'Processing...' : 'BOOK NOW'}
                                </button>

                                <h1 className="text-[12px] text-[#6A7282]">
                                    By clicking "BOOK NOW", you agree to our terms
                                    and conditions
                                </h1>
                            </div>
                        </div>

           
                    </div>
                </div>
            </div>

            {/* Payment Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-[#F4F3F3] rounded-[20px] shadow-2xl max-w-2xl w-full p-8 flex flex-col items-center animate-fade-in">
                        <h2 className="text-[32px] font-[700] text-[#222222] text-center figtree">
                            Payment success
                        </h2>
                        <p className="text-[16px] text-[#6B6B6B] text-center mt-2 poppins">
                            Congrats! You have successfully booked your journey!
                        </p>
                        
                        {bookingReference && (
                            <div className="mt-4 bg-white rounded-[10px] p-4 w-full max-w-md">
                                <div className="flex justify-between items-center">
                                    <span className="text-[#6B6B6B] font-[500]">Booking Reference:</span>
                                    <span className="text-[#0955AC] font-[700] text-[18px]">{bookingReference}</span>
                                </div>
                            </div>
                        )}
                        
                        <div className="my-8 relative">
                            <div className="w-32 h-32 rounded-full bg-[#2FCE20] bg-opacity-20 flex justify-center items-center">
                                <div className="w-24 h-24 rounded-full bg-[#2FCE20] bg-opacity-40 flex justify-center items-center">
                                    <div className="w-16 h-16 rounded-full bg-[#2FCE20] flex justify-center items-center">
                                        <Check className="w-10 h-10 text-white stroke-[3]" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleGoToSummary}
                            className="max-w-md w-full h-[50px] bg-[#0955AC] hover:bg-[#073d7a] text-white rounded-[10px] text-[16px] font-[700] transition-colors figtree"
                        >
                            View Booking Details
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Hero;
