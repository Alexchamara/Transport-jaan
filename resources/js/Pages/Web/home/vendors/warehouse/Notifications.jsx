import React from "react";
import { Head } from "@inertiajs/react";
import Sidebar from "../../components/vendors/warehouse/Sidebar";
import NotificationDropdown from "../../components/vendors/warehouse/NotificationDropdown";
import { Bell, CheckCircle, AlertCircle, Info, Package, Clock } from "lucide-react";

const Notifications = ({ notifications, unreadCount }) => {
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'warehouse_approval':
            case 'approved':
                return <CheckCircle size={32} className="text-green-500" />;
            case 'warehouse_rejection':
            case 'rejected':
                return <AlertCircle size={32} className="text-red-500" />;
            case 'warehouse_new_booking':
            case 'new_booking':
                return <Package size={32} className="text-blue-500" />;
            default:
                return <Info size={32} className="text-gray-500" />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'warehouse_approval':
            case 'approved':
                return 'border-l-green-500 bg-green-50';
            case 'warehouse_rejection':
            case 'rejected':
                return 'border-l-red-500 bg-red-50';
            case 'warehouse_new_booking':
            case 'new_booking':
                return 'border-l-blue-500 bg-blue-50';
            default:
                return 'border-l-gray-500 bg-gray-50';
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        
        return date.toLocaleDateString('en-US', { 
            year: 'numeric',
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <Head title="Notifications - Warehouse" />
            
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                
                <div className="flex-1 p-8 ml-[280px]">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                    <Bell size={32} className="text-blue-600" />
                                    Notifications
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    {unreadCount > 0 
                                        ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                                        : 'You\'re all caught up!'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-w-4xl">
                        {notifications.data && notifications.data.length > 0 ? (
                            <div className="space-y-4">
                                {notifications.data.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`relative border-l-4 rounded-lg shadow-sm p-6 transition-all hover:shadow-md ${
                                            getNotificationColor(notification.type)
                                        } ${!notification.read_at ? 'border-2 border-blue-200' : ''}`}
                                    >
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h3 className={`text-lg font-semibold text-gray-900 ${
                                                        !notification.read_at ? 'font-bold' : ''
                                                    }`}>
                                                        {notification.data?.title || 'Notification'}
                                                    </h3>
                                                    {!notification.read_at && (
                                                        <span className="flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            New
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-700 mb-3">
                                                    {notification.data?.message || ''}
                                                </p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Clock size={14} />
                                                        {formatTime(notification.created_at)}
                                                    </div>
                                                    {notification.data?.unit_name && (
                                                        <div className="flex items-center gap-1">
                                                            <Package size={14} />
                                                            <span className="font-medium text-blue-600">
                                                                {notification.data.unit_name}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {notification.data?.booking_id && (
                                                        <div className="text-gray-600">
                                                            <span className="font-medium">Ref:</span> {notification.data.booking_id}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {!notification.read_at && (
                                            <div className="absolute top-6 right-6 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                                <Bell size={64} className="text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                    No Notifications
                                </h3>
                                <p className="text-gray-500">
                                    You don't have any notifications yet. When you receive notifications about your warehouse bookings, they'll appear here.
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {notifications.data && notifications.data.length > 0 && notifications.links && (
                            <div className="mt-6 flex justify-center gap-2">
                                {notifications.links.map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Notifications;
