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
        tags: [
            "Helicopter",
            "Private Jet",
            "Cargo",
            "Charter",
            "Seaplane",
            "Air Ambulance",
        ],
    },
    {
        title: "Warehouse",
        subtitle: "Storage & Fulfillment",
        description:
            "Find warehousing solutions for goods storage, inventory management, and distribution. Flexible space and integrated logistics support.",
        ctaLabel: "Find Warehouses",
        href: "/warehouse",
        url: img4,
        tags: [
            "Storage",
            "Inventory",
            "Distribution",
            "Cold Chain",
            "Fulfillment",
            "3PL",
        ],
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
        tags: [
            "Land",
            "Sea",
            "Air",
            "Integrated",
            "Door-to-Door",
            "Hub-and-Spoke",
        ],
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

const TravelExploreAnimation = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [current, setCurrent] = useState(0);
    const pauseUntilRef = useRef(0);

    const user = auth?.user;
    const userRole = user?.role;
    const userStatus =
        typeof user?.status === "string" ? user.status.toLowerCase() : "";
    const isVendor = userRole === "vendor";
    const isVendorVerified = isVendor && userStatus === "verified";
    const isClient = userRole === "client";
    const isSuperAdmin = userRole === "SuperAdmin";

    const total = IMAGES.length;
    const mod = (n, m) => ((n % m) + m) % m;

    const next = () => {
        setCurrent((c) => mod(c + 1, total));
        pauseUntilRef.current = Date.now() + 5000;
    };

    const prev = () => {
        setCurrent((c) => mod(c - 1, total));
        pauseUntilRef.current = Date.now() + 5000;
    };

    useEffect(() => {
        const id = setInterval(() => {
            if (Date.now() < pauseUntilRef.current) return;
            setCurrent((c) => mod(c + 1, total));
        }, 3000);
        return () => clearInterval(id);
    }, [total]);

    const handleScroll = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
            setMenuOpen(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden">
                {/* Background with smooth transitions */}
                <AnimatePresence initial={false} mode="wait">
                    <motion.div
                        key={`bg-${current}`}
                        className="absolute inset-0 z-0"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.7, ease: "easeInOut" }}
                    >
                        <img
                            src={IMAGES[current].url}
                            alt={IMAGES[current].title}
                            className="h-full w-full object-cover"
                            draggable={false}
                        />
                        <div className="absolute inset-0 bg-black/60" />
                    </motion.div>
                </AnimatePresence>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/50 z-10" />

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
                                    {user ? (
                                        <>
                                            {isVendor &&
                                                (isVendorVerified ? (
                                                    <Link
                                                        href="/vendors/mainDashboard"
                                                        className="bg-yellow-600 px-3 py-2 rounded text-white text-[18px] font-medium"
                                                    >
                                                        Dashboard
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        href="/approval-pending"
                                                        className="bg-orange-600 px-3 py-2 rounded text-white text-[18px] font-medium"
                                                    >
                                                        Dashboard
                                                    </Link>
                                                ))}
                                            {isClient && (
                                                <Link
                                                    href="/client/dashboard"
                                                    className="bg-yellow-600 px-3 py-2 rounded text-white text-[18px] font-medium"
                                                >
                                                    Dashboard
                                                </Link>
                                            )}
                                            {isSuperAdmin && (
                                                <Link
                                                    href="/superadmin/dashboard"
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
                                    <span className="text-white text-2xl">
                                        ☰
                                    </span>
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
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Carousel */}
                <div className="relative z-20 w-full max-w-7xl mx-auto px-4 py-20">
                    <div className="relative h-[500px] md:h-[600px] flex items-center justify-center">
                        <div
                            className="relative w-full"
                            style={{ perspective: "2000px" }}
                        >
                            {/* Cards container */}
                            <div className="relative h-[420px] md:h-[520px]">
                                {IMAGES.map((item, i) => {
                                    const offset =
                                        (i - current + total) % total;
                                    let position =
                                        offset > Math.floor(total / 2)
                                            ? offset - total
                                            : offset;

                                    const isActive = position === 0;
                                    const absPos = Math.abs(position);

                                    // --- NEW: depth-based sizing (cap after 3 steps) ---
                                    const depth = Math.min(absPos, 3); // 0=center, 1=near, 2=mid, 3=far ends
                                    const depthScale = [1, 0.85, 0.7, 0.55][
                                        depth
                                    ]; // far ends are smallest
                                    const depthOpacity = [1, 0.95, 0.8, 0.6][
                                        depth
                                    ];

                                    // If you want the center card slightly larger than its base size:
                                    const baseScale = isActive ? 1 : 0.9;

                                    // Final scale used by framer-motion
                                    const scale = baseScale * depthScale;

                                    // --- OPTIONAL: tighten spacing for outer cards so they “peek” nicely ---
                                    let translateX;
                                    if (position === 0) {
                                        translateX = 0;
                                    } else if (absPos === 1) {
                                        translateX = position * 320;
                                    } else {
                                        // progressively compress spacing for deeper cards
                                        const step = absPos === 2 ? 240 : 200; // far ends closer
                                        translateX =
                                            position > 0
                                                ? 320 + (position - 1) * step
                                                : -320 + (position + 1) * step;
                                    }

                                    const translateY = 0;
                                    const rotateY = 0;
                                    const opacity = depthOpacity;
                                    const zIndex = 100 - depth * 10;

                                    return (
                                        <motion.div
                                            key={i}
                                            className="absolute left-1/2 top-1/2"
                                            style={{
                                                zIndex,
                                                transformStyle: "preserve-3d",
                                            }}
                                            initial={false}
                                            animate={{
                                                x: `calc(-50% + ${translateX}px)`,
                                                y: `calc(-50% + ${translateY}px)`,
                                                scale,
                                                rotateY,
                                                opacity,
                                            }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 180,
                                                damping: 28,
                                                mass: 1,
                                            }}
                                        >
                                            <div
                                                className={`relative rounded-2xl overflow-hidden shadow-2xl ${
                                                    isActive
                                                        ? "w-[300px] h-[420px] md:w-[380px] md:h-[520px]"
                                                        : "w-[240px] h-[340px] md:w-[300px] md:h-[420px]"
                                                }`}
                                                style={{
                                                    boxShadow: isActive
                                                        ? "0 25px 50px -12px rgba(0, 0, 0, 0.7)"
                                                        : "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
                                                }}
                                            >
                                                <img
                                                    src={item.url}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                    draggable={false}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                                {/* Content */}
                                                <div className="absolute inset-0 flex flex-col justify-end p-6">
                                                    {isActive ? (
                                                        <motion.div
                                                            initial={{
                                                                opacity: 0,
                                                                y: 20,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                            }}
                                                            transition={{
                                                                delay: 0.2,
                                                            }}
                                                            className="bg-white/20 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-white/30"
                                                        >
                                                            <h3 className="text-white font-bold text-xl md:text-2xl mb-2 uppercase tracking-wide">
                                                                {item.title}
                                                            </h3>
                                                            <p className="text-white/90 text-sm mb-4 hidden md:block">
                                                                {item.subtitle}
                                                            </p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {item.tags
                                                                    .slice(0, 4)
                                                                    .map(
                                                                        (
                                                                            tag,
                                                                            idx
                                                                        ) => (
                                                                            <span
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                className="px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/50"
                                                                            >
                                                                                {
                                                                                    tag
                                                                                }
                                                                            </span>
                                                                        )
                                                                    )}
                                                            </div>
                                                        </motion.div>
                                                    ) : (
                                                        <h3 className="text-white font-bold text-lg md:text-xl uppercase tracking-wide drop-shadow-lg">
                                                            {item.title}
                                                        </h3>
                                                    )}
                                                </div>

                                                {/* Click overlay */}
                                                <a
                                                    href={item.href}
                                                    className="absolute inset-0 cursor-pointer"
                                                    aria-label={`View ${item.title}`}
                                                />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Controls */}
                            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-4">
                                <button
                                    onClick={prev}
                                    className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all shadow-lg flex items-center justify-center text-xl font-bold"
                                    aria-label="Previous"
                                >
                                    ←
                                </button>

                                {/* Dots */}
                                <div className="flex gap-2">
                                    {IMAGES.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setCurrent(i);
                                                pauseUntilRef.current =
                                                    Date.now() + 5000;
                                            }}
                                            className={`rounded-full transition-all ${
                                                i === current
                                                    ? "w-8 h-3 bg-white"
                                                    : "w-3 h-3 bg-white/50 hover:bg-white/70"
                                            }`}
                                            aria-label={`Go to slide ${i + 1}`}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={next}
                                    className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all shadow-lg flex items-center justify-center text-xl font-bold"
                                    aria-label="Next"
                                >
                                    →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TravelExploreAnimation;
