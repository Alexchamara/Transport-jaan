import React, { useState } from "react";

import share from "../../../assets/landVehicleDetails/share.svg";
import star from "../../../assets/driverBooking/star.svg";
import heartB2 from "../../../assets/landVehicleDetails/heartB2.svg";

import CarDetailsTab from "./CarDetailsTab";
import PoliciesTab from "./PoliciesTab";
import ReviewsTab from "./ReviewsTab";
import GalleryTab from "./GalleryTab";

const VehicleInfo = ({ vehicle }) => {
  const [selectedTab, setSelectedTab] = useState("car-details");

  const make = vehicle?.manufacture || vehicle?.manufacturer || "—";
  const model = vehicle?.model || "—";
  const year = vehicle?.manufactureYear || vehicle?.manufacture_year || "";
  const title = `${make} ${model}${year ? ` (${year})` : ""}`;

  return (
    <div className="poppins w-full h-auto">
      <h1 className="text-[12px] font-[600] text-[#00000080]">
        {make || "—"}
      </h1>

      <div className="flex flex-col md:flex-row justify-between">
        <div className="flex flex-col md:flex-row gap-5">
          <h1 className="bebas-neue text-[30px]">
            {make} <span className="text-[#0955AC]">{model}</span>{" "}
            {year ? `(${year})` : ""}
          </h1>

          {!!vehicle && (
            <div className="flex flex-row items-center gap-2">
              <div className="w-[10px] h-[10px] rounded-full bg-[#3C9A34]" />
              <h1 className="text-[#3C9A34] text-[10px]">Available</h1>
            </div>
          )}
        </div>


      </div>

      <div className="flex flex-row gap-5 text-[12px] font-[600]">
        <img src={star} alt="rating" />
        <h1>4.8</h1>
        <h1 className="underline">44 Reviews</h1>
      </div>

      <div className="py-10">
        <div className="flex flex-col md:flex-row md:gap-20 px-20 text-[12px] font-[600] text-[#00000080] border-b-[2px] border-[#0000001F]">
          <h1
            className={`border-b-[2px] pb-5 w-[92px] flex justify-center items-center cursor-pointer ${
              selectedTab === "car-details"
                ? "border-[#0955AC] text-[#0955AC]"
                : ""
            }`}
            onClick={() => setSelectedTab("car-details")}
          >
            Car Details
          </h1>
          <h1
            className={`border-b-[2px] pb-5 w-[92px] flex justify-center items-center cursor-pointer ${
              selectedTab === "policies"
                ? "border-[#0955AC] text-[#0955AC]"
                : ""
            }`}
            onClick={() => setSelectedTab("policies")}
          >
            Policies
          </h1>
          <h1
            className={`border-b-[2px] pb-5 w-[92px] flex justify-center items-center cursor-pointer ${
              selectedTab === "reviews"
                ? "border-[#0955AC] text-[#0955AC]"
                : ""
            }`}
            onClick={() => setSelectedTab("reviews")}
          >
            Reviews
          </h1>
          <h1
            className={`border-b-[2px] pb-5 w-[92px] flex justify-center items-center cursor-pointer ${
              selectedTab === "gallery"
                ? "border-[#0955AC] text-[#0955AC]"
                : ""
            }`}
            onClick={() => setSelectedTab("gallery")}
          >
            Image Gallery
          </h1>
        </div>
      </div>

      {selectedTab === "car-details" && <CarDetailsTab vehicle={vehicle} />}
      {selectedTab === "policies" && <PoliciesTab vehicle={vehicle} />}
      {selectedTab === "reviews" && <ReviewsTab vehicle={vehicle} />}
      {selectedTab === "gallery" && <GalleryTab images={vehicle?.images || []} />}
    </div>
  );
};

export default VehicleInfo;
