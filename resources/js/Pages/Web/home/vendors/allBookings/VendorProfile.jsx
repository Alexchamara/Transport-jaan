import React, { useState, useRef, useEffect } from "react";
import { router, usePage } from "@inertiajs/react";
import {
    Building2,
    Upload,
    FileText,
    ChevronDown,
    ChevronRight,
    Check,
    X,
    AlertCircle,
    Send,
    Save,
    Trash2,
    Warehouse,
    Truck,
    Car,
    Plane,
    TrainFront,
    Ship,
    Info,
    ArrowLeft,
    ArrowRight,
    Eye,
    Loader2,
} from "lucide-react";
import ServiceRegistrationFields from "../../../../../Components/vendors/ServiceRegistrationFields";
import VendorLayout from "../VendorLayout";

// Map category slugs to icons
const categoryIcons = {
    warehousing: Warehouse,
    "courier-services": Truck,
    "vehicle-rental": Car,
    "aviation-service": Plane,
    "railway-service": TrainFront,
    "waterborne-transport": Ship,
};

// Category color scheme
const categoryColors = {
    warehousing: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", iconBg: "bg-amber-100" },
    "courier-services": { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", iconBg: "bg-green-100" },
    "vehicle-rental": { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", iconBg: "bg-blue-100" },
    "aviation-service": { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", iconBg: "bg-purple-100" },
    "railway-service": { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", iconBg: "bg-red-100" },
    "waterborne-transport": { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", iconBg: "bg-cyan-100" },
};

const VendorProfile = () => {
    const { vendorProfile, serviceCategories, vendorRegistrations, user, flash, errors: pageErrors } = usePage().props;

    // Vendor type from signup: "individual" or "business"
    const isBusiness = user?.vendor_type === "business";

    // ─── State ─────────────────────────────────────────────────
    const [currentStep, setCurrentStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [expandedSubCategories, setExpandedSubCategories] = useState({});
    const [serviceFieldValues, setServiceFieldValues] = useState({});
    const [localErrors, setLocalErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState(flash?.success || "");
    const [errorMessage, setErrorMessage] = useState("");
    const fileInputRef = useRef(null);

    // ─── Profile Form State ──────────────────────────────────
    const [profileData, setProfileData] = useState({
        company_name: vendorProfile?.company_name || "",
        business_registration_no: vendorProfile?.business_registration_no || "",
        tax_id: vendorProfile?.tax_id || "",
        business_type: vendorProfile?.business_type || (isBusiness ? "company" : "individual"),
        description: vendorProfile?.description || "",
        website: vendorProfile?.website || "",
        established_year: vendorProfile?.established_year || "",
        employee_count: vendorProfile?.employee_count || "",
        address_line1: vendorProfile?.address_line1 || "",
        address_line2: vendorProfile?.address_line2 || "",
        city: vendorProfile?.city || "",
        state: vendorProfile?.state || "",
        postal_code: vendorProfile?.postal_code || "",
        country: vendorProfile?.country || "Sri Lanka",
        contact_phone: vendorProfile?.contact_phone || "",
        contact_email: vendorProfile?.contact_email || user?.email || "",
        contact_person: vendorProfile?.contact_person || user?.name || "",
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(
        vendorProfile?.logo ? `/storage/${vendorProfile.logo}` : null
    );
    const [serviceErrors, setServiceErrors] = useState({});

    // Auto-clear success messages
    useEffect(() => {
        if (flash?.success) {
            setSuccessMessage(flash.success);
            const timer = setTimeout(() => setSuccessMessage(""), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash?.success]);

    // Show backend errors
    useEffect(() => {
        if (pageErrors && Object.keys(pageErrors).length > 0) {
            const firstError = Object.values(pageErrors)[0];
            setErrorMessage(typeof firstError === "string" ? firstError : JSON.stringify(firstError));
            const timer = setTimeout(() => setErrorMessage(""), 5000);
            return () => clearTimeout(timer);
        }
    }, [pageErrors]);

    // If profile is already submitted or approved, auto-navigate to step 3 (review)
    useEffect(() => {
        if (vendorProfile?.submission_status === "submitted" || vendorProfile?.submission_status === "approved") {
            setCurrentStep(3);
        }
    }, []);

    // ─── Helpers ──────────────────────────────────────────────
    const isReadOnly = vendorProfile?.submission_status === "submitted" || vendorProfile?.submission_status === "approved";
    const registeredServiceCount = vendorRegistrations ? Object.keys(vendorRegistrations).length : 0;

    const toggleCategory = (catId) => {
        setExpandedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
    };

    const toggleSubCategory = (subCatId) => {
        setExpandedSubCategories((prev) => ({
            ...prev,
            [subCatId]: !prev[subCatId],
        }));
    };

    const isSubCategoryRegistered = (subCatId) => {
        return vendorRegistrations && vendorRegistrations[subCatId] !== undefined;
    };

    const getSubCatRegistration = (subCatId) => {
        return vendorRegistrations?.[subCatId] || null;
    };

    // ─── Step 1: Save Profile ─────────────────────────────────
    const handleProfileChange = (field, value) => {
        setProfileData((prev) => ({ ...prev, [field]: value }));
        // Clear field error
        if (localErrors[field]) {
            setLocalErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const removeLogo = () => {
        if (vendorProfile?.logo) {
            router.delete(route("vendor.profile.logo.remove"), {
                preserveScroll: true,
            });
        }
        setLogoFile(null);
        setLogoPreview(null);
    };

    const validateProfile = () => {
        const errs = {};
        if (!profileData.company_name.trim()) {
            errs.company_name = isBusiness ? "Company name is required" : "Full name is required";
        }
        if (isBusiness && !profileData.business_registration_no.trim()) {
            errs.business_registration_no = "Registration number is required";
        }
        if (!isBusiness && !profileData.business_registration_no.trim()) {
            errs.business_registration_no = "NIC number is required";
        }
        if (!profileData.address_line1.trim()) errs.address_line1 = "Address is required";
        if (!profileData.city.trim()) errs.city = "City is required";
        if (!profileData.contact_phone.trim()) errs.contact_phone = "Phone number is required";
        if (!profileData.contact_email.trim()) errs.contact_email = "Email is required";
        if (!profileData.contact_person.trim()) errs.contact_person = "Contact person is required";
        setLocalErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const validateServiceFields = (requiredFields, values) => {
        const errs = {};
        requiredFields.forEach((field) => {
            const val = values[field.key];
            if (field.required || field.type !== "file_optional") {
                if (field.type === "checkbox") {
                    if (!val) errs[field.key] = "Please confirm this requirement";
                } else if (field.type === "file" || field.type === "file_with_dates") {
                    if (!val || (!val.file && !val.existing_file)) {
                        errs[field.key] = "Please upload a document";
                    } else if (field.type === "file_with_dates") {
                        if (!val.effective_date) errs[field.key] = "Effective date is required";
                        if (!val.expiry_date) errs[field.key] = "Expiry date is required";
                    }
                }
            }
        });
        return errs;
    };

    const saveProfile = () => {
        if (!validateProfile()) return;

        setSaving(true);
        const formData = new FormData();

        Object.entries(profileData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });

        if (logoFile) {
            formData.append("logo", logoFile);
        }

        router.post(route("vendor.profile.save"), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setSaving(false);
                setSuccessMessage("Business profile saved successfully!");
                setTimeout(() => setSuccessMessage(""), 3000);
            },
            onError: (errors) => {
                setSaving(false);
                setLocalErrors(errors);
            },
        });
    };

    // ─── Step 2: Save Service Registration ────────────────────
    const handleServiceFieldChange = (subCatId, values) => {
        setServiceFieldValues((prev) => ({ ...prev, [subCatId]: values }));
    };

    const saveServiceRegistration = (subCategory) => {
        const requiredFields = subCategory.required_fields || [];
        const values = serviceFieldValues[subCategory.id] || {};
        const fieldErrors = validateServiceFields(requiredFields, values);
        
        if (Object.keys(fieldErrors).length > 0) {
            setServiceErrors((prev) => ({ ...prev, [subCategory.id]: fieldErrors }));
            setErrorMessage("Please fill in all required fields before saving.");
            setTimeout(() => setErrorMessage(""), 4000);
            return;
        }

        setSaving(true);
        const formData = new FormData();

        // Build the form data matching the controller's expected structure
        Object.entries(values).forEach(([key, val]) => {
            if (val instanceof File) {
                formData.append(`fields[${key}][file]`, val);
            } else if (typeof val === "boolean") {
                formData.append(`fields[${key}]`, val ? "1" : "0");
            } else if (typeof val === "object" && val !== null) {
                if (val.file instanceof File) {
                    formData.append(`fields[${key}][file]`, val.file);
                } else if (val.existing_file || val.file) {
                    formData.append(`fields[${key}][existing_file]`, val.file || val.existing_file || "");
                    formData.append(`fields[${key}][existing_name]`, val.original_name || val.existing_name || "");
                }

                if (val.effective_date) {
                    formData.append(`fields[${key}][effective_date]`, val.effective_date);
                }
                if (val.expiry_date) {
                    formData.append(`fields[${key}][expiry_date]`, val.expiry_date);
                }
            }
        });

        router.post(route("vendor.profile.service.save", subCategory.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setSaving(false);
                setSuccessMessage(`${subCategory.name} registration saved!`);
                setTimeout(() => setSuccessMessage(""), 3000);
            },
            onError: (errors) => {
                setSaving(false);
                setErrorMessage("Failed to save service registration. Please check your inputs.");
                setTimeout(() => setErrorMessage(""), 4000);
            },
        });
    };

    const removeServiceRegistration = (subCategory) => {
        if (!confirm(`Remove registration for ${subCategory.name}?`)) return;

        router.delete(route("vendor.profile.service.remove", subCategory.id), {
            preserveScroll: true,
            onSuccess: () => {
                setSuccessMessage(`${subCategory.name} registration removed.`);
                setTimeout(() => setSuccessMessage(""), 3000);
            },
        });
    };

    // ─── Step 3: Submit for Review ────────────────────────────
    const submitForReview = () => {
        if (!vendorProfile) {
            setErrorMessage("Please complete your business profile first (Step 1).");
            setTimeout(() => setErrorMessage(""), 4000);
            return;
        }
        if (registeredServiceCount === 0) {
            setErrorMessage("Please register for at least one service (Step 2).");
            setTimeout(() => setErrorMessage(""), 4000);
            return;
        }

        if (!confirm("Are you sure you want to submit your profile for review? You won't be able to make changes after submission.")) {
            return;
        }

        setSubmitting(true);
        router.post(route("vendor.profile.submit"), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setSubmitting(false);
            },
            onError: (errors) => {
                setSubmitting(false);
                const firstError = Object.values(errors)[0];
                setErrorMessage(typeof firstError === "string" ? firstError : "Submission failed.");
                setTimeout(() => setErrorMessage(""), 5000);
            },
        });
    };

    // ─── STEP INDICATOR ───────────────────────────────────────
    const steps = [
        { num: 1, label: "Business Profile", icon: Building2 },
        { num: 2, label: "Service Registration", icon: FileText },
        { num: 3, label: "Review & Submit", icon: Send },
    ];

    // ─── RENDER ───────────────────────────────────────────────
    return (
        <VendorLayout activeService="Profile">
        <div className="w-full">

            {/* Page Title */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="px-4 sm:px-6 lg:px-8 xl:pl-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Vendor Registration</h1>
                        <p className="text-sm text-gray-500">Complete your business profile and register for services</p>
                    </div>
                    {vendorProfile?.submission_status && (
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                vendorProfile.submission_status === "draft"
                                    ? "bg-gray-100 text-gray-600"
                                    : vendorProfile.submission_status === "submitted"
                                    ? "bg-blue-100 text-blue-700"
                                    : vendorProfile.submission_status === "approved"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                        >
                            {vendorProfile.submission_status === "draft" && "Draft"}
                            {vendorProfile.submission_status === "submitted" && "Under Review"}
                            {vendorProfile.submission_status === "approved" && "Approved"}
                            {vendorProfile.submission_status === "rejected" && "Rejected"}
                        </span>
                    )}
                </div>
            </div>

            {/* Step Indicator */}
            <div className="bg-white border-b border-gray-100">
                <div className="px-4 sm:px-6 lg:px-8 xl:pl-6 py-4">
                    <div className="flex items-center justify-between">
                        {steps.map((step, idx) => {
                            const StepIcon = step.icon;
                            const isActive = currentStep === step.num;
                            const isCompleted = currentStep > step.num;

                            return (
                                <React.Fragment key={step.num}>
                                    <button
                                        onClick={() => {
                                            if (isReadOnly) return;
                                            
                                            // Validate when moving forward from step 1 to step 2
                                            if (step.num === 2 && currentStep === 1) {
                                                if (!validateProfile()) {
                                                    setErrorMessage("Please fill in all required fields to continue.");
                                                    setTimeout(() => setErrorMessage(""), 4000);
                                                    return;
                                                }
                                            }
                                            
                                            // Validate when moving forward from step 2 to step 3
                                            if (step.num === 3 && currentStep === 2) {
                                                if (registeredServiceCount === 0) {
                                                    setErrorMessage("Please register for at least one service before proceeding.");
                                                    setTimeout(() => setErrorMessage(""), 4000);
                                                    return;
                                                }
                                            }
                                            
                                            setCurrentStep(step.num);
                                        }}
                                        disabled={isReadOnly}
                                        className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-3 rounded-xl transition-all ${
                                            isActive
                                                ? "bg-[#0955AC] text-white shadow-lg shadow-blue-200"
                                                : isCompleted
                                                ? "bg-green-50 text-green-700 hover:bg-green-100"
                                                : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                                        } ${isReadOnly ? "cursor-default" : "cursor-pointer"}`}
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                isActive
                                                    ? "bg-white text-[#0955AC]"
                                                    : isCompleted
                                                    ? "bg-green-500 text-white"
                                                    : "bg-gray-200 text-gray-500"
                                            }`}
                                        >
                                            {isCompleted ? (
                                                <Check className="w-4 h-4" />
                                            ) : (
                                                step.num
                                            )}
                                        </div>
                                        <div className="hidden sm:block text-left">
                                            <p className="text-xs font-medium opacity-70">
                                                Step {step.num}
                                            </p>
                                            <p className="text-sm font-semibold">
                                                {step.label}
                                            </p>
                                        </div>
                                    </button>
                                    {idx < steps.length - 1 && (
                                        <div
                                            className={`flex-1 h-[2px] mx-2 ${
                                                currentStep > step.num
                                                    ? "bg-green-400"
                                                    : "bg-gray-200"
                                            }`}
                                        />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Toast Messages */}
            {successMessage && (
                <div className="fixed top-4 right-4 z-50 animate-fade-in">
                    <div className="bg-green-500 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">{successMessage}</span>
                        <button onClick={() => setSuccessMessage("")} className="ml-2">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
            {errorMessage && (
                <div className="fixed top-4 right-4 z-50 animate-fade-in">
                    <div className="bg-red-500 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">{errorMessage}</span>
                        <button onClick={() => setErrorMessage("")} className="ml-2">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="px-4 sm:px-6 lg:px-8 xl:pr-8 xl:pl-6 pt-6 pb-8 lg:pb-12">
                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ STEP 1 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {currentStep === 1 && (
                    <div className="space-y-6">
                        {/* Company Logo — business only */}
                        {isBusiness && (
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-[#0955AC]" />
                                Company Logo
                            </h2>
                            <div className="flex items-center gap-5">
                                {logoPreview ? (
                                    <div className="relative">
                                        <img
                                            src={logoPreview}
                                            alt="Logo"
                                            className="w-24 h-24 rounded-xl object-cover border-2 border-gray-200"
                                        />
                                        {!isReadOnly && (
                                            <button
                                                type="button"
                                                onClick={removeLogo}
                                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#0955AC] hover:bg-blue-50 transition-colors">
                                        <Upload className="w-6 h-6 text-gray-400" />
                                        <span className="text-[10px] text-gray-400 mt-1">
                                            Upload
                                        </span>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                            disabled={isReadOnly}
                                        />
                                    </label>
                                )}
                                <div className="text-sm text-gray-500">
                                    <p className="font-medium text-gray-700">Upload your company logo</p>
                                    <p className="text-xs mt-1">Recommended: 200×200px, PNG or JPG, max 2MB</p>
                                </div>
                            </div>
                        </div>
                        )}

                        {/* Business / Personal Information */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-[#0955AC]" />
                                {isBusiness ? "Business Information" : "Personal Information"}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Company Name / Full Name */}
                                <div className={isBusiness ? "md:col-span-2" : ""}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {isBusiness ? "Company Name" : "Full Name"} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.company_name}
                                        onChange={(e) => handleProfileChange("company_name", e.target.value)}
                                        disabled={isReadOnly}
                                        className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent ${
                                            localErrors.company_name ? "border-red-400" : "border-gray-300"
                                        }`}
                                        placeholder={isBusiness ? "Enter your company name" : "Enter your full name"}
                                    />
                                    {localErrors.company_name && (
                                        <p className="text-xs text-red-500 mt-1">{localErrors.company_name}</p>
                                    )}
                                </div>

                                {/* NIC Number — individual only */}
                                {!isBusiness && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        NIC Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.business_registration_no}
                                        onChange={(e) => handleProfileChange("business_registration_no", e.target.value)}
                                        disabled={isReadOnly}
                                        className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent ${
                                            localErrors.business_registration_no ? "border-red-400" : "border-gray-300"
                                        }`}
                                        placeholder="e.g. 200012345678"
                                    />
                                    {localErrors.business_registration_no && (
                                        <p className="text-xs text-red-500 mt-1">{localErrors.business_registration_no}</p>
                                    )}
                                </div>
                                )}

                                {/* Business Registration — business only */}
                                {isBusiness && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Business Registration No. <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.business_registration_no}
                                        onChange={(e) => handleProfileChange("business_registration_no", e.target.value)}
                                        disabled={isReadOnly}
                                        className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent ${
                                            localErrors.business_registration_no ? "border-red-400" : "border-gray-300"
                                        }`}
                                        placeholder="e.g. PV00012345"
                                    />
                                    {localErrors.business_registration_no && (
                                        <p className="text-xs text-red-500 mt-1">{localErrors.business_registration_no}</p>
                                    )}
                                </div>
                                )}

                                {/* Tax ID — business only */}
                                {isBusiness && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tax Identification Number
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.tax_id}
                                        onChange={(e) => handleProfileChange("tax_id", e.target.value)}
                                        disabled={isReadOnly}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent"
                                        placeholder="Tax ID (optional)"
                                    />
                                </div>
                                )}

                                {/* Business Type — business only */}
                                {isBusiness && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Business Type
                                    </label>
                                    <select
                                        value={profileData.business_type}
                                        onChange={(e) => handleProfileChange("business_type", e.target.value)}
                                        disabled={isReadOnly}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent"
                                    >
                                        <option value="company">Company (Pvt Ltd)</option>
                                        <option value="partnership">Partnership</option>
                                    </select>
                                </div>
                                )}

                                {/* Established Year — business only */}
                                {isBusiness && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Year Established
                                    </label>
                                    <input
                                        type="number"
                                        min="1900"
                                        max={new Date().getFullYear()}
                                        value={profileData.established_year}
                                        onChange={(e) => handleProfileChange("established_year", e.target.value)}
                                        disabled={isReadOnly}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent"
                                        placeholder="e.g. 2010"
                                    />
                                </div>
                                )}

                                {/* Employee Count — business only */}
                                {isBusiness && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Number of Employees
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={profileData.employee_count}
                                        onChange={(e) => handleProfileChange("employee_count", e.target.value)}
                                        disabled={isReadOnly}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent"
                                        placeholder="Number of employees"
                                    />
                                </div>
                                )}

                                {/* Website — business only */}
                                {isBusiness && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Website
                                    </label>
                                    <input
                                        type="url"
                                        value={profileData.website}
                                        onChange={(e) => handleProfileChange("website", e.target.value)}
                                        disabled={isReadOnly}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent"
                                        placeholder="https://example.com"
                                    />
                                </div>
                                )}

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {isBusiness ? "Business Description" : "About Yourself"}
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={profileData.description}
                                        onChange={(e) => handleProfileChange("description", e.target.value)}
                                        disabled={isReadOnly}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent resize-none"
                                        placeholder={isBusiness ? "Briefly describe your business..." : "Briefly describe your services..."}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">{isBusiness ? "Business Address" : "Residential Address"}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Address Line 1 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.address_line1}
                                        onChange={(e) => handleProfileChange("address_line1", e.target.value)}
                                        disabled={isReadOnly}
                                        className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent ${
                                            localErrors.address_line1 ? "border-red-400" : "border-gray-300"
                                        }`}
                                        placeholder="Street address"
                                    />
                                    {localErrors.address_line1 && (
                                        <p className="text-xs text-red-500 mt-1">{localErrors.address_line1}</p>
                                    )}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Address Line 2
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.address_line2}
                                        onChange={(e) => handleProfileChange("address_line2", e.target.value)}
                                        disabled={isReadOnly}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent"
                                        placeholder="Suite, floor, etc. (optional)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.city}
                                        onChange={(e) => handleProfileChange("city", e.target.value)}
                                        disabled={isReadOnly}
                                        className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent ${
                                            localErrors.city ? "border-red-400" : "border-gray-300"
                                        }`}
                                        placeholder="City"
                                    />
                                    {localErrors.city && (
                                        <p className="text-xs text-red-500 mt-1">{localErrors.city}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        State / Province
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.state}
                                        onChange={(e) => handleProfileChange("state", e.target.value)}
                                        disabled={isReadOnly}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent"
                                        placeholder="State or Province"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.postal_code}
                                        onChange={(e) => handleProfileChange("postal_code", e.target.value)}
                                        disabled={isReadOnly}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent"
                                        placeholder="Postal code"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.country}
                                        onChange={(e) => handleProfileChange("country", e.target.value)}
                                        disabled={isReadOnly}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Contact Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contact Person <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.contact_person}
                                        onChange={(e) => handleProfileChange("contact_person", e.target.value)}
                                        disabled={isReadOnly}
                                        className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent ${
                                            localErrors.contact_person ? "border-red-400" : "border-gray-300"
                                        }`}
                                        placeholder="Full name"
                                    />
                                    {localErrors.contact_person && (
                                        <p className="text-xs text-red-500 mt-1">{localErrors.contact_person}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={profileData.contact_phone}
                                        onChange={(e) => handleProfileChange("contact_phone", e.target.value)}
                                        disabled={isReadOnly}
                                        className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent ${
                                            localErrors.contact_phone ? "border-red-400" : "border-gray-300"
                                        }`}
                                        placeholder="+94 7XX XXX XXXX"
                                    />
                                    {localErrors.contact_phone && (
                                        <p className="text-xs text-red-500 mt-1">{localErrors.contact_phone}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={profileData.contact_email}
                                        onChange={(e) => handleProfileChange("contact_email", e.target.value)}
                                        disabled={isReadOnly}
                                        className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent ${
                                            localErrors.contact_email ? "border-red-400" : "border-gray-300"
                                        }`}
                                        placeholder="contact@company.lk"
                                    />
                                    {localErrors.contact_email && (
                                        <p className="text-xs text-red-500 mt-1">{localErrors.contact_email}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Step 1 Actions */}
                        <div className="flex items-center justify-between">
                            <div />
                            <div className="flex items-center gap-3">
                                {!isReadOnly && (
                                    <button
                                        onClick={saveProfile}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-[#0955AC] text-white rounded-lg hover:bg-[#074a94] transition-colors font-medium text-sm disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        Save Profile
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        if (validateProfile()) {
                                            setCurrentStep(2);
                                        } else {
                                            setErrorMessage("Please fill in all required fields to continue.");
                                            setTimeout(() => setErrorMessage(""), 4000);
                                        }
                                    }}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
                                >
                                    Next: Services
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ STEP 2 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {currentStep === 2 && (
                    <div className="space-y-6">
                        {/* Info banner */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-blue-800">
                                    Select the services you want to register for
                                </p>
                                <p className="text-xs text-blue-600 mt-0.5">
                                    Expand a category, then expand a sub-category to fill in the required documents. 
                                    Save each sub-category individually. You need at least one service registration to submit.
                                </p>
                            </div>
                        </div>

                        {/* Service Categories */}
                        {serviceCategories?.map((category) => {
                            const IconComp = categoryIcons[category.slug] || Building2;
                            const colors = categoryColors[category.slug] || categoryColors.warehousing;
                            const isExpanded = expandedCategories[category.id];
                            const subCategories = category.active_sub_categories || [];
                            const registeredCount = subCategories.filter((sc) =>
                                isSubCategoryRegistered(sc.id)
                            ).length;

                            return (
                                <div
                                    key={category.id}
                                    className={`rounded-xl border transition-all ${
                                        isExpanded ? `${colors.border} ${colors.bg}` : "border-gray-200 bg-white"
                                    }`}
                                >
                                    {/* Category Header */}
                                    <button
                                        onClick={() => toggleCategory(category.id)}
                                        className="w-full flex items-center justify-between px-5 py-4 text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.iconBg}`}
                                            >
                                                <IconComp className={`w-5 h-5 ${colors.text}`} />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-gray-800">
                                                    {category.name}
                                                </h3>
                                                <p className="text-xs text-gray-500">
                                                    {subCategories.length} sub-categories
                                                    {registeredCount > 0 && (
                                                        <span className="ml-2 text-green-600 font-medium">
                                                            • {registeredCount} registered
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {registeredCount > 0 && (
                                                <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                                    {registeredCount}
                                                </span>
                                            )}
                                            {isExpanded ? (
                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                            ) : (
                                                <ChevronRight className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                    </button>

                                    {/* Sub-categories */}
                                    {isExpanded && (
                                        <div className="px-5 pb-5 space-y-3">
                                            {subCategories.map((subCat) => {
                                                const isRegistered = isSubCategoryRegistered(subCat.id);
                                                const registration = getSubCatRegistration(subCat.id);
                                                const isSubExpanded = expandedSubCategories[subCat.id];
                                                const requiredFields = subCat.required_fields || [];
                                                const isGovernment = requiredFields.length === 0;

                                                return (
                                                    <div
                                                        key={subCat.id}
                                                        className={`rounded-lg border transition-all ${
                                                            isRegistered
                                                                ? "border-green-300 bg-green-50"
                                                                : "border-gray-200 bg-white"
                                                        }`}
                                                    >
                                                        {/* Sub-category header */}
                                                        <div
                                                            className="flex items-center justify-between px-4 py-3 cursor-pointer"
                                                            onClick={() => toggleSubCategory(subCat.id)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {isRegistered ? (
                                                                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                                                        <Check className="w-3.5 h-3.5 text-white" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                                                                )}
                                                                <div>
                                                                    <p className="text-sm font-semibold text-gray-800">
                                                                        {subCat.name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {isGovernment
                                                                            ? "Government-operated — No registration required"
                                                                            : `${requiredFields.length} field(s) required`}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {isRegistered && (
                                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
                                                                        Saved
                                                                    </span>
                                                                )}
                                                                {!isGovernment && (
                                                                    isSubExpanded ? (
                                                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                                                    ) : (
                                                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Sub-category form */}
                                                        {isSubExpanded && !isGovernment && (
                                                            <div className="px-4 pb-4 border-t border-gray-100 pt-4">
                                                                <ServiceRegistrationFields
                                                                    requiredFields={requiredFields}
                                                                    existingValues={
                                                                        registration?.field_values ||
                                                                        serviceFieldValues[subCat.id] ||
                                                                        {}
                                                                    }
                                                                    onChange={(values) => {
                                                                        handleServiceFieldChange(subCat.id, values);
                                                                        // Clear errors when user makes changes
                                                                        if (serviceErrors[subCat.id]) {
                                                                            setServiceErrors((prev) => {
                                                                                const next = { ...prev };
                                                                                delete next[subCat.id];
                                                                                return next;
                                                                            });
                                                                        }
                                                                    }}
                                                                    errors={serviceErrors[subCat.id] || {}}
                                                                />

                                                                {/* Sub-category actions */}
                                                                {!isReadOnly && (
                                                                    <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                                                                        {isRegistered && (
                                                                            <button
                                                                                onClick={() =>
                                                                                    removeServiceRegistration(subCat)
                                                                                }
                                                                                className="flex items-center gap-1.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                            >
                                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                                Remove
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            onClick={() =>
                                                                                saveServiceRegistration(subCat)
                                                                            }
                                                                            disabled={saving}
                                                                            className="flex items-center gap-1.5 px-5 py-2 bg-[#0955AC] text-white rounded-lg hover:bg-[#074a94] transition-colors text-sm font-medium disabled:opacity-50"
                                                                        >
                                                                            {saving ? (
                                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                            ) : (
                                                                                <Save className="w-3.5 h-3.5" />
                                                                            )}
                                                                            {isRegistered ? "Update" : "Save"}
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Step 2 Actions */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setCurrentStep(1)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back: Profile
                            </button>
                            <button
                                onClick={() => {
                                    if (registeredServiceCount === 0) {
                                        setErrorMessage("Please register for at least one service before proceeding.");
                                        setTimeout(() => setErrorMessage(""), 4000);
                                    } else {
                                        setCurrentStep(3);
                                    }
                                }}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
                            >
                                Next: Review
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ STEP 3 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        {/* Submitted / Under Review notice */}
                        {isReadOnly && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                                <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-blue-800">
                                        {vendorProfile?.submission_status === "submitted"
                                            ? "Your profile is under review. You cannot make changes while it's being reviewed."
                                            : "Your profile has been approved."}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Profile Summary */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-[#0955AC]" />
                                    {isBusiness ? "Business Profile Summary" : "Personal Profile Summary"}
                                </h2>
                                {!isReadOnly && (
                                    <button
                                        onClick={() => setCurrentStep(1)}
                                        className="text-sm text-[#0955AC] hover:underline"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>

                            {vendorProfile ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    {logoPreview && (
                                        <div className="md:col-span-2 mb-2">
                                            <img
                                                src={logoPreview}
                                                alt="Company Logo"
                                                className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                                            />
                                        </div>
                                    )}
                                    <SummaryItem label={isBusiness ? "Company Name" : "Full Name"} value={vendorProfile.company_name} />
                                    <SummaryItem label={isBusiness ? "Registration No." : "NIC Number"} value={vendorProfile.business_registration_no} />
                                    {isBusiness && <SummaryItem label="Tax ID" value={vendorProfile.tax_id} />}
                                    {isBusiness && <SummaryItem label="Business Type" value={vendorProfile.business_type} />}
                                    {isBusiness && <SummaryItem label="Established" value={vendorProfile.established_year} />}
                                    {isBusiness && <SummaryItem label="Employees" value={vendorProfile.employee_count} />}
                                    <SummaryItem
                                        label="Address"
                                        value={[
                                            vendorProfile.address_line1,
                                            vendorProfile.address_line2,
                                            vendorProfile.city,
                                            vendorProfile.state,
                                            vendorProfile.postal_code,
                                            vendorProfile.country,
                                        ]
                                            .filter(Boolean)
                                            .join(", ")}
                                    />
                                    <SummaryItem label="Contact Person" value={vendorProfile.contact_person} />
                                    <SummaryItem label="Phone" value={vendorProfile.contact_phone} />
                                    <SummaryItem label="Email" value={vendorProfile.contact_email} />
                                    {vendorProfile.website && (
                                        <SummaryItem label="Website" value={vendorProfile.website} />
                                    )}
                                    {vendorProfile.description && (
                                        <div className="md:col-span-2">
                                            <SummaryItem label="Description" value={vendorProfile.description} />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                                    <p className="text-sm">No profile data yet. Please complete Step 1.</p>
                                </div>
                            )}
                        </div>

                        {/* Registered Services Summary */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-[#0955AC]" />
                                    Registered Services ({registeredServiceCount})
                                </h2>
                                {!isReadOnly && (
                                    <button
                                        onClick={() => setCurrentStep(2)}
                                        className="text-sm text-[#0955AC] hover:underline"
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>

                            {registeredServiceCount > 0 ? (
                                <div className="space-y-3">
                                    {serviceCategories?.map((category) => {
                                        const subCategories = category.active_sub_categories || [];
                                        const registeredSubs = subCategories.filter((sc) =>
                                            isSubCategoryRegistered(sc.id)
                                        );

                                        if (registeredSubs.length === 0) return null;

                                        const IconComp = categoryIcons[category.slug] || Building2;
                                        const colors = categoryColors[category.slug] || categoryColors.warehousing;

                                        return (
                                            <div
                                                key={category.id}
                                                className={`rounded-lg border p-4 ${colors.border} ${colors.bg}`}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <IconComp className={`w-4 h-4 ${colors.text}`} />
                                                    <h3 className={`text-sm font-bold ${colors.text}`}>
                                                        {category.name}
                                                    </h3>
                                                </div>
                                                <div className="space-y-1.5">
                                                    {registeredSubs.map((sub) => {
                                                        const reg = getSubCatRegistration(sub.id);
                                                        const fieldCount = Object.keys(reg?.field_values || {}).length;
                                                        return (
                                                            <div
                                                                key={sub.id}
                                                                className="flex items-center gap-2 text-sm text-gray-700 bg-white rounded-md px-3 py-2"
                                                            >
                                                                <Check className="w-4 h-4 text-green-500" />
                                                                <span className="font-medium">{sub.name}</span>
                                                                <span className="text-xs text-gray-400 ml-auto">
                                                                    {fieldCount} field(s) completed
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                                    <p className="text-sm">No services registered yet. Please complete Step 2.</p>
                                </div>
                            )}
                        </div>

                        {/* Step 3 Actions */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setCurrentStep(2)}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back: Services
                            </button>

                            {!isReadOnly && (
                                <button
                                    onClick={submitForReview}
                                    disabled={submitting || !vendorProfile || registeredServiceCount === 0}
                                    className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-200"
                                >
                                    {submitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    Submit for Review
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Animations */}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
        </VendorLayout>
    );
};

// Summary item helper component
const SummaryItem = ({ label, value }) => {
    if (!value) return null;
    return (
        <div>
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-800">{value}</p>
        </div>
    );
};

export default VendorProfile;
