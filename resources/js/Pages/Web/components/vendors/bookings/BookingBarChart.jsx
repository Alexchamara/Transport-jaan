import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import miniDownArrow from "../../../assets/vendors/dashboard/icons/miniDownArrow.svg";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);

/**
 * Accept optional bookingData prop:
 *  [{ name: "Jan", done: 0, cancelled: 0 }, ...]
 * If not provided, chart renders empty.
 */
function BookingBarChart({ bookingData = [] }) {
  const labels = bookingData.map((d) => d.name);
  const doneData = bookingData.map((d) => Number(d.done) || 0);
  const cancelledData = bookingData.map((d) => -Math.abs(Number(d.cancelled) || 0)); // negative for downward bars

  const data = React.useMemo(() => ({
    labels,
    datasets: [
      {
        label: "Done",
        data: doneData,
        backgroundColor: labels.map((_, i) => (i === 7 ? "#39CEF3" : "#0955AC")),
        borderRadius: { topLeft: 8, topRight: 8 },
        borderSkipped: false,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
        stack: 'booking',
      },
      {
        label: "Cancelled",
        data: cancelledData,
        backgroundColor: "#000000",
        borderRadius: { bottomLeft: 8, bottomRight: 8 },
        borderSkipped: false,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
        stack: 'booking',
      },
    ],
  }), [labels.join("|"), doneData.join("|"), cancelledData.join("|")]);

  const options = React.useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: false,
        external: function(context) {},
        callbacks: { label: function() { return ""; } },
      },
      title: { display: false },
    },
    layout: { padding: { top: 20, bottom: 10, left: 0, right: 0 } },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#7B7B7A', font: { size: 14, weight: 500 } },
        border: { display: false },
      },
      y: {
        min: -500,
        max: 500,
        stacked: true,
        grid: { color: '#00000040', drawBorder: false, lineWidth: 1 },
        ticks: {
          stepSize: 250,
          color: '#B0B0B0',
          font: { size: 14 },
          callback: function(value) {
            if (value === 500) return '500';
            if (value === -500) return '-500';
            return value;
          },
        },
        border: { display: false },
      },
    },
    interaction: { mode: 'index', intersect: false },
    hover: { mode: 'index', intersect: false },
  }), []);

  // Custom Tooltip
  function CustomTooltip({ chart, tooltip }) {
    if (!tooltip || !tooltip.opacity || !chart) return null;
    const dp = tooltip.dataPoints?.[0];
    if (!dp || labels.length === 0) return null;
    const month = labels[dp.dataIndex];
    const done = doneData[dp.dataIndex];
    const cancelled = Math.abs(cancelledData[dp.dataIndex]);
    const type = dp.datasetIndex === 0 ? 'Done' : 'Cancelled';
    const value = type === 'Done' ? done : cancelled;
    return (
      <div
        style={{
          position: 'absolute',
          left: tooltip.caretX,
          top: tooltip.caretY - 60,
          background: '#D8E4F2',
          color: '#000',
          padding: '12px 24px',
          borderRadius: 12,
          boxShadow: '0 2px 8px #0001',
          pointerEvents: 'none',
          minWidth: 120,
          textAlign: 'center',
          zIndex: 100,
          transform: 'translate(-50%, -100%)',
        }}
      >
        <div className="text-[14px] font-[600]">{month} 2025</div>
        <div className="text-[16px] font-[700] text-[#000000]">
          <span className="font-[700] text-[16px]">{type} </span>{value}
        </div>
      </div>
    );
  }

  const chartRef = React.useRef(null);
  const [tooltipModel, setTooltipModel] = React.useState(null);

  // Find the highest 'Done' value and its index (guard for empty)
  const maxDone = doneData.length ? Math.max(...doneData) : null;
  const maxDoneIndex = (maxDone !== null) ? doneData.indexOf(maxDone) : -1;

  // Custom tooltip handler
  React.useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.options.plugins.tooltip.external = (context) => {
      setTooltipModel({
        ...context.tooltip,
        chart,
      });
    };
    chart.update();

    // Show tooltip for the highest 'Done' bar on mount (only if we have data)
    if (maxDoneIndex >= 0) {
      const t = setTimeout(() => {
        const meta = chart.getDatasetMeta(0); // 0 for 'Done' dataset
        if (!meta || !meta.data || !meta.data[maxDoneIndex]) return;
        const bar = meta.data[maxDoneIndex];
        const { x, y } = bar.getCenterPoint();
        setTooltipModel({
          opacity: 1,
          dataPoints: [{
            dataIndex: maxDoneIndex,
            datasetIndex: 0,
          }],
          caretX: x,
          caretY: y,
          chart,
        });
      }, 500);
      return () => clearTimeout(t);
    }
  }, [maxDoneIndex, labels.length]);

  return (
    <div className="w-full h-full flex flex-col items-stretch relative px-8 pt-8 pb-4">
      {/* Header */}
      <div className="flex flex-row justify-between items-center mb-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-[28px] font-[700]">Booking Overview</h2>
          <div className="flex flex-row items-center gap-6 mt-1">
            <div className="flex flex-row items-center gap-2">
              <span className="inline-block w-6 h-6 rounded bg-[#0955AC]"></span>
              <span className="text-[20px] font-[600] text-[#7B7B7A]">Done</span>
            </div>
            <div className="flex flex-row items-center gap-2">
              <span className="inline-block w-6 h-6 rounded bg-black"></span>
              <span className="text-[20px] font-[600] text-[#7B7B7A]">Cancelled</span>
            </div>
          </div>
        </div>
        <div className="ml-8">
          <button className="bg-[#F3F3F3] rounded-lg px-4 py-2 flex flex-row items-center gap-2 text-[16px] font-[500] text-[#7B7B7A] shadow-none border-none outline-none">
            Last 8 months
            <img src={miniDownArrow} alt="dropdown" />
          </button>
        </div>
      </div>
      {/* Chart */}
      <div className="relative w-full" style={{ height: `300px` }}>
        <Bar ref={chartRef} data={data} options={options} />
        {/* Custom Tooltip Render */}
        {tooltipModel && <CustomTooltip chart={tooltipModel.chart} tooltip={tooltipModel} />}
      </div>
    </div>
  );
}

export default BookingBarChart;
