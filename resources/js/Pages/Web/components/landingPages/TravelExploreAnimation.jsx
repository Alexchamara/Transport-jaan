import React, { useState, useRef, useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";

import img1 from "../../assets/landingPages/hero/landvehiclerental.jpg";
import img2 from "../../assets/landingPages/hero/seavehiclebooking.jpg";
import img3 from "../../assets/landingPages/hero/airvehiclerental.jpg";
import img4 from "../../assets/landingPages/hero/warehouse.jpg";
import img5 from "../../assets/landingPages/hero/freight.jpg";
import img6 from "../../assets/landingPages/hero/multimodel.jpg";
import img7 from "../../assets/landingPages/hero/ticketbooking.jpg";

import burgerIcon from "../../assets/landingPages/burgerIcon.svg";
import { Link } from "@inertiajs/react";

const IMAGES = [
    {
        title: "Land Vehicles",
        subtitle: "On-Demand Rentals & Logistics",
        description:
            "Book or rent land vehicles including cars, vans, buses, and trucks for personal or business needs. Flexible durations and real-time availability.",
        ctaLabel: "Book Land Vehicle",
        href: "/clientRent",
        url: img1,
        tags: ["Sedan", "SUV", "Van", "Bus", "Truck", "Pickup"],
    },
    {
        title: "Sea Vehicles",
        subtitle: "Maritime Transport Solutions",
        description:
            "Charter ferries, boats, and cargo ships for passenger or freight movement across sea routes. Secure and efficient maritime logistics.",
        ctaLabel: "Explore Sea Options",
        href: "/clientRent",
        url: img2,
        tags: ["Passenger Ships", "Boat", "Ferry", "Yacht", "Cruise", "Canoe"],
    },
    {
        title: "Air Vehicles",
        subtitle: "Fastest Air Logistics",
        description:
            "Access private jets, helicopters, and cargo planes for fast, reliable air transport. Ideal for urgent shipments and executive travel.",
        ctaLabel: "Book Air Transport",
        href: "/clientRent",
        url: img3,
        tags: ["Helicopter", "Private Jet", "Cargo", "Charter", "Seaplane", "Air Ambulance"],
    },
    {
        title: "Warehouse",
        subtitle: "Storage & Fulfillment",
        description:
            "Find warehousing solutions for goods storage, inventory management, and distribution. Flexible space and integrated logistics support.",
        ctaLabel: "Find Warehouses",
        href: "/warehouse",
        url: img4,
        tags: ["Storage", "Inventory", "Distribution", "Cold Chain", "Fulfillment", "3PL"],
    },
    {
        title: "Freight",
        subtitle: "Bulk Cargo Movement",
        description:
            "Arrange freight shipping for large or bulk goods via road, sea, or air. Track shipments and optimize your supply chain.",
        ctaLabel: "Ship Freight",
        href: "/freight-home",
        url: img5,
        tags: ["Road", "Sea", "Air", "Bulk", "LTL", "FTL"],
    },
    {
        title: "Multi-model",
        subtitle: "Integrated Transport",
        description:
            "Seamlessly combine land, sea, and air transport for complex logistics needs. End-to-end visibility and coordination.",
        ctaLabel: "Plan Multi-model",
        href: "/multi-model",
        url: img6,
        tags: ["Land", "Sea", "Air", "Integrated", "Door-to-Door", "Hub-and-Spoke"],
    },
    {
        title: "Ticket Booking",
        subtitle: "Travel Reservations",
        description:
            "Book tickets for buses, trains, ferries, and flights. Compare prices and schedules for convenient travel planning.",
        ctaLabel: "Book Tickets",
        href: "/ticketBooking",
        url: img7,
        tags: ["Bus", "Train", "Ferry", "Flight", "Sleeper", "Express"],
    },
];

const TravelExploreAnimation = ({ auth }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [order, setOrder] = useState(() => IMAGES.map((_, i) => i)); // queue of indices
    const [isPrev, setIsPrev] = useState(false);

    const CARD_WIDTH = 260; // px (matches w-[260px])
    const GAP = 40; // px (matches gap-10)
    const STEP = CARD_WIDTH + GAP;
    const pauseUntilRef = useRef(0); // used to pause auto-rotate after manual navigation

    const activeIndex = order[2] ?? order[0]; // make the third card the active one

    const getTags = (i) => {
        const s = IMAGES[i]?.subtitle || "";
        return s
            .split(/[·|•,]/g)
            .map((t) => t.trim())
            .filter(Boolean);
    };

    const rotateNext = () => {
        setIsPrev(false);
        setOrder((o) => [...o.slice(1), o[0]]);
        pauseUntilRef.current = Date.now() + 5000; // pause ~5s after manual nav
    };

    const rotatePrev = () => {
        setIsPrev(true);
        setOrder((o) => {
            const copy = [...o];
            const last = copy.pop();
            copy.unshift(last);
            return copy;
        });
        pauseUntilRef.current = Date.now() + 5000; // pause ~5s after manual nav
    };

    useEffect(() => {
        const id = setInterval(() => {
            if (Date.now() < pauseUntilRef.current) return; // skip auto-advance during pause window
            setIsPrev(false);
            setOrder((o) => {
                const next = [...o.slice(1), o[0]];
                return next;
            });
        }, 3000);
        return () => clearInterval(id);
    }, []);

    // selectCard and scrollByStep removed; navigation is button-only.

    const handleScroll = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "auto" });
            setMenuOpen(false);
        }
    };

    return (
        <div>
            <div className="relative 2xl:h-screen h-auto w-full flex flex-col justify-center items-center md:items-end overflow-hidden">
                {/* Background (shared layout) */}
                <AnimatePresence initial={false} mode="popLayout">
                    <motion.div
                        key={`bg-${activeIndex}`}
                        layout
                        layoutId={`media-${activeIndex}`}
                        className="absolute inset-0 z-10 overflow-hidden rounded-2xl"
                        initial={{ opacity: 0.9, borderRadius: 20 }}
                        animate={{ opacity: 1, borderRadius: 0 }}
                        exit={{ opacity: 0.9, borderRadius: 20 }}
                        transition={{
                            opacity: { duration: 0.6 },
                            borderRadius: { type: "spring", stiffness: 200, damping: 26 }
                        }}
                    >
                        <img
                            src={IMAGES[activeIndex].url}
                            alt={IMAGES[activeIndex].title}
                            className="h-full w-full object-cover"
                            draggable={false}
                        />
                        <div className="absolute inset-0 bg-black/60 pointer-events-none" />
                    </motion.div>
                </AnimatePresence>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/50 z-[11] pointer-events-none" />

                {/* NAVBAR */}
                <div className="absolute inset-x-0 top-0 xl:left-20 z-[60] pointer-events-none">
                    <div className="pointer-events-auto">
                        <div className="bg-transparent">
                            {/* Desktop */}
                            <div className="md:flex hidden justify-between items-center px-10 py-10">
                                <div className="flex flex-row gap-5 xl:text-[17px] text-[10px] font-[400] text-white">
                                    <div
                                        className="xl:w-[101px] h-[38px] border-[1.2px] border-[#FFFFFF91] rounded-[100px] flex justify-center items-center cursor-pointer px-4 py-2"
                                        onClick={() => handleScroll("home")}
                                    >
                                        Home
                                    </div>
                                    <div
                                        className="xl:w-[121px] h-[38px] border-[1.2px] border-[#FFFFFF91] rounded-[100px] flex justify-center items-center cursor-pointer px-4 py-2"
                                        onClick={() => handleScroll("about")}
                                    >
                                        About Us
                                    </div>
                                    <div
                                        className="xl:w-[114px] h-[38px] border-[1.2px] border-[#FFFFFF91] rounded-[100px] flex justify-center items-center cursor-pointer px-4 py-2"
                                        onClick={() => handleScroll("services")}
                                    >
                                        Services
                                    </div>
                                    <div
                                        className="xl:w-[81px] h-[38px] border-[1.2px] border-[#FFFFFF91] rounded-[100px] flex justify-center items-center cursor-pointer px-4 py-2"
                                        onClick={() => handleScroll("blog")}
                                    >
                                        Blog
                                    </div>
                                    <div
                                        className="xl:w-[137px] h-[38px] border-[1.2px] border-[#FFFFFF91] rounded-[100px] flex justify-center items-center cursor-pointer px-4 py-2"
                                        onClick={() => handleScroll("contact")}
                                    >
                                        Contact Us
                                    </div>
                                </div>

                                <div className="flex flex-row gap-5 xl:text-[17px] text-[10px] font-[700]">
                                    {auth && auth.user ? (
                                        <>
                                            {auth.user.role === "vendor" && (
                                                <Link
                                                    href="/vendors/mainDashboard"
                                                    className="bg-yellow-600 px-3 py-2 rounded text-white text-[18px] font-medium"
                                                >
                                                    Dashboard
                                                </Link>
                                            )}
                                            {auth.user.role === "client" && (
                                                <Link
                                                    href="/"
                                                    className="bg-yellow-600 px-3 py-2 rounded text-white text-[18px] font-medium"
                                                >
                                                    Dashboard
                                                </Link>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div
                                                className="lg:w-[137px] h-[38px] bg-[#FF7003] border-[1.2px] border-[#FF7003] rounded-[100px] flex justify-center items-center px-4 py-2 cursor-pointer text-[#FFFFFF]"
                                                onClick={() =>
                                                    (window.location.href =
                                                        "/signin")
                                                }
                                            >
                                                Login
                                            </div>
                                            <div
                                                className="lg:w-[137px] h-[38px] text-[#FF7003] border-[1.2px] border-[#FF7003] rounded-[100px] flex justify-center items-center cursor-pointer bg-transparent px-4 py-2"
                                                onClick={() =>
                                                    (window.location.href =
                                                        "/signup")
                                                }
                                            >
                                                Register
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Mobile */}
                            <div className="md:hidden px-4 py-3 flex justify-between items-center">
                                <div className="text-white text-base order-2 uppercase font-[700]">
                                    Company Logo
                                </div>
                                <div
                                    className="size-[30px] flex justify-center items-center cursor-pointer order-1"
                                    onClick={() => setMenuOpen(true)}
                                >
                                    <img src={burgerIcon} alt="menu" />
                                </div>
                            </div>
                        </div>

                        {/* Mobile Sidebar */}
                        {menuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 bg-black bg-opacity-40 z-40"
                                    onClick={() => setMenuOpen(false)}
                                />
                                <div className="fixed top-0 left-0 h-full w-64 bg-[#0A0630] z-50 shadow-lg flex flex-col p-6">
                                    <div className="flex justify-end mb-6">
                                        <button
                                            className="text-white text-2xl"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                    <div className="flex flex-col gap-4 text-white text-[17px] font-[400]">
                                        <div
                                            className="border-b border-[#FFFFFF91] py-2 cursor-pointer"
                                            onClick={() => handleScroll("home")}
                                        >
                                            Home
                                        </div>
                                        <div
                                            className="border-b border-[#FFFFFF91] py-2 cursor-pointer"
                                            onClick={() =>
                                                handleScroll("about")
                                            }
                                        >
                                            About Us
                                        </div>
                                        <div
                                            className="border-b border-[#FFFFFF91] py-2 cursor-pointer"
                                            onClick={() =>
                                                handleScroll("services")
                                            }
                                        >
                                            Services
                                        </div>
                                        <div
                                            className="border-b border-[#FFFFFF91] py-2 cursor-pointer"
                                            onClick={() => handleScroll("blog")}
                                        >
                                            Blog
                                        </div>
                                        <div
                                            className="border-b border-[#FFFFFF91] py-2 cursor-pointer"
                                            onClick={() =>
                                                handleScroll("contact")
                                            }
                                        >
                                            Contact Us
                                        </div>
                                    </div>
                                    <div className="mt-6 flex flex-row gap-3">
                                        {auth && auth.user ? (
                                            <>
                                                {auth.user.role ===
                                                    "vendor" && (
                                                    <Link
                                                        href="/vendors/mainDashboard"
                                                        className="bg-yellow-600 px-3 py-2 rounded text-white text-[12px] font-medium"
                                                    >
                                                        Dashboard
                                                    </Link>
                                                )}
                                                {auth.user.role ===
                                                    "client" && (
                                                    <Link
                                                        href="/"
                                                        className="bg-yellow-600 px-3 py-2 rounded text-white text-[12px] font-medium"
                                                    >
                                                        Dashboard
                                                    </Link>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <div
                                                    className="bg-[#FF7003] border-[1.2px] border-[#FF7003] rounded-[100px] flex justify-center items-center px-4 py-2 cursor-pointer text-white"
                                                    onClick={() =>
                                                        (window.location.href =
                                                            "/signin")
                                                    }
                                                >
                                                    Login
                                                </div>
                                                <div
                                                    className="text-[#FF7003] border-[1.2px] border-[#FF7003] rounded-[100px] flex justify-center items-center px-4 py-2 cursor-pointer"
                                                    onClick={() =>
                                                        (window.location.href =
                                                            "/signup")
                                                    }
                                                >
                                                    Register
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Carousel (shared layout, framer-motion) */}
                <div className="relative z-50 flex justify-center md:justify-end items-start md:items-center w-full h-auto md:h-screen pointer-events-auto mt-20 md:mt-[50px] 2xl:mt-[180px] pb-10">
                    {/* Right-anchored rail showing exactly three cards */}
                    <div className="w-full md:w-[700px] lg:w-[1000px] xl:w-[1370px]">
                        <div className="overflow-hidden px-10 py-5 select-none">
                            <div className="flex gap-10 items-center">
                                {order.map((idx) => (
                                    <motion.div
                                        key={`card-${idx}`}
                                        layout
                                        transition={{ duration: idx === activeIndex ? 0.3 : 0.7, ease: [0.22, 1, 0.36, 1] }}
                                        className={`group relative shrink-0 rounded-[20px] overflow-hidden shadow-2xl snap-start cursor-pointer transition-all ${
                                            idx === activeIndex
                                                ? "duration-300 w-[150px] h-[240px] md:w-[324px] md:h-[448px] z-50"
                                                : "duration-700 w-[120px] h-[200px] md:w-[223px] md:h-[319px] ring-2 ring-white/10 backdrop-blur-[1px]"
                                        }`}
                                        style={{ borderRadius: 20, willChange: "transform, width, height, opacity" }}
                                    >
                                        <img
                                            key={`img-${idx}`}
                                            src={IMAGES[idx].url}
                                            alt={IMAGES[idx].title}
                                            className="h-full w-full object-cover"
                                            draggable={false}
                                        />

                                        {/* bottom content */}
                                        {idx === activeIndex ? (
                                            <div className="absolute inset-x-6 bottom-10">
                                                <div className="rounded-[25px] bg-white/15 backdrop-blur-lg ring-1 ring-white/20 shadow-xl p-4 md:p-6">
                                                    <div className="text-white font-[900] uppercase tracking-wide text-sm md:text-[20px] text-center">
                                                        {IMAGES[idx].title}
                                                    </div>
                                                    {Array.isArray(
                                                        IMAGES[idx].tags
                                                    ) &&
                                                        IMAGES[idx].tags
                                                            .length > 0 && (
                                                            <div className="mt-6 hidden md:flex flex-wrap gap-3 items-center justify-center">
                                                                {IMAGES[
                                                                    idx
                                                                ].tags.map(
                                                                    (
                                                                        tag,
                                                                        i
                                                                    ) => (
                                                                        <span
                                                                            key={`tag-${idx}-${i}`}
                                                                            className="px-4 py-2 rounded-[100px] md:text-[10px] font-[600] text-[#FFFFFF] border-[1.5px] border-[#FFFFFF]"
                                                                        >
                                                                            {
                                                                                tag
                                                                            }
                                                                        </span>
                                                                    )
                                                                )}
                                                            </div>
                                                        )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="absolute inset-x-0 bottom-10 text-center">
                                                <div className="text-white font-[900] uppercase tracking-wide text-sm md:text-[20px] drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                                                    {IMAGES[idx].title}
                                                </div>
                                            </div>
                                        )}
                                        {IMAGES[idx].href && (
                                            <Link
                                                href={IMAGES[idx].href}
                                                aria-label={`Open ${IMAGES[idx].title}`}
                                                className="absolute inset-0 z-[70]"
                                            />
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                        <div className="absolute md:bottom-20 bottom-5 right-10 z-[80] flex items-center justify-end gap-3 pointer-events-auto">
                            <button
                                onClick={rotatePrev}
                                className="md:w-12 md:h-12 w-8 h-8 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/60 border border-white/30 text-white text-xl font-bold backdrop-blur-md transition-all shadow-lg"
                                aria-label="Previous"
                            >
                                ←
                            </button>
                            <button
                                onClick={rotateNext}
                                className="md:w-12 md:h-12 w-8 h-8 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/60 border border-white/30 text-white text-xl font-bold backdrop-blur-md transition-all shadow-lg"
                                aria-label="Next"
                            >
                                →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TravelExploreAnimation;
