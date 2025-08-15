import React, { useState } from "react";
import bg from "../../assets/landingPages/bg.svg";
import proPic1 from "../../assets/auth/proPic1.svg";
import proPic2 from "../../assets/auth/proPic2.svg";
import proPic3 from "../../assets/auth/proPic3.svg";
import { router } from '@inertiajs/react';

const Signin = () => {
    const [selectedRole, setSelectedRole] = useState(null);
    return (
        <div className="bg-[#000000] text-[#FFFFFF] poppins">
            <div className="flex relative justify-center items-center md:py-10 md:px-20 px-10 poppins">
                <h1
                    className="absolute md:top-[30px] top-[10px] md:text-[31px] text-[20px] font-[700] poppins uppercase cursor-pointer"
                    onClick={() => router.visit('/')}
                >
                    Company Logo
                </h1>

                <div
                    className="h-screen w-full bg-cover bg-center py-[100px] px-10 xl:px-20 flex justify-center items-center"
                    style={{ backgroundImage: `url(${bg})` }}
                >
                    <div
                        className="w-[548px] h-[500px] bg-white/5 rounded-[30px] backdrop-blur-sm px-10 py-20 flex flex-col items-center relative"
                        style={{
                            boxShadow: "4px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                        }}
                    >
                        <h1 className="text-[25px] font-[700]">
                            Who are you today?
                        </h1>
                        <p className="text-[13px] font-[600] py-5">
                            Choose how you want to use the platform.
                        </p>

                        <div>
                            {/* client */}
                            <div
                                className="w-[426px] h-[74px] border-[0.7px] border-[#FFFFFFBF] rounded-[9px] my-10 flex flex-row gap-5 justify-between px-5 py-5 cursor-pointer"
                                onClick={() => {
                                    router.visit('/registerNew', {
                                        data: { role: 'client' }
                                    });
                                }}
                            >
                                <div className="flex flex-row gap-5 justify-center items-start">
                                    <div className="flex flex-row items-center">
                                        <img src={proPic1} className="-mr-4" />
                                        <img src={proPic2} className="z-[50]" />
                                        <img src={proPic3} className="-ml-4" />
                                    </div>
                                    <div className="flex flex-col justify-between">
                                        <h1 className="text-[14px] font-[700]">
                                            I’m a client{" "}
                                        </h1>
                                        <h1 className="text-[14px] font-[400]">
                                            I’m a client looking for a service.
                                        </h1>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    className="size-[16px] rounded-full border-[0.5px] border-[#FFFFFFA8] bg-transparent focus:outline-none focus:ring-0 focus:border-none"
                                />
                            </div>

                            {/* vendor */}
                            <div
                                className="w-[426px] h-[74px] border-[0.7px] border-[#FFFFFFBF] rounded-[9px] my-10 flex flex-row gap-5 justify-between px-5 py-5 cursor-pointer"
                                onClick={() => {
                                    router.visit('/registerNew', {
                                        data: { role: 'vendor' }
                                    });
                                }}
                            >
                                <div className="flex flex-row gap-5 justify-center items-start">
                                    <div className="flex flex-row items-center">
                                        <img src={proPic1} className="-mr-4" />
                                        <img src={proPic2} className="z-[50]" />
                                        <img src={proPic3} className="-ml-4" />
                                    </div>
                                    <div className="flex flex-col justify-between">
                                        <h1 className="text-[14px] font-[700]">
                                            I’m a vendor{" "}
                                        </h1>
                                        <h1 className="text-[14px] font-[400]">
                                            I’m a vendor offering services.
                                        </h1>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    className="size-[16px] rounded-full border-[0.5px] border-[#FFFFFFA8] bg-transparent focus:outline-none focus:ring-0 focus:border-none"
                                />
                            </div>
                        </div>

                        <h1 className="text-[12px] font-[500] absolute bottom-20">
                            Already have an account?{" "}
                            <span
                                className="text-[#FF7003] font-[600] cursor-pointer pl-2"
                                onClick={() => router.visit('/signin')}
                            >
                                Sign in
                            </span>{" "}
                        </h1>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signin;
