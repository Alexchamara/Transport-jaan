import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const UsersByDeviceChart = () => {
  const data = [
    { name: "Desktop users", value: 15624 },
    { name: "Phone app users", value: 5546 },
    { name: "Laptop users", value: 2478 },
  ];

  const COLORS = ["#ffffff", "#0038FF", "#00C2FF"];

  return (
    <div className="w-full h-[264px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={100}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
            startAngle={180}
            endAngle={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
        <div className="text-center -mt-[180px]">
          <h1 className="text-white text-[32px] font-bold">80%</h1>
          <p className="text-[#AEB9E1] text-lg">Transactions</p>
        </div>
      </ResponsiveContainer>

      <div className="flex flex-row justify-center gap-6 -mt-[50px]">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-3 h-3 bg-[#ffffff] rounded-full"></span>
          <span className="text-[#AEB9E1] text-sm">Sell</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-3 h-3 bg-[#00b4d8] rounded-full"></span>
          <span className="text-[#AEB9E1] text-sm">Distribute</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#00d4ff] rounded-full"></span>
          <span className="text-[#AEB9E1] text-sm">Return</span>
        </div>
      </div>
    </div>
  );
};

export default UsersByDeviceChart;