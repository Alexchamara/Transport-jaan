import React, { useState } from "react";
import { router } from "@inertiajs/react";
import clock from "../../assets/landVehicleDetails/clock.svg";
import QuoteModal from "./QuoteModal";
import useScrollLock from "./useScrollLock";

const VehicleSearch = () => {
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    useScrollLock(showQuoteModal);
    return (
        <>
            <QuoteModal
                open={showQuoteModal}
                onClose={() => setShowQuoteModal(false)}
            >
                <div className="flex flex-row justify-between items-center">
                    <div className="figtree text-[16px] font-[600]">
                        <h1>Company Name</h1>
                        <h1>Perahera Rd, </h1>
                        <h1>011 - 3 455 675</h1>
                        <h1>Colombo 03</h1>
                    </div>

                    <div className="text-center poppins text-[25px] font-[700] uppercase">
                        <h1>
                            Company <br />{" "}
                            <span className="text-[#0955AC]">Logo</span>{" "}
                        </h1>
                    </div>
                </div>

                <div className="figtree flex flex-row justify-end text-[35px] font-[700] text-[#0955AC]">
                    <h1>Quotation</h1>
                </div>

                <div className="flex flex-row justify-between items-end">
                    <div className="text-[16px] font-[600]">
                        <h1 className="text-[#0955AC]">Bill To</h1>
                        <h1>Client Name</h1>
                        <h1>Perahera Rd, </h1>
                        <h1>011 - 3 455 675</h1>
                        <h1>Colombo 03</h1>
                    </div>

                    <div className="text-right text-[16px] font-[600]">
                        <h1>
                            <span className="text-[#0955AC]">
                                Quotation No:
                            </span>{" "}
                            #123456
                        </h1>
                        <h1>
                            <span className="text-[#0955AC]">
                                Quotation Date:
                            </span>{" "}
                            March 23, 2025
                        </h1>
                        <h1>
                            <span className="text-[#0955AC]">Due Date:</span>{" "}
                            May 23, 2025
                        </h1>
                    </div>
                </div>

                <div className="w-full h-[36px] bg-[#0955AC] mt-10 flex flex-row justify-center items-center text-[#FFFFFF] px-10 text-[14px] font-[700]">
                    <h1 className="w-[200px]">Description</h1>
                    <h1 className="w-[140px]">QTY.</h1>
                    <h1 className="w-[140px]">UNIT price</h1>
                    <h1 className="w-[140px] text-end">Sub Total</h1>
                </div>

                <div className="w-full h-[36px] flex flex-row justify-center items-center px-10 text-[14px] font-[600] mt-5">
                    <h1 className="w-[200px]">Lamborghini URUS (2020)</h1>
                    <h1 className="w-[140px]">12 Days</h1>
                    <h1 className="w-[140px]">12,000.00</h1>
                    <h1 className="w-[140px] text-end">$2,000.00</h1>
                </div>
                <div className="w-full h-[36px] flex flex-row justify-center items-center px-10 text-[14px] font-[600]">
                    <h1 className="w-[200px]">Lamborghini URUS (2020)</h1>
                    <h1 className="w-[140px]">12 Days</h1>
                    <h1 className="w-[140px]">12,000.00</h1>
                    <h1 className="w-[140px] text-end">$2,000.00</h1>
                </div>
                <div className="w-full h-[36px] flex flex-row justify-center items-center px-10 text-[14px] font-[600]">
                    <h1 className="w-[200px]">Lamborghini URUS (2020)</h1>
                    <h1 className="w-[140px]">12 Days</h1>
                    <h1 className="w-[140px]">12,000.00</h1>
                    <h1 className="w-[140px] text-end">$2,000.00</h1>
                </div>

                <div className="w-full h-[1.5px] bg-[#0955AC] my-5" />

                <div className="w-full h-[36px] flex flex-row justify-end items-center px-10 text-[14px] font-[600]">
                    <h1 className="w-[140px]">Subtotal</h1>
                    <h1 className="w-[140px] text-end">$6,000.00</h1>
                </div>
                <div className="w-full h-[36px] flex flex-row justify-end items-center px-10 text-[14px] font-[600]">
                    <h1 className="w-[140px]">Sales Tax (5%)</h1>
                    <h1 className="w-[140px] text-end">$300.00</h1>
                </div>
                <div className="flex justify-end items-center">
                    <div className="flex flex-row items-center border-t-[1px] border-b-[1px] w-[340px] px-10 h-[39px] bg-[#E8EBEF] border-[#0955AC] text-[14px] font-[700] text-[#0955AC]">
                        <h1 className="w-[140px]">Total (USD)</h1>
                        <h1 className="w-[140px] text-end">$9000.00</h1>
                    </div>
                </div>

                <h1 className="text-[14px] font-[700] text-[#0955AC]">
                    Terms and Conditions
                </h1>
                <h1 className="text-[14px] font-[500]">
                    Payment is due in 14 days
                </h1>

                <div className="flex justify-center items-center">
                    <div className="w-[231px] h-[41px] bg-[#0955AC] rounded-[5px] text-[#FFFFFF] font-[600] text-[12px] poppins flex justify-center items-center cursor-pointer">
                        Download quotation
                    </div>
                </div>
            </QuoteModal>
            <div className="poppins w-auto h-auto xl:w-[440px] xl:h-auto bg-[#F4F3F3] rounded-[19px] flex flex-col gap-10 py-10 px-20">
                <div className="text-[25px] font-[700]">
                    <h1>
                        $620{" "}
                        <span className="text-[10px] text-[#00000080]">
                            /day
                        </span>
                    </h1>
                    <h1 className="text-[10px] font-[600] text-[#00000080] py-4">
                        Total before taxes
                    </h1>
                    <div className=" w-auto md:w-[346px] h-[1px] bg-[#0000001F]" />
                </div>
                <form className="text-[10px] text-[#00000080] font-[600]">
                    <div>
                        {/* Pick-up Location */}
                        <div>
                            <label
                                htmlFor="pickupLocation"
                                className="block mb-3"
                            >
                                Pick-up Location
                            </label>
                            <input
                                type="text"
                                id="pickupLocation"
                                // value={formData.pickupLocation}
                                // onChange={handleInputChange}
                                placeholder="Hudson Rd, Colombo 03"
                                className="appearance-none w-full h-[35px] border-[1px] border-[#00000042] bg-[#F4F3F3] rounded-[5px] mb-3 py-3 leading-tight focus:outline-none focus:shadow-outline placeholder:text-[#000000D9] placeholder:text-[12px] placeholder:font-[600]"
                            />
                        </div>
                        {/* Pick-up Date */}
                        <div className="flex flex-row gap-5">
                            <div>
                                <label
                                    htmlFor="pickupDate"
                                    className="block mb-3"
                                >
                                    Pick-up Date
                                </label>
                                <input
                                    type="text"
                                    id="pickupDate"
                                    // value={formData.pickupDate}
                                    // onChange={handleInputChange}
                                    placeholder="23 / 07 / 2025"
                                    className="w-full border-[1px] border-[#00000042] bg-[#F4F3F3] rounded-[5px] mb-3 py-3 leading-tight focus:outline-none focus:shadow-outline placeholder:text-[#000000D9]"
                                    onFocus={(e) => (e.target.type = "date")}
                                    onBlur={(e) => (e.target.type = "text")}
                                />
                            </div>
                            <div className="relative">
                                <label
                                    htmlFor="pickupTime"
                                    className="block mb-3"
                                >
                                    Pick-up Time
                                </label>
                                <input
                                    type="text"
                                    id="pickupDate"
                                    // value={formData.pickupDate}
                                    // onChange={handleInputChange}
                                    placeholder="10 : 00 AM"
                                    className="w-full relative border-[1px] border-[#00000042] bg-transparent rounded-[5px] mb-3 py-3 leading-tight focus:outline-none focus:shadow-outline placeholder:text-[#000000D9]"
                                    onFocus={(e) => (e.target.type = "text")}
                                    onBlur={(e) => (e.target.type = "text")}
                                />
                                <img
                                    src={clock}
                                    className="hidden sm:block absolute top-11 left-40 z-10"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        {/* Drop-off Location */}
                        <div>
                            <label
                                htmlFor="dropoffLocation"
                                className="block mb-3"
                            >
                                Drop-off Location
                            </label>
                            <input
                                type="text"
                                id="dropoffLocation"
                                // value={formData.dropoffLocation}
                                // onChange={handleInputChange}
                                placeholder="Hudson Rd, Colombo 03"
                                className="w-full border-[1px] border-[#00000042] bg-[#F4F3F3] rounded-[5px] mb-3 py-3 leading-tight focus:outline-none focus:shadow-outline placeholder:text-[#000000D9]"
                            />
                        </div>
                        {/* Drop-off Date */}
                        <div className="flex flex-row gap-5">
                            <div>
                                <label
                                    htmlFor="dropoffDate"
                                    className="block mb-3"
                                >
                                    Drop-off Date
                                </label>
                                <input
                                    type="text"
                                    id="dropoffDate"
                                    // value={formData.dropoffDate}
                                    // onChange={handleInputChange}
                                    placeholder="23 / 07 / 2025"
                                    className="border-[1px] border-[#00000042] bg-[#F4F3F3] rounded-[5px] mb-3 py-3  w-full leading-tight focus:outline-none focus:shadow-outline placeholder:text-[#000000D9]"
                                    onFocus={(e) => (e.target.type = "date")}
                                    onBlur={(e) => (e.target.type = "text")}
                                />
                            </div>
                            <div className="relative">
                                <label
                                    htmlFor="pickupTime"
                                    className="block mb-3"
                                >
                                    Drop-off Time
                                </label>
                                <input
                                    type="text"
                                    id="pickupTime"
                                    // value={formData.pickupDate}
                                    // onChange={handleInputChange}
                                    placeholder="10 : 00 AM"
                                    className="w-full border-[1px] border-[#00000042] bg-[#F4F3F3] rounded-[5px] mb-3 py-3 leading-tight focus:outline-none focus:shadow-outline placeholder:text-[#000000D9]"
                                    onFocus={(e) => (e.target.type = "text")}
                                    onBlur={(e) => (e.target.type = "text")}
                                />
                                <img
                                    src={clock}
                                    className="hidden sm:block absolute top-11 left-40 z-10"
                                />
                            </div>
                        </div>
                    </div>
                </form>

                <div className="poppins text-[12px] w-full h-auto bg-[#0955AC0D] rounded-[5px] flex flex-col py-10 px-10">
                    <h1 className="font-[600] mb-5 text-[#000000D9]">
                        Pricing Breakdown
                    </h1>
                    <div className="w-full h-[1px] bg-[#CDD0D4]" />
                    <div className="flex flex-col md:flex-row justify-between w-full px-5 py-5 font-[500]">
                        <div>
                            <h1 className="text-[#000000CC]">Rental Price</h1>
                            <div className="flex flex-row gap-3 text-[#00000061]">
                                <h1>$620/day</h1>
                                <h1 className="text-[#0955AC]">(x7 days)</h1>
                            </div>
                        </div>
                        <div className="text-[#000000CC]">$3450</div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between w-full px-5 font-[500]">
                        <div>
                            <h1 className="text-[#000000CC]">
                                3+ day discount
                            </h1>
                            <div className="flex flex-row gap-3 text-[#00000061]">
                                <h1>Extended trip scount</h1>
                                <h1 className="text-[#0955AC]">(50%)</h1>
                            </div>
                        </div>
                        <div className="text-[#000000CC]">-$345</div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between w-full px-5 py-5 font-[500]">
                        <div>
                            <h1 className="text-[#000000CC]">
                                Refundable deposit
                            </h1>
                            <div className="flex flex-row gap-3 text-[#00000061]">
                                <h1>Refunded by</h1>
                                <h1 className="text-[#0955AC]">Oct 14th</h1>
                            </div>
                        </div>
                        <div className="text-[#000000CC]">-$500</div>
                    </div>
                    <div className="w-full h-[1px] bg-[#CDD0D4]" />

                    <h1 className="font-[600] mt-5 text-[#000000D9]">
                        Add Extras
                    </h1>

                    {/* checkbox section */}
                    <div className="flex flex-col justify-center text-[12px] font-[500] mt-5">
                        <div className="flex flex-row justify-between w-full px-5 py-5">
                            <div className="flex flex-row justify-center items-center gap-4">
                                <input
                                    type="checkbox"
                                    id="#"
                                    name="vehicleType"
                                    value=""
                                    className=" size-[15px] border-[1px] border-[#0955AC] rounded-[2.8px]"
                                />
                                <h1>GPS Navigation System</h1>
                            </div>
                            <h1>$155</h1>
                        </div>
                        <div className="flex flex-row justify-between w-full px-5">
                            <div className="flex flex-row justify-center items-center gap-4">
                                <input
                                    type="checkbox"
                                    id="#"
                                    name="vehicleType"
                                    value=""
                                    className=" size-[15px] border-[1px] border-[#0955AC] rounded-[2.8px]"
                                />
                                <h1>Child Seat</h1>
                            </div>
                            <h1>$155</h1>
                        </div>
                        <div className="flex flex-row justify-between w-full px-5 py-5">
                            <div className="flex flex-row justify-center items-center gap-4">
                                <input
                                    type="checkbox"
                                    id="#"
                                    name="vehicleType"
                                    value=""
                                    className=" size-[15px] border-[1px] border-[#0955AC] rounded-[2.8px]"
                                />
                                <h1>Wi-fi</h1>
                            </div>
                            <h1>$155</h1>
                        </div>
                        <div className="flex flex-row justify-between w-full px-5">
                            <div className="flex flex-row justify-center items-center gap-4">
                                <input
                                    type="checkbox"
                                    id="#"
                                    name="vehicleType"
                                    value=""
                                    className=" size-[15px] border-[1px] border-[#0955AC] rounded-[2.8px]"
                                />
                                <h1>Insurance Coverage </h1>
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
                            <div className="flex flex-row gap-3 text-[#00000061] mt-3">
                                <h1>First payment </h1>
                                <h1 className="text-[#0955AC]">(20%)</h1>
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
                            <div className="flex flex-row gap-3 text-[#00000061] mt-3">
                                <h1>$500 Refunded by</h1>
                                <h1 className="text-[#0955AC]">July 27th</h1>
                            </div>
                        </div>
                        <div className="text-[#000000CC] text-[16px] font-[700]">
                            $4567
                        </div>
                    </div>

                    <div className="relative flex flex-col md:flex-row items-start justify-start px-5">
                        <span className="absolute top-[5px] left-[20px] w-[2px] h-[2px] bg-[#FF0000] rounded-full" />
                        <p className="text-[8.5px] text-[#00000061] ml-4">
                            {" "}
                            Your total rent amount will be calculated <br />{" "}
                            depending on the pick-up and drop-off dates
                        </p>
                    </div>

                    <div className="flex justify-center items-center">
                        <div
                            className=" w-auto md:w-[261px] h-[29px] bg-[#E8EBEF] border-[1.5px] border-[#0955AC] rounded-[5px] mt-10 flex items-center justify-center text-[12px] font-[700] text-[#0955AC] cursor-pointer"
                            onClick={() => setShowQuoteModal(true)}
                        >
                            GET A QUOTE
                        </div>
                    </div>

                    <div className="flex justify-center items-center">
                        <div
                            className=" w-auto md:w-[261px] h-[29px] bg-[#0955AC] rounded-[5px] mt-5 flex items-center justify-center text-[12px] font-[700] text-[#FFFFFF] cursor-pointer"
                            onClick={() => router.visit("/vehicle-checkout")}
                        >
                            CONTINUE TO CHECKOUT
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VehicleSearch;
