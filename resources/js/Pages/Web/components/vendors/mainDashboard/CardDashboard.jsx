import React from 'react'
import Card from "./Card";

const CardDashboard = () => {
  const services = [
    { 
      title: 'Vehicle Rental', 
      description: 'Rent vehicles for your transportation needs.',
      // subOptions: ['Land', 'Air', 'Sea']   //  Added sub options
    },
    { title: 'Ticket Booking', description: 'Book tickets for travel and events.' },
    { title: 'Courier Service', description: 'Send and track packages efficiently.' },
    { title: 'Warehouse Rental', description: 'Rent warehouse space for storage.' },
    { title: 'Freight', description: 'Manage freight shipments and logistics.' },
    { title: 'Multimodal', description: 'Handle multimodal transportation solutions.' },
  ];

  return (
    <div className='flex flex-col justify-start items-center px-10 py-20 relative h-full'>
      <h1 className="text-[40px] font-[700] text-[#0955AC] absolute top-0 xl:left-20 poppins">Dashboard</h1>
      <div className='w-full rounded-[10px] mb-20 text-[44px] font-[700] xl:pl-10 poppins'> Hello, Steve 👋</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {services.map((service, index) => (
          <Card
            key={index}
            index={index + 1}
            title={service.title}
            description={service.description}
            subOptions={service.subOptions}   //  Pass subOptions
          />
        ))}
      </div>
    </div>
  );
};

export default CardDashboard;