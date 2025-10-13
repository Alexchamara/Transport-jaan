import React from "react";
import bell from "../../../assets/vendors/dashboard/bell.svg";
import proPic from "../../../assets/vendors/dashboard/proPic.svg";

import dollarIcon from "../../../assets/vendors/dashboard/icons/dollarIcon.svg";
import carIcon from "../../../assets/vendors/dashboard/icons/carIcon.svg";
import bookingIcon from "../../../assets/vendors/dashboard/icons/bookingIcon.svg";
import wheelIcon from "../../../assets/vendors/dashboard/icons/wheelIcon.svg";
import upArrow from "../../../assets/vendors/dashboard/icons/upArrow.svg";
import miniDownArrow from "../../../assets/vendors/dashboard/icons/miniDownArrow.svg";
import BookingOverviewBarChart from "./BookingOverviewBarChart";
import EarningSummaryChart from "./EarningSummaryChart";
import RealStatusPieChart from "./RealStatusPieChart";
import CarBookingTable from "./CarBookingTable";
import RecentActivities from "./RecentActivities";

import car from "../../../assets/vendors/dashboard/icons/car.svg";
import date from "../../../assets/vendors/dashboard/icons/date.svg";
import clock from "../../../assets/vendors/dashboard/icons/clock.svg";

import filterIcon from "../../../assets/vendors/dashboard/icons/filterIcon.svg";
import miniSearchIcon from "../../../assets/vendors/dashboard/icons/miniSearchIcon.svg";

import car1 from "../../../assets/vendors/dashboard/icons/car1.svg";
import car3 from "../../../assets/vendors/dashboard/icons/car3.svg";

