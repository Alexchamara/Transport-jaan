import React from "react";
import truckIcon from "../../assets/courierService/truckIcon.png";
import secIcon from "../../assets/courierService/secIcon.png";
import headphoneIcon from "../../assets/courierService/headphoneIcon.png";

import dDoor from "../../assets/courierService/dDoor.png";

const WhyOurService = () => {
    return (
        <div className="bg-[#E7E7E7] py-10 px-20">
            <div className="flex flex-col justify-center items-center">
                <h1 className="bebas-neue font-[400] text-[40px] py-20 px-5">
                    Why <span className="text-[#0955AC]"> should </span> you{" "}
                    <span className="text-[#0955AC]">choose </span> our{" "}
                    <span className="text-[#0955AC]">service</span>
                </h1>
{/* All three cards - Responsive Layout */}
{/* Removed global px-4 for full mobile screen width */}
<div className="w-full flex flex-col md:flex-row md:gap-10 gap-8 justify-center items-center poppins mt-10">

  {/* Card 1 */}
  {/* Added back px-4 for internal padding on mobile */}
  <div className="w-full md:w-[360px] min-h-[430px] border border-[#0955AC] bg-[#F5F5F5] rounded-[8px] py-8 px-6 md:px-6 flex flex-col items-center">
    <div className="flex items-center gap-4">
      <div className="size-[50px] xl:size-[60px] bg-[#0955AC] rounded-full flex justify-center items-center">
        <img src={truckIcon} className="w-[26px] h-[26px]" />
      </div>
      <h1 className="bebas-neue text-[20px] leading-[28px] md:text-[26px] md:leading-[36px] xl:text-[31px] xl:leading-[40px] font-[400]">
        Transport Pricing
      </h1>
    </div>

    {/* MODIFIED: Set text alignment to text-justify */}
    <p className="mt-4 text-justify text-[12px] leading-[20px] xl:text-[14px] xl:leading-[24px]">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper
      eu risus ut ornare. In bibendum tempus sapien, tristique consectetur
      purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus
      volutpat ex, eget iaculis nunc tincidunt sit amet. Quisque congue
      sapien nec aliquet faucibus. Morbi lectus eros, accumsan eget malesuada
      et, fermentum eget nisl. Fusce vel placerat libero. Integer convallis
      sodales libero, vitae tristique massa hendrerit in.
    </p>
  </div>

  {/* Card 2 */}
  {/* Added back px-4 for internal padding on mobile */}
  <div className="w-full md:w-[360px] min-h-[430px] border border-[#0955AC] bg-white rounded-[8px] py-8 px-6 md:px-6 flex flex-col items-center">
    <div className="flex items-center gap-4">
      <div className="size-[50px] xl:size-[60px] bg-[#0955AC] rounded-full flex justify-center items-center">
        <img src={secIcon} className="w-[26px] h-[26px]" />
      </div>
      <h1 className="bebas-neue text-[20px] leading-[28px] md:text-[26px] md:leading-[36px] xl:text-[31px] xl:leading-[40px] font-[400]">
        Security for Package
      </h1>
    </div>

    {/* MODIFIED: Set text alignment to text-justify */}
    <p className="mt-4 text-justify text-[12px] leading-[20px] xl:text-[14px] xl:leading-[24px]">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper
      eu risus ut ornare. In bibendum tempus sapien, tristique consectetur
      purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus
      volutpat ex, eget iaculis nunc tincidunt sit amet. Quisque congue
      sapien nec aliquet faucibus. Morbi lectus eros, accumsan eget malesuada
      et, fermentum eget nisl. Fusce vel placerat libero. Integer convallis
      sodales libero, vitae tristique massa hendrerit in.
    </p>
  </div>

  {/* Card 3 */}
  {/* Added back px-4 for internal padding on mobile */}
  <div className="w-full md:w-[360px] min-h-[430px] border border-[#0955AC] bg-white rounded-[8px] py-8 px-6 md:px-6 flex flex-col items-center">
    <div className="flex items-center gap-4">
      <div className="size-[50px] xl:size-[60px] bg-[#0955AC] rounded-full flex justify-center items-center">
        <img src={headphoneIcon} className="w-[26px] h-[26px]" />
      </div>
      <h1 className="bebas-neue text-[20px] leading-[28px] md:text-[26px] md:leading-[36px] xl:text-[30px] xl:leading-[40px] font-[400]">
        Customer Service 24/7
      </h1>
    </div>

    {/* MODIFIED: Set text alignment to text-justify */}
    <p className="mt-4 text-justify text-[12px] leading-[20px] xl:text-[14px] xl:leading-[24px]">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper
      eu risus ut ornare. In bibendum tempus sapien, tristique consectetur
      purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus
      volutpat ex, eget iaculis nunc tincidunt sit amet. Quisque congue
      sapien nec aliquet faucibus. Morbi lectus eros, accumsan eget malesuada
      et, fermentum eget nisl. Fusce vel placerat libero. Integer convallis
      sodales libero, vitae tristique massa hendrerit in.
    </p>
  </div>

</div>

                <div className="flex flex-row justify-center items-center py-20 gap-12 xl:gap-28">
                    <img className="hidden md:block" src={dDoor} />

                    <div className="poppins text-[14px]/[33px] font-[400] text-justify">
                        <h1 className="bebas-neue text-[40px]/[58px]">
                            our{" "}
                            <span className="text-[#0955AC]">
                                delivery service
                            </span>{" "}
                            at your{" "}
                            <span className="text-[#0955AC]">doorstep</span>{" "}
                        </h1>
                        <p className="py-10 xl:w-[538px]">
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Donec semper eu risus ut ornare. In bibendum
                            tempus sapien, tristique consectetur purus
                            pellentesque ac. Quisque facilisis laoreet feugiat.
                            Sed dapibus volutpat ex, eget iaculis nunc tincidunt
                            sit amet. Quisque congue sapien nec aliquet
                            faucibus. Morbi lectus eros, accumsan eget malesuada
                            et, fermentum eget nisl. Fusce vel placerat libero.
                            Integer convallis sodales libero, vitae tristique
                            massa hendrerit in.
                        </p>
                        <button className="poppins border-[2px] border-[#0955AC] bg-[#0955AC] w-[222px] h-[45px] rounded-[9px] text-[15px] font-[700] text-[#FFFFFF] cursor-pointer">
                            LEARN MORE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhyOurService;
