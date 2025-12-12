import React from "react";
import card1 from "../../../assets/landingPages/blog/card1.svg";
import card2 from "../../../assets/landingPages/blog/card2.svg";
import card3 from "../../../assets/landingPages/blog/card3.svg";
import card4 from "../../../assets/landingPages/blog/card4.svg";
import card5 from "../../../assets/landingPages/blog/card5.svg";
import card6 from "../../../assets/landingPages/blog/card6.svg";

const Categories = () => {
    return (
        <div className="xl:px-40 px-5 py-20">
            <div className="flex flex-row justify-center items-center xl:pl-20">
                <div className="w-[155px] h-[37px] bg-[#286BB6] rounded-[3px] flex justify-center items-center text-[12px] font-[600] p-3">
                    <h1>Exciting Categories</h1>
                </div>
                <div className="w-full h-[5px] border-y-[1px] border-[#DFDFDF]"></div>
            </div>
            <div className="py-10 flex lg:flex-row flex-col justify-between gap-5 items-center">
                {/* card 1 */}
                <div
                    className="size-[180px] flex justify-center items-end cursor-pointer p-5"
                    style={{ backgroundImage: `url(${card1})` }}
                >
                    <div className="w-[99px] h-[27px] bg-[#D9D9D945] flex justify-center items-center rounded-[4px] text-[12px] font-[600]">
                        Freight
                    </div>
                </div>
                {/* card 2 */}
                <div
                    className="size-[180px] flex justify-center items-end cursor-pointer p-5"
                    style={{ backgroundImage: `url(${card2})` }}
                >
                    <div className="w-[99px] h-[27px] bg-[#D9D9D945] flex justify-center items-center rounded-[4px] text-[12px] font-[600]">
                        Flight Booking
                    </div>
                </div>
                {/* card 3 */}
                <div
                    className="size-[180px] flex justify-center items-end cursor-pointer p-5"
                    style={{ backgroundImage: `url(${card3})` }}
                >
                    <div className="w-[99px] h-[27px] bg-[#D9D9D945] flex justify-center items-center rounded-[4px] text-[12px] font-[600]">
                        Shipments
                    </div>
                </div>
                {/* card 4 */}
                <div
                    className="size-[180px] flex justify-center items-end cursor-pointer p-5"
                    style={{ backgroundImage: `url(${card4})` }}
                >
                    <div className="w-[99px] h-[27px] bg-[#D9D9D945] flex justify-center items-center rounded-[4px] text-[12px] font-[600]">
                        Freight
                    </div>
                </div>
                {/* card 5 */}
                <div
                    className="size-[180px] flex justify-center items-end cursor-pointer p-5"
                    style={{ backgroundImage: `url(${card5})` }}
                >
                    <div className="w-[99px] h-[27px] bg-[#D9D9D945] flex justify-center items-center rounded-[4px] text-[12px] font-[600]">
                        Warehouse
                    </div>
                </div>
                {/* card 6 */}
                <div
                    className="size-[180px] flex justify-center items-end cursor-pointer p-5"
                    style={{ backgroundImage: `url(${card6})` }}
                >
                    <div className="w-[99px] h-[27px] bg-[#D9D9D945] flex justify-center items-center rounded-[4px] text-[12px] font-[600]">
                        Train
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Categories;
