import React, { useEffect, useMemo, useRef, useState } from "react";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { createPortal } from "react-dom";
import Header from "../layouts/Header";
import Footer from "../layouts/Footer";
import bg from "../assets/courierService/bg.png";
import DetailsForm from "./Details";
import SummaryView from "./Summary";
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

const DOMESTIC_COUNTRY_CODE = "LK";
const DOMESTIC_COUNTRY_LABEL = COUNTRY_LABELS[DOMESTIC_COUNTRY_CODE] || DOMESTIC_COUNTRY_CODE;
const LOCATION_API_BASE = "/api/location";
const GOOGLE_MAPS_PLACES_SCRIPT_ID = "google-maps-places-script";

const OUNCES_PER_KILOGRAM = 35.27396195;
const CENTIMETERS_PER_YARD = 91.44;
const CENTIMETERS_PER_METER = 100;
const MILLIMETERS_PER_CENTIMETER = 10;
const DIMENSION_UNIT_FACTORS = {
    cm: 1,
    mm: MILLIMETERS_PER_CENTIMETER,
    m: 1 / CENTIMETERS_PER_METER,
    yd: 1 / CENTIMETERS_PER_YARD,
};
const SHIPMENT_TYPE_OPTIONS = [
    { value: "electronics", label: "Electronics" },
    { value: "documents", label: "Documents" },
    { value: "clothing", label: "Clothing" },
    { value: "medical", label: "Medical supplies" },
    { value: "perishable", label: "Perishable" },
    { value: "fragile", label: "Fragile" },
    { value: "other", label: "Other" },
];

const QUOTE_TIER_OPTIONS = [
    { id: "economy", label: "Economy", color: "text-emerald-700" },
    { id: "express", label: "Express", color: "text-blue-700" },
    { id: "priority", label: "Priority", color: "text-purple-700" },
];

