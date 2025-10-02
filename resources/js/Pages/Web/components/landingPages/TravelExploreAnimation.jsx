import React, { useMemo, useState, useRef } from "react";

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
        description: "Book or rent land vehicles including cars, vans, buses, and trucks for personal or business needs. Flexible durations and real-time availability.",
        ctaLabel: "Book Land Vehicle",
        href: "/land-vehicles",
        url: img1,
    },
    {
        title: "Sea Vehicles",
        subtitle: "Maritime Transport Solutions",
        description: "Charter ferries, boats, and cargo ships for passenger or freight movement across sea routes. Secure and efficient maritime logistics.",
        ctaLabel: "Explore Sea Options",
        href: "/sea-vehicles",
        url: img2,
    },
    {
        title: "Air Vehicles",
        subtitle: "Fastest Air Logistics",
        description: "Access private jets, helicopters, and cargo planes for fast, reliable air transport. Ideal for urgent shipments and executive travel.",
        ctaLabel: "Book Air Transport",
        href: "/air-vehicles",
        url: img3,
    },
    {
        title: "Warehouse",
        subtitle: "Storage & Fulfillment",
        description: "Find warehousing solutions for goods storage, inventory management, and distribution. Flexible space and integrated logistics support.",
        ctaLabel: "Find Warehouses",
        href: "/warehouses",
        url: img4,
    },
    {
        title: "Freight",
        subtitle: "Bulk Cargo Movement",
        description: "Arrange freight shipping for large or bulk goods via road, sea, or air. Track shipments and optimize your supply chain.",
        ctaLabel: "Ship Freight",
        href: "/freight",
        url: img5,
    },
    {
        title: "Multi-model",
        subtitle: "Integrated Transport",
        description: "Seamlessly combine land, sea, and air transport for complex logistics needs. End-to-end visibility and coordination.",
        ctaLabel: "Plan Multi-model",
        href: "/multi-model",
        url: img6,
    },
    {
        title: "Ticket Booking",
        subtitle: "Travel Reservations",
        description: "Book tickets for buses, trains, ferries, and flights. Compare prices and schedules for convenient travel planning.",
        ctaLabel: "Book Tickets",
        href: "/tickets",
        url: img7,
    },
];

