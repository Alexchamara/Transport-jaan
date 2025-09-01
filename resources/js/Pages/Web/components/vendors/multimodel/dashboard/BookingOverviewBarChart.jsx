import React from "react";
import miniDownArrow from "../../../assets/vendors/dashboard/icons/miniDownArrow.svg";

const bookingData = [
  { name: "Jan", bookings: 450 },
  { name: "Feb", bookings: 670 },
  { name: "Mar", bookings: 540 },
  { name: "Apr", bookings: 900 },
  { name: "May", bookings: 800 },
  { name: "Jun", bookings: 200 },
  { name: "Jul", bookings: 340 },
  { name: "Aug", bookings: 859 },
  { name: "Sep", bookings: 670 },
  { name: "Oct", bookings: 570 },
  { name: "Nov", bookings: 400 },
  { name: "Dec", bookings: 900 },
];
const maxBookings = 1000;

function BookingOverviewBarChart() {
  const [hovered, setHovered] = React.useState(null);
  const chartHeight = 217; // px
  // Find the index of the highest bookings
  const maxIndex = bookingData.reduce((maxIdx, d, idx, arr) => d.bookings > arr[maxIdx].bookings ? idx : maxIdx, 0);
  return (
    <div className="w-[600px] h-auto flex flex-col items-stretch relative">
      {/* Chart area: grid lines and bars, fixed height */}
      <div className="relative w-full" style={{ height: `${chartHeight}px` }}>
        {/* Y-axis grid lines and labels */}
        <div className="absolute left-0 w-full h-full z-0 pointer-events-none" style={{ height: `${chartHeight}px` }}>
          {[1000, 750, 500, 250, 0].map((v) => {
            const percentFromBottom = (v / maxBookings) * 100;
            return (
              <div
                key={v}
                className="w-full absolute flex items-center"
                style={{ bottom: `${percentFromBottom}%` }}
              >
                <span className="text-[14px] text-gray-400 absolute -left-12 -top-7 w-8 text-left" style={{transform: 'translateY(50%)'}}>{v === 1000 ? '1K' : v}</span>

                <div className={`w-full border-t`}></div>
              </div>
            );
          })}
        </div>
        {/* Bars */}
        <div className="flex flex-row items-end w-full h-full z-10 relative" style={{ height: `${chartHeight}px`, marginBottom: 0 }}>
          {bookingData.map((d, i) => (
            <div key={d.name} className="flex flex-col items-center flex-1 relative group">
              {/* Bar */}
              <div
                className={`w-[25px] rounded-md transition-all duration-200 cursor-pointer ${i === 7 ? 'bg-[#39CEF3]' : 'bg-[#0955AC]'}`}
                style={{ height: `${(d.bookings / maxBookings) * chartHeight}px` }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              ></div>
              {/* Tooltip */}
              {(hovered === i || (hovered === null && i === maxIndex)) && (
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-[#D8E4F2] text-black px-6 py-2 rounded-lg shadow text-center z-20">
                  <div className="font-[600] text-[14px] flex flex-row items-center justify-center gap-1">{d.name} <span className="">2025</span></div>
                  <div className="text-[16px] font-[700]">{d.bookings}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Month labels below chart area */}
      <div className="flex flex-row items-end w-full z-10 relative" style={{ marginTop: '8px' }}>
        {bookingData.map((d) => (
          <div key={d.name} className="flex-1 flex justify-center" style={{minWidth: '36px'}}>
            <div className="text-[14px] font-[500] text-[#7B7B7A]">{d.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookingOverviewBarChart; 