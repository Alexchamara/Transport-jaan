import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

// import car1 from '../../assets/vehicleDetails/car1.png'
import car2 from '../../assets/vehicleDetails/car2.png'
import car3 from '../../assets/vehicleDetails/car3.png'
import car4 from '../../assets/vehicleDetails/car4.png'
import car5 from '../../assets/vehicleDetails/car5.png'

const VehicleImageGallery = ({ vehicle }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const previewImages = useMemo(() => [car2, car3, car4, car5], []);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const closePopup = () => {
    setSelectedImage(null);
  };

  const mainImage = useMemo(() => (
    <div 
      className="main-image xl:w-[537px] h-[349px] bg-[#F4F3F3] rounded-[12px] flex items-center justify-center cursor-pointer" 
      onClick={() => handleImageClick(vehicle.image)}
    >
      <img 
        src={vehicle.image} 
        alt={vehicle.name} 
        className="w-full h-full object-contain rounded-md" 
      />
    </div>
  ), [vehicle.image, vehicle.name]);

  const imagePreviews = useMemo(() => (
    <div className="preview-images xl:w-[537px] flex flex-col gap-5 xl:flex-row justify-between mt-4">
      {previewImages.map((image, index) => (
        <img 
          key={index}
          src={image} 
          alt={`Vehicle Preview ${index + 1}`} 
          className="w-[120px] h-auto rounded-md cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => handleImageClick(image)} 
        />
      ))}
    </div>
  ), [previewImages]);

  return (
    <div className="vehicle-image-section w-1/2 flex-shrink-0 flex flex-col items-center mt-6">
      {mainImage}
      {imagePreviews}

      {selectedImage && (
        <div 
          className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50"
          onClick={closePopup}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img 
              src={selectedImage} 
              alt="Full size vehicle" 
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button 
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
              onClick={closePopup}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

VehicleImageGallery.propTypes = {
  vehicle: PropTypes.shape({
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
  }).isRequired,
};

export default VehicleImageGallery; 