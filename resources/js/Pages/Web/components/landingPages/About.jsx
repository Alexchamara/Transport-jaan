import React from "react";
import img1 from "../../assets/landingPages/img1.svg";
import img2 from "../../assets/landingPages/img2.svg";

const About = () => {
    return (
        <div className="poppins px-10 py-10">
            <div className="flex flex-row justify-center items-center gap-5">
                <div className="md:w-[112px] w-[40px] h-[1.8px] bg-[#FF7003]" />
                <h1 className="text-[#FF7003] text-[20px] xl:text-[40px] text-center font-[600]">
                    ABOUT US
                </h1>
                <div className="md:w-[112px] w-[40px] h-[1.8px] bg-[#FF7003]" />
            </div>
            <div className="flex xl:flex-row flex-col gap-10 justify-center items-center py-10">
                <div className="flex md:flex-row flex-col gap-5 items-center justify-center">
                    <img src={img1} className="w-[272px] 2xl:w-[372px]" />
                    <div className="flex flex-col gap-5">
                        <div
                            className="w-[237px] 2xl:w-[337px] xl:h-[219px] p-5 rounded-[30px] font-[600] text-[#29D3DC] flex flex-col justify-center items-center"
                            style={{
                                background:
                                    "linear-gradient(180deg, #11207D 0%, #1F3AE3 100%)",
                            }}
                        >
                            <h1 className="2xl:text-[82px] text-[72px]">10+</h1>
                            <h1 className="2xl:text-[28px] text-[24px] text-center">
                                Years of experience{" "}
                            </h1>
                        </div>
                        <img src={img2} className="w-[237px] 2xl:w-[337px]" />
                    </div>
                </div>

                <div className="max-w-[600px] 2xl:text-[14px]/[50px] text-[12px]/[40px] font-[400] xl:text-justify text-center flex flex-col gap-10">
                    <h1 className="2xl:text-[47px] text-[25px] xl:text-[45px] font-[600]">
                        Why is Company Name?
                    </h1>

                    <div>
                        <p>
                            We are a comprehensive multimodal transport and
                            logistics booking platform designed to simplify how
                            goods and services move across local and global
                            networks. Our platform seamlessly connects customers
                            with verified logistics vendors, offering land, air,
                            sea, courier, and warehousing solutions within one
                            secure digital ecosystem. By integrating multiple
                            transport modes into a single interface, we
                            eliminate complexity, improve efficiency, and
                            provide complete visibility throughout the logistics
                            journey. Whether managing urgent courier deliveries,
                            large-scale freight movements, or long-term storage
                            requirements, users can search, compare, book, and
                            track services with confidence.
                        </p>
                        <p>
                            For logistics providers, our platform serves as a
                            powerful marketplace to showcase capabilities, reach
                            new customers, and streamline operations through
                            technology-driven tools. Built with reliability,
                            transparency, and scalability at its core, we aim to
                            transform traditional logistics into a smarter,
                            faster, and more connected experience for businesses
                            and individuals alike.
                        </p>
                    </div>

                    <div
                        className="xl:w-[137px] xl:h-[41px] xl:text-[14px] md:text-[10px] text-[12px] font-[700] flex justify-center items-center rounded-[44px] cursor-pointer px-4 py-4"
                        style={{
                            background:
                                "linear-gradient(90deg, #11207D 0%, #1F3AE3 46.63%, #485BD2 99.04%)",
                        }}
                    >
                        Read More
                    </div>
                </div>
            </div>

            <div className="flex xl:flex-row flex-col justify-center items-center pt-10 gap-20">
                <div className="font-[600] flex flex-row items-center gap-3">
                    <h1 className="text-[50px] lg:text-[71px]">10</h1>
                    <h1 className="text-[16px] lg:text-[20px]">
                        Years of <br /> Experience
                    </h1>
                </div>
                <div className="font-[600] flex flex-row items-center gap-3">
                    <h1 className="text-[50px] lg:text-[71px]">120+</h1>
                    <h1 className="text-[16px] lg:text-[20px]">
                        Projects <br /> Completed
                    </h1>
                </div>
                <div className="font-[600] flex flex-row items-center gap-3">
                    <h1 className="text-[50px] lg:text-[71px]">1.5K+</h1>
                    <h1 className="text-[16px] lg:text-[20px]">
                        Happy <br /> Clients
                    </h1>
                </div>
                <div className="font-[600] flex flex-row items-center gap-3">
                    <h1 className="text-[50px] lg:text-[71px]">40</h1>
                    <h1 className="text-[16px] lg:text-[20px]">
                        Countries <br /> Covered
                    </h1>
                </div>
            </div>
        </div>
    );
};

export default About;
