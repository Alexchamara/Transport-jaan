import React from "react";
import image1 from "../../assets/multiModel/aboutus/image1.png";
import image2 from "../../assets/multiModel/aboutus/image2.png";

const AboutUs = () => {
    return (
        <div className="flex flex-col justify-center items-center">
            <div className="max-w-[1400px] w-full grid grid-cols-1 xl:grid-cols-2 p-10">
                {/* left section */}
                <div className="flex flex-row justify-center items-start order-2 xl:order-1">
                    <div>
                        <img
                            src={image1}
                            className="lg:w-[379px] lg:h-[526px]"
                        />
                    </div>

                    <div className="-ml-[173px] mt-[220px] hidden md:block">
                        <img
                            src={image2}
                            className="lg:w-[345px] lg:h-[492px]"
                        />
                    </div>
                </div>

                {/* right section */}
                <div className="py-10 lg:py-0 order-1 xl:order-2">
                    <h1 className="figtree font-[700] text-[30px] text-[#0955AC]">
                        About Us
                    </h1>
                    <h1 className="bebas-neue text-[59px]/[57px] font-[400] mt-5">
                        From Destinations to Experiences
                    </h1>
                    <p className="text-[16px]/[33px] text-justify poppins mt-10">
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
                    <p className="text-[16px]/[33px] text-justify poppins mt-5">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Donec semper eu risus ut ornare. In bibendum tempus
                        sapien, tristique consectetur purus pellentesque ac.
                        Quisque facilisis laoreet feugiat.{" "}
                    </p>

                    <div className="flex md:flex-row flex-col justify-between px-10 mt-14">
                        <div className="flex flex-col justify-center items-center">
                            <h1 className="bebas-neue text-[50px]/[70px] font-[400]">
                                120K+
                            </h1>
                            <h1 className="text-[14px]/[33px] font-[500] poppins">
                                Happy Travellers
                            </h1>
                        </div>
                        <div className="flex flex-col justify-center items-center">
                            <h1 className="bebas-neue text-[50px]/[70px] font-[400]">
                                500+
                            </h1>
                            <h1 className="text-[14px]/[33px] font-[500] poppins">
                                Transport Patners
                            </h1>
                        </div>
                        <div className="flex flex-col justify-center items-center">
                            <h1 className="bebas-neue text-[50px]/[70px] font-[400]">
                                25
                            </h1>
                            <h1 className="text-[14px]/[33px] font-[500] poppins">
                                Cities Crowded
                            </h1>
                        </div>
                        <div className="flex flex-col justify-center items-center">
                            <h1 className="bebas-neue text-[50px]/[70px] font-[400]">
                                99%
                            </h1>
                            <h1 className="text-[14px]/[33px] font-[500] poppins">
                                Satisfaction Rate
                            </h1>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
