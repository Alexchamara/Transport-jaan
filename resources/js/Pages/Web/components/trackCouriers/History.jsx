import React from "react";
import yellowSend from "../../assets/trackCourier/yellowSend.png";
import stars from "../../assets/trackCourier/stars.png";
import proPic from "../../assets/trackCourier/proPic.png";

const History = () => {
    return (
        <div className="bg-[#0955AC24]">
            <div className="flex flex-col justify-center items-center text-[14px] py-20">
                <h1 className="bebas-neue text-[40px]/[130%] font-[400]">
                    Delivery <span className="text-[#0955AC]"> history</span>{" "}
                </h1>
                <p className="text-center text-[14px]/[33px] pb-20 md:pb-0 px-10 md:px-0">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Donec semper eu risus ut ornare. In bibendum <br /> tempus
                    sapien, tristique consectetur purus pellentesque ac
                </p>
                <div className="lg:w-[900px] h-auto xl:w-[1171px] xl:h-[646px] flex flex-col gap-20 bg-[#FFFFFF] rounded-[12px] border-[0.5px] border-[#020066] my-10 px-10 py-10 ">
                    {/* 1st review card */}
                    <div className="cabin flex flex-col justify-center items-start gap-10 text-[14px] text-[#B0B0B0] font-[400] border-b-[1px] border-[#ECECEC] py-20">
                        <div className="flex flex-col md:flex-row justify-start items-center gap-10 md:gap-30">
                            <div className="flex flex-col justify-center items-start">
                                <h1 className="font-[600]">Order number</h1>
                                <h1 className="text-[18px] font-[700] text-[#232323]">
                                    EV-2017002543
                                </h1>
                                <h1 className="text-[#484A58]">
                                    Food Materials
                                </h1>
                            </div>
                            <div className="flex flex-row justify-center items-center gap-3">
                                <div>
                                    {" "}
                                    <img src={proPic} />{" "}
                                </div>
                                <div>
                                    <h1 className="font-[600]">Rider</h1>
                                    <h1 className="text-[18px] font-[700] text-[#232323]">
                                        David Steward
                                    </h1>
                                    <h1 className="text-[#484A58]">
                                        Bicycle rider
                                    </h1>
                                </div>
                            </div>
                            <div>
                                <img src={stars} />
                            </div>
                        </div>

                        <form method="POST">
                            <div className="mb-4 flex flex-row justify-between items-center gap-5 lg:w-[830px] xl:w-[1078px] h-[48px] rounded-[10px] border-[0.5px] border-[#B4B4B4] bg-[#FFFFFF] shadow-sm px-5">
                                <input
                                    type="text"
                                    name="tracking_number"
                                    id="tracking_number"
                                    placeholder="Send a review"
                                    className="border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent w-full"
                                    required
                                />
                                <img
                                    src={yellowSend}
                                    className="cursor-pointer"
                                />
                            </div>
                        </form>
                    </div>

                    {/* 2nd review card */}
                    <div className="cabin flex flex-col justify-center items-start gap-10 text-[14px] text-[#B0B0B0] font-[400]">
                        <div className="flex flex-col md:flex-row justify-start items-center gap-10 md:gap-30">
                            <div className="flex flex-col justify-center items-start">
                                <h1 className="font-[600]">Order number</h1>
                                <h1 className="text-[18px] font-[700] text-[#232323]">
                                    EV-2017002543
                                </h1>
                                <h1 className="text-[#484A58]">
                                    Goods
                                </h1>
                            </div>
                            <div className="flex flex-row justify-center items-center gap-3">
                                <div>
                                    {" "}
                                    <img src={proPic} />{" "}
                                </div>
                                <div>
                                    <h1 className="font-[600]">Rider</h1>
                                    <h1 className="text-[18px] font-[700] text-[#232323]">
                                        David Steward
                                    </h1>
                                    <h1 className="text-[#484A58]">
                                        Bicycle rider
                                    </h1>
                                </div>
                            </div>
                            <div>
                                <img src={stars} />
                            </div>
                        </div>

                        <form method="POST">
                            <div className="mb-4 flex flex-row justify-between items-center gap-5 lg:w-[830px] xl:w-[1078px] h-[48px] rounded-[10px] border-[0.5px] border-[#B4B4B4] bg-[#FFFFFF] shadow-sm px-5">
                                <input
                                    type="text"
                                    name="tracking_number"
                                    id="tracking_number"
                                    placeholder="Send a review"
                                    className="border-none outline-none focus:outline-none focus:ring-0 focus:border-transparent w-full"
                                    required
                                />
                                <img
                                    src={yellowSend}
                                    className="cursor-pointer"
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default History;
