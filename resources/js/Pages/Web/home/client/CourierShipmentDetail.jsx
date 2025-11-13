import React from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import {
    Package,
    MapPin,
    Calendar,
    User,
    Mail,
    Phone,
    Building,
    FileText,
    Truck,
    Weight,
    CreditCard,
    ShieldCheck,
    Clock,
    ChevronLeft,
    Download,
    CheckCircle,
    AlertCircle,
    Navigation,
} from 'lucide-react';
import Header from "./ClientHeader";

const statusMap = {
    pending: {
        label: "Pending",
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Clock,
    },
    confirmed: {
        label: "Confirmed",
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle,
    },
    in_transit: {
        label: "In Transit",
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: Truck,
    },
    delivered: {
        label: "Delivered",
        color: "bg-green-50 text-green-700 border-green-200",
        icon: CheckCircle,
    },
    cancelled: {
        label: "Cancelled",
        color: "bg-rose-50 text-rose-700 border-rose-200",
        icon: AlertCircle,
    },
};

const CourierShipmentDetail = () => {
    const { shipment } = usePage().props;
    const statusInfo = statusMap[shipment.status] || statusMap.pending;
    const StatusIcon = statusInfo.icon;

    const handleDownloadBill = () => {
        window.open(`/couriers/${shipment.id}/bill`, '_blank');
    };

    const handleBack = () => {
        router.visit('/courierBookingDashboard');
    };

    return (
        <div>
            <Header />
            <div className="min-h-screen w-full bg-[#E5E5E5] md:p-20 poppins">
                <div className="mx-auto max-w-[1200px]">
                    {/* Header */}
                    <div className="mb-6 flex flex-col gap-4 md:mb-10">
                        <button
                            onClick={handleBack}
                            className="inline-flex items-center text-[#0955AC] hover:underline text-[14px] w-fit"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back to Dashboard
                        </button>
                        
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-col gap-2">
                                <h1 className="text-2xl font-bold tracking-tight md:text-[35px]">
                                    <span className="text-[#0955AC]">Shipment Details</span>
                                </h1>
                                <p className="text-slate-600 text-[14px]">
                                    Reference: {shipment.code}
                                </p>
                            </div>
                            <div className="flex gap-2 items-center">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold ${statusInfo.color}`}>
                                    <StatusIcon className="h-5 w-5" />
                                    {statusInfo.label}
                                </div>
                                <button
                                    onClick={handleDownloadBill}
                                    className="inline-flex items-center h-10 px-6 rounded-2xl border border-slate-200 text-[14px] font-medium hover:bg-slate-50"
                                >
                                    <Download className="mr-2 h-5 w-5" />
                                    Bill
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Shipment Overview */}
                            <div className="bg-white rounded-2xl shadow-sm p-8">
                                <h2 className="text-[20px] font-semibold mb-6">Shipment Overview</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[12px] text-slate-500 uppercase tracking-wide">Service Level</label>
                                        <p className="text-[16px] font-medium mt-1">{shipment.serviceLevel || 'Standard'}</p>
                                    </div>
                                    <div>
                                        <label className="text-[12px] text-slate-500 uppercase tracking-wide">Pickup Date</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="h-4 w-4 text-slate-400" />
                                            <p className="text-[16px] font-medium">{shipment.pickupDate || 'Not scheduled'}</p>
                                        </div>
                                    </div>
                                    {shipment.pickupWindowStart && shipment.pickupWindowEnd && (
                                        <div>
                                            <label className="text-[12px] text-slate-500 uppercase tracking-wide">Pickup Window</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Clock className="h-4 w-4 text-slate-400" />
                                                <p className="text-[16px] font-medium">
                                                    {shipment.pickupWindowStart} - {shipment.pickupWindowEnd}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-[12px] text-slate-500 uppercase tracking-wide">Total Packages</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Package className="h-4 w-4 text-slate-400" />
                                            <p className="text-[16px] font-medium">{shipment.packages?.length || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sender & Recipient */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Sender */}
                                <div className="bg-white rounded-2xl shadow-sm p-8">
                                    <h3 className="text-[18px] font-semibold mb-4 flex items-center gap-2">
                                        <Navigation className="h-5 w-5 text-[#0955AC]" />
                                        Sender
                                    </h3>
                                    <div className="space-y-3 text-[14px]">
                                        <div className="flex items-start gap-2">
                                            <User className="h-4 w-4 text-slate-400 mt-0.5" />
                                            <div>
                                                <p className="font-medium">{shipment.sender?.name}</p>
                                                {shipment.sender?.company && (
                                                    <p className="text-slate-500">{shipment.sender.company}</p>
                                                )}
                                            </div>
                                        </div>
                                        {shipment.sender?.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-slate-400" />
                                                <p className="text-slate-600">{shipment.sender.email}</p>
                                            </div>
                                        )}
                                        {shipment.sender?.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-slate-400" />
                                                <p className="text-slate-600">{shipment.sender.phone}</p>
                                            </div>
                                        )}
                                        {shipment.sender?.address && (
                                            <div className="flex items-start gap-2 pt-2 border-t">
                                                <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                                                <div className="text-slate-600">
                                                    <p>{shipment.sender.address.line1}</p>
                                                    {shipment.sender.address.line2 && <p>{shipment.sender.address.line2}</p>}
                                                    <p>
                                                        {[
                                                            shipment.sender.address.city,
                                                            shipment.sender.address.state,
                                                            shipment.sender.address.postalCode,
                                                        ].filter(Boolean).join(', ')}
                                                    </p>
                                                    <p>{shipment.sender.address.country}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Recipient */}
                                <div className="bg-white rounded-2xl shadow-sm p-8">
                                    <h3 className="text-[18px] font-semibold mb-4 flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-[#0955AC]" />
                                        Recipient
                                    </h3>
                                    <div className="space-y-3 text-[14px]">
                                        <div className="flex items-start gap-2">
                                            <User className="h-4 w-4 text-slate-400 mt-0.5" />
                                            <div>
                                                <p className="font-medium">{shipment.recipient?.name}</p>
                                                {shipment.recipient?.company && (
                                                    <p className="text-slate-500">{shipment.recipient.company}</p>
                                                )}
                                            </div>
                                        </div>
                                        {shipment.recipient?.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-slate-400" />
                                                <p className="text-slate-600">{shipment.recipient.email}</p>
                                            </div>
                                        )}
                                        {shipment.recipient?.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-slate-400" />
                                                <p className="text-slate-600">{shipment.recipient.phone}</p>
                                            </div>
                                        )}
                                        {shipment.recipient?.address && (
                                            <div className="flex items-start gap-2 pt-2 border-t">
                                                <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                                                <div className="text-slate-600">
                                                    <p>{shipment.recipient.address.line1}</p>
                                                    {shipment.recipient.address.line2 && <p>{shipment.recipient.address.line2}</p>}
                                                    <p>
                                                        {[
                                                            shipment.recipient.address.city,
                                                            shipment.recipient.address.state,
                                                            shipment.recipient.address.postalCode,
                                                        ].filter(Boolean).join(', ')}
                                                    </p>
                                                    <p>{shipment.recipient.address.country}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Package Details */}
                            <div className="bg-white rounded-2xl shadow-sm p-8">
                                <h2 className="text-[20px] font-semibold mb-6">Package Details</h2>
                                <div className="space-y-4">
                                    {shipment.packages && shipment.packages.length > 0 ? (
                                        shipment.packages.map((pkg, index) => (
                                            <div key={pkg.id} className="border rounded-xl p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-[16px] font-semibold">
                                                        Package {index + 1}
                                                        {pkg.label && ` - ${pkg.label}`}
                                                    </h3>
                                                    <span className="text-[12px] px-3 py-1 bg-slate-100 rounded-full">
                                                        {pkg.type}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-[14px]">
                                                    <div>
                                                        <label className="text-slate-500 text-[12px]">Provider</label>
                                                        <p className="font-medium">{pkg.provider}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-slate-500 text-[12px]">Service</label>
                                                        <p className="font-medium">{pkg.service}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-slate-500 text-[12px]">ETA</label>
                                                        <p className="font-medium">{pkg.eta || 'TBD'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-slate-500 text-[12px]">Weight</label>
                                                        <p className="font-medium">{pkg.weight} kg</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-slate-500 text-[12px]">Quantity</label>
                                                        <p className="font-medium">{pkg.quantity}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-slate-500 text-[12px]">Price</label>
                                                        <p className="font-medium">${Number(pkg.price || 0).toFixed(2)}</p>
                                                    </div>
                                                    {(pkg.length && pkg.width && pkg.height) && (
                                                        <div className="col-span-2 md:col-span-3">
                                                            <label className="text-slate-500 text-[12px]">Dimensions (L × W × H)</label>
                                                            <p className="font-medium">
                                                                {pkg.length} × {pkg.width} × {pkg.height} cm
                                                            </p>
                                                        </div>
                                                    )}
                                                    {pkg.description && (
                                                        <div className="col-span-2 md:col-span-3">
                                                            <label className="text-slate-500 text-[12px]">Description</label>
                                                            <p className="text-slate-600">{pkg.description}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-slate-500 text-center py-4">No package information available</p>
                                    )}
                                </div>
                            </div>

                            {/* Additional Notes */}
                            {shipment.deliveryNotes && (
                                <div className="bg-white rounded-2xl shadow-sm p-8">
                                    <h2 className="text-[20px] font-semibold mb-4">Delivery Notes</h2>
                                    <p className="text-[14px] text-slate-600">{shipment.deliveryNotes}</p>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Tracking & Summary */}
                        <div className="space-y-6">
                            {/* Cost Summary */}
                            <div className="bg-white rounded-2xl shadow-sm p-8">
                                <h3 className="text-[18px] font-semibold mb-4 flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-[#0955AC]" />
                                    Cost Summary
                                </h3>
                                <div className="space-y-3 text-[14px]">
                                    {shipment.estimatedCost && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Estimated Cost</span>
                                            <span className="font-semibold">
                                                ${shipment.estimatedCost} {shipment.currencyCode}
                                            </span>
                                        </div>
                                    )}
                                    {shipment.actualCost && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Actual Cost</span>
                                            <span className="font-semibold">
                                                ${shipment.actualCost} {shipment.currencyCode}
                                            </span>
                                        </div>
                                    )}
                                    {shipment.insuranceRequired && (
                                        <div className="flex items-center gap-2 pt-3 border-t">
                                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                            <span className="text-emerald-600 font-medium">Insurance Included</span>
                                        </div>
                                    )}
                                    {shipment.declaredValue && (
                                        <div className="flex justify-between pt-3 border-t">
                                            <span className="text-slate-600">Declared Value</span>
                                            <span className="font-semibold">
                                                ${shipment.declaredValue} {shipment.currencyCode}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tracking Events */}
                            <div className="bg-white rounded-2xl shadow-sm p-8">
                                <h3 className="text-[18px] font-semibold mb-4 flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-[#0955AC]" />
                                    Tracking History
                                </h3>
                                <div className="space-y-4">
                                    {shipment.trackingEvents && shipment.trackingEvents.length > 0 ? (
                                        shipment.trackingEvents.map((event, index) => (
                                            <div key={event.id} className="relative pl-6 pb-4 border-l-2 border-slate-200 last:border-0">
                                                <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full bg-[#0955AC] border-2 border-white"></div>
                                                <div className="text-[12px] text-slate-500 mb-1">
                                                    {new Date(event.timestamp).toLocaleString()}
                                                </div>
                                                <div className="text-[14px] font-medium mb-1">{event.status}</div>
                                                {event.location && (
                                                    <div className="text-[12px] text-slate-600 mb-1">{event.location}</div>
                                                )}
                                                {event.description && (
                                                    <div className="text-[12px] text-slate-500">{event.description}</div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-slate-500 text-[14px] text-center py-4">
                                            No tracking events yet
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Shipment Info */}
                            <div className="bg-white rounded-2xl shadow-sm p-8">
                                <h3 className="text-[18px] font-semibold mb-4">Shipment Info</h3>
                                <div className="space-y-3 text-[14px]">
                                    <div>
                                        <label className="text-slate-500 text-[12px]">Created</label>
                                        <p className="font-medium">{new Date(shipment.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <label className="text-slate-500 text-[12px]">Last Updated</label>
                                        <p className="font-medium">{new Date(shipment.updatedAt).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <label className="text-slate-500 text-[12px]">Reference</label>
                                        <p className="font-medium font-mono">{shipment.code}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourierShipmentDetail;
