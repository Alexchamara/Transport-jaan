import React, { useState, useEffect } from "react";
import axios from "axios";
import car from "../../../assets/multiModel/reviewJourney/miniCar.svg";
import bus from "../../../assets/multiModel/reviewJourney/miniBus.svg";
import tram from "../../../assets/multiModel/reviewJourney/miniTram.svg";

import map from "../../../assets/multiModel/reviewJourney/map.svg";

import line from "../../../assets/multiModel/reviewJourney/line.svg";
import leftArrow from "../../../assets/multiModel/payment/leftArrow.svg";
import { Link } from "@inertiajs/react";

const Hero = () => {
    const [cart, setCart] = useState(null);
    const [cartData, setCartData] = useState(null); // Store full cart response
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const response = await axios.get('/multiModel/cart');
            if (response.data.success) {
                console.log('Cart data received:', response.data);
                setCartData(response.data); // Store full response including ready_to_checkout
                setCart({
                    selections: response.data.cart.selections || [],
                    journey: response.data.journey || { legs: [] },
                    total: response.data.total || 0
                });
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getVehicleIcon = (type) => {
        switch(type) {
            case 'land': return car;
            case 'sea': return bus; // You might want a yacht icon
            case 'air': return tram; // You might want a plane icon
            default: return car;
        }
    };

    const getVehicleLabel = (type) => {
        switch(type) {
            case 'land': return 'Car';
            case 'sea': return 'Yacht';
            case 'air': return 'Plane';
            default: return 'Vehicle';
        }
    };

    if (isLoading) {
        return (
            <div className="px-10 py-10 flex justify-center items-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0955AC] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your journey...</p>
                </div>
            </div>
        );
    }

    if (!cart || !cart.selections || cart.selections.length === 0) {
        return (
            <div className="px-10 py-10 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="bg-white shadow-lg rounded-xl p-10 max-w-md text-center">
                    <div className="text-6xl mb-6">🚗✈️🚢</div>
                    <h1 className="bebas-neue text-[40px] text-gray-800 mb-3">No Journey Selected</h1>
                    <p className="text-gray-600 mb-6">
                        Start planning your multi-model journey by adding vehicles for your trip.
                    </p>
                    <Link 
                        href="/multiModel/plan-journey" 
                        className="inline-block px-8 py-3 bg-[#0955AC] text-white rounded-lg hover:bg-[#073d80] transition-colors font-semibold"
                    >
                        📍 Plan Your Journey
                    </Link>
                </div>
            </div>
        );
    }

    // Ensure journey and legs exist
    const journey = cart.journey || { legs: [] };
    
    // Group selections into separate trips based on trip_id
    const groupSelectionsIntoTrips = () => {
        const tripsMap = new Map();
        
        // Ensure cart.selections is an array
        const selections = Array.isArray(cart.selections) ? cart.selections : [];
        
        selections.forEach((selection, index) => {
            const leg = selection.leg_data || journey.legs[index];
            const tripId = leg?.trip_id ?? 0; // Use trip_id from leg data, default to 0
            
            if (!tripsMap.has(tripId)) {
                tripsMap.set(tripId, []);
            }
            
            tripsMap.get(tripId).push({ selection, index, leg });
        });
        
        // Convert map to array and sort by trip_id
        return Array.from(tripsMap.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([tripId, items]) => items);
    };
    
    const trips = groupSelectionsIntoTrips();
    
    // Check if there are any trips with selections
    if (trips.length === 0 || trips.every(trip => trip.length === 0)) {
        return (
            <div className="px-10 py-10 flex flex-col items-center justify-center min-h-[60vh]">
                <div className="bg-white shadow-lg rounded-xl p-10 max-w-md text-center">
                    <div className="text-6xl mb-6">🚗✈️🚢</div>
                    <h1 className="bebas-neue text-[40px] text-gray-800 mb-3">No Journey Selected</h1>
                    <p className="text-gray-600 mb-6">
                        Start planning your multi-model journey by adding vehicles for your trip.
                    </p>
                    <Link 
                        href="/multiModel/plan-journey" 
                        className="inline-block px-8 py-3 bg-[#0955AC] text-white rounded-lg hover:bg-[#073d80] transition-colors font-semibold"
                    >
                        📍 Plan Your Journey
                    </Link>
                </div>
            </div>
        );
    }
    
    const startLocation = trips[0]?.[0]?.leg?.from_location || 'Start';
    const endLocation = trips[trips.length - 1]?.[trips[trips.length - 1].length - 1]?.leg?.to_location || 'End';

    return (
        <div className="px-10 py-10">
            <div className="grid xl:grid-cols-3 grid-cols-1 gap-10">
                {/* left side */}
                <div className="xl:col-span-2">
                    <div className="flex flex-col md:flex-row items-start gap-5">
                        <Link href="/multiModel/plan-journey">
                            <img src={leftArrow} alt="Back" />
                        </Link>
                        <div>
                            <h1 className="bebas-neue text-[50px]/[100%]">
                                Review{" "}
                                <span className="text-[#0955AC]">Your</span>{" "}
                                Journey
                            </h1>
                            <h3 className="text-[14px] font-[500] text-[#00000080]">
                                {trips.length} Trip{trips.length > 1 ? 's' : ''}: {startLocation} to {endLocation}
                            </h3>
                        </div>
                    </div>

                    <h1 className="text-[25px] font-[600] figtree py-10">
                        Itinerary Timeline
                    </h1>

                    <div className="flex flex-col gap-12">
                        {trips.map((trip, tripIndex) => (
                            <div key={tripIndex} className="relative">
                                {/* Trip Header */}
                                {trips.length > 1 && (
                                    <div className="mb-6 flex items-center gap-3">
                                        <div className="flex-1 h-[2px] bg-gradient-to-r from-[#0955AC] to-transparent"></div>
                                        <h2 className="text-[20px] font-[700] text-[#0955AC] px-4 py-2 bg-[#0955AC1A] rounded-lg">
                                            Trip {tripIndex + 1}: {trip[0]?.leg?.from_location} → {trip[trip.length - 1]?.leg?.to_location}
                                        </h2>
                                        <div className="flex-1 h-[2px] bg-gradient-to-l from-[#0955AC] to-transparent"></div>
                                    </div>
                                )}
                                
                                {/* Trip Legs */}
                                <div className="flex flex-col gap-8">
                                    {trip.map(({ selection, index, leg }, legIndexInTrip) => {
                                        const defaultLeg = {
                                            from_location: 'Unknown',
                                            to_location: 'Unknown',
                                            start_time: '--:--',
                                            end_time: '--:--',
                                            start_date: '--',
                                            end_date: '--'
                                        };
                                        
                                        const currentLeg = leg || defaultLeg;

                                        const vehicleData = selection.vehicle_data || {};
                                        const vehicleName = vehicleData.manufacturer 
                                            ? `${vehicleData.manufacturer} ${vehicleData.name}` 
                                            : vehicleData.name || 'Unknown Vehicle';
                                        
                                        // Format dates if available
                                        const formatDate = (dateStr) => {
                                            if (!dateStr || dateStr === '--') return null;
                                            try {
                                                const date = new Date(dateStr);
                                                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                            } catch (e) {
                                                return dateStr;
                                            }
                                        };

                                        const formatDateLong = (dateStr) => {
                                            if (!dateStr || dateStr === '--') return null;
                                            try {
                                                const date = new Date(dateStr);
                                                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                            } catch (e) {
                                                return dateStr;
                                            }
                                        };

                                        const startDate = formatDate(currentLeg.start_date);
                                        const endDate = formatDate(currentLeg.end_date);
                                        const startDateLong = formatDateLong(currentLeg.start_date);
                                        const endDateLong = formatDateLong(currentLeg.end_date);
                                        
                                        return (
                                <div key={index} className="flex flex-row items-start gap-5">
                                    <div className="hidden lg:flex flex-col items-center">
                                        <div className="size-[15px] border-[1px] border-[#0043CE] rounded-full flex justify-center items-center">
                                            <div className="size-[3px] rounded-full bg-[#0043CE]" />
                                        </div>
                                        {legIndexInTrip < trip.length - 1 && (
                                            <div className="h-[120px] w-0 border-l border-dotted border-[#0955AC]"></div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="w-full min-h-[102px] bg-[#F4F3F3] shadow-2xl rounded-[10px] text-[#0955AC] text-[12px] font-[600] flex flex-col md:flex-row items-center justify-between px-5 py-5 gap-4">
                                            {/* Vehicle Type */}
                                            <div className="relative w-full md:w-[60px] h-[60px] bg-[#0955AC1A] rounded-[10px] flex flex-col justify-center items-center">
                                                <img src={getVehicleIcon(vehicleData.type)} alt={`${vehicleData.type} icon`} />
                                                <h1 className="capitalize text-[10px]">{getVehicleLabel(vehicleData.type)}</h1>
                                            </div>

                                            {/* Route Info */}
                                            <div className="flex flex-row items-center flex-1">
                                                <div className="size-[20px] bg-[#FFFFFF] border-[1px] border-[#0043CE] rounded-full flex justify-center items-center shrink-0">
                                                    <div className="size-[4px] bg-[#0043CE] rounded-full" />
                                                </div>
                                                <div className="flex flex-col items-center text-[12px] text-[#00000080] font-[500] px-4 flex-1">
                                                    <h1 className="text-center font-semibold text-gray-700">{currentLeg.from_location} to {currentLeg.to_location}</h1>
                                                    <div className="w-full max-w-[281px] h-[1px] bg-[#0955AC] my-1"></div>
                                                    <h1>{selection.rental_days || 1} hr{selection.rental_days > 1 ? 's' : ''}</h1>
                                                    {startDateLong && (
                                                        <p className="text-[10px] text-gray-500 mt-1">
                                                            {startDateLong}{endDateLong && endDateLong !== startDateLong ? ` - ${endDateLong}` : ''}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="size-[20px] bg-[#FFFFFF] border-[1px] border-[#0043CE] rounded-full flex justify-center items-center shrink-0">
                                                    <div className="size-[4px] bg-[#0043CE] rounded-full" />
                                                </div>
                                            </div>

                                            {/* Price & Time */}
                                            <div className="flex flex-col justify-center items-center">
                                                <h1 className="text-[25px] font-[600] text-[#000000]">
                                                    ${selection.total_amount?.toFixed(2) || '0.00'}
                                                </h1>
                                                <h1 className="text-[12px] text-[#00000080] font-[400]">
                                                    {currentLeg.start_time} - {currentLeg.end_time}
                                                </h1>
                                                <p className="text-[10px] text-gray-500 mt-1 text-center max-w-[150px]">
                                                    {vehicleName}
                                                </p>
                                                {selection.addons_lines && selection.addons_lines.length > 0 && (
                                                    <p className="text-[9px] text-[#0955AC] mt-1">
                                                        +{selection.addons_lines.length} addon{selection.addons_lines.length > 1 ? 's' : ''}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={async () => {
                                                    if (confirm(`Remove ${vehicleName} from your journey?`)) {
                                                        try {
                                                            await axios.delete(`/multiModel/leg/${index}/remove-vehicle`);
                                                            alert('Vehicle removed successfully!');
                                                            fetchCart(); // Refresh cart
                                                        } catch (error) {
                                                            console.error('Error removing vehicle:', error);
                                                            alert('Failed to remove vehicle: ' + (error.response?.data?.message || 'Unknown error'));
                                                        }
                                                    }
                                                }}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 text-[10px] font-[600] px-3 py-1 rounded transition-colors"
                                            >
                                                🗑️ Remove
                                            </button>
                                        </div>

                                        {legIndexInTrip < trip.length - 1 && (
                                            <div className="py-5 flex flex-row items-center gap-2 justify-center lg:justify-start lg:-ml-[28px]">
                                                <div className="hidden lg:block w-[60px] h-[1px] bg-[#0955AC]" />
                                                <h1 className="text-[16px] font-[600] text-[#0955AC]">
                                                    {startDate && endDate ? `${startDate} - ${endDate}`.replace(', 2026', '').replace(', 2025', '') : `${currentLeg.start_date} - ${currentLeg.end_date}`}
                                                </h1>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* right side */}
                <div className="xl:col-span-1 flex flex-col gap-5">
                    <div className="h-auto bg-[#F4F3F3] rounded-[10px]">
                        <img src={map} alt="map" className="rounded-[10px]" />
                    </div>
                    <div className=" h-auto bg-[#FAFAFA] shadow-2xl rounded-[12px] py-5">
                        <h1 className="text-[#333843] text-[20px] font-[600] w-full bg-[#E0E2E7] p-5 rounded-t-[12px]">
                            Trip Summary
                        </h1>
                        <div className="flex flex-row justify-between px-5 text-[14px] font-[600] text-[#333843] mt-5">
                            <h1>Total</h1>
                            <h1>${cart.total?.toFixed(2) || '0.00'} Incl. VAT</h1>
                        </div>

                        <div className="bg-[#0955AC1A] mx-2 mt-5 rounded-[10px]">
                            <div className="px-5 py-5 flex flex-col gap-4">
                                {trips.map((trip, tripIndex) => (
                                    <div key={tripIndex}>
                                        {/* Trip Header in Summary */}
                                        {trips.length > 1 && (
                                            <div className="mb-3">
                                                <h3 className="font-[700] text-[14px] text-[#0955AC] border-b-2 border-[#0955AC] pb-2">
                                                    Trip {tripIndex + 1}
                                                </h3>
                                            </div>
                                        )}
                                        
                                        {/* Trip Legs */}
                                        {trip.map(({ selection, index, leg }, legIndexInTrip) => {
                                            const vehicleData = selection.vehicle_data || {};
                                            return (
                                                <div key={index}>
                                                    <div className="flex flex-col gap-2">
                                                        <h1 className="font-[600] text-[14px]">
                                                            {leg?.from_location} → {leg?.to_location}
                                                        </h1>
                                                        <p className="text-[12px] text-gray-600">
                                                            {vehicleData.manufacturer} {vehicleData.name} • {selection.rental_days} day(s)
                                                        </p>
                                                        <div className="flex flex-row justify-between items-center w-full">
                                                            <h1 className="font-[400] text-[#667085] text-[14px]">
                                                                Amount
                                                            </h1>
                                                            <h1 className="font-[500] text-[#333843] text-[14px]">
                                                                ${selection.total_amount?.toFixed(2) || '0.00'}
                                                            </h1>
                                                        </div>
                                                        {selection.addons_lines && selection.addons_lines.length > 0 && (
                                                            <div className="mt-2 pl-2 border-l-2 border-blue-200">
                                                                {selection.addons_lines.map((addon, addonIndex) => (
                                                                    <div key={addonIndex} className="flex justify-between text-[12px] text-gray-600">
                                                                        <span>+ {addon.name}</span>
                                                                        <span>${addon.total.toFixed(2)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {legIndexInTrip < trip.length - 1 && (
                                                        <div className="h-[1px] bg-gray-300 my-3"></div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        
                                        {/* Separator between trips */}
                                        {tripIndex < trips.length - 1 && (
                                            <div className="h-[2px] bg-[#0955AC] my-4"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col justify-center items-center gap-3 mt-5 px-5">
                            <Link
                                href="/multiModel/plan-journey"
                                className="w-full h-[38px] bg-white border-2 border-[#0955AC] rounded-[4px] text-[#0955AC] text-[12px] font-[700] flex justify-center items-center cursor-pointer hover:bg-[#0955AC] hover:text-white transition-colors"
                            >
                                ← Back to Journey Planning
                            </Link>
                            {cartData?.ready_to_checkout ? (
                                <Link
                                    href="/multiModel/travellerDetails"
                                    className="w-full h-[38px] bg-[#0955AC] rounded-[4px] text-[#FFFFFF] text-[12px] font-[700] flex justify-center items-center cursor-pointer hover:bg-[#073d80] transition-colors"
                                >
                                    Continue to Passenger Details →
                                </Link>
                            ) : (
                                <div className="w-full h-[38px] bg-gray-400 rounded-[4px] text-[#FFFFFF] text-[12px] font-[700] flex justify-center items-center cursor-not-allowed opacity-60">
                                    Add vehicles to continue
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;
