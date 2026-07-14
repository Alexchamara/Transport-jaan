import React, { useEffect, useState } from "react";
import { router } from "@inertiajs/react";

const FilterSidebar = ({ searchParams }) => {
  const [selectedBodyType, setSelectedBodyType] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedMileage, setSelectedMileage] = useState("");
  const [selectedFuel, setSelectedFuel] = useState("");

  /* ---------- Sync with URL ---------- */
  useEffect(() => {
    if (searchParams?.bodyType) setSelectedBodyType(searchParams.bodyType.toLowerCase());
    if (searchParams?.brand) setSelectedBrand(searchParams.brand.toLowerCase());
  }, [searchParams]);

  /* ---------- Handlers ---------- */
  const handleBodyTypeChange = (bodyType) => {
    const newVal = selectedBodyType === bodyType ? "" : bodyType;
    setSelectedBodyType(newVal);
    router.get(
      "/airVehicleList",
      { ...searchParams, bodyType: newVal },
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };

  const handleBrandChange = (brand) => {
    const newVal = selectedBrand === brand ? "" : brand;
    setSelectedBrand(newVal);
    router.get(
      "/airVehicleList",
      { ...searchParams, brand: newVal },
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };

  const handleCapacityChange = (capacity) => {
    const newVal = selectedCapacity === capacity ? "" : capacity;
    setSelectedCapacity(newVal);
    router.get(
      "/airVehicleList",
      { ...searchParams, capacity: newVal },
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };

  const handlePriceChange = (priceRange) => {
    const newVal = selectedPrice === priceRange ? "" : priceRange;
    setSelectedPrice(newVal);
    router.get(
      "/airVehicleList",
      { ...searchParams, price: newVal },
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };

  const handleMileagesChange = (mileage) => {
    const newVal = selectedMileage === mileage ? "" : mileage;
    setSelectedMileage(newVal);
    router.get(
      "/airVehicleList",
      { ...searchParams, mileage: newVal },
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };

  const handleFuelChange = (fuel) => {
    const newVal = selectedFuel === fuel ? "" : fuel;
    setSelectedFuel(newVal);
    router.get(
      "/airVehicleList",
      { ...searchParams, fuel: newVal },
      { preserveState: true, preserveScroll: true, replace: true }
    );
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  /* ---------- Air-Vehicle Types ---------- */
  const bodyTypes = [
    { id: "lightaircraft", label: "Light Aircraft", count: 23 },
    { id: "turboprop", label: "Turboprop", count: 23 },
    { id: "businessjet", label: "Business Jet", count: 23 },
    { id: "commercialjet", label: "Commercial Jet", count: 23 },
    { id: "helicopter", label: "Helicopter", count: 23 },
    { id: "ultralight", label: "Ultralight", count: 23 },
    { id: "glider", label: "Glider", count: 23 },
    { id: "seaplane", label: "Seaplane", count: 23 },
  ];

  /* ---------- Brands (kept as-is – they are aircraft manufacturers) ---------- */
  const brands = [
    { id: "airbus", label: "Airbus", count: 15 },
    { id: "boeing", label: "Boeing", count: 12 },
    { id: "cessna", label: "Cessna", count: 18 },
    { id: "bell", label: "Bell", count: 10 },
    { id: "gulfstream", label: "Gulfstream", count: 14 },
    { id: "embraer", label: "Embraer", count: 9 },
    { id: "dassault", label: "Dassault Falcon", count: 11 },
    { id: "bombardier", label: "Bombardier", count: 11 },
    { id: "atr", label: "ATR", count: 11 },
    { id: "pilatus", label: "Pilatus", count: 11 },
  ];

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed bottom-4 right-4 z-40 bg-[#0955AC] text-white px-4 py-2 rounded-full shadow-lg"
      >
        {isOpen ? "Close Filters" : "Show Filters"}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          poppins text-[#0F0F0F80] text-[12px] font-[400] filter-sidebar bg-[#F4F3F3] rounded-[10px] p-5
          fixed md:static top-0 left-0 h-full md:h-[998px] w-[283px] md:w-[283px]
          transform transition-transform duration-300 ease-in-out z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ml-0 md:ml-10 mt-0 md:mt-10
        `}
      >
        {/* Mobile close */}
        <button
          onClick={toggleSidebar}
          className="md:hidden absolute top-4 right-4 text-gray-600 hover:text-gray-800"
        >
          ×
        </button>

        {/* ---------- VEHICLE TYPE ---------- */}
        <div className="filter-section mb-15 mt-5">
          <h3 className="bebas-neue text-[20px] text-[#0000008C] mb-2.5">
            VEHICLE TYPE
          </h3>
          {bodyTypes.map((type) => (
            <div key={type.id} className="mb-1.5 flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={type.id}
                  name="vehicleType"
                  value={type.id}
                  className="mr-1.5"
                  checked={selectedBodyType === type.id}
                  onChange={() => handleBodyTypeChange(type.id)}
                />
                <label htmlFor={type.id}>{type.label}</label>
              </div>
              <span>({type.count})</span>
            </div>
          ))}
        </div>

        {/* ---------- BRANDS ---------- */}
        <div className="filter-section mb-15 mt-5">
          <h3 className="bebas-neue text-[20px] text-[#0000008C] mb-2.5">
            BRANDS
          </h3>
          {brands.map((brand) => (
            <div key={brand.id} className="mb-1.5 flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={brand.id}
                  name="brand"
                  value={brand.id}
                  className="mr-1.5"
                  checked={selectedBrand === brand.id}
                  onChange={() => handleBrandChange(brand.id)}
                />
                <label htmlFor={brand.id}>{brand.label}</label>
              </div>
              <span>({brand.count})</span>
            </div>
          ))}
        </div>

        {/* ---------- CAPACITY ---------- */}
        <div className="filter-section mb-15">
          <h3 className="bebas-neue text-[20px] text-[#0000008C] mb-2.5 pb-2 border-b border-[#00000026]">
            CAPACITY
          </h3>
          {["2person", "4person", "6person", "8ormore"].map((cap) => (
            <div key={cap} className="mb-1.5 flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={cap}
                  name="capacity"
                  value={cap}
                  className="mr-1.5"
                  checked={selectedCapacity === cap}
                  onChange={() => handleCapacityChange(cap)}
                />
                <label htmlFor={cap}>
                  {cap === "2person"
                    ? "2 Person"
                    : cap === "4person"
                    ? "4 Person"
                    : cap === "6person"
                    ? "6 Person"
                    : "8 or More"}
                </label>
              </div>
              <span>(23)</span>
            </div>
          ))}
        </div>

        {/* ---------- PRICE PER DAY ---------- */}
        <div className="filter-section mb-15">
          <h3 className="bebas-neue text-[20px] text-[#0000008C] mb-2.5 pb-2 border-b border-[#00000026]">
            PRICE PER DAY
          </h3>
          {[
            { id: "price0_50", value: "0-50", label: "US$ 0 - US$ 50" },
            { id: "price50_100", value: "50-100", label: "US$ 50 - US$ 100" },
            { id: "price100_150", value: "100-150", label: "US$ 100 - US$ 150" },
            { id: "price150_200", value: "150-200", label: "US$ 150 - US$ 200" },
            { id: "price200plus", value: "200plus", label: "US$ 200+" },
          ].map((p) => (
            <div key={p.id} className="mb-1.5 flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={p.id}
                  name="price"
                  value={p.value}
                  className="mr-1.5"
                  checked={selectedPrice === p.value}
                  onChange={() => handlePriceChange(p.value)}
                />
                <label htmlFor={p.id}>{p.label}</label>
              </div>
              <span>(23)</span>
            </div>
          ))}
        </div>

        {/* ---------- MILEAGE / KILOMETERS ---------- */}
        <div className="filter-section mb-15">
          <h3 className="bebas-neue text-[20px] text-[#0000008C] mb-2.5 pb-2 border-b border-[#00000026]">
            MILEAGE / KILOMETERS
          </h3>
          {["limited", "unlimited"].map((m) => (
            <div key={m} className="mb-1.5 flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={m}
                  name="mileage"
                  value={m}
                  className="mr-1.5"
                  checked={selectedMileage === m}
                  onChange={() => handleMileagesChange(m)}
                />
                <label htmlFor={m}>{m === "limited" ? "Limited" : "Unlimited"}</label>
              </div>
              <span>(23)</span>
            </div>
          ))}
        </div>

        {/* ---------- FUEL TYPE ---------- */}
        <div className="filter-section mb-15">
          <h3 className="bebas-neue text-[20px] text-[#0000008C] mb-2.5 pb-2 border-b border-[#00000026]">
            FUEL TYPE
          </h3>
          {[
            { id: "jet_a1", label: "Jet A-1" },
            { id: "avgas", label: "Avgas" },
            { id: "electric", label: "Electric" },
            { id: "other", label: "Other" },
          ].map((f) => (
            <div key={f.id} className="mb-1.5 flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`fuel_${f.id}`}
                  name="fuel"
                  value={f.id}
                  className="mr-1.5"
                  checked={selectedFuel === f.id}
                  onChange={() => handleFuelChange(f.id)}
                />
                <label htmlFor={`fuel_${f.id}`}>{f.label}</label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;