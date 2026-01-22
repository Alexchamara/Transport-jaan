import React, { useState, useEffect } from "react";
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

import train from "../../../assets/multiModel/planJourney/train.svg";
import flight from "../../../assets/multiModel/planJourney/flight.svg";
import yatch from "../../../assets/multiModel/planJourney/yatch.svg";
import carBlack from "../../../assets/multiModel/planJourney/carBlack.svg";

import carBlue from "../../../assets/multiModel/planJourney/carBlue.svg";
import busBlue from "../../../assets/multiModel/planJourney/busBlue.svg";
import trainBlue from "../../../assets/multiModel/planJourney/trainBlue.svg";
import planeBlue from "../../../assets/multiModel/planJourney/planeBlue.svg";
import shipBlue from "../../../assets/multiModel/planJourney/shipBlue.svg";

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
            departure: { date: "11 Dec, Mon", time: "06:00 AM", location: "Colombo Fort" },
            arrival: { date: "11 Dec, Mon", time: "08:30 AM", location: "Kandy" },
            duration: "2h 30m",
            classes: [
                { name: "Standard", price: "Rs 450", color: "#0955AC", seats: "12 seats left" },
                { name: "Premium", price: "Rs 750", color: "#059669", seats: "8 seats left" },
                { name: "Luxury", price: "Rs 1,200", color: "#DC2626", seats: "4 seats left" },
            ],
        },
        {
            icon: busPurple,
            name: "Mountain Express",
            route: "Route 101",
            frequency: "Every 2 Hours",
            departure: { date: "11 Dec, Mon", time: "07:00 AM", location: "Colombo" },
            arrival: { date: "11 Dec, Mon", time: "11:00 AM", location: "Nuwara Eliya" },
            duration: "4h 00m",
            classes: [
                { name: "Standard", price: "Rs 850", color: "#0955AC", seats: "15 seats left" },
                { name: "Premium", price: "Rs 1,250", color: "#059669", seats: "6 seats left" },
                { name: "Luxury", price: "Rs 1,800", color: "#DC2626", seats: "2 seats left" },
            ],
        },
    ],
    train: [
        {
            icon: train,
            name: "Blue Line Express",
            route: "Colombo - Kandy",
            frequency: "Every 2 Hours",
            departure: { date: "11 Dec, Mon", time: "05:55 AM", location: "Colombo Fort" },
            arrival: { date: "11 Dec, Mon", time: "08:47 AM", location: "Kandy" },
            duration: "2h 52m",
            classes: [
                { name: "2nd Class", price: "Rs 180", color: "#0955AC", seats: "Available" },
                { name: "1st Class", price: "Rs 360", color: "#059669", seats: "10 seats left" },
                { name: "Observation", price: "Rs 1,000", color: "#DC2626", seats: "Sold Out" },
            ],
        },
        {
            icon: train,
            name: "Coastal Line",
            route: "Colombo - Galle",
            frequency: "Every Hour",
            departure: { date: "11 Dec, Mon", time: "06:30 AM", location: "Colombo Fort" },
            arrival: { date: "11 Dec, Mon", time: "09:00 AM", location: "Galle" },
            duration: "2h 30m",
            classes: [
                { name: "2nd Class", price: "Rs 140", color: "#0955AC", seats: "Available" },
                { name: "1st Class", price: "Rs 280", color: "#059669", seats: "15 seats left" },
                { name: "Reserved", price: "Rs 350", color: "#DC2626", seats: "8 seats left" },
            ],
        },
    ],
    plane: [
        {
            icon: flight,
            name: "SriLankan Airlines",
            route: "UL 123",
            frequency: "Direct",
            departure: { date: "11 Dec, Mon", time: "06:00 AM", location: "Colombo (CMB)" },
            arrival: { date: "11 Dec, Mon", time: "07:15 AM", location: "Jaffna (JAF)" },
            duration: "1h 15m",
            classes: [
                { name: "Economy", price: "Rs 8,500", color: "#0955AC", seats: "12 seats left" },
                { name: "Business", price: "Rs 18,000", color: "#059669", seats: "4 seats left" },
                { name: "First Class", price: "Rs 32,000", color: "#DC2626", seats: "2 seats left" },
            ],
        },
        {
            icon: flight,
            name: "Cinnamon Air",
            route: "CA 401",
            frequency: "Direct",
            departure: { date: "11 Dec, Mon", time: "08:30 AM", location: "Colombo (CMB)" },
            arrival: { date: "11 Dec, Mon", time: "09:30 AM", location: "Trincomalee (TRR)" },
            duration: "1h 00m",
            classes: [
                { name: "Economy", price: "Rs 12,000", color: "#0955AC", seats: "8 seats left" },
                { name: "Premium", price: "Rs 22,000", color: "#059669", seats: "3 seats left" },
                { name: "Charter", price: "Rs 150,000", color: "#DC2626", seats: "On Request" },
            ],
        },
    ],
    yacht: [
        {
            icon: yatch,
            name: "Ocean Pearl",
            route: "Colombo - Trincomalee",
            frequency: "Charter",
            departure: { date: "11 Dec, Mon", time: "06:00 AM", location: "Colombo Harbor" },
            arrival: { date: "12 Dec, Tue", time: "06:00 PM", location: "Trincomalee Harbor" },
            duration: "36h 00m",
            classes: [
                { name: "Standard", price: "Rs 65,000", color: "#0955AC", seats: "6 cabins" },
                { name: "Premium", price: "Rs 95,000", color: "#059669", seats: "4 cabins" },
                { name: "Luxury", price: "Rs 135,000", color: "#DC2626", seats: "2 suites" },
            ],
        },
        {
            icon: yatch,
            name: "Sea Breeze",
            route: "Colombo - Galle",
            frequency: "Daily",
            departure: { date: "11 Dec, Mon", time: "07:00 AM", location: "Colombo Marina" },
            arrival: { date: "11 Dec, Mon", time: "03:00 PM", location: "Galle Harbor" },
            duration: "8h 00m",
            classes: [
                { name: "Day Charter", price: "Rs 45,000", color: "#0955AC", seats: "8 guests" },
                { name: "Evening", price: "Rs 55,000", color: "#059669", seats: "6 guests" },
                { name: "Overnight", price: "Rs 85,000", color: "#DC2626", seats: "4 guests" },
            ],
        },
    ],
};

