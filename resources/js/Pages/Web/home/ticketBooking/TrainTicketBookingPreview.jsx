import React from "react";
import { Link } from "@inertiajs/react";

const TrainTicketBookingPreview = () => {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 md:px-6 lg:px-8 py-6">
      {/* Back */}
      <div className="mb-4">
        <Link
          href="/trainTicketBookingDetails"
          className="inline-flex items-center gap-2 text-[#0955AC] text-base font-semibold"
        >
          <span className="inline-block rounded-full border border-[#0955AC]/20 p-1 leading-none">←</span>
          Back
        </Link>
      </div>

      {/* Title */}
      <h1 className="text-center text-4xl md:text-5xl font-extrabold tracking-wide text-[#0955AC]">
        PASSENGER INFORMATION
      </h1>

      {/* Top two-column: Trip details (left) & Fare summary (right) */}
      <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Itineraries */}
        <div className="space-y-4">
          {/* Segment 1 */}
          <div className="rounded-[10px] border border-gray-200 overflow-hidden">
            <div className="bg-[#0955AC] px-4 py-3 flex items-center gap-2 font-semibold text-[#FFFFFF]">
              <span className="text-xl">🚌</span>
              Colombo Fort to Kandy - Sep 3, 2025
            </div>
            <div className="px-4 py-3 text-base leading-6 text-gray-800">
              <div>Depart: <span className="font-semibold">15:35</span> <span className="mx-1">➜</span> Arrival: <span className="font-semibold">18:08</span></div>
              <div>Class: <span className="font-semibold">2nd Class - Reserved Seats</span></div>
              <div>Train Number: <span className="font-semibold">No.1029</span>, Intercity Express</div>
              <div>Total Duration: <span className="font-semibold">2h33m</span>, Non-stop</div>
              <div className="italic text-gray-600">Hand baggage: 20kg/passenger</div>
            </div>
          </div>

          {/* Segment 2 */}
          <div className="rounded-[10px] border border-gray-200 overflow-hidden">
            <div className="bg-[#0955AC] px-4 py-3 flex items-center gap-2 font-semibold text-[#FFFFFF]">
              <span className="text-xl">🚌</span>
              Kandy to Colombo Fort - Sep 3, 2025
            </div>
            <div className="px-4 py-3 text-base leading-6 text-gray-800">
              <div>Depart: <span className="font-semibold">15:00</span> <span className="mx-1">➜</span> Arrival: <span className="font-semibold">17:36</span></div>
              <div>Class: <span className="font-semibold">2nd Class - Reserved Seats</span></div>
              <div>Train Number: <span className="font-semibold">No.1010</span>, Intercity Express</div>
              <div>Total Duration: <span className="font-semibold">2h36m</span>, Non-stop</div>
              <div className="italic text-gray-600">Hand baggage: 20kg/passenger</div>
            </div>
          </div>
        </div>

        {/* Right: Fare summary */}
        <aside className="rounded-[10px] border border-gray-200 overflow-hidden">
          <div className="bg-[#0955AC] px-4 py-3 font-semibold text-[#FFFFFF] text-xl">
            Total Fare
          </div>
          <div className="px-4 py-4 text-base leading-6 text-gray-800">
            <div>Base Fare: (24 + 24) * 1 Adult = USD 48</div>
            <div>Taxes and Station fees / 1pax: USD 12</div>
            <div>Passenger Service fee / 1pax: USD 4</div>
            <div>Baggage fee: USD 0</div>
            <hr className="my-3 border-gray-200" />
            <div className="text-lg font-bold">Total: <span className="text-gray-900">USD 64</span></div>
          </div>
        </aside>
      </div>

      {/* Notice banner */}
      <div className="mt-6 rounded-[10px] border border-[#0955AC] bg-[#0955AC]/5 px-4 py-3 text-center text-[#0955AC] font-semibold text-lg">
        Your chosen train is waiting! Enter your details to proceed.
      </div>

      {/* Passenger card */}
      <div className="mt-6 rounded-[10px] border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-[#0955AC] border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#FFFFFF]">Passenger 1 - Adult</h2>
        </div>

        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full name */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Full name"
                className="w-full rounded-md border border-[#0955AC]/40 focus:border-[#0955AC] focus:ring-[#0955AC] px-4 py-3"
              />
            </div>

            {/* Passport number */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                Passport number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Passport number"
                className="w-full rounded-md border border-[#0955AC]/40 focus:border-[#0955AC] focus:ring-[#0955AC] px-4 py-3"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gender */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">Gender</label>
              <div className="flex items-center gap-6">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="gender" className="h-4 w-4 text-[#0955AC] focus:ring-[#0955AC]" defaultChecked />
                  <span>Male</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="gender" className="h-4 w-4 text-[#0955AC] focus:ring-[#0955AC]" />
                  <span>Female</span>
                </label>
              </div>
            </div>

            {/* Nationality */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                Nationality <span className="text-red-500">*</span>
              </label>
              <select className="w-full rounded-md border border-[#0955AC]/40 focus:border-[#0955AC] focus:ring-[#0955AC] px-4 py-3">
                <option>Afghanistan</option>
                <option>Sri Lanka</option>
                <option>India</option>
                <option>United States</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="mt-6 flex justify-end gap-3">
        <button className="rounded-md border border-gray-300 px-5 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button className="rounded-md bg-[#0955AC] hover:bg-[#074489] px-5 py-3 text-base font-bold text-white">
          Continue
        </button>
      </div>
    </section>
  );
};

export default TrainTicketBookingPreview;