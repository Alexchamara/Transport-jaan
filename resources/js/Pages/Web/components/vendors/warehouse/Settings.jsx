import React, { useMemo, useRef, useState } from "react";
import { usePage } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";

import search from "../../../assets/vendors/dashboard/searchIcon.svg";
import settings from "../../../assets/vendors/dashboard/settings.svg";
import bell from "../../../assets/vendors/dashboard/bell.svg";
import proPic from "../../../assets/vendors/dashboard/proPic.svg";

const Section = ({ title, description, children }) => (
    <section className="bg-white rounded-[10px] border border-gray-200 p-6 md:p-10">
        <div className="mb-6">
            <h2 className="text-[18px] font-[700] text-gray-900">{title}</h2>
            {description && (
                <p className="text-[12px] text-gray-500">{description}</p>
            )}
        </div>
        {children}
    </section>
);

const Field = ({ label, htmlFor, children, required, help }) => (
    <label className="block" htmlFor={htmlFor}>
        <span className="block text-[14px] font-[700] text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
        </span>
        <div className="mt-1">{children}</div>
        {help && <p className="mt-1 text-[10px] text-gray-500">{help}</p>}
    </label>
);

const ErrorText = ({ children }) =>
    children ? (
        <p className="mt-1 text-[14px] text-red-600">{children}</p>
    ) : null;

