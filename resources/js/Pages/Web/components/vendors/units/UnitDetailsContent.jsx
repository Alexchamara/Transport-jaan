import React from "react";
import { usePage } from "@inertiajs/react";

import VehicleImages from "../../../components/vendors/units/VehicleImages";
import VehicleInfo from "../../../components/vendors/units/VehicleInfo";

// top bar icons
import search from "../../../assets/vendors/dashboard/searchIcon.svg";
import settings from "../../../assets/vendors/dashboard/settings.svg";
import bell from "../../../assets/vendors/dashboard/bell.svg";
import proPic from "../../../assets/vendors/dashboard/proPic.svg";

// back
import backArrow from "../../../assets/vendors/units/backArrow.svg";

const UnitDetailsContent = ({ vehicle }) => {
  const { auth } = usePage().props;
  const user = auth?.user;

  const images = Array.isArray(vehicle?.images)
    ? vehicle.images.filter(
        (u) =>
          typeof u === "string" &&
          u.trim() !== "" &&
          !/placeholder|dummy|sample|car1\.svg/i.test(u)
      )
    : [];

  const title =
    (vehicle?.manufacture ? `${vehicle.manufacture} ` : "") +
    (vehicle?.model ?? "");

  return (
    <div className="w-full h-auto pr-5 py-10">
      {/* Header */}
      <div className="flex flex-row gap-5 justify-between items-center">
        <h1 className="figtree text-[35px] font-[700]">Units</h1>
        <div className="flex flex-row gap-5">
          <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={search} alt="Search" />
          </div>
          <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={settings} alt="Settings" />
          </div>
          <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={bell} alt="Notifications" />
          </div>
          <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={proPic} alt="Profile" />
          </div>
          <div className="figtree flex flex-col justify-center items-start">
            <h1 className="text-[20px] font-[700]">{user?.name || 'Vendor'}</h1>
            <h1 className="text-[16px] font-[600] text-[#7B7B7A]">Vendor</h1>
          </div>
        </div>
      </div>

      {/* Back breadcrumb */}
      <div>
        <div
          className="flex flex-row gap-5 items-center cursor-pointer"
          onClick={() => window.history.back()}
        >
          <img src={backArrow} alt="Back" />
          <h1 className="text-[22px] font-[500] text-[#00000080]">
            Units / Unit Details
          </h1>
        </div>

        {title && (
          <div className="mt-2 text-[18px] font-[600] text-[#111827]">
            {title}
          </div>
        )}

        {/* Content */}
        <div className="py-10 md:px-10 flex flex-col xl:flex-row justify-center gap-10">
          <div className="w-full max-w-6xl bg-white rounded-[10px] p-6 sm:p-8">
            {/* Images */}
            <div className="w-full rounded-xl border border-[#E5E7EB] overflow-hidden">
              <VehicleImages images={images} />
            </div>

            {/* Tabs (VehicleInfo should render CarDetailsTab and read vehicle.description) */}
            <div className="w-full mt-8 rounded-xl border border-[#E5E7EB] p-4 sm:p-6">
              <VehicleInfo vehicle={vehicle} />
            </div>
          </div>
        </div>
        {/* /Content */}
      </div>
    </div>
  );
};

export default UnitDetailsContent;
