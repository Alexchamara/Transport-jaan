import React from "react";

const Service = () => {
    const mockData = [
        { name: "Vehicle rental", price: "$1099.00", stock: "524 in stock" },
        { name: "Warehouse Rental", price: "$799.00", stock: "320 in stock" },
    ];

    return (
        <div className="flex flex-col poppins">
            <h1 className="text-white px-6 py-6">Service</h1>
            <div className="flex flex-col gap-8">
                <div className="flex flex-row justify-between items-center">
                    <h2 className="text-white text-[10px] px-6">Service</h2>
                    <h2 className="text-white text-[10px] px-6">Price</h2>
                </div>
                {mockData.map((item, index) => (
                    <div key={index} className="flex flex-row justify-between">
                        <div className="flex flex-col justify-center">
                            <h2 className="text-white text-[12px] font-600 px-6">
                                {item.name}
                            </h2>
                            <h2 className="text-[#AEB9E1] text-[10px] font-500 px-6">
                                {item.stock}
                            </h2>
                        </div>
                        <h2 className="text-white text-[12px] font-600 px-6">
                            {item.price}
                        </h2>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Service;