import React from "react";
import ship3 from "../../assets/freight/ship3.svg";
const why = () => {
    return (
        <div className="flex flex-col xl:flex-row gap-10 justify-between items-center xl:items-start p-5 xl:px-20 xl:py-20">
            <div className="xl:w-[725px] text-center xl:text-justify">
                <h1 className="figtree text-[24px] font-[700] text-[#0955AC]">
                    Why Choose Us
                </h1>
                <h1 className="bebas-neue text-[40px] font-[400]">
                    Trusted global business for a reason
                </h1>
                <p className="text-[14px]/[33px]">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Donec semper eu risus ut ornare. In bibendum tempus sapien,
                    tristique consectetur purus pellentesque ac. Quisque
                    facilisis laoreet feugiat. Sed dapibus volutpat ex, eget
                    iaculis nunc tincidunt sit amet. Quisque congue sapien nec
                    aliquet faucibus. Morbi lectus eros, accumsan eget malesuada
                    et, fermentum eget nisl. Fusce vel placerat libero. Integer
                    convallis sodales libero, vitae tristique massa hendrerit
                    in.
                </p>
                <div className="poppins text-[14px]/[33px] flex flex-col gap-5 items-end justify-center py-10">
                    <div>
                        <h1 className="font-[700] text-[#0955AC]">
                            01. On-Time, every time
                        </h1>
                        <p className="font-[400] xl:w-[674px]">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Donec semper eu risus ut ornare. In bibendum
                            tempus sapien, tristique consectetur purus
                            pellentesque ac.
                        </p>
                    </div>
                    <div>
                        <h1 className="font-[700] text-[#0955AC]">
                            01. On-Time, every time
                        </h1>
                        <p className="font-[400] xl:w-[674px]">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Donec semper eu risus ut ornare. In bibendum
                            tempus sapien, tristique consectetur purus
                            pellentesque ac.
                        </p>
                    </div>
                    <div>
                        <h1 className="font-[700] text-[#0955AC]">
                            01. On-Time, every time
                        </h1>
                        <p className="font-[400] xl:w-[674px]">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Donec semper eu risus ut ornare. In bibendum
                            tempus sapien, tristique consectetur purus
                            pellentesque ac.
                        </p>
                    </div>
                    <div>
                        <h1 className="font-[700] text-[#0955AC]">
                            01. On-Time, every time
                        </h1>
                        <p className="font-[400] xl:w-[674px]">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Donec semper eu risus ut ornare. In bibendum
                            tempus sapien, tristique consectetur purus
                            pellentesque ac.
                        </p>
                    </div>
                </div>
            </div>
            <div>
                <img src={ship3} className="xl:flex hidden w-[480px]" />
            </div>
        </div>
    );
};

export default why;
