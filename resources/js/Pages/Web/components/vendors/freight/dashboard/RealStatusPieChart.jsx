import React from "react";
import { PieChart, Pie, Cell } from "recharts";

import up from "../../../assets/vendors/dashboard/icons/up.svg"
import down from "../../../assets/vendors/dashboard/icons/down.svg"


const data = [
  { name: "Hired", value: 46, color: "#3DD0FF", arrow: up, arrowAlt: "up", change: "up" },
  { name: "Pending", value: 27, color: "#0955AC", arrow: down, arrowAlt: "down", change: "down" },
  { name: "Cancelled", value: 14, color: "#C4C4C4", arrow: up, arrowAlt: "up", change: "up" },
];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  // No label in the center for this design
  return null;
};

const RealStatusPieChart = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <PieChart width={172} height={171}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          startAngle={200}
          endAngle={-160}
          paddingAngle={6}
          dataKey="value"
          label={renderCustomizedLabel}
          stroke="none"
          strokeWidth={0}
          cornerRadius={6}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
      <div className="flex flex-col gap-2 mt-6 w-full">
        {data.map((entry, idx) => (
          <div key={entry.name} className="flex flex-row items-center justify-between w-full mb-1">
            <div className="flex flex-row items-center gap-2">
              <span className=" w-5 h-5 rounded bg-[#E8EBEF] flex items-center justify-center" style={{ backgroundColor: entry.color }}></span>
              <span className="text-[20px] font-[600] text-[#00000080]">{entry.name}</span>
            </div>
            <div className="flex flex-row items-center gap-2">
              <span className="text-[20px] font-[600] text-[#000000]">{entry.value}%</span>
              {entry.change === "up" ? (
                <img src={entry.arrow} alt={entry.arrowAlt} className="w-4 h-4" />
              ) : (
                <img src={entry.arrow} alt={entry.arrowAlt} className="w-4 h-4" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealStatusPieChart; 