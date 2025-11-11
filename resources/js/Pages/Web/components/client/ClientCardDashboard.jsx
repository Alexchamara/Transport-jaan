import React from 'react'
import ClientCard from "./ClientCard";
import { usePage } from '@inertiajs/react';

const ClientCardDashboard = () => {
  const { auth } = usePage().props;

  const services = [
    {
      title: 'Vehicle Rental',
      description: 'Find and rent vehicles for your transportation needs.',
      icon: '🚗',
      route: '/clientRent',
      subOptions: [
        { name: 'Cars & SUVs', route: '/clientRent?type=land' },
        { name: 'Aircraft', route: '/clientRent?type=air' },
        { name: 'Boats & Ships', route: '/clientRent?type=sea' }
      ]
    },
    {
      title: 'Ticket Booking',
      description: 'Book tickets for flights, trains, and buses.',
      icon: '🎫',
      route: '/ticketBooking',
      subOptions: [
        { name: 'Flight Tickets', route: '/flightBooking' },
        { name: 'Train Tickets', route: '/trainTicketBookingDetails' },
        { name: 'Bus Tickets', route: '/busTicketBookingDetails' }
      ]
    },
    {
      title: 'Courier Service',
      description: 'Send packages and track shipments.',
      icon: '📦',
      route: '/courier-service',
      subOptions: [
        { name: 'Book Courier', route: '/courier-service' },
        { name: 'My Courier Bookings', route: '/courierBookingDashboard' }
      ]
    },
    {
      title: 'Warehouse Services',
      description: 'Find warehouse space and storage solutions.',
      icon: '🏢',
      route: '/warehouse',
      subOptions: [
        { name: 'Find Warehouses', route: '/warehouseList' },
        { name: 'Book Storage', route: '/warehouse-bookings' },
        { name: 'My Warehouse Bookings', route: '/warehouseBookingDashboard' }
      ]
    },
    {
      title: 'Freight Services',
      description: 'Shipping and freight management services.',
      icon: '🚛',
      route: '/cargo-freight',
      subOptions: [
        { name: 'Get Quote', route: '/freight-home' },
        { name: 'Book Freight', route: '/cargo-freight' },
        { name: 'My Freight Bookings', route: '/freightBookingDashboard' }
      ]
    },
    {
      title: 'My Bookings',
      description: 'View and manage all your bookings.',
      icon: '📋',
      route: '/dashboard/view',
      subOptions: [
        { name: 'All Bookings', route: '/dashboard/view' },
        { name: 'Flight Bookings', route: '/user/flight-view' },
        { name: 'Multimodal - Coming Soon', route: null, disabled: true }
      ]
    },
  ];

  return (
    <div className='flex flex-col justify-start items-center px-10 py-20 relative h-full'>
      <h1 className="text-[40px] font-[700] text-[#0955AC] absolute top-0 left-20 poppins">Client Dashboard</h1>
      <div className='w-full rounded-[10px] mb-20 text-[44px] font-[700] pl-10 poppins'>
        Hello, {auth?.user?.name || 'Guest'} 👋
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {services.map((service, index) => (
          <ClientCard
            key={index}
            title={service.title}
            description={service.description}
            icon={service.icon}
            route={service.route}
            subOptions={service.subOptions}
          />
        ))}
      </div>
    </div>
  );
};

export default ClientCardDashboard;
