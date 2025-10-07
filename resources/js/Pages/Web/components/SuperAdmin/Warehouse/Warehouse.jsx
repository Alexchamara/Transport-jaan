import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { router } from "@inertiajs/react";
import axios from "axios";
import Eye from "../../../assets/superAdmin/eye.png";

const Warehouse = ({ typeFilter, warehouses: initialWarehouses = [] }) => {
    const [warehouses, setWarehouses] = useState(initialWarehouses);
    const [loading, setLoading] = useState(false);

    // State for modal visibility and selected warehouse
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);

    // Update warehouses when initialWarehouses prop changes
    useEffect(() => {
        setWarehouses(initialWarehouses);
    }, [initialWarehouses]);

    // Filter warehouses based on type
    const filteredWarehouses = warehouses.filter((warehouse) => {
        return (
            typeFilter === "" ||
            typeFilter === "all" ||
            warehouse.type === typeFilter
        );
    });

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
    const handleStatusChange = async (warehouseId, newStatus) => {
        setLoading(true);
        try {
            router.put(`/superadmin/warehouses/${warehouseId}/status`, {
                status: newStatus
            }, {
                preserveScroll: true,
                onSuccess: (page) => {
                    // Update local state
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

                    // Show success message
                    alert(`Warehouse status updated to ${newStatus} successfully!`);
                    setLoading(false);
                },
                onError: (errors) => {
                    console.error('Error updating status:', errors);
                    alert('Failed to update warehouse status. Please try again.');
                    setLoading(false);
                }
            });
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update warehouse status. Please try again.');
            setLoading(false);
        }
    };    // Function to get button text based on target status
    const getButtonText = (targetStatus) => {
        switch (targetStatus) {
            case "approved":
                return "Approve";
            case "rejected":
                return "Reject";
            case "suspended":
                return "Suspend";
            case "pending":
                return "Set Pending";
            default:
                return "Update Status";
        }
    };

    // Function to get button colors based on target status
    const getButtonColors = (status) => {
        switch (status) {
            case "approved":
                return {
                    bg: "bg-[#05C16833]",
                    hoverBg: "hover:bg-[#05C1684D]",
                    text: "text-[#14CA74]",
                };
            case "pending":
                return {
                    bg: "bg-[#FFB01633]",
                    hoverBg: "hover:bg-[#FFB0164D]",
                    text: "text-[#FDB52A]",
                };
            case "suspended":
                return {
                    bg: "bg-[#FF5A6533]",
                    hoverBg: "hover:bg-[#FF5A654D]",
                    text: "text-[#FF5A65]",
                };
            case "rejected":
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
        const allStatuses = ["approved", "rejected", "suspended", "pending"];
        return allStatuses.filter((status) => status !== currentStatus);
    };

    // Styling for category column
    const getCategoryStyles = (category) => {
        const normalizedCategory = category?.toLowerCase()?.replace(/[_\s]/g, '');
        
        switch (normalizedCategory) {
            case "coldstorage":
                return {
                    border: "border-[#26A69A80]",
                    bg: "bg-[#26A69A33]",
                    dot: "bg-[#26A69A]",
                    text: "text-[#26A69A]",
                };
            case "drystorage":
                return {
                    border: "border-[#8D6E6380]",
                    bg: "bg-[#8D6E6333]",
                    dot: "bg-[#8D6E63]",
                    text: "text-[#8D6E63]",
                };
            case "bondedwarehouse":
                return {
                    border: "border-[#AB47BC80]",
                    bg: "bg-[#AB47BC33]",
                    dot: "bg-[#AB47BC]",
                    text: "text-[#AB47BC]",
                };
            case "general":
            case "standard":
                return {
                    border: "border-[#2196F380]",
                    bg: "bg-[#2196F333]",
                    dot: "bg-[#2196F3]",
                    text: "text-[#2196F3]",
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
            case "approved":
                return {
                    border: "border-[#05C16880]",
                    bg: "bg-[#05C16833]",
                    dot: "bg-[#14CA74]",
                    text: "text-[#14CA74]",
                };
            case "pending":
                return {
                    border: "border-[#FFB01633]",
                    bg: "bg-[#FFB01633]",
                    dot: "bg-[#FDB52A]",
                    text: "text-[#FDB52A]",
                };
            case "suspended":
                return {
                    border: "border-[#FF5A6533]",
                    bg: "bg-[#FF5A6533]",
                    dot: "bg-[#FF5A65]",
                    text: "text-[#FF5A65]",
                };
            case "rejected":
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
                    {filteredWarehouses.length > 0 ? `1 - ${filteredWarehouses.length}` : '0'}{" "}
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
                            Total Area (sq ft)
                        </h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[150px]">
                            Status
                        </h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[180px]">
                            Type
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
                                    {warehouse.capacity} sq ft
                                </h1>
                            </div>
                            <div>
                                <h1 className="text-[#AEB9E1] text-[10px] font-400 w-[130px]">
                                    {warehouse.total_area} sq ft
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
                                        getCategoryStyles(warehouse.type).border
                                    } ${getCategoryStyles(warehouse.type).bg} px-[6px] py-[2px] rounded-[5px] w-[130px]`}
                                >
                                    <div
                                        className={`w-1 h-1 rounded-full ${getCategoryStyles(warehouse.type).dot}`}
                                    />
                                    <h1
                                        className={`${getCategoryStyles(warehouse.type).text} text-[10px] font-500 flex flex-row justify-center items-center`}
                                    >
                                        {warehouse.type}
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
                                <span className="font-medium text-gray-300 w-32">Capacity:</span>
                                <span className="font-light">{selectedWarehouse.capacity} sq ft</span>
                            </div>
                            <div className="flex items-center gap-2 w-full">
                                <span className="font-medium text-gray-300 w-32">Total Area:</span>
                                <span className="font-light">{selectedWarehouse.total_area} sq ft</span>
                            </div>
                            <div className="flex items-center gap-2 w-full">
                                <span className="font-medium text-gray-300 w-32">Owner:</span>
                                <span className="font-light">{selectedWarehouse.owner_name}</span>
                            </div>
                            <div className="flex items-center gap-2 w-full">
                                <span className="font-medium text-gray-300 w-32">Status:</span>
                                <span className={`font-light ${getStatusStyles(selectedWarehouse.status).text} capitalize`}>
                                    {selectedWarehouse.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 w-full">
                                <span className="font-medium text-gray-300 w-32">Type:</span>
                                <span className={`font-light ${getCategoryStyles(selectedWarehouse.type).text} capitalize`}>
                                    {selectedWarehouse.type}
                                </span>
                            </div>
                        </div>
                        <div className="mt-8 flex gap-4 justify-center flex-wrap">
                            {loading && (
                                <div className="text-white text-sm mb-2">
                                    Updating status...
                                </div>
                            )}
                            {getAvailableStatuses(selectedWarehouse.status).map((targetStatus) => (
                                <motion.button
                                    key={targetStatus}
                                    whileHover={{ scale: loading ? 1 : 1.05 }}
                                    whileTap={{ scale: loading ? 1 : 1 }}
                                    disabled={loading}
                                    className={`text-[15px] w-[100px] px-[9px] py-[6px] rounded-[5px] transition-colors duration-50 shadow-md ${
                                        getButtonColors(targetStatus).bg
                                    } ${loading ? 'opacity-50 cursor-not-allowed' : getButtonColors(targetStatus).hoverBg} ${getButtonColors(targetStatus).text}`}
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
