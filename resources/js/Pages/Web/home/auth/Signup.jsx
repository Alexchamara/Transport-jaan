import React, { useState } from "react";
import { useForm } from '@inertiajs/react';
import bg from "../../assets/landingPages/bg.svg";
import CompanyLogo from "../../components/CompanyLogo";
import google from "../../assets/auth/google.svg";
import { Eye, EyeOff } from "lucide-react";

const Signup = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('signin'), {
            onFinish: () => {
                // Reset form
                setData('password', '');
            },
        });
    };
    return (
        <div className="bg-[#000000] text-[#FFFFFF] poppins min-h-screen">
            <div className="flex relative justify-center items-center xl:py-10 xl:px-20 px-5 poppins">
                <h1
                    className="absolute md:top-[30px] top-[10px] md:text-[31px] text-[20px] font-[700] poppins uppercase cursor-pointer"
                    onClick={() => (window.location.href = "/")}
                >
                    <CompanyLogo className="h-[100px] object-contain" fallbackClassName="md:text-[31px] text-[20px] font-[700] poppins uppercase" />
                </h1>

                <div
                    className="min-h-screen w-full bg-cover bg-center bg-no-repeat py-[100px] xl:px-20 flex justify-center items-center bg-gradient-to-br from-gray-900 to-black"
                    style={{ backgroundImage: `url(${bg})` }}
                >
                    <div
                        className="xl:w-[548px] bg-white/5 rounded-[30px] backdrop-blur-lg px-5 md:px-10 py-10 flex flex-col items-center relative"
                        style={{
                            boxShadow: "4px 4px 4px 0px rgba(0, 0, 0, 0.25)",
                        }}
                    >
                        <h1 className="xl:text-[25px] text-[22px] font-[700]">
                            Welcome Back !
                        </h1>
                        <p className="xl:text-[14px] text-[10px] font-[600] text-center py-5">
                            Kindly fill in your details below to create an
                            account
                        </p>
                        <form onSubmit={handleSubmit} className="flex flex-col items-center w-full">
                            <div className="flex flex-col gap-0 py-5 w-full items-center">
                                {/* username */}
                                <div className="flex flex-col gap-2 mb-6 w-full">
                                    <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-2 xl:px-10">
                                        Email Address
                                    </label>
                                    <div className="w-full xl:h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center xl:px-12 px-3 py-2">
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            className="w-full xl:text-[14px] text-[10px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none"
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
                                <div className="flex flex-col gap-2 mb-6 w-full">
                                    <label className="text-[14px] text-[#FFFFFFB2] font-[500] xl:px-10 px-2">
                                        Password
                                    </label>
                                    <div className="w-full xl:h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center xl:px-10 px-3 py-2">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={data.password}
                                            onChange={e => setData('password', e.target.value)}
                                            className="w-full xl:text-[14px] text-[10px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none"
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="cursor-pointer text-white/80 hover:text-white"
                                            aria-label="Toggle password visibility"
                                        >
                                            {showPassword ? (
                                                <Eye className="w-4 h-4 xl:w-5 xl:h-5" />
                                            ) : (
                                                <EyeOff className="w-4 h-4 xl:w-5 xl:h-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <div className="text-red-500 text-sm px-10 mt-1 max-md:px-4 max-md:text-xs">
                                            {errors.password}
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-2 xl:px-10 px-3 mt-10 xl:mt-0">
                                        <label className="flex items-center gap-2 xl:text-[12px] text-[10px] font-[500] text-[#FFFFFFB2]">
                                            <input
                                                type="checkbox"
                                                checked={data.remember}
                                                onChange={e => setData('remember', e.target.checked)}
                                                className="xlsize-4 size-3 accent-[#2E6099]"
                                            />
                                            Remember me on this device
                                        </label>
                                        <span className="xl:text-[12px] text-[10px] font-[500] text-right cursor-pointer">
                                            Forgot Password?
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                type="submit"
                                disabled={processing}
                                className="xl:w-[397px] w-full xl:h-[56px] bg-[#2E6099] rounded-[100px] xl:text-[16px] text-[12px] font-[600] flex justify-center items-center cursor-pointer disabled:opacity-50 px-6 py-2"
                            >
                                {processing ? 'Logging in...' : 'signin'}
                            </button>
                        </form>

                        <h1 className="xl:text-[12px] text-[10px] font-[500] mt-5">
                            If you don't have an account?{" "}
                            <span
                                className="xl:text-[12px] text-[10px] text-[#FF7003] font-[600] cursor-pointer pl-2"
                                onClick={() =>
                                    (window.location.href = "/signup")
                                }
                            >
                                Sign up
                            </span>{" "}
                        </h1>

                        <div className="flex flex-row gap-5 justify-center items-center py-10">
                            <div className="xl:w-[174px] w-[20px] h-[1px] bg-[#FFFFFF80]" />
                            <h1 className="xl:text-[12px] text-[10px] font-[500]">or</h1>
                            <div className="xl:w-[174px] w-[20px] h-[1px] bg-[#FFFFFF80]" />
                        </div>

                        <div className="xl:w-[397px] w-full xl:h-[56px] border-[1.5px] border-[#0955AC] rounded-[100px] xl:text-[16px] text-[12px] font-[600] flex flex-row gap-2 xl:gap-5 justify-center items-center cursor-pointer px-4 py-2">
                            <img src={google} className="size-3 xl:size-auto" />
                            <h1>Continue with Google</h1>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
