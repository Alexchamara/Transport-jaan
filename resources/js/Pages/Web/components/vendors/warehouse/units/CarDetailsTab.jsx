import React from "react";
import { Building2, MapPin, Thermometer, Shield, Box, Calendar } from "lucide-react";
import proPic from "../../../assets/landVehicleDetails/proPic.svg";
import tag from "../../../assets/landVehicleDetails/tag.svg";
import star from "../../../assets/driverBooking/star.svg";

const CarDetailsTab = () => {
    // Sample warehouse data based on Warehouse model
    const warehouseData = {
        name: "Central Cold Storage A",
        address: "123 Industrial Ave, Warehouse District",
        latitude: 6.9271,
        longitude: 79.8612,
        total_area: 2500.00,
        capacity: 5000.00,
        type: "Cold Storage",
        amenities: ["Temperature Control", "Loading Dock", "Security", "CCTV", "24/7 Access", "Fire Safety"],
        pricing_model: "per_sqft_monthly",
        price: 15.50,
        terms_conditions: "All storage agreements are subject to a 30-day notice period. Temperature-controlled units maintain -18°C to +25°C range. Security deposits required equivalent to one month rental.",
        is_active: true
    };

    return (
        <>
            <div className="flex flex-col gap-5">
                <h1 className="text-[15px] font-[600]">Description</h1>
                <p className="text-[14px]/[33px] font-[400] text-justify px-5">
                    Our state-of-the-art {warehouseData.type.toLowerCase()} facility offers comprehensive storage solutions 
                    for businesses requiring temperature-controlled environments. Located in a prime industrial zone with 
                    excellent transport connectivity, this warehouse features modern infrastructure and advanced security systems. 
                    Perfect for pharmaceutical, food, and chemical storage requirements with strict temperature and humidity controls.
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
                                    <div>{warehouseData.total_area}</div>
                                    <div className="text-[10px]">sqft</div>
                                </div>
                            </div>
                            <div className="w-[187px] h-[81px] border-[1px] border-[#0000002B] bg-[#E7E6E6] rounded-[10px] flex flex-row justify-center items-center gap-5 px-5 py-5">
                                <Building2 size={24} />
                                <div className="text-center">
                                    <div>{warehouseData.capacity}</div>
                                    <div className="text-[10px]">units</div>
                                </div>
                            </div>
                            <div className="w-[187px] h-[81px] border-[1px] border-[#0000002B] bg-[#E7E6E6] rounded-[10px] flex flex-row justify-center items-center gap-5 px-5 py-5">
                                <Thermometer size={24} />
                                <div className="text-center">
                                    <div>{warehouseData.type}</div>
                                    <div className="text-[10px]">Type</div>
                                </div>
                            </div>
                            <div className="w-[187px] h-[81px] border-[1px] border-[#0000002B] bg-[#E7E6E6] rounded-[10px] flex flex-row justify-center items-center gap-5 px-5 py-5">
                                <MapPin size={24} />
                                <div className="text-center">
                                    <div>${warehouseData.price}</div>
                                    <div className="text-[10px]">{warehouseData.pricing_model.replace(/_/g, ' ')}</div>
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
                    {warehouseData.amenities.map((amenity, index) => (
                        <div key={index} className="flex flex-row items-center gap-3">
                            <div className="w-[20px] h-[20px] rounded-full bg-[#0955AC] flex justify-center items-center">
                                <div className="w-[8px] h-[8px] rounded-full bg-white"></div>
                            </div>
                            <div className="flex flex-col gap-1 text-[14px]">
                                <h1 className="font-[600]">{amenity}</h1>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Location Details */}
            <div className="poppins py-10">
                <h1 className="text-[20px] font-[600] mb-6">Location Details</h1>
                <div className="bg-[#F8F9FA] p-6 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[14px]">
                        <div>
                            <h2 className="font-[600] mb-2">Address</h2>
                            <p>{warehouseData.address}</p>
                        </div>
                        <div>
                            <h2 className="font-[600] mb-2">Coordinates</h2>
                            <p>Lat: {warehouseData.latitude}, Lng: {warehouseData.longitude}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Terms & Conditions */}
            <div className="poppins">
                <h1 className="text-[20px] font-[600] mb-6">Terms & Conditions</h1>
                <div className="bg-[#F8F9FA] p-6 rounded-lg">
                    <p className="text-[14px] font-[400] leading-relaxed">
                        {warehouseData.terms_conditions}
                    </p>
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
                                <h1 className="text-[15px] font-[700]">Steve Gibson</h1>
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