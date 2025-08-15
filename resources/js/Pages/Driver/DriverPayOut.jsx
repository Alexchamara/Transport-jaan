import React, { useState } from 'react';

const DriverPayOut = () => {
  const [payouts, setPayouts] = useState([
    {
      id: 1,
      driver: 'Amal Silva',
      trips: 12,
      earnings: 12500,
      lastPaid: '2025-05-29',
      status: 'paid',
    },
    {
      id: 2,
      driver: 'Ruwan Perera',
      trips: 9,
      earnings: 8700,
      lastPaid: '2025-06-01',
      status: 'pending',
    },
    {
      id: 3,
      driver: 'Nuwan Lakmal',
      trips: 15,
      earnings: 15300,
      lastPaid: '2025-06-02',
      status: 'paid',
    },
  ]);

  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleRequestPayout = (payout) => {
    setSelectedPayout(payout);
    setShowModal(true);
  };

  const confirmPayout = () => {
    const updated = payouts.map((item) =>
      item.id === selectedPayout.id ? { ...item, status: 'paid', lastPaid: new Date().toISOString().slice(0, 10) } : item
    );
    setPayouts(updated);
    setShowModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Driver Payouts</h1>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full text-sm text-left border border-gray-200">
          <thead className="bg-gray-800 text-white text-xs uppercase">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Driver</th>
              <th className="px-4 py-3">Trips</th>
              <th className="px-4 py-3">Earnings (LKR)</th>
              <th className="px-4 py-3">Last Paid</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((item, index) => (
              <tr
                key={item.id}
                className="border-b hover:bg-gray-50 transition-all duration-150"
              >
                <td className="px-4 py-3">{index + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{item.driver}</td>
                <td className="px-4 py-3">{item.trips}</td>
                <td className="px-4 py-3 text-green-600 font-semibold">
                  LKR {item.earnings.toLocaleString()}
                </td>
                <td className="px-4 py-3">{item.lastPaid}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {item.status === 'pending' ? (
                    <button
                      onClick={() => handleRequestPayout(item)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs"
                    >
                      Request Payout
                    </button>
                  ) : (
                    <span className="text-gray-400 italic text-xs">Already Paid</span>
                  )}
                </td>
              </tr>
            ))}
            {payouts.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-gray-500 italic py-4">
                  No payout records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Payout Confirmation Modal */}
      {showModal && selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Confirm Payout</h2>
            <p className="text-sm text-gray-600">
              Are you sure you want to mark <strong>{selectedPayout.driver}</strong>'s payout as paid for LKR {selectedPayout.earnings.toLocaleString()}?
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmPayout}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverPayOut;
