import React from "react";
import ship from "../../assets/freight/ship.svg";
import shipTwo from "../../assets/freight/ship2.svg";
import logo1 from "../../assets/freight/logo1.svg";
import logo2 from "../../assets/freight/logo2.svg";
import logo3 from "../../assets/freight/logo3.svg";

const AboutUs = () => {
    return (
        <div className="flex flex-row items-start justify-between relative px-20 pt-20 pb-[100px]">
            <div className="xl:block hidden">
                <img src={ship} />
                <img
                    className="xl:absolute top-[270px] left-[320px]"
                    src={shipTwo}
                />
            </div>

            <div className="poppins xl:w-[600px] flex flex-col gap-10 mt-20">
                <h1 className="figtree text-[#0955AC] text-[24px] font-[700]">
                    About Us
                </h1>
                <h1 className="bebas-neue text-[40px]/[58px] font-[400]">
                    Built on Experience, driven by result
                </h1>
                <div>
                    <p className="text-[14px]/[33px] font-[400] text-justify">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Donec semper eu risus ut ornare. In bibendum tempus
                        sapien, tristique consectetur purus pellentesque ac.
                        Quisque facilisis laoreet feugiat. Sed dapibus volutpat
                        ex, eget iaculis nunc tincidunt sit amet. Quisque congue
                        sapien nec aliquet faucibus. Morbi lectus eros, accumsan
                        eget malesuada et, fermentum eget nisl. Fusce vel
                        placerat libero. Integer convallis sodales libero, vitae
                        tristique massa hendrerit in.
                    </p>
                    <p className="text-[14px]/[33px] font-[400] text-justify">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Donec semper eu risus ut ornare. In bibendum tempus
                        sapien, tristique consectetur purus pellentesque ac.
                        Quisque facilisis laoreet feugiat.
                    </p>
                </div>
                <div className="flex flex-col md:flex-row justify-center items-center md:w-[599px] md:h-[148px] bg-[#000000] rounded-[20px] text-[#FFFFFF] font-[700] figtree px-10 py-10">
                    <div className="flex flex-row items-start justify-center gap-3 md:border-r-[1.5px] border-[#FFFFFFB2] px-10">
                        <img src={logo1} className="w-[25px] h-[33px]" />
                        <div>
                            <h1 className="text-[22px]">100+</h1>
                            <p className="text-[16px]">
                                Countries <br /> Served
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-row items-start justify-center gap-3 md:border-r-[1.5px] border-[#FFFFFFB2] px-10">
                        <img src={logo3} className="w-[25px] h-[33px]" />
                        <div>
                            <h1 className="text-[22px]">20+</h1>
                            <p className="text-[16px]">
                                Years of
                                <br /> Experience
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-row items-start justify-center gap-3 px-10">
                        <img src={logo2} lassName="w-[25px] h-[33px]" />
                        <div>
                            <h1 className="text-[22px]">1000+</h1>
                            <p className="text-[16px]">
                                Long-Term
                                <br /> Clients
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
