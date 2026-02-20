import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { router } from "@inertiajs/react";
import {
  Plane,
  TrainFront,
  Bus,
  Calendar,
  MapPin,
  Search,
  Filter,
  Plus,
  Download,
  ChevronRight,
  Star,
  CreditCard,
  Clock,
  Ticket,
  XCircle,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  X,
  Info,
  FileText,
  File,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const ModeIcon = ({ mode, className }) => {
  if (mode === "flight") return <Plane className={className} />;
  if (mode === "train") return <TrainFront className={className} />;
  return <Bus className={className} />;
};

const statusMap = {
  confirmed: { label: "Confirmed", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  paid: { label: "Paid", tone: "bg-blue-50 text-blue-700 border-blue-200" },
  pending: { label: "Pending", tone: "bg-amber-50 text-amber-700 border-amber-200" },
  cancelled: { label: "Cancelled", tone: "bg-rose-50 text-rose-700 border-rose-200" },
};

const Hero = ({ bookings = [], monthlyData = [] }) => {
  const [mode, setMode] = useState("all");
  const [q, setQ] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [policyDetails, setPolicyDetails] = useState(null);
  const [statusFilterMain, setStatusFilterMain] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const modeMatch = mode === "all" || b.mode === mode;
      const searchMatch = !q || 
        b.name?.toLowerCase().includes(q.toLowerCase()) ||
        b.reference?.toLowerCase().includes(q.toLowerCase()) ||
        b.from?.toLowerCase().includes(q.toLowerCase()) ||
        b.to?.toLowerCase().includes(q.toLowerCase());
      const statusMatch = statusFilterMain === "all" || b.status === statusFilterMain;
      
      let dateMatch = true;
      if (startDate || endDate) {
        const bookingDate = new Date(b.departure_date || b.booking_date);
        if (startDate) dateMatch = dateMatch && bookingDate >= new Date(startDate);
        if (endDate) dateMatch = dateMatch && bookingDate <= new Date(endDate);
      }
      
      return modeMatch && searchMatch && statusMatch && dateMatch;
    });
  }, [bookings, mode, q, statusFilterMain, startDate, endDate]);

  const handleClearFilters = () => {
    setQ("");
    setMode("all");
    setStatusFilterMain("all");
    setStartDate("");
    setEndDate("");
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleExportFormat = (format) => {
    console.log(`Exporting as ${format}`);
    alert(`Exporting bookings as ${format}`);
    setShowExportModal(false);
  };

  // Calculate KPI values
  const upcomingFlights = bookings.filter((r) => r.mode === "flight" && ["confirmed", "paid", "pending"].includes(r.status)).length;
  const trainSeatsReserved = bookings.filter((r) => r.mode === "train" && ["confirmed", "paid", "pending"].includes(r.status)).length;
  const busTicketsThisMonth = bookings.filter((r) => {
    if (r.mode !== "bus" || !["confirmed", "paid", "pending"].includes(r.status)) return false;
    const bookingDate = new Date(r.booking_date);
    const currentDate = new Date();
    return bookingDate.getMonth() === currentDate.getMonth() && bookingDate.getFullYear() === currentDate.getFullYear();
  }).length;

  const pieData = [
    { name: "Flight", value: monthlyData.reduce((a, b) => a + b.flight, 0) },
    { name: "Train", value: monthlyData.reduce((a, b) => a + b.train, 0) },
    { name: "Bus", value: monthlyData.reduce((a, b) => a + b.bus, 0) },
  ];

  const handleCancelClick = async (booking) => {
    setSelectedBooking(booking);
    setPolicyDetails(null);
    
    // Fetch cancellation policy for bus bookings
    if (booking.type === 'bus') {
      try {
        const response = await fetch(`/bus-bookings/${booking.reference}/cancellation-policy`, {
          headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
          }
        });
        const data = await response.json();
        if (data.success && data.can_cancel) {
          setPolicyDetails(data.refund_details);
        }
      } catch (error) {
        console.error('Failed to fetch cancellation policy:', error);
      }
    }
    
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    
    setCancelling(true);
    
    try {
      let url = '';
      if (selectedBooking.type === 'bus') {
        url = `/bus-bookings/${selectedBooking.reference}/cancel`;
      } else if (selectedBooking.type === 'train') {
        url = `/train-bookings/${selectedBooking.reference}/cancel`;
      } else if (selectedBooking.type === 'flight') {
        url = `/flight-bookings/${selectedBooking.reference}/cancel`;
      }
      
      console.log('Cancelling booking:', { url, reference: selectedBooking.reference, type: selectedBooking.type, reason: cancelReason });
      
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
      if (!csrfToken) {
        console.error('CSRF token not found');
        alert('Security token not found. Please refresh the page and try again.');
        setCancelling(false);
        return;
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          reason: cancelReason
        })
      });
      
      console.log('Response status:', response.status, response.statusText);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Server returned non-JSON response:', text.substring(0, 500));
        alert(`Server error (${response.status}). Please check if you're logged in and try again.`);
        setCancelling(false);
        return;
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        // Reload the page to show updated data
        router.reload();
        setShowCancelModal(false);
        setSelectedBooking(null);
        setCancelReason("");
      } else {
        alert(data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Cancellation failed:', error);
      alert('Failed to cancel booking. Please check the console and try again.');
    } finally {
      setCancelling(false);
    }
  };

  const canCancelBooking = (booking) => {
    // Only allow cancellation for confirmed/paid bookings that aren't already cancelled
    return booking.status !== 'cancelled' && ['confirmed', 'paid'].includes(booking.status);
  };

  return (
    <div className="min-h-screen w-full bg-[#E5E5E5] p-10 md:p-20 poppins">
      <div className="mx-auto max-w-[1300px]">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:mb-10 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight md:text-[35px]">
               <span className="text-[#0955AC]">Ticket Booking</span> {" "}Dashboard
            </h1>
            <p className="text-slate-600 text-[14px]">Manage your Flight • Train • Bus bookings.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-2 justify-center items-center">
            <button onClick={() => router.visit('/ticketBooking')} className="inline-flex items-center h-10 px-6 py-6 rounded-2xl border border-slate-200 text-[16px] font-medium">
              <Download className="mr-2 h-7 w-7" /> Export
            </button>
            <button className="inline-flex items-center h-10 px-6 py-6 rounded-2xl bg-[#0955AC] text-white text-[16px] font-medium">
              <Plus className="mr-2 h-6 w-6" /> New Booking
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="px-5 pt-5 pb-2">
              <p className="flex items-center gap-3 text-[#7B7B7A] text-[16px] font-[700]">
                <Plane className="h-8 w-8" /> Upcoming Flights
              </p>
              <h3 className="text-[26px] font-[700] text-[#0955AC]">{upcomingFlights}</h3>
            </div>
            <div className="px-5 pb-5 text-[12px] text-[#7B7B7A]">
              {upcomingFlights > 0 ? `${upcomingFlights} booking${upcomingFlights !== 1 ? 's' : ''}` : 'No upcoming flights'}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm">
            <div className="px-5 pt-5 pb-2">
              <p className="flex items-center gap-3 text-[#7B7B7A] text-[16px] font-[700]">
                <TrainFront className="h-8 w-8" /> Train Seats Reserved
              </p>
              <h3 className="text-[26px] font-[700] text-[#0955AC]">{trainSeatsReserved}</h3>
            </div>
            <div className="px-5 pb-5 text-[12px] text-[#7B7B7A]">
              {trainSeatsReserved > 0 ? `${trainSeatsReserved} seat${trainSeatsReserved !== 1 ? 's' : ''}` : 'No train bookings'}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm">
            <div className="px-5 pt-5 pb-2">
              <p className="flex items-center gap-3 text-[#7B7B7A] text-[16px] font-[700]">
                <Bus className="h-8 w-8" /> Bus Tickets This Month
              </p>
              <h3 className="text-[26px] font-[700] text-[#0955AC]">{busTicketsThisMonth}</h3>
            </div>
            <div className="px-5 pb-5 text-[12px] text-[#7B7B7A]">
              {busTicketsThisMonth > 0 ? `${busTicketsThisMonth} ticket${busTicketsThisMonth !== 1 ? 's' : ''}` : 'No bus tickets'}
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 bg-white rounded-2xl shadow-sm">
          <div className="px-6 py-6">
            {/* First Row - Action Buttons Only */}
            <div className="flex items-center justify-end gap-2 mb-4">
              <button 
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`inline-flex items-center h-12 px-4 rounded-xl text-[14px] font-medium transition whitespace-nowrap ${
                  showAdvancedFilters 
                    ? "bg-[#0955AC] text-white border-[#0955AC]" 
                    : "border border-slate-200 hover:bg-slate-50"
                }`}>
                <Filter className="mr-2 h-4 w-4" /> Filters
              </button>
              <button 
                onClick={() => setShowExportModal(true)}
                className="inline-flex items-center h-12 px-4 rounded-xl border border-slate-200 text-[14px] font-medium hover:bg-slate-50 transition whitespace-nowrap">
                <Download className="mr-2 h-4 w-4" /> Export
              </button>
              <button 
                onClick={handleRefresh}
                className="inline-flex items-center h-12 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {/* Second Row - Search + Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search bookings, reference numbers..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-[14px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent"
                />
              </div>

              {/* Service/Mode select */}
              <div>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="all">All Services</option>
                  <option value="flight">Flight</option>
                  <option value="train">Train</option>
                  <option value="bus">Bus</option>
                </select>
              </div>

              {/* Status select */}
              <div>
                <select
                  value={statusFilterMain}
                  onChange={(e) => setStatusFilterMain(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Sort select */}
              <div>
                <select
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="recent">Most Recent</option>
                  <option value="price">Price (Asc)</option>
                  <option value="date">Date (Asc)</option>
                </select>
              </div>
            </div>

            {/* Third Row - Date Filters (Collapsible) */}
            <AnimatePresence>
              {showAdvancedFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                    {/* Start Date */}
                    <div>
                      <label className="block text-[12px] text-slate-600 mb-1.5 font-medium">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent cursor-pointer"
                      />
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="block text-[12px] text-slate-600 mb-1.5 font-medium">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent cursor-pointer"
                      />
                    </div>

                    {/* Clear Filters Button */}
                    <div className="flex items-end">
                      <button
                        onClick={handleClearFilters}
                        className="h-12 w-full inline-flex items-center justify-center px-4 rounded-xl border border-slate-200 text-[14px] font-medium hover:bg-slate-50 transition"
                      >
                        <X className="mr-2 h-4 w-4" /> Clear Filters
                      </button>
                    </div>
                  </div>
                  
                  {/* Showing count */}
                  <div className="mt-4 flex items-center gap-2 text-[14px] text-slate-600">
                    <Info className="h-4 w-4" />
                    <span>Showing {filteredBookings.length} of {bookings.length} bookings</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="mt-8 rounded-2xl bg-white shadow-sm">
          <div className="px-10 pt-10 pb-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold leading-none tracking-tight text-[18px]">Your Bookings</h3>
                <p className="text-[14px] text-slate-500 mt-1">All your ticket bookings in one place</p>
              </div>
              <div className="hidden sm:block">
                <div className="rounded-2xl inline-flex gap-2">
                  {[
                    { val: "all", label: "All", icon: null },
                    { val: "flight", label: "Flight", icon: Plane },
                    { val: "train", label: "Train", icon: TrainFront },
                    { val: "bus", label: "Bus", icon: Bus },
                  ].map(({ val, label, icon: Icon }) => {
                    const active = mode === val;
                    return (
                      <button
                        key={val}
                        onClick={() => setMode(val)}
                        className={`px-6 py-2 rounded-xl border text-[12px] font-[600] transition ${
                          active ? "bg-[#0955AC] text-white border-[#0955AC]" : "border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          {Icon ? <Icon className="h-6 w-6" /> : null}
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="px-10 pb-10">
            <div className="overflow-x-auto">
              <table className="w-full table-auto text-[14px]">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3">Reference</th>
                    <th className="px-3 py-3">Route / Service</th>
                    <th className="px-3 py-3">From</th>
                    <th className="px-3 py-3">To</th>
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3 text-right">Amount</th>
                    <th className="px-3 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-3 py-10 text-center text-slate-500">
                        No bookings found. {mode !== "all" ? `Try changing the filter.` : `Book your first ticket to get started!`}
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((booking) => (
                      <tr key={`${booking.type}-${booking.id}`} className="border-b hover:bg-slate-50">
                        <td className="px-3 py-4">
                          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-slate-700 font-medium">
                            <ModeIcon mode={booking.mode} className="h-4 w-4" />
                            {booking.mode.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-3 py-4 font-mono text-sm text-slate-600">{booking.reference}</td>
                        <td className="px-3 py-4 font-medium">{booking.name}</td>
                        <td className="px-3 py-4 text-slate-600">{booking.from}</td>
                        <td className="px-3 py-4 text-slate-600">{booking.to}</td>
                        <td className="px-3 py-4 text-slate-600">{booking.departure_date || 'N/A'}</td>
                        <td className="px-3 py-4">
                          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusMap[booking.status]?.tone || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                            {statusMap[booking.status]?.label || booking.status}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-right font-semibold">LKR {Number(booking.total_price || 0).toFixed(2)}</td>
                        <td className="px-3 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* View and Download buttons for active bookings */}
                            {booking.status !== 'cancelled' && (
                              <>
                                {booking.type === 'bus' && (
                                  <>
                                    <button
                                      onClick={() => window.open(`/bus-ticket/view/${booking.reference}`, '_blank')}
                                      className="h-8 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
                                      title="View Ticket"
                                    >
                                      View
                                    </button>
                                    <button
                                      onClick={() => window.location.href = `/bus-ticket/download/${booking.reference}`}
                                      className="h-8 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
                                      title="Download Ticket"
                                    >
                                      <Download className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                                {booking.type === 'train' && (
                                  <button
                                    onClick={() => router.visit(`/train-booking-success/${booking.reference}`)}
                                    className="h-8 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
                                    title="View Booking Details"
                                  >
                                    View Details
                                  </button>
                                )}
                                {booking.type === 'flight' && (
                                  <button
                                    onClick={() => alert('Flight booking details: ' + booking.reference)}
                                    className="h-8 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
                                    title="View Booking Details"
                                  >
                                    View Details
                                  </button>
                                )}
                              </>
                            )}
                            
                            {/* Cancel button for eligible bookings */}
                            {canCancelBooking(booking) && (
                              <button
                                onClick={() => handleCancelClick(booking)}
                                className="h-8 px-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-medium transition-colors"
                                title="Cancel Booking"
                              >
                                Cancel
                              </button>
                            )}
                            
                            {/* Cancelled status display */}
                            {booking.status === 'cancelled' && (
                              <div className="flex flex-col items-center">
                                <span className="text-xs font-medium text-rose-600">Cancelled</span>
                                {booking.refund_amount && (
                                  <span className="text-xs text-slate-500">
                                    Refund: LKR {Number(booking.refund_amount).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {/* No actions available */}
                            {booking.status !== 'cancelled' && !canCancelBooking(booking) && booking.type !== 'bus' && booking.type !== 'train' && booking.type !== 'flight' && (
                              <span className="text-xs text-slate-400">No actions</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="mt-8 mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Area chart card */}
          <div className="lg:col-span-2 bg-white rounded-[10px] shadow-sm">
            <div className="px-10 pt-10 pb-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold leading-none tracking-tight text-[16px]">Bookings by Month</h3>
                  <p className="text-[14px] text-slate-500 pt-1">Flight • Train • Bus (last 6 months)</p>
                </div>
              </div>
            </div>
            <div className="px-10 pb-10 pt-10">
              <div className="h-[350px] w-full focus:outline-none" style={{ WebkitTapHighlightColor: 'transparent', outline: 'none' }}>
                <ResponsiveContainer width="100%" height="100%" className="focus:outline-none" tabIndex={-1} style={{ WebkitTapHighlightColor: 'transparent', outline: 'none' }}>
                  <AreaChart data={monthlyData} margin={{ left: 8, right: 8, top: 10 }}>
                    <defs>
                      <linearGradient id="gFlight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0955AC" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#0955AC" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="gTrain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="gBus" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} horizontal={true} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <RTooltip />
                    <Area type="monotone" dataKey="flight" name="Flight" stroke="#0955AC" fill="url(#gFlight)" strokeWidth={4} />
                    <Area type="monotone" dataKey="train" name="Train" stroke="#3b82f6" fill="url(#gTrain)" strokeWidth={4} />
                    <Area type="monotone" dataKey="bus" name="Bus" stroke="#6366f1" fill="url(#gBus)" strokeWidth={4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Pie card */}
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="px-10 pt-10">
              <h3 className="font-semibold leading-none tracking-tight text-[16px]">Category Mix</h3>
              <p className="text-[14px] text-slate-500 mt-1">Share of total bookings</p>
            </div>
            <div className="px-10 pb-10">
              <div className="h-[350px] w-full" style={{ WebkitTapHighlightColor: 'transparent', outline: 'none' }}>
                <ResponsiveContainer width="100%" height="100%" className="focus:outline-none" tabIndex={-1} style={{ WebkitTapHighlightColor: 'transparent', outline: 'none' }}>
                  <PieChart>
                    <Pie data={pieData} innerRadius={90} outerRadius={140} paddingAngle={5} dataKey="value" nameKey="name" cornerRadius={8}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={["#0955AC", "#3b82f6", "#6366f1"][i]} />
                      ))}
                    </Pie>
                    <RTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-center gap-4 text-[14px] text-slate-600">
                <div className="flex items-center gap-2"><span className="h-5 w-5 rounded-full bg-[#0955AC]" /> Flight</div>
                <div className="flex items-center gap-2"><span className="h-5 w-5 rounded-full bg-[#3b82f6]" /> Train</div>
                <div className="flex items-center gap-2"><span className="h-5 w-5 rounded-full bg-indigo-500" /> Bus</div>
              </div>
            </div>
          </div>
        </div>

        {/* Cancellation Modal */}
        {showCancelModal && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="px-6 pt-6 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-slate-900">Cancel Booking</h3>
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setSelectedBooking(null);
                      setCancelReason("");
                      setPolicyDetails(null);
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="px-6 py-4">
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900">Are you sure you want to cancel this booking?</p>
                      <p className="text-xs text-amber-700 mt-1">Ref: {selectedBooking.reference}</p>
                    </div>
                  </div>
                </div>

                {policyDetails && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Refund Details</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Original Amount:</span>
                        <span className="font-medium text-blue-900">LKR {Number(selectedBooking.total_price || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Refund Amount ({policyDetails.refund_percentage}%):</span>
                        <span className="font-medium text-green-600">LKR {Number(policyDetails.refund_amount || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Cancellation Fee:</span>
                        <span className="font-medium text-rose-600">LKR {Number(policyDetails.cancellation_fee || 0).toFixed(2)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">{policyDetails.policy_message}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Reason for cancellation (optional)
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Let us know why you're cancelling..."
                    className="w-full h-24 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={500}
                  />
                  <p className="text-xs text-slate-500 mt-1">{cancelReason.length}/500 characters</p>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 rounded-b-2xl flex gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedBooking(null);
                    setCancelReason("");
                    setPolicyDetails(null);
                  }}
                  className="flex-1 h-10 px-4 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-white"
                  disabled={cancelling}
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={cancelling}
                  className="flex-1 h-10 px-4 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Export Modal */}
        <AnimatePresence>
          {showExportModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onClick={() => setShowExportModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-xl max-w-md w-full"
              >
                <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="text-[18px] font-semibold text-slate-900">Export Bookings</h2>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="text-slate-400 hover:text-slate-600 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="px-6 py-4">
                  <p className="text-[14px] text-slate-600 mb-4">
                    Export all {filteredBookings.length} filtered bookings
                  </p>

                  <div className="space-y-2">
                    {/* PDF Option */}
                    <button
                      onClick={() => handleExportFormat('PDF')}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-[#0955AC] transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-[14px] font-medium text-slate-900">Export as PDF</p>
                          <p className="text-[12px] text-slate-500">Printable document format</p>
                        </div>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-slate-400 group-hover:text-[#0955AC]" />
                    </button>

                    {/* Excel Option */}
                    <button
                      onClick={() => handleExportFormat('Excel')}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-[#0955AC] transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                          <File className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-[14px] font-medium text-slate-900">Export as Excel</p>
                          <p className="text-[12px] text-slate-500">Spreadsheet format (.xlsx)</p>
                        </div>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-slate-400 group-hover:text-[#0955AC]" />
                    </button>

                    {/* CSV Option */}
                    <button
                      onClick={() => handleExportFormat('CSV')}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-[#0955AC] transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <p className="text-[14px] font-medium text-slate-900">Export as CSV</p>
                          <p className="text-[12px] text-slate-500">Comma-separated values</p>
                        </div>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-slate-400 group-hover:text-[#0955AC]" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Transport Jaan · Flight • Train • Bus
        </div>
      </div>
    </div>
  );
};

export default Hero;
