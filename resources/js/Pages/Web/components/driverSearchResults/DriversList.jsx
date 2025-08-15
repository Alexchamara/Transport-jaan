import React, { useState } from "react";
import proPic from "../../assets/driverBooking/proPic.png";
import heartIcon from "../../assets/driverBooking/heart.svg";
import heartTwo from "../../assets/driverBooking/heart2.svg";
import leftArrow from "../../assets/driverBooking/left.svg";
import rightArrow from "../../assets/driverBooking/right.svg";
import { router } from "@inertiajs/react";

const drivers = [
    {
        name: "Steve Gibson",
        rides: 248,
        isProfessional: true,
        // Add more fields as needed
    },
    {
        name: "Steve Gibson",
        rides: 248,
        isProfessional: true,
    },
    {
        name: "Steve Gibson",
        rides: 248,
        isProfessional: true,
    },
    // Add more driver objects as needed
    {
        name: "Steve Gibson",
        rides: 248,
        isProfessional: true,
    },
    {
        name: "Steve Gibson",
        rides: 248,
        isProfessional: true,
    },
    {
        name: "Steve Gibson",
        rides: 248,
        isProfessional: true,
    },
    {
        name: "Steve Gibson",
        rides: 248,
        isProfessional: true,
    },
    {
        name: "Steve Gibson",
        rides: 248,
        isProfessional: true,
    },
    {
        name: "Steve Gibson",
        rides: 248,
        isProfessional: true,
    },
    {
        name: "Steve Gibson",
        rides: 248,
        isProfessional: true,
    },
    {
        name: "Steve Gibson",
        rides: 248,
        isProfessional: true,
    },
    {
        name: "Steve Gibson",
        rides: 248,
        isProfessional: true,
    },
    {
        name: "Steve Gibson",
        rides: 248,
        isProfessional: true,
    },
    {
        name: "Steve Gibson",
        rides: 248,
        isProfessional: true,
    },
];

const DriversList = () => {
    const [likedDrivers, setLikedDrivers] = useState(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    const toggleLike = (driverIndex) => {
        setLikedDrivers((prev) => {
            const newLiked = new Set(prev);
            if (newLiked.has(driverIndex)) {
                newLiked.delete(driverIndex);
            } else {
                newLiked.add(driverIndex);
            }
            return newLiked;
        });
    };

    // Calculate pagination (if needed)
    const totalPages = Math.ceil(drivers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentDrivers = drivers.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    return (
        <div className="w-full px-20 py-5">
            <h1 className="bebas-neue text-[40px]">
                we found{" "}
                <span className="text-[#0955AC]">
                    {" "}
                    {drivers.length} Drivers{" "}
                </span>
                for you
            </h1>

            {/* Driver Cards */}
            <div className="py-10 flex flex-wrap justify-center gap-10">
                {currentDrivers.map((driver, idx) => {
                    const globalIdx = startIndex + idx;
                    return (
                        <div
                            key={globalIdx}
                            className="xl:w-[286px] h-[349px] bg-[#F4F3F3] px-5 py-5 flex flex-col justify-center items-center"
                        >
                            <img src={proPic} />
                            <h1 className="bebas-neue text-[30px]">
                                {driver.name.split(" ")[0]}{" "}
                                <span className="text-[#0955AC]">
                                    {driver.name.split(" ")[1]}
                                </span>
                            </h1>
                            <h1 className="poppins text-[15px]/[24px] font-[700]">
                                {driver.rides}+ rides{" "}
                                <span className="text-[10px] font-[600] text-[#00000080]">
                                    /{" "}
                                    {driver.isProfessional
                                        ? "professional driver"
                                        : "driver"}
                                </span>
                            </h1>
                            <div className="flex flex-row gap-5 mt-3">
                                <button className="xl:w-[194px] w-full h-[30px] bg-[#0955AC] rounded-[4px] text-[#FFFFFF] bebas-neue text-[9px] font-[400]" onClick={() => router.visit('/driver-details', { data: { driver: driver } })}>
                                    More Details
                                </button>
                                <div
                                    className="size-[30px] border-[1.5px] border-[#0955AC] rounded-[4px] flex items-center justify-center cursor-pointer"
                                    onClick={() => toggleLike(globalIdx)}
                                >
                                    <img
                                        src={
                                            likedDrivers.has(globalIdx)
                                                ? heartTwo
                                                : heartIcon
                                        }
                                        alt="Heart"
                                        className="w-4 h-3.5"
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-end mt-3 gap-4 items-center px-[70px] pb-20">
                    {/* Previous Button */}
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`size-[40px] flex items-center justify-center rounded bg-[#F4F3F3] border-[1px] ${
                            currentPage === 1
                                ? "border-[#BEBEBE] cursor-not-allowed opacity-50"
                                : "cursor-pointer"
                        }`}
                        aria-label="Previous Page"
                    >
                        <img
                            src={leftArrow}
                            alt="Previous"
                            className="w-4 h-4"
                        />
                    </button>
                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 md:px-4 py-1.5 md:py-2 rounded text-sm md:text-base inter text-[16px] font-[600] size-[40px] ${
                                    currentPage === page
                                        ? "bg-[#F4F3F3] text-[#0955AC] border-[2px] border-[#0955AC]"
                                        : "bg-[#F4F3F3] border-[1px] border-[#BEBEBE] text-[#000000]"
                                }`}
                            >
                                {page}
                            </button>
                        )
                    )}
                    {/* Next Button */}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`size-[40px] flex items-center justify-center rounded bg-[#F4F3F3] border-[1px] ${
                            currentPage === totalPages
                                ? "border-[#BEBEBE] cursor-not-allowed opacity-50"
                                : " cursor-pointer"
                        }`}
                        aria-label="Next Page"
                    >
                        <img src={rightArrow} alt="Next" className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default DriversList;
