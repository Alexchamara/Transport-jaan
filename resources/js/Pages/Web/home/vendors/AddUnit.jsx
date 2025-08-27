import React, { useEffect, useRef, useState } from 'react';
import { router, usePage } from '@inertiajs/react';

/** Small red asterisk for required labels */
const Req = () => <span className="text-red-600 ml-0.5">*</span>;

/** Add native bubble message + clear on type */
const req = (msg = 'This field is required.') => ({
  required: true,
  onInvalid: (e) => e.target.setCustomValidity(msg),
  onInput: (e) => e.target.setCustomValidity(''),
});

/** Simple toast (success only now) */
const Toast = ({ show, title, message, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed z-50 right-6 bottom-6 w-full max-w-sm shadow-lg rounded-lg overflow-hidden bg-white border border-green-200">
      <div className="p-4 flex items-start gap-3">
        <div className="shrink-0">
          <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293A1 1 0 103.293 10.707l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          {message ? <p className="mt-1 text-sm text-gray-600">{message}</p> : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="Close"
          title="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

/** Centered success modal (middle of screen) */
const CenterModal = ({ open, title, message, onClose, onPrimary }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md mx-4 rounded-2xl shadow-2xl border border-gray-200 p-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <svg className="h-6 w-6 text-green-700" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293A1 1 0 103.293 10.707l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="mt-4 text-center text-lg font-semibold text-gray-900">{title}</h3>
        {message && <p className="mt-2 text-center text-sm text-gray-600">{message}</p>}

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onPrimary}
            className="px-4 py-2 rounded-lg bg-[#0955AC] text-white font-semibold"
          >
            Go to Units
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold"
          >
            Add Another
          </button>
        </div>
      </div>
    </div>
  );
};

const initialState = {
  // Core
  category: '',
  vehicleType: '',
  model: '',
  manufacture: '',
  manufactureYear: '',
  registerYear: '',
  number: '',
  colour: '',
  condition: '',
  ownershipType: '',
  passengerCapacity: '',
  description: '',

  // Insurance quick fields
  insuranceProvider: '',

  // Uploads
  images: [],
  insuranceDocs: [],

  // Land-specific
  mileage: '',
  bodyType: '',
  fuelType: '',
  transmissionType: '',
  gears: '',
  seats: '',
  doors: '',
  fuelTankCapacity: '',

  // Air-specific
  aircraft_type: '',
  icao_type_designator: '',
  base_airport_iata: '',
  base_airport_icao: '',
  crew_required: '',
  range_km: '',
  mtow_kg: '',
  cruising_speed_kts: '',
  air_fuel_type: '',
  flight_hours_total: '',

  // Sea-specific
  vessel_type: '',
  hull_material: '',
  length_m: '',
  beam_m: '',
  draft_m: '',
  engine_type: '',
  engine_power_hp: '',
  sea_fuel_type: '',
  cabins: '',
  berths: '',
  toilets: '',
  fuel_tank_l: '',
  water_tank_l: '',

  // Pricing & features
  rentalPricePerDay: '',
  totalRentalPrice: '',
  deposit: '',
  advancePayment: '',
  gps: false,
  childSeat: false,
  wifi: false,
  insuranceCoverage: false,
  extra: '',
  // Prices for features
  gpsPrice: '',
  childSeatPrice: '',
  wifiPrice: '',
  insuranceCoveragePrice: '',
  addDriver: false,
  addDriverPrice: '',
  // Dynamic features
  extraFeatures: [], // [{ name:'', price:'' }]
};

const bodyTypeOptions = ['Sedan', 'SUV', 'Hatchback', 'Truck', 'Van', 'Bus', 'Coupe', 'Convertible', 'Wagon', 'Other'];
const fuelTypeOptions = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG', 'Other'];
const transmissionOptions = ['Manual', 'Automatic', 'Semi-Automatic', 'CVT', 'Other'];
const conditionOptions = ['New', 'Excellent', 'Good', 'Fair', 'Needs Repair'];
const ownershipTypeOptions = ['Owned', 'Financed', 'Leased', 'Rented'];
const categoryOptions = ['Land', 'Air', 'Sea'];
const aircraftTypeOptions = ['fixed_wing', 'helicopter', 'glider', 'other'];
const airFuelTypeOptions = ['jet_a1', 'avgas', 'electric', 'other'];
const vesselTypeOptions = ['boat', 'yacht', 'catamaran', 'ferry', 'other'];
const hullMaterialOptions = ['Fiberglass', 'Aluminum', 'Steel', 'Wood', 'Composite', 'Other'];
const engineTypeOptions = ['inboard', 'outboard', 'sail', 'hybrid', 'electric', 'other'];
const seaFuelTypeOptions = ['diesel', 'petrol', 'electric', 'other'];

/** Helpers */
const norm = (s) => String(s || '').replace(/[\s_\-]+/g, '').toLowerCase();
const fromOptions = (val, options) => {
  const v = norm(val);
  if (!v) return '';
  const hit = options.find((opt) => norm(opt) === v);
  return hit || '';
};
const isGearsIrrelevant = (tt) => ['automatic', 'cvt'].includes(String(tt || '').toLowerCase());

const mapConditionToUI = (val) => {
  const v = String(val || '').toLowerCase();
  if (v === 'new') return 'New';
  if (v === 'refurbished' || v === 'excellent') return 'Excellent';
  if (v === 'good' || v === 'used') return 'Good';
  if (v === 'fair') return 'Fair';
  if (v === 'needs repair' || v === 'needs_repair') return 'Needs Repair';
  return '';
};
const mapOwnershipToUI = (val) => {
  const v = String(val || '').toLowerCase();
  if (v === 'company_owned' || v === 'owned') return 'Owned';
  if (v === 'financed') return 'Financed';
  if (v === 'leased') return 'Leased';
  if (v === 'partner_owned' || v === 'rented') return 'Rented';
  return '';
};
const mapTransmissionToUI = (val) => {
  const v = String(val || '');
  if (!v) return '';
  if (/semi[-_\s]?automatic/i.test(v)) return 'Semi-Automatic';
  if (/cvt/i.test(v)) return 'CVT';
  if (/automatic/i.test(v)) return 'Automatic';
  if (/manual/i.test(v)) return 'Manual';
  if (/other/i.test(v)) return 'Other';
  return '';
};
const mapYesNo = (b) => !!b;

/** Extract media entries {id?, url} from various shapes (array of strings/objects) */
const extractMediaEntries = (maybe) => {
  if (!maybe) return [];
  const arr = Array.isArray(maybe) ? maybe : [];
  const out = [];
  arr.forEach((item) => {
    if (typeof item === 'string') {
      out.push({ id: null, url: item });
    } else if (item && typeof item === 'object') {
      const id = item.id ?? item.media_id ?? item.uuid ?? item.file_id ?? null;
      const url =
        item.url ||
        item.src ||
        item.path ||
        item.preview_url ||
        item.original_url ||
        item.full_url ||
        (item.attributes && (item.attributes.url || item.attributes.src)) ||
        item.file_path;
      if (url) out.push({ id, url });
    }
  });
  return out;
};

/** Extract from Spatie Media Library: vehicle.media filtered by collection name */
const extractFromSpatieMedia = (media, names) => {
  if (!Array.isArray(media)) return [];
  const nameSet = new Set(names.map((n) => String(n || '').toLowerCase()));
  return media
    .filter((m) => nameSet.has(String(m.collection_name || '').toLowerCase()))
    .map((m) => ({
      id: m.id ?? null,
      url: m.original_url || m.url || m.preview_url || '',
    }))
    .filter((x) => x.url);
};

/** Find insurance images in many common shapes (docs/fields/Spatie) */
const extractInsuranceFromDocuments = (docs) => {
  if (!Array.isArray(docs)) return [];
  const looksLikeInsurance = (s = '') => /insurance/i.test(String(s));

  const pickUrl = (d) =>
    d.original_url ||
    d.full_url ||
    d.preview_url ||
    d.url ||
    d.path ||
    d.file_path ||
    d.image ||
    d.src;

  return docs
    .filter((d) =>
      looksLikeInsurance(d?.type) ||
      looksLikeInsurance(d?.doc_type) ||
      looksLikeInsurance(d?.document_type) ||
      looksLikeInsurance(d?.category) ||
      looksLikeInsurance(d?.label) ||
      looksLikeInsurance(d?.title) ||
      looksLikeInsurance(d?.name) ||
      looksLikeInsurance(d?.collection_name)
    )
    .map((d) => ({ id: d.id ?? d.media_id ?? null, url: pickUrl(d) }))
    .filter((x) => x.url && /\.(png|jpe?g|webp|gif)$/i.test(x.url));
};

/** tiny helper to dedupe by url */
const dedupeByUrl = (arr) => {
  const seen = new Set();
  return (arr || []).filter(({ url }) => (url && !seen.has(url) ? (seen.add(url), true) : false));
};

/** Parse extra features from array/JSON/object/string */
const parseExtraFeatures = (raw, fallbackText = '') => {
  if (!raw && !fallbackText) return [];

  const fromObject = (obj) => {
    return Object.entries(obj || {})
      .map(([k, v]) => ({ name: String(k || '').trim(), price: String(v ?? '').trim() }))
      .filter((it) => it.name);
  };

  let data = raw;
  try {
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) data = JSON.parse(trimmed);
      else if (trimmed) {
        const parts = trimmed.split(/[|,]/);
        return parts
          .map((seg) => {
            const [name, price] = seg.split(':');
            return { name: (name || '').trim(), price: (price || '').trim() };
          })
          .filter((it) => it.name);
      }
    }
  } catch (_) {}

  if (Array.isArray(data)) {
    return data
      .map((it) => {
        if (typeof it === 'string') {
          const [name, price] = it.split(':');
          return { name: (name || '').trim(), price: (price || '').trim() };
        }
        if (it && typeof it === 'object') {
          if ('name' in it || 'price' in it) {
            return { name: (it.name || '').trim(), price: String(it.price ?? '').trim() };
          }
          return fromObject(it)[0] || null;
        }
        return null;
      })
      .filter(Boolean);
  }

  if (data && typeof data === 'object') {
    if (Array.isArray(data.items)) return parseExtraFeatures(data.items);
    return fromObject(data);
  }

  if (fallbackText && typeof fallbackText === 'string') {
    const parts = fallbackText.split(/[|,]/);
    return parts
      .map((seg) => ({ name: seg.trim(), price: '' }))
      .filter((it) => it.name);
  }

  return [];
};

