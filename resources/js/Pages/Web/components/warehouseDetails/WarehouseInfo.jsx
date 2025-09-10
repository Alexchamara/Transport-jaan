import React, { useState } from "react";
import { usePage } from "@inertiajs/react";

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
    { id: 'details', label: 'Details' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'policies', label: 'Policies' },
    { id: 'location', label: 'Location' }
  ];

  return (
    <>
      <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#0955AC] to-[#0744A0] text-white">
          <h1 className="bebas-neue text-[32px] md:text-[40px] font-[400] mb-2">
            {warehouse.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm poppins">
            <span className="flex items-center">
              📍 {warehouse.address}
            </span>
            <span className="flex items-center">
              🏭 {warehouse.type?.charAt(0).toUpperCase() + warehouse.type?.slice(1)}
            </span>
          </div>
          <div className="mt-4">
            <span className="text-[24px] md:text-[32px] font-bold poppins">
              {formatPrice(warehouse.price)}
            </span>
            <span className="text-lg ml-2 opacity-90">
              /{warehouse.pricing_model || 'month'}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-[#0955AC] border-b-2 border-[#0955AC] bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
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