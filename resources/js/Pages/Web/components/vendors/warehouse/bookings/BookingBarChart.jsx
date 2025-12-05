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
import axios from "axios";
import miniDownArrow from "../../../../assets/vendors/dashboard/icons/miniDownArrow.svg";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
      external: function (context) {},
    },
    title: {
      display: false,
    },
  },
  layout: {
    padding: {
      top: 20,
      bottom: 10,
      left: 0,
      right: 0,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        color: '#7B7B7A',
        font: {
          size: 14,
          weight: 500,
        },
      },
      border: {
        display: false,
      },
    },
    y: {
      min: -500,
      max: 500,
      stacked: true,
      grid: {
        color: '#00000040',
        drawBorder: false,
        lineWidth: 1,
      },
      ticks: {
        stepSize: 250,
        color: '#B0B0B0',
        font: {
          size: 14,
        },
        callback: function (value) {
          if (value === 500) return '500';
          if (value === -500) return '-500';
          return value;
        },
      },
      border: {
        display: false,
      },
    },
  },
};

// Custom Tooltip
function CustomTooltip({ chart, tooltip, labels, doneData, cancelledData }) {
  if (!tooltip || !tooltip.opacity || !chart) return null;
  const { dataPoints } = tooltip;
  if (!dataPoints || dataPoints.length === 0) return null;
  const dp = dataPoints[0];
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
        top: tooltip.caretY + 20,
        background: '#D8E4F2',
        color: '#000',
        padding: '12px 24px',
        borderRadius: 12,
        boxShadow: '0 2px 8px #0001',
        pointerEvents: 'none',
        minWidth: 120,
        textAlign: 'center',
        zIndex: 100,
        transform: 'translate(0, 100%)',
      }}
    >
      <div className="text-[14px] font-[600]">{month} 2025</div>
      <div className="text-[16px] font-[700] text-[#000000]">
        <span className="font-[700] text-[16px]">{type} </span>{value}
      </div>
    </div>
  );
}

function BookingBarChart() {
  const chartRef = React.useRef();
  const [tooltipModel, setTooltipModel] = React.useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [selectedPeriod, setSelectedPeriod] = React.useState('Last 8 months');
  const [bookingData, setBookingData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const periodOptions = [
    'Last 3 months',
    'Last 6 months',
    'Last 8 months',
    'Last 12 months',
    'This year',
    'Last year'
  ];

  // Fetch booking data from API
  React.useEffect(() => {
    const fetchBookingData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get('/vendors/warehouse/api/bookings/chart-data', {
          params: { period: selectedPeriod }
        });

        if (response.data.success) {
          setBookingData(response.data.data || []);
        } else {
          setError('Failed to fetch booking data');
        }
      } catch (err) {
        console.error('Error fetching booking data:', err);
        setError('Error loading booking data');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [selectedPeriod]);

  // Process fetched data
  const labels = React.useMemo(() => bookingData.map((d) => d.name), [bookingData]);
  const doneData = React.useMemo(() => bookingData.map((d) => d.done), [bookingData]);
  const cancelledData = React.useMemo(() => bookingData.map((d) => -d.cancelled), [bookingData]);

  // Find the highest 'Done' bar index
  const maxDoneIndex = React.useMemo(() => {
    const maxValue = Math.max(...doneData);
    return doneData.indexOf(maxValue);
  }, [doneData]);

  // Create chart data based on filtered data
  const data = React.useMemo(() => ({
    labels,
    datasets: [
      {
        label: "Done",
        data: doneData,
        backgroundColor: "#0955AC",
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
  }), [labels, doneData, cancelledData]);

  // Handle clicks outside dropdown to close it
  React.useEffect(() => {
    if (!isDropdownOpen) return;
    
    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  // Custom tooltip handler - update when data changes
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

    // Show tooltip for the highest 'Done' bar when data changes
    setTimeout(() => {
      if (!chart || doneData.length === 0) return;
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
    }, 500); // Delay to ensure chart is rendered
  }, [selectedPeriod, maxDoneIndex, doneData.length]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-stretch relative px-8 pt-8 pb-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0955AC] mx-auto mb-4"></div>
            <p className="text-[#7B7B7A] text-[16px]">Loading booking data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-stretch relative px-8 pt-8 pb-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-[18px] font-[600] mb-2">Error</div>
            <p className="text-[#7B7B7A] text-[16px]">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-[#0955AC] text-white px-4 py-2 rounded-lg hover:bg-[#0845A0] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-stretch relative px-8 pt-8 pb-4">
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
      </div>


      <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="bg-[#F3F3F3] rounded-lg px-3 sm:px-4 py-1 sm:py-2 flex flex-row items-center gap-2 text-[14px] sm:text-[16px] font-[500] text-[#7B7B7A] shadow-none border-none outline-none hover:bg-[#E8E8E8] transition-colors"
        >
          {selectedPeriod}
          <img
            src={miniDownArrow}
            alt="dropdown"
            className={`w-3 sm:w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-[120px] sm:min-w-[160px]">
            {periodOptions.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setSelectedPeriod(option);
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-[14px] font-[500] hover:bg-gray-50 transition-colors ${selectedPeriod === option ? 'text-[#0955AC] bg-blue-50' : 'text-[#7B7B7A]'
                  }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative w-full" style={{ height: `300px` }}>
        {bookingData.length > 0 ? (
          <>
            <Bar
              ref={chartRef}
              data={data}
              options={options}
            />
            {tooltipModel && <CustomTooltip chart={tooltipModel.chart} tooltip={tooltipModel} labels={labels} doneData={doneData} cancelledData={cancelledData} />}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#7B7B7A] text-[16px]">No booking data available for the selected period</p>
          </div>
        )}
      </div>
    </div>

  );
}

export default BookingBarChart;