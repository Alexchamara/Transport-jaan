import React from "react";
import miniCar from "../../assets/landVehicleDetails/miniCar.svg";
import imgOne from "../../assets/landVehicleDetails/sug/1.svg";
import imgTwo from "../../assets/landVehicleDetails/sug/2.svg";
import imgThree from "../../assets/landVehicleDetails/sug/3.svg";
import imgFour from "../../assets/landVehicleDetails/sug/4.svg";
import heartB from "../../assets/landVehicleDetails/sug/heartB.svg";

const Suggestions = () => {
    return (
        <div className=" w-auto h-auto md:w-[440px] md:h-[643px] bg-[#F4F3F3] rounded-[19px] px-20 py-10">
            <h1 className="bebas-neue text-[30px]">
                you <span className="text-[#0955AC]">also</span> might{" "}
                <span className="text-[#0955AC]">like</span> this
            </h1>

            <div className="py-10 poppins">
                <div className="flex flex-col md:flex-row gap-5 border-b-[1px] border-[#00000033] pb-[30px]">
                    <img src={miniCar} />
                    <div>
                        <h1 className="bebas-neue text-[15px]">
                            Lamborghini{" "}
                            <span className="text-[#0955AC]">urus</span> (2020)
                        </h1>
                        <div className="flex flex-col">
                            <div className="flex flex-row justify-center items-center gap-6 py-4 text-[9px] text-[#00000040]">
                                <div className="flex flex-col justify-center items-center gap-2">
                                    <img src={imgOne} />
                                    <h1>4,000</h1>
                                </div>

                                <div className="flex flex-col justify-center items-center gap-2">
                                    <img src={imgTwo} />
                                    <h1>Auto</h1>
                                </div>
                                <div className="flex flex-col justify-center items-center gap-2">
                                    <img src={imgThree} />
                                    <h1>4 Person</h1>
                                </div>
                                <div className="flex flex-col justify-center items-center gap-2">
                                    <img src={imgFour} />
                                    <h1>Electric</h1>
                                </div>
                            </div>
                            <div className="flex flex-row gap-5">
                                <div className="text-[15px] font-[700]">
                                    <h1>
                                        89.00{" "}
                                        <span className="text-[9px] font-[600] text-[#00000080]">
                                            / day
                                        </span>
                                    </h1>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="size-[23px] rounded-[4px] border-[1.5px] border-[#0955AC] flex justify-center items-center">
                                        <img src={heartB} />
                                    </div>
                                    <button className="w-[65px] h-[23px] rounded-[4px] bg-[#0955AC] bebas-neue text-[9px] text-[#FFFFFF] font-[400]">
                                        more details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2nd one */}
                <div className="flex flex-col md:flex-row gap-5 border-b-[1px] border-[#00000033] py-[30px]">
                    <img src={miniCar} />
                    <div>
                        <h1 className="bebas-neue text-[15px]">
                            Lamborghini{" "}
                            <span className="text-[#0955AC]">urus</span> (2020)
                        </h1>
                        <div className="flex flex-col">
                            <div className="flex flex-row justify-center items-center gap-6 py-4 text-[9px] text-[#00000040]">
                                <div className="flex flex-col justify-center items-center gap-2">
                                    <img src={imgOne} />
                                    <h1>4,000</h1>
                                </div>

                                <div className="flex flex-col justify-center items-center gap-2">
                                    <img src={imgTwo} />
                                    <h1>Auto</h1>
                                </div>
                                <div className="flex flex-col justify-center items-center gap-2">
                                    <img src={imgThree} />
                                    <h1>4 Person</h1>
                                </div>
                                <div className="flex flex-col justify-center items-center gap-2">
                                    <img src={imgFour} />
                                    <h1>Electric</h1>
                                </div>
                            </div>
                            <div className="flex flex-row gap-5">
                                <div className="text-[15px] font-[700]">
                                    <h1>
                                        89.00{" "}
                                        <span className="text-[9px] font-[600] text-[#00000080]">
                                            / day
                                        </span>
                                    </h1>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="size-[23px] rounded-[4px] border-[1.5px] border-[#0955AC] flex justify-center items-center">
                                        <img src={heartB} />
                                    </div>
                                    <button className="w-[65px] h-[23px] rounded-[4px] bg-[#0955AC] bebas-neue text-[9px] text-[#FFFFFF] font-[400]">
                                        more details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3rd one */}
                <div className="flex flex-col md:flex-row gap-5 py-[30px]">
                    <img src={miniCar} />
                    <div>
                        <h1 className="bebas-neue text-[15px]">
                            Lamborghini{" "}
                            <span className="text-[#0955AC]">urus</span> (2020)
                        </h1>
                        <div className="flex flex-col">
                            <div className="flex flex-row justify-center items-center gap-6 py-4 text-[9px] text-[#00000040]">
                                <div className="flex flex-col justify-center items-center gap-2">
                                    <img src={imgOne} />
                                    <h1>4,000</h1>
                                </div>

                                <div className="flex flex-col justify-center items-center gap-2">
                                    <img src={imgTwo} />
                                    <h1>Auto</h1>
                                </div>
                                <div className="flex flex-col justify-center items-center gap-2">
                                    <img src={imgThree} />
                                    <h1>4 Person</h1>
                                </div>
                                <div className="flex flex-col justify-center items-center gap-2">
                                    <img src={imgFour} />
                                    <h1>Electric</h1>
                                </div>
                            </div>
                            <div className="flex flex-row gap-5">
                                <div className="text-[15px] font-[700]">
                                    <h1>
                                        89.00{" "}
                                        <span className="text-[9px] font-[600] text-[#00000080]">
                                            / day
                                        </span>
                                    </h1>
                                </div>
                                <div className="flex flex-row gap-2">
                                    <div className="size-[23px] rounded-[4px] border-[1.5px] border-[#0955AC] flex justify-center items-center">
                                        <img src={heartB} />
                                    </div>
                                    <button className="w-[65px] h-[23px] rounded-[4px] bg-[#0955AC] bebas-neue text-[9px] text-[#FFFFFF] font-[400]">
                                        more details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Suggestions;
