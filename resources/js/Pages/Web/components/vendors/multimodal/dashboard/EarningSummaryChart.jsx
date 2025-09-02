import React, { useState } from "react";

const earningData = [
  { name: "Jan", value: 5000 },
  { name: "Feb", value: 7000 },
  { name: "Mar", value: 6000 },
  { name: "Apr", value: 23456 }, // Highlighted point
  { name: "May", value: 8000 },
  { name: "Jun", value: 4000 },
  { name: "Jul", value: 9000 },
  { name: "Aug", value: 12000 },
  { name: "Sep", value: 10000 },
  { name: "Oct", value: 9500 },
  { name: "Nov", value: 15000 },
  { name: "Dec", value: 21000 },
];

const maxValue = 24000;
const chartHeight = 250;
const chartWidth = 650;
const padding = 40;

function getX(index) {
  return padding + (index * (chartWidth - 2 * padding)) / (earningData.length - 1);
}
function getY(value) {
  return chartHeight - padding - (value * (chartHeight - 2 * padding)) / maxValue;
}

// Helper function to generate smooth curve
function generateSmoothPath(points) {
  if (points.length < 2) return "";
  
  const path = [];
  path.push(`M ${points[0][0]} ${points[0][1]}`);
  
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const controlPointX = (current[0] + next[0]) / 2;
    
    path.push(`C ${controlPointX} ${current[1]}, ${controlPointX} ${next[1]}, ${next[0]} ${next[1]}`);
  }
  
  return path.join(" ");
}

const EarningSummaryChart = () => {
  // Find the index of the highest value
  const highestIndex = earningData.reduce(
    (maxIdx, d, idx, arr) => d.value > arr[maxIdx].value ? idx : maxIdx,
    0
  );
  const [hovered, setHovered] = useState(highestIndex);

  // Generate points for the paths
  const points = earningData.map((d, i) => [getX(i), getY(d.value)]);
  
  // Build the smooth line path
  const linePath = generateSmoothPath(points);
  
  // Build the smooth area path
  const areaPath = [
    `M ${getX(0)} ${chartHeight - padding}`,
    generateSmoothPath(points).slice(1), // Remove the initial M command
    `L ${getX(earningData.length - 1)} ${chartHeight - padding}`,
    "Z",
  ].join(" ");

  return (
    <div className="w-full h-auto ml-10">
      <svg width={chartWidth} height={chartHeight} className="block mx-auto">
        {/* Define linear gradient */}
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C4E0FF" />
            <stop offset="100%" stopColor="#0955AC1A" />
          </linearGradient>
        </defs>
        {/* Y axis grid lines and labels */}
        {[0, 6000, 12000, 18000, 24000].map((val, i) => {
          const y = getY(val);
          return (
            <g key={i}>
              <line x1={padding} x2={chartWidth - padding} y1={y} y2={y} stroke="#E5E7EB" strokeWidth={1} />
              <text x={0} y={y + 5} className="fill-[#7B7B7A] text-[14px] font-[500]" textAnchor="start">
                {val / 1000}K
              </text>
            </g>
          );
        })}
        {/* Area under the line */}
        <path d={areaPath} fill="url(#areaGradient)" />
        {/* Smooth line */}
        <path d={linePath} fill="none" stroke="#0955AC" strokeWidth={2} />
        {/* Interactive areas and tooltips */}
        {earningData.map((d, i) => (
          <g key={i}>
            {/* Invisible larger circle for better click detection */}
            <circle
              cx={getX(i)}
              cy={getY(d.value)}
              r={15}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => setHovered(i)}
            />
            {/* Visible point only when selected */}
            {hovered === i && (
              <circle
                cx={getX(i)}
                cy={getY(d.value)}
                r={6}
                fill="rgba(9, 85, 172, 1)"
                strokeWidth={2}
              />
            )}
          </g>
        ))}
        {/* Single Tooltip rendered outside the map to prevent flicker */}
        {hovered !== null && (() => {
          const tooltipWidth = 108;
          const tooltipHeight = 55;
          const pointX = getX(hovered);
          const pointY = getY(earningData[hovered].value);
          let tooltipX = pointX - tooltipWidth / 2;
          let tooltipY = pointY - tooltipHeight - 15; // 15px above the point

          // Ensure tooltip stays within left/right bounds
          if (tooltipX < 0) tooltipX = 0;
          if (tooltipX + tooltipWidth > chartWidth) tooltipX = chartWidth - tooltipWidth;

          // If tooltip would overflow the top, show it below the point
          if (tooltipY < 0) tooltipY = pointY + 15;
          // If tooltip would overflow the bottom, show it above the point
          if (tooltipY + tooltipHeight > chartHeight) tooltipY = pointY - tooltipHeight - 15;

          return (
            <foreignObject x={tooltipX} y={tooltipY} width={tooltipWidth} height={tooltipHeight} pointerEvents="none">
              <div className="bg-[#D8E4F2] w-[108px] h-[55px] rounded-[5px] shadow-lg px-4 py-2 flex flex-col items-center">
                <span className="text-[14px] font-[500] mb-1">{earningData[hovered].name} 2025</span>
                <span className="text-[16px] font-[700]">${earningData[hovered].value.toLocaleString()}</span>
              </div>
            </foreignObject>
          );
        })()}
        {/* X axis labels */}
        {earningData.map((d, i) => (
          <text
            key={i}
            x={getX(i)}
            y={chartHeight - padding + 20}
            className="fill-[#7B7B7A] text-[14px] font-[500]"
            textAnchor="middle"
          >
            {d.name}
          </text>
        ))}
      </svg>
    </div>
  );
};

export default EarningSummaryChart; 