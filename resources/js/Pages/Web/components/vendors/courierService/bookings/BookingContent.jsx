import React, { useState, useRef, useEffect } from "react";
import { usePage, Link } from "@inertiajs/react";

import search from "../../../../assets/vendors/dashboard/searchIcon.svg";
import settings from "../../../../assets/vendors/dashboard/settings.svg";
import bell from "../../../../assets/vendors/dashboard/bell.svg";
import proPic from "../../../../assets/vendors/dashboard/proPic.svg";
import logOutLogo from "../../../../assets/vendors/dashboard/logOutLogo.svg";

import upArrow from "../../../../assets/vendors/dashboard/icons/upArrow.svg";

import icon1 from "../../../../assets/vendors/booking/icons/icon1.svg";
import icon2 from "../../../../assets/vendors/booking/icons/icon2.svg";
import icon3 from "../../../../assets/vendors/booking/icons/icon3.svg";
import icon4 from "../../../../assets/vendors/booking/icons/icon4.svg";

import filterIcon from "../../../../assets/vendors/dashboard/icons/filterIcon.svg";
import miniSearchIcon from "../../../../assets/vendors/dashboard/icons/miniSearchIcon.svg";
import miniDownArrow from "../../../../assets/vendors/dashboard/icons/miniDownArrow.svg";

import CarBookingTableTwo from "../../../../components/vendors/courierService/bookings/CarBookingTableTwo";
import BookingBarChart from "./BookingBarChart";
import ServiceNavBar from "../../../../../../Components/vendors/ServiceNavBar";

import { ChevronDown, Settings as SettingsIcon } from "lucide-react";

import UserDropdown from "../../UserDropdown";

