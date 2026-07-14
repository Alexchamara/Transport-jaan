import '../css/app.css';
import './bootstrap';

import { BrowserRouter } from 'react-router-dom'; 
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import ScrollToTop from './Components/ScrollToTop';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Initialize CSRF token on page load
const initializeCSRF = async () => {
    try {
        const response = await fetch('/csrf-token', {
            credentials: 'same-origin',
            headers: { 'Accept': 'application/json' }
        });
        const data = await response.json();
        if (data.token) {
            const metaTag = document.querySelector('meta[name="csrf-token"]');
            if (metaTag) {
                metaTag.setAttribute('content', data.token);
            }
            if (window.axios) {
                window.axios.defaults.headers.common['X-CSRF-TOKEN'] = data.token;
            }
        }
    } catch (error) {
        // Silent fail - the existing token from blade template should work
        console.debug('CSRF initialization check:', error.message);
    }
};

// Initialize CSRF token
initializeCSRF();

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <ScrollToTop />
            </>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
