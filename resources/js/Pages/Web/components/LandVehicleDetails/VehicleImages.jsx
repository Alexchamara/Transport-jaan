import React from "react";
import imgOne from "../../assets/landVehicleDetails/imgOne.png";
import imgTwo from "../../assets/landVehicleDetails/imgTwo.png";
import imgThree from "../../assets/landVehicleDetails/imgThree.png";
import imgFour from "../../assets/landVehicleDetails/imgFour.png";
import imgFive from "../../assets/landVehicleDetails/imgFive.png";

const VehicleImages = () => {
    return (
        <div className="xl:w-[844px] xl:h-[435px] rounded-[22px]">
            <div className="flex flex-col xl:flex-row justify-center gap-[14px] items-center">
                <img src={imgOne} className="w-[200px] md:w-[420px]" />
                <div className="flex flex-col gap-[14px]">
                    <img src={imgTwo} />
                    <img src={imgThree} />
                </div>
                <div className="flex flex-col gap-[14px]">
                    <img src={imgFour} />
                    <img src={imgFive} />
                </div>
            </div>
        </div>
    );
};

export default VehicleImages;
