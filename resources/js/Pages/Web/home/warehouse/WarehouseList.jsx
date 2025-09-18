import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import Header from "../../layouts/Header";
import Footer from "../../layouts/Footer";
import WarehouseFilterSidebar from "../../components/warehouseList/WarehouseFilterSidebar";
import WarehouseSearchForm from "../../components/warehouseList/WarehouseSearchForm";
import WarehouseListContent from "../../components/warehouseList/WarehouseListContent";

const WarehouseList = ({ warehouses, searchParams }) => {
  const [formData, setFormData] = useState({
    warehouseLocation: searchParams?.warehouseLocation || '',
    requiredSpace: searchParams?.requiredSpace || '',
    moveinDate: searchParams?.moveinDate || '',
    leaseDuration: searchParams?.leaseDuration || ''
  });

  const handleFormChange = (newFormData) => {
    setFormData(newFormData);
  };

  return (
    <div>
      <Head title="Find Warehouses - Transport Jaan" />
      <Header />
      
      <div className="bg-[#FBFCFF] min-h-screen">
        {/* Search Form Section */}
        <div className="bg-[#0B1B3B] pt-20 pb-10">
          <div className="container mx-auto flex justify-center">
            <WarehouseSearchForm 
              formData={formData} 
              onFormChange={handleFormChange} 
            />
          </div>
        </div>

        {/* Main Content Section */}
        <div className="container mx-auto flex">
          {/* Filter Sidebar */}
          <WarehouseFilterSidebar searchParams={searchParams} />
          
          {/* Warehouse List Content */}
          <div className="flex-1">
            <WarehouseListContent warehouses={warehouses} />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default WarehouseList;