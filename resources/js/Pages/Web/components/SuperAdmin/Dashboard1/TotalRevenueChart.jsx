import React from "react";
import externalR from "../../../assets/superAdmin/Arrow External Right.png";
import dotW from "../../../assets/superAdmin/dotW.png";
import dotB from "../../../assets/superAdmin/dotB.png";
import calendar from "../../../assets/superAdmin/Calendar Icon.png";
import dropD from "../../../assets/superAdmin/Chevron Down.png";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const TotalRevenueChart = () => {
  const data = [
    { month: "Jan", revenue: 25, expenses: 20 },
    { month: "Feb", revenue: 15, expenses: 30 },
    { month: "Mar", revenue: 40, expenses: 50 },
    { month: "Apr", revenue: 85, expenses: 70 },
    { month: "May", revenue: 100, expenses: 90 },
    { month: "Jun", revenue: 95, expenses: 120 },
    { month: "Jul", revenue: 130, expenses: 150 },
    { month: "Aug", revenue: 160, expenses: 100 },
    { month: "Sep", revenue: 110, expenses: 130 },
    { month: "Oct", revenue: 190, expenses: 160 },
    { month: "Nov", revenue: 220, expenses: 140 },
    { month: "Dec", revenue: 250, expenses: 70 },
  ];

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const revenue = payload.find((p) => p.dataKey === "revenue")?.value || 0;
      const expenses = payload.find((p) => p.dataKey === "expenses")?.value || 0;
      const currentTotal = revenue + expenses;

      const index = data.findIndex((d) => d.month === label);
      let percentageChange = "0%";
      if (index > 0) {
        const prevRevenue = data[index - 1].revenue;
        const prevExpenses = data[index - 1].expenses;
        const prevTotal = prevRevenue + prevExpenses;
        const change = currentTotal - prevTotal;
        percentageChange =
          prevTotal !== 0
            ? `${((change / prevTotal) * 100).toFixed(1)}%`
            : "0%";
      }

      return (
        <div
          style={{
            background: "#0B1739",
            border: "1px solid #0B1739",
            padding: "14px",
            color: "#fff",
            borderRadius: "5px",
          }}
        >
          <div style={{ fontSize: "16px", fontWeight: "bold" }}>
            ${currentTotal}K{" "}
            <span
              style={{
                display: "inline-block",
                marginLeft: "5px",
                border: "1px solid #05C16833",
                backgroundColor: "#05C16833",
                borderRadius: "5px",
                padding: "3px 6px",
                fontSize: "12px",
                color: "#14CA74",
                fontWeight: "500",
              }}
            >
              {percentageChange}
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "#AEB9E1", marginTop: "4px" }}>
            {label} 1, 2024
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className=" bg-[#0B1739] p-5 shadow-lg h-[557px] min-w-[675px] pb-[120px]">
      {/* Header */}
      <div className="flex flex-row justify-center items-center w-full mb-7">
        <div className="flex flex-col w-full">
          <h2 className="text-[#AEB9E1] text-lg flex flex-row justify-between items-center">
            Total revenue
          </h2>
          <div className="flex flex-row items-center gap-2">
            <h1 className="text-white text-[32px] font-bold">$240.8K</h1>
            <div className="w-[50px] h-[20px] flex justify-center items-center border border-[#05C16833] bg-[#05C16833] rounded-[5px] ">
              <h1 className=" flex items-baseline text-green-400 text-[9px] font-medium">
                24.6%
              </h1>
              <img
                src={externalR}
                className="size-[9px] md:w-[10px]"
                alt="external link"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-6 w-full pr-6">
          <div className="flex flex-row gap-6">
            <div className="flex flex-row items-center gap-2 ">
              <img src={dotW} alt="dot" />
              <h1 className="text-[#AEB9E1] text-[12px]">Revenue</h1>
            </div>
            <div className="flex flex-row items-center gap-2 ">
              <img src={dotB} alt="dot" />
              <h1 className="text-[#AEB9E1] text-[12px]">Expenses</h1>
            </div>
          </div>
          <div className="flex flex-row items-center gap-1 w-full h-[30px] border border-[#0A1330] bg-[#0A1330] px-1">
            <img src={calendar} alt="calendar" />
            <h1 className="text-[#AEB9E1] text-[10px] font-medium ">
              Jan 2024 - Dec 2024
            </h1>
            <img src={dropD} alt="dropdown" />
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
        
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#575dff" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#575dff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expensesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00c2ff" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#00c2ff" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="month"
            stroke="#94a3b8"
            axisLine={false}
            tickLine={false}
            padding={{ left: 20, right: 20 }}
          />
          <YAxis
            stroke="#94a3b8"
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}K`}
            domain={[0, 300]}
            padding={{ left: 20, right: 20 }}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Filled Areas with line strokes */}
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#ffffff"
            strokeWidth={2}
            fill="url(#revenueFill)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke="#00c2ff"
            strokeWidth={2}
            fill="url(#expensesFill)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TotalRevenueChart;
