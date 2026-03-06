import React from "react";

const BusinessProfileSection = ({ vendorProfile, vendor }) => {
    if (!vendorProfile) {
        return (
            <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-6">
                <p className="text-[#AEB9E1] text-[14px] text-center py-8">
                    Vendor has not submitted a business profile yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Company Information */}
            <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-6">
                <h3 className="text-white text-[16px] font-[600] mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0E43FB]" />
                    Company Information
                </h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <InfoField label="Company Name" value={vendorProfile.company_name} />
                    <InfoField label="Business Type" value={vendorProfile.business_type} capitalize />
                    <InfoField label="Business Registration No." value={vendorProfile.business_registration_no} />
                    <InfoField label="Tax ID" value={vendorProfile.tax_id} />
                    <InfoField label="Website" value={vendorProfile.website} isLink />
                    <InfoField label="Established Year" value={vendorProfile.established_year} />
                    <InfoField label="Employee Count" value={vendorProfile.employee_count} />
                    <InfoField label="Service Provider Type" value={vendor?.vendor_type} capitalize />
                </div>
                {vendorProfile.description && (
                    <div className="mt-4 pt-4 border-t border-[#343B4F]">
                        <label className="text-[#AEB9E1] text-[11px] font-[500] uppercase tracking-wider">Description</label>
                        <p className="text-[#E0E6F7] text-[13px] mt-1 leading-relaxed">{vendorProfile.description}</p>
                    </div>
                )}
            </div>

            {/* Address */}
            <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-6">
                <h3 className="text-white text-[16px] font-[600] mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#05C168]" />
                    Address
                </h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <InfoField label="Address Line 1" value={vendorProfile.address_line1} />
                    <InfoField label="Address Line 2" value={vendorProfile.address_line2} />
                    <InfoField label="City" value={vendorProfile.city} />
                    <InfoField label="State / Province" value={vendorProfile.state} />
                    <InfoField label="Postal Code" value={vendorProfile.postal_code} />
                    <InfoField label="Country" value={vendorProfile.country} />
                </div>
            </div>

            {/* Contact Information */}
            <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-6">
                <h3 className="text-white text-[16px] font-[600] mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FDB52A]" />
                    Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <InfoField label="Contact Person" value={vendorProfile.contact_person} />
                    <InfoField label="Contact Phone" value={vendorProfile.contact_phone} />
                    <InfoField label="Contact Email" value={vendorProfile.contact_email} />
                </div>
            </div>

            {/* Submission Info */}
            <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-6">
                <h3 className="text-white text-[16px] font-[600] mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#CB3CFF]" />
                    Submission Details
                </h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <InfoField label="Submission Status" value={formatStatus(vendorProfile.submission_status)} />
                    <InfoField label="Submitted At" value={vendorProfile.submitted_at || 'Not submitted'} />
                    <InfoField label="Reviewed At" value={vendorProfile.reviewed_at || 'Not reviewed'} />
                    <InfoField label="Reviewed By" value={vendorProfile.reviewer_name || 'N/A'} />
                </div>
                {vendorProfile.admin_notes && (
                    <div className="mt-4 pt-4 border-t border-[#343B4F]">
                        <label className="text-[#AEB9E1] text-[11px] font-[500] uppercase tracking-wider">Admin Notes</label>
                        <p className="text-[#FDB52A] text-[13px] mt-1 bg-[#FDB52A15] border border-[#FDB52A30] rounded-md px-3 py-2">
                            {vendorProfile.admin_notes}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const InfoField = ({ label, value, capitalize = false, isLink = false }) => (
    <div>
        <label className="text-[#AEB9E1] text-[11px] font-[500] uppercase tracking-wider">{label}</label>
        {isLink && value ? (
            <a
                href={value.startsWith('http') ? value : `https://${value}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[#5B8DEF] text-[13px] mt-0.5 hover:underline"
            >
                {value}
            </a>
        ) : (
            <p className={`text-[#E0E6F7] text-[13px] mt-0.5 ${capitalize ? 'capitalize' : ''}`}>
                {value || <span className="text-[#AEB9E140]">N/A</span>}
            </p>
        )}
    </div>
);

const formatStatus = (status) => {
    const map = {
        'draft': 'Draft',
        'submitted': 'Pending Review',
        'approved': 'Approved',
        'rejected': 'Rejected',
        'revision_requested': 'Revision Requested',
    };
    return map[status] || status || 'N/A';
};

export default BusinessProfileSection;
