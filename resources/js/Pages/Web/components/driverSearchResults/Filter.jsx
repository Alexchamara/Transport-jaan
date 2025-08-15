import React, { useEffect, useState } from "react";
import { router } from "@inertiajs/react";

const Filter = ({ searchParams }) => {
    const [selectedBodyType, setSelectedBodyType] = useState("");
    const [selectedBrand, setSelectedBrand] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (searchParams?.bodyType) {
            setSelectedBodyType(searchParams.bodyType.toLowerCase());
        }
        if (searchParams?.brand) {
            setSelectedBrand(searchParams.brand.toLowerCase());
        }
    }, [searchParams]);

    const handleBodyTypeChange = (bodyType) => {
        const newBodyType = selectedBodyType === bodyType ? "" : bodyType;
        setSelectedBodyType(newBodyType);

        router.get(
            "/vehicleList",
            {
                ...searchParams,
                bodyType: newBodyType,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const handleBrandChange = (brand) => {
        const newBrand = selectedBrand === brand ? "" : brand;
        setSelectedBrand(newBrand);

        router.get(
            "/vehicleList",
            {
                ...searchParams,
                brand: newBrand,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const vehicleTypes = [
        { id: "land", label: "Land", count: 23 },
        { id: "air", label: "Air", count: 23 },
    ];

    const tripType = [
        { id: "oneWay", label: "1 Way", count: 15 },
        { id: "roundTrip", label: "Round Trip", count: 12 },
        { id: "hourly", label: "Hourly", count: 18 },
    ];

    const priceRanges = [
        { id: "price0_50", label: "US$ 0 - US$ 50", value: "0-50", count: 23 },
        { id: "price50_100", label: "US$ 50 - US$ 100", value: "50-100", count: 23 },
        { id: "price100_150", label: "US$ 100 - US$ 150", value: "100-150", count: 23 },
        { id: "price150_200", label: "US$ 150 - US$ 200", value: "150-200", count: 23 },
        { id: "price200plus", label: "US$ 200+", value: "200plus", count: 23 },
    ];

    const ratings = [
        { id: "limited", label: "4 Stars & Up", value: "limited", count: 23 },
        { id: "unlimited3", label: "3 Stars & Up", value: "unlimited", count: 23 },
        { id: "unlimitedAll", label: "All Ratings", value: "unlimited", count: 23 },
    ];

    return (
        <>
            {/* Mobile Filter Button */}
            <button
                onClick={toggleSidebar}
                className="md:hidden fixed bottom-4 right-4 z-40 bg-[#0955AC] text-white px-4 py-2 rounded-full shadow-lg"
            >
                {isOpen ? "Close Filters" : "Show Filters"}
            </button>

            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <div
                className={`poppins text-[#0F0F0F80] text-[12px] font-[400] filter-sidebar bg-[#F4F3F3] rounded-[10px] p-5
          fixed md:static
          top-0 left-0
          h-full 
          w-[283px] md:w-[283px]
          transform transition-transform duration-300 ease-in-out
          z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ml-0 md:ml-10 mt-0 md:mt-10`}
            >
                {/* Close button for mobile */}
                <button
                    onClick={toggleSidebar}
                    className="md:hidden absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                >
                    ×
                </button>

                <div className="filter-section mb-15 mt-5">
                    <h3 className="bebas-neue text-[20px] text-[#0000008C] mb-2.5 pb-2 border-b border-[#00000026]">
                        VEHICLE TYPE
                    </h3>
                    {vehicleTypes.map((type) => (
                        <div
                            key={type.id}
                            className="mb-1.5 flex justify-between items-center"
                        >
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={type.id}
                                    name="vehicleType"
                                    value={type.id}
                                    className="mr-1.5"
                                    checked={selectedBodyType === type.id}
                                    onChange={() =>
                                        handleBodyTypeChange(type.id)
                                    }
                                />
                                <label htmlFor={type.id}>{type.label}</label>
                            </div>
                            <span>({type.count})</span>
                        </div>
                    ))}
                </div>

                <div className="filter-section mb-15 mt-5">
                    <h3 className="bebas-neue text-[20px] text-[#0000008C] mb-2.5 pb-2 border-b border-[#00000026]">
                        trip type
                    </h3>
                    {tripType.map((brand) => (
                        <div
                            key={brand.id}
                            className="mb-1.5 flex justify-between items-center"
                        >
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={brand.id}
                                    name="brand"
                                    value={brand.id}
                                    className="mr-1.5"
                                    checked={selectedBrand === brand.id}
                                    onChange={() => handleBrandChange(brand.id)}
                                />
                                <label htmlFor={brand.id}>{brand.label}</label>
                            </div>
                            <span>({brand.count})</span>
                        </div>
                    ))}
                </div>

                <div className="filter-section mb-15 mt-5">
                    <h3 className="bebas-neue text-[20px] text-[#0000008C] mb-2.5 pb-2 border-b border-[#00000026]">
                        Price per day
                    </h3>
                    {priceRanges.map((price) => (
                        <div key={price.id} className="mb-1.5 flex justify-between items-center">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={price.id}
                                    name="price"
                                    value={price.value}
                                    className="mr-1.5"
                                />
                                <label htmlFor={price.id}>{price.label}</label>
                            </div>
                            <span>({price.count})</span>
                        </div>
                    ))}
                </div>

                <div className="filter-section mb-15 mt-5">
                    <h3 className="bebas-neue text-[20px] text-[#0000008C] mb-2.5 pb-2 border-b border-[#00000026]">
                        Ratings
                    </h3>
                    {ratings.map((rating) => (
                        <div key={rating.id} className="mb-1.5 flex justify-between items-center">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={rating.id}
                                    name="mileage"
                                    value={rating.value}
                                    className="mr-1.5"
                                />
                                <label htmlFor={rating.id}>{rating.label}</label>
                            </div>
                            <span>({rating.count})</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Filter;
