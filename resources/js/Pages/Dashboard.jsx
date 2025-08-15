import { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ user }) {
    // Auto-redirect based on user role type
    useEffect(() => {

    }, [user]);


}
