import React, { useState } from "react";
import Eye from "../../../assets/superAdmin/eye.png";
import { motion } from 'framer-motion';
import { Link, router } from "@inertiajs/react";

const UserDetailsModal = ({ user, onClose, onVerify, onReject }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async () => {
        setIsLoading(true);
        try {
            await router.post(`/superadmin/vendors/${user.id}/verify`, {}, {
                onSuccess: () => {
                    onClose();
                    router.reload();
                },
                onError: (errors) => {
                    console.error('Verification failed:', errors);
                },
                onFinish: () => setIsLoading(false)
            });
        } catch (error) {
            console.error('Error verifying user:', error);
            setIsLoading(false);
        }
    };

    const handleReject = async () => {
        setIsLoading(true);
        try {
            await router.post(`/superadmin/vendors/${user.id}/reject`, {}, {
                onSuccess: () => {
                    onClose();
                    router.reload();
                },
                onError: (errors) => {
                    console.error('Rejection failed:', errors);
                },
                onFinish: () => setIsLoading(false)
            });
        } catch (error) {
            console.error('Error rejecting user:', error);
            setIsLoading(false);
        }
    };
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-lg flex justify-center items-center z-50"
        >
            <motion.div
                initial={{ scale: 0.8, y:50 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
                className="bg-gradient-to-br from-[#1A2233] to-[#2A344A] p-8 rounded-2xl text-white w-[600px] max-w-[90vw] max-h-[80vh] overflow-y-auto shadow-2xl"
            >
                <h2 className="text-2xl font-semibold mb-6 text-center tracking-wide">User Profile</h2>
                <div className="flex flex-col items-start gap-4 px-4">
                    <div className="flex items-center gap-2 w-full">
                        <span className="font-medium text-gray-300 w-32">Name:</span>
                        <span className="font-light">{user.name}</span>
                    </div>
                    <div className="flex items-center gap-2 w-full">
                        <span className="font-medium text-gray-300 w-32">Email:</span>
                        <span className="font-light">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 w-full">
                        <span className="font-medium text-gray-300 w-32">Phone:</span>
                        <span className="font-light">{user.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 w-full">
                        <span className="font-medium text-gray-300 w-32">Registered:</span>
                        <span className="font-light">{user.regDate}</span>
                    </div>
                    <div className="flex items-center gap-2 w-full">
                        <span className="font-medium text-gray-300 w-32">Status:</span>
                        <span className={`font-light ${user.status === 'Active' ? 'text-green-400' : 'text-[#FDB52A]'}`}>
                            {user.status}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 w-full">
                        <span className="font-medium text-gray-300 w-32">Approval:</span>
                        <span className={`font-light ${user.approval === 'Approved' ? 'text-green-400' : 'text-[#FDB52A]'}`}>
                            {user.approval}
                        </span>
                    </div>
                </div>

                <div className="mt-8 flex gap-4 justify-center">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale:1 }}
                        className="bg-green-600 border border-[#05C16880] text-[15px] w-[130px] px-[9px] py-[6px] rounded-[5px] hover:bg-green-700 transition-colors duration-50 shadow-md disabled:opacity-50"
                        onClick={handleVerify}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : 'Verify'}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 1 }}
                        className="bg-red-600 text-[15px] w-[130px] px-[9px] py-[6px] rounded-[5px] hover:bg-red-700 transition-colors duration-50 shadow-md disabled:opacity-50"
                        onClick={handleReject}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : 'Reject'}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 1 }}
                        className="bg-[#0955AC] text-[15px] w-[130px] px-[9px] py-[6px] rounded-[5px] hover:bg-[#074a92] transition-colors duration-50 shadow-md"
                        onClick={onClose}
                    >
                        Close
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const NewUsers = ({ vendors = [], statusFilter = "all", approvalFilter = "all" }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Use the provided vendors data instead of hardcoded data
    const users = vendors.map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        regDate: vendor.regDate,
        status: vendor.status === 'unverified' ? 'Pending' : vendor.status,
        approval: vendor.approval === 'unverified' ? 'Pending' : vendor.approval,
    }));

    // Filter users based on status and approval
    const filteredUsers = users.filter((user) => {
        const matchesStatus =
            statusFilter === "all" || user.status === statusFilter;
        const matchesApproval =
            approvalFilter === "all" || user.approval === approvalFilter;
        return matchesStatus && matchesApproval;
    });

    // Log filtered users for debugging
    console.log("Filtered Users:", filteredUsers);

    const getStatusStyles = () => ({
        border: "border-[#FFB01633]",
        bg: "bg-[#FFB01633]",
        dot: "bg-[#FDB52A]",
        text: "text-[#FDB52A]",
    });

    const getApprovalStyles = () => ({
        border: "border-[#FFB01633]",
        bg: "bg-[#FFB01633]",
        dot: "bg-[#FDB52A]",
        text: "text-[#FDB52A]",
    });

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    return (
        <div className="poppins flex flex-col items-center min-h-screen w-full gap-1">
            <div className="w-[962px] flex flex-row justify-between items-center text-white text-[16px] font-500 pt-6">
                <h1>New Users</h1>
                <h1 className="text-[#0955AC] text-[14px] font-400">
                    1 - {filteredUsers.length}{" "}
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
                        <h1 className="text-white text-[10px] font-400">
                            User Name
                        </h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[170px]">
                            Email
                        </h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[150px]">
                            Phone
                        </h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[150px]">
                            Registration Date
                        </h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[150px]">
                            Status
                        </h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[150px]">
                            Approval Status
                        </h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400"></h1>
                    </div>
                </div>
            </div>

            {/* Rows */}
            {filteredUsers.length === 0 ? (
                <div className="text-white text-[12px] font-400 w-full text-center py-4">
                    No users found matching the selected filters.
                </div>
            ) : (
                filteredUsers.map((user, index) => (
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
                                <h1 className="text-[#AEB9E1] text-[10px] font-400 w-[170px]">
                                    {user.email}
                                </h1>
                            </div>
                            <div>
                                <h1 className="text-[#AEB9E1] text-[10px] font-400 w-[150px]">
                                    {user.phone}
                                </h1>
                            </div>
                            <div>
                                <h1 className="text-[#AEB9E1] text-[10px] font-400 w-[150px]">
                                    {user.regDate}
                                </h1>
                            </div>
                            <div className="w-[150px]">
                                <div
                                    className={`flex flex-row justify-center items-center gap-1 border ${
                                        getStatusStyles().border
                                    } ${
                                        getStatusStyles().bg
                                    } px-[6px] py-[2px] rounded-[5px] w-[70px]`}
                                >
                                    <div
                                        className={`w-1 h-1 rounded-full ${
                                            getStatusStyles().dot
                                        }`}
                                    />
                                    <h1
                                        className={`${
                                            getStatusStyles().text
                                        } text-[10px] font-500 flex flex-row justify-center items-center`}
                                    >
                                        {user.status}
                                    </h1>
                                </div>
                            </div>
                            <div className="w-[150px]">
                                <div
                                    className={`flex flex-row justify-center items-center gap-1 border ${
                                        getApprovalStyles().border
                                    } ${
                                        getApprovalStyles().bg
                                    } px-[6px] py-[2px] rounded-[5px] w-[70px]`}
                                >
                                    <div
                                        className={`w-1 h-1 rounded-full ${
                                            getApprovalStyles().dot
                                        }`}
                                    />
                                    <h1
                                        className={`${
                                            getApprovalStyles().text
                                        } text-[10px] font-500 flex flex-row justify-center items-center`}
                                    >
                                        {user.approval}
                                    </h1>
                                </div>
                            </div>
                            <div className="w-[20px]">
                                <button onClick={() => handleViewDetails(user)}>
                                    <img src={Eye} alt="View" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}

            {/* User Details Modal */}
            {isModalOpen && selectedUser && (
                <UserDetailsModal user={selectedUser} onClose={closeModal} />
            )}
        </div>
    );
};

export default NewUsers;
