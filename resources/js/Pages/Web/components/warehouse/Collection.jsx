import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import axios from "axios";
import { Heart } from "lucide-react";
import card1 from "../../assets/warehouse/card1.svg";

import icon1 from "../../assets/warehouse/icon1.svg";
import icon2 from "../../assets/warehouse/icon2.svg";
import icon3 from "../../assets/warehouse/icon3.svg";
import icon4 from "../../assets/warehouse/icon4.svg";



const Collection = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [displayCount, setDisplayCount] = useState(8);
    const [liked, setLiked] = useState(new Set());

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const resolveWishlistUrl = () => {
        if (typeof route === "function") {
            try {
                return route("client.warehouse.like.toggle");
            } catch (err) {
                console.warn("Falling back to API wishlist endpoint", err);
            }
        }

        return "/api/warehouse/like-toggle";
    };

    const fetchWarehouses = async () => {
        try {
            setLoading(true);
            setError(null);
            
            let data;
            
            // Try multiple endpoints to get warehouse data
            try {
                const response = await axios.get('/api/warehouse-units');
                data = response.data;
            } catch (apiError) {
                console.warn('API endpoint failed, trying alternative method:', apiError);
                // Fallback to WebController warehouseList method
                try {
                    const response = await axios.get('/warehouseList?format=json');
                    data = response.data.warehouses || [];
                } catch (fallbackError) {
                    console.warn('Fallback method also failed:', fallbackError);
                    throw new Error('All warehouse data sources failed');
                }
            }
            
            // Handle different data formats
            const warehouseArray = Array.isArray(data) ? data : (data.data || []);
            
            const formattedWarehouses = warehouseArray.map(warehouse => ({
                id: warehouse.id,
                name: warehouse.name || `Warehouse ${warehouse.id}`,
                location: warehouse.address || 'Location not specified',
                sqft: warehouse.total_area ? `${warehouse.total_area}sqft` : 'N/A',
                status: warehouse.is_available !== false ? 'Available' : 'Unavailable',
                power: '220V', // Default since not in API
                security: 'CCTV', // Default since not in API
                price: warehouse.monthly_rate || warehouse.base_price || '89.00',
                monthly_rate: warehouse.monthly_rate || warehouse.base_price || '89.00',
                image: warehouse.main_image?.url || warehouse.primary_image_url || card1,
                isLiked: Boolean(warehouse.is_liked),
            }));
            
            setWarehouses(formattedWarehouses);
            setLiked(new Set(formattedWarehouses.filter((warehouse) => warehouse.isLiked).map((warehouse) => warehouse.id)));
        } catch (err) {
            console.error('Error fetching warehouses:', err);
            setError('Failed to load warehouses');
            // Fallback to static data
            setWarehouses([
                {
                    id: 1,
                    name: "Warehouse A",
                    location: "Galle Rd, Colombo 03",
                    sqft: "2500sqft",
                    status: "Available",
                    power: "220V",
                    security: "CCTV",
                    price: "89.00",
                    monthly_rate: "89.00",
                    image: card1,
                    isLiked: false,
                },
                {
                    id: 2,
                    name: "Warehouse B",
                    location: "Kandy Rd, Colombo 07",
                    sqft: "3000sqft",
                    status: "Available",
                    power: "220V",
                    security: "CCTV",
                    price: "120.00",
                    monthly_rate: "120.00",
                    image: card1,
                    isLiked: false,
                },
            ]);
            setLiked(new Set());
        } finally {
            setLoading(false);
        }
    };

    const handleWishlistToggle = async (warehouseId) => {
        try {
            const { data } = await axios.post(resolveWishlistUrl(), {
                warehouse_id: warehouseId,
            });

            if (Array.isArray(data.likedWarehouseIds)) {
                const responseSet = new Set(data.likedWarehouseIds);
                setLiked(responseSet);
                setWarehouses((prev) =>
                    prev.map((warehouse) => ({
                        ...warehouse,
                        isLiked: responseSet.has(warehouse.id),
                    }))
                );
                return;
            }

            let desiredStatus;
            setLiked((prev) => {
                const next = new Set(prev);
                const hasLike = next.has(warehouseId);
                desiredStatus =
                    typeof data.is_liked === "boolean"
                        ? data.is_liked
                        : !hasLike;

                if (desiredStatus) {
                    next.add(warehouseId);
                } else {
                    next.delete(warehouseId);
                }

                return next;
            });

            setWarehouses((prev) =>
                prev.map((warehouse) =>
                    warehouse.id === warehouseId
                        ? {
                              ...warehouse,
                              isLiked: desiredStatus,
                          }
                        : warehouse
                )
            );
        } catch (err) {
            if (err.response?.status === 401) {
                router.visit(route("signin.signin"));
                return;
            }

            console.error("Failed to update wishlist", err);
            setError("Unable to update wishlist right now. Please try again.");
        }
    };

    const handleViewMore = () => {
        router.visit(route('warehouse.list'));
    };

    const displayedWarehouses = warehouses.slice(0, displayCount);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center px-20 py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0955AC]"></div>
                <p className="mt-4 text-gray-500">Loading warehouses...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-center items-center px-20 py-10">
            <h1 className="text-[40px] font-[400] bebas-neue">
                Our{" "}
                <span className="text-[#0955AC]">Impressive Collection</span> of
                Warehouses
            </h1>
            <p className="poppins text-[#0F0F0F94] text-[15px] text-center">
                Ranging from elegant sedans to powerful vehicles, all carefully
                selected to provide our customers <br /> with the ultimate
                driving experience.
            </p>
            <div className="flex flex-col gap-10 py-10 w-full">
                {error && (
                    <div className="text-center text-red-500 mb-4">
                        {error}
                    </div>
                )}
                {/** chunk into rows of 4 */}
                {displayedWarehouses
                    .reduce((rows, item, index) => {
                        if (index % 4 === 0) rows.push([]);
                        rows[rows.length - 1].push(item);
                        return rows;
                    }, [])
                    .map((row, rowIndex) => (
                        <div
                            key={rowIndex}
                            className="flex md:flex-row flex-col gap-10 justify-center items-center"
                        >
                            {row.map((warehouse, index) => (
                                <div
                                    key={warehouse.id || index}
                                    className="bg-[#F4F3F3] w-[250px]"
                                >
                                    <img
                                        src={warehouse.image}
                                        alt={warehouse.name}
                                    />
                                    <div className="bebas-neue px-5">
                                        <h1 className="text-[20px] pt-3">
                                            {warehouse.name}
                                        </h1>
                                        <h1 className="text-[11px] poppins">
                                            {warehouse.location}
                                        </h1>

                                        <div className="flex flex-row justify-between text-[10px] poppins text-[#0000004D] font-[600] py-5 border-b-[0.5px]">
                                            <div className="flex flex-col justify-center items-center gap-2">
                                                <img src={icon1} alt="sqft" />
                                                <h1>{warehouse.sqft}</h1>
                                            </div>
                                            <div className="flex flex-col justify-center items-center gap-2">
                                                <img src={icon2} alt="status" />
                                                <h1>{warehouse.status}</h1>
                                            </div>
                                            <div className="flex flex-col justify-center items-center gap-2">
                                                <img src={icon3} alt="power" />
                                                <h1>{warehouse.power}</h1>
                                            </div>
                                            <div className="flex flex-col justify-center items-center gap-2">
                                                <img
                                                    src={icon4}
                                                    alt="security"
                                                />
                                                <h1>{warehouse.security}</h1>
                                            </div>
                                        </div>

                                        <div className="py-5 poppins px-5">
                                            <div className="flex flex-row justify-between text-[25px] font-[700]">
                                                <h1>
                                                    ${(warehouse.monthly_rate || warehouse.price)?.toLocaleString() || '0'}{" "}
                                                    <span className="text-[10px] font-[600] text-[#00000080]">
                                                        / month
                                                    </span>
                                                </h1>
                                                <button
                                                    type="button"
                                                    onClick={() => handleWishlistToggle(warehouse.id)}
                                                    className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
                                                        liked.has(warehouse.id)
                                                            ? "border-[#0955AC] bg-[#0955AC]/10 text-[#0955AC]"
                                                            : "border-transparent bg-white/70 text-[#00000080] hover:border-[#0955AC]/40 hover:text-[#0955AC]"
                                                    }`}
                                                    aria-pressed={liked.has(warehouse.id)}
                                                    aria-label={
                                                        liked.has(warehouse.id)
                                                            ? "Remove from wishlist"
                                                            : "Add to wishlist"
                                                    }
                                                >
                                                    <Heart
                                                        className="h-5 w-5"
                                                        strokeWidth={1.8}
                                                        fill={liked.has(warehouse.id) ? "currentColor" : "none"}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
            </div>
            {warehouses.length > displayCount && (
                <div>
                   <button 
                       onClick={handleViewMore}
                       className="w-[150px] h-[45px] p-4 text-[#FFFFFF] text-[16px] font-[700] figtree bg-[#0955AC] flex justify-center items-center rounded-[9px] cursor-pointer uppercase hover:bg-[#084a97] transition-colors"
                   >
                        View All ({warehouses.length})
                   </button>
                </div>
            )}
        </div>
    );
};

export default Collection;
