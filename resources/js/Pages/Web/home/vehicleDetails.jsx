import React, { useMemo } from "react";
import { usePage } from "@inertiajs/react";
import Header from "../layouts/Header";
import FilterSidebar from "../components/vehicleList/FilterSidebar";
import VehicleImageGallery from "../components/vehicleDetails/VehicleImageGallery";
import VehicleInformation from "../components/vehicleDetails/VehicleInformation";
import ReviewSection from "../components/vehicleDetails/ReviewSection";
import bg from "../assets/rentAVehicle/bg/bg.png";

const VehicleDetails = () => {
    const { props } = usePage();
    const { vehicle } = props;

    const memoizedVehicle = useMemo(() => {
        if (!vehicle) return null;
        return {
            ...vehicle,
            name: vehicle.model || vehicle.name,
            price: vehicle.price,
            image: vehicle.image,
        };
    }, [vehicle]);

    if (!memoizedVehicle) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl">No vehicle selected</p>
            </div>
        );
    }

    return (
        <div>
            <div
                className="main-content flex"
                style={{
                    backgroundImage: `url(${bg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    minHeight: "calc(100vh - 80px)",
                }}
            >
                <Header />
                <FilterSidebar searchParams={props.searchParams || {}} />
                <div className="vehicle-list-container flex-1 p-4 flex flex-col gap-10">
                    <div className="flex flex-col xl:flex-row justify-center items-center">
                        <VehicleImageGallery vehicle={memoizedVehicle} />
                        <VehicleInformation
                            vehicle={memoizedVehicle}
                            searchParams={props.searchParams || {}}
                        />
                    </div>
                    <ReviewSection />
                </div>
                <div></div>
            </div>
        </div>
    );
};

export default VehicleDetails;
