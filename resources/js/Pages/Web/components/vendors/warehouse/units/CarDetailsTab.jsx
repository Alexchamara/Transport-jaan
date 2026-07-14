import React from "react";
import { usePage } from "@inertiajs/react";
import { Building2, MapPin, Thermometer, Shield, Box, Calendar } from "lucide-react";
import proPic from "../../../../assets/landVehicleDetails/proPic.svg";
import tag from "../../../../assets/landVehicleDetails/tag.svg";
import star from "../../../../assets/driverBooking/star.svg";

const CarDetailsTab = ({ warehouseData = {} }) => {
  const { auth } = usePage().props;
  const user = auth?.user;

    // Default fallback data
    const defaultData = {
        name: "Loading...",
        address: "Loading...",
        latitude: 0,
        longitude: 0,
        total_area: 0,
        capacity: 0,
        type: "N/A",
        amenities: [],
        pricing_model: "N/A",
        price: 0,
        terms_conditions: "Terms and conditions will be displayed here once loaded.",
        is_active: false
    };

    const data = { ...defaultData, ...warehouseData };

    return (
        <>
            <div className="flex flex-col gap-5">
                <h1 className="text-[15px] font-[600]">Description</h1>
                <p className="text-[14px]/[33px] font-[400] text-justify px-5">
                    Our state-of-the-art {data.type.toLowerCase()} facility offers comprehensive storage solutions 
                    for businesses requiring {data.type === 'Cold Storage' ? 'temperature-controlled environments' : 'reliable storage solutions'}. 
                    Located in a prime industrial zone with excellent transport connectivity, this warehouse features modern infrastructure and advanced security systems. 
                    {data.type === 'Cold Storage' 
                        ? ' Perfect for pharmaceutical, food, and chemical storage requirements with strict temperature and humidity controls.'
                        : ' Ideal for general storage, inventory management, and distribution operations.'
                    }
                </p>
            </div>

            {/* Warehouse Specifications */}
            <div className="py-10">
                <h1 className="text-[15px] font-[600]">Warehouse Specifications</h1>
                <div className="py-10 text-[12px] font-[700]">
                    <div className="flex flex-col justify-center items-center gap-10">
                        <div className="flex flex-col xl:flex-row gap-10 justify-center items-center">
                            <div className="w-[187px] h-[81px] border-[1px] border-[#0000002B] bg-[#E7E6E6] rounded-[10px] flex flex-row justify-center items-center gap-5 px-5 py-5">
                                <Box size={24} />
                                <div className="text-center">
                                    <div>{data.total_area || 'N/A'}</div>
                                    <div className="text-[10px]">sqft</div>
                                </div>
                            </div>
                            <div className="w-[187px] h-[81px] border-[1px] border-[#0000002B] bg-[#E7E6E6] rounded-[10px] flex flex-row justify-center items-center gap-5 px-5 py-5">
                                <Building2 size={24} />
                                <div className="text-center">
                                    <div>{data.capacity || 'N/A'}</div>
                                    <div className="text-[10px]">units</div>
                                </div>
                            </div>
                            <div className="w-[187px] h-[81px] border-[1px] border-[#0000002B] bg-[#E7E6E6] rounded-[10px] flex flex-row justify-center items-center gap-5 px-5 py-5">
                                <Thermometer size={24} />
                                <div className="text-center">
                                    <div>{data.type}</div>
                                    <div className="text-[10px]">Type</div>
                                </div>
                            </div>
                            <div className="w-[187px] h-[81px] border-[1px] border-[#0000002B] bg-[#E7E6E6] rounded-[10px] flex flex-row justify-center items-center gap-5 px-5 py-5">
                                <MapPin size={24} />
                                <div className="text-center">
                                    <div>${data.price || 'N/A'}</div>
                                    <div className="text-[10px]">{data.pricing_model ? data.pricing_model.replace(/_/g, ' ') : 'N/A'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Amenities & Features */}
            <div className="poppins">
                <h1 className="text-[20px] font-[600] mb-10">Amenities & Features</h1>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {data.amenities && data.amenities.length > 0 ? (
                        data.amenities.map((amenity, index) => (
                            <div key={index} className="flex flex-row items-center gap-3">
                                <div className="w-[20px] h-[20px] rounded-full bg-[#0955AC] flex justify-center items-center">
                                    <div className="w-[8px] h-[8px] rounded-full bg-white"></div>
                                </div>
                                <div className="flex flex-col gap-1 text-[14px]">
                                    <h1 className="font-[600]">{amenity}</h1>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center text-[#7B7B7A] py-4">
                            No amenities listed
                        </div>
                    )}
                </div>
            </div>

            {/* Location Details */}
            <div className="poppins py-10">
                <h1 className="text-[20px] font-[600] mb-6">Location Details</h1>
                <div className="bg-[#F8F9FA] p-6 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[14px]">
                        <div>
                            <h2 className="font-[600] mb-2">Address</h2>
                            <p>{data.address}</p>
                        </div>
                        <div>
                            <h2 className="font-[600] mb-2">Coordinates</h2>
                            <p>
                                {data.latitude && data.longitude 
                                    ? `Lat: ${data.latitude}, Lng: ${data.longitude}`
                                    : 'Coordinates not available'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Terms & Conditions */}
            <div className="poppins">
                <h1 className="text-[20px] font-[600] mb-6">Terms & Conditions</h1>
                <div className="bg-[#F8F9FA] p-6 rounded-lg">
                    {data.terms_pdf_path ? (
                        // Show PDF if uploaded
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">PDF</span>
                                </div>
                                <span className="text-[14px] font-[600]">Terms & Conditions Document</span>
                            </div>
                            
                            {/* PDF Viewer */}
                            <div className="border rounded-lg overflow-hidden">
                                <iframe
                                    src={`${data.terms_pdf_path.startsWith('/storage') ? data.terms_pdf_path : `/storage/${data.terms_pdf_path}`}#toolbar=1&navpanes=1&scrollbar=1`}
                                    width="100%"
                                    height="500px"
                                    className="border-0"
                                    title="Terms & Conditions PDF"
                                />
                            </div>
                            
                            {/* Download Link */}
                            <div className="flex justify-between items-center pt-4">
                                <a
                                    href={data.terms_pdf_path.startsWith('/storage') ? data.terms_pdf_path : `/storage/${data.terms_pdf_path}`}
                                    download
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0955AC] text-white rounded-md hover:bg-[#074A94] transition-colors text-[14px] font-[600]"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Download PDF
                                </a>
                                <a
                                    href={data.terms_pdf_path.startsWith('/storage') ? data.terms_pdf_path : `/storage/${data.terms_pdf_path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 border border-[#0955AC] text-[#0955AC] rounded-md hover:bg-[#0955AC] hover:text-white transition-colors text-[14px] font-[600]"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    Open in New Tab
                                </a>
                            </div>
                        </div>
                    ) : data.terms_conditions ? (
                        // Show text if written
                        <div>
                            <p className="text-[14px] font-[400] leading-relaxed whitespace-pre-wrap">
                                {data.terms_conditions}
                            </p>
                        </div>
                    ) : (
                        // Show default message if neither provided
                        <div className="text-center py-8">
                            <div className="text-[#7B7B7A] text-[14px]">
                                <div className="text-4xl mb-4">📄</div>
                                <h3 className="font-semibold mb-2">No Terms & Conditions Available</h3>
                                <p>The service provider hasn't provided terms and conditions for this warehouse unit yet.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Owner Info */}
            <div className="poppins w-full py-7">
                <h1 className="text-[20px] font-[600] mb-10">Warehouse Owner Info</h1>
                <div className="flex flex-col md:flex-row justify-start items-center gap-20">
                    <div className="flex flex-col md:flex-row justify-start items-center gap-5">
                        <img src={proPic} />
                        <div className="flex flex-col items-start justify-center">
                            <div className="flex flex-row gap-2 justify-center items-center">
                                <h1 className="text-[15px] font-[700]">{user?.name || 'Service Provider'}</h1>
                                <img src={tag} />
                            </div>
                            <div>
                                <div className="flex flex-row gap-3 justify-center items-center">
                                    <img src={star} className="w-[16px]" />
                                    <h1 className="text-[14px] font-[400]">4.8</h1>
                                    <h1 className="text-[12px] font-[500] text-[#949699]">(44 Reviews)</h1>
                                </div>
                                <h1 className="text-[14px] font-[400] text-[#949699]">Warehouse Owner • Joined 2 years ago</h1>
                            </div>
                        </div>
                    </div>
                    <div className="text-[9px] flex flex-col md:flex-row gap-4">
                        <div className="w-[123px] h-[29px] bg-[#0955AC] text-[#FFFFFF] font-[700] rounded-[5px] flex justify-center items-center cursor-pointer">
                            CONTACT OWNER
                        </div>
                        <div className="w-[123px] h-[29px] border-[1.5px] border-[#0955AC] bg-[#E8EBEF] text-[#0955AC] font-[700] rounded-[5px] flex justify-center items-center cursor-pointer">
                            VIEW PROFILE
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CarDetailsTab; 