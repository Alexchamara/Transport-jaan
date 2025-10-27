import React, { useEffect, useState } from "react";
import { router } from "@inertiajs/react";

const FilterSidebar = ({ searchParams }) => {
  const [selectedBodyType, setSelectedBodyType] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCapacity, setSelectedCapacity] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedMileage, setSelectedMileage] = useState("");

  useEffect(() => {
    if (searchParams?.bodyType) {
      setSelectedBodyType(searchParams.bodyType.toLowerCase());
    }
    if (searchParams?.brand) {
      setSelectedBrand(searchParams.brand.toLowerCase());
    }
  }, [searchParams]);

  const handleBodyTypeChange = (bodyType) => {
    const newBodyType = selectedBodyType === bodyType ? "" : bodyType;
    setSelectedBodyType(newBodyType);
    
    router.get('/airVehicleList', {
      ...searchParams,
      bodyType: newBodyType
    }, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };

  const handleBrandChange = (brand) => {
    const newBrand = selectedBrand === brand ? "" : brand;
    setSelectedBrand(newBrand);
    
    router.get('/airVehicleList', {
      ...searchParams,
      brand: newBrand
    }, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };

const handleCapacityChange = (capacity) => {
  const newCapacities = selectedCapacity === capacity ? "" : capacity;
  setSelectedCapacity(newCapacities);
  // Send to backend
  router.get('/airVehicleList', {
    ...searchParams,
    capacity: newCapacities,
  }, {
    preserveState: true,
    preserveScroll: true,
    replace: true,
  });
};

const handlePriceChange = (priceRange) => {
  const newPrice = selectedPrice === priceRange ? "" : priceRange;
  setSelectedPrice(newPrice);
  // Send to backend
  router.get('/airVehicleList', {
    ...searchParams,
    price: newPrice,
  }, {
    preserveState: true,
    preserveScroll: true,
    replace: true,
  });
}

const handleMileagesChange = (mileageChange) => {
  const newMileages = selectedMileage === mileageChange ? "" : mileageChange;
  setSelectedMileage(newMileages);
  // Send to backend
  router.get('/airVehicleList', {
    ...searchParams,
    mileage: newMileages,
  }, {
    preserveState: true,
    preserveScroll: true,
    replace: true,
  });
}

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const bodyTypes = [
    { id: "jetSki", label: "Jet Ski", count: 23 },
    { id: "speedboat", label: "Speedboat", count: 23 },
    { id: "yacht", label: "Yacht", count: 23 },
    { id: "catamaran", label: "Catamaran", count: 23 },
    { id: "sailboat", label: "Sail Boat", count: 23 },
    { id: "fishingboat", label: "Fishing Boat", count: 23 },
    { id: "cruiseShip", label: "Cruise Ship", count: 23 },
    { id: "houseBoat", label: "House Boat", count: 23 },
  ];

  const brands = [
    { id: "yamahaMarine", label: "Airbus", count: 15 },
    { id: "saeDoo", label: "Boeing", count: 12 },
    { id: "bayliner", label: "Cessna", count: 18 },
    { id: "quicksilver", label: "Bell", count: 10 },
    { id: "beneteau", label: "Gulfstream", count: 14 },
    { id: "princess", label: "Embraer", count: 9 },
    { id: "sunseeker", label: "Dassault Falcon", count: 11 },
    { id: "azimutYachts", label: "Bombardier", count: 11 },
    { id: "ferretti", label: "ATR", count: 11 },
    { id: "masterCraft", label: "Pilatus", count: 11 },
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

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`poppins text-[#0F0F0F80] text-[12px] font-[400] filter-sidebar bg-[#F4F3F3] rounded-[10px] p-5
          fixed md:static
          top-0 left-0
          h-full md:h-[998px]
          w-[283px] md:w-[283px]
          transform transition-transform duration-300 ease-in-out
          z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ml-0 md:ml-10 mt-0 md:mt-10`}
      >
        {/* Close button for mobile */}
        <button
          onClick={toggleSidebar}
          className="md:hidden absolute top-4 right-4 text-gray-600 hover:text-gray-800"
        >
          ×
        </button>

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

        <div className="filter-section mb-15">
          <h3 className="bebas-neue text-[20px] text-[#0000008C] mb-2.5 pb-2 border-b border-[#00000026]">
            CAPACITY
          </h3>
          <div className="mb-1.5 flex justify-between items-center">
            <div className="flex items-center">
             <input
                type="checkbox"
                id="2person"
                name="capacity"
                value="2person"
                className="mr-1.5"
                checked={selectedCapacity.includes("2person")}
                onChange={() => handleCapacityChange("2person")}
              />

              <label htmlFor="2person">2 Person</label>
            </div>
            <span>(23)</span>
          </div>
          <div className="mb-1.5 flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="4person"
                name="capacity"
                value="4person"
                className="mr-1.5"
                checked={selectedCapacity.includes("4person")}
                onChange={() => handleCapacityChange("4person")}
              />
              <label htmlFor="4person">4 Person</label>
            </div>
            <span>(23)</span>
          </div>
          <div className="mb-1.5 flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="6person"
                name="capacity"
                value="6person"
                className="mr-1.5"
                checked={selectedCapacity.includes("6person")}
                onChange={() => handleCapacityChange("6person")}
              />
              <label htmlFor="6person">6 Person</label>
            </div>
            <span>(23)</span>
          </div>
          <div className="mb-1.5 flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="8ormore"
                name="capacity"
                value="8ormore"
                className="mr-1.5"
                checked={selectedCapacity.includes("8ormore")}
                onChange={() => handleCapacityChange("8ormore")}
              />
              <label htmlFor="8ormore">8 or More</label>
            </div>
            <span>(23)</span>
          </div>
        </div>

        <div className="filter-section mb-15">
          <h3 className="bebas-neue text-[20px] text-[#0000008C] mb-2.5 pb-2 border-b border-[#00000026]">
            PRICE PER DAY
          </h3>
          <div className="mb-1.5 flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="price0_50"
                name="price"
                value="0-50"
                className="mr-1.5"
                checked={selectedPrice === "0-50"}
                onChange={() => handlePriceChange("0-50")}
              />
              <label htmlFor="price0_50">US$ 0 - US$ 50</label>
            </div>
            <span>(23)</span>
          </div>
          <div className="mb-1.5 flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="price50_100"
                name="price"
                value="50-100"
                className="mr-1.5"
                checked={selectedPrice === "50-100"}
                onChange={() => handlePriceChange("50-100")}
              />
              <label htmlFor="price50_100">US$ 50 - US$ 100</label>
            </div>
            <span>(23)</span>
          </div>
          <div className="mb-1.5 flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="price100_150"
                name="price"
                value="100-150"
                className="mr-1.5"
                checked={selectedPrice === "100-150"}
                onChange={() => handlePriceChange("100-150")}
              />
              <label htmlFor="price100_150">US$ 100 - US$ 150</label>
            </div>
            <span>(23)</span>
          </div>
          <div className="mb-1.5 flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="price150_200"
                name="price"
                value="150-200"
                className="mr-1.5"
                checked={selectedPrice === "150-200"}
                onChange={() => handlePriceChange("150-200")}
              />
              <label htmlFor="price150_200">US$ 150 - US$ 200</label>
            </div>
            <span>(23)</span>
          </div>
          <div className="mb-1.5 flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="price200plus"
                name="price"
                value="200plus"
                className="mr-1.5"
                checked={selectedPrice === "200plus"}
                onChange={() => handlePriceChange("200plus")}
              />
              <label htmlFor="price200plus">US$ 200+</label>
            </div>
            <span>(23)</span>
          </div>
        </div>

        <div className="filter-section mb-15">
          <h3 className="bebas-neue text-[20px] text-[#0000008C] mb-2.5 pb-2 border-b border-[#00000026]">
            MILAGE / KILOMETERS
          </h3>
          <div className="mb-1.5 flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="limited"
                name="mileage"
                value="limited"
                className="mr-1.5"
                changed={selectedMileage === "limited"}
                onChange={() => handleMileagesChange("limited")}
              />
              <label htmlFor="limited">Limited</label>
            </div>
            <span>(23)</span>
          </div>
          <div className="mb-1.5 flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="unlimited"
                name="mileage"
                value="unlimited"
                className="mr-1.5"
                changed={selectedMileage === "unlimited"}
                onChange={() => handleMileagesChange("unlimited")}
              />
              <label htmlFor="unlimited">Unlimited</label>
            </div>
            <span>(23)</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
