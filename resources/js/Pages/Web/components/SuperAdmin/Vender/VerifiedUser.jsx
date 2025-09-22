import React, { useState } from "react";
import { motion } from "framer-motion";
import Eye from "../../../assets/superAdmin/eye.png";
import { Link, router } from "@inertiajs/react";

const UserDetailsModal = ({ user, onClose, onVerify, onReject }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleBlock = async () => {
        setIsLoading(true);
        try {
            await router.post(`/superadmin/vendors/${user.id}/block`, {}, {
                onSuccess: () => {
                    onClose();
                    router.reload();
                },
                onError: (errors) => {
                    console.error('Block failed:', errors);
                },
                onFinish: () => setIsLoading(false)
            });
        } catch (error) {
            console.error('Error blocking user:', error);
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
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ duration: 0.1, ease: "easeOut" }}
                className="bg-gradient-to-br from-[#1A2233] to-[#2A344A] p-8 rounded-2xl text-white w-[600px] max-w-[90vw] max-h-[80vh] overflow-y-auto shadow-2xl"
            >
                <h2 className="text-2xl font-semibold mb-6 text-center tracking-wide">
                    User Profile
                </h2>
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
                        <span className={`font-light ${getStatusStyles(user.status).text}`}>
                            {user.status}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 w-full">
                        <span className="font-medium text-gray-300 w-32">Approval:</span>
                        <span className={`font-light ${getApprovalStyles(user.approval).text}`}>
                            {user.approval}
                        </span>
                    </div>
                </div>

                <div className="mt-8 flex gap-4 justify-center">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 1 }}
                        className="bg-red-600 text-[15px] w-[130px] px-[9px] py-[6px] rounded-[5px] hover:bg-red-700 transition-colors duration-50 shadow-md disabled:opacity-50"
                        onClick={handleBlock}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : 'Block user'}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 1 }}
                        className={`text-[15px] w-[130px] px-[9px] py-[6px] rounded-[5px] transition-colors duration-50 shadow-md ${getButtonColors("close").bg} ${getButtonColors("close").hoverBg} ${getButtonColors("close").text}`}
                        onClick={onClose}
                    >
                        Close
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const VerifiedUsers = ({ vendors = [], statusFilter = "all", approvalFilter = "all" }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Use the provided vendors data instead of hardcoded data
    const users = vendors.map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        regDate: vendor.regDate,
        status: vendor.status === 'verified' ? 'Active' : vendor.status,
        approval: vendor.approval === 'verified' ? 'Approved' : vendor.approval,
    }));
    // Filter users based on status and approval
    const filteredUsers = users.filter((user) => {
        const matchesStatus = statusFilter === "all" || user.status === statusFilter;
        const matchesApproval = approvalFilter === "all" || user.approval === approvalFilter;
        return matchesStatus && matchesApproval;
    });

    // Log filtered users for debugging
    console.log("Filtered Users:", filteredUsers);

    // Function to get styles for status
    const getStatusStyles = (status) => {
        switch (status) {
            case "Active":
                return { border: "border-[#05C16880]", bg: "bg-[#05C16833]", dot: "bg-[#14CA74]", text: "text-[#14CA74]" };
            case "Inactive":
                return { border: "border-[#FFB01633]", bg: "bg-[#FFB01633]", dot: "bg-[#FDB52A]", text: "text-[#FDB52A]" };
            case "Suspended":
                return { border: "border-[#FF5A6533]", bg: "bg-[#FF5A6533]", dot: "bg-[#FF5A65]", text: "text-[#FF5A65]" };
            case "Blocked":
                return { border: "border-[#FF572280]", bg: "bg-[#FF572233]", dot: "bg-[#FF5722]", text: "text-[#FF5722]" };
            case "Pending":
                return { border: "border-[#FFB01633]", bg: "bg-[#FFB01633]", dot: "bg-[#FDB52A]", text: "text-[#FDB52A]" };
            default:
                return { border: "border-[#343B4F]", bg: "bg-[#0B1739]", dot: "bg-[#AEB9E1]", text: "text-[#AEB9E1]" };
        }
    };

    // Function to get styles for approval
    const getApprovalStyles = (approval) => {
        switch (approval) {
            case "Approved":
                return { border: "border-[#05C16880]", bg: "bg-[#05C16833]", dot: "bg-[#14CA74]", text: "text-[#14CA74]" };
            case "Pending":
                return { border: "border-[#FFB01633]", bg: "bg-[#FFB01633]", dot: "bg-[#FDB52A]", text: "text-[#FDB52A]" };
            case "Rejected":
                return { border: "border-[#FF572280]", bg: "bg-[#FF572233]", dot: "bg-[#FF5722]", text: "text-[#FF5722]" };
            case "Blocked":
                return { border: "border-[#FF572280]", bg: "bg-[#FF572233]", dot: "bg-[#FF5722]", text: "text-[#FF5722]" };
            default:
                return { border: "border-[#343B4F]", bg: "bg-[#0B1739]", dot: "bg-[#AEB9E1]", text: "text-[#AEB9E1]" };
        }
    };

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleStatusAndApprovalChange = (newValue) => {
        setUsers((prevUsers) =>
            prevUsers.map((u) =>
                u.email === selectedUser.email ? { ...u, status: newValue, approval: newValue } : u
            )
        );
        setSelectedUser((prev) => (prev ? { ...prev, status: newValue, approval: newValue } : prev));
        // Mark the clicked button as clicked for this user
        setButtonClicks((prev) => ({
            ...prev,
            [selectedUser.email]: { 
                ...prev[selectedUser.email], 
                block: newValue === "Blocked" ? true : prev[selectedUser.email]?.block || false,
                pending: newValue === "Blocked" ? true : newValue === "Pending" ? true : prev[selectedUser.email]?.pending || false
            },
        }));
    };

    return (
        <div className="poppins flex flex-col items-center min-h-screen w-full gap-1">
            <div className="w-[962px] flex flex-row justify-between items-center text-white text-[16px] font-500 pt-6">
                <h1>Verified Users</h1>
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
                        <h1 className="text-white text-[10px] font-400">User Name</h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[170px]">Email</h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[150px]">Phone</h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[150px]">Registration Date</h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[150px]">Status</h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[150px]">Approval Status</h1>
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
                                    className={`flex flex-row justify-center items-center gap-1 border ${getStatusStyles(user.status).border} ${getStatusStyles(user.status).bg} px-[6px] py-[2px] rounded-[5px] w-[70px]`}
                                >
                                    <div
                                        className={`w-1 h-1 rounded-full ${getStatusStyles(user.status).dot}`}
                                    />
                                    <h1
                                        className={`${getStatusStyles(user.status).text} text-[10px] font-500 flex flex-row justify-center items-center`}
                                    >
                                        {user.status}
                                    </h1>
                                </div>
                            </div>
                            <div className="w-[150px]">
                                <div
                                    className={`flex flex-row justify-center items-center gap-1 border ${getApprovalStyles(user.approval).border} ${getApprovalStyles(user.approval).bg} px-[6px] py-[2px] rounded-[5px] w-[70px]`}
                                >
                                    <div
                                        className={`w-1 h-1 rounded-full ${getApprovalStyles(user.approval).dot}`}
                                    />
                                    <h1
                                        className={`${getApprovalStyles(user.approval).text} text-[10px] font-500 flex flex-row justify-center items-center`}
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
                <UserDetailsModal
                    user={selectedUser}
                    onClose={closeModal}
                    onStatusAndApprovalChange={handleStatusAndApprovalChange}
                    isBlockClicked={buttonClicks[selectedUser.email]?.block || false}
                    isPendingClicked={buttonClicks[selectedUser.email]?.pending || false}
                />
            )}
        </div>
    );
};

export default VerifiedUsers;