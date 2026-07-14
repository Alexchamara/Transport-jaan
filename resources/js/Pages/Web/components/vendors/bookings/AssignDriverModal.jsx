import React, { useState, useEffect } from "react";
import axios from "axios";

/**
 * Assign (or unassign) a driver to a vehicle booking.
 * booking: { id, rawId, bookingType, assignedDriverId, assignedDriverName }
 * drivers: [{ id, name }]  (vendor's active drivers)
 */
const AssignDriverModal = ({ booking, drivers = [], isOpen, onClose, onSuccess }) => {
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedDriverId(booking?.assignedDriverId ? String(booking.assignedDriverId) : "");
      setError("");
    }
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await axios.post(
        `/vendors/bookings/${booking.bookingType}/${booking.rawId}/assign-driver`,
        { driver_id: selectedDriverId === "" ? null : Number(selectedDriverId) }
      );
      if (res.data?.success) {
        onSuccess?.(res.data);
      } else {
        setError(res.data?.message || "Failed to assign driver.");
      }
    } catch (e) {
      setError(e.response?.data?.message || "Failed to assign driver.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg w-full max-w-[420px] shadow-lg">
        <h2 className="text-[18px] font-[700] mb-1">Assign Driver</h2>
        <p className="text-[13px] text-gray-500 mb-4">Booking {booking.id}</p>

        {drivers.length === 0 ? (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-[13px] text-amber-700">
            You have no active drivers. Add one under Drivers first.
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-[14px] font-[500] mb-1">Driver</label>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="w-full p-2 bg-[#F7F7F7] rounded-[5px] outline-none border-0 text-[14px]"
            >
              <option value="">— Unassigned —</option>
              {drivers.map((d) => (
                <option key={d.id} value={String(d.id)}>{d.name}</option>
              ))}
            </select>
          </div>
        )}

        {error && <div className="mb-3 text-[13px] text-red-600">{error}</div>}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-[5px] text-[14px] font-[700]"
          >
            Close
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="px-4 py-2 bg-[#0955AC] text-white rounded-[5px] text-[14px] font-[700] disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignDriverModal;
