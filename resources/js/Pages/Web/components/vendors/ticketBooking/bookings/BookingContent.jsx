import React, { useState, useRef, useEffect } from "react";
import { usePage, Link } from "@inertiajs/react";

import search from "../../../../assets/vendors/dashboard/searchIcon.svg";
import settings from "../../../../assets/vendors/dashboard/settings.svg";
import bell from "../../../../assets/vendors/dashboard/bell.svg";
import proPic from "../../../../assets/vendors/dashboard/proPic.svg";
import logOutLogo from "../../../../assets/vendors/dashboard/logOutLogo.svg"; // Added

import upArrow from "../../../../assets/vendors/dashboard/icons/upArrow.svg";

import icon1 from "../../../../assets/vendors/booking/icons/icon1.svg";
import icon2 from "../../../../assets/vendors/booking/icons/icon2.svg";
import icon3 from "../../../../assets/vendors/booking/icons/icon3.svg";
import icon4 from "../../../../assets/vendors/booking/icons/icon4.svg";

import filterIcon from "../../../../assets/vendors/dashboard/icons/filterIcon.svg";
import miniSearchIcon from "../../../../assets/vendors/dashboard/icons/miniSearchIcon.svg";
import miniDownArrow from "../../../../assets/vendors/dashboard/icons/miniDownArrow.svg";

import CarBookingTableTwo from "../../../../components/vendors/ticketBooking/bookings/CarBookingTableTwo";
import BookingBarChart from "./BookingBarChart";


import UserDropdown from "../../UserDropdown";

