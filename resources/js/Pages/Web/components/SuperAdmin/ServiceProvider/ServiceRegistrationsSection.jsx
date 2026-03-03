import React, { useState } from "react";
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

const ServiceRegistrationsSection = ({ serviceRegistrations, vendorId }) => {
    const [expandedService, setExpandedService] = useState(null);
    const [previewDoc, setPreviewDoc] = useState(null);
    const [actionModal, setActionModal] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    if (!serviceRegistrations || serviceRegistrations.length === 0) {
        return (
            <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-6">
                <p className="text-[#AEB9E1] text-[14px] text-center py-8">
                    No service registrations found.
                </p>
            </div>
        );
    }

    const getServiceStatusStyles = (status) => {
        switch (status) {
            case 'approved':
                return { border: "border-[#05C16880]", bg: "bg-[#05C16833]", dot: "bg-[#14CA74]", text: "text-[#14CA74]", label: 'Approved' };
            case 'submitted':
                return { border: "border-[#0E43FB80]", bg: "bg-[#0E43FB33]", dot: "bg-[#5B8DEF]", text: "text-[#5B8DEF]", label: 'Pending Review' };
            case 'revision_requested':
                return { border: "border-[#FDB52A80]", bg: "bg-[#FDB52A33]", dot: "bg-[#FDB52A]", text: "text-[#FDB52A]", label: 'Revision Requested' };
            case 'rejected':
                return { border: "border-[#FF475780]", bg: "bg-[#FF475733]", dot: "bg-[#FF4757]", text: "text-[#FF4757]", label: 'Rejected' };
            case 'draft':
                return { border: "border-[#AEB9E180]", bg: "bg-[#AEB9E133]", dot: "bg-[#AEB9E1]", text: "text-[#AEB9E1]", label: 'Draft' };
            default:
                return { border: "border-[#AEB9E180]", bg: "bg-[#AEB9E133]", dot: "bg-[#AEB9E1]", text: "text-[#AEB9E1]", label: status };
        }
    };

    const handleAction = (registrationId, action) => {
        if (action === 'approve') {
            setProcessing(true);
            router.post(`/superadmin/users/service-providers/${registrationId}/approve-service`, {
                admin_notes: adminNotes,
            }, {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setActionModal(null);
                    setAdminNotes('');
                },
            });
        } else if (action === 'reject') {
            if (!adminNotes.trim()) return;
            setProcessing(true);
            router.post(`/superadmin/users/service-providers/${registrationId}/reject-service`, {
                admin_notes: adminNotes,
            }, {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setActionModal(null);
                    setAdminNotes('');
                },
            });
        } else if (action === 'revision') {
            if (!adminNotes.trim()) return;
            setProcessing(true);
            router.post(`/superadmin/users/service-providers/${registrationId}/request-service-revision`, {
                admin_notes: adminNotes,
            }, {
                preserveScroll: true,
                onFinish: () => {
                    setProcessing(false);
                    setActionModal(null);
                    setAdminNotes('');
                },
            });
        }
    };

    const getFileExtension = (filename) => {
        return filename?.split('.').pop()?.toLowerCase() || '';
    };

    const isImageFile = (filename) => {
        return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(getFileExtension(filename));
    };

    const isPdfFile = (filename) => {
        return getFileExtension(filename) === 'pdf';
    };

    const isExpiringOrExpired = (expiryDate) => {
        if (!expiryDate) return null;
        const expiry = new Date(expiryDate);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry < 0) return 'expired';
        if (daysUntilExpiry <= 30) return 'expiring_soon';
        if (daysUntilExpiry <= 90) return 'expiring_warning';
        return 'valid';
    };

    const getExpiryStyles = (status) => {
        switch (status) {
            case 'expired':
                return { text: 'text-[#FF4757]', bg: 'bg-[#FF475720]', label: 'EXPIRED' };
            case 'expiring_soon':
                return { text: 'text-[#FF4757]', bg: 'bg-[#FF475720]', label: 'Expiring Soon' };
            case 'expiring_warning':
                return { text: 'text-[#FDB52A]', bg: 'bg-[#FDB52A20]', label: 'Expiring' };
            case 'valid':
                return { text: 'text-[#14CA74]', bg: 'bg-[#14CA7420]', label: 'Valid' };
            default:
                return null;
        }
    };

    return (
        <div className="space-y-4">
            {serviceRegistrations.map((reg) => {
                const statusStyles = getServiceStatusStyles(reg.status);
                const isExpanded = expandedService === reg.id;

                return (
                    <div key={reg.id} className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] overflow-hidden">
                        {/* Service Header */}
                        <div
                            className="flex flex-row justify-between items-center p-4 cursor-pointer hover:bg-[#0F1A3A]/50 transition-colors"
                            onClick={() => setExpandedService(isExpanded ? null : reg.id)}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${statusStyles.dot}`} />
                                <div>
                                    <h3 className="text-white text-[14px] font-[600]">{reg.service_sub_category}</h3>
                                    <p className="text-[#AEB9E1] text-[11px]">{reg.service_category}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`inline-flex items-center gap-1.5 border ${statusStyles.border} ${statusStyles.bg} px-[10px] py-[4px] rounded-[6px]`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`} />
                                    <span className={`${statusStyles.text} text-[11px] font-[500]`}>{statusStyles.label}</span>
                                </div>
                                <svg
                                    className={`w-4 h-4 text-[#AEB9E1] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Expanded Content */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="border-t border-[#343B4F] p-4 space-y-4">
                                        {/* Admin Notes */}
                                        {reg.admin_notes && (
                                            <div className="bg-[#FDB52A15] border border-[#FDB52A30] rounded-md px-3 py-2">
                                                <label className="text-[#FDB52A] text-[10px] font-[600] uppercase tracking-wider">Admin Notes</label>
                                                <p className="text-[#FDB52A] text-[12px] mt-0.5">{reg.admin_notes}</p>
                                            </div>
                                        )}

                                        {/* Submitted Documents / Fields */}
                                        <div>
                                            <h4 className="text-[#AEB9E1] text-[12px] font-[600] uppercase tracking-wider mb-3">
                                                Submitted Documents & Fields
                                            </h4>
                                            <div className="space-y-3">
                                                {(reg.required_fields || []).map((field) => {
                                                    const value = reg.field_values?.[field.key];
                                                    return (
                                                        <DocumentField
                                                            key={field.key}
                                                            field={field}
                                                            value={value}
                                                            registrationId={reg.id}
                                                            isExpiringOrExpired={isExpiringOrExpired}
                                                            getExpiryStyles={getExpiryStyles}
                                                            isImageFile={isImageFile}
                                                            isPdfFile={isPdfFile}
                                                            onPreview={(doc) => setPreviewDoc(doc)}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Submission Info */}
                                        <div className="flex gap-6 text-[11px] text-[#AEB9E1] pt-2 border-t border-[#343B4F]">
                                            {reg.submitted_at && <span>Submitted: {reg.submitted_at}</span>}
                                            {reg.reviewed_at && <span>Reviewed: {reg.reviewed_at}</span>}
                                        </div>

                                        {/* Per-Service Actions */}
                                        {reg.status === 'submitted' && (
                                            <div className="flex gap-2 pt-2 border-t border-[#343B4F]">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setActionModal({ id: reg.id, action: 'approve', serviceName: reg.service_sub_category }); }}
                                                    className="bg-[#05C168] text-white text-[12px] px-4 py-1.5 rounded-[5px] hover:bg-[#05C168]/80 transition-colors"
                                                >
                                                    Approve Service
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setActionModal({ id: reg.id, action: 'reject', serviceName: reg.service_sub_category }); }}
                                                    className="bg-[#FF4757] text-white text-[12px] px-4 py-1.5 rounded-[5px] hover:bg-[#FF4757]/80 transition-colors"
                                                >
                                                    Reject Service
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setActionModal({ id: reg.id, action: 'revision', serviceName: reg.service_sub_category }); }}
                                                    className="border border-[#FDB52A] text-[#FDB52A] text-[12px] px-4 py-1.5 rounded-[5px] hover:bg-[#FDB52A20] transition-colors"
                                                >
                                                    Request Revision
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}

            {/* Action Modal */}
            <AnimatePresence>
                {actionModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center"
                        onClick={() => { setActionModal(null); setAdminNotes(''); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-gradient-to-br from-[#1A2233] to-[#2A344A] p-6 rounded-2xl text-white w-[500px] max-w-[90vw] shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-[18px] font-[600] mb-2">
                                {actionModal.action === 'approve' && 'Approve Service'}
                                {actionModal.action === 'reject' && 'Reject Service'}
                                {actionModal.action === 'revision' && 'Request Revision'}
                            </h3>
                            <p className="text-[#AEB9E1] text-[13px] mb-4">
                                {actionModal.action === 'approve' && `Approve "${actionModal.serviceName}" registration?`}
                                {actionModal.action === 'reject' && `Provide a reason for rejecting "${actionModal.serviceName}".`}
                                {actionModal.action === 'revision' && `Describe what needs to be revised for "${actionModal.serviceName}".`}
                            </p>

                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder={
                                    actionModal.action === 'approve' ? 'Optional notes...' :
                                    actionModal.action === 'reject' ? 'Reason for rejection (required)...' :
                                    'Describe what needs revision (required)...'
                                }
                                className="w-full bg-[#0B1739] border border-gray-700 text-white rounded-md px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-1 focus:ring-[#0E43FB] mb-4"
                            />

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => { setActionModal(null); setAdminNotes(''); }}
                                    className="border border-[#343B4F] text-[#AEB9E1] text-[13px] px-4 py-2 rounded-[5px] hover:bg-[#343B4F30] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleAction(actionModal.id, actionModal.action)}
                                    disabled={processing || ((actionModal.action === 'reject' || actionModal.action === 'revision') && !adminNotes.trim())}
                                    className={`text-white text-[13px] px-4 py-2 rounded-[5px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                        actionModal.action === 'approve' ? 'bg-[#05C168] hover:bg-[#05C168]/80' :
                                        actionModal.action === 'reject' ? 'bg-[#FF4757] hover:bg-[#FF4757]/80' :
                                        'bg-[#FDB52A] hover:bg-[#FDB52A]/80'
                                    }`}
                                >
                                    {processing ? 'Processing...' : (
                                        actionModal.action === 'approve' ? 'Approve' :
                                        actionModal.action === 'reject' ? 'Reject' :
                                        'Request Revision'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Document Preview Modal */}
            <AnimatePresence>
                {previewDoc && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center"
                        onClick={() => setPreviewDoc(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-[#0B1739] rounded-2xl p-4 max-w-[90vw] max-h-[90vh] overflow-auto shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-white text-[14px] font-[600]">{previewDoc.name}</h3>
                                <div className="flex gap-2">
                                    <a
                                        href={`/superadmin/users/service-providers/${previewDoc.registrationId}/download-document/${previewDoc.fieldKey}`}
                                        className="bg-[#0E43FB] text-white text-[11px] px-3 py-1 rounded hover:bg-[#0A36D6] transition-colors"
                                    >
                                        Download
                                    </a>
                                    <button
                                        onClick={() => setPreviewDoc(null)}
                                        className="text-[#AEB9E1] hover:text-white text-[18px] leading-none transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                            <div className="border border-[#343B4F] rounded-lg overflow-hidden">
                                {previewDoc.isImage ? (
                                    <img
                                        src={`/storage/${previewDoc.path}`}
                                        alt={previewDoc.name}
                                        className="max-w-[800px] max-h-[70vh] object-contain"
                                    />
                                ) : previewDoc.isPdf ? (
                                    <iframe
                                        src={`/storage/${previewDoc.path}`}
                                        className="w-[800px] h-[70vh]"
                                        title={previewDoc.name}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center p-12">
                                        <div className="text-center">
                                            <p className="text-[#AEB9E1] text-[14px] mb-3">Preview not available for this file type</p>
                                            <a
                                                href={`/superadmin/users/service-providers/${previewDoc.registrationId}/download-document/${previewDoc.fieldKey}`}
                                                className="bg-[#0E43FB] text-white text-[12px] px-4 py-2 rounded hover:bg-[#0A36D6] transition-colors"
                                            >
                                                Download File
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const DocumentField = ({ field, value, registrationId, isExpiringOrExpired, getExpiryStyles, isImageFile, isPdfFile, onPreview }) => {
    const hasFile = value?.file;
    const fileName = value?.original_name || (hasFile ? value.file.split('/').pop() : null);

    if (field.type === 'checkbox') {
        return (
            <div className="flex items-center justify-between bg-[#081028] rounded-lg px-4 py-3">
                <div>
                    <p className="text-[#E0E6F7] text-[13px]">{field.label}</p>
                    {field.description && <p className="text-[#AEB9E1] text-[10px]">{field.description}</p>}
                </div>
                <div className={`flex items-center gap-1.5 ${value ? 'text-[#14CA74]' : 'text-[#FF4757]'}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {value ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        )}
                    </svg>
                    <span className="text-[12px] font-[500]">{value ? 'Confirmed' : 'Not confirmed'}</span>
                </div>
            </div>
        );
    }

    // File-type fields
    const expiryStatus = value?.expiry_date ? isExpiringOrExpired(value.expiry_date) : null;
    const expiryStylesData = expiryStatus ? getExpiryStyles(expiryStatus) : null;

    return (
        <div className="bg-[#081028] rounded-lg px-4 py-3">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-[#E0E6F7] text-[13px] font-[500]">{field.label}</p>
                        {field.required && <span className="text-[#FF4757] text-[9px]">Required</span>}
                        {expiryStylesData && (
                            <span className={`${expiryStylesData.text} ${expiryStylesData.bg} text-[9px] px-1.5 py-0.5 rounded font-[600]`}>
                                {expiryStylesData.label}
                            </span>
                        )}
                    </div>
                    {field.description && <p className="text-[#AEB9E1] text-[10px] mt-0.5">{field.description}</p>}
                </div>
            </div>

            {hasFile ? (
                <div className="mt-2 flex items-center gap-3">
                    {/* File info */}
                    <div className="flex-1 flex items-center gap-2 bg-[#0B1739] rounded px-3 py-2 border border-[#343B4F]">
                        <svg className="w-4 h-4 text-[#5B8DEF] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[#E0E6F7] text-[12px] truncate">{fileName}</span>
                    </div>

                    {/* Preview Button */}
                    <button
                        onClick={() => onPreview({
                            path: value.file,
                            name: fileName,
                            fieldKey: field.key,
                            registrationId,
                            isImage: isImageFile(fileName),
                            isPdf: isPdfFile(fileName),
                        })}
                        className="text-[#5B8DEF] text-[11px] px-3 py-2 border border-[#343B4F] rounded hover:bg-[#0E43FB20] transition-colors flex-shrink-0"
                    >
                        Preview
                    </button>

                    {/* Download Button */}
                    <a
                        href={`/superadmin/users/service-providers/${registrationId}/download-document/${field.key}`}
                        className="text-[#14CA74] text-[11px] px-3 py-2 border border-[#343B4F] rounded hover:bg-[#05C16820] transition-colors flex-shrink-0"
                    >
                        Download
                    </a>
                </div>
            ) : (
                <div className="mt-2 flex items-center gap-2 text-[#FF4757]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-[12px]">Not uploaded</span>
                </div>
            )}

            {/* Date fields for file_with_dates */}
            {(field.type === 'file_with_dates' || (field.type === 'file_optional' && value?.effective_date)) && value && (
                <div className="mt-2 flex gap-4 text-[11px]">
                    <div>
                        <span className="text-[#AEB9E1]">Effective: </span>
                        <span className="text-[#E0E6F7]">{value.effective_date || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="text-[#AEB9E1]">Expiry: </span>
                        <span className={`${expiryStylesData?.text || 'text-[#E0E6F7]'}`}>
                            {value.expiry_date || 'N/A'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceRegistrationsSection;
