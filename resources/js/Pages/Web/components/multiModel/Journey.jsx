import React from "react";
import bg from "../../assets/multiModel/journey/bg.png";

import img1 from "../../assets/multiModel/journey/img1.png";
import img2 from "../../assets/multiModel/journey/img2.png";
import img3 from "../../assets/multiModel/journey/img3.png";

const Journey = () => {
    return (
        <div className="flex flex-col justify-center items-center py-20">
            <div
                className="relative max-w-[1440px] w-full h-auto flex flex-col justify-start items-center pt-20"
                style={{
                    backgroundImage: `url(${bg})`,
                    backgroundRepeat: "no-repeat",
                }}
            >
                <div className="max-w-[1200px] w-full px-5 xl:px-0">
                    <h1 className="bebas-neue text-[60px]/[58px] font-[400] text-white">
                        Feel the Journey Before You Begin
                    </h1>
                    <p className="text-[16px]/[33px] font-[600] poppins text-white max-w-[863px] text-justify mt-5">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Donec semper eu risus ut ornare. In bibendum tempus
                        sapien, tristique consectetur purus pellentesque ac.
                        Quisque facilisis laoreet feugiat. Sed dapibus volutpat
                        ex, eget iaculis nunc tincidunt sit amet. Quisque{" "}
                    </p>

                    <div className="mt-40 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* card 1 */}
                        <div className="max-w-[429px] xl:h-[559px] shadow-lg rounded-[20px] flex flex-col justify-between items-center bg-white p-5 figtree">
                            <img src={img1} className="w-full" />
                            <h1 className="text-start w-full text-[20px] font-[700] mt-5">
                                Scenic Train Routes
                            </h1>
                            <p className="text-[12px] text-justify font-[400]/[23px] poppins mt-5">
                                Experience Sri Lanka’s breathtaking landscapes
                                through winding mountain tracks, misty tea
                                estates. Every journey feels like a moving
                                postcard of the island’s natural beauty.
                            </p>
                            <div className="flex flex-row justify-between items-center w-full mt-3">
                                <h1 className="text-[22px] font-[700]">
                                    From $15
                                </h1>
                                <div className="border-[1px] border-[#0955AC] rounded-[100px] text-[#0955AC] text-[16px] font-[700] px-4 py-2 cursor-pointer">
                                    Book Now
                                </div>
                            </div>
                        </div>

                        {/* card 2  */}
                        <div className="max-w-[429px] xl:h-[559px] shadow-xl rounded-[20px] flex flex-col justify-between items-center bg-white p-5 figtree">
                            <img src={img2} className="w-full" />
                            <h1 className="text-start w-full text-[20px] font-[700] mt-5">
                                Local Tuk-Tuks
                            </h1>
                            <p className="text-[12px] text-justify font-[400]/[23px] poppins mt-5">
                                Hop into a colorful tuk tuk and explore cities
                                like a local! Quick, fun, and full of character
                                — it’s the most authentic way to feel the pulse
                                of Sri Lanka’s streets.
                            </p>
                            <div className="flex flex-row justify-between items-center w-full mt-3">
                                <h1 className="text-[22px] font-[700]">
                                    From $15
                                </h1>
                                <div className="border-[1px] border-[#0955AC] rounded-[100px] text-[#0955AC] text-[16px] font-[700] px-4 py-2 cursor-pointer">
                                    Book Now
                                </div>
                            </div>
                        </div>

                        {/* card 3  */}
                        <div className="max-w-[429px] xl:h-[559px] shadow-lg rounded-[20px] flex flex-col justify-between items-center bg-white p-5 figtree">
                            <img src={img3} className="w-full" />
                            <h1 className="text-start w-full text-[20px] font-[700] mt-5">
                                Private Taxi
                            </h1>
                            <p className="text-[12px] text-justify font-[400]/[23px] poppins mt-5">
                                Enjoy comfort and convenience with private taxis
                                that take you anywhere, anytime. Perfect for
                                personalized trips, airport transfers, or
                                exploring hidden gems at your own pace.
                            </p>
                            <div className="flex flex-row justify-between items-center w-full mt-3">
                                <h1 className="text-[22px] font-[700]">
                                    From $15
                                </h1>
                                <div className="border-[1px] border-[#0955AC] rounded-[100px] text-[#0955AC] text-[16px] font-[700] px-4 py-2 cursor-pointer">
                                    Book Now
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Journey;
