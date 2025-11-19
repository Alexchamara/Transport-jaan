import React, { useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function Signin() {
    useEffect(() => {
        // Redirect to the actual login page
        router.visit('/signin');
    }, []);

    return (
        <div className="min-h-screen flex justify-center items-center">
            <div className="text-center">
                <p className="text-lg text-gray-600">Redirecting to login page...</p>
            </div>
        </div>
    );
}
