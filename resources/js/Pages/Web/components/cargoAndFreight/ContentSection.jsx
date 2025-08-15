import React from "react";
import imgOne from "../../assets/cargoAndFreight/imgOne.png";

const ContentSection = () => {
    return (
        <div className="px-40 py-20 flex flex-row gap-20 justify-center items-center">
            <img src={imgOne} />
            <div className="poppins flex flex-col gap-10">
                <h1 className="bebas-neue text-[40px]/[58px] font-[400]">
                    Global <span className="text-[#0955AC]">logistics</span>{" "}
                    solutions<span className="text-[#0955AC]"> provider</span>{" "}
                </h1>
                <p className="text-[14px]/[33px] font-[400] text-justify">
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
                <button className="w-[222px] h-[45px] bg-[#0955AC] border-[2px] border-[#0955AC] rounded-[9px] flex justify-center items-center text-[white] text-[15px] font-[700]">
                    <h1>LEARN MORE</h1>
                </button>
            </div>
        </div>
    );
};

export default ContentSection;
