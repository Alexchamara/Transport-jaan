import React, { useState } from "react";
import { motion } from 'framer-motion';
import Eye from "../../../assets/superAdmin/eye.png";
import { Link } from "@inertiajs/react";

// Export filter options for use in RightSide.jsx
export const statusFilterOptions = [
    { value: "all", label: "All Statuses" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
];

export const approvalFilterOptions = [
    { value: "all", label: "All Approvals" },
    { value: "Approved", label: "Approved" },
    { value: "Pending", label: "Pending" },
    { value: "Canceled", label: "Canceled" },
];

const Air = ({ statusFilter, approvalFilter }) => {
    const [airVehicles, setAirVehicles] = useState([
        {
            id: 1,
            name: "Boeing 747",
            model: "Boeing",
            number: "AIR-001",
            price: 15000,
            status: "Active",
            approval: "Approved",
        },
        {
            id: 2,
            name: "Airbus A320",
            model: "Airbus",
            number: "AIR-002",
            price: 12000,
            status: "Inactive",
            approval: "Pending",
        },
        {
            id: 3,
            name: "Cessna 172",
            model: "Cessna",
            number: "AIR-003",
            price: 5000,
            status: "Active",
            approval: "Canceled",
        },
        {
            id: 4,
            name: "Gulfstream G650",
            model: "Gulfstream",
            number: "AIR-004",
            price: 25000,
            status: "Inactive",
            approval: "Approved",
        },
        {
            id: 5,
            name: "Bombardier CRJ",
            model: "Bombardier",
            number: "AIR-005",
            price: 10000,
            status: "Active",
            approval: "Pending",
        },
        {
            id: 6,
            name: "Embraer E190",
            model: "Embraer",
            number: "AIR-006",
            price: 9000,
            status: "Inactive",
            approval: "Approved",
        },
        {
            id: 7,
            name: "Piper PA-28",
            model: "Piper",
            number: "AIR-007",
            price: 4000,
            status: "Active",
            approval: "Approved",
        },
        {
            id: 8,
            name: "Antonov An-225",
            model: "Antonov",
            number: "AIR-008",
            price: 30000,
            status: "Inactive",
            approval: "Canceled",
        },
        {
            id: 9,
            name: "Dassault Falcon 7X",
            model: "Dassault",
            number: "AIR-009",
            price: 22000,
            status: "Active",
            approval: "Pending",
        },
        {
            id: 10,
            name: "Beechcraft King Air",
            model: "Beechcraft",
            number: "AIR-010",
            price: 8000,
            status: "Inactive",
            approval: "Approved",
        },
    ]);

    // State for modal visibility and selected vehicle
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

    // Filter vehicles based on props from RightSide.jsx
    const filteredVehicles = airVehicles.filter((vehicle) => {
        const matchesStatus =
            statusFilter === "" ||
            statusFilter === "all" ||
            vehicle.status === statusFilter;
        const matchesApproval =
            approvalFilter === "" ||
            approvalFilter === "all" ||
            vehicle.approval === approvalFilter;
        return matchesStatus && matchesApproval;
    });

    const getStatusStyles = (status) => {
        switch (status) {
            case "Active":
                return {
                    border: "border-[#05C16880]",
                    bg: "bg-[#05C16833]",
                    dot: "bg-[#14CA74]",
                    text: "text-[#14CA74]",
                };
            case "Inactive":
                return {
                    border: "border-[#FF5A6533]",
                    bg: "bg-[#FF5A6533]",
                    dot: "bg-[#FF5A65]",
                    text: "text-[#FF5A65]",
                };
            default:
                return {
                    border: "border-[#FFB01633]",
                    bg: "bg-[#FFB01633]",
                    dot: "bg-[#FDB52A]",
                    text: "text-[#FDB52A]",
                };
        }
    };

    const getApprovalStyles = (approval) => {
        switch (approval) {
            case "Approved":
                return {
                    border: "border-[#05C16880]",
                    bg: "bg-[#05C16833]",
                    dot: "bg-[#14CA74]",
                    text: "text-green-400",
                };
            case "Pending":
                return {
                    border: "border-[#FFB01633]",
                    bg: "bg-[#FFB01633]",
                    dot: "bg-[#FDB52A]",
                    text: "text-[#FDB52A]",
                };
            case "Canceled":
                return {
                    border: "border-[#FF5A6533]",
                    bg: "bg-[#FF5A6533]",
                    dot: "bg-[#FF5A65]",
                    text: "text-[#FF5A65]",
                };
            default:
                return {
                    border: "border-[#FFB01633]",
                    bg: "bg-[#FFB01633]",
                    dot: "bg-[#FDB52A]",
                    text: "text-[#FDB52A]",
                };
        }
    };

    // Function to open modal and set selected vehicle
    const openModal = (vehicle) => {
        setSelectedVehicle(vehicle);
        setIsModalOpen(true);
    };

    // Function to close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedVehicle(null);
    };

    // Function to handle approval status changes
    const handleApprovalStatus = (vehicleId, newApproval, newStatus) => {
        setAirVehicles((prevVehicles) =>
            prevVehicles.map((vehicle) =>
                vehicle.id === vehicleId
                    ? { ...vehicle, approval: newApproval, status: newStatus }
                    : vehicle
            )
        );
        setSelectedVehicle((prev) =>
            prev.id === vehicleId
                ? { ...prev, approval: newApproval, status: newStatus }
                : prev
        );
    };

    // Function to determine action based on current approval status
    const handleAction = (vehicleId, currentApproval) => {
        switch (currentApproval) {
            case "Pending":
                handleApprovalStatus(vehicleId, "Approved", "Active");
                break;
            case "Approved":
                handleApprovalStatus(vehicleId, "Pending", "Inactive");
                break;
            case "Canceled":
                handleApprovalStatus(vehicleId, "Pending", "Inactive");
                break;
            default:
                break;
        }
    };

    return (
        <div className="poppins flex flex-col items-center min-h-screen w-full gap-1">
            <div className="w-[962px] flex flex-row justify-between items-center text-white text-[16px] font-500 pt-6">
                <h1>Air vehicles</h1>
                <h1 className="text-[#0955AC] text-[14px] font-400">
                    1 - {filteredVehicles.length}{" "}
                    <span className="text-[#AEB9E1]">
                        of {airVehicles.length}
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
                            Vehicle name
                        </h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[150px]">
                            Model
                        </h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[150px]">
                            Number
                        </h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[150px]">
                            Rental price / day
                        </h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[150px]">
                            Status
                        </h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[150px]">
                            Approval status
                        </h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400"></h1>
                    </div>
                </div>
            </div>

            {/* Rows */}
            {filteredVehicles.map((vehicle, index) => (
                <div
                    key={index}
                    className="flex flex-row justify-center items-center w-full h-[61px]"
                >
                    <div className="flex flex-row justify-start items-start w-full px-[35px]">
                        <div>
                            <h1 className="text-[#AEB9E1] text-[10px] font-400 w-[180px]">
                                {vehicle.name}
                            </h1>
                        </div>
                        <div>
                            <h1 className="text-[#AEB9E1] text-[10px] font-400 w-[150px]">
                                {vehicle.model}
                            </h1>
                        </div>
                        <div>
                            <h1 className="text-[#AEB9E1] text-[10px] font-400 w-[150px]">
                                {vehicle.number}
                            </h1>
                        </div>
                        <div>
                            <h1 className="text-[#AEB9E1] text-[10px] font-400 w-[150px]">
                                ${vehicle.price}
                            </h1>
                        </div>
                        <div className="w-[150px]">
                            <div
                                className={`flex flex-row justify-center items-center gap-1 border ${
                                    getStatusStyles(vehicle.status).border
                                } ${
                                    getStatusStyles(vehicle.status).bg
                                } px-[6px] py-[2px] rounded-[5px] w-[70px]`}
                            >
                                <div
                                    className={`w-1 h-1 rounded-full ${
                                        getStatusStyles(vehicle.status).dot
                                    }`}
                                />
                                <h1
                                    className={`${
                                        getStatusStyles(vehicle.status).text
                                    } text-[10px] font-500 flex flex-row justify-center items-center`}
                                >
                                    {vehicle.status}
                                </h1>
                            </div>
                        </div>
                        <div className="w-[150px]">
                            <div
                                className={`flex flex-row justify-center items-center gap-1 border ${
                                    getApprovalStyles(vehicle.approval).border
                                } ${
                                    getApprovalStyles(vehicle.approval).bg
                                } px-[6px] py-[2px] rounded-[5px] w-[70px]`}
                            >
                                <div
                                    className={`w-1 h-1 rounded-full ${
                                        getApprovalStyles(vehicle.approval).dot
                                    }`}
                                />
                                <h1
                                    className={`${
                                        getApprovalStyles(vehicle.approval).text
                                    } text-[10px] font-500 flex flex-row justify-center items-center`}
                                >
                                    {vehicle.approval}
                                </h1>
                            </div>
                        </div>
                        <div className="w-[20px]">
                            <button onClick={() => openModal(vehicle)}>
                                <img src={Eye} alt="View" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Modal */}
            {isModalOpen && selectedVehicle && (
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
                        transition={{ duration: 0.1, ease: 'easeOut' }}
                        className="bg-gradient-to-br from-[#1A2233] to-[#2A344A] p-8 rounded-2xl text-white w-[600px] max-w-[90vw] max-h-[80vh] overflow-y-auto shadow-2xl"
                    >
                        <h2 className="text-2xl font-semibold mb-6 text-center tracking-wide">Vehicle Details</h2>
                        <div className="flex flex-col items-start gap-4 px-4">
                            <div className="flex items-center gap-2 w-full">
                                <span className="font-medium text-gray-300 w-32">ID:</span>
                                <span className="font-light">{selectedVehicle.id}</span>
                            </div>
                            <div className="flex items-center gap-2 w-full">
                                <span className="font-medium text-gray-300 w-32">Name:</span>
                                <span className="font-light">{selectedVehicle.name}</span>
                            </div>
                            <div className="flex items-center gap-2 w-full">
                                <span className="font-medium text-gray-300 w-32">Model:</span>
                                <span className="font-light">{selectedVehicle.model}</span>
                            </div>
                            <div className="flex items-center gap-2 w-full">
                                <span className="font-medium text-gray-300 w-32">Number:</span>
                                <span className="font-light">{selectedVehicle.number}</span>
                            </div>
                            <div className="flex items-center gap-2 w-full">
                                <span className="font-medium text-gray-300 w-32">Rental Price / Day:</span>
                                <span className="font-light">${selectedVehicle.price}</span>
                            </div>
                            <div className="flex items-center gap-2 w-full">
                                <span className="font-medium text-gray-300 w-32">Status:</span>
                                <span className={`font-light ${getStatusStyles(selectedVehicle.status).text}`}>
                                    {selectedVehicle.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 w-full">
                                <span className="font-medium text-gray-300 w-32">Approval:</span>
                                <span className={`font-light ${getApprovalStyles(selectedVehicle.approval).text}`}>
                                    {selectedVehicle.approval}
                                </span>
                            </div>
                        </div>
                        <div className="mt-8 flex gap-4 justify-center">
                            {selectedVehicle.approval === "Pending" && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 1 }}
                                    className="bg-green-600 border border-[#05C16880] text-[15px] w-[130px] px-[9px] py-[6px] rounded-[5px] hover:bg-green-700 transition-colors duration-50 shadow-md"
                                    onClick={() => handleAction(selectedVehicle.id, "Pending")}
                                >
                                    Activate
                                </motion.button>
                            )}
                            {selectedVehicle.approval === "Approved" && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 1 }}
                                    className="bg-red-600 text-[15px] w-[130px] px-[9px] py-[6px] rounded-[5px] hover:bg-red-700 transition-colors duration-50 shadow-md"
                                    onClick={() => handleAction(selectedVehicle.id, "Approved")}
                                >
                                    Deactivate
                                </motion.button>
                            )}
                            {selectedVehicle.approval === "Canceled" && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 1 }}
                                    className="bg-[#FDB52A] text-[15px] w-[130px] px-[9px] py-[6px] rounded-[5px] hover:bg-[#E0A01F] transition-colors duration-50 shadow-md"
                                    onClick={() => handleAction(selectedVehicle.id, "Canceled")}
                                >
                                    Reinstate
                                </motion.button>
                            )}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 1 }}
                                className="bg-[#0955AC] text-[15px] w-[130px] px-[9px] py-[6px] rounded-[5px] hover:bg-[#074a92] transition-colors duration-50 shadow-md"
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

export default Air;