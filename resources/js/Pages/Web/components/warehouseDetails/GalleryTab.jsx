import React, { useState } from "react";
import { usePage } from "@inertiajs/react";

const GalleryTab = ({ warehouse }) => {
  const { props } = usePage();
  const warehouseData = warehouse || props?.warehouse;
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Build comprehensive image list
  const getAllImages = () => {
    const images = [];
    
    // Add primary image if exists
    if (warehouseData?.primary_image_url) {
      images.push({
        url: warehouseData.primary_image_url,
        caption: `${warehouseData.name} - Main View`,
        type: 'primary'
      });
    }

    // Add additional images
    const additionalImages = warehouseData?.images || [];
    additionalImages.forEach((img, index) => {
      let imageUrl;
      let caption = `${warehouseData?.name || 'Warehouse'} - View ${index + 1}`;
      
      if (typeof img === 'string') {
        imageUrl = img.startsWith('/storage/') ? img : `/storage/${img}`;
      } else if (img?.url) {
        imageUrl = img.url;
        caption = img.caption || caption;
      } else if (img?.image_path) {
        imageUrl = `/storage/${img.image_path}`;
        caption = img.caption || caption;
      } else if (img?.path) {
        imageUrl = `/storage/${img.path}`;
        caption = img.caption || caption;
      }

      if (imageUrl && !images.some(existing => existing.url === imageUrl)) {
        images.push({
          url: imageUrl,
          caption,
          type: 'gallery'
        });
      }
    });

    // Add placeholder if no images
    if (images.length === 0) {
      images.push({
        url: 'https://via.placeholder.com/600x400?text=No+Images+Available',
        caption: 'No images available',
        type: 'placeholder'
      });
    }

    return images;
  };

  const images = getAllImages();

  const openLightbox = (image, index) => {
    setSelectedImage(image);
    setCurrentIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    setCurrentIndex(0);
  };

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    setCurrentIndex(nextIndex);
    setSelectedImage(images[nextIndex]);
  };

  const prevImage = () => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentIndex(prevIndex);
    setSelectedImage(images[prevIndex]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'Escape') closeLightbox();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Image Gallery ({images.length} photo{images.length !== 1 ? 's' : ''})
        </h3>
        <div className="text-sm text-gray-500">
          Click any image to view in full size
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-100 aspect-[4/3]"
            onClick={() => openLightbox(image, index)}
          >
            <img
              src={image.url}
              alt={image.caption}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
              }}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>

            {/* Image type badge */}
            {image.type === 'primary' && (
              <div className="absolute top-2 left-2 bg-[#0955AC] text-white text-xs px-2 py-1 rounded">
                Main Photo
              </div>
            )}

            {/* Caption overlay on hover */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-white text-sm truncate">{image.caption}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Image Information */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-gray-700 mb-2">About These Photos</h4>
        <p className="text-sm text-gray-600">
          These images showcase the warehouse facility, including interior views, exterior shots, 
          and available amenities. All photos are provided by the warehouse owner and represent 
          the current condition of the facility.
        </p>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
          onKeyDown={handleKeyPress}
          tabIndex={0}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Previous button */}
            {images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Next button */}
            {images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Main image */}
            <div className="relative">
              <img
                src={selectedImage.url}
                alt={selectedImage.caption}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              
              {/* Image info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 rounded-b-lg">
                <div className="text-white">
                  <p className="font-medium">{selectedImage.caption}</p>
                  <p className="text-sm opacity-75">
                    {currentIndex + 1} of {images.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Stats */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-[#0955AC]">{images.length}</div>
            <div className="text-sm text-gray-600">Total Photos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0955AC]">
              {images.filter(img => img.type === 'primary').length}
            </div>
            <div className="text-sm text-gray-600">Main Photos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0955AC]">
              {images.filter(img => img.type === 'gallery').length}
            </div>
            <div className="text-sm text-gray-600">Gallery Photos</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryTab;