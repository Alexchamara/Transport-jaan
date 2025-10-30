import React from "react";
import bg from "../../assets/multiModel/contactus/bg.png";

const ContactUs = () => {
    return (
        <div
            className="flex flex-col justify-center items-center h-[935px] relative"
            style={{ backgroundImage: `url(${bg})` }}
        >
            <div className="w-full h-full bg-[#0000008A] absolute z-10" />

            <div className="max-w-[1400px] flex flex-col justify-center items-center p-10 relative z-20">
                <h1
                    className="bebas-neue xl:text-[100px]/[130px] text-[50px] text-center"
                    style={{
                        color: "transparent",
                        WebkitTextStroke: "1px white",
                        fontWeight: 700,
                        textTransform: "uppercase",
                    }}
                >
                    Ready to Start Your <br /> Sri Lankan Adventure?
                </h1>

                <div className="xl:w-[228px] xl:h-[56px] border-[2px] border-[#FFFFFF] rounded-[100px] flex justify-center items-center cursor-pointer text-white xl:text-[22px] text-[14px] font-[700] px-6 py-2 mt-10">Contact Us</div>
            </div>
        </div>
    );
};

export default ContactUs;
