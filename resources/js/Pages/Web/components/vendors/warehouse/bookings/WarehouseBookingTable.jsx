import React, { useState } from "react";
import WarehouseBookingService from "../../../../../../services/WarehouseBookingService";
import miniUp from "../../../../assets/vendors/dashboard/icons/miniUp.svg";
import miniDown from "../../../../assets/vendors/dashboard/icons/miniDown.svg";

const WarehouseBookingTable = ({ bookings: bookingsProp = [], setBookings: setBookingsProp }) => {
    const isControlled = typeof setBookingsProp === "function";
    const [internalBookings, setInternalBookings] = useState(bookingsProp);
    const bookings = isControlled ? bookingsProp : internalBookings;
    const updateBookings = isControlled ? setBookingsProp : setInternalBookings;

    // State for pagination and remote data
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const perPageOptions = [5, 10, 20, 50];
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    React.useEffect(() => {
        if (!isControlled) {
            setInternalBookings(bookingsProp);
        }
    }, [bookingsProp, isControlled]);

    // State for detailed view popup
    const [isDetailPopupOpen, setIsDetailPopupOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    
    // State for vendor action popup
    const [isActionPopupOpen, setIsActionPopupOpen] = useState(false);
    const [actionBooking, setActionBooking] = useState(null);
    const [modifyData, setModifyData] = useState({
        monthly_rate: '',
        security_deposit: '',
        setup_fee: '',
        special_instructions: '',
        access_hours: '',
        payment_status: ''
    });

    const fetchBookings = React.useCallback(async (page = 1, perPage = itemsPerPage) => {
        setIsLoading(true);
        setFetchError(null);
        try {
            const response = await WarehouseBookingService.getBookings({ page, per_page: perPage });
            if (response.success) {
                const formattedBookings = (response.data || []).map((booking) =>
                    WarehouseBookingService.formatBookingForDisplay(booking)
                );
                updateBookings(formattedBookings);
                setPagination(response.pagination || { current_page: page, last_page: 1, total: formattedBookings.length });
                const resolvedPage = response.pagination?.current_page ?? page;
                setCurrentPage((prev) => (prev === resolvedPage ? prev : resolvedPage));
            } else {
                updateBookings([]);
                setPagination({ current_page: 1, last_page: 1, total: 0 });
                setFetchError(response.message || 'Failed to load bookings.');
                if (page !== 1) {
                    setCurrentPage(1);
                }
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            updateBookings([]);
            setPagination({ current_page: 1, last_page: 1, total: 0 });
            setFetchError('Failed to load bookings. Please try again.');
            if (page !== 1) {
                setCurrentPage(1);
            }
        } finally {
            setIsLoading(false);
        }
    }, [updateBookings, itemsPerPage]);

    React.useEffect(() => {
        fetchBookings(currentPage, itemsPerPage);
    }, [currentPage, itemsPerPage, fetchBookings]);

    const totalPages = Math.max(
        1,
        pagination?.total
            ? Math.ceil(pagination.total / itemsPerPage)
            : (pagination?.last_page ?? 1)
    );

    const handleModifySubmit = async () => {
        try {
            if (!actionBooking) {
                return;
            }

            const updates = {};

            Object.keys(modifyData).forEach((key) => {
                if (modifyData[key] && modifyData[key].toString().trim() !== '') {
                    updates[key] = modifyData[key];
                }
            });

            if (Object.keys(updates).length === 0) {
                alert('Please provide at least one field to update.');
                return;
            }

            const response = await WarehouseBookingService.updateBooking(actionBooking.id, updates);

            if (response.success) {
                await fetchBookings(currentPage, itemsPerPage);
                setIsActionPopupOpen(false);
                setModifyData({
                    monthly_rate: '',
                    security_deposit: '',
                    setup_fee: '',
                    special_instructions: '',
                    access_hours: '',
                    payment_status: ''
                });
                alert('Booking updated successfully!');
            }
        } catch (error) {
            console.error('Error updating booking:', error);
            alert('Failed to update booking. Please try again.');
        }
    };

    const handleResultsPerPageChange = (value) => {
        setItemsPerPage(value);
        setCurrentPage(1);
    };

    const goToPage = (page) => {
        if (page < 1 || page > totalPages || isLoading) return;
        setCurrentPage(page);
    };

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= 3) {
            pages.push(1, 2, 3, '...', totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
        }
        return pages;
    };

    const handleRowClick = (booking, index) => {
        setSelectedBooking({ ...booking, index });
        setIsDetailPopupOpen(true);
    };

    const handleVendorAction = async (action, booking, index) => {
        try {
            let response;

            switch (action) {
                case 'approve':
                    response = await WarehouseBookingService.approveBooking(booking.id);
                    if (response.success) {
                        await fetchBookings(currentPage, itemsPerPage);
                        alert('Booking approved successfully!');
                    }
                    break;

                case 'reject':
                    const reason = prompt('Please provide a reason for rejection:');
                    if (reason && reason.trim()) {
                        response = await WarehouseBookingService.rejectBooking(booking.id, reason.trim());
                        if (response.success) {
                            await fetchBookings(currentPage, itemsPerPage);
                            alert('Booking rejected successfully!');
                        }
                    }
                    break;

                case 'complete':
                    response = await WarehouseBookingService.completeBooking(booking.id);
                    if (response.success) {
                        await fetchBookings(currentPage, itemsPerPage);
                        alert('Booking marked as completed successfully!');
                    }
                    break;

                case 'modify':
                    setActionBooking({ ...booking, index });
                    setIsActionPopupOpen(true);
                    return;
            }
        } catch (error) {
            console.error(`Error ${action} booking:`, error);
            alert(`Failed to ${action} booking. Please try again.`);
        }
    };

    const getStatusColor = (status) => {
        const statusMap = {
            'pending': { bg: "#FFA500", text: "#FFFFFF" },
            'confirmed': { bg: "#3B8F31", text: "#FFFFFF" },
            'active': { bg: "#FFCD29", text: "#000000" },
            'completed': { bg: "#28A745", text: "#FFFFFF" },
            'cancelled': { bg: "#DC3545", text: "#FFFFFF" },
        };
        return statusMap[status] || { bg: "#6C757D", text: "#FFFFFF" };
    };

    const getStatusDisplayText = (status) => {
        const statusMap = {
            'pending': 'Pending',
            'confirmed': 'Confirmed',
            'active': 'Active',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        return statusMap[status] || status;
    };

    return (
        <div className="py-10">
            {fetchError && (
                <div className="mb-4 text-sm text-red-600">{fetchError}</div>
            )}
            <div className="overflow-x-auto w-full">
                {isLoading ? (
                    <div className="py-12 flex justify-center">
                        <span className="text-sm text-gray-600">Loading bookings...</span>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="py-12 flex justify-center">
                        <span className="text-sm text-gray-600">{fetchError ? 'Unable to load bookings.' : 'No bookings found.'}</span>
                    </div>
                ) : (
                    <div className="inline-block min-w-[1100px] align-middle">
                        {/* table headings */}
                        <div className="grid grid-cols-9 bg-[#D8E4F2] h-[42px] justify-center items-center rounded-[8px] text-[14px] font-[600] px-10">
                            <div className="flex flex-row gap-2 items-center">
                                <h1>Booking ID</h1>
                                <div className="flex flex-col justify-center items-center">
                                    <img src={miniUp} className="w-[6px] h-[4px]" alt="Sort Up" />
                                    <img src={miniDown} className="w-[6px] h-[4px]" alt="Sort Down" />
                                </div>
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                                <h1>Client</h1>
                                <div className="flex flex-col justify-center items-center">
                                    <img src={miniUp} className="w-[6px] h-[4px]" alt="Sort Up" />
                                    <img src={miniDown} className="w-[6px] h-[4px]" alt="Sort Down" />
                                </div>
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                                <h1>Warehouse</h1>
                                <div className="flex flex-col justify-center items-center">
                                    <img src={miniUp} className="w-[6px] h-[4px]" alt="Sort Up" />
                                    <img src={miniDown} className="w-[6px] h-[4px]" alt="Sort Down" />
                                </div>
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                                <h1>Storage Type</h1>
                                <div className="flex flex-col justify-center items-center">
                                    <img src={miniUp} className="w-[6px] h-[4px]" alt="Sort Up" />
                                    <img src={miniDown} className="w-[6px] h-[4px]" alt="Sort Down" />
                                </div>
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                                <h1>Duration</h1>
                                <div className="flex flex-col justify-center items-center">
                                    <img src={miniUp} className="w-[6px] h-[4px]" alt="Sort Up" />
                                    <img src={miniDown} className="w-[6px] h-[4px]" alt="Sort Down" />
                                </div>
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                                <h1>Amount</h1>
                                <div className="flex flex-col justify-center items-center">
                                    <img src={miniUp} className="w-[6px] h-[4px]" alt="Sort Up" />
                                    <img src={miniDown} className="w-[6px] h-[4px]" alt="Sort Down" />
                                </div>
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                                <h1>Payment</h1>
                                <div className="flex flex-col justify-center items-center">
                                    <img src={miniUp} className="w-[6px] h-[4px]" alt="Sort Up" />
                                    <img src={miniDown} className="w-[6px] h-[4px]" alt="Sort Down" />
                                </div>
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                                <h1>Status</h1>
                                <div className="flex flex-col justify-center items-center">
                                    <img src={miniUp} className="w-[6px] h-[4px]" alt="Sort Up" />
                                    <img src={miniDown} className="w-[6px] h-[4px]" alt="Sort Down" />
                                </div>
                            </div>
                            <div className="flex flex-row gap-2 items-center">
                                <h1>Actions</h1>
                            </div>
                        </div>

                        {/* table rows */}
                        {bookings.map((booking, idx) => (
                            <div
                                key={booking.id ?? idx}
                                className={`grid grid-cols-9 ${(idx !== bookings.length - 1) ? 'border-b-[1.5px] border-[#00000033]' : ''} min-h-[100px] justify-center items-center text-[15px] font-[500] px-10`}
                            >
                                <div className="cursor-pointer hover:text-blue-600" onClick={() => handleRowClick(booking, idx)}>
                                    {booking.id}
                                </div>
                                <div>
                                    <h1 className="font-[600]">{booking.clientName}</h1>
                                    <div className="text-[12px] text-gray-600">{booking.bookingDate}</div>
                                </div>
                                <div>
                                    <h1 className="font-[600]">{booking.warehouseName}</h1>
                                    <div className="w-fit px-2 py-1 rounded-[4px] bg-[#D9D9D957] border-[1.5px] border-[#0000004D] text-[12px] text-[#00000099]">
                                        {booking.warehouseUnit}
                                    </div>
                                </div>
                                <div>
                                    <div className="font-[600]">{booking.purpose}</div>
                                    <div className="text-[12px] text-gray-600">{booking.specialRequirements}</div>
                                </div>
                                <div className="text-[14px] font-[500] text-[#939392]">
                                    <div className="flex flex-row gap-2 justify-start items-center mb-1">
                                        <h1>Start:</h1>
                                        <div className="px-2 py-1 border-[0.5px] bg-[#D9D9D957] border-[#0000004D] text-[10px] font-[500] text-[#00000099] rounded-[4px]">
                                            {booking.startDate}
                                        </div>
                                    </div>
                                    <div className="flex flex-row gap-2 justify-start items-center">
                                        <h1>End:</h1>
                                        <div className="px-2 py-1 border-[0.5px] bg-[#D9D9D957] border-[#0000004D] text-[10px] font-[500] text-[#00000099] rounded-[4px]">
                                            {booking.endDate}
                                        </div>
                                    </div>
                                    <div className="text-[12px] mt-1 font-[600] text-black">
                                        {booking.durationValue} {booking.durationUnit}
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center items-start">
                                    <h1 className="font-[700] text-[16px]">{booking.totalPrice}</h1>
                                    <div className="text-[12px] text-gray-600">
                                        Qty: {booking.quantity}
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center items-center">
                                    <div
                                        className="px-3 py-1 border-[0.5px] rounded-[4px] text-[10px] font-[500] flex justify-center items-center"
                                        style={{
                                            borderColor: booking.paymentStatusColor,
                                            background: booking.paymentStatusBg,
                                            color: booking.paymentStatusColor
                                        }}
                                    >
                                        {booking.paymentStatus}
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center items-center">
                                    <div
                                        className="px-3 py-1 border-[1px] rounded-[4px] flex justify-center items-center text-[10px] font-[700]"
                                        style={{
                                            background: getStatusColor(booking.status).bg,
                                            borderColor: '#0000004D',
                                            color: getStatusColor(booking.status).text
                                        }}
                                    >
                                        {getStatusDisplayText(booking.status)}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {booking.status === 'pending' && (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleVendorAction('approve', booking, idx)}
                                                className="px-2 py-1 bg-green-500 text-white text-[10px] rounded hover:bg-green-600"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleVendorAction('reject', booking, idx)}
                                                className="px-2 py-1 bg-red-500 text-white text-[10px] rounded hover:bg-red-600"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                    {(booking.status === 'confirmed' || booking.status === 'active') && (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleVendorAction('complete', booking, idx)}
                                                className="px-2 py-1 bg-blue-500 text-white text-[10px] rounded hover:bg-blue-600"
                                            >
                                                Complete
                                            </button>
                                            <button
                                                onClick={() => handleVendorAction('modify', booking, idx)}
                                                className="px-2 py-1 bg-orange-500 text-white text-[10px] rounded hover:bg-orange-600"
                                            >
                                                Modify
                                            </button>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handleRowClick(booking, idx)}
                                        className="px-2 py-1 bg-gray-500 text-white text-[10px] rounded hover:bg-gray-600"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detailed View Popup */}
            {isDetailPopupOpen && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 poppins">
                    <div className="bg-white p-8 rounded-[10px] w-[900px] max-h-[80vh] overflow-y-auto shadow-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-[24px] font-[700]">Booking Details</h2>
                            <button
                                onClick={() => setIsDetailPopupOpen(false)}
                                className="text-gray-500 hover:text-gray-700 text-[24px]"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-[16px] font-[600] text-gray-700">Client Information</h3>
                                    <div className="mt-2 space-y-1">
                                        <p><span className="font-[500]">Name:</span> {selectedBooking.clientName}</p>
                                        <p><span className="font-[500]">Booking Date:</span> {selectedBooking.bookingDate}</p>
                                        <p><span className="font-[500]">Booking ID:</span> {selectedBooking.id}</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-[16px] font-[600] text-gray-700">Warehouse Details</h3>
                                    <div className="mt-2 space-y-1">
                                        <p><span className="font-[500]">Warehouse:</span> {selectedBooking.warehouseName}</p>
                                        <p><span className="font-[500]">Unit:</span> {selectedBooking.warehouseUnit}</p>
                                        <p><span className="font-[500]">Purpose:</span> {selectedBooking.purpose}</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-[16px] font-[600] text-gray-700">Storage Requirements</h3>
                                    <div className="mt-2 space-y-1">
                                        <p><span className="font-[500]">Special Requirements:</span> {selectedBooking.specialRequirements}</p>
                                        <p><span className="font-[500]">Quantity:</span> {selectedBooking.quantity} units</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Right Column */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-[16px] font-[600] text-gray-700">Duration & Schedule</h3>
                                    <div className="mt-2 space-y-1">
                                        <p><span className="font-[500]">Duration:</span> {selectedBooking.durationValue} {selectedBooking.durationUnit}</p>
                                        <p><span className="font-[500]">Start Date:</span> {selectedBooking.startDate}</p>
                                        <p><span className="font-[500]">End Date:</span> {selectedBooking.endDate}</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-[16px] font-[600] text-gray-700">Payment Information</h3>
                                    <div className="mt-2 space-y-1">
                                        <p><span className="font-[500]">Total Price:</span> {selectedBooking.totalPrice}</p>
                                        <p><span className="font-[500]">Payment Status:</span> 
                                            <span className={`ml-2 px-2 py-1 rounded text-[12px] ${
                                                selectedBooking.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {selectedBooking.paymentStatus}
                                            </span>
                                        </p>
                                        <p><span className="font-[500]">Status:</span> 
                                            <span className={`ml-2 px-2 py-1 rounded text-[12px] text-white`} 
                                                  style={{ backgroundColor: getStatusColor(selectedBooking.status).bg }}>
                                                {getStatusDisplayText(selectedBooking.status)}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                
                                {selectedBooking.notes && (
                                    <div>
                                        <h3 className="text-[16px] font-[600] text-gray-700">Additional Notes</h3>
                                        <div className="mt-2">
                                            <p>{selectedBooking.notes}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                            <button
                                onClick={() => setIsDetailPopupOpen(false)}
                                className="px-6 py-2 bg-gray-200 rounded-[5px] text-[14px] font-[600] hover:bg-gray-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modification Popup */}
            {isActionPopupOpen && actionBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 poppins">
                    <div className="bg-white p-6 rounded-lg w-[500px] shadow-lg">
                        <h2 className="text-[18px] font-[700] mb-4">Modify Booking - {actionBooking.id}</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[14px] font-[500] mb-1">Monthly Rate ($)</label>
                                <input
                                    type="number"
                                    value={modifyData.monthly_rate}
                                    onChange={(e) => setModifyData({...modifyData, monthly_rate: e.target.value})}
                                    className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                    placeholder="Enter new monthly rate"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[14px] font-[500] mb-1">Security Deposit ($)</label>
                                <input
                                    type="number"
                                    value={modifyData.security_deposit}
                                    onChange={(e) => setModifyData({...modifyData, security_deposit: e.target.value})}
                                    className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                    placeholder="Enter security deposit"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[14px] font-[500] mb-1">Setup Fee ($)</label>
                                <input
                                    type="number"
                                    value={modifyData.setup_fee}
                                    onChange={(e) => setModifyData({...modifyData, setup_fee: e.target.value})}
                                    className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                    placeholder="Enter setup fee"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[14px] font-[500] mb-1">Access Hours</label>
                                <input
                                    type="text"
                                    value={modifyData.access_hours}
                                    onChange={(e) => setModifyData({...modifyData, access_hours: e.target.value})}
                                    className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                    placeholder="e.g., 24/7, Business Hours, Custom"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-[14px] font-[500] mb-1">Payment Status</label>
                                <select
                                    value={modifyData.payment_status}
                                    onChange={(e) => setModifyData({...modifyData, payment_status: e.target.value})}
                                    className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                >
                                    <option value="">Select payment status</option>
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-[14px] font-[500] mb-1">Special Instructions</label>
                                <textarea
                                    value={modifyData.special_instructions}
                                    onChange={(e) => setModifyData({...modifyData, special_instructions: e.target.value})}
                                    className="w-full p-2 border focus:border-[#000000] rounded-[5px] focus:outline-none focus:ring-0"
                                    placeholder="Enter special instructions"
                                    rows="3"
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => {
                                    setIsActionPopupOpen(false);
                                    setModifyData({
                                        monthly_rate: '',
                                        security_deposit: '',
                                        setup_fee: '',
                                        special_instructions: '',
                                        access_hours: '',
                                        payment_status: ''
                                    });
                                }}
                                className="px-4 py-2 bg-gray-200 rounded-[5px] text-[14px] font-[700]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleModifySubmit}
                                className="px-4 py-2 bg-[#0955AC] text-white rounded-[5px] text-[14px] font-[700]"
                            >
                                Update Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pagination Controls and Results per page inline */}
            <div className="flex justify-between items-center gap-2 mt-20">
                <div className="flex items-center">
                    <span className="mr-3 text-[#00000080] text-[15px]">Results per page</span>
                    <select
                        className="rounded px-3 py-1 font-[600] text-[16px] bg-[#F4F3F3] border-[1px] border-[#BEBEBE] w-[71px] h-[40px] focus:outline-none"
                        value={itemsPerPage}
                        onChange={e => handleResultsPerPageChange(Number(e.target.value))}
                    >
                        {perPageOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="px-3 py-1 size-[40px] rounded-[4px] bg-[#F4F3F3] disabled:opacity-50"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1 || isLoading || pagination.total === 0}
                    >
                        <span className="text-lg">&#60;</span>
                    </button>
                    {getPageNumbers().map((num, idx) =>
                        num === '...'
                            ? <span key={idx} className="px-2">...</span>
                            : <button
                                key={num}
                                className={`px-3 py-1 text-[16px] font-[600] rounded-[4px] size-[40px] bg-[#F4F3F3] ${currentPage === num ? ' text-[#0955AC] font-[600] border-[2px] border-[#0955AC]' : 'bg-[#F4F3F3]'}`}
                                onClick={() => goToPage(num)}
                                disabled={isLoading || pagination.total === 0}
                            >
                                {num}
                            </button>
                    )}
                    <button
                        className="px-3 py-1 size-[40px] rounded-[4px] bg-[#F4F3F3] disabled:opacity-50"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages || isLoading || pagination.total === 0}
                    >
                        <span className="text-lg">&#62;</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WarehouseBookingTable;