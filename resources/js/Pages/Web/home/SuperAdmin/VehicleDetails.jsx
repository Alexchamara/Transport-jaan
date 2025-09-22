import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import SideMenu from "../../components/SuperAdmin/Dashboard1/SideMenu";

const VehicleDetails = ({ vehicle, auth }) => {
    const [rejectionReason, setRejectionReason] = useState(vehicle.rejection_reason || '');

    // Handle approval status change
    const handleApprovalChange = (status, reason = '') => {
        router.put(route('superadmin.vehicles.approval', vehicle.id), {
            approval_status: status,
            rejection_reason: reason
        });
    };

    // Handle status change
    const handleStatusChange = (status) => {
        router.put(route('superadmin.vehicles.status', vehicle.id), {
            status: status
        });
    };

    // Status badge component
    const StatusBadge = ({ status, type = 'status' }) => {
        const getStatusClass = () => {
            if (type === 'approval') {
                switch (status) {
                    case 'approved': return 'bg-green-100 text-green-800';
                    case 'pending': return 'bg-yellow-100 text-yellow-800';
                    case 'rejected': return 'bg-red-100 text-red-800';
                    default: return 'bg-gray-100 text-gray-800';
                }
            } else {
                switch (status) {
                    case 'active': return 'bg-green-100 text-green-800';
                    case 'inactive': return 'bg-red-100 text-red-800';
                    case 'draft': return 'bg-gray-100 text-gray-800';
                    default: return 'bg-gray-100 text-gray-800';
                }
            }
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass()}`}>
                {status?.charAt(0).toUpperCase() + status?.slice(1)}
            </span>
        );
    };

    return (
        <>
            <Head title={`${vehicle.manufacturer} ${vehicle.model} - Vehicle Details`} />
            <div className="flex flex-row bg-[#081028] min-h-screen text-white">
                <div className="w-auto">
                    <SideMenu />
                </div>

                <div className="flex-1 p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Link
                                    href={route('superadmin.Vehicles')}
                                    className="text-blue-400 hover:text-blue-300 mb-2 inline-block"
                                >
                                    ← Back to Vehicles
                                </Link>
                                <h1 className="text-2xl font-bold">
                                    {vehicle.manufacturer} {vehicle.model}
                                </h1>
                                <p className="text-gray-400">{vehicle.registration_number}</p>
                            </div>
                            <div className="flex gap-4">
                                <StatusBadge status={vehicle.status} />
                                <StatusBadge status={vehicle.approval_status} type="approval" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Vehicle Images */}
                            {vehicle.media && vehicle.media.length > 0 && (
                                <div className="bg-gray-800 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold mb-4">Vehicle Images</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {vehicle.media.filter(media => media.media_type === 'image').map((image, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={image.url}
                                                    alt={`${vehicle.model} ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded"
                                                />
                                                {image.is_primary && (
                                                    <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                                        Primary
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Basic Information */}
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-400">Category</label>
                                        <div className="capitalize">{vehicle.category?.type} - {vehicle.category?.name}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Type</label>
                                        <div className="capitalize">{vehicle.type}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Manufacturer</label>
                                        <div>{vehicle.manufacturer}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Model</label>
                                        <div>{vehicle.model}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Manufacture Year</label>
                                        <div>{vehicle.manufacture_year}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Registration Year</label>
                                        <div>{vehicle.registration_year}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Color</label>
                                        <div>{vehicle.colour}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Condition</label>
                                        <div className="capitalize">{vehicle.condition}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Passenger Capacity</label>
                                        <div>{vehicle.passenger_capacity} passengers</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Mileage</label>
                                        <div>{vehicle.mileage_km} km</div>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Information */}
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">Pricing Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-400">Rental Price per Day</label>
                                        <div className="text-lg font-semibold">{vehicle.rental_price_per_day} {vehicle.currency}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Total Rental Price</label>
                                        <div>{vehicle.total_rental_price} {vehicle.currency}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Deposit Amount</label>
                                        <div>{vehicle.deposit_amount} {vehicle.currency}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Advance Payment</label>
                                        <div>{vehicle.advance_payment_amount} {vehicle.currency}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">Features</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${vehicle.gps ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span>GPS</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${vehicle.child_seat ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span>Child Seat</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${vehicle.wifi ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span>WiFi</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${vehicle.insurance_coverage ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span>Insurance Coverage</span>
                                    </div>
                                </div>
                                {vehicle.extra && (
                                    <div className="mt-4">
                                        <label className="text-sm text-gray-400">Additional Features</label>
                                        <div>{vehicle.extra}</div>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            {vehicle.description && (
                                <div className="bg-gray-800 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold mb-4">Description</h3>
                                    <p className="text-gray-300">{vehicle.description}</p>
                                </div>
                            )}

                            {/* Category-specific Details */}
                            {vehicle.land_spec && (
                                <div className="bg-gray-800 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold mb-4">Land Vehicle Specifications</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-gray-400">Engine Type</label>
                                            <div>{vehicle.land_spec.engine_type}</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-400">Fuel Type</label>
                                            <div>{vehicle.land_spec.fuel_type}</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-400">Transmission</label>
                                            <div>{vehicle.land_spec.transmission}</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-400">Drivetrain</label>
                                            <div>{vehicle.land_spec.drivetrain}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {vehicle.air_spec && (
                                <div className="bg-gray-800 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold mb-4">Air Vehicle Specifications</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-gray-400">Aircraft Type</label>
                                            <div>{vehicle.air_spec.aircraft_type}</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-400">Range</label>
                                            <div>{vehicle.air_spec.range_km} km</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-400">Max Altitude</label>
                                            <div>{vehicle.air_spec.max_altitude_m} m</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-400">Cruise Speed</label>
                                            <div>{vehicle.air_spec.cruise_speed_kmh} km/h</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {vehicle.sea_spec && (
                                <div className="bg-gray-800 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold mb-4">Sea Vehicle Specifications</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-gray-400">Vessel Type</label>
                                            <div>{vehicle.sea_spec.vessel_type}</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-400">Length</label>
                                            <div>{vehicle.sea_spec.length_m} m</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-400">Max Speed</label>
                                            <div>{vehicle.sea_spec.max_speed_knots} knots</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-400">Engine Power</label>
                                            <div>{vehicle.sea_spec.engine_power_hp} HP</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Owner Information */}
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">Vehicle Owner</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm text-gray-400">Name</label>
                                        <div>{vehicle.provider?.name}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Email</label>
                                        <div>{vehicle.provider?.email}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Phone</label>
                                        <div>{vehicle.provider?.phone || 'Not provided'}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Joined</label>
                                        <div>{new Date(vehicle.provider?.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Approval Actions */}
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">Approval Status</h3>

                                <div className="mb-4">
                                    <StatusBadge status={vehicle.approval_status} type="approval" />
                                </div>

                                {vehicle.rejection_reason && (
                                    <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded">
                                        <label className="text-sm text-red-400">Rejection Reason:</label>
                                        <div className="text-red-300">{vehicle.rejection_reason}</div>
                                    </div>
                                )}

                                {vehicle.approval_status !== 'approved' && (
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => handleApprovalChange('approved')}
                                            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
                                        >
                                            Approve Vehicle
                                        </button>

                                        <div className="space-y-2">
                                            <textarea
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="Rejection reason..."
                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                                                rows="3"
                                            />
                                            <button
                                                onClick={() => {
                                                    if (rejectionReason.trim()) {
                                                        handleApprovalChange('rejected', rejectionReason);
                                                    } else {
                                                        alert('Please provide a rejection reason');
                                                    }
                                                }}
                                                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
                                            >
                                                Reject Vehicle
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Status Control */}
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">Vehicle Status</h3>
                                <div className="mb-4">
                                    <StatusBadge status={vehicle.status} />
                                </div>
                                <div className="space-y-2">
                                    {vehicle.status !== 'active' && (
                                        <button
                                            onClick={() => handleStatusChange('active')}
                                            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
                                        >
                                            Activate Vehicle
                                        </button>
                                    )}
                                    {vehicle.status !== 'inactive' && (
                                        <button
                                            onClick={() => handleStatusChange('inactive')}
                                            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
                                        >
                                            Deactivate Vehicle
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Total Bookings</span>
                                        <span>{vehicle.bookings_count || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Average Rating</span>
                                        <span>{vehicle.average_rating || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Total Reviews</span>
                                        <span>{vehicle.review_count || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Created</span>
                                        <span>{new Date(vehicle.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VehicleDetails;
