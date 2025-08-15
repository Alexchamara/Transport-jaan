import React from "react";
import ship4 from "../../assets/freight/ship4.svg";

const ContactUs = () => {
    return (
        <div className="bg-[#0E253E]">
            <div className="flex flex-row">
                <img src={ship4} className="xl:flex hidden" />
                <div className="bebas-neue text-[#FFFFFF] text-[40px] font-[400] flex flex-col gap-5 justify-center items-start px-12 py-10">
                    <h1>ready to make your business forward?</h1>
                    <p className="poppins text-[14px]/[33px] font-[400]">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Donec semper eu risus ut ornare. In bibendum tempus
                        sapien, tristique consectetur purus pellentesque ac.
                        Quisque facilisis laoreet feugiat.{" "}
                    </p>
                    <div className="bg-[#0955AC] figtree w-[188px] h-[45px] rounded-[9px] text-[16px] font-[700] flex justify-center items-center border-[2px] border-[#0955AC] cursor-pointer">
                        CONTACT US
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
