import React, { useMemo, useState } from "react";

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
  const [menuOpen, setMenuOpen] = useState(false);


  const cardOrder = useMemo(
    () => IMAGES.map((_, i) => i).filter((i) => i !== activeIndex),
    [activeIndex]
  );

  const handleScroll = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "auto" });
      setMenuOpen(false);
    }
  };


  return (
    <div>
      <div className="relative h-screen w-full flex flex-col justify-center items-end overflow-hidden">
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
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
         >
            <img
              src={IMAGES[activeIndex].url}
              alt={IMAGES[activeIndex].title}
              className="h-full w-full object-cover"
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
                        onClick={() => (window.location.href = "/signin")}
                      >
                        Login
                      </div>
                      <div
                        className="lg:w-[137px] h-[38px] text-[#FF7003] border-[1.2px] border-[#FF7003] rounded-[100px] flex justify-center items-center cursor-pointer bg-transparent px-4 py-2"
                        onClick={() => (window.location.href = "/signup")}
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
                      onClick={() => handleScroll("about")}
                    >
                      About Us
                    </div>
                    <div
                      className="border-b border-[#FFFFFF91] py-2 cursor-pointer"
                      onClick={() => handleScroll("services")}
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
                      onClick={() => handleScroll("contact")}
                    >
                      Contact Us
                    </div>
                  </div>
                  <div className="mt-6 flex flex-row gap-3">
                    {auth && auth.user ? (
                      <>
                        {auth.user.role === "vendor" && (
                          <Link
                            href="/vendors/mainDashboard"
                            className="bg-yellow-600 px-3 py-2 rounded text-white text-[12px] font-medium"
                          >
                            Dashboard
                          </Link>
                        )}
                        {auth.user.role === "client" && (
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
                          onClick={() => (window.location.href = "/signin")}
                        >
                          Login
                        </div>
                        <div
                          className="text-[#FF7003] border-[1.2px] border-[#FF7003] rounded-[100px] flex justify-center items-center px-4 py-2 cursor-pointer"
                          onClick={() => (window.location.href = "/signup")}
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
        <div className="absolute inset-0 z-40 flex items-center justify-center px-5">
          <div className="relative inline-flex justify-center items-center max-w-[90vw] flex-col gap-1 rounded-2xl px-4 py-3 uppercase">
            <h2 className="text-[40px] xl:text-[54px] font-[700] text-center text-white drop-shadow-lg">
              {IMAGES[activeIndex].title}
            </h2>
            <p className="text-base md:text-[12px] text-white/90 font-[500] drop-shadow-lg text-center max-w-2xl mx-auto">
              Discover more about {IMAGES[activeIndex].title} and explore endless possibilities.
            </p>
          </div>
        </div>

        {/* Carousel (shared layout, framer-motion) */}
        <div className="relative z-50 mt-6 flex justify-center items-end w-full h-screen">
          <div className="md:max-w-[1000px] max-w-full">
            <div
              className="overflow-x-auto touch-pan-y snap-x snap-mandatory px-10 py-10"
              style={{ scrollbarWidth: "none" }}
            >
              <div className="flex gap-4">
                {cardOrder.map((idx) => (
                  <motion.div
                    key={`card-${idx}`}
                    layoutId={`media-${idx}`}
                    layout
                    initial={false}
                    animate={{ borderRadius: 20 }}
                    onClick={() => setActiveIndex(idx)}
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="group relative shrink-0 w-[30px] h-[30px] lg:w-[150px] rounded-[20px] lg:h-[125px] overflow-hidden shadow-2xl ring-2 snap-end ring-white/10 cursor-pointer"
                    style={{ borderRadius: 20 }}
                  >
                    <img
                      src={IMAGES[idx].url}
                      alt={IMAGES[idx].title}
                      className="h-full w-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-black/40" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="pointer-events-none absolute inset-0 flex items-end justify-center py-5">
                      <div className="rounded-lg border-[1px] border-[#FF7003] px-3 py-2 text-white/90 font-[700] text-sm backdrop-blur-md bg-black/30 ring-1 ring-white/15 text-center">
                        {IMAGES[idx].title}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelExploreAnimation;