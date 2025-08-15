import React, { useState } from "react";
import bg from "../../assets/freight/bg.svg"
import locationIcon from "../../assets/freight/Location.svg";
import line from "../../assets/freight/line.svg"
import goods from "../../assets/freight/goods.svg"
import load from "../../assets/freight/load.svg"

const HeroSection = () => {
    const [selectedTab, setSelectedTab] = useState("quote");
    return (
        <div
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                width: "100%",
                height: "auto",
                position: "relative",
                paddingBottom: "50px",
            }}
        >
            {/* Overlay */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "#0955AC38",
                    clipPath: "polygon(0 0, 40% 0, 70% 100%, 0 100%)",
                    zIndex: 1,
                    pointerEvents: "none",
                }}
            />
            {/* Content */}
            <div style={{ position: "relative", zIndex: 2 }}>
                <div className="flex flex-col items-center">
                    <div className="container mx-auto px-10 pt-20">
                        <div className="w-[125px] h-[5px] bg-[#FFFFFF] mb-6 rounded-sm"></div>
                        <h1 className="bebas-neue text-[78px]/[70px] font-[400] mb-4 text-[#FFFFFF]">
                            Speed Up Logistics with <br /> Smarter Freight Planning.
                        </h1>
                        <p className="poppins py-5 text-[12px]/[20px] md:text-[14px]/[33px] font-[400] text-[#FFFFFF] text-justify mb-10 md:mb-20">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                            Donec semper eu risus ut ornare. In bibendum tempus
                            sapien, <br /> tristique consectetur purus pellentesque
                            ac. Quisque facilisis laoreet feugiat. Sed dapibus
                            volutpat ex, eget iaculis nunc <br /> tincidunt sit
                            amet. Quisque congue sapien nec aliquet faucibus. Morbi
                            lectus eros,
                        </p>
                    </div>
                </div>

                <div className="flex flex-col justify-center items-center">
                    <div>
                        <div className="flex flex-row justify-center items-center gap-5 w-auto xl:w-[600px] h-[80px] bg-[#FFFFFF] rounded-tl-[15px] rounded-tr-[15px] px-5 text-[16px] font-[700]">
                            {/* Request a Freight Qoute Tab */}
                            <div
                                className={`flex justify-center items-center h-[60px] xl:w-[263px] rounded-[10px] p-5 cursor-pointer transition-all duration-200 ${selectedTab === "quote" ? "bg-[#0955AC] text-white" : "text-[#0955AC] bg-transparent"}`}
                                onClick={() => setSelectedTab("quote")}
                            >
                                <h1 className={selectedTab === "quote" ? "border-b-2 border-white" : ""}>Request a Freight Qoute</h1>
                            </div>
                            {/* Track Shipment Tab */}
                            <div
                                className={`flex justify-center items-center h-[60px] xl:w-[263px] rounded-[10px] p-5 cursor-pointer transition-all duration-200 ${selectedTab === "track" ? "bg-[#0955AC] text-white" : "text-[#0955AC] bg-transparent"}`}
                                onClick={() => setSelectedTab("track")}
                            >
                                <h1 className={selectedTab === "track" ? "border-b-2 border-white" : ""}>Track Shipment</h1>
                            </div>
                        </div>
                        {/* Tab Content */}
                        {selectedTab === "quote" && (
                            <div className="w-auto h-auto xl:h-[175px] bg-[#FFFFFF] rounded-b-[15px] xl:rounded-tr-[15px] text-[16px] text-[#286BB6] font-[400] px-10 py-10 flex flex-col xl:flex-row justify-evenly items-center gap-3">
                                <div className="flex flex-col gap-2">
                                    <label>Origin</label>
                                    <div className="w-[268px] h-[56px] border-[1px] border-[#0000001A] focus:outline-none rounded-[8px] flex flex-row justify-center items-center p-2">
                                        <img src={locationIcon} />
                                        <input className="w-full text-[16px] focus:outline-none focus:ring-0 border-none placeholder:text-[#286BB6] placeholder:text-[16px]"
                                        placeholder="Where are you shipping to" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label>Destination</label>
                                    <div className="w-[268px] h-[56px] border-[1px] border-[#0000001A] focus:outline-none rounded-[8px] flex flex-row justify-center items-center p-2">
                                        <img src={locationIcon} />
                                        <input className="w-full text-[16px] focus:outline-none focus:ring-0 border-none placeholder:text-[#286BB6] placeholder:text-[16px]"
                                        placeholder="Where are you shipping to" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label>Load</label>
                                    <div className="w-[268px] h-[56px] border-[1px] border-[#0000001A] focus:outline-none rounded-[8px] flex flex-row justify-center items-center p-2">
                                        <img src={goods} />
                                        <input className="w-full text-[16px] focus:outline-none focus:ring-0 border-none placeholder:text-[#286BB6] placeholder:text-[16px]"
                                        placeholder="What are you shipping" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label>Goods</label>
                                    <div className="w-[268px] h-[56px] border-[1px] border-[#0000001A] focus:outline-none rounded-[8px] flex flex-row justify-center items-center p-2">
                                        <img src={goods} />
                                        <input className="w-full text-[16px] focus:outline-none focus:ring-0 border-none placeholder:text-[#286BB6] placeholder:text-[16px]"
                                        placeholder="Tell us about your goods" />
                                    </div>
                                </div>
                                <div className="size-[85px] bg-[#0955AC] rounded-[8px] flex justify-center items-center">
                                  <img src={line} />
                                </div>
                            </div>
                        )}
                        {selectedTab === "track" && (
                            <div className="w-auto xl:h-[175px] bg-[#FFFFFF] rounded-b-[15px] text-[16px] text-[#286BB6] font-[400] px-10 py-10 flex flex-col md:flex-row gap-5 md:gap-0 justify-evenly items-center">
                                <div className="flex flex-col gap-2">
                                    <label>Tracking Number</label>
                                    <div className="xl:w-[268px] xl:h-[56px] border-[1px] border-[#0000001A] focus:outline-none rounded-[8px] flex flex-row justify-center items-center p-2">
                                        <input className="w-full text-[16px] focus:outline-none focus:ring-0 border-none placeholder:text-[#286BB6] placeholder:text-[16px]"
                                        placeholder="Enter your tracking number" />
                                    </div>
                                </div>
                                <div className="size-[85px] bg-[#0955AC] rounded-[8px] flex justify-center items-center">
                                  <img src={line} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
