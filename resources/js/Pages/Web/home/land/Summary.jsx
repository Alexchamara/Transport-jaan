import React from "react";
import Header from "../../layouts/Header";
import car from "../../assets/vehicleCheckout/car.svg";
import icon1 from "../../assets/vehicleCheckout/icon1.svg";
import icon2 from "../../assets/vehicleCheckout/icon2.svg";
import icon3 from "../../assets/vehicleCheckout/icon3.svg";
import icon4 from "../../assets/vehicleCheckout/icon4.svg";
import tick from "../../assets/vehicleCheckout/tick.svg";

const Summary = () => {
    return (
        <div>
            <Header />

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
                            <div className="md:flex hidden flex-col justify-center items-center gap-3">
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
                            <div className="flex flex-col justify-center items-center gap-3">
                                <div
                                    className="w-[18px] h-[18px] rounded-full bg-[#1565c0]"
                                    style={{
                                        boxShadow: "0 0 10px 8px #1565c088", // blur
                                    }}
                                />
                                <h1 className="figtree text-[16px] font-[700] text-[#0955AC]">
                                    Booking Confirmation
                                </h1>
                            </div>
                        </div>
                        <div
                            className="figtree h-auto bg-[#E2F6DC] rounded-[10px] px-10 py-10 w-full"
                            style={{
                                boxShadow: "4px 4px 4px #0000001A",
                            }}
                        >
                            <div className="flex md:flex-row flex-col justify-center gap-5 md:items-center">
                                <div className="size-[70px] border-[1.5px] border-[#13790A] rounded-[5px] flex justify-center items-center p-5">
                                    <img
                                        src={tick}
                                        className="w-[40px] h-[35px]"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-[20px]/[24px] font-[700] text-[#13790A]">
                                        YOUR BOOKING CONFIRMED !{" "}
                                    </h1>
                                    <h1 className="text-[14px]/[33px] xl:w-[713px] font-[400] text-[#00000080]">
                                        It is important to us that you enjoy
                                        your experience with us and have all the
                                        information you need. It might take you
                                        a little time now but it could save you
                                        time later.
                                    </h1>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-[20px]/[24px] font-[700] poppins">
                                Travel Summary
                            </h1>
                            <h1 className="text-[14px]/[24px] font-[600px] mb-10 poppins">
                                <span className="text-[10px]">#23456987</span>{" "}
                                Lamborghini Urus (2020)
                            </h1>
                            <div
                                className="h-auto bg-[#FFFFFF] border-t-[0.2px] border-l-[0.2px] border-[#00000080] rounded-[10px] px-10 py-20 w-full"
                                style={{
                                    boxShadow: "4px 4px 4px #0000001A",
                                }}
                            >
                                <div className="flex md:flex-row flex-col justify-between items-center text-[14px] font-[500]">
                                    <div>
                                        <h1 className="text-[#00000080]">
                                            Pick-up From:{" "}
                                        </h1>
                                        <h1 className="font-[700] text-[16px]">
                                            Hudson Rd, Colombo 03
                                        </h1>
                                        <div className="flex flex-row items-center gap-5 text-[#00000080]">
                                            <h1>June 23rd, 2025</h1>
                                            <div className="w-[1px] h-[32px] bg-[#808080]"></div>
                                            <h1>10 : 00 AM</h1>
                                        </div>
                                    </div>
                                    <div className="relative flex flex-row justify-center items-end h-auto">
                                        <div className="absolute left-0 bottom-[-4px] w-[10px] h-[10px] bg-[#0955AC] rounded-full"></div>
                                        <div className="flex flex-col justify-center items-center">
                                            <h1 className="text-[16px] font-[700] text-[#0955AC]">
                                                12 hrs
                                            </h1>
                                            <div className="md:w-[287px] w-[187px] h-[2px] border-b-2 border-dotted border-[#0955AC]"></div>
                                        </div>
                                        <div className="absolute right-0 bottom-[-4px] w-[10px] h-[10px] bg-[#0955AC] rounded-full"></div>
                                    </div>

                                    <div>
                                        <h1 className="text-[#00000080]">
                                            Pick-up From:{" "}
                                        </h1>
                                        <h1 className="font-[700] text-[16px]">
                                            Hudson Rd, Colombo 03
                                        </h1>
                                        <div className="flex flex-row items-center gap-5 text-[#00000080]">
                                            <h1>June 23rd, 2025</h1>
                                            <div className="w-[1px] h-[32px] bg-[#808080]"></div>
                                            <h1>10 : 00 AM</h1>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex xl:flex-row flex-col items-center gap-5 justify-between poppins">
                            <div className="md:w-[425px] w-auto h-[50px] bg-[#0955AC] text-[#FFFFFF] text-[12px] font-[700] flex justify-center items-center rounded-[5px] cursor-pointer p-5">
                                DONE
                            </div>
                            <div className="md:w-[425px] w-auto h-[50px] border-[2px] border-[#DC3333] text-[#DC3333] text-[12px] font-[700] flex justify-center items-center rounded-[5px] cursor-pointer p-5">
                                CANCEL BOOKING
                            </div>
                        </div>
                        <div className="flex justify-end text-[#0955AC] text-[16px] font-[500] cursor-pointer">
                          <h1>Need a Driver ?</h1>
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
                                    <div className="md:flex hidden flex-col items-center mt-2">
                                        <div className="size-[17px] bg-[#0955AC] rounded-full"></div>
                                        <div className="h-[77px] w-[1.5px] bg-[#0955AC]"></div>
                                        <div className="size-[17px] bg-[#0955AC] rounded-full"></div>
                                    </div>
                                    <div className="figtree flex flex-col gap-10 text-[14px] font-[500] text-[#00000080]">
                                        <div>
                                            <h1 className="text-[16px] font-[700] text-[#000000]">
                                                Pick up: Hudson Rd, Colombo 03
                                            </h1>
                                            <h1>
                                                Pick-up Date : June 23rd, 2025
                                            </h1>
                                            <h1>Pick-up Time : 10 : 00 AM</h1>
                                        </div>
                                        <div>
                                            <h1 className="text-[16px] font-[700] text-[#000000]">
                                                Drop off: Hudson Rd, Colombo 03
                                            </h1>
                                            <h1>
                                                Drop-off Date : June 23rd, 2025
                                            </h1>
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
        </div>
    );
};

export default Summary;