/** Limits */
const MAX_IMAGES = 16;
const MAX_INSURANCE_IMAGES = 5;

const AddUnit = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success toast & center modal
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showCenterModal, setShowCenterModal] = useState(false);

  // New uploads previews
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [insuranceFiles, setInsuranceFiles] = useState([]);
  const [insurancePreviews, setInsurancePreviews] = useState([]);

  // Existing images (with remove toggles)
  const [existingImages, setExistingImages] = useState([]); // [{id?, url}]
  const [existingInsurance, setExistingInsurance] = useState([]); // [{id?, url}]
  const [removedExistingImages, setRemovedExistingImages] = useState(new Set()); // tokens id:<id> or url:<url>
  const [removedExistingInsurance, setRemovedExistingInsurance] = useState(new Set());

  // File input refs
  const imagesInputRef = useRef(null);
  const insuranceInputRef = useRef(null);
  const formRef = useRef(null);

  // Inertia props (SSR)
  const { props } = usePage();
  const isEdit = (props?.mode === 'edit') && !!props?.vehicle?.id;
  const vehicle = props?.vehicle || null;

  useEffect(() => {
    const msg = props?.flash?.success;
    if (msg && !showCenterModal) {
      setSuccessMsg(msg);
      setShowSuccess(true);
      const t = setTimeout(() => setShowSuccess(false), 2500);
      return () => clearTimeout(t);
    }
  }, [props?.flash?.success, showCenterModal]);

  // Prefill form in EDIT mode from SSR props
  useEffect(() => {
    if (!isEdit || !vehicle) return;

    // Robust value mapping
    const bodyTypeVal = fromOptions(vehicle.bodyType ?? vehicle.body_type, bodyTypeOptions);
    const fuelTypeVal = fromOptions(vehicle.fuelType ?? vehicle.fuel_type, fuelTypeOptions);
    const transmissionVal = fromOptions(
      mapTransmissionToUI(vehicle.transmissionType ?? vehicle.transmission_type),
      transmissionOptions
    );
    const conditionVal = fromOptions(mapConditionToUI(vehicle.condition), conditionOptions);
    const ownershipVal = fromOptions(mapOwnershipToUI(vehicle.ownershipType ?? vehicle.ownership_type), ownershipTypeOptions);

    // Feature prices + toggles with common aliases
    const gps = vehicle.gps ?? vehicle.gps_navigation ?? vehicle.has_gps ?? false;
    const childSeat = vehicle.childSeat ?? vehicle.child_seat ?? vehicle.child_seat_available ?? false;
    const wifi = vehicle.wifi ?? vehicle.has_wifi ?? vehicle.wifi_available ?? false;
    const insuranceCoverage = vehicle.insuranceCoverage ?? vehicle.insurance_coverage ?? vehicle.insurance_included ?? false;
    const addDriver = vehicle.addDriver ?? vehicle.add_driver ?? vehicle.driver_available ?? false;

    const gpsPrice = vehicle.gpsPrice ?? vehicle.gps_price ?? '';
    const childSeatPrice = vehicle.childSeatPrice ?? vehicle.child_seat_price ?? '';
    const wifiPrice = vehicle.wifiPrice ?? vehicle.wifi_price ?? '';
    const insuranceCoveragePrice = vehicle.insuranceCoveragePrice ?? vehicle.insurance_coverage_price ?? '';
    const addDriverPrice = vehicle.addDriverPrice ?? vehicle.add_driver_price ?? '';

    // Extra features sources + fallback to `extra` text
    const extrasRaw =
      vehicle.additionalFeatures ??
      vehicle.additional_features ??
      vehicle.extraFeatures ??
      vehicle.extra_features ??
      vehicle.more_features ??
      vehicle.features ??
      vehicle.features_list ??
      vehicle.options ??
      vehicle.extra_features_json ??
      null;

    const next = {
      // top-level
      category: vehicle.category || '',
      vehicleType: vehicle.vehicleType || vehicle.vehicle_type || '',
      model: vehicle.model || '',
      manufacture: vehicle.manufacture || vehicle.manufacturer || '',
      manufactureYear: vehicle.manufactureYear ?? vehicle.manufacture_year ?? '',
      registerYear: vehicle.registerYear ?? vehicle.register_year ?? '',
      number: vehicle.number || vehicle.registration || '',
      colour: vehicle.colour || vehicle.color || '',
      condition: conditionVal,
      ownershipType: ownershipVal,
      passengerCapacity: vehicle.passengerCapacity ?? vehicle.passenger_capacity ?? '',
      description: vehicle.description || '',

      // insurance quick
      insuranceProvider: vehicle.insuranceProvider || vehicle.insurance_provider || '',

      // toggles / extras
      gps: mapYesNo(gps),
      childSeat: mapYesNo(childSeat),
      wifi: mapYesNo(wifi),
      insuranceCoverage: mapYesNo(insuranceCoverage),
      extra: vehicle.extra || '',

      // land
      mileage: vehicle.mileage ?? '',
      bodyType: bodyTypeVal,
      fuelType: fuelTypeVal,
      transmissionType: transmissionVal,
      gears: vehicle.gears ?? '',
      seats: vehicle.seats ?? '',
      doors: vehicle.doors ?? '',
      fuelTankCapacity: vehicle.fuelTankCapacity ?? vehicle.fuel_tank_capacity ?? '',

      // air
      aircraft_type: vehicle.aircraft_type || '',
      icao_type_designator: vehicle.icao_type_designator || '',
      base_airport_iata: vehicle.base_airport_iata || '',
      base_airport_icao: vehicle.base_airport_icao || '',
      crew_required: vehicle.crew_required ?? '',
      range_km: vehicle.range_km ?? '',
      mtow_kg: vehicle.mtow_kg ?? '',
      cruising_speed_kts: vehicle.cruising_speed_kts ?? '',
      air_fuel_type: vehicle.air_fuel_type || '',
      flight_hours_total: vehicle.flight_hours_total ?? '',

      // sea
      vessel_type: vehicle.vessel_type || '',
      hull_material: vehicle.hull_material || '',
      length_m: vehicle.length_m ?? '',
      beam_m: vehicle.beam_m ?? '',
      draft_m: vehicle.draft_m ?? '',
      engine_type: vehicle.engine_type || '',
      engine_power_hp: vehicle.engine_power_hp ?? '',
      sea_fuel_type: vehicle.sea_fuel_type || '',
      cabins: vehicle.cabins ?? '',
      berths: vehicle.berths ?? '',
      toilets: vehicle.toilets ?? '',
      fuel_tank_l: vehicle.fuel_tank_l ?? '',
      water_tank_l: vehicle.water_tank_l ?? '',

      // pricing
      rentalPricePerDay: vehicle.rentalPricePerDay ?? vehicle.rental_price_per_day ?? '',
      totalRentalPrice: vehicle.totalRentalPrice ?? vehicle.total_rental_price ?? '',
      deposit: vehicle.deposit ?? '',
      advancePayment: vehicle.advancePayment ?? vehicle.advance_payment ?? '',

      // optional feature prices
      gpsPrice,
      childSeatPrice,
      wifiPrice,
      insuranceCoveragePrice,
      addDriver: mapYesNo(addDriver),
      addDriverPrice,

      // dynamic features (prefill below)
      extraFeatures: [],
    };

    // Parse and attach extra features
    const parsedExtras = parseExtraFeatures(extrasRaw, vehicle.extra || '');
    next.extraFeatures = parsedExtras;

    setForm((prev) => ({ ...prev, ...next }));

    // Existing Vehicle Images
    let existingVehicleImgs = [];
    if (Array.isArray(vehicle.media)) {
      existingVehicleImgs = extractFromSpatieMedia(vehicle.media, [
        'images',
        'vehicle_images',
        'vehicles',
        'vehicle-photos',
      ]);
    }
    if (!existingVehicleImgs.length) {
      existingVehicleImgs =
        extractMediaEntries(vehicle.images) ||
        extractMediaEntries(vehicle.image_urls) ||
        extractMediaEntries(vehicle.photos) ||
        [];
    }

    // Existing Insurance Images — robust discovery
    let existingInsuranceImgs = [];
    // 1) Spatie collections
    if (Array.isArray(vehicle.media)) {
      existingInsuranceImgs = extractFromSpatieMedia(vehicle.media, [
        'insurance',
        'insurance_docs',
        'insurance_photos',
        'vehicle-insurance',
      ]);
    }
    // 2) Direct array fields
    if (!existingInsuranceImgs.length) {
      existingInsuranceImgs =
        extractMediaEntries(vehicle.insuranceDocs) ||
        extractMediaEntries(vehicle.insurance_docs) ||
        extractMediaEntries(vehicle.insurancePhotos) ||
        extractMediaEntries(vehicle.insurance_photos) ||
        [];
    }
    // 3) documents[]
    if (!existingInsuranceImgs.length) {
      const docs =
        vehicle.documents ||
        vehicle.docs ||
        vehicle.vehicle_documents ||
        vehicle.mediaDocuments ||
        [];
      existingInsuranceImgs = extractInsuranceFromDocuments(docs);
    }
    // 4) single string fields
    if (!existingInsuranceImgs.length) {
      existingInsuranceImgs = extractMediaEntries(
        [
          vehicle.insurance_image,
          vehicle.insurance_photo,
          vehicle.insurance,
          vehicle.insurancePath,
          vehicle.insurance_path,
        ].filter(Boolean)
      );
    }
    existingInsuranceImgs = dedupeByUrl(existingInsuranceImgs);

    setExistingImages(existingVehicleImgs);
    setExistingInsurance(existingInsuranceImgs);
    setRemovedExistingImages(new Set());
    setRemovedExistingInsurance(new Set());

    // Clear local inputs / previews
    setImageFiles([]);
    setImagePreviews([]);
    setInsuranceFiles([]);
    setInsurancePreviews([]);
    if (imagesInputRef.current) imagesInputRef.current.value = '';
    if (insuranceInputRef.current) insuranceInputRef.current.value = '';
    setErrors({});
    setServerError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props?.mode, vehicle?.id]); // re-run when record changes

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((u) => URL.revokeObjectURL(u));
      insurancePreviews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [imagePreviews, insurancePreviews]);

  const inputClasses = (name) =>
    `w-full rounded-lg px-4 py-2.5 transition duration-150 ease-in-out ${
      errors[name]
        ? 'border border-red-500 focus:ring-red-500 focus:border-red-500'
        : 'border border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    }`;

  const selectClasses = inputClasses;

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setServerError('');

    if (type === 'file') {
      setForm((prev) => ({ ...prev, [name]: files }));

      if (name === 'images') {
        const incoming = Array.from(files || []);
        if (incoming.length) {
          const remaining = Math.max(0, MAX_IMAGES - imageFiles.length);
          const toAdd = incoming.slice(0, remaining);
          setImageFiles((prev) => [...prev, ...toAdd]);
          setImagePreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
        }
      }

      if (name === 'insuranceDocs') {
        const incoming = Array.from(files || []);
        if (incoming.length) {
          const remaining = Math.max(0, MAX_INSURANCE_IMAGES - insuranceFiles.length);
          const toAdd = incoming.slice(0, remaining);
          setInsuranceFiles((prev) => [...prev, ...toAdd]);
          setInsurancePreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
        }
      }
      return;
    }

    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    if (name === 'transmissionType') {
      const nextVal = value;
      setForm((prev) => ({
        ...prev,
        transmissionType: nextVal,
        gears: isGearsIrrelevant(nextVal) ? '' : prev.gears,
      }));
      setErrors((prev) => ({
        ...prev,
        transmissionType: undefined,
        ...(isGearsIrrelevant(value) ? { gears: undefined } : {}),
      }));
      setServerError('');
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const removePreviewAt = (index) => {
    const url = imagePreviews[index];
    if (url) URL.revokeObjectURL(url);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeInsuranceAt = (index) => {
    const url = insurancePreviews[index];
    if (url) URL.revokeObjectURL(url);
    setInsurancePreviews((prev) => prev.filter((_, i) => i !== index));
    setInsuranceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /** Instantly remove an existing vehicle image from UI and mark for deletion */
  const removeExistingImageAt = (idx) => {
    setExistingImages((prev) => {
      const entry = prev[idx];
      if (!entry) return prev;
      const key = entry.id != null ? `id:${entry.id}` : `url:${entry.url}`;
      setRemovedExistingImages((s) => new Set([...s, key]));
      const next = [...prev];
      next.splice(idx, 1);
      return next;
    });
  };

  /** Instantly remove an existing insurance image from UI and mark for deletion */
  const removeExistingInsuranceAt = (idx) => {
    setExistingInsurance((prev) => {
      const entry = prev[idx];
      if (!entry) return prev;
      const key = entry.id != null ? `id:${entry.id}` : `url:${entry.url}`;
      setRemovedExistingInsurance((s) => new Set([...s, key]));
      const next = [...prev];
      next.splice(idx, 1);
      return next;
    });
  };

  const appendIfPresent = (fd, key, val) => {
    if (val !== null && val !== undefined) fd.append(key, val);
  };

  /** Build extra-compatible removal payloads (IDs preferred, URL fallback) */
  const appendRemovalPayloads = (fd) => {
    const collect = (set) => {
      const ids = [];
      const urls = [];
      set.forEach((token) => {
        if (token.startsWith('id:')) ids.push(token.slice(3));
        else if (token.startsWith('url:')) urls.push(token.slice(4));
      });
      return { ids, urls };
    };

    const img = collect(removedExistingImages);
    const ins = collect(removedExistingInsurance);

    // Vehicle images removal keys (common patterns)
    img.ids.forEach((v) => fd.append('remove_existing_images[]', v));
    img.urls.forEach((v) => fd.append('remove_existing_images_by_url[]', v));
    img.ids.forEach((v) => fd.append('remove_images[]', v));
    img.ids.forEach((v) => fd.append('delete_images[]', v));
    img.ids.forEach((v) => fd.append('delete_existing_images[]', v));
    img.urls.forEach((v) => fd.append('remove_images_by_url[]', v));

    // Insurance images removal keys (common patterns)
    ins.ids.forEach((v) => fd.append('remove_existing_insurance[]', v));
    ins.urls.forEach((v) => fd.append('remove_existing_insurance_by_url[]', v));
    ins.ids.forEach((v) => fd.append('remove_insurance[]', v));
    ins.ids.forEach((v) => fd.append('delete_insurance[]', v));
    ins.ids.forEach((v) => fd.append('delete_existing_insurance[]', v));
    ins.urls.forEach((v) => fd.append('remove_insurance_by_url[]', v));

    // Compact JSON
    fd.append(
      'remove_payload_json',
      JSON.stringify({
        images: { ids: img.ids, urls: img.urls },
        insurance: { ids: ins.ids, urls: ins.urls },
      })
    );
  };

  /** Light client-side validation */
  const validate = () => {
    const e = {};
    const must = [
      'category',
      'model',
      'manufacture',
      'manufactureYear',
      'registerYear',
      'number',
      'colour',
      'condition',
      'ownershipType',
      'passengerCapacity',
      'rentalPricePerDay',
      'deposit',
      'advancePayment',
    ];
    must.forEach((k) => {
      if (!String(form[k] || '').trim()) e[k] = 'This field is required.';
    });

    if (form.category === 'Land') {
      ['mileage', 'bodyType', 'fuelType', 'transmissionType', 'seats', 'doors', 'fuelTankCapacity'].forEach((k) => {
        if (!String(form[k] || '').trim()) e[k] = 'This field is required.';
      });
      if (!isGearsIrrelevant(form.transmissionType)) {
        if (!String(form.gears || '').trim()) e.gears = 'This field is required.';
      }
    }
    if (form.category === 'Air') {
      ['aircraft_type', 'crew_required', 'air_fuel_type'].forEach((k) => {
        if (!String(form[k] || '').trim()) e[k] = 'This field is required.';
      });
    }
    if (form.category === 'Sea') {
      ['vessel_type', 'hull_material', 'length_m', 'beam_m', 'draft_m', 'engine_type', 'engine_power_hp', 'sea_fuel_type'].forEach(
        (k) => {
          if (!String(form[k] || '').trim()) e[k] = 'This field is required.';
        }
      );
    }
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError('');
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      formRef.current?.reportValidity?.();
      return;
    }

    setIsSubmitting(true);

    const data = new FormData();

    // Build FormData
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'images' || key === 'insuranceDocs') {
        if (key === 'images' && imageFiles.length) {
          imageFiles.forEach((f) => data.append('images[]', f));
        } else if (key === 'insuranceDocs' && insuranceFiles.length) {
          insuranceFiles.forEach((f) => data.append('insuranceDocs[]', f));
        } else if (value && value.length) {
          for (let i = 0; i < value.length; i++) {
            data.append(`${key}[]`, value[i]);
          }
        }
      } else if (key === 'extraFeatures') {
        const safe = Array.isArray(value)
          ? value.filter((it) => (it?.name || '').trim() !== '')
          : [];
        data.append('extraFeatures', JSON.stringify(safe));
        data.append('extra_features_json', JSON.stringify(safe));
      } else if (typeof value === 'boolean') {
        data.append(key, value ? 'true' : 'false');
      } else {
        appendIfPresent(data, key, value);
      }
    });

    // Include removal lists
    appendRemovalPayloads(data);

    const csrf =
      document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
      (window.Laravel?.csrfToken ?? '');

    const options = {
      forceFormData: true,
      preserveState: true,
      withCredentials: true,
      headers: csrf ? { 'X-CSRF-TOKEN': csrf } : {},
      onBefore: () => {
        setErrors({});
        setServerError('');
      },
      onSuccess: () => {
        setSuccessMsg(props?.flash?.success || (isEdit ? 'Unit updated successfully.' : 'Unit saved successfully.'));
        setShowCenterModal(true);
        setShowSuccess(false);
      },
      onError: (err) => {
        setErrors(err || {});
        const sv = (err && (err.server || err.message)) || '';
        if (sv) setServerError(String(sv));
      },
      onFinish: () => {
        setIsSubmitting(false);
      },
    };

    if (isEdit && vehicle?.id) {
      data.append('_method', 'PUT'); // keep uploads happy
      router.post(`/vendor/vehicles/${vehicle.id}`, data, options);
    } else {
      router.post('/vendor/vehicles/store', data, options);
    }
  };

  // Reset everything when user wants to add another unit
  const handleAddAnother = () => {
    imagePreviews.forEach((u) => URL.revokeObjectURL(u));
    insurancePreviews.forEach((u) => URL.revokeObjectURL(u));
    setForm(initialState);
    setExistingImages([]);
    setExistingInsurance([]);
    setRemovedExistingImages(new Set());
    setRemovedExistingInsurance(new Set());
    setImageFiles([]);
    setImagePreviews([]);
    setInsuranceFiles([]);
    setInsurancePreviews([]);
    setErrors({});
    setServerError('');
    if (imagesInputRef.current) imagesInputRef.current.value = '';
    if (insuranceInputRef.current) insuranceInputRef.current.value = '';
    setShowCenterModal(false);
  };

  // Extra Features handlers
  const addExtraFeature = () => {
    setForm((prev) => ({
      ...prev,
      extraFeatures: [...(prev.extraFeatures || []), { name: '', price: '' }],
    }));
  };

  const updateExtraFeature = (idx, field, value) => {
    setForm((prev) => {
      const next = [...(prev.extraFeatures || [])];
      next[idx] = { ...next[idx], [field]: value };
      return { ...prev, extraFeatures: next };
    });
    setErrors((prev) => ({ ...prev, extraFeatures: undefined }));
  };

  const removeExtraFeature = (idx) => {
    setForm((prev) => {
      const next = [...(prev.extraFeatures || [])];
      next.splice(idx, 1);
      return { ...prev, extraFeatures: next };
    });
  };

  const imagesUsed = imageFiles.length;
  const canAddMoreImages = imagesUsed < MAX_IMAGES;
  const insuranceUsed = insuranceFiles.length;
  const canAddMoreInsurance = insuranceUsed < MAX_INSURANCE_IMAGES;

  return (
    <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 figtree">
      {/* Centered success modal */}
      <CenterModal
        open={showCenterModal}
        title="Done"
        message={successMsg}
        onClose={handleAddAnother}
        onPrimary={() => (window.location.href = '/vendors/units')}
      />

      {/* Success toaster only */}
      <Toast
        show={showSuccess && !showCenterModal}
        title="Done"
        message={successMsg}
        onClose={() => setShowSuccess(false)}
      />

      <div>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="space-y-8 bebas-neue font-[400]"
        >
          {/* Top-level server error banner */}
          {serverError ? (
            <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 p-3 text-sm">
              {serverError}
            </div>
          ) : null}

          {/* Category Section */}
          <section className="bg-[#FFFFFF] p-6 rounded-lg mb-8">
            <h2 className="text-[18px] font-[400] text-gray-800 mb-6">Category</h2>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label htmlFor="category" className="block text-[14px] font-medium text-gray-700">
                  Select Category <Req />
                </label>
                <select
                  id="category"
                  name="category"
                  className={selectClasses('category')}
                  value={form.category}
                  onChange={handleChange}
                  {...req('Please select a category.')}
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.category && <div className="text-red-500 text-xs mt-1">{errors.category}</div>}
              </div>

              <div className="space-y-2">
                <label htmlFor="vehicleType" className="block text-[14px] font-medium text-gray-700">
                  Vehicle Type
                </label>
                <input
                  type="text"
                  id="vehicleType"
                  name="vehicleType"
                  placeholder="Enter vehicle type (e.g., SUV, Helicopter, Yacht)"
                  className={inputClasses('vehicleType')}
                  value={form.vehicleType}
                  onChange={handleChange}
                />
                {errors.vehicleType && <div className="text-red-500 text-xs mt-1">{errors.vehicleType}</div>}
              </div>
            </div>
          </section>

          {/* Basic Information */}
          <section className="bg-[#FFFFFF] p-6 rounded-lg">
            <h2 className="text-[18px] font-[400] text-gray-800 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="model" className="block text-[14px] font-medium text-gray-700">
                  Model <Req />
                </label>
                <input
                  id="model"
                  name="model"
                  className={inputClasses('model')}
                  value={form.model}
                  onChange={handleChange}
                  placeholder="Enter model"
                  {...req('Please enter the model.')}
                />
                {errors.model && <div className="text-red-500 text-xs mt-1">{errors.model}</div>}
              </div>

              <div className="space-y-2">
                <label htmlFor="manufacture" className="block text-[14px] font-medium text-gray-700">
                  Manufacturer <Req />
                </label>
                <input
                  id="manufacture"
                  name="manufacture"
                  className={inputClasses('manufacture')}
                  value={form.manufacture}
                  onChange={handleChange}
                  placeholder="Enter manufacturer name"
                  {...req('Please enter the manufacturer.')}
                />
                {errors.manufacture && <div className="text-red-500 text-xs mt-1">{errors.manufacture}</div>}
              </div>

              <div className="space-y-2">
                <label htmlFor="manufactureYear" className="block text-[14px] font-medium text-gray-700">
                  Manufacture Year <Req />
                </label>
                <input
                  id="manufactureYear"
                  type="number"
                  name="manufactureYear"
                  className={inputClasses('manufactureYear')}
                  value={form.manufactureYear}
                  onChange={handleChange}
                  min="1900"
                  max="2100"
                  placeholder="YYYY"
                  {...req('Please enter the manufacture year.')}
                />
                {errors.manufactureYear && <div className="text-red-500 text-xs mt-1">{errors.manufactureYear}</div>}
              </div>

              <div className="space-y-2">
                <label htmlFor="registerYear" className="block text-[14px] font-medium text-gray-700">
                  Register Year <Req />
                </label>
                <input
                  id="registerYear"
                  type="number"
                  name="registerYear"
                  className={inputClasses('registerYear')}
                  value={form.registerYear}
                  onChange={handleChange}
                  min="1900"
                  max="2100"
                  placeholder="YYYY"
                  {...req('Please enter the registration year.')}
                />
                {errors.registerYear && <div className="text-red-500 text-xs mt-1">{errors.registerYear}</div>}
              </div>

              <div className="space-y-2">
                <label htmlFor="number" className="block text-[14px] font-medium text-gray-700">
                  {form.category === 'Air' ? 'Aircraft Registration' : form.category === 'Sea' ? 'Vessel IMO Number' : 'Vehicle Number'} <Req />
                </label>
                <input
                  id="number"
                  name="number"
                  className={inputClasses('number')}
                  value={form.number}
                  onChange={handleChange}
                  placeholder={
                    form.category === 'Air'
                      ? 'Enter aircraft registration'
                      : form.category === 'Sea'
                      ? 'Enter IMO number'
                      : 'Enter vehicle number'
                  }
                  {...req('Please enter the registration/number.')}
                />
                {errors.number && <div className="text-red-500 text-xs mt-1">{errors.number}</div>}
              </div>

              <div className="space-y-2">
                <label htmlFor="colour" className="block text-[14px] font-medium text-gray-700">
                  Colour <Req />
                </label>
                <input
                  id="colour"
                  name="colour"
                  className={inputClasses('colour')}
                  value={form.colour}
                  onChange={handleChange}
                  placeholder="Enter colour"
                  {...req('Please enter the colour.')}
                />
                {errors.colour && <div className="text-red-500 text-xs mt-1">{errors.colour}</div>}
              </div>
            </div>
          </section>

          {/* Details & Documentation */}
          <section className="bg-[#FFFFFF] p-6 rounded-lg">
            <h2 className="text-[18px] font-[400] text-gray-800 mb-6">
              {form.category === 'Air' ? 'Aircraft' : form.category === 'Sea' ? 'Vessel' : 'Vehicle'} Details & Documentation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Current Vehicle Images (instant cross remove) */}
                {isEdit && existingImages.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="block text-[14px] font-medium text-gray-700">Current Images</span>
                      <span className="text-xs text-gray-500">{existingImages.length}</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                      {existingImages.map((entry, i) => (
                        <div
                          key={`old-img-${entry.id ?? i}`}
                          className="relative rounded-md overflow-hidden border border-gray-200"
                        >
                          <img
                            src={entry.url}
                            alt={`existing-${i}`}
                            className="h-20 w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImageAt(i)}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/80 transition"
                            title="Remove image"
                            aria-label="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vehicle Images (new uploads) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[14px] font-medium text-gray-700">
                      {form.category === 'Air' ? 'Upload Aircraft Images' : form.category === 'Sea' ? 'Upload Vessel Images' : 'Upload Vehicle Images'}
                    </label>
                    <span className="text-xs text-gray-500">{imageFiles.length}/{MAX_IMAGES}</span>
                  </div>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors duration-150">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="images"
                          className={`relative bg-white rounded-md font-medium ${
                            canAddMoreImages ? 'cursor-pointer text-blue-600 hover:text-blue-500' : 'opacity-50 cursor-not-allowed text-gray-400'
                          }`}
                        >
                          <span>{canAddMoreImages ? 'Upload images' : 'Max reached'}</span>
                          <input
                            ref={imagesInputRef}
                            id="images"
                            name="images"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleChange}
                            className="sr-only"
                            disabled={!canAddMoreImages}
                          />
                        </label>
                        <p className="pl-1">{canAddMoreImages ? 'or drag and drop' : ''}</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP up to 10MB</p>
                    </div>
                  </div>
                  {errors.images && <div className="text-red-500 text-xs mt-1">{errors.images}</div>}

                  {/* New image thumbnails (uploads in this session) */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                      {imagePreviews.map((src, i) => (
                        <div key={i} className="relative group rounded-md overflow-hidden border border-gray-200">
                          <img src={src} alt={`preview-${i}`} className="h-20 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePreviewAt(i)}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                            title="Remove"
                            aria-label="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Land-specific fields */}
                {form.category === 'Land' && (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="bodyType" className="block text-[14px] font-medium text-gray-700">
                        Body Type <Req />
                      </label>
                      <select
                        id="bodyType"
                        name="bodyType"
                        className={selectClasses('bodyType')}
                        value={form.bodyType}
                        onChange={handleChange}
                        {...req('Please select a body type.')}
                      >
                        <option value="">Select body type</option>
                        {bodyTypeOptions.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                      {errors.bodyType && <div className="text-red-500 text-xs mt-1">{errors.bodyType}</div>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="fuelType" className="block text-[14px] font-medium text-gray-700">
                        Fuel Type <Req />
                      </label>
                      <select
                        id="fuelType"
                        name="fuelType"
                        className={selectClasses('fuelType')}
                        value={form.fuelType}
                        onChange={handleChange}
                        {...req('Please select a fuel type.')}
                      >
                        <option value="">Select fuel type</option>
                        {fuelTypeOptions.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                      {errors.fuelType && <div className="text-red-500 text-xs mt-1">{errors.fuelType}</div>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="transmissionType" className="block text-[14px] font-medium text-gray-700">
                        Transmission Type <Req />
                      </label>
                      <select
                        id="transmissionType"
                        name="transmissionType"
                        className={selectClasses('transmissionType')}
                        value={form.transmissionType}
                        onChange={handleChange}
                        {...req('Please select a transmission type.')}
                      >
                        <option value="">Select transmission type</option>
                        {transmissionOptions.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      {errors.transmissionType && <div className="text-red-500 text-xs mt-1">{errors.transmissionType}</div>}
                    </div>

                    {!isGearsIrrelevant(form.transmissionType) && (
                      <div className="space-y-2">
                        <label htmlFor="gears" className="block text-[14px] font-medium text-gray-700">
                          Number of Gears <Req />
                        </label>
                        <input
                          id="gears"
                          type="number"
                          name="gears"
                          min="1"
                          className={inputClasses('gears')}
                          value={form.gears}
                          onChange={handleChange}
                          placeholder="Enter number of gears"
                          {...req('Please enter number of gears.')}
                        />
                        {errors.gears && <div className="text-red-500 text-xs mt-1">{errors.gears}</div>}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label htmlFor="seats" className="block text-[14px] font-medium text-gray-700">
                        Number of Seats <Req />
                      </label>
                      <input
                        id="seats"
                        type="number"
                        name="seats"
                        min="1"
                        className={inputClasses('seats')}
                        value={form.seats}
                        onChange={handleChange}
                        placeholder="Enter number of seats"
                        {...req('Please enter number of seats.')}
                      />
                      {errors.seats && <div className="text-red-500 text-xs mt-1">{errors.seats}</div>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="doors" className="block text-[14px] font-medium text-gray-700">
                        Number of Doors <Req />
                      </label>
                      <input
                        id="doors"
                        type="number"
                        name="doors"
                        min="1"
                        className={inputClasses('doors')}
                        value={form.doors}
                        onChange={handleChange}
                        placeholder="Enter number of doors"
                        {...req('Please enter number of doors.')}
                      />
                      {errors.doors && <div className="text-red-500 text-xs mt-1">{errors.doors}</div>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="fuelTankCapacity" className="block text-[14px] font-medium text-gray-700">
                        Fuel Tank Capacity (liters) <Req />
                      </label>
                      <input
                        id="fuelTankCapacity"
                        type="number"
                        name="fuelTankCapacity"
                        min="0"
                        step="0.1"
                        className={inputClasses('fuelTankCapacity')}
                        value={form.fuelTankCapacity}
                        onChange={handleChange}
                        placeholder="Enter fuel tank capacity"
                        {...req('Please enter fuel tank capacity.')}
                      />
                      {errors.fuelTankCapacity && <div className="text-red-500 text-xs mt-1">{errors.fuelTankCapacity}</div>}
                    </div>
                  </>
                )}

                {/* Air left column */}
                {form.category === 'Air' && (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="aircraft_type" className="block text-[14px] font-medium text-gray-700">
                        Aircraft Type <Req />
                      </label>
                      <select
                        id="aircraft_type"
                        name="aircraft_type"
                        className={selectClasses('aircraft_type')}
                        value={form.aircraft_type}
                        onChange={handleChange}
                        {...req('Please select an aircraft type.')}
                      >
                        <option value="">Select aircraft type</option>
                        {aircraftTypeOptions.map((a) => (
                          <option key={a} value={a}>
                            {a.replace('_', ' ').toUpperCase()}
                          </option>
                        ))}
                      </select>
                      {errors.aircraft_type && <div className="text-red-500 text-xs mt-1">{errors.aircraft_type}</div>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="icao_type_designator" className="block text-[14px] font-medium text-gray-700">
                        ICAO Type Designator
                      </label>
                      <input
                        id="icao_type_designator"
                        name="icao_type_designator"
                        maxLength="8"
                        className={inputClasses('icao_type_designator')}
                        value={form.icao_type_designator}
                        onChange={handleChange}
                        placeholder="Enter ICAO type designator"
                      />
                      {errors.icao_type_designator && <div className="text-red-500 text-xs mt-1">{errors.icao_type_designator}</div>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="base_airport_iata" className="block text-[14px] font-medium text-gray-700">
                        Base Airport IATA
                      </label>
                      <input
                        id="base_airport_iata"
                        name="base_airport_iata"
                        maxLength="3"
                        className={inputClasses('base_airport_iata')}
                        value={form.base_airport_iata}
                        onChange={handleChange}
                        placeholder="Enter IATA code"
                      />
                      {errors.base_airport_iata && <div className="text-red-500 text-xs mt-1">{errors.base_airport_iata}</div>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="base_airport_icao" className="block text-[14px] font-medium text-gray-700">
                        Base Airport ICAO
                      </label>
                      <input
                        id="base_airport_icao"
                        name="base_airport_icao"
                        maxLength="4"
                        className={inputClasses('base_airport_icao')}
                        value={form.base_airport_icao}
                        onChange={handleChange}
                        placeholder="Enter ICAO code"
                      />
                      {errors.base_airport_icao && <div className="text-red-500 text-xs mt-1">{errors.base_airport_icao}</div>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="air_fuel_type" className="block text-[14px] font-medium text-gray-700">
                        Fuel Type <Req />
                      </label>
                      <select
                        id="air_fuel_type"
                        name="air_fuel_type"
                        className={selectClasses('air_fuel_type')}
                        value={form.air_fuel_type}
                        onChange={handleChange}
                        {...req('Please select a fuel type.')}
                      >
                        <option value="">Select fuel type</option>
                        {airFuelTypeOptions.map((f) => (
                          <option key={f} value={f}>
                            {f.replace('_', ' ').toUpperCase()}
                          </option>
                        ))}
                      </select>
                      {errors.air_fuel_type && <div className="text-red-500 text-xs mt-1">{errors.air_fuel_type}</div>}
                    </div>
                  </>
                )}

                {/* Sea left column */}
                {form.category === 'Sea' && (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="vessel_type" className="block text-[14px] font-medium text-gray-700">
                        Vessel Type <Req />
                      </label>
                      <select
                        id="vessel_type"
                        name="vessel_type"
                        className={selectClasses('vessel_type')}
                        value={form.vessel_type}
                        onChange={handleChange}
                        {...req('Please select a vessel type.')}
                      >
                        <option value="">Select vessel type</option>
                        {vesselTypeOptions.map((v) => (
                          <option key={v} value={v}>
                            {v.charAt(0).toUpperCase() + v.slice(1)}
                          </option>
                        ))}
                      </select>
                      {errors.vessel_type && <div className="text-red-500 text-xs mt-1">{errors.vessel_type}</div>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="hull_material" className="block text-[14px] font-medium text-gray-700">
                        Hull Material <Req />
                      </label>
                      <select
                        id="hull_material"
                        name="hull_material"
                        className={selectClasses('hull_material')}
                        value={form.hull_material}
                        onChange={handleChange}
                        {...req('Please select a hull material.')}
                      >
                        <option value="">Select hull material</option>
                        {hullMaterialOptions.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                      {errors.hull_material && <div className="text-red-500 text-xs mt-1">{errors.hull_material}</div>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="length_m" className="block text-[14px] font-medium text-gray-700">
                        Length (m) <Req />
                      </label>
                      <input
                        id="length_m"
                        type="number"
                        name="length_m"
                        min="0"
                        step="0.01"
                        max="999999.99"
                        className={inputClasses('length_m')}
                        value={form.length_m}
                        onChange={handleChange}
                        placeholder="Enter length in meters"
                        {...req('Please enter length.')}
                      />
                      {errors.length_m && <div className="text-red-500 text-xs mt-1">{errors.length_m}</div>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="beam_m" className="block text-[14px] font-medium text-gray-700">
                        Beam (m) <Req />
                      </label>
                      <input
                        id="beam_m"
                        type="number"
                        name="beam_m"
                        min="0"
                        step="0.01"
                        max="999999.99"
                        className={inputClasses('beam_m')}
                        value={form.beam_m}
                        onChange={handleChange}
                        placeholder="Enter beam in meters"
                        {...req('Please enter beam.')}
                      />
                      {errors.beam_m && <div className="text-red-500 text-xs mt-1">{errors.beam_m}</div>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="draft_m" className="block text-[14px] font-medium text-gray-700">
                        Draft (m) <Req />
                      </label>
                      <input
                        id="draft_m"
                        type="number"
                        name="draft_m"
                        min="0"
                        step="0.01"
                        max="999999.99"
                        className={inputClasses('draft_m')}
                        value={form.draft_m}
                        onChange={handleChange}
                        placeholder="Enter draft in meters"
                        {...req('Please enter draft.')}
                      />
                      {errors.draft_m && <div className="text-red-500 text-xs mt-1">{errors.draft_m}</div>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="engine_type" className="block text-[14px] font-medium text-gray-700">
                        Engine Type <Req />
                      </label>
                      <select
                        id="engine_type"
                        name="engine_type"
                        className={selectClasses('engine_type')}
                        value={form.engine_type}
                        onChange={handleChange}
                        {...req('Please select an engine type.')}
                      >
                        <option value="">Select engine type</option>
                        {engineTypeOptions.map((e) => (
                          <option key={e} value={e}>
                            {e.charAt(0).toUpperCase() + e.slice(1)}
                          </option>
                        ))}
                      </select>
                      {errors.engine_type && <div className="text-red-500 text-xs mt-1">{errors.engine_type}</div>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="engine_power_hp" className="block text-[14px] font-medium text-gray-700">
                        Engine Power (hp) <Req />
                      </label>
                      <input
                        id="engine_power_hp"
                        type="number"
                        name="engine_power_hp"
                        min="0"
                        className={inputClasses('engine_power_hp')}
                        value={form.engine_power_hp}
                        onChange={handleChange}
                        placeholder="Enter engine power in hp"
                        {...req('Please enter engine power.')}
                      />
                      {errors.engine_power_hp && <div className="text-red-500 text-xs mt-1">{errors.engine_power_hp}</div>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="sea_fuel_type" className="block text-[14px] font-medium text-gray-700">
                        Fuel Type <Req />
                      </label>
                      <select
                        id="sea_fuel_type"
                        name="sea_fuel_type"
                        className={selectClasses('sea_fuel_type')}
                        value={form.sea_fuel_type}
                        onChange={handleChange}
                        {...req('Please select a fuel type.')}
                      >
                        <option value="">Select fuel type</option>
                        {seaFuelTypeOptions.map((f) => (
                          <option key={f} value={f}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                          </option>
                        ))}
                      </select>
                      {errors.sea_fuel_type && <div className="text-red-500 text-xs mt-1">{errors.sea_fuel_type}</div>}
                    </div>
                  </>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <label htmlFor="description" className="block text-[14px] font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    className={inputClasses('description')}
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Enter description"
                  />
                  {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description}</div>}
                </div>
              </div>

              <div className="space-y-6">
                {/* Condition + Passenger Capacity + Ownership */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="condition" className="block text-[14px] font-medium text-gray-700">
                      Condition <Req />
                    </label>
                    <select
                      id="condition"
                      name="condition"
                      className={selectClasses('condition')}
                      value={form.condition}
                      onChange={handleChange}
                      {...req('Please select a condition.')}
                    >
                      <option value="">Select condition</option>
                      {conditionOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {errors.condition && <div className="text-red-500 text-xs mt-1">{errors.condition}</div>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="ownershipType" className="block text-[14px] font-medium text-gray-700">
                      Ownership Type <Req />
                    </label>
                    <select
                      id="ownershipType"
                      name="ownershipType"
                      className={selectClasses('ownershipType')}
                      value={form.ownershipType}
                      onChange={handleChange}
                      {...req('Please select an ownership type.')}
                    >
                      <option value="">Select ownership type</option>
                      {ownershipTypeOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {errors.ownershipType && <div className="text-red-500 text-xs mt-1">{errors.ownershipType}</div>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="passengerCapacity" className="block text-[14px] font-medium text-gray-700">
                      Passenger Capacity <Req />
                    </label>
                    <input
                      id="passengerCapacity"
                      type="number"
                      name="passengerCapacity"
                      min="0"
                      max="255"
                      className={inputClasses('passengerCapacity')}
                      value={form.passengerCapacity}
                      onChange={handleChange}
                      placeholder="Enter passenger capacity"
                      {...req('Please enter passenger capacity.')}
                    />
                    {errors.passengerCapacity && <div className="text-red-500 text-xs mt-1">{errors.passengerCapacity}</div>}
                  </div>
                </div>

                {/* Land: mileage */}
                {form.category === 'Land' && (
                  <div className="space-y-2">
                    <label htmlFor="mileage" className="block text-[14px] font-medium text-gray-700">
                      Mileage (km) <Req />
                    </label>
                    <input
                      id="mileage"
                      type="number"
                      name="mileage"
                      min="0"
                      className={inputClasses('mileage')}
                      value={form.mileage}
                      onChange={handleChange}
                      placeholder="Enter mileage"
                      {...req('Please enter mileage.')}
                    />
                    {errors.mileage && <div className="text-red-500 text-xs mt-1">{errors.mileage}</div>}
                  </div>
                )}

                {/* Air right column */}
                {form.category === 'Air' && (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="crew_required" className="block text-[14px] font-medium text-gray-700">
                        Crew Required <Req />
                      </label>
                      <input
                        id="crew_required"
                        type="number"
                        name="crew_required"
                        min="0"
                        max="255"
                        className={inputClasses('crew_required')}
                        value={form.crew_required}
                        onChange={handleChange}
                        placeholder="Enter number of crew required"
                        {...req('Please enter crew required.')}
                      />
                      {errors.crew_required && <div className="text-red-500 text-xs mt-1">{errors.crew_required}</div>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="range_km" className="block text-[14px] font-medium text-gray-700">
                        Range (km)
                      </label>
                      <input
                        id="range_km"
                        type="number"
                        name="range_km"
                        min="0"
                        className={inputClasses('range_km')}
                        value={form.range_km}
                        onChange={handleChange}
                        placeholder="Enter range in km"
                      />
                      {errors.range_km && <div className="text-red-500 text-xs mt-1">{errors.range_km}</div>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="mtow_kg" className="block text-[14px] font-medium text-gray-700">
                        MTOW (kg)
                      </label>
                      <input
                        id="mtow_kg"
                        type="number"
                        name="mtow_kg"
                        min="0"
                        className={inputClasses('mtow_kg')}
                        value={form.mtow_kg}
                        onChange={handleChange}
                        placeholder="Enter MTOW in kg"
                      />
                      {errors.mtow_kg && <div className="text-red-500 text-xs mt-1">{errors.mtow_kg}</div>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="cruising_speed_kts" className="block text-[14px] font-medium text-gray-700">
                        Cruising Speed (kts)
                      </label>
                      <input
                        id="cruising_speed_kts"
                        type="number"
                        name="cruising_speed_kts"
                        min="0"
                        className={inputClasses('cruising_speed_kts')}
                        value={form.cruising_speed_kts}
                        onChange={handleChange}
                        placeholder="Enter cruising speed"
                      />
                      {errors.cruising_speed_kts && <div className="text-red-500 text-xs mt-1">{errors.cruising_speed_kts}</div>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="flight_hours_total" className="block text-[14px] font-medium text-gray-700">
                        Total Flight Hours
                      </label>
                      <input
                        id="flight_hours_total"
                        type="number"
                        name="flight_hours_total"
                        min="0"
                        className={inputClasses('flight_hours_total')}
                        value={form.flight_hours_total}
                        onChange={handleChange}
                        placeholder="Enter total flight hours"
                      />
                      {errors.flight_hours_total && <div className="text-red-500 text-xs mt-1">{errors.flight_hours_total}</div>}
                    </div>
                  </>
                )}

                {/* Insurance quick fields */}
                <div className="space-y-2">
                  <label htmlFor="insuranceProvider" className="block text-[14px] font-medium text-gray-700">
                    Insurance Provider
                  </label>
                  <input
                    id="insuranceProvider"
                    name="insuranceProvider"
                    className={inputClasses('insuranceProvider')}
                    value={form.insuranceProvider}
                    onChange={handleChange}
                    placeholder="Enter insurance provider name"
                  />
                  {errors.insuranceProvider && <div className="text-red-500 text-xs mt-1">{errors.insuranceProvider}</div>}
                </div>

                {/* Upload Insurance Photos (new uploads) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[14px] font-medium text-gray-700">Upload Insurance Photos</label>
                    <span className="text-xs text-gray-500">{insuranceFiles.length}/{MAX_INSURANCE_IMAGES}</span>
                  </div>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors duration-150">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="insuranceDocs"
                          className={`relative bg-white rounded-md font-medium ${
                            canAddMoreInsurance ? 'cursor-pointer text-blue-600 hover:text-blue-500' : 'opacity-50 cursor-not-allowed text-gray-400'
                          }`}
                        >
                          <span>{canAddMoreInsurance ? 'Upload photos' : 'Max reached'}</span>
                          <input
                            ref={insuranceInputRef}
                            id="insuranceDocs"
                            name="insuranceDocs"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleChange}
                            className="sr-only"
                            disabled={!canAddMoreInsurance}
                          />
                        </label>
                        <p className="pl-1">{canAddMoreInsurance ? 'or drag and drop' : ''}</p>
                      </div>
                      <p className="text-xs text-gray-500">Images only (PNG, JPG, JPEG, WEBP), up to 5 photos</p>
                    </div>
                  </div>
                  {errors.insuranceDocs && <div className="text-red-500 text-xs mt-1">{errors.insuranceDocs}</div>}

                  {insurancePreviews.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                      {insurancePreviews.map((src, i) => (
                        <div key={i} className="relative group rounded-md overflow-hidden border border-gray-200">
                          <img src={src} alt={`insurance-${i}`} className="h-20 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeInsuranceAt(i)}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                            title="Remove"
                            aria-label="Remove image"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Current Insurance Photos (moved BELOW uploads) */}
                {isEdit && existingInsurance.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="block text-[14px] font-medium text-gray-700">Current Insurance Photos</span>
                      <span className="text-xs text-gray-500">{existingInsurance.length}</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                      {existingInsurance.map((entry, i) => (
                        <div
                          key={`old-ins-${entry.id ?? i}`}
                          className="relative rounded-md overflow-hidden border border-gray-200"
                        >
                          <img
                            src={entry.url}
                            alt={`ins-${i}`}
                            className="h-20 w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingInsuranceAt(i)}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-black/80 transition"
                            title="Remove insurance image"
                            aria-label="Remove insurance image"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Features & Pricing */}
          <section className="bg-[#FFFFFF] p-6 rounded-lg">
            <h2 className="text-[18px] font-[400] text-gray-800 mb-6">Features & Pricing</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label htmlFor="rentalPricePerDay" className="block text-[14px] font-medium text-gray-700">
                    Daily Rental Price ($) <Req />
                  </label>
                  <input
                    id="rentalPricePerDay"
                    type="number"
                    name="rentalPricePerDay"
                    min="0"
                    step="0.01"
                    className={inputClasses('rentalPricePerDay')}
                    value={form.rentalPricePerDay}
                    onChange={handleChange}
                    placeholder="0.00"
                    {...req('Please enter daily rental price.')}
                  />
                  {errors.rentalPricePerDay && <div className="text-red-500 text-xs mt-1">{errors.rentalPricePerDay}</div>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="deposit" className="block text-[14px] font-medium text-gray-700">
                    Deposit Amount ($) <Req />
                  </label>
                  <input
                    id="deposit"
                    type="number"
                    name="deposit"
                    min="0"
                    step="0.01"
                    className={inputClasses('deposit')}
                    value={form.deposit}
                    onChange={handleChange}
                    placeholder="0.00"
                    {...req('Please enter the deposit amount.')}
                  />
                  {errors.deposit && <div className="text-red-500 text-xs mt-1">{errors.deposit}</div>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="advancePayment" className="block text-[14px] font-medium text-gray-700">
                    Advance Payment ($) <Req />
                  </label>
                  <input
                    id="advancePayment"
                    type="number"
                    name="advancePayment"
                    min="0"
                    step="0.01"
                    className={inputClasses('advancePayment')}
                    value={form.advancePayment}
                    onChange={handleChange}
                    placeholder="0.00"
                    {...req('Please enter the advance payment.')}
                  />
                  {errors.advancePayment && <div className="text-red-500 text-xs mt-1">{errors.advancePayment}</div>}
                </div>
              </div>

              {/* Additional Features (prefilled) */}
              <div className="space-y-4">
                <label className="block text-[14px] font-medium text-gray-700">
                  Additional Features <span className="text-gray-400 text-xs">(optional)</span>
                </label>

                {/* GPS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-150">
                    <input
                      type="checkbox"
                      name="gps"
                      checked={form.gps}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">GPS Navigation</span>
                  </label>
                  <div className="md:col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="gpsPrice"
                      value={form.gpsPrice}
                      onChange={handleChange}
                      placeholder="GPS price per day (0.00)"
                      className={inputClasses('gpsPrice')}
                      disabled={!form.gps}
                      {...(form.gps ? req('Enter GPS price.') : {})}
                    />
                    {errors.gpsPrice && <div className="text-red-500 text-xs mt-1">{errors.gpsPrice}</div>}
                  </div>
                </div>

                {/* Child Seat (Land only) */}
                {form.category === 'Land' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-150">
                      <input
                        type="checkbox"
                        name="childSeat"
                        checked={form.childSeat}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Child Seat</span>
                    </label>
                    <div className="md:col-span-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="childSeatPrice"
                        value={form.childSeatPrice}
                        onChange={handleChange}
                        placeholder="Child seat price per day (0.00)"
                        className={inputClasses('childSeatPrice')}
                        disabled={!form.childSeat}
                        {...(form.childSeat ? req('Enter child seat price.') : {})}
                      />
                      {errors.childSeatPrice && <div className="text-red-500 text-xs mt-1">{errors.childSeatPrice}</div>}
                    </div>
                  </div>
                )}

                {/* Wi-Fi */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-150">
                    <input
                      type="checkbox"
                      name="wifi"
                      checked={form.wifi}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Wi-Fi</span>
                  </label>
                  <div className="md:col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="wifiPrice"
                      value={form.wifiPrice}
                      onChange={handleChange}
                      placeholder="Wi-Fi price per day (0.00)"
                      className={inputClasses('wifiPrice')}
                      disabled={!form.wifi}
                      {...(form.wifi ? req('Enter Wi-Fi price.') : {})}
                    />
                    {errors.wifiPrice && <div className="text-red-500 text-xs mt-1">{errors.wifiPrice}</div>}
                  </div>
                </div>

                {/* Insurance Coverage */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-150">
                    <input
                      type="checkbox"
                      name="insuranceCoverage"
                      checked={form.insuranceCoverage}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Insurance Coverage</span>
                  </label>
                  <div className="md:col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="insuranceCoveragePrice"
                      value={form.insuranceCoveragePrice}
                      onChange={handleChange}
                      placeholder="Insurance coverage price per day (0.00)"
                      className={inputClasses('insuranceCoveragePrice')}
                      disabled={!form.insuranceCoverage}
                      {...(form.insuranceCoverage ? req('Enter insurance coverage price.') : {})}
                    />
                    {errors.insuranceCoveragePrice && <div className="text-red-500 text-xs mt-1">{errors.insuranceCoveragePrice}</div>}
                  </div>
                </div>

                {/* More Features (name + price) — prefilled */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[14px] font-medium text-gray-700">
                      More Features (name + price) <span className="text-gray-400 text-xs">(optional)</span>
                    </label>
                    <button
                      type="button"
                      onClick={addExtraFeature}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                      title="Add feature"
                    >
                      <svg className="mr-1 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Add
                    </button>
                  </div>

                  {(form.extraFeatures?.length ? form.extraFeatures : []).map((item, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <div className="md:col-span-6">
                        <input
                          type="text"
                          placeholder="Feature name (e.g., Baby Stroller)"
                          className={inputClasses(`extraFeatures_name_${idx}`)}
                          value={item?.name ?? ''}
                          onChange={(e) => updateExtraFeature(idx, 'name', e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-4">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className={inputClasses(`extraFeatures_price_${idx}`)}
                          value={item?.price ?? ''}
                          onChange={(e) => updateExtraFeature(idx, 'price', e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <button
                          type="button"
                          onClick={() => removeExtraFeature(idx)}
                          className="w-full px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                          title="Remove"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Driver option + price */}
                <div className="pt-2 border-t border-gray-200" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-150">
                    <input
                      type="checkbox"
                      name="addDriver"
                      checked={form.addDriver}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Add Driver</span>
                  </label>
                  <div className="md:col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="addDriverPrice"
                      value={form.addDriverPrice}
                      onChange={handleChange}
                      placeholder="Driver price per day (0.00)"
                      className={inputClasses('addDriverPrice')}
                      disabled={!form.addDriver}
                      {...(form.addDriver ? req('Enter driver price.') : {})}
                    />
                    {errors.addDriverPrice && <div className="text-red-500 text-xs mt-1">{errors.addDriverPrice}</div>}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-[700] figtree rounded-lg focus:outline-none focus:ring-0 transition-colors duration-150"
              onClick={() => (window.location.href = '/vendors/units')}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center px-6 py-2.5 border border-transparent font-[700] figtree rounded-lg text-[#FFFFFF] bg-[#0955AC] focus:outline-none focus:ring-0 transition-colors duration-150 ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="mr-2 -ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {isEdit ? 'Update Unit' : `Save ${form.category || 'Unit'}`}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUnit;
