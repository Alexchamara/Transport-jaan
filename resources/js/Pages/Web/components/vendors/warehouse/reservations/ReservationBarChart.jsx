import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import miniDownArrow from "../../../../assets/vendors/dashboard/icons/miniDownArrow.svg";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// ---------- helpers ----------
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const monthIndex = (m) => {
  if (m === undefined || m === null) return -1;
  const n = Number(m);
  if (!Number.isNaN(n)) {
    if (n >= 1 && n <= 12) return n - 1;
    if (n >= 0 && n <= 11) return n;
  }
  const s = String(m).trim().slice(0,3).toLowerCase();
  return MONTHS.findIndex((x) => x.toLowerCase() === s);
};

function normalize(reservationData = []) {
  const done = new Array(12).fill(0);
  const canc = new Array(12).fill(0);
  const years = new Array(12).fill(null);

  (Array.isArray(reservationData) ? reservationData : []).forEach((r) => {
    const i = monthIndex(r?.name ?? r?.month ?? r?.month_name ?? r?.monthIndex ?? r?.month_index);
    if (i < 0 || i > 11) return;

    const d = r?.done ?? r?.completed ?? r?.confirmed ?? r?.total_done ?? 0;
    const c = r?.cancelled ?? r?.canceled ?? r?.total_cancelled ?? r?.total_canceled ?? 0;

    done[i] = Number(d) || 0;
    canc[i] = -(Number(c) || 0); // negative -> draw downward
    years[i] = r?.year ?? years[i];
  });

  const fallbackYear = new Date().getFullYear();
  const yearByMonth = years.map((y) => y ?? fallbackYear);
  return { done, canc, yearByMonth };
}

export default function ReservationBarChart({
  reservationData = [],
  dropdownLabel = "Last 8 months",
}) {
  const { done, canc, yearByMonth } = normalize(reservationData);

  const data = {
    labels: MONTHS,
    datasets: [
      {
        label: "Confirmed",
        data: done,
        backgroundColor: "#10B981",
        borderRadius: 8,
        borderSkipped: false,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
        stack: "res",
      },
      {
        label: "Cancelled",
        data: canc,
        backgroundColor: "#EF4444",
        borderRadius: 8,
        borderSkipped: false,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
        stack: "res",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }, // custom tooltip below
    },
    layout: { padding: { top: 8, right: 8, bottom: 0, left: 8 } },
    interaction: { mode: "index", intersect: false }, // hover anywhere above month
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: "#7B7B7A", font: { size: 12, weight: 600 } },
        border: { display: false },
        stacked: true,
      },
      y: {
        min: -500,
        max: 500,
        stacked: true,
        grid: { color: "#E5E7EB", drawBorder: false },
        ticks: {
          stepSize: 250,
          color: "#7B7B7A",
          font: { size: 12, weight: 500 },
          callback: (v) => (v === 0 ? "0" : v),
        },
        border: { display: false },
      },
    },
  };

  // ---------- custom arrow tooltip that shows counts ----------
  const chartRef = React.useRef(null);
  const [tooltipModel, setTooltipModel] = React.useState(null);

  React.useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.options.plugins.tooltip.external = (ctx) => {
      setTooltipModel({ chart, ...ctx.tooltip });
    };
    chart.update();
  }, []);

  // auto-show on highest Confirmed
  React.useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const maxDone = done.length ? Math.max(...done) : null;
    const idx = maxDone !== null ? done.indexOf(maxDone) : -1;
    if (idx < 0) return;

    const t = setTimeout(() => {
      const meta = chart.getDatasetMeta(0);
      if (!meta?.data?.[idx]) return;
      const bar = meta.data[idx];
      const { x, y } = bar.getCenterPoint();

      setTooltipModel({
        opacity: 1,
        caretX: x,
        caretY: y,
        dataPoints: [
          { dataIndex: idx, datasetIndex: 0 },
          { dataIndex: idx, datasetIndex: 1 },
        ],
        chart,
      });
    }, 400);
    return () => clearTimeout(t);
  }, [done.join("|")]);

  const noData =
    (reservationData?.length ?? 0) === 0 ||
    (done.every((v) => v === 0) && canc.every((v) => v === 0));

  return (
    <div className="w-full h-full p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-[20px] font-[700] leading-tight">Reservation Overview</h3>
          <div className="flex gap-6 mt-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded bg-[#10B981]" />
              <span className="text-[14px] font-[600] text-[#111827]">Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded bg-[#EF4444]" />
              <span className="text-[14px] font-[600] text-[#111827]">Cancelled</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="bg-[#F3F4F6] rounded-md px-3 py-1.5 flex items-center gap-2 text-[13px] font-[600] text-[#374151]"
        >
          {dropdownLabel}
          <img src={miniDownArrow} alt="" />
        </button>
      </div>

      {/* Chart */}
      <div className="relative w-full" style={{ height: 280 }}>
        <Bar ref={chartRef} data={data} options={options} />
        {noData && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="px-3 py-1.5 rounded bg-[#F3F4F6] text-[#6B7280] text-sm font-semibold">
              No data to display
            </div>
          </div>
        )}

        {tooltipModel?.opacity && tooltipModel?.dataPoints?.length > 0 && (
          <ArrowTooltip tooltip={tooltipModel} yearByMonth={yearByMonth} />
        )}
      </div>
    </div>
  );
}

function ArrowTooltip({ tooltip, yearByMonth }) {
  const chart = tooltip.chart;
  const di = tooltip.dataPoints[0].dataIndex; // current month index
  const month = chart.data.labels[di];
  const year = yearByMonth?.[di] ?? new Date().getFullYear();

  // read both datasets for this month (abs to remove minus sign)
  const confirmedVal = Math.abs(Number(chart.data.datasets[0]?.data?.[di] ?? 0));
  const cancVal = Math.abs(Number(chart.data.datasets[1]?.data?.[di] ?? 0));

  // place box near caret; if most recent hover was on cancelled (below), nudge down
  const hoveredOnCancelled = tooltip.dataPoints.some((p) => p.datasetIndex === 1);
  const translate = hoveredOnCancelled ? "translate(-50%, 16px)" : "translate(-50%, -110%)";

  return (
    <div
      style={{
        position: "absolute",
        left: tooltip.caretX,
        top: tooltip.caretY,
        transform: translate,
        background: "#E8EFF8",
        color: "#0F172A",
        padding: "10px 14px",
        borderRadius: 10,
        boxShadow: "0 2px 8px rgba(0,0,0,.08)",
        fontSize: 12,
        fontWeight: 700,
        pointerEvents: "none",
        zIndex: 20,
        minWidth: 120,
        textAlign: "center",
      }}
    >
      <div style={{ fontWeight: 700 }}>{month} {year}</div>
      <div style={{ fontWeight: 800 }}>Confirmed {confirmedVal}</div>
      <div style={{ fontWeight: 800 }}>Cancelled {cancVal}</div>

      {/* the little arrow */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          ...(hoveredOnCancelled
            ? { top: -8, width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderBottom: "8px solid #E8EFF8" }
            : { bottom: -8, width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "8px solid #E8EFF8" }
          ),
        }}
      />
    </div>
  );
}
