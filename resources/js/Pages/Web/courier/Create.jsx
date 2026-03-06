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
    const packageSectionDescription = "Add one entry per parcel or grouped items.";
    
    // Currency conversion state
    const [displayCurrency, setDisplayCurrency] = useState('LKR');
    const USD_TO_LKR_RATE = 325; // Exchange rate (you can make this dynamic later)
    
    // Active package for courier selection
    const [activePackageIndex, setActivePackageIndex] = useState(0);
    
    // Comparison modal state
    const [showComparison, setShowComparison] = useState(false);
    const [comparisonServices, setComparisonServices] = useState([]);
    const [comparisonPackageIndex, setComparisonPackageIndex] = useState(null);
    const [isPlacing, setIsPlacing] = useState(false);

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
    
    const openComparison = (packageIndex) => {
        setComparisonPackageIndex(packageIndex);
        setComparisonServices([]);
        setShowComparison(true);
    };
    
    const addToComparison = (provider, tier) => {
        if (comparisonServices.length < 2) {
            const service = { provider, tier };
            setComparisonServices(prev => [...prev, service]);
        }
    };
    
    const removeFromComparison = (index) => {
        setComparisonServices(prev => prev.filter((_, i) => i !== index));
    };
    
    const closeComparison = () => {
        setShowComparison(false);
        setComparisonServices([]);
        setComparisonPackageIndex(null);
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
                                        ? `Add quantity and weight for all packages (${incompletePackages} incomplete) to view available international courier services.`
                                        : "Add package details to view available international courier services."}
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
                                                            className={`flex items-center gap-3 whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                                                                isActive
                                                                    ? 'border-[#0955AC] text-[#0955AC]'
                                                                    : 'border-transparent text-[#5B6887] hover:border-[#D6DEEB] hover:text-[#0B1739]'
                                                            }`}
                                                        >
                                                            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                                                                isActive 
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

                                    {/* Active Package Content */}
                                    {(() => {
                                        const activePackageQuotes = quoteMatrix.find(item => item.packageIndex === activePackageIndex) || quoteMatrix[0];
                                        if (!activePackageQuotes) return null;

                                        return (
                                            <div className="space-y-6">
                                                {/* Package Info Header */}
                                                <div className="rounded-xl border border-[#E8F0FE] bg-white p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0955AC] text-white font-bold">
                                                                {activePackageQuotes.packageIndex + 1}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-[#0B1739]">
                                                                    {activePackageQuotes.packageInfo.label}
                                                                </h3>
                                                                <p className="text-sm text-[#5B6887]">
                                                                    Weight: {activePackageQuotes.packageInfo.weight.toFixed(2)} kg
                                                                    {activePackageQuotes.packageInfo.billableWeight !== activePackageQuotes.packageInfo.weight && 
                                                                        ` • Billable: ${activePackageQuotes.packageInfo.billableWeight.toFixed(2)} kg`
                                                                    }
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => openComparison(activePackageQuotes.packageIndex)}
                                                            className="inline-flex items-center gap-2 rounded-lg border border-[#0955AC] bg-white px-4 py-2 text-sm font-semibold text-[#0955AC] transition hover:bg-[#0955AC] hover:text-white"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                            </svg>
                                                            Compare Services
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Courier Grid - Compact 2x4 Layout */}
                                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                                    {activePackageQuotes.providers.map((provider) => (
                                                        <div
                                                            key={`${activePackageQuotes.packageIndex}-${provider.id}`}
                                                            className="rounded-2xl border-2 border-[#E8F0FE] bg-white p-5 shadow-sm transition-all duration-300 hover:border-[#0955AC]/20 hover:shadow-md"
                                                        >
                                                            {/* Provider Header - Compact */}
                                                            <div className="mb-4 flex items-center gap-3">
                                                                {provider.logo && (
                                                                    <div className="flex h-12 w-16 items-center justify-center rounded-lg border border-[#F0F4F8] bg-white">
                                                                        <img
                                                                            src={provider.logo}
                                                                            alt={`${provider.name} logo`}
                                                                            className="h-8 w-auto object-contain"
                                                                            loading="lazy"
                                                                        />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1">
                                                                    <h4 className="font-bold text-[#0B1739]">{provider.name}</h4>
                                                                    <p className="text-xs text-[#6B7893]">{provider.coverage}</p>
                                                                </div>
                                                            </div>

                                                            {/* Service Tiers - Horizontal Layout */}
                                                            <div className="space-y-3">
                                                                {provider.tiers.map((tier) => {
                                                                    const currentPackage = data.packages[activePackageQuotes.packageIndex];
                                                                    const isSelected =
                                                                        provider.id === currentPackage?.courierProvider &&
                                                                        tier.id === currentPackage?.serviceLevel;

                                                                    return (
                                                                        <button
                                                                            type="button"
                                                                            key={`${activePackageQuotes.packageIndex}-${provider.id}-${tier.id}`}
                                                                            onClick={() => {
                                                                                const updatedPackages = [...data.packages];
                                                                                updatedPackages[activePackageQuotes.packageIndex] = {
                                                                                    ...updatedPackages[activePackageQuotes.packageIndex],
                                                                                    courierProvider: provider.id,
                                                                                    serviceLevel: tier.id,
                                                                                };
                                                                                setData("packages", updatedPackages);
                                                                            }}
                                                                            className={`w-full rounded-xl border-2 p-4 text-left transition-all duration-200 ${ 
                                                                                isSelected
                                                                                    ? 'border-[#0955AC] bg-[#0955AC] text-white shadow-lg'
                                                                                    : 'border-[#E8F0FE] bg-white hover:border-[#0955AC]/30 hover:bg-[#F9FBFF] hover:shadow-sm'
                                                                            }`}
                                                                        >
                                                                            {/* Header Row */}
                                                                            <div className="flex items-center justify-between mb-4">
                                                                                <div className="flex items-center gap-3">
                                                                                    <span 
                                                                                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${ 
                                                                                            isSelected ? 'bg-white text-[#0955AC]' : 'text-white'
                                                                                        }`}
                                                                                        style={{ backgroundColor: isSelected ? 'white' : provider.brandColor }}
                                                                                    >
                                                                                        {tier.label.charAt(0)}
                                                                                    </span>
                                                                                    <div>
                                                                                        <div className={`font-bold text-base ${ 
                                                                                            isSelected ? 'text-white' : 'text-[#0B1739]'
                                                                                        }`}>
                                                                                            {tier.label}
                                                                                        </div>
                                                                                        <div className={`text-sm font-medium ${ 
                                                                                            isSelected ? 'text-white/90' : 'text-[#0955AC]'
                                                                                        }`}>
                                                                                            {tier.eta}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="text-right">
                                                                                    <div className={`text-xl font-black ${ 
                                                                                        isSelected ? 'text-white' : 'text-[#0B1739]'
                                                                                    }`}>
                                                                                        {formatCurrency(tier.price)}
                                                                                    </div>
                                                                                    {isSelected && (
                                                                                        <div className="text-xs text-white/80 font-medium">SELECTED</div>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {/* Description */}
                                                                            <div className={`text-sm leading-relaxed mb-4 ${ 
                                                                                isSelected ? 'text-white/90' : 'text-[#5B6887]'
                                                                            }`}>
                                                                                {tier.description}
                                                                            </div>

                                                                            {/* Price Breakdown - Detailed */}
                                                                            <div className={`rounded-lg p-3 ${ 
                                                                                isSelected ? 'bg-white/10 backdrop-blur-sm' : 'bg-[#F8FAFC]'
                                                                            }`}>
                                                                                <h4 className={`text-xs font-semibold uppercase tracking-wide mb-3 ${ 
                                                                                    isSelected ? 'text-white/80' : 'text-[#5B6887]'
                                                                                }`}>
                                                                                    Price Calculation
                                                                                </h4>
                                                                                <div className={`space-y-2 text-sm ${ 
                                                                                    isSelected ? 'text-white/90' : 'text-[#6B7893]'
                                                                                }`}>
                                                                                    <div className="flex justify-between items-center">
                                                                                        <span>Base Rate</span>
                                                                                        <span className={`font-medium ${ 
                                                                                            isSelected ? 'text-white' : 'text-[#0B1739]'
                                                                                        }`}>
                                                                                            {formatCurrency(tier.breakdown.base)}
                                                                                        </span>
                                                                                    </div>
                                                                                    <div className="flex justify-between items-center">
                                                                                        <span>Weight ({activePackageQuotes.packageInfo.billableWeight.toFixed(1)}kg × {formatCurrency(tier.perKg)}/kg)</span>
                                                                                        <span className={`font-medium ${ 
                                                                                            isSelected ? 'text-white' : 'text-[#0B1739]'
                                                                                        }`}>
                                                                                            {formatCurrency(tier.breakdown.weight)}
                                                                                        </span>
                                                                                    </div>
                                                                                    {activePackageQuotes.packageInfo.billableWeight > 25 && (
                                                                                        <div className="flex justify-between items-center">
                                                                                            <span>Oversized Fee (&gt;25kg)</span>
                                                                                            <span className={`font-medium ${ 
                                                                                                isSelected ? 'text-white' : 'text-[#0B1739]'
                                                                                            }`}>
                                                                                                {formatCurrency((activePackageQuotes.packageInfo.billableWeight - 25) * 0.75)}
                                                                                            </span>
                                                                                        </div>
                                                                                    )}
                                                                                    {data.packages[activePackageQuotes.packageIndex]?.packageType === 'temperature_controlled' && (
                                                                                        <div className="flex justify-between items-center">
                                                                                            <span>Special Handling</span>
                                                                                            <span className={`font-medium ${ 
                                                                                                isSelected ? 'text-white' : 'text-[#0B1739]'
                                                                                            }`}>
                                                                                                {formatCurrency(12)}
                                                                                            </span>
                                                                                        </div>
                                                                                    )}
                                                                                    {data.packages[activePackageQuotes.packageIndex]?.packageType === 'freight' && (
                                                                                        <div className="flex justify-between items-center">
                                                                                            <span>Freight Handling</span>
                                                                                            <span className={`font-medium ${ 
                                                                                                isSelected ? 'text-white' : 'text-[#0B1739]'
                                                                                            }`}>
                                                                                                {formatCurrency(12)}
                                                                                            </span>
                                                                                        </div>
                                                                                    )}
                                                                                    <div className={`pt-2 border-t flex justify-between items-center font-bold text-base ${ 
                                                                                        isSelected 
                                                                                            ? 'border-white/20 text-white' 
                                                                                            : 'border-[#E8F0FE] text-[#0B1739]'
                                                                                    }`}>
                                                                                        <span>Total Cost</span>
                                                                                        <span>{formatCurrency(tier.price)}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
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
                                className={`w-full max-w-sm rounded-lg bg-[#0955AC] px-6 py-3 text-center text-sm font-semibold text-white shadow-lg transition focus:outline-none focus:ring-2 focus:ring-[#0a4b93] focus:ring-offset-2 ${
                                    !isReadyToPlace || isPlacing ? 'cursor-not-allowed opacity-50' : 'hover:bg-[#0a4b93]'
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

            {/* Comparison Modal */}
            {showComparison && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
                        <div className="sticky top-0 z-10 border-b border-[#E8F0FE] bg-white px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-[#0B1739]">Compare Courier Services</h2>
                                    <p className="text-sm text-[#5B6887]">
                                        {comparisonPackageIndex !== null && quoteMatrix.find(item => item.packageIndex === comparisonPackageIndex)?.packageInfo.label}
                                        {comparisonServices.length < 2 && ` - Select ${2 - comparisonServices.length} more service${2 - comparisonServices.length === 1 ? '' : 's'} to compare`}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={closeComparison}
                                    className="rounded-lg p-2 text-[#5B6887] transition hover:bg-[#F0F4F8] hover:text-[#0B1739]"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {comparisonServices.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-[#5B6887] mb-4">Select courier services to compare their pricing and features</p>
                                    <div className="text-sm text-[#6B7893]">Click on any service tier below to add it to comparison</div>
                                </div>
                            )}

                            {comparisonServices.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-[#0B1739] mb-4">Selected Services</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {comparisonServices.map((service, index) => {
                                            const packageQuotes = quoteMatrix.find(item => item.packageIndex === comparisonPackageIndex);
                                            return (
                                                <div key={index} className="rounded-xl border-2 border-[#0955AC] bg-white p-6">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            {service.provider.logo && (
                                                                <img
                                                                    src={service.provider.logo}
                                                                    alt={`${service.provider.name} logo`}
                                                                    className="h-8 w-auto object-contain"
                                                                    loading="lazy"
                                                                />
                                                            )}
                                                            <div>
                                                                <h4 className="font-bold text-[#0B1739]">{service.provider.name}</h4>
                                                                <p className="text-sm text-[#5B6887]">{service.tier.label} - {service.tier.eta}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFromComparison(index)}
                                                            className="text-red-500 hover:text-red-600 p-1"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-2xl font-black text-[#0B1739]">{formatCurrency(service.tier.price)}</span>
                                                            <span className="text-sm font-medium text-[#0955AC]">{service.tier.eta}</span>
                                                        </div>

                                                        <div className="text-sm text-[#5B6887]">{service.tier.description}</div>

                                                        <div className="rounded-lg bg-[#F8FAFC] p-3">
                                                            <h5 className="text-xs font-semibold uppercase tracking-wide text-[#5B6887] mb-2">Price Breakdown</h5>
                                                            <div className="space-y-1.5 text-sm text-[#6B7893]">
                                                                <div className="flex justify-between">
                                                                    <span>Base Rate</span>
                                                                    <span className="font-medium">{formatCurrency(service.tier.breakdown.base)}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span>Weight ({packageQuotes?.packageInfo.billableWeight.toFixed(1)}kg × {formatCurrency(service.tier.perKg)}/kg)</span>
                                                                    <span className="font-medium">{formatCurrency(service.tier.breakdown.weight)}</span>
                                                                </div>
                                                                {packageQuotes?.packageInfo.billableWeight > 25 && (
                                                                    <div className="flex justify-between">
                                                                        <span>Oversized Fee</span>
                                                                        <span className="font-medium">{formatCurrency((packageQuotes.packageInfo.billableWeight - 25) * 0.75)}</span>
                                                                    </div>
                                                                )}
                                                                <div className="border-t border-[#E8F0FE] pt-1.5 flex justify-between font-semibold text-[#0B1739]">
                                                                    <span>Total</span>
                                                                    <span>{formatCurrency(service.tier.price)}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="pt-3 border-t border-[#E8F0FE]">
                                                            <div className="flex flex-wrap gap-2">
                                                                {service.provider.badges?.map((badge) => (
                                                                    <span
                                                                        key={badge}
                                                                        className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                                                                        style={{
                                                                            backgroundColor: service.provider.badgeColor,
                                                                            color: service.provider.brandColor,
                                                                        }}
                                                                    >
                                                                        {badge}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    {comparisonServices.length === 2 && (
                                        <div className="mt-6 p-4 rounded-lg bg-[#F0F7FF] border border-[#0955AC]/20">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-[#0B1739]">Price Difference</h4>
                                                    <p className="text-sm text-[#5B6887]">Cost difference between selected services</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xl font-bold text-[#0955AC]">
                                                        {formatCurrency(Math.abs(comparisonServices[0].tier.price - comparisonServices[1].tier.price))}
                                                    </div>
                                                    <div className="text-xs text-[#6B7893]">
                                                        {comparisonServices[0].tier.price > comparisonServices[1].tier.price 
                                                            ? `${comparisonServices[1].provider.name} is cheaper`
                                                            : `${comparisonServices[0].provider.name} is cheaper`
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {comparisonServices.length < 2 && comparisonPackageIndex !== null && (
                                <div>
                                    <h3 className="text-lg font-semibold text-[#0B1739] mb-4">Available Services</h3>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {(() => {
                                            const packageQuotes = quoteMatrix.find(item => item.packageIndex === comparisonPackageIndex);
                                            if (!packageQuotes) return null;
                                            
                                            return packageQuotes.providers.map((provider) => (
                                                <div key={provider.id} className="rounded-xl border border-[#E8F0FE] bg-white p-4">
                                                    <div className="mb-3 flex items-center gap-3">
                                                        {provider.logo && (
                                                            <img
                                                                src={provider.logo}
                                                                alt={`${provider.name} logo`}
                                                                className="h-8 w-auto object-contain"
                                                                loading="lazy"
                                                            />
                                                        )}
                                                        <div>
                                                            <h4 className="font-bold text-[#0B1739]">{provider.name}</h4>
                                                            <p className="text-xs text-[#6B7893]">{provider.coverage}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        {provider.tiers.map((tier) => {
                                                            const isAlreadySelected = comparisonServices.some(
                                                                service => service.provider.id === provider.id && service.tier.id === tier.id
                                                            );
                                                            
                                                            return (
                                                                <button
                                                                    key={tier.id}
                                                                    type="button"
                                                                    onClick={() => addToComparison(provider, tier)}
                                                                    disabled={isAlreadySelected}
                                                                    className={`w-full rounded-lg border p-3 text-left transition ${
                                                                        isAlreadySelected
                                                                            ? 'border-[#E8F0FE] bg-[#F8FAFC] text-[#6B7893] cursor-not-allowed'
                                                                            : 'border-[#E8F0FE] bg-white hover:border-[#0955AC]/30 hover:bg-[#F9FBFF]'
                                                                    }`}
                                                                >
                                                                    <div className="flex justify-between items-center">
                                                                        <div>
                                                                            <div className="font-semibold text-sm text-[#0B1739]">{tier.label}</div>
                                                                            <div className="text-xs text-[#6B7893]">{tier.eta}</div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <div className="font-bold text-[#0B1739]">{formatCurrency(tier.price)}</div>
                                                                            {isAlreadySelected && (
                                                                                <div className="text-xs text-[#6B7893]">Selected</div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Create;
