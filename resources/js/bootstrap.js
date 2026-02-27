import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Set the base URL for API requests - use relative URL so it always matches the current server
window.axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || '/';

// Enable credentials (cookies) for all requests
window.axios.defaults.withCredentials = true;
window.axios.defaults.withXSRFToken = true;

// Function to get fresh CSRF token from meta tag
const getCSRFToken = () => {
    const token = document.head.querySelector('meta[name="csrf-token"]');
    return token ? token.content : null;
};

// Set initial CSRF token
let csrfToken = getCSRFToken();
if (csrfToken) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

// Add request interceptor to always use fresh CSRF token
window.axios.interceptors.request.use((config) => {
    // Get fresh token on each request
    const freshToken = getCSRFToken();
    if (freshToken) {
        config.headers['X-CSRF-TOKEN'] = freshToken;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Add response interceptor to handle 419 errors
window.axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If we get a 419 (CSRF token mismatch), try to refresh the token and retry
        if (error.response?.status === 419 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Try to get a fresh CSRF token
                const response = await fetch('/csrf-token', {
                    credentials: 'same-origin'
                });
                const data = await response.json();
                
                if (data.token) {
                    // Update the meta tag
                    const metaTag = document.head.querySelector('meta[name="csrf-token"]');
                    if (metaTag) {
                        metaTag.setAttribute('content', data.token);
                    }
                    
                    // Update axios defaults
                    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = data.token;
                    originalRequest.headers['X-CSRF-TOKEN'] = data.token;
                    
                    // Retry the request
                    return window.axios(originalRequest);
                }
            } catch (refreshError) {
                console.error('Failed to refresh CSRF token:', refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

// Export helper function to refresh CSRF token manually
window.refreshCSRFToken = async () => {
    try {
        const response = await fetch('/csrf-token', { credentials: 'same-origin' });
        const data = await response.json();
        if (data.token) {
            const metaTag = document.head.querySelector('meta[name="csrf-token"]');
            if (metaTag) {
                metaTag.setAttribute('content', data.token);
            }
            window.axios.defaults.headers.common['X-CSRF-TOKEN'] = data.token;
            return data.token;
        }
    } catch (error) {
        console.error('Failed to refresh CSRF token:', error);
    }
    return null;
};
