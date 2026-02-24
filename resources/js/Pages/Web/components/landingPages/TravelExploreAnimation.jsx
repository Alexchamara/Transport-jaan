import React, { useState } from "react";

import { motion } from "framer-motion";

import img1 from "../../assets/landingPages/hero/landvehiclerental.jpg";
import img2 from "../../assets/landingPages/hero/seavehiclebooking.jpg";
import img3 from "../../assets/landingPages/hero/airvehiclerental.jpg";
import img4 from "../../assets/landingPages/hero/warehouse.jpg";
import img5 from "../../assets/landingPages/hero/freight.jpg";
import img6 from "../../assets/landingPages/hero/multimodel.jpg";
import img7 from "../../assets/landingPages/hero/ticketbooking.jpg";
import img8 from "../../assets/courierService/courier.jpg";

import burgerIcon from "../../assets/landingPages/burgerIcon.svg";
import { Link } from "@inertiajs/react";

const IMAGES = [
    {
        title: "Vehicle Rental & Ticket Booking",
        subtitle: "Complete Transportation",
        description:
            "Book or rent vehicles across land, sea, and air. Including cars, buses, boats, helicopters, and flight tickets for personal or business travel needs.",
        ctaLabel: "Book Vehicle",
        href: "/clientRent",
        url: img1,
        tags: ["Vehicle Rental", "Booking"],
    },
    {
        title: "Warehouse",
        subtitle: "Storage & Fulfillment",
        description:
            "Find warehousing solutions for goods storage, inventory management, and distribution. Flexible space and integrated logistics support.",
        ctaLabel: "Find Warehouses",
        href: "/warehouse",
        url: img4,
        tags: ["Warehouse", "Storage", "Fulfillment"],
    },
    {
        title: "Freight",
        subtitle: "Bulk Cargo Movement",
        description:
            "Arrange freight shipping for large or bulk goods via road, sea, or air. Track shipments and optimize your supply chain.",
        ctaLabel: "Ship Freight",
        href: "/freight-home",
        url: img5,
        tags: ["Freight", "Shipping", "Logistics"],
    },
    {
        title: "Courier Booking",
        subtitle: "Fast & Reliable Delivery",
        description:
            "Send packages, documents, and parcels locally or internationally with our trusted courier network. Real-time tracking and secure delivery options.",
        ctaLabel: "Book Courier",
        href: "/courier-service",
        url: img8,
        tags: ["Courier", "Delivery", "Tracking"],
    },
];

const SERVICES = [
    {
        title: "Vehicle Rental",
        subtitle: "Cars, vans & trucks",
        img: img1,
        sub: [
            { title: "Land Vehicle", subtitle: "Cars, buses & trucks", href: "/vehicleList", img: img1 },
            { title: "Sea Vehicle", subtitle: "Boats & ships", href: "/seaVehicleList", img: img2 },
            { title: "Air Vehicle", subtitle: "Helicopters & planes", href: "/airVehicleList", img: img3 },
        ],
    },
    {
        title: "Ticket Booking",
        subtitle: "Land, air & sea tickets",
        img: img7,
        sub: [
            { title: "Flight Ticket", subtitle: "Book air tickets", href: "/flight-booking", img: img3 },
            { title: "Bus Ticket", subtitle: "Book bus tickets", href: "/busTicketBookingDetails", img: img1 },
            { title: "Train Ticket", subtitle: "Book train tickets", href: "/trainTicketBookingDetails", img: img2 },
        ],
    },
    { title: "Courier Booking", subtitle: "Local & international parcels", href: "/couriers/create", img: img8 },
    { title: "Warehouse Booking", subtitle: "Storage & fulfillment", href: "/warehouseList", img: img4 },
    { title: "Freight Module", subtitle: "Bulk cargo shipments", href: "/freight-home", img: img5 },
    { title: "Multimodal", subtitle: "Combined transport", href: "/multiModel/plan-journey", img: img6 },
];

