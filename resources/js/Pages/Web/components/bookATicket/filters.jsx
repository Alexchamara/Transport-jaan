import React, { useEffect, useState } from "react";
import { router } from "@inertiajs/react";

const FilterSidebar = ({ searchParams }) => {
    const [selectedDepartureTime, setSelectedDepartureTime] = useState("");
    const [selectedTrainType, setSelectedTrainType] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedPrice, setSelectedPrice] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (searchParams?.departureTime) {
            setSelectedDepartureTime(searchParams.departureTime.toLowerCase());
        }
        if (searchParams?.trainType) {
            setSelectedTrainType(searchParams.trainType.toLowerCase());
        }
        if (searchParams?.class) {
            setSelectedClass(searchParams.class.toLowerCase());
        }
        if (searchParams?.price) {
            setSelectedPrice(searchParams.price.toLowerCase());
        }
    }, [searchParams]);

    const handleDepartureTimeChange = (departureTime) => {
        const newDepartureTime =
            selectedDepartureTime === departureTime ? "" : departureTime;
        setSelectedDepartureTime(newDepartureTime);

        router.get(
            "/",
            {
                ...searchParams,
                departureTime: newDepartureTime,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const handleTrainTypeChange = (trainType) => {
        const newTrainType = selectedTrainType === trainType ? "" : trainType;
        setSelectedTrainType(newTrainType);

        router.get(
            "/",
            {
                ...searchParams,
                trainType: newTrainType,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const handleClassChange = (classType) => {
        const newClass = selectedClass === classType ? "" : classType;
        setSelectedClass(newClass);

        router.get(
            "/",
            {
                ...searchParams,
                class: newClass,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const handlePriceChange = (price) => {
        const newPrice = selectedPrice === price ? "" : price;
        setSelectedPrice(newPrice);

        router.get(
            "/",
            {
                ...searchParams,
                price: newPrice,
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

    const departureTime = [
        { id: "morning", label: "Morning", count: 23 },
        { id: "afternoon", label: "Afternoon", count: 23 },
        { id: "evening", label: "Evening", count: 23 },
        { id: "night", label: "Night", count: 23 },
    ];

    const trainType = [
        { id: "intercity", label: "Intercity", count: 15 },
        { id: "express", label: "Express", count: 12 },
        { id: "AC", label: "AC", count: 18 },
    ];

    const classOptions = [
        { id: "economy", label: "Economy", count: 23 },
        { id: "firstClass", label: "1st Class", count: 23 },
        { id: "secondClass", label: "2nd Class", count: 23 },
    ];

    const priceOptions = [
        { id: "0-50", label: "US$ 0 - US$ 50", count: 23 },
        { id: "50-100", label: "US$ 50 - US$ 100", count: 23 },
        { id: "100-150", label: "US$ 100 - US$ 150", count: 23 },
        { id: "150-200", label: "US$ 150 - US$ 200", count: 23 },
        { id: "200plus", label: "US$ 200+", count: 23 },
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
          h-full md:h-full
          w-[283px] md:w-[283px]
          transform transition-transform duration-300 ease-in-out
          z-40 mb-10
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
                    <h3 className="bebas-neue text-[20px] text-[#0000008C] mb-2.5 uppercase">
                        Departure time
                    </h3>
                    {departureTime.map((type) => (
                        <div
                            key={type.id}
                            className="mb-1.5 flex justify-between items-center"
                        >
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={type.id}
                                    name="departureTime"
                                    value={type.id}
                                    className="mr-1.5"
                                    checked={selectedDepartureTime === type.id}
                                    onChange={() =>
                                        handleDepartureTimeChange(type.id)
                                    }
                                />
                                <label htmlFor={type.id}>{type.label}</label>
                            </div>
                            <span>({type.count})</span>
                        </div>
                    ))}
                </div>

                <div className="filter-section mb-15 mt-5">
                    <h3 className="bebas-neue text-[20px] text-[#0000008C] mb-2.5 uppercase">
                        Train type
                    </h3>
                    {trainType.map((type) => (
                        <div
                            key={type.id}
                            className="mb-1.5 flex justify-between items-center"
                        >
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={type.id}
                                    name="trainType"
                                    value={type.id}
                                    className="mr-1.5"
                                    checked={selectedTrainType === type.id}
                                    onChange={() =>
                                        handleTrainTypeChange(type.id)
                                    }
                                />
                                <label htmlFor={type.id}>{type.label}</label>
                            </div>
                            <span>({type.count})</span>
                        </div>
                    ))}
                </div>

                <div className="filter-section mb-15 mt-5">
                    <h3 className="bebas-neue text-[20px] text-[#0000008C] mb-2.5 pb-2 border-b border-[#00000026] uppercase">
                        Class
                    </h3>
                    {classOptions.map((option) => (
                        <div
                            key={option.id}
                            className="mb-1.5 flex justify-between items-center"
                        >
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={option.id}
                                    name="class"
                                    value={option.id}
                                    className="mr-1.5"
                                    checked={selectedClass === option.id}
                                    onChange={() =>
                                        handleClassChange(option.id)
                                    }
                                />
                                <label htmlFor={option.id}>
                                    {option.label}
                                </label>
                            </div>
                            <span>({option.count})</span>
                        </div>
                    ))}
                </div>

                <div className="filter-section mb-15 mt-5">
                    <h3 className="bebas-neue text-[20px] text-[#0000008C] mb-2.5 pb-2 border-b border-[#00000026] uppercase">
                        price per day
                    </h3>
                    {priceOptions.map((option) => (
                        <div
                            key={option.id}
                            className="mb-1.5 flex justify-between items-center"
                        >
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={option.id}
                                    name="price"
                                    value={option.id}
                                    className="mr-1.5"
                                    checked={selectedPrice === option.id}
                                    onChange={() =>
                                        handlePriceChange(option.id)
                                    }
                                />
                                <label htmlFor={option.id}>
                                    {option.label}
                                </label>
                            </div>
                            <span>({option.count})</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default FilterSidebar;
