import React, { useState } from "react";
import { usePage } from "@inertiajs/react";
import share from "../../assets/landVehicleDetails/share.svg";
import star from "../../assets/driverBooking/star.svg";
import heartB2 from "../../assets/landVehicleDetails/heartB2.svg";

const WarehouseInfo = () => {
  const { props } = usePage();
  const { warehouse } = props;
  const [activeTab, setActiveTab] = useState('details');
  const [showPdfModal, setShowPdfModal] = useState(false);

  if (!warehouse) return null;

  const formatPrice = (price) => {
    return price ? `US$ ${price.toLocaleString()}` : 'Contact for pricing';
  };

  const formatArea = (area) => {
    return area ? `${area.toLocaleString()} sq ft` : 'Not specified';
  };

  const formatCapacity = (capacity) => {
    return capacity ? `${capacity.toLocaleString()} units` : 'Not specified';
  };

  const handlePdfView = () => {
    if (warehouse.terms_pdf_path) {
      setShowPdfModal(true);
    }
  };

  const tabs = [
    { id: 'details', label: 'Warehouse Details' },
    { id: 'policies', label: 'Policies' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'location', label: 'Location' },
  ];

  return (
    <>
      <div className="poppins w-full h-auto p-10 xl:p-0">
        {/* Small label above title */}
        <h1 className="text-[12px] font-[600] text-[#00000080]">
          {warehouse.type ? warehouse.type.charAt(0).toUpperCase() + warehouse.type.slice(1) : 'Warehouse'}
        </h1>

        {/* Title, availability and actions */}
        <div className="flex flex-col md:flex-row justify-between">
          <div className="flex flex-col md:flex-row gap-5">
            <h1 className="bebas-neue text-[30px]">
              {warehouse.name}
            </h1>

            <div className="flex flex-row items-center gap-2">
              <div className="w-[10px] h-[10px] rounded-full bg-[#3C9A34]" />
              <h1 className="text-[#3C9A34] text-[10px]">Available</h1>
            </div>
          </div>
          <div className="flex flex-row items-center py-10 lg:py-0 gap-5">
            <div className="min-w-[81px] min-h-[30px] px-4 py-2 rounded-[4px] border-[1px] border-[#00000030] bg-[#EAE9E8] flex flex-row justify-center items-center gap-3 cursor-pointer">
              <img src={share} />
              <h1>Share</h1>
            </div>
            <div className="min-w-[81px] min-h-[30px] px-4 py-2 rounded-[4px] border-[1px] border-[#0955AC] bg-[#0955AC] text-[#FFFFFF] flex flex-row justify-center items-center gap-3 cursor-pointer">
              <img src={heartB2} />
              <h1>Wishlist</h1>
            </div>
          </div>
        </div>

        {/* Optional: rating or pricing line */}
        {(warehouse.reviews_count || warehouse.rating) ? (
          <div className="flex flex-row gap-5 text-[12px] font-[600]">
            <img src={star} />
            <h1>{warehouse.rating || '4.8'}</h1>
            {warehouse.reviews_count && (
              <h1 className="underline">{warehouse.reviews_count} Reviews</h1>
            )}
          </div>
        ) : (
          <div className="flex flex-row gap-3 text-[12px] font-[600] text-[#00000080]">
            <span className="text-[#0955AC] font-[700]">
              {formatPrice(warehouse.monthly_rate || warehouse.price)}
            </span>
            <span>/ {warehouse.pricing_model || 'month'}</span>
          </div>
        )}

        {/* Tabs - vehicle style */}
        <div className="py-10">
          <div className="flex flex-row xl:gap-20 gap-5 xl:px-20 text-[12px] font-[600] text-[#00000080] border-b-[2px] border-[#0000001F]">
            {tabs.map((tab) => (
              <h1
                key={tab.id}
                className={`border-b-[2px] pb-5 xl:w-[92px] flex justify-center items-center cursor-pointer ${
                  activeTab === tab.id ? 'border-[#0955AC] text-[#0955AC]' : ''
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </h1>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-0">
          {activeTab === 'details' && (
            <div className="space-y-4">
              <h3 className="bebas-neue text-[20px] text-[#0955AC] mb-4">WAREHOUSE DETAILS</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2 poppins">Total Area</h4>
                  <p className="text-lg font-bold text-[#0955AC] poppins">{formatArea(warehouse.total_area)}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2 poppins">Capacity</h4>
                  <p className="text-lg font-bold text-[#0955AC] poppins">{formatCapacity(warehouse.capacity)}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2 poppins">Pricing Model</h4>
                  <p className="text-lg font-bold text-[#0955AC] poppins capitalize">{warehouse.pricing_model || 'Monthly'}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2 poppins">Status</h4>
                  <span className="inline-flex px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                    Available
                  </span>
                </div>
              </div>

              {warehouse.description && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-700 mb-3 poppins">Description</h4>
                  <p className="text-gray-600 leading-relaxed poppins">{warehouse.description}</p>
                </div>
              )}

              {(warehouse.latitude && warehouse.longitude) && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-700 mb-3 poppins">Coordinates</h4>
                  <p className="text-gray-600 poppins">
                    Latitude: {warehouse.latitude}, Longitude: {warehouse.longitude}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'amenities' && (
            <div className="space-y-4">
              <h3 className="bebas-neue text-[20px] text-[#0955AC] mb-4">AMENITIES & FEATURES</h3>
              
              {warehouse.amenities && warehouse.amenities.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {warehouse.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <div className="w-6 h-6 bg-[#0955AC] rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="poppins font-medium text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 poppins">No specific amenities listed</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'policies' && (
            <div className="space-y-4">
              <h3 className="bebas-neue text-[20px] text-[#0955AC] mb-4">TERMS & POLICIES</h3>
              
              {warehouse.terms_conditions && (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-gray-700 mb-3 poppins">Terms & Conditions</h4>
                  <p className="text-gray-600 leading-relaxed poppins whitespace-pre-wrap">
                    {warehouse.terms_conditions}
                  </p>
                </div>
              )}

              {warehouse.terms_pdf_path && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-gray-700 mb-3 poppins">Policy Documents</h4>
                  <button
                    onClick={handlePdfView}
                    className="inline-flex items-center px-4 py-2 bg-[#0955AC] text-white rounded-lg hover:bg-[#0744A0] transition-colors poppins"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    View Policy PDF
                  </button>
                </div>
              )}

              {!warehouse.terms_conditions && !warehouse.terms_pdf_path && (
                <div className="text-center py-8">
                  <p className="text-gray-500 poppins">No policy information available</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'location' && (
            <div className="space-y-4">
              <h3 className="bebas-neue text-[20px] text-[#0955AC] mb-4">LOCATION INFORMATION</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-3 poppins">Address</h4>
                <p className="text-gray-600 poppins">{warehouse.address}</p>
              </div>

              {(warehouse.latitude && warehouse.longitude) ? (
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                  <p className="text-gray-600 mb-4 poppins">
                    Interactive map would be displayed here using the coordinates:
                  </p>
                  <p className="text-[#0955AC] font-medium poppins">
                    {warehouse.latitude}, {warehouse.longitude}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 poppins">Map coordinates not available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PDF Modal */}
      {showPdfModal && warehouse.terms_pdf_path && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold poppins">Policy Document</h3>
              <button
                onClick={() => setShowPdfModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={`/storage/${warehouse.terms_pdf_path}`}
                className="w-full h-full rounded-lg"
                title="Policy PDF"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WarehouseInfo;