import React, { useState } from "react";
import { motion } from "framer-motion";
import Eye from "../../../assets/superAdmin/eye.png";
<<<<<<< Updated upstream
=======
<<<<<<< HEAD
import { motion } from 'framer-motion';
>>>>>>> Stashed changes
import { Link, router } from "@inertiajs/react";

const UserDetailsModal = ({ user, onClose, onStatusAndApprovalChange, isVerifyClicked, isRejectClicked }) => {
    const [isLoading, setIsLoading] = useState(false);

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
                return { border: "border-[#FFB01633]", bg: "bg-[#FFB01633]", dot: "bg-[#FDB52A]", text: "text-[#FDB52A]" };
        }
    };

    const handleVerify = async () => {
        setIsLoading(true);
        try {
            await router.post(`/superadmin/vendors/${user.id}/verify`, {}, {
                onSuccess: () => {
                    onStatusAndApprovalChange();
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
=======

const UserDetailsModal = ({ user, onClose, onStatusAndApprovalChange, isVerifyClicked }) => {
    // Function to get button colors based on type
    const getButtonColors = (type) => {
        if (type === "verify") {
            return { bg: "bg-[#05C16833]", hoverBg: "hover:bg-[#05C1684D]", text: "text-[#14CA74]" };
        } else if (type === "close") {
            return { bg: "bg-[#0955AC]", hoverBg: "hover:bg-[#074a92]", text: "text-white" };
        }
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
                return { border: "border-[#FFB01633]", bg: "bg-[#FFB01633]", dot: "bg-[#FDB52A]", text: "text-[#FDB52A]" };
        }
    };

>>>>>>> ujith-dev
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
<<<<<<< HEAD

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
=======
                <div className="mt-8 flex gap-4 justify-center flex-wrap">
                    {!isVerifyClicked && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 1 }}
                            className={`text-[15px] w-[130px] px-[9px] py-[6px] rounded-[5px] transition-colors duration-50 shadow-md ${getButtonColors("verify").bg} ${getButtonColors("verify").hoverBg} ${getButtonColors("verify").text}`}
                            onClick={() => onStatusAndApprovalChange()}
                        >
                            Verify
                        </motion.button>
                    )}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 1 }}
                        className={`text-[15px] w-[130px] px-[9px] py-[6px] rounded-[5px] transition-colors duration-50 shadow-md ${getButtonColors("close").bg} ${getButtonColors("close").hoverBg} ${getButtonColors("close").text}`}
>>>>>>> ujith-dev
                        onClick={onClose}
                    >
                        Close
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
};

<<<<<<< HEAD
const NewUsers = ({ vendors = [], statusFilter = "all", approvalFilter = "all" }) => {
=======
const NewUsers = () => {
>>>>>>> ujith-dev
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
<<<<<<< Updated upstream
=======
    const [users, setUsers] = useState([
        { name: "John Doe", email: "john.doe@example.com", phone: "+1-555-123-4567", regDate: "2025-09-01", status: "Pending", approval: "Pending" },
        { name: "Jane Smith", email: "jane.smith@example.com", phone: "+1-555-234-5678", regDate: "2025-09-02", status: "Pending", approval: "Pending" },
        { name: "Alice Johnson", email: "alice.j@example.com", phone: "+1-555-345-6789", regDate: "2025-09-03", status: "Pending", approval: "Pending" },
        { name: "Bob Wilson", email: "bob.wilson@example.com", phone: "+1-555-456-7890", regDate: "2025-09-04", status: "Pending", approval: "Pending" },
        { name: "Emma Brown", email: "emma.brown@example.com", phone: "+1-555-567-8901", regDate: "2025-09-05", status: "Pending", approval: "Pending" },
        { name: "Michael Lee", email: "michael.lee@example.com", phone: "+1-555-678-9012", regDate: "2025-09-06", status: "Pending", approval: "Pending" },
        { name: "Sarah Davis", email: "sarah.davis@example.com", phone: "+1-555-789-0123", regDate: "2025-09-07", status: "Pending", approval: "Pending" },
        { name: "David Clark", email: "david.clark@example.com", phone: "+1-555-890-1234", regDate: "2025-09-08", status: "Pending", approval: "Pending" },
        { name: "Laura Martinez", email: "laura.m@example.com", phone: "+1-555-901-2345", regDate: "2025-09-09", status: "Pending", approval: "Pending" },
        { name: "James Taylor", email: "james.taylor@example.com", phone: "+1-555-012-3456", regDate: "2025-09-10", status: "Pending", approval: "Pending" },
    ]);
    // State to track button clicks for each user
>>>>>>> Stashed changes
    const [buttonClicks, setButtonClicks] = useState({});

<<<<<<< HEAD
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

<<<<<<< Updated upstream
    // Filter users to only show those with status and approval as Pending
    const filteredUsers = users.filter((user) => user.status === "Pending" && user.approval === "Pending");
=======
    // Filter users based on status and approval
    const filteredUsers = users.filter((user) => {
        const matchesStatus =
            statusFilter === "all" || user.status === statusFilter;
        const matchesApproval =
            approvalFilter === "all" || user.approval === approvalFilter;
        return matchesStatus && matchesApproval;
    });
=======
    // Filter users to only show those with status and approval as Pending
    const filteredUsers = users.filter((user) => user.status === "Pending" && user.approval === "Pending");
>>>>>>> ujith-dev
>>>>>>> Stashed changes

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
                return { border: "border-[#FFB01633]", bg: "bg-[#FFB01633]", dot: "bg-[#FDB52A]", text: "text-[#FDB52A]" };
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

    const handleStatusAndApprovalChange = () => {
<<<<<<< Updated upstream
=======
        setUsers((prevUsers) =>
            prevUsers.map((u) =>
                u.email === selectedUser.email ? { ...u, status: "Active", approval: "Approved" } : u
            )
        );
>>>>>>> Stashed changes
        setSelectedUser((prev) => (prev ? { ...prev, status: "Active", approval: "Approved" } : prev));
        // Mark Verify button as clicked for this user
        setButtonClicks((prev) => ({
            ...prev,
            [selectedUser.email]: { ...prev[selectedUser.email], verify: true },
        }));
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
<<<<<<< Updated upstream
                    isRejectClicked={buttonClicks[selectedUser.email]?.reject || false}
=======
>>>>>>> Stashed changes
                />
            )}
        </div>
    );
};

export default NewUsers;