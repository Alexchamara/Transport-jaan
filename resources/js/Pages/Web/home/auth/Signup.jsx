import React, { useState } from "react";
import { useForm } from '@inertiajs/react';
import bg from "../../assets/landingPages/bg.svg";
import eye from "../../assets/auth/eye.svg";
import google from "../../assets/auth/google.svg";

const Signup = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => {
                // Reset form
                setData('password', '');
            },
        });
    };
    return (
        <div className="bg-[#000000] text-[#FFFFFF] poppins min-h-screen">
            <div className="flex relative justify-center items-center md:py-10 md:px-20 px-5 max-md:px-4 poppins">
                <h1
                    className="absolute md:top-[30px] top-[10px] md:text-[31px] text-[20px] font-[700] poppins uppercase cursor-pointer"
                    onClick={() => (window.location.href = "/")}
                >
                    Company Logo
                </h1>

                <div
                    className="min-h-screen w-full bg-cover bg-center bg-no-repeat py-[100px] px-10 xl:px-20 flex justify-center items-center bg-gradient-to-br from-gray-900 to-black max-md:py-[60px] max-md:px-4"
                    style={{ backgroundImage: `url(${bg})` }}
                >
                    <div
                        className="w-[548px] h-[680px] bg-white/5 rounded-[30px] backdrop-blur-lg px-10 py-10 flex flex-col items-center relative max-md:w-full max-md:h-auto max-md:px-6 max-md:py-8 max-md:rounded-[20px]"
                        style={{
                            boxShadow: "4px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                        }}
                    >
                        <h1 className="text-[25px] font-[700] max-md:text-[20px]">
                            Welcome Back !
                        </h1>
                        <p className="text-[14px] font-[600] py-5 max-md:text-[12px] max-md:py-3 max-md:text-center">
                            Kindly fill in your details below to create an
                            account
                        </p>
                        <form onSubmit={handleSubmit} className="flex flex-col items-center w-full">
                            <div className="flex flex-col gap-0 py-5">
                                {/* username */}
                                <div className="flex flex-col gap-2 mb-6">
                                    <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10 max-md:px-4 max-md:text-[12px]">
                                        Email Address
                                    </label>
                                    <div className="w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-12 py-2 max-md:w-full max-md:h-[48px] max-md:px-6">
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            className="w-full text-[14px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none max-md:text-[12px]"
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>
                                    {errors.email && (
                                        <div className="text-red-500 text-sm px-10 mt-1 max-md:px-4 max-md:text-xs">
                                            {errors.email}
                                        </div>
                                    )}
                                </div>
                                {/* password */}
                                <div className="flex flex-col gap-2 mb-6">
                                    <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10 max-md:px-4 max-md:text-[12px]">
                                        Password
                                    </label>
                                    <div className="w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-10 py-2 max-md:w-full max-md:h-[48px] max-md:px-6">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={data.password}
                                            onChange={e => setData('password', e.target.value)}
                                            className="w-full text-[14px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none max-md:text-[12px]"
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <img 
                                            src={eye} 
                                            className="cursor-pointer max-md:w-5 max-md:h-5" 
                                            onClick={() => setShowPassword(!showPassword)}
                                            alt="Toggle password visibility"
                                        />
                                    </div>
                                    {errors.password && (
                                        <div className="text-red-500 text-sm px-10 mt-1 max-md:px-4 max-md:text-xs">
                                            {errors.password}
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-2 px-10 max-md:px-4">
                                        <label className="flex items-center gap-2 text-[12px] font-[500] text-[#FFFFFFB2] max-md:text-[11px]">
                                            <input
                                                type="checkbox"
                                                checked={data.remember}
                                                onChange={e => setData('remember', e.target.checked)}
                                                className="w-4 h-4 accent-[#2E6099] max-md:w-3 max-md:h-3"
                                            />
                                            Remember me on this device
                                        </label>
                                        <span className="text-[12px] font-[500] text-right cursor-pointer max-md:text-[11px]">
                                            Forgot Password?
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                type="submit"
                                disabled={processing}
                                className="w-[397px] h-[56px] bg-[#2E6099] rounded-[100px] text-[16px] font-[600] flex justify-center items-center cursor-pointer disabled:opacity-50 px-4 py-2 max-md:w-full max-md:h-[48px] max-md:text-[14px]"
                            >
                                {processing ? 'Logging in...' : 'Login'}
                            </button>
                        </form>

                        <h1 className="text-[12px] font-[500] mt-5 max-md:text-[11px] max-md:text-center">
                            If you don't have an account?{" "}
                            <span
                                className="text-[#FF7003] font-[600] cursor-pointer pl-2"
                                onClick={() =>
                                    (window.location.href = "/signup")
                                }
                            >
                                Sign up
                            </span>{" "}
                        </h1>

                        <div className="flex flex-row gap-5 justify-center items-center py-10 max-md:py-6 max-md:gap-3">
                            <div className="w-[174px] h-[1px] bg-[#FFFFFF80] max-md:w-[100px]" />
                            <h1 className="text-[12px] font-[500] max-md:text-[11px]">or</h1>
                            <div className="w-[174px] h-[1px] bg-[#FFFFFF80] max-md:w-[100px]" />
                        </div>

                        <div className="w-[397px] h-[56px] border-[1.5px] border-[#0955AC] rounded-[100px] text-[16px] font-[600] flex flex-row gap-5 justify-center items-center cursor-pointer px-4 py-2 max-md:w-full max-md:h-[48px] max-md:text-[14px] max-md:gap-3">
                            <img src={google} className="max-md:w-5 max-md:h-5" />
                            <h1>Continue with Google</h1>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
