import React from "react";
import poster1 from "../../../assets/landingPages/blog/poster1.svg";
import poster2 from "../../../assets/landingPages/blog/poster2.svg";
import poster3 from "../../../assets/landingPages/blog/poster3.svg";
import poster4 from "../../../assets/landingPages/blog/poster4.svg";
import calendar2 from "../../../assets/landingPages/blog/calendar2.svg";
import admin2 from "../../../assets/landingPages/blog/admin2.svg";
import clock2 from "../../../assets/landingPages/blog/clock2.svg";

import fbO from "../../../assets/landingPages/blog/fbO.svg";
import ytO from "../../../assets/landingPages/blog/ytO.svg";
import linkedinO from "../../../assets/landingPages/blog/linkedinO.svg";
import twitterO from "../../../assets/landingPages/blog/twitterO.svg";
import instaO from "../../../assets/landingPages/blog/instaO.svg";
import pintrestO from "../../../assets/landingPages/blog/pintrestO.svg";

import sideArrow from "../../../assets/landingPages/blog/sideArrow.svg";

const Spotlight = () => {
    return (
        <div className="xl:px-40 px-10 py-10">
            <div className="flex lg:flex-row flex-col gap-10">
                {/* left section */}
                <div className="w-full">
                    <div className="flex flex-row justify-center items-center xl:pl-20">
                        <div className="w-[155px] h-[37px] bg-[#286BB6] rounded-[3px] flex justify-center items-center text-[12px] font-[600] p-3">
                            <h1>Today’s Spotlight</h1>
                        </div>
                        <div className="w-full h-[5px] border-y-[1px] border-[#DFDFDF]"></div>
                    </div>
                    {/* blog section */}
                    <div className="flex lg:flex-row items-center flex-col gap-5 py-10">
                        {/* big blog */}
                        <div
                            className="cursor-pointer"
                            onClick={() =>
                                (window.location.href =
                                    "/landingPage/blogExample")
                            }
                        >
                            <img src={poster1} />
                            <div className="flex flex-col gap-3 py-5">
                                <div className="w-[74px] h-[24px] flex justify-center rounded-[3px] items-center border-[1px] border-[#FF700387] text-[#FF700380] text-[12px] font-[600] uppercase">
                                    Racing
                                </div>
                                <h1 className="text-[28px]/[35px] font-[700] text-[#286BB6] manrope">
                                    Lorem Ipsum Dolar Sit Amet, <br />{" "}
                                    consectetur Lorem Ipsum Dolar
                                </h1>
                                <div className="flex flex-row gap-5 mt-3">
                                    <div className="flex flex-row gap-2 items-start">
                                        <img src={admin2} />
                                        <h1 className="text-[13px] font-[600] text-[#6D757F]">
                                            By Admin
                                        </h1>
                                    </div>
                                    <div className="flex flex-row gap-2 items-start">
                                        <img src={calendar2} />
                                        <h1 className="text-[13px] font-[600] text-[#6D757F]">
                                            27 August, 2024
                                        </h1>
                                    </div>
                                    <div className="flex flex-row gap-2 items-start">
                                        <img src={clock2} />
                                        <h1 className="text-[13px] font-[600] text-[#6D757F]">
                                            20 Mins
                                        </h1>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-5">
                            {/* mini blog 1 */}
                            <div className="flex flex-row gap-5 cursor-pointer">
                                <div className="flex flex-col gap-2">
                                    <div className="w-[74px] h-[24px] flex justify-center rounded-[3px] items-center border-[1px] border-[#FF700387] text-[#FF700380] text-[12px] font-[600] uppercase">
                                        Action
                                    </div>
                                    <h1 className="text-[20px] font-[700] text-[#286BB6] manrope">
                                        Everything You Need To Know About
                                    </h1>
                                    <div className="flex flex-row gap-3 items-start">
                                        <img src={calendar2} />
                                        <h1 className="text-[13px] font-[600] text-[#6D757F]">
                                            27 August, 2024
                                        </h1>
                                    </div>
                                </div>
                                <img src={poster2} />
                            </div>
                            {/* mini blog 2 */}
                            <div className="flex flex-row gap-5 cursor-pointer">
                                <div className="flex flex-col gap-2">
                                    <div className="w-[74px] h-[24px] flex justify-center rounded-[3px] items-center border-[1px] border-[#FF700387] text-[#FF700380] text-[12px] font-[600] uppercase">
                                        Fighter
                                    </div>
                                    <h1 className="text-[20px] font-[700] text-[#286BB6] manrope">
                                        Everything You Need To Know About
                                    </h1>
                                    <div className="flex flex-row gap-3 items-start">
                                        <img src={calendar2} />
                                        <h1 className="text-[13px] font-[600] text-[#6D757F]">
                                            27 August, 2024
                                        </h1>
                                    </div>
                                </div>
                                <img src={poster3} />
                            </div>
                            {/* mini blog 3 */}
                            <div className="flex flex-row gap-5 cursor-pointer">
                                <div className="flex flex-col gap-2">
                                    <div className="w-[74px] h-[24px] flex justify-center rounded-[3px] items-center border-[1px] border-[#FF700387] text-[#FF700380] text-[12px] font-[600] uppercase">
                                        Gaming
                                    </div>
                                    <h1 className="text-[20px] font-[700] text-[#286BB6] manrope">
                                        Everything You Need To Know About
                                    </h1>
                                    <div className="flex flex-row gap-3 items-start">
                                        <img src={calendar2} />
                                        <h1 className="text-[13px] font-[600] text-[#6D757F]">
                                            27 August, 2024
                                        </h1>
                                    </div>
                                </div>
                                <img src={poster4} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* right section */}
                <div className="">
                    <div className="flex flex-row justify-center items-center">
                        <div className="w-[155px] h-[37px] bg-[#286BB6] rounded-[3px] flex justify-center items-center text-[12px] font-[600] p-3">
                            <h1>Follow Us</h1>
                        </div>
                        <div className="w-[176px] h-[5px] border-y-[1px] border-[#DFDFDF]"></div>
                    </div>
                    <div className="py-10 flex flex-col gap-1">
                        <div className="flex flex-row gap-1 font-[600] text-[12px] text-[#FF7003C7]">
                            <div className="w-full h-[44px] bg-[#D9D9D940] gap-3 rounded-[6px] flex flex-row justify-start items-center px-5 cursor-pointer">
                                <img src={fbO} />
                                <h1>Facebook</h1>
                            </div>
                            <div className="w-full h-[44px] bg-[#D9D9D940] gap-3 rounded-[6px] flex flex-row justify-start items-center px-5 cursor-pointer">
                                <img src={ytO} />
                                <h1>Youtube</h1>
                            </div>
                        </div>
                        <div className="flex flex-row gap-1 font-[600] text-[12px] text-[#FF7003C7]">
                            <div className="w-full h-[44px] bg-[#D9D9D940] gap-3 rounded-[6px] flex flex-row justify-start items-center px-5 cursor-pointer">
                                <img src={linkedinO} />
                                <h1>Linkedin</h1>
                            </div>
                            <div className="w-full h-[44px] bg-[#D9D9D940] gap-3 rounded-[6px] flex flex-row justify-start items-center px-5 cursor-pointer">
                                <img src={twitterO} />
                                <h1>Twitter</h1>
                            </div>
                        </div>
                        <div className="flex flex-row gap-1 font-[600] text-[12px] text-[#FF7003C7]">
                            <div className="w-full h-[44px] bg-[#D9D9D940] gap-3 rounded-[6px] flex flex-row justify-start items-center px-5 cursor-pointer">
                                <img src={instaO} />
                                <h1>Instagram</h1>
                            </div>
                            <div className="w-full h-[44px] bg-[#D9D9D940] gap-3 rounded-[6px] flex flex-row justify-start items-center px-5 cursor-pointer">
                                <img src={pintrestO} />
                                <h1>Pinterest</h1>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-[270px] border-[2px] rounded-[5px] border-[#0955AC] mt-10 flex flex-col gap-5 justify-center items-center">
                        <h1 className="text-[24px] font-[800]">
                            Daily Newsletter
                        </h1>
                        <p className="text-[16px]/[28px] text-center">
                            Get all the top stories from <br /> Blogs to keep
                            track.
                        </p>

                        <div className="inter gap-3 xl:w-[260px] h-[55px] bg-[#0955AC] rounded-[5px] flex flex-row text-[14px] font-[400] justify-between items-center px-5 cursor-pointer">
                            <h1 className="opacity-[80%]">Enter your e-mail</h1>
                            <img src={sideArrow} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Spotlight;
