import React, { useState } from "react";

const chartHeight = 250;
const chartWidth = 650;
const padding = 40;

function getX(index, len) {
  return padding + (index * (chartWidth - 2 * padding)) / Math.max(1, len - 1);
}
function getY(value, maxValue) {
  return chartHeight - padding - (value * (chartHeight - 2 * padding)) / Math.max(1, maxValue);
}
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

const EarningSummaryChart = ({ data = [] }) => {
  const maxValue = Math.max(1, ...data.map((d) => Number(d.value || 0)));
  const highestIndex = data.reduce(
    (maxIdx, d, idx, arr) => (Number(d.value || 0) > Number(arr[maxIdx]?.value || 0) ? idx : maxIdx),
    0
  );
  const [hovered, setHovered] = useState(highestIndex);

  const points = data.map((d, i) => [getX(i, data.length), getY(Number(d.value || 0), maxValue)]);
  const linePath = generateSmoothPath(points);
  const areaPath = [
    `M ${getX(0, data.length)} ${chartHeight - padding}`,
    generateSmoothPath(points).slice(1),
    `L ${getX(Math.max(0, data.length - 1), data.length)} ${chartHeight - padding}`,
    "Z",
  ].join(" ");

  return (
    <div className="w-full h-auto ml-10">
      <svg width={chartWidth} height={chartHeight} className="block mx-auto">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C4E0FF" />
            <stop offset="100%" stopColor="#0955AC1A" />
          </linearGradient>
        </defs>

        {[0, maxValue * 0.25, maxValue * 0.5, maxValue * 0.75, maxValue].map((val, i) => {
          const y = getY(val, maxValue);
          const label = (val / 1000).toFixed(0) + "K";
          return (
            <g key={i}>
              <line x1={padding} x2={chartWidth - padding} y1={y} y2={y} stroke="#E5E7EB" strokeWidth={1} />
              <text x={0} y={y + 5} className="fill-[#7B7B7A] text-[14px] font-[500]" textAnchor="start">
                {label}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#areaGradient)" />
        <path d={linePath} fill="none" stroke="#0955AC" strokeWidth={2} />

        {data.map((d, i) => (
          <g key={i}>
            <circle
              cx={getX(i, data.length)}
              cy={getY(Number(d.value || 0), maxValue)}
              r={15}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => setHovered(i)}
            />
            {hovered === i && (
              <circle
                cx={getX(i, data.length)}
                cy={getY(Number(d.value || 0), maxValue)}
                r={6}
                fill="rgba(9, 85, 172, 1)"
                strokeWidth={2}
              />
            )}
          </g>
        ))}

        {hovered !== null && data[hovered] && (() => {
          const tooltipWidth = 108;
          const tooltipHeight = 55;
          const pointX = getX(hovered, data.length);
          const pointY = getY(Number(data[hovered].value || 0), maxValue);
          let tooltipX = pointX - tooltipWidth / 2;
          let tooltipY = pointY - tooltipHeight - 15;
          if (tooltipX < 0) tooltipX = 0;
          if (tooltipX + tooltipWidth > chartWidth) tooltipX = chartWidth - tooltipWidth;
          if (tooltipY < 0) tooltipY = pointY + 15;
          if (tooltipY + tooltipHeight > chartHeight) tooltipY = pointY - tooltipHeight - 15;
          return (
            <foreignObject x={tooltipX} y={tooltipY} width={tooltipWidth} height={tooltipHeight} pointerEvents="none">
              <div className="bg-[#D8E4F2] w-[108px] h-[55px] rounded-[5px] shadow-lg px-4 py-2 flex flex-col items-center">
                <span className="text-[14px] font-[500] mb-1">{data[hovered].name} 2025</span>
                <span className="text-[16px] font-[700]">${Number(data[hovered].value || 0).toLocaleString()}</span>
              </div>
            </foreignObject>
          );
        })()}

        {data.map((d, i) => (
          <text
            key={i}
            x={getX(i, data.length)}
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
