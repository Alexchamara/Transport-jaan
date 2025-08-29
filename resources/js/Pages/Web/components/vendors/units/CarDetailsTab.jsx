import React from "react";
import miles from "../../../assets/landVehicleDetails/carSpec/miles.svg";
import fuel from "../../../assets/landVehicleDetails/carSpec/fuel.svg";
import gear from "../../../assets/landVehicleDetails/carSpec/gear.svg";
import seats from "../../../assets/landVehicleDetails/carSpec/seats.svg";
import model from "../../../assets/landVehicleDetails/carSpec/model.svg";
import doors from "../../../assets/landVehicleDetails/carSpec/doors.svg";
import airBag from "../../../assets/landVehicleDetails/carSpec/airBag.svg";
import liters from "../../../assets/landVehicleDetails/carSpec/liters.svg";

const CarDetailsTab = () => (
    <>
        <div className="flex flex-col gap-5">
            <h1 className="text-[15px] font-[600]">Description</h1>
            <p className="text-[14px]/[33px] font-[400] text-justify px-5">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec semper eu risus ut ornare. In bibendum tempus sapien, tristique consectetur purus pellentesque ac. Quisque facilisis laoreet feugiat. Sed dapibus volutpat ex, eget iaculis nunc tincidunt sit amet. Quisque congue sapien nec aliquet faucibus. Morbi lectus eros, accumsan eget malesuada et, fermentum eget nisl. Fusce vel placerat libero. Integer convallis sodales libero, vitae tristique massa hendrerit in.
            </p>
        </div>

        {/* Specs */}
        <div className="py-10">
            <h1 className="text-[15px] font-[600]">Car Specifications</h1>
            <div className="py-10 text-[12px] font-[700]">
                <div className="flex flex-col justify-center items-center gap-10">
                    <div className="flex flex-col xl:flex-row gap-10 justify-center items-center">
                        <div className="w-[187px] h-[81px] border-[1px] border-[#0000002B] bg-[#E7E6E6] rounded-[10px] flex flex-row justify-center items-center gap-5 px-5 py-5">
                            <img src={miles} />
                            <h1>62,500</h1>
                        </div>
                        <div className="w-[187px] h-[81px] border-[1px] border-[#0000002B] bg-[#E7E6E6] rounded-[10px] flex flex-row justify-center items-center gap-5 px-5 py-5">
                            <img src={fuel} />
                            <h1>Petrol</h1>
                        </div>
                        <div className="w-[187px] h-[81px] border-[1px] border-[#0000002B] bg-[#E7E6E6] rounded-[10px] flex flex-row justify-center items-center gap-5 px-5 py-5">
                            <img src={gear} />
                            <h1>Manual</h1>
                        </div>
                        <div className="w-[187px] h-[81px] border-[1px] border-[#0000002B] bg-[#E7E6E6] rounded-[10px] flex flex-row justify-center items-center gap-5 px-5 py-5">
                            <img src={seats} />
                            <h1>05 Seats</h1>
                        </div>
                    </div>
                    <div className="flex flex-col xl:flex-row justify-center items-center gap-10">
                        <div className="w-[187px] h-[81px] border-[1px] border-[#0000002B] bg-[#E7E6E6] rounded-[10px] flex flex-row justify-center items-center gap-5 px-5 py-5">
                            <img src={airBag} />
                            <h1>03 Air Bags</h1>
                        </div>
                        <div className="w-[187px] h-[81px] border-[1px] border-[#0000002B] bg-[#E7E6E6] rounded-[10px] flex flex-row justify-center items-center gap-5 px-5 py-5">
                            <img src={model} />
                            <h1>Lamborghini</h1>
                        </div>
                        <div className="w-[187px] h-[81px] border-[1px] border-[#0000002B] bg-[#E7E6E6] rounded-[10px] flex flex-row justify-center items-center gap-5 px-5 py-5">
                            <img src={doors} />
                            <h1>04 Doors</h1>
                        </div>
                        <div className="w-[187px] h-[81px] border-[1px] border-[#0000002B] bg-[#E7E6E6] rounded-[10px] flex flex-row justify-center items-center gap-5 px-5 py-5">
                            <img src={liters} />
                            <h1>3.5 L</h1>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
);

export default CarDetailsTab;