const TravelExploreAnimation = ({ auth }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(0);
    const [servicesOpen, setServicesOpen] = useState(false);
    const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
    const [hoveredService, setHoveredService] = useState(null);
    const [mobileSubService, setMobileSubService] = useState(null);

    const user = auth?.user;
    const userRole = user?.role;
    const userStatus =
        typeof user?.status === "string" ? user.status.toLowerCase() : "";
    const isVendor = userRole === "vendor";
    const isVendorVerified = isVendor && userStatus === "verified";
    const isClient = userRole === "client";
    const isSuperAdmin = userRole === "SuperAdmin";

    const handleScroll = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
            setMenuOpen(false);
        }
    };

    return (
        <div className="bg-gray-900">
            <div className="relative min-h-screen w-full flex flex-col justify-center items-center">
                {/* Dynamic Background */}
                <div className="absolute inset-0">
                    {IMAGES.map((item, i) => (
                        <motion.div
                            key={i}
                            className="absolute inset-0"
                            initial={{ opacity: i === 0 ? 1 : 0 }}
                            animate={{ opacity: hoveredCard === i ? 1 : 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <img
                                src={item.url}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    ))}
                </div>
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
                {/* Dropdown blur overlay */}
                <div
                    className="absolute inset-0 z-[50] pointer-events-none transition-all duration-300"
                    style={{
                        backdropFilter: servicesOpen ? "blur(1px)" : "blur(0px)",
                        WebkitBackdropFilter: servicesOpen ? "blur(1px)" : "blur(0px)",
                        backgroundColor: servicesOpen ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0)",
                    }}
                />

                {/* NAVBAR */}
                <div className="absolute inset-x-0 top-0 xl:left-0 z-[60] pointer-events-none">
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
                                        className="relative"
                                        onMouseEnter={() => setServicesOpen(true)}
                                        onMouseLeave={() => setServicesOpen(false)}
                                    >
                                        <div
                                            className="xl:w-[114px] h-[38px] border-[1.2px] border-[#FFFFFF91] rounded-[100px] flex justify-center items-center cursor-pointer px-4 py-2"
                                            onTouchStart={(e) => { e.preventDefault(); setServicesOpen(prev => !prev); }}
                                        >
                                            <span className="flex items-center gap-1">
                                                Services
                                                <svg
                                                    className={`w-3 h-3 transition-transform duration-200 ${servicesOpen ? "rotate-180" : ""}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </span>
                                        </div>

                                        {/* Dropdown */}
                                        {servicesOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute top-full -translate-x-1/2 w-64 z-[70] pt-3"
                                            >
                                                <div className="bg-white/15 backdrop-blur-lg border border-white/30 rounded-2xl shadow-2xl">
                                                    {SERVICES.map((service, i) => (
                                                        <div
                                                            key={i}
                                                            className="relative"
                                                            onMouseEnter={() => setHoveredService(i)}
                                                            onMouseLeave={() => setHoveredService(null)}
                                                        >
                                                            <a
                                                                href={service.sub ? undefined : service.href}
                                                                onClick={service.sub ? (e) => e.preventDefault() : undefined}
                                                                className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/20 transition-all duration-200 border-b border-white/10 last:border-0 cursor-pointer"
                                                            >
                                                                <img
                                                                    src={service.img}
                                                                    alt={service.title}
                                                                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                                                />
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-semibold leading-tight">{service.title}</p>
                                                                    <p className="text-xs text-white/70 leading-tight mt-0.5">{service.subtitle}</p>
                                                                </div>
                                                                {service.sub && (
                                                                    <svg className="w-3 h-3 text-white/70 flex-shrink-0 -rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                    </svg>
                                                                )}
                                                            </a>
                                                            {/* Sub-dropdown flyout */}
                                                            {service.sub && hoveredService === i && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, x: -6 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ duration: 0.15 }}
                                                                    className="absolute left-full top-0 w-56 pl-2 z-[80]"
                                                                >
                                                                    <div className="bg-white/15 backdrop-blur-lg border border-white/30 rounded-2xl shadow-2xl overflow-hidden">
                                                                        {service.sub.map((sub, j) => (
                                                                            <a
                                                                                key={j}
                                                                                href={sub.href}
                                                                                className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/20 transition-all duration-200 border-b border-white/10 last:border-0"
                                                                            >
                                                                                <img
                                                                                    src={sub.img}
                                                                                    alt={sub.title}
                                                                                    className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                                                                                />
                                                                                <div>
                                                                                    <p className="text-sm font-semibold leading-tight">{sub.title}</p>
                                                                                    <p className="text-xs text-white/70 leading-tight mt-0.5">{sub.subtitle}</p>
                                                                                </div>
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
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
                                                    href="/clientAllBookings"
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
                                <div className="fixed top-0 left-0 h-full w-64 bg-[#000000] z-50 shadow-lg flex flex-col p-6 overflow-y-auto">
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
                                        <div className="border-b border-[#FFFFFF91]">
                                            <div
                                                className="py-2 cursor-pointer flex justify-between items-center"
                                                onClick={() => setMobileServicesOpen(prev => !prev)}
                                            >
                                                <span>Services</span>
                                                <svg
                                                    className={`w-4 h-4 transition-transform duration-200 ${mobileServicesOpen ? "rotate-180" : ""}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                            {mobileServicesOpen && (
                                                <div className="pb-2 flex flex-col gap-0.5">
                                                    {SERVICES.map((service, i) => (
                                                        <div key={i}>
                                                            {service.sub ? (
                                                                <>
                                                                    <div
                                                                        className="flex justify-between items-center px-3 py-2 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all duration-200 cursor-pointer"
                                                                        onClick={() => setMobileSubService(mobileSubService === i ? null : i)}
                                                                    >
                                                                        <div>
                                                                            <p className="text-sm font-semibold leading-tight">{service.title}</p>
                                                                            <p className="text-xs text-white/60 leading-tight mt-0.5">{service.subtitle}</p>
                                                                        </div>
                                                                        <svg
                                                                            className={`w-3.5 h-3.5 text-white/70 flex-shrink-0 transition-transform duration-200 ${mobileSubService === i ? "rotate-180" : ""}`}
                                                                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                                        >
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                        </svg>
                                                                    </div>
                                                                    {mobileSubService === i && (
                                                                        <div className="ml-4 mb-1 flex flex-col gap-0.5 border-l border-white/20 pl-3">
                                                                            {service.sub.map((sub, j) => (
                                                                                <a
                                                                                    key={j}
                                                                                    href={sub.href}
                                                                                    className="flex flex-col py-1.5 hover:text-white/80 transition-colors duration-200"
                                                                                >
                                                                                    <p className="text-sm font-medium leading-tight">{sub.title}</p>
                                                                                    <p className="text-xs text-white/50 leading-tight mt-0.5">{sub.subtitle}</p>
                                                                                </a>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <a
                                                                    href={service.href}
                                                                    className="flex flex-col px-3 py-2 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all duration-200"
                                                                >
                                                                    <p className="text-sm font-semibold leading-tight">{service.title}</p>
                                                                    <p className="text-xs text-white/60 leading-tight mt-0.5">{service.subtitle}</p>
                                                                </a>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
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
                                        {user ? (
                                            <>
                                                {isVendor &&
                                                    (isVendorVerified ? (
                                                        <Link
                                                            href="/vendors/mainDashboard"
                                                            className="bg-yellow-600 px-3 py-2 rounded text-white text-[12px] font-medium"
                                                        >
                                                            Dashboard
                                                        </Link>
                                                    ) : (
                                                        <Link
                                                            href="/approval-pending"
                                                            className="bg-orange-600 px-3 py-2 rounded text-white text-[12px] font-medium"
                                                        >
                                                            Dashboard
                                                        </Link>
                                                    ))}
                                                {isClient && (
                                                    <Link
                                                        href="/clientAllBookings"
                                                        className="bg-yellow-600 px-3 py-2 rounded text-white text-[12px] font-medium"
                                                    >
                                                        Dashboard
                                                    </Link>
                                                )}
                                                {isSuperAdmin && (
                                                    <Link
                                                        href="/superadmin/dashboard"
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

                {/* Services Cards Grid */}
                <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-32 mt-16 sm:mt-20 md:mt-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {IMAGES.map((item, i) => (
                            <motion.a
                                key={i}
                                href={item.href}
                                className="group relative rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 1.05 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20,
                                }}
                                onMouseEnter={() => setHoveredCard(i)}
                                onMouseLeave={() => setHoveredCard(0)}
                                onTouchStart={() => setHoveredCard(i)}
                                onTouchEnd={() => setTimeout(() => setHoveredCard(0), 300)}
                            >
                                <div className="relative h-[400px] sm:h-[420px] md:h-[450px] w-full">
                                    <img
                                        src={item.url}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        draggable={false}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                    {/* Content */}
                                    <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
                                        <div className="bg-white/20 backdrop-blur-lg rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/30 transition-all duration-300 group-hover:bg-white/30 group-hover:border-white/50">
                                            <h3 className="text-white font-bold text-lg sm:text-xl mb-1 sm:mb-2 uppercase tracking-wide">
                                                {item.title}
                                            </h3>
                                            <p className="text-white/90 text-xs sm:text-sm mb-2 sm:mb-3">
                                                {item.subtitle}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {item.tags.slice(0, 3).map((tag, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/50"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TravelExploreAnimation;
