import React from "react";

function BookingOverviewBarChart({ data = [], maxBookings: maxFromProp }) {
  const bookingData = Array.isArray(data) ? data : [];
  const chartHeight = 217; // px
  const yAxisWidth = 52;
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

    const [chartWidth, setChartWidth] = React.useState(600);
    const [barWidth, setBarWidth] = React.useState(25);
  
    React.useEffect(() => {
      const updateSize = () => {
        const width = window.innerWidth;
        let newWidth = 600;
        if (width < 640) newWidth = Math.min(400, width - 40);
        else if (width < 1024) newWidth = 500;
        setChartWidth(newWidth);
        const pointCount = Math.max(bookingData.length, 1);
        const newBarWidth = Math.max(15, (newWidth - 40) / pointCount);
        setBarWidth(newBarWidth);
      };
      updateSize();
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }, []);

  const [hovered, setHovered] = React.useState(bookingData.length ? maxIndex : null);

  return (
    <div className="max-w-full bg-white overflow-auto">
      <div className="w-auto h-auto flex flex-col items-stretch relative" style={{ width: `${chartWidth + yAxisWidth}px` }}>
      {/* Chart area: grid lines and bars, fixed height */}
      <div className="relative w-full mt-16" style={{ height: `${chartHeight}px` }}>
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
                <span
                  className="text-[14px] text-gray-400 absolute left-0 w-[44px] text-right"
                  style={{ transform: "translateY(50%)" }}
                >
                  {v === 1000 ? "1K" : v}
                </span>

                <div className="border-t" style={{ width: `${chartWidth}px`, marginLeft: `${yAxisWidth}px` }}></div>
              </div>
            );
          })}
        </div>
        {/* Bars */}
        <div
          className="flex flex-row items-end h-full z-30 relative"
          style={{ height: `${chartHeight}px`, marginBottom: 0, width: `${chartWidth}px`, marginLeft: `${yAxisWidth}px` }}
        >
          {bookingData.map((d, i) => (
            <div key={d.name} className="flex flex-col items-center flex-1 relative group">
              {/* Bar */}
              <div
                className={`rounded-md transition-all duration-200 cursor-pointer ${i === 7 ? 'bg-[#39CEF3]' : 'bg-[#0955AC]'}`}
                style={{ width: `${barWidth}px`, height: `${(d.bookings / maxBookings) * chartHeight}px` }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              ></div>
              {/* Tooltip */}
              {(hovered === i || (hovered === null && i === maxIndex)) && (
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-[#D8E4F2] text-black px-6 py-2 rounded-lg shadow text-center z-50">
                  <div className="font-[600] text-[14px] flex flex-row items-center justify-center gap-1">{d.name} <span className="">2025</span></div>
                  <div className="text-[16px] font-[700]">{d.bookings}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Month labels below chart area */}
      <div className="flex flex-row items-end z-10 relative" style={{ marginTop: '8px', width: `${chartWidth}px`, marginLeft: `${yAxisWidth}px` }}>
        {bookingData.map((d) => (
          <div key={d.name} className="flex-1 flex justify-center" style={{minWidth: `${barWidth}px`}}>
            <div className="text-[14px] font-[500] text-[#7B7B7A]">{d.name}</div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}

export default BookingOverviewBarChart;
