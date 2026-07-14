import React from "react";
import img from "../../assets/multiModel/review/img.png";

import pro1 from "../../assets/multiModel/review/pro1.svg";
import pro2 from "../../assets/multiModel/review/pro2.svg";
import pro3 from "../../assets/multiModel/review/pro3.svg";
import pro4 from "../../assets/multiModel/review/pro4.svg";
import pro5 from "../../assets/multiModel/review/pro5.svg";

import blueLeft from "../../assets/multiModel/review/blueLeft.svg";
import stars from "../../assets/multiModel/review/stars.svg";
import comma from "../../assets/multiModel/review/comma.svg";

const Review = () => {
    return (
        <div className="flex flex-col justify-center items-center py-20">
            <div className="max-w-[1400px] w-full">
                <div className="flex lg:flex-row flex-col justify-between gap-10 w-full p-5">
                    {/* card 1 */}
                    <div
                        className="xl:w-[507px] xl:h-[560px] rounded-[20px] flex flex-col justify-between relative py-20 px-10 text-white"
                        style={{ backgroundImage: `url(${img})` }}
                    >
                        <div className="w-full h-full absolute top-0 left-0 bg-[#00000069] rounded-[20px] z-10" />

                        <div className="relative z-20">
                            <h1 className="text-[24px] font-[700]">
                                Testimonials
                            </h1>

                            <h1 className="bebas-neue text-[40px]/[58px] font-[400] mt-10">
                                our success stories from our customers
                            </h1>
                        </div>

                        <div className="relative z-20 flex xl:flex-row flex-col gap-5 justify-between">
                            <div className="flex flex-row xl:justify-center justify-start items-center">
                                <img src={pro1} />
                                <img src={pro2} className="-ml-5" />
                                <img src={pro3} className="-ml-5" />
                                <img src={pro4} className="-ml-5" />
                                <h1 className="text-[22px] font-[900] -ml-14">
                                    10+
                                </h1>
                            </div>
                            <div className="flex flex-row gap-2">
                                <div className="xl:size-[65px] size-[35px] bg-white rounded-full flex justify-center items-center cursor-pointer">
                                    <img src={blueLeft} />
                                </div>

                                <div className="xl:size-[65px] size-[35px] bg-white rounded-full flex justify-center items-center cursor-pointer">
                                    <img
                                        src={blueLeft}
                                        className="rotate-180"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* card 2 */}
                    <div className="xl:w-[378px] xl:h-[561px] flex flex-col justify-between bg-white shadow-lg rounded-[20px] p-10">
                        <div className="flex flex-row justify-between">
                            <div className="flex flex-row gap-5">
                                <img src={pro5} />
                                <div>
                                    <h1 className="text-[14px] font-[700]">
                                        Kasun Gunawardhana
                                    </h1>
                                    <img src={stars} />
                                </div>
                            </div>
                            <img src={comma} className="-mt-10" />
                        </div>

                        <p className="text-[14px]/[33px] font-[400] poppins">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Donec semper eu risus ut ornare. In bibendum
                            tempus sapien, tristique consectetur purus
                            pellentesque ac. Quisque facilisis laoreet feugiat.
                            Sed dapibus volutpat ex, eget iaculis nunc tincidunt
                            sit amet. Quisque congue sapien nec aliquet
                            faucibus. M
                        </p>

                        <div className="text-[14px]">
                            <h1 className="font-[700]">Founder</h1>
                            <h1 className="font-[500] text-[#90A3BF]">ABC Company</h1>
                        </div>
                    </div>

                    {/* card 3 */}
                    <div className="xl:w-[378px] xl:h-[561px] flex flex-col justify-between bg-white shadow-lg rounded-[20px] p-10">
                        <div className="flex flex-row justify-between">
                            <div className="flex flex-row gap-5">
                                <img src={pro5} />
                                <div>
                                    <h1 className="text-[14px] font-[700]">
                                        Kasun Gunawardhana
                                    </h1>
                                    <img src={stars} />
                                </div>
                            </div>
                            <img src={comma} className="-mt-10" />
                        </div>

                        <p className="text-[14px]/[33px] font-[400] poppins">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Donec semper eu risus ut ornare. In bibendum
                            tempus sapien, tristique consectetur purus
                            pellentesque ac. Quisque facilisis laoreet feugiat.
                            Sed dapibus volutpat ex, eget iaculis nunc tincidunt
                            sit amet. Quisque congue sapien nec aliquet
                            faucibus. M
                        </p>

                        <div className="text-[14px]">
                            <h1 className="font-[700]">Founder</h1>
                            <h1 className="font-[500] text-[#90A3BF]">ABC Company</h1>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Review;
