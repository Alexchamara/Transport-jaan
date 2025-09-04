import React, { useEffect, useMemo, useState } from "react";

import search from "../../../assets/vendors/dashboard/searchIcon.svg";
import settings from "../../../assets/vendors/dashboard/settings.svg";
import bell from "../../../assets/vendors/dashboard/bell.svg";
import proPic from "../../../assets/vendors/dashboard/proPic.svg";

import upArrow from "../../../assets/vendors/dashboard/icons/upArrow.svg";

import icon1 from "../../../assets/vendors/booking/icons/icon1.svg";
import icon2 from "../../../assets/vendors/booking/icons/icon2.svg";
import icon3 from "../../../assets/vendors/booking/icons/icon3.svg";
import icon4 from "../../../assets/vendors/booking/icons/icon4.svg";

import filterIcon from "../../../assets/vendors/dashboard/icons/filterIcon.svg";
import miniSearchIcon from "../../../assets/vendors/dashboard/icons/miniSearchIcon.svg";
import miniDownArrow from "../../../assets/vendors/dashboard/icons/miniDownArrow.svg";

import CarBookingTableTwo from "../../../components/vendors/bookings/CarBookingTableTwo";
import BookingBarChart from "./BookingBarChart";

/** ---- color lookups (kept outside so they don't reallocate) ---- */
const paymentStatusColors = {
  Paid: { color: "#3B8F31", bg: "#ACE199" },
  Pending: { color: "#FF6060", bg: "#FF60608C" },
};
const statusColors = {
  Ongoing: { bg: "#FFCD29", text: "#000000" },
  Returned: { bg: "#3B8F31", text: "#FFCD29" },
  Cancelled: { bg: "#FF6060", text: "#FFFFFF" },
};

/** decorate a raw booking with the derived color fields your table expects */
const decorateBooking = (b) => ({
  ...b,
  paymentStatusColor: paymentStatusColors[b.paymentStatus]?.color ?? "#7B7B7A",
  paymentStatusBg: paymentStatusColors[b.paymentStatus]?.bg ?? "#E8E8EF",
  statusBg: statusColors[b.status]?.bg ?? "#FFCD29",
  statusText: statusColors[b.status]?.text ?? "#000000",
});

