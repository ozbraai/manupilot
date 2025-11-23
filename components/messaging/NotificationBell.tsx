'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { BellIcon } from '@heroicons/react/24/outline';

type Notification = {
    id: string;
    type: string;
    title: string;
    message: string;
    link: string;
    read: boolean;
    created_at: string;
};

export default function NotificationBell() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadNotifications();

        // Subscribe to new notifications
        const channel = supabase
            .channel('notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
            }, () => {
                loadNotifications();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function loadNotifications() {
        const { data } = await fetch('/api/notifications?unreadOnly=false').then(r => r.json());
        if (data) {
            setNotifications(data.notifications || []);
            setUnreadCount(data.unread_count || 0);
        }
    }

    async function markAsRead(notificationId: string) {
        await fetch('/api/notifications/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationIds: [notificationId] }),
        });
        loadNotifications();
    }

    async function markAllAsRead() {
        setLoading(true);
        await fetch('/api/notifications/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ markAllRead: true }),
        });
        await loadNotifications();
        setLoading(false);
    }

    function handleNotificationClick(notification: Notification) {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        if (notification.link) {
            router.push(notification.link);
        }
        setShowDropdown(false);
    }

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 rounded-lg hover:bg-zinc-100 transition-colors"
                aria-label="Notifications"
            >
                <BellIcon className="w-5 h-5 text-zinc-700" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-zinc-200 z-50 max-h-[32rem] overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
                            <h3 className="font-semibold text-zinc-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    disabled={loading}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500 text-sm">
                                    No notifications yet
                                </div>
                            ) : (
                                <div className="divide-y divide-zinc-100">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`p-4 hover:bg-zinc-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50/50' : ''
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {!notification.read && (
                                                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'} text-zinc-900`}>
                                                        {notification.title}
                                                    </p>
                                                    {notification.message && (
                                                        <p className="text-sm text-zinc-600 mt-0.5 truncate">
                                                            {notification.message}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-zinc-400 mt-1">
                                                        {new Date(notification.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
