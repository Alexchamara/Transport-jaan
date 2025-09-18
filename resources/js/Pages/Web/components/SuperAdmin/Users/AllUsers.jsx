import React, { useState } from "react";
import { motion } from "framer-motion";
import { router } from "@inertiajs/react";
import Edit from "../../../assets/superAdmin/Pencil Icon.svg";
import Bin from "../../../assets/superAdmin/Bin Icon.svg";
import Eye from "../../../assets/superAdmin/eye.png";

// Edit User Modal Component
const EditUserModal = ({ user, onClose }) => {
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        country: user.country || '',
        date_of_birth: user.date_of_birth || '',
        role: user.role,
        status: user.status,
        password: '',
        password_confirmation: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        // Remove empty password fields
        const submitData = { ...formData };
        if (!submitData.password) {
            delete submitData.password;
            delete submitData.password_confirmation;
        }

        router.put(`/superadmin/users/${user.id}`, submitData, {
            onSuccess: (page) => {
                onClose();
                // Force page refresh to get updated data
                router.reload();
            },
            onError: (errors) => {
                setErrors(errors);
                setIsLoading(false);
            },
            onFinish: () => setIsLoading(false)
        });
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
                className="bg-gradient-to-br from-[#1A2233] to-[#2A344A] p-8 rounded-2xl text-white w-[600px] max-w-[90vw] max-h-[80vh] overflow-y-auto shadow-2xl"
            >
                <h2 className="text-2xl font-semibold mb-6 text-center">Edit User</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-3 py-2 bg-[#0B1739] border border-[#343B4F] rounded text-white"
                            required
                        />
                        {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full px-3 py-2 bg-[#0B1739] border border-[#343B4F] rounded text-white"
                            required
                        />
                        {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Phone</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                className="w-full px-3 py-2 bg-[#0B1739] border border-[#343B4F] rounded text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Country</label>
                            <input
                                type="text"
                                value={formData.country}
                                onChange={(e) => setFormData({...formData, country: e.target.value})}
                                className="w-full px-3 py-2 bg-[#0B1739] border border-[#343B4F] rounded text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Address</label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            className="w-full px-3 py-2 bg-[#0B1739] border border-[#343B4F] rounded text-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                className="w-full px-3 py-2 bg-[#0B1739] border border-[#343B4F] rounded text-white"
                            >
                                <option value="client">Client</option>
                                <option value="vendor">Vendor</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                                className="w-full px-3 py-2 bg-[#0B1739] border border-[#343B4F] rounded text-white"
                            >
                                <option value="verified">Verified</option>
                                <option value="unverified">Unverified</option>
                                <option value="blocked">Blocked</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Date of Birth</label>
                        <input
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                            className="w-full px-3 py-2 bg-[#0B1739] border border-[#343B4F] rounded text-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">New Password (optional)</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className="w-full px-3 py-2 bg-[#0B1739] border border-[#343B4F] rounded text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Confirm Password</label>
                            <input
                                type="password"
                                value={formData.password_confirmation}
                                onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                                className="w-full px-3 py-2 bg-[#0B1739] border border-[#343B4F] rounded text-white"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center mt-6">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-white disabled:opacity-50"
                        >
                            {isLoading ? 'Updating...' : 'Update User'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded text-white"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

// Delete Confirmation Modal
const DeleteConfirmModal = ({ user, onClose, onConfirm }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        setIsLoading(true);
        router.delete(`/superadmin/users/${user.id}`, {
            onSuccess: () => {
                onClose();
            },
            onError: () => {
                setIsLoading(false);
            },
            onFinish: () => setIsLoading(false)
        });
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
                className="bg-gradient-to-br from-[#1A2233] to-[#2A344A] p-8 rounded-2xl text-white w-[400px] max-w-[90vw] shadow-2xl"
            >
                <h2 className="text-xl font-semibold mb-4 text-center">Delete User</h2>
                <p className="text-center mb-6">
                    Are you sure you want to delete <strong>{user.name}</strong>?
                    This action cannot be undone.
                </p>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded text-white disabled:opacity-50"
                    >
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded text-white"
                    >
                        Cancel
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// User Details Modal
const UserDetailsModal = ({ user, onClose }) => {
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
                className="bg-gradient-to-br from-[#1A2233] to-[#2A344A] p-8 rounded-2xl text-white w-[500px] max-w-[90vw] shadow-2xl"
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

                <div className="flex justify-center mt-6">
                    <button
                        onClick={onClose}
                        className="bg-[#0955AC] hover:bg-[#074a92] px-6 py-2 rounded text-white"
                    >
                        Close
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const AllUsers = ({ users = [] }) => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
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

    const handleEdit = (user) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const handleDelete = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setShowDetailsModal(true);
    };

    const closeModals = () => {
        setSelectedUser(null);
        setShowEditModal(false);
        setShowDeleteModal(false);
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
                    <div className="flex flex-row justify-start items-center gap-4 w-[150px]">
                        <h1 className="text-white text-[10px] font-400">Name</h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[180px]">Email</h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[120px]">Phone</h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[100px]">Role</h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[100px]">Status</h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[120px]">Registered</h1>
                    </div>
                    <div>
                        <h1 className="text-white text-[10px] font-400 w-[100px]">Actions</h1>
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
                            className="flex flex-row justify-center items-center w-full h-[61px] hover:bg-[#1A2233]/30"
                        >
                            <div className="flex flex-row justify-start items-center w-full px-[35px]">
                                <div className="w-[150px]">
                                    <h1 className="text-[#AEB9E1] text-[10px] font-400 truncate">
                                        {user.name}
                                    </h1>
                                </div>
                                <div className="w-[180px]">
                                    <h1 className="text-[#AEB9E1] text-[10px] font-400 truncate">
                                        {user.email}
                                    </h1>
                                </div>
                                <div className="w-[120px]">
                                    <h1 className="text-[#AEB9E1] text-[10px] font-400">
                                        {user.phone}
                                    </h1>
                                </div>
                                <div className="w-[100px]">
                                    <h1 className="text-[#AEB9E1] text-[10px] font-400 capitalize">
                                        {user.role}
                                    </h1>
                                </div>
                                <div className="w-[100px]">
                                    <div
                                        className={`flex flex-row justify-center items-center gap-1 border ${statusStyles.border} ${statusStyles.bg} px-[6px] py-[2px] rounded-[5px] w-[80px]`}
                                    >
                                        <div className={`w-1 h-1 rounded-full ${statusStyles.dot}`} />
                                        <h1 className={`${statusStyles.text} text-[10px] font-500 capitalize`}>
                                            {user.status}
                                        </h1>
                                    </div>
                                </div>
                                <div className="w-[120px]">
                                    <h1 className="text-[#AEB9E1] text-[10px] font-400">
                                        {user.regDate}
                                    </h1>
                                </div>
                                <div className="w-[100px] flex flex-row gap-2">
                                    <button
                                        onClick={() => handleViewDetails(user)}
                                        className="hover:scale-110 transition-transform"
                                        title="View Details"
                                    >
                                        <img src={Eye} alt="View" className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="hover:scale-110 transition-transform"
                                        title="Edit User"
                                    >
                                        <img src={Edit} alt="Edit" className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user)}
                                        className="hover:scale-110 transition-transform"
                                        title="Delete User"
                                    >
                                        <img src={Bin} alt="Delete" className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}

            {/* Modals */}
            {showEditModal && selectedUser && (
                <EditUserModal user={selectedUser} onClose={closeModals} />
            )}

            {showDeleteModal && selectedUser && (
                <DeleteConfirmModal user={selectedUser} onClose={closeModals} />
            )}

            {showDetailsModal && selectedUser && (
                <UserDetailsModal user={selectedUser} onClose={closeModals} />
            )}
        </div>
    );
};

export default AllUsers;
