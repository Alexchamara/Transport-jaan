import React, { useMemo } from "react";

import size from "../../assets/rentAVehicle/collection/meter.png";
import location from "../../assets/rentAVehicle/collection/user.png";
import warehouseType from "../../assets/rentAVehicle/collection/gearbox.png";
import features from "../../assets/rentAVehicle/collection/gas.png";
import proPic from "../../assets/landVehicleDetails/proPic.svg";
import tag from "../../assets/landVehicleDetails/tag.svg";
import star from "../../assets/driverBooking/star.svg";

const fmtInt = (n) => (n ?? n === 0 ? Number(n).toLocaleString() : "—");
const fmtFloat = (n, d = 1) => (n ?? n === 0 ? Number(n).toFixed(d) : "—");
const ucfirst = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");

const SpecCard = ({ icon, label }) => (
  <div className="w-[187px] h-[81px] border-[1px] border-[#0000002B] bg-[#E7E6E6] rounded-[10px] flex flex-row justify-center items-center gap-5 px-5 py-5">
    <img src={icon} alt="" />
    <h1>{label}</h1>
  </div>
);

const WarehouseDetailsTab = ({ warehouse }) => {
  const specs = useMemo(() => {
    return {
      totalArea: warehouse?.total_area ? `${fmtInt(warehouse.total_area)} sq ft` : "—",
      warehouseType: ucfirst(warehouse?.type || warehouse?.warehouse_type),
      location: warehouse?.city || warehouse?.location || warehouse?.address || "—",
      amenities: warehouse?.amenities?.length ? `${warehouse.amenities.length} amenities` : "—",
      capacity: warehouse?.capacity ? `${fmtInt(warehouse.capacity)} units` : "—",
      pricing: warehouse?.pricing_model ? ucfirst(warehouse.pricing_model) : "Monthly",
      description:
        warehouse?.description ||
        "No description provided for this warehouse facility.",
      owner: {
        name: warehouse?.provider?.name || warehouse?.owner?.name || "—",
        rating: warehouse?.rating_avg ? fmtFloat(warehouse.rating_avg, 1) : null,
        reviews: warehouse?.reviews_count ?? null,
      },
      features: warehouse?.amenities || [],
    };
  }, [warehouse]);

  return (
    <>
      {/* Description */}
      <div className="flex flex-col gap-5">
        <h1 className="text-[15px] font-[600]">Description</h1>
        <p className="text-[14px]/[33px] font-[400] text-justify px-5">
          {specs.description}
        </p>
      </div>

      {/* Warehouse Specifications */}
      <div className="py-10">
        <h1 className="text-[15px] font-[600]">Warehouse Specifications</h1>
        <div className="py-10 text-[12px] font-[700]">
          <div className="flex flex-col justify-center items-center gap-10">
            <div className="flex flex-col xl:flex-row gap-10 justify-center items-center">
              <SpecCard icon={size} label={specs.totalArea} />
              <SpecCard icon={warehouseType} label={specs.warehouseType} />
              <SpecCard icon={location} label={specs.location} />
              <SpecCard icon={features} label={specs.amenities} />
            </div>
            <div className="flex flex-col xl:flex-row justify-center items-center gap-10">
              <SpecCard 
                icon={size} 
                label={specs.capacity} 
              />
              <SpecCard 
                icon={warehouseType} 
                label={specs.pricing} 
              />
              <SpecCard 
                icon={location} 
                label={warehouse?.status ? ucfirst(warehouse.status) : "Available"} 
              />
              <SpecCard 
                icon={features} 
                label={warehouse?.security_level ? ucfirst(warehouse.security_level) : "Standard"} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features & Amenities */}
      {specs.features.length > 0 && (
        <div className="poppins py-5">
          <h1 className="text-[20px] font-[600] mb-5">Available Features</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {specs.features.map((feature, index) => (
              <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                <div className="w-6 h-6 bg-[#0955AC] rounded-full flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-medium text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location Details */}
      <div className="poppins py-5">
        <h1 className="text-[20px] font-[600] mb-5">Location Information</h1>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">Full Address</h4>
          <p className="text-gray-600">{warehouse?.address || specs.location}</p>
          {(warehouse?.latitude && warehouse?.longitude) && (
            <p className="text-sm text-gray-500 mt-2">
              Coordinates: {warehouse.latitude}, {warehouse.longitude}
            </p>
          )}
        </div>
      </div>

      {/* Owner Info */}
      <div className="poppins w-full py-7">
        <h1 className="text-[20px] font-[600] mb-10">Owner Info</h1>
        <div className="flex flex-col md:flex-row justify-start items-center gap-20">
          <div className="flex flex-col md:flex-row justify-start items-center gap-5">
            <img src={proPic} alt="" />
            <div className="flex flex-col items-start justify-center">
              <div className="flex flex-row gap-2 justify-center items-center">
                <h1 className="text-[15px] font-[700]">
                  {specs.owner.name}
                </h1>
                <img src={tag} alt="" />
              </div>
              <div>
                <div className="flex flex-row gap-3 justify-center items-center">
                  <img src={star} className="w-[16px]" alt="" />
                  <h1 className="text-[14px] font-[400]">
                    {specs.owner.rating ?? "—"}
                  </h1>
                  <h1 className="text-[12px] font-[500] text-[#949699]">
                    {specs.owner.reviews
                      ? `(${fmtInt(specs.owner.reviews)} Reviews)`
                      : "(No reviews)"}
                  </h1>
                </div>
              </div>
            </div>
          </div>
          <div className="text-[9px] flex flex-col md:flex-row gap-4">
            <div className="w-[123px] h-[29px] bg-[#0955AC] text-[#FFFFFF] font-[700] rounded-[5px] flex justify-center items-center cursor-pointer">
              CONTACT NUMBER
            </div>
            <div className="w-[123px] h-[29px] border-[1.5px] border-[#0955AC] bg-[#E8EBEF] text-[#0955AC] font-[700] rounded-[5px] flex justify-center items-center cursor-pointer">
              VIEW PROFILE
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WarehouseDetailsTab;