const BookingContent = () => {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isVerified = user?.status === 'verified' || user?.status === 'Verified';
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768); // md breakpoint
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Screen restricted to Flights only
    const bookingType = "Flight";
    const paymentStatusColors = {
        Paid: { color: "#3B8F31", bg: "#ACE199" },
        Pending: { color: "#FF60608C", bg: "#FF60608C" },
    };

    const statusColors = {
        Ongoing: { bg: "#FFCD29", text: "#000000" },
        Returned: { bg: "#3B8F31", text: "#FFCD29" },
    };

    const [flightBookings, setFlightBookings] = useState([
        {
            id: "F-AX2101",
            bookingDate: "Aug 15, 2025",
            clientName: "Amani Perera",
            airline: "SriLankan Airlines",
            flightNo: "UL 315",
            from: "CMB",
            to: "SIN",
            startDate: "Aug 20, 2025",
            endDate: "Aug 20, 2025",
            payment: "$320",
            paymentStatus: "Paid",
            paymentStatusColor: paymentStatusColors.Paid.color,
            paymentStatusBg: paymentStatusColors.Paid.bg,
            status: "Ongoing",
            statusBg: statusColors.Ongoing.bg,
            statusText: statusColors.Ongoing.text,
        },
        {
            id: "F-DXB7782",
            bookingDate: "Aug 16, 2025",
            clientName: "Kasun Fernando",
            airline: "Emirates",
            flightNo: "EK 349",
            from: "CMB",
            to: "DXB",
            startDate: "Aug 25, 2025",
            endDate: "Aug 25, 2025",
            payment: "$540",
            paymentStatus: "Paid",
            paymentStatusColor: paymentStatusColors.Paid.color,
            paymentStatusBg: paymentStatusColors.Paid.bg,
            status: "Ongoing",
            statusBg: statusColors.Ongoing.bg,
            statusText: statusColors.Ongoing.text,
        },
        {
            id: "F-SIN3321",
            bookingDate: "Aug 18, 2025",
            clientName: "Dilini Weerasinghe",
            airline: "Singapore Airlines",
            flightNo: "SQ 469",
            from: "CMB",
            to: "SIN",
            startDate: "Aug 28, 2025",
            endDate: "Aug 28, 2025",
            payment: "$375",
            paymentStatus: "Pending",
            paymentStatusColor: paymentStatusColors.Pending.color,
            paymentStatusBg: paymentStatusColors.Pending.bg,
            status: "Ongoing",
            statusBg: statusColors.Ongoing.bg,
            statusText: statusColors.Ongoing.text,
        },
        {
            id: "F-LHR1190",
            bookingDate: "Aug 12, 2025",
            clientName: "Shenal Jayasuriya",
            airline: "Qatar Airways",
            flightNo: "QR 653",
            from: "CMB",
            to: "LHR",
            startDate: "Aug 30, 2025",
            endDate: "Aug 30, 2025",
            payment: "$815",
            paymentStatus: "Paid",
            paymentStatusColor: paymentStatusColors.Paid.color,
            paymentStatusBg: paymentStatusColors.Paid.bg,
            status: "Ongoing",
            statusBg: statusColors.Ongoing.bg,
            statusText: statusColors.Ongoing.text,
        },
        {
            id: "F-DXB7782",
            bookingDate: "Aug 16, 2025",
            clientName: "Kasun Fernando",
            airline: "Emirates",
            flightNo: "EK 349",
            from: "CMB",
            to: "DXB",
            startDate: "Aug 25, 2025",
            endDate: "Aug 25, 2025",
            payment: "$540",
            paymentStatus: "Paid",
            paymentStatusColor: paymentStatusColors.Paid.color,
            paymentStatusBg: paymentStatusColors.Paid.bg,
            status: "Ongoing",
            statusBg: statusColors.Ongoing.bg,
            statusText: statusColors.Ongoing.text,
        },
        {
            id: "F-SIN3321",
            bookingDate: "Aug 18, 2025",
            clientName: "Dilini Weerasinghe",
            airline: "Singapore Airlines",
            flightNo: "SQ 469",
            from: "CMB",
            to: "SIN",
            startDate: "Aug 28, 2025",
            endDate: "Aug 28, 2025",
            payment: "$375",
            paymentStatus: "Pending",
            paymentStatusColor: paymentStatusColors.Pending.color,
            paymentStatusBg: paymentStatusColors.Pending.bg,
            status: "Ongoing",
            statusBg: statusColors.Ongoing.bg,
            statusText: statusColors.Ongoing.text,
        },
        {
            id: "F-LHR1190",
            bookingDate: "Aug 12, 2025",
            clientName: "Shenal Jayasuriya",
            airline: "Qatar Airways",
            flightNo: "QR 653",
            from: "CMB",
            to: "LHR",
            startDate: "Aug 30, 2025",
            endDate: "Aug 30, 2025",
            payment: "$815",
            paymentStatus: "Paid",
            paymentStatusColor: paymentStatusColors.Paid.color,
            paymentStatusBg: paymentStatusColors.Paid.bg,
            status: "Ongoing",
            statusBg: statusColors.Ongoing.bg,
            statusText: statusColors.Ongoing.text,
        },
    ]);

    const bookings = flightBookings;
    const setBookings = setFlightBookings;

    const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
    const [newBooking, setNewBooking] = useState({
        id: "",
        bookingDate: "",
        clientName: "",
        from: "",
        to: "",
        startDate: "",
        endDate: "",
        payment: "",
        paymentStatus: "Pending",
        status: "Ongoing",
        carModel: "",
        carPlate: "",
        plan: "",
    });

    // Handle input changes for the form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewBooking((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission to add new booking
    const handleAddBooking = () => {
        const baseVisual = {
            paymentStatusColor:
                paymentStatusColors[newBooking.paymentStatus]?.color ||
                "#FF6060",
            paymentStatusBg:
                paymentStatusColors[newBooking.paymentStatus]?.bg || "#FF6060",
            statusBg: statusColors[newBooking.status]?.bg || "#FFCD29",
            statusText: statusColors[newBooking.status]?.text || "#000000",
        };

        const mappedFields = {
            airline: newBooking.carModel,
            flightNo: newBooking.carPlate,
            from: newBooking.from,
            to: newBooking.to,
        };

        const newBookingEntry = {
            id: newBooking.id,
            bookingDate: newBooking.bookingDate,
            clientName: newBooking.clientName,
            startDate: newBooking.startDate,
            endDate: newBooking.endDate,
            payment: newBooking.payment,
            paymentStatus: newBooking.paymentStatus,
            status: newBooking.status,
            ...baseVisual,
            ...mappedFields,
        };

        setBookings((prev) => [...prev, newBookingEntry]);
        setIsAddPopupOpen(false);
        setNewBooking({
            id: "",
            bookingDate: "",
            clientName: "",
            from: "",
            to: "",
            startDate: "",
            endDate: "",
            payment: "",
            paymentStatus: "Pending",
            status: "Ongoing",
            carModel: "",
            carPlate: "",
            plan: "",
        });
    };

    return (
        <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 xl:pr-8 xl:pl-6 pb-12">
            {/* Header section */}
            <div className="flex flex-col lg:flex-row gap-5 justify-between items-center mb-6">
                <h1 className="figtree text-[35px] sm:text-[28px] font-[700]">
                    Ticket Bookings
                </h1>
                
            </div>
            {/* end of header section */}

            <div className="flex flex-col xl:flex-row gap-10 justify-between w-full">
                {/* mini left */}
                <div className="flex flex-col gap-8 w-full">
                    {/* card 1 */}
                    <div
                        className="w-full xl:min-w-[300px] xl:min-h-[91px] h-auto bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                        style={{
                            boxShadow: "4px 4px 4px #0000001A",
                        }}
                    >
                        <div className="flex flex-row gap-5 justify-center items-center">
                            <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                <img src={icon1} alt="Upcoming Bookings" />
                            </div>
                            <div>
                                <h1 className="text-[16px] font-[500] text-[#7B7B7A] text-wrap">
                                    Upcoming Bookings
                                </h1>
                                <h1 className="text-[26px] font-[700]">145</h1>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                            <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                <img
                                    src={upArrow}
                                    className="size-[19px]"
                                    alt="Increase"
                                />
                                <h1 className="">+2.86%</h1>
                            </div>
                            <h1 className="text-[#7B7B7A]">from last week</h1>
                        </div>
                    </div>
                    {/* end of card 1 */}
                    {/* card 2 */}
                    <div
                        className="w-full xl:min-w-[300px] h-auto xl:min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                        style={{
                            boxShadow: "4px 4px 4px #0000001A",
                        }}
                    >
                        <div className="flex flex-row gap-5 justify-center items-center">
                            <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                <img src={icon2} alt="Pending Bookings" />
                            </div>
                            <div>
                                <h1 className="text-[16px] font-[500] text-[#7B7B7A] text-wrap">
                                    Pending Bookings
                                </h1>
                                <h1 className="text-[26px] font-[700]">234</h1>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                            <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                <img
                                    src={upArrow}
                                    className="size-[19px]"
                                    alt="Increase"
                                />
                                <h1 className="">+2.86%</h1>
                            </div>
                            <h1 className="text-[#7B7B7A]">from last week</h1>
                        </div>
                    </div>
                    {/* end of card 2 */}
                    {/* card 3 */}
                    <div
                        className="w-full xl:min-w-[300px] xl:min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                        style={{
                            boxShadow: "4px 4px 4px #0000001A",
                        }}
                    >
                        <div className="flex flex-row gap-5 justify-center items-center">
                            <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                <img src={icon3} alt="Cancelled Bookings" />
                            </div>
                            <div>
                                <h1 className="text-[16px] font-[500] text-[#7B7B7A] text-wrap">
                                    Cancelled Bookings
                                </h1>
                                <h1 className="text-[26px] font-[700]">24</h1>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                            <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                <img
                                    src={upArrow}
                                    className="size-[19px]"
                                    alt="Increase"
                                />
                                <h1 className="">+2.86%</h1>
                            </div>
                            <h1 className="text-[#7B7B7A]">from last week</h1>
                        </div>
                    </div>
                    {/* end of card 3 */}
                    {/* card 4 */}
                    <div
                        className="w-full xl:min-w-[300px] xl:min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                        style={{
                            boxShadow: "4px 4px 4px #0000001A",
                        }}
                    >
                        <div className="flex flex-row gap-5 justify-center items-center">
                            <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                <img src={icon4} alt="Completed Bookings" />
                            </div>
                            <div>
                                <h1 className="text-[16px] font-[500] text-[#7B7B7A] text-wrap">
                                    Completed Bookings
                                </h1>
                                <h1 className="text-[26px] font-[700]">145</h1>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                            <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                                <img
                                    src={upArrow}
                                    className="size-[19px]"
                                    alt="Increase"
                                />
                                <h1 className="">+2.86%</h1>
                            </div>
                            <h1 className="text-[#7B7B7A]">from last week</h1>
                        </div>
                    </div>
                    {/* end of card 4 */}
                </div>

                {/* mini right */}
                <div
                    className="w-full min-h-[437px] bg-[#FFFFFF] rounded-[10px] flex items-center justify-center"
                    style={{ boxShadow: "4px 4px 4px #0000001A" }}
                >
                    {isMobile ? (
                        <div className="w-full p-4">
                            <div className="flex flex-col gap-2">
                                {[
                                    { name: "Jan", done: 320, cancelled: 220 },
                                    { name: "Feb", done: 380, cancelled: 270 },
                                    { name: "Mar", done: 250, cancelled: 150 },
                                    { name: "Apr", done: 500, cancelled: 230 },
                                    { name: "May", done: 310, cancelled: 410 },
                                    { name: "Jun", done: 370, cancelled: 180 },
                                    { name: "Jul", done: 420, cancelled: 210 },
                                    { name: "Aug", done: 480, cancelled: 380 },
                                    { name: "Sep", done: 270, cancelled: 320 },
                                    { name: "Oct", done: 390, cancelled: 210 },
                                    { name: "Nov", done: 320, cancelled: 170 },
                                    { name: "Dec", done: 500, cancelled: 250 },
                                ].map((item, index) => (
                                    <div key={index} className="bg-gray-50 rounded-md p-3">
                                        <div className="font-medium text-gray-700 mb-2">{item.name}</div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-blue-600 text-sm">{item.done} done</span>
                                            <span className="font-bold text-red-600 text-sm">{item.cancelled} cancelled</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <BookingBarChart />
                    )}
                </div>
            </div>

            {/* car booking section */}
            <div
                className="w-full h-auto bg-[#FFFFFF] rounded-[10px] py-10 px-5 sm:px-10"
                style={{ boxShadow: "4px 4px 4px #0000001A" }}
            >
                <div className="flex xl:flex-row flex-col justify-between">
                    <h1 className="text-[24px] font-[700]">Flight Booking</h1>
                    <div className="flex xl:flex-row flex-col gap-5 mt-5 xl:mt-0">
                        <div className="xl:w-[253px] xl:h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row justify-center items-center py-2 px-5">
                            <img src={miniSearchIcon} alt="Search" />
                            <input
                                type="text"
                                className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC] truncate"
                                placeholder={
                                    "Search client name, airline, etc."
                                }
                            />
                        </div>
                        <div className="xl:w-[155px] xl:h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
                            <img
                                src={filterIcon}
                                className="size-[12px]"
                                alt="Filter"
                            />
                            <h1 className="text-[14px] font-[500] text-[#7B7B7ACC]">
                                Ticket type
                            </h1>
                            <img src={miniDownArrow} alt="Dropdown" />
                        </div>
                        <div className="xl:w-[125px] xl:h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
                            <img
                                src={filterIcon}
                                className="size-[12px]"
                                alt="Filter"
                            />
                            <h1 className="text-[14px] font-[500] text-[#7B7B7ACC]">
                                Status
                            </h1>
                            <img src={miniDownArrow} alt="Dropdown" />
                        </div>
                        <button
                            className="xl:w-[125px] xl:h-[35px] bg-[#0955AC] text-[14px] rounded-[6px] text-[#FFFFFF] font-[700] py-2 px-5"
                            onClick={() => setIsAddPopupOpen(true)}
                        >
                            Add Booking
                        </button>
                    </div>
                </div>

                {/* Add Booking Popup */}
                {isAddPopupOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 poppins">
                        <div className="bg-white p-5 sm:p-10 rounded-[10px] w-full max-w-[600px] shadow-lg">
                            <h2 className="text-[18px] font-[700] mb-4">
                                Add New Booking
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="mb-4">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        Booking ID
                                    </label>
                                    <input
                                        type="text"
                                        name="id"
                                        value={newBooking.id}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                        placeholder="e.g. C-JV1001"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        Booking Date
                                    </label>
                                    <input
                                        type="text"
                                        name="bookingDate"
                                        value={newBooking.bookingDate}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                        placeholder="e.g. May 4, 2025"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        Client Name
                                    </label>
                                    <input
                                        type="text"
                                        name="clientName"
                                        value={newBooking.clientName}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                        placeholder="e.g. Steve Gibson"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        Airline
                                    </label>
                                    <input
                                        type="text"
                                        name="carModel"
                                        value={newBooking.carModel}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                        placeholder="e.g. SriLankan Airlines"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        Flight Number
                                    </label>
                                    <input
                                        type="text"
                                        name="carPlate"
                                        value={newBooking.carPlate}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                        placeholder="e.g. UL315 / SL-45 / IC-90"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        Class
                                    </label>
                                    <input
                                        type="text"
                                        name="plan"
                                        value={newBooking.plan}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                        placeholder="e.g. Economy"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        From
                                    </label>
                                    <input
                                        type="text"
                                        name="from"
                                        value={newBooking.from}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                        placeholder={"e.g. CMB"}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        To
                                    </label>
                                    <input
                                        type="text"
                                        name="to"
                                        value={newBooking.to}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                        placeholder={"e.g. SIN"}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="text"
                                        name="startDate"
                                        value={newBooking.startDate}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                        placeholder="e.g. May 10, 2025"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        End Date
                                    </label>
                                    <input
                                        type="text"
                                        name="endDate"
                                        value={newBooking.endDate}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                        placeholder="e.g. May 17, 2025"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        Payment Amount
                                    </label>
                                    <input
                                        type="text"
                                        name="payment"
                                        value={newBooking.payment}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                        placeholder="e.g. $450"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        Payment Status
                                    </label>
                                    <select
                                        name="paymentStatus"
                                        value={newBooking.paymentStatus}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                    >
                                        <option value="Paid">Paid</option>
                                        <option value="Pending">Pending</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={newBooking.status}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                    >
                                        <option value="Ongoing">Ongoing</option>
                                        <option value="Returned">
                                            Returned
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setIsAddPopupOpen(false)}
                                    className="px-4 py-2 bg-gray-200 rounded-[5px] text-[14px] font-[700]"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddBooking}
                                    className="px-4 py-2 bg-[#0955AC] text-white rounded-[5px] text-[14px] font-[700]"
                                >
                                    Add Booking
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <CarBookingTableTwo
                    bookings={bookings}
                    setBookings={setBookings}
                    statusColors={statusColors}
                    bookingType="Flight"
                />
            </div>
            {/* end */}
        </div>
    );
};

export default BookingContent;
