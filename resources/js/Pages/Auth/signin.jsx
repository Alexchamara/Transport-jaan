import React, { useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function Signin() {
    useEffect(() => {
        // Redirect to the web signin page
        window.location.replace('/signin');
    }, []);

    return (
        <div className="min-h-screen flex justify-center items-center">
            <div className="text-center">
                <p className="text-lg text-gray-600">Redirecting to sign in page...</p>
            </div>
        </div>
    );
}
