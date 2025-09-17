import React, { useState } from "react";
import Phone from "../../../assets/superAdmin/Phone IconW.svg";
import Bag from "../../../assets/superAdmin/Bag Simple IconW.svg";
import Location from "../../../assets/superAdmin/Map Pin IconW.svg";
import Website from "../../../assets/superAdmin/Web IconW.svg";
import Visa from "../../../assets/superAdmin/Visa.svg";
import MasterCard from "../../../assets/superAdmin/Mastercard.svg";
import AmericanExpress from "../../../assets/superAdmin/AmericanExpress.svg";
import Close from "../../../assets/superAdmin/Close.svg";
import Addition from "../../../assets/superAdmin/Signups Icon.png";

const Billing = () => {
    const [selectedMethod, setSelectedMethod] = useState("visa");

    const paymentMethods = [
        {
            id: "visa",
            img: Visa,
            title: "VISA **** 8092",
            subtitle: "Expires on 12/26",
        },
        {
            id: "mastercard",
            img: MasterCard,
            title: "Mastercard **** 8092",
            subtitle: "Expires on 12/26",
        },
        {
            id: "amex",
            img: AmericanExpress,
            title: "American Express **** 8092",
            subtitle: "Expires on 12/26",
        },
    ];

    return (
        <div className="poppins flex flex-col gap-6">
            <div className="flex flex-col">
                <h1 className="text-white text-[16px] font-500">
                    Payment methods
                </h1>
                <h1 className="text-[#AEB9E1] text-[14px] font-500">
                    Lorem ipsum dolor sit amet consectetur adipiscing.
                </h1>
            </div>

            <div className="w-[600px] h-auto border border-[#343B4F] bg-[#0B1739] rounded-[5px] flex justify-center items-center py-10">
                <div className="w-[533px] h-auto flex flex-col gap-8">
                    <div className="flex flex-col gap-20">
                        <div className="flex flex-col gap-2">
                            {/* Payment methods */}
                            <div className="flex flex-col gap-2">
                                {/* Visa */}
                                <div className=" relative flex flex-row w-[547px] h-[64px] border border-[#575DFFCC] bg-[#575DFF33] rounded-[5px] justify-between items-center px-2">
                                    <div className="flex flex-row gap-2 items-center">
                                        <input
                                            type="radio"
                                            className="outline-none cursor-pointer focus:outline-none focus:ring-0 ring-0 appearance-none"
                                            style={{
                                                boxShadow: "none",
                                                WebkitAppearance: "none",
                                                MozAppearance: "none",
                                            }}
                                        />
                                        <img src={Visa} />
                                        <div className="flex flex-col">
                                            <h1 className="text-white text-[10px] font-500">
                                                VISA **** 8092
                                            </h1>
                                            <h2 className="text-[#AEB9E1] text-[10px] font-500">
                                                Expires on 12/26
                                            </h2>
                                        </div>
                                    </div>
                                    <button>
                                        <img
                                            src={Close}
                                            className="absolute top-[12.8px] left-[523.95px]"
                                        />
                                    </button>
                                </div>

                                {/* Mastercard */}
                                <div className=" relative flex flex-row w-[547px] h-[64px] border border-[#343B4F] bg-[#0B1739] rounded-[5px] justify-between items-center px-2">
                                    <div className="flex flex-row gap-2 items-center">
                                        <input
                                            type="radio"
                                            className="outline-none cursor-pointer focus:outline-none focus:ring-0 ring-0 appearance-none"
                                            style={{
                                                boxShadow: "none",
                                                WebkitAppearance: "none",
                                                MozAppearance: "none",
                                            }}
                                        />
                                        <img src={MasterCard} />
                                        <div className="flex flex-col">
                                            <h1 className="text-white text-[10px] font-500">
                                                Mastercard **** 8092
                                            </h1>
                                            <h2 className="text-[#AEB9E1] text-[10px] font-500">
                                                Expires on 12/26
                                            </h2>
                                        </div>
                                    </div>
                                    <button>
                                        <img
                                            src={Close}
                                            className="absolute top-[12.8px] left-[523.95px]"
                                        />
                                    </button>
                                </div>

                                {/* American Express */}
                                <div className=" relative flex flex-row w-[547px] h-[64px] border border-[#343B4F] bg-[#0B1739] rounded-[5px] justify-between items-center px-2">
                                    <div className="flex flex-row gap-2 items-center">
                                        <input
                                            type="radio"
                                            className="outline-none cursor-pointer focus:outline-none focus:ring-0 ring-0 appearance-none"
                                            style={{
                                                boxShadow: "none",
                                                WebkitAppearance: "none",
                                                MozAppearance: "none",
                                            }}
                                        />
                                        <img src={AmericanExpress} />
                                        <div className="flex flex-col">
                                            <h1 className="text-white text-[10px] font-500">
                                                American Express **** 8092
                                            </h1>
                                            <h2 className="text-[#AEB9E1] text-[10px] font-500">
                                                Expires on 12/26
                                            </h2>
                                        </div>
                                    </div>
                                    <button>
                                        <img
                                            src={Close}
                                            className="absolute top-[12.8px] left-[523.95px]"
                                        />
                                    </button>
                                </div>
                                <button className="flex flex-row gap-2 items-center">
                                    <img
                                        src={Addition}
                                        className="size-[12px]"
                                        alt="add"
                                    />
                                    <h1 className="text-[#AEB9E1] text-[12px] font-500">
                                        Add a new payment method
                                    </h1>
                                </button>
                            </div>
                        </div>

                        {/* Billing Address */}
                        <div className="flex flex-col">
                            <h1 className="text-white text-[16px] font-500">
                                Billing address
                            </h1>
                            <h1 className="text-[#AEB9E1] text-[14px] font-500">
                                Lorem ipsum dolor sit amet consectetur
                                adipiscing.
                            </h1>
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-row justify-between items-center">
                            <div className="flex flex-row gap-1 items-center">
                                <img src={Phone} className="size-[12px]" alt="" />
                                <h1 className="text-white text-[12px] font-500">
                                    Phone
                                </h1>
                            </div>
                            <input
                                placeholder="(123) 456 - 7890"
                                className="w-[365px] text-[12px] text-[#ffffff] border border-[#343B4F] bg-[#0B1739] outline-none focus:border-[#343B4F] focus:ring-0"
                            />
                        </div>
                        <div className="w-full h-[1px] bg-[#343B4F]" />
                    </div>

                    {/* Position */}
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-row justify-between items-center">
                            <div className="flex flex-row gap-1 items-center">
                                <img src={Bag} className="size-[12px]" alt="" />
                                <h1 className="text-white text-[12px] font-500">
                                    Position
                                </h1>
                            </div>
                            <input
                                placeholder="CEO & Founder"
                                className="w-[365px] text-[12px] text-[#ffffff] border border-[#343B4F] bg-[#0B1739] outline-none focus:border-[#343B4F] focus:ring-0"
                            />
                        </div>
                        <div className="w-full h-[1px] bg-[#343B4F]" />
                    </div>

                    {/* Location */}
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-row justify-between items-center">
                            <div className="flex flex-row gap-1 items-center">
                                <img src={Location} className="size-[12px]" alt="" />
                                <h1 className="text-white text-[12px] font-500">
                                    Location
                                </h1>
                            </div>
                            <input
                                placeholder="New York, NY"
                                className="w-[365px] text-[12px] text-[#ffffff] border border-[#343B4F] bg-[#0B1739] outline-none focus:border-[#343B4F] focus:ring-0"
                            />
                        </div>
                        <div className="w-full h-[1px] bg-[#343B4F]" />
                    </div>

                    {/* Website */}
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-row justify-between items-center">
                            <div className="flex flex-row gap-1 items-center">
                                <img src={Website} className="size-[12px]" alt="" />
                                <h1 className="text-white text-[12px] font-500">
                                    Website
                                </h1>
                            </div>
                            <input
                                placeholder="dashdark.com"
                                className="w-[365px] text-[12px] text-[#ffffff] border border-[#343B4F] bg-[#0B1739] outline-none focus:border-[#343B4F] focus:ring-0"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Billing;
