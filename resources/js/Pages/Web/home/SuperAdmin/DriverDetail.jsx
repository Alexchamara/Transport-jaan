import React, { useState } from "react";
import SideMenu from "../../components/SuperAdmin/Dashboard1/SideMenu";
import { usePage, router, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

const DriverDetail = ({ driver, vendor }) => {
    const { flash } = usePage().props;
    const [showFlash, setShowFlash]       = useState(false);
    const [activeTab, setActiveTab]       = useState('profile');
    const [confirmAction, setConfirmAction] = useState(null);
    const [previewImg, setPreviewImg]     = useState(null);

    React.useEffect(() => {
        if (flash?.success || flash?.error) {
            setShowFlash(true);
            const timer = setTimeout(() => setShowFlash(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const tabs = [
        { key: 'profile',   label: 'Profile' },
        { key: 'triphistory', label: 'Trip History' },
        { key: 'payments', label: 'Payments' },
        { key: 'documents', label: 'documents' },
    ];

    const isExpired    = driver.license_expiry && new Date(driver.license_expiry) < new Date();
    const expiringSoon = !isExpired && driver.license_expiry &&
        (new Date(driver.license_expiry) - new Date()) / (1000 * 60 * 60 * 24) <= 30;
    const hasPendingReview = driver.license_review_status === 'pending_review';

    return (
        <div className="flex flex-row bg-[#081028] min-h-screen sm:flex-col md:flex-row lg:flex-row poppins">

            {/* Confirmation Modal */}
            <AnimatePresence>
                {confirmAction && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="bg-[#0B1739] border border-[#343B4F] rounded-[12px] p-6 w-[380px] shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${confirmAction.iconBg}`}>
                                    {confirmAction.icon}
                                </div>
                                <h3 className="text-white text-[16px] font-[600]">{confirmAction.title}</h3>
                            </div>
                            <p className="text-[#AEB9E1] text-[13px] mb-6 leading-relaxed">
                                {confirmAction.message}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmAction(null)}
                                    className="flex-1 border border-[#343B4F] bg-[#0F1A3A] text-[#AEB9E1] text-[13px] py-2.5 rounded-[7px] hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        confirmAction.onConfirm();
                                        setConfirmAction(null);
                                    }}
                                    className={`flex-1 text-[13px] py-2.5 rounded-[7px] font-[500] transition-colors ${confirmAction.confirmStyle}`}
                                >
                                    {confirmAction.confirmLabel}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Image Preview Modal */}
            <AnimatePresence>
                {previewImg && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setPreviewImg(null)}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 cursor-zoom-out"
                    >
                        <img
                            src={previewImg}
                            alt="Document preview"
                            className="max-w-[90vw] max-h-[90vh] rounded-[8px] shadow-2xl object-contain"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Flash Messages */}
            <AnimatePresence>
                {showFlash && flash?.success && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50"
                    >
                        {flash.success}
                    </motion.div>
                )}
                {showFlash && flash?.error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg z-50"
                    >
                        {flash.error}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="sm:w-full md:w-auto lg:w-auto">
                <SideMenu />
            </div>

            <div className="flex-1 px-6 py-6 overflow-y-auto">
                {/* Back nav */}
                <div className="mb-6">
                    <Link
                        href="/superadmin/users/drivers"
                        className="text-[#5B8DEF] text-[14px] hover:text-[#0E43FB] transition-colors"
                    >
                        ← Back to Drivers
                    </Link>
                </div>

                {/* Header Card */}
                <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-6 mb-6">
                    <div className="flex flex-row justify-between items-start">
                        <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className="w-16 h-16 rounded-lg bg-[#0E43FB20] flex items-center justify-center border border-[#343B4F] flex-shrink-0">
                                <span className="text-[#5B8DEF] text-[24px] font-[600]">
                                    {(driver.full_name || '').split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || '?'}
                                </span>
                            </div>

                            <div>
                                <h1 className="text-white text-[22px] font-[600]">{driver.full_name}</h1>
                                {driver.vehicle_type && (
                                    <p className="text-[#5B8DEF] text-[14px]">{driver.vehicle_type}</p>
                                )}
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    {driver.email && (
                                        <span className="text-[#AEB9E1] text-[12px]">{driver.email}</span>
                                    )}
                                    {driver.phone && (
                                        <>
                                            <span className="text-[#343B4F]">|</span>
                                            <span className="text-[#AEB9E1] text-[12px]">{driver.phone}</span>
                                        </>
                                    )}
                                    {vendor && (
                                        <>
                                            <span className="text-[#343B4F]">|</span>
                                            <Link
                                                href={`/superadmin/users/service-providers/${vendor.id}/review`}
                                                className="text-[#5B8DEF] text-[12px] hover:text-[#0E43FB] transition-colors"
                                            >
                                                {vendor.name}
                                            </Link>
                                        </>
                                    )}
                                </div>
                                <p className="text-[#AEB9E1] text-[11px] mt-1">
                                    Registered {driver.created_at_human}
                                </p>
                            </div>
                        </div>

                        {/* Status badge */}
                        <div className="flex flex-col items-end gap-2">
                            <DriverStatusBadge status={driver.user_status} />
                        </div>
                    </div>
                </div>

                {/* License-expired alert banner */}
                {driver.status === 'Inactive' && isExpired && !hasPendingReview && (
                    <div className="border border-[#FF475780] bg-[#FF475715] rounded-[10px] p-4 mb-6 flex items-start gap-3">
                        <svg className="flex-shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M9 2L16.5 15H1.5L9 2Z" stroke="#FF4757" strokeWidth="1.4" strokeLinejoin="round"/>
                            <path d="M9 7V10M9 12.5V13" stroke="#FF4757" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                        <div>
                            <p className="text-[#FF4757] text-[13px] font-[600]">Driver Deactivated — Expired License</p>
                            <p className="text-[#FF4757]/70 text-[12px] mt-0.5 leading-relaxed">
                                This driver was automatically deactivated because their driving license expired
                                on <span className="font-[600]">{driver.license_expiry}</span>. The linked user account has been suspended.
                                The vendor must upload a renewed license to re-activate this driver.
                            </p>
                        </div>
                    </div>
                )}

                {/* Pending license review alert banner */}
                {hasPendingReview && (
                    <div className="border border-[#5B8DEF80] bg-[#5B8DEF15] rounded-[10px] p-4 mb-6 flex items-start gap-3">
                        <svg className="flex-shrink-0 mt-0.5" width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <circle cx="9" cy="9" r="7.5" stroke="#5B8DEF" strokeWidth="1.4"/>
                            <path d="M9 5.5V9.5M9 12V12.5" stroke="#5B8DEF" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                        <div>
                            <p className="text-[#5B8DEF] text-[13px] font-[600]">License Renewal Awaiting Review</p>
                            <p className="text-[#5B8DEF]/80 text-[12px] mt-0.5 leading-relaxed">
                                The vendor has submitted a new license document for review.
                                {driver.pending_license_no && <> New license no: <span className="font-[600]">{driver.pending_license_no}</span>.</>}
                                {driver.pending_license_expiry && <> New expiry: <span className="font-[600]">{driver.pending_license_expiry}</span>.</>}
                                {' '}Review the document below and approve or reject.
                            </p>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-row gap-6">
                    {/* Left: Tabs + Content */}
                    <div className="flex-1 min-w-0">
                        {/* Tabs */}
                        <div className="flex gap-1 mb-6 border-b border-[#343B4F]">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`px-5 py-3 text-[13px] font-[500] transition-colors border-b-2 -mb-[1px] ${
                                        activeTab === tab.key
                                            ? 'text-[#0E43FB] border-[#0E43FB]'
                                            : 'text-[#AEB9E1] border-transparent hover:text-white'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <AnimatePresence mode="wait">
                            {activeTab === 'profile' && (
                                <motion.div
                                    key="profile"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col gap-5"
                                >
                                    {/* Personal Information */}
                                    <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-6">
                                        <SectionTitle>Personal Information</SectionTitle>
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-5 mt-4">
                                            <InfoField label="Full Name"     value={driver.full_name} />
                                            <InfoField label="Email Address" value={driver.email} />
                                            <InfoField label="Phone Number"  value={driver.phone} />
                                            <InfoField label="Address"       value={driver.address} />
                                            <InfoField label="Registered"    value={driver.created_at} />
                                            <InfoField label="Notes"         value={driver.notes} />
                                        </div>
                                    </div>

                                    {/* Vehicle & License Information */}
                                    <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-6">
                                        <SectionTitle>Vehicle & License</SectionTitle>
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-5 mt-4">
                                            <InfoField label="Vehicle Type"   value={driver.vehicle_type} />
                                            <InfoField label="Vehicle Number" value={driver.vehicle_no} />
                                            <InfoField label="License Number" value={driver.license_no} />
                                            <div>
                                                <p className="text-[#AEB9E1] text-[10px] font-[600] tracking-wider uppercase mb-1">License Expiry</p>
                                                {driver.license_expiry ? (
                                                    <div className="flex items-center gap-2">
                                                        <p className={`text-[13px] font-[500] ${isExpired ? 'text-[#FF4757]' : expiringSoon ? 'text-[#FDB52A]' : 'text-[#E0E6F7]'}`}>
                                                            {driver.license_expiry}
                                                        </p>
                                                        {isExpired && (
                                                            <span className="text-[10px] bg-[#FF475720] text-[#FF4757] border border-[#FF475780] px-1.5 py-0.5 rounded">Expired</span>
                                                        )}
                                                        {expiringSoon && (
                                                            <span className="text-[10px] bg-[#FDB52A20] text-[#FDB52A] border border-[#FDB52A80] px-1.5 py-0.5 rounded">Expiring Soon</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <p className="text-[#343B4F] text-[13px]">—</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Service Provider */}
                                    {vendor && (
                                        <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-6">
                                            <SectionTitle>Service Provider</SectionTitle>
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-5 mt-4">
                                                <div>
                                                    <p className="text-[#AEB9E1] text-[10px] font-[600] tracking-wider uppercase mb-1">Vendor Name</p>
                                                    <Link
                                                        href={`/superadmin/users/service-providers/${vendor.id}/review`}
                                                        className="text-[#5B8DEF] text-[13px] hover:text-[#0E43FB] transition-colors"
                                                    >
                                                        {vendor.name}
                                                    </Link>
                                                </div>
                                                <InfoField label="Vendor Email" value={vendor.email} />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'documents' && (
                                <motion.div
                                    key="documents"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex flex-col gap-5"
                                >
                                    <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-6">
                                        <SectionTitle>Driver Documents</SectionTitle>
                                        <div className="grid grid-cols-2 gap-6 mt-4">
                                            {/* License Photo */}
                                            <DocumentCard
                                                label="Driving License"
                                                url={driver.license_photo_url}
                                                onPreview={() => setPreviewImg(driver.license_photo_url)}
                                            />
                                            {/* NIC Photo */}
                                            <DocumentCard
                                                label="National ID (NIC)"
                                                url={driver.nic_photo_url}
                                                onPreview={() => setPreviewImg(driver.nic_photo_url)}
                                            />
                                        </div>
                                        {/* Pending renewal document */}
                                        {hasPendingReview && driver.pending_license_photo_url && (
                                            <div className="mt-5 border-t border-[#343B4F] pt-5">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-2 h-2 rounded-full bg-[#FDB52A]" />
                                                    <h4 className="text-[#FDB52A] text-[13px] font-[600]">Pending Renewal — New License Document</h4>
                                                </div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <DocumentCard
                                                        label={`Submitted License${driver.pending_license_no ? ` (${driver.pending_license_no})` : ''}`}
                                                        url={driver.pending_license_photo_url}
                                                        onPreview={() => setPreviewImg(driver.pending_license_photo_url)}
                                                        highlight
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right: Admin Panel */}
                    <div className="w-[300px] flex flex-col gap-5 flex-shrink-0">
                        {/* Driver Summary */}
                        <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-5">
                            <h3 className="text-white text-[14px] font-[600] mb-4">Driver Summary</h3>
                            <div className="flex flex-col gap-3">
                                <SummaryRow label="Status" value={driver.user_status ?? '—'}
                                    color={
                                        driver.user_status === 'verified'   ? '#14CA74'
                                        : driver.user_status === 'suspended' ? '#FDB52A'
                                        : driver.user_status === 'blocked'   ? '#FF4757'
                                        : '#AEB9E1'
                                    }
                                />
                                <SummaryRow label="Vehicle Type"  value={driver.vehicle_type || '—'}  color="#5B8DEF" />
                                <SummaryRow label="Vehicle No."   value={driver.vehicle_no || '—'}    color="#E0E6F7" />
                                <SummaryRow label="License No."   value={driver.license_no || '—'}    color="#E0E6F7" />
                                {driver.license_expiry && (
                                    <SummaryRow
                                        label="License Expiry"
                                        value={driver.license_expiry}
                                        color={isExpired ? '#FF4757' : expiringSoon ? '#FDB52A' : '#AEB9E1'}
                                    />
                                )}
                                {driver.license_review_status && (
                                    <SummaryRow
                                        label="License Review"
                                        value={
                                            driver.license_review_status === 'pending_review' ? 'Pending Review'
                                            : driver.license_review_status === 'approved'     ? 'Approved'
                                            : 'Rejected'
                                        }
                                        color={
                                            driver.license_review_status === 'pending_review' ? '#FDB52A'
                                            : driver.license_review_status === 'approved'     ? '#14CA74'
                                            : '#FF4757'
                                        }
                                    />
                                )}
                            </div>
                        </div>

                        {/* Admin Tools */}
                        <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-5">
                            <h3 className="text-white text-[14px] font-[600] mb-4">Admin Tools</h3>
                            <div className="flex flex-col gap-3">

                                {/* License Renewal Review — shown when vendor submitted a new license */}
                                {hasPendingReview && (
                                    <div className="border border-[#5B8DEF40] bg-[#5B8DEF10] rounded-[8px] p-4 mb-1">
                                        <p className="text-[#5B8DEF] text-[12px] font-[600] mb-1">License Renewal Submitted</p>
                                        <p className="text-[#AEB9E1] text-[11px] leading-relaxed mb-3">
                                            Review the new license document in the{' '}
                                            <button onClick={() => setActiveTab('documents')} className="text-[#5B8DEF] hover:underline">Documents tab</button>{' '}
                                            then approve or reject.
                                        </p>
                                        <button
                                            onClick={() => setConfirmAction({
                                                title: 'Approve License Renewal',
                                                message: `Approve the new license for ${driver.full_name}? The driver will be reactivated and their account restored.`,
                                                confirmLabel: 'Approve',
                                                confirmStyle: 'border border-[#05C16880] bg-[#05C16820] text-[#14CA74] hover:bg-[#05C16840]',
                                                iconBg: 'bg-[#05C16820]',
                                                icon: <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 3.5" stroke="#14CA74" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                                                onConfirm: () => router.post(`/superadmin/users/drivers/${driver.id}/verify-license`, { action: 'approve' }),
                                            })}
                                            className="flex items-center justify-center gap-2 w-full border border-[#05C16880] bg-[#05C16820] text-[#14CA74] text-[13px] py-2 rounded-[7px] hover:bg-[#05C16840] transition-colors mb-2"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            Approve &amp; Reactivate Driver
                                        </button>
                                        <button
                                            onClick={() => setConfirmAction({
                                                title: 'Reject License Renewal',
                                                message: `Reject the submitted license for ${driver.full_name}? The vendor will need to submit a new document.`,
                                                confirmLabel: 'Reject',
                                                confirmStyle: 'border border-[#FF475780] bg-[#FF475720] text-[#FF4757] hover:bg-[#FF475740]',
                                                iconBg: 'bg-[#FF475720]',
                                                icon: <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M3 3L11 11M3 11L11 3" stroke="#FF4757" strokeWidth="1.4" strokeLinecap="round"/></svg>,
                                                onConfirm: () => router.post(`/superadmin/users/drivers/${driver.id}/verify-license`, { action: 'reject' }),
                                            })}
                                            className="flex items-center justify-center gap-2 w-full border border-[#FF475780] bg-[#FF475720] text-[#FF4757] text-[13px] py-2 rounded-[7px] hover:bg-[#FF475740] transition-colors"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                <path d="M3 3L11 11M3 11L11 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                                            </svg>
                                            Reject Submission
                                        </button>
                                    </div>
                                )}

                                {/* Activate / Deactivate toggle */}
                                {driver.status === 'Active' ? (
                                    <button
                                        onClick={() => setConfirmAction({
                                            title: 'Deactivate Driver',
                                            message: `Are you sure you want to deactivate ${driver.full_name}? They will be marked as inactive.`,
                                            confirmLabel: 'Deactivate',
                                            confirmStyle: 'border border-[#FF475780] bg-[#FF475720] text-[#FF4757] hover:bg-[#FF475740]',
                                            iconBg: 'bg-[#FF475720]',
                                            icon: <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M5 2.5V11.5M9 2.5V11.5" stroke="#FF4757" strokeWidth="1.6" strokeLinecap="round"/></svg>,
                                            onConfirm: () => router.post(`/superadmin/users/drivers/${driver.id}/status`, { status: 'Inactive' }),
                                        })}
                                        className="flex items-center justify-center gap-2 w-full border border-[#FF475780] bg-[#FF475720] text-[#FF4757] text-[13px] py-2.5 rounded-[7px] hover:bg-[#FF475740] transition-colors"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <path d="M5 2.5V11.5M9 2.5V11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                                        </svg>
                                        Deactivate Driver
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setConfirmAction({
                                            title: 'Activate Driver',
                                            message: isExpired
                                                ? `Override and activate ${driver.full_name}? Note: their license is still expired. The linked user account will also be restored.`
                                                : `Are you sure you want to activate ${driver.full_name}? The linked user account will also be restored.`,
                                            confirmLabel: 'Activate',
                                            confirmStyle: 'border border-[#05C16880] bg-[#05C16820] text-[#14CA74] hover:bg-[#05C16840]',
                                            iconBg: 'bg-[#05C16820]',
                                            icon: <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 3.5" stroke="#14CA74" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                                            onConfirm: () => router.post(`/superadmin/users/drivers/${driver.id}/status`, { status: 'Active' }),
                                        })}
                                        className="flex items-center justify-center gap-2 w-full border border-[#05C16880] bg-[#05C16820] text-[#14CA74] text-[13px] py-2.5 rounded-[7px] hover:bg-[#05C16840] transition-colors"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        Activate Driver
                                    </button>
                                )}

                                {/* Delete */}
                                <button
                                    onClick={() => setConfirmAction({
                                        title: 'Delete Driver',
                                        message: `Are you sure you want to permanently delete ${driver.full_name}? This action cannot be undone.`,
                                        confirmLabel: 'Delete',
                                        confirmStyle: 'border border-[#FF475780] bg-[#FF475720] text-[#FF4757] hover:bg-[#FF475740]',
                                        iconBg: 'bg-[#FF475720]',
                                        icon: <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M2 3.5H12M5 3.5V2H9V3.5M3.5 3.5L4 11H10L10.5 3.5" stroke="#FF4757" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
                                        onConfirm: () => router.delete(`/superadmin/users/drivers/${driver.id}`),
                                    })}
                                    className="flex items-center justify-center gap-2 w-full border border-[#FF475780] bg-[#FF475720] text-[#FF4757] text-[13px] py-2.5 rounded-[7px] hover:bg-[#FF475740] transition-colors"
                                >
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M2 3.5H12M5 3.5V2H9V3.5M3.5 3.5L4 11H10L10.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    Delete Driver
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ── Helper Components ── */

const DriverStatusBadge = ({ status }) => {
    const map = {
        verified:   { border: "border-[#05C16880]", bg: "bg-[#05C16833]", dot: "bg-[#14CA74]",  text: "text-[#14CA74]" },
        unverified: { border: "border-[#AEB9E180]", bg: "bg-[#AEB9E133]", dot: "bg-[#AEB9E1]",  text: "text-[#AEB9E1]" },
        inreview:   { border: "border-[#5B8DEF80]", bg: "bg-[#5B8DEF33]", dot: "bg-[#5B8DEF]",  text: "text-[#5B8DEF]" },
        suspended:  { border: "border-[#FDB52A80]", bg: "bg-[#FDB52A33]", dot: "bg-[#FDB52A]",  text: "text-[#FDB52A]" },
        blocked:    { border: "border-[#FF475780]", bg: "bg-[#FF475733]", dot: "bg-[#FF4757]",  text: "text-[#FF4757]" },
        rejected:   { border: "border-[#FF475780]", bg: "bg-[#FF475733]", dot: "bg-[#FF4757]",  text: "text-[#FF4757]" },
    };
    const s = map[status] || map.unverified;
    return (
        <div className={`inline-flex items-center gap-1.5 border ${s.border} ${s.bg} px-[10px] py-[4px] rounded-[6px]`}>
            <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            <span className={`${s.text} text-[11px] font-[500]`}>{status}</span>
        </div>
    );
};

const SectionTitle = ({ children }) => (
    <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-[#0E43FB]" />
        <h3 className="text-white text-[15px] font-[600]">{children}</h3>
    </div>
);

const InfoField = ({ label, value }) => (
    <div>
        <p className="text-[#AEB9E1] text-[10px] font-[600] tracking-wider uppercase mb-1">{label}</p>
        <p className="text-[#E0E6F7] text-[13px]">
            {value || <span className="text-[#343B4F]">—</span>}
        </p>
    </div>
);

const SummaryRow = ({ label, value, color }) => (
    <div className="flex items-center justify-between">
        <span className="text-[#AEB9E1] text-[13px]">{label}</span>
        <span className="text-[13px] font-[600]" style={{ color }}>{value}</span>
    </div>
);

const DocumentCard = ({ label, url, onPreview, highlight }) => (
    <div className={`border rounded-[8px] p-4 ${highlight ? 'border-[#FDB52A80] bg-[#FDB52A10]' : 'border-[#343B4F] bg-[#0F1A3A]'}`}>
        <p className="text-[#AEB9E1] text-[11px] font-[600] tracking-wider uppercase mb-3">{label}</p>
        {url ? (
            <div className="flex flex-col gap-2">
                <div
                    className="w-full h-[140px] rounded-[6px] overflow-hidden bg-[#081028] cursor-zoom-in border border-[#343B4F] flex items-center justify-center"
                    onClick={onPreview}
                >
                    <img
                        src={url}
                        alt={label}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                    />
                    <div className="hidden w-full h-full items-center justify-center text-[#AEB9E1] text-[12px]">
                        Preview unavailable
                    </div>
                </div>
                <a
                    href={url}
                    download
                    className="flex items-center justify-center gap-2 text-[#5B8DEF] text-[12px] hover:text-[#0E43FB] transition-colors"
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 1V7.5M6 7.5L4 5.5M6 7.5L8 5.5M2 9.5H10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Download
                </a>
            </div>
        ) : (
            <div className="w-full h-[140px] rounded-[6px] bg-[#081028] border border-[#343B4F] flex items-center justify-center">
                <p className="text-[#343B4F] text-[12px]">Not uploaded</p>
            </div>
        )}
    </div>
);

export default DriverDetail;
