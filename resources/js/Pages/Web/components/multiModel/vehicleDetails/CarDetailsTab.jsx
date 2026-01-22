import React from "react";
import miles from "../../../assets/landVehicleDetails/carSpec/miles.svg";
import fuel from "../../../assets/landVehicleDetails/carSpec/fuel.svg";
import gear from "../../../assets/landVehicleDetails/carSpec/gear.svg";
import seats from "../../../assets/landVehicleDetails/carSpec/seats.svg";
import model from "../../../assets/landVehicleDetails/carSpec/model.svg";
import doors from "../../../assets/landVehicleDetails/carSpec/doors.svg";
import airBag from "../../../assets/landVehicleDetails/carSpec/airBag.svg";
import liters from "../../../assets/landVehicleDetails/carSpec/liters.svg";
import proPic from "../../../assets/landVehicleDetails/proPic.svg";
import tag from "../../../assets/landVehicleDetails/tag.svg";
import star from "../../../assets/driverBooking/star.svg";

const CarDetailsTab = ({ vehicle }) => (
    <>
        <div className="flex flex-col gap-5">
            <h1 className="text-[15px] font-[600]">Description</h1>
            <p className="text-[14px]/[33px] font-[400] text-justify px-5">
                {vehicle?.description || 'No description available for this vehicle.'}
            </p>
        </div>
        {/*  Specs*/}
        <div className="py-10">
            <h1 className="text-[15px] font-[600]">Car Specifications</h1>
            <div className="py-10 text-[12px] font-[700]">
                <div className="flex flex-col justify-center items-center gap-10">
                    <div className="flex flex-col xl:flex-row gap-10 justify-center items-center">
                        <div className="w-[187px] h-[81px] border-[1px] border-[#0000002B] bg-[#E7E6E6] rounded-[10px] flex flex-row justify-center items-center gap-5 px-5 py-5">
                            <img src={miles} />
                            <h1>{vehicle?.year || 'N/A'}</h1>
                        </div>
                        <div className="w-[187px] h-[81px] border-[1px] border-[#0000002B] bg-[#E7E6E6] rounded-[10px] flex flex-row justify-center items-center gap-5 px-5 py-5">
                            <img src={fuel} />
                            <h1>{vehicle?.specs?.fuelType || 'Petrol'}</h1>
                        </div>
                        <div className="w-[187px] h-[81px] border-[1px] border-[#0000002B] bg-[#E7E6E6] rounded-[10px] flex flex-row justify-center items-center gap-5 px-5 py-5">
                            <img src={gear} />
                            <h1>{vehicle?.specs?.transmission || 'Auto'}</h1>
                        </div>
                        <div className="w-[187px] h-[81px] border-[1px] border-[#0000002B] bg-[#E7E6E6] rounded-[10px] flex flex-row justify-center items-center gap-5 px-5 py-5">
                            <img src={seats} />
                            <h1>{vehicle?.specs?.seatingCapacity || vehicle?.passengerCapacity || '4'} Seats</h1>
                        </div>
                    </div>
                    <div className="flex flex-col xl:flex-row justify-center items-center gap-10">
                        <div className="w-[187px] h-[81px] border-[1px] border-[#0000002B] bg-[#E7E6E6] rounded-[10px] flex flex-row justify-center items-center gap-5 px-5 py-5">
                            <img src={airBag} />
                            <h1>{vehicle?.specs?.bodyType || 'SUV'}</h1>
                        </div>
                        <div className="w-[187px] h-[81px] border-[1px] border-[#0000002B] bg-[#E7E6E6] rounded-[10px] flex flex-row justify-center items-center gap-5 px-5 py-5">
                            <img src={model} />
                            <h1>{vehicle?.manufacturer || 'Manufacturer'}</h1>
                        </div>
                        <div className="w-[187px] h-[81px] border-[1px] border-[#0000002B] bg-[#E7E6E6] rounded-[10px] flex flex-row justify-center items-center gap-5 px-5 py-5">
                            <img src={doors} />
                            <h1>{vehicle?.specs?.doors || '4'} Doors</h1>
                        </div>
                        <div className="w-[187px] h-[81px] border-[1px] border-[#0000002B] bg-[#E7E6E6] rounded-[10px] flex flex-row justify-center items-center gap-5 px-5 py-5">
                            <img src={liters} />
                            <h1>{vehicle?.specs?.engineCapacity || 'N/A'}</h1>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="poppins w-full py-7">
            <h1 className="text-[20px] font-[600] mb-10">Owners Info</h1>
            <div className="flex flex-col md:flex-row justify-start items-center gap-20">
                <div className="flex flex-col md:flex-row justify-start items-center gap-5">
                    <img src={proPic} />
                    <div className="flex flex-col items-start justify-center">
                        <div className="flex flex-row gap-2 justify-center items-center">
                            {" "}
                            <h1 className="text-[15px] font-[700]">{vehicle?.provider?.name || vehicle?.provider?.business_name || 'Vehicle Owner'}</h1>
                            <img src={tag} />
                        </div>
                        <div>
                            <div className="flex flex-row gap-3 justify-center items-center">
                                {" "}
                                <img src={star} className="w-[16px]" />
                                <h1 className="text-[14px] font-[400]">{vehicle?.rating ? vehicle.rating.toFixed(1) : '0.0'}</h1>
                                <h1 className="text-[12px] font-[500] text-[#949699]">({vehicle?.totalReviews || 0} Reviews)</h1>
                            </div>
                            <h1 className="text-[14px] font-[400] text-[#949699]">Vehicle Provider</h1>
                        </div>
                    </div>
                </div>
                <div className="text-[9px] flex flex-col md:flex-row gap-4">
                    <div className="min-w-[123px] min-h-[29px] px-4 py-2 bg-[#0955AC] text-[#FFFFFF] font-[700] rounded-[5px] flex justify-center items-center cursor-pointer">
                        CONTACT NUMBER
                    </div>
                    <div className="min-w-[123px] min-h-[29px] px-4 py-2  border-[1.5px] border-[#0955AC] bg-[#E8EBEF] text-[#0955AC] font-[700] rounded-[5px] flex justify-center items-center cursor-pointer">
                        VIEW PROFILE
                    </div>
                </div>
            </div>
        </div>
    </>
);

export default CarDetailsTab; 