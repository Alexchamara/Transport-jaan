import React from "react";
import leftArrow from "../../../../assets/multiModel/payment/leftArrow.svg";
import lock from "../../../../assets/multiModel/payment/lock.svg";
import line from "../../../../assets/multiModel/payment/line.svg";

import logo1 from "../../../../assets/multiModel/payment/logo1.svg";
import logo2 from "../../../../assets/multiModel/payment/logo2.svg";
import logo3 from "../../../../assets/multiModel/payment/logo3.svg";
import logo4 from "../../../../assets/multiModel/payment/logo4.svg";

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
                            <Link href="/multiModel/bus/busDetails">
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
                    <div className="w-full min-h-[794px] bg-[#F4F3F3] rounded-[12px] shadow-lg py-5 poppins">
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
                                Trip Summary
                            </h1>
                            <div className="flex flex-row justify-between text-[14px] font-[600] bg-[#FAFAFA] py-4 px-4 text-[#333843] mt-5">
                                <h1>Total</h1>
                                <h1>$135.00 Incl. VAT</h1>
                            </div>

                            <div className="bg-[#0955AC1A] mx-2 mt-5 rounded-[10px]">
                                <div className="px-5 py-5 flex flex-row gap-2">
                                    <div className="flex flex-col">
                                        <div className="size-[12px] bg-[#0955AC] rounded-full" />
                                        <img
                                            src={line2}
                                            alt="line"
                                            className="w-[1px] ml-[5px]"
                                        />
                                        <div className="size-[12px] bg-[#0955AC] rounded-full" />
                                        <img
                                            src={line2}
                                            alt="line"
                                            className="w-[1px] ml-[5px]"
                                        />
                                        <div className="size-[12px] bg-[#0955AC] rounded-full" />
                                    </div>

                                    <div className="flex flex-col text-[14px]/[14px] gap-2 font-[600] w-full">
                                        <h1>Car</h1>
                                        <div className="flex flex-row justify-between items-center w-full">
                                            <h1 className="font-[400] text-[#667085]">
                                                Amount
                                            </h1>
                                            <h1 className="font-[500] text-[#333843] text-[14px]">
                                                $90.00
                                            </h1>
                                        </div>

                                        <h1 className="mt-5">Train</h1>
                                        <div className="flex flex-row justify-between items-center w-full">
                                            <h1 className="font-[400] text-[#667085]">
                                                Amount
                                            </h1>
                                            <h1 className="font-[500] text-[#333843] text-[14px]">
                                                $20.00
                                            </h1>
                                        </div>

                                        <h1 className="mt-5">Bus</h1>
                                        <div className="flex flex-row justify-between items-center w-full">
                                            <h1 className="font-[400] text-[#667085]">
                                                Amount
                                            </h1>
                                            <h1 className="font-[500] text-[#333843] text-[14px]">
                                                $15.00
                                            </h1>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-row justify-center items-center gap-5 mt-5">
                                <Link href="/multiModel/bus/confirmPayment" className="md:w-[139px] md:h-[28px] bg-[#0955AC] rounded-[4px] text-[#FFFFFF] text-[10px] font-[700] flex justify-center items-center  cursor-pointer px-2 py-2">
                                    Confirm Payment
                                </Link>

                                <div className="md:w-[139px] md:h-[28px] bg-[#0955AC] rounded-[4px] text-[#FFFFFF] text-[10px] font-[700] flex justify-center items-center  cursor-pointer px-2 py-2">
                                    Edit Journey
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
