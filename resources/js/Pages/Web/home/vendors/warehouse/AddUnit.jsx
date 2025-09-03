import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/react';

const initialState = {
  // Basic Information
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  total_area: '',
  capacity: '',
  type: '',
  
  // Pricing
  pricing_model: '',
  price: '',
  
  // Features & Media
  amenities: [],
  images: [],
  documents: [],
  // special single file
  terms_pdf: null,
  
  // Terms & Status
  terms_conditions: '',
  is_active: true,
};

const warehouseTypes = [
  'Cold Storage', 'Dry Storage', 'Climate Controlled', 'Hazmat Storage', 
  'Bulk Storage', 'Pharmaceutical', 'Food Grade', 'General Purpose'
];

const pricingModels = [
  'per_sqft_monthly', 'per_sqft_daily', 'per_pallet_monthly', 
  'per_pallet_daily', 'flat_rate_monthly', 'flat_rate_daily'
];

const defaultAmenities = [
  'Loading Dock', 'Forklift Access', 'Temperature Control', 'Humidity Control',
  'Security System', 'CCTV', '24/7 Access', 'Fire Safety', 'Climate Control',
  'Refrigeration', 'Power Backup', 'Internet Access', 'Office Space'
];

const AddUnit = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorItems, setErrorItems] = useState([]);
  const [amenityInput, setAmenityInput] = useState('');
  const [amenityOptions, setAmenityOptions] = useState(defaultAmenities);

  // image previews
  const [imageFiles, setImageFiles] = useState([]); // File[]
  const [imagePreviews, setImagePreviews] = useState([]); // string[] object URLs

  // documents (general, not terms)
  const [documentFiles, setDocumentFiles] = useState([]); // File[]

  // terms pdf preview
  const [termsPdfFile, setTermsPdfFile] = useState(null); // File | null
  const [termsPdfUrl, setTermsPdfUrl] = useState('');

  // Google Maps
  const mapScriptLoadedRef = useRef(false);
  const autoInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (type === 'file') {
      if (name === 'images') {
        const list = Array.from(files || []);
        
        // Validate file count
        const totalImages = imageFiles.length + list.length;
        if (totalImages > 20) {
          setErrors(prev => ({ ...prev, images: 'You can upload a maximum of 20 images.' }));
          return;
        }
        
        // Validate file sizes
        const maxSize = 50 * 1024 * 1024; // 50MB in bytes
        const invalidFiles = list.filter(file => file.size > maxSize);
        if (invalidFiles.length > 0) {
          setErrors(prev => ({ ...prev, images: `Some images are too large. Maximum size is 50MB per image.` }));
          return;
        }
        
        // Validate file types
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const invalidTypes = list.filter(file => !allowedTypes.includes(file.type));
        if (invalidTypes.length > 0) {
          setErrors(prev => ({ ...prev, images: 'Only JPEG, PNG, GIF, and WebP images are allowed.' }));
          return;
        }
        
        const nextFiles = [...imageFiles, ...list];
        setImageFiles(nextFiles);
        const newUrls = list.map((f) => URL.createObjectURL(f));
        setImagePreviews((prev) => [...prev, ...newUrls]);
        // keep minimal in form to serialize counts
        setForm((prev) => ({ ...prev, images: nextFiles }));
        
        // Clear image error if images are added
        if (nextFiles.length > 0 && errors.images) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.images;
            return newErrors;
          });
        }
      } else if (name === 'documents') {
        const list = Array.from(files || []);
        
        // Validate file count
        const totalDocs = documentFiles.length + list.length;
        if (totalDocs > 20) {
          setErrors(prev => ({ ...prev, documents: 'You can upload a maximum of 20 documents.' }));
          return;
        }
        
        // Validate file sizes
        const maxSize = 50 * 1024 * 1024; // 50MB in bytes
        const invalidFiles = list.filter(file => file.size > maxSize);
        if (invalidFiles.length > 0) {
          setErrors(prev => ({ ...prev, documents: `Some documents are too large. Maximum size is 50MB per document.` }));
          return;
        }
        
        // Validate file types
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        const invalidTypes = list.filter(file => !allowedTypes.includes(file.type));
        if (invalidTypes.length > 0) {
          setErrors(prev => ({ ...prev, documents: 'Only PDF, DOC, DOCX, and TXT files are allowed.' }));
          return;
        }
        
        const nextFiles = [...documentFiles, ...list];
        setDocumentFiles(nextFiles);
        setForm((prev) => ({ ...prev, documents: nextFiles }));
      } else if (name === 'terms_pdf') {
        const file = files && files[0] ? files[0] : null;
        
        if (file) {
          // Validate file size
          const maxSize = 50 * 1024 * 1024; // 50MB in bytes
          if (file.size > maxSize) {
            setErrors(prev => ({ ...prev, terms_pdf: 'Terms PDF file is too large. Maximum size is 50MB.' }));
            return;
          }
          
          // Validate file type
          if (file.type !== 'application/pdf') {
            setErrors(prev => ({ ...prev, terms_pdf: 'Only PDF files are allowed for terms and conditions.' }));
            return;
          }
        }
        
        setTermsPdfFile(file);
        setForm((prev) => ({ ...prev, terms_pdf: file }));
        if (file) setTermsPdfUrl(URL.createObjectURL(file));
        
        // Clear terms error if PDF is uploaded (and no inline terms required)
        if (file && errors.terms_conditions) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.terms_conditions;
            return newErrors;
          });
        }
      }
    } else if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      
      // Special handling for terms_conditions - clear error if user types and has content
      if (name === 'terms_conditions' && value.trim() && errors.terms_conditions) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.terms_conditions;
          return newErrors;
        });
      }
    }
  };

  const handleAmenityChange = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validations
    if (!form.name.trim()) {
      newErrors.name = 'Warehouse name is required';
    }

    if (!form.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!form.type) {
      newErrors.type = 'Warehouse type is required';
    }

    if (!form.pricing_model) {
      newErrors.pricing_model = 'Pricing model is required';
    }

    // Optional but recommended validations
    if (form.total_area && (isNaN(form.total_area) || parseFloat(form.total_area) <= 0)) {
      newErrors.total_area = 'Total area must be a positive number';
    }

    if (form.capacity && (isNaN(form.capacity) || parseFloat(form.capacity) <= 0)) {
      newErrors.capacity = 'Capacity must be a positive number';
    }

    if (form.price && (isNaN(form.price) || parseFloat(form.price) < 0)) {
      newErrors.price = 'Price must be a positive number';
    }

    if (form.latitude && (isNaN(form.latitude) || parseFloat(form.latitude) < -90 || parseFloat(form.latitude) > 90)) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }

    if (form.longitude && (isNaN(form.longitude) || parseFloat(form.longitude) < -180 || parseFloat(form.longitude) > 180)) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }

    // Terms & Conditions validation - require either inline terms or PDF upload
    if (!form.terms_conditions.trim() && !termsPdfFile) {
      newErrors.terms_conditions = 'Terms & Conditions are required - please provide either inline terms or upload a PDF';
    }

    // Images validation - require at least one image
    if (imageFiles.length === 0) {
      newErrors.images = 'At least one warehouse image is required';
    }

    // Optional: Documents validation (uncomment if you want to require documents)
    // if (documentFiles.length === 0) {
    //   newErrors.documents = 'At least one legal document is required';
    // }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Show error messages in modal
      const errorList = Object.values(validationErrors);
      setErrorItems(errorList);
      setShowErrorModal(true);
      return;
    }
    
    // Clear any previous errors
    setErrors({});
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmModal(false);
    
    // Clear form immediately after confirmation
    setForm(initialState);
    setImageFiles([]);
    setImagePreviews([]);
    setDocumentFiles([]);
    setTermsPdfFile(null);
    setTermsPdfUrl('');
    
    try {
      const data = new FormData();
      // append primitives
      data.append('name', form.name);
      data.append('address', form.address);
      data.append('latitude', form.latitude || '');
      data.append('longitude', form.longitude || '');
      data.append('total_area', form.total_area || '');
      data.append('capacity', form.capacity || '');
      data.append('type', form.type);
      data.append('pricing_model', form.pricing_model);
      data.append('price', form.price || '');
      data.append('terms_conditions', form.terms_conditions || '');
      data.append('is_active', form.is_active ? '1' : '0');
      data.append('amenities', JSON.stringify(form.amenities || []));
      // files
      imageFiles.forEach((f) => data.append('images[]', f));
      documentFiles.forEach((f) => data.append('documents[]', f));
      if (termsPdfFile) data.append('terms_pdf', termsPdfFile);

      Inertia.post('/vendors/warehouse/units', data, {
        forceFormData: true,
        onError: (err) => {
          setErrors(err);
          // flatten error messages for modal display
          const list = Object.values(err || {}).flat().map((msg) => String(msg));
          setErrorItems(list);
          setShowErrorModal(true);
        },
        preserveState: true,
        onSuccess: () => {
          // show success modal
          setShowSuccessModal(true);
        }
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorItems([error?.message || 'Something went wrong. Please try again.']);
      setShowErrorModal(true);
    }
  };  // Google Maps script loader and autocomplete
  useEffect(() => {
    if (!googleApiKey || mapScriptLoadedRef.current) return;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;
    script.async = true;
    script.onload = () => {
      mapScriptLoadedRef.current = true;
      if (autoInputRef.current && window.google) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(autoInputRef.current, {
          fields: ['formatted_address', 'geometry', 'name']
        });
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          if (!place || !place.geometry) return;
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          setForm((prev) => ({...prev, address: place.formatted_address || prev.address, latitude: lat, longitude: lng }));
        });
      }
    };
    document.body.appendChild(script);
  }, [googleApiKey]);

  const mapPreviewUrl = useMemo(() => {
    if (!form.latitude || !form.longitude) return '';
    return `https://www.google.com/maps/embed/v1/view?key=${googleApiKey}&center=${form.latitude},${form.longitude}&zoom=15&maptype=roadmap`;
  }, [form.latitude, form.longitude, googleApiKey]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setForm((prev) => ({ ...prev, latitude, longitude }));
    });
  };

  const addAmenity = () => {
    const trimmed = amenityInput.trim();
    if (!trimmed) return;
    if (!amenityOptions.includes(trimmed)) setAmenityOptions((prev) => [...prev, trimmed]);
    setForm((prev) => ({ ...prev, amenities: prev.amenities.includes(trimmed) ? prev.amenities : [...prev.amenities, trimmed] }));
    setAmenityInput('');
  };

  const removeImageAt = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      const arr = [...prev];
      const [url] = arr.splice(index, 1);
      if (url) URL.revokeObjectURL(url);
      return arr;
    });
    
    // Check if we need to show image error after removal
    const remainingImages = imageFiles.filter((_, i) => i !== index);
    if (remainingImages.length === 0) {
      setErrors(prev => ({ ...prev, images: 'At least one warehouse image is required' }));
    }
  };

  return (
    <div className="w-full h-auto pr-5 py-10 poppins">
      {/* Header section */}
      <div className="flex flex-row gap-5 justify-between items-center mb-10">
        <h1 className="figtree text-[35px] font-[700]">Add New Warehouse</h1>
        <div className="flex flex-row gap-3">
          <button 
            type="button" 
            className="w-[100px] h-[40px] border border-[#7B7B7A] text-[#7B7B7A] font-[600] rounded-[6px] text-[14px] hover:bg-gray-50"
            onClick={() => (window.location.href = '/vendors/warehouse/units')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="warehouse-form"
            className="w-[120px] h-[40px] bg-[#0955AC] text-[#FFFFFF] font-[600] rounded-[6px] text-[14px] hover:bg-[#0844A0]"
          >
            Save Warehouse
          </button>
        </div>
      </div>

      <div>
        <form id="warehouse-form" onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6 font-[400]">
          {/* Basic Information */}
          <section className="bg-[#FFFFFF] p-8 rounded-[10px] shadow-[4px_4px_4px_#0000001A]">
            <h2 className="text-[20px] font-[700] text-[#000000] mb-8">Warehouse Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-[14px] font-[600] text-[#000000]">Warehouse Name *</label>
                <input 
                  id="name" 
                  name="name" 
                  className="w-full border border-[#D1D5DB] rounded-[6px] px-4 py-3 focus:ring-2 focus:ring-[#0955AC] focus:border-[#0955AC] text-[14px]" 
                  value={form.name} 
                  onChange={handleChange} 
                  placeholder="e.g., Central Cold Storage A" 
                  required
                />
                {errors.name && <div className="text-[#DC2626] text-[12px] mt-1">{errors.name}</div>}
              </div>

              <div className="space-y-2">
                <label htmlFor="type" className="block text-[14px] font-[600] text-[#000000]">Warehouse Type *</label>
                <select
                  id="type"
                  name="type"
                  className="w-full border border-[#D1D5DB] rounded-[6px] px-4 py-3 focus:ring-2 focus:ring-[#0955AC] focus:border-[#0955AC] bg-white text-[14px]"
                  value={form.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select warehouse type</option>
                  {warehouseTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.type && <div className="text-[#DC2626] text-[12px] mt-1">{errors.type}</div>}
              </div>

              <div className="space-y-2">
                <label htmlFor="pricing_model" className="block text-[14px] font-[600] text-[#000000]">Pricing Model *</label>
                <select
                  id="pricing_model"
                  name="pricing_model"
                  className="w-full border border-[#D1D5DB] rounded-[6px] px-4 py-3 focus:ring-2 focus:ring-[#0955AC] focus:border-[#0955AC] bg-white text-[14px]"
                  value={form.pricing_model}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select pricing model</option>
                  {pricingModels.map((model) => (
                    <option key={model} value={model}>{model.replace(/_/g, ' ').toUpperCase()}</option>
                  ))}
                </select>
                {errors.pricing_model && <div className="text-[#DC2626] text-[12px] mt-1">{errors.pricing_model}</div>}
              </div>

              <div className="space-y-2 col-span-full">
                <label htmlFor="address" className="block text-[14px] font-[600] text-[#000000]">Full Address *</label>
                <input
                  ref={autoInputRef}
                  id="address"
                  name="address"
                  className="w-full border border-[#D1D5DB] rounded-[6px] px-4 py-3 focus:ring-2 focus:ring-[#0955AC] focus:border-[#0955AC] text-[14px]"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Search or enter the address"
                  required
                />
                {errors.address && <div className="text-[#DC2626] text-[12px] mt-1">{errors.address}</div>}
                <div className="flex items-center gap-3 mt-2">
                  <button type="button" onClick={useCurrentLocation} className="px-3 py-1.5 text-xs border rounded-md hover:bg-gray-50">Use current location</button>
                </div>
              </div>
            </div>
          </section>

          {/* Location & Capacity */}
          <section className="bg-[#FFFFFF] p-6 rounded-lg">
            <h2 className="text-[18px] font-[400] text-gray-800 mb-6">Location & Capacity Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label htmlFor="latitude" className="block text-[14px] font-medium text-gray-700">Latitude</label>
                <input 
                  id="latitude" 
                  type="number" 
                  name="latitude" 
                  step="0.000001"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={form.latitude} 
                  onChange={handleChange} 
                  placeholder="e.g., 6.9271" 
                />
                {errors.latitude && <div className="text-[#DC2626] text-[12px] mt-1">{errors.latitude}</div>}
              </div>
              <div className="space-y-2">
                <label htmlFor="longitude" className="block text-[14px] font-medium text-gray-700">Longitude</label>
                <input 
                  id="longitude" 
                  type="number" 
                  name="longitude" 
                  step="0.000001"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={form.longitude} 
                  onChange={handleChange} 
                  placeholder="e.g., 79.8612" 
                />
                {errors.longitude && <div className="text-[#DC2626] text-[12px] mt-1">{errors.longitude}</div>}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="total_area" className="block text-[14px] font-medium text-gray-700">Total Area (sqft)</label>
                <input 
                  id="total_area" 
                  type="number" 
                  name="total_area" 
                  min="0" 
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={form.total_area} 
                  onChange={handleChange} 
                  placeholder="e.g., 2500" 
                />
                {errors.total_area && <div className="text-[#DC2626] text-[12px] mt-1">{errors.total_area}</div>}
              </div>
              <div className="space-y-2">
                <label htmlFor="capacity" className="block text-[14px] font-medium text-gray-700">Capacity (units)</label>
                <input 
                  id="capacity" 
                  type="number" 
                  name="capacity" 
                  min="0" 
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={form.capacity} 
                  onChange={handleChange} 
                  placeholder="e.g., 5000" 
                />
                {errors.capacity && <div className="text-[#DC2626] text-[12px] mt-1">{errors.capacity}</div>}
              </div>
            </div>
            {mapPreviewUrl && (
              <div className="mt-6">
                <label className="block text-[14px] font-medium text-gray-700 mb-2">Map Preview</label>
                <div className="aspect-[16/9] w-full border rounded-lg overflow-hidden">
                  <iframe
                    title="map-preview"
                    width="100%"
                    height="100%"
                    src={mapPreviewUrl}
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <label htmlFor="price" className="block text-[14px] font-medium text-gray-700">Price</label>
                <input 
                  id="price" 
                  type="number" 
                  name="price" 
                  min="0" 
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={form.price} 
                  onChange={handleChange} 
                  placeholder="e.g., 15.50" 
                />
                {errors.price && <div className="text-[#DC2626] text-[12px] mt-1">{errors.price}</div>}
              </div>
              <div className="space-y-2">
                <label className="block text-[14px] font-medium text-gray-700">Status</label>
                <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    type="checkbox" 
                    name="is_active" 
                    checked={form.is_active} 
                    onChange={handleChange} 
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                  />
                  <span className="ml-2 text-sm text-gray-700">Active Warehouse</span>
                </label>
              </div>
            </div>
          </section>

          {/* Amenities */}
          <section className="bg-[#FFFFFF] p-6 rounded-lg">
            <h2 className="text-[18px] font-[400] text-gray-800 mb-6">Warehouse Amenities</h2>
            <div className="flex items-center gap-2 mb-4">
              <input
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                placeholder="Add a custom amenity"
                className="flex-1 border rounded-lg px-3 py-2"
              />
              <button type="button" onClick={addAmenity} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">Add</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {amenityOptions.map((amenity) => (
                <label key={amenity} className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    type="checkbox" 
                    checked={form.amenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                  />
                  <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Terms & Conditions */}
          <section className="bg-[#FFFFFF] p-6 rounded-lg">
            <h2 className="text-[18px] font-[400] text-gray-800 mb-6">Terms & Conditions *</h2>
            <div className="space-y-2">
              <label htmlFor="terms_conditions" className="block text-[14px] font-medium text-gray-700">Inline Terms (optional if PDF provided)</label>
              <textarea 
                id="terms_conditions" 
                name="terms_conditions" 
                rows="6"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={form.terms_conditions} 
                onChange={handleChange} 
                placeholder="Enter terms and conditions for warehouse rental..." 
              />
              {errors.terms_conditions && <div className="text-[#DC2626] text-[12px] mt-1">{errors.terms_conditions}</div>}
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[14px] font-medium text-gray-700">Upload Terms & Conditions (PDF)</label>
                <input id="terms_pdf" name="terms_pdf" type="file" accept="application/pdf" onChange={handleChange} className="mt-2" />
                {termsPdfFile && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-700">Selected: {termsPdfFile.name}</p>
                    {termsPdfUrl && (
                      <div className="mt-2 border rounded-lg overflow-hidden h-64">
                        <iframe title="terms-preview" src={termsPdfUrl} className="w-full h-full" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Media & Documents */}
          <section className="bg-[#FFFFFF] p-6 rounded-lg">
            <h2 className="text-[18px] font-[400] text-gray-800 mb-6">Images & Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[14px] font-medium text-gray-700">Warehouse Images *</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors duration-150">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="images" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload images</span>
                        <input id="images" name="images" type="file" multiple accept="image/*" onChange={handleChange} className="sr-only" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 50MB each (max 20 images)</p>
                  </div>
                </div>
                {errors.images && <div className="text-[#DC2626] text-[12px] mt-1">{errors.images}</div>}
                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {imagePreviews.map((src, idx) => (
                      <div key={src} className="relative group">
                        <img src={src} alt={`preview-${idx}`} className="w-full h-28 object-cover rounded-lg border" />
                        <button type="button" onClick={() => removeImageAt(idx)} className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-90 hover:opacity-100">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-[14px] font-medium text-gray-700">Legal Documents</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors duration-150">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="documents" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Upload documents</span>
                        <input id="documents" name="documents" type="file" multiple accept=".pdf,.doc,.docx,.txt" onChange={handleChange} className="sr-only" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX, TXT up to 50MB each (max 20 files)</p>
                  </div>
                </div>
                {documentFiles.length > 0 && (
                  <ul className="mt-3 list-disc list-inside text-sm text-gray-700 space-y-1">
                    {documentFiles.map((f, idx) => (
                      <li key={`${f.name}-${idx}`}>{f.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button type="button" className="px-6 py-2.5 border border-gray-300 text-gray-700 font-[700] figtree rounded-lg focus:outline-none" onClick={() => (window.location.href = '/vendors/warehouse/units')}>
              Cancel
            </button>
            <button type="submit" className="inline-flex items-center px-6 py-2.5 border border-transparent font-[700] figtree rounded-lg text-[#FFFFFF] bg-[#0955AC] focus:outline-none">
              <svg className="mr-2 -ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Save Warehouse
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-[#FFFFFF70] backdrop-blur-[14px] flex items-center justify-center z-50">
          <div className="figtree text-[#222222] text-[16px] font-[400] bg-white rounded-[20px] p-8 w-[643px] max-w-[90%] shadow-lg flex flex-col items-center relative">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
              aria-label="Close"
            >
              ✕
            </button>
            <h2 className="text-[28px] font-[600] mt-2">Success</h2>
            <p className="mt-2 text-[#6B6B6B] text-center">Your warehouse was created and submitted for approval.</p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="figtree w-[160px] h-[44px] bg-[#0955AC] text-[14px] font-[700] text-white rounded-[12px] hover:bg-[#074087] transition-colors"
              >
                Done
              </button>
              <button
                onClick={() => (window.location.href = '/vendors/warehouse/units')}
                className="figtree w-[180px] h-[44px] border border-[#0955AC] text-[#0955AC] text-[14px] font-[700] rounded-[12px] hover:bg-[#0955AC10] transition-colors"
              >
                Go to Units
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-[#FFFFFF70] backdrop-blur-[14px] flex items-center justify-center z-50">
          <div className="figtree text-[#222222] text-[16px] font-[400] bg-white rounded-[20px] p-8 w-[643px] max-w-[90%] shadow-lg flex flex-col items-start relative">
            <button
              onClick={() => setShowErrorModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
              aria-label="Close"
            >
              ✕
            </button>
            <h2 className="text-[28px] font-[600] mt-2">
              {errorItems.some(item => item.includes('required') || item.includes('must be')) ? 'Please Complete Required Fields' : 'Submission Failed'}
            </h2>
            <p className="mt-2 text-[#6B6B6B]">
              {errorItems.some(item => item.includes('required') || item.includes('must be')) ? 'Please fill in all required fields:' : 'Please fix the following issues:'}
            </p>
            <ul className="mt-3 list-disc list-inside text-[14px] text-[#B91C1C] space-y-1">
              {errorItems.length ? errorItems.map((msg, i) => (
                <li key={`${msg}-${i}`}>{msg}</li>
              )) : <li>Unknown error. Try again.</li>}
            </ul>
            <div className="mt-6 self-end">
              <button
                onClick={() => setShowErrorModal(false)}
                className="figtree w-[160px] h-[44px] bg-[#0955AC] text-[14px] font-[700] text-white rounded-[12px] hover:bg-[#074087] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-[#FFFFFF70] backdrop-blur-[14px] flex items-center justify-center z-50">
          <div className="figtree text-[#222222] text-[16px] font-[400] bg-white rounded-[20px] p-8 w-[643px] max-w-[90%] shadow-lg flex flex-col items-center relative">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
              aria-label="Close"
            >
              ✕
            </button>
            <h2 className="text-[28px] font-[600] mt-2">Confirm Submission</h2>
            <p className="mt-2 text-[#6B6B6B] text-center">
              Are you sure you want to submit this warehouse for approval? Please review all information before proceeding.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="figtree w-[120px] h-[44px] border border-[#7B7B7A] text-[#7B7B7A] text-[14px] font-[700] rounded-[12px] hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSubmit}
                className="figtree w-[180px] h-[44px] bg-[#0955AC] text-[14px] font-[700] text-white rounded-[12px] hover:bg-[#074087] transition-colors"
              >
                Submit Warehouse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUnit;