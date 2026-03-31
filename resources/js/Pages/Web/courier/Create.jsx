import React, { useEffect, useMemo, useState } from "react";
import { Head, Link, useForm, usePage, router } from "@inertiajs/react";
import { createPortal } from "react-dom";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import bg from "../assets/courierService/bg.png";
import {
    buildQuoteMatrix,
    buildReviewContext,
    computePackageMetrics,
    resolveDetailedQuotes,
} from "./courierPricing";

const COUNTRY_LABELS = {
    US: "United States",
    CA: "Canada",
    GB: "United Kingdom",
    AU: "Australia",
    LK: "Sri Lanka",
    IN: "India",
    SG: "Singapore",
};

const SRI_LANKAN_CITIES = [
    "Colombo",
    "Kandy",
    "Galle",
    "Gampaha",
    "Kalutara",
    "Kurunegala",
    "Matara",
    "Jaffna",
    "Negombo",
    "Anuradhapura",
    "Badulla",
    "Ratnapura",
];

const DOMESTIC_COUNTRY_CODE = "LK";

const OUNCES_PER_KILOGRAM = 35.27396195;
const CENTIMETERS_PER_YARD = 91.44;

const Create = () => {
    const { props } = usePage();
    const packageTypes = props.packageTypes || [];
    const countries = props.countries || [];
    const serviceLevels = props.serviceLevels || [];
    const quoteProviders = Array.isArray(props.quoteProviders) ? props.quoteProviders : [];
    const { flash } = props;
    const recentShipmentId = props.recentShipmentId;
    const recentPricingExplanation = props.recentPricingExplanation;
    const packageSectionDescription = "Use the quick calculator layout to set locations, weight, and dimensions.";
    const defaultDomesticFromCity = SRI_LANKAN_CITIES[0] || "";
    const defaultDomesticToCity = SRI_LANKAN_CITIES[1] || defaultDomesticFromCity;

    // Currency conversion state
    const [displayCurrency, setDisplayCurrency] = useState('LKR');
    const USD_TO_LKR_RATE = 325; // Exchange rate (you can make this dynamic later)

    // Active package for courier selection
    const [activePackageIndex, setActivePackageIndex] = useState(0);

    const [isPlacing, setIsPlacing] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [serviceDetailsModal, setServiceDetailsModal] = useState(null);

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
                city: defaultDomesticFromCity,
                state: "",
                postalCode: "",
                country: DOMESTIC_COUNTRY_CODE,
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
                city: defaultDomesticToCity,
                state: "",
                postalCode: "",
                country: DOMESTIC_COUNTRY_CODE,
                instructions: "",
            },
        },
        shipment: {
            pickupDate: "",
            pickupWindowStart: "",
            pickupWindowEnd: "",
            routeType: "domestic",
            serviceLevel: serviceLevels[0] || "",
            courierProvider: "",
            currency: "LKR",
            insurance: false,
            deliveryNotes: "",
            estimatedValue: "",
            logisticDimensions: {
                unitType: "",
                unitCount: "",
                routeClass: "",
                handlingClass: "",
                w2wMode: "",
            },
        },
        packages: [
            {
                label: "",
                packageType: packageTypes[0] || "parcel",
                quantity: 1,
                weightKg: "",
                weightUnit: "kg",
                lengthCm: "",
                widthCm: "",
                heightCm: "",
                dimensionUnit: "cm",
                declaredValue: "",
                description: "",
                courierProvider: "",
                serviceLevel: "",
            },
        ],
    });

    const POLICY_ADJUSTMENT_LABELS = {
        remote_area_surcharge: "Remote area surcharge",
        overweight_surcharge: "Overweight surcharge",
        oversize_surcharge: "Oversize surcharge",
        holiday_surcharge: "Holiday surcharge",
        peak_hour_surcharge: "Peak-hour surcharge",
        cod_fee: "COD fee",
        minimum_shipment_guardrail: "Minimum shipment guardrail",
        speed_eta_tier_multiplier: "Speed/ETA tier multiplier",
        logistic_dimensions_engine: "Logistic dimensions engine",
        quote_runtime_discount_applied: "Quote runtime discount applied",
        quote_runtime_discount_ceiling_guardrail: "Quote runtime discount ceiling guardrail",
        quote_runtime_floor_price_guardrail: "Quote runtime floor-price guardrail",
    };

    const formatPolicyAdjustmentLabel = (key) => {
        const normalizedKey = String(key || "").trim();
        if (!normalizedKey) {
            return "Policy adjustment";
        }

        return POLICY_ADJUSTMENT_LABELS[normalizedKey]
            || normalizedKey.replaceAll("_", " ");
    };

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

    const updateAddressCountry = (party, countryCode) => {
        const currentParty = party === "recipient" ? data.recipient : data.sender;

        setData(party, {
            ...currentParty,
            address: {
                ...currentParty.address,
                country: countryCode,
            },
        });
    };

    const updateAddressCity = (party, cityName) => {
        const currentParty = party === "recipient" ? data.recipient : data.sender;

        setData(party, {
            ...currentParty,
            address: {
                ...currentParty.address,
                city: cityName,
                country: selectedRouteType === "domestic"
                    ? DOMESTIC_COUNTRY_CODE
                    : currentParty.address.country,
            },
        });
    };

    const handleRouteTypeChange = (routeType) => {
        const nextRouteType = routeType === "international" ? "international" : "domestic";

        setData("shipment", {
            ...data.shipment,
            routeType: nextRouteType,
        });

        if (nextRouteType === "domestic") {
            setData("sender", {
                ...data.sender,
                address: {
                    ...data.sender.address,
                    city: data.sender.address.city || defaultDomesticFromCity,
                    country: DOMESTIC_COUNTRY_CODE,
                },
            });

            setData("recipient", {
                ...data.recipient,
                address: {
                    ...data.recipient.address,
                    city: data.recipient.address.city || defaultDomesticToCity,
                    country: DOMESTIC_COUNTRY_CODE,
                },
            });
        }
    };

    const toDisplayValue = (rawValue, factor = 1, decimalPlaces = 2) => {
        if (rawValue === "" || rawValue === null || rawValue === undefined) {
            return "";
        }

        const numericValue = Number(rawValue);
        if (!Number.isFinite(numericValue)) {
            return "";
        }

        return Number((numericValue * factor).toFixed(decimalPlaces)).toString();
    };

    const toBaseValue = (rawValue, factor = 1, decimalPlaces = 4) => {
        if (rawValue === "") {
            return "";
        }

        const numericValue = Number(rawValue);
        if (!Number.isFinite(numericValue)) {
            return "";
        }

        return Number((numericValue / factor).toFixed(decimalPlaces)).toString();
    };

    const addPackage = () => {
        setData("packages", [
            ...data.packages,
            {
                label: "",
                packageType: packageTypes[0] || "parcel",
                quantity: 1,
                weightKg: "",
                weightUnit: "kg",
                lengthCm: "",
                widthCm: "",
                heightCm: "",
                dimensionUnit: "cm",
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

    const selectedRouteType = data.shipment?.routeType === "international" ? "international" : "domestic";

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

    const openServiceDetailsModal = (provider, tier, options = {}) => {
        if (!provider || !tier) {
            return;
        }

        const safeDiff = Number(options.diff);

        setServiceDetailsModal({
            providerId: provider.id || "",
            providerName: provider.name || "Unknown provider",
            providerCategory: provider.category || "unknown",
            coverage: provider.coverage || "Not specified",
            cutoff: provider.cutoff || "Not specified",
            badges: Array.isArray(provider.badges) ? provider.badges : [],
            serviceLevel: tier.id || "",
            tierLabel: tier.label || tier.id || "Service",
            tierEta: tier.eta || "Not specified",
            tierDescription: tier.description || "No additional description available.",
            price: Number(tier.price) || 0,
            breakdown: tier.breakdown || null,
            isBest: Boolean(options.isBest),
            diff: Number.isFinite(safeDiff) ? safeDiff : null,
            packageIndex: Number.isInteger(options.packageIndex) ? options.packageIndex : null,
        });
    };

    const closeServiceDetailsModal = () => {
        setServiceDetailsModal(null);
    };

    const handleSelectServiceFromModal = () => {
        if (!serviceDetailsModal) {
            return;
        }

        const packageIndex = Number.isInteger(serviceDetailsModal.packageIndex)
            ? serviceDetailsModal.packageIndex
            : -1;

        if (packageIndex < 0 || !serviceDetailsModal.providerId || !serviceDetailsModal.serviceLevel) {
            return;
        }

        const updatedPackages = [...data.packages];
        if (!updatedPackages[packageIndex]) {
            return;
        }

        updatedPackages[packageIndex] = {
            ...updatedPackages[packageIndex],
            courierProvider: serviceDetailsModal.providerId,
            serviceLevel: serviceDetailsModal.serviceLevel,
        };

        setData("packages", updatedPackages);
        setActivePackageIndex(packageIndex);
        closeServiceDetailsModal();
    };

    useEffect(() => {
        if (!serviceDetailsModal || typeof document === "undefined") {
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;
        const previousPaddingRight = document.body.style.paddingRight;
        const scrollbarCompensation = window.innerWidth - document.documentElement.clientWidth;

        document.body.style.overflow = "hidden";
        if (scrollbarCompensation > 0) {
            document.body.style.paddingRight = `${scrollbarCompensation}px`;
        }

        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.style.paddingRight = previousPaddingRight;
        };
    }, [serviceDetailsModal]);

    const toggleCurrency = () => {
        const nextCurrency = displayCurrency === 'USD' ? 'LKR' : 'USD';
        setDisplayCurrency(nextCurrency);
        setData('shipment', {
            ...data.shipment,
            currency: nextCurrency,
        });
    };

    const quoteMatrix = useMemo(
        () => buildQuoteMatrix(data.packages, {
            metrics: packageMetrics,
            services: quoteProviders,
        }),
        [data.packages, packageMetrics, quoteProviders]
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

        if (selectedQuotes.length !== data.packages.length) {
            return false;
        }

        return data.packages.every((pkg) => pkg.courierProvider && pkg.serviceLevel);
    }, [data.packages, selectedQuotes]);

    const extractFirstErrorMessage = (errorBag) => {
        const queue = Array.isArray(errorBag)
            ? [...errorBag]
            : Object.values(errorBag || {});

        while (queue.length > 0) {
            const current = queue.shift();

            if (typeof current === "string" && current.trim() !== "") {
                return current;
            }

            if (Array.isArray(current)) {
                queue.push(...current);
                continue;
            }

            if (current && typeof current === "object") {
                queue.push(...Object.values(current));
            }
        }

        return "";
    };

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
            onStart: () => {
                setSubmitError("");
                setIsPlacing(true);
            },
            onSuccess: () => {
                setSubmitError("");
                scrollToTop();
            },
            onError: (formErrors) => {
                scrollToTop();
                const firstError = extractFirstErrorMessage(formErrors);
                setSubmitError(
                    firstError ||
                        "Unable to continue. Please review the highlighted fields and try again.",
                );
            },
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

            <main>
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
                                    {recentPricingExplanation.speedEtaTier && (
                                        <div className="mt-2 grid grid-cols-1 gap-1 md:grid-cols-2">
                                            <p>Speed/ETA Tier: {recentPricingExplanation.speedEtaTier.etaLabel || recentPricingExplanation.speedEtaTier.tierLabel || recentPricingExplanation.speedEtaTier.tierKey || "—"}</p>
                                            <p>ETA Range: {Number(recentPricingExplanation.speedEtaTier.etaMinDays || 0)} - {recentPricingExplanation.speedEtaTier.etaMaxDays === null || recentPricingExplanation.speedEtaTier.etaMaxDays === undefined ? "*" : Number(recentPricingExplanation.speedEtaTier.etaMaxDays)} days</p>
                                            <p>Projected Window: {recentPricingExplanation.speedEtaTier.etaStartDate || "—"} {recentPricingExplanation.speedEtaTier.etaEndDate ? `to ${recentPricingExplanation.speedEtaTier.etaEndDate}` : ""}</p>
                                            <p>Tier Multiplier: x{Number(recentPricingExplanation.speedEtaTier.priceMultiplier || 1).toFixed(2)} {recentPricingExplanation.speedEtaTier.enforceTierPricingMultiplier ? "(enforced)" : "(display only)"}</p>
                                        </div>
                                    )}
                                    {recentPricingExplanation.logisticDimensions && (
                                        <div className="mt-2 grid grid-cols-1 gap-1 md:grid-cols-2">
                                            <p>Logistic Unit Type: {recentPricingExplanation.logisticDimensions.unitType || "—"}</p>
                                            <p>Route Class: {recentPricingExplanation.logisticDimensions.routeClass || "—"}</p>
                                            <p>Handling Class: {recentPricingExplanation.logisticDimensions.handlingClass || "—"}</p>
                                            <p>W2W Mode: {recentPricingExplanation.logisticDimensions.w2wMode || "—"}</p>
                                            <p>Unit Count: {recentPricingExplanation.logisticDimensions.unitCount || "—"}</p>
                                            <p>Combined Multiplier: x{Number(recentPricingExplanation.logisticDimensions.totalMultiplier || 1).toFixed(2)}</p>
                                        </div>
                                    )}
                                    {Array.isArray(recentPricingExplanation.policyAdjustments) && recentPricingExplanation.policyAdjustments.length > 0 && (
                                        <div className="mt-2 grid grid-cols-1 gap-1 md:grid-cols-2">
                                            {recentPricingExplanation.policyAdjustments.map((item, idx) => (
                                                <p key={`recent-pricing-adjustment-${idx}`}>
                                                    {formatPolicyAdjustmentLabel(item?.key)}: {Number(item?.amount || 0) >= 0 ? "+" : "-"}{Math.abs(Number(item?.amount || 0)).toFixed(2)}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-10">

                        <section className="rounded-2xl border border-[#E3EAF5] bg-[#F9FBFF] px-6 py-6">
                            <div className="flex flex-col items-center gap-3 text-center">
                                <div>
                                    <h2 className="text-lg font-semibold text-[#0B1739]">Shipment route type</h2>
                                    <p className="mt-1 text-sm text-[#5B6887]">
                                        Choose the route type first. Courier companies will be filtered to match your selection.
                                    </p>
                                </div>
                                <div className="inline-flex w-[300px] max-w-md justify-between rounded-xl border border-[#D6DEEB] bg-white p-1 shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => handleRouteTypeChange('domestic')}
                                        className={`min-w-[140px] rounded-lg border px-5 py-2.5 text-sm font-semibold transition-all duration-150 ${selectedRouteType === 'domestic'
                                            ? 'border-[#0955AC] bg-[#0955AC] text-white shadow-sm'
                                            : 'border-blue bg-white text-[#5B6887] hover:border-[#D6DEEB] hover:text-[#0B1739]'
                                            }`}
                                    >
                                        Domestic
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRouteTypeChange('international')}
                                        className={`min-w-[140px] rounded-lg border px-5 py-2.5 text-sm font-semibold transition-all duration-150 ${selectedRouteType === 'international'
                                            ? 'border-[#0955AC] bg-[#0955AC] text-white shadow-sm'
                                            : 'border-blue bg-white text-[#5B6887] hover:border-[#D6DEEB] hover:text-[#0B1739]'
                                            }`}
                                    >
                                        International
                                    </button>
                                </div>
                            </div>
                        </section>

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

                            <div className="space-y-5">
                                {data.packages.map((item, index) => {
                                    const weightUnit = item.weightUnit === "oz" ? "oz" : "kg";
                                    const dimensionUnit = item.dimensionUnit === "yd" ? "yd" : "cm";
                                    const weightFactor = weightUnit === "oz" ? OUNCES_PER_KILOGRAM : 1;
                                    const dimensionFactor = dimensionUnit === "yd" ? 1 / CENTIMETERS_PER_YARD : 1;

                                    return (
                                        <div
                                            key={`package-${index}`}
                                            className="rounded-2xl border border-[#D6DEEB] bg-white px-5 py-6 shadow-sm"
                                        >
                                            <div className="mb-4 flex items-center justify-between">
                                                <h3 className="text-base font-semibold text-[#0B1739]">
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

                                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2.1fr_1fr_2fr] xl:items-end">
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-[#0B1739]">
                                                        Pick up &amp; Delivery locations*
                                                    </label>
                                                    <p className="text-sm text-[#5B6887]">
                                                        Select your location where you want to deliver
                                                    </p>

                                                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                        <select
                                                            value={selectedRouteType === "domestic" ? (data.sender.address.city || "") : (data.sender.address.country || "")}
                                                            onChange={(event) => {
                                                                if (selectedRouteType === "domestic") {
                                                                    updateAddressCity("sender", event.target.value);
                                                                    return;
                                                                }
                                                                updateAddressCountry("sender", event.target.value);
                                                            }}
                                                            className="h-[52px] w-full rounded-lg border border-[#D6DEEB] bg-white px-4 pr-10 text-sm leading-5 text-[#0B1739] focus:border-[#0955AC] focus:outline-none"
                                                        >
                                                            {selectedRouteType === "domestic" ? (
                                                                <>
                                                                    <option value="">Select Pickup City</option>
                                                                    {SRI_LANKAN_CITIES.map((city) => (
                                                                        <option key={`pickup-city-${index}-${city}`} value={city}>
                                                                            {city}
                                                                        </option>
                                                                    ))}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <option value="">Select Pickup</option>
                                                                    {countries.map((countryCode) => (
                                                                        <option key={`pickup-${index}-${countryCode}`} value={countryCode}>
                                                                            {COUNTRY_LABELS[countryCode]
                                                                                ? `${COUNTRY_LABELS[countryCode]} (${countryCode})`
                                                                                : countryCode}
                                                                        </option>
                                                                    ))}
                                                                </>
                                                            )}
                                                        </select>
                                                        <select
                                                            value={selectedRouteType === "domestic" ? (data.recipient.address.city || "") : (data.recipient.address.country || "")}
                                                            onChange={(event) => {
                                                                if (selectedRouteType === "domestic") {
                                                                    updateAddressCity("recipient", event.target.value);
                                                                    return;
                                                                }
                                                                updateAddressCountry("recipient", event.target.value);
                                                            }}
                                                            className="h-[52px] w-full rounded-lg border border-[#D6DEEB] bg-white px-4 pr-10 text-sm leading-5 text-[#0B1739] focus:border-[#0955AC] focus:outline-none"
                                                        >
                                                            {selectedRouteType === "domestic" ? (
                                                                <>
                                                                    <option value="">Select Destination City</option>
                                                                    {SRI_LANKAN_CITIES.map((city) => (
                                                                        <option key={`destination-city-${index}-${city}`} value={city}>
                                                                            {city}
                                                                        </option>
                                                                    ))}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <option value="">Select Destination</option>
                                                                    {countries.map((countryCode) => (
                                                                        <option key={`destination-${index}-${countryCode}`} value={countryCode}>
                                                                            {COUNTRY_LABELS[countryCode]
                                                                                ? `${COUNTRY_LABELS[countryCode]} (${countryCode})`
                                                                                : countryCode}
                                                                        </option>
                                                                    ))}
                                                                </>
                                                            )}
                                                        </select>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-[#0B1739]">
                                                        Package weight*
                                                    </label>
                                                    <p className="text-sm text-[#5B6887]">In Kilo or ounces</p>

                                                    <div className="mt-3 grid grid-cols-[1fr_90px] gap-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={toDisplayValue(item.weightKg, weightFactor, 2)}
                                                            onChange={(event) =>
                                                                updatePackage(index, "weightKg", toBaseValue(event.target.value, weightFactor))
                                                            }
                                                            className="h-[52px] w-full rounded-lg border border-[#D6DEEB] bg-white px-4 text-sm text-[#0B1739] placeholder:text-[#8C97B0] focus:border-[#0955AC] focus:outline-none"
                                                            placeholder="Weight"
                                                        />
                                                        <select
                                                            value={weightUnit}
                                                            onChange={(event) => updatePackage(index, "weightUnit", event.target.value)}
                                                            className="h-[52px] w-[90px] rounded-lg border border-[#D6DEEB] bg-white pl-3 pr-8 text-sm font-semibold leading-5 text-[#0B1739] focus:border-[#0955AC] focus:outline-none"
                                                        >
                                                            <option value="kg">Kg</option>
                                                            <option value="oz">Oz</option>
                                                        </select>
                                                    </div>
                                                    {errors[`packages.${index}.weightKg`] && (
                                                        <p className="mt-2 text-sm text-red-500">
                                                            {errors[`packages.${index}.weightKg`]}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-[#0B1739]">
                                                        Dimensions *
                                                    </label>
                                                    <p className="text-sm text-[#5B6887]">In centimeters or yards</p>

                                                    <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-[1fr_1fr_1fr_90px]">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.1"
                                                            value={toDisplayValue(item.lengthCm, dimensionFactor, 2)}
                                                            onChange={(event) =>
                                                                updatePackage(index, "lengthCm", toBaseValue(event.target.value, dimensionFactor))
                                                            }
                                                            className="h-[52px] w-full rounded-lg border border-[#D6DEEB] bg-white px-3 text-sm text-[#0B1739] placeholder:text-[#8C97B0] focus:border-[#0955AC] focus:outline-none"
                                                            placeholder="Length"
                                                        />
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.1"
                                                            value={toDisplayValue(item.widthCm, dimensionFactor, 2)}
                                                            onChange={(event) =>
                                                                updatePackage(index, "widthCm", toBaseValue(event.target.value, dimensionFactor))
                                                            }
                                                            className="h-[52px] w-full rounded-lg border border-[#D6DEEB] bg-white px-3 text-sm text-[#0B1739] placeholder:text-[#8C97B0] focus:border-[#0955AC] focus:outline-none"
                                                            placeholder="Width"
                                                        />
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.1"
                                                            value={toDisplayValue(item.heightCm, dimensionFactor, 2)}
                                                            onChange={(event) =>
                                                                updatePackage(index, "heightCm", toBaseValue(event.target.value, dimensionFactor))
                                                            }
                                                            className="col-span-2 h-[52px] w-full rounded-lg border border-[#D6DEEB] bg-white px-3 text-sm text-[#0B1739] placeholder:text-[#8C97B0] focus:border-[#0955AC] focus:outline-none md:col-span-1"
                                                            placeholder="Height"
                                                        />
                                                        <select
                                                            value={dimensionUnit}
                                                            onChange={(event) => updatePackage(index, "dimensionUnit", event.target.value)}
                                                            className="col-span-2 h-[52px] w-full rounded-lg border border-[#D6DEEB] bg-white pl-3 pr-8 text-sm font-semibold leading-5 text-[#0B1739] focus:border-[#0955AC] focus:outline-none md:col-span-1"
                                                        >
                                                            <option value="cm">cm</option>
                                                            <option value="yd">yd</option>
                                                        </select>
                                                    </div>

                                                    {(errors[`packages.${index}.lengthCm`] || errors[`packages.${index}.widthCm`] || errors[`packages.${index}.heightCm`]) && (
                                                        <p className="mt-2 text-sm text-red-500">
                                                            {errors[`packages.${index}.lengthCm`] || errors[`packages.${index}.widthCm`] || errors[`packages.${index}.heightCm`]}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
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

                        <section id="courier-quotes-section" className="rounded-2xl border border-[#E3EAF5] bg-[#F9FBFF] px-6 py-8">
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
                                        ? `Add quantity and weight for all packages (${incompletePackages} incomplete) to view available ${selectedRouteType} courier services.`
                                        : `Add package details to view available ${selectedRouteType} courier services.`}
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
                                                                            <div
                                                                                key={tierId}
                                                                                className={`flex w-full items-center transition-colors ${isSelected
                                                                                    ? 'bg-[#0955AC]'
                                                                                    : isBest
                                                                                        ? 'bg-emerald-50'
                                                                                        : 'bg-white'
                                                                                    }`}
                                                                            >
                                                                                <button
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
                                                                                    className="flex min-w-0 flex-1 items-center px-3 py-2 text-left"
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
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => openServiceDetailsModal(provider, tier, {
                                                                                        isBest,
                                                                                        diff,
                                                                                        packageIndex: activePackageQuotes.packageIndex,
                                                                                    })}
                                                                                    className={`mr-2 rounded border px-2 py-0.5 text-[9px] font-semibold transition ${isSelected
                                                                                        ? 'border-white/50 text-white hover:bg-white/10'
                                                                                        : 'border-[#D6DEEB] text-[#5B6887] hover:border-[#0955AC] hover:text-[#0955AC]'
                                                                                        }`}
                                                                                >
                                                                                    See more
                                                                                </button>
                                                                            </div>
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
                                                                                    <div
                                                                                        className={`inline-flex w-full flex-col items-center rounded-lg border px-1.5 py-1.5 transition-all duration-150 ${isSelected
                                                                                            ? 'border-[#0955AC] bg-[#0955AC] shadow-sm'
                                                                                            : isBest
                                                                                                ? 'border-emerald-400 bg-emerald-50 hover:bg-emerald-100'
                                                                                                : 'border-[#E8F0FE] bg-white hover:border-[#0955AC]/30 hover:bg-[#F9FBFF]'
                                                                                            }`}
                                                                                    >
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
                                                                                            className="flex w-full flex-col items-center focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:ring-offset-1"
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
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => openServiceDetailsModal(provider, tier, {
                                                                                                isBest,
                                                                                                diff,
                                                                                                packageIndex: activePackageQuotes.packageIndex,
                                                                                            })}
                                                                                            className={`mt-1 rounded border px-1.5 py-[1px] text-[9px] font-semibold transition ${isSelected
                                                                                                ? 'border-white/50 text-white hover:bg-white/10'
                                                                                                : 'border-[#D6DEEB] text-[#5B6887] hover:border-[#0955AC] hover:text-[#0955AC]'
                                                                                                }`}
                                                                                        >
                                                                                            See more
                                                                                        </button>
                                                                                    </div>
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
                                        const preferredCategory = selectedRouteType === 'international' ? 'logistic' : 'domestic';
                                        const currentCategory = preferredCategory === 'domestic'
                                            ? (hasDomestic ? 'domestic' : null)
                                            : (hasLogistic ? 'logistic' : null);

                                        return (
                                            <div className="space-y-3">
                                                {/* Compact legend */}
                                                <div className="flex flex-col md:flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="text-xs font-semibold uppercase tracking-wide text-[#5B6887]">
                                                        Showing {selectedRouteType} courier providers
                                                    </div>

                                                    <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-[11px] text-[#6B7893]">
                                                        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>Best price</span>
                                                        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#0955AC]"></span>Selected</span>
                                                        <span className="hidden sm:inline text-[#9CA3AF]">· Hover for ETA</span>
                                                    </div>
                                                </div>

                                                {currentCategory === 'domestic' && renderCategoryTable(domesticProviders, 'Domestic', '#2563EB', '#EFF6FF')}
                                                {currentCategory === 'logistic' && renderCategoryTable(logisticProviders, 'International', '#0955AC', '#F0F7FF')}
                                                {!currentCategory && (
                                                    <div className="rounded-lg border border-dashed border-[#B8C5E0] bg-white px-5 py-6 text-sm text-[#5B6887]">
                                                        No {selectedRouteType} courier providers are currently available for this package.
                                                    </div>
                                                )}
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

                        {serviceDetailsModal && typeof document !== "undefined" && createPortal(
                            <div
                                className="fixed inset-0 z-[2147483647] overflow-y-auto bg-[#0B1739]/55 p-4 sm:p-6"
                                onClick={closeServiceDetailsModal}
                            >
                                <div className="flex min-h-full items-center justify-center">
                                    <div
                                        className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl"
                                        onClick={(event) => event.stopPropagation()}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-[#5B6887]">
                                                    Service details
                                                </p>
                                                <h3 className="mt-1 text-lg font-semibold text-[#0B1739]">
                                                    {serviceDetailsModal.providerName} · {serviceDetailsModal.tierLabel}
                                                </h3>
                                                <p className="mt-1 text-xs text-[#6B7893]">
                                                    {serviceDetailsModal.providerCategory === "logistic" ? "International" : "Domestic"} service
                                                    {serviceDetailsModal.packageIndex !== null ? ` for Package ${serviceDetailsModal.packageIndex + 1}` : ""}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={closeServiceDetailsModal}
                                                className="rounded-lg border border-[#D6DEEB] px-3 py-1 text-xs font-semibold text-[#5B6887] transition hover:border-[#0955AC] hover:text-[#0955AC]"
                                            >
                                                Close
                                            </button>
                                        </div>

                                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div className="rounded-lg border border-[#E3EAF5] bg-[#F9FBFF] px-3 py-2">
                                                <p className="text-[11px] uppercase tracking-wide text-[#6B7893]">Rate</p>
                                                <p className="text-sm font-semibold text-[#0B1739]">{formatCurrency(serviceDetailsModal.price)}</p>
                                                {serviceDetailsModal.isBest && (
                                                    <p className="text-[11px] font-semibold text-emerald-700">Best price in this tier</p>
                                                )}
                                                {!serviceDetailsModal.isBest && serviceDetailsModal.diff !== null && serviceDetailsModal.diff > 0 && (
                                                    <p className="text-[11px] text-[#6B7893]">+{formatCurrency(serviceDetailsModal.diff)} vs best</p>
                                                )}
                                            </div>
                                            <div className="rounded-lg border border-[#E3EAF5] bg-[#F9FBFF] px-3 py-2">
                                                <p className="text-[11px] uppercase tracking-wide text-[#6B7893]">ETA</p>
                                                <p className="text-sm font-semibold text-[#0B1739]">{serviceDetailsModal.tierEta}</p>
                                                <p className="text-[11px] text-[#6B7893]">Cutoff: {serviceDetailsModal.cutoff}</p>
                                            </div>
                                        </div>

                                        <div className="mt-3 rounded-lg border border-[#E3EAF5] bg-white px-3 py-2 text-sm">
                                            <p className="text-[11px] uppercase tracking-wide text-[#6B7893]">Coverage</p>
                                            <p className="mt-1 text-[#0B1739]">{serviceDetailsModal.coverage}</p>
                                        </div>

                                        <div className="mt-3 rounded-lg border border-[#E3EAF5] bg-white px-3 py-2 text-sm">
                                            <p className="text-[11px] uppercase tracking-wide text-[#6B7893]">Service description</p>
                                            <p className="mt-1 text-[#0B1739]">{serviceDetailsModal.tierDescription}</p>
                                        </div>

                                        {serviceDetailsModal.breakdown && (
                                            <div className="mt-3 rounded-lg border border-[#E3EAF5] bg-white px-3 py-2 text-sm">
                                                <p className="text-[11px] uppercase tracking-wide text-[#6B7893]">Price breakdown</p>
                                                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                                                    <p className="text-[#0B1739]">Base: <span className="font-semibold">{formatCurrency(serviceDetailsModal.breakdown.base || 0)}</span></p>
                                                    <p className="text-[#0B1739]">Weight: <span className="font-semibold">{formatCurrency(serviceDetailsModal.breakdown.weight || 0)}</span></p>
                                                    <p className="text-[#0B1739]">Adjustments: <span className="font-semibold">{formatCurrency(serviceDetailsModal.breakdown.adjustments || 0)}</span></p>
                                                </div>
                                            </div>
                                        )}

                                        {Array.isArray(serviceDetailsModal.badges) && serviceDetailsModal.badges.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {serviceDetailsModal.badges.map((badge) => (
                                                    <span
                                                        key={`badge-${badge}`}
                                                        className="rounded-full border border-[#D6DEEB] bg-[#F9FBFF] px-3 py-1 text-[11px] font-medium text-[#5B6887]"
                                                    >
                                                        {badge}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-5 flex items-center justify-end gap-2 border-t border-[#E3EAF5] pt-4">
                                            <button
                                                type="button"
                                                onClick={closeServiceDetailsModal}
                                                className="rounded-lg border border-[#D6DEEB] px-3 py-2 text-xs font-semibold text-[#5B6887] transition hover:border-[#0955AC] hover:text-[#0955AC]"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSelectServiceFromModal}
                                                disabled={
                                                    !serviceDetailsModal.providerId
                                                    || !serviceDetailsModal.serviceLevel
                                                    || serviceDetailsModal.packageIndex === null
                                                }
                                                className={`rounded-lg px-4 py-2 text-xs font-semibold text-white transition ${!serviceDetailsModal.providerId
                                                        || !serviceDetailsModal.serviceLevel
                                                        || serviceDetailsModal.packageIndex === null
                                                        ? "cursor-not-allowed bg-[#9BB9E3]"
                                                        : "bg-[#0955AC] hover:bg-[#0a4b93]"
                                                    }`}
                                            >
                                                Select service
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>,
                            document.body,
                        )}

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
                            {submitError && (
                                <p className="text-xs text-[#D14343]">
                                    {submitError}
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
