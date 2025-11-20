import React, { useState } from "react";
import { useForm, router } from "@inertiajs/react";
import bg from "../../assets/landingPages/bg.svg";
import eye from "../../assets/auth/eye.svg";
import google from "../../assets/auth/google.svg";

const Register = ({ role = "client" }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email: "",
        name: "",
        phone: "",
        password: "",
        password_confirmation: "",
        role_type: role,
        vendor_type: "",
        date_of_birth: "",
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("register.store"), {
            preserveScroll: true,
            onSuccess: () => {
                router.visit("/signin");
            },
            onError: (errors) => {
                console.log('Registration errors:', errors);
                if (errors.password) {
                    setData(data => ({
                        ...data,
                        password: '',
                        password_confirmation: ''
                    }));
                }
            },
        });
    };

    return (
        <div className="bg-[#000000] text-[#FFFFFF] poppins min-h-screen">
            <div className="flex relative justify-center items-center md:py-10 md:px-20 px-10 poppins">
                <h1
                    className="absolute md:top-[30px] top-[10px] md:text-[31px] text-[20px] font-[700] poppins uppercase cursor-pointer"
                    onClick={() => router.visit("/")}
                >
                    Company Logo
                </h1>

                <div
                    className="min-h-screen w-full bg-cover bg-center bg-no-repeat py-[100px] px-10 xl:px-20 flex justify-center items-center bg-gradient-to-br from-gray-900 to-black"
                    style={{ 
                        backgroundImage: `url(${bg})`
                    }}
                >
                    <div
                        className="w-auto h-auto bg-white/5 rounded-[30px] backdrop-blur-lg px-10 py-10 flex flex-col items-center relative"
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

                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col items-center"
                        >
                             {/* vendor type - only show for vendors */}
                                    {role === "vendor" && (
                                        <div className="flex flex-col gap-2 mb-6">
                                            <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10">
                                                Vendor Type
                                            </label>
                                            <div className="w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-12 py-2">
                                                <select
                                                    value={data.vendor_type}
                                                    onChange={(e) =>
                                                        setData(
                                                            "vendor_type",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full text-[14px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none text-white"
                                                    required
                                                >
                                                    <option value="" className="bg-gray-800 text-white">
                                                        Select vendor type
                                                    </option>
                                                    <option value="individual" className="bg-gray-800 text-white">
                                                        Individual
                                                    </option>
                                                    <option value="business" className="bg-gray-800 text-white">
                                                        Business
                                                    </option>
                                                </select>
                                            </div>
                                            {errors.vendor_type && (
                                                <div className="text-red-500 text-sm px-10 mt-1">
                                                    {errors.vendor_type}
                                                </div>
                                            )}
                                        </div>
                                    )}
                            <div className="flex flex-row gap-10 justify-center items-start">
                                <div className="flex flex-col gap-0">
                                    {/* username */}
                                    <div className="flex flex-col gap-2 mb-6">
                                        <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10">
                                            Full Name
                                        </label>
                                        <div className="w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-12 py-2">
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData(
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full text-[14px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none"
                                                placeholder="Enter your full name"
                                                required
                                            />
                                        </div>
                                        {errors.name && (
                                            <div className="text-red-500 text-sm px-10 mt-1">
                                                {errors.name}
                                            </div>
                                        )}
                                    </div>
                                    {/* phone number */}
                                    <div className="flex flex-col gap-2 mb-6">
                                        <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10">
                                            Phone Number
                                        </label>
                                        <div className="w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-12 py-2">
                                            <input
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) =>
                                                    setData(
                                                        "phone",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full text-[14px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none"
                                                placeholder="Enter your phone number"
                                                required
                                            />
                                        </div>
                                        {errors.phone && (
                                            <div className="text-red-500 text-sm px-10 mt-1">
                                                {errors.phone}
                                            </div>
                                        )}
                                    </div>

                                    {/* password */}
                                    <div className="flex flex-col gap-2 mb-6">
                                        <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10">
                                            Password
                                        </label>
                                        <div className="w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-10 py-2">
                                            <input
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={data.password}
                                                onChange={(e) =>
                                                    setData(
                                                        "password",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full text-[14px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none"
                                                placeholder="Enter your password"
                                                required
                                            />
                                            <img
                                                src={eye}
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword
                                                    )
                                                }
                                                className="cursor-pointer"
                                            />
                                        </div>
                                        {errors.password && (
                                            <div className="text-red-500 text-sm px-10 mt-1">
                                                {errors.password}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-start gap-0">
                                    {/* username */}
                                    <div className="flex flex-col gap-2 mb-6">
                                        <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10">
                                            Email Address
                                        </label>
                                        <div className="w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-12 py-2">
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) =>
                                                    setData(
                                                        "email",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full text-[14px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none"
                                                placeholder="Enter your email address"
                                                required
                                            />
                                        </div>
                                        {errors.email && (
                                            <div className="text-red-500 text-sm px-10 mt-1">
                                                {errors.email}
                                            </div>
                                        )}
                                    </div>

                                    {/* date of birth */}
                                    <div className="flex flex-col gap-2 mb-6">
                                        <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10">
                                            Date of Birth
                                        </label>
                                        <div className="w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-12 py-2">
                                            <input
                                                type="date"
                                                value={data.date_of_birth}
                                                onChange={(e) =>
                                                    setData(
                                                        "date_of_birth",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full text-[14px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none"
                                                required
                                            />
                                        </div>
                                        {errors.date_of_birth && (
                                            <div className="text-red-500 text-sm px-10 mt-1">
                                                {errors.date_of_birth}
                                            </div>
                                        )}
                                    </div>

                                   

                                    {/* password */}
                                    <div className="flex flex-col gap-2 mb-6">
                                        <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10">
                                            Confirm Password
                                        </label>
                                        <div className="w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-10 py-2">
                                            <input
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={
                                                    data.password_confirmation
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        "password_confirmation",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full text-[14px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none"
                                                placeholder="Confirm your password"
                                                required
                                            />
                                            <img
                                                src={eye}
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        !showConfirmPassword
                                                    )
                                                }
                                                className="cursor-pointer"
                                            />
                                        </div>
                                        {errors.password_confirmation && (
                                            <div className="text-red-500 text-sm px-10 mt-1">
                                                {errors.password_confirmation}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 self-start px-10 mt-4">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData("remember", e.target.checked)}
                                    className="w-4 h-4 accent-[#2E6099] cursor-pointer"
                                />
                                <span className="text-[12px] md:text-[13px] font-[500] text-[#FFFFFFB2]">
                                    Remember me on this device
                                </span>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-[397px] h-[56px] bg-[#2E6099] rounded-[100px] text-[16px] font-[600] flex justify-center items-center cursor-pointer mt-10 disabled:opacity-50"
                            >
                                {processing
                                    ? "Creating Account..."
                                    : "Register"}
                            </button>

                            <h1 className="text-[12px] font-[500] mt-5">
                                Already have an account?{" "}
                                <span
                                    className="text-[#FF7003] font-[600] cursor-pointer pl-2"
                                    onClick={() => router.visit("/signin")}
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
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
