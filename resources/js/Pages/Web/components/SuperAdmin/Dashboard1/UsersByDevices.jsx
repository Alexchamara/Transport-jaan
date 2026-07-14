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
    <div className=" rounded-[10px] bg-[#0B1739] p-5 pb-[40px] shadow-lg min-w-[513.4091796875px] flex flex-col justify-center">
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
      </ResponsiveContainer>
      <div className="text-center -mt-[220px]">
        <h1 className="text-white text-[32px] font-bold">23,648</h1>
        <p className="text-[#AEB9E1] text-lg">Users by device</p>
      </div>
      <div className="mt-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-3 h-3 bg-[#ffffff] rounded-full"></span>
          <span className="text-[#AEB9E1] text-sm">Desktop users</span>
          <span className="text-white ml-auto">15,624</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-3 h-3 bg-[#00b4d8] rounded-full"></span>
          <span className="text-[#AEB9E1] text-sm">Phone app users</span>
          <span className="text-white ml-auto">5,546</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-[#00d4ff] rounded-full"></span>
          <span className="text-[#AEB9E1] text-sm">Laptop users</span>
          <span className="text-white ml-auto">2,478</span>
        </div>
      </div>
    </div>
  );
};

export default UsersByDeviceChart;