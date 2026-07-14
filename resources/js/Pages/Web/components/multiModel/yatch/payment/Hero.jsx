import React from "react";
import leftArrow from "../../../../assets/multiModel/payment/leftArrow.svg";
import lock from "../../../../assets/multiModel/payment/lock.svg";
import line from "../../../../assets/multiModel/payment/line.svg";

import logo1 from "../../../../assets/multiModel/payment/logo1.svg";
import logo2 from "../../../../assets/multiModel/payment/logo2.svg";
import logo3 from "../../../../assets/multiModel/payment/logo3.svg";
import logo4 from "../../../../assets/multiModel/payment/logo4.svg";

import tick from "../../../../assets/multiModel/yatchDetails/tick.svg";

import line2 from "../../../../assets/multiModel/reviewJourney/line.svg";

import save from "../../../../assets/multiModel/payment/save.svg";
import { Link } from "@inertiajs/react";

const Hero = () => {
    return (
        <div className="md:px-10 md:py-10 p-5">
            <div className="grid xl:grid-cols-3 grid-cols-1 gap-10">
                <div className="xl:col-span-2 flex flex-col justify-start items-center">
                    <div className="flex flex-col md:flex-row justify-between gap-2 md:items-center w-full">
                        <div className="flex flex-col md:flex-row items-start gap-5">
                            <Link href="/multiModel/yatch/yatchDetails">
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
                            <div className="w-[115px] h-[62px] bg-[#F4F3F3] border-[1px] border-[#DFDFDF] rounded-[10px] flex justify-center items-center cursor-pointer">
                                <img src={logo1} />
                            </div>
                            <div className="w-[115px] h-[62px] bg-[#F4F3F3] border-[1px] border-[#DFDFDF] rounded-[10px] flex justify-center items-center cursor-pointer">
                                <img src={logo2} />
                            </div>
                            <div className="w-[115px] h-[62px] bg-[#F4F3F3] border-[1px] border-[#DFDFDF] rounded-[10px] flex justify-center items-center cursor-pointer">
                                <img src={logo3} />
                            </div>
                            <div className="w-[115px] h-[62px] bg-[#F4F3F3] border-[1px] border-[#DFDFDF] rounded-[10px] flex justify-center items-center cursor-pointer">
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
                                    <label>Cardholder’s name</label>
                                    <input
                                        type="text"
                                        className="w-full xl:h-[50px] border border-[#0000004D] rounded-[10px] px-3 placeholder:text-[#00000033] placeholder:font-[400] bg-transparent mt-2"
                                        placeholder="Kasun Kalhara"
                                    />
                                </div>
                                <div className="flex flex-col w-full mt-5">
                                    <label>Card Number</label>
                                    <input
                                        type="text"
                                        className="w-full xl:h-[50px] border border-[#0000004D] rounded-[10px] px-3 placeholder:text-[#00000033] placeholder:font-[400] bg-transparent mt-2"
                                        placeholder="123 - 456 - 789"
                                    />
                                </div>

                                <div className="flex flex-row gap-10">
                                    <div className="flex flex-col w-full mt-5">
                                        <label>Expire Date</label>
                                        <input
                                            type="text"
                                            className="w-full xl:h-[50px] border border-[#0000004D] rounded-[10px] px-3 placeholder:text-[#00000033] placeholder:font-[400] bg-transparent mt-2"
                                            placeholder="20/23"
                                        />
                                    </div>
                                    <div className="flex flex-col w-full mt-5">
                                        <label>CVC</label>
                                        <input
                                            type="text"
                                            className="w-full xl:h-[50px] border border-[#0000004D] rounded-[10px] px-3 placeholder:text-[#00000033] placeholder:font-[400] bg-transparent mt-2"
                                            placeholder="654"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-row gap-3 items-center w-full poppins text-[10px] font-[400] mt-10">
                        <input
                            type="checkbox"
                            className="size-[20px] border-[0.5px] border-[#0955AC] bg-[#FFFFFF] rounded-[4px]"
                        />

                        <h1>
                            I agree to the{" "}
                            <span className="text-[#0955AC]">
                                {" "}
                                Term and Condition{" "}
                            </span>{" "}
                            and{" "}
                            <span className="text-[#0955AC]">
                                rivacy Policy
                            </span>
                            .
                        </h1>
                    </div>
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
                                <input
                                    type="text"
                                    className="w-full xl:w-auto border-b-[1px] border-[#80808080] border-[0px] focus:ring-0 placeholder:text-[12px] placeholder:text-[#80808080] p-0"
                                    placeholder="Enter Code"
                                />
                            </div>
                        </div>

                        <div className="h-auto bg-[#F4F3F3] py-5">
                            <h1 className="text-[#333843] text-[20px] font-[600] w-full p-5 rounded-t-[12px]">
                                Booking Summary
                            </h1>

                            <div className="border-t-[0.8px] border-b-[0.8px] mx-5 py-5 border-[#E5E7EB] flex flex-col gap-3 text-[14px] text-[#0A0A0A]">
                                <div>
                                    <h1 className="text-[#4A5565] text-[12px]">
                                        Service
                                    </h1>
                                    <h1>SEA PEARL LUXURY YACHT</h1>
                                </div>
                                <div>
                                    <h1 className="text-[#4A5565] text-[12px]">
                                        Route
                                    </h1>
                                    <h1>Colombo Harbor → Trincomalee Harbor</h1>
                                </div>
                                <div>
                                    <h1 className="text-[#4A5565] text-[12px]">
                                        Date
                                    </h1>
                                    <h1>02 / 07 / 2025 - 08:00 AM</h1>
                                </div>
                                <div>
                                    <h1 className="text-[#4A5565] text-[12px]">
                                        Class
                                    </h1>
                                    <h1>Luxury Charter</h1>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 border-b-[0.8px] border-[#E5E7EB] mx-5 text-[14px] py-5">
                                <div className="flex flex-col gap-2 items-start text-[#4A5565]">
                                    <h1>Base Price</h1>
                                    <h1>Service Fee</h1>
                                </div>

                                <div className="flex flex-col gap-2 items-end text-[#0A0A0A]">
                                    <h1>Rs 125,000</h1>
                                    <h1>Rs 4,050</h1>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 mx-5 border-t-[0.8px] border-b-[0.8px] py-5 border-[#E5E7EB]">
                                <div className="flex flex-col gap-2 items-start text-[#333843] font-[400] text-[16px]">
                                    <h1>Total</h1>
                                </div>

                                <div className="flex flex-col gap-2 items-end text-[#0A0A0A] font-[400] text-[16px]">
                                    <h1>Rs 129,050</h1>
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
                                <Link
                                    href="/multiModel/yatch/confirmPayment"
                                    className="xl:w-[300px] md:h-[42px] bg-[#0955AC] rounded-[10px] text-[#FFFFFF] text-[14px] font-[400] flex justify-center items-center  cursor-pointer px-4 py-2"
                                >
                                    BOOK NOW
                                </Link>

                                <h1 className="text-[12px] text-[#6A7282]">By clicking "Pay", you agree to our terms and conditions</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
