import React, { useState, useEffect } from "react";
import map from "../../../assets/multiModel/planJourney/map.svg";
import { Link } from "@inertiajs/react";

import carTwo from "../../../assets/multiModel/planJourney/car.svg";
import busTwo from "../../../assets/multiModel/planJourney/bus.svg";
import tramTwo from "../../../assets/multiModel/planJourney/tram.svg";
import planeTwo from "../../../assets/multiModel/planJourney/plane.svg";
import shipTwo from "../../../assets/multiModel/planJourney/ship.svg";

import miter from "../../../assets/multiModel/planJourney/miter.svg";
import gear from "../../../assets/multiModel/planJourney/gear.svg";
import person from "../../../assets/multiModel/planJourney/person.svg";
import gas from "../../../assets/multiModel/planJourney/gas.svg";

import carImg from "../../../assets/multiModel/planJourney/carImg.png";
import heart from "../../../assets/multiModel/planJourney/heart.svg";

import busPurple from "../../../assets/multiModel/planJourney/busPurple.svg";
import clockGrey from "../../../assets/multiModel/planJourney/clockGrey.svg";
import rightArrow from "../../../assets/multiModel/planJourney/rightArrow.svg";
import calanderGrey from "../../../assets/multiModel/planJourney/calanderGrey.svg";

import leftRound from "../../../assets/multiModel/planJourney/leftRound.svg";

import train from "../../../assets/multiModel/planJourney/train.svg";
import flight from "../../../assets/multiModel/planJourney/flight.svg";
import yatch from "../../../assets/multiModel/planJourney/yatch.svg";
import carBlack from "../../../assets/multiModel/planJourney/carBlack.svg";

import carBlue from "../../../assets/multiModel/planJourney/carBlue.svg";
import busBlue from "../../../assets/multiModel/planJourney/busBlue.svg";
import trainBlue from "../../../assets/multiModel/planJourney/trainBlue.svg";
import planeBlue from "../../../assets/multiModel/planJourney/planeBlue.svg";
import shipBlue from "../../../assets/multiModel/planJourney/shipBlue.svg";

import JourneyPlanner from "../planJourney/JourneyPlanner";

