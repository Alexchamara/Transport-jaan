import React, { useMemo } from "react";

const DEFAULT_COLORS = ["#3DD0FF", "#0955AC", "#C4C4C4", "#60A5FA", "#34D399", "#F59E0B"];

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutSegmentPath(cx, cy, rOuter, rInner, startDeg, endDeg) {
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  const p1 = polarToCartesian(cx, cy, rOuter, endDeg);
  const p2 = polarToCartesian(cx, cy, rOuter, startDeg);
  const p3 = polarToCartesian(cx, cy, rInner, startDeg);
  const p4 = polarToCartesian(cx, cy, rInner, endDeg);

  return [
    `M ${p2.x} ${p2.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p1.x} ${p1.y}`,
    `L ${p4.x} ${p4.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${p3.x} ${p3.y}`,
    "Z",
  ].join(" ");
}

/**
 * Props:
 * - data: [{ name, value, color?, change? }]
 * - rangeLabel: string (used only if showHeader is true)
 * - showHeader: boolean (default false) — when true, renders "Real Status" header inside the chart
 */
const RealStatusPieChart = ({ data = [], rangeLabel = "This Week", showHeader = false }) => {
  const normalized = useMemo(() => {
    const arr = Array.isArray(data) ? data : [];
    return arr.map((d, i) => ({
      name: d?.name ?? `Item ${i + 1}`,
      value: Number(d?.value ?? 0),
      color: d?.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      change: d?.change ?? null,
    }));
  }, [data]);

  const total = normalized.reduce((s, n) => s + (Number.isFinite(n.value) ? n.value : 0), 0);

  const size = 180, cx = size / 2, cy = size / 2, rOuter = 70, rInner = 48, gapDeg = 1.5;
  const startAngle = -90;
  let cumAngle = startAngle;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {showHeader && (
        <div className="flex items-center justify-between w-full mb-4">
          <h1 className="text-[24px] font-[700]">Real Status</h1>
          <div className="w-[113px] h-[33px] bg-[#D9D9D94F] rounded-[6px] flex flex-row justify-center items-center gap-3">
            <h1 className="text-[#00000080] font-[600] text-[14px]">{rangeLabel}</h1>
            <span className="text-xs">▼</span>
          </div>
        </div>
      )}

      {total <= 0 ? (
        <div className="text-sm text-gray-500 py-10">No status data yet.</div>
      ) : (
        <>
          <svg width={size} height={size} role="img" aria-label="Real status">
            {normalized.map((seg, i) => {
              const portion = seg.value / total;
              const sweep = portion * 360 - gapDeg;
              const segStart = cumAngle;
              const segEnd = cumAngle + Math.max(sweep, 0);
              cumAngle += portion * 360;
              const d = donutSegmentPath(cx, cy, rOuter, rInner, segStart, segEnd);
              return <path key={i} d={d} fill={seg.color} stroke="none" />;
            })}
          </svg>

          <div className="flex flex-col gap-2 mt-6 w-full">
            {normalized.map((entry, idx) => {
              const percent = Math.round((entry.value / Math.max(total, 1)) * 100);
              return (
                <div key={idx} className="flex flex-row items-center justify-between w-full mb-1">
                  <div className="flex flex-row items-center gap-2">
                    <span className="w-5 h-5 rounded" style={{ backgroundColor: entry.color }} />
                    <span className="text-[20px] font-[600] text-[#00000080]">{entry.name}</span>
                  </div>
                  <div className="flex flex-row items-center gap-2">
                    <span className="text-[20px] font-[600] text-[#000000]">{percent}%</span>
                    {entry.change === "up" && <span className="text-green-600 text-sm">▲</span>}
                    {entry.change === "down" && <span className="text-red-600 text-sm">▼</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default RealStatusPieChart;
