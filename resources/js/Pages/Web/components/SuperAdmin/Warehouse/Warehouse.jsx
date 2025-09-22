import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Eye from "../../../assets/superAdmin/eye.png";

const Warehouse = ({ typeFilter }) => {
    const [warehouses, setWarehouses] = useState([
        {
            id: 1,
            name: "North Warehouse",
            location: "New York",
            capacity: 10000,
            inventoryLevel: 75,
            status: "Active",
            category: "Cold Storage",
        },
        {
            id: 2,
            name: "South Warehouse",
            location: "Texas",
            capacity: 15000,
            inventoryLevel: 60,
            status: "Deactive",
            category: "Dry Storage",
        },
        {
            id: 3,
            name: "East Warehouse",
            location: "Florida",
            capacity: 8000,
            inventoryLevel: 85,
            status: "Suspend",
            category: "Bonded Warehouse",
        },
        {
            id: 4,
            name: "West Warehouse",
            location: "California",
            capacity: 12000,
            inventoryLevel: 50,
            status: "Active",
            category: "Cold Storage",
        },
        {
            id: 5,
            name: "Central Warehouse",
            location: "Illinois",
            capacity: 20000,
            inventoryLevel: 90,
            status: "Reject",
            category: "Dry Storage",
        },
        {
            id: 6,
            name: "Port Warehouse",
            location: "Washington",
            capacity: 9000,
            inventoryLevel: 65,
            status: "Active",
            category: "Bonded Warehouse",
        },
        {
            id: 7,
            name: "Metro Warehouse",
            location: "Georgia",
            capacity: 11000,
            inventoryLevel: 70,
            status: "Deactive",
            category: "Cold Storage",
        },
        {
            id: 8,
            name: "Coastal Warehouse",
            location: "Oregon",
            capacity: 13000,
            inventoryLevel: 55,
            status: "Suspend",
            category: "Dry Storage",
        },
        {
            id: 9,
            name: "City Warehouse",
            location: "Nevada",
            capacity: 9500,
            inventoryLevel: 80,
            status: "Reject",
            category: "Bonded Warehouse",
        },
        {
            id: 10,
            name: "Industrial Warehouse",
            location: "Ohio",
            capacity: 14000,
            inventoryLevel: 45,
            status: "Active",
            category: "Cold Storage",
        },
    ]);

    // State for modal visibility and selected warehouse
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);

    // Filter warehouses based on category
    const filteredWarehouses = warehouses.filter((warehouse) => {
        return (
            typeFilter === "" ||
            typeFilter === "all" ||
            warehouse.category === typeFilter
        );
    });

    // Debug logs
    useEffect(() => {
        console.log("Type Filter:", typeFilter);
        console.log("Filtered Warehouses:", filteredWarehouses);
        console.log("All Warehouses:", warehouses);
    }, [typeFilter, filteredWarehouses]);

    // Function to open modal and set selected warehouse
    const openModal = (warehouse) => {
        setSelectedWarehouse(warehouse);
        setIsModalOpen(true);
    };

    // Function to close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedWarehouse(null);
    };

    // Function to handle status change
    const handleStatusChange = (warehouseId, newStatus) => {
        setWarehouses((prevWarehouses) =>
            prevWarehouses.map((warehouse) =>
                warehouse.id === warehouseId
                    ? { ...warehouse, status: newStatus }
                    : warehouse
            )
        );
        // Update selectedWarehouse to reflect the new status in the modal
        setSelectedWarehouse((prev) =>
            prev && prev.id === warehouseId
                ? { ...prev, status: newStatus }
                : prev
        );
    };

    // Function to get button text based on target status
    const getButtonText = (targetStatus) => {
        switch (targetStatus) {
            case "Active":
                return "Activate";
            case "Deactive":
                return "Deactivate";
            case "Suspend":
                return "Suspend";
            case "Reject":
                return "Reject";
            default:
                return "Update Status";
        }
    };

    // Function to get button colors based on target status
    const getButtonColors = (status) => {
        switch (status) {
            case "Active":
                return {
                    bg: "bg-[#05C16833]",
                    hoverBg: "hover:bg-[#05C1684D]",
                    text: "text-[#14CA74]",
                };
            case "Deactive":
                return {
                    bg: "bg-[#FFB01633]",
                    hoverBg: "hover:bg-[#FFB0164D]",
                    text: "text-[#FDB52A]",
                };
            case "Suspend":
                return {
                    bg: "bg-[#FF5A6533]",
                    hoverBg: "hover:bg-[#FF5A654D]",
                    text: "text-[#FF5A65]",
                };
            case "Reject":
                return {
                    bg: "bg-[#FF572233]",
                    hoverBg: "hover:bg-[#FF57224D]",
                    text: "text-[#FF5722]",
                };
            default:
                return {
                    bg: "bg-[#0955AC]",
                    hoverBg: "hover:bg-[#074a92]",
                    text: "text-white",
                };
        }
    };

    // Function to get available status options (excluding current status)
    const getAvailableStatuses = (currentStatus) => {
        const allStatuses = ["Active", "Deactive", "Suspend", "Reject"];
        return allStatuses.filter((status) => status !== currentStatus);
    };

    // Styling for category column
    const getCategoryStyles = (category) => {
        switch (category) {
            case "Cold Storage":
                return {
                    border: "border-[#26A69A80]",
                    bg: "bg-[#26A69A33]",
                    dot: "bg-[#26A69A]",
                    text: "text-[#26A69A]",
                };
            case "Dry Storage":
                return {
                    border: "border-[#8D6E6380]",
                    bg: "bg-[#8D6E6333]",
                    dot: "bg-[#8D6E63]",
                    text: "text-[#8D6E63]",
                };
            case "Bonded Warehouse":
                return {
                    border: "border-[#AB47BC80]",
                    bg: "bg-[#AB47BC33]",
                    dot: "bg-[#AB47BC]",
                    text: "text-[#AB47BC]",
                };
            default:
                return {
                    border: "border-[#343B4F]",
                    bg: "bg-[#0B1739]",
                    dot: "bg-[#AEB9E1]",
                    text: "text-[#AEB9E1]",
                };
        }
    };

    // Styling for status column
    const getStatusStyles = (status) => {
        switch (status) {
            case "Active":
                return {
                    border: "border-[#05C16880]",
                    bg: "bg-[#05C16833]",
                    dot: "bg-[#14CA74]",
                    text: "text-[#14CA74]",
                };
            case "Deactive":
                return {
                    border: "border-[#FFB01633]",
                    bg: "bg-[#FFB01633]",
                    dot: "bg-[#FDB52A]",
                    text: "text-[#FDB52A]",
                };
            case "Suspend":
                return {
                    border: "border-[#FF5A6533]",
                    bg: "bg-[#FF5A6533]",
                    dot: "bg-[#FF5A65]",
                    text: "text-[#FF5A65]",
                };
            case "Reject":
                return {
                    border: "border-[#FF572280]",
                    bg: "bg-[#FF572233]",
                    dot: "bg-[#FF5722]",
                    text: "text-[#FF5722]",
                };
            default:
                return {
                    border: "border-[#343B4F]",
                    bg: "bg-[#0B1739]",
                    dot: "bg-[#AEB9E1]",
                    text: "text-[#AEB9E1]",
                };
        }
    };

    return (
        <div className="poppins flex flex-col items-center min-h-screen w-full gap-1">
            <div className="w-[962px] flex flex-row justify-between items-center text-white text-[16px] font-500 pt-6">
                <h1>Warehouses</h1>
                <h1 className="text-[#0955AC] text-[14px] font-400">
                    1 - {filteredWarehouses.length}{" "}
                    <span className="text-[#AEB9E1]">
                        of {warehouses.length}
                    </span>
                </h1>
            </div>
            <div className="w-full">
                <div className="h-[1px] w-full bg-[#343B4F] mt-2"></div>
            </div>

            {/* Header */}
            <div className="flex flex-row justify-center items-center w-full h-[61px]">
                <div className="flex flex-row justify-start items-start w-full px-[35px]">
                    <div className="flex flex-row justify-start items-center gap-4 w-[180px]">
                        <h1 className="text-white text-[10px] font-400">
                            Warehouse Name
                        </h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[150px]">
                            Location
                        </h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[130px]">
                            Capacity (sq ft)
                        </h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[130px]">
                            Inventory Level (%)
                        </h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[150px]">
                            Status
                        </h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[180px]">
                            Category
                        </h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400"></h1>
                    </div>
                </div>
            </div>

            {/* Rows */}
            {filteredWarehouses.length > 0 ? (
                filteredWarehouses.map((warehouse, index) => (
                    <div
                        key={index}
                        className="flex flex-row justify-center items-center w-full h-[61px]"
                    >
                        <div className="flex flex-row justify-start items-start w-full px-[35px]">
                            <div>
                                <h1 className="text-[#AEB9E1] text-[10px] font-400 w-[180px]">
                                    {warehouse.name}
                                </h1>
                            </div>
                            <div>
                                <h1 className="text-[#AEB9E1] text-[10px] font-400 w-[150px]">
                                    {warehouse.location}
                                </h1>
                            </div>
                            <div>
                                <h1 className="text-[#AEB9E1] text-[10px] font-400 w-[130px]">
                                    {warehouse.capacity}
                                </h1>
                            </div>
                            <div>
                                <h1 className="text-[#AEB9E1] text-[10px] font-400 w-[130px]">
                                    {warehouse.inventoryLevel}
                                </h1>
                            </div>
                            <div className="w-[150px]">
                                <div
                                    className={`flex flex-row justify-center items-center gap-1 border ${
                                        getStatusStyles(warehouse.status).border
                                    } ${getStatusStyles(warehouse.status).bg} px-[6px] py-[2px] rounded-[5px] w-[100px]`}
                                >
                                    <div
                                        className={`w-1 h-1 rounded-full ${getStatusStyles(warehouse.status).dot}`}
                                    />
                                    <h1
                                        className={`${getStatusStyles(warehouse.status).text} text-[10px] font-500 flex flex-row justify-center items-center`}
                                    >
                                        {warehouse.status}
                                    </h1>
                                </div>
                            </div>
                            <div className="w-[180px]">
                                <div
                                    className={`flex flex-row justify-center items-center gap-1 border ${
                                        getCategoryStyles(warehouse.category).border
                                    } ${getCategoryStyles(warehouse.category).bg} px-[6px] py-[2px] rounded-[5px] w-[130px]`}
                                >
                                    <div
                                        className={`w-1 h-1 rounded-full ${getCategoryStyles(warehouse.category).dot}`}
                                    />
                                    <h1
                                        className={`${getCategoryStyles(warehouse.category).text} text-[10px] font-500 flex flex-row justify-center items-center`}
                                    >
                                        {warehouse.category}
                                    </h1>
                                </div>
                            </div>
                            <div className="w-[20px]">
                                <button onClick={() => openModal(warehouse)}>
                                    <img src={Eye} alt="View" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-[#AEB9E1] text-[12px] font-400 w-full text-center py-4">
                    No warehouses match the selected filter.
                </div>
            )}

            {/* Modal */}
            {isModalOpen && selectedWarehouse && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="fixed inset-0 bg-opacity-5 backdrop-blur-lg flex justify-center items-center z-50"
                >
                    <motion.div
                        initial={{ scale: 0.8, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ duration: 0.1, ease: "easeOut" }}
                        className="bg-gradient-to-br from-[#1A2233] to-[#2A344A] p-8 rounded-2xl text-white w-[600px] max-w-[90vw] max-h-[80vh] overflow-y-auto shadow-2xl"
                    >
                        <h2 className="text-2xl font-semibold mb-6 text-center tracking-wide">
                            Warehouse Details
                        </h2>
                        <div className="flex flex-col items-start gap-4 px-4">
                            <div className="flex items-center gap-2 w-full">
                                <span className="font-medium text-gray-300 w-32">ID:</span>
                                <span className="font-light">{selectedWarehouse.id}</span>
                            </div>
                            <div className="flex items-center gap-2 w-full">
                                <span className="font-medium text-gray-300 w-32">Name:</span>
                                <span className="font-light">{selectedWarehouse.name}</span>
                            </div>
                            <div className="flex items-center gap-2 w-full">
                                <span className="font-medium text-gray-300 w-32">Location:</span>
                                <span className="font-light">{selectedWarehouse.location}</span>
                            </div>
                            <div className="flex items-center gap-2 w-full">
                                <span className="font-medium text-gray-300 w-32">Capacity (sq ft):</span>
                                <span className="font-light">{selectedWarehouse.capacity}</span>
                            </div>
                            <div className="flex items-center gap-2 w-full">
                                <span className="font-medium text-gray-300 w-32">Inventory Level (%):</span>
                                <span className="font-light">{selectedWarehouse.inventoryLevel}</span>
                            </div>
                            <div className="flex items-center gap-2 w-full">
                                <span className="font-medium text-gray-300 w-32">Status:</span>
                                <span className={`font-light ${getStatusStyles(selectedWarehouse.status).text}`}>
                                    {selectedWarehouse.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 w-full">
                                <span className="font-medium text-gray-300 w-32">Category:</span>
                                <span className={`font-light ${getCategoryStyles(selectedWarehouse.category).text}`}>
                                    {selectedWarehouse.category}
                                </span>
                            </div>
                        </div>
                        <div className="mt-8 flex gap-4 justify-center flex-wrap">
                            {getAvailableStatuses(selectedWarehouse.status).map((targetStatus) => (
                                <motion.button
                                    key={targetStatus}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 1 }}
                                    className={`text-[15px] w-[100px] px-[9px] py-[6px] rounded-[5px] transition-colors duration-50 shadow-md ${
                                        getButtonColors(targetStatus).bg
                                    } ${getButtonColors(targetStatus).hoverBg} ${getButtonColors(targetStatus).text}`}
                                    onClick={() => handleStatusChange(selectedWarehouse.id, targetStatus)}
                                >
                                    {getButtonText(targetStatus)}
                                </motion.button>
                            ))}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 1 }}
                                className="bg-[#0955AC] text-[15px] w-[100px] px-[9px] py-[6px] rounded-[5px] hover:bg-[#074a92] transition-colors duration-50 shadow-md text-white"
                                onClick={closeModal}
                            >
                                Close
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default Warehouse;