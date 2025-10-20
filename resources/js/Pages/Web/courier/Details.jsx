import React, { useCallback, useEffect, useMemo } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import {
    buildQuoteMatrix,
    buildReviewContext,
    computePackageMetrics,
    resolveDetailedQuotes,
} from "./courierPricing";

const CURRENCY_OPTIONS = ["LKR", "USD"];
const USD_TO_LKR_RATE = 325;

const Details = () => {
    const { props } = usePage();
    const {
        formData,
        countries = [],
        serviceLevels = [],
        packageTypes = [],
        errors = {},
    } = props;

    const initialForm = useMemo(() => {
        if (!formData) {
            return {
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
                        country: countries[0] || "US",
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
                        country: countries[0] || "US",
                        instructions: "",
                    },
                },
                shipment: {
                    pickupDate: "",
                    pickupWindowStart: "",
                    pickupWindowEnd: "",
                    serviceLevel: serviceLevels[0] || "",
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
                reviewContext: {
                    selectedQuotes: [],
                    displayCurrency: "LKR",
                    totalPriceUSD: 0,
                },
            };
        }

        const senderAddress = formData.sender?.address ?? {};
        const recipientAddress = formData.recipient?.address ?? {};
        const shipment = formData.shipment ?? {};
        const preferredCurrency = shipment.currency || formData.reviewContext?.displayCurrency || "LKR";

        return {
            sender: {
                name: formData.sender?.name ?? "",
                email: formData.sender?.email ?? "",
                phone: formData.sender?.phone ?? "",
                company: formData.sender?.company ?? "",
                address: {
                    line1: senderAddress.line1 ?? "",
                    line2: senderAddress.line2 ?? "",
                    city: senderAddress.city ?? "",
                    state: senderAddress.state ?? "",
                    postalCode: senderAddress.postalCode ?? "",
                    country: senderAddress.country ?? (countries[0] || "US"),
                    instructions: senderAddress.instructions ?? "",
                },
            },
            recipient: {
                name: formData.recipient?.name ?? "",
                email: formData.recipient?.email ?? "",
                phone: formData.recipient?.phone ?? "",
                company: formData.recipient?.company ?? "",
                address: {
                    line1: recipientAddress.line1 ?? "",
                    line2: recipientAddress.line2 ?? "",
                    city: recipientAddress.city ?? "",
                    state: recipientAddress.state ?? "",
                    postalCode: recipientAddress.postalCode ?? "",
                    country: recipientAddress.country ?? (countries[0] || "US"),
                    instructions: recipientAddress.instructions ?? "",
                },
            },
            shipment: {
                pickupDate: shipment.pickupDate ?? "",
                pickupWindowStart: shipment.pickupWindowStart ?? "",
                pickupWindowEnd: shipment.pickupWindowEnd ?? "",
                serviceLevel: shipment.serviceLevel ?? (serviceLevels[0] || ""),
                currency: preferredCurrency,
                insurance: Boolean(shipment.insurance),
                deliveryNotes: shipment.deliveryNotes ?? "",
                estimatedValue: shipment.estimatedValue ?? "",
            },
            packages: (formData.packages ?? []).map((pkg) => ({
                ...pkg,
                label: pkg.label ?? "",
                packageType: pkg.packageType ?? (packageTypes[0] || "parcel"),
                quantity: pkg.quantity ?? 1,
                weightKg: pkg.weightKg ?? "",
                lengthCm: pkg.lengthCm ?? "",
                widthCm: pkg.widthCm ?? "",
                heightCm: pkg.heightCm ?? "",
                declaredValue: pkg.declaredValue ?? "",
                description: pkg.description ?? "",
                courierProvider: pkg.courierProvider ?? "",
                serviceLevel: pkg.serviceLevel ?? "",
            })),
            reviewContext: {
                selectedQuotes: Array.isArray(formData.reviewContext?.selectedQuotes)
                    ? [...formData.reviewContext.selectedQuotes]
                    : [],
                displayCurrency: preferredCurrency,
                totalPriceUSD: Number(formData.reviewContext?.totalPriceUSD || 0),
            },
        };
    }, [formData, countries, serviceLevels, packageTypes]);

    const {
        data,
        setData,
        post,
        processing,
        errors: formErrors,
    } = useForm(initialForm);

    const scrollToTop = useCallback(() => {
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "auto" });
        }
    }, []);

    useEffect(() => {
        setData(() => initialForm);
    }, [initialForm, setData]);

    const updateNestedField = (path, value) => {
        setData((previous) => {
            const next = { ...previous };
            const keys = path.split(".");
            let cursor = next;

            keys.forEach((key, index) => {
                if (index === keys.length - 1) {
                    cursor[key] = value;
                    return;
                }

                const current = cursor[key];
                if (Array.isArray(current)) {
                    cursor[key] = [...current];
                } else {
                    cursor[key] = current ? { ...current } : {};
                }
                cursor = cursor[key];
            });

            return next;
        });
    };

    const updatePackageField = (index, field, value) => {
        setData((previous) => {
            const packages = Array.isArray(previous.packages) ? [...previous.packages] : [];
            packages[index] = {
                ...(packages[index] ?? {}),
                [field]: value,
            };

            return {
                ...previous,
                packages,
            };
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        post("/couriers/details", {
            preserveScroll: false,
            onSuccess: scrollToTop,
            onError: scrollToTop,
        });
    };

    if (!formData) {
        return (
            <div className="min-h-screen flex flex-col bg-[#F4F7FB] text-[#0B1739]">
                <Head title="Courier Details" />
                <Header />
                <main className="flex flex-1 items-center justify-center px-4">
                    <div className="max-w-md w-full rounded-2xl bg-white p-8 text-center shadow-lg">
                        <h1 className="text-xl font-semibold mb-3">No shipment in progress</h1>
                        <p className="text-sm text-[#5B6887]">
                            Start by creating a courier request and selecting your services.
                        </p>
                        <Link
                            href="/couriers/create"
                            className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#0955AC] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0a4b93]"
                        >
                            Go to courier form
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }
    const combinedErrors = { ...errors, ...formErrors };
    const packages = data.packages || [];

    const fallbackReviewContext = useMemo(() => {
        const context = formData.reviewContext || {};
        return {
            selectedQuotes: Array.isArray(context.selectedQuotes) ? [...context.selectedQuotes] : [],
            displayCurrency: context.displayCurrency || (formData.shipment?.currency || "LKR"),
            totalPriceUSD: Number(context.totalPriceUSD || 0),
        };
    }, [formData.reviewContext, formData.shipment]);

    const packageCurrency = data.shipment?.currency || fallbackReviewContext.displayCurrency || "LKR";

    const currencyFormatter = useMemo(() => {
        try {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: packageCurrency,
                minimumFractionDigits: 2,
            });
        } catch (error) {
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "LKR",
                minimumFractionDigits: 2,
            });
        }
    }, [packageCurrency]);

    const formatCurrency = useCallback(
        (value = 0) => {
            const numericValue = Number(value) || 0;
            const converted = packageCurrency === "LKR"
                ? numericValue * USD_TO_LKR_RATE
                : numericValue;

            return currencyFormatter.format(converted);
        },
        [currencyFormatter, packageCurrency]
    );

    const packageMetrics = useMemo(() => computePackageMetrics(packages), [packages]);
    const quoteMatrix = useMemo(
        () => buildQuoteMatrix(packages, { metrics: packageMetrics }),
        [packages, packageMetrics]
    );
    const detailedQuotes = useMemo(
        () => resolveDetailedQuotes(packages, quoteMatrix),
        [packages, quoteMatrix]
    );

    const computedReviewContext = useMemo(() => {
        if (detailedQuotes.length > 0) {
            return buildReviewContext(detailedQuotes, packageCurrency);
        }

        return {
            ...fallbackReviewContext,
            displayCurrency: packageCurrency,
        };
    }, [detailedQuotes, fallbackReviewContext, packageCurrency]);

    useEffect(() => {
        setData((previous) => {
            const previousPackages = Array.isArray(previous.packages) ? [...previous.packages] : [];
            let changed = false;

            const nextPackages = previousPackages.map((pkg, index) => {
                const entry = quoteMatrix.find((item) => item.packageIndex === index);
                if (!entry || entry.providers.length === 0) {
                    return pkg;
                }

                const current = pkg ? { ...pkg } : {};
                const provider = entry.providers.find((option) => option.id === current.courierProvider);

                if (!provider) {
                    const fallbackProvider = entry.providers[0];
                    if (!fallbackProvider) {
                        return pkg;
                    }

                    changed = true;
                    return {
                        ...current,
                        courierProvider: fallbackProvider.id,
                        serviceLevel: fallbackProvider.tiers?.[0]?.id || "",
                    };
                }

                const serviceExists = (provider.tiers || []).some((tier) => tier.id === current.serviceLevel);
                if (!serviceExists) {
                    changed = true;
                    return {
                        ...current,
                        serviceLevel: provider.tiers?.[0]?.id || "",
                    };
                }

                return pkg;
            });

            if (!changed) {
                return previous;
            }

            return {
                ...previous,
                packages: nextPackages,
            };
        });
    }, [quoteMatrix, setData]);

    // Keep the form payload aligned with the latest quote recalculations.
    useEffect(() => {
        setData((previous) => {
            const previousJson = JSON.stringify(previous.reviewContext || {});
            const nextJson = JSON.stringify(computedReviewContext);

            if (previousJson === nextJson) {
                return previous;
            }

            return {
                ...previous,
                reviewContext: computedReviewContext,
            };
        });
    }, [computedReviewContext, setData]);

    const selectedQuotes = computedReviewContext.selectedQuotes || [];
    const totalPriceUSD = computedReviewContext.totalPriceUSD || 0;

    const selectedQuotesMap = useMemo(() => {
        return selectedQuotes.reduce((acc, quote) => {
            acc[quote.packageIndex] = quote;
            return acc;
        }, {});
    }, [selectedQuotes]);

    const availablePackageTypes = useMemo(() => {
        const pool = new Set(packageTypes);
        packages.forEach((pkg) => {
            if (pkg?.packageType) {
                pool.add(pkg.packageType);
            }
        });
        return Array.from(pool);
    }, [packageTypes, packages]);

    const handleCourierProviderChange = (index, providerId) => {
        setData((previous) => {
            const packagesDraft = Array.isArray(previous.packages) ? [...previous.packages] : [];
            const currentPackage = packagesDraft[index] ? { ...packagesDraft[index] } : {};
            const entry = quoteMatrix.find((item) => item.packageIndex === index);
            const provider = entry?.providers?.find((option) => option.id === providerId);
            const tiers = provider?.tiers || [];

            currentPackage.courierProvider = providerId || "";
            currentPackage.serviceLevel = providerId
                ? (tiers.some((tier) => tier.id === currentPackage.serviceLevel)
                    ? currentPackage.serviceLevel
                    : tiers[0]?.id || "")
                : "";

            packagesDraft[index] = currentPackage;

            return {
                ...previous,
                packages: packagesDraft,
            };
        });
    };

    const handleServiceLevelChange = (index, serviceLevelId) => {
        setData((previous) => {
            const packagesDraft = Array.isArray(previous.packages) ? [...previous.packages] : [];
            const currentPackage = packagesDraft[index] ? { ...packagesDraft[index] } : {};
            const providerId = currentPackage.courierProvider;

            if (!providerId) {
                currentPackage.serviceLevel = serviceLevelId;
            } else {
                const entry = quoteMatrix.find((item) => item.packageIndex === index);
                const provider = entry?.providers?.find((option) => option.id === providerId);
                const tiers = provider?.tiers || [];
                const tierExists = tiers.some((tier) => tier.id === serviceLevelId);

                currentPackage.serviceLevel = tierExists ? serviceLevelId : tiers[0]?.id || "";
            }

            packagesDraft[index] = currentPackage;

            return {
                ...previous,
                packages: packagesDraft,
            };
        });
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F4F7FB] text-[#0B1739]">
            <Head title="Courier Details" />
            <Header />

            <section className="bg-[#0B1739] text-white">
                <div className="container mx-auto px-4 py-12">
                    <p className="uppercase tracking-wide text-xs text-[#6FB3FF]">Courier Service</p>
                    <h1 className="text-3xl md:text-4xl font-semibold mt-3">Enter shipment details</h1>
                    <p className="mt-4 max-w-2xl text-sm md:text-base text-white/80">
                        Provide sender and recipient information along with shipment preferences. We'll use these details to prepare your booking summary.
                    </p>
                </div>
            </section>

            <main className="container mx-auto px-4 -mt-16 mb-16 flex-1">
                <div className="bg-white shadow-xl rounded-2xl px-6 md:px-10 py-10 poppins">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        {packages.length > 0 && (
                            <section className="rounded-2xl border border-[#E3EAF5] bg-[#F9FBFF] p-6">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-[#0B1739]">Package details</h2>
                                        <p className="mt-1 text-sm text-[#5B6887]">Review the parcels included in this shipment.</p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="rounded-full bg-[#0955AC]/10 px-4 py-1 text-sm font-medium text-[#0955AC]">
                                            Pieces: {packageMetrics.totalPackages || 0}
                                        </div>
                                        {packageMetrics.billableWeight > 0 && (
                                            <div className="rounded-full bg-[#CAD6E7] px-4 py-1 text-sm font-medium text-[#0B1739]">
                                                Billable: {packageMetrics.billableWeight.toFixed(2)} kg
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <p className="mt-4 text-xs text-[#6B7893]">
                                    Update parcel information below. Courier pricing recalculates automatically when weights or dimensions change.
                                </p>

                                <div className="mt-6 space-y-6">
                                    {packages.map((pkg, index) => {
                                        const selection = selectedQuotesMap[index];
                                        const rawBillable = selection?.billableWeight ?? selection?.weight;
                                        const numericBillable = rawBillable !== undefined && rawBillable !== null && rawBillable !== ""
                                            ? Number(rawBillable)
                                            : null;
                                        const billableDisplay = numericBillable !== null && !Number.isNaN(numericBillable)
                                            ? `${numericBillable.toFixed(2)} kg billable`
                                            : null;
                                        const typeOptions = availablePackageTypes.length > 0
                                            ? availablePackageTypes
                                            : [pkg.packageType || "parcel"];
                                        const errorFor = (field) => combinedErrors[`packages.${index}.${field}`];
                                        const quoteEntry = quoteMatrix.find((item) => item.packageIndex === index);
                                        const providerOptions = quoteEntry?.providers || [];
                                        const providerDetails = providerOptions.find((option) => option.id === pkg.courierProvider) || null;
                                        const tierOptions = providerDetails?.tiers || [];

                                        return (
                                            <div key={`details-package-${index}`} className="rounded-xl border border-[#D6DEEB] bg-white p-5 text-sm text-[#0B1739] shadow-sm">
                                                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-[#5B6887]">Package {index + 1}</p>
                                                        {selection && (
                                                            <p className="text-xs text-[#6B7893]">
                                                                Selected service: {selection.providerName} | {selection.serviceLabel}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {billableDisplay && (
                                                        <span className="inline-flex items-center rounded-full bg-[#EEF3FC] px-3 py-1 text-xs font-medium text-[#0955AC]">
                                                            {billableDisplay}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium">Courier provider *</label>
                                                        <select
                                                            value={pkg.courierProvider || ""}
                                                            onChange={(event) => handleCourierProviderChange(index, event.target.value)}
                                                            className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                        >
                                                            <option value="">Select provider</option>
                                                            {providerOptions.map((provider) => (
                                                                <option key={`package-${index}-provider-${provider.id}`} value={provider.id}>
                                                                    {provider.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {errorFor("courierProvider") && (
                                                            <p className="mt-2 text-xs text-red-500">{errorFor("courierProvider")}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium">Service level *</label>
                                                        <select
                                                            value={pkg.serviceLevel || ""}
                                                            onChange={(event) => handleServiceLevelChange(index, event.target.value)}
                                                            className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                            disabled={!pkg.courierProvider}
                                                        >
                                                            <option value="">Select service level</option>
                                                            {tierOptions.map((tier) => (
                                                                <option key={`package-${index}-tier-${tier.id}`} value={tier.id}>
                                                                    {`${tier.label} — ${formatCurrency(tier.price)}`}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {errorFor("serviceLevel") && (
                                                            <p className="mt-2 text-xs text-red-500">{errorFor("serviceLevel")}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium">Label</label>
                                                        <input
                                                            type="text"
                                                            value={pkg.label}
                                                            onChange={(event) => updatePackageField(index, "label", event.target.value)}
                                                            className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                            placeholder="Office documents"
                                                        />
                                                        {errorFor("label") && (
                                                            <p className="mt-2 text-xs text-red-500">{errorFor("label")}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium">Type</label>
                                                        <select
                                                            value={pkg.packageType}
                                                            onChange={(event) => updatePackageField(index, "packageType", event.target.value)}
                                                            className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                        >
                                                            {typeOptions.map((type) => (
                                                                <option key={`package-type-${index}-${type || 'blank'}`} value={type}>
                                                                    {type ? type.replace(/_/g, " ") : "Select type"}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {errorFor("packageType") && (
                                                            <p className="mt-2 text-xs text-red-500">{errorFor("packageType")}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium">Quantity *</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={pkg.quantity}
                                                            onChange={(event) => updatePackageField(index, "quantity", event.target.value)}
                                                            className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                        />
                                                        {errorFor("quantity") && (
                                                            <p className="mt-2 text-xs text-red-500">{errorFor("quantity")}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium">Weight (kg) *</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={pkg.weightKg}
                                                            onChange={(event) => updatePackageField(index, "weightKg", event.target.value)}
                                                            className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                            placeholder="5.5"
                                                        />
                                                        {errorFor("weightKg") && (
                                                            <p className="mt-2 text-xs text-red-500">{errorFor("weightKg")}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium">Declared value ({packageCurrency})</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={pkg.declaredValue}
                                                            onChange={(event) => updatePackageField(index, "declaredValue", event.target.value)}
                                                            className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                        />
                                                        {errorFor("declaredValue") && (
                                                            <p className="mt-2 text-xs text-red-500">{errorFor("declaredValue")}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium">Length (cm)</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.1"
                                                            value={pkg.lengthCm}
                                                            onChange={(event) => updatePackageField(index, "lengthCm", event.target.value)}
                                                            className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                        />
                                                        {errorFor("lengthCm") && (
                                                            <p className="mt-2 text-xs text-red-500">{errorFor("lengthCm")}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium">Width (cm)</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.1"
                                                            value={pkg.widthCm}
                                                            onChange={(event) => updatePackageField(index, "widthCm", event.target.value)}
                                                            className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                        />
                                                        {errorFor("widthCm") && (
                                                            <p className="mt-2 text-xs text-red-500">{errorFor("widthCm")}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium">Height (cm)</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.1"
                                                            value={pkg.heightCm}
                                                            onChange={(event) => updatePackageField(index, "heightCm", event.target.value)}
                                                            className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                        />
                                                        {errorFor("heightCm") && (
                                                            <p className="mt-2 text-xs text-red-500">{errorFor("heightCm")}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <label className="mb-2 block text-sm font-medium">Description</label>
                                                    <textarea
                                                        rows="3"
                                                        value={pkg.description}
                                                        onChange={(event) => updatePackageField(index, "description", event.target.value)}
                                                        className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                        placeholder="Fragile glassware, keep upright"
                                                    />
                                                    {errorFor("description") && (
                                                        <p className="mt-2 text-xs text-red-500">{errorFor("description")}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <div className="rounded-2xl border border-[#E3EAF5] bg-[#F9FBFF] p-6">
                                <h2 className="text-lg font-semibold text-[#0B1739]">Sender details</h2>
                                <p className="mt-1 text-sm text-[#5B6887]">Pickup contact and address</p>
                                <div className="mt-5 space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">Name *</label>
                                        <input
                                            type="text"
                                            value={data.sender.name}
                                            onChange={(event) => updateNestedField("sender.name", event.target.value)}
                                            className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                            placeholder="Jane Smith"
                                            required
                                        />
                                        {combinedErrors["sender.name"] && (
                                            <p className="mt-2 text-xs text-red-500">{combinedErrors["sender.name"]}</p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">Email</label>
                                            <input
                                                type="email"
                                                value={data.sender.email}
                                                onChange={(event) => updateNestedField("sender.email", event.target.value)}
                                                className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                placeholder="jane@example.com"
                                            />
                                            {combinedErrors["sender.email"] && (
                                                <p className="mt-2 text-xs text-red-500">{combinedErrors["sender.email"]}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">Phone</label>
                                            <input
                                                type="text"
                                                value={data.sender.phone}
                                                onChange={(event) => updateNestedField("sender.phone", event.target.value)}
                                                className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                placeholder="+1 202 555 0147"
                                            />
                                            {combinedErrors["sender.phone"] && (
                                                <p className="mt-2 text-xs text-red-500">{combinedErrors["sender.phone"]}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">Company</label>
                                        <input
                                            type="text"
                                            value={data.sender.company}
                                            onChange={(event) => updateNestedField("sender.company", event.target.value)}
                                            className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                            placeholder="Acme Corp"
                                        />
                                        {combinedErrors["sender.company"] && (
                                            <p className="mt-2 text-xs text-red-500">{combinedErrors["sender.company"]}</p>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">Address line 1 *</label>
                                            <input
                                                type="text"
                                                value={data.sender.address.line1}
                                                onChange={(event) => updateNestedField("sender.address.line1", event.target.value)}
                                                className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                placeholder="123 Main Street"
                                                required
                                            />
                                            {combinedErrors["sender.address.line1"] && (
                                                <p className="mt-2 text-xs text-red-500">{combinedErrors["sender.address.line1"]}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">Address line 2</label>
                                            <input
                                                type="text"
                                                value={data.sender.address.line2}
                                                onChange={(event) => updateNestedField("sender.address.line2", event.target.value)}
                                                className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                placeholder="Suite 400"
                                            />
                                            {combinedErrors["sender.address.line2"] && (
                                                <p className="mt-2 text-xs text-red-500">{combinedErrors["sender.address.line2"]}</p>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">City *</label>
                                                <input
                                                    type="text"
                                                    value={data.sender.address.city}
                                                    onChange={(event) => updateNestedField("sender.address.city", event.target.value)}
                                                    className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                    placeholder="Colombo"
                                                    required
                                                />
                                                {combinedErrors["sender.address.city"] && (
                                                    <p className="mt-2 text-xs text-red-500">{combinedErrors["sender.address.city"]}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">State / Province</label>
                                                <input
                                                    type="text"
                                                    value={data.sender.address.state}
                                                    onChange={(event) => updateNestedField("sender.address.state", event.target.value)}
                                                    className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                    placeholder="Western"
                                                />
                                                {combinedErrors["sender.address.state"] && (
                                                    <p className="mt-2 text-xs text-red-500">{combinedErrors["sender.address.state"]}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">Postal code</label>
                                                <input
                                                    type="text"
                                                    value={data.sender.address.postalCode}
                                                    onChange={(event) => updateNestedField("sender.address.postalCode", event.target.value)}
                                                    className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                />
                                                {combinedErrors["sender.address.postalCode"] && (
                                                    <p className="mt-2 text-xs text-red-500">{combinedErrors["sender.address.postalCode"]}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">Country *</label>
                                                <select
                                                    value={data.sender.address.country}
                                                    onChange={(event) => updateNestedField("sender.address.country", event.target.value.toUpperCase())}
                                                    className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                    required
                                                >
                                                    {countries.map((countryCode) => (
                                                        <option key={`sender-country-${countryCode}`} value={countryCode}>
                                                            {countryCode}
                                                        </option>
                                                    ))}
                                                </select>
                                                {combinedErrors["sender.address.country"] && (
                                                    <p className="mt-2 text-xs text-red-500">{combinedErrors["sender.address.country"]}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">Pickup instructions</label>
                                            <textarea
                                                rows="3"
                                                value={data.sender.address.instructions}
                                                onChange={(event) => updateNestedField("sender.address.instructions", event.target.value)}
                                                className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                placeholder="Gate access code, preferred pickup window, etc."
                                            />
                                            {combinedErrors["sender.address.instructions"] && (
                                                <p className="mt-2 text-xs text-red-500">{combinedErrors["sender.address.instructions"]}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-[#E3EAF5] bg-[#F9FBFF] p-6">
                                <h2 className="text-lg font-semibold text-[#0B1739]">Recipient details</h2>
                                <p className="mt-1 text-sm text-[#5B6887]">Delivery contact and address</p>
                                <div className="mt-5 space-y-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">Name *</label>
                                        <input
                                            type="text"
                                            value={data.recipient.name}
                                            onChange={(event) => updateNestedField("recipient.name", event.target.value)}
                                            className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                            placeholder="Michael Brown"
                                            required
                                        />
                                        {combinedErrors["recipient.name"] && (
                                            <p className="mt-2 text-xs text-red-500">{combinedErrors["recipient.name"]}</p>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">Email</label>
                                            <input
                                                type="email"
                                                value={data.recipient.email}
                                                onChange={(event) => updateNestedField("recipient.email", event.target.value)}
                                                className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                placeholder="michael@example.com"
                                            />
                                            {combinedErrors["recipient.email"] && (
                                                <p className="mt-2 text-xs text-red-500">{combinedErrors["recipient.email"]}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">Phone</label>
                                            <input
                                                type="text"
                                                value={data.recipient.phone}
                                                onChange={(event) => updateNestedField("recipient.phone", event.target.value)}
                                                className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                placeholder="+44 20 7946 0958"
                                            />
                                            {combinedErrors["recipient.phone"] && (
                                                <p className="mt-2 text-xs text-red-500">{combinedErrors["recipient.phone"]}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">Company</label>
                                        <input
                                            type="text"
                                            value={data.recipient.company}
                                            onChange={(event) => updateNestedField("recipient.company", event.target.value)}
                                            className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                            placeholder="Recipient Inc."
                                        />
                                        {combinedErrors["recipient.company"] && (
                                            <p className="mt-2 text-xs text-red-500">{combinedErrors["recipient.company"]}</p>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">Address line 1 *</label>
                                            <input
                                                type="text"
                                                value={data.recipient.address.line1}
                                                onChange={(event) => updateNestedField("recipient.address.line1", event.target.value)}
                                                className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                placeholder="45 Oxford Street"
                                                required
                                            />
                                            {combinedErrors["recipient.address.line1"] && (
                                                <p className="mt-2 text-xs text-red-500">{combinedErrors["recipient.address.line1"]}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">Address line 2</label>
                                            <input
                                                type="text"
                                                value={data.recipient.address.line2}
                                                onChange={(event) => updateNestedField("recipient.address.line2", event.target.value)}
                                                className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                placeholder="Floor 2"
                                            />
                                            {combinedErrors["recipient.address.line2"] && (
                                                <p className="mt-2 text-xs text-red-500">{combinedErrors["recipient.address.line2"]}</p>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">City *</label>
                                                <input
                                                    type="text"
                                                    value={data.recipient.address.city}
                                                    onChange={(event) => updateNestedField("recipient.address.city", event.target.value)}
                                                    className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                    placeholder="London"
                                                    required
                                                />
                                                {combinedErrors["recipient.address.city"] && (
                                                    <p className="mt-2 text-xs text-red-500">{combinedErrors["recipient.address.city"]}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">State / Province</label>
                                                <input
                                                    type="text"
                                                    value={data.recipient.address.state}
                                                    onChange={(event) => updateNestedField("recipient.address.state", event.target.value)}
                                                    className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                    placeholder="Greater London"
                                                />
                                                {combinedErrors["recipient.address.state"] && (
                                                    <p className="mt-2 text-xs text-red-500">{combinedErrors["recipient.address.state"]}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">Postal code</label>
                                                <input
                                                    type="text"
                                                    value={data.recipient.address.postalCode}
                                                    onChange={(event) => updateNestedField("recipient.address.postalCode", event.target.value)}
                                                    className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                />
                                                {combinedErrors["recipient.address.postalCode"] && (
                                                    <p className="mt-2 text-xs text-red-500">{combinedErrors["recipient.address.postalCode"]}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium">Country *</label>
                                                <select
                                                    value={data.recipient.address.country}
                                                    onChange={(event) => updateNestedField("recipient.address.country", event.target.value.toUpperCase())}
                                                    className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                    required
                                                >
                                                    {countries.map((countryCode) => (
                                                        <option key={`recipient-country-${countryCode}`} value={countryCode}>
                                                            {countryCode}
                                                        </option>
                                                    ))}
                                                </select>
                                                {combinedErrors["recipient.address.country"] && (
                                                    <p className="mt-2 text-xs text-red-500">{combinedErrors["recipient.address.country"]}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-2 block text-sm font-medium">Delivery instructions</label>
                                            <textarea
                                                rows="3"
                                                value={data.recipient.address.instructions}
                                                onChange={(event) => updateNestedField("recipient.address.instructions", event.target.value)}
                                                className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                                placeholder="Leave with reception, call on arrival, etc."
                                            />
                                            {combinedErrors["recipient.address.instructions"] && (
                                                <p className="mt-2 text-xs text-red-500">{combinedErrors["recipient.address.instructions"]}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-[#E3EAF5] bg-[#F9FBFF] p-6">
                            <h2 className="text-lg font-semibold text-[#0B1739]">Shipment preferences</h2>
                            <p className="mt-1 text-sm text-[#5B6887]">Service level and additional options</p>
                            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium">Preferred service level *</label>
                                    <select
                                        value={data.shipment.serviceLevel}
                                        onChange={(event) => updateNestedField("shipment.serviceLevel", event.target.value)}
                                        className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                        required
                                    >
                                        {serviceLevels.map((level) => (
                                            <option key={`shipment-level-${level}`} value={level}>
                                                {level}
                                            </option>
                                        ))}
                                    </select>
                                    {combinedErrors["shipment.serviceLevel"] && (
                                        <p className="mt-2 text-xs text-red-500">{combinedErrors["shipment.serviceLevel"]}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium">Currency *</label>
                                    <select
                                        value={data.shipment.currency}
                                        onChange={(event) => updateNestedField("shipment.currency", event.target.value.toUpperCase())}
                                        className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                        required
                                    >
                                        {CURRENCY_OPTIONS.map((currencyCode) => (
                                            <option key={`currency-${currencyCode}`} value={currencyCode}>
                                                {currencyCode}
                                            </option>
                                        ))}
                                    </select>
                                    {combinedErrors["shipment.currency"] && (
                                        <p className="mt-2 text-xs text-red-500">{combinedErrors["shipment.currency"]}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium">Pickup date</label>
                                    <input
                                        type="date"
                                        value={data.shipment.pickupDate}
                                        onChange={(event) => updateNestedField("shipment.pickupDate", event.target.value)}
                                        className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                    />
                                    {combinedErrors["shipment.pickupDate"] && (
                                        <p className="mt-2 text-xs text-red-500">{combinedErrors["shipment.pickupDate"]}</p>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">Pickup window start</label>
                                        <input
                                            type="time"
                                            value={data.shipment.pickupWindowStart}
                                            onChange={(event) => updateNestedField("shipment.pickupWindowStart", event.target.value)}
                                            className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                        />
                                        {combinedErrors["shipment.pickupWindowStart"] && (
                                            <p className="mt-2 text-xs text-red-500">{combinedErrors["shipment.pickupWindowStart"]}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">Pickup window end</label>
                                        <input
                                            type="time"
                                            value={data.shipment.pickupWindowEnd}
                                            onChange={(event) => updateNestedField("shipment.pickupWindowEnd", event.target.value)}
                                            className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                        />
                                        {combinedErrors["shipment.pickupWindowEnd"] && (
                                            <p className="mt-2 text-xs text-red-500">{combinedErrors["shipment.pickupWindowEnd"]}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-lg border border-[#E3EAF5] bg-white px-4 py-3">
                                    <input
                                        id="shipment-insurance"
                                        type="checkbox"
                                        checked={Boolean(data.shipment.insurance)}
                                        onChange={(event) => updateNestedField("shipment.insurance", event.target.checked)}
                                        className="h-4 w-4 rounded border-[#B8C5E0] text-[#0955AC] focus:ring-[#0955AC]"
                                    />
                                    <label htmlFor="shipment-insurance" className="text-sm text-[#0B1739]">
                                        Add insurance coverage for the declared value
                                    </label>
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium">Declared value ({data.shipment.currency})</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.shipment.estimatedValue}
                                        onChange={(event) => updateNestedField("shipment.estimatedValue", event.target.value)}
                                        className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                        placeholder="500"
                                    />
                                    {combinedErrors["shipment.estimatedValue"] && (
                                        <p className="mt-2 text-xs text-red-500">{combinedErrors["shipment.estimatedValue"]}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium">Delivery notes</label>
                                <textarea
                                    rows="4"
                                    value={data.shipment.deliveryNotes}
                                    onChange={(event) => updateNestedField("shipment.deliveryNotes", event.target.value)}
                                    className="w-full rounded-lg border border-[#D6DEEB] px-4 py-3 focus:border-[#0955AC] focus:outline-none"
                                    placeholder="Any additional handling requests or customs information"
                                />
                                {combinedErrors["shipment.deliveryNotes"] && (
                                    <p className="mt-2 text-xs text-red-500">{combinedErrors["shipment.deliveryNotes"]}</p>
                                )}
                            </div>
                        </section>

                        {selectedQuotes.length > 0 && (
                            <section className="rounded-2xl border border-[#E3EAF5] bg-[#F9FBFF] p-6">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#0B1739]">Selected courier services</h3>
                                        <p className="text-sm text-[#5B6887]">Review the carriers chosen for each package.</p>
                                    </div>
                                    <div className="rounded-full bg-[#0955AC]/10 px-4 py-1 text-sm font-medium text-[#0955AC]">
                                        Estimated total: {formatCurrency(totalPriceUSD)}
                                    </div>
                                </div>
                                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {selectedQuotes.map((quote) => {
                                        const packageRecord = packages[quote.packageIndex] || {};
                                        const packageLabel = packageRecord.label || quote.label || `Package ${quote.packageIndex + 1}`;
                                        const rawBillable = quote.billableWeight ?? quote.weight;
                                        const numericBillable = rawBillable !== undefined && rawBillable !== null && rawBillable !== ""
                                            ? Number(rawBillable)
                                            : null;
                                        const billableSummary = numericBillable !== null && !Number.isNaN(numericBillable)
                                            ? `${numericBillable.toFixed(2)} kg`
                                            : "";

                                        return (
                                            <div key={`details-quote-${quote.packageIndex}`} className="rounded-xl border border-[#D6DEEB] bg-white p-4 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="font-semibold text-[#0B1739]">{packageLabel}</p>
                                                        <p className="text-xs text-[#6B7893]">
                                                            {quote.providerName} | {quote.serviceLabel}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-[#0B1739]">{formatCurrency(quote.priceUSD || 0)}</p>
                                                        <p className="text-xs text-[#6B7893]">{quote.eta}</p>
                                                    </div>
                                                </div>
                                                <p className="mt-3 text-xs text-[#5B6887]">
                                                    Billable weight: {billableSummary || "—"}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        <div className="flex flex-col items-center gap-3">
                            <div className="flex items-center gap-2 text-xs text-[#6B7893]">
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0955AC]/10 text-[#0955AC] font-semibold">1</span>
                                Courier selections
                                <span className="mx-2">→</span>
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0955AC] text-white font-semibold">2</span>
                                Shipment details
                                <span className="mx-2">→</span>
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#CAD6E7] text-[#0B1739] font-semibold">3</span>
                                Review & confirm
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className={`w-full max-w-sm rounded-lg bg-[#0955AC] px-6 py-3 text-center text-sm font-semibold text-white shadow-lg transition focus:outline-none focus:ring-2 focus:ring-[#0a4b93] focus:ring-offset-2 ${
                                    processing ? "cursor-not-allowed opacity-50" : "hover:bg-[#0a4b93]"
                                }`}
                            >
                                {processing ? "Saving details..." : "Continue to summary"}
                            </button>
                            <Link
                                href="/couriers/create"
                                className="text-xs text-[#5B6887] hover:text-[#0955AC] transition"
                            >
                                ← Go back to package selection
                            </Link>
                        </div>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Details;
