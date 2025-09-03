import React, { useState } from "react";
import leftArrow from "../../../../assets/landVehicleDetails/gallery/leftArrow.svg";
import rightArrow from "../../../../assets/landVehicleDetails/gallery/rightArrow.svg";

const GalleryTab = ({ warehouseData = {} }) => {
    const [selectedImg, setSelectedImg] = useState(null);
    const [selectedIdx, setSelectedIdx] = useState(null);

    // Use warehouse images from data or show placeholder
    const images = warehouseData.images && warehouseData.images.length > 0 
        ? warehouseData.images.map(img => img.startsWith('/storage') ? img : `/storage/${img}`)
        : ['/storage/warehouse/placeholder-gallery.jpg']; // Placeholder if no images

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
            {images.length === 1 && warehouseData.images?.length === 0 ? (
                // No images placeholder
                <div className="w-full h-[400px] bg-[#F8F9FA] rounded-lg flex flex-col justify-center items-center text-[#7B7B7A]">
                    <div className="text-[48px] mb-4">📷</div>
                    <h3 className="text-lg font-semibold mb-2">No Images Available</h3>
                    <p className="text-sm">Images for this warehouse haven't been uploaded yet.</p>
                </div>
            ) : (
                <div className={`grid gap-5 ${
                    images.length === 1 ? 'grid-cols-1' :
                    images.length <= 4 ? 'grid-cols-2' :
                    images.length <= 9 ? 'grid-cols-3' :
                    'grid-cols-4'
                }`}>
                    {images.map((img, idx) => (
                        <div key={idx} className="relative group">
                            <img
                                src={img}
                                className="cursor-pointer w-full h-[200px] object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                                onClick={() => openImage(img, idx)}
                                alt={`Warehouse ${idx + 1}`}
                                onError={(e) => {
                                    e.target.src = '/storage/warehouse/placeholder-gallery.jpg';
                                }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    Click to enlarge
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {selectedImg && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
                    onClick={closeImage}
                >
                    <div
                        className="relative flex items-center max-w-[90vw] max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Left Arrow */}
                        {images.length > 1 && (
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
                        )}
                        
                        {/* Enlarged Image */}
                        <img
                            src={selectedImg}
                            alt="Enlarged warehouse view"
                            className="max-w-full max-h-full rounded shadow-lg"
                            onError={(e) => {
                                e.target.src = '/storage/warehouse/placeholder-gallery.jpg';
                            }}
                        />
                        
                        {/* Right Arrow */}
                        {images.length > 1 && (
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
                        )}
                        
                        {/* Close button */}
                        <button
                            onClick={closeImage}
                            className="absolute top-[-40px] right-0 text-white text-2xl font-bold hover:text-gray-300"
                        >
                            ×
                        </button>
                        
                        {/* Image counter */}
                        {images.length > 1 && (
                            <div className="absolute bottom-[-40px] left-1/2 transform -translate-x-1/2 text-white text-sm">
                                {selectedIdx + 1} / {images.length}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalleryTab;
