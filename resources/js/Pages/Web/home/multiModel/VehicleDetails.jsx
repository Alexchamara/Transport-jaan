
import React from "react";
import Header from "./HeaderTwo";
import VehicleImages from "../../components/multiModel/vehicleDetails/VehicleImages";
import VehicleInfo from "../../components/multiModel/vehicleDetails/VehicleInfo";
import VehicleSearch from "../../components/multiModel/vehicleDetails/VehicleSearch";
import Suggestions from "../../components/multiModel/vehicleDetails/Suggestions";

const VehicleDetails = () => {
    return (
        <div>
            <Header />
            <div className="main-content flex justify-center items-center">
                <div className="py-10 md:px-10 flex flex-col xl:flex-row justify-between w-full gap-10">
                    <div className="flex flex-col gap-10 justify-start items-center w-full">
                        <VehicleImages />
                        <VehicleInfo />
                    </div>
                    <div className="flex flex-col justify-start items-center gap-10">
                        {" "}
                        <VehicleSearch />
                        {/* <Suggestions /> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleDetails;