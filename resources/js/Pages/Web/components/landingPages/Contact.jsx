import React from "react";
import location from "../../assets/landingPages/location.svg";
import mail from "../../assets/landingPages/mail.svg";
import phone from "../../assets/landingPages/phone.svg";
import { Textarea } from "@headlessui/react";

const Contact = () => {
    return (
        <div>
            <div className="poppins p-10 xl:py-20 xl:px-20">
                <div className="flex xl:flex-row flex-col gap-20 justify-center items-center xl:items-start xl:px-20">
                    <div className="flex flex-col gap-10">
                        {/* heading */}
                        <div className="flex flex-row justify-center items-center gap-5 text-center">
                            <div className="lg:w-[112px] w-[20px] h-[1.8px] bg-[#FF7003]" />
                            <h1 className="text-[#FF7003] text-[20px] xl:text-[40px] font-[600] uppercase">
                                Contact us
                            </h1>
                            <div className="lg:w-[112px] w-[20px] h-[1.8px] bg-[#FF7003]" />
                        </div>
                        <div>
                            <p className="text-[12px] xl:text-[14px]/[33px] text-center xl:text-justify lg:w-[553px]">
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit. Donec semper eu risus ut
                                ornare. In bibendum tempus sapien, tristique
                                consectetur purus pellentesque ac. Quisque
                                facilisis laoreet feugiat. Sed dapibus volutpat
                                ex, eget iaculis nunc tincidunt sit
                                amet. Quisque{" "}
                            </p>
                        </div>
                        <div className="flex flex-col gap-10 text-[12px] xl:text-[14px] font-[500] xl:px-10">
                            <div className="flex flex-col xl:flex-row items-center gap-3 xl:gap-10">
                                <img src={location} />
                                <h1>N0.34/B, Colombo 10, Sri Lanka</h1>
                            </div>
                            <div className="flex flex-col xl:flex-row items-center gap-3 xl:gap-10">
                                <img src={mail} />
                                <h1>asdfgdf@gmail.com</h1>
                            </div>
                            <div className="flex flex-col xl:flex-row items-center gap-3 xl:gap-10">
                                <img src={phone} />
                                <h1>+94 233 345 6234</h1>
                            </div>
                        </div>
                    </div>
                    <div className="text-[14px] font-[500] text-[#76ADEC] flex flex-col justify-center items-center gap-10 w-full">
                        <div className="flex flex-col gap-2 w-full">
                            <label className="px-5">Name</label>
                            <input
                                type="text"
                                className="xl:w-[568px] xl:h-[66px] rounded-[12px] bg-[#000000] border-[1px] border-[#76ADEC] px-4 py-2"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label className="px-5">Email</label>
                            <input
                                type="email"
                                className="xl:w-[568px] xl:h-[66px] rounded-[12px] bg-[#000000] border-[1px] border-[#76ADEC] px-4 py-2"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label className="px-5">Phone Number</label>
                            <input
                                type="number"
                                className="xl:w-[568px] xl:h-[66px] rounded-[12px] bg-[#000000] border-[1px] border-[#76ADEC] px-4 py-2"
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label className="px-5">Your Message Here</label>
                            <Textarea
                                type="text"
                                className="xl:w-[568px] min-h-[100px] max-h-[100px] xl:min-h-[156px] xl:max-h-[156px] rounded-[12px] bg-[#000000] border-[1px] border-[#76ADEC] px-4 py-4"
                            ></Textarea>
                        </div>
                        <div
                            className="w-full xl:w-[137px] xl:h-[41px] xl:text-[14px] md:text-[10px] text-[12px] font-[700] flex justify-center items-center rounded-[44px] cursor-pointer text-[#FFFFFF] px-4 py-4"
                            style={{
                                background:
                                    "linear-gradient(90deg, #11207D 0%, #1F3AE3 46.63%, #485BD2 99.04%)",
                            }}
                        >
                            Submit
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
