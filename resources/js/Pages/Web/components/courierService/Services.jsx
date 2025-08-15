import React from "react";
import firstImg from "../../assets/courierService/1.png";
import secondImg from "../../assets/courierService/2.png";
import thirdImg from "../../assets/courierService/3.png";

const Services = () => {
    return (
        <div className="bg-[#E7E7E7] py-10 px-20">
            <div className="flex flex-col justify-center items-center">
                <h1 className="bebas-neue text-[40px]/[130%] font-[400]">
                    OUR <span className="text-[#0955AC]"> Services</span>
                </h1>
                <p className="text-center text-[14px]/[33px] pb-20 md:pb-0 px-10 md:px-0">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Donec semper eu risus ut ornare. In bibendum ,
                    <br /> tempus sapien, tristique consectetur purus
                    pellentesque ac
                </p>

                <div className="flex flex-col lg:flex-row justify-center items-center py-10 xl:gap-10 gap-10">
                    {/* Card 1 */}
                    <div className="xl:w-[378px] h-[429px] bg-[#F5F5F5] rounded-[21px] flex flex-col justify-center items-center py-10 px-5">
                        <img src={firstImg} />
                        <div className="py-5">
                            <h1 className="bebas-neue text-[#0F0F0F] text-[24px]">
                                parcel delivery
                            </h1>
                            <p className="text-[14px]/[33px] poppins text-justify">
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit. Donec semper eu risus ut
                                ornare. In bibendum tempus sapien,{" "}
                            </p>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="xl:w-[378px] h-[429px] bg-[#F5F5F5] rounded-[21px] flex flex-col justify-center items-center py-10 px-5">
                        <img src={secondImg} />
                        <div className="py-5">
                            <h1 className="bebas-neue text-[#0F0F0F] text-[24px]">
                                Logistic service
                            </h1>
                            <p className="text-[14px]/[33px] poppins text-justify">
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit. Donec semper eu risus ut
                                ornare. In bibendum tempus sapien,{" "}
                            </p>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="xl:w-[378px] h-[429px] bg-[#F5F5F5] rounded-[21px] flex flex-col justify-center items-center py-10 px-5">
                        <img src={thirdImg} />
                        <div className="py-5">
                            <h1 className="bebas-neue text-[#0F0F0F] text-[24px]">
                                warehouse
                            </h1>
                            <p className="text-[14px]/[33px] poppins text-justify">
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit. Donec semper eu risus ut
                                ornare. In bibendum tempus sapien,{" "}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Services;