const vehicleData = {
    car: [
        {
            mileage: "4,000",
            transmission: "Auto",
            seats: "4 Person",
            fuel: "Electric",
            price: "89.00",
            image: carImg,
            name: "Hyundai tucson",
        },
        {
            mileage: "4,000",
            transmission: "Auto",
            seats: "4 Person",
            fuel: "Electric",
            price: "89.00",
            image: carImg,
            name: "Hyundai tucson",
        },
        {
            mileage: "4,000",
            transmission: "Auto",
            seats: "4 Person",
            fuel: "Electric",
            price: "89.00",
            image: carImg,
            name: "Hyundai tucson",
        },
        {
            mileage: "5,200",
            transmission: "Manual",
            seats: "5 Person",
            fuel: "Petrol",
            price: "95.00",
            image: carImg,
            name: "Toyota Camry",
        },
        {
            mileage: "3,800",
            transmission: "Auto",
            seats: "4 Person",
            fuel: "Hybrid",
            price: "110.00",
            image: carImg,
            name: "Honda Civic",
        },
        {
            mileage: "6,100",
            transmission: "Auto",
            seats: "7 Person",
            fuel: "Diesel",
            price: "120.00",
            image: carImg,
            name: "Ford Explorer",
        },
    ],
    bus: [
        {
            icon: busPurple,
            name: "Highway Express",
            route: "Route 501",
            frequency: "Every Hour",
            departure: { date: "Dec 23", time: "7:00 AM", location: "Colombo" },
            arrival: { date: "Dec 23", time: "9:00 AM", location: "Galle" },
            duration: "2 hrs",
            classes: [
                {
                    name: "AC Luxury",
                    price: "Rs 850",
                    seats: "28 seats",
                    color: "#00BC7D",
                },
                {
                    name: "AC Luxury",
                    price: "Rs 850",
                    seats: "28 seats",
                    color: "#FE9A00",
                },
                {
                    name: "AC Luxury",
                    price: "Rs 850",
                    seats: "28 seats",
                    color: "#00A6F4",
                },
            ],
        },
        {
            icon: busPurple,
            name: "Highway Express",
            route: "Route 501",
            frequency: "Every Hour",
            departure: { date: "Dec 23", time: "7:00 AM", location: "Colombo" },
            arrival: { date: "Dec 23", time: "9:00 AM", location: "Galle" },
            duration: "2 hrs",
            classes: [
                {
                    name: "AC Luxury",
                    price: "Rs 850",
                    seats: "28 seats",
                    color: "#00BC7D",
                },
                {
                    name: "AC Luxury",
                    price: "Rs 850",
                    seats: "28 seats",
                    color: "#FE9A00",
                },
                {
                    name: "AC Luxury",
                    price: "Rs 850",
                    seats: "28 seats",
                    color: "#00A6F4",
                },
            ],
        },
        {
            icon: busPurple,
            name: "City Link",
            route: "Route 302",
            frequency: "Every 30 Min",
            departure: { date: "Dec 23", time: "8:00 AM", location: "Colombo" },
            arrival: { date: "Dec 23", time: "10:30 AM", location: "Kandy" },
            duration: "2.5 hrs",
            classes: [
                {
                    name: "Standard",
                    price: "Rs 650",
                    seats: "35 seats",
                    color: "#00BC7D",
                },
                {
                    name: "AC Semi-Luxury",
                    price: "Rs 750",
                    seats: "32 seats",
                    color: "#FE9A00",
                },
                {
                    name: "AC Luxury",
                    price: "Rs 950",
                    seats: "28 seats",
                    color: "#00A6F4",
                },
            ],
        },
        {
            icon: busPurple,
            name: "Express Line",
            route: "Route 401",
            frequency: "Every 45 Min",
            departure: { date: "Dec 23", time: "6:30 AM", location: "Colombo" },
            arrival: { date: "Dec 23", time: "8:45 AM", location: "Negombo" },
            duration: "2.25 hrs",
            classes: [
                {
                    name: "Standard",
                    price: "Rs 550",
                    seats: "40 seats",
                    color: "#00BC7D",
                },
                {
                    name: "AC Semi-Luxury",
                    price: "Rs 700",
                    seats: "35 seats",
                    color: "#FE9A00",
                },
                {
                    name: "AC Luxury",
                    price: "Rs 850",
                    seats: "30 seats",
                    color: "#00A6F4",
                },
            ],
        },
    ],
    train: [
        {
            icon: train,
            name: "Highway Express",
            route: "Route 501",
            frequency: "Every Hour",
            departure: { date: "Dec 23", time: "7:00 AM", location: "Colombo" },
            arrival: { date: "Dec 23", time: "9:00 AM", location: "Galle" },
            duration: "2 hrs",
            classes: [
                {
                    name: "AC Luxury",
                    price: "Rs 850",
                    seats: "28 seats",
                    color: "#00BC7D",
                },
                {
                    name: "AC Luxury",
                    price: "Rs 850",
                    seats: "28 seats",
                    color: "#FE9A00",
                },
                {
                    name: "AC Luxury",
                    price: "Rs 850",
                    seats: "28 seats",
                    color: "#00A6F4",
                },
            ],
        },
        {
            icon: train,
            name: "Highway Express",
            route: "Route 501",
            frequency: "Every Hour",
            departure: { date: "Dec 23", time: "7:00 AM", location: "Colombo" },
            arrival: { date: "Dec 23", time: "9:00 AM", location: "Galle" },
            duration: "2 hrs",
            classes: [
                {
                    name: "AC Luxury",
                    price: "Rs 850",
                    seats: "28 seats",
                    color: "#00BC7D",
                },
                {
                    name: "AC Luxury",
                    price: "Rs 850",
                    seats: "28 seats",
                    color: "#FE9A00",
                },
                {
                    name: "AC Luxury",
                    price: "Rs 850",
                    seats: "28 seats",
                    color: "#00A6F4",
                },
            ],
        },
        {
            icon: train,
            name: "Podi Menike",
            route: "Colombo-Kandy",
            frequency: "Every 2 Hours",
            departure: { date: "Dec 23", time: "6:00 AM", location: "Colombo" },
            arrival: { date: "Dec 23", time: "9:30 AM", location: "Kandy" },
            duration: "3.5 hrs",
            classes: [
                {
                    name: "First Class",
                    price: "Rs 1200",
                    seats: "24 seats",
                    color: "#00BC7D",
                },
                {
                    name: "Second Class",
                    price: "Rs 800",
                    seats: "48 seats",
                    color: "#FE9A00",
                },
                {
                    name: "Third Class",
                    price: "Rs 500",
                    seats: "72 seats",
                    color: "#00A6F4",
                },
            ],
        },
        {
            icon: train,
            name: "Udarata Menike",
            route: "Colombo-Badulla",
            frequency: "Daily",
            departure: { date: "Dec 23", time: "8:30 AM", location: "Colombo" },
            arrival: { date: "Dec 23", time: "4:30 PM", location: "Badulla" },
            duration: "8 hrs",
            classes: [
                {
                    name: "First Class",
                    price: "Rs 2500",
                    seats: "20 seats",
                    color: "#00BC7D",
                },
                {
                    name: "Second Class",
                    price: "Rs 1500",
                    seats: "40 seats",
                    color: "#FE9A00",
                },
                {
                    name: "Third Class",
                    price: "Rs 800",
                    seats: "60 seats",
                    color: "#00A6F4",
                },
            ],
        },
    ],
    plane: [
        {
            icon: flight,
            name: "Highway Express",
            route: "Route 501",
            frequency: "Every Hour",
            departure: { date: "Dec 23", time: "7:00 AM", location: "Colombo" },
            arrival: { date: "Dec 23", time: "9:00 AM", location: "Galle" },
            duration: "2 hrs",
            classes: [
                {
                    name: "AC Luxury",
                    price: "Rs 850",
                    seats: "28 seats",
                    color: "#00BC7D",
                },
                {
                    name: "AC Luxury",
                    price: "Rs 850",
                    seats: "28 seats",
                    color: "#FE9A00",
                },
                {
                    name: "AC Luxury",
                    price: "Rs 850",
                    seats: "28 seats",
                    color: "#00A6F4",
                },
            ],
        },
        {
            icon: flight,
            name: "Highway Express",
            route: "Route 501",
            frequency: "Every Hour",
            departure: { date: "Dec 23", time: "7:00 AM", location: "Colombo" },
            arrival: { date: "Dec 23", time: "9:00 AM", location: "Galle" },
            duration: "2 hrs",
            classes: [
                {
                    name: "AC Luxury",
                    price: "Rs 850",
                    seats: "28 seats",
                    color: "#00BC7D",
                },
                {
                    name: "AC Luxury",
                    price: "Rs 850",
                    seats: "28 seats",
                    color: "#FE9A00",
                },
                {
                    name: "AC Luxury",
                    price: "Rs 850",
                    seats: "28 seats",
                    color: "#00A6F4",
                },
            ],
        },
        {
            icon: flight,
            name: "SriLankan Airlines",
            route: "Colombo-Jaffna",
            frequency: "3x Daily",
            departure: { date: "Dec 23", time: "9:00 AM", location: "Colombo" },
            arrival: { date: "Dec 23", time: "10:15 AM", location: "Jaffna" },
            duration: "1.25 hrs",
            classes: [
                {
                    name: "Business",
                    price: "Rs 8500",
                    seats: "12 seats",
                    color: "#00BC7D",
                },
                {
                    name: "Economy Plus",
                    price: "Rs 6500",
                    seats: "24 seats",
                    color: "#FE9A00",
                },
                {
                    name: "Economy",
                    price: "Rs 4500",
                    seats: "120 seats",
                    color: "#00A6F4",
                },
            ],
        },
        {
            icon: flight,
            name: "Airline Express",
            route: "Colombo-Mattala",
            frequency: "2x Daily",
            departure: {
                date: "Dec 23",
                time: "11:00 AM",
                location: "Colombo",
            },
            arrival: { date: "Dec 23", time: "12:30 PM", location: "Mattala" },
            duration: "1.5 hrs",
            classes: [
                {
                    name: "Business",
                    price: "Rs 7200",
                    seats: "8 seats",
                    color: "#00BC7D",
                },
                {
                    name: "Economy Plus",
                    price: "Rs 5500",
                    seats: "20 seats",
                    color: "#FE9A00",
                },
                {
                    name: "Economy",
                    price: "Rs 3800",
                    seats: "100 seats",
                    color: "#00A6F4",
                },
            ],
        },
    ],
    yacht: [
        {
            icon: yatch,
            name: "Highway Express",
            route: "Route 501",
            frequency: "Every Hour",
            departure: { date: "Dec 23", time: "7:00 AM", location: "Colombo" },
            arrival: { date: "Dec 23", time: "9:00 AM", location: "Galle" },
            duration: "2 hrs",
            classes: [
                {
                    name: "AC Luxury",
                    price: "Rs 850",
                    seats: "28 seats",
                    color: "#00BC7D",
                },
                {
                    name: "AC Luxury",
                    price: "Rs 850",
                    seats: "28 seats",
                    color: "#FE9A00",
                },
                {
                    name: "AC Luxury",
                    price: "Rs 850",
                    seats: "28 seats",
                    color: "#00A6F4",
                },
            ],
        },
        {
            icon: yatch,
            name: "Highway Express",
            route: "Route 501",
            frequency: "Every Hour",
            departure: { date: "Dec 23", time: "7:00 AM", location: "Colombo" },
            arrival: { date: "Dec 23", time: "9:00 AM", location: "Galle" },
            duration: "2 hrs",
            classes: [
                {
                    name: "AC Luxury",
                    price: "Rs 850",
                    seats: "28 seats",
                    color: "#00BC7D",
                },
                {
                    name: "AC Luxury",
                    price: "Rs 850",
                    seats: "28 seats",
                    color: "#FE9A00",
                },
                {
                    name: "AC Luxury",
                    price: "Rs 850",
                    seats: "28 seats",
                    color: "#00A6F4",
                },
            ],
        },
        {
            icon: yatch,
            name: "Luxury Cruiser",
            route: "Colombo-Mirissa",
            frequency: "Daily Tours",
            departure: {
                date: "Dec 23",
                time: "10:00 AM",
                location: "Colombo",
            },
            arrival: { date: "Dec 23", time: "2:00 PM", location: "Mirissa" },
            duration: "4 hrs",
            classes: [
                {
                    name: "VIP Suite",
                    price: "Rs 15000",
                    seats: "6 seats",
                    color: "#00BC7D",
                },
                {
                    name: "Premium",
                    price: "Rs 12000",
                    seats: "12 seats",
                    color: "#FE9A00",
                },
                {
                    name: "Standard",
                    price: "Rs 8000",
                    seats: "20 seats",
                    color: "#00A6F4",
                },
            ],
        },
        {
            icon: yatch,
            name: "Island Hopper",
            route: "Colombo-Trinco",
            frequency: "Weekly",
            departure: { date: "Dec 23", time: "8:00 AM", location: "Colombo" },
            arrival: {
                date: "Dec 24",
                time: "6:00 PM",
                location: "Trincomalee",
            },
            duration: "34 hrs",
            classes: [
                {
                    name: "Master Suite",
                    price: "Rs 25000",
                    seats: "4 seats",
                    color: "#00BC7D",
                },
                {
                    name: "Deluxe",
                    price: "Rs 18000",
                    seats: "8 seats",
                    color: "#FE9A00",
                },
                {
                    name: "Comfort",
                    price: "Rs 12000",
                    seats: "16 seats",
                    color: "#00A6F4",
                },
            ],
        },
    ],
};

