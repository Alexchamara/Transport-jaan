import { usePage, Link } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function VehicleIndex() {
  const { props } = usePage();
  const successMessage = props.flash?.success;
  const { vehicles, landVehicles, airVehicles, seaVehicles } = props.data || {};
  const [activeTab, setActiveTab] = useState('all');

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle escape key press to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedVehicle(null), 200); // Delay to allow animation
  };

  const getConditionBadge = (condition) => {
    const badges = {
      'Excellent': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Good': 'bg-blue-100 text-blue-800 border-blue-200',
      'Fair': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Poor': 'bg-red-100 text-red-800 border-red-200',
    };
    return badges[condition] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Land': '🚗',
      'Air': '✈️',
      'Sea': '🚢',
      'land': '🚗',
      'air': '✈️',
      'sea': '🚢',
    };
    return icons[category] || '🚙';
  };

  const getConditionColor = (condition) => {
    const colors = {
      'Excellent': 'from-emerald-500 to-green-500',
      'Good': 'from-blue-500 to-cyan-500',
      'Fair': 'from-yellow-500 to-orange-500',
      'Poor': 'from-red-500 to-pink-500',
    };
    return colors[condition] || 'from-gray-500 to-slate-500';
  };

  // Modern Modal Component
  const VehicleModal = ({ vehicle, isOpen, onClose }) => {
    if (!vehicle) return null;

    return (
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 z-40 transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
        </div>

        {/* Modal */}
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
            isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div
                className={`relative p-8 bg-gradient-to-r ${getConditionColor(vehicle.condition)} text-white rounded-t-3xl`}
                style={{
                    backgroundImage: vehicle.image_path
                    ? `url('${vehicle.image_path}')`
                    : "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmtFkvWOs2XZetsbn_U1bJVKNRePuC6nvQ3Q&s')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
                >
                <div className="absolute inset-0 bg-black/60 rounded-t-3xl backdrop-blur-sm"></div> {/* Overlay for readability */}

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm z-10"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl mb-4 mx-auto backdrop-blur-sm">
                    {getCategoryIcon(vehicle.category)}
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{vehicle.model || 'N/A'}</h2>
                    <p className="text-white/90 text-lg">{vehicle.manufracture || 'Unknown Manufacturer'}</p>
                    <div className="mt-4">
                    <span className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold border-2 border-white/30 bg-white/20 backdrop-blur-sm`}>
                        {vehicle.condition || 'N/A'}
                    </span>
                    </div>
                </div>
            </div>


            {/* Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Vehicle Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Vehicle Information
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-600 font-medium">Vehicle ID</span>
                      <span className="text-gray-800 font-semibold">#{vehicle.id || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-600 font-medium">Vehicle No</span>
                      <span className="text-gray-800 font-semibold">{vehicle.vehicle_no || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-600 font-medium">Category</span>
                      <span className="flex items-center space-x-2">
                        <span className="text-lg">{getCategoryIcon(vehicle.category)}</span>
                        <span className="text-gray-800 font-semibold">{vehicle.category || 'N/A'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Specifications */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                    Specifications
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-600 font-medium">Year</span>
                      <span className="text-gray-800 font-semibold">{vehicle.manufracture_year || 'N/A'}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-600 font-medium">Capacity</span>
                      <span className="text-gray-800 font-semibold">
                        {vehicle.passenger_capacity ? `${vehicle.passenger_capacity} passengers` : 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-600 font-medium">Condition</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getConditionBadge(vehicle.condition)}`}>
                        {vehicle.condition || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              {(vehicle.description || vehicle.notes) && (
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Additional Notes</h4>
                  <p className="text-blue-700 text-sm">
                    {vehicle.description || vehicle.notes || 'No additional information available.'}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-colors"
                >
                  Close
                </button>
                {/* <Link
                  href={`/vendor/vehicles/${vehicle.id}/edit`}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all text-center"
                >
                  Edit Vehicle
                </Link> */}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const VehicleCard = ({ vehicle, index, isNested = false }) => {
    const vehicleData = isNested ? vehicle.vehicle : vehicle;

    return (
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group hover:scale-[1.02]">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                {getCategoryIcon(vehicleData?.category)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{vehicleData?.model || 'N/A'}</h3>
                <p className="text-gray-600 text-sm">{vehicleData?.manufracture || 'Unknown Manufacturer'}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getConditionBadge(vehicleData?.condition)}`}>
              {vehicleData?.condition || 'N/A'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Vehicle No</p>
              <p className="text-sm font-semibold text-gray-800">{vehicleData?.vehicle_no || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Year</p>
              <p className="text-sm font-semibold text-gray-800">{vehicleData?.manufracture_year || 'N/A'}</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Capacity:</span>
              <span className="text-sm font-semibold text-gray-800">{vehicleData?.passenger_capacity || 'N/A'}</span>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {vehicleData?.category || 'N/A'}
            </span>
          </div>
        </div>

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">ID: #{vehicleData?.id || index + 1}</span>
            <button
              onClick={() => handleViewDetails(vehicleData)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>View Details</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const TabButton = ({ id, label, count, icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
        isActive
          ? 'bg-white text-blue-600 shadow-md border border-blue-200'
          : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
      <span className={`px-2 py-1 rounded-full text-xs ${
        isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
      }`}>
        {count || 0}
      </span>
    </button>
  );

  const renderVehicleGrid = (items, isNested = false) => {
    if (!items || items.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-500 mb-2">No vehicles found</h3>
          <p className="text-gray-400">Start by registering your first vehicle</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <VehicleCard
            key={isNested ? item.vehicle?.id || index : item?.id || index}
            vehicle={item}
            index={index}
            isNested={isNested}
          />
        ))}
      </div>
    );
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'land': return { data: landVehicles, isNested: true };
      case 'air': return { data: airVehicles, isNested: true };
      case 'sea': return { data: seaVehicles, isNested: true };
      default: return { data: vehicles, isNested: false };
    }
  };

  const currentData = getCurrentData();

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}

          <a href="/vendor/dashboard" className="mb-6">
            <button>
                <div className="flex items-center justify-between mb-6 text-gray-800 font-semibold text-lg">
                    <h2> ⬅️ Back</h2>
                </div>
            </button>
          </a>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">

              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  🚗 Vehicle Management
                </h1>
                <p className="text-gray-600 mt-2">Manage and monitor your vehicle inventory</p>
              </div>
              <Link href="/vendor/vehicles/create">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Register New Vehicle</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-8 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-800 font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 mb-8 shadow-lg border border-white/20">
            <div className="flex flex-wrap gap-2">
              <TabButton
                id="all"
                label="All Vehicles"
                count={vehicles?.length}
                icon="🚙"
                isActive={activeTab === 'all'}
                onClick={setActiveTab}
              />
              <TabButton
                id="land"
                label="Land Vehicles"
                count={landVehicles?.length}
                icon="🚗"
                isActive={activeTab === 'land'}
                onClick={setActiveTab}
              />
              <TabButton
                id="air"
                label="Air Vehicles"
                count={airVehicles?.length}
                icon="✈️"
                isActive={activeTab === 'air'}
                onClick={setActiveTab}
              />
              <TabButton
                id="sea"
                label="Sea Vehicles"
                count={seaVehicles?.length}
                icon="🚢"
                isActive={activeTab === 'sea'}
                onClick={setActiveTab}
              />
            </div>
          </div>

          {/* Vehicle Grid */}
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
            {renderVehicleGrid(currentData.data, currentData.isNested)}
          </div>

          {/* Stats Footer */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Vehicles', count: vehicles?.length || 0, icon: '🚙', color: 'from-blue-500 to-cyan-500' },
              { label: 'Land Vehicles', count: landVehicles?.length || 0, icon: '🚗', color: 'from-green-500 to-teal-500' },
              { label: 'Air Vehicles', count: airVehicles?.length || 0, icon: '✈️', color: 'from-purple-500 to-pink-500' },
              { label: 'Sea Vehicles', count: seaVehicles?.length || 0, icon: '🚢', color: 'from-orange-500 to-red-500' },
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center text-white text-xl mb-3`}>
                  {stat.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-800">{stat.count}</h3>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Modal */}
      <VehicleModal
        vehicle={selectedVehicle}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </AuthenticatedLayout>
  );
}
