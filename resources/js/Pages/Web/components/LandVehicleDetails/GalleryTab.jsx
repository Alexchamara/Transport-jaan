import React, { useState } from "react";
import img1 from "../../assets/landVehicleDetails/gallery/img1.svg";
import img2 from "../../assets/landVehicleDetails/gallery/img2.svg";
import img3 from "../../assets/landVehicleDetails/gallery/img3.svg";
import img4 from "../../assets/landVehicleDetails/gallery/img4.svg";
import img5 from "../../assets/landVehicleDetails/gallery/img5.svg";
import img6 from "../../assets/landVehicleDetails/gallery/img6.svg";
import img7 from "../../assets/landVehicleDetails/gallery/img7.svg";
import img8 from "../../assets/landVehicleDetails/gallery/img8.svg";
import img9 from "../../assets/landVehicleDetails/gallery/img9.svg";
import img10 from "../../assets/landVehicleDetails/gallery/img10.svg";
import img11 from "../../assets/landVehicleDetails/gallery/img11.svg";
import img12 from "../../assets/landVehicleDetails/gallery/img12.svg";
import img13 from "../../assets/landVehicleDetails/gallery/img13.svg";
import img14 from "../../assets/landVehicleDetails/gallery/img14.svg";
import img15 from "../../assets/landVehicleDetails/gallery/img15.svg";
import img16 from "../../assets/landVehicleDetails/gallery/img16.svg";

import leftArrow from "../../assets/landVehicleDetails/gallery/leftArrow.svg";
import rightArrow from "../../assets/landVehicleDetails/gallery/rightArrow.svg";

const images = [
    img1,
    img2,
    img3,
    img4,
    img5,
    img6,
    img7,
    img8,
    img9,
    img10,
    img11,
    img12,
    img13,
    img14,
    img15,
    img16,
];

const GalleryTab = () => {
    const [selectedImg, setSelectedImg] = useState(null);
    const [selectedIdx, setSelectedIdx] = useState(null);

    const openImage = (img, idx) => {
        setSelectedImg(img);
        setSelectedIdx(idx);
    };

    const closeImage = () => {
        setSelectedImg(null);
        setSelectedIdx(null);
    };

    const showPrev = (e) => {
        e.stopPropagation();
        if (selectedIdx > 0) {
            setSelectedImg(images[selectedIdx - 1]);
            setSelectedIdx(selectedIdx - 1);
        }
    };

    const showNext = (e) => {
        e.stopPropagation();
        if (selectedIdx < images.length - 1) {
            setSelectedImg(images[selectedIdx + 1]);
            setSelectedIdx(selectedIdx + 1);
        }
    };

    return (
        <div className="relative w-auto xl:w-[880px] flex justify-center items-center">
            <div className="grid grid-cols-4 grid-rows-4 gap-5">
                {images.map((img, idx) => (
                    <img
                        key={idx}
                        src={img}
                        className="cursor-pointer"
                        onClick={() => openImage(img, idx)}
                        alt={`Gallery ${idx + 1}`}
                    />
                ))}
            </div>
            {selectedImg && (
                <div
                    className="absolute inset-0 bg-[#000000BF] rounded-[20px] bg-opacity-90 flex items-center justify-center z-20"
                    onClick={closeImage}
                >
                    <div
                        className="relative flex items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Left Arrow */}
                        <button
                            onClick={showPrev}
                            disabled={selectedIdx === 0}
                            className="absolute left-[-60px] xl:left-[-80px] top-1/2 transform -translate-y-1/2 bg-transparent border-none focus:outline-none disabled:opacity-30 z-30"
                        >
                            <img
                                src={leftArrow}
                                alt="Previous"
                                className="w-[30px] h-[53px]"
                            />
                        </button>
                        {/* Enlarged Image */}
                        <img
                            src={selectedImg}
                            alt="Enlarged"
                            className="xl:w-[511px] xl:h-[511px] rounded shadow-lg"
                        />
                        {/* Right Arrow */}
                        <button
                            onClick={showNext}
                            disabled={selectedIdx === images.length - 1}
                            className="absolute right-[-60px] xl:right-[-80px] top-1/2 transform -translate-y-1/2 bg-transparent border-none focus:outline-none disabled:opacity-30 z-30"
                        >
                            <img
                                src={rightArrow}
                                alt="Next"
                                className="w-[30px] h-[53px]"
                            />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryTab;