const Toggle = ({ label, checked, onChange, description }) => (
    <div className="flex items-start justify-between gap-4 py-3">
        <div>
            <p className="text-[14px] font-medium text-gray-900">{label}</p>
            {description && (
                <p className="text-[10px] text-gray-500">{description}</p>
            )}
        </div>
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                checked ? "bg-[#0955AC]" : "bg-gray-300"
            }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    checked ? "translate-x-6" : "translate-x-1"
                }`}
            />
        </button>
    </div>
);

const MAX_AVATAR_MB = 3; // sensible default
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const Settings = ({ user = {} }) => {
  const { auth } = usePage().props;
  const user = auth?.user;

    const fileInputRef = useRef(null);
    const [photoPreview, setPhotoPreview] = useState(user?.avatar_url || null);
    const [clientErrors, setClientErrors] = useState({});

    const initial = useMemo(
        () => ({
            // profile
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            email: user.email || "",
            phone: user.phone || "",
            // address
            address_line1: user.address_line1 || "",
            address_line2: user.address_line2 || "",
            city: user.city || "",
            state: user.state || "",
            postal_code: user.postal_code || "",
            country: user.country || "",
            // security
            current_password: "",
            new_password: "",
            confirm_password: "",
            // payment (tokenized – last4/brand shown for UX)
            cardholder_name: user.cardholder_name || "",
            card_last4: user.card_last4 || "",
            card_brand: user.card_brand || "",
            expiry_month: user.expiry_month || "",
            expiry_year: user.expiry_year || "",
            // notifications
            notify_email: user.notify_email ?? true,
            notify_sms: user.notify_sms ?? false,
            notify_push: user.notify_push ?? true,
            // avatar file
            avatar: null,
        }),
        [user]
    );

    const {
        data,
        setData,
        post,
        processing,
        errors,
        clearErrors,
        reset,
        transform,
    } = useForm(initial);

    // Resolve update URL safely (avoid Ziggy exceptions if route missing)
    const resolveUpdateUrl = () => {
  const { auth } = usePage().props;
  const user = auth?.user;

        try {
            if (typeof route === "function") {
                // Ziggy may throw if name missing; check existence when possible
                if (
                    typeof route().has === "function"
                        ? route().has("client.settings.update")
                        : true
                ) {
                    return route("client.settings.update");
                }
            }
        } catch (_) {
            // ignore and fallback
        }
        return "/client/settings";
    };

    const updateUrl = resolveUpdateUrl();

    // Ensure file uploads work
    transform((formData) => ({ ...formData }));

    const validatePasswords = () => {
  const { auth } = usePage().props;
  const user = auth?.user;

        const e = {};
        if (
            data.new_password ||
            data.confirm_password ||
            data.current_password
        ) {
            if (!data.current_password)
                e.current_password =
                    "Current password is required to change your password.";
            if ((data.new_password?.length || 0) < 8)
                e.new_password = "Use at least 8 characters.";
            if (data.new_password !== data.confirm_password)
                e.confirm_password = "Passwords do not match.";
        }
        return e;
    };

    const validateAvatar = (file) => {
  const { auth } = usePage().props;
  const user = auth?.user;

        const e = {};
        if (!file) return e;
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type))
            e.avatar = "Please upload a JPG, PNG, or WEBP image.";
        const sizeMb = file.size / (1024 * 1024);
        if (sizeMb > MAX_AVATAR_MB)
            e.avatar = `Image must be under ${MAX_AVATAR_MB}MB (current ~${sizeMb.toFixed(
                1
            )}MB).`;
        return e;
    };

    const handleImageChange = (e) => {
  const { auth } = usePage().props;
  const user = auth?.user;

        const file = e.target.files?.[0];
        const eAvatar = validateAvatar(file);
        setClientErrors((prev) => ({ ...prev, ...eAvatar }));
        if (Object.keys(eAvatar).length === 0) {
            setData("avatar", file || null);
            clearErrors("avatar");
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => setPhotoPreview(ev.target.result);
                reader.readAsDataURL(file);
            } else {
                setPhotoPreview(null);
            }
        }
    };

    const submitAll = (e) => {
  const { auth } = usePage().props;
  const user = auth?.user;

        e.preventDefault();
        const ePwd = validatePasswords();
        setClientErrors((prev) => ({ ...prev, ...ePwd }));
        if (Object.keys(ePwd).length > 0) return; // stop submit

        post(updateUrl, {
            preserveScroll: true,
            forceFormData: true, // required for file upload
        });
    };

    const removePhoto = () => {
  const { auth } = usePage().props;
  const user = auth?.user;

        setData("avatar", null);
        setPhotoPreview(null);
        setClientErrors((prev) => ({ ...prev, avatar: undefined }));
    };

    return (
        <div className="bg-[#E5E5E5] poppins w-full">
            {/* <div className="max-w-[1300px] mx-auto px-4 md:px-6 lg:px-10 py-20"> */}
            {/* <div className="mb-8">
                    <h1 className="text-2xl md:text-[35px] font-[700] text-gray-900">
                        Account <span className="text-[#0955AC]"> Settings</span>
                    </h1>
                    <p className="mt-3 text-gray-600 text-[14px]">
                        Manage your personal info, security, and payment
                        preferences.
                    </p>
                </div> */}
            <div className="w-full h-auto pr-5 py-10">
                {/* Header section */}
                <div className="flex flex-row gap-5 justify-between items-center">
                    <h1 className="figtree text-[35px] font-[700]">
                        Ticket Booking Settings
                    </h1>
                    <div className="flex flex-row gap-5">
                        <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                            <img src={search} />
                        </div>
                        <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                            <img src={bell} />
                        </div>
                        <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                            <img src={proPic} />
                        </div>

                        <div className="figtree flex flex-col justify-center items-start">
                            <h1 className="text-[20px] font-[700]">
                                Steve Gibson
                            </h1>
                            <h1 className="text-[16px] font-[600] text-[#7B7B7A]">
                                Vendor
                            </h1>
                        </div>
                    </div>
                </div>

                <form onSubmit={submitAll} className="space-y-8 mt-10" noValidate>
                    {/* Profile photo & basic info */}
                    <Section
                        title="Profile"
                        description="Update your photo and personal details."
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <div className="flex items-center gap-4">
                                    <div className="sm:h-40 sm:w-40 w-20 h-20 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                                        {photoPreview ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={photoPreview}
                                                alt="Profile preview"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-gray-400 sm:text-[14px] text-[10px]">
                                                No photo
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept={ACCEPTED_IMAGE_TYPES.join(
                                                ","
                                            )}
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    fileInputRef.current?.click()
                                                }
                                                className="px-3 py-2 text-[14px] text-[#FFFFFF] font-[700] rounded-md bg-[#0955AC] border border-[#0955AC]"
                                            >
                                                Upload
                                            </button>
                                            {photoPreview && (
                                                <button
                                                    type="button"
                                                    onClick={removePhoto}
                                                    className="px-3 py-2 text-[14px] font-medium rounded-md border border-red-300 text-red-600 hover:bg-red-50"
                                                >
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <ErrorText>
                                            {clientErrors.avatar ||
                                                errors.avatar}
                                        </ErrorText>
                                        <p className="text-[12px] text-gray-500">
                                            JPG, PNG, or WEBP up to{" "}
                                            {MAX_AVATAR_MB}MB.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <Field
                                    label="First name"
                                    htmlFor="first_name"
                                    required
                                >
                                    <input
                                        id="first_name"
                                        type="text"
                                        value={data.first_name}
                                        onChange={(e) =>
                                            setData(
                                                "first_name",
                                                e.target.value
                                            )
                                        }
                                        className="w-full h-16 rounded-[10px] border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                                        placeholder="John"
                                        required
                                    />
                                    <ErrorText>{errors.first_name}</ErrorText>
                                </Field>

                                <Field
                                    label="Last name"
                                    htmlFor="last_name"
                                    required
                                >
                                    <input
                                        id="last_name"
                                        type="text"
                                        value={data.last_name}
                                        onChange={(e) =>
                                            setData("last_name", e.target.value)
                                        }
                                        className="w-full h-16 rounded-[10px] border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                                        placeholder="Doe"
                                        required
                                    />
                                    <ErrorText>{errors.last_name}</ErrorText>
                                </Field>

                                <Field label="Email" htmlFor="email" required>
                                    <input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        className="w-full h-16 rounded-[10px] border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                                        placeholder="john@example.com"
                                        required
                                        autoComplete="email"
                                    />
                                    <ErrorText>{errors.email}</ErrorText>
                                </Field>

                                <Field
                                    label="Phone"
                                    htmlFor="phone"
                                    help="Include country code, e.g., +94 70 123 4567"
                                >
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData("phone", e.target.value)
                                        }
                                        className="w-full h-16 rounded-[10px] border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                                        placeholder="+94 70 123 4567"
                                        autoComplete="tel"
                                    />
                                    <ErrorText>{errors.phone}</ErrorText>
                                </Field>
                            </div>
                        </div>
                    </Section>

                    {/* Address */}
                    <Section
                        title="Address"
                        description="Your primary address will be used for billing and receipts."
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Field
                                label="Address line 1"
                                htmlFor="address_line1"
                                required
                            >
                                <input
                                    id="address_line1"
                                    type="text"
                                    value={data.address_line1}
                                    onChange={(e) =>
                                        setData("address_line1", e.target.value)
                                    }
                                    className="w-full h-16 rounded-[10px] border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                                    placeholder="No. 123, Main Street"
                                    required
                                    autoComplete="address-line1"
                                />
                                <ErrorText>{errors.address_line1}</ErrorText>
                            </Field>

                            <Field
                                label="Address line 2"
                                htmlFor="address_line2"
                            >
                                <input
                                    id="address_line2"
                                    type="text"
                                    value={data.address_line2}
                                    onChange={(e) =>
                                        setData("address_line2", e.target.value)
                                    }
                                    className="w-full h-16 rounded-[10px] border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                                    placeholder="Apartment, suite, etc. (optional)"
                                    autoComplete="address-line2"
                                />
                                <ErrorText>{errors.address_line2}</ErrorText>
                            </Field>

                            <Field label="City" htmlFor="city" required>
                                <input
                                    id="city"
                                    type="text"
                                    value={data.city}
                                    onChange={(e) =>
                                        setData("city", e.target.value)
                                    }
                                    className="w-full h-16 rounded-[10px] border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                                    required
                                    autoComplete="address-level2"
                                />
                                <ErrorText>{errors.city}</ErrorText>
                            </Field>

                            <Field label="State/Province" htmlFor="state">
                                <input
                                    id="state"
                                    type="text"
                                    value={data.state}
                                    onChange={(e) =>
                                        setData("state", e.target.value)
                                    }
                                    className="w-full h-16 rounded-[10px] border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                                    autoComplete="address-level1"
                                />
                                <ErrorText>{errors.state}</ErrorText>
                            </Field>

                            <Field
                                label="Postal code"
                                htmlFor="postal_code"
                                required
                            >
                                <input
                                    id="postal_code"
                                    type="text"
                                    value={data.postal_code}
                                    onChange={(e) =>
                                        setData("postal_code", e.target.value)
                                    }
                                    className="w-full h-16 rounded-[10px] border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                                    required
                                    autoComplete="postal-code"
                                />
                                <ErrorText>{errors.postal_code}</ErrorText>
                            </Field>

                            <Field label="Country" htmlFor="country" required>
                                <input
                                    id="country"
                                    type="text"
                                    value={data.country}
                                    onChange={(e) =>
                                        setData("country", e.target.value)
                                    }
                                    className="w-full h-16 rounded-[10px] border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                                    placeholder="Sri Lanka"
                                    required
                                    autoComplete="country-name"
                                />
                                <ErrorText>{errors.country}</ErrorText>
                            </Field>
                        </div>
                    </Section>

                    {/* Security */}
                    <Section
                        title="Security"
                        description="Change your password to keep your account secure."
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <Field
                                label="Current password"
                                htmlFor="current_password"
                            >
                                <input
                                    id="current_password"
                                    type="password"
                                    value={data.current_password}
                                    onChange={(e) =>
                                        setData(
                                            "current_password",
                                            e.target.value
                                        )
                                    }
                                    className="w-full h-16 rounded-[10px] border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                                    autoComplete="current-password"
                                    aria-invalid={
                                        !!clientErrors.current_password
                                    }
                                />
                                <ErrorText>
                                    {clientErrors.current_password ||
                                        errors.current_password}
                                </ErrorText>
                            </Field>

                            <Field label="New password" htmlFor="new_password">
                                <input
                                    id="new_password"
                                    type="password"
                                    value={data.new_password}
                                    onChange={(e) =>
                                        setData("new_password", e.target.value)
                                    }
                                    className="w-full h-16 rounded-[10px] border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                                    autoComplete="new-password"
                                    aria-invalid={!!clientErrors.new_password}
                                />
                                <ErrorText>
                                    {clientErrors.new_password ||
                                        errors.new_password}
                                </ErrorText>
                            </Field>

                            <Field
                                label="Confirm password"
                                htmlFor="confirm_password"
                            >
                                <input
                                    id="confirm_password"
                                    type="password"
                                    value={data.confirm_password}
                                    onChange={(e) =>
                                        setData(
                                            "confirm_password",
                                            e.target.value
                                        )
                                    }
                                    className="w-full h-16 rounded-[10px] border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                                    autoComplete="new-password"
                                    aria-invalid={
                                        !!clientErrors.confirm_password
                                    }
                                />
                                <ErrorText>
                                    {clientErrors.confirm_password ||
                                        errors.confirm_password}
                                </ErrorText>
                            </Field>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            If you fill any password field, all three are
                            required. Password must be at least 8 characters.
                        </p>
                    </Section>

                    {/* Payment */}
                    <Section
                        title="Payment details"
                        description="Update your saved card details. We recommend using tokenized gateways; do not store raw card numbers."
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <Field
                                label="Cardholder name"
                                htmlFor="cardholder_name"
                                required
                            >
                                <input
                                    id="cardholder_name"
                                    type="text"
                                    value={data.cardholder_name}
                                    onChange={(e) =>
                                        setData(
                                            "cardholder_name",
                                            e.target.value
                                        )
                                    }
                                    className="w-full h-16 rounded-[10px] border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                                    required
                                />
                                <ErrorText>{errors.cardholder_name}</ErrorText>
                            </Field>

                            <Field
                                label="Card brand"
                                htmlFor="card_brand"
                                help="e.g., Visa / Mastercard"
                            >
                                <input
                                    id="card_brand"
                                    type="text"
                                    value={data.card_brand}
                                    onChange={(e) =>
                                        setData("card_brand", e.target.value)
                                    }
                                    className="w-full h-16 rounded-[10px] border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                                    placeholder="Visa / Mastercard"
                                />
                                <ErrorText>{errors.card_brand}</ErrorText>
                            </Field>

                            <Field
                                label="Last 4 digits"
                                htmlFor="card_last4"
                                help="Shown for reference only; store tokens on backend."
                            >
                                <input
                                    id="card_last4"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={4}
                                    value={data.card_last4}
                                    onChange={(e) =>
                                        setData(
                                            "card_last4",
                                            e.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 4)
                                        )
                                    }
                                    className="w-full h-16 rounded-[10px] border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                                    placeholder="1234"
                                />
                                <ErrorText>{errors.card_last4}</ErrorText>
                            </Field>

                            <div className="grid grid-cols-2 gap-6">
                                <Field
                                    label="Expiry month"
                                    htmlFor="expiry_month"
                                >
                                    <input
                                        id="expiry_month"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={2}
                                        value={data.expiry_month}
                                        onChange={(e) =>
                                            setData(
                                                "expiry_month",
                                                e.target.value
                                                    .replace(/\D/g, "")
                                                    .slice(0, 2)
                                            )
                                        }
                                        className="w-full h-16 rounded-[10px] border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                                        placeholder="MM"
                                    />
                                    <ErrorText>{errors.expiry_month}</ErrorText>
                                </Field>
                                <Field
                                    label="Expiry year"
                                    htmlFor="expiry_year"
                                >
                                    <input
                                        id="expiry_year"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={4}
                                        value={data.expiry_year}
                                        onChange={(e) =>
                                            setData(
                                                "expiry_year",
                                                e.target.value
                                                    .replace(/\D/g, "")
                                                    .slice(0, 4)
                                            )
                                        }
                                        className="w-full h-16 rounded-[10px] border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                                        placeholder="YYYY"
                                    />
                                    <ErrorText>{errors.expiry_year}</ErrorText>
                                </Field>
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            Tip: Integrate Stripe/PayHere and collect a payment
                            method token on the frontend; submit that token here
                            instead of card numbers.
                        </p>
                    </Section>

                    {/* Notifications */}
                    <Section
                        title="Notifications"
                        description="Choose how you want to be notified."
                    >
                        <div className="divide-y divide-gray-200">
                            <Toggle
                                label="Email notifications"
                                description="Get updates and receipts in your inbox."
                                checked={data.notify_email}
                                onChange={(v) => setData("notify_email", v)}
                            />
                            <Toggle
                                label="SMS notifications"
                                description="Receive updates via text messages."
                                checked={data.notify_sms}
                                onChange={(v) => setData("notify_sms", v)}
                            />
                            <Toggle
                                label="Push notifications"
                                description="Allow push notifications on this device."
                                checked={data.notify_push}
                                onChange={(v) => setData("notify_push", v)}
                            />
                        </div>
                    </Section>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                reset();
                                setPhotoPreview(user?.avatar_url || null);
                                clearErrors();
                                setClientErrors({});
                            }}
                            className="px-4 py-2 rounded-[10px] text-[14px] font-[700] text-[#0955AC] border border-[#0955AC] disabled:opacity-60"
                            disabled={processing}
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-[10px] text-[14px] font-[700] bg-[#0955AC] text-[#FFFFFF] disabled:opacity-60"
                            disabled={processing}
                        >
                            {processing ? "Saving…" : "Save changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
