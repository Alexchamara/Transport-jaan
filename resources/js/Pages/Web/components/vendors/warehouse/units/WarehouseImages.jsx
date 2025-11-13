import React from "react";

const WarehouseImages = ({ images = [] }) => {
    // Default placeholder images if no images provided
    const defaultImages = [
        '/storage/warehouse/placeholder-main.jpg',
        '/storage/warehouse/placeholder-1.jpg',
        '/storage/warehouse/placeholder-2.jpg',
        '/storage/warehouse/placeholder-3.jpg',
        '/storage/warehouse/placeholder-4.jpg'
    ];

    const displayImages = images.length > 0 ? images : defaultImages;
    const mainImage = displayImages[0];
    const sideImages = displayImages.slice(1, 5);

    const getImageUrl = (imagePath) => {
        // If it's already a full URL (starts with http or /storage), use it directly
        if (imagePath.startsWith('http') || imagePath.startsWith('/storage')) {
            return imagePath;
        }
        // Otherwise, prepend /storage/
        return `/storage/${imagePath}`;
    };

    return (
        <div className="xl:w-[844px] xl:h-[435px] rounded-[22px]">
            <div className="flex flex-col xl:flex-row justify-center gap-[14px] items-center">
                {/* Main image */}
                <div className="w-[200px] md:w-[420px] h-[280px] rounded-[12px] overflow-hidden">
                    <img 
                        src={getImageUrl(mainImage)} 
                        alt="Warehouse main view"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = '/storage/warehouse/placeholder-main.jpg';
                        }}
                    />
                </div>
                
                {/* Side images - first column */}
                <div className="flex flex-col gap-[14px]">
                    {sideImages.slice(0, 2).map((image, index) => (
                        <div key={index} className="w-[100px] h-[130px] rounded-[8px] overflow-hidden">
                            <img 
                                src={getImageUrl(image)} 
                                alt={`Warehouse view ${index + 2}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = `/storage/warehouse/placeholder-${index + 1}.jpg`;
                                }}
                            />
                        </div>
                    ))}
                </div>
                
                {/* Side images - second column */}
                <div className="flex flex-col gap-[14px]">
                    {sideImages.slice(2, 4).map((image, index) => (
                        <div key={index + 2} className="w-[100px] h-[130px] rounded-[8px] overflow-hidden">
                            <img 
                                src={getImageUrl(image)} 
                                alt={`Warehouse view ${index + 4}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = `/storage/warehouse/placeholder-${index + 3}.jpg`;
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
            
            {images.length > 5 && (
                <div className="text-center mt-4">
                    <span className="text-[#7B7B7A] text-sm">
                        +{images.length - 5} more images
                    </span>
                </div>
            )}
        </div>
    );
};

export default WarehouseImages;