import React, { useState, useEffect } from "react";
import bg from "../../assets/multiModel/bg.png";
import bg2 from "../../assets/multiModel/bg2.jpg";
import bg3 from "../../assets/multiModel/bg3.jpg";
import bg4 from "../../assets/multiModel/bg4.jpg";
import bg5 from "../../assets/multiModel/bg5.jpg";
import bg6 from "../../assets/multiModel/bg6.jpg";
import icon1 from "../../assets/multiModel/icon1.svg";
import icon2 from "../../assets/multiModel/icon2.svg";
import icon3 from "../../assets/multiModel/icon3.svg";
import icon4 from "../../assets/multiModel/icon4.svg";
import icon5 from "../../assets/multiModel/icon5.svg";

import downArrow from "../../assets/multiModel/downArrow.svg";
import calendar from "../../assets/multiModel/calendar.svg";

import { Link } from "@inertiajs/react";


const HERO_BACKGROUNDS = [bg, bg2, bg3, bg4, bg5, bg6];

const TAB_CONFIG = [
    {
        key: "car",
        label: "Car",
        icon: icon1,
        fields: [
            {
                id: "pickup",
                label: "Pick-up Location",
                placeholder: "Colombo, Bandaranaike Airport",
            },
            {
                id: "dropoff",
                label: "Drop-off Location",
                placeholder: "Hotel / Destination",
            },
            { id: "date", label: "Date", placeholder: "Select date" },
        ],
    },
    {
        key: "bus",
        label: "Bus",
        icon: icon2,
        fields: [
            { id: "from", label: "From", placeholder: "City / Stop" },
            { id: "to", label: "To", placeholder: "City / Stop" },
            { id: "date", label: "Travel Date", placeholder: "Select date" },
            { id: "passengers", label: "Passengers", placeholder: "1 Adult" },
        ],
    },
    {
        key: "train",
        label: "Train",
        icon: icon3,
        fields: [
            { id: "from", label: "From", placeholder: "Station" },
            { id: "to", label: "To", placeholder: "Station" },
            { id: "date", label: "Date", placeholder: "Select date" },
            { id: "class", label: "Class", placeholder: "1st / 2nd / 3rd" },
        ],
    },
    {
        key: "air",
        label: "Air",
        icon: icon4,
        fields: [
            { id: "from", label: "From", placeholder: "Colombo (CMB)" },
            { id: "to", label: "To", placeholder: "Destination" },
            { id: "depart", label: "Depart", placeholder: "Select date" },
            {
                id: "passengers",
                label: "Travellers",
                placeholder: "1 Adult, Economy",
            },
        ],
    },
    {
        key: "yatch",
        label: "Yatch",
        icon: icon5,
        fields: [
            {
                id: "pickup",
                label: "Pick-up Marina",
                placeholder: "Pick a marina",
            },
            {
                id: "duration",
                label: "Duration",
                placeholder: "Half day / Full day",
            },
            { id: "date", label: "Date", placeholder: "Select date" },
            { id: "guests", label: "Guests", placeholder: "1-8 Guests" },
        ],
    },
];

