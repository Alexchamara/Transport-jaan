import React, { useState } from "react";
import SideMenu from "../../components/SuperAdmin/Dashboard1/SideMenu";
import { usePage, router, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

const UserDetail = ({ user, bookingCounts, recentBookings, activityLogs }) => {
    const { flash } = usePage().props;
    const [showFlash, setShowFlash] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [confirmAction, setConfirmAction] = useState(null);

    React.useEffect(() => {
        if (flash?.success || flash?.error) {
            setShowFlash(true);
            const timer = setTimeout(() => setShowFlash(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const tabs = [
        { key: 'profile', label: 'Profile' },
        { key: 'bookings', label: `Bookings (${bookingCounts?.total || 0})` },
        { key: 'activity', label: 'Activity Log' },
    ];

    const backRoute = user.role === 'client' ? '/superadmin/users/clients' : '/superadmin/users';
    const backLabel = user.role === 'client' ? 'Back to Clients' : 'Back to Users';

    const getInitials = (u) => {
        const parts = (u.name || '').split(' ');
        return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
    };

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
                                        router.post(`/superadmin/users/${user.id}/status`, { status: confirmAction.status });
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
                        href={backRoute}
                        className="text-[#5B8DEF] text-[14px] hover:text-[#0E43FB] transition-colors"
                    >
                        {backLabel}
                    </Link>
                </div>

                {/* Header Card */}
                <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-6 mb-6">
                    <div className="flex flex-row justify-between items-start">
                        <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className="w-16 h-16 rounded-lg bg-[#0E43FB20] flex items-center justify-center border border-[#343B4F] overflow-hidden flex-shrink-0">
                                {user.avatar ? (
                                    <img
                                        src={`/uploads/${user.avatar}`}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-[#5B8DEF] text-[24px] font-[600]">
                                        {getInitials(user)}
                                    </span>
                                )}
                            </div>

                            <div>
                                <h1 className="text-white text-[22px] font-[600]">{user.name}</h1>
                                {(user.city || user.country) && (
                                    <p className="text-[#5B8DEF] text-[14px]">
                                        {[user.city, user.country].filter(Boolean).join(', ')}
                                    </p>
                                )}
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    <span className="text-[#AEB9E1] text-[12px]">{user.email}</span>
                                    {user.phone && (
                                        <>
                                            <span className="text-[#343B4F]">|</span>
                                            <span className="text-[#AEB9E1] text-[12px]">{user.phone}</span>
                                        </>
                                    )}
                                    <span className="text-[#343B4F]">|</span>
                                    <span className="text-[#AEB9E1] text-[12px] capitalize">{user.role}</span>
                                </div>
                                <p className="text-[#AEB9E1] text-[11px] mt-1">
                                    Registered {user.created_at_human}
                                </p>
                            </div>
                        </div>

                        {/* Status badges */}
                        <div className="flex flex-col items-end gap-2">
                            <StatusBadge status={user.status} />
                        </div>
                    </div>
                </div>

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
                                            <InfoField label="Full Name" value={user.name} />
                                            <InfoField label="Email Address" value={user.email} />
                                            <InfoField label="Phone Number" value={user.phone} />
                                            <InfoField label="User Role" value={user.role} capitalize />
                                            <InfoField label="Registered" value={user.created_at} />
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-6">
                                        <SectionTitle>Address</SectionTitle>
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-5 mt-4">
                                            <InfoField label="Address Line 1" value={user.address_line1 || user.address} />
                                            <InfoField label="Address Line 2" value={user.address_line2} />
                                            <InfoField label="City" value={user.city} />
                                            <InfoField label="State / Province" value={user.state} />
                                            <InfoField label="Postal Code" value={user.postal_code} />
                                            <InfoField label="Country" value={user.country} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'bookings' && (
                                <motion.div
                                    key="bookings"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] overflow-hidden">
                                        {/* Stats row */}
                                        <div className="grid grid-cols-4 border-b border-[#343B4F]">
                                            {[
                                                { label: 'Total', value: bookingCounts?.total || 0, color: '#CB3CFF' },
                                                { label: 'Active', value: bookingCounts?.active || 0, color: '#FDB52A' },
                                                { label: 'Completed', value: bookingCounts?.completed || 0, color: '#05C168' },
                                                { label: 'Cancelled', value: bookingCounts?.cancelled || 0, color: '#FF4757' },
                                            ].map((s, i) => (
                                                <div key={i} className="p-4 flex items-center gap-3 border-r border-[#343B4F] last:border-r-0">
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${s.color}20` }}>
                                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[#AEB9E1] text-[11px]">{s.label}</p>
                                                        <p className="text-white text-[18px] font-[600]">{s.value}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Table */}
                                        <div className="px-6 py-4">
                                            <h3 className="text-white text-[14px] font-[600] mb-4">Recent Bookings</h3>
                                            {(!recentBookings || recentBookings.length === 0) ? (
                                                <p className="text-[#AEB9E1] text-[13px] py-6 text-center">No bookings found.</p>
                                            ) : (
                                                <div className="flex flex-col gap-0">
                                                    <div className="flex flex-row h-[40px] bg-[#0F1A3A] border-b border-[#343B4F] items-center px-4 rounded-t-lg">
                                                        <div className="flex-[0.5]"><span className="text-white text-[12px] font-[600]">#</span></div>
                                                        <div className="flex-[1]"><span className="text-white text-[12px] font-[600]">Date</span></div>
                                                        <div className="flex-[1]"><span className="text-white text-[12px] font-[600]">Status</span></div>
                                                        <div className="flex-[1] text-right"><span className="text-white text-[12px] font-[600]">Amount</span></div>
                                                    </div>
                                                    {recentBookings.map((b) => {
                                                        const bs = getBookingStatusStyles(b.status);
                                                        return (
                                                            <div key={b.id} className="flex flex-row items-center px-4 py-3 border-b border-[#343B4F] last:border-b-0 hover:bg-[#0F1A3A]/50 transition-colors">
                                                                <div className="flex-[0.5]"><span className="text-[#AEB9E1] text-[12px]">#{b.id}</span></div>
                                                                <div className="flex-[1]"><span className="text-[#AEB9E1] text-[12px]">{b.created_at}</span></div>
                                                                <div className="flex-[1]">
                                                                    <div className={`inline-flex items-center gap-1.5 border ${bs.border} ${bs.bg} px-[8px] py-[3px] rounded-[5px]`}>
                                                                        <div className={`w-1.5 h-1.5 rounded-full ${bs.dot}`} />
                                                                        <span className={`${bs.text} text-[11px] font-[500] capitalize`}>{b.status.replace('_', ' ')}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-[1] text-right">
                                                                    <span className="text-[#E0E6F7] text-[12px] font-[500]">
                                                                        {b.currency} {Number(b.total_amount).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'activity' && (
                                <motion.div
                                    key="activity"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-6">
                                        <h3 className="text-white text-[14px] font-[600] mb-4">Activity Log</h3>
                                        {(!activityLogs || activityLogs.length === 0) ? (
                                            <p className="text-[#AEB9E1] text-[13px] py-6 text-center">No activity recorded.</p>
                                        ) : (
                                            <div className="relative pl-4">
                                                <div className="absolute left-[7px] top-0 bottom-0 w-[1px] bg-[#343B4F]" />
                                                {activityLogs.map((log) => (
                                                    <div key={log.id} className="relative mb-5 pl-6">
                                                        <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-[#0E43FB] border-2 border-[#081028]" />
                                                        <p className="text-[#E0E6F7] text-[13px] font-[500] capitalize">{log.action?.replace(/_/g, ' ')}</p>
                                                        {log.description && (
                                                            <p className="text-[#AEB9E1] text-[12px] mt-0.5">{log.description}</p>
                                                        )}
                                                        <p className="text-[#AEB9E1] text-[11px] mt-1">
                                                            {log.created_at_human} &middot; by {log.performed_by}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right: Admin Panel */}
                    <div className="w-[300px] flex flex-col gap-5 flex-shrink-0">
                        {/* Account Summary */}
                        <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-5">
                            <h3 className="text-white text-[14px] font-[600] mb-4">Account Summary</h3>
                            <div className="flex flex-col gap-3">
                                <SummaryRow label="Total Bookings" value={bookingCounts?.total || 0} color="#CB3CFF" />
                                <SummaryRow label="Active" value={bookingCounts?.active || 0} color="#FDB52A" />
                                <SummaryRow label="Completed" value={bookingCounts?.completed || 0} color="#05C168" />
                                <SummaryRow label="Cancelled" value={bookingCounts?.cancelled || 0} color="#FF4757" />
                            </div>
                            {/* Progress bar: completed vs total */}
                            <div className="mt-4">
                                <div className="w-full h-1.5 bg-[#343B4F] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#05C168] rounded-full transition-all"
                                        style={{ width: bookingCounts?.total > 0 ? `${Math.round((bookingCounts.completed / bookingCounts.total) * 100)}%` : '0%' }}
                                    />
                                </div>
                                <p className="text-[#AEB9E1] text-[10px] mt-1">
                                    {bookingCounts?.total > 0 ? Math.round((bookingCounts.completed / bookingCounts.total) * 100) : 0}% completion rate
                                </p>
                            </div>
                        </div>

                        {/* Admin Tools */}
                        <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-5">
                            <h3 className="text-white text-[14px] font-[600] mb-4">Admin Tools</h3>
                            <div className="flex flex-col gap-3">
                                {/* Suspend / Unsuspend */}
                                {user.status !== 'suspended' ? (
                                    <button
                                        onClick={() => setConfirmAction({
                                            title: 'Suspend User',
                                            message: `Are you sure you want to suspend ${user.name}? They will be temporarily restricted from accessing the platform.`,
                                            status: 'suspended',
                                            confirmLabel: 'Suspend',
                                            confirmStyle: 'border border-[#FDB52A80] bg-[#FDB52A20] text-[#FDB52A] hover:bg-[#FDB52A40]',
                                            iconBg: 'bg-[#FDB52A20]',
                                            icon: <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M5 2.5V11.5M9 2.5V11.5" stroke="#FDB52A" strokeWidth="1.6" strokeLinecap="round"/></svg>,
                                        })}
                                        className="flex items-center justify-center gap-2 w-full border border-[#FDB52A80] bg-[#FDB52A20] text-[#FDB52A] text-[13px] py-2.5 rounded-[7px] hover:bg-[#FDB52A40] transition-colors"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <path d="M5 2.5V11.5M9 2.5V11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                                        </svg>
                                        Suspend User
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setConfirmAction({
                                            title: 'Unsuspend User',
                                            message: `Are you sure you want to unsuspend ${user.name}? Their account will be restored to unverified status.`,
                                            status: 'verified',
                                            confirmLabel: 'Unsuspend',
                                            confirmStyle: 'border border-[#AEB9E180] bg-[#AEB9E120] text-[#AEB9E1] hover:bg-[#AEB9E140]',
                                            iconBg: 'bg-[#AEB9E120]',
                                            icon: <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M5 2.5V11.5M9 2.5V11.5" stroke="#AEB9E1" strokeWidth="1.6" strokeLinecap="round"/></svg>,
                                        })}
                                        className="flex items-center justify-center gap-2 w-full border border-[#AEB9E180] bg-[#AEB9E120] text-[#AEB9E1] text-[13px] py-2.5 rounded-[7px] hover:bg-[#AEB9E140] transition-colors"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <path d="M5 2.5V11.5M9 2.5V11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                                        </svg>
                                        Unsuspend User
                                    </button>
                                )}

                                {/* Block / Unblock */}
                                {user.status !== 'blocked' ? (
                                    <button
                                        onClick={() => setConfirmAction({
                                            title: 'Block User',
                                            message: `Are you sure you want to block ${user.name}? They will be permanently banned from the platform.`,
                                            status: 'blocked',
                                            confirmLabel: 'Block',
                                            confirmStyle: 'border border-[#FF475780] bg-[#FF475720] text-[#FF4757] hover:bg-[#FF475740]',
                                            iconBg: 'bg-[#FF475720]',
                                            icon: <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#FF4757" strokeWidth="1.4"/><path d="M3.5 3.5L10.5 10.5" stroke="#FF4757" strokeWidth="1.4" strokeLinecap="round"/></svg>,
                                        })}
                                        className="flex items-center justify-center gap-2 w-full border border-[#FF475780] bg-[#FF475720] text-[#FF4757] text-[13px] py-2.5 rounded-[7px] hover:bg-[#FF475740] transition-colors"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4"/>
                                            <path d="M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                                        </svg>
                                        Block User
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setConfirmAction({
                                            title: 'Unblock User',
                                            message: `Are you sure you want to unblock ${user.name}? Their account will be restored to unverified status.`,
                                            status: 'verified',
                                            confirmLabel: 'Unblock',
                                            confirmStyle: 'border border-[#AEB9E180] bg-[#AEB9E120] text-[#AEB9E1] hover:bg-[#AEB9E140]',
                                            iconBg: 'bg-[#AEB9E120]',
                                            icon: <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#AEB9E1" strokeWidth="1.4"/><path d="M4.5 7H9.5" stroke="#AEB9E1" strokeWidth="1.4" strokeLinecap="round"/></svg>,
                                        })}
                                        className="flex items-center justify-center gap-2 w-full border border-[#AEB9E180] bg-[#AEB9E120] text-[#AEB9E1] text-[13px] py-2.5 rounded-[7px] hover:bg-[#AEB9E140] transition-colors"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4"/>
                                            <path d="M4.5 7H9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                                        </svg>
                                        Unblock User
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* â”€â”€ Helpers â”€â”€ */

const StatusBadge = ({ status }) => {
    const map = {
        verified:   { border: "border-[#05C16880]", bg: "bg-[#05C16833]", dot: "bg-[#14CA74]", text: "text-[#14CA74]", label: 'Verified' },
        inreview:   { border: "border-[#FDB52A80]", bg: "bg-[#FDB52A33]", dot: "bg-[#FDB52A]",  text: "text-[#FDB52A]", label: 'In Review' },
        suspended:  { border: "border-[#FDB52A80]", bg: "bg-[#FDB52A33]", dot: "bg-[#FDB52A]",  text: "text-[#FDB52A]", label: 'Suspended' },
        unverified: { border: "border-[#AEB9E180]", bg: "bg-[#AEB9E133]", dot: "bg-[#AEB9E1]",  text: "text-[#AEB9E1]", label: 'Unverified' },
        blocked:    { border: "border-[#FF475780]", bg: "bg-[#FF475733]", dot: "bg-[#FF4757]",  text: "text-[#FF4757]", label: 'Blocked' },
        rejected:   { border: "border-[#FF475780]", bg: "bg-[#FF475733]", dot: "bg-[#FF4757]",  text: "text-[#FF4757]", label: 'Rejected' },
    };
    const s = map[status] || map.unverified;
    return (
        <div className={`inline-flex items-center gap-1.5 border ${s.border} ${s.bg} px-[10px] py-[4px] rounded-[6px]`}>
            <div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            <span className={`${s.text} text-[11px] font-[500]`}>{s.label}</span>
        </div>
    );
};

const getBookingStatusStyles = (status) => {
    switch (status) {
        case 'completed':  return { border: "border-[#05C16880]", bg: "bg-[#05C16833]", dot: "bg-[#14CA74]",  text: "text-[#14CA74]" };
        case 'confirmed':
        case 'in_progress':return { border: "border-[#0E43FB80]", bg: "bg-[#0E43FB33]", dot: "bg-[#5B8DEF]",  text: "text-[#5B8DEF]" };
        case 'pending':    return { border: "border-[#FDB52A80]", bg: "bg-[#FDB52A33]", dot: "bg-[#FDB52A]",  text: "text-[#FDB52A]" };
        case 'cancelled':  return { border: "border-[#FF475780]", bg: "bg-[#FF475733]", dot: "bg-[#FF4757]",  text: "text-[#FF4757]" };
        default:           return { border: "border-[#AEB9E180]", bg: "bg-[#AEB9E133]", dot: "bg-[#AEB9E1]",  text: "text-[#AEB9E1]" };
    }
};

const SectionTitle = ({ children }) => (
    <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-[#0E43FB]" />
        <h3 className="text-white text-[15px] font-[600]">{children}</h3>
    </div>
);

const InfoField = ({ label, value, capitalize = false }) => (
    <div>
        <p className="text-[#AEB9E1] text-[10px] font-[600] tracking-wider uppercase mb-1">{label}</p>
        <p className={`text-[#E0E6F7] text-[13px] ${capitalize ? 'capitalize' : ''}`}>
            {value || <span className="text-[#343B4F]">â€”</span>}
        </p>
    </div>
);

const SummaryRow = ({ label, value, color }) => (
    <div className="flex items-center justify-between">
        <span className="text-[#AEB9E1] text-[13px]">{label}</span>
        <span className="text-[13px] font-[600]" style={{ color }}>{value}</span>
    </div>
);

export default UserDetail;
