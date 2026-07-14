import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { router } from "@inertiajs/react";
import axios from "axios";
import { Bell, CheckCheck, Circle, Trash2 } from "lucide-react";

const REFRESH_INTERVAL_MS = 30000;

const NotificationDropdown = ({ bellIcon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);
    const rootRef = useRef(null);

    const sortedNotifications = useMemo(
        () => [...notifications].sort((a, b) => {
            const aTime = Date.parse(a?.created_at_iso || a?.timestamp || "");
            const bTime = Date.parse(b?.created_at_iso || b?.timestamp || "");
            return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
        }),
        [notifications]
    );

    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await axios.get("/vendors/notifications/count");
            setUnreadCount(Number(response?.data?.count || 0));
        } catch (error) {
            // ignore background polling failures
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get("/vendors/notifications/data", {
                params: { limit: 40 },
            });
            const rows = Array.isArray(response?.data?.notifications) ? response.data.notifications : [];
            setNotifications(rows);
            setUnreadCount(Number(response?.data?.unread_count || 0));
        } catch (error) {
            // ignore; dropdown should remain usable even if request fails
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUnreadCount();

        const timer = window.setInterval(() => {
            if (document.visibilityState === "visible") {
                fetchUnreadCount();
            }
        }, REFRESH_INTERVAL_MS);

        return () => window.clearInterval(timer);
    }, [fetchUnreadCount]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        fetchNotifications();
    }, [isOpen, fetchNotifications]);

    useEffect(() => {
        const onClickOutside = (event) => {
            if (rootRef.current && !rootRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const onEscape = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", onClickOutside);
        document.addEventListener("keydown", onEscape);

        return () => {
            document.removeEventListener("mousedown", onClickOutside);
            document.removeEventListener("keydown", onEscape);
        };
    }, []);

    const markAsRead = async (notificationId) => {
        try {
            await axios.post(`/vendors/notifications/${notificationId}/read`);
            setNotifications((prev) => prev.map((item) => {
                if (item.id !== notificationId) {
                    return item;
                }

                return {
                    ...item,
                    is_read: true,
                    read_at: item.read_at || new Date().toISOString(),
                };
            }));
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            // ignore action failure to avoid breaking dropdown UX
        }
    };

    const markAllAsRead = async () => {
        if (markingAll || unreadCount <= 0) {
            return;
        }

        setMarkingAll(true);
        try {
            await axios.post("/vendors/notifications/mark-all-read");
            setNotifications((prev) => prev.map((item) => ({
                ...item,
                is_read: true,
                read_at: item.read_at || new Date().toISOString(),
            })));
            setUnreadCount(0);
        } catch (error) {
            // ignore
        } finally {
            setMarkingAll(false);
        }
    };

    const deleteNotification = async (notificationId) => {
        const target = notifications.find((item) => item.id === notificationId);
        try {
            await axios.delete(`/vendors/notifications/${notificationId}`);
            setNotifications((prev) => prev.filter((item) => item.id !== notificationId));
            if (target && !target.is_read) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
            }
        } catch (error) {
            // ignore
        }
    };

    const openNotification = async (notification) => {
        if (!notification) {
            return;
        }

        if (!notification.is_read) {
            await markAsRead(notification.id);
        }

        const targetUrl = String(notification.action_url || "").trim();
        if (targetUrl !== "") {
            setIsOpen(false);
            router.visit(targetUrl);
        }
    };

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="h-10 w-10 rounded-[12px] bg-[#E8EBEF] hover:bg-[#DCE2EA] transition flex items-center justify-center relative"
                aria-label="Open notifications"
                title="Notifications"
            >
                {bellIcon ? (
                    <img src={bellIcon} alt="Notifications" className="w-[20px] h-[20px]" />
                ) : (
                    <Bell size={20} className="text-[#101828]" />
                )}

                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E11D48] text-white text-[10px] font-[700] leading-[18px] text-center">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-6 w-[400px] rounded-[18px] border border-[#D9E1EC] bg-[#F4F6FA] shadow-[0_24px_48px_rgba(15,23,42,0.20)] z-[80] overflow-hidden">
                    <div className="px-6 py-6 border-b border-[#D5DCE7] flex items-center justify-between">
                        <h3 className="text-[20px] leading-none font-[700] text-[#1E293B]">
                            <span className="inline-block px-2 py-1 text-[20px] leading-none">Notifications</span>
                        </h3>

                        {sortedNotifications.length > 0 && (
                            <button
                                type="button"
                                onClick={markAllAsRead}
                                disabled={markingAll || unreadCount <= 0}
                                className="inline-flex items-center gap-2 px-3 py-2 rounded-[10px] bg-white border border-[#D1D9E6] text-[12px] font-[700] text-[#0955AC] disabled:opacity-50"
                            >
                                <CheckCheck size={14} />
                                {markingAll ? "Updating..." : "Mark all read"}
                            </button>
                        )}
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto">
                        {loading ? (
                            <div className="px-6 py-20 text-center text-[#667085] text-[15px]">Loading notifications...</div>
                        ) : sortedNotifications.length === 0 ? (
                            <div className="px-6 py-20 text-center">
                                <div className="mx-auto mb-6 h-20 w-20 rounded-full border border-[#DEE4EE] bg-white flex items-center justify-center">
                                    <Bell size={44} className="text-[#C1C8D4]" strokeWidth={1.8} />
                                </div>
                                <p className="text-[30px] sm:text-[24px] leading-tight font-[500] text-[#6B7280]">No notifications yet</p>
                                <p className="mt-3 text-[20px] sm:text-[18px] leading-tight text-[#9CA3AF]">We&apos;ll notify you when something arrives</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#E2E8F0]">
                                {sortedNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`group px-6 py-4 transition-colors ${notification.is_read ? "bg-transparent" : "bg-[#EAF2FF]"} hover:bg-[#EDF3FB]`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <button
                                                type="button"
                                                onClick={() => openNotification(notification)}
                                                className="flex-1 text-left min-w-0"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {!notification.is_read && <Circle size={8} className="fill-[#0955AC] text-[#0955AC]" />}
                                                    <p className="text-[15px] font-[700] text-[#0F172A] truncate">
                                                        {notification.title || "Notification"}
                                                    </p>
                                                </div>

                                                <p className="mt-1 text-[14px] text-[#475467] break-words">
                                                    {notification.message || "You have a new notification."}
                                                </p>

                                                <p className="mt-2 text-[12px] text-[#98A2B3]">
                                                    {notification.created_at || "Just now"}
                                                </p>
                                            </button>

                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!notification.is_read && (
                                                    <button
                                                        type="button"
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="h-8 px-2 rounded-[8px] text-[11px] font-[700] text-[#0955AC] hover:bg-white border border-transparent hover:border-[#D1D9E6]"
                                                    >
                                                        Read
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="h-8 w-8 rounded-[8px] text-[#98A2B3] hover:text-[#DC2626] hover:bg-white border border-transparent hover:border-[#D1D9E6] flex items-center justify-center"
                                                    title="Delete notification"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {sortedNotifications.length > 0 && (
                        <div className="px-6 py-4 border-t border-[#D5DCE7] bg-[#F0F4FA]">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    router.visit("/vendors/notifications");
                                }}
                                className="text-[13px] font-[700] text-[#0955AC] hover:text-[#07458D]"
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