const AvailableVehicles = ({ onVehicleSelect, onBackToJourney, availableCars = [], availableYachts = [], currentTripIndex = 0, trips = [] }) => {
    const [activeSection, setActiveSection] = useState("car");
    const [carPage, setCarPage] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Calculate the starting leg index for the current trip
    const getFirstLegIndexForCurrentTrip = () => {
        let legIndex = 0;
        for (let i = 0; i < currentTripIndex; i++) {
            const trip = trips[i];
            // Count legs for this trip
            if (trip.stops && trip.stops.length > 0) {
                // Has stops: start → stop1, stop1 → stop2, ..., lastStop → end
                legIndex += trip.stops.length + 1;
            } else {
                // No stops: just start → end
                legIndex += 1;
            }
        }
        return legIndex;
    };

    const currentLegIndex = getFirstLegIndexForCurrentTrip();
    console.log(`Current Trip: ${currentTripIndex + 1}, First Leg Index: ${currentLegIndex}, Total Trips: ${trips.length}`);

    const handleSectionChange = (newSection) => {
        if (newSection !== activeSection && !isTransitioning) {
            setIsTransitioning(true);
            setTimeout(() => {
                setActiveSection(newSection);
                setIsTransitioning(false);
            }, 150);
        }
    };

    const handleVehicleClick = (vehicle, transportMode) => {
        if (onVehicleSelect) {
            onVehicleSelect({ vehicle, transportMode });
        }
    };

    return (
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
                        src={activeSection === "car" ? carBlue : carBlack}
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
                        src={activeSection === "train" ? trainBlue : tramTwo}
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
                        src={activeSection === "plane" ? planeBlue : planeTwo}
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
                        src={activeSection === "yacht" ? shipBlue : shipTwo}
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
                        {availableCars.length > 0 ? (
                            availableCars.map((vehicle, index) => (
                            <div
                                key={`${carPage}-${index}`}
                                className="min-w-[217px] min-h-[295px] bg-[#F4F3F3] rounded-[10px] shadow-lg p-5 transition-all duration-300 ease-in-out hover:scale-95 transform cursor-pointer"
                            >
                                <div className="flex flex-row justify-between items-center">
                                    <div className="flex flex-col justify-center items-center gap-1">
                                        <img src={miter} />
                                        <h1 className="text-[8px] font-[500] text-[#00000040]">
                                            {vehicle.year || 'N/A'}
                                        </h1>
                                    </div>
                                    <div className="flex flex-col justify-center items-center gap-1">
                                        <img src={gear} />
                                        <h1 className="text-[8px] font-[500] text-[#00000040]">
                                            {vehicle.specs?.transmission || 'Auto'}
                                        </h1>
                                    </div>
                                    <div className="flex flex-col justify-center items-center gap-1">
                                        <img src={person} />
                                        <h1 className="text-[8px] font-[500] text-[#00000040]">
                                            {vehicle.passengerCapacity || 4} Person
                                        </h1>
                                    </div>
                                    <div className="flex flex-col justify-center items-center gap-1">
                                        <img src={gas} />
                                        <h1 className="text-[8px] font-[500] text-[#00000040]">
                                            {vehicle.specs?.fuelType || 'Petrol'}
                                        </h1>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center items-center gap-2">
                                    <img
                                        src={vehicle.image || carImg}
                                        alt="car image"
                                        className="mx-auto"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = carImg;
                                        }}
                                    />

                                    <div className="flex flex-col justify-center items-center">
                                        <h1 className="bebas-neue text-[20px] font-[400]">
                                            {vehicle.manufacturer}{" "}
                                            <span className="text-[#0955AC]">
                                                {vehicle.name}
                                            </span>{" "}
                                        </h1>

                                        <h1 className="text-[25px]/[24px] font-[700]">
                                            ${vehicle.price}{" "}
                                            <span className="text-[10px] text-[#00000080] font-[600]">
                                                /day
                                            </span>
                                        </h1>

                                        <div className="flex flex-row gap-2 justify-between">
                                            <Link
                                                href={`/multiModel/vehicleDetails/${vehicle.id}?legIndex=${currentLegIndex}`}
                                                className="w-[127px] h-[22px] rounded-[4px] bg-[#0955AC] flex justify-center items-center text-[10px] font-[700] text-[#FFFFFF] mx-auto p-1 cursor-pointer"
                                            >
                                                More Details
                                            </Link>

                                            <div className="size-[22px] border-[1px] rounded-[4px] border-[#0955AC] flex justify-center items-center p-1 cursor-pointer">
                                                <img src={heart} className="mx-auto" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-gray-500">No cars available for the selected dates</p>
                            </div>
                        )}
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
                            <div
                                key={index}
                                className="relative w-full sm:w-[382px] shadow-lg rounded-[12px] h-auto bg-[#FFFFFF] border-[0.8px] border-[#F3F4F6] transition-all duration-300 ease-in-out hover:scale-95 transform block"
                            >
                                <div className="blur-sm pointer-events-none">
                                    <div className="flex flex-row justify-center items-center gap-3 w-full py-4 px-5">
                                        <div className="size-[36px] bg-[#FAF5FF] rounded-[10px] flex justify-center items-center p-2">
                                            <img src={vehicle.icon} className="" />
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
                                                    <img src={calanderGrey} className="" />
                                                    <h1 className="text-[10px] text-[#6A7282]">
                                                        {vehicle.departure.date}
                                                    </h1>
                                                </div>
                                                <h1 className="text-[#101828] text-[14px]">
                                                    {vehicle.departure.time}
                                                </h1>
                                                <h1 className="text-[#4A5565] text-[12px]">
                                                    {vehicle.departure.location}
                                                </h1>
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex flex-row gap-1 items-center">
                                                    <img src={clockGrey} className="clock" />
                                                    <h1 className="text-[#6A7282] text-[9px]">
                                                        {vehicle.duration}
                                                    </h1>
                                                </div>
                                                <img src={rightArrow} className="size-[16px]" />
                                            </div>
                                            <div className="flex flex-col text-end">
                                                <div className="flex flex-row gap-2">
                                                    <img src={calanderGrey} className="" />
                                                    <h1 className="text-[10px] text-[#6A7282]">
                                                        {vehicle.arrival.date}
                                                    </h1>
                                                </div>
                                                <h1 className="text-[#101828] text-[14px]">
                                                    {vehicle.arrival.time}
                                                </h1>
                                                <h1 className="text-[#4A5565] text-[12px]">
                                                    {vehicle.arrival.location}
                                                </h1>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 px-5 pb-3">
                                        <h1 className="text-[10px] text-[#6A7282]">Select Class</h1>

                                        <div className="flex flex-col sm:flex-row justify-between items-center">
                                            {vehicle.classes.map((cls, clsIndex) => (
                                                <div
                                                    key={clsIndex}
                                                    className="w-[111px] h-[82px] border-[0.8px] bg-gradient-to-t rounded-[10px] mt-3 p-3"
                                                    style={{
                                                        borderColor: cls.color,
                                                        background: `linear-gradient(to top, ${cls.color}20, ${cls.color}10)`,
                                                    }}
                                                >
                                                    <h1
                                                        className="text-[10px] font-[400]"
                                                        style={{ color: cls.color }}
                                                    >
                                                        {cls.name}
                                                    </h1>
                                                    <h1
                                                        className="text-[12px] font-[400]"
                                                        style={{ color: cls.color }}
                                                    >
                                                        {cls.price}
                                                    </h1>
                                                    <div className="flex flex-row items-center gap-2">
                                                        <div
                                                            className="size-[6px] rounded-full"
                                                            style={{
                                                                backgroundColor: cls.color,
                                                            }}
                                                        />
                                                        <h1
                                                            className="text-[9px] font-[400]"
                                                            style={{ color: cls.color }}
                                                        >
                                                            {cls.seats}
                                                        </h1>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75 rounded-[12px]">
                                    <span className="text-[30px] figtree font-[700] text-gray-600">
                                        Coming{" "}
                                        <span className="text-[#0955AC]">Soon</span>
                                    </span>
                                </div>
                            </div>
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
                                className="relative w-full sm:w-[382px] shadow-lg rounded-[12px] h-auto bg-[#FFFFFF] border-[0.8px] border-[#F3F4F6] transition-all duration-300 ease-in-out hover:scale-95 transform"
                            >
                                <div className="blur-sm pointer-events-none">
                                    <div className="flex flex-row justify-center items-center gap-3 w-full py-4 px-5">
                                        <div className="size-[36px] bg-[#FAF5FF] rounded-[10px] flex justify-center items-center p-2">
                                            <img src={vehicle.icon} className="" />
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
                                                    <img src={calanderGrey} className="" />
                                                    <h1 className="text-[10px] text-[#6A7282]">
                                                        {vehicle.departure.date}
                                                    </h1>
                                                </div>
                                                <h1 className="text-[#101828] text-[14px]">
                                                    {vehicle.departure.time}
                                                </h1>
                                                <h1 className="text-[#4A5565] text-[12px]">
                                                    {vehicle.departure.location}
                                                </h1>
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex flex-row gap-1 items-center">
                                                    <img src={clockGrey} className="clock" />
                                                    <h1 className="text-[#6A7282] text-[9px]">
                                                        {vehicle.duration}
                                                    </h1>
                                                </div>
                                                <img src={rightArrow} className="size-[16px]" />
                                            </div>
                                            <div className="flex flex-col text-end">
                                                <div className="flex flex-row gap-2">
                                                    <img src={calanderGrey} className="" />
                                                    <h1 className="text-[10px] text-[#6A7282]">
                                                        {vehicle.arrival.date}
                                                    </h1>
                                                </div>
                                                <h1 className="text-[#101828] text-[14px]">
                                                    {vehicle.arrival.time}
                                                </h1>
                                                <h1 className="text-[#4A5565] text-[12px]">
                                                    {vehicle.arrival.location}
                                                </h1>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 px-5 pb-3">
                                        <h1 className="text-[10px] text-[#6A7282]">Select Class</h1>

                                        <div className="flex flex-col sm:flex-row justify-between items-center">
                                            {vehicle.classes.map((cls, clsIndex) => (
                                                <div
                                                    key={clsIndex}
                                                    className="w-[111px] h-[82px] border-[0.8px] bg-gradient-to-t rounded-[10px] mt-3 p-3"
                                                    style={{
                                                        borderColor: cls.color,
                                                        background: `linear-gradient(to top, ${cls.color}20, ${cls.color}10)`,
                                                    }}
                                                >
                                                    <h1
                                                        className="text-[10px] font-[400]"
                                                        style={{ color: cls.color }}
                                                    >
                                                        {cls.name}
                                                    </h1>
                                                    <h1
                                                        className="text-[12px] font-[400]"
                                                        style={{ color: cls.color }}
                                                    >
                                                        {cls.price}
                                                    </h1>
                                                    <div className="flex flex-row items-center gap-2">
                                                        <div
                                                            className="size-[6px] rounded-full"
                                                            style={{
                                                                backgroundColor: cls.color,
                                                            }}
                                                        />
                                                        <h1
                                                            className="text-[9px] font-[400]"
                                                            style={{ color: cls.color }}
                                                        >
                                                            {cls.seats}
                                                        </h1>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75 rounded-[12px]">
                                    <span className="text-[30px] figtree font-[700] text-gray-600">
                                        Coming{" "}
                                        <span className="text-[#0955AC]">Soon</span>
                                    </span>
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
                                className="relative w-full sm:w-[382px] shadow-lg rounded-[12px] h-auto bg-[#FFFFFF] border-[0.8px] border-[#F3F4F6] transition-all duration-300 ease-in-out hover:scale-95 transform"
                            >
                                <div className="blur-sm pointer-events-none">
                                    <div className="flex flex-row justify-center items-center gap-3 w-full py-4 px-5">
                                        <div className="size-[36px] bg-[#FAF5FF] rounded-[10px] flex justify-center items-center p-2">
                                            <img src={vehicle.icon} className="" />
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
                                                    <img src={calanderGrey} className="" />
                                                    <h1 className="text-[10px] text-[#6A7282]">
                                                        {vehicle.departure.date}
                                                    </h1>
                                                </div>
                                                <h1 className="text-[#101828] text-[14px]">
                                                    {vehicle.departure.time}
                                                </h1>
                                                <h1 className="text-[#4A5565] text-[12px]">
                                                    {vehicle.departure.location}
                                                </h1>
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="flex flex-row gap-1 items-center">
                                                    <img src={clockGrey} className="clock" />
                                                    <h1 className="text-[#6A7282] text-[9px]">
                                                        {vehicle.duration}
                                                    </h1>
                                                </div>
                                                <img src={rightArrow} className="size-[16px]" />
                                            </div>
                                            <div className="flex flex-col text-end">
                                                <div className="flex flex-row gap-2">
                                                    <img src={calanderGrey} className="" />
                                                    <h1 className="text-[10px] text-[#6A7282]">
                                                        {vehicle.arrival.date}
                                                    </h1>
                                                </div>
                                                <h1 className="text-[#101828] text-[14px]">
                                                    {vehicle.arrival.time}
                                                </h1>
                                                <h1 className="text-[#4A5565] text-[12px]">
                                                    {vehicle.arrival.location}
                                                </h1>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 px-5 pb-3">
                                        <h1 className="text-[10px] text-[#6A7282]">Select Class</h1>

                                        <div className="flex flex-col sm:flex-row justify-between items-center">
                                            {vehicle.classes.map((cls, clsIndex) => (
                                                <div
                                                    key={clsIndex}
                                                    className="w-[111px] h-[82px] border-[0.8px] bg-gradient-to-t rounded-[10px] mt-3 p-3"
                                                    style={{
                                                        borderColor: cls.color,
                                                        background: `linear-gradient(to top, ${cls.color}20, ${cls.color}10)`,
                                                    }}
                                                >
                                                    <h1
                                                        className="text-[10px] font-[400]"
                                                        style={{ color: cls.color }}
                                                    >
                                                        {cls.name}
                                                    </h1>
                                                    <h1
                                                        className="text-[12px] font-[400]"
                                                        style={{ color: cls.color }}
                                                    >
                                                        {cls.price}
                                                    </h1>
                                                    <div className="flex flex-row items-center gap-2">
                                                        <div
                                                            className="size-[6px] rounded-full"
                                                            style={{
                                                                backgroundColor: cls.color,
                                                            }}
                                                        />
                                                        <h1
                                                            className="text-[9px] font-[400]"
                                                            style={{ color: cls.color }}
                                                        >
                                                            {cls.seats}
                                                        </h1>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75 rounded-[12px]">
                                    <span className="text-[30px] figtree font-[700] text-gray-600">
                                        Coming{" "}
                                        <span className="text-[#0955AC]">Soon</span>
                                    </span>
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
                        {availableYachts.length > 0 ? (
                            availableYachts.map((vehicle, index) => (
                            <div
                                key={index}
                                className="min-w-[217px] min-h-[295px] bg-[#F4F3F3] rounded-[10px] shadow-lg p-5 transition-all duration-300 ease-in-out hover:scale-95 transform cursor-pointer"
                            >
                                <div className="flex flex-col justify-center items-center gap-2">
                                    <img
                                        src={vehicle.image || carImg}
                                        alt="yacht image"
                                        className="mx-auto w-full h-[150px] object-cover rounded-lg"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = carImg;
                                        }}
                                    />

                                    <div className="flex flex-col justify-center items-center w-full">
                                        <h1 className="bebas-neue text-[20px] font-[400]">
                                            {vehicle.manufacturer}{" "}
                                            <span className="text-[#0955AC]">
                                                {vehicle.name}
                                            </span>{" "}
                                        </h1>

                                        <div className="flex flex-row justify-around w-full text-[10px] text-gray-600 my-2">
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold">{vehicle.specs?.length || 'N/A'}</span>
                                                <span>Length</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold">{vehicle.specs?.cabins || 'N/A'}</span>
                                                <span>Cabins</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold">{vehicle.passengerCapacity || 'N/A'}</span>
                                                <span>Guests</span>
                                            </div>
                                        </div>

                                        <h1 className="text-[25px]/[24px] font-[700]">
                                            ${vehicle.price}{" "}
                                            <span className="text-[10px] text-[#00000080] font-[600]">
                                                /day
                                            </span>
                                        </h1>

                                        <div className="flex flex-row gap-2 justify-between mt-2">
                                            <Link
                                                href={`/multiModel/vehicleDetails/${vehicle.id}?legIndex=${currentLegIndex}`}
                                                className="w-[127px] h-[22px] rounded-[4px] bg-[#0955AC] flex justify-center items-center text-[10px] font-[700] text-[#FFFFFF] mx-auto p-1 cursor-pointer"
                                            >
                                                More Details
                                            </Link>

                                            <div className="size-[22px] border-[1px] rounded-[4px] border-[#0955AC] flex justify-center items-center p-1 cursor-pointer">
                                                <img src={heart} className="mx-auto" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-gray-500">No yachts available for the selected dates</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Back to Journey Button */}
            {onBackToJourney && (
                <button
                    onClick={onBackToJourney}
                    className="w-full max-w-[400px] h-[43px] flex justify-center items-center bg-gray-200 hover:bg-gray-300 mt-5 text-[16px] text-[#0955AC] font-[700] rounded-[10px] cursor-pointer px-4 py-2 transition-colors"
                >
                    Back to Journey Planning
                </button>
            )}
        </div>
    );
};

export default AvailableVehicles;
