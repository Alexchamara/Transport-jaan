import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import SideMenu from "../../components/SuperAdmin/Dashboard1/SideMenu";
import ArrowLeftB from "../../assets/superAdmin/Arrow LeftB.svg";

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

    // Status badge component - matching Users styling
    const StatusBadge = ({ status, type = 'status' }) => {
        const getStatusClass = () => {
            if (type === 'approval') {
                switch (status) {
                    case 'approved': return 'text-[10px] px-[8px] py-[2px] bg-[#05C168]/20 text-[#05C168] rounded-[4px]';
                    case 'pending': return 'text-[10px] px-[8px] py-[2px] bg-[#FDB52A]/20 text-[#FDB52A] rounded-[4px]';
                    case 'rejected': return 'text-[10px] px-[8px] py-[2px] bg-[#FF4757]/20 text-[#FF4757] rounded-[4px]';
                    default: return 'text-[10px] px-[8px] py-[2px] bg-[#AEB9E1]/20 text-[#AEB9E1] rounded-[4px]';
                }
            } else {
                switch (status) {
                    case 'active': return 'text-[10px] px-[8px] py-[2px] bg-[#05C168]/20 text-[#05C168] rounded-[4px]';
                    case 'inactive': return 'text-[10px] px-[8px] py-[2px] bg-[#FF4757]/20 text-[#FF4757] rounded-[4px]';
                    case 'draft': return 'text-[10px] px-[8px] py-[2px] bg-[#AEB9E1]/20 text-[#AEB9E1] rounded-[4px]';
                    default: return 'text-[10px] px-[8px] py-[2px] bg-[#AEB9E1]/20 text-[#AEB9E1] rounded-[4px]';
                }
            }
        };

        return (
            <span className={getStatusClass()}>
                {status?.charAt(0).toUpperCase() + status?.slice(1)}
            </span>
        );
    };

    return (
        <>
            <Head title={`${vehicle.manufacturer} ${vehicle.model} - Vehicle Details`} />
            <div className="flex flex-row bg-[#081028] min-h-screen poppins">
                <div className="sm:w-full md:w-auto lg:w-auto">
                    <SideMenu />
                </div>

                <div className="flex flex-col gap-5 poppins">
                    {/* Header */}
                    <div className="w-[1125px] h-[42px] flex flex-row justify-between items-center px-4 md:px-12 lg:px-47 my-6 md:my-10 lg:my-[25px]">
                        <div className="flex flex-row justify-center items-center gap-6">
                            <Link
                                href={route('superadmin.Vehicles')}
                                className="flex items-center gap-2 text-[#0E43FB] hover:text-[#0E43FB]/80"
                            >
                                <img src={ArrowLeftB} alt="Back" className="w-4 h-4" />
                                <span className="text-[14px]">Back to Vehicles</span>
                            </Link>
                            <h1 className="text-white text-base md:text-lg lg:text-[24px] font-poppins">
                                {vehicle.manufacturer} {vehicle.model}
                            </h1>
                        </div>
                        <div className="flex gap-4">
                            <StatusBadge status={vehicle.status} />
                            <StatusBadge status={vehicle.approval_status} type="approval" />
                        </div>
                    </div>

                    <div className="flex flex-row gap-6 mx-[48px]">
                        {/* Main Content */}
                        <div className="flex-1 space-y-6">
                            {/* Vehicle Images */}
                            {vehicle.media && vehicle.media.length > 0 && (
                                <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-6">
                                    <h3 className="text-white text-[18px] font-500 mb-4">Vehicle Images</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {vehicle.media.filter(media => media.media_type === 'image').map((image, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={image.url}
                                                    alt={`${vehicle.model} ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-[5px]"
                                                />
                                                {image.is_primary && (
                                                    <span className="absolute top-2 left-2 bg-[#0E43FB] text-white text-[10px] px-2 py-1 rounded-[4px]">
                                                        Primary
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Basic Information */}
                            <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-6">
                                <h3 className="text-white text-[18px] font-500 mb-4">Basic Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[#AEB9E1] text-[12px]">Category</label>
                                        <div className="text-white text-[14px] capitalize">{vehicle.category?.type} - {vehicle.category?.name}</div>
                                    </div>
                                    <div>
                                        <label className="text-[#AEB9E1] text-[12px]">Type</label>
                                        <div className="text-white text-[14px] capitalize">{vehicle.type}</div>
                                    </div>
                                    <div>
                                        <label className="text-[#AEB9E1] text-[12px]">Manufacturer</label>
                                        <div className="text-white text-[14px]">{vehicle.manufacturer}</div>
                                    </div>
                                    <div>
                                        <label className="text-[#AEB9E1] text-[12px]">Model</label>
                                        <div className="text-white text-[14px]">{vehicle.model}</div>
                                    </div>
                                    <div>
                                        <label className="text-[#AEB9E1] text-[12px]">Manufacture Year</label>
                                        <div className="text-white text-[14px]">{vehicle.manufacture_year}</div>
                                    </div>
                                    <div>
                                        <label className="text-[#AEB9E1] text-[12px]">Registration Year</label>
                                        <div className="text-white text-[14px]">{vehicle.registration_year}</div>
                                    </div>
                                    <div>
                                        <label className="text-[#AEB9E1] text-[12px]">Registration Number</label>
                                        <div className="text-white text-[14px]">{vehicle.registration_number}</div>
                                    </div>
                                    <div>
                                        <label className="text-[#AEB9E1] text-[12px]">Color</label>
                                        <div className="text-white text-[14px]">{vehicle.colour}</div>
                                    </div>
                                    <div>
                                        <label className="text-[#AEB9E1] text-[12px]">Condition</label>
                                        <div className="text-white text-[14px] capitalize">{vehicle.condition}</div>
                                    </div>
                                    <div>
                                        <label className="text-[#AEB9E1] text-[12px]">Passenger Capacity</label>
                                        <div className="text-white text-[14px]">{vehicle.passenger_capacity} passengers</div>
                                    </div>
                                    <div>
                                        <label className="text-[#AEB9E1] text-[12px]">Mileage</label>
                                        <div className="text-white text-[14px]">{vehicle.mileage_km} km</div>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Information */}
                            <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-6">
                                <h3 className="text-white text-[18px] font-500 mb-4">Pricing Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[#AEB9E1] text-[12px]">Rental Price per Day</label>
                                        <div className="text-white text-[16px] font-500">{vehicle.rental_price_per_day} {vehicle.currency}</div>
                                    </div>
                                    <div>
                                        <label className="text-[#AEB9E1] text-[12px]">Total Rental Price</label>
                                        <div className="text-white text-[14px]">{vehicle.total_rental_price} {vehicle.currency}</div>
                                    </div>
                                    <div>
                                        <label className="text-[#AEB9E1] text-[12px]">Deposit Amount</label>
                                        <div className="text-white text-[14px]">{vehicle.deposit_amount} {vehicle.currency}</div>
                                    </div>
                                    <div>
                                        <label className="text-[#AEB9E1] text-[12px]">Advance Payment</label>
                                        <div className="text-white text-[14px]">{vehicle.advance_payment_amount} {vehicle.currency}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-6">
                                <h3 className="text-white text-[18px] font-500 mb-4">Features</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${vehicle.gps ? 'bg-[#05C168]' : 'bg-[#FF4757]'}`}></div>
                                        <span className="text-white text-[14px]">GPS</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${vehicle.child_seat ? 'bg-[#05C168]' : 'bg-[#FF4757]'}`}></div>
                                        <span className="text-white text-[14px]">Child Seat</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${vehicle.wifi ? 'bg-[#05C168]' : 'bg-[#FF4757]'}`}></div>
                                        <span className="text-white text-[14px]">WiFi</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${vehicle.insurance_coverage ? 'bg-[#05C168]' : 'bg-[#FF4757]'}`}></div>
                                        <span className="text-white text-[14px]">Insurance Coverage</span>
                                    </div>
                                </div>
                                {vehicle.extra && (
                                    <div className="mt-4">
                                        <label className="text-[#AEB9E1] text-[12px]">Additional Features</label>
                                        <div className="text-white text-[14px]">{vehicle.extra}</div>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            {vehicle.description && (
                                <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-6">
                                    <h3 className="text-white text-[18px] font-500 mb-4">Description</h3>
                                    <p className="text-[#AEB9E1] text-[14px]">{vehicle.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="w-[300px] space-y-6">
                            {/* Owner Information */}
                            <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-6">
                                <h3 className="text-white text-[18px] font-500 mb-4">Vehicle Owner</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[#AEB9E1] text-[12px]">Name</label>
                                        <div className="text-white text-[14px]">{vehicle.provider?.name}</div>
                                    </div>
                                    <div>
                                        <label className="text-[#AEB9E1] text-[12px]">Email</label>
                                        <div className="text-white text-[14px]">{vehicle.provider?.email}</div>
                                    </div>
                                    <div>
                                        <label className="text-[#AEB9E1] text-[12px]">Phone</label>
                                        <div className="text-white text-[14px]">{vehicle.provider?.phone || 'Not provided'}</div>
                                    </div>
                                    <div>
                                        <label className="text-[#AEB9E1] text-[12px]">Joined</label>
                                        <div className="text-white text-[14px]">{new Date(vehicle.provider?.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Approval Actions */}
                            <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-6">
                                <h3 className="text-white text-[18px] font-500 mb-4">Approval Status</h3>
                                
                                <div className="mb-4">
                                    <StatusBadge status={vehicle.approval_status} type="approval" />
                                </div>

                                {vehicle.rejection_reason && (
                                    <div className="mb-4 p-3 bg-[#FF4757]/10 border border-[#FF4757] rounded-[5px]">
                                        <label className="text-[#FF4757] text-[12px]">Rejection Reason:</label>
                                        <div className="text-[#FF4757] text-[14px]">{vehicle.rejection_reason}</div>
                                    </div>
                                )}

                                {vehicle.approval_status !== 'approved' && (
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => handleApprovalChange('approved')}
                                            className="w-full border border-[#05C168] bg-[#05C168] px-4 py-2 rounded-[5px] text-white text-[14px] hover:bg-[#05C168]/80"
                                        >
                                            Approve Vehicle
                                        </button>

                                        <div className="space-y-2">
                                            <textarea
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder="Rejection reason..."
                                                className="w-full px-3 py-2 border border-[#343B4F] bg-[#0B1739] rounded-[5px] text-white placeholder-[#AEB9E1] text-[14px]"
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
                                                className="w-full border border-[#FF4757] bg-[#FF4757] px-4 py-2 rounded-[5px] text-white text-[14px] hover:bg-[#FF4757]/80"
                                            >
                                                Reject Vehicle
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Status Control */}
                            <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-6">
                                <h3 className="text-white text-[18px] font-500 mb-4">Vehicle Status</h3>
                                <div className="mb-4">
                                    <StatusBadge status={vehicle.status} />
                                </div>
                                <div className="space-y-2">
                                    {vehicle.status !== 'active' && (
                                        <button
                                            onClick={() => handleStatusChange('active')}
                                            className="w-full border border-[#05C168] bg-[#05C168] px-4 py-2 rounded-[5px] text-white text-[14px] hover:bg-[#05C168]/80"
                                        >
                                            Activate Vehicle
                                        </button>
                                    )}
                                    {vehicle.status !== 'inactive' && (
                                        <button
                                            onClick={() => handleStatusChange('inactive')}
                                            className="w-full border border-[#FF4757] bg-[#FF4757] px-4 py-2 rounded-[5px] text-white text-[14px] hover:bg-[#FF4757]/80"
                                        >
                                            Deactivate Vehicle
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-6">
                                <h3 className="text-white text-[18px] font-500 mb-4">Quick Stats</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-[#AEB9E1] text-[12px]">Total Bookings</span>
                                        <span className="text-white text-[14px]">{vehicle.bookings_count || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#AEB9E1] text-[12px]">Average Rating</span>
                                        <span className="text-white text-[14px]">{vehicle.average_rating || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#AEB9E1] text-[12px]">Total Reviews</span>
                                        <span className="text-white text-[14px]">{vehicle.review_count || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#AEB9E1] text-[12px]">Created</span>
                                        <span className="text-white text-[14px]">{new Date(vehicle.created_at).toLocaleDateString()}</span>
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