import React, { useState } from "react";
import { usePage } from "@inertiajs/react";

const WarehouseImages = () => {
  const { props } = usePage();
  const { warehouse } = props;
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Handle images - warehouse.images is an array of image paths
  const images = warehouse?.images || [];
  const hasImages = images.length > 0;

  // Fallback image if no images available
  const fallbackImage = 'https://via.placeholder.com/600x400?text=Warehouse+Image';

  const handleImageSelect = (index) => {
    setSelectedImageIndex(index);
  };

  const handlePrevImage = () => {
    setSelectedImageIndex(prev => 
      prev > 0 ? prev - 1 : images.length - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex(prev => 
      prev < images.length - 1 ? prev + 1 : 0
    );
  };

  return (
    <div className="w-full max-w-[600px] mx-auto">
      {/* Main Image Display */}
      <div className="relative mb-4">
        <div className="aspect-[4/3] w-full bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={hasImages ? `/storage/${images[selectedImageIndex]}` : fallbackImage}
            alt={warehouse?.name || 'Warehouse'}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Navigation Arrows - Only show if multiple images */}
        {hasImages && images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image Counter */}
        {hasImages && images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {selectedImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery - Only show if multiple images */}
      {hasImages && images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => handleImageSelect(index)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                selectedImageIndex === index
                  ? 'border-[#0955AC] ring-2 ring-[#0955AC] ring-opacity-50'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <img
                src={`/storage/${image}`}
                alt={`${warehouse?.name} - Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* No Images Message */}
      {!hasImages && (
        <div className="text-center text-gray-500 mt-4">
          <p className="poppins text-sm">No images available for this warehouse</p>
        </div>
      )}
    </div>
  );
};

export default WarehouseImages;