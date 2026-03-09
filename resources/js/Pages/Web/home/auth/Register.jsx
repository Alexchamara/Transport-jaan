import React, { useState } from "react";
import { useForm, router } from "@inertiajs/react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import CompanyLogo from "../../components/CompanyLogo";
import bg from "../../assets/landingPages/bg.svg";
import google from "../../assets/auth/google.svg";
import { Eye, EyeOff } from "lucide-react";

const Register = ({ role = "client" }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [phoneValidationError, setPhoneValidationError] = useState("");

    const { data, setData, post, processing, errors } = useForm({
        email: "",
        name: "",
        phone: "",
        password: "",
        password_confirmation: "",
        role_type: role,
        vendor_type: "",
        remember: false,
    });

    // Phone validation using libphonenumber-js library
    const validatePhone = (phone) => {
        // Check if phone is empty
        if (!phone || phone.trim() === '') {
            return { valid: false, message: 'Phone number is required' };
        }

        try {
            // Add + prefix if not present for proper validation
            const phoneWithPlus = phone.startsWith('+') ? phone : '+' + phone;
            
            // Validate using libphonenumber-js
            if (!isValidPhoneNumber(phoneWithPlus)) {
                return { 
                    valid: false, 
                    message: 'Please enter a valid phone number'
                };
            }

            // Parse the phone number to get more details
            const phoneNumber = parsePhoneNumber(phoneWithPlus);
            
            // Additional check to ensure it's a valid mobile/fixed line
            if (!phoneNumber.isValid()) {
                return { 
                    valid: false, 
                    message: 'Please enter a valid phone number'
                };
            }

            return { valid: true, message: '' };
        } catch (error) {
            return { 
                valid: false, 
                message: 'Please enter a valid phone number with country code'
            };
        }
    };

    // Phone change handler with real-time validation
    const handlePhoneChange = (phone) => {
        setData('phone', phone);
        const validation = validatePhone(phone);
        setPhoneValidationError(validation.valid ? '' : validation.message);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate phone number before submission
        const phoneValidation = validatePhone(data.phone);
        if (!phoneValidation.valid) {
            alert(phoneValidation.message);
            return;
        }
        
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
        <div className="bg-[#000000] text-[#FFFFFF] poppins h-auto">
            <div className="flex relative justify-center items-center md:py-10 md:px-20 px-0 poppins">
                <h1
                    className="absolute top-[30px] md:text-[31px] text-[20px] font-[700] poppins uppercase cursor-pointer"
                    onClick={() => router.visit("/")}
                >
                    <CompanyLogo className="h-[100px] object-contain" fallbackClassName="md:text-[31px] text-[20px] font-[700] poppins uppercase" />
                </h1>

                <div
                    className="h-auto xl:min-h-screen w-full bg-cover bg-center bg-no-repeat py-[100px] px-0 xl:px-20 flex justify-center items-center bg-gradient-to-br from-gray-900 to-black"
                    style={{ 
                        backgroundImage: `url(${bg})`
                    }}
                >
                    <div
                        className="w-auto h-auto bg-white/5 rounded-[30px] backdrop-blur-lg px-5 py-10 flex flex-col items-center relative"
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
                            <style>{`
                                .custom-phone-input {
                                    width: 100%;
                                }
                                .custom-phone-input .form-control {
                                    width: 100% !important;
                                    background: transparent !important;
                                    border: none !important;
                                    color: white !important;
                                    font-size: 14px !important;
                                    padding-left: 48px !important;
                                    height: 40px !important;
                                }
                                .custom-phone-input .form-control::placeholder {
                                    color: #9CA3AF !important;
                                }
                                .custom-phone-input .form-control:focus {
                                    outline: none !important;
                                    box-shadow: none !important;
                                }
                                .custom-phone-input .flag-dropdown {
                                    background: transparent !important;
                                    border: none !important;
                                }
                                .custom-phone-input .selected-flag {
                                    background: transparent !important;
                                    padding: 0 0 0 8px !important;
                                }
                                .custom-phone-input .selected-flag:hover,
                                .custom-phone-input .selected-flag:focus {
                                    background: transparent !important;
                                }
                            `}</style>

                            {role === "client" ? (
                                <>
                                    {/* Client Form Layout */}
                                    {/* Row 1: Client Type | Full Name */}
                                    <div className="flex flex-col lg:flex-row gap-10 justify-center items-start">
                                        <div className="flex flex-col gap-2 mb-6">
                                            <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10">
                                                Client Type
                                            </label>
                                            <div className="w-full md:w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-12 py-2">
                                                <select
                                                    value={data.vendor_type}
                                                    onChange={(e) => setData("vendor_type", e.target.value)}
                                                    className="w-full text-[14px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none text-white"
                                                    required
                                                >
                                                    <option value="" className="bg-gray-800 text-white">
                                                        Select Client type
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

                                        <div className="flex flex-col gap-2 mb-6">
                                            <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10">
                                                {data.vendor_type === "business" ? "Company Name" : "Full Name"}
                                            </label>
                                            <div className="w-full md:w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-12 py-2">
                                                <input
                                                    type="text"
                                                    value={data.name}
                                                    onChange={(e) => setData("name", e.target.value)}
                                                    className="w-full text-[14px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none"
                                                    placeholder={data.vendor_type === "business" ? "Enter your company name" : "Enter your full name"}
                                                    required
                                                />
                                            </div>
                                            {errors.name && (
                                                <div className="text-red-500 text-sm px-10 mt-1">
                                                    {errors.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Row 2: Phone Number | Email Address */}
                                    <div className="flex flex-col lg:flex-row gap-10 justify-center items-start">
                                        <div className="flex flex-col gap-2 mb-6">
                                            <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10">
                                                Phone Number
                                            </label>
                                            <div className="w-full md:w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-4 py-2">
                                                <PhoneInput
                                                    country={'lk'}
                                                    value={data.phone}
                                                    onChange={handlePhoneChange}
                                                    countryCodeEditable={false}
                                                    containerClass="custom-phone-input"
                                                    inputClass="form-control"
                                                    buttonClass="flag-dropdown"
                                                    dropdownClass="text-gray-800 bg-white"
                                                    searchClass="text-gray-800"
                                                    preferredCountries={['lk', 'in', 'us', 'gb', 'ca', 'au']}
                                                    enableSearch={true}
                                                    placeholder="Enter your phone number"
                                                />
                                            </div>
                                            {phoneValidationError && (
                                                <div className="text-red-500 text-sm px-10 mt-1">
                                                    {phoneValidationError}
                                                </div>
                                            )}
                                            {errors.phone && (
                                                <div className="text-red-500 text-sm px-10 mt-1">
                                                    {errors.phone}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2 mb-6">
                                            <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10">
                                                Email Address
                                            </label>
                                            <div className="w-full md:w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-12 py-2">
                                                <input
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData("email", e.target.value)}
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
                                    </div>

                                    {/* Row 3: Password | Confirm Password */}
                                    <div className="flex flex-col lg:flex-row gap-10 justify-center items-start">
                                        <div className="flex flex-col gap-2 mb-6">
                                            <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10">
                                                Password
                                            </label>
                                            <div className="w-full md:w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-10 py-2">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={data.password}
                                                    onChange={(e) => setData("password", e.target.value)}
                                                    className="w-full text-[14px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none"
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
                                                        <Eye className="w-5 h-5" />
                                                    ) : (
                                                        <EyeOff className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <div className="text-red-500 text-sm px-10 mt-1">
                                                    {errors.password}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2 mb-6">
                                            <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10">
                                                Confirm Password
                                            </label>
                                            <div className="w-full md:w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-10 py-2">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData("password_confirmation", e.target.value)}
                                                    className="w-full text-[14px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none"
                                                    placeholder="Confirm your password"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="cursor-pointer text-white/80 hover:text-white"
                                                    aria-label="Toggle confirm password visibility"
                                                >
                                                    {showConfirmPassword ? (
                                                        <Eye className="w-5 h-5" />
                                                    ) : (
                                                        <EyeOff className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                            {errors.password_confirmation && (
                                                <div className="text-red-500 text-sm px-10 mt-1">
                                                    {errors.password_confirmation}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Service Provider Form Layout */}
                                    {/* Row 1: Service Provider Type | Full Name */}
                                    <div className="flex flex-col lg:flex-row gap-10 justify-center items-start">
                                        <div className="flex flex-col gap-2 mb-6">
                                            <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10">
                                                Service Provider Type
                                            </label>
                                            <div className="w-full md:w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-12 py-2">
                                                <select
                                                    value={data.vendor_type}
                                                    onChange={(e) => setData("vendor_type", e.target.value)}
                                                    className="w-full text-[14px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none text-white"
                                                    required
                                                >
                                                    <option value="" className="bg-gray-800 text-white">
                                                        Select Service Provider type
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

                                        <div className="flex flex-col gap-2 mb-6">
                                            <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10">
                                                {data.vendor_type === "business" ? "Company Name" : "Full Name"}
                                            </label>
                                            <div className="w-full md:w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-12 py-2">
                                                <input
                                                    type="text"
                                                    value={data.name}
                                                    onChange={(e) => setData("name", e.target.value)}
                                                    className="w-full text-[14px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none"
                                                    placeholder={data.vendor_type === "business" ? "Enter your company name" : "Enter your full name"}
                                                    required
                                                />
                                            </div>
                                            {errors.name && (
                                                <div className="text-red-500 text-sm px-10 mt-1">
                                                    {errors.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Row 2: Email Address | Phone Number */}
                                    <div className="flex flex-col lg:flex-row gap-10 justify-center items-start">
                                        <div className="flex flex-col gap-2 mb-6">
                                            <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10">
                                                Email Address
                                            </label>
                                            <div className="w-full md:w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-12 py-2">
                                                <input
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData("email", e.target.value)}
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

                                        <div className="flex flex-col gap-2 mb-6">
                                            <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10">
                                                Phone Number
                                            </label>
                                            <div className="w-full md:w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-4 py-2">
                                                <PhoneInput
                                                    country={'lk'}
                                                    value={data.phone}
                                                    onChange={handlePhoneChange}
                                                    countryCodeEditable={false}
                                                    containerClass="custom-phone-input"
                                                    inputClass="form-control"
                                                    buttonClass="flag-dropdown"
                                                    dropdownClass="text-gray-800 bg-white"
                                                    searchClass="text-gray-800"
                                                    preferredCountries={['lk', 'in', 'us', 'gb', 'ca', 'au']}
                                                    enableSearch={true}
                                                    placeholder="Enter your phone number"
                                                />
                                            </div>
                                            {phoneValidationError && (
                                                <div className="text-red-500 text-sm px-10 mt-1">
                                                    {phoneValidationError}
                                                </div>
                                            )}
                                            {errors.phone && (
                                                <div className="text-red-500 text-sm px-10 mt-1">
                                                    {errors.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Row 3: Password | Confirm Password */}
                                    <div className="flex flex-col lg:flex-row gap-10 justify-center items-start">
                                        <div className="flex flex-col gap-2 mb-6">
                                            <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10">
                                                Password
                                            </label>
                                            <div className="w-full md:w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-10 py-2">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={data.password}
                                                    onChange={(e) => setData("password", e.target.value)}
                                                    className="w-full text-[14px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none"
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
                                                        <Eye className="w-5 h-5" />
                                                    ) : (
                                                        <EyeOff className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                            {errors.password && (
                                                <div className="text-red-500 text-sm px-10 mt-1">
                                                    {errors.password}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2 mb-6">
                                            <label className="text-[14px] text-[#FFFFFFB2] font-[500] px-10">
                                                Confirm Password
                                            </label>
                                            <div className="w-full md:w-[397px] h-[56px] rounded-[100px] border-[1px] border-[#FFFFFF8F] flex justify-center items-center px-10 py-2">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={data.password_confirmation}
                                                    onChange={(e) => setData("password_confirmation", e.target.value)}
                                                    className="w-full text-[14px] font-[500] bg-transparent border-none focus:outline-none focus:ring-0 focus:border-none"
                                                    placeholder="Confirm your password"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="cursor-pointer text-white/80 hover:text-white"
                                                    aria-label="Toggle confirm password visibility"
                                                >
                                                    {showConfirmPassword ? (
                                                        <Eye className="w-5 h-5" />
                                                    ) : (
                                                        <EyeOff className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                            {errors.password_confirmation && (
                                                <div className="text-red-500 text-sm px-10 mt-1">
                                                    {errors.password_confirmation}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

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
                                className="w-full md:w-[397px] h-[56px] bg-[#2E6099] rounded-[100px] text-[16px] font-[600] flex justify-center items-center cursor-pointer mt-10 disabled:opacity-50"
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
                                <div className="w-full md:w-[174px] h-[1px] bg-[#FFFFFF80]" />
                                <h1 className="text-[12px] font-[500]">or</h1>
                                <div className="w-[174px] h-[1px] bg-[#FFFFFF80]" />
                            </div>

                            <div className="w-full md:w-[397px] h-[56px] border-[1.5px] border-[#0955AC] rounded-[100px] text-[16px] font-[600] flex flex-row gap-5 justify-center items-center cursor-pointer">
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
