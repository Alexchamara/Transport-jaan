import React, { useEffect, useState } from 'react'
import { usePage } from '@inertiajs/react';
import Card from "./Card";

const CardDashboard = () => {
  const { auth } = usePage().props;
  const approvedSlugs = auth?.user?.approved_service_slugs || [];
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setToastMessage('');
    }, 3000);

    return () => clearTimeout(timer);
  }, [toastMessage]);

  const showAccessMessage = (message) => {
    setToastMessage(message || 'To access this service, please register and wait for admin verification.');
  };

  const canAccessService = (serviceKey) => {
    switch (serviceKey) {
      case 'vehicle':
        return approvedSlugs.includes('vehicle-rental');
      case 'ticket':
        return approvedSlugs.includes('aviation-service') || approvedSlugs.includes('railway-service');
      case 'courier':
        return approvedSlugs.includes('courier-services');
      case 'warehouse':
        return approvedSlugs.includes('warehousing');
      case 'freight':
        return approvedSlugs.includes('waterborne-transport');
      case 'multimodal':
        return approvedSlugs.includes('vehicle-rental')
          || approvedSlugs.includes('aviation-service')
          || approvedSlugs.includes('railway-service')
          || approvedSlugs.includes('waterborne-transport');
      default:
        return false;
    }
  };

  const services = [
    { 
      key: 'vehicle',
      title: 'Vehicle Rental', 
      description: 'Rent vehicles for your transportation needs.',
      // subOptions: ['Land', 'Air', 'Sea']   //  Added sub options
    },
    { key: 'ticket', title: 'Ticket Booking', description: 'Book tickets for travel and events.' },
    { key: 'courier', title: 'Courier Service', description: 'Send and track packages efficiently.' },
    { key: 'warehouse', title: 'Warehousing', description: 'Rent warehouse space for storage.' },
    { key: 'freight', title: 'Freight', description: 'Manage freight shipments and logistics.' },
    { key: 'multimodal', title: 'Multimodal', description: 'Handle multimodal transportation solutions.' },
  ];

  return (
    <div className='flex flex-col justify-start items-center px-10 py-20 relative h-full'>
      {toastMessage && (
        <div className='fixed top-6 right-6 z-50 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 shadow-md'>
          {toastMessage}
        </div>
      )}
      <h1 className="text-[40px] font-[700] text-[#0955AC] absolute top-0 xl:left-20 poppins">Dashboard</h1>
      <div className='w-full rounded-[10px] mb-20 text-[44px] font-[700] xl:pl-10 poppins'> Hello, Steve 👋</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {services.map((service, index) => (
          <Card
            key={service.key}
            index={index + 1}
            title={service.title}
            description={service.description}
            canAccess={canAccessService(service.key)}
            onAccessDenied={showAccessMessage}
            subOptions={service.subOptions}   //  Pass subOptions
          />
        ))}
      </div>
    </div>
  );
};

export default CardDashboard;