const Create = () => {
    const { props } = usePage();
    const packageTypes = props.packageTypes || [];
    const countries = props.countries || [];
    const quoteProviders = Array.isArray(props.quoteProviders) ? props.quoteProviders : [];
    const { flash } = props;
    const recentShipmentId = props.recentShipmentId;
    const recentPricingExplanation = props.recentPricingExplanation;
    const packageSectionDescription = "Use the quick calculator layout to set locations, weight, and dimensions.";
    const defaultDomesticFromCity = "";
    const defaultDomesticToCity = "";

    const buildDefaultQuoteFilters = () => ({
        providerSearch: "",
        minPrice: "",
        maxPrice: "",
        tiers: QUOTE_TIER_OPTIONS.reduce((acc, tier) => ({
            ...acc,
            [tier.id]: true,
        }), {}),
    });

    // Currency conversion state
    const [displayCurrency, setDisplayCurrency] = useState('LKR');
    const USD_TO_LKR_RATE = 325; // Exchange rate (you can make this dynamic later)

    // Active package for courier selection
    const [activePackageIndex, setActivePackageIndex] = useState(0);

    const [isPlacing, setIsPlacing] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [serviceDetailsModal, setServiceDetailsModal] = useState(null);
    const [routeSwitchPrompt, setRouteSwitchPrompt] = useState(null);
    const [quoteFilters, setQuoteFilters] = useState(() => buildDefaultQuoteFilters());
    const [showDetails, setShowDetails] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    const quotesSectionRef = useRef(null);
    const quotesTableRef = useRef(null);
    const quotesAutoScrollRef = useRef(false);
    const detailsSectionRef = useRef(null);
    const summarySectionRef = useRef(null);

    const buildEmptyForm = (routeType) => {
        const isDomestic = routeType !== "international";
        return {
            sender: {
                name: "",
                email: "",
                phone: "",
                company: "",
                address: {
                    line1: "",
                    line2: "",
                    city: isDomestic ? defaultDomesticFromCity : "",
                    state: "",
                    postalCode: "",
                    country: isDomestic ? DOMESTIC_COUNTRY_CODE : "",
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
                    city: isDomestic ? defaultDomesticToCity : "",
                    state: "",
                    postalCode: "",
                    country: isDomestic ? DOMESTIC_COUNTRY_CODE : "",
                    instructions: "",
                },
            },
            shipment: {
                pickupDate: "",
                pickupWindowStart: "",
                pickupWindowEnd: "",
                routeType: isDomestic ? "domestic" : "international",
                courierProvider: "",
                insurance: false,
                estimatedValue: "",
                paymentOptions: {
                    all: false,
                    cod: false,
                    card: false,
                },
                shipmentType: "",
                shipmentTypeDescription: "",
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
        };
    };

    const initialForm = buildEmptyForm("domestic");
    const {
        data,
        setData,
        errors,
        post,
        processing,
        setError,
        clearErrors,
    } = useForm(initialForm);
    const [activeLocationField, setActiveLocationField] = useState(null);
    const [locationSearch, setLocationSearch] = useState({
        senderCity: initialForm.sender.address.city || "",
        recipientCity: initialForm.recipient.address.city || "",
        senderCountry: initialForm.sender.address.country || "",
        recipientCountry: initialForm.recipient.address.country || "",
    });
    const [domesticSelections, setDomesticSelections] = useState({
        senderProvinceId: "",
        senderDistrictId: "",
        recipientProvinceId: "",
        recipientDistrictId: "",
    });
    const [domesticLookups, setDomesticLookups] = useState({
        provinces: [],
        senderDistricts: [],
        recipientDistricts: [],
        senderCities: [],
        recipientCities: [],
        loading: {
            provinces: false,
            senderDistricts: false,
            recipientDistricts: false,
            senderCities: false,
            recipientCities: false,
        },
    });
    const [locationLookupError, setLocationLookupError] = useState("");
    const domesticLookupCacheRef = useRef({
        provincesByCountry: {},
        districtsByProvince: {},
        citiesByDistrict: {},
    });
    const domesticProvinceRequestRef = useRef(false);
    const googleMapsApiKey = String(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "").trim();
    const [googlePlacesReady, setGooglePlacesReady] = useState(
        () => typeof window !== "undefined" && Boolean(window.google?.maps?.places)
    );
    const [googlePlacesError, setGooglePlacesError] = useState("");
    const [googlePlacePredictions, setGooglePlacePredictions] = useState({
        sender: [],
        recipient: [],
    });
    const googlePlacesScriptLoadingRef = useRef(false);
    const googleAutocompleteServiceRef = useRef(null);
    const googlePlacesServiceRef = useRef(null);
    const googlePlacesHostNodeRef = useRef(null);
    const googleAutocompleteSessionTokenRef = useRef(null);
    const googlePredictionSequenceRef = useRef({ sender: 0, recipient: 0 });

    const POLICY_ADJUSTMENT_LABELS = {
        remote_area_surcharge: "Remote area surcharge",
        overweight_surcharge: "Overweight surcharge",
        oversize_surcharge: "Oversize surcharge",
        holiday_surcharge: "Holiday surcharge",
        peak_hour_surcharge: "Peak-hour surcharge",
        cod_fee: "COD fee",
        minimum_shipment_guardrail: "Minimum shipment guardrail",
        speed_eta_tier_multiplier: "Speed/ETA tier multiplier",
        international_dimensions_engine: "International dimensions engine",
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

    const provinceOptions = useMemo(
        () => (domesticLookups.provinces || []).map((province) => ({
            value: String(province.id),
            label: province.nameEn,
        })),
        [domesticLookups.provinces]
    );

    const senderDistrictOptions = useMemo(
        () => (domesticLookups.senderDistricts || []).map((district) => ({
            value: String(district.id),
            label: district.nameEn,
        })),
        [domesticLookups.senderDistricts]
    );

    const recipientDistrictOptions = useMemo(
        () => (domesticLookups.recipientDistricts || []).map((district) => ({
            value: String(district.id),
            label: district.nameEn,
        })),
        [domesticLookups.recipientDistricts]
    );

    const senderCityOptions = useMemo(
        () => (domesticLookups.senderCities || [])
            .map((city) => ({
                value: city.nameEn,
                label: city.displayName || city.nameEn,
            }))
            .filter((option) => option.value && option.label),
        [domesticLookups.senderCities]
    );

    const recipientCityOptions = useMemo(
        () => (domesticLookups.recipientCities || [])
            .map((city) => ({
                value: city.nameEn,
                label: city.displayName || city.nameEn,
            }))
            .filter((option) => option.value && option.label),
        [domesticLookups.recipientCities]
    );

    const senderGoogleCityOptions = useMemo(
        () => (googlePlacePredictions.sender || []).map((prediction) => ({
            value: prediction.mainText || prediction.description,
            label: prediction.description,
            source: "google",
            placeId: prediction.placeId,
        })),
        [googlePlacePredictions.sender]
    );

    const recipientGoogleCityOptions = useMemo(
        () => (googlePlacePredictions.recipient || []).map((prediction) => ({
            value: prediction.mainText || prediction.description,
            label: prediction.description,
            source: "google",
            placeId: prediction.placeId,
        })),
        [googlePlacePredictions.recipient]
    );

    const setDomesticLoading = (key, loadingState) => {
        setDomesticLookups((previous) => ({
            ...previous,
            loading: {
                ...previous.loading,
                [key]: loadingState,
            },
        }));
    };

    const fetchLocationOptions = async (endpoint, loadingKey) => {
        setDomesticLoading(loadingKey, true);

        try {
            const response = await fetch(`${LOCATION_API_BASE}${endpoint}`, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
                credentials: "same-origin",
            });

            if (!response.ok) {
                throw new Error("Location lookup request failed.");
            }

            const payload = await response.json().catch(() => ({}));
            setLocationLookupError("");
            return Array.isArray(payload?.data) ? payload.data : [];
        } catch (error) {
            setLocationLookupError("Unable to load Sri Lanka locations right now. Please try again.");
            return [];
        } finally {
            setDomesticLoading(loadingKey, false);
        }
    };

    const countryOptions = useMemo(
        () => countries.map((code) => ({
            value: code,
            label: COUNTRY_LABELS[code] ? `${COUNTRY_LABELS[code]} (${code})` : code,
        })),
        [countries]
    );

    const stripCountryCodeSuffix = (label) =>
        String(label || "").replace(/\s*\([A-Z]{2}\)\s*$/i, "").trim();

    const filterLocationOptions = (options, query) => {
        const normalized = String(query || "").trim().toLowerCase();
        if (!normalized) {
            return options;
        }

        return options.filter((option) => {
            const label = String(option.label || "").toLowerCase();
            const value = String(option.value || "").toLowerCase();
            const stripped = stripCountryCodeSuffix(option.label || "").toLowerCase();
            return label.includes(normalized) || value.includes(normalized) || stripped.includes(normalized);
        });
    };

    const matchLocationOption = (options, query) => {
        const normalized = String(query || "").trim().toLowerCase();
        if (!normalized) {
            return null;
        }

        return options.find((option) => {
            const label = String(option.label || "").toLowerCase();
            const value = String(option.value || "").toLowerCase();
            const stripped = stripCountryCodeSuffix(option.label || "").toLowerCase();
            return label === normalized || value === normalized || stripped === normalized;
        }) || null;
    };

    const findGoogleAddressComponent = (components, type) => {
        return (components || []).find((component) =>
            Array.isArray(component?.types) && component.types.includes(type)
        ) || null;
    };

    const resolveGoogleCityName = (components, fallback = "") => {
        const cityTypes = [
            "locality",
            "postal_town",
            "sublocality_level_1",
            "administrative_area_level_3",
            "administrative_area_level_2",
        ];

        for (const type of cityTypes) {
            const component = findGoogleAddressComponent(components, type);
            if (component?.long_name) {
                return component.long_name;
            }
        }

        return fallback;
    };

    const ensureGooglePlacesServices = () => {
        if (typeof window === "undefined" || !window.google?.maps?.places) {
            return false;
        }

        if (!googleAutocompleteServiceRef.current) {
            googleAutocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        }

        if (!googlePlacesServiceRef.current) {
            if (!googlePlacesHostNodeRef.current && typeof document !== "undefined") {
                googlePlacesHostNodeRef.current = document.createElement("div");
            }

            if (googlePlacesHostNodeRef.current) {
                googlePlacesServiceRef.current = new window.google.maps.places.PlacesService(googlePlacesHostNodeRef.current);
            }
        }

        return Boolean(googleAutocompleteServiceRef.current && googlePlacesServiceRef.current);
    };

    const clearGooglePredictions = (party) => {
        setGooglePlacePredictions((previous) => ({
            ...previous,
            [party]: [],
        }));
    };

    const requestGoogleCityPredictions = (party, inputValue) => {
        const query = String(inputValue || "").trim();
        if (query.length < 2) {
            clearGooglePredictions(party);
            return;
        }

        if (!googlePlacesReady || !ensureGooglePlacesServices()) {
            clearGooglePredictions(party);
            return;
        }

        const nextSequence = (googlePredictionSequenceRef.current[party] || 0) + 1;
        googlePredictionSequenceRef.current[party] = nextSequence;

        if (
            !googleAutocompleteSessionTokenRef.current
            && window.google?.maps?.places?.AutocompleteSessionToken
        ) {
            googleAutocompleteSessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
        }

        const requestPayload = {
            input: query,
            componentRestrictions: {
                country: DOMESTIC_COUNTRY_CODE.toLowerCase(),
            },
            sessionToken: googleAutocompleteSessionTokenRef.current || undefined,
        };

        googleAutocompleteServiceRef.current.getPlacePredictions(
            requestPayload,
            (predictions, status) => {
                if (googlePredictionSequenceRef.current[party] !== nextSequence) {
                    return;
                }

                const okStatus = window.google?.maps?.places?.PlacesServiceStatus?.OK || "OK";
                if (status !== okStatus || !Array.isArray(predictions)) {
                    clearGooglePredictions(party);
                    return;
                }

                const mappedPredictions = predictions
                    .filter((prediction) => prediction?.place_id)
                    .map((prediction) => ({
                        placeId: prediction.place_id,
                        description: prediction.description || "",
                        mainText: prediction.structured_formatting?.main_text || prediction.description || "",
                    }));

                setGooglePlacePredictions((previous) => ({
                    ...previous,
                    [party]: mappedPredictions,
                }));
            }
        );
    };

    const fetchGooglePlaceDetails = (placeId) => {
        if (!placeId || !googlePlacesReady || !ensureGooglePlacesServices()) {
            return Promise.resolve(null);
        }

        return new Promise((resolve) => {
            googlePlacesServiceRef.current.getDetails(
                {
                    placeId,
                    fields: ["address_components", "formatted_address", "name"],
                    sessionToken: googleAutocompleteSessionTokenRef.current || undefined,
                },
                (place, status) => {
                    const okStatus = window.google?.maps?.places?.PlacesServiceStatus?.OK || "OK";
                    if (status === okStatus && place) {
                        resolve(place);
                        return;
                    }

                    resolve(null);
                }
            );
        });
    };

    const handleLocationInputBlur = (fieldKey) => {
        window.setTimeout(() => {
            setActiveLocationField((current) => (current === fieldKey ? null : current));
        }, 120);
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

    const updateAddressState = (party, stateName) => {
        const currentParty = party === "recipient" ? data.recipient : data.sender;

        setData(party, {
            ...currentParty,
            address: {
                ...currentParty.address,
                state: stateName,
            },
        });
    };

    const handleCitySearchChange = (party, fieldKey, value) => {
        setLocationSearch((previous) => ({
            ...previous,
            [fieldKey]: value,
        }));

        updateAddressCity(party, value);

        if (selectedRouteType === "domestic") {
            requestGoogleCityPredictions(party, value);
        }

        const options = party === "recipient" ? recipientCityOptions : senderCityOptions;
        const match = matchLocationOption(options, value);
        if (match) {
            updateAddressCity(party, match.value);
        }
    };

    const handleGoogleCitySelect = async (party, fieldKey, option) => {
        if (!option?.placeId) {
            return;
        }

        const place = await fetchGooglePlaceDetails(option.placeId);
        const components = Array.isArray(place?.address_components) ? place.address_components : [];

        const cityName = resolveGoogleCityName(components, option.value || option.label || "");
        const stateComponent = findGoogleAddressComponent(components, "administrative_area_level_1");
        const postalComponent = findGoogleAddressComponent(components, "postal_code");
        const countryComponent = findGoogleAddressComponent(components, "country");

        const currentParty = party === "recipient" ? data.recipient : data.sender;

        setData(party, {
            ...currentParty,
            address: {
                ...currentParty.address,
                city: cityName,
                state: stateComponent?.long_name || currentParty.address.state,
                postalCode: postalComponent?.long_name || currentParty.address.postalCode,
                country: selectedRouteType === "domestic"
                    ? DOMESTIC_COUNTRY_CODE
                    : (countryComponent?.short_name || currentParty.address.country),
            },
        });

        setLocationSearch((previous) => ({
            ...previous,
            [fieldKey]: cityName,
        }));

        clearGooglePredictions(party);
        setActiveLocationField(null);
        googleAutocompleteSessionTokenRef.current = null;
    };

    const handleCityFieldFocus = (party, activeFieldKey, currentValue) => {
        setActiveLocationField(activeFieldKey);

        if (selectedRouteType !== "domestic") {
            return;
        }

        const query = String(currentValue || "").trim();
        if (query.length >= 2) {
            requestGoogleCityPredictions(party, query);
        }
    };

    const handleCountrySearchChange = (party, fieldKey, value) => {
        setLocationSearch((previous) => ({
            ...previous,
            [fieldKey]: value,
        }));

        const match = matchLocationOption(countryOptions, value);
        updateAddressCountry(party, match ? match.value : "");
    };

    const handleLocationSelect = (party, fieldKey, option, type) => {
        if (!option) {
            return;
        }

        if (type === "city") {
            updateAddressCity(party, option.value);
            setLocationSearch((previous) => ({
                ...previous,
                [fieldKey]: option.label,
            }));
        } else {
            updateAddressCountry(party, option.value);
            setLocationSearch((previous) => ({
                ...previous,
                [fieldKey]: option.label,
            }));
        }

        setActiveLocationField(null);
    };

    const resetDomesticLookups = () => {
        setDomesticSelections({
            senderProvinceId: "",
            senderDistrictId: "",
            recipientProvinceId: "",
            recipientDistrictId: "",
        });

        setDomesticLookups((previous) => ({
            ...previous,
            senderDistricts: [],
            recipientDistricts: [],
            senderCities: [],
            recipientCities: [],
        }));

        setLocationLookupError("");
        setGooglePlacesError("");
        setGooglePlacePredictions({ sender: [], recipient: [] });
        googleAutocompleteSessionTokenRef.current = null;
    };

    const handleDomesticProvinceChange = async (party, provinceId) => {
        const districtField = party === "recipient" ? "recipientDistrictId" : "senderDistrictId";
        const provinceField = party === "recipient" ? "recipientProvinceId" : "senderProvinceId";
        const cityField = party === "recipient" ? "recipientCity" : "senderCity";
        const districtsField = party === "recipient" ? "recipientDistricts" : "senderDistricts";
        const citiesField = party === "recipient" ? "recipientCities" : "senderCities";
        const districtsLoadingKey = party === "recipient" ? "recipientDistricts" : "senderDistricts";

        setDomesticSelections((previous) => ({
            ...previous,
            [provinceField]: provinceId,
            [districtField]: "",
        }));

        setDomesticLookups((previous) => ({
            ...previous,
            [districtsField]: [],
            [citiesField]: [],
        }));

        setLocationSearch((previous) => ({
            ...previous,
            [cityField]: "",
        }));

        updateAddressCity(party, "");
        updateAddressState(party, "");

        if (!provinceId) {
            return;
        }

        const cachedDistricts = domesticLookupCacheRef.current.districtsByProvince[provinceId] || null;
        if (cachedDistricts) {
            setDomesticLookups((previous) => ({
                ...previous,
                [districtsField]: cachedDistricts,
            }));
            return;
        }

        const districts = await fetchLocationOptions(
            `/districts?province_id=${encodeURIComponent(provinceId)}`,
            districtsLoadingKey
        );

        domesticLookupCacheRef.current.districtsByProvince[provinceId] = districts;

        setDomesticLookups((previous) => ({
            ...previous,
            [districtsField]: districts,
        }));
    };

    const handleDomesticDistrictChange = async (party, districtId) => {
        const districtField = party === "recipient" ? "recipientDistrictId" : "senderDistrictId";
        const cityField = party === "recipient" ? "recipientCity" : "senderCity";
        const districtsField = party === "recipient" ? "recipientDistricts" : "senderDistricts";
        const citiesField = party === "recipient" ? "recipientCities" : "senderCities";
        const citiesLoadingKey = party === "recipient" ? "recipientCities" : "senderCities";

        setDomesticSelections((previous) => ({
            ...previous,
            [districtField]: districtId,
        }));

        setLocationSearch((previous) => ({
            ...previous,
            [cityField]: "",
        }));

        setDomesticLookups((previous) => ({
            ...previous,
            [citiesField]: [],
        }));

        const selectedDistrict = (domesticLookups[districtsField] || []).find(
            (district) => String(district.id) === String(districtId)
        );

        updateAddressCity(party, "");
        updateAddressState(party, selectedDistrict?.nameEn || "");

        if (!districtId) {
            return;
        }

        const cachedCities = domesticLookupCacheRef.current.citiesByDistrict[districtId] || null;
        if (cachedCities) {
            setDomesticLookups((previous) => ({
                ...previous,
                [citiesField]: cachedCities,
            }));
            return;
        }

        const cities = await fetchLocationOptions(
            `/cities?district_id=${encodeURIComponent(districtId)}&limit=1000`,
            citiesLoadingKey
        );

        domesticLookupCacheRef.current.citiesByDistrict[districtId] = cities;

        setDomesticLookups((previous) => ({
            ...previous,
            [citiesField]: cities,
        }));
    };

    const resetForRouteType = (nextRouteType) => {
        const nextForm = buildEmptyForm(nextRouteType);
        setData(nextForm);
        setLocationSearch({
            senderCity: nextForm.sender.address.city || "",
            recipientCity: nextForm.recipient.address.city || "",
            senderCountry: nextForm.sender.address.country || "",
            recipientCountry: nextForm.recipient.address.country || "",
        });
        resetDomesticLookups();
        setActiveLocationField(null);
        setActivePackageIndex(0);
        setDisplayCurrency("LKR");
        setServiceDetailsModal(null);
        setIsPlacing(false);
        setShowDetails(false);
        setShowSummary(false);
        setIsSummaryLoading(false);
        clearErrors();
    };

    const handleConfirmRouteSwitch = () => {
        if (!routeSwitchPrompt?.nextRouteType) {
            setRouteSwitchPrompt(null);
            return;
        }

        const nextRouteType = routeSwitchPrompt.nextRouteType;
        setRouteSwitchPrompt(null);
        resetForRouteType(nextRouteType);
    };

    const handleCancelRouteSwitch = () => {
        setRouteSwitchPrompt(null);
    };

    const handleRouteTypeChange = (routeType) => {
        const nextRouteType = routeType === "international" ? "international" : "domestic";

        if (nextRouteType === selectedRouteType) {
            return;
        }

        const baseline = buildEmptyForm(selectedRouteType);
        const hasRouteInput = JSON.stringify(data) !== JSON.stringify(baseline);

        if (hasRouteInput) {
            setRouteSwitchPrompt({ nextRouteType });
            return;
        }

        resetForRouteType(nextRouteType);
    };

    const handleShipmentTypeChange = (value) => {
        setData("shipment", {
            ...data.shipment,
            shipmentType: value,
            shipmentTypeDescription: value === "other" ? (data.shipment.shipmentTypeDescription || "") : "",
        });
    };

    const updatePaymentOptions = (optionKey, checked) => {
        const currentOptions = data.shipment?.paymentOptions || { all: false, cod: false, card: false };
        let nextOptions = { ...currentOptions };

        if (optionKey === "all") {
            nextOptions = {
                all: checked,
                cod: checked,
                card: checked,
            };
        } else {
            nextOptions[optionKey] = checked;
            nextOptions.all = nextOptions.cod && nextOptions.card;
        }

        setData("shipment", {
            ...data.shipment,
            paymentOptions: nextOptions,
        });
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
    const paymentOptions = data.shipment?.paymentOptions || { all: false, cod: false, card: false };
    const hasPaymentOption = Boolean(paymentOptions.all || paymentOptions.cod || paymentOptions.card);

    useEffect(() => {
        if (selectedRouteType !== "domestic") {
            return;
        }

        if (googlePlacesReady) {
            ensureGooglePlacesServices();
            return;
        }

        if (!googleMapsApiKey) {
            console.error("Google Places disabled: VITE_GOOGLE_MAPS_API_KEY is missing at runtime.");
            setGooglePlacesError("Google city suggestions unavailable: missing VITE_GOOGLE_MAPS_API_KEY. Using local lookup fallback.");
            return;
        }

        let cancelled = false;

        const markReady = async () => {
            if (cancelled) {
                return;
            }

            if (window.google?.maps?.places) {
                ensureGooglePlacesServices();
                setGooglePlacesReady(true);
                setGooglePlacesError("");
                return;
            }

            if (window.google?.maps?.importLibrary) {
                try {
                    await window.google.maps.importLibrary("places");
                    if (!cancelled) {
                        ensureGooglePlacesServices();
                        setGooglePlacesReady(true);
                        setGooglePlacesError("");
                    }
                    return;
                } catch (error) {
                    console.error("Failed to load Google Places library:", error);
                    if (!cancelled) {
                        const importMessage =
                            error instanceof Error && error.message
                                ? error.message
                                : "unable to import places library";
                        setGooglePlacesError(`Google city suggestions unavailable: ${importMessage}. Using local lookup fallback.`);
                    }
                }
            }

            if (!cancelled) {
                setGooglePlacesError("Google city suggestions unavailable: places library is not available in loaded Google Maps runtime. Using local lookup fallback.");
            }
        };

        if (window.google?.maps?.places) {
            void markReady();
            return () => {
                cancelled = true;
            };
        }

        if (window.google?.maps && !window.google?.maps?.places) {
            void markReady();
            return () => {
                cancelled = true;
            };
        }

        const onLoad = () => {
            googlePlacesScriptLoadingRef.current = false;
            void markReady();
        };

        const onError = () => {
            googlePlacesScriptLoadingRef.current = false;
            if (!cancelled) {
                setGooglePlacesError("Google city suggestions unavailable: failed to load Google Maps JavaScript API script. Check API key restrictions and enabled APIs. Using local lookup fallback.");
            }
        };

        const existingScript = document.getElementById(GOOGLE_MAPS_PLACES_SCRIPT_ID);
        if (existingScript) {
            existingScript.addEventListener("load", onLoad);
            existingScript.addEventListener("error", onError);
            void markReady();

            return () => {
                cancelled = true;
                existingScript.removeEventListener("load", onLoad);
                existingScript.removeEventListener("error", onError);
            };
        }

        if (!googlePlacesScriptLoadingRef.current) {
            googlePlacesScriptLoadingRef.current = true;

            const script = document.createElement("script");
            script.id = GOOGLE_MAPS_PLACES_SCRIPT_ID;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(googleMapsApiKey)}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.addEventListener("load", onLoad);
            script.addEventListener("error", onError);
            document.head.appendChild(script);

            return () => {
                cancelled = true;
                script.removeEventListener("load", onLoad);
                script.removeEventListener("error", onError);
            };
        }

        return () => {
            cancelled = true;
        };
    }, [selectedRouteType, googleMapsApiKey, googlePlacesReady]);

    useEffect(() => {
        if (selectedRouteType !== "domestic") {
            return;
        }

        if ((domesticLookups.provinces || []).length > 0) {
            return;
        }

        const cachedProvinces = domesticLookupCacheRef.current.provincesByCountry[DOMESTIC_COUNTRY_CODE] || null;
        if (cachedProvinces && cachedProvinces.length > 0) {
            setDomesticLookups((previous) => ({
                ...previous,
                provinces: cachedProvinces,
            }));
            return;
        }

        if (domesticProvinceRequestRef.current) {
            return;
        }

        domesticProvinceRequestRef.current = true;

        const loadDomesticProvinces = async () => {
            const provinces = await fetchLocationOptions(
                `/provinces?country_iso2=${encodeURIComponent(DOMESTIC_COUNTRY_CODE)}`,
                "provinces"
            );

            domesticLookupCacheRef.current.provincesByCountry[DOMESTIC_COUNTRY_CODE] = provinces;
            domesticProvinceRequestRef.current = false;

            setDomesticLookups((previous) => ({
                ...previous,
                provinces,
            }));

            if (!provinces.length) {
                domesticProvinceRequestRef.current = false;
            }
        };

        loadDomesticProvinces();
    }, [selectedRouteType, domesticLookups.provinces.length]);

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

    const getDisplayAmount = (value) => {
        if (!Number.isFinite(value)) {
            return 0;
        }

        return displayCurrency === "LKR" ? value * USD_TO_LKR_RATE : value;
    };

    const resetQuoteFilters = () => {
        setQuoteFilters(buildDefaultQuoteFilters());
    };

    const hasActiveQuoteFilters = useMemo(() => {
        const tiers = quoteFilters.tiers || {};
        const allTiersEnabled = QUOTE_TIER_OPTIONS.every((tier) => tiers[tier.id]);
        return Boolean(
            quoteFilters.providerSearch
            || quoteFilters.minPrice
            || quoteFilters.maxPrice
            || !allTiersEnabled
        );
    }, [quoteFilters]);

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

    const hasRequiredDetails = useMemo(() => {
        if (!Array.isArray(data.packages) || data.packages.length === 0) {
            return false;
        }

        const senderAddress = data.sender?.address || {};
        const recipientAddress = data.recipient?.address || {};
        const hasRouteLocations = selectedRouteType === "domestic"
            ? Boolean(senderAddress.city && recipientAddress.city)
            : Boolean(senderAddress.country && recipientAddress.country);

        const hasShipmentType = Boolean(data.shipment?.shipmentType);
        const needsShipmentDescription = data.shipment?.shipmentType === "other";
        const hasShipmentDescription = !needsShipmentDescription
            || Boolean(String(data.shipment?.shipmentTypeDescription || "").trim());

        const packagesHaveNumbers = data.packages.every((pkg) => {
            const quantity = Number(pkg.quantity) || 0;
            const weight = Number(pkg.weightKg) || 0;
            const length = Number(pkg.lengthCm) || 0;
            const width = Number(pkg.widthCm) || 0;
            const height = Number(pkg.heightCm) || 0;
            return quantity > 0 && weight > 0 && length > 0 && width > 0 && height > 0;
        });

        return hasRouteLocations && hasShipmentType && hasShipmentDescription && packagesHaveNumbers && hasPaymentOption;
    }, [
        data.packages,
        data.sender,
        data.recipient,
        data.shipment,
        selectedRouteType,
        hasPaymentOption,
    ]);

    const hasSelectedServices = useMemo(() => {
        if (!Array.isArray(data.packages) || data.packages.length === 0) {
            return false;
        }

        if (selectedQuotes.length !== data.packages.length) {
            return false;
        }

        return data.packages.every((pkg) => pkg.courierProvider && pkg.serviceLevel);
    }, [data.packages, selectedQuotes]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        if (!hasRequiredDetails || quoteMatrix.length === 0) {
            quotesAutoScrollRef.current = false;
            return;
        }

        if (quotesAutoScrollRef.current) {
            return;
        }

        const target = quotesTableRef.current || quotesSectionRef.current;
        if (!target) {
            return;
        }

        const targetTop = target.getBoundingClientRect().top + window.scrollY;
        const offset = 300;

        window.scrollTo({
            top: Math.max(targetTop - offset, 0),
            behavior: "smooth",
        });

        quotesAutoScrollRef.current = true;
    }, [hasRequiredDetails, quoteMatrix.length]);

    useEffect(() => {
        if (!showDetails || typeof window === "undefined") {
            return;
        }

        const target = detailsSectionRef.current;
        if (!target) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);

        return () => window.clearTimeout(timeoutId);
    }, [showDetails]);

    useEffect(() => {
        if (!showSummary || typeof window === "undefined") {
            return;
        }

        const target = summarySectionRef.current;
        if (!target) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);

        return () => window.clearTimeout(timeoutId);
    }, [showSummary]);

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

    const getCsrfToken = () => {
        if (typeof document === "undefined") {
            return "";
        }

        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
        return token || "";
    };

    const prepareDetailsSession = async (payload) => {
        const csrfToken = getCsrfToken();
        if (!csrfToken) {
            return {
                ok: false,
                message: "Unable to continue. Please refresh and try again.",
            };
        }

        try {
            const response = await fetch("/couriers/review", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "same-origin",
                body: JSON.stringify(payload),
            });

            if (response.status === 422) {
                const errorPayload = await response.json().catch(() => ({}));
                const firstError = extractFirstErrorMessage(errorPayload.errors || errorPayload);
                return {
                    ok: false,
                    message:
                        firstError ||
                        "Unable to continue. Please review the highlighted fields and try again.",
                };
            }

            if (!response.ok) {
                return {
                    ok: false,
                    message: "Unable to continue. Please try again.",
                };
            }

            return { ok: true };
        } catch (error) {
            return {
                ok: false,
                message: "Unable to continue. Please check your connection and try again.",
            };
        }
    };

    const prepareSummarySession = async (payload) => {
        const csrfToken = getCsrfToken();
        if (!csrfToken) {
            return {
                ok: false,
                message: "Unable to continue. Please refresh and try again.",
            };
        }

        try {
            const response = await fetch("/couriers/details", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "same-origin",
                body: JSON.stringify(payload),
            });

            if (response.status === 422) {
                const errorPayload = await response.json().catch(() => ({}));
                const firstError = extractFirstErrorMessage(errorPayload.errors || errorPayload);
                return {
                    ok: false,
                    errors: errorPayload.errors || errorPayload,
                    message:
                        firstError ||
                        "Unable to continue. Please review the highlighted fields and try again.",
                };
            }

            if (!response.ok) {
                return {
                    ok: false,
                    message: "Unable to continue. Please try again.",
                };
            }

            return { ok: true };
        } catch (error) {
            return {
                ok: false,
                message: "Unable to continue. Please check your connection and try again.",
            };
        }
    };

    const isReadyToPlace = useMemo(() => {
        return hasRequiredDetails && hasSelectedServices;
    }, [hasRequiredDetails, hasSelectedServices]);

    const handleContinueToDetails = async () => {
        if (!isReadyToPlace || isPlacing) {
            return;
        }

        setSubmitError("");
        setIsPlacing(true);

        const basePayload = JSON.parse(JSON.stringify(data));
        const reviewContext = buildReviewContext(selectedQuotes, displayCurrency);
        const payload = {
            ...basePayload,
            reviewContext,
        };

        const result = await prepareDetailsSession(payload);
        if (!result.ok) {
            setSubmitError(result.message || "Unable to continue. Please try again.");
            setIsPlacing(false);
            return;
        }

        setData((previous) => ({
            ...previous,
            reviewContext,
        }));
        setShowDetails(true);
        setShowSummary(false);
        setIsPlacing(false);
    };

    const handleContinueToSummary = async ({ setSubmitError: setDetailsSubmitError } = {}) => {
        if (isSummaryLoading) {
            return;
        }

        const setErrorMessage = typeof setDetailsSubmitError === "function"
            ? setDetailsSubmitError
            : setSubmitError;

        setErrorMessage("");
        clearErrors();
        setIsSummaryLoading(true);

        const payload = JSON.parse(JSON.stringify(data));
        const result = await prepareSummarySession(payload);
        if (!result.ok) {
            if (result.errors) {
                setError(result.errors);
            }
            setErrorMessage(result.message || "Unable to continue. Please try again.");
            setIsSummaryLoading(false);
            return;
        }

        setShowSummary(true);
        setIsSummaryLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F4F7FB] text-[#0B1739]">
            <Head title="Send a Package" />
            <Header />

            {/* <section className="relative">
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
            </section> */}

            <main>
                <div className="bg-white shadow-xl rounded-2xl px-6 md:px-10 py-10 poppins mt-6">
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
                                    {recentPricingExplanation.internationalDimensions && (
                                        <div className="mt-2 grid grid-cols-1 gap-1 md:grid-cols-2">
                                            <p>International Unit Type: {recentPricingExplanation.internationalDimensions.unitType || "—"}</p>
                                            <p>Route Class: {recentPricingExplanation.internationalDimensions.routeClass || "—"}</p>
                                            <p>Handling Class: {recentPricingExplanation.internationalDimensions.handlingClass || "—"}</p>
                                            <p>W2W Mode: {recentPricingExplanation.internationalDimensions.w2wMode || "—"}</p>
                                            <p>Unit Count: {recentPricingExplanation.internationalDimensions.unitCount || "—"}</p>
                                            <p>Combined Multiplier: x{Number(recentPricingExplanation.internationalDimensions.totalMultiplier || 1).toFixed(2)}</p>
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
                                    const dimensionUnit = Object.prototype.hasOwnProperty.call(DIMENSION_UNIT_FACTORS, item.dimensionUnit)
                                        ? item.dimensionUnit
                                        : "cm";
                                    const weightFactor = weightUnit === "oz" ? OUNCES_PER_KILOGRAM : 1;
                                    const dimensionFactor = DIMENSION_UNIT_FACTORS[dimensionUnit] || 1;

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

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-[#0B1739]">
                                                        Locations*
                                                    </label>
                                                    <div
                                                        className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${selectedRouteType === "domestic" ? "xl:grid-cols-4" : "xl:grid-cols-2"
                                                            }`}
                                                    >
                                                        {selectedRouteType === "domestic" ? (
                                                            <>
                                                                <div>
                                                                    <label className="mb-1 block text-xs font-medium text-[#5B6887]">Country*</label>
                                                                    <select
                                                                        value={DOMESTIC_COUNTRY_CODE}
                                                                        disabled
                                                                        className="h-[52px] w-full cursor-not-allowed rounded-lg border border-[#D6DEEB] bg-white px-3 text-sm text-[#0B1739] opacity-80"
                                                                    >
                                                                        <option value={DOMESTIC_COUNTRY_CODE}>
                                                                            {DOMESTIC_COUNTRY_LABEL} ({DOMESTIC_COUNTRY_CODE})
                                                                        </option>
                                                                    </select>
                                                                </div>

                                                                <div>
                                                                    <label className="mb-1 block text-xs font-medium text-[#5B6887]">Pickup province</label>
                                                                    <select
                                                                        value={domesticSelections.senderProvinceId}
                                                                        onChange={(event) => handleDomesticProvinceChange("sender", event.target.value)}
                                                                        className="h-[52px] w-full rounded-lg border border-[#D6DEEB] bg-white px-3 text-sm text-[#0B1739] focus:border-[#0955AC] focus:outline-none"
                                                                    >
                                                                        <option value="">
                                                                            {domesticLookups.loading.provinces ? "Loading provinces..." : "Select Pickup Province (optional)"}
                                                                        </option>
                                                                        {provinceOptions.map((option) => (
                                                                            <option key={`pickup-province-${option.value}`} value={option.value}>
                                                                                {option.label}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>

                                                                <div>
                                                                    <label className="mb-1 block text-xs font-medium text-[#5B6887]">Pickup district</label>
                                                                    <select
                                                                        value={domesticSelections.senderDistrictId}
                                                                        onChange={(event) => handleDomesticDistrictChange("sender", event.target.value)}
                                                                        disabled={!domesticSelections.senderProvinceId || domesticLookups.loading.senderDistricts}
                                                                        className="h-[52px] w-full rounded-lg border border-[#D6DEEB] bg-white px-3 text-sm text-[#0B1739] focus:border-[#0955AC] focus:outline-none disabled:cursor-not-allowed disabled:bg-[#F5F7FB] disabled:text-[#8C97B0]"
                                                                    >
                                                                        <option value="">
                                                                            {domesticLookups.loading.senderDistricts ? "Loading districts..." : "Select Pickup District (optional)"}
                                                                        </option>
                                                                        {senderDistrictOptions.map((option) => (
                                                                            <option key={`pickup-district-${option.value}`} value={option.value}>
                                                                                {option.label}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>

                                                                <div>
                                                                    <label className="mb-1 block text-xs font-medium text-[#5B6887]">Pickup city*</label>
                                                                    <div className="relative">
                                                                        <input
                                                                            value={locationSearch.senderCity}
                                                                            onChange={(event) => handleCitySearchChange("sender", "senderCity", event.target.value)}
                                                                            onFocus={() => handleCityFieldFocus("sender", `sender-city-${index}`, locationSearch.senderCity)}
                                                                            onBlur={() => handleLocationInputBlur(`sender-city-${index}`)}
                                                                            className="h-[52px] w-full rounded-lg border border-[#D6DEEB] bg-white px-4 text-sm leading-5 text-[#0B1739] focus:border-[#0955AC] focus:outline-none"
                                                                            placeholder={googlePlacesReady ? "Search Pickup City (Google)" : "Enter Pickup City"}
                                                                        />
                                                                        {activeLocationField === `sender-city-${index}` && (
                                                                            <div className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-[#D6DEEB] bg-white shadow-lg">
                                                                                {(senderGoogleCityOptions.length > 0
                                                                                    ? senderGoogleCityOptions
                                                                                    : filterLocationOptions(senderCityOptions, locationSearch.senderCity)).length > 0 ? (
                                                                                    (senderGoogleCityOptions.length > 0
                                                                                        ? senderGoogleCityOptions
                                                                                        : filterLocationOptions(senderCityOptions, locationSearch.senderCity)).map((option, optionIndex) => (
                                                                                            <button
                                                                                                key={`pickup-city-${index}-${option.source || "local"}-${option.placeId || option.value}-${optionIndex}`}
                                                                                                type="button"
                                                                                                onMouseDown={(event) => {
                                                                                                    event.preventDefault();
                                                                                                    if (option.source === "google") {
                                                                                                        void handleGoogleCitySelect("sender", "senderCity", option);
                                                                                                        return;
                                                                                                    }
                                                                                                    handleLocationSelect("sender", "senderCity", option, "city");
                                                                                                }}
                                                                                                className="block w-full px-3 py-2 text-left text-sm text-[#0B1739] hover:bg-[#F0F7FF]"
                                                                                            >
                                                                                                {option.label}
                                                                                            </button>
                                                                                        ))
                                                                                ) : (
                                                                                    <p className="px-3 py-2 text-sm text-[#6B7893]">No cities found. You can still type your city manually.</p>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <label className="mb-1 block text-xs font-medium text-[#5B6887]">Destination province</label>
                                                                    <select
                                                                        value={domesticSelections.recipientProvinceId}
                                                                        onChange={(event) => handleDomesticProvinceChange("recipient", event.target.value)}
                                                                        className="h-[52px] w-full rounded-lg border border-[#D6DEEB] bg-white px-3 text-sm text-[#0B1739] focus:border-[#0955AC] focus:outline-none"
                                                                    >
                                                                        <option value="">
                                                                            {domesticLookups.loading.provinces ? "Loading provinces..." : "Select Destination Province (optional)"}
                                                                        </option>
                                                                        {provinceOptions.map((option) => (
                                                                            <option key={`destination-province-${option.value}`} value={option.value}>
                                                                                {option.label}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>

                                                                <div>
                                                                    <label className="mb-1 block text-xs font-medium text-[#5B6887]">Destination district</label>
                                                                    <select
                                                                        value={domesticSelections.recipientDistrictId}
                                                                        onChange={(event) => handleDomesticDistrictChange("recipient", event.target.value)}
                                                                        disabled={!domesticSelections.recipientProvinceId || domesticLookups.loading.recipientDistricts}
                                                                        className="h-[52px] w-full rounded-lg border border-[#D6DEEB] bg-white px-3 text-sm text-[#0B1739] focus:border-[#0955AC] focus:outline-none disabled:cursor-not-allowed disabled:bg-[#F5F7FB] disabled:text-[#8C97B0]"
                                                                    >
                                                                        <option value="">
                                                                            {domesticLookups.loading.recipientDistricts ? "Loading districts..." : "Select Destination District (optional)"}
                                                                        </option>
                                                                        {recipientDistrictOptions.map((option) => (
                                                                            <option key={`destination-district-${option.value}`} value={option.value}>
                                                                                {option.label}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>

                                                                <div>
                                                                    <label className="mb-1 block text-xs font-medium text-[#5B6887]">Destination city*</label>
                                                                    <div className="relative">
                                                                        <input
                                                                            value={locationSearch.recipientCity}
                                                                            onChange={(event) => handleCitySearchChange("recipient", "recipientCity", event.target.value)}
                                                                            onFocus={() => handleCityFieldFocus("recipient", `recipient-city-${index}`, locationSearch.recipientCity)}
                                                                            onBlur={() => handleLocationInputBlur(`recipient-city-${index}`)}
                                                                            className="h-[52px] w-full rounded-lg border border-[#D6DEEB] bg-white px-4 text-sm leading-5 text-[#0B1739] focus:border-[#0955AC] focus:outline-none"
                                                                            placeholder={googlePlacesReady ? "Search Destination City (Google)" : "Enter Destination City"}
                                                                        />
                                                                        {activeLocationField === `recipient-city-${index}` && (
                                                                            <div className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-[#D6DEEB] bg-white shadow-lg">
                                                                                {(recipientGoogleCityOptions.length > 0
                                                                                    ? recipientGoogleCityOptions
                                                                                    : filterLocationOptions(recipientCityOptions, locationSearch.recipientCity)).length > 0 ? (
                                                                                    (recipientGoogleCityOptions.length > 0
                                                                                        ? recipientGoogleCityOptions
                                                                                        : filterLocationOptions(recipientCityOptions, locationSearch.recipientCity)).map((option, optionIndex) => (
                                                                                            <button
                                                                                                key={`destination-city-${index}-${option.source || "local"}-${option.placeId || option.value}-${optionIndex}`}
                                                                                                type="button"
                                                                                                onMouseDown={(event) => {
                                                                                                    event.preventDefault();
                                                                                                    if (option.source === "google") {
                                                                                                        void handleGoogleCitySelect("recipient", "recipientCity", option);
                                                                                                        return;
                                                                                                    }
                                                                                                    handleLocationSelect("recipient", "recipientCity", option, "city");
                                                                                                }}
                                                                                                className="block w-full px-3 py-2 text-left text-sm text-[#0B1739] hover:bg-[#F0F7FF]"
                                                                                            >
                                                                                                {option.label}
                                                                                            </button>
                                                                                        ))
                                                                                ) : (
                                                                                    <p className="px-3 py-2 text-sm text-[#6B7893]">No cities found. You can still type your city manually.</p>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div>
                                                                    <label className="mb-1 block text-xs font-medium text-[#5B6887]">Pickup country*</label>
                                                                    <div className="relative">
                                                                        <input
                                                                            value={locationSearch.senderCountry}
                                                                            onChange={(event) => handleCountrySearchChange("sender", "senderCountry", event.target.value)}
                                                                            onFocus={() => setActiveLocationField(`sender-country-${index}`)}
                                                                            onBlur={() => handleLocationInputBlur(`sender-country-${index}`)}
                                                                            className="h-[52px] w-full rounded-lg border border-[#D6DEEB] bg-white px-4 text-sm leading-5 text-[#0B1739] focus:border-[#0955AC] focus:outline-none"
                                                                            placeholder="Select Pickup"
                                                                        />
                                                                        {activeLocationField === `sender-country-${index}` && (
                                                                            <div className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-[#D6DEEB] bg-white shadow-lg">
                                                                                {filterLocationOptions(countryOptions, locationSearch.senderCountry).map((option) => (
                                                                                    <button
                                                                                        key={`pickup-${index}-${option.value}`}
                                                                                        type="button"
                                                                                        onMouseDown={(event) => {
                                                                                            event.preventDefault();
                                                                                            handleLocationSelect("sender", "senderCountry", option, "country");
                                                                                        }}
                                                                                        className="block w-full px-3 py-2 text-left text-sm text-[#0B1739] hover:bg-[#F0F7FF]"
                                                                                    >
                                                                                        {option.label}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="mb-1 block text-xs font-medium text-[#5B6887]">Destination country*</label>
                                                                    <div className="relative">
                                                                        <input
                                                                            value={locationSearch.recipientCountry}
                                                                            onChange={(event) => handleCountrySearchChange("recipient", "recipientCountry", event.target.value)}
                                                                            onFocus={() => setActiveLocationField(`recipient-country-${index}`)}
                                                                            onBlur={() => handleLocationInputBlur(`recipient-country-${index}`)}
                                                                            className="h-[52px] w-full rounded-lg border border-[#D6DEEB] bg-white px-4 text-sm leading-5 text-[#0B1739] focus:border-[#0955AC] focus:outline-none"
                                                                            placeholder="Select Destination"
                                                                        />
                                                                        {activeLocationField === `recipient-country-${index}` && (
                                                                            <div className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-[#D6DEEB] bg-white shadow-lg">
                                                                                {filterLocationOptions(countryOptions, locationSearch.recipientCountry).map((option) => (
                                                                                    <button
                                                                                        key={`destination-${index}-${option.value}`}
                                                                                        type="button"
                                                                                        onMouseDown={(event) => {
                                                                                            event.preventDefault();
                                                                                            handleLocationSelect("recipient", "recipientCountry", option, "country");
                                                                                        }}
                                                                                        className="block w-full px-3 py-2 text-left text-sm text-[#0B1739] hover:bg-[#F0F7FF]"
                                                                                    >
                                                                                        {option.label}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                    {selectedRouteType === "domestic" && locationLookupError && (
                                                        <p className="text-sm text-red-500">{locationLookupError}</p>
                                                    )}
                                                    {selectedRouteType === "domestic" && googlePlacesError && (
                                                        <p className="text-sm text-amber-600">{googlePlacesError}</p>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_2fr_1.2fr] xl:items-start">
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium text-[#0B1739]">
                                                            Package weight*
                                                        </label>

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
                                                                <option value="kg">kg</option>
                                                                <option value="oz">lb</option>
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
                                                                <option value="mm">mm</option>
                                                                <option value="cm">cm</option>
                                                                <option value="m">m</option>
                                                                <option value="yd">yd</option>
                                                            </select>
                                                        </div>

                                                        {(errors[`packages.${index}.lengthCm`] || errors[`packages.${index}.widthCm`] || errors[`packages.${index}.heightCm`]) && (
                                                            <p className="mt-2 text-sm text-red-500">
                                                                {errors[`packages.${index}.lengthCm`] || errors[`packages.${index}.widthCm`] || errors[`packages.${index}.heightCm`]}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="w-full space-y-3">
                                                        <div>
                                                            <label className="mb-2 block text-sm font-medium text-[#0B1739]">Type</label>
                                                            <select
                                                                value={data.shipment.shipmentType || ""}
                                                                onChange={(event) => handleShipmentTypeChange(event.target.value)}
                                                                className="h-[52px] w-full rounded-lg border border-[#D6DEEB] bg-white px-4 text-sm text-[#0B1739] focus:border-[#0955AC] focus:outline-none"
                                                            >
                                                                <option value="">Select type</option>
                                                                {SHIPMENT_TYPE_OPTIONS.map((option) => (
                                                                    <option key={`shipment-type-${option.value}`} value={option.value}>
                                                                        {option.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                {data.shipment.shipmentType === "other" && (
                                                    <div className="w-full">
                                                        <label className="mb-2 block text-sm font-medium text-[#0B1739]">Describe shipment</label>
                                                        <textarea
                                                            value={data.shipment.shipmentTypeDescription || ""}
                                                            onChange={(event) => setData("shipment", {
                                                                ...data.shipment,
                                                                shipmentTypeDescription: event.target.value,
                                                            })}
                                                            className="h-[52px] w-full rounded-lg border border-[#D6DEEB] bg-white px-4 text-sm text-[#0B1739] focus:border-[#0955AC] focus:outline-none"
                                                            placeholder="Describe the shipment type"
                                                        />
                                                    </div>
                                                )}
                                                <p className="text-sm font-semibold text-[#0B1739]">Payment options*</p>
                                                <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#5B6887]">
                                                    <label className="inline-flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 accent-[#0955AC]"
                                                            checked={paymentOptions.all}
                                                            onChange={(event) => updatePaymentOptions("all", event.target.checked)}
                                                        />
                                                        All
                                                    </label>
                                                    <label className="inline-flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 accent-[#0955AC]"
                                                            checked={paymentOptions.cod}
                                                            onChange={(event) => updatePaymentOptions("cod", event.target.checked)}
                                                        />
                                                        COD
                                                    </label>
                                                    <label className="inline-flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 accent-[#0955AC]"
                                                            checked={paymentOptions.card}
                                                            onChange={(event) => updatePaymentOptions("card", event.target.checked)}
                                                        />
                                                        Card
                                                    </label>
                                                </div>


                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>

                        {hasRequiredDetails && (
                            <section
                                id="courier-quotes-section"
                                ref={quotesSectionRef}
                                className="rounded-2xl border border-[#E3EAF5] bg-[#F9FBFF] px-6 py-8"
                            >
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-[#0B1739]">
                                            Courier service quotes
                                        </h2>
                                        <p className="mt-2 text-sm text-[#5B6887]">
                                            {packageMetrics.readyForQuote
                                                ? "Select a service per package. Use tabs to switch."
                                                : `Provide quantity and weight for each package to generate live carrier rates.`}
                                        </p>
                                    </div>

                                    {packageMetrics.totalWeight > 0 && (
                                        <div className="inline-flex w-fit max-w-full flex-col gap-4 rounded-xl border border-[#D6DEEB] bg-[#EEF3FC] px-6 py-4 text-sm text-[#0B1739] md:flex-row md:items-center">
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
                                    <div ref={quotesTableRef} className="mt-8 space-y-8">
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

                                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[260px_1fr] xl:items-start">
                                            <aside className="rounded-xl border border-[#E3EAF5] bg-white  p-4 shadow-sm">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="mt-1 text-sm font-semibold text-[#0B1739]">Refine courier quotes</h3>
                                                        <p className="mt-1 text-xs text-[#6B7893]">Filters apply to the active package.</p>
                                                    </div>
                                                    {hasActiveQuoteFilters && (
                                                        <span className="rounded-full bg-[#E6F3FF] px-2 py-1 text-[10px] font-semibold text-[#0955AC]">Active</span>
                                                    )}
                                                </div>

                                                <div className="mt-4 space-y-4">
                                                    <div>
                                                        <label className="mb-2 block text-xs font-medium text-[#0B1739]">Provider search</label>
                                                        <input
                                                            type="text"
                                                            value={quoteFilters.providerSearch}
                                                            onChange={(event) => setQuoteFilters((previous) => ({
                                                                ...previous,
                                                                providerSearch: event.target.value,
                                                            }))}
                                                            className="h-[44px] w-full rounded-lg border border-[#D6DEEB] bg-white px-3 text-sm text-[#0B1739] focus:border-[#0955AC] focus:outline-none"
                                                            placeholder="Search provider or coverage"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="mb-2 block text-xs font-medium text-[#0B1739]">Price range ({displayCurrency})</label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={quoteFilters.minPrice}
                                                                onChange={(event) => setQuoteFilters((previous) => ({
                                                                    ...previous,
                                                                    minPrice: event.target.value,
                                                                }))}
                                                                className="h-[44px] w-full rounded-lg border border-[#D6DEEB] bg-white px-3 text-sm text-[#0B1739] focus:border-[#0955AC] focus:outline-none"
                                                                placeholder="Min"
                                                            />
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={quoteFilters.maxPrice}
                                                                onChange={(event) => setQuoteFilters((previous) => ({
                                                                    ...previous,
                                                                    maxPrice: event.target.value,
                                                                }))}
                                                                className="h-[44px] w-full rounded-lg border border-[#D6DEEB] bg-white px-3 text-sm text-[#0B1739] focus:border-[#0955AC] focus:outline-none"
                                                                placeholder="Max"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="mb-2 block text-xs font-medium text-[#0B1739]">Service tiers</label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {QUOTE_TIER_OPTIONS.map((tier) => (
                                                                <label
                                                                    key={`quote-filter-tier-${tier.id}`}
                                                                    className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${quoteFilters.tiers?.[tier.id]
                                                                        ? 'border-[#0955AC] text-[#0B1739]'
                                                                        : 'border-[#D6DEEB] text-[#5B6887]'
                                                                        }`}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={Boolean(quoteFilters.tiers?.[tier.id])}
                                                                        onChange={(event) => setQuoteFilters((previous) => ({
                                                                            ...previous,
                                                                            tiers: {
                                                                                ...previous.tiers,
                                                                                [tier.id]: event.target.checked,
                                                                            },
                                                                        }))}
                                                                        className="h-4 w-4 accent-[#0955AC]"
                                                                    />
                                                                    {tier.label}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex items-center justify-between border-t border-[#E3EAF5] pt-3">
                                                    <span className="text-[11px] text-[#6B7893]">Filters apply instantly.</span>
                                                    <button
                                                        type="button"
                                                        onClick={resetQuoteFilters}
                                                        className="rounded-lg border border-[#D6DEEB] px-3 py-1.5 text-[11px] font-semibold text-[#5B6887] transition hover:border-[#0955AC] hover:text-[#0955AC]"
                                                    >
                                                        Reset
                                                    </button>
                                                </div>
                                            </aside>

                                            <div>
                                                {/* Inline Comparison Table — Compact */}
                                                {(() => {
                                                    const activePackageQuotes = quoteMatrix.find(item => item.packageIndex === activePackageIndex) || quoteMatrix[0];
                                                    if (!activePackageQuotes) return null;

                                                    const TIER_IDS = QUOTE_TIER_OPTIONS.map((tier) => tier.id);
                                                    const TIER_META = Object.fromEntries(
                                                        QUOTE_TIER_OPTIONS.map((tier) => [tier.id, { label: tier.label, color: tier.color }])
                                                    );

                                                    const domesticProviders = activePackageQuotes.providers.filter(p => p.category === 'domestic');
                                                    const internationalProviders = activePackageQuotes.providers.filter(p => p.category === 'international');
                                                    const currentPackage = data.packages[activePackageQuotes.packageIndex];

                                                    const cheapestByTierInGroup = (providers, tierId) => {
                                                        const prices = providers
                                                            .map(p => (p.tiers.find(t => t.id === tierId) || {}).price)
                                                            .filter(v => v !== undefined);
                                                        return prices.length ? Math.min(...prices) : Infinity;
                                                    };

                                                    const renderCategoryTable = (providers, categoryLabel, accentColor, accentBg) => {
                                                        if (!providers.length) return null;

                                                        const selectedTierIds = QUOTE_TIER_OPTIONS
                                                            .filter((tier) => quoteFilters.tiers?.[tier.id])
                                                            .map((tier) => tier.id);
                                                        const visibleTierIds = selectedTierIds.length ? selectedTierIds : TIER_IDS;
                                                        const searchValue = String(quoteFilters.providerSearch || "").trim().toLowerCase();
                                                        const minPriceValue = quoteFilters.minPrice !== "" ? Number(quoteFilters.minPrice) : null;
                                                        const maxPriceValue = quoteFilters.maxPrice !== "" ? Number(quoteFilters.maxPrice) : null;

                                                        const handleSelectService = (providerId, tierId) => {
                                                            const updatedPackages = [...data.packages];
                                                            updatedPackages[activePackageQuotes.packageIndex] = {
                                                                ...updatedPackages[activePackageQuotes.packageIndex],
                                                                courierProvider: providerId,
                                                                serviceLevel: tierId,
                                                            };
                                                            setData('packages', updatedPackages);
                                                        };

                                                        const handleSelectKeyDown = (event, providerId, tierId) => {
                                                            if (event.key === "Enter" || event.key === " ") {
                                                                event.preventDefault();
                                                                handleSelectService(providerId, tierId);
                                                            }
                                                        };

                                                        const getProviderBestPrice = (provider, tierIds) => {
                                                            if (!provider?.tiers?.length) return Infinity;
                                                            return provider.tiers.reduce((best, tier) => {
                                                                if (!tierIds.includes(tier.id)) {
                                                                    return best;
                                                                }
                                                                const priceValue = Number(tier?.price);
                                                                return Number.isFinite(priceValue) ? Math.min(best, priceValue) : best;
                                                            }, Infinity);
                                                        };

                                                        const filteredProviders = providers.filter((provider) => {
                                                            if (!provider) return false;
                                                            const providerLabel = `${provider.name || ""} ${provider.coverage || ""}`.toLowerCase();
                                                            if (searchValue && !providerLabel.includes(searchValue)) {
                                                                return false;
                                                            }

                                                            const hasVisibleTier = Array.isArray(provider.tiers)
                                                                && provider.tiers.some((tier) => visibleTierIds.includes(tier.id));
                                                            if (!hasVisibleTier) {
                                                                return false;
                                                            }

                                                            const bestPrice = getProviderBestPrice(provider, visibleTierIds);
                                                            if (!Number.isFinite(bestPrice)) {
                                                                return false;
                                                            }

                                                            const bestDisplayPrice = getDisplayAmount(bestPrice);
                                                            if (Number.isFinite(minPriceValue) && bestDisplayPrice < minPriceValue) {
                                                                return false;
                                                            }
                                                            if (Number.isFinite(maxPriceValue) && bestDisplayPrice > maxPriceValue) {
                                                                return false;
                                                            }

                                                            return true;
                                                        });

                                                        if (!filteredProviders.length) {
                                                            return (
                                                                <div className="rounded-xl border border-[#E8F0FE] bg-white px-4 py-6 text-sm text-[#5B6887]">
                                                                    No providers match the selected filters.
                                                                </div>
                                                            );
                                                        }

                                                        const cheapest = Object.fromEntries(
                                                            visibleTierIds.map((id) => [id, cheapestByTierInGroup(filteredProviders, id)])
                                                        );
                                                        const sortedProviders = [...filteredProviders].sort((a, b) => {
                                                            const aBest = getProviderBestPrice(a, visibleTierIds);
                                                            const bBest = getProviderBestPrice(b, visibleTierIds);
                                                            if (aBest !== bBest) return aBest - bBest;
                                                            return (a?.name || "").localeCompare(b?.name || "");
                                                        });

                                                        return (
                                                            <div className="rounded-xl border border-[#E8F0FE] overflow-hidden">
                                                                {/* ── Mobile: provider card, tier rows ── */}
                                                                <div className="sm:hidden max-h-[420px] overflow-y-auto divide-y divide-[#F0F4F8]">
                                                                    {sortedProviders.map((provider) => (
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
                                                                                {visibleTierIds.map(tierId => {
                                                                                    const tierMeta = TIER_META[tierId] || { label: tierId, color: "text-[#0B1739]" };
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
                                                                                            role="button"
                                                                                            tabIndex={0}
                                                                                            onClick={() => handleSelectService(provider.id, tierId)}
                                                                                            onKeyDown={(event) => handleSelectKeyDown(event, provider.id, tierId)}
                                                                                            className={`flex w-full items-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:ring-offset-1 ${isSelected
                                                                                                ? 'bg-[#0955AC]'
                                                                                                : isBest
                                                                                                    ? 'bg-emerald-50'
                                                                                                    : 'bg-white'
                                                                                                }`}
                                                                                        >
                                                                                            <div className="flex min-w-0 flex-1 items-center px-3 py-2 text-left">
                                                                                                {/* Tier label — fixed width */}
                                                                                                <span className={`text-[11px] font-semibold shrink-0 w-[62px] ${isSelected ? 'text-white' : tierMeta.color}`}>
                                                                                                    {tierMeta.label}
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
                                                                                            </div>
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={(event) => {
                                                                                                    event.stopPropagation();
                                                                                                    openServiceDetailsModal(provider, tier, {
                                                                                                        isBest,
                                                                                                        diff,
                                                                                                        packageIndex: activePackageQuotes.packageIndex,
                                                                                                    });
                                                                                                }}
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
                                                                <div className="hidden sm:block">
                                                                    <div className="max-h-[360px] overflow-y-auto overflow-x-auto">
                                                                        <table className="w-full border-collapse text-xs">
                                                                            <thead className="sticky top-0 z-10" style={{ backgroundColor: accentBg }}>
                                                                                <tr>
                                                                                    <th className="px-3 py-2 text-left text-[#0B1739] font-semibold w-40">Provider</th>
                                                                                    {visibleTierIds.map(id => (
                                                                                        <th key={id} className={`px-2 py-2 text-center font-semibold ${TIER_META[id]?.color || "text-[#0B1739]"}`}>
                                                                                            {TIER_META[id]?.label || id}
                                                                                        </th>
                                                                                    ))}
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {sortedProviders.map((provider, rowIdx) => (
                                                                                    <tr key={provider.id} className={`transition-colors hover:bg-[#F9FBFF] ${rowIdx < sortedProviders.length - 1 ? 'border-b border-[#F0F4F8]' : ''}`}>
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
                                                                                        {visibleTierIds.map(tierId => {
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
                                                                                                        role="button"
                                                                                                        tabIndex={0}
                                                                                                        title={`${provider.name} — ${TIER_META[tierId]?.label || tierId} · ${tier.eta}`}
                                                                                                        onClick={() => handleSelectService(provider.id, tierId)}
                                                                                                        onKeyDown={(event) => handleSelectKeyDown(event, provider.id, tierId)}
                                                                                                        className={`inline-flex w-full flex-col items-center rounded-lg border px-1.5 py-1.5 transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:ring-offset-1 ${isSelected
                                                                                                            ? 'border-[#0955AC] bg-[#0955AC] shadow-sm'
                                                                                                            : isBest
                                                                                                                ? 'border-emerald-400 bg-emerald-50 hover:bg-emerald-100'
                                                                                                                : 'border-[#E8F0FE] bg-white hover:border-[#0955AC]/30 hover:bg-[#F9FBFF]'
                                                                                                            }`}
                                                                                                    >
                                                                                                        <div className="flex w-full flex-col items-center">
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
                                                                                                        </div>
                                                                                                        <button
                                                                                                            type="button"
                                                                                                            onClick={(event) => {
                                                                                                                event.stopPropagation();
                                                                                                                openServiceDetailsModal(provider, tier, {
                                                                                                                    isBest,
                                                                                                                    diff,
                                                                                                                    packageIndex: activePackageQuotes.packageIndex,
                                                                                                                });
                                                                                                            }}
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
                                                            </div>
                                                        );
                                                    };

                                                    const hasDomestic = domesticProviders.length > 0;
                                                    const hasInternational = internationalProviders.length > 0;
                                                    const preferredCategory = selectedRouteType === 'international' ? 'international' : 'domestic';
                                                    const currentCategory = preferredCategory === 'domestic'
                                                        ? (hasDomestic ? 'domestic' : null)
                                                        : (hasInternational ? 'international' : null);

                                                    return (
                                                        <div className="space-y-3">
                                                            {currentCategory === 'domestic' && renderCategoryTable(domesticProviders, 'Domestic', '#2563EB', '#EFF6FF')}
                                                            {currentCategory === 'international' && renderCategoryTable(internationalProviders, 'International', '#0955AC', '#F0F7FF')}
                                                            {!currentCategory && (
                                                                <div className="rounded-lg border border-dashed border-[#B8C5E0] bg-white px-5 py-6 text-sm text-[#5B6887]">
                                                                    No {selectedRouteType} courier providers are currently available for this package.
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Selected Services Summary */}
                                {selectedQuotes.length > 0 && (
                                    <div className="mt-8 space-y-4">
                                        <h3 className="text-lg font-semibold text-[#0B1739]">Selected Services Summary</h3>
                                        <div className="w-fullgrid grid-cols-1 gap-3 md:grid-cols-2">
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
                        )}

                        {showDetails && (
                            <section
                                ref={detailsSectionRef}
                                className="rounded-2xl border border-[#E3EAF5] bg-white px-6 py-8 shadow-sm"
                            >
                                <div className="mb-4">
                                    <h2 className="text-xl font-semibold text-[#0B1739]">Shipment details</h2>
                                    <p className="mt-1 text-sm text-[#5B6887]">
                                        Add pickup, delivery, and shipment preferences to complete the request.
                                    </p>
                                </div>
                                <DetailsForm
                                    inline
                                    renderAsForm={false}
                                    showBackLink={false}
                                    scrollOnSubmit={false}
                                    packageDetailsReadOnly
                                    onSubmitOverride={handleContinueToSummary}
                                    hideSubmit={showSummary}
                                    formStateOverride={{
                                        data,
                                        setData,
                                        post,
                                        processing: processing || isSummaryLoading,
                                        errors,
                                    }}
                                    pagePropsOverride={{
                                        formData: data,
                                        countries,
                                        packageTypes,
                                        favoriteRecipients: props.favoriteRecipients || [],
                                        favoriteSenders: props.favoriteSenders || [],
                                        senderProfile: props.senderProfile || null,
                                        errors: errors || {},
                                    }}
                                />
                            </section>
                        )}

                        {showSummary && (
                            <section
                                ref={summarySectionRef}
                                className="rounded-2xl border border-[#E3EAF5] bg-white px-6 py-8 shadow-sm"
                            >
                                <div className="mb-4">
                                    <h2 className="text-xl font-semibold text-[#0B1739]">Review & confirm</h2>
                                    <p className="mt-1 text-sm text-[#5B6887]">
                                        Review the shipment summary and confirm your booking details.
                                    </p>
                                </div>
                                <SummaryView
                                    inline
                                    showEditLinks={false}
                                    showHero={false}
                                    formStateOverride={data}
                                    pagePropsOverride={{
                                        formData: data,
                                        pricingPreview: null,
                                        errors: errors || {},
                                    }}
                                />
                            </section>
                        )}

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
                                                    {serviceDetailsModal.providerCategory === "international" ? "International" : "Domestic"} service
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

                        {routeSwitchPrompt && typeof document !== "undefined" && createPortal(
                            <div className="fixed inset-0 z-[2147483646] flex items-center justify-center bg-black/50 p-4">
                                <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
                                    <h3 className="text-lg font-semibold text-[#0B1739]">Switch route type?</h3>
                                    <p className="mt-1 text-sm text-[#5B6887]">
                                        Switching to {routeSwitchPrompt.nextRouteType} will reset the form. Continue?
                                    </p>
                                    <div className="mt-4 flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={handleCancelRouteSwitch}
                                            className="rounded-lg border border-[#D6DEEB] px-3 py-2 text-xs font-semibold text-[#5B6887] transition hover:border-[#0955AC] hover:text-[#0955AC]"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleConfirmRouteSwitch}
                                            className="rounded-lg bg-[#0955AC] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0a4b93]"
                                        >
                                            OK
                                        </button>
                                    </div>
                                </div>
                            </div>,
                            document.body,
                        )}

                        <p className="text-center text-xs text-[#5B6887]">
                            Rates are indicative and will be finalized once pickup and delivery details are confirmed; carrier fuel and customs surcharges may vary by route.
                        </p>

                        {!showDetails && (
                            <div className="mt-8 flex flex-col items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleContinueToDetails}
                                    disabled={!isReadyToPlace || isPlacing}
                                    className={`w-full max-w-sm rounded-lg bg-[#0955AC] px-6 py-3 text-center text-sm font-semibold text-white shadow-lg transition focus:outline-none focus:ring-2 focus:ring-[#0a4b93] focus:ring-offset-2 ${!isReadyToPlace || isPlacing ? 'cursor-not-allowed opacity-50' : 'hover:bg-[#0a4b93]'
                                        }`}
                                >
                                    {isPlacing ? 'Preparing details...' : 'Continue'}
                                </button>
                                {!isReadyToPlace && (
                                    <p className="text-xs text-[#D14343]">
                                        {hasRequiredDetails
                                            ? 'Select a courier service for each package to continue.'
                                            : !hasPaymentOption
                                                ? 'Select at least one payment option to continue.'
                                                : 'Complete all required fields before continuing.'}
                                    </p>
                                )}
                                {submitError && (
                                    <p className="text-xs text-[#D14343]">
                                        {submitError}
                                    </p>
                                )}
                            </div>
                        )}
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Create;



