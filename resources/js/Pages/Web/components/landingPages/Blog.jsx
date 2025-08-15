import React from "react";
import bg2 from "../../assets/landingPages/bg2.svg";
import blog1 from "../../assets/landingPages/blog1.svg";
import blog2 from "../../assets/landingPages/blog2.svg";
import blog3 from "../../assets/landingPages/blog3.svg";

import orangeRightArrow from "../../assets/landingPages/orangeRightArrow.svg";

const Blog = () => {
    return (
        <div
            className="h-auto w-full bg-cover bg-center"
            style={{
                background:
                    "radial-gradient(closest-side at center, #32261D 0%, #000000 100%)",
            }}
        >
            <div className="poppins py-10 px-20">
                {/* heading */}
                <div className="flex flex-row justify-center items-center gap-5">
                    <div className="w-[112px] h-[1.8px] bg-[#FF7003]" />
                    <h1 className="text-[#FF7003] text-[40px] font-[600] uppercase text-center">
                        OUR BLOG
                    </h1>
                    <div className="w-[112px] h-[1.8px] bg-[#FF7003]" />
                </div>

                <div className="flex justify-center items-center py-10">
                    <h1 className="text-[17px] font-[300] text-[#F5B7877D] xl:w-[930px] text-center">
                        FLorem ipsum dolor sit amet, consectetur adipiscing
                        elit. Donec semper eu risus ut ornare. In bibendum
                        tempus sapien, tristique consectetur purus pellentesque
                        ac.
                    </h1>
                </div>

                {/* blog content */}
                <div className="flex xl:flex-row flex-col gap-10 justify-center items-center py-10 relative">
                    {/* Blog 1 */}
                    <div
                        className="md:h-[518px] md:w-[400px] bg-cover bg-center flex flex-col justify-end px-8 py-8 cursor-pointer"
                        style={{ backgroundImage: `url(${blog1})` }}
                        onClick={() =>
                            (window.location.href = "/landingPage/blog")
                        }
                    >
                        <div className="px-[5px]">
                            <h1 className="text-[24px] font-[700]">
                                Lorem Ipsum Dolor Sit Amet
                            </h1>
                            <p className="text-[12px]/[23px] text-[8px] font-[400] text-justify mt-3">
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit. Donec semper eu risus ut
                                ornare. In bibendum tempus sapien, tristique
                                consectetu
                            </p>
                            <div className="flex md:flex-row flex-col gap-3 justify-between items-center mt-20">
                                <h1 className="text-[12px] font-[500]">
                                    15 min - 01 JUN 23{" "}
                                </h1>
                                <div className="w-[129px] h-[38px] border-[1px] border-[#F0EBE1] rounded-[24px] flex justify-center items-center font-[700] text-[14px] uppercase cursor-pointer px-2 py-2">
                                    read more
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Blog 2 */}
                    <div
                        className="md:h-[518px] md:w-[400px] bg-cover bg-center flex flex-col justify-end px-8 py-8 cursor-pointer"
                        style={{ backgroundImage: `url(${blog2})` }}
                        onClick={() =>
                            (window.location.href = "/landingPage/blog")
                        }
                    >
                        <div className="px-[5px]">
                            <h1 className="text-[24px] font-[700]">
                                Lorem Ipsum Dolor Sit Amet
                            </h1>
                            <p className="text-[12px]/[23px] text-[8px] font-[400] text-justify mt-3">
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit. Donec semper eu risus ut
                                ornare. In bibendum tempus sapien, tristique
                                consectetu
                            </p>
                            <div className="flex md:flex-row flex-col gap-3 justify-between items-center mt-20">
                                <h1 className="text-[12px] font-[500]">
                                    15 min - 01 JUN 23{" "}
                                </h1>
                                <div className="w-[129px] h-[38px] border-[1px] border-[#F0EBE1] rounded-[24px] flex justify-center items-center font-[700] text-[14px] uppercase cursor-pointer px-2 py-2">
                                    read more
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Blog 3 */}
                    <div
                        className="md:h-[518px] md:w-[400px] bg-cover bg-center flex flex-col justify-end px-8 py-8 cursor-pointer"
                        style={{ backgroundImage: `url(${blog3})` }}
                        onClick={() =>
                            (window.location.href = "/landingPage/blog")
                        }
                    >
                        <div className="px-[5px]">
                            <h1 className="text-[24px] font-[700]">
                                Lorem Ipsum Dolor Sit Amet
                            </h1>
                            <p className="text-[12px]/[23px] font-[400] text-justify mt-3">
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit. Donec semper eu risus ut
                                ornare. In bibendum tempus sapien, tristique
                                consectetu
                            </p>
                            <div className="flex md:flex-row gap-3 flex-col justify-between items-center mt-20">
                                <h1 className="text-[12px] font-[500]">
                                    15 min - 01 JUN 23{" "}
                                </h1>
                                <div className="w-[129px] h-[38px] border-[1px] border-[#F0EBE1] rounded-[24px] flex justify-center items-center font-[700] text-[14px] uppercase cursor-pointer px-2 py-2">
                                    read more
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-row justify-end">
                    <div className="flex flex-row gap-5 justify-center items-center cursor-pointer">
                        <h1 className="text-[14px] font-[700] text-[#FF7003]">
                            See all
                        </h1>
                        <img
                            src={orangeRightArrow}
                            className="w-[13px] h-[17px]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Blog;
