import React, { useState, useEffect } from "react";
import { Head, useForm, Link } from '@inertiajs/react';
import bg from "../Web/assets/landingPages/bg.svg";
import CompanyLogo from "../Web/components/CompanyLogo";

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (status) {
            setCooldown(60);
        }
    }, [status]);

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [cooldown]);

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <div className="bg-[#000000] text-[#FFFFFF] poppins min-h-screen">
            <Head title="Forgot Password" />
            <div className="flex relative justify-center items-center xl:py-10 xl:px-20 px-5 poppins">
                <Link
                    href="/"
                    className="absolute md:top-[10px] top-[10px] md:text-[31px] text-[20px] font-[700] poppins uppercase cursor-pointer z-10"
                >
                    <CompanyLogo className="h-[45px] md:h-[60px] xl:h-[100px] object-contain" fallbackClassName="md:text-[31px] text-[20px] font-[700] poppins uppercase" />
                </Link>

                <div
                    className="min-h-screen w-full bg-cover bg-center bg-no-repeat py-[100px] xl:px-20 flex justify-center items-center bg-gradient-to-br from-gray-900 to-black"
                    style={{ backgroundImage: `url(${bg})` }}
                >
                    <div
                        className="xl:w-[548px] w-full bg-white/5 rounded-[30px] backdrop-blur-lg px-5 md:px-10 py-10 flex flex-col items-center relative"
                        style={{ boxShadow: "4px 4px 4px 0px rgba(0, 0, 0, 0.25)" }}
                    >
                        <h1 className="xl:text-[25px] text-[22px] font-[700]">
                            Forgot your password?
                        </h1>
                        <p className="xl:text-[14px] text-[12px] font-[500] text-center text-[#FFFFFFB2] py-5">
                            No problem. Just let us know your email address and we will email you a password reset link that will allow you to choose a new one.
                        </p>

                        {status && (
                            <div className="mb-4 text-sm font-medium text-green-400 bg-green-400/10 px-4 py-3 rounded-lg text-center w-full">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="flex flex-col items-center w-full">
                            <div className="flex flex-col gap-0 py-5 w-full items-center">
                                <div className="flex flex-col gap-2 mb-6 w-full">
                                    <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-2 xl:px-10">
                                        Email Address
                                    </label>
                                    <div className="w-full xl:h-[56px] h-[48px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center xl:px-12 px-5 py-2">
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            className="w-full xl:text-[14px] text-[12px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 px-0"
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
                            </div>
                            
                            <button 
                                type="submit"
                                disabled={processing || cooldown > 0}
                                className="xl:w-[397px] w-full xl:h-[56px] h-[48px] bg-[#2E6099] rounded-[100px] xl:text-[16px] text-[14px] font-[600] flex justify-center items-center cursor-pointer disabled:opacity-50 px-6 py-2 transition-all hover:bg-[#3b7ac1]"
                            >
                                {cooldown > 0 
                                    ? `Resend available in ${cooldown}s` 
                                    : processing 
                                        ? 'Verifying...'
                                        : 'Email Password Reset Link'}
                            </button>
                        </form>

                        <div className="flex flex-row gap-5 justify-center items-center py-8 w-full">
                            <div className="flex-1 h-[1px] bg-[#FFFFFF80]" />
                            <h1 className="xl:text-[12px] text-[10px] font-[500] whitespace-nowrap">or return to</h1>
                            <div className="flex-1 h-[1px] bg-[#FFFFFF80]" />
                        </div>

                        <Link 
                            href="/signin"
                            className="xl:w-[397px] w-full xl:h-[56px] h-[48px] border-[1.5px] border-[#0955AC] rounded-[100px] xl:text-[16px] text-[14px] font-[600] flex flex-row gap-2 xl:gap-5 justify-center items-center cursor-pointer px-4 py-2 hover:bg-[#0955AC]/10 transition-all text-[#FFFFFF]"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
