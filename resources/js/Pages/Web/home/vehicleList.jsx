import React, { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import Header from "../layouts/Header";
import FilterSidebar from "../components/vehicleList/FilterSidebar";
import VehicleListContent from "../components/vehicleList/VehicleListContent";
import SearchForm from "../components/vehicleList/SearchForm";
import bg from "../assets/rentAVehicle/bg/bg.png";

const VehicleList = () => {
  const { props } = usePage();

  const [formData, setFormData] = useState({
    pickupLocation: "",
    pickupDate: "",
    dropoffLocation: "",
    dropoffDate: "",
    brand: "",
    bodyType: "",
  });

  useEffect(() => {
    if (props.filters) {
      setFormData((prevData) => ({
        ...prevData,
        ...props.filters,
      }));
    }
  }, [props.filters]);

  const handleFormChange = (newData) => {
    setFormData(newData);
  };

  return (
    <div className="vehicle-list-page">
      <Header />
      <div className="main-content flex">
        <FilterSidebar searchParams={formData} />
        <div className="vehicle-list-container flex-1">
          <SearchForm formData={formData} onFormChange={handleFormChange} />
          <VehicleListContent
            vehicles={props.vehicles}
            authUser={props.auth.user}                //pass the logged-in user
            likedVehicleIds={props.likedVehicleIds} //pass liked vehicles
          />
        </div>
      </div>
    </div>
  );
};

export default VehicleList;
