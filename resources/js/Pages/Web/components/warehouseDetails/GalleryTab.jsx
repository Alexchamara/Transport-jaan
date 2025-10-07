import React, { useState } from "react";
import { usePage } from "@inertiajs/react";

const GalleryTab = ({ warehouse }) => {
  const { props } = usePage();
  const warehouseData = warehouse || props?.warehouse;
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Build comprehensive image list from database relationships
  const getAllImages = () => {
    const images = [];
    
    // Add main image from relationship if exists
    if (warehouseData?.main_image) {
      const mainImg = warehouseData.main_image;
      images.push({
        id: mainImg.id,
        url: mainImg.url || `/storage/${mainImg.file_path}`,
        caption: mainImg.caption || mainImg.alt_text || `${warehouseData.name} - Main View`,
        type: 'main',
        alt_text: mainImg.alt_text,
        sort_order: 0
      });
    }

    // Add gallery images from relationship
    const galleryImages = warehouseData?.gallery_images || warehouseData?.images || [];
    galleryImages.forEach((img, index) => {
      if (!img.id) return; // Skip if not a proper image object
      
      const imageUrl = img.url || (img.file_path ? `/storage/${img.file_path}` : null);
      if (!imageUrl) return;

      // Don't duplicate main image
      const isDuplicate = images.some(existing => existing.id === img.id);
      if (isDuplicate) return;

      images.push({
        id: img.id,
        url: imageUrl,
        caption: img.caption || img.alt_text || `${warehouseData?.name || 'Warehouse'} - View ${index + 1}`,
        type: img.type || 'gallery',
        alt_text: img.alt_text || '',
        sort_order: img.sort_order || index + 1,
        file_size: img.file_size,
        dimensions: img.dimensions
      });
    });

    // Add active images from general images relationship
    const activeImages = warehouseData?.active_images || [];
    activeImages.forEach((img, index) => {
      if (!img.id) return;
      
      const imageUrl = img.url || (img.file_path ? `/storage/${img.file_path}` : null);
      if (!imageUrl) return;

      // Don't duplicate existing images
      const isDuplicate = images.some(existing => existing.id === img.id);
      if (isDuplicate) return;

      images.push({
        id: img.id,
        url: imageUrl,
        caption: img.caption || img.alt_text || `${warehouseData?.name || 'Warehouse'} - Image ${images.length + 1}`,
        type: img.type || 'gallery',
        alt_text: img.alt_text || '',
        sort_order: img.sort_order || images.length + 1,
        file_size: img.file_size,
        dimensions: img.dimensions
      });
    });

    // Fallback: Handle legacy image data structures
    if (images.length === 0) {
      // Check for primary_image_url (legacy)
      if (warehouseData?.primary_image_url) {
        images.push({
          id: 'legacy-main',
          url: warehouseData.primary_image_url,
          caption: `${warehouseData.name} - Main View`,
          type: 'main',
          sort_order: 0
        });
      }

      // Check for legacy images array
      const legacyImages = warehouseData?.images || [];
      if (Array.isArray(legacyImages)) {
        legacyImages.forEach((img, index) => {
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
          } else if (img?.file_path) {
            imageUrl = `/storage/${img.file_path}`;
            caption = img.caption || img.alt_text || caption;
          }

          if (imageUrl && !images.some(existing => existing.url === imageUrl)) {
            images.push({
              id: `legacy-${index}`,
              url: imageUrl,
              caption,
              type: 'gallery',
              sort_order: index + 1
            });
          }
        });
      }
    }

    // Sort images by sort_order, then by type (main first)
    images.sort((a, b) => {
      if (a.type === 'main' && b.type !== 'main') return -1;
      if (b.type === 'main' && a.type !== 'main') return 1;
      return (a.sort_order || 0) - (b.sort_order || 0);
    });

    // Add placeholder if no images found
    if (images.length === 0) {
      images.push({
        id: 'placeholder',
        url: 'https://via.placeholder.com/600x400?text=No+Images+Available',
        caption: 'No images available for this warehouse',
        type: 'placeholder',
        sort_order: 0
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

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Helper function to get image dimensions text
  const getImageDimensions = (image) => {
    if (image.dimensions && Array.isArray(image.dimensions) && image.dimensions.length >= 2) {
      return `${image.dimensions[0]} × ${image.dimensions[1]}`;
    }
    return null;
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
            {(image.type === 'primary' || image.type === 'main') && (
              <div className="absolute top-2 left-2 bg-[#0955AC] text-white text-xs px-2 py-1 rounded">
                Main Photo
              </div>
            )}

            {/* File size badge for non-placeholder images */}
            {image.file_size && image.type !== 'placeholder' && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                {formatFileSize(image.file_size)}
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
                  <div className="flex items-center justify-between text-sm opacity-75 mt-1">
                    <span>{currentIndex + 1} of {images.length}</span>
                    <div className="flex items-center gap-3">
                      {selectedImage.file_size && (
                        <span>{formatFileSize(selectedImage.file_size)}</span>
                      )}
                      {getImageDimensions(selectedImage) && (
                        <span>{getImageDimensions(selectedImage)} px</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Stats */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-[#0955AC]">{images.length}</div>
            <div className="text-sm text-gray-600">Total Photos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0955AC]">
              {images.filter(img => img.type === 'main' || img.type === 'primary').length}
            </div>
            <div className="text-sm text-gray-600">Main Photos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0955AC]">
              {images.filter(img => img.type === 'gallery').length}
            </div>
            <div className="text-sm text-gray-600">Gallery Photos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0955AC]">
              {images.filter(img => img.type !== 'placeholder').length}
            </div>
            <div className="text-sm text-gray-600">Available Images</div>
          </div>
        </div>
      </div>

      {/* Image Details for Development/Debug */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            Debug: Image Data Structure
          </summary>
          <div className="mt-2 p-4 bg-gray-100 rounded text-xs">
            <pre className="whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify({ 
                warehouseImages: {
                  main_image: warehouseData?.main_image ? 'exists' : 'missing',
                  gallery_images: warehouseData?.gallery_images?.length || 0,
                  active_images: warehouseData?.active_images?.length || 0,
                  images: warehouseData?.images?.length || 0,
                  processed_images: images.length
                }
              }, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
};

export default GalleryTab;