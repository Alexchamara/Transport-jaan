import React, { useState, useEffect } from "react";
import calender from "../../../assets/superAdmin/Calendar Icon.png";
import dropD from "../../../assets/superAdmin/Chevron Down.png";
import Cards from "../Cards";

const RightSide = ({ userStats, landBookings = [], airBookings = [], seaBookings = [], warehouseBookings = [], pendingVendorReviews = null }) => {
    const [expandedLandBooking, setExpandedLandBooking] = useState(null);
    const [landSearchQuery, setLandSearchQuery] = useState("");
    const [landCurrentPage, setLandCurrentPage] = useState(1);
    const [expandedAirBooking, setExpandedAirBooking] = useState(null);
    const [airSearchQuery, setAirSearchQuery] = useState("");
    const [airCurrentPage, setAirCurrentPage] = useState(1);
    const [expandedSeaBooking, setExpandedSeaBooking] = useState(null);
    const [seaSearchQuery, setSeaSearchQuery] = useState("");
    const [seaCurrentPage, setSeaCurrentPage] = useState(1);
    const [warehouseSearchQuery, setWarehouseSearchQuery] = useState("");
    const [expandedWarehouseBooking, setExpandedWarehouseBooking] = useState(null);
    const [warehouseCurrentPage, setWarehouseCurrentPage] = useState(1);
    
    const itemsPerPage = 5;

    // Helper function to get data from localStorage
    const getStoredData = (key, defaultValue) => {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch (error) {
            console.error(`Error retrieving ${key} from localStorage:`, error);
            return defaultValue;
        }
    };

    // Helper function to save data to localStorage
    const saveToLocalStorage = (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Error saving ${key} to localStorage:`, error);
        }
    };
    
    // Store bookings in state with fallback to localStorage
    const [allLandBookings, setAllLandBookings] = useState(() => {
        return landBookings && landBookings.length > 0 ? landBookings : getStoredData('dashboard_land_bookings', []);
    });
    const [allAirBookings, setAllAirBookings] = useState(() => {
        return airBookings && airBookings.length > 0 ? airBookings : getStoredData('dashboard_air_bookings', []);
    });
    const [allSeaBookings, setAllSeaBookings] = useState(() => {
        return seaBookings && seaBookings.length > 0 ? seaBookings : getStoredData('dashboard_sea_bookings', []);
    });
    const [allWarehouseBookings, setAllWarehouseBookings] = useState(() => {
        return warehouseBookings && warehouseBookings.length > 0 ? warehouseBookings : getStoredData('dashboard_warehouse_bookings', []);
    });

    // Update state and save to localStorage when props change
    useEffect(() => {
        if (landBookings && landBookings.length > 0) {
            setAllLandBookings(landBookings);
            saveToLocalStorage('dashboard_land_bookings', landBookings);
        }
    }, [landBookings]);

    useEffect(() => {
        if (airBookings && airBookings.length > 0) {
            setAllAirBookings(airBookings);
            saveToLocalStorage('dashboard_air_bookings', airBookings);
        }
    }, [airBookings]);

    useEffect(() => {
        if (seaBookings && seaBookings.length > 0) {
            setAllSeaBookings(seaBookings);
            saveToLocalStorage('dashboard_sea_bookings', seaBookings);
        }
    }, [seaBookings]);

    useEffect(() => {
        if (warehouseBookings && warehouseBookings.length > 0) {
            setAllWarehouseBookings(warehouseBookings);
            saveToLocalStorage('dashboard_warehouse_bookings', warehouseBookings);
        }
    }, [warehouseBookings]);
    
    // Format date helper function
    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return dateString;
        }
    };

    // Filter land bookings based on search query
    const filteredLandBookings = allLandBookings.filter(booking => 
        booking.id?.toString().includes(landSearchQuery) ||
        booking.booking_reference?.toLowerCase().includes(landSearchQuery.toLowerCase()) ||
        booking.customer?.name?.toLowerCase().includes(landSearchQuery.toLowerCase()) ||
        booking.customer?.email?.toLowerCase().includes(landSearchQuery.toLowerCase()) ||
        booking.customer?.phone?.includes(landSearchQuery)
    );
    
    // Filter air bookings based on search query
    const filteredAirBookings = allAirBookings.filter(booking => 
        booking.id?.toString().includes(airSearchQuery) ||
        booking.booking_reference?.toLowerCase().includes(airSearchQuery.toLowerCase()) ||
        booking.customer?.name?.toLowerCase().includes(airSearchQuery.toLowerCase()) ||
        booking.customer?.email?.toLowerCase().includes(airSearchQuery.toLowerCase()) ||
        booking.customer?.phone?.includes(airSearchQuery)
    );

    // Filter sea bookings based on search query
    const filteredSeaBookings = allSeaBookings.filter(booking => 
        booking.id?.toString().includes(seaSearchQuery) ||
        booking.booking_reference?.toLowerCase().includes(seaSearchQuery.toLowerCase()) ||
        booking.customer?.name?.toLowerCase().includes(seaSearchQuery.toLowerCase()) ||
        booking.customer?.email?.toLowerCase().includes(seaSearchQuery.toLowerCase()) ||
        booking.customer?.phone?.includes(seaSearchQuery)
    );

    // Filter warehouse bookings based on search query
    const filteredWarehouseBookings = allWarehouseBookings.filter(booking => 
        booking.id?.toString().includes(warehouseSearchQuery) ||
        booking.booking_reference?.toLowerCase().includes(warehouseSearchQuery.toLowerCase()) ||
        booking.company_name?.toLowerCase().includes(warehouseSearchQuery.toLowerCase()) ||
        booking.contact_person?.toLowerCase().includes(warehouseSearchQuery.toLowerCase()) ||
        booking.email?.toLowerCase().includes(warehouseSearchQuery.toLowerCase()) ||
        booking.phone?.includes(warehouseSearchQuery)
    );

    // Pagination helper function
    const getPaginatedItems = (items, currentPage) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return items.slice(startIndex, endIndex);
    };

    // Calculate total pages for each table
    const landTotalPages = Math.ceil(filteredLandBookings.length / itemsPerPage);
    const airTotalPages = Math.ceil(filteredAirBookings.length / itemsPerPage);
    const seaTotalPages = Math.ceil(filteredSeaBookings.length / itemsPerPage);
    const warehouseTotalPages = Math.ceil(filteredWarehouseBookings.length / itemsPerPage);

    // Get paginated data for each table
    const paginatedLandBookings = getPaginatedItems(filteredLandBookings, landCurrentPage);
    const paginatedAirBookings = getPaginatedItems(filteredAirBookings, airCurrentPage);
    const paginatedSeaBookings = getPaginatedItems(filteredSeaBookings, seaCurrentPage);
    const paginatedWarehouseBookings = getPaginatedItems(filteredWarehouseBookings, warehouseCurrentPage);
    
    const getStatusBadge = (status) => {
        const statusConfig = {
            confirmed: 'bg-green-600 text-white',
            pending: 'bg-yellow-600 text-white',
            cancelled: 'bg-red-600 text-white',
            completed: 'bg-blue-600 text-white',
            active: 'bg-green-600 text-white',
            inactive: 'bg-gray-600 text-white'
        };
        return statusConfig[status?.toLowerCase()] || 'bg-gray-600 text-white';
    };

    const getPaymentStatusBadge = (status) => {
        const statusConfig = {
            paid: 'bg-green-600 text-white',
            pending: 'bg-yellow-600 text-white',
            failed: 'bg-red-600 text-white',
            refunded: 'bg-blue-600 text-white'
        };
        return statusConfig[status?.toLowerCase()] || 'bg-gray-600 text-white';
    };

    // Load jsPDF script if not already loaded
    React.useEffect(() => {
        if (!window.jspdf) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.async = true;
            document.head.appendChild(script);
        }
    }, []);

    // PDF generation function for Land Bookings
    const generateLandBookingsPDF = () => {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            alert('PDF library is loading. Please try again in a moment.');
            return;
        }

        const doc = new jsPDF('p', 'mm', 'a4');
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPosition = 15;

        // Title
        doc.setFontSize(16);
        doc.setTextColor(9, 85, 172);
        doc.text('Land Vehicle Bookings Summary Report', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;

        // Date and Summary
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 7;

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total Bookings: ${filteredLandBookings.length}`, 15, yPosition);
        
        // Calculate totals
        const totalAmount = filteredLandBookings.reduce((sum, booking) => sum + (parseFloat(booking.final_amount) || 0), 0);
        doc.text(`Total Amount: LKR ${totalAmount.toFixed(2)}`, 15, yPosition + 6);
        yPosition += 15;

        // Detailed entries for each booking
        doc.setFontSize(9);

        filteredLandBookings.forEach((booking, index) => {
            // Check if we need a new page
            if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = 15;
            }

            // Booking header with background
            doc.setFillColor(220, 230, 240);
            doc.rect(15, yPosition - 3, pageWidth - 30, 6, 'F');
            
            doc.setTextColor(9, 85, 172);
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text(`Booking ID: ${booking.id} | Status: ${booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}`, 18, yPosition + 1);
            yPosition += 8;

            // Reset font
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(9);

            // Passenger Information
            doc.setTextColor(80, 80, 80);
            doc.setFont(undefined, 'bold');
            doc.text('Passenger Information:', 18, yPosition);
            yPosition += 5;
            
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(`Name: ${booking.customer?.name || 'N/A'}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Email: ${booking.customer?.email || 'N/A'}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Phone: ${booking.customer?.phone || 'N/A'}`, 20, yPosition);
            yPosition += 6;

            // Route Information
            doc.setTextColor(80, 80, 80);
            doc.setFont(undefined, 'bold');
            doc.text('Travel Schedule:', 18, yPosition);
            yPosition += 5;
            
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(`Pickup Location: ${booking.schedule?.pickup_location || 'N/A'}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Dropoff Location: ${booking.schedule?.dropoff_location || 'N/A'}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Pickup Date: ${formatDate(booking.schedule?.pickup_date)}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Dropoff Date: ${formatDate(booking.schedule?.dropoff_date)}`, 20, yPosition);
            yPosition += 6;

            // Payment & Amount Information
            doc.setTextColor(80, 80, 80);
            doc.setFont(undefined, 'bold');
            doc.text('Booking Details:', 18, yPosition);
            yPosition += 5;
            
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(`Total Amount: LKR ${parseFloat(booking.final_amount || 0).toFixed(2)}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Payment Status: ${booking.payment_status?.charAt(0).toUpperCase() + booking.payment_status?.slice(1) || 'N/A'}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Booking Date: ${formatDate(booking.created_at)}`, 20, yPosition);
            yPosition += 8;

            // Divider line
            doc.setDrawColor(200, 200, 200);
            doc.line(15, yPosition, pageWidth - 15, yPosition);
            yPosition += 5;
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Confidential - Transport Management System', pageWidth / 2, pageHeight - 8, { align: 'center' });

        // Save PDF
        doc.save(`Land_Bookings_Summary_${new Date().getTime()}.pdf`);
    };

    // PDF generation function for Air Bookings
    const generateAirBookingsPDF = () => {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            alert('PDF library is loading. Please try again in a moment.');
            return;
        }

        const doc = new jsPDF('p', 'mm', 'a4');
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPosition = 15;

        // Title
        doc.setFontSize(16);
        doc.setTextColor(9, 85, 172);
        doc.text('Air Vehicle Bookings Summary Report', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;

        // Date and Summary
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 7;

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total Bookings: ${filteredAirBookings.length}`, 15, yPosition);
        
        // Calculate totals
        const totalAmount = filteredAirBookings.reduce((sum, booking) => sum + (parseFloat(booking.final_amount) || 0), 0);
        doc.text(`Total Amount: LKR ${totalAmount.toFixed(2)}`, 15, yPosition + 6);
        yPosition += 15;

        // Detailed entries for each booking
        doc.setFontSize(9);

        filteredAirBookings.forEach((booking, index) => {
            // Check if we need a new page
            if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = 15;
            }

            // Booking header with background
            doc.setFillColor(220, 230, 240);
            doc.rect(15, yPosition - 3, pageWidth - 30, 6, 'F');
            
            doc.setTextColor(9, 85, 172);
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text(`Booking ID: ${booking.id} | Status: ${booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}`, 18, yPosition + 1);
            yPosition += 8;

            // Reset font
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(9);

            // Passenger Information
            doc.setTextColor(80, 80, 80);
            doc.setFont(undefined, 'bold');
            doc.text('Passenger Information:', 18, yPosition);
            yPosition += 5;
            
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(`Name: ${booking.customer?.name || 'N/A'}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Email: ${booking.customer?.email || 'N/A'}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Phone: ${booking.customer?.phone || 'N/A'}`, 20, yPosition);
            yPosition += 6;

            // Route Information
            doc.setTextColor(80, 80, 80);
            doc.setFont(undefined, 'bold');
            doc.text('Flight Route:', 18, yPosition);
            yPosition += 5;
            
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(`From: ${booking.route?.from || 'N/A'}`, 20, yPosition);
            yPosition += 4;
            doc.text(`To: ${booking.route?.to || 'N/A'}`, 20, yPosition);
            yPosition += 6;

            // Payment & Amount Information
            doc.setTextColor(80, 80, 80);
            doc.setFont(undefined, 'bold');
            doc.text('Payment Details:', 18, yPosition);
            yPosition += 5;
            
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(`Payment Status: ${booking.payment_status?.charAt(0).toUpperCase() + booking.payment_status?.slice(1) || 'N/A'}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Amount: LKR ${parseFloat(booking.final_amount || 0).toFixed(2)}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Booking Date: ${formatDate(booking.created_at)}`, 20, yPosition);
            yPosition += 8;

            // Divider line
            doc.setDrawColor(200, 200, 200);
            doc.line(15, yPosition, pageWidth - 15, yPosition);
            yPosition += 5;
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Confidential - Transport Management System', pageWidth / 2, pageHeight - 8, { align: 'center' });

        // Save PDF
        doc.save(`Air_Bookings_Summary_${new Date().getTime()}.pdf`);
    };

    // PDF generation function for Sea Bookings
    const generateSeaBookingsPDF = () => {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            alert('PDF library is loading. Please try again in a moment.');
            return;
        }

        const doc = new jsPDF('p', 'mm', 'a4');
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPosition = 15;

        // Title
        doc.setFontSize(16);
        doc.setTextColor(9, 85, 172);
        doc.text('Sea Vehicle Bookings Summary Report', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;

        // Date and Summary
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 7;

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total Bookings: ${filteredSeaBookings.length}`, 15, yPosition);
        
        // Calculate totals
        const totalAmount = filteredSeaBookings.reduce((sum, booking) => sum + (parseFloat(booking.final_amount) || 0), 0);
        doc.text(`Total Amount: LKR ${totalAmount.toFixed(2)}`, 15, yPosition + 6);
        yPosition += 15;

        // Detailed entries for each booking
        doc.setFontSize(9);

        filteredSeaBookings.forEach((booking, index) => {
            // Check if we need a new page
            if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = 15;
            }

            // Booking header with background
            doc.setFillColor(220, 230, 240);
            doc.rect(15, yPosition - 3, pageWidth - 30, 6, 'F');
            
            doc.setTextColor(9, 85, 172);
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text(`Booking ID: ${booking.id} | Status: ${booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}`, 18, yPosition + 1);
            yPosition += 8;

            // Reset font
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(9);

            // Passenger Information
            doc.setTextColor(80, 80, 80);
            doc.setFont(undefined, 'bold');
            doc.text('Passenger Information:', 18, yPosition);
            yPosition += 5;
            
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(`Name: ${booking.customer?.name || 'N/A'}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Email: ${booking.customer?.email || 'N/A'}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Phone: ${booking.customer?.phone || 'N/A'}`, 20, yPosition);
            yPosition += 6;

            // Route Information
            doc.setTextColor(80, 80, 80);
            doc.setFont(undefined, 'bold');
            doc.text('Rental Schedule:', 18, yPosition);
            yPosition += 5;
            
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(`Pickup Location: ${booking.schedule?.pickup_location || 'N/A'}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Dropoff Location: ${booking.schedule?.dropoff_location || 'N/A'}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Pickup Date: ${formatDate(booking.schedule?.pickup_date)}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Dropoff Date: ${formatDate(booking.schedule?.dropoff_date)}`, 20, yPosition);
            yPosition += 6;

            // Payment & Amount Information
            doc.setTextColor(80, 80, 80);
            doc.setFont(undefined, 'bold');
            doc.text('Rental Details:', 18, yPosition);
            yPosition += 5;
            
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(`Price per Day: LKR ${parseFloat(booking.price_per_day || 0).toFixed(2)}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Rental Days: ${booking.rental_days || 'N/A'}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Total Amount: LKR ${parseFloat(booking.final_amount || 0).toFixed(2)}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Payment Status: ${booking.payment_status?.charAt(0).toUpperCase() + booking.payment_status?.slice(1) || 'N/A'}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Booking Date: ${formatDate(booking.created_at)}`, 20, yPosition);
            yPosition += 8;

            // Divider line
            doc.setDrawColor(200, 200, 200);
            doc.line(15, yPosition, pageWidth - 15, yPosition);
            yPosition += 5;
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Confidential - Transport Management System', pageWidth / 2, pageHeight - 8, { align: 'center' });

        // Save PDF
        doc.save(`Sea_Bookings_Summary_${new Date().getTime()}.pdf`);
    };

    // PDF generation function for Warehouse Bookings
    const generateWarehouseBookingsPDF = () => {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            alert('PDF library is loading. Please try again in a moment.');
            return;
        }

        const doc = new jsPDF('p', 'mm', 'a4');
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPosition = 15;

        // Title
        doc.setFontSize(16);
        doc.setTextColor(9, 85, 172);
        doc.text('Warehouse Bookings Summary Report', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;

        // Date and Summary
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 7;

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total Bookings: ${filteredWarehouseBookings.length}`, 15, yPosition);
        
        // Calculate totals
        const totalAmount = filteredWarehouseBookings.reduce((sum, booking) => sum + (parseFloat(booking.final_amount) || 0), 0);
        doc.text(`Total Amount: LKR ${totalAmount.toFixed(2)}`, 15, yPosition + 6);
        yPosition += 15;

        // Detailed entries for each booking
        doc.setFontSize(9);

        filteredWarehouseBookings.forEach((booking, index) => {
            // Check if we need a new page
            if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = 15;
            }

            // Booking header with background
            doc.setFillColor(220, 230, 240);
            doc.rect(15, yPosition - 3, pageWidth - 30, 6, 'F');
            
            doc.setTextColor(9, 85, 172);
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text(`Booking ID: ${booking.booking_reference} | Status: ${booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}`, 18, yPosition + 1);
            yPosition += 8;

            // Reset font
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(9);

            // Company Information
            doc.setTextColor(80, 80, 80);
            doc.setFont(undefined, 'bold');
            doc.text('Company Information:', 18, yPosition);
            yPosition += 5;
            
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(`Company Name: ${booking.company_name || 'N/A'}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Contact Person: ${booking.contact_person || 'N/A'}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Email: ${booking.email || 'N/A'}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Phone: ${booking.phone || 'N/A'}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Address: ${booking.company_address || 'N/A'}`, 20, yPosition);
            yPosition += 6;

            // Storage Information
            doc.setTextColor(80, 80, 80);
            doc.setFont(undefined, 'bold');
            doc.text('Storage Details:', 18, yPosition);
            yPosition += 5;
            
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(`Storage Type: ${booking.storage_type || 'N/A'}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Goods Type: ${booking.goods_type || 'N/A'}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Required Space: ${booking.required_space || 'N/A'} m²`, 20, yPosition);
            yPosition += 4;
            doc.text(`Estimated Weight: ${booking.estimated_weight || 'N/A'} kg`, 20, yPosition);
            yPosition += 6;

            // Rental Period
            doc.setTextColor(80, 80, 80);
            doc.setFont(undefined, 'bold');
            doc.text('Rental Period:', 18, yPosition);
            yPosition += 5;
            
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(`Start Date: ${formatDate(booking.start_date)}`, 20, yPosition);
            yPosition += 4;
            doc.text(`End Date: ${formatDate(booking.end_date)}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Duration: ${booking.duration_months || 'N/A'} months`, 20, yPosition);
            yPosition += 4;
            doc.text(`Monthly Rate: LKR ${parseFloat(booking.monthly_rate || 0).toFixed(2)}`, 20, yPosition);
            yPosition += 6;

            // Payment & Amount Information
            doc.setTextColor(80, 80, 80);
            doc.setFont(undefined, 'bold');
            doc.text('Booking Details:', 18, yPosition);
            yPosition += 5;
            
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(`Total Amount: LKR ${parseFloat(booking.final_amount || 0).toFixed(2)}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Payment Status: ${booking.payment_status?.charAt(0).toUpperCase() + booking.payment_status?.slice(1) || 'N/A'}`, 20, yPosition);
            yPosition += 4;
            doc.text(`Booking Date: ${formatDate(booking.created_at)}`, 20, yPosition);
            yPosition += 8;

            // Divider line
            doc.setDrawColor(200, 200, 200);
            doc.line(15, yPosition, pageWidth - 15, yPosition);
            yPosition += 5;
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Confidential - Transport Management System', pageWidth / 2, pageHeight - 8, { align: 'center' });

        // Save PDF
        doc.save(`Warehouse_Bookings_Summary_${new Date().getTime()}.pdf`);
    };

    

    const LandBookingTable = ({ bookings }) => (
        <div className="xl:w-[1125px] bg-[#0B1739] border border-gray-700 rounded-lg mt-6 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h3 className="text-white text-lg font-semibold">Land Vehicle Bookings</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search Input */}
                        <input
                            type="text"
                            placeholder="Search by reference, name, email..."
                            value={landSearchQuery}
                            onChange={(e) => {
                                setLandSearchQuery(e.target.value);
                                setLandCurrentPage(1);
                            }}
                            className="px-3 py-2 rounded bg-[#081028] border border-gray-600 text-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                        />
                        {/* PDF Button */}
                        <button
                            onClick={generateLandBookingsPDF}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                            <span>📄 PDF</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-[#081028] border-b border-gray-700">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Booking ID</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Payment</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Date</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-300">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedLandBookings && paginatedLandBookings.length > 0 ? (
                            paginatedLandBookings.map((booking, index) => (
                                <React.Fragment key={booking.id}>
                                    <tr 
                                        className={`${index % 2 === 0 ? 'bg-[#0B1739]' : 'bg-[#081028]'} hover:bg-[#1E40AF]/10 border-b border-gray-700 transition-colors cursor-pointer`}
                                    >
                                        <td className="px-6 py-3 text-sm text-white font-medium">{booking.id}</td>
                                        <td className="px-6 py-3 text-sm">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(booking.status)}`}>
                                                {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-sm">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusBadge(booking.payment_status)}`}>
                                                {booking.payment_status ? booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1) : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-green-400 font-semibold">
                                            LKR {typeof booking.final_amount === 'number' ? booking.final_amount.toFixed(2) : parseFloat(booking.final_amount || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-400">{formatDate(booking.created_at)}</td>
                                        <td className="px-6 py-3 text-center">
                                            <button
                                                onClick={() => setExpandedLandBooking(expandedLandBooking === booking.id ? null : booking.id)}
                                                className="text-blue-400 hover:text-blue-300 font-semibold text-xs"
                                            >
                                                {expandedLandBooking === booking.id ? '▼ Hide' : '► Show'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedLandBooking === booking.id && booking.customer && (
                                        <tr className={`${index % 2 === 0 ? 'bg-[#0B1739]' : 'bg-[#081028]'} border-b border-gray-700`}>
                                            <td colSpan="6" className="px-6 py-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                                    {/* Customer Info */}
                                                    <div className="bg-[#081028] p-4 rounded-lg">
                                                        <h4 className="text-white font-semibold mb-3 border-b border-gray-600 pb-2">👤 Passenger</h4>
                                                        <div className="space-y-2 text-gray-300">
                                                            <div>
                                                                <span className="font-medium text-gray-400">Name:</span>
                                                                <p className="text-white mt-1">{booking.customer?.name || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-400">Email:</span>
                                                                <p className="text-blue-400 mt-1">{booking.customer?.email || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-400">Phone:</span>
                                                                <p className="text-white mt-1">{booking.customer?.phone || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Schedule Info */}
                                                    <div className="bg-[#081028] p-4 rounded-lg">
                                                        <h4 className="text-white font-semibold mb-3 border-b border-gray-600 pb-2">🚗 Travel Schedule</h4>
                                                        <div className="space-y-3 text-gray-300">
                                                            <div>
                                                                <span className="font-medium text-gray-400">Pickup:</span>
                                                                <p className="text-green-400 mt-1 font-semibold">{booking.schedule?.pickup_location || 'N/A'}</p>
                                                            </div>
                                                            <div className="flex justify-center py-2">
                                                                <span className="text-yellow-400">⬇</span>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-400">Dropoff:</span>
                                                                <p className="text-blue-400 mt-1 font-semibold">{booking.schedule?.dropoff_location || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Booking Summary */}
                                                    <div className="bg-[#081028] p-4 rounded-lg">
                                                        <h4 className="text-white font-semibold mb-3 border-b border-gray-600 pb-2">📋 Booking Details</h4>
                                                        <div className="space-y-2 text-gray-300">
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Booking ID:</span>
                                                                <span className="text-yellow-400">{booking.id}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Status:</span>
                                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(booking.status)}`}>
                                                                    {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Pickup Date:</span>
                                                                <span>{formatDate(booking.schedule?.pickup_date)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Dropoff Date:</span>
                                                                <span>{formatDate(booking.schedule?.dropoff_date)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Total:</span>
                                                                <span className="text-green-400 font-semibold">LKR {parseFloat(booking.final_amount || 0).toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Created:</span>
                                                                <span>{formatDate(booking.created_at)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                                    {landSearchQuery ? 'No bookings match your search' : 'No bookings found'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {filteredLandBookings.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-700 bg-[#0B1739] flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                        Showing {((landCurrentPage - 1) * itemsPerPage) + 1} to {Math.min(landCurrentPage * itemsPerPage, filteredLandBookings.length)} of {filteredLandBookings.length}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setLandCurrentPage(Math.max(1, landCurrentPage - 1))}
                            disabled={landCurrentPage === 1}
                            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white text-sm rounded"
                        >
                            ← Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: landTotalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setLandCurrentPage(page)}
                                    className={`px-2 py-1 text-sm rounded ${
                                        landCurrentPage === page
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 hover:bg-gray-600 text-white'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setLandCurrentPage(Math.min(landTotalPages, landCurrentPage + 1))}
                            disabled={landCurrentPage === landTotalPages}
                            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white text-sm rounded"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    const BookingTable = ({ title, bookings, showCompanyName = false }) => (
        <div className="xl:w-[1125px] bg-[#0B1739] border border-gray-700 rounded-lg mt-6 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h3 className="text-white text-lg font-semibold">{title}</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search Input */}
                        <input
                            type="text"
                            placeholder="Search by reference, company, contact..."
                            value={warehouseSearchQuery}
                            onChange={(e) => {
                                setWarehouseSearchQuery(e.target.value);
                                setWarehouseCurrentPage(1);
                            }}
                            className="px-3 py-2 rounded bg-[#081028] border border-gray-600 text-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                        />
                        {/* PDF Button */}
                        <button
                            onClick={generateWarehouseBookingsPDF}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                            <span>📄 PDF</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-[#081028] border-b border-gray-700">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Reference</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Payment</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Amount</th>
                            {showCompanyName && <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Company</th>}
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Date</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-300">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedWarehouseBookings && paginatedWarehouseBookings.length > 0 ? (
                            paginatedWarehouseBookings.map((booking, index) => (
                                <React.Fragment key={booking.id}>
                                    <tr 
                                        className={`${index % 2 === 0 ? 'bg-[#0B1739]' : 'bg-[#081028]'} hover:bg-[#1E40AF]/10 border-b border-gray-700 transition-colors`}
                                    >
                                        <td className="px-6 py-3 text-sm text-white font-medium">{booking.booking_reference || `#${booking.id}`}</td>
                                        <td className="px-6 py-3 text-sm">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(booking.status)}`}>
                                                {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-sm">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusBadge(booking.payment_status)}`}>
                                                {booking.payment_status ? booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1) : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-green-400 font-semibold">
                                            LKR {typeof booking.final_amount === 'number' ? booking.final_amount.toFixed(2) : parseFloat(booking.final_amount || 0).toFixed(2)}
                                        </td>
                                        {showCompanyName && <td className="px-6 py-3 text-sm text-gray-300">{booking.company_name || 'N/A'}</td>}
                                        <td className="px-6 py-3 text-sm text-gray-400">{formatDate(booking.created_at)}</td>
                                        <td className="px-6 py-3 text-center">
                                            <button
                                                onClick={() => setExpandedWarehouseBooking(expandedWarehouseBooking === booking.id ? null : booking.id)}
                                                className="text-blue-400 hover:text-blue-300 font-semibold text-xs"
                                            >
                                                {expandedWarehouseBooking === booking.id ? '▼ Hide' : '► Show'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedWarehouseBooking === booking.id && (
                                        <tr className={`${index % 2 === 0 ? 'bg-[#0B1739]' : 'bg-[#081028]'} border-b border-gray-700`}>
                                            <td colSpan={showCompanyName ? 7 : 6} className="px-6 py-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                                    {/* Company Info */}
                                                    <div className="bg-[#081028] p-4 rounded-lg">
                                                        <h4 className="text-white font-semibold mb-3 border-b border-gray-600 pb-2">🏢 Company Information</h4>
                                                        <div className="space-y-2 text-gray-300">
                                                            <div>
                                                                <span className="font-medium text-gray-400">Name:</span>
                                                                <p className="text-white mt-1">{booking.company_name || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-400">Contact Person:</span>
                                                                <p className="text-white mt-1">{booking.contact_person || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-400">Email:</span>
                                                                <p className="text-blue-400 mt-1">{booking.email || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-400">Phone:</span>
                                                                <p className="text-white mt-1">{booking.phone || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-400">Address:</span>
                                                                <p className="text-gray-300 mt-1 text-xs">{booking.company_address || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Storage Information */}
                                                    <div className="bg-[#081028] p-4 rounded-lg">
                                                        <h4 className="text-white font-semibold mb-3 border-b border-gray-600 pb-2">📦 Storage Details</h4>
                                                        <div className="space-y-2 text-gray-300">
                                                            <div>
                                                                <span className="font-medium text-gray-400">Storage Type:</span>
                                                                <p className="text-white mt-1">{booking.storage_type || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-400">Goods Type:</span>
                                                                <p className="text-white mt-1">{booking.goods_type || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-400">Required Space:</span>
                                                                <p className="text-yellow-400 font-semibold mt-1">{booking.required_space || 'N/A'} m²</p>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-400">Estimated Weight:</span>
                                                                <p className="text-white mt-1">{booking.estimated_weight || 'N/A'} kg</p>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-400">Goods Description:</span>
                                                                <p className="text-gray-300 mt-1 text-xs">{booking.goods_description || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Booking Summary */}
                                                    <div className="bg-[#081028] p-4 rounded-lg">
                                                        <h4 className="text-white font-semibold mb-3 border-b border-gray-600 pb-2">📋 Booking Summary</h4>
                                                        <div className="space-y-2 text-gray-300">
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Booking ID:</span>
                                                                <span className="text-yellow-400">{booking.id}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Status:</span>
                                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(booking.status)}`}>
                                                                    {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Start Date:</span>
                                                                <span className="text-green-400">{formatDate(booking.start_date)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">End Date:</span>
                                                                <span className="text-blue-400">{formatDate(booking.end_date)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Duration:</span>
                                                                <span>{booking.duration_months || 'N/A'} months</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Pricing & Payment Section */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mt-6">
                                                    {/* Pricing Details */}
                                                    <div className="bg-[#081028] p-4 rounded-lg">
                                                        <h4 className="text-white font-semibold mb-3 border-b border-gray-600 pb-2">💰 Pricing Details</h4>
                                                        <div className="space-y-2 text-gray-300">
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Monthly Rate:</span>
                                                                <span className="text-green-400 font-semibold">LKR {parseFloat(booking.monthly_rate || 0).toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Setup Fee:</span>
                                                                <span className="text-yellow-400">LKR {parseFloat(booking.setup_fee || 0).toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Security Deposit:</span>
                                                                <span className="text-orange-400">LKR {parseFloat(booking.security_deposit || 0).toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Tax Amount:</span>
                                                                <span className="text-blue-400">LKR {parseFloat(booking.tax_amount || 0).toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between border-t border-gray-600 pt-2 mt-2">
                                                                <span className="font-bold text-white">Total Amount:</span>
                                                                <span className="text-green-400 font-bold text-lg">LKR {parseFloat(booking.total_amount || 0).toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-bold text-white">Final Amount:</span>
                                                                <span className="text-green-500 font-bold text-lg">LKR {parseFloat(booking.final_amount || 0).toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Payment Information */}
                                                    <div className="bg-[#081028] p-4 rounded-lg">
                                                        <h4 className="text-white font-semibold mb-3 border-b border-gray-600 pb-2">💳 Payment Information</h4>
                                                        <div className="space-y-2 text-gray-300">
                                                            <div>
                                                                <span className="font-medium text-gray-400">Payment Status:</span>
                                                                <p className={`px-3 py-1 rounded-full text-xs font-semibold inline-block mt-1 ${getPaymentStatusBadge(booking.payment_status)}`}>
                                                                    {booking.payment_status?.charAt(0).toUpperCase() + booking.payment_status?.slice(1)}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-400">Payment Method:</span>
                                                                <p className="text-white mt-1">{booking.payment_method || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-400">Payment Date:</span>
                                                                <p className="text-white mt-1">{formatDate(booking.payment_date) || 'Pending'}</p>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-400">Transaction Reference:</span>
                                                                <p className="text-blue-400 mt-1 text-xs font-mono">{booking.transaction_reference || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-400">Created:</span>
                                                                <p className="text-gray-400 mt-1">{formatDate(booking.created_at)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Additional Details */}
                                                {(booking.special_requirements || booking.special_instructions || booking.amenities) && (
                                                    <div className="bg-[#081028] p-4 rounded-lg mt-6">
                                                        <h4 className="text-white font-semibold mb-3 border-b border-gray-600 pb-2">⚙️ Additional Details</h4>
                                                        <div className="space-y-3 text-sm">
                                                            {booking.special_requirements && (
                                                                <div>
                                                                    <span className="font-medium text-gray-400">Special Requirements:</span>
                                                                    <p className="text-gray-300 mt-1">{booking.special_requirements}</p>
                                                                </div>
                                                            )}
                                                            {booking.special_instructions && (
                                                                <div>
                                                                    <span className="font-medium text-gray-400">Special Instructions:</span>
                                                                    <p className="text-gray-300 mt-1">{booking.special_instructions}</p>
                                                                </div>
                                                            )}
                                                            {booking.amenities && (
                                                                <div>
                                                                    <span className="font-medium text-gray-400">Amenities:</span>
                                                                    <p className="text-gray-300 mt-1">{booking.amenities}</p>
                                                                </div>
                                                            )}
                                                            {booking.access_hours && (
                                                                <div>
                                                                    <span className="font-medium text-gray-400">Access Hours:</span>
                                                                    <p className="text-gray-300 mt-1">{booking.access_hours}</p>
                                                                </div>
                                                            )}
                                                            {booking.notes && (
                                                                <div>
                                                                    <span className="font-medium text-gray-400">Notes:</span>
                                                                    <p className="text-gray-300 mt-1">{booking.notes}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={showCompanyName ? 7 : 6} className="px-6 py-8 text-center text-gray-400">
                                    {warehouseSearchQuery ? 'No bookings match your search' : 'No bookings found'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {filteredWarehouseBookings && filteredWarehouseBookings.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-700 bg-[#0B1739] flex items-center justify-between flex-wrap gap-4">
                    <span className="text-sm text-gray-400">
                        Showing {((warehouseCurrentPage - 1) * itemsPerPage) + 1} to {Math.min(warehouseCurrentPage * itemsPerPage, filteredWarehouseBookings.length)} of {filteredWarehouseBookings.length} warehouse bookings
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setWarehouseCurrentPage(Math.max(1, warehouseCurrentPage - 1))}
                            disabled={warehouseCurrentPage === 1}
                            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm transition-colors"
                        >
                            Previous
                        </button>
                        {Array.from({ length: warehouseTotalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setWarehouseCurrentPage(page)}
                                className={`px-3 py-1 rounded text-white text-sm transition-colors ${
                                    warehouseCurrentPage === page ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => setWarehouseCurrentPage(Math.min(warehouseTotalPages, warehouseCurrentPage + 1))}
                            disabled={warehouseCurrentPage === warehouseTotalPages}
                            className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    const AirBookingTable = ({ bookings }) => (
        <div className="xl:w-[1125px] bg-[#0B1739] border border-gray-700 rounded-lg mt-6 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h3 className="text-white text-lg font-semibold">Air Vehicle Bookings</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search Input */}
                        <input
                            type="text"
                            placeholder="Search by reference, name, email..."
                            value={airSearchQuery}
                            onChange={(e) => {
                                setAirSearchQuery(e.target.value);
                                setAirCurrentPage(1);
                            }}
                            className="px-3 py-2 rounded bg-[#081028] border border-gray-600 text-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                        />
                        {/* PDF Button */}
                        <button
                            onClick={generateAirBookingsPDF}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                            <span>📄 PDF</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-[#081028] border-b border-gray-700">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Booking ID</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Payment</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Date</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-300">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedAirBookings && paginatedAirBookings.length > 0 ? (
                            paginatedAirBookings.map((booking, index) => (
                                <React.Fragment key={booking.id}>
                                    <tr 
                                        className={`${index % 2 === 0 ? 'bg-[#0B1739]' : 'bg-[#081028]'} hover:bg-[#1E40AF]/10 border-b border-gray-700 transition-colors cursor-pointer`}
                                    >
                                        <td className="px-6 py-3 text-sm text-white font-medium">{booking.id}</td>
                                        <td className="px-6 py-3 text-sm">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(booking.status)}`}>
                                                {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-sm">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusBadge(booking.payment_status)}`}>
                                                {booking.payment_status ? booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1) : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-green-400 font-semibold">
                                            LKR {typeof booking.final_amount === 'number' ? booking.final_amount.toFixed(2) : parseFloat(booking.final_amount || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-400">{formatDate(booking.created_at)}</td>
                                        <td className="px-6 py-3 text-center">
                                            <button
                                                onClick={() => setExpandedAirBooking(expandedAirBooking === booking.id ? null : booking.id)}
                                                className="text-blue-400 hover:text-blue-300 font-semibold text-xs"
                                            >
                                                {expandedAirBooking === booking.id ? '▼ Hide' : '► Show'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedAirBooking === booking.id && booking.customer && (
                                        <tr className={`${index % 2 === 0 ? 'bg-[#0B1739]' : 'bg-[#081028]'} border-b border-gray-700`}>
                                            <td colSpan="6" className="px-6 py-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                                    {/* Customer Info */}
                                                    <div className="bg-[#081028] p-4 rounded-lg">
                                                        <h4 className="text-white font-semibold mb-3 border-b border-gray-600 pb-2">👤 Passenger</h4>
                                                        <div className="space-y-2 text-gray-300">
                                                            <div>
                                                                <span className="font-medium text-gray-400">Name:</span>
                                                                <p className="text-white mt-1">{booking.customer?.name || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-400">Email:</span>
                                                                <p className="text-blue-400 mt-1">{booking.customer?.email || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-400">Phone:</span>
                                                                <p className="text-white mt-1">{booking.customer?.phone || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Route Info */}
                                                    <div className="bg-[#081028] p-4 rounded-lg">
                                                        <h4 className="text-white font-semibold mb-3 border-b border-gray-600 pb-2">✈️ Flight Route</h4>
                                                        <div className="space-y-3 text-gray-300">
                                                            <div>
                                                                <span className="font-medium text-gray-400">From:</span>
                                                                <p className="text-green-400 mt-1 font-semibold">{booking.route?.from || 'N/A'}</p>
                                                            </div>
                                                            <div className="flex justify-center py-2">
                                                                <span className="text-yellow-400">⬇</span>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-400">To:</span>
                                                                <p className="text-blue-400 mt-1 font-semibold">{booking.route?.to || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Booking Summary */}
                                                    <div className="bg-[#081028] p-4 rounded-lg">
                                                        <h4 className="text-white font-semibold mb-3 border-b border-gray-600 pb-2">📋 Booking Details</h4>
                                                        <div className="space-y-2 text-gray-300">
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Reference:</span>
                                                                <span className="text-yellow-400">{booking.booking_reference}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Status:</span>
                                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(booking.status)}`}>
                                                                    {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Created:</span>
                                                                <span>{formatDate(booking.created_at)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                                    {airSearchQuery ? 'No bookings match your search' : 'No bookings found'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {filteredAirBookings.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-700 bg-[#0B1739] flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                        Showing {((airCurrentPage - 1) * itemsPerPage) + 1} to {Math.min(airCurrentPage * itemsPerPage, filteredAirBookings.length)} of {filteredAirBookings.length}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setAirCurrentPage(Math.max(1, airCurrentPage - 1))}
                            disabled={airCurrentPage === 1}
                            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white text-sm rounded"
                        >
                            ← Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: airTotalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setAirCurrentPage(page)}
                                    className={`px-2 py-1 text-sm rounded ${
                                        airCurrentPage === page
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 hover:bg-gray-600 text-white'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setAirCurrentPage(Math.min(airTotalPages, airCurrentPage + 1))}
                            disabled={airCurrentPage === airTotalPages}
                            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white text-sm rounded"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    const SeaBookingTable = ({ bookings }) => (
        <div className="xl:w-[1125px] bg-[#0B1739] border border-gray-700 rounded-lg mt-6 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h3 className="text-white text-lg font-semibold">Sea Vehicle Bookings</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search Input */}
                        <input
                            type="text"
                            placeholder="Search by reference, name, email..."
                            value={seaSearchQuery}
                            onChange={(e) => {
                                setSeaSearchQuery(e.target.value);
                                setSeaCurrentPage(1);
                            }}
                            className="px-3 py-2 rounded bg-[#081028] border border-gray-600 text-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                        />
                        {/* PDF Button */}
                        <button
                            onClick={generateSeaBookingsPDF}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                            <span>📄 PDF</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-[#081028] border-b border-gray-700">
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Booking ID</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Payment</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Date</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-300">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedSeaBookings && paginatedSeaBookings.length > 0 ? (
                            paginatedSeaBookings.map((booking, index) => (
                                <React.Fragment key={booking.id}>
                                    <tr 
                                        className={`${index % 2 === 0 ? 'bg-[#0B1739]' : 'bg-[#081028]'} hover:bg-[#1E40AF]/10 border-b border-gray-700 transition-colors cursor-pointer`}
                                    >
                                        <td className="px-6 py-3 text-sm text-white font-medium">{booking.id}</td>
                                        <td className="px-6 py-3 text-sm">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(booking.status)}`}>
                                                {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-sm">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusBadge(booking.payment_status)}`}>
                                                {booking.payment_status ? booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1) : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-sm text-green-400 font-semibold">
                                            LKR {typeof booking.final_amount === 'number' ? booking.final_amount.toFixed(2) : parseFloat(booking.final_amount || 0).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-3 text-sm text-gray-400">{formatDate(booking.created_at)}</td>
                                        <td className="px-6 py-3 text-center">
                                            <button
                                                onClick={() => setExpandedSeaBooking(expandedSeaBooking === booking.id ? null : booking.id)}
                                                className="text-blue-400 hover:text-blue-300 font-semibold text-xs"
                                            >
                                                {expandedSeaBooking === booking.id ? '▼ Hide' : '► Show'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedSeaBooking === booking.id && booking.customer && (
                                        <tr className={`${index % 2 === 0 ? 'bg-[#0B1739]' : 'bg-[#081028]'} border-b border-gray-700`}>
                                            <td colSpan="6" className="px-6 py-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                                    {/* Customer Info */}
                                                    <div className="bg-[#081028] p-4 rounded-lg">
                                                        <h4 className="text-white font-semibold mb-3 border-b border-gray-600 pb-2">👤 Passenger</h4>
                                                        <div className="space-y-2 text-gray-300">
                                                            <div>
                                                                <span className="font-medium text-gray-400">Name:</span>
                                                                <p className="text-white mt-1">{booking.customer?.name || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-400">Email:</span>
                                                                <p className="text-blue-400 mt-1">{booking.customer?.email || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-400">Phone:</span>
                                                                <p className="text-white mt-1">{booking.customer?.phone || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Schedule Info */}
                                                    <div className="bg-[#081028] p-4 rounded-lg">
                                                        <h4 className="text-white font-semibold mb-3 border-b border-gray-600 pb-2">⛴️ Rental Schedule</h4>
                                                        <div className="space-y-3 text-gray-300">
                                                            <div>
                                                                <span className="font-medium text-gray-400">Pickup:</span>
                                                                <p className="text-green-400 mt-1 font-semibold">{booking.schedule?.pickup_location || 'N/A'}</p>
                                                            </div>
                                                            <div className="flex justify-center py-2">
                                                                <span className="text-yellow-400">⬇</span>
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-400">Dropoff:</span>
                                                                <p className="text-blue-400 mt-1 font-semibold">{booking.schedule?.dropoff_location || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Booking Summary */}
                                                    <div className="bg-[#081028] p-4 rounded-lg">
                                                        <h4 className="text-white font-semibold mb-3 border-b border-gray-600 pb-2">📋 Rental Details</h4>
                                                        <div className="space-y-2 text-gray-300">
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Booking ID:</span>
                                                                <span className="text-yellow-400">{booking.id}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Status:</span>
                                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(booking.status)}`}>
                                                                    {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Price/Day:</span>
                                                                <span className="text-green-400">LKR {parseFloat(booking.price_per_day || 0).toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Days:</span>
                                                                <span>{booking.rental_days}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Total:</span>
                                                                <span className="text-green-400 font-semibold">LKR {parseFloat(booking.final_amount || 0).toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="font-medium">Created:</span>
                                                                <span>{formatDate(booking.created_at)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-8 text-center text-gray-400">
                                    {seaSearchQuery ? 'No bookings match your search' : 'No bookings found'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {filteredSeaBookings.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-700 bg-[#0B1739] flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                        Showing {((seaCurrentPage - 1) * itemsPerPage) + 1} to {Math.min(seaCurrentPage * itemsPerPage, filteredSeaBookings.length)} of {filteredSeaBookings.length}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSeaCurrentPage(Math.max(1, seaCurrentPage - 1))}
                            disabled={seaCurrentPage === 1}
                            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white text-sm rounded"
                        >
                            ← Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: seaTotalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setSeaCurrentPage(page)}
                                    className={`px-2 py-1 text-sm rounded ${
                                        seaCurrentPage === page
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 hover:bg-gray-600 text-white'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setSeaCurrentPage(Math.min(seaTotalPages, seaCurrentPage + 1))}
                            disabled={seaCurrentPage === seaTotalPages}
                            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white text-sm rounded"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}
        </div>

    );

    return (
        <div>
            {/* Header */}
            <div className="xl:w-[1125px] xl:h-[42px] flex flex-row justify-between items-center px-4 md:px-12 lg:px-47 my-6 md:my-10 lg:my-[25px]">
                <h1 className="text-white text-base md:text-lg lg:text-[24px] font-poppins">
                    Welcome back,
                </h1>

                {/* <div className="flex flex-row gap-2 md:gap-4">
                    <button className="text-white flex flex-row justify-end items-center gap-1 md:gap-2 border border-[#0A1330] bg-[#0A1330] px-2 md:px-4 py-2 rounded-[5px] text-xs md:text-sm">
                        <h1>Export data</h1>
                    </button>
                    <button className="text-white flex flex-row justify-end items-center gap-1 md:gap-2 border border-[#0955AC] bg-[#0955AC] px-2 md:px-4 py-2 rounded-[5px] text-xs md:text-sm">
                        <h1>Create report</h1>
                    </button>
                </div> */}
            </div>

            {/* Cards */}
            {/* <div>
                <Cards userStats={userStats} />
            </div> */}

            {/* Pending Vendor Reviews Widget */}
            {pendingVendorReviews && (pendingVendorReviews.pendingProfiles > 0 || pendingVendorReviews.pendingServices > 0) && (
                <div className="px-4 md:px-12 lg:px-47 mb-6">
                    <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#FDB52A20] flex items-center justify-center text-[18px]">
                                    📋
                                </div>
                                <div>
                                    <h3 className="text-white text-[16px] font-[600]">Pending Vendor Reviews</h3>
                                    <p className="text-[#AEB9E1] text-[12px]">
                                        {pendingVendorReviews.pendingProfiles} vendor{pendingVendorReviews.pendingProfiles !== 1 ? 's' : ''} &middot; {pendingVendorReviews.pendingServices} service{pendingVendorReviews.pendingServices !== 1 ? 's' : ''} awaiting review
                                    </p>
                                </div>
                            </div>
                            <a
                                href="/superadmin/users/service-providers"
                                className="bg-[#0E43FB] text-white text-[12px] px-4 py-2 rounded-[5px] hover:bg-[#0A36D6] transition-colors"
                            >
                                Review All
                            </a>
                        </div>
                        {pendingVendorReviews.recentSubmissions && pendingVendorReviews.recentSubmissions.length > 0 && (
                            <div className="space-y-2">
                                {pendingVendorReviews.recentSubmissions.map((sub) => (
                                    <div key={sub.key || `vendor-${sub.id}`} className="flex items-center justify-between bg-[#081028] rounded-lg px-3 py-2">
                                        <div className="flex flex-col">
                                            <span className="text-[#E0E6F7] text-[13px]">{sub.company || sub.name}</span>
                                            <span className="text-[#AEB9E1] text-[11px]">
                                                {sub.hasProfile && sub.serviceCount > 0
                                                    ? `Profile + ${sub.serviceCount} service${sub.serviceCount > 1 ? 's' : ''} pending review`
                                                    : sub.hasProfile
                                                        ? 'Profile pending review'
                                                        : `Service pending review: ${(sub.serviceLabels || []).join(', ')}`
                                                }
                                                {sub.company ? ` (${sub.name})` : ''}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[#AEB9E1] text-[11px]">{sub.submitted_at}</span>
                                            <a
                                                href={`/superadmin/users/service-providers/${sub.id}/review`}
                                                className="text-[#5B8DEF] text-[11px] hover:text-[#0E43FB] transition-colors"
                                            >
                                                Review →
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Bookings Section */}
            <div className="px-4 md:px-12 lg:px-47">
                <div className="xl:w-[1125px] xl:h-[42px] text-white text-[24px] font-[600] mt-[10px]">
                    Bookings Overview
                </div>
                
                {/* Land Bookings Table with expandable details */}
                <LandBookingTable 
                    bookings={filteredLandBookings}
                />

                {/* Air Bookings Table with expandable details */}
                <AirBookingTable 
                    bookings={filteredAirBookings}
                />

                {/* Sea Bookings Table with expandable details */}
                <SeaBookingTable 
                    bookings={filteredSeaBookings}
                />

                {/* Warehouse Bookings Table */}
                <BookingTable 
                    title="Warehouse Bookings" 
                    bookings={filteredWarehouseBookings}
                    showCompanyName={true}
                />
            </div>
        </div>
    );
};

export default RightSide;
