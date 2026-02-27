import React, { useState, useEffect } from "react";
import miniUp from "../../../assets/vendors/dashboard/icons/miniUp.svg";
import miniDown from "../../../assets/vendors/dashboard/icons/miniDown.svg";

const CarBookingTable = ({ rows = [] }) => {
  const data = Array.isArray(rows) ? rows : rows?.data || [];
  const safe = Array.isArray(data) ? data : [];

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleChange = (e) => setIsMobile(e.matches);
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (isMobile) {
    // Mobile Card View
    return (
      <div className="py-10 space-y-4">
        {safe.map((row, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Book ID:</span>
                <span className="text-sm">{row.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Booking Date:</span>
                <span className="text-sm">{row.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Client Name:</span>
                <span className="text-sm">{row.customer}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Car Model:</span>
                <span className="text-sm">{row.car}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Plate:</span>
                <span className="text-sm bg-gray-100 px-2 py-1 rounded text-xs">{row.plate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Plan:</span>
                <span className="text-sm">{row.duration}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Date:</span>
                <div className="text-sm text-right">
                  <div>Start: {row.startDate}</div>
                  <div>End: {row.endDate}</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Payment:</span>
                <div className="text-right">
                  <div className="text-sm font-semibold">{row.price}</div>
                  <div
                    className="text-xs px-2 py-1 rounded mt-1 inline-block"
                    style={{
                      border: `1px solid ${
                        row.paymentStatus === "Paid"
                          ? "#3B8F314D"
                          : row.paymentStatus === "Pending"
                          ? "#FF6060"
                          : "#FFCD29"
                      }`,
                      backgroundColor:
                        row.paymentStatus === "Paid"
                          ? "#ACE19957"
                          : row.paymentStatus === "Pending"
                          ? "#FF60608C"
                          : "#FFF7D1",
                      color: row.paymentStatus === "Paid" ? "#3B8F31" : row.paymentStatus === "Pending" ? "#FF6060" : "#FFCD29",
                    }}
                  >
                    {row.paymentStatus}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Status:</span>
                <div
                  className="text-xs px-2 py-1 rounded font-bold"
                  style={{
                    backgroundColor:
                      row.status === "Ongoing"
                        ? "#FFCD29"
                        : row.status === "Returned"
                        ? "transparent"
                        : "#D8E4F2",
                    border:
                      row.status === "Returned"
                        ? "1px solid #FFCD29"
                        : "1px solid #0000004D",
                    color: row.status === "Returned" ? "#FFCD29" : "#000000",
                  }}
                >
                  {row.status}
                </div>
              </div>
            </div>
          </div>
        ))}
        {safe.length === 0 && (
          <div className="text-sm text-gray-500 py-6 text-center">
            No bookings yet.
          </div>
        )}
      </div>
    );
  }

  // Desktop Table View
  return (
    <div className="py-10 w-full">
      {/* SCROLL WRAPPER (DESKTOP) */}
      <div className="overflow-x-auto md:overflow-x-visible ml-5">
        <div className="min-w-[700px] md:min-w-full">
          
          {/* headers */}
          <div className="grid grid-cols-8 bg-[#D8E4F2] h-[42px] items-center rounded-[8px] text-[14px] font-[600] px-10">
            {[
              "Book id",
              "Booking Date",
              "Client Name",
              "Car Model",
              "Plan",
              "Date",
              "Payment",
              "Status",
            ].map((h) => (
              <div key={h} className="flex flex-row gap-2 items-center">
                <h1>{h}</h1>
                <div className="flex flex-col items-center">
                  <img src={miniUp} className="w-[6px] h-[4px]" />
                  <img src={miniDown} className="w-[6px] h-[4px]" />
                </div>
              </div>
            ))}
          </div>

          {/* rows */}
          <div>
            {safe.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-8 border-b-[1.5px] border-[#00000033] h-[100px] items-center text-[15px] font-[500] px-10"
              >
                <div>{row.id}</div>
                <div>{row.date}</div>
                <div>{row.customer}</div>

                <div>
                  <h1>{row.car}</h1>
                  <div className="w-[77px] h-[22px] rounded-[4px] bg-[#D9D9D957] border-[1.5px] border-[#0000004D] flex justify-center items-center text-[#00000099] text-[13px]">
                    {row.plate}
                  </div>
                </div>

                <div>{row.duration}</div>

                <div className="text-[14px] font-[500] text-[#939392]">
                  <div className="flex flex-row gap-2 items-center">
                    <h1>Start</h1>
                    <div className="w-[62px] h-[19px] border-[0.5px] bg-[#D9D9D957] border-[#0000004D] text-[10px] font-[500] text-[#00000099] flex justify-center items-center rounded-[4px]">
                      {row.startDate}
                    </div>
                  </div>
                  <div className="flex flex-row gap-4 items-center">
                    <h1>End</h1>
                    <div className="w-[62px] h-[19px] border-[0.5px] bg-[#D9D9D957] border-[#0000004D] text-[10px] font-[500] text-[#00000099] flex justify-center items-center rounded-[4px]">
                      {row.endDate}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <h1>{row.price}</h1>
                  <div
                    className="w-[66px] h-[19px] rounded-[4px] text-[10px] text-[#00000099] font-[500] flex justify-center items-center"
                    style={{
                      border: `0.5px solid ${
                        row.paymentStatus === "Paid"
                          ? "#3B8F314D"
                          : row.paymentStatus === "Pending"
                          ? "#FF6060"
                          : "#FFCD29"
                      }`,
                      backgroundColor:
                        row.paymentStatus === "Paid"
                          ? "#ACE19957"
                          : row.paymentStatus === "Pending"
                          ? "#FF60608C"
                          : "#FFF7D1",
                    }}
                  >
                    {row.paymentStatus}
                  </div>
                </div>

                <div
                  className="w-[52px] h-[19px] rounded-[4px] flex justify-center items-center text-[10px] font-[700]"
                  style={{
                    backgroundColor:
                      row.status === "Ongoing"
                        ? "#FFCD29"
                        : row.status === "Returned"
                        ? "transparent"
                        : "#D8E4F2",
                    border:
                      row.status === "Returned"
                        ? "1px solid #FFCD29"
                        : "1px solid #0000004D",
                    color: row.status === "Returned" ? "#FFCD29" : "#000000",
                  }}
                >
                  {row.status}
                </div>
              </div>
            ))}

            {safe.length === 0 && (
              <div className="text-sm text-gray-500 px-10 py-6">
                No bookings yet.
              </div>
            )}
          </div>
        </div>
      </div>
      {/* END SCROLL WRAPPER */}

    </div>
  );
};

export default CarBookingTable;
