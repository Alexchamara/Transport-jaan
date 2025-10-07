import React, { useState } from "react";
import { motion } from "framer-motion";
import { router } from "@inertiajs/react";
import Eye from "../../../assets/superAdmin/eye.png";

// User Details Modal with Status Management

// User Details Modal
const UserDetailsModal = ({ user, onClose }) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (newStatus) => {
        setIsUpdating(true);

        router.post(`/superadmin/users/${user.id}/status`,
            { status: newStatus },
            {
                onSuccess: () => {
                    router.reload();
                    onClose();
                },
                onError: (errors) => {
                    console.error('Status update failed:', errors);
                },
                onFinish: () => setIsUpdating(false)
            }
        );
    };

    const getStatusActionButtons = () => {
        const buttons = [];

        switch (user.status) {
            case 'verified':
                buttons.push(
                    <motion.button
                        key="block"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 1 }}
                        onClick={() => handleStatusChange('blocked')}
                        disabled={isUpdating}
                        className="bg-red-600 text-[15px] w-[130px] px-[9px] py-[6px] rounded-[5px] hover:bg-red-700 transition-colors duration-50 shadow-md disabled:opacity-50"
                    >
                        {isUpdating ? 'Updating...' : 'Block User'}
                    </motion.button>
                );
                break;

            case 'blocked':
                buttons.push(
                    <motion.button
                        key="unblock"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 1 }}
                        onClick={() => handleStatusChange('verified')}
                        disabled={isUpdating}
                        className="bg-green-600 border border-[#05C16880] text-[15px] w-[130px] px-[9px] py-[6px] rounded-[5px] hover:bg-green-700 transition-colors duration-50 shadow-md disabled:opacity-50"
                    >
                        {isUpdating ? 'Updating...' : 'Unblock User'}
                    </motion.button>
                );
                break;

            case 'unverified':
                buttons.push(
                    <motion.button
                        key="verify"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 1 }}
                        onClick={() => handleStatusChange('verified')}
                        disabled={isUpdating}
                        className="bg-green-600 border border-[#05C16880] text-[15px] w-[130px] px-[9px] py-[6px] rounded-[5px] hover:bg-green-700 transition-colors duration-50 shadow-md disabled:opacity-50"
                    >
                        {isUpdating ? 'Updating...' : 'Verify User'}
                    </motion.button>,
                    <motion.button
                        key="reject"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 1 }}
                        onClick={() => handleStatusChange('rejected')}
                        disabled={isUpdating}
                        className="bg-red-600 text-[15px] w-[130px] px-[9px] py-[6px] rounded-[5px] hover:bg-red-700 transition-colors duration-50 shadow-md disabled:opacity-50"
                    >
                        {isUpdating ? 'Updating...' : 'Reject User'}
                    </motion.button>
                );
                break;

            case 'rejected':
                buttons.push(
                    <motion.button
                        key="verify"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 1 }}
                        onClick={() => handleStatusChange('verified')}
                        disabled={isUpdating}
                        className="bg-[#FDB52A] text-[15px] w-[130px] px-[9px] py-[6px] rounded-[5px] hover:bg-[#E0A01F] transition-colors duration-50 shadow-md disabled:opacity-50"
                    >
                        {isUpdating ? 'Updating...' : 'Reinstate User'}
                    </motion.button>
                );
                break;

            default:
                break;
        }

        return buttons;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-lg flex justify-center items-center z-50"
        >
            <motion.div
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-gradient-to-br from-[#1A2233] to-[#2A344A] p-8 rounded-2xl text-white w-[650px] max-w-[90vw] shadow-2xl"
            >
                <h2 className="text-2xl font-semibold mb-6 text-center">User Details</h2>

                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-300">Name:</span>
                        <span>{user.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-300">Email:</span>
                        <span>{user.email}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-300">Phone:</span>
                        <span>{user.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-300">Address:</span>
                        <span>{user.address || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-300">Country:</span>
                        <span>{user.country || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-300">Date of Birth:</span>
                        <span>{user.date_of_birth || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-300">Role:</span>
                        <span className="capitalize">{user.role}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-300">Status:</span>
                        <span className={`capitalize ${
                            user.status === 'verified' ? 'text-green-400' :
                            user.status === 'unverified' ? 'text-yellow-400' :
                            'text-red-400'
                        }`}>
                            {user.status}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-300">Registered:</span>
                        <span>{user.regDate}</span>
                    </div>
                </div>

                {/* Status Action Buttons */}

                {/* Status Action Buttons */}
                <div className="mt-6 border-t border-gray-600 pt-4 w-full">
                    <h3 className="text-lg font-medium mb-3 text-center">Status Management</h3>
                    <div className="mt-8 flex gap-4 justify-center">
                        {getStatusActionButtons()}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 1 }}
                            className="bg-[#0955AC] text-[15px] w-[130px] px-[9px] py-[6px] rounded-[5px] hover:bg-[#074a92] transition-colors duration-50 shadow-md"
                            onClick={onClose}
                        >
                            Close
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const AllUsers = ({ users = [] }) => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'verified':
                return {
                    border: "border-[#05C16880]",
                    bg: "bg-[#05C16833]",
                    dot: "bg-[#14CA74]",
                    text: "text-[#14CA74]",
                };
            case 'unverified':
                return {
                    border: "border-[#FFB01633]",
                    bg: "bg-[#FFB01633]",
                    dot: "bg-[#FDB52A]",
                    text: "text-[#FDB52A]",
                };
            case 'blocked':
            case 'rejected':
                return {
                    border: "border-[#FF5A6533]",
                    bg: "bg-[#FF5A6533]",
                    dot: "bg-[#FF5A65]",
                    text: "text-[#FF5A65]",
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

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setShowDetailsModal(true);
    };

    const closeModals = () => {
        setSelectedUser(null);
        setShowDetailsModal(false);
    };

    return (
        <div className="poppins flex flex-col items-center min-h-screen w-full gap-1">
            <div className="w-[962px] flex flex-row justify-between items-center text-white text-[16px] font-500 pt-6">
                <h1>All Users</h1>
                <h1 className="text-[#0955AC] text-[14px] font-400">
                    {users.length > 0 ? `1 - ${users.length}` : '0'}{" "}
                    <span className="text-[#AEB9E1]">of {users.length}</span>
                </h1>
            </div>
            <div className="w-full">
                <div className="h-[1px] w-full bg-[#343B4F] mt-2"></div>
            </div>

            {/* Header */}
            <div className="flex flex-row justify-center items-center w-full h-[61px]">
                <div className="flex flex-row justify-start items-start w-full px-[35px]">
                    <div className="flex flex-row justify-start items-center gap-4 w-[180px]">
                        <h1 className="text-white text-[10px] font-400">User Name</h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[230px]">Email</h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[150px]">Phone</h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[100px]">Role</h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[150px]">Registration Date</h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[100px]">Status</h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400"></h1>
                    </div>
                </div>
            </div>

            {/* Rows */}
            {users.length === 0 ? (
                <div className="text-white text-[12px] font-400 w-full text-center py-8">
                    No users found.
                </div>
            ) : (
                users.map((user, index) => {
                    const statusStyles = getStatusStyles(user.status);
                    return (
                        <div
                            key={index}
                            className="flex flex-row justify-center items-center w-full h-[61px]"
                        >
                            <div className="flex flex-row justify-start items-start w-full px-[35px]">
                                <div>
                                    <h1 className="text-[#AEB9E1] text-[10px] font-400 w-[180px]">
                                        {user.name}
                                    </h1>
                                </div>
                                <div>
                                    <h1 className="text-[#AEB9E1] text-[10px] font-400 w-[230px]">
                                        {user.email}
                                    </h1>
                                </div>
                                <div>
                                    <h1 className="text-[#AEB9E1] text-[10px] font-400 w-[150px]">
                                        {user.phone}
                                    </h1>
                                </div>
                                <div>
                                    <h1 className="text-[#AEB9E1] text-[10px] font-400 w-[100px] capitalize">
                                        {user.role}
                                    </h1>
                                </div>
                                <div>
                                    <h1 className="text-[#AEB9E1] text-[10px] font-400 w-[150px]">
                                        {user.regDate}
                                    </h1>
                                </div>
                                <div className="w-[100px]">
                                    <div
                                        className={`flex flex-row justify-center items-center gap-1 border ${statusStyles.border} ${statusStyles.bg} px-[6px] py-[2px] rounded-[5px] w-[70px]`}
                                    >
                                        <div className={`w-1 h-1 rounded-full ${statusStyles.dot}`} />
                                        <h1 className={`${statusStyles.text} text-[10px] font-500 capitalize`}>
                                            {user.status}
                                        </h1>
                                    </div>
                                </div>
                                <div className="w-[20px]">
                                    <button
                                        onClick={() => handleViewDetails(user)}
                                        className="hover:scale-110 transition-transform"
                                        title="View Details"
                                    >
                                        <img src={Eye} alt="View" className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}

            {/* User Details Modal */}
            {showDetailsModal && selectedUser && (
                <UserDetailsModal user={selectedUser} onClose={closeModals} />
            )}
        </div>
    );
};

export default AllUsers;