const Hero = () => {
    const [activeTab, setActiveTab] = useState("car");
    const [activeBgIndex, setActiveBgIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveBgIndex((prev) => (prev + 1) % HERO_BACKGROUNDS.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    const currentTab = TAB_CONFIG.find((t) => t.key === activeTab);
    return (
        <div className="flex flex-col justify-center items-center px-4 sm:px-6 lg:px-0">
            <div className="max-w-[1400px] w-full py-10 px-0 sm:px-4 lg:px-10">
                <div className="relative overflow-hidden w-full min-h-[550px] sm:min-h-[650px] lg:min-h-[789px] rounded-[25px] flex flex-col justify-between items-center px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-10 sm:py-14 lg:py-[90px]">
                    {HERO_BACKGROUNDS.map((bgImage, idx) => (
                        <div
                            key={idx}
                            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out rounded-[25px] ${
                                idx === activeBgIndex
                                    ? "opacity-100"
                                    : "opacity-0"
                            }`}
                            style={{ backgroundImage: `url(${bgImage})` }}
                        />
                    ))}
                    <div className="pointer-events-none absolute inset-0 h-full w-full bg-black/50 rounded-[25px] z-10" />

                    <div className="flex flex-col gap-8 lg:flex-row lg:justify-between lg:items-end w-full relative z-20">
                        <div className="text-white">
                            <div className="w-[113px] h-[5px] rounded-full bg-white" />
                            <h1 className="bebas-neue text-[38px]/[44px] sm:text-[52px]/[62px] lg:text-[76px]/[90px] font-[400] mt-6 sm:mt-8 lg:mt-10">
                                Let’s make your best <br /> trip Ever
                            </h1>
                            <p className="text-[14px]/[22px] sm:text-[14px]/[28px] font-[500] max-w-[620px] w-full">
                                From the moment you land to the time you reach
                                your hotel or next adventure, we ensure your
                                journey flows smoothly, quickly, and without the
                                usual travel stress.
                            </p>{" "}
                            <div className="mt-6 sm:mt-8">
                                <Link
                                    href="/multiModel/plan-journey"
                                    className="md:max-w-[320px] md:h-[54px] rounded-[4px] bg-[#0955AC] flex justify-center items-center cursor-pointer px-4 py-2"
                                >
                                    <h1 className="text-white text-[20px] font-[700]">
                                        Plan Your Awesome Journey
                                    </h1>
                                </Link>
                            </div>{" "}
                        </div>
                        <div className="hidden lg:flex flex-col gap-5">
                            {HERO_BACKGROUNDS.map((_, idx) => {
                                const isActiveBg = idx === activeBgIndex;
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setActiveBgIndex(idx)}
                                        className={
                                            "transition-all duration-200 rounded-full " +
                                            (isActiveBg
                                                ? "size-[12px] bg-[#0955AC]"
                                                : "size-[12px] bg-[#D9D9D9]/70 hover:bg-white/80")
                                        }
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* <div className="poppins w-full mt-10 xl:mt-0 relative z-20"> */}
                    {/* tabs section */}
                    {/* <div className="flex flex-row overflow-x-auto scrollbar-thin scrollbar-thumb-white/30">
                            {TAB_CONFIG.map((tab) => {
                                const isActive = tab.key === activeTab;
                                return (
                                    <button
                                        key={tab.key}
                                        type="button"
                                        onClick={() => setActiveTab(tab.key)}
                                        className={
                                            "min-w-[50px] sm:w-[115px] h-[50px] flex flex-row gap-3 justify-center items-center px-4 sm:px-5 transition-all " +
                                            (isActive
                                                ? "bg-white rounded-t-[15px] shadow-sm"
                                                : "backdrop-blur-sm bg-[#FFFFFF1A] rounded-t-[10px] border-[0.5px] border-[#FFFFFFC9] hover:bg-white/70")
                                        }
                                    >
                                        <img src={tab.icon} className="w-6 h-6" />
                                        <h1
                                            className={
                                                "hidden sm:block text-[18px] font-[700] " +
                                                (isActive ? "text-[#0955AC]" : "text-white")
                                            }
                                        >
                                            {tab.label}
                                        </h1>
                                    </button>
                                );
                            })}
                        </div> */}

                    {/* form section */}
                    {/* <div className="w-full flex flex-col xl:h-[200px] gap-5 sm:gap-6 md:flex-row md:justify-between md:items-center px-4 sm:px-6 md:px-8 py-5 sm:py-6 bg-white/95 backdrop-blur-md rounded-b-[15px] sm:rounded-tr-[15px] relative z-20 text-[15px] font-[600] text-[#286BB6] shadow-[0_10px_40px_rgba(0,0,0,0.15)]">
                            <div className="flex flex-wrap gap-4 sm:gap-5 md:gap-6 items-end w-full">
                                {currentTab?.fields?.map((field) => (
                                    <div key={field.id} className="flex flex-col gap-2 w-full sm:w-[48%] lg:w-auto min-w-[200px] lg:min-w-[260px]">
                                        <label className="text-[14px] text-[#286BB6] font-[600]">{field.label}</label>
                                        <div className="flex flex-row gap-2 items-center px-3 sm:px-4 h-[50px] sm:h-[54px] rounded-[10px] border border-[#00000012] bg-white/80">
                                            {field.id === "date" || field.id === "depart" ? (
                                                <>
                                                    <input
                                                        type="date"
                                                        className="w-full text-[15px] font-[500] border-none focus:ring-0 text-[#18395f] h-full outline-none bg-transparent"
                                                    />
                                                    
                                                </>
                                            ) : field.id === "passengers" || field.id === "duration" || field.id === "class" ? (
                                                <>
                                                    <select className="w-full text-[15px] font-[500] border-none focus:ring-0 text-[#18395f] h-full outline-none bg-transparent">
                                                        <option value="">{field.placeholder}</option>
                                                        <option value="1">1</option>
                                                        <option value="2">2</option>
                                                        <option value="3">3</option>
                                                        <option value="4+">4+</option>
                                                    </select>
                                                    
                                                </>
                                            ) : (
                                                <>
                                                    <input
                                                        type="text"
                                                        placeholder={field.placeholder}
                                                        className="w-full text-[15px] font-[500] border-none focus:ring-0 placeholder:text-[#286BB6]/80 h-full outline-none bg-transparent"
                                                    />
                                                    <img src={downArrow} className="w-4 h-4 opacity-70" />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full md:w-[180px] h-[50px] md:h-[55px] mt-2 sm:mt-6 md:mt-0 md:ml-6 flex justify-center items-center text-[15px] sm:text-[16px] text-white font-[700] bg-[#0955AC] rounded-[100px] shadow-lg hover:bg-[#074282] transition-all">
                                    SEARCH
                                </button>
                            </div>
                        </div> */}
                    {/* </div> */}
                </div>
            </div>
        </div>
    );
};

export default Hero;
