import React, { useState, useEffect } from "react";
import WarehouseBookingService from "../../../../../../services/WarehouseBookingService";

import search from "../../../../assets/vendors/dashboard/searchIcon.svg";
import settings from "../../../../assets/vendors/dashboard/settings.svg";
import bell from "../../../../assets/vendors/dashboard/bell.svg";
import proPic from "../../../../assets/vendors/dashboard/proPic.svg";

import upArrow from "../../../../assets/vendors/dashboard/icons/upArrow.svg";

import icon1 from "../../../../assets/vendors/booking/icons/icon1.svg";
import icon2 from "../../../../assets/vendors/booking/icons/icon2.svg";
import icon3 from "../../../../assets/vendors/booking/icons/icon3.svg";
import icon4 from "../../../../assets/vendors/booking/icons/icon4.svg";

import filterIcon from "../../../../assets/vendors/dashboard/icons/filterIcon.svg";
import miniSearchIcon from "../../../../assets/vendors/dashboard/icons/miniSearchIcon.svg";
import miniDownArrow from "../../../../assets/vendors/dashboard/icons/miniDownArrow.svg";

import WarehouseBookingTable from "./WarehouseBookingTable";
import BookingBarChart from "./BookingBarChart";


const BookingContent = () => {
    const paymentStatusColors = {
        Paid: { color: "#3B8F31", bg: "#ACE199" }, // Solid colors for Paid
        Pending: { color: "#FF60608C", bg: "#FF60608C" }, // Solid colors for Pending
    };

    const statusColors = {
        Ongoing: { bg: "#FFCD29", text: "#000000" }, // Yellow background, black text
        Returned: { bg: "#3B8F31", text: "#FFCD29" }, // Dark green background, yellow text
    };

    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState({
        upcoming_bookings: 0,
        pending_bookings: 0,
        cancelled_bookings: 0,
        completed_bookings: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: "",
        warehouseType: "",
        status: "",
    });
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch bookings and stats from API
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [bookingsResponse, statsResponse] = await Promise.all([
                    WarehouseBookingService.getBookings({ page: 1, per_page: 10 }),
                    WarehouseBookingService.getBookingStats(),
                ]);

                if (!isMounted) {
                    return;
                }

                if (bookingsResponse?.success) {
                    const formattedBookings = (bookingsResponse.data || []).map((booking) =>
                        WarehouseBookingService.formatBookingForDisplay(booking)
                    );
                    setBookings(formattedBookings);
                } else {
                    setBookings([]);
                    setError((prev) => prev ?? bookingsResponse?.message ?? "Failed to load bookings");
                }

                if (statsResponse?.success) {
                    setStats({
                        upcoming_bookings: statsResponse.data?.upcoming_bookings ?? 0,
                        pending_bookings: statsResponse.data?.pending_bookings ?? 0,
                        cancelled_bookings: statsResponse.data?.cancelled_bookings ?? 0,
                        completed_bookings: statsResponse.data?.completed_bookings ?? 0,
                    });
                } else {
                    setStats({
                        upcoming_bookings: 0,
                        pending_bookings: 0,
                        cancelled_bookings: 0,
                        completed_bookings: 0,
                    });
                    setError((prev) => prev ?? statsResponse?.message ?? "Failed to load booking statistics");
                }
            } catch (error) {
                if (!isMounted) {
                    return;
                }
                console.error('Error loading data:', error);
                setError('Failed to load booking data');
                setBookings([]);
                setStats({
                    upcoming_bookings: 0,
                    pending_bookings: 0,
                    cancelled_bookings: 0,
                    completed_bookings: 0,
                });
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    const [isAddPopupOpen, setIsAddPopupOpen] = useState(false);
    const [newBooking, setNewBooking] = useState({
        id: "",
        bookingDate: "",
        clientName: "",
        warehouseName: "",
        warehouseUnit: "",
        purpose: "",
        specialRequirements: "",
        durationUnit: "months",
        durationValue: "",
        quantity: "",
        startDate: "",
        endDate: "",
        totalPrice: "",
        paymentStatus: "Pending",
        status: "active",
        notes: "",
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
                paymentStatusColors[newBooking.paymentStatus]?.bg || "#FF6060",
            statusBg: statusColors[newBooking.status]?.bg || "#FFCD29",
            statusText: statusColors[newBooking.status]?.text || "#000000",
        };

        setBookings((prev) => [...prev, newBookingEntry]);
        setIsAddPopupOpen(false);
        setNewBooking({
            id: "",
            bookingDate: "",
            clientName: "",
            warehouseName: "",
            warehouseUnit: "",
            purpose: "",
            specialRequirements: "",
            durationUnit: "months",
            durationValue: "",
            quantity: "",
            startDate: "",
            endDate: "",
            totalPrice: "",
            paymentStatus: "Pending",
            status: "active",
            notes: "",
        });
    };

    const warehouseTypeOptions = [
        { value: "", label: "All warehouse types" },
        { value: "cold_storage", label: "Cold Storage" },
        { value: "dry_storage", label: "Dry Storage" },
        { value: "hazardous_material", label: "Hazardous Material" },
        { value: "bonded", label: "Bonded" },
    ];

    const statusOptions = [
        { value: "", label: "All statuses" },
        { value: "pending", label: "Pending" },
        { value: "confirmed", label: "Confirmed" },
        { value: "active", label: "Active" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
    ];

    useEffect(() => {
        const handler = setTimeout(() => {
            setFilters((prev) =>
                prev.search === searchTerm ? prev : { ...prev, search: searchTerm }
            );
        }, 300);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    const handleWarehouseTypeChange = (event) => {
        const { value } = event.target;
        setFilters((prev) => (
            prev.warehouseType === value ? prev : { ...prev, warehouseType: value }
        ));
    };

    const handleStatusChange = (event) => {
        const { value } = event.target;
        setFilters((prev) => (prev.status === value ? prev : { ...prev, status: value }));
    };

    return (
        <div className="w-full h-auto pr-5 py-10">
            {/* Header section */}
            <div className="flex flex-row gap-5 justify-between items-center">
                <h1 className="figtree text-[35px] font-[700]">Warehouse Bookings</h1>
                <div className="flex flex-row gap-5">
                    <div className="size-[60px] rounded-[10px] bg-[#E8E8EF] flex justify-center items-center">
                        <img src={search} alt="Search" />
                    </div>
                    <div className="size-[60px] rounded-[10px] bg-[#E8E8EF] flex justify-center items-center">
                        <img src={settings} alt="Settings" />
                    </div>
                    <div className="size-[60px] rounded-[10px] bg-[#E8E8EF] flex justify-center items-center">
                        <img src={bell} alt="Notifications" />
                    </div>
                    <div className="size-[60px] rounded-[10px] bg-[#E8E8EF] flex justify-center items-center">
                        <img src={proPic} alt="Profile" />
                    </div>

                    <div className="figtree flex flex-col justify-center items-start">
                        <h1 className="text-[20px] font-[700]">Steve Gibson</h1>
                        <h1 className="text-[16px] font-[600] text-[#7B7B7A]">
                            Vendor
                        </h1>
                    </div>
                </div>
            </div>
            {/* end of header section */}

            <div className="flex flex-row gap-10 justify-between py-20 w-full">
                {/* mini left */}
                <div className="flex flex-col gap-8 w-full">
                    {/* card 1 */}
                    <div
                        className="w-full h-auto bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                        style={{
                            boxShadow: "4px 4px 4px #0000001A",
                        }}
                    >
                        <div className="flex flex-row gap-5 justify-center items-center">
                            <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                <img src={icon1} alt="Upcoming Bookings" />
                            </div>
                            <div>
                                <h1 className="text-[16px] font-[500] text-[#7B7B7A] text-nowrap">
                                    Upcoming Bookings
                                </h1>
                                <h1 className="text-[26px] font-[700]">{stats.upcoming_bookings || 0}</h1>
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
                        className="w-full min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                        style={{
                            boxShadow: "4px 4px 4px #0000001A",
                        }}
                    >
                        <div className="flex flex-row gap-5 justify-center items-center">
                            <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                <img src={icon2} alt="Pending Bookings" />
                            </div>
                            <div>
                                <h1 className="text-[16px] font-[500] text-[#7B7B7A] text-nowrap">
                                    Pending Bookings
                                </h1>
                                <h1 className="text-[26px] font-[700]">{stats.pending_bookings || 0}</h1>
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
                        className="w-full min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                        style={{
                            boxShadow: "4px 4px 4px #0000001A",
                        }}
                    >
                        <div className="flex flex-row gap-5 justify-center items-center">
                            <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                <img src={icon3} alt="Cancelled Bookings" />
                            </div>
                            <div>
                                <h1 className="text-[16px] font-[500] text-[#7B7B7A] text-nowrap">
                                    Cancelled Bookings
                                </h1>
                                <h1 className="text-[26px] font-[700]">{stats.cancelled_bookings || 0}</h1>
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
                        className="w-full min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                        style={{
                            boxShadow: "4px 4px 4px #0000001A",
                        }}
                    >
                        <div className="flex flex-row gap-5 justify-center items-center">
                            <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                <img src={icon4} alt="Completed Bookings" />
                            </div>
                            <div>
                                <h1 className="text-[16px] font-[500] text-[#7B7B7A] text-nowrap">
                                    Completed Bookings
                                </h1>
                                <h1 className="text-[26px] font-[700]">{stats.completed_bookings || 0}</h1>
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
                    className="min-w-[712px] w-full min-h-[437px] bg-[#FFFFFF] rounded-[10px] flex items-center justify-center"
                    style={{ boxShadow: "4px 4px 4px #0000001A" }}
                >
                    <BookingBarChart />
                </div>
            </div>

            {/* car booking section */}
            <div
                className="w-full h-auto bg-[#FFFFFF] rounded-[10px] py-10 px-10"
                style={{ boxShadow: "4px 4px 4px #0000001A" }}
            >
                <div className="flex flex-row justify-between">
                    <h1 className="text-[24px] font-[700]">Warehouse Booking</h1>
                    <div className="flex flex-row gap-5">
                        <div className="w-[253px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row justify-center items-center py-2 px-5">
                            <img src={miniSearchIcon} alt="Search" />
                            <input
                                type="text"
                                className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC]"
                                placeholder="Search client, warehouse, purpose..."
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                            />
                        </div>
                        <div className="relative w-[139px] h-[35px]">
                            <select
                                className="w-full h-full bg-[#F3F3F3] rounded-[6px] py-2 pl-9 pr-8 text-[14px] font-[500] text-[#7B7B7ACC] appearance-none focus:outline-none focus:ring-2 focus:ring-[#0955AC]"
                                value={filters.warehouseType}
                                onChange={handleWarehouseTypeChange}
                            >
                                {warehouseTypeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <img
                                src={filterIcon}
                                className="absolute left-3 top-1/2 -translate-y-1/2 size-[12px]"
                                alt="Filter"
                            />
                            {/* <img
                                src={miniDownArrow}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                alt="Dropdown"
                            /> */}
                        </div>
                        <div className="relative w-[125px] h-[35px]">
                            <select
                                className="w-full h-full bg-[#F3F3F3] rounded-[6px] py-2 pl-9 pr-8 text-[14px] font-[500] text-[#7B7B7ACC] appearance-none focus:outline-none focus:ring-2 focus:ring-[#0955AC]"
                                value={filters.status}
                                onChange={handleStatusChange}
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <img
                                src={filterIcon}
                                className="absolute left-3 top-1/2 -translate-y-1/2 size-[12px]"
                                alt="Filter"
                            />
                            {/* <img
                                src={miniDownArrow}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                alt="Dropdown"
                            /> */}
                        </div>
                        {/* <button
                            className="w-[125px] h-[35px] bg-[#0955AC] text-[14px] rounded-[6px] text-[#FFFFFF] font-[700]"
                            onClick={() => setIsAddPopupOpen(true)}
                        >
                            Add Booking
                        </button> */}
                    </div>
                </div>

                {/* Add Booking Popup */}
                {isAddPopupOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 poppins">
                        <div className="bg-white p-10 rounded-[10px] w-[800px] max-h-[80vh] overflow-y-auto shadow-lg">
                            <h2 className="text-[18px] font-[700] mb-4">
                                Add New Warehouse Booking
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
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
                                        placeholder="e.g. WB-001"
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
                                        Warehouse Name
                                    </label>
                                    <input
                                        type="text"
                                        name="warehouseName"
                                        value={newBooking.warehouseName}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                        placeholder="e.g. Central Cold Storage A"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        Warehouse Unit
                                    </label>
                                    <input
                                        type="text"
                                        name="warehouseUnit"
                                        value={newBooking.warehouseUnit}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                        placeholder="e.g. WH-A12"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        Purpose
                                    </label>
                                    <input
                                        type="text"
                                        name="purpose"
                                        value={newBooking.purpose}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                        placeholder="e.g. Food Storage"
                                    />
                                </div>
                                <div className="mb-4 col-span-2">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        Special Requirements
                                    </label>
                                    <textarea
                                        name="specialRequirements"
                                        value={newBooking.specialRequirements}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                        placeholder="e.g. Temperature -18°C, 24/7 access"
                                        rows="2"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        Duration Unit
                                    </label>
                                    <select
                                        name="durationUnit"
                                        value={newBooking.durationUnit}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                    >
                                        <option value="days">Days</option>
                                        <option value="weeks">Weeks</option>
                                        <option value="months">Months</option>
                                        <option value="years">Years</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        Duration Value
                                    </label>
                                    <input
                                        type="number"
                                        name="durationValue"
                                        value={newBooking.durationValue}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                        placeholder="e.g. 3"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={newBooking.quantity}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                        placeholder="e.g. 50"
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
                                        placeholder="e.g. August 10, 2025"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        Total Price
                                    </label>
                                    <input
                                        type="text"
                                        name="totalPrice"
                                        value={newBooking.totalPrice}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                        placeholder="e.g. $1200"
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
                                        <option value="active">Active</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div className="mb-4 col-span-2">
                                    <label className="block text-[14px] font-[500] mb-1">
                                        Notes
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={newBooking.notes}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                        placeholder="Additional notes or special instructions"
                                        rows="2"
                                    />
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

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-[18px] text-gray-600">Loading bookings...</div>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="mb-6 text-center text-[16px] text-red-600">{error}</div>
                        )}
                        <WarehouseBookingTable
                            bookings={bookings}
                            setBookings={setBookings}
                            statusColors={statusColors} // Pass statusColors as a prop
                            filters={filters}
                        />
                    </>
                )}
            </div>
            {/* end */}
        </div>
    );
};

export default BookingContent;
