import React, { useState, useEffect } from "react";
import { usePage, Link } from "@inertiajs/react";
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import UserDropdown from "../../../components/vendors/UserDropdown";
import UnverifiedBanner from "./UnverifiedBanner";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const BookingCalendar = ({
    allBookings = [],
    statistics = {}
}) => {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isVerified = user?.vendor_status === 'verified' || user?.is_verified;

    // Dummy data for unverified vendors
    const dummyBookings = [
        {
            id: 1,
            booking_code: "BK-001",
            booking_type: "vehicle",
            customer_name: "John Doe",
            service_name: "Vehicle Rental",
            total_amount: 5000,
            status: "Confirmed",
            booking_date: "2025-02-20"
        },
        {
            id: 2,
            booking_code: "BK-002",
            booking_type: "flight",
            customer_name: "Jane Smith",
            service_name: "Ticket Booking",
            total_amount: 15000,
            status: "Paid",
            booking_date: "2025-02-19"
        },
        {
            id: 3,
            booking_code: "BK-003",
            booking_type: "vehicle",
            customer_name: "Ahmed Khan",
            service_name: "Warehouse Rental",
            total_amount: 8500,
            status: "Pending",
            booking_date: "2025-02-18"
        },
        {
            id: 4,
            booking_code: "BK-004",
            booking_type: "flight",
            customer_name: "Sara Williams",
            service_name: "Courier Service",
            total_amount: 3200,
            status: "Completed",
            booking_date: "2025-02-17"
        },
        {
            id: 5,
            booking_code: "BK-005",
            booking_type: "vehicle",
            customer_name: "Mike Johnson",
            service_name: "Freight Rental",
            total_amount: 12000,
            status: "Confirmed",
            booking_date: "2025-02-16"
        },
        {
            id: 6,
            booking_code: "BK-006",
            booking_type: "vehicle",
            customer_name: "Lisa Anderson",
            service_name: "Vehicle Rental",
            total_amount: 7800,
            status: "Confirmed",
            booking_date: "2025-02-21"
        },
        {
            id: 7,
            booking_code: "BK-007",
            booking_type: "flight",
            customer_name: "David Brown",
            service_name: "Courier Service",
            total_amount: 4500,
            status: "Pending",
            booking_date: "2025-02-22"
        }
    ];

    // Use dummy data if unverified, real data if verified
    const displayBookings = isVerified ? allBookings : dummyBookings;

    const [selectedEvent, setSelectedEvent] = useState(null);

    // Convert bookings to calendar events
    const calendarEvents = (displayBookings || []).map(booking => ({
        id: booking.id,
        title: `${booking.booking_code} - ${booking.customer_name}`,
        start: new Date(booking.booking_date),
        end: new Date(booking.booking_date),
        resource: booking,
    }));

    const handleSelectEvent = (event) => {
        setSelectedEvent(event.resource);
    };

    const handleSelectSlot = () => {
        setSelectedEvent(null);
    };

    return (
        <div className="w-full max-w-full lg:pr-5 px-5 lg:px-0 py-10">
            <style>{`
                .rbc-calendar {
                    font-family: inherit;
                }
                .rbc-header {
                    padding: 12px 8px;
                    background-color: #f3f4f6;
                    border: 1px solid #e5e7eb;
                    font-weight: 600;
                    color: #1f2937;
                }
                .rbc-today {
                    background-color: #eff6ff;
                }
                .rbc-event {
                    background-color: #0955ac;
                    border-radius: 4px;
                    padding: 2px 5px;
                    color: white;
                    cursor: pointer;
                }
                .rbc-event:hover {
                    background-color: #073a7d;
                }
                .rbc-toolbar button {
                    padding: 6px 12px;
                    margin: 4px;
                    border: 1px solid #d1d5db;
                    background-color: white;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                }
                .rbc-toolbar button:hover {
                    background-color: #0955ac;
                    color: white;
                }
                .rbc-toolbar button.rbc-active {
                    background-color: #0955ac;
                    color: white;
                }
                .rbc-cell {
                    padding: 8px 4px;
                }
                .rbc-day-bg {
                    border: 1px solid #e5e7eb;
                }
                .rbc-time-slot {
                    border: 1px solid #f0f0f0;
                }
                .rbc-month-view {
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    overflow: hidden;
                }
                .rbc-toolbar {
                    padding: 10px;
                    background-color: #f9fafb;
                    border-bottom: 1px solid #e5e7eb;
                    flex-wrap: wrap;
                }
                .rbc-toolbar label {
                    font-weight: 600;
                    color: #1f2937;
                }
                .rbc-off-range {
                    background-color: #f9fafb;
                }
            `}</style>

            {/* Header section */}
            <div className="flex xl:flex-row flex-col gap-5 justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => window.history.back()}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Go Back"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="figtree text-[35px] sm:text-[28px] font-[700]">
                        Booking Calendar
                    </h1>
                </div>
                <div className="flex flex-row gap-5 relative items-center">
                    <UserDropdown
                        settingsRoute={route("settingsPage")}
                    />
                </div>
            </div>

            {/* Unverified Warning */}
            <UnverifiedBanner />

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Calendar Section */}
                <div className="flex-1 min-h-[calc(100vh-200px)]">
                    <div
                        className="w-full h-full bg-[#FFFFFF] rounded-[10px] p-6"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        <BigCalendar
                            localizer={localizer}
                            events={calendarEvents}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: 'calc(100vh - 300px)', minHeight: '600px' }}
                            popup
                            selectable
                            onSelectEvent={handleSelectEvent}
                            onSelectSlot={handleSelectSlot}
                            eventPropGetter={() => ({
                                style: {
                                    backgroundColor: '#0955AC',
                                    borderRadius: '5px',
                                    opacity: 0.9,
                                    color: 'white',
                                    border: '0px',
                                    display: 'block'
                                }
                            })}
                        />
                    </div>
                </div>

                {/* Event Details Sidebar */}
                <div className="w-full lg:w-[350px] flex-shrink-0">
                    <div
                        className="w-full bg-[#FFFFFF] rounded-[10px] p-6 sticky top-20"
                        style={{ boxShadow: "4px 4px 4px #0000001A" }}
                    >
                        {selectedEvent ? (
                            <div className="space-y-4">
                                <h2 className="text-[20px] font-[700] text-gray-900">
                                    Booking Details
                                </h2>
                                <div className="space-y-3 border-t pt-4">
                                    <div>
                                        <p className="text-[12px] font-[600] text-gray-500 uppercase">
                                            Booking Code
                                        </p>
                                        <p className="text-[16px] font-[600] text-gray-900">
                                            {selectedEvent.booking_code}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[12px] font-[600] text-gray-500 uppercase">
                                            Customer Name
                                        </p>
                                        <p className="text-[16px] font-[600] text-gray-900">
                                            {selectedEvent.customer_name}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[12px] font-[600] text-gray-500 uppercase">
                                            Service
                                        </p>
                                        <p className="text-[16px] font-[600] text-gray-900">
                                            {selectedEvent.service_name}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[12px] font-[600] text-gray-500 uppercase">
                                            Booking Type
                                        </p>
                                        <p className="text-[16px] font-[600] text-gray-900 capitalize">
                                            {selectedEvent.booking_type}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[12px] font-[600] text-gray-500 uppercase">
                                            Amount
                                        </p>
                                        <p className="text-[16px] font-[700] text-[#0955AC]">
                                            Rs. {(selectedEvent.total_amount || 0).toLocaleString()}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[12px] font-[600] text-gray-500 uppercase">
                                            Status
                                        </p>
                                        <span 
                                            className="inline-block px-3 py-1 rounded-[5px] font-[500] text-[14px] mt-1"
                                            style={{
                                                backgroundColor: getStatusColor(selectedEvent.status).bg,
                                                color: getStatusColor(selectedEvent.status).text,
                                                border: `1px solid ${getStatusColor(selectedEvent.status).border}`
                                            }}
                                        >
                                            {selectedEvent.status}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-[12px] font-[600] text-gray-500 uppercase">
                                            Booking Date
                                        </p>
                                        <p className="text-[16px] font-[600] text-gray-900">
                                            {new Date(selectedEvent.booking_date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-[48px] mb-4">📅</div>
                                <h3 className="text-[18px] font-[600] text-gray-900 mb-2">
                                    Select a Booking
                                </h3>
                                <p className="text-[14px] text-gray-500">
                                    Click on any event in the calendar to view booking details
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard 
                    label="Total Bookings" 
                    value={calendarEvents.length}
                    icon="📊"
                />
                <StatCard 
                    label="Confirmed" 
                    value={displayBookings.filter(b => b.status === 'Confirmed').length}
                    icon="✅"
                />
                <StatCard 
                    label="Pending" 
                    value={displayBookings.filter(b => b.status === 'Pending').length}
                    icon="⏳"
                />
                <StatCard 
                    label="Completed" 
                    value={displayBookings.filter(b => b.status === 'Completed').length}
                    icon="🎉"
                />
            </div>
        </div>
    );
};

const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    const styles = {
        'confirmed': { bg: '#D8E4F2', text: '#000000', border: '#0000004D' },
        'paid': { bg: '#ACE19957', text: '#3B8F31', border: '#3B8F314D' },
        'pending': { bg: '#FFF7ED', text: '#EA580C', border: '#EA580C4D' },
        'completed': { bg: '#D1FAE5', text: '#059669', border: '#06B6D44D' },
        'cancelled': { bg: '#F87171', text: '#FFFFFF', border: '#B91C1C' },
        'active': { bg: '#E8F5E9', text: '#2E7D32', border: '#2E7D324D' }
    };
    return styles[statusLower] || styles['pending'];
};

const StatCard = ({ label, value, icon }) => (
    <div
        className="bg-[#FFFFFF] rounded-[8px] p-4 flex items-center gap-4"
        style={{ boxShadow: "4px 4px 4px #0000001A" }}
    >
        <div className="text-[32px]">{icon}</div>
        <div>
            <p className="text-[12px] font-[500] text-[#7B7B7A] uppercase">
                {label}
            </p>
            <p className="text-[24px] font-[700] text-gray-900">
                {value}
            </p>
        </div>
    </div>
);

export default BookingCalendar;
