import React, { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import Header from "../layouts/Header";
import HeroSection from "../components/rentAVehicle/HeroSection";
import RentByBrands from "../components/rentAVehicle/RentByBrands";
import RentByBodyType from "../components/rentAVehicle/RentByBodyType";
import VehicleCollection from "../components/rentAVehicle/VehicleCollection";
import PopularRentals from "../components/rentAVehicle/PopularRentals";
import HowItWorks from "../components/rentAVehicle/HowItWorks";
import Footer from "../layouts/Footer";

const HomePage = ({ auth }) => {
    const { bodyTypes } = usePage().props;

    const [formData, setFormData] = useState({
        pickupLocation: "",
        pickupDate: "",
        dropoffLocation: "",
        dropoffDate: "",
    });

    const [selectedVehicleType, setSelectedVehicleType] = useState("other");

    const handleFormChange = (newData) => setFormData(newData);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!auth?.user) {
            alert("You must be registered and logged in to find a vehicle.");
            window.location.href = "/register";
            return;
        }
        router.visit("/couriers", {
            data: { searchParams: formData },
            method: "get",
        });
    };

    return (
        <div className="relative flex flex-col">
            <Header />
            <HeroSection
                formData={formData}
                onFormChange={handleFormChange}
                onSubmit={handleFormSubmit}
                onVehicleTypeChange={setSelectedVehicleType}
            />
            <RentByBrands selectedType={selectedVehicleType} />
            <RentByBodyType selectedType={selectedVehicleType} />
            <VehicleCollection />
            <PopularRentals />
            <HowItWorks />
            <Footer />
        </div>
    );
};

export default HomePage;
