import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";




import img1 from "../../assets/landingPages/hero/landvehiclerental.jpg"
import img2 from "../../assets/landingPages/hero/seavehiclebooking.jpg"
import img3 from "../../assets/landingPages/hero/airvehiclerental.jpg"
import img4 from "../../assets/landingPages/hero/ticketbooking.jpg"
import img5 from "../../assets/landingPages/hero/seavehiclebooking.jpg"
import img6 from "../../assets/landingPages/hero/airvehiclerental.jpg"

const IMAGES = [
    {
        title: "Aurora Valley",
        url: img1,
    },
    {
        title: "Ocean Cliffs",
        url: img2,
    },
    {
        title: "City Night",
        url: img3,
    },
    {
        title: "Aurora Valley",
        url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop",
    },
    {
        title: "Aurora Valley",
        url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop",
    },
    {
        title: "Ocean Cliffs",
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop",
    },
    {
        title: "City Night",
        url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1600&auto=format&fit=crop",
    },
    {
        title: "Aurora Valley",
        url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop",
    },
];

// Framer Motion variants for smoother card state transitions
const CARD_VARIANTS = {
    active: {
        scale: 1.02,
        opacity: 1,
        filter: "blur(0px)",
        transition: { type: "spring", stiffness: 320, damping: 28 }
    },
    inactive: {
        scale: 1,
        opacity: 0.78,
        filter: "blur(1px)",
        transition: { type: "spring", stiffness: 280, damping: 26 }
    }
};

const TravelExploreAnimation = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollerRef = useRef(null);
    const cardRefs = useRef([]);

    // Keyboard arrows + Esc to restore
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "ArrowRight")
                setActiveIndex((i) => Math.min(i + 1, IMAGES.length - 1));
            else if (e.key === "ArrowLeft")
                setActiveIndex((i) => Math.max(i - 1, 0));
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

    return (
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
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

                    {/* Caption */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`caption-${activeIndex}`}
                            className="absolute inset-x-0 bottom-0 sm:bottom-6 md:bottom-10 px-5"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                        >
                            <motion.div
                                layoutId={`title-${activeIndex}`}
                                className="inline-flex max-w-[90vw] flex-col gap-1 rounded-2xl px-4 py-3 backdrop-blur-md bg-white/5 ring-1 ring-white/20"
                            >
                                <motion.h2
                                    layoutId={`title-text-${activeIndex}`}
                                    className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white drop-shadow"
                                >
                                    {IMAGES[activeIndex].title}
                                </motion.h2>
                                <motion.p
                                    layoutId={`subtitle-text-${activeIndex}`}
                                    className="text-white/85 text-sm md:text-base"
                                >
                                    Tap another card or use ← → to explore
                                </motion.p>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Horizontal card rail */}
                <div className="relative z-10 mt-6 flex justify-end items-center w-full">
                    <div className="max-w-6xl">
                        <div
                            ref={scrollerRef}
                            className="overflow-x-auto scroll-smooth snap-x snap-mandatory"
                            style={{ scrollbarWidth: "none" }}
                        >
                            <div className="flex gap-4 py-4 px-5">
                                {IMAGES.map((item, i) => (
                                    <motion.button
                                        key={item.url + i}
                                        ref={(el) => {
                                            if (el) cardRefs.current[i] = el;
                                        }}
                                        onClick={() => {
                                            setActiveIndex(i);
                                        }}
                                        layout
                                        variants={CARD_VARIANTS}
                                        animate={i === activeIndex ? "active" : "inactive"}
                                        initial={false}
                                        className={`group relative shrink-0 w-[70vw] sm:w-72 md:w-80 aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl ring-2 focus:outline-none focus-visible:ring-4 snap-end ${
                                            i === activeIndex ? "ring-white/80" : "ring-white/10"
                                        }`}
                                        whileTap={{ scale: 0.985 }}
                                        whileHover={{ y: -2 }}
                                    >
                                        <motion.img
                                            src={item.url}
                                            alt={item.title}
                                            className="h-full w-full object-cover"
                                            layout
                                            transition={{ type: "tween", duration: 0.35, ease: "easeOut" }}
                                        />

                                        {/* Animated gradient + dimmer that softens when inactive */}
                                        <motion.div
                                            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
                                            initial={false}
                                            animate={{ opacity: i === activeIndex ? 1 : 0.8 }}
                                            transition={{ duration: 0.25 }}
                                        />

                                        {/* Optional title tag on card for context (hidden on small) */}
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
                </div>

                {/* Dots */}
                <div className="pointer-events-auto absolute inset-x-0 bottom-6 flex items-center justify-center gap-2 z-20">
                    {IMAGES.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => {
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
                </div>
            </div>
        </LayoutGroup>
    );
};

export default TravelExploreAnimation;