const TravelExploreAnimation = ({ auth }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [order, setOrder] = useState(() => IMAGES.map((_, i) => i)); // queue of indices

    const scrollRef = useRef(null);
    const CARD_WIDTH = 260; // px (matches w-[260px])
    const GAP = 40; // px (matches gap-10)
    const STEP = CARD_WIDTH + GAP;

    const activeIndex = order[0]; // background is always the first item in the queue

    const tagList = useMemo(() => {
        const s = IMAGES[activeIndex]?.subtitle || "";
        // split by common separators like ·, |, •, comma
        return s
            .split(/[·|•,]/g)
            .map((t) => t.trim())
            .filter(Boolean);
    }, [activeIndex]);

    // Framer Motion variants for caption boxes
    const captionContainer = {
        hidden: {},
        show: {
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.12,
            },
        },
    };

    const floatLeft = {
        hidden: { opacity: 0, x: -20, y: 20, scale: 0.98 },
        show: {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        },
    };

    const floatMid = {
        hidden: { opacity: 0, x: -16, y: 10, scale: 0.985 },
        show: {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        },
    };

    const floatBottom = {
        hidden: { opacity: 0, x: -12, y: 24, scale: 0.985 },
        show: {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        },
    };

    const floatCTA = {
        hidden: { opacity: 0, x: 20, y: 10, scale: 0.98 },
        show: {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        },
    };

    const rotateNext = () => {
        setOrder((o) => [...o.slice(1), o[0]]);
        if (scrollRef.current)
            scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
    };

    const rotatePrev = () => {
        setOrder((o) => {
            const copy = [...o];
            const last = copy.pop();
            copy.unshift(last);
            return copy;
        });
        if (scrollRef.current)
            scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
    };

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
            <div className="relative h-screen w-full flex flex-col justify-center items-center md:items-end overflow-hidden">
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
                            layout: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                            duration: 0.6,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        <img
                            src={IMAGES[activeIndex].url}
                            alt={IMAGES[activeIndex].title}
                            className="h-full w-full object-cover"
                            draggable={false}
                        />
                        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
                    </motion.div>
                </AnimatePresence>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/30 z-[11] pointer-events-none" />

                {/* NAVBAR */}
                <div className="absolute inset-x-0 top-0 z-[60] pointer-events-none">
                    <div className="pointer-events-auto">
                        <div className="bg-gradient-to-b from-black/50 to-transparent">
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
                

                {/* Caption */}
                <motion.div
                    key={`cap-${activeIndex}`}
                    className="md:absolute md:inset-0 z-40 flex w-full max-w-[300px] lg:max-w-[500px] xl:max-w-[600px] items-start md:items-center justify-start px-5 pt-10 md:pt-0"
                    variants={captionContainer}
                    initial="hidden"
                    animate="show"
                    layout
                >
                    <div className="relative w-full h-full md:h-auto">
                        {/* Box A: Title (top-left) */}
                        <motion.div
                            variants={floatLeft}
                            className="absolute left-4 top-6 md:left-8 md:top-16 bg-black/35 backdrop-blur-md rounded-2xl px-4 py-3 ring-1 ring-white/15 shadow-lg max-w-[90vw] md:max-w-[420px]"
                        >
                            <h2 className="text-[34px]/[32px] md:text-[46px]/[44px] xl:text-[54px]/[52px] font-[800] text-white drop-shadow uppercase">
                                {IMAGES[activeIndex].title}
                            </h2>
                        </motion.div>

                        {/* Box B: Subtitle + description (mid-left) */}
                        <motion.div
                            variants={floatMid}
                            className="absolute left-4 top-[110px] md:left-10 md:top-[200px] bg-black/30 backdrop-blur-md rounded-2xl px-4 py-4 ring-1 ring-white/15 shadow-lg max-w-[92vw] md:max-w-[520px]"
                        >
                            {IMAGES[activeIndex].subtitle && (
                                <div className="text-base md:text-xl font-semibold text-orange-300/95 drop-shadow mb-1">
                                    {IMAGES[activeIndex].subtitle}
                                </div>
                            )}
                            {IMAGES[activeIndex].description && (
                                <p className="text-[13px] md:text-[14px] text-white/90 font-[500] max-w-prose">
                                    {IMAGES[activeIndex].description}
                                </p>
                            )}
                        </motion.div>

                        {/* Box C: Tag pills (lower-left) */}
                        {tagList.length > 0 && (
                            <motion.div
                                variants={floatBottom}
                                className="absolute left-4 bottom-[140px] md:left-12 md:bottom-[180px] bg-black/25 backdrop-blur-md rounded-2xl px-3 py-3 ring-1 ring-white/10 shadow-lg max-w-[92vw] md:max-w-[520px]"
                            >
                                <div className="flex flex-wrap gap-2">
                                    {tagList.map((tag, i) => (
                                        <span
                                            key={`tag-${i}`}
                                            className="px-3 py-1 rounded-full text-[11px] md:text-[12px] font-[800] text-white/90 border border-white/25 bg-white/10"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Box D: 2x2 mini info grid (bottom-left corner) */}
                        <motion.div
                            variants={floatBottom}
                            className="absolute left-4 bottom-6 md:left-10 md:bottom-10 grid grid-cols-2 gap-3 w-[min(92vw,520px)]"
                        >
                            <div className="rounded-xl p-3 border border-white/15 bg-black/25 backdrop-blur ring-1 ring-white/10">
                                <div className="text-[10px] md:text-[11px] text-white/70 font-[800] uppercase tracking-wide">Availability</div>
                                <div className="text-white text-[12px] md:text-[13px] font-[700]">Instant & Scheduled</div>
                            </div>
                            <div className="rounded-xl p-3 border border-white/15 bg-black/25 backdrop-blur ring-1 ring-white/10">
                                <div className="text-[10px] md:text-[11px] text-white/70 font-[800] uppercase tracking-wide">Safety</div>
                                <div className="text-white text-[12px] md:text-[13px] font-[700]">Verified Operators</div>
                            </div>
                            <div className="rounded-xl p-3 border border-white/15 bg-black/25 backdrop-blur ring-1 ring-white/10">
                                <div className="text-[10px] md:text-[11px] text-white/70 font-[800] uppercase tracking-wide">Flexibility</div>
                                <div className="text-white text-[12px] md:text-[13px] font-[700]">Hourly to Long‑term</div>
                            </div>
                            <div className="rounded-xl p-3 border border-white/15 bg-black/25 backdrop-blur ring-1 ring-white/10">
                                <div className="text-[10px] md:text-[11px] text-white/70 font-[800] uppercase tracking-wide">Support</div>
                                <div className="text-white text-[12px] md:text-[13px] font-[700]">24/7 Assistance</div>
                            </div>
                        </motion.div>

                        {/* Box E: CTA (floating) */}
                        {IMAGES[activeIndex].ctaLabel && IMAGES[activeIndex].href && (
                            <motion.div variants={floatCTA}>
                                <Link
                                    href={IMAGES[activeIndex].href}
                                    className="absolute right-6 bottom-6 md:right-auto md:left-10 md:-bottom-10 bg-[#FF7003] hover:bg-white hover:text-[#FF7003] border border-[#FF7003] text-white font-bold rounded-full px-5 py-2 text-sm md:text-base transition-all shadow-lg"
                                >
                                    {IMAGES[activeIndex].ctaLabel}
                                </Link>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Carousel (shared layout, framer-motion) */}
                <div className="relative z-50 flex justify-center md:justify-end items-start md:items-center w-full h-auto md:h-screen pointer-events-auto pt-4 md:pt-0 pb-6 md:pb-0">
                    {/* Right-anchored rail showing exactly two cards */}
                    <div className="w-full md:w-[400px] lg:w-[550px] xl:w-[650px]">
                        <div
                            ref={scrollRef}
                            className="overflow-hidden px-10 py-10 select-none"
                            style={{ scrollbarWidth: "none" }}
                        >
                            <motion.div
                                layout
                                className="flex gap-10"
                                transition={{
                                    layout: {
                                        duration: 0.5,
                                        ease: [0.22, 1, 0.36, 1],
                                    },
                                }}
                            >
                                {order.slice(1).map((idx) => (
                                    <motion.div
                                        key={`card-${idx}`}
                                        layoutId={`media-${idx}`}
                                        layout
                                        initial={false}
                                        animate={{ borderRadius: 20 }}
                                        whileHover={{ scale: 1.04 }}
                                        transition={{
                                            layout: {
                                                duration: 0.5,
                                                ease: [0.22, 1, 0.36, 1],
                                            },
                                            duration: 0.25,
                                            ease: [0.22, 1, 0.36, 1],
                                        }}
                                        className="group relative shrink-0 w-[100px] h-[200px] md:w-[260px] md:h-[350px] rounded-[20px] overflow-hidden shadow-2xl ring-2 snap-start ring-white/10 cursor-default"
                                        style={{ borderRadius: 20 }}
                                    >
                                        <img
                                            src={IMAGES[idx].url}
                                            alt={IMAGES[idx].title}
                                            className="h-full w-full object-cover"
                                            draggable={false}
                                        />
                                        <div className="pointer-events-none absolute inset-0 bg-black/40" />
                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                                        <div className="pointer-events-none absolute inset-0 flex items-end justify-center py-5">
                                            <div className="rounded-lg hidden lg:block border-[1px] border-[#FF7003] px-3 py-2 text-white/90 font-[700] text-sm backdrop-blur-md bg-black/30 ring-1 ring-white/15 text-center">
                                                {IMAGES[idx].title}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                        <div className="mt-2 flex items-center justify-center gap-5 px-10">
                            <button
                                onClick={rotatePrev}
                                className="rounded-[10px] border border-[#FF7003] bg-[#FF7003] hover:bg-[#FFFFFF] hover:text-[#FF7003] backdrop-blur px-4 py-2 text-white font-[800] text-xl"
                                aria-label="Scroll left"
                            >
                                ←
                            </button>
                            <button
                                onClick={rotateNext}
                                className="rounded-[10px] border border-[#FF7003] bg-[#FF7003] hover:bg-[#FFFFFF] hover:text-[#FF7003] backdrop-blur px-4 py-2 text-white font-[800] text-xl"
                                aria-label="Scroll right"
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
