import React, { useState, useEffect } from "react";
import downArrow from "../../assets/packageDelivery/down.png";
import locationTag from "../../assets/packageDelivery/locationTag.png";
import cards from "../../assets/packageDelivery/cards.png";
import thumbsUp from "../../assets/packageDelivery/thumbssup.png";

const Form = () => {
    const [formData, setFormData] = useState({
        pickupLocation: "",
        deliveryLocation: "",
        packageType: "",
        paymentMethod: "",
    });
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        if (showPaymentModal || showSuccessModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showPaymentModal, showSuccessModal]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePayment = () => {
        setShowPaymentModal(true);
    };

    const isFormComplete = Object.values(formData).every(
        (value) => value.trim() !== ""
    );

    return (
        <div className={`bg-[#E7E7E7] py-20 xl:px-20 ${(showPaymentModal || showSuccessModal) ? 'overflow-hidden' : ''}`}>
            <div className="flex flex-col justify-center items-center text-[15px]">
                <div className="bg-[#0955AC24] px-10 lg:w-[950px] xl:w-[1000px] h-[645px] rounded-[22px] flex flex-col justify-center items-center gap-10">
                    <div className="flex flex-row gap-5">
                        <img
                            src={locationTag}
                            className=" hidden md:block h-[147px] mt-4"
                        />
                        <div className="flex flex-col gap-14">
                            <div className="mb-4 flex flex-row justify-between items-center gap-5 w-[200px] md:w-[768px] h-[59px] rounded-[10px] border-[0.5px] border-[#B4B4B4] bg-[#FFFFFF] shadow-sm px-5">
                                <input
                                    type="text"
                                    name="pickupLocation"
                                    id="pickupLocation"
                                    placeholder="Enter pick-up location"
                                    className="border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent w-full placeholder-[#000000] placeholder:text-[15px]"
                                    value={formData.pickupLocation}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="mb-4 flex flex-row justify-between items-center gap-5 w-[200px] md:w-[768px] h-[59px] rounded-[10px] border-[0.5px] border-[#B4B4B4] bg-[#FFFFFF] shadow-sm px-5">
                                <input
                                    type="text"
                                    name="deliveryLocation"
                                    id="deliveryLocation"
                                    placeholder="Enter delivery location"
                                    className="border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent w-full placeholder-[#000000] placeholder:text-[15px]"
                                    value={formData.deliveryLocation}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="mb-4 flex flex-row justify-between items-center gap-5 w-[200px] md:w-[768px] h-[59px] rounded-[10px] border-[0.5px] border-[#B4B4B4] bg-[#FFFFFF] shadow-sm px-5">
                                <input
                                    type="text"
                                    name="packageType"
                                    id="packageType"
                                    placeholder="Package type"
                                    className="border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent w-full placeholder-[#000000] placeholder:text-[15px]"
                                    value={formData.packageType}
                                    onChange={handleInputChange}
                                    required
                                />
                                <img
                                    src={downArrow}
                                    className="cursor-pointer"
                                />
                            </div>
                            <div className="mb-4 flex flex-row justify-between items-center gap-5 w-[200px] md:w-[768px] h-[59px] rounded-[10px] border-[0.5px] border-[#B4B4B4] bg-[#FFFFFF] shadow-sm px-5">
                                <input
                                    type="text"
                                    name="paymentMethod"
                                    id="paymentMethod"
                                    placeholder="Payment method"
                                    className="border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent w-full placeholder-[#000000] placeholder:text-[15px]"
                                    value={formData.paymentMethod}
                                    onChange={handleInputChange}
                                    required
                                />
                                <img
                                    src={downArrow}
                                    className="cursor-pointer"
                                />
                            </div>
                            <button
                                disabled={!isFormComplete}
                                onClick={handlePayment}
                                className={`mb-4 flex flex-row justify-center items-center gap-5 w-[200px] md:w-[768px] h-[59px] rounded-[10px] border-[0.5px] shadow-sm px-5 text-[18px] font-[400] text-[#FFFFFF] ${
                                    isFormComplete
                                        ? "bg-[#0955AC] cursor-pointer"
                                        : "bg-[#3C3C3C40] cursor-not-allowed"
                                }`}
                            >
                                Pay 0.00
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-[#FFFFFF70] backdrop-blur-[14px] flex items-center justify-center z-50">
                    <div className="figtree text-[#222222] text-[16px] font-[400] bg-white rounded-[20px] p-8 w-[600px] max-w-[90%] shadow-lg flex flex-col items-center">
                        <button
                            onClick={() => setShowPaymentModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ✕
                        </button>

                        <h2 className="text-[24px] mt-4">
                            Payment: Package delivery
                        </h2>
                        <p className="mb-10">BY "COMPANY NAME"</p>
                        <p className="mb-8">
                            YOU WILL BE CHARGED N3,400 FOR THIS TRANSACTION
                        </p>

                        <div className="bg-[#F2F2F2] border-[1px] border-[#D0D0D0] p-8 rounded-[8px] w-full max-w-[500px] mb-8">
                            <div className="grid grid-cols-2 gap-4 text-[12px] mb-4">
                                <div>
                                    <label className="block mb-1">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder=""
                                        className="w-full h-[48px] p-2 border-[1px] border-[#D0D0D0] rounded-[3px] focus:outline-none focus:ring-0 focus:border-[#0955AC]"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder=""
                                        className="w-full h-[48px] p-2 border-[1px] border-[#D0D0D0] rounded-[3px] focus:outline-none focus:ring-0 focus:border-[#0955AC]"
                                    />
                                </div>
                            </div>
                            <div className="mb-6 text-[12px]">
                                <label className="block mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder=""
                                    className="w-full h-[48px] p-2 border-[1px] border-[#D0D0D0] rounded-[3px] focus:outline-none focus:ring-0 focus:border-[#0955AC]"
                                />
                            </div>
                            <button
                                className=" w-[182px] lg:w-[382px] lg:h-[41px] bg-[#20C131] text-[12px] text-white py-3 rounded-[8px] hover:bg-[#2e9a4a] transition-colors mx-auto block border-[1px] border-[#79F586]"
                                onClick={() => {
                                    // Handle payment submission here
                                    setShowPaymentModal(false);
                                    setShowSuccessModal(true);
                                }}
                            >
                                Make Payment
                            </button>
                        </div>

                        <p className="text-[12px] mb-10 text-center max-w-[400px]">
                            We will always send you a confirmation email <br />{" "}
                            before charging so you can cancel at will.
                        </p>

                        <div className="flex items-center gap-2 mb-4">
                            <img src={cards} className="w-[391px]" />
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-[#FFFFFF70] backdrop-blur-[14px] flex items-center justify-center z-50">
                    <div className="figtree text-[#222222] text-[16px] font-[400] bg-white rounded-[20px] p-8 h-[543px] w-[643px] max-w-[90%] shadow-lg flex flex-col items-center">
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ✕
                        </button>
                        <h2 className="text-[32px] font-[400] mt-4">Success</h2>
                        <p className="mb-10 text-[16px] text-[#6B6B6B] text-center">
                            Congrats! You have successfully created your
                            password!
                        </p>
                        <div className="mb-20 relative size-[245px] flex items-center justify-center">
                            <div className="absolute size-[245px] rounded-full bg-[#BDFBB866] flex items-center justify-center">
                                <div className="size-[182px] rounded-full bg-[#71DD6866] flex items-center justify-center">
                                    <img
                                        src={thumbsUp}
                                        alt="Success"
                                        className="w-[89px] h-[89px]"
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="figtree w-[184px] lg:w-[554px] lg:h-[59px] bg-[#0955AC] text-[16px] font-[700] text-white py-3 rounded-[12px] hover:bg-[#074087] transition-colors mx-auto block"
                        >
                            Track order
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Form;
