import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import location from "../../../assets/multiModel/planJourney/location.svg";
import locationRed from "../../../assets/multiModel/planJourney/locationRed.svg";
import calander from "../../../assets/multiModel/planJourney/calander.svg";
import calanderTwo from "../../../assets/multiModel/planJourney/calanderTwo.svg";
import clock from "../../../assets/multiModel/planJourney/clock.svg";
import clockTwo from "../../../assets/multiModel/planJourney/clockTwo.svg";

import downArrow from "../../../assets/multiModel/planJourney/downArrow.svg";

import dots from "../../../assets/multiModel/planJourney/dots.svg";
import close from "../../../assets/multiModel/planJourney/close.svg";
import plus from "../../../assets/multiModel/planJourney/plus.svg";
import leftArrow from "../../../assets/multiModel/planJourney/leftArrow.svg";
import alert from "../../../assets/multiModel/planJourney/alert.svg";

const JourneyPlanner = ({ transportMode = "car" }) => {
    const [activeView, setActiveView] = useState("journey");
    const [showPopup, setShowPopup] = useState(false);
    const [stopData, setStopData] = useState({
        destination: "",
        departureDate: "",
        departureTime: "",
        returnDate: "",
        returnTime: "",
    });
    const [addedStops, setAddedStops] = useState([]);
    const [editingStopId, setEditingStopId] = useState(null);
    const [editScheduleData, setEditScheduleData] = useState({
        departureDate: "",
        departureTime: "",
        returnDate: "",
        returnTime: "",
    });

    const [startJourney, setStartJourney] = useState({
        location: "",
        startDate: "",
        startTime: "",
    });

    const [endJourney, setEndJourney] = useState({
        location: "",
        returnDate: "",
        returnTime: "",
    });

    useEffect(() => {
        const savedStart = localStorage.getItem("journeyStart");
        if (savedStart) {
            setStartJourney(JSON.parse(savedStart));
        }
        const savedStops = localStorage.getItem("journeyStops");
        if (savedStops) {
            setAddedStops(JSON.parse(savedStops));
        }
        const savedEnd = localStorage.getItem("journeyEnd");
        if (savedEnd) {
            setEndJourney(JSON.parse(savedEnd));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("journeyStart", JSON.stringify(startJourney));
    }, [startJourney]);

    useEffect(() => {
        localStorage.setItem("journeyStops", JSON.stringify(addedStops));
    }, [addedStops]);

    useEffect(() => {
        localStorage.setItem("journeyEnd", JSON.stringify(endJourney));
    }, [endJourney]);

    const handleAddStop = () => {
        setShowPopup(true);
    };

    const handleClosePopup = () => {
        setShowPopup(false);
        setStopData({
            destination: "",
            departureDate: "",
            departureTime: "",
            returnDate: "",
            returnTime: "",
        });
    };

    const handleInputChange = (field, value) => {
        setStopData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSaveStop = () => {
        // Here you can handle saving the stop data
        console.log("Stop data:", stopData);
        setAddedStops((prev) => [...prev, { ...stopData, id: Date.now() }]);
        handleClosePopup();
    };

    const handleEditSchedule = (stopId) => {
        const stop = addedStops.find((s) => s.id === stopId);
        if (stop) {
            setEditingStopId(stopId);
            setEditScheduleData({
                departureDate: stop.departureDate || "",
                departureTime: stop.departureTime || "",
                returnDate: stop.returnDate || "",
                returnTime: stop.returnTime || "",
            });
        }
    };

    const handleCloseEditPopup = () => {
        setEditingStopId(null);
        setEditScheduleData({
            departureDate: "",
            departureTime: "",
            returnDate: "",
            returnTime: "",
        });
    };

    const handleEditInputChange = (field, value) => {
        setEditScheduleData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSaveEditSchedule = () => {
        setAddedStops((prev) =>
            prev.map((stop) =>
                stop.id === editingStopId
                    ? { ...stop, ...editScheduleData }
                    : stop
            )
        );
        handleCloseEditPopup();
    };

    const handleRemoveStop = (stopId) => {
        setAddedStops((prev) => prev.filter((stop) => stop.id !== stopId));
    };

    return (
        <>
            <div className="relative w-full h-full rounded-b-[0px] xl:rounded-bl-[20px] xl:rounded-br-[0px] bg-[#F4F3F3] flex flex-col justify-center items-center shadow-lg rounded-[20px] p-5">
                <div className="w-full flex flex-row gap-2 justify-start items-start mb-5">
                    <img
                        src={leftArrow}
                        onClick={() => window.history.back()}
                        className="cursor-pointer"
                    />
                    <div>
                        <h1 className="bebas-neue text-[50px]/[100%]">
                            Plan <span className="text-[#0955AC]">Your</span>{" "}
                            Journey
                        </h1>
                        <h3 className="text-[14px] font-[500] text-[#00000080]">
                            Planning your multi - stop journey
                        </h3>
                    </div>
                </div>

                <div
                    className="text-[#0955AC] poopins flex flex-col h-[570px] overflow-y-auto w-full gap-5"
                    style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                    }}
                >
                    {activeView === "journey" ? (
                        <>
                            <div className="w-full h-auto border-[1.5px] border-[#B9F8CF] bg-[#F0FDF4] rounded-[14px] p-5">
                                <div className="flex flex-col gap-5 w-full">
                                    <label className="text-[16px]/[24px] font-[400]">
                                        Start of Journey
                                    </label>
                                    <div className="w-full xl:h-[49px] bg-[#FFFFFF] border border-[#D1D5DC] rounded-[10px] px-3 flex flex-row items-center gap-3">
                                        <img src={location} />
                                        <input
                                            type="text"
                                            value={startJourney.location}
                                            onChange={(e) =>
                                                setStartJourney((prev) => ({
                                                    ...prev,
                                                    location: e.target.value,
                                                }))
                                            }
                                            className="placeholder:text-[#00000033] border-none focus:ring-0 bg-transparent focus:outline-none placeholder:text-[12px] w-full"
                                        />
                                        <img
                                            src={downArrow}
                                            className="ml-auto"
                                        />
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-5">
                                        <div>
                                            <label className="text-[14px]/[24px] font-[400] mb-1">
                                                Start Date
                                            </label>
                                            <div className="w-full xl:h-[49px] bg-[#FFFFFF] border border-[#D1D5DC] rounded-[10px] px-3 flex flex-row items-center gap-3">
                                                <input
                                                    type="text"
                                                    value={
                                                        startJourney.startDate
                                                    }
                                                    onChange={(e) =>
                                                        setStartJourney(
                                                            (prev) => ({
                                                                ...prev,
                                                                startDate:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    className="placeholder:text-[#00000033] border-none focus:ring-0 bg-transparent focus:outline-none placeholder:text-[12px] w-full"
                                                />
                                                <img
                                                    src={calander}
                                                    className="ml-auto"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[14px]/[24px] font-[400] mb-1">
                                                Start Time
                                            </label>
                                            <div className="w-full xl:h-[49px] bg-[#FFFFFF] border border-[#D1D5DC] rounded-[10px] px-3 flex flex-row items-center gap-3">
                                                <input
                                                    type="text"
                                                    value={
                                                        startJourney.startTime
                                                    }
                                                    onChange={(e) =>
                                                        setStartJourney(
                                                            (prev) => ({
                                                                ...prev,
                                                                startTime:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    className="placeholder:text-[#00000033] border-none focus:ring-0 bg-transparent focus:outline-none placeholder:text-[12px] w-full"
                                                />
                                                <img
                                                    src={clock}
                                                    className="ml-auto"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {addedStops.map((stop, index) => (
                                <div
                                    key={stop.id}
                                    className="w-full bg-[#F9FAFB] rounded-[14px] flex flex-col gap-5 border-[1.5px] border-[#E5E7EB] p-5"
                                >
                                    <label className="text-[16px]/[24px] font-[400]">
                                        Stop {index + 1}
                                    </label>
                                    <div className="flex flex-row gap-2 items-start">
                                        <img src={dots} className="mr-3" />
                                        <input
                                            type="text"
                                            value={stop.destination || ""}
                                            className="w-full xl:h-[49px] bg-[#FFFFFF] border border-[#D1D5DC] rounded-[10px] px-3 placeholder:text-[#00000033] focus:ring-0 focus:outline-none placeholder:text-[12px]"
                                            readOnly
                                        />
                                        <img
                                            src={close}
                                            className="ml-auto cursor-pointer"
                                            onClick={() =>
                                                handleRemoveStop(stop.id)
                                            }
                                        />
                                    </div>
                                    <div
                                        className="w-full h-[51px] border-[1.6px] border-[#155DFC] rounded-[4px] flex flex-row justify-center items-center gap-2 cursor-pointer px-4 py-2"
                                        onClick={() =>
                                            handleEditSchedule(stop.id)
                                        }
                                    >
                                        <img
                                            src={calanderTwo}
                                            className="hidden md:block"
                                        />
                                        <img
                                            src={clockTwo}
                                            className="hidden md:block"
                                        />
                                        <h1 className="text-[16px]/[24px] font-[500] text-[#155DFC]">
                                            Edit Schedule
                                        </h1>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-5">
                                        <div className="w-full h-auto text-[14px] font-[400] border-[0.8px] border-[#7BF1A8] bg-[#DCFCE7] rounded-[10px] p-3 cursor-pointer">
                                            <h1 className="text-[#008236]">
                                                Departure
                                            </h1>
                                            <h1 className="text-[#1E2939]">
                                                {stop.departureDate ||
                                                    "2025-11-12"}{" "}
                                                at{" "}
                                                {stop.departureTime || "10:00"}
                                            </h1>
                                        </div>
                                        <div className="w-full h-auto text-[14px] font-[400] border-[0.8px] border-[#FFA2A2] bg-[#FFE2E2] rounded-[10px] p-3 cursor-pointer">
                                            <h1 className="text-[#C10007]">
                                                Return
                                            </h1>
                                            <h1 className="text-[#1E2939]">
                                                {stop.returnDate ||
                                                    "2025-11-14"}{" "}
                                                at {stop.returnTime || "10:00"}
                                            </h1>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="w-full h-auto text-[#155DFC] bg-[#FEF2F2] rounded-[14px] border-[1.5px] border-[#FFC9C9] p-5">
                                <div className="flex flex-col gap-5 w-full">
                                    <label className="text-[16px]/[24px] font-[400]">
                                        End of Journey
                                    </label>
                                    <div className="w-full xl:h-[49px] bg-[#FFFFFF] border border-[#D1D5DC] rounded-[10px] px-3 flex flex-row items-center gap-3">
                                        <img src={locationRed} />
                                        <input
                                            type="text"
                                            value={endJourney.location}
                                            onChange={(e) =>
                                                setEndJourney((prev) => ({
                                                    ...prev,
                                                    location: e.target.value,
                                                }))
                                            }
                                            className="placeholder:text-[#00000033] border-none focus:ring-0 bg-transparent focus:outline-none placeholder:text-[12px] w-full"
                                        />
                                        <img
                                            src={downArrow}
                                            className="ml-auto"
                                        />
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-5">
                                        <div>
                                            <label className="text-[14px]/[24px] font-[400] mb-1">
                                                Return Date
                                            </label>
                                            <div className="w-full xl:h-[49px] bg-[#FFFFFF] border border-[#D1D5DC] rounded-[10px] px-3 flex flex-row items-center gap-3">
                                                <input
                                                    type="text"
                                                    value={
                                                        endJourney.returnDate
                                                    }
                                                    onChange={(e) =>
                                                        setEndJourney(
                                                            (prev) => ({
                                                                ...prev,
                                                                returnDate:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    className="placeholder:text-[#00000033] border-none focus:ring-0 bg-transparent focus:outline-none placeholder:text-[12px] w-full"
                                                />
                                                <img
                                                    src={calander}
                                                    className="ml-auto"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[14px]/[24px] font-[400] mb-1">
                                                Return Time
                                            </label>
                                            <div className="w-full xl:h-[49px] bg-[#FFFFFF] border border-[#D1D5DC] rounded-[10px] px-3 flex flex-row items-center gap-3">
                                                <input
                                                    type="text"
                                                    value={
                                                        endJourney.returnTime
                                                    }
                                                    onChange={(e) =>
                                                        setEndJourney(
                                                            (prev) => ({
                                                                ...prev,
                                                                returnTime:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    className="placeholder:text-[#00000033] border-none focus:ring-0 bg-transparent focus:outline-none placeholder:text-[12px] w-full"
                                                />
                                                <img
                                                    src={clock}
                                                    className="ml-auto"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center items-center">
                                <div
                                    className="w-[151px] h-[51px] rounded-[30px] border-[1px] border-[#155DFC] mt-5 flex flex-row justify-center items-center gap-2 cursor-pointer px-4 py-2"
                                    onClick={handleAddStop}
                                >
                                    <img src={plus} />
                                    <h1 className="text-[16px] text-[#155DFC] font-[500]">
                                        Add Stops
                                    </h1>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {transportMode === "yacht" ? (
                                // Yacht-specific filters
                                <div className="space-y-6 text-[#000000] text-[14px]">
                                    {/* Get Price Alerts Toggle */}
                                    <div className="flex items-center justify-between py-3 border-b border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <img src={alert} />
                                            <span className="text-[14px] font-[500]">
                                                Get Price Alerts
                                            </span>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    {/* Type Section */}
                                    <div className="space-y-3">
                                        <h3 className="text-[14px] font-[500]">
                                            Type
                                        </h3>
                                        <div className="space-y-2">
                                            {[
                                                {
                                                    name: "Luxury Charter",
                                                    price: "135,000",
                                                },
                                                {
                                                    name: "Premium Charter",
                                                    price: "95,000",
                                                },
                                                {
                                                    name: "Standard Charter",
                                                    price: "65,000",
                                                },
                                            ].map((type) => (
                                                <label
                                                    key={type.name}
                                                    className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                                                >
                                                    <div className="flex items-center gap-3 w-full">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="text-[14px] font-[400]">
                                                                {type.name}
                                                            </span>
                                                            <span className="text-[12px] text-gray-500">
                                                                from Rs{" "}
                                                                {type.price}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Departure Times */}
                                    <div className="space-y-3">
                                        <h3 className="text-[14px] font-[500]">
                                            Departure times
                                        </h3>
                                        <div className="space-y-3">
                                            {/* Outbound */}
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[12px] text-gray-600">
                                                        Outbound
                                                    </span>
                                                    <span className="text-[12px] text-gray-500">
                                                        00:00 - 23:35
                                                    </span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1435"
                                                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>
                                            {/* Return */}
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[12px] text-gray-600">
                                                        Return
                                                    </span>
                                                    <span className="text-[12px] text-gray-500">
                                                        00:00 - 23:35
                                                    </span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1435"
                                                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Journey Duration */}
                                    <div className="space-y-3">
                                        <h3 className="text-[14px] font-[500]">
                                            Journey duration
                                        </h3>
                                        <div className="flex items-center justify-between text-[12px] text-gray-500">
                                            <span>0 hours</span>
                                            <span>24 hours</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="24"
                                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>

                                    {/* Charter Companies */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-[14px] font-[500]">
                                                Charter Companies
                                            </h3>
                                            <div className="flex gap-2 text-[12px]">
                                                <button className="text-blue-600 hover:underline">
                                                    Select all
                                                </button>
                                                <span className="text-gray-400">|</span>
                                                <button className="text-blue-600 hover:underline">
                                                    Clear all
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {[
                                                {
                                                    name: "Sea Pearl Charters",
                                                    price: "135,000",
                                                },
                                                {
                                                    name: "Ocean Breeze",
                                                    price: "125,000",
                                                },
                                                {
                                                    name: "Luxury Cruises LK",
                                                    price: "155,000",
                                                },
                                            ].map((company) => (
                                                <label
                                                    key={company.name}
                                                    className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                                                >
                                                    <div className="flex items-center gap-3 w-full">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="text-[14px] font-[400]">
                                                                {company.name}
                                                            </span>
                                                            <span className="text-[12px] text-gray-500">
                                                                from Rs{" "}
                                                                {company.price}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Car filters (existing)
                                <div className="space-y-6 text-[#000000] text-[14px]">
                                {/* Get Price Alerts Toggle */}
                                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <img src={alert} />
                                        <span className="text-[14px] font-[500]">
                                            Get Price Alerts
                                        </span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                {/* Price Range */}
                                <div className="space-y-3">
                                    <h3 className="text-[14px] font-[500]">
                                        Price Range (per day)
                                    </h3>
                                    <div className="flex items-center justify-between text-[12px] text-gray-500">
                                        <span>Rs 0</span>
                                        <span>Rs 500</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="500"
                                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>

                                {/* Car Type */}
                                <div className="space-y-3">
                                    <h3 className="text-[14px] font-[500]">
                                        Car Type
                                    </h3>
                                    <div className="space-y-2">
                                        {[
                                            {
                                                name: "SUV",
                                                price: "12,000",
                                                count: "45",
                                            },
                                            {
                                                name: "Sedan",
                                                price: "8,500",
                                                count: "67",
                                            },
                                            {
                                                name: "Hatchback",
                                                price: "6,500",
                                                count: "89",
                                            },
                                            {
                                                name: "Luxury",
                                                price: "25,000",
                                                count: "23",
                                            },
                                            {
                                                name: "Van/Minibus",
                                                price: "15,000",
                                                count: "34",
                                            },
                                            {
                                                name: "Convertible",
                                                price: "28,000",
                                                count: "12",
                                            },
                                        ].map((type) => (
                                            <label
                                                key={type.name}
                                                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="text-[14px] font-[400]">
                                                            {type.name}
                                                        </span>
                                                        <span className="text-[12px] text-gray-500">
                                                            from Rs {type.price}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="text-[12px] text-gray-400">
                                                    ({type.count})
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Transmission */}
                                <div className="space-y-3">
                                    <h3 className="text-[14px] font-[500]">
                                        Transmission
                                    </h3>
                                    <div className="space-y-2">
                                        {[
                                            { name: "Automatic", count: "156" },
                                            { name: "Manual", count: "114" },
                                        ].map((trans) => (
                                            <label
                                                key={trans.name}
                                                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="text-[14px] font-[400]">
                                                        {trans.name}
                                                    </span>
                                                </div>
                                                <span className="text-[12px] text-gray-400">
                                                    ({trans.count})
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Fuel Type */}
                                <div className="space-y-3">
                                    <h3 className="text-[14px] font-[500]">
                                        Fuel Type
                                    </h3>
                                    <div className="space-y-2">
                                        {[
                                            { name: "Petrol", count: "145" },
                                            { name: "Diesel", count: "89" },
                                            { name: "Hybrid", count: "34" },
                                            { name: "Electric", count: "12" },
                                        ].map((fuel) => (
                                            <label
                                                key={fuel.name}
                                                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="text-[14px] font-[400]">
                                                        {fuel.name}
                                                    </span>
                                                </div>
                                                <span className="text-[12px] text-gray-400">
                                                    ({fuel.count})
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Seating Capacity */}
                                <div className="space-y-3">
                                    <h3 className="text-[14px] font-[500]">
                                        Seating Capacity
                                    </h3>
                                    <div className="space-y-2">
                                        {[
                                            { name: "2 Seater", count: "15" },
                                            { name: "4 Seater", count: "87" },
                                            { name: "5 Seater", count: "123" },
                                            { name: "7 Seater", count: "45" },
                                            { name: "8+ Seater", count: "23" },
                                        ].map((seat) => (
                                            <label
                                                key={seat.name}
                                                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="text-[14px] font-[400]">
                                                        {seat.name}
                                                    </span>
                                                </div>
                                                <span className="text-[12px] text-gray-400">
                                                    ({seat.count})
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Rental Companies */}
                                <div className="space-y-3">
                                    <div className="flex flex-col items-start justify-between">
                                        <h3 className="text-[14px] font-[500]">
                                            Rental Companies
                                        </h3>
                                        <div className="flex gap-3 text-[12px] mt-2">
                                            <button className="text-blue-600 hover:underline">
                                                Select all
                                            </button>
                                            <button className="text-gray-500 hover:underline">
                                                Clear all
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {[
                                            {
                                                name: "Casons Rent-A-Car",
                                                price: "8,500",
                                            },
                                            {
                                                name: "Malkey Rent-A-Car",
                                                price: "9,200",
                                            },
                                            {
                                                name: "AVIS Sri Lanka",
                                                price: "10,500",
                                            },
                                            {
                                                name: "Quickshaws",
                                                price: "7,800",
                                            },
                                            {
                                                name: "Europcar",
                                                price: "11,000",
                                            },
                                        ].map((company) => (
                                            <label
                                                key={company.name}
                                                className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                                            >
                                                <div className="flex items-center gap-3 w-full">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="text-[14px] font-[400]">
                                                            {company.name}
                                                        </span>
                                                        <span className="text-[12px] text-gray-500">
                                                            from Rs{" "}
                                                            {company.price}
                                                        </span>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            )}
                        </>
                    )}
                </div>
                <Link
                    href="/multiModel/available-vehicles"
                    className="w-full h-[43px] flex justify-center items-center bg-[#0955AC] mt-5 text-[16px] text-white font-[700] rounded-[10px] cursor-pointer px-4 py-2"
                >
                    {activeView === "journey"
                        ? "Find Vehicles"
                        : "Apply Filters"}
                </Link>

                <div className="absolute w-full xl:w-auto xl:-right-[100px] xl:bottom-12 -bottom-[52px] xl:-rotate-90 grid grid-cols-2 z-10 figtree font-[600] text-[14px]">
                    <div
                        onClick={() => setActiveView("journey")}
                        className={`w-full xl:w-[74px] h-[52px] rounded-b-[10px] flex justify-center items-center shadow-lg cursor-pointer transition-all ${
                            activeView === "journey"
                                ? "bg-[#0955AC] text-[#FFFFFF]"
                                : "bg-[#F4F3F3] text-[#000000]"
                        }`}
                    >
                        Journey
                    </div>
                    <div
                        onClick={() => setActiveView("filter")}
                        className={`w-full xl:w-[74px] h-[52px] rounded-b-[10px] flex justify-center items-center shadow-lg cursor-pointer transition-all ${
                            activeView === "filter"
                                ? "bg-[#0955AC] text-[#FFFFFF]"
                                : "bg-[#F4F3F3] text-[#000000]"
                        }`}
                    >
                        Filter
                    </div>
                </div>
            </div>

            {/* Add Stop Popup */}
            {showPopup && (
                <div className="fixed inset-0 text-[#286BB6] bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-[20px] p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-[20px] font-[600] text-[#0955AC]">
                                Add New Stop
                            </h2>
                            <img
                                src={close}
                                className="cursor-pointer w-6 h-6"
                                onClick={handleClosePopup}
                                alt="Close"
                            />
                        </div>

                        <div className="space-y-4">
                            {/* Destination */}
                            <div>
                                <label className="block text-[14px] font-[400] mb-2">
                                    Destination
                                </label>
                                <div className="w-full h-[49px] bg-[#FFFFFF] border border-[#D1D5DC] rounded-[10px] px-3 flex flex-row items-center gap-3">
                                    <img src={location} className="w-5 h-5" />
                                    <input
                                        type="text"
                                        value={stopData.destination}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "destination",
                                                e.target.value
                                            )
                                        }
                                        className="placeholder:text-[#00000033] border-none focus:ring-0 bg-transparent focus:outline-none placeholder:text-[12px] w-full"
                                        placeholder="Enter destination"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-row gap-5">
                                {/* Departure Date */}
                                <div className="w-full">
                                    <label className="block text-[14px] font-[400] mb-2">
                                        Departure Date
                                    </label>
                                    <div className="w-full h-[49px] bg-[#FFFFFF] border border-[#D1D5DC] rounded-[10px] px-3 flex flex-row items-center gap-3">
                                        <input
                                            type="date"
                                            value={stopData.departureDate}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "departureDate",
                                                    e.target.value
                                                )
                                            }
                                            className="placeholder:text-[#00000033] border-none focus:ring-0 bg-transparent focus:outline-none placeholder:text-[12px] w-full"
                                        />
                                        {/* <img
                                            src={calander}
                                            className="w-5 h-5 ml-auto"
                                        /> */}
                                    </div>
                                </div>

                                {/* Departure Time */}
                                <div className="w-full">
                                    <label className="block text-[14px] font-[400] mb-2">
                                        Departure Time
                                    </label>
                                    <div className="w-full h-[49px] bg-[#FFFFFF] border border-[#D1D5DC] rounded-[10px] px-3 flex flex-row items-center gap-3">
                                        <input
                                            type="time"
                                            value={stopData.departureTime}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "departureTime",
                                                    e.target.value
                                                )
                                            }
                                            className="placeholder:text-[#00000033] border-none focus:ring-0 bg-transparent focus:outline-none placeholder:text-[12px] w-full"
                                        />
                                        {/* <img
                                            src={clock}
                                            className="w-5 h-5 ml-auto"
                                        /> */}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-row gap-5">
                                {/* Return Date */}
                                <div className="w-full">
                                    <label className="block text-[14px] font-[400] mb-2">
                                        Return Date
                                    </label>
                                    <div className="w-full h-[49px] bg-[#FFFFFF] border border-[#D1D5DC] rounded-[10px] px-3 flex flex-row items-center gap-3">
                                        <input
                                            type="date"
                                            value={stopData.returnDate}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "returnDate",
                                                    e.target.value
                                                )
                                            }
                                            className="placeholder:text-[#00000033] border-none focus:ring-0 bg-transparent focus:outline-none placeholder:text-[12px] w-full"
                                        />
                                        {/* <img
                                            src={calander}
                                            className="w-5 h-5 ml-auto"
                                        /> */}
                                    </div>
                                </div>

                                {/* Return Time */}
                                <div className="w-full">
                                    <label className="block text-[14px] font-[400] mb-2">
                                        Return Time
                                    </label>
                                    <div className="w-full h-[49px] bg-[#FFFFFF] border border-[#D1D5DC] rounded-[10px] px-3 flex flex-row items-center gap-3">
                                        <input
                                            type="time"
                                            value={stopData.returnTime}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "returnTime",
                                                    e.target.value
                                                )
                                            }
                                            className="placeholder:text-[#00000033] border-none focus:ring-0 bg-transparent focus:outline-none placeholder:text-[12px] w-full"
                                        />
                                        {/* <img
                                            src={clock}
                                            className="w-5 h-5 ml-auto"
                                        /> */}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full mt-5">
                            <button
                                onClick={handleSaveStop}
                                className="w-full h-[43px] bg-[#0955AC] text-white rounded-[10px] font-[500] hover:bg-[#074a8a] transition-colors"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Schedule Popup */}
            {editingStopId && (
                <div className="fixed inset-0 text-[#286BB6] bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-[20px] p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-[20px] font-[600] text-[#0955AC]">
                                Edit Schedule
                            </h2>
                            <img
                                src={close}
                                className="cursor-pointer w-6 h-6"
                                onClick={handleCloseEditPopup}
                                alt="Close"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-row gap-5">
                                {/* Departure Date */}
                                <div className="w-full">
                                    <label className="block text-[14px] font-[400] mb-2">
                                        Departure Date
                                    </label>
                                    <div className="w-full h-[49px] bg-[#FFFFFF] border border-[#D1D5DC] rounded-[10px] px-3 flex flex-row items-center gap-3">
                                        <input
                                            type="date"
                                            value={
                                                editScheduleData.departureDate
                                            }
                                            onChange={(e) =>
                                                handleEditInputChange(
                                                    "departureDate",
                                                    e.target.value
                                                )
                                            }
                                            className="placeholder:text-[#00000033] border-none focus:ring-0 bg-transparent focus:outline-none placeholder:text-[12px] w-full"
                                        />
                                        {/* <img
                                            src={calander}
                                            className="w-5 h-5 ml-auto"
                                        /> */}
                                    </div>
                                </div>

                                {/* Departure Time */}
                                <div className="w-full">
                                    <label className="block text-[14px] font-[400] mb-2">
                                        Departure Time
                                    </label>
                                    <div className="w-full h-[49px] bg-[#FFFFFF] border border-[#D1D5DC] rounded-[10px] px-3 flex flex-row items-center gap-3">
                                        <input
                                            type="time"
                                            value={
                                                editScheduleData.departureTime
                                            }
                                            onChange={(e) =>
                                                handleEditInputChange(
                                                    "departureTime",
                                                    e.target.value
                                                )
                                            }
                                            className="placeholder:text-[#00000033] border-none focus:ring-0 bg-transparent focus:outline-none placeholder:text-[12px] w-full"
                                        />
                                        {/* <img
                                            src={clock}
                                            className="w-5 h-5 ml-auto"
                                        /> */}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-row gap-5">
                                {/* Return Date */}
                                <div className="w-full">
                                    <label className="block text-[14px] font-[400] mb-2">
                                        Return Date
                                    </label>
                                    <div className="w-full h-[49px] bg-[#FFFFFF] border border-[#D1D5DC] rounded-[10px] px-3 flex flex-row items-center gap-3">
                                        <input
                                            type="date"
                                            value={editScheduleData.returnDate}
                                            onChange={(e) =>
                                                handleEditInputChange(
                                                    "returnDate",
                                                    e.target.value
                                                )
                                            }
                                            className="placeholder:text-[#00000033] border-none focus:ring-0 bg-transparent focus:outline-none placeholder:text-[12px] w-full"
                                        />
                                        {/* <img
                                            src={calander}
                                            className="w-5 h-5 ml-auto"
                                        /> */}
                                    </div>
                                </div>

                                {/* Return Time */}
                                <div className="w-full">
                                    <label className="block text-[14px] font-[400] mb-2">
                                        Return Time
                                    </label>
                                    <div className="w-full h-[49px] bg-[#FFFFFF] border border-[#D1D5DC] rounded-[10px] px-3 flex flex-row items-center gap-3">
                                        <input
                                            type="time"
                                            value={editScheduleData.returnTime}
                                            onChange={(e) =>
                                                handleEditInputChange(
                                                    "returnTime",
                                                    e.target.value
                                                )
                                            }
                                            className="placeholder:text-[#00000033] border-none focus:ring-0 bg-transparent focus:outline-none placeholder:text-[12px] w-full"
                                        />
                                        {/* <img
                                            src={clock}
                                            className="w-5 h-5 ml-auto"
                                        /> */}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5">
                            <button
                                onClick={handleSaveEditSchedule}
                                className="w-full h-[43px] bg-[#0955AC] text-white rounded-[10px] font-[500] hover:bg-[#074a8a] transition-colors"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default JourneyPlanner;
