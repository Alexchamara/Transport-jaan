import React from "react";
import Avatar from "../../../assets/superAdmin/Avatars.svg";

const TeamProgress = () => {
    const mockData = [
        { name: "Jhone Carter", email: "contact@sophiemoore.com", price: "$1099.00" },
        { name: "Emma Wilson", email: "emma@example.com", price: "$850.50" },
        { name: "Liam Smith", email: "liam@team.com", price: "$1295.25" },
    ];

    return (
        <div className="flex flex-col poppins ">
            <h1 className="text-white px-6 py-6">Team Progress</h1>
            <div className="flex flex-col gap-4">
                <div className="flex flex-row justify-between">
                    <h2 className="text-white text-[10px] px-6">Service</h2>
                    <h2 className="text-white text-[10px] px-6">Price</h2>
                </div>
                {mockData.map((item, index) => (
                    <div key={index} className="flex flex-row justify-between items-center px-4">
                        <div className="flex flex-row gap-1">
                            <img src={Avatar} alt="avatar" />
                            <div className="flex flex-col">
                                <h2 className="text-white text-[12px] font-600">
                                    {item.name}
                                </h2>
                                <h2 className="text-[#AEB9E1] text-[10px] font-500">
                                    {item.email}
                                </h2>
                            </div>
                        </div>
                        <h2 className="text-white text-[12px] font-600">
                            {item.price}
                        </h2>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeamProgress;