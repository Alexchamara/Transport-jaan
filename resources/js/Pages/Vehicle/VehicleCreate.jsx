import React, { useState } from 'react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function VehicleCreate({ brands = [], bodyTypes = [] }) {
  const [formData, setFormData] = useState({
    model: '',
    vehicle_brand_id: '',
    manufracture: '',
    manufracture_year: '',
    register_year: '',
    vehicle_no: '',
    category: '',
    color: '',
    condition: '',
    ownership_type: '',
    passenger_capacity: '',
    currect_milage: '',
    description: '',
    insuarance_provider_name: '',
    insuarance_document: null,
    images: [],
    body_type: '',
    fuel_type: '',
    transmission_type: '',
    pickup_location: '',
    drop_off_policy: '',
    flight_fly_range_km: '',
    airport_name: '',
    port_of_operation: '',
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      if (name === 'images') {
        const selectedImages = Array.from(files);
        setFormData({ ...formData, images: selectedImages });
        setImagePreviews(selectedImages.map(file => URL.createObjectURL(file)));
      } else {
        setFormData({ ...formData, [name]: files[0] });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((file, index) => {
          form.append(`${key}[${index}]`, file);
        });
      } else {
        form.append(key, value);
      }
    });

    try {
      await axios.get('/sanctum/csrf-cookie');
      await axios.post('/vendor/vehicles/store', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('✅ Vehicle registered successfully!');
      window.location.href = '/vendor/vehicles';
    } catch (error) {
      console.error('❌ Submission error:', error.response?.data || error.message);
      alert('❌ Failed to register vehicle.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-500 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Register New Vehicle</h1>
                  <p className="text-blue-100 mt-1">Fill in the details below to add a new vehicle to your fleet</p>
                </div>
                <div className="bg-blue-500 rounded-full p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="bg-gradient-to-r from-blue-300 to-green-100 px-8 py-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vehicle Brand */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Vehicle Brand *</label>
                  <select
                    name="vehicle_brand_id"
                    value={formData.vehicle_brand_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                    required
                  >
                    <option value="">Select a Brand</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vehicle Model */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Vehicle Model *</label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                    placeholder="e.g. Corolla, Civic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Manufacturer */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Manufacturer *</label>
                  <select
                    name="manufracture"
                    value={formData.manufracture}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                    required
                  >
                    <option value="">Select Manufacturer</option>
                    <option>Toyota</option>
                    <option>Nissan</option>
                    <option>Mercedes</option>
                    <option>Audi</option>
                    <option>Mitsubishi</option>
                    <option>Honda</option>
                    <option>Subaru</option>
                    <option>BMW</option>
                    <option>Boeing</option>
                    <option>Airbus</option>
                    <option>Cessna</option>
                    <option>Yamaha</option>
                    <option>Mercury</option>
                  </select>
                </div>

                {/* Manufacture Year */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Manufacture Year</label>
                  <input
                    type="number"
                    name="manufracture_year"
                    value={formData.manufracture_year}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g. 2018"
                  />
                </div>

                {/* Register Year */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Register Year</label>
                  <input
                    type="number"
                    name="register_year"
                    value={formData.register_year}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="e.g. 2020"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vehicle Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Vehicle Number</label>
                  <input
                    type="text"
                    name="vehicle_no"
                    value={formData.vehicle_no}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="License plate number"
                  />
                </div>

                {/* Vehicle Category */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Vehicle Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="air">Air</option>
                    <option value="land">Land</option>
                    <option value="sea">Sea</option>
                  </select>
                </div>
              </div>

              {/* Conditional Fields Based on Category */}
              {formData.category === 'land' && (
                <div className="space-y-6 p-6 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1a1 1 0 011-1h2a1 1 0 011 1v1a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H19a1 1 0 001-1V5a1 1 0 00-1-1H3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Land Vehicle Details</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Body Type</label>
                      <select
                        name="body_type"
                        value={formData.body_type}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                      >
                        <option value="">Select Body Type</option>
                        {bodyTypes.map((bodyType) => (
                          <option key={bodyType.id} value={bodyType.id}>
                            {bodyType.bodyType}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Fuel Type</label>
                      <select
                        name="fuel_type"
                        value={formData.fuel_type}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                      >
                        <option value="">Select Fuel Type</option>
                        <option>Petrol 92</option>
                        <option>Petrol 95</option>
                        <option>Normal Diesel</option>
                        <option>Super Diesel</option>
                        <option>Electric</option>
                        <option>Hybrid</option>
                        <option>CNG</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Transmission Type</label>
                      <select
                        name="transmission_type"
                        value={formData.transmission_type}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                      >
                        <option value="">Select Transmission</option>
                        <option>Automatic</option>
                        <option>Manual</option>
                        <option>CVT</option>
                        <option>Triptonic</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
                      <input
                        type="text"
                        name="pickup_location"
                        value={formData.pickup_location}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="Where customers can pick up the vehicle"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Drop-off Policy</label>
                    <select
                      name="drop_off_policy"
                      value={formData.drop_off_policy}
                      onChange={handleInputChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                    >
                      <option value="">Select Drop-off Policy</option>
                      <option>One-way</option>
                      <option>Return-trip</option>
                      <option>Drop-off only</option>
                      <option>Drop-off and Return-trip</option>
                    </select>
                  </div>
                </div>
              )}

              {formData.category === 'air' && (
                <div className="space-y-6 p-6 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Air Vehicle Details</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Flight Fly Range (km)</label>
                      <input
                        type="number"
                        name="flight_fly_range_km"
                        value={formData.flight_fly_range_km}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="Maximum flight range in kilometers"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Airport Name</label>
                      <input
                        type="text"
                        name="airport_name"
                        value={formData.airport_name}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        placeholder="Primary airport of operation"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formData.category === 'sea' && (
                <div className="space-y-6 p-6 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Sea Vehicle Details</h3>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Port of Operation</label>
                    <input
                      type="text"
                      name="port_of_operation"
                      value={formData.port_of_operation}
                      onChange={handleInputChange}
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      placeholder="Primary port where the vessel operates"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Color */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Color</label>
                  <select
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                  >
                    <option value="">Select Color</option>
                    <option>Red</option>
                    <option>Blue</option>
                    <option>Black</option>
                    <option>White</option>
                    <option>Green</option>
                    <option>Yellow</option>
                    <option>Silver</option>
                    <option>Gray</option>
                  </select>
                </div>

                {/* Condition */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Condition</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                  >
                    <option value="">Select Condition</option>
                    <option value="AC">AC</option>
                    <option value="Non AC">Non AC</option>
                  </select>
                </div>

                {/* Ownership Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Ownership Type</label>
                  <select
                    name="ownership_type"
                    value={formData.ownership_type}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                  >
                    <option value="">Select Ownership</option>
                    <option value="owned">Owned</option>
                    <option value="leased">Leased</option>
                    <option value="rented">Rented</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Passenger Capacity */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Passenger Capacity</label>
                  <input
                    type="number"
                    name="passenger_capacity"
                    value={formData.passenger_capacity}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Number of passengers"
                  />
                </div>

                {/* Current Milage */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Current Milage</label>
                  <input
                    type="number"
                    name="currect_milage"
                    value={formData.currect_milage}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Current kilometers/miles"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Provide detailed description about the vehicle (features, special notes, etc.)"
                />
              </div>

              {/* Insurance Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Insurance Provider Name</label>
                  <input
                    type="text"
                    name="insuarance_provider_name"
                    value={formData.insuarance_provider_name}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    placeholder="Insurance company name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Insurance Document *</label>
                  <div className="mt-1 flex items-center">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload PDF/Image</span>
                      <input
                        type="file"
                        name="insuarance_document"
                        required
                        accept="application/pdf,image/*"
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1 text-sm text-gray-500">{formData.insuarance_document?.name || 'No file selected'}</p>
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Vehicle Images <span className="text-gray-500">(Multiple allowed)</span>
                </label>

                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          name="images"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Images:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {imagePreviews.map((src, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={src}
                            alt={`Preview ${index}`}
                            className="w-full h-24 object-cover rounded-md shadow-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Register Vehicle'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
