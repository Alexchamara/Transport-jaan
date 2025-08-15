import React from "react";
import payImg1 from "../../assets/flight/payImg1.svg";
import payImg2 from "../../assets/flight/payImg2.svg";
import payImg3 from "../../assets/flight/payImg3.svg";
import payImg4 from "../../assets/flight/payImg4.svg";
import flight from "../../assets/flight/flights.svg";

import greenTic from "../../assets/flight/greenTic.svg";
import paypal from "../../assets/flight/paypal.svg";
import stripe from "../../assets/flight/stripe.svg";
import masterCard from "../../assets/flight/mastercard.svg";
import skrill from "../../assets/flight/skrill.svg";

const EasyPayment = () => {
    return (
        <div className="bg-[#FFFFFF] flex flex-col xl:flex-row gap-10 px-10 py-20 justify-center items-center xl:items-start relative">
            <div className="flex flex-row gap-10">
                <div className="flex flex-col gap-10">
                    <img src={payImg1} />
                    <img src={payImg2} />
                </div>
                <div className="flex flex-col gap-10 mt-10">
                    <img src={payImg3} />
                    <img src={payImg4} />
                </div>
            </div>
            <div className="py-20">
                <div className="w-[140px] h-[48px] bg-[#F2F4F6] flex justify-center items-center rounded-[12px]">
                    <h1 className="text-[14px] font-[700]">Easy Payments</h1>
                </div>

                <h1 className="bebas-neue text-[52px]/[76px] font-[400] xl:w-[500px] mt-5">
                    We <span className="text-[#0955AC]">offer</span> tours in a
                    <span className="text-[#0955AC]"> range</span> of{" "}
                    <span className="text-[#0955AC]">locations</span>
                </h1>
                <p className="poppins font-[500] text-[20px]/[32px] xl:w-[620px]">
                    Choose one style or create a package, fill your passports
                    with adventures together.
                </p>
                <img src={flight} className="absolute top-5 right-0" />

                <div className="flex flex-col gap-5 py-10 text-[14px] font-[400] poppins">
                    <div className="flex flex-col xl:flex-row xl:gap-20">
                        <div className="flex flex-row gap-3 justify-center items-center">
                            <img src={greenTic} />
                            <h1 className="w-[202px]">Security Assurance</h1>
                        </div>
                        <div className="flex flex-row gap-3 justify-center items-center">
                            <img src={greenTic} />
                            <h1 className="w-[202px]">Customer Support</h1>
                        </div>
                    </div>
                    <div className="flex flex-col xl:flex-row xl:gap-20">
                        <div className="flex flex-row gap-3 justify-center items-center">
                            <img src={greenTic} />
                            <h1 className="w-[202px]">Transparent Policies</h1>
                        </div>
                        <div className="flex flex-row gap-3 justify-center items-center">
                            <img src={greenTic} />
                            <h1 className="w-[202px]">Reputable Affiliations</h1>
                        </div>
                    </div>
                </div>

                <h1 className="text-[14px] font-[700]">Payment is secure and safe</h1>

                <div className="py-10 flex flex-col xl:flex-row gap-3">
                  <div className="w-[111px] h-[50px] border-[1px] border-[#E4E6E8] rounded-[5px] flex justify-center items-center">
                    <img src={paypal} />
                  </div>

                  <div className="w-[111px] h-[50px] border-[1px] border-[#E4E6E8] rounded-[5px] flex justify-center items-center">
                    <img src={stripe} />
                  </div>

                  <div className="w-[111px] h-[50px] border-[1px] border-[#E4E6E8] rounded-[5px] flex justify-center items-center">
                    <img src={masterCard} />
                  </div>

                  <div className="w-[111px] h-[50px] border-[1px] border-[#E4E6E8] rounded-[5px] flex justify-center items-center">
                    <img src={skrill} />
                  </div>

                </div>
            </div>
        </div>
    );
};

export default EasyPayment;
