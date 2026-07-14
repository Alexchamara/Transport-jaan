import React from "react";
import imgOne from "../../../assets/landVehicleDetails/imgOne.png";
import imgTwo from "../../../assets/landVehicleDetails/imgTwo.png";
import imgThree from "../../../assets/landVehicleDetails/imgThree.png";
import imgFour from "../../../assets/landVehicleDetails/imgFour.png";
import imgFive from "../../../assets/landVehicleDetails/imgFive.png";
import leftArrow from "../../../assets/multiModel/busDetails/leftArrow.svg";
import { Link } from "@inertiajs/react";

const VehicleImages = ({ vehicle }) => {
    const images = vehicle?.images || [];
    const mainImage = images.length > 0 ? images[0].url : imgOne;
    const galleryImages = images.slice(1, 5);
    
    return (
        <div className="xl:w-[844px] xl:h-[435px] rounded-[22px]">
            <div className="relative flex flex-col xl:flex-row justify-center gap-[14px] items-center">
                <div className="absolute -top-3 -left-3 flex justify-center items-center bg-[#FFFFFF] rounded-[10px] size-[65px]">
                    <Link
                        href="/multiModel/plan-journey"
                        className="size-[40px] bg-[#0955AC] rounded-[10px] flex justify-center items-center cursor-pointer"
                    >
                        <img src={leftArrow} alt="Left Arrow" />
                    </Link>
                </div>
                <img src={mainImage} className="w-[200px] rounded-[22px] xl:rounded-[0px] md:w-[420px] object-cover" alt="Main vehicle" />
                <div className="hidden xl:flex flex-col gap-[14px]">
                    {galleryImages[0] ? <img src={galleryImages[0].url} className="w-[200px] h-[200px] object-cover rounded-[10px]" alt="Gallery 1" /> : <img src={imgTwo} />}
                    {galleryImages[1] ? <img src={galleryImages[1].url} className="w-[200px] h-[200px] object-cover rounded-[10px]" alt="Gallery 2" /> : <img src={imgThree} />}
                </div>
                <div className="hidden xl:flex flex-col gap-[14px]">
                    {galleryImages[2] ? <img src={galleryImages[2].url} className="w-[200px] h-[200px] object-cover rounded-[10px]" alt="Gallery 3" /> : <img src={imgFour} />}
                    {galleryImages[3] ? <img src={galleryImages[3].url} className="w-[200px] h-[200px] object-cover rounded-[10px]" alt="Gallery 4" /> : <img src={imgFive} />}
                </div>
            </div>
        </div>
    );
};

export default VehicleImages;
