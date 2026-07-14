import React, { useState } from "react";
import { router } from '@inertiajs/react';
import { CheckCircle, Clock3, FileEdit, ShieldCheck, ShieldX, XCircle } from "lucide-react";
import ActionModalTemplate from "../Common/ActionModalTemplate";

const AdminActionsPanel = ({ vendor, serviceRegistrations, vendorProfile }) => {
    const [showActionModal, setShowActionModal] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    const pendingCount = serviceRegistrations?.filter(r => r.status === 'submitted').length || 0;
    const approvedCount = serviceRegistrations?.filter(r => r.status === 'approved').length || 0;
    const rejectedCount = serviceRegistrations?.filter(r => r.status === 'rejected').length || 0;
    const totalCount = serviceRegistrations?.length || 0;

    const actionModalConfig = {
        approve_all: {
            title: 'Approve All Pending Services',
            description: `This will approve all ${pendingCount} pending service registrations.`,
            placeholder: 'Optional notes...',
            confirmText: 'Confirm',
            confirmClassName: 'bg-[#05C168] hover:bg-[#05C168]/80',
            notesRequired: false,
            showNotes: true,
            icon: <CheckCircle size={16} className="text-[#14CA74]" />,
            iconBg: 'bg-[#05C16820]',
        },
        reject_all: {
            title: 'Reject All Pending Services',
            description: `This will reject all ${pendingCount} pending service registrations. A reason is required.`,
            placeholder: 'Reason for rejection (required)...',
            confirmText: 'Reject All',
            confirmClassName: 'bg-[#FF4757] hover:bg-[#FF4757]/80',
            notesRequired: true,
            showNotes: true,
            icon: <XCircle size={16} className="text-[#FF4757]" />,
            iconBg: 'bg-[#FF475720]',
        },
        request_revision: {
            title: 'Request Revision for All',
            description: `This will request revision for all ${pendingCount} pending services. Details are required.`,
            placeholder: 'Describe what needs revision (required)...',
            confirmText: 'Request Revision',
            confirmClassName: 'bg-[#FDB52A] hover:bg-[#FDB52A]/80',
            notesRequired: true,
            showNotes: true,
            icon: <Clock3 size={16} className="text-[#FDB52A]" />,
            iconBg: 'bg-[#FDB52A20]',
        },
        block_vendor: {
            title: 'Block Vendor',
            description: 'This will block the vendor account from using the platform.',
            placeholder: '',
            confirmText: 'Block Vendor',
            confirmClassName: 'bg-[#FF4757] hover:bg-[#FF4757]/80',
            notesRequired: false,
            showNotes: false,
            icon: <ShieldX size={16} className="text-[#FF4757]" />,
            iconBg: 'bg-[#FF475720]',
        },
        unblock_vendor: {
            title: 'Unblock Vendor',
            description: 'This will unblock the vendor account and restore platform access.',
            placeholder: '',
            confirmText: 'Unblock Vendor',
            confirmClassName: 'bg-[#05C168] hover:bg-[#05C168]/80',
            notesRequired: false,
            showNotes: false,
            icon: <ShieldCheck size={16} className="text-[#14CA74]" />,
            iconBg: 'bg-[#05C16820]',
        },
        add_note: {
            title: 'Add Admin Note',
            description: "Add a note to this vendor's activity log.",
            placeholder: 'Write your note here...',
            confirmText: 'Save Note',
            confirmClassName: 'bg-[#0E43FB] hover:bg-[#0A36D6]',
            notesRequired: true,
            showNotes: true,
            processingText: 'Saving...',
            icon: <FileEdit size={16} className="text-[#5B8DEF]" />,
            iconBg: 'bg-[#0E43FB20]',
        },
    };

    const handleActionConfirm = (action) => {
        const config = actionModalConfig[action];
        if (!config) return;

        const routeMap = {
            approve_all: `/superadmin/users/service-providers/${vendor.id}/approve-all`,
            reject_all: `/superadmin/users/service-providers/${vendor.id}/reject-all`,
            request_revision: `/superadmin/users/service-providers/${vendor.id}/request-revision`,
            add_note: `/superadmin/users/service-providers/${vendor.id}/add-note`,
        };

        if (config.notesRequired && !adminNotes.trim()) return;

        setProcessing(true);
        if (['block_vendor', 'unblock_vendor'].includes(action)) {
            const isBlockedAction = action === 'block_vendor';
            const url = isBlockedAction
                ? `/superadmin/users/service-providers/${vendor.id}/block`
                : `/superadmin/users/service-providers/${vendor.id}/unblock`;

            router.post(url, {}, {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setShowActionModal(null);
                    setAdminNotes('');
                },
            });
            return;
        }

        const payload = action === 'add_note'
            ? { admin_notes: adminNotes }
            : { admin_notes: adminNotes };

        router.post(routeMap[action], payload, {
            preserveScroll: true,
            onFinish: () => {
                setProcessing(false);
                setShowActionModal(null);
                setAdminNotes('');
            },
        });
    };

    const openActionModal = (action) => {
        setShowActionModal(action);
        setAdminNotes('');
    };

    return (
        <div className="space-y-4">
            {/* Service Summary */}
            <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-4">
                <h3 className="text-white text-[13px] font-[600] mb-3">Service Summary</h3>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-[#AEB9E1] text-[12px]">Total Services</span>
                        <span className="text-white text-[13px] font-[600]">{totalCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[#AEB9E1] text-[12px]">Pending Review</span>
                        <span className="text-[#5B8DEF] text-[13px] font-[600]">{pendingCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[#AEB9E1] text-[12px]">Approved</span>
                        <span className="text-[#14CA74] text-[13px] font-[600]">{approvedCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[#AEB9E1] text-[12px]">Rejected</span>
                        <span className="text-[#FF4757] text-[13px] font-[600]">{rejectedCount}</span>
                    </div>
                    {/* Progress bar */}
                    {totalCount > 0 && (
                        <div className="mt-2">
                            <div className="w-full h-2 bg-[#081028] rounded-full overflow-hidden flex">
                                {approvedCount > 0 && (
                                    <div className="bg-[#14CA74] h-full" style={{ width: `${(approvedCount / totalCount) * 100}%` }} />
                                )}
                                {pendingCount > 0 && (
                                    <div className="bg-[#5B8DEF] h-full" style={{ width: `${(pendingCount / totalCount) * 100}%` }} />
                                )}
                                {rejectedCount > 0 && (
                                    <div className="bg-[#FF4757] h-full" style={{ width: `${(rejectedCount / totalCount) * 100}%` }} />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bulk Actions */}
            {pendingCount > 0 && (
                <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-4">
                    <h3 className="text-white text-[13px] font-[600] mb-3">Bulk Actions</h3>
                    <div className="space-y-2">
                        <button
                            onClick={() => openActionModal('approve_all')}
                            className="w-full bg-[#05C168] text-white text-[12px] px-4 py-2 rounded-[5px] hover:bg-[#05C168]/80 transition-colors"
                        >
                            Approve All Pending ({pendingCount})
                        </button>
                        <button
                            onClick={() => openActionModal('reject_all')}
                            className="w-full bg-[#FF4757] text-white text-[12px] px-4 py-2 rounded-[5px] hover:bg-[#FF4757]/80 transition-colors"
                        >
                            Reject All Pending ({pendingCount})
                        </button>
                        <button
                            onClick={() => openActionModal('request_revision')}
                            className="w-full border border-[#FDB52A] text-[#FDB52A] text-[12px] px-4 py-2 rounded-[5px] hover:bg-[#FDB52A20] transition-colors"
                        >
                            Request Revision
                        </button>
                    </div>
                </div>
            )}

            {/* Admin Tools */}
            <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-4">
                <h3 className="text-white text-[13px] font-[600] mb-3">Admin Tools</h3>
                <div className="space-y-2">
                    <button
                        onClick={() => openActionModal('add_note')}
                        className="w-full border border-[#343B4F] text-[#AEB9E1] text-[12px] px-4 py-2 rounded-[5px] hover:bg-[#343B4F30] transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Add Admin Note
                    </button>

                    <button
                        onClick={() => openActionModal(vendor.status === 'blocked' ? 'unblock_vendor' : 'block_vendor')}
                        disabled={processing}
                        className={`w-full text-[12px] px-4 py-2 rounded-[5px] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
                            vendor.status === 'blocked'
                                ? 'border border-[#14CA74] text-[#14CA74] hover:bg-[#05C16820]'
                                : 'border border-[#FF4757] text-[#FF4757] hover:bg-[#FF475720]'
                        }`}
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {vendor.status === 'blocked' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            )}
                        </svg>
                        {vendor.status === 'blocked' ? 'Unblock Vendor' : 'Block Vendor'}
                    </button>

                    <a
                        href={`/superadmin/users/service-providers/${vendor.id}/download-all-documents`}
                        className="w-full border border-[#343B4F] text-[#AEB9E1] text-[12px] px-4 py-2 rounded-[5px] hover:bg-[#343B4F30] transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download All Documents (ZIP)
                    </a>
                </div>
            </div>



            {/* Action Modals */}
            {showActionModal && actionModalConfig[showActionModal] && (
                <ActionModalTemplate
                    title={actionModalConfig[showActionModal].title}
                    description={actionModalConfig[showActionModal].description}
                    notes={adminNotes}
                    setNotes={setAdminNotes}
                    placeholder={actionModalConfig[showActionModal].placeholder}
                    showNotes={actionModalConfig[showActionModal].showNotes}
                    notesRequired={actionModalConfig[showActionModal].notesRequired}
                    processing={processing}
                    processingText={actionModalConfig[showActionModal].processingText || 'Processing...'}
                    confirmText={actionModalConfig[showActionModal].confirmText}
                    confirmClassName={actionModalConfig[showActionModal].confirmClassName}
                    styleVariant="superadmin-confirm"
                    headerIcon={actionModalConfig[showActionModal].icon}
                    headerIconBg={actionModalConfig[showActionModal].iconBg}
                    onClose={() => { setShowActionModal(null); setAdminNotes(''); }}
                    onConfirm={() => handleActionConfirm(showActionModal)}
                />
            )}
        </div>
    );
};

export default AdminActionsPanel;
