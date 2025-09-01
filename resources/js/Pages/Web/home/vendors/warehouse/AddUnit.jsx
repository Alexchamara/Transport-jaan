import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';

const initialState = {
  // Identification
  sku: '',
  name: '',
  category: '',
  description: '',

  // Stock & location
  uom: '',
  quantity: '',
  minStock: '',
  locationAisle: '',
  locationBin: '',
  barcode: '',

  // Supplier & pricing
  supplier: '',
  costPrice: '',
  sellingPrice: '',
  taxRate: '',

  // Batch & compliance
  batchNumber: '',
  expiryDate: '',
  documents: [], // e.g., MSDS, certificates

  // Physical attributes
  weight_kg: '',
  length_cm: '',
  width_cm: '',
  height_cm: '',

  // Media
  images: [],

  // Handling features
  fragile: false,
  refrigerated: false,
  hazardous: false,
  insured: false,
  extra: '',
};

const categoryOptions = ['Raw Material', 'Finished Goods', 'Packaging', 'Spare Parts', 'Equipment', 'Other'];
const uomOptions = ['pcs', 'box', 'set', 'kg', 'g', 'l', 'ml', 'm', 'cm', 'pallet'];

const AddUnit = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setForm((prev) => ({ ...prev, [name]: files }));
    } else if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'images' || key === 'documents') {
          if (value && value.length) {
            for (let i = 0; i < value.length; i++) {
              data.append(`${key}[]`, value[i]);
            }
          }
        } else {
          data.append(key, value ?? '');
        }
      });

      Inertia.post('/vendor/warehouse/units/store', data, {
        forceFormData: true,
        onError: (err) => {
          setErrors(err);
          setIsSubmitting(false);
        },
        preserveState: true,
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
          {/* Category & Identification */}
          <section className="bg-[#FFFFFF] p-6 rounded-lg mb-8">
            <h2 className="text-[18px] font-[400] text-gray-800 mb-6">Item Category & Identification</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="category" className="block text-[14px] font-medium text-gray-700">Category</label>
                <select
                  id="category"
                  name="category"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.category && <div className="text-red-500 text-xs mt-1">{errors.category}</div>}
              </div>

              <div className="space-y-2">
                <label htmlFor="sku" className="block text-[14px] font-medium text-gray-700">SKU / Code</label>
                <input id="sku" name="sku" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={form.sku} onChange={handleChange} placeholder="e.g., RM-001" />
              </div>

              <div className="space-y-2">
                <label htmlFor="name" className="block text-[14px] font-medium text-gray-700">Item Name</label>
                <input id="name" name="name" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={form.name} onChange={handleChange} placeholder="e.g., Green Tea Leaves" />
              </div>

              <div className="space-y-2">
                <label htmlFor="uom" className="block text-[14px] font-medium text-gray-700">Unit of Measure</label>
                <select id="uom" name="uom" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" value={form.uom} onChange={handleChange}>
                  <option value="">Select UOM</option>
                  {uomOptions.map((u) => (<option key={u} value={u}>{u}</option>))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="barcode" className="block text-[14px] font-medium text-gray-700">Barcode</label>
                <input id="barcode" name="barcode" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={form.barcode} onChange={handleChange} placeholder="EAN/UPC/Code128" />
              </div>
            </div>
          </section>

          {/* Stock & Location */}
          <section className="bg-[#FFFFFF] p-6 rounded-lg">
            <h2 className="text-[18px] font-[400] text-gray-800 mb-6">Stock & Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label htmlFor="quantity" className="block text-[14px] font-medium text-gray-700">Quantity</label>
                <input id="quantity" type="number" name="quantity" min="0" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={form.quantity} onChange={handleChange} placeholder="0" />
              </div>
              <div className="space-y-2">
                <label htmlFor="minStock" className="block text-[14px] font-medium text-gray-700">Reorder Level</label>
                <input id="minStock" type="number" name="minStock" min="0" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={form.minStock} onChange={handleChange} placeholder="e.g., 20" />
              </div>
              <div className="space-y-2">
                <label htmlFor="locationAisle" className="block text-[14px] font-medium text-gray-700">Aisle</label>
                <input id="locationAisle" name="locationAisle" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={form.locationAisle} onChange={handleChange} placeholder="e.g., A3" />
              </div>
              <div className="space-y-2">
                <label htmlFor="locationBin" className="block text-[14px] font-medium text-gray-700">Bin</label>
                <input id="locationBin" name="locationBin" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={form.locationBin} onChange={handleChange} placeholder="e.g., B12" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-2">
                <label htmlFor="description" className="block text-[14px] font-medium text-gray-700">Description</label>
                <textarea id="description" name="description" rows="4" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={form.description} onChange={handleChange} placeholder="Optional notes about the item" />
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="supplier" className="block text-[14px] font-medium text-gray-700">Supplier</label>
                    <input id="supplier" name="supplier" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={form.supplier} onChange={handleChange} placeholder="Supplier name" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="taxRate" className="block text-[14px] font-medium text-gray-700">Tax Rate (%)</label>
                    <input id="taxRate" type="number" name="taxRate" min="0" step="0.01" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={form.taxRate} onChange={handleChange} placeholder="e.g., 8" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="costPrice" className="block text-[14px] font-medium text-gray-700">Cost Price</label>
                    <input id="costPrice" type="number" name="costPrice" min="0" step="0.01" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={form.costPrice} onChange={handleChange} placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="sellingPrice" className="block text-[14px] font-medium text-gray-700">Selling Price</label>
                    <input id="sellingPrice" type="number" name="sellingPrice" min="0" step="0.01" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={form.sellingPrice} onChange={handleChange} placeholder="0.00" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Media & Documents */}
          <section className="bg-[#FFFFFF] p-6 rounded-lg">
            <h2 className="text-[18px] font-[400] text-gray-800 mb-6">Images & Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[14px] font-medium text-gray-700">Item Images</label>
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
                <label className="block text-[14px] font-medium text-gray-700">Compliance Documents</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors duration-150">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="documents" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                        <span>Upload documents</span>
                        <input id="documents" name="documents" type="file" multiple onChange={handleChange} className="sr-only" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOCX up to 10MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="space-y-2">
                    <label htmlFor="batchNumber" className="block text-[14px] font-medium text-gray-700">Batch Number</label>
                    <input id="batchNumber" name="batchNumber" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={form.batchNumber} onChange={handleChange} placeholder="e.g., B-2025-001" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="expiryDate" className="block text-[14px] font-medium text-gray-700">Expiry Date</label>
                    <input id="expiryDate" type="date" name="expiryDate" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={form.expiryDate} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Physical & Handling */}
          <section className="bg-[#FFFFFF] p-6 rounded-lg">
            <h2 className="text-[18px] font-[400] text-gray-800 mb-6">Physical & Handling</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label htmlFor="weight_kg" className="block text-[14px] font-medium text-gray-700">Weight (kg)</label>
                <input id="weight_kg" type="number" name="weight_kg" min="0" step="0.001" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={form.weight_kg} onChange={handleChange} placeholder="e.g., 2.5" />
              </div>
              <div className="space-y-2">
                <label htmlFor="length_cm" className="block text-[14px] font-medium text-gray-700">Length (cm)</label>
                <input id="length_cm" type="number" name="length_cm" min="0" step="0.01" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={form.length_cm} onChange={handleChange} placeholder="e.g., 30" />
              </div>
              <div className="space-y-2">
                <label htmlFor="width_cm" className="block text-[14px] font-medium text-gray-700">Width (cm)</label>
                <input id="width_cm" type="number" name="width_cm" min="0" step="0.01" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={form.width_cm} onChange={handleChange} placeholder="e.g., 20" />
              </div>
              <div className="space-y-2">
                <label htmlFor="height_cm" className="block text-[14px] font-medium text-gray-700">Height (cm)</label>
                <input id="height_cm" type="number" name="height_cm" min="0" step="0.01" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={form.height_cm} onChange={handleChange} placeholder="e.g., 10" />
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <label className="block text-[14px] font-medium text-gray-700">Handling Requirements</label>
              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" name="fragile" checked={form.fragile} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <span className="ml-2 text-sm text-gray-700">Fragile</span>
                </label>
                <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" name="refrigerated" checked={form.refrigerated} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <span className="ml-2 text-sm text-gray-700">Refrigerated</span>
                </label>
                <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" name="hazardous" checked={form.hazardous} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <span className="ml-2 text-sm text-gray-700">Hazardous</span>
                </label>
                <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" name="insured" checked={form.insured} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  <span className="ml-2 text-sm text-gray-700">Insured</span>
                </label>
              </div>
              <input name="extra" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Additional handling notes (comma separated)" value={form.extra} onChange={handleChange} />
            </div>
          </section>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button type="button" className="px-6 py-2.5 border border-gray-300 text-gray-700 font-[700] figtree rounded-lg focus:outline-none" onClick={() => (window.location.href = '/warehouse/units')}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className={`inline-flex items-center px-6 py-2.5 border border-transparent font-[700] figtree rounded-lg text-[#FFFFFF] bg-[#0955AC] focus:outline-none ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}>
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
                  Save Item
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