import React, { useMemo, useState } from "react";
import { Head, Link, useForm, usePage, router } from "@inertiajs/react";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import bg from "../assets/courierService/bg.png";
import {
    buildQuoteMatrix,
    buildReviewContext,
    computePackageMetrics,
    resolveDetailedQuotes,
} from "./courierPricing";

const Create = () => {
    const { props } = usePage();
    const packageTypes = props.packageTypes || [];
    const countries = props.countries || [];
    const serviceLevels = props.serviceLevels || [];
    const { flash } = props;
    const recentShipmentId = props.recentShipmentId;
    const recentPricingExplanation = props.recentPricingExplanation;
    const packageSectionDescription = "Add one entry per parcel or grouped items.";

    // Currency conversion state
    const [displayCurrency, setDisplayCurrency] = useState('LKR');
    const USD_TO_LKR_RATE = 325; // Exchange rate (you can make this dynamic later)

    // Active package for courier selection
    const [activePackageIndex, setActivePackageIndex] = useState(0);

    const [isPlacing, setIsPlacing] = useState(false);
    const [activeCategory, setActiveCategory] = useState('domestic');

    const scrollToTop = () => {
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "auto" });
        }
    };

    const { data, setData, errors } = useForm({
        sender: {
            name: "",
            email: "",
            phone: "",
            company: "",
            address: {
                line1: "",
                line2: "",
                city: "",
                state: "",
                postalCode: "",
                country: countries[0] || "",
                instructions: "",
            },
        },
        recipient: {
            name: "",
            email: "",
            phone: "",
            company: "",
            address: {
                line1: "",
                line2: "",
                city: "",
                state: "",
                postalCode: "",
                country: countries[0] || "",
                instructions: "",
            },
        },
        shipment: {
            pickupDate: "",
            pickupWindowStart: "",
            pickupWindowEnd: "",
            serviceLevel: serviceLevels[0] || "",
            courierProvider: "",
            currency: "LKR",
            insurance: false,
            deliveryNotes: "",
            estimatedValue: "",
        },
        packages: [
            {
                label: "",
                packageType: packageTypes[0] || "parcel",
                quantity: 1,
                weightKg: "",
                lengthCm: "",
                widthCm: "",
                heightCm: "",
                declaredValue: "",
                description: "",
                courierProvider: "",
                serviceLevel: "",
            },
        ],
    });

    const updatePackage = (index, field, value) => {
        const nextPackages = data.packages.map((item, idx) =>
            idx === index
                ? {
                    ...item,
                    [field]: value,
                }
                : item
        );
        setData("packages", nextPackages);
    };

    const addPackage = () => {
        setData("packages", [
            ...data.packages,
            {
                label: "",
                packageType: packageTypes[0] || "parcel",
                quantity: 1,
                weightKg: "",
                lengthCm: "",
                widthCm: "",
                heightCm: "",
                declaredValue: "",
                description: "",
                courierProvider: "",
                serviceLevel: "",
            },
        ]);
    };

    const removePackage = (index) => {
        if (data.packages.length === 1) {
            return;
        }

        setData(
            "packages",
            data.packages.filter((_, idx) => idx !== index)
        );
    };

    const handleSubmit = (event) => {
        event.preventDefault();
    };

    const quoteCurrency = data.shipment?.currency || "LKR";

    const packageMetrics = useMemo(() => computePackageMetrics(data.packages), [data.packages]);

    const currencyFormatter = useMemo(() => {
        try {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: displayCurrency,
                minimumFractionDigits: 2,
            });
        } catch (error) {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "LKR",
                minimumFractionDigits: 2,
            });
        }
    }, [displayCurrency]);

    const formatCurrency = (value) => {
        if (!Number.isFinite(value)) {
            return currencyFormatter.format(0);
        }

        let convertedValue = value;
        if (displayCurrency === 'LKR') {
            convertedValue = value * USD_TO_LKR_RATE;
        }

        return currencyFormatter.format(convertedValue);
    };

    const toggleCurrency = () => {
        const nextCurrency = displayCurrency === 'USD' ? 'LKR' : 'USD';
        setDisplayCurrency(nextCurrency);
        setData('shipment', {
            ...data.shipment,
            currency: nextCurrency,
        });
    };

    const quoteMatrix = useMemo(
        () => buildQuoteMatrix(data.packages, { metrics: packageMetrics }),
        [data.packages, packageMetrics]
    );

    const selectedQuotes = useMemo(
        () => resolveDetailedQuotes(data.packages, quoteMatrix),
        [data.packages, quoteMatrix]
    );

    const incompletePackages = useMemo(() => {
        if (!Array.isArray(data.packages) || !data.packages.length) {
            return 0;
        }

        return data.packages.filter((pkg) => {
            const quantity = Number(pkg.quantity) || 0;
            const weight = Number(pkg.weightKg) || 0;
            return !(quantity > 0 && weight > 0);
        }).length;
    }, [data.packages]);

    const isReadyToPlace = useMemo(() => {
        if (!Array.isArray(data.packages) || data.packages.length === 0) {
            return false;
        }

        return data.packages.every((pkg) => pkg.courierProvider && pkg.serviceLevel);
    }, [data.packages]);

    const handlePlaceCourier = () => {
        if (!isReadyToPlace || isPlacing) {
            return;
        }

        const basePayload = JSON.parse(JSON.stringify(data));
        const reviewContext = buildReviewContext(selectedQuotes, displayCurrency);

        const payload = {
            ...basePayload,
            reviewContext,
        };

        router.post('/couriers/review', payload, {
            preserveScroll: false,
            onStart: () => setIsPlacing(true),
            onSuccess: scrollToTop,
            onError: scrollToTop,
            onFinish: () => setIsPlacing(false),
        });
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F4F7FB] text-[#0B1739]">
            <Head title="Send a Package" />
            <Header />

            <section className="relative">
                <img
                    src={bg}
                    className="w-full h-[300px] object-cover"
                    alt="Courier service hero"
                />
                <div className="absolute inset-0 bg-[#000000B8]" />
                <div className="absolute inset-0 flex items-center">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl text-white poppins">
                            <p className="uppercase tracking-wide text-xs md:text-sm text-[#6FB3FF]">
                                Courier Service
                            </p>
                            <h1 className="text-3xl md:text-5xl font-semibold mt-4 leading-tight">
                                Schedule a pickup and send packages worldwide
                            </h1>
                            <p className="mt-4 text-sm md:text-base text-white/80">
                                Provide pickup, delivery, and package details in a few quick steps.
                                We will match your request with the best courier option and send
                                confirmations straight to your inbox.
                            </p>
                            <div className="mt-6">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 text-xs md:text-sm text-white/70 hover:text-white transition"
                                >
                                    ← Back to home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <main className="container mx-auto px-4 mt-16 mb-16 flex-1">
                <div className="bg-white shadow-xl rounded-2xl px-6 md:px-10 py-10 poppins">
                    {flash?.success && (
                        <div className="mb-6 space-y-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            <p>{flash.success}</p>
                            {props.recentReference && (
                                <p className="font-semibold">
                                    Reference: {props.recentReference}
                                </p>
                            )}
                            {recentShipmentId && (
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <span className="text-xs text-green-800">
                                        Download the courier bill to keep a record of this request.
                                    </span>
                                    <a
                                        href={`/couriers/${recentShipmentId}/bill`}
                                        className="inline-flex items-center justify-center rounded-lg bg-[#0955AC] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0a4b93]"
                                    >
                                        Download bill
                                    </a>
                                </div>
                            )}
                            {recentPricingExplanation && (
                                <div className="rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] p-3 text-xs text-[#1E3A8A]">
                                    <p className="font-semibold">Pricing enforcement summary</p>
                                    <p className="mt-1">Mode: {recentPricingExplanation.mode === "lane_matrix" ? "Lane Matrix" : "Selected Quotes"}</p>
                                    {recentPricingExplanation.reason && (
                                        <p className="mt-1">Reason: {recentPricingExplanation.reason}</p>
                                    )}
                                    {recentPricingExplanation.distanceKm !== null && recentPricingExplanation.distanceKm !== undefined && (
                                        <p className="mt-1">Distance: {Number(recentPricingExplanation.distanceKm).toFixed(1)} km</p>
                                    )}
                                    {recentPricingExplanation.matchedRule && (
                                        <div className="mt-2 grid grid-cols-1 gap-1 md:grid-cols-2">
                                            <p>Lane: {recentPricingExplanation.matchedRule.originZone} → {recentPricingExplanation.matchedRule.destinationZone}</p>
                                            <p>Service: {recentPricingExplanation.matchedRule.serviceLevelKey || "any"}</p>
                                            <p>Band: {Number(recentPricingExplanation.matchedRule.distanceFromKm || 0).toFixed(1)} - {recentPricingExplanation.matchedRule.distanceToKm === null || recentPricingExplanation.matchedRule.distanceToKm === undefined ? "*" : Number(recentPricingExplanation.matchedRule.distanceToKm).toFixed(1)} km</p>
                                            <p>Estimate (USD): {Number(recentPricingExplanation.totalEstimatedUsd || 0).toFixed(2)}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-10">

                        <section className="space-y-6">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-2xl font-semibold text-[#0B1739]">Package details</h2>
                                    <p className="mt-2 text-sm text-[#5B6887]">
                                        {packageSectionDescription}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={addPackage}
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#0955AC] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0a4b93]"
                                >
                                    + Add package
                                </button>
                            </div>

                            <div className="space-y-8">
                                {data.packages.map((item, index) => (
                                    <div
                                        key={`package-${index}`}
                                        className="rounded-2xl border border-[#D6DEEB] px-5 py-6 shadow-sm"
                                    >
                                        <div className="mb-6 flex items-center justify-between">
                                            <h3 className="text-lg font-semibold text-[#0B1739]">
                                                Package {index + 1}
                                            </h3>
                                            <button
                                                type="button"
                                                onClick={() => removePackage(index)}
                                                className="text-sm text-red-500 hover:text-red-600 disabled:text-red-300"
                                                disabled={data.packages.length === 1}
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    Label
                                                </label>
                                                <input
                                                    type="text"
                                                    value={item.label}
                                                    onChange={(e) =>
                                                        updatePackage(index, "label", e.target.value)
                                                    }
                                                    className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                    placeholder="Office documents"
                                                />
                                                {errors[`packages.${index}.label`] && (
                                                    <p className="mt-2 text-sm text-red-500">
                                                        {errors[`packages.${index}.label`]}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    Type
                                                </label>
                                                <select
                                                    value={item.packageType}
                                                    onChange={(e) =>
                                                        updatePackage(index, "packageType", e.target.value)
                                                    }
                                                    className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                >
                                                    {packageTypes.map((type) => (
                                                        <option key={`pkg-type-${type}`} value={type}>
                                                            {type}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors[`packages.${index}.packageType`] && (
                                                    <p className="mt-2 text-sm text-red-500">
                                                        {errors[`packages.${index}.packageType`]}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    Quantity *
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) =>
                                                        updatePackage(
                                                            index,
                                                            "quantity",
                                                            parseInt(e.target.value, 10) || 1
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                />
                                                {errors[`packages.${index}.quantity`] && (
                                                    <p className="mt-2 text-sm text-red-500">
                                                        {errors[`packages.${index}.quantity`]}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    Weight (kg) *
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.weightKg}
                                                    onChange={(e) =>
                                                        updatePackage(index, "weightKg", e.target.value)
                                                    }
                                                    className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                    placeholder="5.5"
                                                />
                                                {errors[`packages.${index}.weightKg`] && (
                                                    <p className="mt-2 text-sm text-red-500">
                                                        {errors[`packages.${index}.weightKg`]}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    Length (cm)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={item.lengthCm}
                                                    onChange={(e) =>
                                                        updatePackage(index, "lengthCm", e.target.value)
                                                    }
                                                    className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                />
                                                {errors[`packages.${index}.lengthCm`] && (
                                                    <p className="mt-2 text-sm text-red-500">
                                                        {errors[`packages.${index}.lengthCm`]}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    Width (cm)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={item.widthCm}
                                                    onChange={(e) =>
                                                        updatePackage(index, "widthCm", e.target.value)
                                                    }
                                                    className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                />
                                                {errors[`packages.${index}.widthCm`] && (
                                                    <p className="mt-2 text-sm text-red-500">
                                                        {errors[`packages.${index}.widthCm`]}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    Height (cm)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={item.heightCm}
                                                    onChange={(e) =>
                                                        updatePackage(index, "heightCm", e.target.value)
                                                    }
                                                    className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                />
                                                {errors[`packages.${index}.heightCm`] && (
                                                    <p className="mt-2 text-sm text-red-500">
                                                        {errors[`packages.${index}.heightCm`]}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">
                                                    Declared value ({quoteCurrency})
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={item.declaredValue}
                                                    onChange={(e) =>
                                                        updatePackage(index, "declaredValue", e.target.value)
                                                    }
                                                    className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                />
                                                {errors[`packages.${index}.declaredValue`] && (
                                                    <p className="mt-2 text-sm text-red-500">
                                                        {errors[`packages.${index}.declaredValue`]}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="md:col-span-3">
                                                <label className="mb-2 block text-sm font-medium">
                                                    Description
                                                </label>
                                                <textarea
                                                    rows="3"
                                                    value={item.description}
                                                    onChange={(e) =>
                                                        updatePackage(index, "description", e.target.value)
                                                    }
                                                    className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                    placeholder="Fragile glassware, keep upright"
                                                />
                                                {errors[`packages.${index}.description`] && (
                                                    <p className="mt-2 text-sm text-red-500">
                                                        {errors[`packages.${index}.description`]}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {packageMetrics.totalWeight > 0 && (
                                <div className="flex flex-col gap-4 rounded-xl border border-[#D6DEEB] bg-[#EEF3FC] px-6 py-4 text-sm text-[#0B1739] md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-[#0955AC]">
                                            Shipment summary
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-4">
                                            <span>
                                                Packages: <strong>{packageMetrics.totalPackages}</strong>
                                            </span>
                                            <span>
                                                Weight: <strong>{packageMetrics.totalWeight.toFixed(2)} kg</strong>
                                            </span>
                                            <span>
                                                Billable weight: <strong>{packageMetrics.billableWeight.toFixed(2)} kg</strong>
                                            </span>
                                            {packageMetrics.volumetricWeight > packageMetrics.totalWeight && (
                                                <span>
                                                    Volumetric: <strong>{packageMetrics.volumetricWeight.toFixed(2)} kg</strong>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {packageMetrics.requiresSpecialHandling && (
                                        <div className="rounded-lg bg-[#F8E7D8] px-4 py-2 text-xs font-medium text-[#7B3F00]">
                                            Includes freight or temperature-controlled cargo
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        <section className="rounded-2xl border border-[#E3EAF5] bg-[#F9FBFF] px-6 py-8">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-[#0B1739]">
                                        Courier service quotes
                                    </h2>
                                    <p className="mt-2 text-sm text-[#5B6887]">
                                        {packageMetrics.readyForQuote
                                            ? "Select courier services for each package. Switch between packages using the tabs below."
                                            : `Provide quantity and weight for each package to generate live carrier rates.`}
                                    </p>
                                </div>
                                {packageMetrics.readyForQuote && (
                                    <button
                                        type="button"
                                        onClick={toggleCurrency}
                                        className="rounded-lg border border-[#E3EAF5] bg-white px-4 py-2 text-xs font-semibold text-[#5B6887] shadow-sm hover:bg-[#F9FBFF] hover:border-[#0955AC] hover:text-[#0955AC] transition-all duration-200 cursor-pointer"
                                        title={`Click to convert to ${displayCurrency === 'USD' ? 'LKR' : 'USD'}`}
                                    >
                                        Rates in {displayCurrency} {displayCurrency === 'LKR' && '(≈ 1 USD = 325 LKR)'}
                                        <span className="ml-2 text-[10px] opacity-60">↻</span>
                                    </button>
                                )}
                            </div>

                            {quoteMatrix.length === 0 ? (
                                <div className="mt-6 rounded-lg border border-dashed border-[#B8C5E0] bg-white px-5 py-6 text-sm text-[#5B6887]">
                                    {incompletePackages > 0
                                        ? `Add quantity and weight for all packages (${incompletePackages} incomplete) to view available logistic courier services.`
                                        : "Add package details to view available logistic courier services."}
                                </div>
                            ) : (
                                <div className="mt-8 space-y-8">
                                    {/* Package Tabs */}
                                    {quoteMatrix.length > 1 && (
                                        <div className="border-b border-[#E8F0FE]">
                                            <nav className="flex space-x-8 overflow-x-auto">
                                                {quoteMatrix.map((packageQuotes) => {
                                                    const isActive = activePackageIndex === packageQuotes.packageIndex;
                                                    const hasSelection = data.packages[packageQuotes.packageIndex]?.courierProvider;

                                                    return (
                                                        <button
                                                            key={packageQuotes.packageIndex}
                                                            type="button"
                                                            onClick={() => setActivePackageIndex(packageQuotes.packageIndex)}
                                                            className={`flex items-center gap-3 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${isActive
                                                                    ? 'border-[#0955AC] text-[#0955AC]'
                                                                    : 'border-transparent text-[#5B6887] hover:border-[#D6DEEB] hover:text-[#0B1739]'
                                                                }`}
                                                        >
                                                            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${isActive
                                                                    ? 'bg-[#0955AC] text-white'
                                                                    : hasSelection
                                                                        ? 'bg-green-500 text-white'
                                                                        : 'bg-[#E8F0FE] text-[#5B6887]'
                                                                }`}>
                                                                {hasSelection && !isActive ? (
                                                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                ) : (
                                                                    packageQuotes.packageIndex + 1
                                                                )}
                                                            </div>
                                                            <div className="text-left">
                                                                <div className="font-medium">
                                                                    {packageQuotes.packageInfo.label}
                                                                </div>
                                                                <div className="text-xs text-[#6B7893]">
                                                                    {packageQuotes.packageInfo.weight.toFixed(1)}kg
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </nav>
                                        </div>
                                    )}

                                    {/* Inline Comparison Table — Compact */}
                                    {(() => {
                                        const activePackageQuotes = quoteMatrix.find(item => item.packageIndex === activePackageIndex) || quoteMatrix[0];
                                        if (!activePackageQuotes) return null;

                                        const TIER_IDS = ['economy', 'express', 'priority'];
                                        const TIER_META = {
                                            economy: { label: 'Economy', color: 'text-emerald-700' },
                                            express: { label: 'Express', color: 'text-blue-700' },
                                            priority: { label: 'Priority', color: 'text-purple-700' },
                                        };

                                        const domesticProviders = activePackageQuotes.providers.filter(p => p.category === 'domestic');
                                        const logisticProviders = activePackageQuotes.providers.filter(p => p.category === 'logistic');
                                        const currentPackage = data.packages[activePackageQuotes.packageIndex];

                                        const cheapestByTierInGroup = (providers, tierId) => {
                                            const prices = providers
                                                .map(p => (p.tiers.find(t => t.id === tierId) || {}).price)
                                                .filter(v => v !== undefined);
                                            return prices.length ? Math.min(...prices) : Infinity;
                                        };

                                        const renderCategoryTable = (providers, categoryLabel, accentColor, accentBg) => {
                                            if (!providers.length) return null;
                                            const cheapest = Object.fromEntries(TIER_IDS.map(id => [id, cheapestByTierInGroup(providers, id)]));

                                            return (
                                                <div className="rounded-xl border border-[#E8F0FE] overflow-hidden">
                                                    {/* ── Mobile: provider card, tier rows ── */}
                                                    <div className="sm:hidden divide-y divide-[#F0F4F8]">
                                                        {providers.map((provider) => (
                                                            <div key={provider.id} className="bg-white">
                                                                {/* Provider header strip */}
                                                                <div className="flex items-center gap-2 px-3 py-2" style={{ backgroundColor: accentBg }}>
                                                                    {provider.logo ? (
                                                                        <img src={provider.logo} alt={provider.name} className="h-5 w-auto max-w-[38px] object-contain" loading="lazy" />
                                                                    ) : (
                                                                        <div className="flex h-5 w-8 shrink-0 items-center justify-center rounded text-[9px] font-bold text-white" style={{ backgroundColor: provider.brandColor }}>
                                                                            {provider.name.slice(0, 2).toUpperCase()}
                                                                        </div>
                                                                    )}
                                                                    <div className="min-w-0">
                                                                        <div className="text-xs font-semibold text-[#0B1739] truncate">{provider.name}</div>
                                                                        <div className="text-[10px] text-[#6B7893] truncate">{provider.coverage}</div>
                                                                    </div>
                                                                </div>
                                                                {/* Tier rows */}
                                                                <div className="divide-y divide-[#F7F9FC]">
                                                                    {TIER_IDS.map(tierId => {
                                                                        const tier = provider.tiers.find(t => t.id === tierId);
                                                                        if (!tier) return null;
                                                                        const isBest = tier.price === cheapest[tierId];
                                                                        const diff = tier.price - cheapest[tierId];
                                                                        const isSelected =
                                                                            currentPackage?.courierProvider === provider.id &&
                                                                            currentPackage?.serviceLevel === tierId;
                                                                        return (
                                                                            <button
                                                                                key={tierId}
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const updatedPackages = [...data.packages];
                                                                                    updatedPackages[activePackageQuotes.packageIndex] = {
                                                                                        ...updatedPackages[activePackageQuotes.packageIndex],
                                                                                        courierProvider: provider.id,
                                                                                        serviceLevel: tierId,
                                                                                    };
                                                                                    setData('packages', updatedPackages);
                                                                                }}
                                                                                className={`flex w-full items-center px-3 py-2 text-left transition-colors ${isSelected
                                                                                        ? 'bg-[#0955AC]'
                                                                                        : isBest
                                                                                            ? 'bg-emerald-50 active:bg-emerald-100'
                                                                                            : 'bg-white active:bg-[#F0F7FF]'
                                                                                    }`}
                                                                            >
                                                                                {/* Tier label — fixed width */}
                                                                                <span className={`text-[11px] font-semibold shrink-0 w-[62px] ${isSelected ? 'text-white' : TIER_META[tierId].color}`}>
                                                                                    {TIER_META[tierId].label}
                                                                                </span>
                                                                                {/* Spacer */}
                                                                                <span className="flex-1" />
                                                                                {/* Price + status stacked, fixed width */}
                                                                                <div className="shrink-0 text-right ml-2 w-[90px]">
                                                                                    <div className={`text-[11px] font-bold leading-tight ${isSelected ? 'text-white' : 'text-[#0B1739]'}`}>
                                                                                        {formatCurrency(tier.price)}
                                                                                    </div>
                                                                                    {isSelected ? (
                                                                                        <div className="text-[9px] text-white/70">✓ Selected</div>
                                                                                    ) : isBest ? (
                                                                                        <div className="text-[9px] font-bold text-emerald-700">● best price</div>
                                                                                    ) : diff > 0 ? (
                                                                                        <div className="text-[9px] text-[#8C97B0]">+{formatCurrency(diff)}</div>
                                                                                    ) : null}
                                                                                </div>
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* ── Desktop: compact table ── */}
                                                    <div className="hidden sm:block overflow-x-auto">
                                                        <table className="w-full border-collapse text-xs">
                                                            <thead>
                                                                <tr style={{ backgroundColor: accentBg }}>
                                                                    <th className="px-3 py-2 text-left text-[#0B1739] font-semibold w-40">Provider</th>
                                                                    {TIER_IDS.map(id => (
                                                                        <th key={id} className={`px-2 py-2 text-center font-semibold ${TIER_META[id].color}`}>
                                                                            {TIER_META[id].label}
                                                                        </th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {providers.map((provider, rowIdx) => (
                                                                    <tr key={provider.id} className={`transition-colors hover:bg-[#F9FBFF] ${rowIdx < providers.length - 1 ? 'border-b border-[#F0F4F8]' : ''}`}>
                                                                        <td className="px-3 py-2">
                                                                            <div className="flex items-center gap-2">
                                                                                {provider.logo ? (
                                                                                    <img src={provider.logo} alt={provider.name} className="h-5 w-auto max-w-[40px] object-contain" loading="lazy" />
                                                                                ) : (
                                                                                    <div className="flex h-5 w-8 shrink-0 items-center justify-center rounded text-[9px] font-bold text-white" style={{ backgroundColor: provider.brandColor }}>
                                                                                        {provider.name.slice(0, 2).toUpperCase()}
                                                                                    </div>
                                                                                )}
                                                                                <div className="min-w-0">
                                                                                    <div className="font-semibold text-[#0B1739] truncate leading-tight">{provider.name}</div>
                                                                                    <div className="text-[10px] text-[#6B7893] truncate">{provider.coverage}</div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        {TIER_IDS.map(tierId => {
                                                                            const tier = provider.tiers.find(t => t.id === tierId);
                                                                            if (!tier) return <td key={tierId} className="px-2 py-2 text-center text-[#C5CDE0]">—</td>;
                                                                            const isBest = tier.price === cheapest[tierId];
                                                                            const diff = tier.price - cheapest[tierId];
                                                                            const isSelected =
                                                                                currentPackage?.courierProvider === provider.id &&
                                                                                currentPackage?.serviceLevel === tierId;
                                                                            return (
                                                                                <td key={tierId} className="px-1.5 py-1.5 text-center">
                                                                                    <button
                                                                                        type="button"
                                                                                        title={`${provider.name} — ${TIER_META[tierId].label} · ${tier.eta}`}
                                                                                        onClick={() => {
                                                                                            const updatedPackages = [...data.packages];
                                                                                            updatedPackages[activePackageQuotes.packageIndex] = {
                                                                                                ...updatedPackages[activePackageQuotes.packageIndex],
                                                                                                courierProvider: provider.id,
                                                                                                serviceLevel: tierId,
                                                                                            };
                                                                                            setData('packages', updatedPackages);
                                                                                        }}
                                                                                        className={`inline-flex w-full flex-col items-center rounded-lg border px-1.5 py-1.5 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:ring-offset-1 ${isSelected
                                                                                                ? 'border-[#0955AC] bg-[#0955AC] shadow-sm'
                                                                                                : isBest
                                                                                                    ? 'border-emerald-400 bg-emerald-50 hover:bg-emerald-100'
                                                                                                    : 'border-[#E8F0FE] bg-white hover:border-[#0955AC]/30 hover:bg-[#F9FBFF]'
                                                                                            }`}
                                                                                    >
                                                                                        <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-white' : 'text-[#0B1739]'}`}>
                                                                                            {formatCurrency(tier.price)}
                                                                                        </span>
                                                                                        <span className={`text-[9px] leading-tight ${isSelected ? 'text-white/70' : 'text-[#6B7893]'}`}>
                                                                                            {tier.eta}
                                                                                        </span>
                                                                                        {isSelected ? (
                                                                                            <span className="text-[9px] text-white/80">✓</span>
                                                                                        ) : isBest ? (
                                                                                            <span className="text-[9px] font-bold text-emerald-700">best</span>
                                                                                        ) : diff > 0 ? (
                                                                                            <span className="text-[9px] text-[#8C97B0]">+{formatCurrency(diff)}</span>
                                                                                        ) : null}
                                                                                    </button>
                                                                                </td>
                                                                            );
                                                                        })}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            );
                                        };

                                        const hasDomestic = domesticProviders.length > 0;
                                        const hasLogistic = logisticProviders.length > 0;
                                        const currentCategory = (activeCategory === 'domestic' && hasDomestic) ? 'domestic'
                                            : (activeCategory === 'logistic' && hasLogistic) ? 'logistic'
                                                : hasDomestic ? 'domestic' : 'logistic';

                                        return (
                                            <div className="space-y-3">
                                                {/* Category switch + legend row */}
                                                <div className="flex flex-col md:flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                    {/* Switch buttons — full width on mobile */}
                                                    <div className="flex w-full sm:w-auto rounded-lg border border-[#E8F0FE] bg-[#F4F7FB] p-0.5">
                                                        {hasDomestic && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setActiveCategory('domestic')}
                                                                className={`flex-1 sm:flex-none rounded-md px-4 py-1.5 text-xs font-semibold transition-all duration-150 ${currentCategory === 'domestic'
                                                                        ? 'bg-white text-[#2563EB] shadow-sm'
                                                                        : 'text-[#5B6887] hover:text-[#0B1739]'
                                                                    }`}
                                                            >
                                                                Domestic
                                                            </button>
                                                        )}
                                                        {hasLogistic && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setActiveCategory('logistic')}
                                                                className={`flex-1 sm:flex-none rounded-md px-4 py-1.5 text-xs font-semibold transition-all duration-150 ${currentCategory === 'logistic'
                                                                        ? 'bg-white text-[#0955AC] shadow-sm'
                                                                        : 'text-[#5B6887] hover:text-[#0B1739]'
                                                                    }`}
                                                            >
                                                                Logistic
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Compact legend */}
                                                    <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-[11px] text-[#6B7893]">
                                                        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>Best price</span>
                                                        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#0955AC]"></span>Selected</span>
                                                        <span className="hidden sm:inline text-[#9CA3AF]">· Hover for ETA</span>
                                                    </div>
                                                </div>

                                                {currentCategory === 'domestic' && renderCategoryTable(domesticProviders, 'Domestic', '#2563EB', '#EFF6FF')}
                                                {currentCategory === 'logistic' && renderCategoryTable(logisticProviders, 'Logistic', '#0955AC', '#F0F7FF')}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* Selected Services Summary */}
                            {selectedQuotes.length > 0 && (
                                <div className="mt-8 space-y-4">
                                    <h3 className="text-lg font-semibold text-[#0B1739]">Selected Services Summary</h3>
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                        {selectedQuotes.map((quote) => (
                                            <div key={quote.packageIndex} className="rounded-lg border border-[#D6DEEB] bg-white p-4 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        {quote.provider.logo && (
                                                            <img
                                                                src={quote.provider.logo}
                                                                alt={`${quote.provider.name} logo`}
                                                                className="h-6 w-auto object-contain"
                                                                loading="lazy"
                                                            />
                                                        )}
                                                        <div>
                                                            <div className="font-medium text-[#0B1739]">{quote.packageInfo.label}</div>
                                                            <div className="text-xs text-[#6B7893]">
                                                                {quote.provider.name} · {quote.tier.label}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-[#0B1739]">
                                                            {formatCurrency(quote.tier.price)}
                                                        </div>
                                                        <div className="text-xs text-[#6B7893]">{quote.tier.eta}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="rounded-lg border-2 border-[#0955AC] bg-gradient-to-r from-[#F0F7FF] to-[#E6F3FF] p-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold text-[#0B1739]">Total Shipping Cost</span>
                                            <span className="text-2xl font-bold text-[#0955AC]">
                                                {formatCurrency(selectedQuotes.reduce((total, quote) => total + quote.tier.price, 0))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        <p className="text-center text-xs text-[#5B6887]">
                            Rates are indicative and will be finalized once pickup and delivery details are confirmed; carrier fuel and customs surcharges may vary by route.
                        </p>

                        <div className="mt-8 flex flex-col items-center gap-3">
                            <button
                                type="button"
                                onClick={handlePlaceCourier}
                                disabled={!isReadyToPlace || isPlacing}
                                className={`w-full max-w-sm rounded-lg bg-[#0955AC] px-6 py-3 text-center text-sm font-semibold text-white shadow-lg transition focus:outline-none focus:ring-2 focus:ring-[#0a4b93] focus:ring-offset-2 ${!isReadyToPlace || isPlacing ? 'cursor-not-allowed opacity-50' : 'hover:bg-[#0a4b93]'
                                    }`}
                            >
                                {isPlacing ? 'Preparing summary...' : 'Continue'}
                            </button>
                            {!isReadyToPlace && (
                                <p className="text-xs text-[#D14343]">
                                    Select a courier service for each package to continue.
                                </p>
                            )}
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Create;
