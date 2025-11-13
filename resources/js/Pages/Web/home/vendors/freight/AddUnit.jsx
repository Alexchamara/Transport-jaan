import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';

const initialState = {
  // Core identity
  carrier: '',        // e.g., Tata, Isuzu, Mitsubishi
  unitType: '',       // e.g., 14ft Lorry, Reefer Truck, Flatbed
  registerNumber: '', // vehicle registration number
  status: 'Available',
  unitsCount: '',

  // Media & docs
  images: [],
  description: '',
  insuranceProvider: '',
  insuranceDocs: [],

  // Freight specs
  dimensions: '',     // e.g., 14 ft, 20 ft, 24 ft
  maxLoad: '',        // e.g., 3.5 t
  bodyType: '',       // Open, Box, Reefer, Flatbed, Tipper, Tanker, Curtain Side, Covered
  fuelType: '',

  // Commercials & features
  ratePerKm: '',
  deposit: '',
  advancePayment: '',
  refrigerated: false,
  tailLift: false,
  gps: false,
  insuranceCoverage: false,
  extra: '',
};



const AddUnit = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setForm((prev) => ({
        ...prev,
        [name]: files,
      }));
    } else if (type === 'checkbox') {
      setForm((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === 'images' || key === 'insuranceDocs') {
          if (value && value.length) {
            for (let i = 0; i < value.length; i++) {
              data.append(`${key}[]`, value[i]);
            }
          }
        } else {
          data.append(key, value);
        }
      });

      Inertia.post('/freight/units/store', data, {
        forceFormData: true,
        onError: (err) => {
          setErrors(err);
          setIsSubmitting(false);
        },
        preserveState: true
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 poppins">
      <div>
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-8 font-[400]">
      {/* Category Section removed */}

      {/* Basic Information Section */}
      <section className="bg-[#FFFFFF] p-6 rounded-lg">
        <h2 className="text-[18px] font-[400] text-gray-800 mb-6">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label htmlFor="carrier" className="block text-[14px] font-medium text-gray-700">Carrier</label>
            <input
              id="carrier"
              name="carrier"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              value={form.carrier}
              onChange={handleChange}
              placeholder="Tata"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="unitType" className="block text-[14px] font-medium text-gray-700">Unit Type</label>
            <input
              id="unitType"
              name="unitType"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              value={form.unitType}
              onChange={handleChange}
              placeholder="14ft Lorry"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="registerNumber" className="block text-[14px] font-medium text-gray-700">Registration Number</label>
            <input
              id="registerNumber"
              name="registerNumber"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              value={form.registerNumber}
              onChange={handleChange}
              placeholder="Enter registration"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="status" className="block text-[14px] font-medium text-gray-700">Status</label>
            <input
              id="status"
              name="status"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              value={form.status}
              onChange={handleChange}
              placeholder="Available"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="unitsCount" className="block text-[14px] font-medium text-gray-700">Units Count</label>
            <input
              id="unitsCount"
              name="unitsCount"
              type="number"
              min="1"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              value={form.unitsCount}
              onChange={handleChange}
              placeholder="1"
            />
          </div>
        </div>
      </section>

      {/* Details & Documentation Section */}
      <section className="bg-[#FFFFFF] p-6 rounded-lg">
        <h2 className="text-[18px] font-[400] text-gray-800 mb-6">Details & Documentation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[14px] font-medium text-gray-700">Images</label>
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
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="block text-[14px] font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                name="description"
                rows="4"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter description"
              ></textarea>
            </div>
            <div className="space-y-2">
              <label htmlFor="insuranceProvider" className="block text-[14px] font-medium text-gray-700">Insurance Provider</label>
              <input
                id="insuranceProvider"
                name="insuranceProvider"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                value={form.insuranceProvider}
                onChange={handleChange}
                placeholder="Enter insurance provider name"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[14px] font-medium text-gray-700">Insurance Documents</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors duration-150">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="insuranceDocs" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                      <span>Upload documents</span>
                      <input id="insuranceDocs" name="insuranceDocs" type="file" multiple onChange={handleChange} className="sr-only" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC up to 10MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features & Pricing Section */}
      <section className="bg-[#FFFFFF] p-6 rounded-lg">
        <h2 className="text-[18px] font-[400] text-gray-800 mb-6">Features & Pricing</h2>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label htmlFor="ratePerKm" className="block text-[14px] font-medium text-gray-700">Rate Per Km ($)</label>
              <input
                id="ratePerKm"
                type="number"
                name="ratePerKm"
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                value={form.ratePerKm}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="deposit" className="block text-[14px] font-medium text-gray-700">Deposit Amount ($)</label>
              <input
                id="deposit"
                type="number"
                name="deposit"
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                value={form.deposit}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="advancePayment" className="block text-[14px] font-medium text-gray-700">Advance Payment ($)</label>
              <input
                id="advancePayment"
                type="number"
                name="advancePayment"
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                value={form.advancePayment}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="space-y-4">
            <label className="block text-[14px] font-medium text-gray-700">Additional Features</label>
            <div className="flex flex-wrap gap-4">
              <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-150">
                <input type="checkbox" name="gps" checked={form.gps} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-700">GPS Navigation</span>
              </label>
              <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-150">
                <input type="checkbox" name="refrigerated" checked={form.refrigerated} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-700">Refrigerated</span>
              </label>
              <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-150">
                <input type="checkbox" name="tailLift" checked={form.tailLift} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-700">Tail Lift</span>
              </label>
              <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-150">
                <input type="checkbox" name="insuranceCoverage" checked={form.insuranceCoverage} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-700">Insurance Coverage</span>
              </label>
            </div>
            <input
              name="extra"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              placeholder="Add more features (comma separated)"
              value={form.extra}
              onChange={handleChange}
            />
          </div>
        </div>
      </section>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-[700] figtree rounded-lg focus:outline-none focus:ring-0 transition-colors duration-150"
              onClick={() => window.location.href = "/freight/units"}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center px-6 py-2.5 border border-transparent font-[700] figtree rounded-lg text-[#FFFFFF] bg-[#0955AC] focus:outline-none focus:ring-0 transition-colors duration-150 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
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
                  Save Unit
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