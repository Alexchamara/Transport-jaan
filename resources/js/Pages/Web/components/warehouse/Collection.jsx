import React from "react";
import card1 from "../../assets/warehouse/card1.svg";

import icon1 from "../../assets/warehouse/icon1.svg";
import icon2 from "../../assets/warehouse/icon2.svg";
import icon3 from "../../assets/warehouse/icon3.svg";
import icon4 from "../../assets/warehouse/icon4.svg";

import heart from "../../assets/warehouse/heart.svg";

const warehouses = [
    {
        name: "Warehouse A",
        location: "Galle Rd, Colombo 03",
        sqft: "2500sqft",
        status: "Available",
        power: "220V",
        security: "CCTV",
        price: "89.00",
        image: card1,
    },
    {
        name: "Warehouse B",
        location: "Kandy Rd, Colombo 07",
        sqft: "3000sqft",
        status: "Available",
        power: "220V",
        security: "CCTV",
        price: "120.00",
        image: card1,
    },
    {
        name: "Warehouse C",
        location: "Duplication Rd, Colombo 04",
        sqft: "2000sqft",
        status: "Unavailable",
        power: "110V",
        security: "CCTV",
        price: "75.00",
        image: card1,
    },
    {
        name: "Warehouse D",
        location: "High Level Rd, Nugegoda",
        sqft: "5000sqft",
        status: "Available",
        power: "220V",
        security: "CCTV",
        price: "200.00",
        image: card1,
    },
    {
        name: "Warehouse E",
        location: "Main St, Pettah",
        sqft: "3500sqft",
        status: "Available",
        power: "220V",
        security: "CCTV",
        price: "150.00",
        image: card1,
    },
    {
        name: "Warehouse F",
        location: "Negombo Rd, Wattala",
        sqft: "2700sqft",
        status: "Unavailable",
        power: "220V",
        security: "CCTV",
        price: "99.00",
        image: card1,
    },
    {
        name: "Warehouse G",
        location: "Matara Rd, Galle",
        sqft: "4000sqft",
        status: "Available",
        power: "220V",
        security: "CCTV",
        price: "180.00",
        image: card1,
    },
    {
        name: "Warehouse H",
        location: "Katunayake Free Trade Zone",
        sqft: "6000sqft",
        status: "Available",
        power: "220V",
        security: "CCTV",
        price: "250.00",
        image: card1,
    },
];

const Collection = () => {
    return (
        <div className="flex flex-col justify-center items-center px-20 py-10">
            <h1 className="text-[40px] font-[400] bebas-neue">
                Our{" "}
                <span className="text-[#0955AC]">Impressive Collection</span> of
                Warehouses
            </h1>
            <p className="poppins text-[#0F0F0F94] text-[15px] text-center">
                Ranging from elegant sedans to powerful vehicles, all carefully
                selected to provide our customers <br /> with the ultimate
                driving experience.
            </p>
            <div className="flex flex-col gap-10 py-10 w-full">
                {/** chunk into rows of 4 */}
                {warehouses
                    .reduce((rows, item, index) => {
                        if (index % 4 === 0) rows.push([]);
                        rows[rows.length - 1].push(item);
                        return rows;
                    }, [])
                    .map((row, rowIndex) => (
                        <div
                            key={rowIndex}
                            className="flex md:flex-row flex-col gap-10 justify-center items-center"
                        >
                            {row.map((warehouse, index) => (
                                <div
                                    key={index}
                                    className="bg-[#F4F3F3] w-[250px]"
                                >
                                    <img
                                        src={warehouse.image}
                                        alt={warehouse.name}
                                    />
                                    <div className="bebas-neue px-5">
                                        <h1 className="text-[20px] pt-3">
                                            {warehouse.name}
                                        </h1>
                                        <h1 className="text-[11px] poppins">
                                            {warehouse.location}
                                        </h1>

                                        <div className="flex flex-row justify-between text-[10px] poppins text-[#0000004D] font-[600] py-5 border-b-[0.5px]">
                                            <div className="flex flex-col justify-center items-center gap-2">
                                                <img src={icon1} alt="sqft" />
                                                <h1>{warehouse.sqft}</h1>
                                            </div>
                                            <div className="flex flex-col justify-center items-center gap-2">
                                                <img src={icon2} alt="status" />
                                                <h1>{warehouse.status}</h1>
                                            </div>
                                            <div className="flex flex-col justify-center items-center gap-2">
                                                <img src={icon3} alt="power" />
                                                <h1>{warehouse.power}</h1>
                                            </div>
                                            <div className="flex flex-col justify-center items-center gap-2">
                                                <img
                                                    src={icon4}
                                                    alt="security"
                                                />
                                                <h1>{warehouse.security}</h1>
                                            </div>
                                        </div>

                                        <div className="py-5 poppins px-5">
                                            <div className="flex flex-row justify-between text-[25px] font-[700]">
                                                <h1>
                                                    ${(warehouse.monthly_rate || warehouse.price)?.toLocaleString() || '0'}{" "}
                                                    <span className="text-[10px] font-[600] text-[#00000080]">
                                                        / month
                                                    </span>
                                                </h1>
                                                <img
                                                    src={heart}
                                                    alt="favorite"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
            </div>
            <div>
               <div className="w-[150px] h-[45px] p-4 text-[#FFFFFF] text-[16px] font-[700] figtree bg-[#0955AC] flex justify-center items-center rounded-[9px] cursor-pointer uppercase">
                    View More
               </div>
            </div>
        </div>
    );
};

export default Collection;