const DashContent = ({
  cards,
  bookingOverview,
  earningSummary,
  realStatus,
  carTypes,
  bookings,
  bookingsMeta,
  filters,
  vendorUser,
  recentActivities, // <— NEW (from controller)
}) => {
  const computedCarTypes = (carTypes ?? []).map((t) => ({
    name: t.name ?? "Unknown",
    percent: Number(t.percent ?? 0),
    img: (t.name || "").toLowerCase().includes("suv") ? car3 : car1,
  }));

  const fmtMoney = (n) =>
    typeof n === "number"
      ? n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 })
      : n;

  return (
    <div className="w-full h-auto pr-5 py-10">
      {/* Header */}
      <div className="flex xl:flex-row flex-col gap-5 justify-between items-center">
        <h1 className="figtree text-[35px] font-[700]">Dashboard</h1>
        <div className="flex flex-row gap-5">
          <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={bell} />
          </div>
          <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={proPic} />
          </div>

          <div className="figtree flex flex-col justify-center items-start">
            <h1 className="text-[20px] font-[700]">{vendorUser?.name ?? "Vendor"}</h1>
            <h1 className="text-[16px] font-[600] text-[#7B7B7A]">
              {vendorUser?.role ?? "Vendor"}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 py-10">
        <div className="flex flex-col xl:flex-row gap-5">
          {/* Left */}
          <div className="flex flex-col gap-5 w-full">
            {/* Cards */}
            <div className="flex flex-col gap-5">
              <div className="flex xl:flex-row flex-col gap-5 justify-between w-full">
                {/* Total Revenue */}
                <div className="min-w-[360px] w-full min-h-[91px] bg-white rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                     style={{ boxShadow: "4px 4px 4px #0000001A" }}>
                  <div className="flex flex-row gap-5 items-center">
                    <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                      <img src={dollarIcon} />
                    </div>
                    <div>
                      <h1 className="text-[16px] font-[500] text-[#7B7B7A]">Total Revenue</h1>
                      <h1 className="text-[26px] font-[700]">{fmtMoney(cards?.totalRevenue ?? 0)}</h1>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                    <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                      <img src={upArrow} className="size-[19px]" />
                      <h1>—</h1>
                    </div>
                    <h1 className="text-[#7B7B7A]">from last period</h1>
                  </div>
                </div>

                {/* New Bookings */}
                <div className="min-w-[360px] w-full min-h-[91px] bg-white rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                     style={{ boxShadow: "4px 4px 4px #0000001A" }}>
                  <div className="flex flex-row gap-5 items-center">
                    <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                      <img src={bookingIcon} />
                    </div>
                    <div>
                      <h1 className="text-[16px] font-[500] text-[#7B7B7A]">New Bookings</h1>
                      <h1 className="text-[26px] font-[700]">{cards?.newBookings ?? 0}</h1>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                    <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                      <img src={upArrow} className="size-[19px]" />
                      <h1>—</h1>
                    </div>
                    <h1 className="text-[#7B7B7A]">from last week</h1>
                  </div>
                </div>
              </div>

              <div className="flex xl:flex-row flex-col gap-5 w-full">
                {/* Rented Cars */}
                <div className="min-w-[360px] w-full min-h-[91px] bg-white rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                     style={{ boxShadow: "4px 4px 4px #0000001A" }}>
                  <div className="flex flex-row gap-5 items-center">
                    <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                      <img src={wheelIcon} />
                    </div>
                    <div>
                      <h1 className="text-[16px] font-[500] text-[#7B7B7A]">Rented Cars</h1>
                      <h1 className="text-[26px] font-[700]">{cards?.rentedCars ?? 0} Units</h1>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                    <div className="w-[81px] h-[26px] bg-[#FF888880] rounded-[5px] flex flex-row justify-center items-center">
                      <img src={upArrow} className="size-[19px] rotate-180" />
                      <h1>—</h1>
                    </div>
                    <h1 className="text-[#7B7B7A]">from last week</h1>
                  </div>
                </div>

                {/* Total Cars */}
                <div className="min-w-[360px] min-h-[91px] w-full bg-white rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                     style={{ boxShadow: "4px 4px 4px #0000001A" }}>
                  <div className="flex flex-row gap-5 items-center">
                    <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                      <img src={carIcon} />
                    </div>
                    <div>
                      <h1 className="text-[16px] font-[500] text-[#7B7B7A]">Total Cars</h1>
                      <h1 className="text-[26px] font-[700]">{cards?.totalCars ?? 0} Units</h1>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                    <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                      <img src={upArrow} className="size-[19px]" />
                      <h1>—</h1>
                    </div>
                    <h1 className="text-[#7B7B7A]">from last week</h1>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Overview */}
            <div className="min-w-[742px] h-auto bg-white flex flex-col justify-center items-center rounded-[10px] py-10 px-10"
                 style={{ boxShadow: "4px 4px 4px #0000001A" }}>
              <div className="flex flex-row items-center justify-between mb-16 w-full">
                <h1 className="text-[24px] font-[700]">Booking Overview</h1>
                <div className="w-[113px] h-[33px] bg-[#D9D9D94F] rounded-[6px] flex flex-row justify-center items-center gap-3">
                  <h1 className="text-[#00000080] font-[600] text-[14px]">
                    {filters?.bo_period === "month" ? "This Month" : "This Year"}
                  </h1>
                  <img src={miniDownArrow} />
                </div>
              </div>
              <BookingOverviewBarChart data={bookingOverview ?? []} />
            </div>

            {/* Earning Summary */}
            <div className="min-w-[742px] min-h-[381px] bg-white rounded-[10px] py-10 px-10"
                 style={{ boxShadow: "4px 4px 4px #0000001A" }}>
              <div className="flex flex-row items-center justify-between mb-12 w-full">
                <h1 className="text-[24px] font-[700]">Earning Summary</h1>
                <div className="w-[132px] h-[33px] bg-[#D9D9D94F] rounded-[6px] flex flex-row justify-center items-center gap-3">
                  <h1 className="text-[#00000080] font-[600] text-[14px]">
                    {filters?.es_period === "month" ? "This Month" : "This Year"}
                  </h1>
                  <img src={miniDownArrow} />
                </div>
              </div>
              <EarningSummaryChart data={earningSummary ?? []} />
            </div>
          </div>

          {/* Right */}
          <div className="flex flex-col items-center gap-5 w-full">
            {/* Car Availability */}
            <div className="min-w-[349px] w-full min-h-[206px] bg-[#D8E4F2] flex flex-col px-10 py-5 justify-center items-center rounded-[10px]"
                 style={{ boxShadow: "4px 4px 4px #0000001A" }}>
              <h1 className="text-[24px] font-[700] mb-3">Car Availability</h1>
              <div className="flex flex-col gap-3 w-full items-center">
                <div className="w-[283px] h-[35px] flex flex-row items-center gap-2 rounded-[6px] px-3 py-2 bg-white">
                  <img src={car} className="size-[20px]" />
                  <input className="w-full outline-none bg-transparent border-0 focus:ring-0" placeholder="Car Type" />
                  <img src={miniDownArrow} />
                </div>

                <div className="flex flex-row gap-3">
                  <div className="w-[137px] h-[35px] bg-white rounded-[6px] flex flex-row items-center gap-2 py-2 px-3">
                    <img src={date} className="size-[20px]" />
                    <input className="w-full outline-none bg-transparent border-0 focus:ring-0" placeholder="Start date" />
                  </div>
                  <div className="w-[137px] h-[35px] bg-white rounded-[6px] flex flex-row items-center gap-2 py-2 px-3">
                    <img src={clock} className="size-[16px]" />
                    <input className="w-full outline-none bg-transparent border-0 focus:ring-0" placeholder="Start time" />
                  </div>
                </div>

                <button className="w-[283px] h-[40px] bg-[#0955AC] rounded-[6px] text-[16px] font-[700] text-white border-0 focus:ring-0">
                  Check Availability
                </button>
              </div>
            </div>

            {/* Real Status */}
            <div className="min-w-[349px] w-full min-h-[427px] bg-white rounded-[10px] py-5 px-10"
                 style={{ boxShadow: "4px 4px 4px #0000001A" }}>
              <div className="flex flex-row items-center justify-between w-full">
                <h1 className="text-[24px] font-[700]">Real Status</h1>
                <div className="w-[113px] h-[33px] bg-[#D9D9D94F] rounded-[6px] flex flex-row justify-center items-center gap-3">
                  <h1 className="text-[#00000080] font-[600] text-[14px]">
                    {filters?.rs_period === "month" ? "This Month" : "This Week"}
                  </h1>
                  <img src={miniDownArrow} />
                </div>
              </div>
              <RealStatusPieChart data={realStatus ?? []} />
            </div>

            {/* Reminders */}
            <div className="min-w-[349px] w-full min-h-[335px] bg-white rounded-[10px] py-5 px-10"
                 style={{ boxShadow: "4px 4px 4px #0000001A" }}>
              <div className="flex flex-row items-center justify-between w-full">
                <h1 className="text-[24px] font-[700]">Reminders</h1>
                <button className="w-[39px] h-[33px] bg-[#D9D9D94F] rounded-[6px] flex justify-center items-center text-[#00000080] font-[600] text-[30px] border-0 focus:ring-0">
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings table */}
        <div className="w-full h-auto bg-white rounded-[10px] py-10 px-10"
             style={{ boxShadow: "4px 4px 4px #0000001A" }}>
          <div className="flex flex-row justify-between">
            <h1 className="text-[24px] font-[700]">Car Booking</h1>
            <div className="flex flex-row gap-5">
              <div className="w-[253px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center py-2 px-5">
                <img src={miniSearchIcon} />
                <input
                  type="text"
                  className="w-full outline-none bg-transparent placeholder:text-[#7B7B7ACC] border-0 focus:ring-0"
                  placeholder="Search client name, car, etc."
                />
              </div>
              <button className="w-[125px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5 border-0 focus:ring-0">
                <img src={filterIcon} className="size-[12px]" />
                <span className="text-[14px] font-[500] text-[#7B7B7ACC]">Filter</span>
                <img src={miniDownArrow} />
              </button>
            </div>
          </div>

          <CarBookingTable rows={bookings ?? []} />
        </div>

        {/* Car types + Recent activities */}
        <div className="flex flex-col xl:flex-row gap-5 justify-between">
          <div className="min-w-[500px] w-full min-h-[858px] bg-white rounded-[10px] px-10 py-10"
               style={{ boxShadow: "4px 4px 4px #0000001A" }}>
            <div className="flex flex-row justify-between items-center">
              <h1 className="text-[24px] font-[700]">Car types</h1>
              <h1 className="text-[24px] font-[700]">...</h1>
            </div>

            <div className="mt-10 flex flex-col gap-5">
              {computedCarTypes.map((type, idx) => (
                <div key={`${type.name}-${idx}`} className="w-full h-[107px] border border-[#00000080] rounded-[9px] flex flex-row">
                  <img src={type.img} className="h-[107px] w-[172px]" />
                  <div className="flex flex-col justify-center gap-3 w-full px-5">
                    <div className="flex flex-row justify-between items-center text-[15px] font-[500]">
                      <h1 className="text-[#00000080]">{type.name}</h1>
                      <h1 className="pr-5">{type.percent}%</h1>
                    </div>
                    <div className="w-full h-[20px] rounded-[4px] bg-[#D8E4F2] relative overflow-hidden">
                      <div className="h-full rounded-[4px] absolute top-0 left-0"
                           style={{ width: `${type.percent}%`, backgroundColor: type.percent <= 20 ? "#F51D1D" : "#0955AC", transition: "width 0.5s" }} />
                    </div>
                  </div>
                </div>
              ))}
              {computedCarTypes.length === 0 && (
                <div className="text-sm text-gray-500">No car type data yet.</div>
              )}
            </div>
          </div>

          {/* Recent Activities from DB */}
          <RecentActivities activities={recentActivities} />
        </div>
      </div>
    </div>
  );
};

export default DashContent;
