import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

const mockDestinations = [
  {
    city: "Osaka",
    image: "https://content.skyscnr.com/m/14316548b29a2ab3/original/Osaka.jpg",
    flight: "Direct",
    flightPrice: "Rp 38,369",
    hotel: "4 stars",
    hotelPrice: "Rp 14,981",
  },
  {
    city: "Fukuoka",
    image: "https://content.skyscnr.com/bc42cc80dd1447615ee441e2020cbe2c/GettyImages-126509194.jpg",
    flight: "1+ stops",
    flightPrice: "Rp 59,363",
    hotel: "4 stars",
    hotelPrice: "Rp 18,625",
  },
  {
    city: "Nagasaki",
    image: "https://content.skyscnr.com/2695d9b434ad8e4cd4830cb1fbf09e33/GettyImages-117985752.jpg",
    flight: "1+ stops",
    flightPrice: "Rp 65,671",
    hotel: "4 stars",
    hotelPrice: "Rp 12,957",
  },
];

const AirticketBook = ({ auth }) => {
  const [from, setFrom] = useState("Sendai (SDJ)");
  const [to, setTo] = useState("Japan (JP)");
  const [depart, setDepart] = useState("2025-06-10");
  const [ret, setRet] = useState("2025-06-17");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [classType, setClassType] = useState("Economy");
  const [showTraveler, setShowTraveler] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setShowResults(true);
  };

  const travelerSummary = `${adults + children} ${adults + children === 1 ? 'Traveller' : 'Travellers'}, ${classType}`;

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Book a Ticket" />
      <div className="bg-[#00264d] text-white min-h-screen p-6">
        <h2 className="text-2xl font-semibold mb-6">One simple search.</h2>

        <form onSubmit={handleSearch} className="flex flex-wrap bg-white text-black rounded-lg shadow-lg relative">
          <div className="flex flex-col flex-1 border-r p-4 min-w-[200px]">
            <label className="text-sm text-gray-500 mb-1">From</label>
            <select value={from} onChange={(e) => setFrom(e.target.value)} className="p-2 border rounded">
              <option>Sendai (SDJ)</option>
              <option>Tokyo (HND)</option>
              <option>Osaka (KIX)</option>
            </select>
          </div>

          <div className="flex items-center justify-center px-2">
            <button type="button" onClick={handleSwap} className="bg-gray-100 rounded-full p-2 hover:bg-gray-200">
              <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m0 0L5 6m3-3l3 3m5 11v4m0 0l-3-3m3 3l3-3M5 13h14" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col flex-1 border-r p-4 min-w-[200px]">
            <label className="text-sm text-gray-500 mb-1">To</label>
            <select value={to} onChange={(e) => setTo(e.target.value)} className="p-2 border rounded">
              <option>Japan (JP)</option>
              <option>Thailand (TH)</option>
              <option>South Korea (KR)</option>
            </select>
          </div>

          <div className="flex flex-col flex-1 border-r p-4 min-w-[200px]">
            <label className="text-sm text-gray-500 mb-1">Depart</label>
            <input type="date" value={depart} onChange={(e) => setDepart(e.target.value)} className="p-2 border rounded" />
          </div>

          <div className="flex flex-col flex-1 border-r p-4 min-w-[200px]">
            <label className="text-sm text-gray-500 mb-1">Return</label>
            <input type="date" value={ret} onChange={(e) => setRet(e.target.value)} className="p-2 border rounded" />
          </div>

          <div className="flex flex-col flex-1 p-4 min-w-[200px] relative">
            <label className="text-sm font-semibold text-gray-500 mb-1">Travellers and cabin class</label>
            <button
              type="button"
              onClick={() => setShowTraveler(!showTraveler)}
              className="w-full text-left p-2 border rounded"
            >
              {travelerSummary}
            </button>

            {showTraveler && (
              <div className="absolute top-20 right-0 w-96 bg-white text-black rounded-lg shadow-lg p-4 z-20">
                <p className="text-sm mb-3">
                  To see Business, Premium Economy, and First Class options, please tell us your travel dates and destination.
                </p>
                <div className="flex items-center justify-between my-3">
                  <div>
                    <p className="font-semibold">Adults</p>
                    <p className="text-xs text-gray-500">Aged 18+</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="bg-gray-200 px-3 rounded">−</button>
                    <span>{adults}</span>
                    <button type="button" onClick={() => setAdults(adults + 1)} className="bg-gray-200 px-3 rounded">+</button>
                  </div>
                </div>
                <div className="flex items-center justify-between my-3">
                  <div>
                    <p className="font-semibold">Children</p>
                    <p className="text-xs text-gray-500">Aged 0 to 17</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} className="bg-gray-200 px-3 rounded">−</button>
                    <span>{children}</span>
                    <button type="button" onClick={() => setChildren(children + 1)} className="bg-gray-200 px-3 rounded">+</button>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="font-semibold">Cabin Class</label>
                  <select
                    value={classType}
                    onChange={(e) => setClassType(e.target.value)}
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option>Economy</option>
                    <option>Premium Economy</option>
                    <option>Business</option>
                    <option>First Class</option>
                  </select>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setShowTraveler(false)}
                    className="w-full bg-blue-600 text-white py-2 rounded"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 flex items-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg"
            >
              Search
            </button>
          </div>
        </form>

        {showResults && (
          <div className="mt-10 bg-white text-black p-6 rounded-lg shadow-md">
            <h3 className="text-2xl font-semibold mb-6 border-b pb-2">
              Explore {to.replace(/\(.*\)/, '')} from {new Date(depart).toDateString()} to {new Date(ret).toDateString()}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockDestinations.map((dest, index) => (
                <div
                  key={index}
                  className="bg-white border rounded-lg shadow hover:shadow-xl transition duration-300 overflow-hidden"
                >
                  <img src={dest.image} alt={dest.city} className="h-48 w-full object-cover" />
                  <div className="p-4">
                    <h4 className="text-xl font-bold mb-2 text-gray-800">{dest.city}</h4>
                    <p className="text-sm text-gray-600 mb-1">Flights · {dest.flight}</p>
                    <p className="text-sm text-gray-600 mb-1">Hotels · {dest.hotel}</p>
                    <div className="text-sm font-semibold mt-3">
                      <span className="block text-blue-700">Flights: {dest.flightPrice}</span>
                      <span className="block text-blue-700">Hotels: {dest.hotelPrice}</span>
                    </div>
                    <Link
                      href="/user/airticket-view"
                      className="mt-4 inline-block bg-blue-600 text-white text-center px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default AirticketBook;
