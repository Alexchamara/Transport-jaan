import { router } from '@inertiajs/react';

/**
 * Get the current CSRF token from meta tag
 */
const getCSRFToken = () => {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    return metaTag ? metaTag.getAttribute('content') : null;
};

/**
 * Refresh the CSRF token from the server
 */
const refreshCSRFToken = async () => {
    try {
        const response = await fetch('/csrf-token', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.token) {
            const metaTag = document.querySelector('meta[name="csrf-token"]');
            if (metaTag) {
                metaTag.setAttribute('content', data.token);
            }
            // Also update axios if available
            if (window.axios) {
                window.axios.defaults.headers.common['X-CSRF-TOKEN'] = data.token;
            }
            return data.token;
        }
    } catch (error) {
        console.error('Failed to refresh CSRF token:', error);
    }
    return null;
};

/**
 * Perform a secure logout with automatic CSRF token refresh on failure
 */
export const handleSecureLogout = async () => {
    // First, try to refresh the CSRF token before attempting logout
    // This helps when the page has been open for a while
    const freshToken = await refreshCSRFToken();
    
    const performLogout = (token) => {
        const headers = token ? { 'X-CSRF-TOKEN': token } : {};
        
        router.post(
            route('logout'),
            {},
            {
                preserveScroll: false,
                preserveState: false,
                headers: headers,
                onError: async (errors) => {
                    console.warn('Logout POST failed:', errors);
                    
                    // Check if we haven't already retried
                    if (!token) {
                        // Already tried with fresh token, go to fallback
                        console.log('Using GET logout fallback');
                        window.location.href = route('logout.alt');
                        return;
                    }
                    
                    // Try refreshing token one more time
                    const newToken = await refreshCSRFToken();
                    if (newToken && newToken !== token) {
                        // Got a different token, retry once
                        performLogout(null); // null indicates this is a retry
                    } else {
                        // Fallback to GET logout
                        console.log('Using GET logout fallback');
                        window.location.href = route('logout.alt');
                    }
                },
                onSuccess: () => {
                    // Force full page reload to clear all state
                    window.location.href = '/';
                },
                onFinish: () => {
                    // If nothing happened, force redirect
                    setTimeout(() => {
                        if (window.location.pathname !== '/') {
                            window.location.href = '/';
                        }
                    }, 2000);
                }
            }
        );
    };
    
    performLogout(freshToken || getCSRFToken());
};

export default handleSecureLogout;
