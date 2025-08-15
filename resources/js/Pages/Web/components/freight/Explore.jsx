import React from "react";
import bg2 from "../../assets/freight/bg2.svg";
import imgCard1 from "../../assets/freight/imgCard1.svg";
import imgCard2 from "../../assets/freight/imgCard2.svg";
import imgCard3 from "../../assets/freight/imgCard3.svg";

const Explore = () => {
    return (
        <div>
            <div
                style={{
                    backgroundImage: `url(${bg2})`,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    width: "100%",
                    height: "626px",
                }}
            >
                <div className="text-[#FFFFFF] px-20 py-20">
                    <h1 className="bebas-neue text-[40px] font-[400]">
                        Explore our services
                    </h1>
                    <p className="poppins text-[14px]/[33px] font-[400] lg:w-[797px]">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Donec semper eu risus ut ornare. In bibendum tempus
                        sapien, tristique consectetur purus pellentesque ac.
                        Quisque facilisis laoreet feugiat. Sed dapibus volutpat
                        ex, eget iaculis nunc tincidunt sit amet. Quisque{" "}
                    </p>
                </div>
            </div>
            <div className="flex flex-col md:flex-row justify-center items-center gap-5 -mt-[350px] px-20 py-20">
                <div
                    className="md:w-[429px] h-[554px] bg-[#FFFFFF] rounded-[20px] flex flex-col justify-start items-center px-5 py-5"
                    style={{ boxShadow: "4px 4px 4px 0px rgba(0, 0, 0, 0.1)" }}
                >
                    <img src={imgCard1} />
                    <div className="p-5">
                        <h1 className="figtree text-[20px] font-[700]">Track Shipment</h1>
                        <p className="poppins text-[14px]/[33px]">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Donec semper eu risus ut ornare. In bibendum
                            tempus sapien, tristique{" "}
                        </p>
                    </div>
                </div>
                <div
                    className="md:w-[429px] h-[554px] bg-[#FFFFFF] rounded-[20px] flex flex-col justify-start items-center px-5 py-5"
                    style={{ boxShadow: "4px 4px 4px 0px rgba(0, 0, 0, 0.1)" }}
                >
                    <img src={imgCard2} />
                    <div className="p-5">
                        <h1 className="figtree text-[20px] font-[700]">Track Shipment</h1>
                        <p className="poppins text-[14px]/[33px]">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Donec semper eu risus ut ornare. In bibendum
                            tempus sapien, tristique{" "}
                        </p>
                    </div>
                </div>
                <div
                    className="md:w-[429px] h-[554px] bg-[#FFFFFF] rounded-[20px] flex flex-col justify-start items-center px-5 py-5"
                    style={{ boxShadow: "4px 4px 4px 0px rgba(0, 0, 0, 0.1)" }}
                >
                    <img src={imgCard3} />
                    <div className="p-5">
                        <h1 className="figtree text-[20px] font-[700]">Track Shipment</h1>
                        <p className="poppins text-[14px]/[33px]">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Donec semper eu risus ut ornare. In bibendum
                            tempus sapien, tristique{" "}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Explore;
