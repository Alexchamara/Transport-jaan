import React, { useMemo } from "react";
import { usePage } from "@inertiajs/react";
import Header from "../../layouts/Header";
import VehicleImages from "../../components/LandVehicleDetails/VehicleImages";
import VehicleSearch from "../../components/LandVehicleDetails/VehicleSearch";
import VehicleInfo from "../../components/LandVehicleDetails/VehicleInfo";
import Suggestions from "../../components/LandVehicleDetails/Suggestions";
import bg from "../../assets/rentAVehicle/bg/bg.png";

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
            <Header />
            <div
                className="main-content flex justify-center items-center"
                // style={{
                //     backgroundImage: `url(${bg})`,
                //     backgroundSize: "cover",
                //     backgroundPosition: "center",
                //     backgroundRepeat: "no-repeat",
                //     minHeight: "calc(100vh - 80px)",
                // }}
            >
                <div className="py-20 md:px-10 flex flex-col xl:flex-row justify-center gap-20">
                    <div className="flex flex-col gap-10 justify-start items-center">
                        <VehicleImages />
                        <VehicleInfo />
                    </div>
                    <div className="flex flex-col justify-start items-center gap-10">
                        {" "}
                        <VehicleSearch />
                        <Suggestions />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleDetails;
