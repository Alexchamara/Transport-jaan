import React, { useEffect, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import availableIcon from '../../../assets/vendors/units/availableIcon.svg';
import icon1 from '../../../assets/vendors/units/icons/icon1.svg';
import icon2 from '../../../assets/vendors/units/icons/icon2.svg';
import icon3 from '../../../assets/vendors/units/icons/icon3.svg';
import icon4 from '../../../assets/vendors/units/icons/icon4.svg';
import heartFill from '../../../assets/rentAVehicle/collection/heartFill.png';
import heart from '../../../assets/rentAVehicle/collection/heart.png';

const nbsp = (text) => (typeof text === 'string' ? text.replace(/ /g, '\u00A0') : text);

const specValue = (value) => (value || value === 0 ? value : '-');

const ServiceContent = ({ activeService, activeMode, services, landVehicles = [], seaVehicles = [], airVehicles = [], warehouseUnits = [], courierServices = [], flightSchedules = [], trainSchedules = [], authUser, likedVehicleIds = [], likedWarehouseIds = [] }) => {
    const [likedMap, setLikedMap] = useState({});
    const [likedWarehouseMap, setLikedWarehouseMap] = useState({});

    useEffect(() => {
        const next = {};
        (likedVehicleIds || []).forEach((id) => { next[id] = true; });
        setLikedMap(next);
    }, [likedVehicleIds]);

    useEffect(() => {
        const next = {};
        (likedWarehouseIds || []).forEach((id) => { next[id] = true; });
        setLikedWarehouseMap(next);
    }, [likedWarehouseIds]);

    const toggleLike = async (vehicleId) => {
        if (!authUser) {
            alert('You must be logged in to like a vehicle.');
            router.visit('/signin');
            return;
        }

        const optimistic = !likedMap[vehicleId];
        setLikedMap((prev) => ({ ...prev, [vehicleId]: optimistic }));

        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        try {
            const { data } = await axios.post(
                route('client.vehicle.like.toggle'),
                { vehicle_id: vehicleId },
                { headers: { 'X-CSRF-TOKEN': token } }
            );

            const updated = {};
            (data.likedVehicleIds || []).forEach((id) => {
                updated[id] = true;
            });
            setLikedMap(updated);
        } catch (error) {
            setLikedMap((prev) => ({ ...prev, [vehicleId]: !optimistic }));
            alert('Something went wrong while updating favourite.');
        }
    };
    const resolveWarehouseLikeUrl = () => {
        if (typeof route === 'function') {
            try { return route('client.warehouse.like.toggle'); } catch (_) {}
        }
        return '/api/warehouse/like-toggle';
    };

    const toggleWarehouseLike = async (warehouseId) => {
        if (!authUser) {
            alert('You must be logged in to add to favourites.');
            router.visit('/signin');
            return;
        }
        const optimistic = !likedWarehouseMap[warehouseId];
        setLikedWarehouseMap((prev) => ({ ...prev, [warehouseId]: optimistic }));
        try {
            const { data } = await axios.post(
                resolveWarehouseLikeUrl(),
                { warehouse_id: warehouseId }
            );
            const updated = {};
            (data.likedWarehouseIds || []).forEach((id) => { updated[id] = true; });
            setLikedWarehouseMap(updated);
        } catch (error) {
            setLikedWarehouseMap((prev) => ({ ...prev, [warehouseId]: !optimistic }));
        }
    };

    // Vehicle Rental Service Content
    if (activeService === 'Vehicle Rental') {
        let vehicles = [];
        
        if (activeMode === 'Land') {
            vehicles = landVehicles;
        } else if (activeMode === 'Sea') {
            vehicles = seaVehicles;
        } else if (activeMode === 'Air') {
            vehicles = airVehicles;
        }

        return (
            <div className='w-full max-w-[1364px] mx-auto px-4 sm:px-6 xl:px-10 py-6'>
                <h2 className='text-2xl font-bold mb-6'>
                    {activeMode} Vehicles ({vehicles.length})
                </h2>
                
                {vehicles.length === 0 ? (
                    <div className='bg-gray-50 border border-gray-200 rounded-lg px-6 py-8 text-center'>
                        <p className='text-gray-600'>No {activeMode.toLowerCase()} vehicles available.</p>
                    </div>
                ) : (
                    <div className='flex flex-col gap-5'>
                        {vehicles.map((vehicle) => (
                            <div
                                key={vehicle.id}
                                className='w-full min-h-[140px] bg-white rounded-[12px] border border-[#DDE7F5] overflow-hidden flex flex-col md:flex-row'
                                style={{ boxShadow: '0 4px 4px #0000001A' }}
                            >
                                <div className='w-full md:w-[220px] h-[180px] md:h-[180px] flex-shrink-0 bg-[#F2F5F9]'>
                                    <img
                                        src={vehicle.primary_image_url || '/placeholder.png'}
                                        alt={vehicle.model || 'vehicle'}
                                        className='w-full h-full object-contain'
                                    />
                                </div>

                                <div className='flex-1 px-4 sm:px-6 py-4'>
                                    <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
                                        <div className='min-w-0'>
                                            <div className='bebas-neue text-[28px] leading-7'>
                                                <span className='truncate block'>
                                                    {vehicle.manufacturer || '-'}{' '}
                                                    <span className='text-[#0955AC]'>
                                                        {vehicle.model || '-'}
                                                    </span>
                                                </span>
                                            </div>
                                            <div className='bebas-neue text-[24px] leading-6'>
                                                ${Number(vehicle.rental_price_per_day ?? 0).toFixed(0)}
                                                <span className='figtree text-[#00000080] text-[14px] font-[600]'>/day</span>
                                            </div>
                                            <div className='poppins flex items-center gap-2 mt-1 text-[13px] font-[600]'>
                                                <img src={availableIcon} className='w-[16px] h-[16px]' alt='status' />
                                                <span className='text-[#3C9A34]'>
                                                    {(vehicle.status || 'active').toString().toLowerCase() === 'active' ? 'Available' : vehicle.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className='flex items-center gap-3 shrink-0'>
                                            <Link
                                                href={`/vehicleDetails/${vehicle.id}?tab=rental`}
                                                className='figtree w-[180px] h-[40px] bg-[#0A55AC] hover:bg-[#0a4b97] rounded-[6px] text-[16px] text-white font-[700] flex items-center justify-center shrink-0'
                                            >
                                                More Details
                                            </Link>
                                            <button
                                                type='button'
                                                onClick={() => toggleLike(vehicle.id)}
                                                className='h-[40px] w-[40px] rounded-[4px] border border-[#0955AC] bg-white grid place-items-center'
                                                aria-label={likedMap[vehicle.id] ? 'Remove favourite' : 'Add favourite'}
                                            >
                                                <img
                                                    src={likedMap[vehicle.id] ? heartFill : heart}
                                                    alt='favourite'
                                                    className='w-[18px] h-[18px]'
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    <div className='mt-4 flex flex-wrap items-center gap-x-6 gap-y-3'>
                                        <div className='flex flex-col items-center justify-center w-[100px] sm:w-[120px] min-w-[80px] text-center gap-1.5'>
                                            <img src={icon1} className='w-[22px] h-[22px]' alt='mileage' />
                                            <span className='text-[13px] font-[600] leading-tight whitespace-nowrap'>{specValue(vehicle.mileage_km)}</span>
                                        </div>
                                        <div className='flex flex-col items-center justify-center w-[100px] sm:w-[120px] min-w-[80px] text-center gap-1.5'>
                                            <img src={icon2} className='w-[22px] h-[22px]' alt='transmission' />
                                            <span className='text-[13px] font-[600] leading-tight whitespace-nowrap'>{specValue(vehicle.transmission_type)}</span>
                                        </div>
                                        <div className='flex flex-col items-center justify-center w-[100px] sm:w-[120px] min-w-[80px] text-center gap-1.5'>
                                            <img src={icon3} className='w-[22px] h-[22px]' alt='capacity' />
                                            <span className='text-[13px] font-[600] leading-tight whitespace-nowrap'>{nbsp(`${specValue(vehicle.passenger_capacity)} Person`)}</span>
                                        </div>
                                        <div className='flex flex-col items-center justify-center w-[100px] sm:w-[120px] min-w-[80px] text-center gap-1.5'>
                                            <img src={icon4} className='w-[22px] h-[22px]' alt='fuel' />
                                            <span className='text-[13px] font-[600] leading-tight whitespace-nowrap'>{specValue(vehicle.fuel_type)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Ticket Booking Service Content
    if (activeService === 'Ticket Booking') {
        let vehicles = [];
        
        if (activeMode === 'Land') {
            vehicles = landVehicles;
        } else if (activeMode === 'Sea') {
            vehicles = seaVehicles;
        } else if (activeMode === 'Air') {
            vehicles = airVehicles;
        }

        return (
            <div className='w-full max-w-[1364px] mx-auto px-4 sm:px-6 xl:px-10 py-6'>
                <h2 className='text-2xl font-bold mb-6'>
                    {activeMode} Ticket Booking ({vehicles.length})
                </h2>
                
                {vehicles.length === 0 ? (
                    <div className='bg-gray-50 border border-gray-200 rounded-lg px-6 py-8 text-center'>
                        <p className='text-gray-600'>No {activeMode.toLowerCase()} vehicles available for ticket booking.</p>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {vehicles.map((vehicle) => (
                            <div 
                                key={vehicle.id} 
                                className='bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow'
                            >
                                <div className='h-48 bg-[#F2F5F9]'>
                                    {vehicle.primary_image_url ? (
                                        <img 
                                            src={vehicle.primary_image_url} 
                                            alt={vehicle.model}
                                            className='w-full h-full object-contain'
                                        />
                                    ) : (
                                        <div className='w-full h-full flex items-center justify-center text-gray-400'>
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <div className='p-4'>
                                    <h3 className='font-bold text-lg mb-2'>
                                        {vehicle.manufacturer} {vehicle.model}
                                    </h3>
                                    <p className='text-sm text-gray-600 mb-3'>
                                        {vehicle.manufacture_year} | {vehicle.passenger_capacity} Seats
                                    </p>
                                    <div className='flex justify-between items-center'>
                                        <span className='text-blue-600 font-bold'>
                                            ${vehicle.rental_price_per_day}/ticket
                                        </span>
                                        <Link
                                            href={`/vehicleDetails/${vehicle.id}?tab=rental`}
                                            className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm'
                                        >
                                            More Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Warehouse Service Content
    if (activeService === 'Warehousing') {
        return (
            <div className='w-full max-w-[1364px] mx-auto px-4 sm:px-6 xl:px-10 py-6'>
                <h2 className='text-2xl font-bold mb-6'>
                    Warehouse Units ({warehouseUnits.length})
                </h2>
                
                {warehouseUnits.length === 0 ? (
                    <div className='bg-gray-50 border border-gray-200 rounded-lg px-6 py-8 text-center'>
                        <p className='text-gray-600'>No warehouse units available.</p>
                    </div>
                ) : (
                    <div className='flex flex-col gap-5'>
                        {warehouseUnits.map((warehouse) => (
                            <div
                                key={warehouse.id}
                                className='w-full min-h-[140px] bg-white rounded-[12px] border border-[#DDE7F5] overflow-hidden flex flex-col md:flex-row'
                                style={{ boxShadow: '0 4px 4px #0000001A' }}
                            >
                                <div className='w-full md:w-[220px] h-[180px] md:h-[180px] flex-shrink-0 bg-[#F2F5F9]'>
                                    {warehouse.primary_image_url ? (
                                        <img
                                            src={warehouse.primary_image_url}
                                            alt={warehouse.name || 'warehouse'}
                                            className='w-full h-full object-contain'
                                        />
                                    ) : (
                                        <div className='w-full h-full flex items-center justify-center text-center text-gray-400'>
                                            <div>
                                                <div className='text-4xl mb-1'>🏢</div>
                                                <div className='text-xs'>No Image</div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className='flex-1 px-4 sm:px-6 py-4'>
                                    <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3'>
                                        <div className='min-w-0'>
                                            <div className='bebas-neue text-[28px] leading-7'>
                                                <span className='truncate block text-[#0955AC]'>
                                                    {warehouse.name}
                                                </span>
                                            </div>
                                            <div className='bebas-neue text-[24px] leading-6'>
                                                ${Number(warehouse.monthly_rate ?? 0).toFixed(0)}
                                                <span className='figtree text-[#00000080] text-[14px] font-[600]'>/month</span>
                                            </div>
                                            <div className='poppins flex items-center gap-2 mt-1 text-[13px] font-[600]'>
                                                <img src={availableIcon} className='w-[16px] h-[16px]' alt='status' />
                                                <span className='text-[#3C9A34]'>
                                                    {warehouse.is_available ? 'Available' : 'Not Available'}
                                                </span>
                                            </div>
                                            <div className='text-sm text-gray-600 mt-1'>
                                                {warehouse.address}
                                            </div>
                                        </div>

                                        <div className='flex items-center gap-3 shrink-0'>
                                            <button
                                                type='button'
                                                onClick={() => router.visit('/warehouseDetails', { data: { warehouse: { id: warehouse.id } }, preserveState: false })}
                                                className='figtree w-[180px] h-[40px] bg-[#0A55AC] hover:bg-[#0a4b97] rounded-[6px] text-[16px] text-white font-[700] flex items-center justify-center shrink-0'
                                            >
                                                More Details
                                            </button>
                                            <button
                                                type='button'
                                                onClick={() => toggleWarehouseLike(warehouse.id)}
                                                className='h-[40px] w-[40px] rounded-[4px] border border-[#0955AC] bg-white grid place-items-center'
                                                aria-label={likedWarehouseMap[warehouse.id] ? 'Remove favourite' : 'Add favourite'}
                                            >
                                                <img
                                                    src={likedWarehouseMap[warehouse.id] ? heartFill : heart}
                                                    alt='favourite'
                                                    className='w-[18px] h-[18px]'
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    <div className='mt-4 flex flex-wrap items-center gap-x-6 gap-y-3'>
                                        <div className='flex flex-col items-center justify-center w-[100px] sm:w-[120px] min-w-[80px] text-center gap-1.5'>
                                            <div className='w-[22px] h-[22px] text-center text-[#0955AC] font-bold'>📐</div>
                                            <span className='text-[13px] font-[600] leading-tight whitespace-nowrap'>{specValue(warehouse.total_area)} m²</span>
                                        </div>
                                        <div className='flex flex-col items-center justify-center w-[100px] sm:w-[120px] min-w-[80px] text-center gap-1.5'>
                                            <div className='w-[22px] h-[22px] text-center text-[#0955AC] font-bold'>📦</div>
                                            <span className='text-[13px] font-[600] leading-tight whitespace-nowrap'>{specValue(warehouse.capacity)} {warehouse.capacity_unit}</span>
                                        </div>
                                        <div className='flex flex-col items-center justify-center w-[100px] sm:w-[120px] min-w-[80px] text-center gap-1.5'>
                                            <div className='w-[22px] h-[22px] text-center text-[#0955AC] font-bold'>🏭</div>
                                            <span className='text-[13px] font-[600] leading-tight whitespace-nowrap'>{specValue(warehouse.type)}</span>
                                        </div>
                                        <div className='flex flex-col items-center justify-center w-[100px] sm:w-[120px] min-w-[80px] text-center gap-1.5'>
                                            <div className='w-[22px] h-[22px] text-center text-[#0955AC] font-bold'>📞</div>
                                            <span className='text-[13px] font-[600] leading-tight whitespace-nowrap'>{warehouse.contact_person}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Aviation Service Content
    if (activeService === 'Aviation Service') {
        return (
            <div className='w-full max-w-[1364px] mx-auto px-4 sm:px-6 xl:px-10 py-6'>
                <h2 className='text-2xl font-bold mb-6'>
                    Aviation Services ({flightSchedules.length})
                </h2>
                
                {flightSchedules.length === 0 ? (
                    <div className='bg-gray-50 border border-gray-200 rounded-lg px-6 py-8 text-center'>
                        <p className='text-gray-600'>No flight schedules available.</p>
                        <p className='text-sm text-gray-500 mt-2'>This vendor offers aviation services but flight schedules are not yet configured.</p>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {flightSchedules.map((flight, index) => (
                            <div 
                                key={index} 
                                className='bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow p-6'
                            >
                                <div className='text-center mb-4'>
                                    <div className='text-4xl mb-2'>✈️</div>
                                    <h3 className='font-bold text-lg text-[#0955AC]'>Aviation Service</h3>
                                </div>
                                <div className='text-sm text-gray-600 text-center'>
                                    Domestic and international aviation services available.
                                </div>
                                <div className='mt-4 text-center'>
                                    <button className='bg-[#0A55AC] text-white px-4 py-2 rounded hover:bg-[#0a4b97] transition text-sm'>
                                        Contact for Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Railway Service Content
    if (activeService === 'Railway Service') {
        return (
            <div className='w-full max-w-[1364px] mx-auto px-4 sm:px-6 xl:px-10 py-6'>
                <h2 className='text-2xl font-bold mb-6'>
                    Railway Services ({trainSchedules.length})
                </h2>
                
                {trainSchedules.length === 0 ? (
                    <div className='bg-gray-50 border border-gray-200 rounded-lg px-6 py-8 text-center'>
                        <p className='text-gray-600'>No train schedules available.</p>
                        <p className='text-sm text-gray-500 mt-2'>This vendor offers railway services but train schedules are not yet configured.</p>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {trainSchedules.map((train, index) => (
                            <div 
                                key={index} 
                                className='bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow p-6'
                            >
                                <div className='text-center mb-4'>
                                    <div className='text-4xl mb-2'>🚂</div>
                                    <h3 className='font-bold text-lg text-[#0955AC]'>Railway Service</h3>
                                </div>
                                <div className='text-sm text-gray-600 text-center'>
                                    Public and private railway services available.
                                </div>
                                <div className='mt-4 text-center'>
                                    <button className='bg-[#0A55AC] text-white px-4 py-2 rounded hover:bg-[#0a4b97] transition text-sm'>
                                        Contact for Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Freight Service Content
    if (activeService === 'Freight') {
        return (
            <div className='w-full max-w-[1364px] mx-auto px-4 sm:px-6 xl:px-10 py-6'>
                <h2 className='text-2xl font-bold mb-6'>
                    Freight Services
                </h2>
                
                <div className='bg-gray-50 border border-gray-200 rounded-lg px-6 py-8 text-center'>
                    <div className='text-center mb-4'>
                        <div className='text-4xl mb-2'>🚛</div>
                        <h3 className='font-bold text-lg text-[#0955AC]'>Freight Services</h3>
                    </div>
                    <p className='text-gray-600'>Freight shipping and logistics services available.</p>
                    <p className='text-sm text-gray-500 mt-2'>Air, sea, and road freight services offered by this vendor.</p>
                    <div className='mt-4'>
                        <button className='bg-[#0A55AC] text-white px-4 py-2 rounded hover:bg-[#0a4b97] transition text-sm'>
                            Contact for Quote
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Waterborne Transport Service Content
    if (activeService === 'Waterborne Transport') {
        return (
            <div className='w-full max-w-[1364px] mx-auto px-4 sm:px-6 xl:px-10 py-6'>
                <h2 className='text-2xl font-bold mb-6'>
                    Waterborne Transport Services
                </h2>
                
                <div className='bg-gray-50 border border-gray-200 rounded-lg px-6 py-8 text-center'>
                    <p className='text-gray-600'>Waterborne transport services available.</p>
                    <p className='text-sm text-gray-500 mt-2'>Cruise line and private yacht/boat services offered by this vendor.</p>
                    <div className='mt-4'>
                        <button className='bg-[#0A55AC] text-white px-4 py-2 rounded hover:bg-[#0a4b97] transition text-sm'>
                            Contact for Details
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Courier Service Content
    if (activeService === 'Courier Services') {
        return (
            <div className='w-full max-w-[1364px] mx-auto px-4 sm:px-6 xl:px-10 py-6'>
                <h2 className='text-2xl font-bold mb-6'>
                    Courier Services ({courierServices.length})
                </h2>
                
                {courierServices.length === 0 ? (
                    <div className='bg-gray-50 border border-gray-200 rounded-lg px-6 py-8 text-center'>
                        <p className='text-gray-600'>No courier services available.</p>
                        <p className='text-sm text-gray-500 mt-2'>This vendor offers courier services but specific service details are not yet configured.</p>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {courierServices.map((service, index) => (
                            <div 
                                key={index} 
                                className='bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow p-6'
                            >
                                <div className='text-center mb-4'>
                                    <div className='text-4xl mb-2'>📦</div>
                                    <h3 className='font-bold text-lg text-[#0955AC]'>Courier Service</h3>
                                </div>
                                <div className='text-sm text-gray-600 text-center'>
                                    Domestic and international courier services available.
                                </div>
                                <div className='mt-4 text-center'>
                                    <button className='bg-[#0A55AC] text-white px-4 py-2 rounded hover:bg-[#0a4b97] transition text-sm'>
                                        Contact for Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Default fallback
    return (
        <div className='w-full max-w-[1364px] mx-auto px-4 sm:px-6 xl:px-10 py-6'>
            <p className='text-gray-600'>Service content not available.</p>
        </div>
    );
};

export default ServiceContent;
