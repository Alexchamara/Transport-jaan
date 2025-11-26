import React from "react";

function BookingOverviewBarChart({ data = [], maxBookings: maxFromProp }) {
  const bookingData = Array.isArray(data) ? data : [];
  const chartHeight = 217; // px
  const maxBookings =
    typeof maxFromProp === "number" && maxFromProp > 0
      ? maxFromProp
      : Math.max(1000, ...bookingData.map((d) => Number(d.bookings || d.value || 0)));

  // index of max for default tooltip
  const maxIndex = bookingData.reduce(
    (maxIdx, d, idx, arr) =>
      (Number(d.bookings ?? d.value ?? 0) > Number(arr[maxIdx]?.bookings ?? arr[maxIdx]?.value ?? 0) ? idx : maxIdx),
    0
  );

  const [hovered, setHovered] = React.useState(bookingData.length ? maxIndex : null);

  return (
    <div className="w-full max-w-[600px] h-auto flex flex-col items-stretch relative">
      <div className="relative w-full" style={{ height: `${chartHeight}px` }}>
        {/* grid */}
        <div className="absolute left-0 w-full h-full z-0 pointer-events-none" style={{ height: `${chartHeight}px` }}>
          {[1000, 750, 500, 250, 0].map((v) => {
            const percentFromBottom = (v / maxBookings) * 100;
            return (
              <div key={v} className="w-full absolute flex items-center" style={{ bottom: `${percentFromBottom}%` }}>
                <span className="text-[10px] md:text-[14px] text-gray-400 absolute left-0 md:-left-12 -top-7 w-8 text-left pl-1 md:pl-0" style={{ transform: "translateY(50%)" }}>
                  {v === 1000 ? "1K" : v}
                </span>
                <div className="w-full border-t ml-8 md:ml-0"></div>
              </div>
            );
          })}
        </div>

        {/* bars */}
        <div className="flex flex-row items-end w-full h-full z-10 relative ml-8 md:ml-0" style={{ height: `${chartHeight}px` }}>
          {bookingData.map((d, i) => {
            const val = Number(d.bookings ?? d.value ?? 0);
            return (
              <div key={d.name ?? i} className="flex flex-col items-center flex-1 relative group">
                <div
                  className={`w-[12px] md:w-[25px] rounded-md transition-all duration-200 cursor-pointer ${i === 7 ? "bg-[#39CEF3]" : "bg-[#0955AC]"}`}
                  style={{ height: `${(val / maxBookings) * chartHeight}px` }}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                />
                {(hovered === i || (hovered === null && i === maxIndex)) && (
                  <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-[#D8E4F2] text-black px-3 md:px-6 py-2 rounded-lg shadow text-center z-20">
                    <div className="font-[600] text-[12px] md:text-[14px]">{d.name ?? "-"}</div>
                    <div className="text-[14px] md:text-[16px] font-[700]">{val}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* labels */}
      <div className="flex flex-row items-end w-full z-10 relative mt-2 ml-8 md:ml-0">
        {bookingData.map((d, i) => (
          <div key={d.name ?? i} className="flex-1 flex justify-center" style={{ minWidth: "20px" }}>
            <div className="text-[10px] md:text-[14px] font-[500] text-[#7B7B7A]">{d.name ?? "-"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookingOverviewBarChart;
