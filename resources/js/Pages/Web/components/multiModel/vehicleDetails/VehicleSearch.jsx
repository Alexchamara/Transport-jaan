import React, { useState } from "react";
import { router } from "@inertiajs/react";
import clock from "../../../assets/landVehicleDetails/clock.svg";
import QuoteModal from "./QuoteModal";
import useScrollLock from "./useScrollLock";
import axios from "axios";

const VehicleSearch = ({ vehicle, journey, legIndex, onVehicleSelected }) => {
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [extras, setExtras] = useState({
        gpsNavigation: false,
        childSeat: false,
        wifi: false,
        insuranceCoverage: false
    });
    const [isSelecting, setIsSelecting] = useState(false);
    
    useScrollLock(showQuoteModal);
    
    const pricePerDay = vehicle?.price || vehicle?.pricePerDay || 620;
    const numberOfDays = journey?.days || vehicle?.days || 7;
    
    // Calculate rental price
    const rentalPrice = pricePerDay * numberOfDays;
    
    // Calculate discount (10% for 3+ days, 15% for 7+ days)
    const discountPercentage = numberOfDays >= 7 ? 15 : numberOfDays >= 3 ? 10 : 0;
    const discount = (rentalPrice * discountPercentage) / 100;
    
    // Refundable deposit
    const refundableDeposit = 500;
    
    // Extra prices
    const extraPrices = {
        gpsNavigation: 155,
        childSeat: 155,
        wifi: 155,
        insuranceCoverage: 155
    };
    
    // Calculate total extras
    const totalExtras = Object.keys(extras).reduce((sum, key) => {
        return sum + (extras[key] ? extraPrices[key] : 0);
    }, 0);
    
    // Calculate subtotal before deposit
    const subtotal = rentalPrice - discount + totalExtras;
    
    // Calculate advance payment (20%)
    const advancePayment = Math.round((subtotal * 0.2) * 100) / 100;
    
    // Calculate total price due
    const totalPriceDue = subtotal - refundableDeposit;
    
    // Handle checkbox changes
    const handleExtraChange = (extraName) => {
        setExtras(prev => ({
            ...prev,
            [extraName]: !prev[extraName]
        }));
    };

    // Handle vehicle selection for single leg
    const handleSelectForStop = async () => {
        if (isSelecting || legIndex === undefined) return;

        setIsSelecting(true);
        try {
            const selectedAddons = Object.keys(extras)
                .filter(key => extras[key])
                .map(key => ({
                    name: key.replace(/([A-Z])/g, ' $1').trim(),
                    qty: 1
                }));

            console.log('Selecting vehicle for leg:', legIndex);
            console.log('Vehicle ID:', vehicle.id);
            console.log('Selection type: single_leg');
            console.log('Addons:', selectedAddons);

            const response = await axios.post(`/multiModel/leg/${legIndex}/select-vehicle`, {
                vehicle_id: vehicle.id,
                selection_type: 'single_leg',
                addons: selectedAddons
            });

            console.log('Selection response:', response.data);

            if (response.data.success) {
                // Call parent callback if provided
                if (onVehicleSelected) {
                    onVehicleSelected(legIndex, 'single_leg', response.data.cart);
                }
                
                // Navigate back to plan journey to add more trips
                alert('Vehicle selected successfully for this leg! You can now add another trip or review your journey.');
                router.visit('/multiModel/plan-journey', {
                    method: 'get',
                    data: {
                        message: 'Vehicle selected for leg ' + (legIndex + 1),
                        vehicleSelected: true
                    }
                });
            }
        } catch (error) {
            console.error('Error selecting vehicle:', error);
            console.error('Error response:', error.response?.data);
            const errorMsg = error.response?.data?.message || 'Failed to select vehicle. Please try again.';
            alert(errorMsg + '\n\nPlease plan your journey first from the Plan Journey page.');
        } finally {
            setIsSelecting(false);
        }
    };

    // Handle vehicle selection for whole journey
    const handleSelectForWholeJourney = async () => {
        if (isSelecting || legIndex === undefined) return;

        setIsSelecting(true);
        try {
            const selectedAddons = Object.keys(extras)
                .filter(key => extras[key])
                .map(key => ({
                    name: key.replace(/([A-Z])/g, ' $1').trim(),
                    qty: 1
                }));

            console.log('Selecting vehicle for whole journey starting from leg:', legIndex);
            console.log('Vehicle ID:', vehicle.id);
            console.log('Selection type: whole_journey');
            console.log('Addons:', selectedAddons);

            const response = await axios.post(`/multiModel/leg/${legIndex}/select-vehicle`, {
                vehicle_id: vehicle.id,
                selection_type: 'whole_journey',
                addons: selectedAddons
            });

            console.log('Selection response:', response.data);

            if (response.data.success) {
                // Call parent callback if provided
                if (onVehicleSelected) {
                    onVehicleSelected(legIndex, 'whole_journey', response.data.cart);
                }
                
                const message = response.data.assigned_legs?.length > 1 
                    ? `Vehicle assigned to ${response.data.assigned_legs.length} legs!`
                    : 'Vehicle selected successfully!';
                    
                alert(message + ' You can now add another trip or review your complete journey.');
                
                // Navigate back to plan journey
                router.visit('/multiModel/plan-journey', {
                    method: 'get',
                    data: {
                        message: 'Vehicle selected for whole journey',
                        vehicleSelected: true
                    }
                });
            }
        } catch (error) {
            console.error('Error selecting vehicle:', error);
            console.error('Error response:', error.response?.data);
            const errorMsg = error.response?.data?.message || 'Failed to select vehicle for whole journey. Some legs may not be available.';
            alert(errorMsg + '\n\nPlease plan your journey first from the Plan Journey page.');
        } finally {
            setIsSelecting(false);
        }
    };
    
    return (
        <div className="p-5 md:p-0">
            <QuoteModal
                open={showQuoteModal}
                onClose={() => setShowQuoteModal(false)}
            >
                <div className="flex flex-row justify-between items-center">
                    <div className="figtree text-[16px] font-[600]">
                        <h1>Company Name</h1>
                        <h1>Perahera Rd, </h1>
                        <h1>011 - 3 455 675</h1>
                        <h1>Colombo 03</h1>
                    </div>

                    <div className="text-center poppins text-[25px] font-[700] uppercase">
                        <h1>
                            Company <br />{" "}
                            <span className="text-[#0955AC]">Logo</span>{" "}
                        </h1>
                    </div>
                </div>

                <div className="figtree flex flex-row justify-end text-[35px] font-[700] text-[#0955AC]">
                    <h1>Quotation</h1>
                </div>

                <div className="flex flex-row justify-between items-end">
                    <div className="text-[16px] font-[600]">
                        <h1 className="text-[#0955AC]">Bill To</h1>
                        <h1>Client Name</h1>
                        <h1>Perahera Rd, </h1>
                        <h1>011 - 3 455 675</h1>
                        <h1>Colombo 03</h1>
                    </div>

                    <div className="text-right text-[16px] font-[600]">
                        <h1>
                            <span className="text-[#0955AC]">
                                Quotation No:
                            </span>{" "}
                            #123456
                        </h1>
                        <h1>
                            <span className="text-[#0955AC]">
                                Quotation Date:
                            </span>{" "}
                            March 23, 2025
                        </h1>
                        <h1>
                            <span className="text-[#0955AC]">Due Date:</span>{" "}
                            May 23, 2025
                        </h1>
                    </div>
                </div>

                <div className="w-full h-[36px] bg-[#0955AC] mt-10 flex flex-row justify-center items-center text-[#FFFFFF] px-10 text-[14px] font-[700]">
                    <h1 className="w-[200px]">Description</h1>
                    <h1 className="w-[140px]">QTY.</h1>
                    <h1 className="w-[140px]">UNIT price</h1>
                    <h1 className="w-[140px] text-end">Sub Total</h1>
                </div>

                <div className="w-full h-[36px] flex flex-row justify-center items-center px-10 text-[14px] font-[600] mt-5">
                    <h1 className="w-[200px]">Lamborghini URUS (2020)</h1>
                    <h1 className="w-[140px]">12 Days</h1>
                    <h1 className="w-[140px]">12,000.00</h1>
                    <h1 className="w-[140px] text-end">$2,000.00</h1>
                </div>
                <div className="w-full h-[36px] flex flex-row justify-center items-center px-10 text-[14px] font-[600]">
                    <h1 className="w-[200px]">Lamborghini URUS (2020)</h1>
                    <h1 className="w-[140px]">12 Days</h1>
                    <h1 className="w-[140px]">12,000.00</h1>
                    <h1 className="w-[140px] text-end">$2,000.00</h1>
                </div>
                <div className="w-full h-[36px] flex flex-row justify-center items-center px-10 text-[14px] font-[600]">
                    <h1 className="w-[200px]">Lamborghini URUS (2020)</h1>
                    <h1 className="w-[140px]">12 Days</h1>
                    <h1 className="w-[140px]">12,000.00</h1>
                    <h1 className="w-[140px] text-end">$2,000.00</h1>
                </div>

                <div className="w-full h-[1.5px] bg-[#0955AC] my-5" />

                <div className="w-full h-[36px] flex flex-row justify-end items-center px-10 text-[14px] font-[600]">
                    <h1 className="w-[140px]">Subtotal</h1>
                    <h1 className="w-[140px] text-end">$6,000.00</h1>
                </div>
                <div className="w-full h-[36px] flex flex-row justify-end items-center px-10 text-[14px] font-[600]">
                    <h1 className="w-[140px]">Sales Tax (5%)</h1>
                    <h1 className="w-[140px] text-end">$300.00</h1>
                </div>
                <div className="flex justify-end items-center">
                    <div className="flex flex-row items-center border-t-[1px] border-b-[1px] w-[340px] px-10 h-[39px] bg-[#E8EBEF] border-[#0955AC] text-[14px] font-[700] text-[#0955AC]">
                        <h1 className="w-[140px]">Total (USD)</h1>
                        <h1 className="w-[140px] text-end">$9000.00</h1>
                    </div>
                </div>

                <h1 className="text-[14px] font-[700] text-[#0955AC]">
                    Terms and Conditions
                </h1>
                <h1 className="text-[14px] font-[500]">
                    Payment is due in 14 days
                </h1>

                <div className="flex justify-center items-center">
                    <div className="w-[231px] h-[41px] bg-[#0955AC] rounded-[5px] text-[#FFFFFF] font-[600] text-[12px] poppins flex justify-center items-center cursor-pointer">
                        Download quotation
                    </div>
                </div>
            </QuoteModal>
            <div className="poppins w-auto h-auto xl:w-[440px] xl:h-auto bg-[#F4F3F3] rounded-[19px] flex flex-col gap-10 py-10 px-5 md:px-10">
                <div className="text-[25px] font-[700]">
                    <h1>
                        ${pricePerDay}{" "}
                        <span className="text-[10px] text-[#00000080]">
                            /day
                        </span>
                    </h1>
                    <h1 className="text-[10px] font-[600] text-[#00000080] py-4">
                        Total before taxes
                    </h1>
                    <div className=" w-auto md:w-[346px] h-[1px] bg-[#0000001F]" />
                </div>

                <div className="poppins text-[12px] w-full h-auto bg-[#0955AC0D] rounded-[5px] flex flex-col py-10 px-5 md:px-10">
                    <h1 className="font-[600] mb-5 text-[#000000D9]">
                        Pricing Breakdown
                    </h1>
                    <div className="w-full h-[1px] bg-[#CDD0D4]" />
                    <div className="flex flex-col md:flex-row justify-between w-full px-5 py-5 font-[500]">
                        <div>
                            <h1 className="text-[#000000CC]">Rental Price</h1>
                            <div className="flex flex-row gap-3 text-[#00000061]">
                                <h1>${pricePerDay}/day</h1>
                                <h1 className="text-[#0955AC]">(x{numberOfDays} days)</h1>
                            </div>
                        </div>
                        <div className="text-[#000000CC]">${rentalPrice.toFixed(2)}</div>
                    </div>
                    {discountPercentage > 0 && (
                        <div className="flex flex-col md:flex-row justify-between w-full px-5 font-[500]">
                            <div>
                                <h1 className="text-[#000000CC]">
                                    {numberOfDays >= 7 ? '7+' : '3+'} day discount
                                </h1>
                                <div className="flex flex-row gap-3 text-[#00000061]">
                                    <h1>Extended trip discount</h1>
                                    <h1 className="text-[#0955AC]">({discountPercentage}%)</h1>
                                </div>
                            </div>
                            <div className="text-[#000000CC]">-${discount.toFixed(2)}</div>
                        </div>
                    )}
                    <div className="flex flex-col md:flex-row justify-between w-full px-5 py-5 font-[500]">
                        <div>
                            <h1 className="text-[#000000CC]">
                                Refundable deposit
                            </h1>
                            <div className="flex flex-row gap-3 text-[#00000061]">
                                <h1>Refunded by</h1>
                                <h1 className="text-[#0955AC]">Oct 14th</h1>
                            </div>
                        </div>
                        <div className="text-[#000000CC]">-${refundableDeposit.toFixed(2)}</div>
                    </div>
                    <div className="w-full h-[1px] bg-[#CDD0D4]" />

                    <h1 className="font-[600] mt-5 text-[#000000D9]">
                        Add Extras
                    </h1>

                    {/* checkbox section */}
                    <div className="flex flex-col justify-center text-[12px] font-[500] mt-5">
                        <div className="flex flex-row justify-between w-full px-5 py-5">
                            <div className="flex flex-row justify-center items-center gap-4">
                                <input
                                    type="checkbox"
                                    id="gpsNavigation"
                                    name="gpsNavigation"
                                    checked={extras.gpsNavigation}
                                    onChange={() => handleExtraChange('gpsNavigation')}
                                    className="size-[15px] border-[1px] border-[#0955AC] rounded-[2.8px] cursor-pointer"
                                />
                                <label htmlFor="gpsNavigation" className="cursor-pointer">GPS Navigation System</label>
                            </div>
                            <h1>${extraPrices.gpsNavigation}</h1>
                        </div>
                        <div className="flex flex-row justify-between w-full px-5">
                            <div className="flex flex-row justify-center items-center gap-4">
                                <input
                                    type="checkbox"
                                    id="childSeat"
                                    name="childSeat"
                                    checked={extras.childSeat}
                                    onChange={() => handleExtraChange('childSeat')}
                                    className="size-[15px] border-[1px] border-[#0955AC] rounded-[2.8px] cursor-pointer"
                                />
                                <label htmlFor="childSeat" className="cursor-pointer">Child Seat</label>
                            </div>
                            <h1>${extraPrices.childSeat}</h1>
                        </div>
                        <div className="flex flex-row justify-between w-full px-5 py-5">
                            <div className="flex flex-row justify-center items-center gap-4">
                                <input
                                    type="checkbox"
                                    id="wifi"
                                    name="wifi"
                                    checked={extras.wifi}
                                    onChange={() => handleExtraChange('wifi')}
                                    className="size-[15px] border-[1px] border-[#0955AC] rounded-[2.8px] cursor-pointer"
                                />
                                <label htmlFor="wifi" className="cursor-pointer">Wi-fi</label>
                            </div>
                            <h1>${extraPrices.wifi}</h1>
                        </div>
                        <div className="flex flex-row justify-between w-full px-5">
                            <div className="flex flex-row justify-center items-center gap-4">
                                <input
                                    type="checkbox"
                                    id="insuranceCoverage"
                                    name="insuranceCoverage"
                                    checked={extras.insuranceCoverage}
                                    onChange={() => handleExtraChange('insuranceCoverage')}
                                    className="size-[15px] border-[1px] border-[#0955AC] rounded-[2.8px] cursor-pointer"
                                />
                                <label htmlFor="insuranceCoverage" className="cursor-pointer">Insurance Coverage</label>
                            </div>
                            <h1>${extraPrices.insuranceCoverage}</h1>
                        </div>
                    </div>

                    <div className="w-full h-[1px] bg-[#CDD0D4] mt-5" />

                    {totalExtras > 0 && (
                        <div className="flex flex-col md:flex-row justify-between w-full px-5 py-5 font-[500]">
                            <div>
                                <h1 className="text-[#000000CC]">
                                    Total Extras
                                </h1>
                            </div>
                            <div className="text-[#000000CC]">${totalExtras.toFixed(2)}</div>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row justify-between w-full px-5 py-5 font-[500]">
                        <div>
                            <h1 className="text-[#000000CC]">
                                Advance Payment
                            </h1>
                            <div className="flex flex-row gap-3 text-[#00000061] mt-3">
                                <h1>First payment </h1>
                                <h1 className="text-[#0955AC]">(20%)</h1>
                            </div>
                        </div>
                        <div className="text-[#000000CC] text-[12px] font-[500]">
                            ${advancePayment.toFixed(2)}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between w-full px-5 pb-5 font-[500]">
                        <div>
                            <h1 className="text-[#000000CC]">
                                Total Price Due
                            </h1>
                            <div className="flex flex-row gap-3 text-[#00000061] mt-3">
                                <h1>${refundableDeposit} Refunded by</h1>
                                <h1 className="text-[#0955AC]">July 27th</h1>
                            </div>
                        </div>
                        <div className="text-[#000000CC] text-[16px] font-[700]">
                            ${totalPriceDue.toFixed(2)}
                        </div>
                    </div>

                    <div className="relative flex flex-col md:flex-row items-start justify-start px-5">
                        <span className="absolute top-[5px] left-[20px] w-[2px] h-[2px] bg-[#FF0000] rounded-full" />
                        <p className="text-[8.5px] text-[#00000061] ml-4">
                            {" "}
                            Your total rent amount will be calculated <br />{" "}
                            depending on the pick-up and drop-off dates
                        </p>
                    </div>

                    <div className="flex justify-center items-center">
                        <div
                            className=" w-auto xl:w-[261px] xl:h-[29px] px-4 py-2 bg-[#E8EBEF] border-[1.5px] border-[#0955AC] rounded-[5px] mt-10 flex items-center justify-center text-[12px] font-[700] text-[#0955AC] text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleSelectForWholeJourney}
                            disabled={isSelecting}
                            style={{ opacity: isSelecting ? 0.5 : 1, cursor: isSelecting ? 'not-allowed' : 'pointer' }}
                        >
                            {isSelecting ? 'SELECTING...' : 'SELECT FOR WHOLE JOURNEY'}
                        </div>
                    </div>

                    <div className="flex justify-center items-center">
                        <div
                            className="w-auto xl:w-[261px] xl:h-[29px] bg-[#0955AC] px-4 py-2 rounded-[5px] mt-5 flex items-center justify-center text-[12px] font-[700] text-[#FFFFFF] text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleSelectForStop}
                            disabled={isSelecting}
                            style={{ opacity: isSelecting ? 0.5 : 1, cursor: isSelecting ? 'not-allowed' : 'pointer' }}
                        >
                            {isSelecting ? 'SELECTING...' : 'SELECT FOR STOP'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleSearch;
