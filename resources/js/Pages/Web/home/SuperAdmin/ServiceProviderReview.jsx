import React, { useState } from "react";
import SideMenu from "../../components/SuperAdmin/Dashboard1/SideMenu";
import { usePage, router, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import BusinessProfileSection from "../../components/SuperAdmin/ServiceProvider/BusinessProfileSection";
import ServiceRegistrationsSection from "../../components/SuperAdmin/ServiceProvider/ServiceRegistrationsSection";
import ActivityTimeline from "../../components/SuperAdmin/ServiceProvider/ActivityTimeline";
import AdminActionsPanel from "../../components/SuperAdmin/ServiceProvider/AdminActionsPanel";

const ServiceProviderReview = ({ vendor, vendorProfile, serviceRegistrations, activityLogs }) => {
    const { flash } = usePage().props;
    const [showFlash, setShowFlash] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    React.useEffect(() => {
        if (flash?.success || flash?.error) {
            setShowFlash(true);
            const timer = setTimeout(() => setShowFlash(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const tabs = [
        { key: 'profile', label: 'Business Profile' },
        { key: 'services', label: `Services (${serviceRegistrations?.length || 0})` },
        { key: 'activity', label: 'Activity Log' },
    ];

    return (
        <div className="flex flex-row bg-[#081028] min-h-screen sm:flex-col md:flex-row lg:flex-row poppins">
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
                {/* Header */}
                <div className="flex flex-row justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/superadmin/users/service-providers"
                            className="text-[#5B8DEF] text-[14px] hover:text-[#0E43FB] transition-colors"
                        >
                            ← Back to Service Providers
                        </Link>
                    </div>
                </div>

                {/* Service Provider Header Card */}
                <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-6 mb-6">
                    <div className="flex flex-row justify-between items-start">
                        <div className="flex items-start gap-4">
                            {/* Service Provider Logo */}
                            {vendorProfile?.logo ? (
                                <img
                                    src={`/storage/${vendorProfile.logo}`}
                                    alt="Service Provider Logo"
                                    className="w-16 h-16 rounded-lg object-cover border border-[#343B4F]"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-lg bg-[#0E43FB20] flex items-center justify-center border border-[#343B4F]">
                                    <span className="text-[#5B8DEF] text-[24px] font-[600]">
                                        {vendor?.name?.charAt(0)?.toUpperCase() || 'V'}
                                    </span>
                                </div>
                            )}
                            <div>
                                <h1 className="text-white text-[22px] font-[600]">{vendor?.name}</h1>
                                {vendorProfile?.company_name && (
                                    <p className="text-[#5B8DEF] text-[14px]">{vendorProfile.company_name}</p>
                                )}
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[#AEB9E1] text-[12px]">{vendor?.email}</span>
                                    {vendor?.phone && (
                                        <>
                                            <span className="text-[#343B4F]">|</span>
                                            <span className="text-[#AEB9E1] text-[12px]">{vendor.phone}</span>
                                        </>
                                    )}
                                    <span className="text-[#343B4F]">|</span>
                                    <span className="text-[#AEB9E1] text-[12px] capitalize">{vendor?.vendor_type}</span>
                                </div>
                                <p className="text-[#AEB9E1] text-[11px] mt-1">Registered {vendor?.registered_ago}</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                            <StatusBadge status={vendor?.status} type="user" />
                            {vendorProfile && (
                                <StatusBadge status={vendorProfile.submission_status} type="submission" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-row gap-6">
                    {/* Left: Tabs + Content */}
                    <div className="flex-1">
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
                                >
                                    <BusinessProfileSection vendorProfile={vendorProfile} vendor={vendor} />
                                </motion.div>
                            )}
                            {activeTab === 'services' && (
                                <motion.div
                                    key="services"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ServiceRegistrationsSection
                                        serviceRegistrations={serviceRegistrations}
                                        vendorId={vendor?.id}
                                    />
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
                                    <ActivityTimeline activityLogs={activityLogs} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right: Admin Actions Panel */}
                    <div className="w-[320px]">
                        <AdminActionsPanel
                            vendor={vendor}
                            vendorProfile={vendorProfile}
                            serviceRegistrations={serviceRegistrations}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatusBadge = ({ status, type }) => {
    const getStyles = () => {
        if (type === 'user') {
            switch (status) {
                case 'verified':
                    return { border: "border-[#05C16880]", bg: "bg-[#05C16833]", dot: "bg-[#14CA74]", text: "text-[#14CA74]", label: 'Verified' };
                case 'inreview':
                    return { border: "border-[#FDB52A80]", bg: "bg-[#FDB52A33]", dot: "bg-[#FDB52A]", text: "text-[#FDB52A]", label: 'In Review' };
                case 'unverified':
                    return { border: "border-[#AEB9E180]", bg: "bg-[#AEB9E133]", dot: "bg-[#AEB9E1]", text: "text-[#AEB9E1]", label: 'Unverified' };
                case 'blocked':
                    return { border: "border-[#FF475780]", bg: "bg-[#FF475733]", dot: "bg-[#FF4757]", text: "text-[#FF4757]", label: 'Blocked' };
                case 'rejected':
                    return { border: "border-[#FF475780]", bg: "bg-[#FF475733]", dot: "bg-[#FF4757]", text: "text-[#FF4757]", label: 'Rejected' };
                default:
                    return { border: "border-[#AEB9E180]", bg: "bg-[#AEB9E133]", dot: "bg-[#AEB9E1]", text: "text-[#AEB9E1]", label: status };
            }
        } else {
            switch (status) {
                case 'approved':
                    return { border: "border-[#05C16880]", bg: "bg-[#05C16833]", dot: "bg-[#14CA74]", text: "text-[#14CA74]", label: 'Profile Approved' };
                case 'submitted':
                    return { border: "border-[#0E43FB80]", bg: "bg-[#0E43FB33]", dot: "bg-[#5B8DEF]", text: "text-[#5B8DEF]", label: 'Pending Review' };
                case 'revision_requested':
                    return { border: "border-[#FDB52A80]", bg: "bg-[#FDB52A33]", dot: "bg-[#FDB52A]", text: "text-[#FDB52A]", label: 'Revision Requested' };
                case 'rejected':
                    return { border: "border-[#FF475780]", bg: "bg-[#FF475733]", dot: "bg-[#FF4757]", text: "text-[#FF4757]", label: 'Profile Rejected' };
                case 'draft':
                    return { border: "border-[#AEB9E180]", bg: "bg-[#AEB9E133]", dot: "bg-[#AEB9E1]", text: "text-[#AEB9E1]", label: 'Draft' };
                default:
                    return { border: "border-[#AEB9E180]", bg: "bg-[#AEB9E133]", dot: "bg-[#AEB9E1]", text: "text-[#AEB9E1]", label: status || 'N/A' };
            }
        }
    };

    const styles = getStyles();

    return (
        <div className={`inline-flex items-center gap-1.5 border ${styles.border} ${styles.bg} px-[10px] py-[4px] rounded-[6px]`}>
            <div className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
            <span className={`${styles.text} text-[11px] font-[500]`}>{styles.label}</span>
        </div>
    );
};

export default ServiceProviderReview;
