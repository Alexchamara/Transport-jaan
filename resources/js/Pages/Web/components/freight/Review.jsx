import React from "react";
import ship5 from "../../assets/freight/ship5.svg";
import proPic1 from "../../assets/freight/proPic1.svg";
import proPic2 from "../../assets/freight/proPic2.svg";
import proPic3 from "../../assets/freight/proPic3.svg";
import proPic4 from "../../assets/freight/proPic4.svg";
import leftBlue from "../../assets/freight/leftBlue.svg";

import q from "../../assets/freight/q.svg";
import ratings from "../../assets/freight/ratings.svg";
import ProFill from "../../assets/freight/ProFill.svg";

const Review = () => {
    return (
        <div className="flex flex-col xl:flex-row gap-10 xl:gap-0 justify-between items-center py-20 px-20">

          {/* card 1 */}
            <div className="relative md:w-[507px] w-full h-[700px] md:h-[561px] rounded-[20px]">
                <div
                    className="w-full h-full rounded-[20px]"
                    style={{
                        backgroundImage: `url(${ship5})`,
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                    }}
                />
                <div
                    className="absolute inset-0 rounded-[20px] text-[#FFFFFF] px-10 py-20"
                    style={{ backgroundColor: "#0955ACD4" }}
                >
                    <h1 className="text-[24px] font-[700]">About Us</h1>
                    <h1 className="bebas-neue text-[40px]/[58px] font-[400] mt-10">
                        our success stories from our customers
                    </h1>

                    <div className="absolute bottom-20 flex flex-col md:flex-row">
                        <div className="md:size-[58px] rounded-full border-[1.5px] border-[#FFFFFF] -mr-5">
                            <img src={proPic1} />
                        </div>
                        <div className="md:size-[58px] rounded-full border-[1.5px] border-[#FFFFFF] -mr-5">
                            <img src={proPic2} />
                        </div>
                        <div className="md:size-[58px] rounded-full border-[1.5px] border-[#FFFFFF] -mr-5">
                            <img src={proPic3} />
                        </div>
                        <div className="relative md:size-[58px] rounded-full border-[1.5px] border-[#FFFFFF] -mr-5">
                            <img src={proPic4} />
                            <h1 className="absolute top-[20%] left-[20%] figtree text-[22px] font-[900]">
                                10+
                            </h1>
                        </div>
                    </div>
                    <div className="absolute bottom-20 right-10 flex flex-row gap-3">
                        <div className="md:size-[65px] rounded-full bg-[#FFFFFF] flex justify-center items-center cursor-pointer">
                            <img src={leftBlue} />
                        </div>
                        <div className="md:size-[65px] rounded-full bg-[#FFFFFF] flex justify-center items-center cursor-pointer">
                            <img src={leftBlue} className="rotate-180" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Card 2 */}
            <div
                className="md:w-[378px] md:h-[561px] rounded-[20px] px-10 py-10"
                style={{ boxShadow: "2px 2px 2px 4px rgba(0, 0, 0, 0.1)" }}
            >
                <div className="flex flex-col md:flex-row items-start justify-between">
                    <div className="flex flex-row gap-5 items-center justify-center">
                        <img src={ProFill} />
                        <div>
                            <h1 className="text-[14px] font-[700]">
                                Kasun Gunawardhana
                            </h1>
                            <img src={ratings} />
                        </div>
                    </div>
                    <img src={q} />
                </div>

                <p className="poppins text-[14px]/[33px] font-[400] py-20">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Donec semper eu risus ut ornare. In bibendum tempus sapien,
                    tristique consectetur purus pellentesque ac. Quisque
                    facilisis laoreet feugiat. Sed dapibus volutpat ex, eget
                    iaculis nunc tincidunt sit amet. Quisque congue sapien nec
                    aliquet faucibus.
                </p>

                <h1 className="text-[14px] font-[700]">Founder</h1>
                <h1 className="text-[14px] font-[500] text-[#90A3BF]">ABC Company</h1>
            </div>

            {/* Card 3 */}
            <div
                className="md:w-[378px] md:h-[561px] rounded-[20px] px-10 py-10"
                style={{ boxShadow: "2px 2px 2px 4px rgba(0, 0, 0, 0.1)" }}
            >
                <div className="flex flex-col md:flex-row items-start justify-between">
                    <div className="flex flex-row gap-5 items-center justify-center">
                        <img src={ProFill} />
                        <div>
                            <h1 className="text-[14px] font-[700]">
                                Kasun Gunawardhana
                            </h1>
                            <img src={ratings} />
                        </div>
                    </div>
                    <img src={q} />
                </div>

                <p className="poppins text-[14px]/[33px] font-[400] py-20">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Donec semper eu risus ut ornare. In bibendum tempus sapien,
                    tristique consectetur purus pellentesque ac. Quisque
                    facilisis laoreet feugiat. Sed dapibus volutpat ex, eget
                    iaculis nunc tincidunt sit amet. Quisque congue sapien nec
                    aliquet faucibus.
                </p>

                <h1 className="text-[14px] font-[700]">Founder</h1>
                <h1 className="text-[14px] font-[500] text-[#90A3BF]">ABC Company</h1>
            </div>
        </div>
    );
};

export default Review;
