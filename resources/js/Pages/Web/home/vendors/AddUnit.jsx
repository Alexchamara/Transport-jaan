import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';

const initialState = {
  model: '',
  manufacture: '',
  manufactureYear: '',
  registerYear: '',
  number: '',
  category: '',
  colour: '',
  images: [],
  condition: '',
  ownershipType: '',
  passengerCapacity: '',
  description: '',
  insuranceProvider: '',
  insuranceDocs: [],
  // Land-specific fields
  mileage: '',
  bodyType: '',
  fuelType: '',
  transmissionType: '',
  gears: '',
  seats: '',
  doors: '',
  fuelTankCapacity: '',
  // Air-specific fields
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
  // Sea-specific fields
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
  // Common pricing and features
  rentalPricePerDay: '',
  totalRentalPrice: '',
  deposit: '',
  advancePayment: '',
  gps: false,
  childSeat: false,
  wifi: false,
  insuranceCoverage: false,
  extra: '',
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

      Inertia.post('/vendor/vehicles/store', data, {
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
    <div className="w-full mx-auto p-4 sm:p-6 lg:p-8 figtree">
      <div>
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-8 bebas-neue font-[400]">
          {/* Category Section */}
          <section className="bg-[#FFFFFF] p-6 rounded-lg mb-8">
            <h2 className="text-[18px] font-[400] text-gray-800 mb-6">Category</h2>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label htmlFor="category" className="block text-[14px] font-medium text-gray-700">
                  Select Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         transition duration-150 ease-in-out bg-white text-gray-700"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && (
                  <div className="text-red-500 text-xs mt-1">{errors.category}</div>
                )}
              </div>
            </div>
          </section>

          {/* Basic Information Section */}
          <section className="bg-[#FFFFFF] p-6 rounded-lg">
            <h2 className="text-[18px] font-[400] text-gray-800 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="model" className="block text-[14px] font-medium text-gray-700">Model</label>
                <input
                  id="model"
                  name="model"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  value={form.model}
                  onChange={handleChange}
                  placeholder="Enter model"
                />
                {errors.model && <div className="text-red-500 text-xs mt-1">{errors.model}</div>}
              </div>

              <div className="space-y-2">
                <label htmlFor="manufacture" className="block text-[14px] font-medium text-gray-700">Manufacturer</label>
                <input
                  id="manufacture"
                  name="manufacture"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  value={form.manufacture}
                  onChange={handleChange}
                  placeholder="Enter manufacturer name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="manufactureYear" className="block text-[14px] font-medium text-gray-700">Manufacture Year</label>
                <input
                  id="manufactureYear"
                  type="number"
                  name="manufactureYear"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  value={form.manufactureYear}
                  onChange={handleChange}
                  min="1900"
                  max="2100"
                  placeholder="YYYY"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="registerYear" className="block text-[14px] font-medium text-gray-700">Register Year</label>
                <input
                  id="registerYear"
                  type="number"
                  name="registerYear"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  value={form.registerYear}
                  onChange={handleChange}
                  min="1900"
                  max="2100"
                  placeholder="YYYY"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="number" className="block text-[14px] font-medium text-gray-700">
                  {form.category === 'Air' ? 'Aircraft Registration' : form.category === 'Sea' ? 'Vessel IMO Number' : 'Vehicle Number'}
                </label>
                <input
                  id="number"
                  name="number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  value={form.number}
                  onChange={handleChange}
                  placeholder={form.category === 'Air' ? 'Enter aircraft registration' : form.category === 'Sea' ? 'Enter IMO number' : 'Enter vehicle number'}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="colour" className="block text-[14px] font-medium text-gray-700">Colour</label>
                <input
                  id="colour"
                  name="colour"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  value={form.colour}
                  onChange={handleChange}
                  placeholder="Enter colour"
                />
              </div>
            </div>
          </section>

          {/* Details & Documentation Section */}
          <section className="bg-[#FFFFFF] p-6 rounded-lg">
            <h2 className="text-[18px] font-[400] text-gray-800 mb-6">
              {form.category === 'Air' ? 'Aircraft' : form.category === 'Sea' ? 'Vessel' : 'Vehicle'} Details & Documentation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[14px] font-medium text-gray-700">
                    {form.category === 'Air' ? 'Aircraft Images' : form.category === 'Sea' ? 'Vessel Images' : 'Vehicle Images'}
                  </label>
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

                {form.category === 'Land' && (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="bodyType" className="block text-[14px] font-medium text-gray-700">Body Type</label>
                      <select
                        id="bodyType"
                        name="bodyType"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white"
                        value={form.bodyType}
                        onChange={handleChange}
                      >
                        <option value="">Select body type</option>
                        {bodyTypeOptions.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="fuelType" className="block text-[14px] font-medium text-gray-700">Fuel Type</label>
                      <select
                        id="fuelType"
                        name="fuelType"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white"
                        value={form.fuelType}
                        onChange={handleChange}
                      >
                        <option value="">Select fuel type</option>
                        {fuelTypeOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="transmissionType" className="block text-[14px] font-medium text-gray-700">Transmission Type</label>
                      <select
                        id="transmissionType"
                        name="transmissionType"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white"
                        value={form.transmissionType}
                        onChange={handleChange}
                      >
                        <option value="">Select transmission type</option>
                        {transmissionOptions.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="gears" className="block text-[14px] font-medium text-gray-700">Number of Gears</label>
                      <input
                        id="gears"
                        type="number"
                        name="gears"
                        min="1"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={form.gears}
                        onChange={handleChange}
                        placeholder="Enter number of gears"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="seats" className="block text-[14px] font-medium text-gray-700">Number of Seats</label>
                      <input
                        id="seats"
                        type="number"
                        name="seats"
                        min="1"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={form.seats}
                        onChange={handleChange}
                        placeholder="Enter number of seats"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="doors" className="block text-[14px] font-medium text-gray-700">Number of Doors</label>
                      <input
                        id="doors"
                        type="number"
                        name="doors"
                        min="1"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={form.doors}
                        onChange={handleChange}
                        placeholder="Enter number of doors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="fuelTankCapacity" className="block text-[14px] font-medium text-gray-700">Fuel Tank Capacity (liters)</label>
                      <input
                        id="fuelTankCapacity"
                        type="number"
                        name="fuelTankCapacity"
                        min="0"
                        step="0.1"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={form.fuelTankCapacity}
                        onChange={handleChange}
                        placeholder="Enter fuel tank capacity"
                      />
                    </div>
                  </>
                )}

                {form.category === 'Air' && (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="aircraft_type" className="block text-[14px] font-medium text-gray-700">Aircraft Type</label>
                      <select
                        id="aircraft_type"
                        name="aircraft_type"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white"
                        value={form.aircraft_type}
                        onChange={handleChange}
                      >
                        <option value="">Select aircraft type</option>
                        {aircraftTypeOptions.map((a) => <option key={a} value={a}>{a.replace('_', ' ').toUpperCase()}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="icao_type_designator" className="block text-[14px] font-medium text-gray-700">ICAO Type Designator</label>
                      <input
                        id="icao_type_designator"
                        name="icao_type_designator"
                        maxLength="8"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={form.icao_type_designator}
                        onChange={handleChange}
                        placeholder="Enter ICAO type designator"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="base_airport_iata" className="block text-[14px] font-medium text-gray-700">Base Airport IATA</label>
                      <input
                        id="base_airport_iata"
                        name="base_airport_iata"
                        maxLength="3"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={form.base_airport_iata}
                        onChange={handleChange}
                        placeholder="Enter IATA code"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="base_airport_icao" className="block text-[14px] font-medium text-gray-700">Base Airport ICAO</label>
                      <input
                        id="base_airport_icao"
                        name="base_airport_icao"
                        maxLength="4"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={form.base_airport_icao}
                        onChange={handleChange}
                        placeholder="Enter ICAO code"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="air_fuel_type" className="block text-[14px] font-medium text-gray-700">Fuel Type</label>
                      <select
                        id="air_fuel_type"
                        name="air_fuel_type"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white"
                        value={form.air_fuel_type}
                        onChange={handleChange}
                      >
                        <option value="">Select fuel type</option>
                        {airFuelTypeOptions.map((f) => <option key={f} value={f}>{f.replace('_', ' ').toUpperCase()}</option>)}
                      </select>
                    </div>
                  </>
                )}

                {form.category === 'Sea' && (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="vessel_type" className="block text-[14px] font-medium text-gray-700">Vessel Type</label>
                      <select
                        id="vessel_type"
                        name="vessel_type"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white"
                        value={form.vessel_type}
                        onChange={handleChange}
                      >
                        <option value="">Select vessel type</option>
                        {vesselTypeOptions.map((v) => <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="hull_material" className="block text-[14px] font-medium text-gray-700">Hull Material</label>
                      <select
                        id="hull_material"
                        name="hull_material"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white"
                        value={form.hull_material}
                        onChange={handleChange}
                      >
                        <option value="">Select hull material</option>
                        {hullMaterialOptions.map((h) => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="length_m" className="block text-[14px] font-medium text-gray-700">Length (m)</label>
                      <input
                        id="length_m"
                        type="number"
                        name="length_m"
                        min="0"
                        step="0.01"
                        max="999999.99"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={form.length_m}
                        onChange={handleChange}
                        placeholder="Enter length in meters"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="beam_m" className="block text-[14px] font-medium text-gray-700">Beam (m)</label>
                      <input
                        id="beam_m"
                        type="number"
                        name="beam_m"
                        min="0"
                        step="0.01"
                        max="999999.99"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={form.beam_m}
                        onChange={handleChange}
                        placeholder="Enter beam in meters"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="draft_m" className="block text-[14px] font-medium text-gray-700">Draft (m)</label>
                      <input
                        id="draft_m"
                        type="number"
                        name="draft_m"
                        min="0"
                        step="0.01"
                        max="999999.99"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={form.draft_m}
                        onChange={handleChange}
                        placeholder="Enter draft in meters"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="engine_type" className="block text-[14px] font-medium text-gray-700">Engine Type</label>
                      <select
                        id="engine_type"
                        name="engine_type"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white"
                        value={form.engine_type}
                        onChange={handleChange}
                      >
                        <option value="">Select engine type</option>
                        {engineTypeOptions.map((e) => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="engine_power_hp" className="block text-[14px] font-medium text-gray-700">Engine Power (hp)</label>
                      <input
                        id="engine_power_hp"
                        type="number"
                        name="engine_power_hp"
                        min="0"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={form.engine_power_hp}
                        onChange={handleChange}
                        placeholder="Enter engine power in hp"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="sea_fuel_type" className="block text-[14px] font-medium text-gray-700">Fuel Type</label>
                      <select
                        id="sea_fuel_type"
                        name="sea_fuel_type"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white"
                        value={form.sea_fuel_type}
                        onChange={handleChange}
                      >
                        <option value="">Select fuel type</option>
                        {seaFuelTypeOptions.map((f) => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                      </select>
                    </div>
                  </>
                )}

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
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="condition" className="block text-[14px] font-medium text-gray-700">Condition</label>
                    <select
                      id="condition"
                      name="condition"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out bg-white"
                      value={form.condition}
                      onChange={handleChange}
                    >
                      <option value="">Select condition</option>
                      {conditionOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="passengerCapacity" className="block text-[14px] font-medium text-gray-700">Passenger Capacity</label>
                    <input
                      id="passengerCapacity"
                      type="number"
                      name="passengerCapacity"
                      min="0"
                      max="255"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                      value={form.passengerCapacity}
                      onChange={handleChange}
                      placeholder="Enter passenger capacity"
                    />
                  </div>
                </div>

                {form.category === 'Land' && (
                  <div className="space-y-2">
                    <label htmlFor="mileage" className="block text-[14px] font-medium text-gray-700">Mileage (km)</label>
                    <input
                      id="mileage"
                      type="number"
                      name="mileage"
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                      value={form.mileage}
                      onChange={handleChange}
                      placeholder="Enter mileage"
                    />
                  </div>
                )}

                {form.category === 'Air' && (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="crew_required" className="block text-[14px] font-medium text-gray-700">Crew Required</label>
                      <input
                        id="crew_required"
                        type="number"
                        name="crew_required"
                        min="0"
                        max="255"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={form.crew_required}
                        onChange={handleChange}
                        placeholder="Enter number of crew required"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="range_km" className="block text-[14px] font-medium text-gray-700">Range (km)</label>
                      <input
                        id="range_km"
                        type="number"
                        name="range_km"
                        min="0"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={form.range_km}
                        onChange={handleChange}
                        placeholder="Enter range in km"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="mtow_kg" className="block text-[14px] font-medium text-gray-700">MTOW (kg)</label>
                      <input
                        id="mtow_kg"
                        type="number"
                        name="mtow_kg"
                        min="0"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={form.mtow_kg}
                        onChange={handleChange}
                        placeholder="Enter MTOW in kg"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="cruising_speed_kts" className="block text-[14px] font-medium text-gray-700">Cruising Speed (kts)</label>
                      <input
                        id="cruising_speed_kts"
                        type="number"
                        name="cruising_speed_kts"
                        min="0"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={form.cruising_speed_kts}
                        onChange={handleChange}
                        placeholder="Enter cruising speed"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="flight_hours_total" className="block text-[14px] font-medium text-gray-700">Total Flight Hours</label>
                      <input
                        id="flight_hours_total"
                        type="number"
                        name="flight_hours_total"
                        min="0"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={form.flight_hours_total}
                        onChange={handleChange}
                        placeholder="Enter total flight hours"
                      />
                    </div>
                  </>
                )}

                {form.category === 'Sea' && (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="cabins" className="block text-[14px] font-medium text-gray-700">Number of Cabins</label>
                      <input
                        id="cabins"
                        type="number"
                        name="cabins"
                        min="0"
                        max="255"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={form.cabins}
                        onChange={handleChange}
                        placeholder="Enter number of cabins"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="berths" className="block text-[14px] font-medium text-gray-700">Number of Berths</label>
                      <input
                        id="berths"
                        type="number"
                        name="berths"
                        min="0"
                        max="255"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={form.berths}
                        onChange={handleChange}
                        placeholder="Enter number of berths"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="toilets" className="block text-[14px] font-medium text-gray-700">Number of Toilets</label>
                      <input
                        id="toilets"
                        type="number"
                        name="toilets"
                        min="0"
                        max="255"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={form.toilets}
                        onChange={handleChange}
                        placeholder="Enter number of toilets"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="fuel_tank_l" className="block text-[14px] font-medium text-gray-700">Fuel Tank Capacity (liters)</label>
                      <input
                        id="fuel_tank_l"
                        type="number"
                        name="fuel_tank_l"
                        min="0"
                        step="0.01"
                        max="9999999999.99"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={form.fuel_tank_l}
                        onChange={handleChange}
                        placeholder="Enter fuel tank capacity"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="water_tank_l" className="block text-[14px] font-medium text-gray-700">Water Tank Capacity (liters)</label>
                      <input
                        id="water_tank_l"
                        type="number"
                        name="water_tank_l"
                        min="0"
                        step="0.01"
                        max="9999999999.99"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        value={form.water_tank_l}
                        onChange={handleChange}
                        placeholder="Enter water tank capacity"
                      />
                    </div>
                  </>
                )}

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
                  <label htmlFor="rentalPricePerDay" className="block text-[14px] font-medium text-gray-700">Daily Rental Price ($)</label>
                  <input
                    id="rentalPricePerDay"
                    type="number"
                    name="rentalPricePerDay"
                    min="0"
                    step="0.01"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                    value={form.rentalPricePerDay}
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
                  {form.category === 'Land' && (
                    <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-150">
                      <input type="checkbox" name="childSeat" checked={form.childSeat} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                      <span className="ml-2 text-sm text-gray-700">Child Seat</span>
                    </label>
                  )}
                  <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors duration-150">
                    <input type="checkbox" name="wifi" checked={form.wifi} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <span className="ml-2 text-sm text-gray-700">Wi-fi</span>
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
              onClick={() => window.location.href = "/units"}
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
                  Save {form.category || 'Unit'}
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