import React, { useState, useEffect } from "react";
import { Head, useForm, Link } from '@inertiajs/react';
import bg from "../Web/assets/landingPages/bg.svg";
import CompanyLogo from "../Web/components/CompanyLogo";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [strength, setStrength] = useState({score: 0, text: '', color: ''});

    useEffect(() => {
        const p = data.password;
        let score = 0;
        if (p.length >= 8) score++;
        if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
        if (/[0-9]/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;
        
        switch (score) {
            case 0: case 1: setStrength({score, text: 'Weak', color: 'bg-red-500'}); break;
            case 2: setStrength({score, text: 'Fair', color: 'bg-yellow-500'}); break;
            case 3: setStrength({score, text: 'Good', color: 'bg-blue-500'}); break;
            case 4: setStrength({score, text: 'Strong', color: 'bg-green-500'}); break;
            default: setStrength({score: 0, text: '', color: ''});
        }
    }, [data.password]);

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="bg-[#000000] text-[#FFFFFF] poppins min-h-screen">
            <Head title="Reset Password" />
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
                            Set New Password
                        </h1>
                        <p className="xl:text-[14px] text-[12px] font-[500] text-center text-[#FFFFFFB2] py-5">
                            Please create a strong, secure password for your account.
                        </p>

                        <form onSubmit={submit} className="flex flex-col items-center w-full">
                            <div className="flex flex-col gap-0 py-5 w-full items-center">
                                {/* Email */}
                                <div className="flex flex-col gap-2 mb-6 w-full">
                                    <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-2 xl:px-10">
                                        Email Address
                                    </label>
                                    <div className="w-full xl:h-[56px] h-[48px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center xl:px-12 px-5 py-2">
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            className="w-full xl:text-[14px] text-[12px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 px-0 outline-none"
                                            placeholder="Enter your email"
                                            readOnly
                                        />
                                    </div>
                                    {errors.email && (
                                        <div className="text-red-500 text-sm px-10 mt-1 max-md:px-4 max-md:text-xs">
                                            {errors.email}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Password */}
                                <div className="flex flex-col gap-2 mb-6 w-full">
                                    <label className="text-[14px] text-[#FFFFFFB2] font-[500] xl:px-10 px-2">
                                        New Password
                                    </label>
                                    <div className="w-full xl:h-[56px] h-[48px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center xl:px-10 px-5 py-2">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={data.password}
                                            onChange={e => setData('password', e.target.value)}
                                            className="w-full xl:text-[14px] text-[12px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 px-0 outline-none"
                                            placeholder="Enter your new password"
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

                                    {data.password && (
                                        <div className="mt-2 flex items-center gap-2 xl:px-10 px-2">
                                            <div className="flex h-1 w-full overflow-hidden rounded-full bg-white/20">
                                                {[...Array(4)].map((_, i) => (
                                                    <div 
                                                        key={i} 
                                                        className={`h-full w-1/4 border-r border-black/30 last:border-0 ${i < strength.score ? strength.color : 'bg-transparent'} transition-all duration-300`} 
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[10px] text-white/70 w-12 text-right font-medium">{strength.text}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="flex flex-col gap-2 mb-6 w-full">
                                    <label className="text-[14px] text-[#FFFFFFB2] font-[500] xl:px-10 px-2">
                                        Confirm Password
                                    </label>
                                    <div className="w-full xl:h-[56px] h-[48px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center xl:px-10 px-5 py-2">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={data.password_confirmation}
                                            onChange={e => setData('password_confirmation', e.target.value)}
                                            className="w-full xl:text-[14px] text-[12px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 px-0 outline-none"
                                            placeholder="Confirm your new password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="cursor-pointer text-white/80 hover:text-white"
                                            aria-label="Toggle password visibility"
                                        >
                                            {showConfirmPassword ? (
                                                <Eye className="w-4 h-4 xl:w-5 xl:h-5" />
                                            ) : (
                                                <EyeOff className="w-4 h-4 xl:w-5 xl:h-5" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password_confirmation && (
                                        <div className="text-red-500 text-sm px-10 mt-1 max-md:px-4 max-md:text-xs">
                                            {errors.password_confirmation}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <button 
                                type="submit"
                                disabled={processing}
                                className="xl:w-[397px] w-full xl:h-[56px] h-[48px] bg-[#2E6099] rounded-[100px] xl:text-[16px] text-[14px] font-[600] flex justify-center items-center cursor-pointer disabled:opacity-50 px-6 py-2 transition-all hover:bg-[#3b7ac1]"
                            >
                                {processing ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
