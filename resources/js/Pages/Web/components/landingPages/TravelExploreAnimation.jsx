import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

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
    { title: "Land Vehicles", url: img1 },
    { title: "Sea Vehicles", url: img2 },
    { title: "Air Vehicles", url: img3 },
    { title: "Warehouse", url: img4 },
    { title: "Freight", url: img5 },
    { title: "Multi-model", url: img6 },
    { title: "Ticket Booking", url: img7 },
];

// Framer Motion variants for smoother card state transitions
const CARD_VARIANTS = {
    active: {
        scale: 1.02,
        opacity: 1,
        transition: { type: "spring", stiffness: 320, damping: 28 },
    },
    inactive: {
        scale: 1,
        opacity: 1,
        transition: { type: "spring", stiffness: 280, damping: 26 },
    },
};

const TravelExploreAnimation = ({ auth }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [showCarousel, setShowCarousel] = useState(true);
    const scrollerRef = useRef(null);
    const cardRefs = useRef([]);
    const [menuOpen, setMenuOpen] = useState(false);

    // Scroll to section by id
    const handleScroll = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
            setMenuOpen(false); // close sidebar if open
        }
    };

    // Keyboard arrows
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "ArrowRight") {
                setShowCarousel(true);
                setActiveIndex((i) => Math.min(i + 1, IMAGES.length - 1));
            } else if (e.key === "ArrowLeft") {
                setShowCarousel(true);
                setActiveIndex((i) => Math.max(i - 1, 0));
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // Keep active card centered in view
    useEffect(() => {
        const el = cardRefs.current[activeIndex];
        if (el)
            el.scrollIntoView({
                behavior: "smooth",
                inline: "center",
                block: "nearest",
            });
    }, [activeIndex]);

    // Proximity trigger to RIGHT edge (hover near right side to show the carousel)
    useEffect(() => {
        if (showCarousel) return;
        const onMove = (e) => {
            const x = e.clientX ?? (e.touches && e.touches[0]?.clientX);
            if (typeof x === "number") {
                const threshold = window.innerWidth - 96; // right 96px
                if (x >= threshold) setShowCarousel(true);
            }
        };
        window.addEventListener("mousemove", onMove, { passive: true });
        window.addEventListener("touchmove", onMove, { passive: true });
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("touchmove", onMove);
        };
    }, [showCarousel]);

    return (
        <div>
            <LayoutGroup>
                <div className="relative h-screen w-full flex flex-col justify-center items-end overflow-hidden">
                    {/* Background crossfade */}
                    <div className="absolute inset-0 z-10">
                        <AnimatePresence initial={false} mode="wait">
                            <motion.img
                                key={IMAGES[activeIndex].url}
                                src={IMAGES[activeIndex].url}
                                alt="Background"
                                className="h-full w-full object-cover"
                                initial={{ opacity: 0, scale: 1.04 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.995 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            />
                        </AnimatePresence>

                        {/* Darken & subtle blur to help foreground contrast */}
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

                        {/* NAVBAR OVERLAY (inside background, on every image) */}
                        <div className="absolute inset-x-0 top-0 z-30 pointer-events-none">
                            <div className="pointer-events-auto">
                                {/* Top gradient for readability */}
                                <div className="bg-gradient-to-b from-black/50 to-transparent">
                                    {/* Desktop navbar */}
                                    <div className="md:flex hidden justify-between items-center px-10 py-10">
                                        <div className="flex flex-row gap-5 xl:text-[17px] text-[10px] font-[400] text-white">
                                            <div
                                                className="xl:w-[101px] h-[38px] border-[1.2px] border-[#FFFFFF91] rounded-[100px] flex justify-center items-center cursor-pointer px-4 py-2"
                                                onClick={() =>
                                                    handleScroll("home")
                                                }
                                            >
                                                Home
                                            </div>
                                            <div
                                                className="xl:w-[121px] h-[38px] border-[1.2px] border-[#FFFFFF91] rounded-[100px] flex justify-center items-center cursor-pointer px-4 py-2"
                                                onClick={() =>
                                                    handleScroll("about")
                                                }
                                            >
                                                About Us
                                            </div>
                                            <div
                                                className="xl:w-[114px] h-[38px] border-[1.2px] border-[#FFFFFF91] rounded-[100px] flex justify-center items-center cursor-pointer px-4 py-2"
                                                onClick={() =>
                                                    handleScroll("services")
                                                }
                                            >
                                                Services
                                            </div>
                                            <div
                                                className="xl:w-[81px] h-[38px] border-[1.2px] border-[#FFFFFF91] rounded-[100px] flex justify-center items-center cursor-pointer px-4 py-2"
                                                onClick={() =>
                                                    handleScroll("blog")
                                                }
                                            >
                                                Blog
                                            </div>
                                            <div
                                                className="xl:w-[137px] h-[38px] border-[1.2px] border-[#FFFFFF91] rounded-[100px] flex justify-center items-center cursor-pointer px-4 py-2"
                                                onClick={() =>
                                                    handleScroll("contact")
                                                }
                                            >
                                                Contact Us
                                            </div>
                                        </div>

                                        {/* Auth Section */}
                                        <div className="flex flex-row gap-5 xl:text-[17px] text-[10px] font-[700]">
                                            {auth && auth.user ? (
                                                <>
                                                    {auth.user.role ===
                                                        "vendor" && (
                                                        <Link
                                                            href="/vendors/mainDashboard"
                                                            className="bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded text-white text-[18px] font-medium"
                                                        >
                                                            Dashboard
                                                        </Link>
                                                    )}
                                                    {auth.user.role ===
                                                        "client" && (
                                                        <Link
                                                            href="/"
                                                            className="bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded text-white text-[18px] font-medium"
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
                                    {/* Mobile navbar (burger) */}
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

                                {/* Sidebar mobile menu */}
                                {menuOpen && (
                                    <>
                                        {/* Overlay */}
                                        <div
                                            className="fixed inset-0 bg-black bg-opacity-40 z-40"
                                            onClick={() => setMenuOpen(false)}
                                        ></div>
                                        {/* Sidebar */}
                                        <div className="fixed top-0 left-0 h-full w-64 bg-[#0A0630] z-50 shadow-lg flex flex-col p-6 animate-slideIn">
                                            <div className="flex justify-end mb-6">
                                                <button
                                                    className="text-white text-2xl"
                                                    onClick={() =>
                                                        setMenuOpen(false)
                                                    }
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                            <div className="flex flex-col gap-4 text-white text-[17px] font-[400]">
                                                <div
                                                    className="border-b border-[#FFFFFF91] py-2 cursor-pointer"
                                                    onClick={() =>
                                                        handleScroll("home")
                                                    }
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
                                                    onClick={() =>
                                                        handleScroll("blog")
                                                    }
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
                                                                className="bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded text-white text-[12px] font-medium"
                                                            >
                                                                Dashboard
                                                            </Link>
                                                        )}
                                                        {auth.user.role ===
                                                            "client" && (
                                                            <Link
                                                                href="/"
                                                                className="bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded text-white text-[12px] font-medium"
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
                        {/* END NAVBAR OVERLAY */}

                        {/* Caption (blurs when carousel is open) */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`caption-${activeIndex}`}
                                className="absolute inset-0 z-20 flex items-center justify-center px-5"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.35, ease: "easeOut" }}
                            >
                                {/* Title card stays centered */}
                                <motion.div
                                    layoutId={`title-${activeIndex}`}
                                    animate={{
                                        filter: showCarousel
                                            ? "blur(6px)"
                                            : "blur(0px)",
                                        opacity: showCarousel ? 0.6 : 1,
                                    }}
                                    transition={{
                                        duration: 0.25,
                                        ease: "easeOut",
                                    }}
                                    className={`relative inline-flex justify-center items-center max-w-[90vw] flex-col gap-1 rounded-2xl px-4 py-3 uppercase
        ${showCarousel ? "pointer-events-none" : ""}`}
                                    aria-hidden={
                                        showCarousel ? "true" : "false"
                                    }
                                    style={{ willChange: "filter, opacity" }}
                                >
                                    <motion.h2
                                        layoutId={`title-text-${activeIndex}`}
                                        className="text-2xl sm:text-3xl md:text-4xl xl:text-[54px] font-[700] text-white drop-shadow"
                                    >
                                        {IMAGES[activeIndex].title}
                                    </motion.h2>
                                    <motion.p
                                        layoutId={`caption-text-${activeIndex}`}
                                        className="text-base sm:text-lg md:text-xl text-white/80 font-[500] mt-5 drop-shadow text-center"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.35, ease: "easeOut" }}
                                    >
                                        Discover more about {IMAGES[activeIndex].title} and explore endless possibilities.
                                    </motion.p>
                                </motion.div>

                                {/* Subtitle as a sibling, pinned to screen bottom */}
                                <motion.p
                                    layoutId={`subtitle-text-${activeIndex}`}
                                    animate={{
                                        filter: showCarousel
                                            ? "blur(6px)"
                                            : "blur(0px)",
                                        opacity: showCarousel ? 0.6 : 1,
                                    }}
                                    transition={{
                                        duration: 0.25,
                                        ease: "easeOut",
                                    }}
                                    className="pointer-events-none absolute inset-x-0 bottom-12 sm:bottom-10 text-center text-white/85 text-[5px] md:text-base px-4"
                                >
                                    Click a card to focus • Hover near the right
                                    edge to show cards • Use ← →
                                </motion.p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Horizontal card rail */}
                    <AnimatePresence initial={false}>
                        {showCarousel && (
                            <motion.div
                                key="card-rail"
                                initial={{ opacity: 0, x: -40 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -160 }}
                                transition={{ duration: 0.35, ease: "easeOut" }}
                                className="relative z-10 mt-6 flex justify-end items-center w-full"
                            >
                                <div className="xl:max-w-[1000px]">
                                    <div
                                        ref={scrollerRef}
                                        className="overflow-x-auto scroll-smooth snap-x snap-mandatory"
                                        style={{ scrollbarWidth: "none" }}
                                    >
                                        <div className="flex gap-4 py-10 px-10">
                                            {IMAGES.map((item, i) => (
                                                <motion.button
                                                    key={item.url + i}
                                                    ref={(el) => {
                                                        if (el)
                                                            cardRefs.current[
                                                                i
                                                            ] = el;
                                                    }}
                                                    onClick={() => {
                                                        setActiveIndex(i);
                                                        // Nudge the selected card to the RIGHT edge of the scroller before hiding
                                                        requestAnimationFrame(
                                                            () => {
                                                                const el =
                                                                    cardRefs
                                                                        .current[
                                                                        i
                                                                    ];
                                                                const scroller =
                                                                    scrollerRef.current;
                                                                if (
                                                                    el &&
                                                                    scroller
                                                                ) {
                                                                    const cardLeft =
                                                                        el.offsetLeft;
                                                                    const cardWidth =
                                                                        el.offsetWidth;
                                                                    const containerWidth =
                                                                        scroller.clientWidth;
                                                                    const maxScroll =
                                                                        scroller.scrollWidth -
                                                                        containerWidth;
                                                                    const target =
                                                                        Math.min(
                                                                            Math.max(
                                                                                cardLeft -
                                                                                    (containerWidth -
                                                                                        cardWidth),
                                                                                0
                                                                            ),
                                                                            maxScroll
                                                                        );
                                                                    scroller.scrollTo(
                                                                        {
                                                                            left: target,
                                                                            behavior:
                                                                                "smooth",
                                                                        }
                                                                    );
                                                                }
                                                            }
                                                        );
                                                        // Hide the carousel after a brief delay so the scroll can start
                                                        setTimeout(
                                                            () =>
                                                                setShowCarousel(
                                                                    false
                                                                ),
                                                            220
                                                        );
                                                    }}
                                                    layout
                                                    variants={CARD_VARIANTS}
                                                    animate={
                                                        i === activeIndex
                                                            ? "active"
                                                            : "inactive"
                                                    }
                                                    initial={false}
                                                    className={`group relative shrink-0 w-[40vw] sm:w-[30vw] md:w-[300px] aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl ring-2 focus:outline-none focus-visible:ring-4 snap-end ${
                                                        i === activeIndex
                                                            ? "ring-white/80"
                                                            : "ring-white/10"
                                                    }`}
                                                    whileTap={{ scale: 0.985 }}
                                                    whileHover={{ y: -2 }}
                                                >
                                                    <motion.img
                                                        src={item.url}
                                                        alt={item.title}
                                                        className="h-full w-full object-cover"
                                                        layout
                                                        transition={{
                                                            type: "tween",
                                                            duration: 0.35,
                                                            ease: "easeOut",
                                                        }}
                                                    />
                                                    <div className="pointer-events-none absolute inset-0 bg-black/40" />
                                                    <motion.div
                                                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
                                                        initial={false}
                                                        animate={{
                                                            opacity:
                                                                i ===
                                                                activeIndex
                                                                    ? 1
                                                                    : 0.8,
                                                        }}
                                                        transition={{
                                                            duration: 0.25,
                                                        }}
                                                    />
                                                    <div className="pointer-events-none absolute left-3 bottom-3 hidden sm:block">
                                                        <div className="rounded-md px-2 py-1 text-white/90 text-xs backdrop-blur-md bg-black/20 ring-1 ring-white/15">
                                                            {item.title}
                                                        </div>
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Dots */}
                    <AnimatePresence>
                        {showCarousel && (
                            <motion.div
                                key="dots"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="pointer-events-auto absolute inset-x-0 bottom-6 flex items-center justify-center gap-2 z-20"
                            >
                                {IMAGES.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setShowCarousel(true);
                                            setActiveIndex(i);
                                        }}
                                        className={`h-2.5 w-2.5 rounded-full transition-opacity duration-200 ${
                                            i === activeIndex
                                                ? "bg-white/90"
                                                : "bg-white/40 hover:bg-white/60"
                                        }`}
                                        aria-label={`Go to slide ${i + 1}`}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </LayoutGroup>
        </div>
    );
};

export default TravelExploreAnimation;
