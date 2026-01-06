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
            <div className="poppins py-10 px-10 xl:px-20">
                {/* heading */}
                <div className="flex flex-row justify-center items-center gap-5">
                    <div className="xl:w-[112px] w-[40px] h-[1.8px] bg-[#FF7003]" />
                    <h1 className="text-[#FF7003] text-[20px] xl:text-[40px] font-[600] uppercase text-center">
                        OUR BLOG
                    </h1>
                    <div className="xl:w-[112px] w-[40px] h-[1.8px] bg-[#FF7003]" />
                </div>

                <div className="flex justify-center items-center py-10">
                    <h1 className="text-[12px] xl:text-[17px] font-[300] text-[#F5B7877D] xl:w-[930px] text-center">
                        Discover the latest insights, tips, and stories from the world of transportation. From air travel hacks to freight logistics updates, our blog keeps you informed and inspired for your journeys.
                    </h1>
                </div>

                {/* blog content */}
                <div className="flex xl:flex-row flex-col gap-10 justify-center items-center py-10 relative">
                    {/* Blog 1 */}
                    <div
                        className="md:h-[518px] md:w-[400px] bg-cover bg-center flex flex-col justify-end p-4 xl:p-8 cursor-pointer"
                        style={{ backgroundImage: `url(${blog1})` }}
                        onClick={() =>
                            (window.location.href = "/landingPage/blog")
                        }
                    >
                        <div className="px-[5px]">
                            <h1 className="text-[24px] font-[700]">
                                Top 10 Air Travel Tips for 2024
                            </h1>
                            <p className="text-[10px] xl:text-[12px]/[23px] font-[400] text-justify mt-3">
                                Planning your next flight? Discover essential tips to make your air travel experience smoother and more enjoyable. From packing efficiently to navigating airport security, we've got you covered.
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
                        className="md:h-[518px] md:w-[400px] bg-cover bg-center flex flex-col justify-end p-4 xl:p-8 cursor-pointer"
                        style={{ backgroundImage: `url(${blog2})` }}
                        onClick={() =>
                            (window.location.href = "/landingPage/blog")
                        }
                    >
                        <div className="px-[5px]">
                            <h1 className="text-[24px] font-[700]">
                                Exploring Scenic Bus Routes Across the Country
                            </h1>
                            <p className="text-[10px] xl:text-[12px]/[23px] font-[400] text-justify mt-3">
                                Experience the beauty of overland travel with our curated bus routes. Discover hidden gems, breathtaking landscapes, and comfortable journeys that connect you to new destinations.
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
                        className="md:h-[518px] md:w-[400px] bg-cover bg-center flex flex-col justify-end p-4 xl:p-8 cursor-pointer"
                        style={{ backgroundImage: `url(${blog3})` }}
                        onClick={() =>
                            (window.location.href = "/landingPage/blog")
                        }
                    >
                        <div className="px-[5px]">
                            <h1 className="text-[24px] font-[700]">
                                Freight Logistics: Optimizing Your Supply Chain
                            </h1>
                            <p className="text-[10px] xl:text-[12px]/[23px] font-[400] text-justify mt-3">
                                Learn how efficient freight services can transform your business operations. From cost-effective shipping solutions to real-time tracking, discover the keys to successful logistics management.
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
