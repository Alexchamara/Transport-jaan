import React, { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import car from "../../../assets/multiModel/planJourney/car-icon.svg";
import bus from "../../../assets/multiModel/planJourney/bus-icon.svg";
import ship from "../../../assets/multiModel/planJourney/ship-icon.svg";
import plane from "../../../assets/multiModel/planJourney/plane-icon.svg";
import tram from "../../../assets/multiModel/planJourney/tram-icon.svg";

import badgeCheck from "../../../assets/multiModel/planJourney/badgeCheck.svg";

import map from "../../../assets/multiModel/planJourney/map.svg";

import JourneyPlanner from "./JourneyPlanner";

const Hero = () => {
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
    return (
        <>
            <div className="grid grid-cols-1 xl:grid-cols-3 px-5 md:px-10 py-10 gap-20">
                <div className="xl:col-span-1">
                    <JourneyPlanner startJourney={startJourney} setStartJourney={setStartJourney} addedStops={addedStops} setAddedStops={setAddedStops} endJourney={endJourney} setEndJourney={setEndJourney} />
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

                    {/* 1st tab */}
                    <div className="relative w-full md:h-[400px] shadow-lg bg-[#F4F3F3] rounded-[20px] pb-20 md:pb-0 p-5 md:p-10 poppins flex flex-col gap-5">
                        <div>
                            <h1 className="bebas-neue text-[50px]/[100%]">
                                Available Vehicles
                            </h1>
                            <h3 className="text-[14px] font-[500] text-[#00000080]">
                                Add Journey → Click Find Vehicles → Go!
                            </h3>
                        </div>

                        <div className="text-[18px] text-[#0955AC] font-[700] figtree mt-5 flex flex-col md:flex-row justify-between gap-5 items-center w-full">
                            <Link href="/multiModel/available-vehicles">
                                <div className="relative w-full md:w-[108px] md:h-[118px] bg-[#0955AC1A] rounded-[10px] flex flex-col justify-center items-center px-4 py-2">
                                    <img src={car} alt="car icon" />
                                    <h1>Car</h1>
                                    <div className="absolute top-[-10px] right-[-10px] w-[45px] h-[25px] bg-[#0955AC] rounded-[5px] text-[#FFFFFF] font-[700] flex justify-center items-center p-1">
                                        145
                                    </div>
                                </div>
                            </Link>

                            <Link href="/multiModel/available-vehicles">
                                <div className="relative w-full md:w-[108px] md:h-[118px] bg-[#0955AC1A] rounded-[10px] flex flex-col justify-center items-center px-4 py-2">
                                    <img src={bus} alt="bus icon" />
                                    <h1>Bus</h1>
                                    <div className="absolute top-[-10px] right-[-10px] w-[45px] h-[25px] bg-[#0955AC] rounded-[5px] text-[#FFFFFF] font-[700] flex justify-center items-center p-1">
                                        10
                                    </div>
                                </div>
                            </Link>

                            <Link href="/multiModel/available-vehicles">
                                <div className="relative w-full md:w-[108px] md:h-[118px] bg-[#0955AC1A] rounded-[10px] flex flex-col justify-center items-center px-4 py-2">
                                    <img src={tram} alt="tram icon" />
                                    <h1>Train</h1>
                                    <div className="absolute top-[-10px] right-[-10px] w-[45px] h-[25px] bg-[#0955AC] rounded-[5px] text-[#FFFFFF] font-[700] flex justify-center items-center p-1">
                                        3
                                    </div>
                                </div>
                            </Link>

                            <Link href="/multiModel/available-vehicles">
                                <div className="relative w-full md:w-[108px] md:h-[118px] bg-[#0955AC1A] rounded-[10px] flex flex-col justify-center items-center px-4 py-2">
                                    <img src={plane} alt="plane icon" />
                                    <h1>Plane</h1>
                                    <div className="absolute top-[-10px] right-[-10px] w-[45px] h-[25px] bg-[#0955AC] rounded-[5px] text-[#FFFFFF] font-[700] flex justify-center items-center p-1">
                                        1
                                    </div>
                                </div>
                            </Link>

                            <Link href="/multiModel/available-vehicles">
                                <div className="relative w-full md:w-[108px] md:h-[118px] bg-[#0955AC1A] rounded-[10px] flex flex-col justify-center items-center px-4 py-2">
                                    <img src={ship} alt="ship icon" />
                                    <h1>Yatch</h1>
                                    <div className="absolute top-[-10px] right-[-10px] w-[45px] h-[25px] bg-[#0955AC] rounded-[5px] text-[#FFFFFF] font-[700] flex justify-center items-center p-1">
                                        1
                                    </div>
                                </div>
                            </Link>
                        </div>
                        <div className="absolute md:bottom-5 bottom-2 right-5 flex flex-row gap-2 text-[15px] font-[500] text-[#000000] items-center">
                            <img src={badgeCheck} alt="badge check icon" />
                            <h1>
                                All the{" "}
                                <span className="text-[#0955AC]">vehicles</span>{" "}
                                are{" "}
                                <span className="text-[#0955AC]">verified</span>{" "}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Hero;