const BookingContent = ({ initialBookings = [], useApi = false }) => {
  const [bookings, setBookings] = useState(() =>
    (initialBookings || []).map(decorateBooking)
  );

  // OPTIONAL: load from API instead of props. Set useApi={true}
  useEffect(() => {
    if (!useApi) return;
    (async () => {
      try {
        const res = await fetch("/api/vendor/bookings");
        const rows = await res.json();
        setBookings(rows.map(decorateBooking));
      } catch (e) {
        console.error("Failed to load bookings", e);
      }
    })();
  }, [useApi]);

  // if props change at runtime, keep in sync
  useEffect(() => {
    if (useApi) return; // API mode controls state
    setBookings((initialBookings || []).map(decorateBooking));
  }, [initialBookings, useApi]);

  const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
  const [newBooking, setNewBooking] = useState({
    id: "",
    bookingDate: "",
    clientName: "",
    carModel: "",
    carPlate: "",
    plan: "",
    startDate: "",
    endDate: "",
    payment: "",
    paymentStatus: "Pending",
    status: "Ongoing",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBooking((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddBooking = () => {
    setBookings((prev) => [...prev, decorateBooking(newBooking)]);
    setIsAddPopupOpen(false);
    setNewBooking({
      id: "",
      bookingDate: "",
      clientName: "",
      carModel: "",
      carPlate: "",
      plan: "",
      startDate: "",
      endDate: "",
      payment: "",
      paymentStatus: "Pending",
      status: "Ongoing",
    });
  };

  /** --------- KPIs derived from data instead of hard-coded --------- */
  const kpis = useMemo(() => {
    const today = new Date();
    const parse = (s) => (s ? new Date(s) : null);

    const upcoming = bookings.filter((b) => {
      const sd = parse(b.startDate);
      return sd && sd > today && b.status !== "Cancelled";
    }).length;

    const pending = bookings.filter((b) => b.paymentStatus === "Pending").length;
    const cancelled = bookings.filter((b) => b.status === "Cancelled").length;
    const completed = bookings.filter((b) => b.status === "Returned").length;

    return { upcoming, pending, cancelled, completed };
  }, [bookings]);

  return (
    <div className="w-full h-auto pr-5 py-10">
      {/* Header */}
      <div className="flex flex-row gap-5 justify-between items-center">
        <h1 className="figtree text-[35px] font-[700]">Bookings</h1>
        <div className="flex flex-row gap-5">
          <div className="size-[60px] rounded-[10px] bg-[#E8E8EF] flex justify-center items-center">
            <img src={search} alt="Search" />
          </div>
          <div className="size-[60px] rounded-[10px] bg-[#E8E8EF] flex justify-center items-center">
            <img src={settings} alt="Settings" />
          </div>
          <div className="size-[60px] rounded-[10px] bg-[#E8E8EF] flex justify-center items-center">
            <img src={bell} alt="Notifications" />
          </div>
          <div className="size-[60px] rounded-[10px] bg-[#E8E8EF] flex justify-center items-center">
            <img src={proPic} alt="Profile" />
          </div>

          <div className="figtree flex flex-col justify-center items-start">
            <h1 className="text-[20px] font-[700]">Steve Gibson</h1>
            <h1 className="text-[16px] font-[600] text-[#7B7B7A]">Vendor</h1>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="flex flex-row gap-10 justify-between py-20 w-full">
        {/* left cards */}
        <div className="flex flex-col gap-8 w-full">
          {/* Upcoming */}
          <div className="w-full h-auto bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2" style={{ boxShadow: "4px 4px 4px #0000001A" }}>
            <div className="flex flex-row gap-5 justify-center items-center">
              <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                <img src={icon1} alt="Upcoming Bookings" />
              </div>
              <div>
                <h1 className="text-[16px] font-[500] text-[#7B7B7A] text-nowrap">Upcoming Bookings</h1>
                <h1 className="text-[26px] font-[700]">{kpis.upcoming}</h1>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
              <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                <img src={upArrow} className="size-[19px]" alt="Increase" />
                <h1>+2.86%</h1>
              </div>
              <h1 className="text-[#7B7B7A]">from last week</h1>
            </div>
          </div>

          {/* Pending */}
          <div className="w-full min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2" style={{ boxShadow: "4px 4px 4px #0000001A" }}>
            <div className="flex flex-row gap-5 justify-center items-center">
              <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                <img src={icon2} alt="Pending Bookings" />
              </div>
              <div>
                <h1 className="text-[16px] font-[500] text-[#7B7B7A] text-nowrap">Pending Bookings</h1>
                <h1 className="text-[26px] font-[700]">{kpis.pending}</h1>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
              <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                <img src={upArrow} className="size-[19px]" alt="Increase" />
                <h1>+2.86%</h1>
              </div>
              <h1 className="text-[#7B7B7A]">from last week</h1>
            </div>
          </div>

          {/* Cancelled */}
          <div className="w-full min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2" style={{ boxShadow: "4px 4px 4px #0000001A" }}>
            <div className="flex flex-row gap-5 justify-center items-center">
              <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                <img src={icon3} alt="Cancelled Bookings" />
              </div>
              <div>
                <h1 className="text-[16px] font-[500] text-[#7B7B7A] text-nowrap">Cancelled Bookings</h1>
                <h1 className="text-[26px] font-[700]">{kpis.cancelled}</h1>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
              <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                <img src={upArrow} className="size-[19px]" alt="Increase" />
                <h1>+2.86%</h1>
              </div>
              <h1 className="text-[#7B7B7A]">from last week</h1>
            </div>
          </div>

          {/* Completed */}
          <div className="w-full min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2" style={{ boxShadow: "4px 4px 4px #0000001A" }}>
            <div className="flex flex-row gap-5 justify-center items-center">
              <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                <img src={icon4} alt="Completed Bookings" />
              </div>
              <div>
                <h1 className="text-[16px] font-[500] text-[#7B7B7A] text-nowrap">Completed Bookings</h1>
                <h1 className="text-[26px] font-[700]">{kpis.completed}</h1>
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
              <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                <img src={upArrow} className="size-[19px]" alt="Increase" />
                <h1>+2.86%</h1>
              </div>
              <h1 className="text-[#7B7B7A]">from last week</h1>
            </div>
          </div>
        </div>

        {/* right chart */}
        <div className="min-w-[712px] w-full min-h-[437px] bg-[#FFFFFF] rounded-[10px] flex items-center justify-center" style={{ boxShadow: "4px 4px 4px #0000001A" }}>
          <BookingBarChart />
        </div>
      </div>

      {/* table box */}
      <div className="w-full h-auto bg-[#FFFFFF] rounded-[10px] py-10 px-10" style={{ boxShadow: "4px 4px 4px #0000001A" }}>
        <div className="flex flex-row justify-between">
          <h1 className="text-[24px] font-[700]">Car Booking</h1>
          <div className="flex flex-row gap-5">
            <div className="w-[253px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row justify-center items-center py-2 px-5">
              <img src={miniSearchIcon} alt="Search" />
              <input
                type="text"
                className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC]"
                placeholder="Search client name, car, etc."
                // hook up later to filter if you want
              />
            </div>
            <div className="w-[139px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
              <img src={filterIcon} className="size-[12px]" alt="Filter" />
              <h1 className="text-[14px] font-[500] text-[#7B7B7ACC]">Car type</h1>
              <img src={miniDownArrow} alt="Dropdown" />
            </div>
            <div className="w-[125px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
              <img src={filterIcon} className="size-[12px]" alt="Filter" />
              <h1 className="text-[14px] font-[500] text-[#7B7B7ACC]">Status</h1>
              <img src={miniDownArrow} alt="Dropdown" />
            </div>
            <button
              className="w-[125px] h-[35px] bg-[#0955AC] text-[14px] rounded-[6px] text-[#FFFFFF] font-[700]"
              onClick={() => setIsAddPopupOpen(true)}
            >
              Add Booking
            </button>
          </div>
        </div>

        {/* Add Booking Popup */}
        {isAddPopupOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 poppins">
            <div className="bg-white p-10 rounded-[10px] w-[600px] shadow-lg">
              <h2 className="text-[18px] font-[700] mb-4">Add New Booking</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["id", "Booking ID", "e.g. C-JV1001", "text"],
                  ["bookingDate", "Booking Date", "YYYY-MM-DD", "date"],
                  ["clientName", "Client Name", "e.g. Steve Gibson", "text"],
                  ["carModel", "Car Model", "e.g. Honda Civic", "text"],
                  ["carPlate", "Car Plate", "e.g. CBK - 1475", "text"],
                  ["plan", "Plan", "e.g. 7 days", "text"],
                  ["startDate", "Start Date", "YYYY-MM-DD", "date"],
                  ["endDate", "End Date", "YYYY-MM-DD", "date"],
                  ["payment", "Payment Amount", "e.g. 450", "number"],
                ].map(([name, label, placeholder, type]) => (
                  <div className="mb-4" key={name}>
                    <label className="block text-[14px] font-[500] mb-1">{label}</label>
                    <input
                      type={type}
                      name={name}
                      value={newBooking[name]}
                      onChange={handleInputChange}
                      className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                      placeholder={placeholder}
                    />
                  </div>
                ))}
                <div className="mb-4">
                  <label className="block text-[14px] font-[500] mb-1">Payment Status</label>
                  <select
                    name="paymentStatus"
                    value={newBooking.paymentStatus}
                    onChange={handleInputChange}
                    className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-[14px] font-[500] mb-1">Status</label>
                  <select
                    name="status"
                    value={newBooking.status}
                    onChange={handleInputChange}
                    className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Returned">Returned</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsAddPopupOpen(false)} className="px-4 py-2 bg-gray-200 rounded-[5px] text-[14px] font-[700]">
                  Cancel
                </button>
                <button onClick={handleAddBooking} className="px-4 py-2 bg-[#0955AC] text-white rounded-[5px] text-[14px] font-[700]">
                  Add Booking
                </button>
              </div>
            </div>
          </div>
        )}

        <CarBookingTableTwo bookings={bookings} setBookings={setBookings} statusColors={statusColors} />
      </div>
    </div>
  );
};

export default BookingContent;
