import React from "react";
import { router } from "@inertiajs/react";

const TrainResults = ({ searchParams }) => {
    const trainResults = [
        {
            id: 1,
            trainName: "Udarata Menike - Galle to Jaffna",
            runsOn: "Everyday",
            departure: {
                date: "Nov 16",
                time: "11:25 pm",
                location: "Colombo Fort",
            },
            arrival: {
                date: "Nov 17",
                time: "7:25 am",
                location: "Jaffna Station",
            },
            travelTime: "8 hours",
            classes: [
                {
                    type: "Economy",
                    tatkal: true,
                    price: 250,
                    available: true,
                },
                {
                    type: "Second Class",
                    tatkal: true,
                    price: 450,
                    available: true,
                },
                {
                    type: "1st Class",
                    tatkal: false,
                    price: null,
                    available: false,
                },
            ],
        },
        {
            id: 2,
            trainName: "Ruhunu Kumari - Matara to Badulla",
            runsOn: "Weekdays",
            departure: {
                date: "Nov 16",
                time: "8:30 am",
                location: "Matara Station",
            },
            arrival: {
                date: "Nov 16",
                time: "4:45 pm",
                location: "Badulla Station",
            },
            travelTime: "8 hours 15 mins",
            classes: [
                {
                    type: "Economy",
                    tatkal: true,
                    price: 280,
                    available: true,
                },
                {
                    type: "Second Class",
                    tatkal: true,
                    price: 480,
                    available: true,
                },
                {
                    type: "1st Class",
                    tatkal: true,
                    price: 850,
                    available: true,
                },
            ],
        },
        {
            id: 3,
            trainName: "Yal Devi - Colombo to Jaffna",
            runsOn: "Everyday",
            departure: {
                date: "Nov 16",
                time: "5:45 am",
                location: "Colombo Fort",
            },
            arrival: {
                date: "Nov 16",
                time: "2:30 pm",
                location: "Jaffna Station",
            },
            travelTime: "8 hours 45 mins",
            classes: [
                {
                    type: "Economy",
                    tatkal: true,
                    price: 300,
                    available: true,
                },
                {
                    type: "Second Class",
                    tatkal: true,
                    price: 500,
                    available: true,
                },
                {
                    type: "1st Class",
                    tatkal: true,
                    price: 900,
                    available: true,
                },
            ],
        },
        {
            id: 4,
            trainName: "Podi Menike - Colombo to Badulla",
            runsOn: "Everyday",
            departure: {
                date: "Nov 16",
                time: "9:45 am",
                location: "Colombo Fort",
            },
            arrival: {
                date: "Nov 16",
                time: "7:30 pm",
                location: "Badulla Station",
            },
            travelTime: "9 hours 45 mins",
            classes: [
                {
                    type: "Economy",
                    tatkal: true,
                    price: 270,
                    available: true,
                },
                {
                    type: "Second Class",
                    tatkal: true,
                    price: 470,
                    available: true,
                },
                {
                    type: "1st Class",
                    tatkal: false,
                    price: null,
                    available: false,
                },
            ],
        },
        {
            id: 5,
            trainName: "Samudra Devi - Colombo to Galle",
            runsOn: "Everyday",
            departure: {
                date: "Nov 16",
                time: "6:30 am",
                location: "Colombo Fort",
            },
            arrival: {
                date: "Nov 16",
                time: "9:15 am",
                location: "Galle Station",
            },
            travelTime: "2 hours 45 mins",
            classes: [
                {
                    type: "Economy",
                    tatkal: true,
                    price: 180,
                    available: true,
                },
                {
                    type: "Second Class",
                    tatkal: true,
                    price: 380,
                    available: true,
                },
                {
                    type: "1st Class",
                    tatkal: true,
                    price: 680,
                    available: true,
                },
            ],
        },
    ];

    return (
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8">
            {/* Search Summary */}
            <div className="mb-8 mt-8">
                <h2 className="bebas-neue text-[40px]/[58px] font-[400] mb-4 uppercase">
                    Train <span className="text-[#0955AC]">results</span>
                </h2>
            </div>

            {/* Results List with Scrollbar */}
            <div className="poppins space-y-20 max-h-[800px] overflow-x-hidden pr-8 pl-2 custom-scrollbar">
                {trainResults.map((train) => (
                    <div
                        key={train.id}
                        className="bg-white xl:w-[900px] xl:h-[330px] rounded-[10px] shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
                    >
                        <div className="flex flex-col">
                            {/* Train Info */}
                            <div>
                                <div className="flex items-center gap-4 mb-2">
                                    <h3 className="text-[16px] font-[500] text-gray-800">
                                        {train.trainName}
                                    </h3>
                                </div>
                                <div className="flex flex-col md:flex-row justify-between mb-4">
                                    <div className="flex flex-col">
                                        <span className="text-[14px] font-[500]">
                                            Runs on
                                        </span>
                                        <span className={`mt-2 px-3 py-1 w-[95px] h-[31px] rounded-[8px] text-[14px] font-[500] flex items-center justify-center ${
                                            train.runsOn === "Everyday" 
                                                ? "bg-[#ACFF9F]" 
                                                : "border-[1px] border-[#0578FF]"
                                        }`}>
                                            {train.runsOn}
                                        </span>
                                    </div>

                                    <a
                                        href="#"
                                        className="text-[#0578FF] text-[12px] font-[500] whitespace-nowrap"
                                    >
                                        View train time table
                                    </a>
                                </div>

                                {/* Time and Location */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="text-left text-[#202020] text-[14px] font-[400]">
                                        <div className="font-[500]">
                                            {train.departure.date}
                                        </div>
                                        <div className="">
                                            {train.departure.time}
                                        </div>
                                        <div className="">
                                            {train.departure.location}
                                        </div>
                                    </div>
                                    <div className="flex-1 mx-4 flex items-center justify-center relative">
                                        <span className="absolute bottom-3 text-[#80808080] text-[10px]">
                                            {train.travelTime}
                                        </span>
                                        <div className="w-full h-0.5 bg-[#808080BF]"></div>
                                        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full bg-[#808080BF]"></div>
                                        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-[#808080BF]"></div>
                                    </div>
                                    <div className="text-right text-[#202020] text-[14px] font-[400]">
                                        <div className="font-[500]">
                                            {train.arrival.date}
                                        </div>
                                        <div className="">
                                            {train.arrival.time}
                                        </div>
                                        <div className="">
                                            {train.arrival.location}
                                        </div>
                                    </div>
                                </div>

                                {/* Class Options */}
                                <div className="flex flex-col md:flex-row gap-4">
                                    {train.classes.map((cls, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-center justify-center flex-col gap-3 xl:w-[171px] xl:h-[96px] p-4 rounded-[10px] border-2 text-center ${
                                                cls.type === "1st Class" 
                                                    ? "border-[#FF8888]"
                                                    : cls.available
                                                        ? "border-transparent cursor-pointer"
                                                        : "border-[#FF8888] bg-white"
                                            } ${
                                                cls.type === "Economy" && cls.available
                                                    ? "bg-[#FFE9C8]"
                                                    : cls.type === "Second Class" && cls.available
                                                    ? "bg-[#FFCDCD]"
                                                    : cls.type === "1st Class" && cls.available
                                                    ? "bg-white"
                                                    : ""
                                            }`}
                                        >
                                            <p className="">
                                                {cls.type}
                                            </p>
                                            <div className="flex justify-center items-center gap-10">
                                                {cls.tatkal && (
                                                    <p className="">
                                                        Tatkal
                                                    </p>
                                                )}
                                                {cls.available ? (
                                                    <p className="">
                                                        Rs.{cls.price}
                                                    </p>
                                                ) : (
                                                    <p className="">
                                                        Not Available
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrainResults;
