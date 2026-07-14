import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Eye from "../../../assets/superAdmin/eye.png";
import { Link, router } from "@inertiajs/react";
import ActionModalTemplate from "../Common/ActionModalTemplate";

const UserDetailsModal = ({ user, onClose, onStatusAndApprovalChange, isVerifyClicked, isPendingClicked }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showActionModal, setShowActionModal] = useState(null);
    const [actionNotes, setActionNotes] = useState("");

    const actionConfig = {
        verify: {
            title: 'Verify User',
            description: 'This will verify this blocked user.',
            confirmText: 'Verify',
            confirmClassName: 'bg-green-600 hover:bg-green-700',
        },
        pending: {
            title: 'Mark as Pending',
            description: 'This will set this user status to pending.',
            confirmText: 'Set Pending',
            confirmClassName: 'bg-[#FDB52A] hover:bg-[#E0A01F]',
        },
        unblock: {
            title: 'Unblock User',
            description: 'This will unblock this user account.',
            confirmText: 'Unblock',
            confirmClassName: 'bg-red-600 hover:bg-red-700',
        },
    };

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
            default:
                return { border: "border-[#FFB01633]", bg: "bg-[#FFB01633]", dot: "bg-[#FDB52A]", text: "text-[#FDB52A]" };
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
            default:
                return { border: "border-[#FF572280]", bg: "bg-[#FF572233]", dot: "bg-[#FF5722]", text: "text-[#FF5722]" };
        }
    };

    const handleUnblock = async () => {
        setIsLoading(true);
        try {
            await router.post(`/superadmin/vendors/${user.id}/unblock`, {}, {
                onSuccess: () => {
                    onStatusAndApprovalChange("Active", "Approved");
                    onClose();
                    router.reload();
                },
                onError: (errors) => {
                    console.error('Unblock failed:', errors);
                },
                onFinish: () => setIsLoading(false)
            });
        } catch (error) {
            console.error('Error unblocking user:', error);
            setIsLoading(false);
        }
    };

    const handleActionConfirm = () => {
        if (showActionModal === 'verify') {
            onStatusAndApprovalChange("Active", "Approved");
        }
        if (showActionModal === 'pending') {
            onStatusAndApprovalChange("Pending", "Pending");
        }
        if (showActionModal === 'unblock') {
            handleUnblock();
        }
        setShowActionModal(null);
        setActionNotes("");
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
                <div className="mt-8 flex gap-4 justify-center flex-wrap">
                    {!isVerifyClicked && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 1 }}
                            className="bg-green-600 border border-[#05C16880] text-[15px] w-[130px] px-[9px] py-[6px] rounded-[5px] hover:bg-green-700 transition-colors duration-50 shadow-md"
                            onClick={() => setShowActionModal('verify')}
                        >
                            Verify
                        </motion.button>
                    )}
                    {!isVerifyClicked && !isPendingClicked && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 1 }}
                            className="bg-[#FDB52A] text-[15px] w-[130px] px-[9px] py-[6px] rounded-[5px] hover:bg-[#E0A01F] transition-colors duration-50 shadow-md"
                            onClick={() => setShowActionModal('pending')}
                        >
                            Pending
                        </motion.button>
                    )}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 1 }}
                        className="bg-red-600 text-[15px] w-[130px] px-[9px] py-[6px] rounded-[5px] hover:bg-red-700 transition-colors duration-50 shadow-md disabled:opacity-50"
                        onClick={() => setShowActionModal('unblock')}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : 'Unblock'}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 1 }}
                        className="bg-[#0955AC] text-white text-[15px] w-[130px] px-[9px] py-[6px] rounded-[5px] hover:bg-[#074a92] transition-colors duration-50 shadow-md"
                        onClick={onClose}
                    >
                        Close
                    </motion.button>
                </div>

                <AnimatePresence>
                    {showActionModal && actionConfig[showActionModal] && (
                        <ActionModalTemplate
                            title={actionConfig[showActionModal].title}
                            description={actionConfig[showActionModal].description}
                            notes={actionNotes}
                            setNotes={setActionNotes}
                            placeholder=""
                            showNotes={false}
                            notesRequired={false}
                            processing={isLoading}
                            processingText="Processing..."
                            confirmText={actionConfig[showActionModal].confirmText}
                            confirmClassName={actionConfig[showActionModal].confirmClassName}
                            onClose={() => { setShowActionModal(null); setActionNotes(""); }}
                            onConfirm={handleActionConfirm}
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};

const BlockUsers = ({ vendors = [], statusFilter = "all", approvalFilter = "all" }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [buttonClicks, setButtonClicks] = useState({});

    // Use the provided vendors data instead of hardcoded data
    const users = vendors.map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        regDate: vendor.regDate,
        status: vendor.status === 'blocked' || vendor.status === 'rejected' ? 'Blocked' : vendor.status,
        approval: vendor.approval === 'blocked' || vendor.approval === 'rejected' ? 'Blocked' : vendor.approval,
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
            default:
                return { border: "border-[#FFB01633]", bg: "bg-[#FFB01633]", dot: "bg-[#FDB52A]", text: "text-[#FDB52A]" };
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
            default:
                return { border: "border-[#FF572280]", bg: "bg-[#FF572233]", dot: "bg-[#FF5722]", text: "text-[#FF5722]" };
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

    const handleStatusAndApprovalChange = (newStatus, newApproval) => {
        setSelectedUser((prev) => (prev ? { ...prev, status: newStatus, approval: newApproval } : prev));
        // Mark both buttons as clicked for this user
        setButtonClicks((prev) => ({
            ...prev,
            [selectedUser.email]: {
                ...prev[selectedUser.email],
                verify: newStatus === "Active" && newApproval === "Approved",
                pending: newStatus === "Pending" && newApproval === "Pending"
            },
        }));
    };

    return (
        <div className="poppins flex flex-col items-center min-h-screen w-full gap-1">
            <div className="w-[962px] flex flex-row justify-between items-center text-white text-[16px] font-500 pt-6">
                <h1>Blocked Users</h1>
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
                    isVerifyClicked={buttonClicks[selectedUser.email]?.verify || false}
                    isPendingClicked={buttonClicks[selectedUser.email]?.pending || false}
                />
            )}
        </div>
    );
};

export default BlockUsers;