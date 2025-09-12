import React, { useEffect, useState } from "react";
import { router } from "@inertiajs/react";

const WarehouseFilterSidebar = ({ searchParams }) => {
  const [selectedWarehouseType, setSelectedWarehouseType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (searchParams?.warehouseType) {
      setSelectedWarehouseType(searchParams.warehouseType.toLowerCase());
    }
    if (searchParams?.location) {
      setSelectedLocation(searchParams.location.toLowerCase());
    }
  }, [searchParams]);

  const handleWarehouseTypeChange = (warehouseType) => {
    const newWarehouseType = selectedWarehouseType === warehouseType ? "" : warehouseType;
    setSelectedWarehouseType(newWarehouseType);
    
    router.get('/warehouseList', {
      ...searchParams,
      warehouseType: newWarehouseType
    }, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };

  const handleLocationChange = (location) => {
    const newLocation = selectedLocation === location ? "" : location;
    setSelectedLocation(newLocation);
    
    router.get('/warehouseList', {
      ...searchParams,
      location: newLocation
    }, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const warehouseTypes = [
    { id: "distribution", label: "Distribution Center", count: 12 },
    { id: "storage", label: "Storage Warehouse", count: 18 },
    { id: "cold", label: "Cold Storage", count: 8 },
    { id: "manufacturing", label: "Manufacturing", count: 15 },
    { id: "fulfillment", label: "Fulfillment Center", count: 10 },
    { id: "crossdock", label: "Cross-Dock", count: 6 },
    { id: "automated", label: "Automated Warehouse", count: 4 },
    { id: "bulk", label: "Bulk Storage", count: 9 }
  ];

  const locations = [
    { id: "colombo", label: "Colombo", count: 25 },
    { id: "gampaha", label: "Gampaha", count: 15 },
    { id: "kalutara", label: "Kalutara", count: 8 },
    { id: "kandy", label: "Kandy", count: 12 },
    { id: "galle", label: "Galle", count: 10 },
    { id: "matara", label: "Matara", count: 6 }
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
            WAREHOUSE TYPE
          </h3>
          {warehouseTypes.map((type) => (
            <div key={type.id} className="mb-1.5 flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={type.id}
                  name="warehouseType"
                  value={type.id}
                  className="mr-1.5"
                  checked={selectedWarehouseType === type.id}
                  onChange={() => handleWarehouseTypeChange(type.id)}
                />
                <label htmlFor={type.id}>{type.label}</label>
              </div>
              <span>({type.count})</span>
            </div>
          ))}
        </div>

        <div className="filter-section mb-15 mt-5">
          <h3 className="bebas-neue text-[20px] text-[#0000008C] mb-2.5">
            LOCATION
          </h3>
          {locations.map((location) => (
            <div key={location.id} className="mb-1.5 flex justify-between items-center">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={location.id}
                  name="location"
                  value={location.id}
                  className="mr-1.5"
                  checked={selectedLocation === location.id}
                  onChange={() => handleLocationChange(location.id)}
                />
                <label htmlFor={location.id}>{location.label}</label>
              </div>
              <span>({location.count})</span>
            </div>
          ))}
        </div>

        <div className="filter-section mb-15">
          <h3 className="bebas-neue text-[20px] text-[#0000008C] mb-2.5 pb-2 border-b border-[#00000026]">
            SIZE (SQ FT)
          </h3>
          <div className="mb-1.5 flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="small"
                name="size"
                value="small"
                className="mr-1.5"
              />
              <label htmlFor="small">Under 5,000</label>
            </div>
            <span>(15)</span>
          </div>
          <div className="mb-1.5 flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="medium"
                name="size"
                value="medium"
                className="mr-1.5"
              />
              <label htmlFor="medium">5,000 - 20,000</label>
            </div>
            <span>(28)</span>
          </div>
          <div className="mb-1.5 flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="large"
                name="size"
                value="large"
                className="mr-1.5"
              />
              <label htmlFor="large">20,000 - 50,000</label>
            </div>
            <span>(18)</span>
          </div>
          <div className="mb-1.5 flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="xlarge"
                name="size"
                value="xlarge"
                className="mr-1.5"
              />
              <label htmlFor="xlarge">50,000+</label>
            </div>
            <span>(11)</span>
          </div>
        </div>

        <div className="filter-section mb-15">
          <h3 className="bebas-neue text-[20px] text-[#0000008C] mb-2.5 pb-2 border-b border-[#00000026]">
            PRICE PER MONTH
          </h3>
          <div className="mb-1.5 flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="price0_5000"
                name="price"
                value="0-5000"
                className="mr-1.5"
              />
              <label htmlFor="price0_5000">US$ 0 - US$ 5,000</label>
            </div>
            <span>(20)</span>
          </div>
          <div className="mb-1.5 flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="price5000_15000"
                name="price"
                value="5000-15000"
                className="mr-1.5"
              />
              <label htmlFor="price5000_15000">US$ 5,000 - US$ 15,000</label>
            </div>
            <span>(25)</span>
          </div>
          <div className="mb-1.5 flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="price15000_30000"
                name="price"
                value="15000-30000"
                className="mr-1.5"
              />
              <label htmlFor="price15000_30000">US$ 15,000 - US$ 30,000</label>
            </div>
            <span>(18)</span>
          </div>
          <div className="mb-1.5 flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="price30000plus"
                name="price"
                value="30000plus"
                className="mr-1.5"
              />
              <label htmlFor="price30000plus">US$ 30,000+</label>
            </div>
            <span>(9)</span>
          </div>
        </div>

        <div className="filter-section mb-15">
          <h3 className="bebas-neue text-[20px] text-[#0000008C] mb-2.5 pb-2 border-b border-[#00000026]">
            FEATURES
          </h3>
          <div className="mb-1.5 flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="loading_dock"
                name="features"
                value="loading_dock"
                className="mr-1.5"
              />
              <label htmlFor="loading_dock">Loading Dock</label>
            </div>
            <span>(45)</span>
          </div>
          <div className="mb-1.5 flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="climate_control"
                name="features"
                value="climate_control"
                className="mr-1.5"
              />
              <label htmlFor="climate_control">Climate Control</label>
            </div>
            <span>(22)</span>
          </div>
          <div className="mb-1.5 flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="security_system"
                name="features"
                value="security_system"
                className="mr-1.5"
              />
              <label htmlFor="security_system">24/7 Security</label>
            </div>
            <span>(38)</span>
          </div>
          <div className="mb-1.5 flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="office_space"
                name="features"
                value="office_space"
                className="mr-1.5"
              />
              <label htmlFor="office_space">Office Space</label>
            </div>
            <span>(30)</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default WarehouseFilterSidebar;