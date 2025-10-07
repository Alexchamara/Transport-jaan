import React, { useState } from "react";

const PoliciesTab = ({ warehouse }) => {
  const [showPdfModal, setShowPdfModal] = useState(false);

  const handlePdfView = () => {
    if (warehouse?.terms_pdf_path) {
      setShowPdfModal(true);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <h3 className="text-[20px] font-[600] text-[#0955AC] mb-4">TERMS & POLICIES</h3>
        
        {/* General Policies */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-3">General Policies</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• All warehouse bookings require a security deposit</li>
            <li>• 24-hour notice required for cancellations</li>
            <li>• No hazardous materials allowed without prior approval</li>
            <li>• Regular inspections may be conducted with advance notice</li>
            <li>• Insurance coverage is recommended for stored items</li>
          </ul>
        </div>

        {/* Terms & Conditions */}
        {warehouse?.terms_conditions && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-3">Terms & Conditions</h4>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {warehouse.terms_conditions}
            </p>
          </div>
        )}

        {/* Access Policy */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-gray-700 mb-3">Access Policy</h4>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Operating Hours:</strong> {
              Array.isArray(warehouse?.operating_hours) 
                ? warehouse.operating_hours.join(", ") 
                : warehouse?.operating_hours || "24/7 Access Available"
            }</p>
            <p><strong>Security:</strong> {
              warehouse?.security_level 
                ? warehouse.security_level.charAt(0).toUpperCase() + warehouse.security_level.slice(1)
                : "Standard security protocols apply"
            }</p>
            <p><strong>Access Method:</strong> Key card / Digital access provided upon booking confirmation</p>
          </div>
        </div>

        {/* Payment Policy */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-gray-700 mb-3">Payment Policy</h4>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Payment Terms:</strong> {warehouse?.pricing_model === 'monthly' ? "Monthly payment in advance" : warehouse?.payment_terms || "Payment in advance"}</p>
            <p><strong>Monthly Rate:</strong> ${warehouse?.monthly_rate || warehouse?.base_price || "Contact for pricing"}</p>
            <p><strong>Security Deposit:</strong> ${warehouse?.security_deposit || "Contact for details"}</p>
            <p><strong>Setup Fee:</strong> ${warehouse?.setup_fee || "None"}</p>
            <p><strong>Accepted Methods:</strong> Bank transfer, Credit card, Online payment</p>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-semibold text-gray-700 mb-3">Cancellation Policy</h4>
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Notice Period:</strong> 30 days written notice required</p>
            <p><strong>Early Termination:</strong> May incur penalty fees</p>
            <p><strong>Deposit Refund:</strong> Processed within 14 days after move-out inspection</p>
          </div>
        </div>

        {/* Policy Documents */}
        {warehouse?.terms_pdf_path && (
          <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
            <h4 className="font-semibold text-gray-700 mb-3">Policy Documents</h4>
            <button
              onClick={handlePdfView}
              className="inline-flex items-center px-4 py-2 bg-[#0955AC] text-white rounded-lg hover:bg-[#0744A0] transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              Download Full Policy PDF
            </button>
          </div>
        )}

        {/* Contact Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-3">Questions About Policies?</h4>
          <p className="text-sm text-gray-600 mb-3">
            If you have any questions about our policies, please contact us directly.
          </p>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-[#0955AC] text-white rounded-lg text-sm hover:bg-[#0744A0] transition-colors">
              Contact Owner
            </button>
            <button className="px-4 py-2 border border-[#0955AC] text-[#0955AC] rounded-lg text-sm hover:bg-[#0955AC] hover:text-white transition-colors">
              Support Center
            </button>
          </div>
        </div>
      </div>

      {/* PDF Modal */}
      {showPdfModal && warehouse?.terms_pdf_path && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Policy Document</h3>
              <button
                onClick={() => setShowPdfModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={`/storage/${warehouse.terms_pdf_path}`}
                className="w-full h-full rounded-lg"
                title="Policy PDF"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PoliciesTab;