const BookingContent = () => {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isVerified = user?.status === 'verified' || user?.status === 'Verified';   

    const paymentStatusColors = {
        Paid: { color: "#3B8F314D", bg: "#ACE19957" },
        Pending: { color: "#FF6060", bg: "#FF60608C" },
    };

    const statusColors = {
        Ongoing: { bg: "#FFCD29", text: "#000000" },
        Returned: { bg: "transparent", text: "#FFCD29" },
        Scheduled: { bg: "#D9D9D957", text: "#000000" },
        Delivered: { bg: "#D8E4F2", text: "#000000" },
    };

    const [bookings, setBookings] = useState([
        {
            id: "D-OR1001",
            bookingDate: "Aug 28, 2025",
            recipient: "Alice Johnson",
            serviceType: "Express Delivery",
            packageBadge: "2 kg",
            route: "Colombo to Kandy",
            slotDate: "Aug 29, 2025",
            slotTime: "10:30 AM",
            payment: "$12.50",
            paymentStatus: "Paid",
            paymentStatusColor: paymentStatusColors.Paid.color,
            paymentStatusBg: paymentStatusColors.Paid.bg,
            status: "Ongoing",
            statusBg: statusColors.Ongoing.bg,
            statusText: statusColors.Ongoing.text,
        },
        {
            id: "D-OR1002",
            bookingDate: "Aug 28, 2025",
            recipient: "Bob Smith",
            serviceType: "Standard Delivery",
            packageBadge: "Fragile",
            route: "Galle to Colombo",
            slotDate: "Aug 30, 2025",
            slotTime: "02:15 PM",
            payment: "$7.90",
            paymentStatus: "Pending",
            paymentStatusColor: paymentStatusColors.Pending.color,
            paymentStatusBg: paymentStatusColors.Pending.bg,
            status: "Scheduled",
            statusBg: statusColors.Scheduled.bg,
            statusText: statusColors.Scheduled.text,
        },
        {
            id: "D-OR1003",
            bookingDate: "Aug 27, 2025",
            recipient: "Steve Gibson",
            serviceType: "Same Day",
            packageBadge: "3 kg",
            route: "Negombo to Colombo",
            slotDate: "Aug 27, 2025",
            slotTime: "04:45 PM",
            payment: "$9.20",
            paymentStatus: "Paid",
            paymentStatusColor: paymentStatusColors.Paid.color,
            paymentStatusBg: paymentStatusColors.Paid.bg,
            status: "Returned",
            statusBg: statusColors.Returned.bg,
            statusText: statusColors.Returned.text,
        },
        {
            id: "D-OR1004",
            bookingDate: "Aug 26, 2025",
            recipient: "Nimal Perera",
            serviceType: "International",
            packageBadge: "Docs",
            route: "Colombo to Chennai",
            slotDate: "Aug 31, 2025",
            slotTime: "09:00 AM",
            payment: "$38.00",
            paymentStatus: "Paid",
            paymentStatusColor: paymentStatusColors.Paid.color,
            paymentStatusBg: paymentStatusColors.Paid.bg,
            status: "Ongoing",
            statusBg: statusColors.Ongoing.bg,
            statusText: statusColors.Ongoing.text,
        },
        {
            id: "D-OR1005",
            bookingDate: "Aug 25, 2025",
            recipient: "Chamari Silva",
            serviceType: "Economy",
            packageBadge: "1.2 kg",
            route: "Matara to Galle",
            slotDate: "Aug 29, 2025",
            slotTime: "11:15 AM",
            payment: "$5.40",
            paymentStatus: "Paid",
            paymentStatusColor: paymentStatusColors.Paid.color,
            paymentStatusBg: paymentStatusColors.Paid.bg,
            status: "Delivered",
            statusBg: statusColors.Delivered.bg,
            statusText: statusColors.Delivered.text,
        },
    ]);

    const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
    const [newBooking, setNewBooking] = useState({
        id: "",
        bookingDate: "",
        recipient: "",
        serviceType: "",
        packageBadge: "",
        route: "",
        slotDate: "",
        slotTime: "",
        payment: "",
        paymentStatus: "Pending",
        status: "Ongoing",
    });

    // Handle input changes for the form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewBooking((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission to add new booking
    const handleAddBooking = () => {
        const newBookingEntry = {
            ...newBooking,
            paymentStatusColor:
                paymentStatusColors[newBooking.paymentStatus]?.color ||
                "#FF6060",
            paymentStatusBg:
                paymentStatusColors[newBooking.paymentStatus]?.bg ||
                "#FF60608C",
            statusBg: statusColors[newBooking.status]?.bg || "#FFCD29",
            statusText: statusColors[newBooking.status]?.text || "#000000",
        };

        setBookings((prev) => [...prev, newBookingEntry]);
        setIsAddPopupOpen(false);
        setNewBooking({
            id: "",
            bookingDate: "",
            recipient: "",
            serviceType: "",
            packageBadge: "",
            route: "",
            slotDate: "",
            slotTime: "",
            payment: "",
            paymentStatus: "Pending",
            status: "Ongoing",
        });
    };

    return (
        <>
        <div className="sticky top-0 z-30">
            <ServiceNavBar 
                isVerified={isVerified}
                settingsRoute={route("settingsPage")}
            />        </div>
        <div className="w-full max-w-full px-4 sm:px-6 lg:px-8 xl:pr-8 xl:pl-6 pt-6 pb-12">
            {/* Header section */}
            <div className="flex flex-row gap-5 justify-between items-center mb-6">
                <h1 className="figtree text-[35px] font-[700]">
                    Courier Service Bookings
                </h1>
                {/* <div className="flex flex-row gap-5 relative items-center">
                    <UserDropdown />
                </div> */}
            </div>
            {/* end of header section */}

            {/* Mini Cards + Chart */}
            <div className="flex flex-row gap-10 justify-between w-full">
                <div className="flex flex-col gap-8 w-full">
                    {/* Card 1 */}
                    <div
                        className="w-full h-auto bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <div className="flex flex-row gap-5 justify-center items-center">
                            <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                <img src={icon1} alt="Upcoming Bookings" />
                            </div>
                            <div>
                                <h1 className="text-[16px] font-[500] text-[#7B7B7A] text-nowrap">
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
                                <h1>+2.86%</h1>
                            </div>
                            <h1 className="text-[#7B7B7A]">from last week</h1>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div
                        className="w-full min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <div className="flex flex-row gap-5 justify-center items-center">
                            <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                <img src={icon2} alt="Pending Bookings" />
                            </div>
                            <div>
                                <h1 className="text-[16px] font-[500] text-[#7B7B7A] text-nowrap">
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
                                <h1>+2.86%</h1>
                            </div>
                            <h1 className="text-[#7B7B7A]">from last week</h1>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div
                        className="w-full min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <div className="flex flex-row gap-5 justify-center items-center">
                            <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                <img src={icon3} alt="Cancelled Bookings" />
                            </div>
                            <div>
                                <h1 className="text-[16px] font-[500] text-[#7B7B7A] text-nowrap">
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
                                <h1>+2.86%</h1>
                            </div>
                            <h1 className="text-[#7B7B7A]">from last week</h1>
                        </div>
                    </div>

                    {/* Card 4 */}
                    <div
                        className="w-full min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <div className="flex flex-row gap-5 justify-center items-center">
                            <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                <img src={icon4} alt="Completed Bookings" />
                            </div>
                            <div>
                                <h1 className="text-[16px] font-[500] text-[#7B7B7A] text-nowrap">
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
                                <h1>+2.86%</h1>
                            </div>
                            <h1 className="text-[#7B7B7A]">from last week</h1>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div
                    className="min-w-[712px] w-full min-h-[437px] bg-[#FFFFFF] rounded-[10px] flex items-center justify-center"
                    style={{ boxShadow: "4px 4px 4px #0000001A" }}
                >
                    <BookingBarChart />
                </div>
            </div>

            {/* Table Section */}
            <div
                className="w-full h-auto bg-[#FFFFFF] rounded-[10px] py-10 px-10"
                style={{ boxShadow: "4px 4px 4px #0000001A" }}
            >
                <div className="flex flex-row justify-between">
                    <h1 className="text-[24px] font-[700]">Courier Bookings</h1>
                    <div className="flex flex-row gap-5">
                        <div className="w-[253px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row justify-center items-center py-2 px-5">
                            <img src={miniSearchIcon} alt="Search" />
                            <input
                                type="text"
                                className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC]"
                                placeholder="Search recipient, service, route..."
                            />
                        </div>
                        <div className="w-[139px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
                            <img
                                src={filterIcon}
                                className="size-[12px]"
                                alt="Filter"
                            />
                            <h1 className="text-[14px] font-[500] text-[#7B7B7ACC]">
                                Service type
                            </h1>
                            <img src={miniDownArrow} alt="Dropdown" />
                        </div>
                        <div className="w-[125px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
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
                            className="w-[125px] h-[35px] bg-[#0955AC] text-[14px] rounded-[6px] text-[#FFFFFF] font-[700]"
                            onClick={() => setIsAddPopupOpen(true)}
                        >
                            Add Booking
                        </button>
                    </div>
                </div>

                {/* Add Booking Popup */}
                {isAddPopupOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 poppins">
                        <div className="bg-white p-10 rounded-[10px] w-[600px] shadow-lg">
                            <h2 className="text-[18px] font-[700] mb-4">
                                Add New Booking
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="mb-4">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        Order ID
                                    </label>
                                    <input
                                        type="text"
                                        name="id"
                                        value={newBooking.id}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                        placeholder="e.g. D-OR1006"
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
                                        placeholder="e.g. Aug 29, 2025"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        Recipient
                                    </label>
                                    <input
                                        type="text"
                                        name="recipient"
                                        value={newBooking.recipient}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        Service Type
                                    </label>
                                    <input
                                        type="text"
                                        name="serviceType"
                                        value={newBooking.serviceType}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                        placeholder="e.g. Express Delivery"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        Package Badge
                                    </label>
                                    <input
                                        type="text"
                                        name="packageBadge"
                                        value={newBooking.packageBadge}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                        placeholder="e.g. 2 kg / Fragile / Docs"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        Route
                                    </label>
                                    <input
                                        type="text"
                                        name="route"
                                        value={newBooking.route}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                        placeholder="e.g. Colombo to Kandy"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        Slot Date
                                    </label>
                                    <input
                                        type="text"
                                        name="slotDate"
                                        value={newBooking.slotDate}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                        placeholder="e.g. Aug 30, 2025"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        Slot Time
                                    </label>
                                    <input
                                        type="text"
                                        name="slotTime"
                                        value={newBooking.slotTime}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                        placeholder="e.g. 10:30 AM"
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
                                        placeholder="e.g. $12.50"
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
                                        <option value="Scheduled">
                                            Scheduled
                                        </option>
                                        <option value="Delivered">
                                            Delivered
                                        </option>
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
                />
            </div>
        </div>
        </>
    );
};

export default BookingContent;
