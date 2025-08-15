import React from "react";
import linkedin from "../assets/landingPages/in.svg";
import fb from "../assets/landingPages/fb.svg";
import twitter from "../assets/landingPages/twitter.svg";

const FooterTwo = () => {
    const currentYear = new Date().getFullYear();

    return (
        <div className="md:px-20 px-10 py-10">
            <div className="relative border-t-[1px] border-b-[2px] flex flex-col items-center justify-center py-20">
                <h1 className="text-[25px] font-[700] uppercase">
                    Company Logo{" "}
                </h1>
                <div className="mt-40 flex flex-col justify-center items-center">
                    <h1 className="text-[50px] font-[700] uppercase">
                        Your journey starts here{" "}
                    </h1>
                    <p className="text-[15px] font-[500] md:-pb-40 pb-80">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Donec semper eu risus ut ornare. In.Lorem{" "}
                    </p>

                    <div className="flex flex-col gap-5 absolute right-0 top-40 md:pb-10">
                        <div className="size-[35px] rounded-full border-[1.5px] border-[#FF7003] flex justify-center items-center cursor-pointer">
                            <img src={linkedin} />
                        </div>
                        <div className="size-[35px] rounded-full border-[1.5px] border-[#FF7003] flex justify-center items-center cursor-pointer">
                            <img src={fb} />
                        </div>
                        <div className="size-[35px] rounded-full border-[1.5px] border-[#FF7003] flex justify-center items-center cursor-pointer">
                            <img src={twitter} />
                        </div>
                    </div>

                    <div className="absolute bottom-5 left-0 md:left-1/2 md:-translate-x-1/2 flex md:flex-row flex-col gap-10 text-[17px]">
                        <h1 className="cursor-pointer">Home</h1>
                        <h1 className="cursor-pointer">About Us</h1>
                        <h1 className="cursor-pointer">Services</h1>
                        <h1 className="cursor-pointer">Blog</h1>
                        <h1 className="cursor-pointer">Contact Us</h1>
                    </div>
                </div>
            </div>

            <div className=" flex flex-row justify-between items-center mt-5 md:text-[17px] text-[12px] font-[400]">
                <h1>
                    © {currentYear} JAAN Network (Pvt) Ltd. | All rights
                    reserved.
                </h1>
                <div className="flex flex-row gap-10">
                    <h1>Privacy Policy </h1>
                    <h1>Terms of Service</h1>
                </div>
            </div>
        </div>
    );
};

export default FooterTwo;
