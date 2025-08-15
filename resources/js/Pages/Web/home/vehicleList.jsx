import React, { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import Header from "../layouts/Header";
import FilterSidebar from "../components/vehicleList/FilterSidebar";
import VehicleListContent from "../components/vehicleList/VehicleListContent";
import SearchForm from "../components/vehicleList/searchForm";
import bg from "../assets/rentAVehicle/bg/bg.png"

const VehicleList = () => {
  const { props } = usePage();
  const [formData, setFormData] = useState({
    pickupLocation: "",
    pickupDate: "",
    dropoffLocation: "",
    dropoffDate: "",
    brand: "",
    bodyType: ""
  });

  useEffect(() => {
    // Update form data when search params change
    if (props.searchParams) {
      setFormData(prevData => ({
        ...prevData,
        ...props.searchParams
      }));
    }
  }, [props.searchParams]);

  const handleFormChange = (newData) => {
    setFormData(newData);
  };

  return (
    <div className="vehicle-list-page">
      <Header />
      <div 
        className="main-content flex"
        // style={{
        //   backgroundImage: `url(${bg})`,
        //   backgroundSize: 'cover',
        //   backgroundPosition: 'center',
        //   backgroundRepeat: 'no-repeat',
        //   minHeight: 'calc(100vh - 80px)'
        // }}
      >
        <FilterSidebar searchParams={formData} />
        <div className="vehicle-list-container flex-1">
          <SearchForm 
            formData={formData} 
            onFormChange={handleFormChange}
          />
          <VehicleListContent vehicles={props.vehicles} />
        </div>
      </div>
    </div>
  );
};

export default VehicleList;
