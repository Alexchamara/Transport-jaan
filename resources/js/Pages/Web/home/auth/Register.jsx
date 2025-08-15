import React from "react";
import bg from "../../assets/landingPages/bg.svg";
import eye from "../../assets/auth/eye.svg";
import google from "../../assets/auth/google.svg";

const Register = () => {
    return (
        <div className="bg-[#000000] text-[#FFFFFF] poppins">
            <div className="flex relative justify-center items-center md:py-10 md:px-20 px-10 poppins">
                <h1
                    className="absolute md:top-[30px] top-[10px] md:text-[31px] text-[20px] font-[700] poppins uppercase cursor-pointer"
                    onClick={() => (window.location.href = "/")}
                >
                    Company Logo
                </h1>

                <div
                    className="h-screen w-full bg-cover bg-center py-[100px] px-10 xl:px-20 flex justify-center items-center"
                    style={{ backgroundImage: `url(${bg})` }}
                >
                    <div
                        className="w-auto h-auto bg-white/5 rounded-[30px] backdrop-blur-sm px-10 py-10 flex flex-col items-center relative mt-20"
                        style={{
                            boxShadow: "4px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                        }}
                    >
                        <h1 className="text-[25px] font-[700]">
                            Create an new account
                        </h1>
                        <p className="text-[14px] font-[600] py-5">
                            Kindly fill in your details below to create an
                            account
                        </p>

                        <div className="flex flex-row gap-10 justify-center items-center">
                            <div className="flex flex-col gap-5">
                                {/* username */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10">
                                        Email Address
                                    </label>
                                    <div className="w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-12 py-2">
                                        <input
                                            type="text"
                                            className="w-full text-[14px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none"
                                        />
                                    </div>
                                </div>
                                {/* phone number */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10">
                                        Phone Number
                                    </label>
                                    <div className="w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-12 py-2">
                                        <input
                                            type="number"
                                            className="w-full text-[14px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none"
                                        />
                                    </div>
                                </div>

                                {/* password */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10">
                                        Password
                                    </label>
                                    <div className="w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-10 py-2">
                                        <input
                                            type="password"
                                            className="w-full text-[14px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none"
                                        />
                                        <img
                                            src={eye}
                                            className="cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center gap-5">
                                {/* username */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10">
                                        Email Address
                                    </label>
                                    <div className="w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-12 py-2">
                                        <input
                                            type="text"
                                            className="w-full text-[14px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none"
                                        />
                                    </div>
                                </div>

                                {/* phone number */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10">
                                        Date of Birth
                                    </label>
                                    <div className="w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-12 py-2">
                                        <input
                                            type="date"
                                            className="w-full text-[14px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none"
                                        />
                                    </div>
                                </div>

                                {/* password */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10">
                                        Confirm Password
                                    </label>
                                    <div className="w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-10 py-2">
                                        <input
                                            type="password"
                                            className="w-full text-[14px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none"
                                        />
                                        <img
                                            src={eye}
                                            className="cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-[397px] h-[56px] bg-[#2E6099] rounded-[100px] text-[16px] font-[600] flex justify-center items-center cursor-pointer mt-10">
                            Register
                        </div>

                        <h1 className="text-[12px] font-[500] mt-5">
                            Already have an account?{" "}
                            <span
                                className="text-[#FF7003] font-[600] cursor-pointer pl-2"
                                onClick={() =>
                                    (window.location.href = "/signin")
                                }
                            >
                                Sign in
                            </span>{" "}
                        </h1>

                        <div className="flex flex-row gap-5 justify-center items-center py-10">
                            <div className="w-[174px] h-[1px] bg-[#FFFFFF80]" />
                            <h1 className="text-[12px] font-[500]">or</h1>
                            <div className="w-[174px] h-[1px] bg-[#FFFFFF80]" />
                        </div>

                        <div className="w-[397px] h-[56px] border-[1.5px] border-[#0955AC] rounded-[100px] text-[16px] font-[600] flex flex-row gap-5 justify-center items-center cursor-pointer">
                            <img src={google} />
                            <h1>Continue with Google</h1>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
