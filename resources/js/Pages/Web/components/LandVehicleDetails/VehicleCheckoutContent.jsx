import React, { useState } from "react";
import { router } from "@inertiajs/react";
import car from "../../assets/vehicleCheckout/car.svg";
import icon1 from "../../assets/vehicleCheckout/icon1.svg";
import icon2 from "../../assets/vehicleCheckout/icon2.svg";
import icon3 from "../../assets/vehicleCheckout/icon3.svg";
import icon4 from "../../assets/vehicleCheckout/icon4.svg";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const VehicleCheckoutContent = () => {
    const [countryCode, setCountryCode] = useState("lk");
    const [phone, setPhone] = useState("");
    const [selectedPayment, setSelectedPayment] = useState("");

    const handleConfirmBooking = () => {
        router.visit('/summary', {
            method: 'get',
            preserveScroll: true
        });
    };

    return (
        <div>
            <div className="flex flex-col xl:flex-row justify-center items-center xl:items-start px-10 py-10 gap-10">
                <div className="flex flex-col gap-10">
                    <div className="flex flex-row items-start justify-center pb-10">
                        <div className="md:flex flex-col hidden justify-center items-center gap-3">
                            <div
                                className="w-[18px] h-[18px] rounded-full bg-[#1565c0]"
                                style={{
                                    boxShadow: "0 0 10px 8px #1565c088", // blur
                                }}
                            />
                            <h1 className="figtree text-[16px] font-[700] text-[#0955AC]">
                                Select Car
                            </h1>
                        </div>
                        <div className="lg:w-[136px] w-[50px] md:block hidden h-[2px] bg-[#0955AC] mt-3" />
                        <div className="md:flex flex-col hidden justify-center items-center gap-3">
                            <div
                                className="w-[18px] h-[18px] rounded-full bg-[#1565c0]"
                                style={{
                                    boxShadow: "0 0 10px 8px #1565c088", // blur
                                }}
                            />
                            <h1 className="figtree text-[16px] font-[700] text-[#0955AC]">
                                Choose Add-ons
                            </h1>
                        </div>
                        <div className="lg:w-[136px] w-[50px] md:block hidden h-[2px] bg-[#0955AC] mt-3" />
                        <div className="flex flex-col justify-center items-center gap-3">
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
                        <div className="md:flex flex-col justify-center hidden items-center">
                            <div className="w-[22px] h-[22px] rounded-full border-[2px] border-[#1565c0]" />
                            <h1 className="figtree text-[16px] font-[700] text-[#0955AC]">
                                Booking Confirmation
                            </h1>
                        </div>
                    </div>
                    <div
                        className="border-l-[0.2px] rounded-[10px] xl:w-[874px] xl:h-[372px] bg-[#FFFFFF] px-10 py-10"
                        style={{
                            boxShadow: "4px 4px 4px #0000001A",
                            borderLeftWidth: "0.2px",
                            borderTopWidth: "0.2px",
                        }}
                    >
                        <h1 className="text-[20px] font-[700]">
                            Personal Information
                        </h1>

                        <div className="flex flex-col justify-center gap-5">
                            <div className="flex flex-col lg:flex-row justify-between mt-3">
                                <div className="">
                                    <label className="text-[10px]/[24px] font-[600]">
                                        First Name :
                                    </label>
                                    <div className="md:w-[374px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                                        <input
                                            className="w-full h-full rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080]"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                </div>
                                <div className="">
                                    <label className="text-[10px]/[24px] font-[600]">
                                        Last Name :
                                    </label>
                                    <div className="md:w-[374px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                                        <input
                                            className="w-full h-full rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080]"
                                            placeholder="Enter your last name"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col lg:flex-row justify-between">
                                <div className="">
                                    <label className="text-[10px]/[24px] font-[600]">
                                        Email Address :
                                    </label>
                                    <div className="md:w-[374px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                                        <input
                                            className="w-full h-full rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080]"
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                </div>
                                <div className="">
                                    <label className="text-[10px]/[24px] font-[600]">
                                        Phone Number :
                                    </label>
                                    <div className="flex flex-row gap-3">
                                        <div className="w-[69px] h-[49px] border-[1px] border-[#0000004D] rounded-[5px] flex items-center justify-center">
                                            <PhoneInput
                                                country={countryCode}
                                                value={""}
                                                onChange={(value, data) =>
                                                    setCountryCode(
                                                        data.countryCode || "us"
                                                    )
                                                }
                                                inputStyle={{
                                                    display: "none",
                                                }}
                                                buttonStyle={{
                                                    border: "none",
                                                    borderRadius: "5px",
                                                    width: "100%",
                                                    height: "47px",
                                                }}
                                                containerStyle={{
                                                    width: "100%",
                                                    height: "100%",
                                                }}
                                                dropdownStyle={{
                                                    zIndex: 1000,
                                                }}
                                                disableCountryCode={false}
                                                disableDropdown={false}
                                                countryCodeEditable={true}
                                                enableSearch={true}
                                            />
                                        </div>
                                        <div className="md:w-[293px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                                            <input
                                                className="w-full h-full rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080]"
                                                placeholder="Enter your phone number"
                                                value={phone}
                                                onChange={(e) =>
                                                    setPhone(e.target.value)
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col lg:flex-row justify-between">
                                <div className="">
                                    <label className="text-[10px]/[24px] font-[600]">
                                        Age :
                                    </label>
                                    <div className="md:w-[240px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                                        <input
                                            className="w-full h-full rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080]"
                                            placeholder="18 - 25"
                                        />
                                    </div>
                                </div>
                                <div className="">
                                    <label className="text-[10px]/[24px] font-[600]">
                                        City :
                                    </label>
                                    <div className="md:w-[240px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                                        <input
                                            className="w-full h-full rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080]"
                                            placeholder="Colombo 03"
                                        />
                                    </div>
                                </div>
                                <div className="">
                                    <label className="text-[10px]/[24px] font-[600]">
                                        Zip Code :
                                    </label>
                                    <div className="md:w-[240px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                                        <input
                                            className="w-full h-full rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080]"
                                            placeholder="033302"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
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
                            Payment Methods
                        </h1>

                        <div className="flex flex-row items-center gap-10 text-[10px] font-[600] text-[#00000080] py-2">
                            <div className="flex flex-row justify-center items-center gap-3">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="Credit Card"
                                    checked={selectedPayment === "Credit Card"}
                                    onChange={() =>
                                        setSelectedPayment("Credit Card")
                                    }
                                    className="peer appearance-none w-[14px] h-[14px] rounded-full border border-[#0955AC] bg-[#0955AC] checked:border-[#0955AC] focus:outline-none transition-colors cursor-pointer"
                                />
                                <h1 className="peer-checked:text-[#000000] text-[#00000080] text-[10px] font-[600]">
                                    Credit Card
                                </h1>
                            </div>

                            <div className="flex flex-row justify-center items-center gap-3">
                                <input
                                    type="radio"
                                    name="paymentMethod"
                                    value="PayPal"
                                    checked={selectedPayment === "PayPal"}
                                    onChange={() =>
                                        setSelectedPayment("PayPal")
                                    }
                                    className="peer appearance-none w-[14px] h-[14px] rounded-full border border-[#0955AC] bg-[#0955AC] checked:border-[#0955AC] focus:outline-none transition-colors cursor-pointer"
                                />
                                <h1 className="peer-checked:text-[#000000] text-[#00000080] text-[10px] font-[600]">
                                    PayPal
                                </h1>
                            </div>

                            <div className="flex flex-row justify-center items-center gap-3">
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
                                    className="peer appearance-none w-[14px] h-[14px] rounded-full border border-[#0955AC] bg-[#0955AC] checked:border-[#0955AC] focus:outline-none transition-colors cursor-pointer"
                                />
                                <h1 className="peer-checked:text-[#000000] text-[#00000080] text-[10px] font-[600]">
                                    Bank Transfer
                                </h1>
                            </div>
                        </div>
                        <div className="flex flex-col lg:flex-row justify-between mt-3">
                            <div className="">
                                <label className="text-[10px]/[24px] font-[600]">
                                    Card Number :
                                </label>
                                <div className="md:w-[374px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                                    <input
                                        className="w-full h-full rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080]"
                                        placeholder="Enter your card number"
                                    />
                                </div>
                            </div>
                            <div className="">
                                <label className="text-[10px]/[24px] font-[600]">
                                    Expiration Date :
                                </label>
                                <div className="md:w-[374px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                                    <input
                                        className="w-full h-full rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080]"
                                        placeholder="MM / YY"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col lg:flex-row justify-between mt-3">
                            <div className="">
                                <label className="text-[10px]/[24px] font-[600]">
                                    Card Holder Name :
                                </label>
                                <div className="md:w-[374px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                                    <input
                                        className="w-full h-full rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080]"
                                        placeholder="Enter your card holder name"
                                    />
                                </div>
                            </div>
                            <div className="">
                                <label className="text-[10px]/[24px] font-[600]">
                                    CVC Number :
                                </label>
                                <div className="md:w-[374px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                                    <input
                                        className="w-full h-full rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080]"
                                        placeholder="Enter your CVC number"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="border-l-[0.2px] rounded-[10px] lg:w-[874px] h-auto bg-[#FFFFFF] px-10 py-10"
                        style={{
                            borderLeftWidth: "0.2px",
                            borderTopWidth: "0.2px",
                            boxShadow: "4px 4px 4px #0000001A",
                        }}
                    >
                        <h1 className="text-[20px] font-[700]">
                            Additional Information
                        </h1>
                        <div className="">
                            <label className="text-[10px]/[24px] font-[600]">
                                Special Requests :
                            </label>
                            <textarea
                                className="w-full h-[87px] border-[1px] border-[#0000004D] rounded-[5px] focus:outline-none focus:ring-0 placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080] focus:border-[#0000004D]"
                                placeholder="Add if you have any extra requests"
                            />
                        </div>
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
                                    className="peer appearance-none w-[14px] h-[14px] rounded-full border border-[#0955AC] bg-[#0955AC] checked:border-[#0955AC] focus:outline-none transition-colors mt-[1.5px] cursor-pointer"
                                />
                                <div className="poppins text-[12px] flex flex-col justify-center items-start">
                                    <h1 className="font-[600]">
                                        Pay full amount now
                                    </h1>
                                    <h1 className="font-[500]">
                                        You will complete the entire payment
                                        before tour begins.
                                    </h1>
                                </div>
                            </div>
                            <div className="flex flex-row items-start gap-4">
                                <input
                                    type="radio"
                                    className="peer appearance-none w-[14px] h-[14px] rounded-full border border-[#0955AC] bg-[#0955AC] checked:border-[#0955AC] focus:outline-none transition-colors mt-[1.5px] cursor-pointer"
                                />
                                <div className="poppins text-[12px] flex flex-col justify-center items-start">
                                    <h1 className="font-[600]">
                                        Pay advance now. PAy the balance after
                                        the tour.
                                    </h1>
                                </div>
                            </div>

                            <div className="w-full md:h-[74px] bg-[#E2F6DC] rounded-[7px] text-[12px] px-5 py-5">
                                <div className="flex flex-col md:flex-row md:gap-5">
                                    <h1 className="font-[500] text-[#000000B2] w-[150px]">
                                        Advance to pay now:
                                    </h1>
                                    <h1 className="font-[600]">$3400.00</h1>
                                </div>
                                <div className="flex flex-col md:flex-row md:gap-5">
                                    <h1 className="font-[500] text-[#000000B2] w-[150px]">
                                        Remaining Balance:
                                    </h1>
                                    <h1 className="font-[600]">
                                        $13400.00 (due date August 25, 2025)
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
                                className="size-[20px] border-[0.5px] border-[#0955AC] bg-[#FFFFFF] rounded-[4px] cursor-pointer"
                                type="checkbox"
                            />
                            <div>
                                <h1 className="">
                                    I agree to the{" "}
                                    <span className="text-[#0955AC]">
                                        Term and Condition
                                    </span>{" "}
                                    and{" "}
                                    <span className="text-[#0955AC]">
                                        Privacy Policy.
                                    </span>
                                </h1>
                                <h1>
                                    {" "}
                                    I confirm that am at least. 21 vears old and
                                    hold a valid driver's license
                                </h1>
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={handleConfirmBooking}
                        className="rounded-[5px] flex justify-center items-center text-[#FFFFFF] font-[700] text-[12px] lg:w-[874px] h-[50px] bg-[#0955AC] px-5 py-5 cursor-pointer hover:bg-[#074a8f] transition-colors">
                        {" "}
                        CONFIRM BOOKING{" "}
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
                            <img src={car} />
                            <div className="flex flex-col gap-3">
                                <h1 className="figtree text-[20px] font-[700] ">
                                    Lamborghini urus (2020)
                                </h1>
                                <div className="poppins flex flex-row gap-5 text-[9px] text-[#000000B2] font-[500]">
                                    <div className="flex flex-col gap-2 justify-center items-center">
                                        <img
                                            src={icon1}
                                            className="size-[17px]"
                                        />
                                        <h1>4,000</h1>
                                    </div>
                                    <div className="flex flex-col gap-2 justify-center items-center">
                                        <img
                                            src={icon2}
                                            className="size-[17px]"
                                        />
                                        <h1>Auto</h1>
                                    </div>
                                    <div className="flex flex-col gap-2 justify-center items-center">
                                        <img
                                            src={icon3}
                                            className="size-[17px]"
                                        />
                                        <h1>4 Person</h1>
                                    </div>
                                    <div className="flex flex-col gap-2 justify-center items-center">
                                        <img
                                            src={icon4}
                                            className="size-[17px]"
                                        />
                                        <h1>Electric</h1>
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
                                            Pick up: Hudson Rd, Colombo 03
                                        </h1>
                                        <h1>Pick-up Date : June 23rd, 2025</h1>
                                        <h1>Pick-up Time : 10 : 00 AM</h1>
                                    </div>
                                    <div>
                                        <h1 className="text-[16px] font-[700] text-[#000000]">
                                            Drop off: Hudson Rd, Colombo 03
                                        </h1>
                                        <h1>Drop-off Date : June 23rd, 2025</h1>
                                        <h1>Drop-off Time : 10 : 00 AM</h1>
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
                                            Rental Price
                                        </h1>
                                        <div className="flex flex-col md:flex-row gap-3 text-[#00000061]">
                                            <h1>$620/day</h1>
                                            <h1 className="text-[#0955AC]">
                                                (x7 days)
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="text-[#000000CC]">
                                        $3450
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row justify-between w-full px-5 font-[500]">
                                    <div>
                                        <h1 className="text-[#000000CC]">
                                            3+ day discount
                                        </h1>
                                        <div className="flex flex-col md:flex-row gap-3 text-[#00000061]">
                                            <h1>Extended trip scount</h1>
                                            <h1 className="text-[#0955AC]">
                                                (50%)
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="text-[#000000CC]">
                                        -$345
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row justify-between w-full px-5 py-5 font-[500]">
                                    <div>
                                        <h1 className="text-[#000000CC]">
                                            Refundable deposit
                                        </h1>
                                        <div className="flex flex-col md:flex-row gap-3 text-[#00000061]">
                                            <h1>Refunded by</h1>
                                            <h1 className="text-[#0955AC]">
                                                Oct 14th
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="text-[#000000CC]">
                                        -$500
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
                                            <h1>Child Seat</h1>
                                        </div>
                                        <h1>$155</h1>
                                    </div>
                                </div>

                                <div className="w-full h-[1px] bg-[#CDD0D4] mt-5" />

                                <div className="flex flex-col md:flex-row justify-between w-full px-5 py-5 font-[500]">
                                    <div>
                                        <h1 className="text-[#000000CC]">
                                            Advance Payment
                                        </h1>
                                        <div className="flex flex-col md:flex-row gap-3 text-[#00000061] mt-3">
                                            <h1>First payment </h1>
                                            <h1 className="text-[#0955AC]">
                                                (20%)
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="text-[#000000CC] text-[12px] font-[500]">
                                        $1567
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row justify-between w-full px-5 pb-5 font-[500]">
                                    <div>
                                        <h1 className="text-[#000000CC]">
                                            Total Price Due
                                        </h1>
                                        <div className="flex flex-col md:flex-row gap-3 text-[#00000061] mt-3">
                                            <h1>$500 Refunded by</h1>
                                            <h1 className="text-[#0955AC]">
                                                July 27th
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="text-[#000000CC] text-[16px] font-[700]">
                                        $4567
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

export default VehicleCheckoutContent;
