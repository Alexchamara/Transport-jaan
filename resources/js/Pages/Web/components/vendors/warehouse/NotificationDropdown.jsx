import React, { useState, useEffect, useRef } from "react";
import { router } from "@inertiajs/react";
import { Bell, X, CheckCircle, AlertCircle, Info, Package } from "lucide-react";

const NotificationDropdown = ({ notifications = [], unreadCount = 0 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAsRead = (notificationId) => {
        router.post(`/vendors/warehouse/notifications/${notificationId}/read`, {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleMarkAllAsRead = () => {
        router.post('/vendors/warehouse/notifications/mark-all-read', {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleDeleteNotification = (notificationId) => {
        router.delete(`/vendors/warehouse/notifications/${notificationId}`, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'approval':
            case 'approved':
                return <CheckCircle size={20} className="text-green-500" />;
            case 'rejection':
            case 'rejected':
                return <AlertCircle size={20} className="text-red-500" />;
            case 'booking':
            case 'new_booking':
                return <Package size={20} className="text-blue-500" />;
            default:
                return <Info size={20} className="text-gray-500" />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'approval':
            case 'approved':
                return 'bg-green-50 border-green-200';
            case 'rejection':
            case 'rejected':
                return 'bg-red-50 border-red-200';
            case 'booking':
            case 'new_booking':
                return 'bg-blue-50 border-blue-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative size-[60px] rounded-full lg:rounded-[10px] bg-[#E8EBEF] flex justify-center items-center cursor-pointer hover:bg-[#D8E4F2] transition-colors"
                title="Notifications"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 lg:left-auto lg:right-0 lg:translate-x-0 mt-2 w-[90vw] max-w-[400px] lg:w-[400px] max-h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-800">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-600 rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto max-h-[500px]">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                <Bell size={48} className="text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">No notifications</p>
                                <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`relative px-4 py-3 hover:bg-gray-50 transition-colors ${!notification.read_at ? 'bg-blue-50/50' : ''
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <p className={`text-sm ${!notification.read_at ? 'font-semibold' : 'font-medium'} text-gray-800`}>
                                                            {notification.data?.title || 'Notification'}
                                                        </p>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {notification.data?.message || ''}
                                                        </p>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <span className="text-xs text-gray-500">
                                                                {formatTime(notification.created_at)}
                                                            </span>
                                                            {notification.data?.unit_name && (
                                                                <span className="text-xs text-blue-600 font-medium">
                                                                    {notification.data.unit_name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteNotification(notification.id)}
                                                        className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                                {!notification.read_at && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-2"
                                                    >
                                                        Mark as read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {!notification.read_at && (
                                            <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={() => {
                                    router.visit('/vendors/warehouse/notifications');
                                    setIsOpen(false);
                                }}
                                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
