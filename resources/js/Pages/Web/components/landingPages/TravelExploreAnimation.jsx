import React, { useRef, useState, useEffect, useMemo } from "react";
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
    { title: "Land Vehicles", url: img1 },
    { title: "Sea Vehicles", url: img2 },
    { title: "Air Vehicles", url: img3 },
    { title: "Warehouse", url: img4 },
    { title: "Freight", url: img5 },
    { title: "Multi-model", url: img6 },
    { title: "Ticket Booking", url: img7 },
];


const TravelExploreAnimation = ({ auth }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [showCarousel, setShowCarousel] = useState(true);
    const scrollerRef = useRef(null);
    const cardRefs = useRef([]);
    const [menuOpen, setMenuOpen] = useState(false);

    const [isPrevMorph, setIsPrevMorph] = useState(false);
    const [tempCardIndex, setTempCardIndex] = useState(null);

    // Compute a rotating order of cards so the carousel behaves like a queue
    const queueOrder = useMemo(() => {
        const order = [];
        for (let k = 1; k < IMAGES.length; k++) {
            order.push((activeIndex + k) % IMAGES.length);
        }
        return order; // excludes the active index; starts from next and wraps around
    }, [activeIndex]);


    // Scroll to section by id
    const handleScroll = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
            setMenuOpen(false); // close sidebar if open
        }
    };

    // Smoothly move the horizontal rail by ~one card
    const getCardStep = () => {
        const scroller = scrollerRef.current;
        if (!scroller) return 320; // sensible fallback
        const firstBtn = scroller.querySelector('button.group');
        if (!firstBtn) return 320;
        const style = window.getComputedStyle(firstBtn);
        const marginRight = parseFloat(style.marginRight || '0');
        return firstBtn.offsetWidth + marginRight;
    };

    const scrollByStep = (dir = 1) => {
        const scroller = scrollerRef.current;
        if (!scroller) return;
        const step = getCardStep();
        scroller.scrollBy({ left: dir * step, behavior: 'smooth' });
    };




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
                <div className="relative h-screen w-full flex flex-col justify-center items-end overflow-hidden">
                    {/* Background crossfade */}
                    <div className="absolute inset-0 z-10">
                      <motion.div
                        key={isPrevMorph ? `bg-${tempCardIndex}` : `bg-${activeIndex}`}
                        className={`absolute inset-0 ${isPrevMorph ? 'z-30' : 'z-10'}`}
                        layout
                        transition={{ layout: { duration: 0.2, ease: [0.25, 1, 0.5, 1] } }}
                        layoutId={`card-${isPrevMorph && tempCardIndex !== null ? tempCardIndex : activeIndex}`}
                        onLayoutAnimationComplete={() => {
                          if (isPrevMorph) {
                            setIsPrevMorph(false);
                            setTempCardIndex(null);
                          }
                        }}
                      >
                        <img
                          src={IMAGES[isPrevMorph && tempCardIndex !== null ? tempCardIndex : activeIndex].url}
                          alt="Background"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40" />
                      </motion.div>

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
                        <div className="absolute inset-0 z-20 flex items-center justify-center px-5">
                            {/* Title card stays centered */}
                            <div
                                className={`relative inline-flex justify-center items-center max-w-[90vw] flex-col gap-1 rounded-2xl px-4 py-3 uppercase
        ${showCarousel ? "pointer-events-none" : ""}`}
                                aria-hidden={
                                    showCarousel ? "true" : "false"
                                }
                            >
                                <h2
                                    className="text-2xl sm:text-3xl md:text-4xl xl:text-[54px] font-[700] text-white drop-shadow"
                                >
                                    {IMAGES[activeIndex].title}
                                </h2>
                                <p
                                    className="text-base sm:text-lg md:text-xl text-white/80 font-[500] mt-5 drop-shadow text-center"
                                >
                                    Discover more about {IMAGES[activeIndex].title} and explore endless possibilities.
                                </p>
                            </div>

                            {/* Subtitle as a sibling, pinned to screen bottom */}
                            <p
                                className="pointer-events-none absolute inset-x-0 bottom-12 sm:bottom-10 text-center text-white/85 text-[5px] md:text-base px-4"
                            >
                                Click a card to focus • Hover near the right
                                edge to show cards • Use ← →
                            </p>
                        </div>
                    </div>

                    {/* Horizontal card rail */}
                    <>
                        {showCarousel && (
                            <div
                                className="relative z-20 mt-6 flex justify-end items-center w-full"
                            >
                                <div className="xl:max-w-[1000px]">
                                    <div
                                        ref={scrollerRef}
                                        className="overflow-hidden touch-pan-y scroll-smooth snap-x snap-mandatory px-10 py-10"
                                        style={{ scrollbarWidth: "none" }}
                                    >
                                        <div className="flex gap-4">
                                          <AnimatePresence initial={false}>
                                            {queueOrder.map((idx) => (
                                              <motion.div
                                                key={IMAGES[idx].url}
                                                ref={(el) => { if (el) cardRefs.current[idx] = el; }}
                                                layout
                                                transition={{ layout: { duration: 1.5, ease: [0.25, 1, 0.5, 1] } }}
                                                layoutId={`card-${idx}`}
                                                className={`group relative shrink-0 w-[40vw] sm:w-[30vw] md:w-[300px] aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl ring-2 snap-end ring-white/10 cursor-default`}
                                              >
                                                <img
                                                  src={IMAGES[idx].url}
                                                  alt={IMAGES[idx].title}
                                                  className="h-full w-full object-cover"
                                                />
                                                <div className="pointer-events-none absolute inset-0 bg-black/40" />
                                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                                                <div className="pointer-events-none absolute left-3 bottom-3 hidden sm:block">
                                                  <div className="rounded-md px-2 py-1 text-white/90 text-xs backdrop-blur-md bg-black/20 ring-1 ring-white/15">
                                                    {IMAGES[idx].title}
                                                  </div>
                                                </div>
                                              </motion.div>
                                            ))}
                                          </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>

                    {/* On-screen arrow controls */}
                    <>
                        {showCarousel && (
                            <div
                                className="pointer-events-auto absolute inset-x-0 bottom-20 sm:bottom-24 flex items-center justify-center gap-4 z-20"
                            >
                                <button
                                    onClick={() => {
                                      const next = (activeIndex + 1) % IMAGES.length;
                                      setActiveIndex(next); // the next card will expand into the background via shared layoutId
                                    }}
                                    aria-label="Next"
                                    className="rounded-full bg-white/80 hover:bg-white text-black backdrop-blur px-4 py-2 text-sm md:text-base shadow"
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                </div>
        </div>
    );
};

export default TravelExploreAnimation;
