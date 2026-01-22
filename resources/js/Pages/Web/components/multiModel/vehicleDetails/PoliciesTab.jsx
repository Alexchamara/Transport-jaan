import React from "react";

const PoliciesTab = ({ vehicle }) => (
    <>
        <div className="poppins text-[14px] font-[400] text-justify p-3 md:p-0">
            <h1 className="text-[20px] font-[600]">Rental Policies & Terms</h1>
            <div className="mt-10">
                {vehicle?.cancellationPolicy ? (
                    <div className="mb-8">
                        <h2 className="text-[16px] font-[600] text-[#F50505] mb-3">Cancellation Policy</h2>
                        <p>{vehicle.cancellationPolicy}</p>
                    </div>
                ) : null}
                
                {vehicle?.provider?.terms ? (
                    <div className="mb-8">
                        <h2 className="text-[16px] font-[600] text-[#F50505] mb-3">Provider Terms</h2>
                        <p>{vehicle.provider.terms}</p>
                    </div>
                ) : null}

                <div className="mb-8">
                    <h2 className="text-[16px] font-[600] text-[#F50505] mb-3">General Information</h2>
                    <p className="mb-4">
                        Please review all terms and conditions before making a booking. For specific inquiries about this vehicle, 
                        please contact the provider directly.
                    </p>
                    {vehicle?.provider?.phone && (
                        <p className="text-[#0955AC] font-[600]">
                            Contact: {vehicle.provider.phone}
                        </p>
                    )}
                </div>
            </div>
        </div>
    </>
);

export default PoliciesTab; 