const Hero = () => {
    const [activeSection, setActiveSection] = useState("car");
    const [carPage, setCarPage] = useState(0);
    const [busPage, setBusPage] = useState(0);
    const [trainPage, setTrainPage] = useState(0);
    const [planePage, setPlanePage] = useState(0);
    const [yachtPage, setYachtPage] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const [startJourney, setStartJourney] = useState({ location: "", startDate: "", startTime: "" });
    const [addedStops, setAddedStops] = useState([]);
    const [endJourney, setEndJourney] = useState({ location: "", returnDate: "", returnTime: "" });

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

    const handleSectionChange = (newSection) => {
        if (newSection !== activeSection && !isTransitioning) {
            setIsTransitioning(true);
            setTimeout(() => {
                setActiveSection(newSection);
                setIsTransitioning(false);
            }, 150);
        }
    };

    const handlePageChange = (section) => {
        if (isTransitioning) return;

        setIsTransitioning(true);

        setTimeout(() => {
            if (section === "car") {
                setCarPage((prev) => Math.max(0, prev - 1));
            } else if (section === "bus") {
                setBusPage((prev) => Math.max(0, prev - 1));
            } else if (section === "train") {
                setTrainPage((prev) => Math.max(0, prev - 1));
            } else if (section === "plane") {
                setPlanePage((prev) => Math.max(0, prev - 1));
            } else if (section === "yacht") {
                setYachtPage((prev) => Math.max(0, prev - 1));
            }
            setIsTransitioning(false);
        }, 200);
    };

    const handlePageChangeNext = (section) => {
        if (isTransitioning) return;

        setIsTransitioning(true);

        setTimeout(() => {
            if (section === "car") {
                setCarPage((prev) =>
                    Math.min(
                        Math.ceil(vehicleData.car.length / 3) - 1,
                        prev + 1
                    )
                );
            } else if (section === "bus") {
                setBusPage((prev) =>
                    Math.min(
                        Math.ceil(vehicleData.bus.length / 2) - 1,
                        prev + 1
                    )
                );
            } else if (section === "train") {
                setTrainPage((prev) =>
                    Math.min(
                        Math.ceil(vehicleData.train.length / 2) - 1,
                        prev + 1
                    )
                );
            } else if (section === "plane") {
                setPlanePage((prev) =>
                    Math.min(
                        Math.ceil(vehicleData.plane.length / 2) - 1,
                        prev + 1
                    )
                );
            } else if (section === "yacht") {
                setYachtPage((prev) =>
                    Math.min(
                        Math.ceil(vehicleData.yacht.length / 2) - 1,
                        prev + 1
                    )
                );
            }
            setIsTransitioning(false);
        }, 200);
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 px-5 sm:px-10 py-10 gap-10">
            <div className="xl:col-span-1">
                <JourneyPlanner transportMode={activeSection} startJourney={startJourney} setStartJourney={setStartJourney} addedStops={addedStops} setAddedStops={setAddedStops} endJourney={endJourney} setEndJourney={setEndJourney} />
            </div>
            <div className="xl:col-span-2 flex flex-col gap-10">
                <div className="w-full xl:h-[295px] bg-[#F4F3F3] mt-10 xl:mt-0 shadow-lg rounded-[20px]">
                    {/* Map Component Goes Here */}
                    <img
                        src={map}
                        alt="map image"
                        className="w-full h-full rounded-[20px]"
                    />
                </div>

                <div className="flex flex-row items-center text-[#6F6F6F] text-[10px] font-[500] latto">
                    <div className="relative flex flex-col items-center justify-center">
                        <div className="size-[20px] border-[1px] border-[#C6C6C6] rounded-full"></div>
                        <h3 className="absolute top-6">From</h3>
                        {startJourney.location && <h4 className="absolute top-10 text-[8px] text-center">{startJourney.location}</h4>}
                    </div>

                    {addedStops.length > 0 ? addedStops.map((stop, index) => (
                        <div key={stop.id} className="relative flex flex-col justify-center w-full h-[1px] bg-[#C6C6C6]">
                            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col justify-center items-center gap-1">
                                <div className=" size-[16px] bg-[#C6C6C6] rounded-full" />
                                <h3 className="absolute top-6 text-nowrap">Stop {index + 1}</h3>
                                {stop.destination && <h4 className="absolute top-10 text-[8px] text-center">{stop.destination}</h4>}
                            </div>
                        </div>
                    )) : (
                        <div className="relative flex flex-col justify-center w-full h-[1px] bg-[#C6C6C6]"></div>
                    )}

                    <div className="relative flex flex-col items-center justify-center">
                        <div className="size-[20px] border-[1px] border-[#C6C6C6] rounded-full"></div>
                        <h3 className="absolute top-6">To</h3>
                        {endJourney.location && <h4 className="absolute top-10 text-[8px] text-center">{endJourney.location}</h4>}
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <div className="w-[270px] md:w-[317px] h-[67px] bg-[#F4F3F3] rounded-[10px] text-[12px] font-[400] flex flex-row justify-center items-center shadow-lg px-2">
                        <div
                            className={`p-2 size-[45px] rounded-[10px] flex flex-col justify-center items-center mx-auto cursor-pointer transition-all duration-300 ease-in-out hover:scale-110 ${
                                activeSection === "car"
                                    ? "bg-[#0955AC1A] text-[#0955AC] font-[600] scale-110"
                                    : "text-[#000000]"
                            }`}
                            onClick={() => handleSectionChange("car")}
                        >
                            <img
                                src={
                                    activeSection === "car" ? carBlue : carBlack
                                }
                                className="size-[20px] transition-all duration-300 ease-in-out"
                            />
                            <h1>Car</h1>
                        </div>
                        <div
                            className={`p-2 size-[45px] rounded-[10px] flex flex-col justify-center items-center mx-auto cursor-pointer transition-all duration-300 ease-in-out hover:scale-110 ${
                                activeSection === "bus"
                                    ? "bg-[#0955AC1A] text-[#0955AC] font-[600] scale-110"
                                    : "text-[#000000]"
                            }`}
                            onClick={() => handleSectionChange("bus")}
                        >
                            <img
                                src={activeSection === "bus" ? busBlue : busTwo}
                                className="size-[20px] transition-all duration-300 ease-in-out"
                            />
                            <h1>Bus</h1>
                        </div>
                        <div
                            className={`p-2 size-[45px] rounded-[10px] flex flex-col justify-center items-center mx-auto cursor-pointer transition-all duration-300 ease-in-out hover:scale-110 ${
                                activeSection === "train"
                                    ? "bg-[#0955AC1A] text-[#0955AC] font-[600] scale-110"
                                    : "text-[#000000]"
                            }`}
                            onClick={() => handleSectionChange("train")}
                        >
                            <img
                                src={
                                    activeSection === "train"
                                        ? trainBlue
                                        : tramTwo
                                }
                                className="size-[20px] transition-all duration-300 ease-in-out"
                            />
                            <h1>Train</h1>
                        </div>
                        <div
                            className={`p-2 size-[45px] rounded-[10px] flex flex-col justify-center items-center mx-auto cursor-pointer transition-all duration-300 ease-in-out hover:scale-110 ${
                                activeSection === "plane"
                                    ? "bg-[#0955AC1A] text-[#0955AC] font-[600] scale-110"
                                    : "text-[#000000]"
                            }`}
                            onClick={() => handleSectionChange("plane")}
                        >
                            <img
                                src={
                                    activeSection === "plane"
                                        ? planeBlue
                                        : planeTwo
                                }
                                className="size-[20px] transition-all duration-300 ease-in-out"
                            />
                            <h1>plane</h1>
                        </div>
                        <div
                            className={`p-2 size-[45px] rounded-[10px] flex flex-col justify-center items-center mx-auto cursor-pointer transition-all duration-300 ease-in-out hover:scale-110 ${
                                activeSection === "yacht"
                                    ? "bg-[#0955AC1A] text-[#0955AC] font-[600] scale-110"
                                    : "text-[#000000]"
                            }`}
                            onClick={() => handleSectionChange("yacht")}
                        >
                            <img
                                src={
                                    activeSection === "yacht"
                                        ? shipBlue
                                        : shipTwo
                                }
                                className="size-[20px] transition-all duration-300 ease-in-out"
                            />
                            <h1>yatch</h1>
                        </div>
                    </div>

                    {/* Car section */}
                    {activeSection === "car" && (
                        <div
                            className={`mt-10 poppins flex flex-col gap-5 justify-center items-center transition-all duration-300 ease-in-out ${
                                isTransitioning
                                    ? "opacity-0 transform translate-y-4"
                                    : "opacity-100 transform translate-y-0"
                            }`}
                        >
                            <div
                                className={`flex flex-row flex-wrap justify-center items-center gap-10 transition-all duration-300 ease-in-out pb-5 max-h-[330px] overflow-y-auto ${
                                    isTransitioning
                                        ? "opacity-0 transform scale-95"
                                        : "opacity-100 transform scale-100"
                                }`}
                            >
                                {vehicleData.car.map((vehicle, index) => (
                                    <Link
                                        key={`${carPage}-${index}`}
                                        href="/multiModel/vehicleDetails"
                                        className="min-w-[217px] min-h-[295px] bg-[#F4F3F3] rounded-[10px] shadow-lg p-5 transition-all duration-300 ease-in-out hover:scale-95 transform"
                                    >
                                        <div className="flex flex-row justify-between items-center">
                                            <div className="flex flex-col justify-center items-center gap-1">
                                                <img src={miter} />
                                                <h1 className="text-[8px] font-[500] text-[#00000040]">
                                                    {vehicle.mileage}
                                                </h1>
                                            </div>
                                            <div className="flex flex-col justify-center items-center gap-1">
                                                <img src={gear} />
                                                <h1 className="text-[8px] font-[500] text-[#00000040]">
                                                    {vehicle.transmission}
                                                </h1>
                                            </div>
                                            <div className="flex flex-col justify-center items-center gap-1">
                                                <img src={person} />
                                                <h1 className="text-[8px] font-[500] text-[#00000040]">
                                                    {vehicle.seats}
                                                </h1>
                                            </div>
                                            <div className="flex flex-col justify-center items-center gap-1">
                                                <img src={gas} />
                                                <h1 className="text-[8px] font-[500] text-[#00000040]">
                                                    {vehicle.fuel}
                                                </h1>
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-center items-center gap-2">
                                            <img
                                                src={vehicle.image}
                                                alt="car image"
                                                className="mx-auto"
                                            />

                                            <div className="flex flex-col justify-center items-center">
                                                <h1 className="bebas-neue text-[20px] font-[400]">
                                                    {vehicle.name.split(" ")[0]}{" "}
                                                    <span className="text-[#0955AC]">
                                                        {
                                                            vehicle.name.split(
                                                                " "
                                                            )[1]
                                                        }
                                                    </span>{" "}
                                                </h1>

                                                <h1 className="text-[25px]/[24px] font-[700]">
                                                    {vehicle.price}{" "}
                                                    <span className="text-[10px] text-[#00000080] font-[600]">
                                                        /day
                                                    </span>
                                                </h1>

                                                <div className="flex flex-row gap-2 justify-between">
                                                    <div className="w-[127px] h-[22px] rounded-[4px] bg-[#0955AC] flex justify-center items-center text-[10px] font-[700] text-[#FFFFFF] mx-auto p-1 cursor-pointer">
                                                        More Details
                                                    </div>

                                                    <div className="size-[22px] border-[1px] rounded-[4px] border-[#0955AC] flex justify-center items-center p-1 cursor-pointer">
                                                        <img
                                                            src={heart}
                                                            className="mx-auto"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bus section */}
                    {activeSection === "bus" && (
                        <div
                            className={`mt-10 poppins flex flex-col gap-5 justify-center items-center transition-all duration-300 ease-in-out ${
                                isTransitioning
                                    ? "opacity-0 transform translate-y-4"
                                    : "opacity-100 transform translate-y-0"
                            }`}
                        >
                            <div
                                className={`flex flex-row flex-wrap justify-center items-center gap-10 transition-all duration-300 ease-in-out pb-5 max-h-[330px] overflow-y-auto ${
                                    isTransitioning
                                        ? "opacity-0 transform scale-95"
                                        : "opacity-100 transform scale-100"
                                }`}
                            >
                                {vehicleData.bus.map((vehicle, index) => (
                                    <Link
                                        key={index}
                                        href="/multiModel/bus/busDetails"
                                        className="w-full sm:w-[382px] shadow-lg rounded-[12px] h-auto bg-[#FFFFFF] border-[0.8px] border-[#F3F4F6] transition-all duration-300 ease-in-out hover:scale-95 transform block"
                                    >
                                        <div className="flex flex-row justify-center items-center gap-3 w-full py-4 px-5">
                                            <div className="size-[36px] bg-[#FAF5FF] rounded-[10px] flex justify-center items-center p-2">
                                                <img
                                                    src={vehicle.icon}
                                                    className=""
                                                />
                                            </div>
                                            <div>
                                                <h1 className="text-[#101828] text-[14px]">
                                                    {vehicle.name}
                                                </h1>
                                                <h1 className="text-[#6A7282] text-[12px]">
                                                    {vehicle.route}
                                                </h1>
                                            </div>
                                            <div className="w-[64px] h-auto bg-[#F0FDF4] rounded-[8px] text-[#008236] text-[10px] flex justify-center items-center ml-auto p-1">
                                                <h1>{vehicle.frequency}</h1>
                                            </div>
                                        </div>
                                        <div className="border-[#F3F4F6] border-y-[0.8px] w-full py-5 px-5">
                                            <div className="flex flex-row justify-between items-center">
                                                <div className="flex flex-col">
                                                    <div className="flex flex-row gap-2">
                                                        <img
                                                            src={calanderGrey}
                                                            className=""
                                                        />
                                                        <h1 className="text-[10px] text-[#6A7282]">
                                                            {
                                                                vehicle
                                                                    .departure
                                                                    .date
                                                            }
                                                        </h1>
                                                    </div>
                                                    <h1 className="text-[#101828] text-[14px]">
                                                        {vehicle.departure.time}
                                                    </h1>
                                                    <h1 className="text-[#4A5565] text-[12px]">
                                                        {
                                                            vehicle.departure
                                                                .location
                                                        }
                                                    </h1>
                                                </div>
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="flex flex-row gap-1 items-center">
                                                        <img
                                                            src={clockGrey}
                                                            className="clock"
                                                        />
                                                        <h1 className="text-[#6A7282] text-[9px]">
                                                            {vehicle.duration}
                                                        </h1>
                                                    </div>
                                                    <img
                                                        src={rightArrow}
                                                        className="size-[16px]"
                                                    />
                                                </div>
                                                <div className="flex flex-col text-end">
                                                    <div className="flex flex-row gap-2">
                                                        <img
                                                            src={calanderGrey}
                                                            className=""
                                                        />
                                                        <h1 className="text-[10px] text-[#6A7282]">
                                                            {
                                                                vehicle.arrival
                                                                    .date
                                                            }
                                                        </h1>
                                                    </div>
                                                    <h1 className="text-[#101828] text-[14px]">
                                                        {vehicle.arrival.time}
                                                    </h1>
                                                    <h1 className="text-[#4A5565] text-[12px]">
                                                        {
                                                            vehicle.arrival
                                                                .location
                                                        }
                                                    </h1>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-5 px-5 pb-3">
                                            <h1 className="text-[10px] text-[#6A7282]">
                                                Select Class
                                            </h1>

                                            <div className="flex flex-col sm:flex-row justify-between items-center">
                                                {vehicle.classes.map(
                                                    (cls, clsIndex) => (
                                                        <div
                                                            key={clsIndex}
                                                            className="w-[111px] h-[82px] border-[0.8px] bg-gradient-to-t rounded-[10px] mt-3 p-3"
                                                            style={{
                                                                borderColor:
                                                                    cls.color,
                                                                background: `linear-gradient(to top, ${cls.color}20, ${cls.color}10)`,
                                                            }}
                                                        >
                                                            <h1
                                                                className="text-[10px] font-[400]"
                                                                style={{
                                                                    color: cls.color,
                                                                }}
                                                            >
                                                                {cls.name}
                                                            </h1>
                                                            <h1
                                                                className="text-[12px] font-[400]"
                                                                style={{
                                                                    color: cls.color,
                                                                }}
                                                            >
                                                                {cls.price}
                                                            </h1>
                                                            <div className="flex flex-row items-center gap-2">
                                                                <div
                                                                    className="size-[6px] rounded-full"
                                                                    style={{
                                                                        backgroundColor:
                                                                            cls.color,
                                                                    }}
                                                                />
                                                                <h1
                                                                    className="text-[9px] font-[400]"
                                                                    style={{
                                                                        color: cls.color,
                                                                    }}
                                                                >
                                                                    {cls.seats}
                                                                </h1>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* train section */}
                    {activeSection === "train" && (
                        <div
                            className={`mt-10 poppins flex flex-col gap-5 justify-center items-center transition-all duration-300 ease-in-out ${
                                isTransitioning
                                    ? "opacity-0 transform translate-y-4"
                                    : "opacity-100 transform translate-y-0"
                            }`}
                        >
                            <div
                                className={`flex flex-row flex-wrap justify-center items-center gap-10 transition-all duration-300 ease-in-out pb-5 max-h-[330px] overflow-y-auto ${
                                    isTransitioning
                                        ? "opacity-0 transform scale-95"
                                        : "opacity-100 transform scale-100"
                                }`}
                            >
                                {vehicleData.train.map((vehicle, index) => (
                                    <div
                                        key={index}
                                        className="w-full sm:w-[382px] shadow-lg rounded-[12px] h-auto bg-[#FFFFFF] border-[0.8px] border-[#F3F4F6] transition-all duration-300 ease-in-out hover:scale-95 transform"
                                    >
                                        <div className="flex flex-row justify-center items-center gap-3 w-full py-4 px-5">
                                            <div className="size-[36px] bg-[#FAF5FF] rounded-[10px] flex justify-center items-center p-2">
                                                <img
                                                    src={vehicle.icon}
                                                    className=""
                                                />
                                            </div>
                                            <div>
                                                <h1 className="text-[#101828] text-[14px]">
                                                    {vehicle.name}
                                                </h1>
                                                <h1 className="text-[#6A7282] text-[12px]">
                                                    {vehicle.route}
                                                </h1>
                                            </div>
                                            <div className="w-[64px] h-[23px] bg-[#F0FDF4] rounded-[8px] text-[#008236] text-[10px] flex justify-center items-center ml-auto p-1">
                                                <h1>{vehicle.frequency}</h1>
                                            </div>
                                        </div>
                                        <div className="border-[#F3F4F6] border-y-[0.8px] w-full py-5 px-5">
                                            <div className="flex flex-row justify-between items-center">
                                                <div className="flex flex-col">
                                                    <div className="flex flex-row gap-2">
                                                        <img
                                                            src={calanderGrey}
                                                            className=""
                                                        />
                                                        <h1 className="text-[10px] text-[#6A7282]">
                                                            {
                                                                vehicle
                                                                    .departure
                                                                    .date
                                                            }
                                                        </h1>
                                                    </div>
                                                    <h1 className="text-[#101828] text-[14px]">
                                                        {vehicle.departure.time}
                                                    </h1>
                                                    <h1 className="text-[#4A5565] text-[12px]">
                                                        {
                                                            vehicle.departure
                                                                .location
                                                        }
                                                    </h1>
                                                </div>
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="flex flex-row gap-1 items-center">
                                                        <img
                                                            src={clockGrey}
                                                            className="clock"
                                                        />
                                                        <h1 className="text-[#6A7282] text-[9px]">
                                                            {vehicle.duration}
                                                        </h1>
                                                    </div>
                                                    <img
                                                        src={rightArrow}
                                                        className="size-[16px]"
                                                    />
                                                </div>
                                                <div className="flex flex-col text-end">
                                                    <div className="flex flex-row gap-2">
                                                        <img
                                                            src={calanderGrey}
                                                            className=""
                                                        />
                                                        <h1 className="text-[10px] text-[#6A7282]">
                                                            {
                                                                vehicle.arrival
                                                                    .date
                                                            }
                                                        </h1>
                                                    </div>
                                                    <h1 className="text-[#101828] text-[14px]">
                                                        {vehicle.arrival.time}
                                                    </h1>
                                                    <h1 className="text-[#4A5565] text-[12px]">
                                                        {
                                                            vehicle.arrival
                                                                .location
                                                        }
                                                    </h1>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-5 px-5 pb-3">
                                            <h1 className="text-[10px] text-[#6A7282]">
                                                Select Class
                                            </h1>

                                            <div className="flex flex-col sm:flex-row justify-between items-center">
                                                {vehicle.classes.map(
                                                    (cls, clsIndex) => (
                                                        <div
                                                            key={clsIndex}
                                                            className="w-[111px] h-[82px] border-[0.8px] bg-gradient-to-t rounded-[10px] mt-3 p-3"
                                                            style={{
                                                                borderColor:
                                                                    cls.color,
                                                                background: `linear-gradient(to top, ${cls.color}20, ${cls.color}10)`,
                                                            }}
                                                        >
                                                            <h1
                                                                className="text-[10px] font-[400]"
                                                                style={{
                                                                    color: cls.color,
                                                                }}
                                                            >
                                                                {cls.name}
                                                            </h1>
                                                            <h1
                                                                className="text-[12px] font-[400]"
                                                                style={{
                                                                    color: cls.color,
                                                                }}
                                                            >
                                                                {cls.price}
                                                            </h1>
                                                            <div className="flex flex-row items-center gap-2">
                                                                <div
                                                                    className="size-[6px] rounded-full"
                                                                    style={{
                                                                        backgroundColor:
                                                                            cls.color,
                                                                    }}
                                                                />
                                                                <h1
                                                                    className="text-[9px] font-[400]"
                                                                    style={{
                                                                        color: cls.color,
                                                                    }}
                                                                >
                                                                    {cls.seats}
                                                                </h1>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* plane section */}
                    {activeSection === "plane" && (
                        <div
                            className={`mt-10 poppins flex flex-col gap-5 justify-center items-center transition-all duration-300 ease-in-out ${
                                isTransitioning
                                    ? "opacity-0 transform translate-y-4"
                                    : "opacity-100 transform translate-y-0"
                            }`}
                        >
                            <div
                                className={`flex flex-row flex-wrap justify-center items-center gap-10 transition-all duration-300 ease-in-out pb-5 max-h-[330px] overflow-y-auto ${
                                    isTransitioning
                                        ? "opacity-0 transform scale-95"
                                        : "opacity-100 transform scale-100"
                                }`}
                            >
                                {vehicleData.plane.map((vehicle, index) => (
                                    <div
                                        key={index}
                                        className="w-full sm:w-[382px] shadow-lg rounded-[12px] h-auto bg-[#FFFFFF] border-[0.8px] border-[#F3F4F6] transition-all duration-300 ease-in-out hover:scale-95 transform"
                                    >
                                        <div className="flex flex-row justify-center items-center gap-3 w-full py-4 px-5">
                                            <div className="size-[36px] bg-[#FAF5FF] rounded-[10px] flex justify-center items-center p-2">
                                                <img
                                                    src={vehicle.icon}
                                                    className=""
                                                />
                                            </div>
                                            <div>
                                                <h1 className="text-[#101828] text-[14px]">
                                                    {vehicle.name}
                                                </h1>
                                                <h1 className="text-[#6A7282] text-[12px]">
                                                    {vehicle.route}
                                                </h1>
                                            </div>
                                            <div className="w-[64px] h-[23px] bg-[#F0FDF4] rounded-[8px] text-[#008236] text-[10px] flex justify-center items-center ml-auto p-1">
                                                <h1>{vehicle.frequency}</h1>
                                            </div>
                                        </div>
                                        <div className="border-[#F3F4F6] border-y-[0.8px] w-full py-5 px-5">
                                            <div className="flex flex-row justify-between items-center">
                                                <div className="flex flex-col">
                                                    <div className="flex flex-row gap-2">
                                                        <img
                                                            src={calanderGrey}
                                                            className=""
                                                        />
                                                        <h1 className="text-[10px] text-[#6A7282]">
                                                            {
                                                                vehicle
                                                                    .departure
                                                                    .date
                                                            }
                                                        </h1>
                                                    </div>
                                                    <h1 className="text-[#101828] text-[14px]">
                                                        {vehicle.departure.time}
                                                    </h1>
                                                    <h1 className="text-[#4A5565] text-[12px]">
                                                        {
                                                            vehicle.departure
                                                                .location
                                                        }
                                                    </h1>
                                                </div>
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="flex flex-row gap-1 items-center">
                                                        <img
                                                            src={clockGrey}
                                                            className="clock"
                                                        />
                                                        <h1 className="text-[#6A7282] text-[9px]">
                                                            {vehicle.duration}
                                                        </h1>
                                                    </div>
                                                    <img
                                                        src={rightArrow}
                                                        className="size-[16px]"
                                                    />
                                                </div>
                                                <div className="flex flex-col text-end">
                                                    <div className="flex flex-row gap-2">
                                                        <img
                                                            src={calanderGrey}
                                                            className=""
                                                        />
                                                        <h1 className="text-[10px] text-[#6A7282]">
                                                            {
                                                                vehicle.arrival
                                                                    .date
                                                            }
                                                        </h1>
                                                    </div>
                                                    <h1 className="text-[#101828] text-[14px]">
                                                        {vehicle.arrival.time}
                                                    </h1>
                                                    <h1 className="text-[#4A5565] text-[12px]">
                                                        {
                                                            vehicle.arrival
                                                                .location
                                                        }
                                                    </h1>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-5 px-5 pb-3">
                                            <h1 className="text-[10px] text-[#6A7282]">
                                                Select Class
                                            </h1>

                                            <div className="flex flex-col sm:flex-row justify-between items-center">
                                                {vehicle.classes.map(
                                                    (cls, clsIndex) => (
                                                        <div
                                                            key={clsIndex}
                                                            className="w-[111px] h-[82px] border-[0.8px] bg-gradient-to-t rounded-[10px] mt-3 p-3"
                                                            style={{
                                                                borderColor:
                                                                    cls.color,
                                                                background: `linear-gradient(to top, ${cls.color}20, ${cls.color}10)`,
                                                            }}
                                                        >
                                                            <h1
                                                                className="text-[10px] font-[400]"
                                                                style={{
                                                                    color: cls.color,
                                                                }}
                                                            >
                                                                {cls.name}
                                                            </h1>
                                                            <h1
                                                                className="text-[12px] font-[400]"
                                                                style={{
                                                                    color: cls.color,
                                                                }}
                                                            >
                                                                {cls.price}
                                                            </h1>
                                                            <div className="flex flex-row items-center gap-2">
                                                                <div
                                                                    className="size-[6px] rounded-full"
                                                                    style={{
                                                                        backgroundColor:
                                                                            cls.color,
                                                                    }}
                                                                />
                                                                <h1
                                                                    className="text-[9px] font-[400]"
                                                                    style={{
                                                                        color: cls.color,
                                                                    }}
                                                                >
                                                                    {cls.seats}
                                                                </h1>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* yatch section */}
                    {activeSection === "yacht" && (
                        <div
                            className={`mt-10 poppins flex flex-col gap-5 justify-center items-center transition-all duration-300 ease-in-out ${
                                isTransitioning
                                    ? "opacity-0 transform translate-y-4"
                                    : "opacity-100 transform translate-y-0"
                            }`}
                        >
                            <div
                                className={`flex flex-row flex-wrap justify-center items-center gap-10 transition-all duration-300 ease-in-out pb-5 max-h-[330px] overflow-y-auto ${
                                    isTransitioning
                                        ? "opacity-0 transform scale-95"
                                        : "opacity-100 transform scale-100"
                                }`}
                            >
                                {vehicleData.yacht.map((vehicle, index) => (
                                    <Link
                                    key={index}
                                    href="/multiModel/yatch/yatchDetails"
                                        className="w-full sm:w-[382px] shadow-lg rounded-[12px] h-auto bg-[#FFFFFF] border-[0.8px] border-[#F3F4F6] transition-all duration-300 ease-in-out hover:scale-95 transform"
                                    >
                                        <div className="flex flex-row justify-center items-center gap-3 w-full py-4 px-5">
                                            <div className="size-[36px] bg-[#FAF5FF] rounded-[10px] flex justify-center items-center p-2">
                                                <img
                                                    src={vehicle.icon}
                                                    className=""
                                                />
                                            </div>
                                            <div>
                                                <h1 className="text-[#101828] text-[14px]">
                                                    {vehicle.name}
                                                </h1>
                                                <h1 className="text-[#6A7282] text-[12px]">
                                                    {vehicle.route}
                                                </h1>
                                            </div>
                                            <div className="w-[64px] h-[23px] bg-[#F0FDF4] rounded-[8px] text-[#008236] text-[10px] flex justify-center items-center ml-auto p-1">
                                                <h1>{vehicle.frequency}</h1>
                                            </div>
                                        </div>
                                        <div className="border-[#F3F4F6] border-y-[0.8px] w-full py-5 px-5">
                                            <div className="flex flex-row justify-between items-center">
                                                <div className="flex flex-col">
                                                    <div className="flex flex-row gap-2">
                                                        <img
                                                            src={calanderGrey}
                                                            className=""
                                                        />
                                                        <h1 className="text-[10px] text-[#6A7282]">
                                                            {
                                                                vehicle
                                                                    .departure
                                                                    .date
                                                            }
                                                        </h1>
                                                    </div>
                                                    <h1 className="text-[#101828] text-[14px]">
                                                        {vehicle.departure.time}
                                                    </h1>
                                                    <h1 className="text-[#4A5565] text-[12px]">
                                                        {
                                                            vehicle.departure
                                                                .location
                                                        }
                                                    </h1>
                                                </div>
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="flex flex-row gap-1 items-center">
                                                        <img
                                                            src={clockGrey}
                                                            className="clock"
                                                        />
                                                        <h1 className="text-[#6A7282] text-[9px]">
                                                            {vehicle.duration}
                                                        </h1>
                                                    </div>
                                                    <img
                                                        src={rightArrow}
                                                        className="size-[16px]"
                                                    />
                                                </div>
                                                <div className="flex flex-col text-end">
                                                    <div className="flex flex-row gap-2">
                                                        <img
                                                            src={calanderGrey}
                                                            className=""
                                                        />
                                                        <h1 className="text-[10px] text-[#6A7282]">
                                                            {
                                                                vehicle.arrival
                                                                    .date
                                                            }
                                                        </h1>
                                                    </div>
                                                    <h1 className="text-[#101828] text-[14px]">
                                                        {vehicle.arrival.time}
                                                    </h1>
                                                    <h1 className="text-[#4A5565] text-[12px]">
                                                        {
                                                            vehicle.arrival
                                                                .location
                                                        }
                                                    </h1>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-5 px-5 pb-3">
                                            <h1 className="text-[10px] text-[#6A7282]">
                                                Select Class
                                            </h1>

                                            <div className="flex flex-col sm:flex-row justify-between items-center">
                                                {vehicle.classes.map(
                                                    (cls, clsIndex) => (
                                                        <div
                                                            key={clsIndex}
                                                            className="w-[111px] h-[82px] border-[0.8px] bg-gradient-to-t rounded-[10px] mt-3 p-3"
                                                            style={{
                                                                borderColor:
                                                                    cls.color,
                                                                background: `linear-gradient(to top, ${cls.color}20, ${cls.color}10)`,
                                                            }}
                                                        >
                                                            <h1
                                                                className="text-[10px] font-[400]"
                                                                style={{
                                                                    color: cls.color,
                                                                }}
                                                            >
                                                                {cls.name}
                                                            </h1>
                                                            <h1
                                                                className="text-[12px] font-[400]"
                                                                style={{
                                                                    color: cls.color,
                                                                }}
                                                            >
                                                                {cls.price}
                                                            </h1>
                                                            <div className="flex flex-row items-center gap-2">
                                                                <div
                                                                    className="size-[6px] rounded-full"
                                                                    style={{
                                                                        backgroundColor:
                                                                            cls.color,
                                                                    }}
                                                                />
                                                                <h1
                                                                    className="text-[9px] font-[400]"
                                                                    style={{
                                                                        color: cls.color,
                                                                    }}
                                                                >
                                                                    {cls.seats}
                                                                </h1>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Hero;
