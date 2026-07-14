import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export const useCSRFRefresh = () => {
    const { auth } = usePage().props;

    useEffect(() => {
        // Only refresh for authenticated users
        if (!auth?.user) return;

        const refreshCSRFToken = async () => {
            try {
                const response = await fetch('/csrf-token');
                const data = await response.json();
                const metaTag = document.querySelector('meta[name="csrf-token"]');
                if (metaTag && data.token) {
                    metaTag.setAttribute('content', data.token);
                }
            } catch (error) {
                console.error('Failed to refresh CSRF token:', error);
            }
        };

        // Refresh CSRF token every 30 minutes for authenticated users
        const interval = setInterval(refreshCSRFToken, 30 * 60 * 1000);

        // Also refresh on focus (when user returns to tab)
        const handleFocus = () => {
            refreshCSRFToken();
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener('focus', handleFocus);
        };
    }, [auth?.user]);
};

export default useCSRFRefresh;
