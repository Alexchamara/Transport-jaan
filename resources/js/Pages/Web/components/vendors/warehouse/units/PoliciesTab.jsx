import React from "react";

const PoliciesTab = ({ warehouseData = {} }) => (
    <>
        <div className="poppins text-[14px] font-[400] text-justify p-3 md:p-0">
            <h1 className="text-[20px] font-[600]">Warehouse Storage Policies</h1>
            <p className="pt-10">
                This document contains important information about storing your goods in our warehouse facility. 
                Please read these policies carefully as they form part of your storage agreement. 
                By using our warehouse services, you agree to comply with all terms and conditions outlined below.
            </p>
            <p className="py-10">
                We want to ensure the safety and security of your stored items while providing you with excellent service. 
                Please take time to familiarize yourself with these policies to avoid any misunderstandings.
            </p>

            {/* Terms and Conditions from Database */}
            {(warehouseData.terms_conditions || warehouseData.terms_pdf_path) && (
                <div className="bg-[#F8F9FA] p-6 rounded-lg mb-8">
                    <h1 className="text-[16px] font-[600] mb-4 text-[#0955AC]">Specific Terms & Conditions</h1>
                    
                    {warehouseData.terms_pdf_path ? (
                        // Show PDF if uploaded
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">PDF</span>
                                </div>
                                <span className="text-[14px] font-[600]">Terms & Conditions Document</span>
                            </div>
                            
                            {/* PDF Viewer */}
                            <div className="border rounded-lg overflow-hidden">
                                <iframe
                                    src={`${warehouseData.terms_pdf_path.startsWith('/storage') ? warehouseData.terms_pdf_path : `/storage/${warehouseData.terms_pdf_path}`}#toolbar=1&navpanes=1&scrollbar=1`}
                                    width="100%"
                                    height="400px"
                                    className="border-0"
                                    title="Terms & Conditions PDF"
                                />
                            </div>
                            
                            {/* Download and View Links */}
                            <div className="flex gap-3 pt-3">
                                <a
                                    href={warehouseData.terms_pdf_path.startsWith('/storage') ? warehouseData.terms_pdf_path : `/storage/${warehouseData.terms_pdf_path}`}
                                    download
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-[#0955AC] text-white rounded-md hover:bg-[#074A94] transition-colors text-[12px] font-[600]"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download
                                </a>
                                <a
                                    href={warehouseData.terms_pdf_path.startsWith('/storage') ? warehouseData.terms_pdf_path : `/storage/${warehouseData.terms_pdf_path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-2 border border-[#0955AC] text-[#0955AC] rounded-md hover:bg-[#0955AC] hover:text-white transition-colors text-[12px] font-[600]"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    Open in New Tab
                                </a>
                            </div>
                        </div>
                    ) : (
                        // Show text if written
                        <p className="leading-relaxed whitespace-pre-wrap">{warehouseData.terms_conditions}</p>
                    )}
                </div>
            )}

            <h1 className="text-[#F50505] font-[600] mb-2">Important Storage Information</h1>
            <p>
                All storage agreements are subject to our standard terms and conditions. Items must be properly packaged and labeled. 
                We reserve the right to inspect stored goods for safety and compliance purposes. 
                Temperature-controlled units maintain specified ranges as per your storage requirements.
            </p>
            <p className="text-[#F23E3E] mt-10">
                For bookings, modifications, or issues during storage, contact our facility directly:
            </p>
            <div className="flex flex-col gap-2 py-2">
                <div className="flex flex-row gap-2 items-center">
                    <div className="w-[3px] h-[3px] bg-[#000000] rounded-full" />
                    <h1>Email: warehouse@transport-jaan.com</h1>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <div className="w-[3px] h-[3px] bg-[#000000] rounded-full" />
                    <h1>Call: +94 77 300 1234 (24/7 Support Available)</h1>
                </div>
                <div className="flex flex-row gap-2 items-center">
                    <div className="w-[3px] h-[3px] bg-[#000000] rounded-full" />
                    <h1>Visit us at: {warehouseData.address || 'Contact for address details'}</h1>
                </div>
            </div>
        </div>

        {/* Storage Requirements */}
        <div className="text-[14px] flex flex-col gap-8">
            <div>
                <h1 className="text-[20px] font-[600] pb-8">Storage Requirements</h1>
                <h1 className="text-[#F50505]">What items can be stored?</h1>
                <p className="mt-2 mb-5">
                    {warehouseData.type === 'Cold Storage' 
                        ? 'This cold storage facility is designed for temperature-sensitive items including food products, pharmaceuticals, and chemicals requiring controlled environments.'
                        : 'General storage for non-hazardous goods including inventory, furniture, documents, and general merchandise.'
                    }
                </p>
            </div>
            <div>
                <h1 className="text-[#F50505]">Prohibited Items</h1>
                <p className="mt-2 mb-5">
                    Hazardous materials, flammable substances, perishable goods (unless specified), illegal items, 
                    and valuables without proper insurance coverage are strictly prohibited.
                </p>
            </div>
            <div>
                <h1 className="text-[#F50505]">Access Hours & Security</h1>
                <p className="mt-2">
                    Standard access hours are 6:00 AM to 10:00 PM daily. 24/7 access available with prior arrangement. 
                    All areas are monitored by CCTV and secured with electronic access controls.
                </p>
            </div>
            <div>
                <h1 className="text-[#F50505]">Insurance & Liability</h1>
                <p className="mt-2">
                    Customers are responsible for insuring their stored goods. Basic facility insurance covers structural damage only. 
                    We recommend comprehensive coverage for valuable items.
                </p>
            </div>

            <div>
                <h1 className="text-[20px] font-[600] mt-10 pb-8">Pricing & Payment Terms</h1>
                <h1 className="text-[#F50505]">Pricing Model</h1>
                <p className="mt-2 mb-10">
                    This warehouse uses a {warehouseData.pricing_model ? warehouseData.pricing_model.replace(/_/g, ' ') : 'flexible pricing'} model 
                    at ${warehouseData.price || 'Contact for pricing'} per unit. 
                    Additional charges may apply for special handling or extended access hours.
                </p>
                <h1 className="text-[#F50505]">Payment Terms</h1>
                <p className="mt-2 mb-5">
                    Payment is due monthly in advance. Late payment fees apply after 15 days. 
                    Security deposit equivalent to one month's storage fee required for new customers.
                </p>
            </div>

            <div>
                <h1 className="text-[20px] font-[600] mt-10 pb-8">Facility Specifications</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[14px]">
                    <div>
                        <h2 className="font-[600] mb-2 text-[#F50505]">Total Area</h2>
                        <p>{warehouseData.total_area ? `${warehouseData.total_area} sqft` : 'Contact for details'}</p>
                    </div>
                    <div>
                        <h2 className="font-[600] mb-2 text-[#F50505]">Storage Capacity</h2>
                        <p>{warehouseData.capacity ? `${warehouseData.capacity} units` : 'Contact for details'}</p>
                    </div>
                    <div>
                        <h2 className="font-[600] mb-2 text-[#F50505]">Facility Type</h2>
                        <p>{warehouseData.type || 'General Storage'}</p>
                    </div>
                    <div>
                        <h2 className="font-[600] mb-2 text-[#F50505]">Available Amenities</h2>
                        <p>{warehouseData.amenities && warehouseData.amenities.length > 0 
                            ? warehouseData.amenities.join(', ') 
                            : 'Contact for amenity details'
                        }</p>
                    </div>
                </div>
            </div>
        </div>
    </>
);

export default PoliciesTab; 