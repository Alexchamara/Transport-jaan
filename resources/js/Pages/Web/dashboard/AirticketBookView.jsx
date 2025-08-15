import React from 'react';
import { createRoot } from 'react-dom/client';

// Flight Result Card
const ResultCard = ({ airline, depart, arrive, duration, price }) => (
  <div className="bg-white p-4 border rounded-lg shadow-sm hover:shadow-md transition duration-300">
    <div className="flex justify-between items-center">
      <div>
        <p className="text-base font-bold text-gray-800">{airline}</p>
        <p className="text-sm text-gray-600">{depart} → {arrive}</p>
        <p className="text-xs text-gray-500">Duration: {duration}</p>
      </div>
      <div className="text-right">
        <p className="text-xl font-semibold text-blue-600">{price}</p>
        <button className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition">
          Select
        </button>
      </div>
    </div>
  </div>
);

// Hotel Card
const HotelCard = ({ name, rating, price, image }) => (
  <div className="flex border p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition duration-300">
    <img src={image} alt={name} className="w-28 h-28 object-cover rounded mr-4" />
    <div className="flex-1">
      <h4 className="text-lg font-semibold text-gray-800">{name}</h4>
      <p className="text-sm text-gray-600 mt-1">Rating: {rating}</p>
    </div>
    <div className="text-right">
      <p className="text-xl font-semibold text-blue-600">{price}</p>
      <button className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition">
        View
      </button>
    </div>
  </div>
);

// Car Card
const CarCard = ({ type, capacity, doors, price }) => (
  <div className="flex justify-between items-center border p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition duration-300">
    <div>
      <p className="text-lg font-semibold text-gray-800">{type}</p>
      <p className="text-sm text-gray-600">{capacity} seats · {doors} doors</p>
    </div>
    <div className="text-right">
      <p className="text-xl font-semibold text-blue-600">{price}</p>
      <button className="mt-2 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition">
        View
      </button>
    </div>
  </div>
);

// Main Page
const AirTicketResultsPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <header className="bg-[#00264d] text-white py-5 px-6 shadow-md">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-semibold">Flight Results</h1>
          <p className="text-sm mt-1 opacity-90">
            Sendai (SDJ) → Fukuoka (Any) · 1 Adult · Economy
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-lg shadow">
              <h3 className="font-semibold text-gray-800 mb-3">Stops</h3>
              <label className="block mb-1 text-sm"><input type="checkbox" className="mr-2" />Direct</label>
              <label className="block text-sm"><input type="checkbox" className="mr-2" />1 stop</label>
            </div>

            <div className="bg-white p-5 rounded-lg shadow">
              <h3 className="font-semibold text-gray-800 mb-3">Airlines</h3>
              <label className="block mb-1 text-sm"><input type="checkbox" className="mr-2" />JEX</label>
              <label className="block text-sm"><input type="checkbox" className="mr-2" />ANA</label>
            </div>
          </aside>

          {/* Main Results */}
          <section className="col-span-3 space-y-8">
            <div className="space-y-5">
              {[...Array(5)].map((_, i) => (
                <ResultCard
                  key={i}
                  airline="JEX"
                  depart="07:35"
                  arrive="09:45"
                  duration="2h 10m"
                  price="Rp 119,328"
                />
              ))}
            </div>

            {/* Hotel Deals */}
            <div className="pt-12 border-t mt-10">
              <h3 className="text-2xl font-bold mb-6">Fukuoka Hotel Deals</h3>
              <div className="space-y-5">
                <HotelCard
                  name="Quintessa Hotel Fukuoka"
                  rating="4.3 Very good"
                  price="Rp 21,474"
                  image="https://cf.bstatic.com/xdata/images/hotel/max1280x900/292392473.jpg"
                />
                <HotelCard
                  name="Mitsui Garden Hotel"
                  rating="4.6 Excellent"
                  price="Rp 35,126"
                  image="https://cf.bstatic.com/xdata/images/hotel/max1280x900/234209051.jpg"
                />
              </div>
            </div>

            {/* Car Hire */}
            <div className="pt-12 border-t mt-10">
              <h3 className="text-2xl font-bold mb-6">Car Hire in Fukuoka</h3>
              <div className="space-y-5">
                <CarCard type="Small" capacity={4} doors={3} price="Rp 10,283 / day" />
                <CarCard type="Medium" capacity={4} doors={5} price="Rp 13,295 / day" />
                <CarCard type="SUV" capacity={4} doors={5} price="Rp 13,882 / day" />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

// Rendering to DOM
const container = document.getElementById('airticket-app');
if (container) {
  const root = createRoot(container);
  root.render(<AirTicketResultsPage />);
}

export default AirTicketResultsPage;
