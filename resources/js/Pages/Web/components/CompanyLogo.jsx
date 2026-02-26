import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';

const CompanyLogo = ({ 
    className = 'h-[40px] object-contain', 
    fallbackClassName = 'text-white text-[25px] font-bold poppins',
    enableLink = true,
    href = '/'
}) => {
    const [currentLogo, setCurrentLogo] = useState(null);
    const [loading, setLoading] = useState(true);
    const { auth } = usePage().props;

    useEffect(() => {
        fetchCurrentLogo();

        // Listen for logo updates (same tab)
        const handleLogoUpdate = () => {
            fetchCurrentLogo();
        };

        // Listen for storage changes (cross-tab communication)
        const handleStorageChange = (e) => {
            if (e.key === 'websiteLogoUpdated') {
                fetchCurrentLogo();
            }
        };

        window.addEventListener('logoUpdated', handleLogoUpdate);
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('logoUpdated', handleLogoUpdate);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const fetchCurrentLogo = async () => {
        try {
            setLoading(true);
            const response = await fetch('/website/logo/current', {
                headers: {
                    'Accept': 'application/json',
                },
                signal: AbortSignal.timeout(5000), // 5 second timeout
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const result = await response.json();
            if (result.logo) {
                setCurrentLogo(result.logo);
            } else {
                setCurrentLogo(null);
            }
        } catch (err) {
            // Silently fail - log only if not a network/timeout error
            if (err.name !== 'AbortError') {
                console.debug('Logo fetch failed (non-critical):', err.message);
            }
            setCurrentLogo(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        const content = <div className={fallbackClassName}>COMPANY LOGO</div>;
        return enableLink ? <Link href={href} className="cursor-pointer">{content}</Link> : content;
    }

    if (currentLogo) {
        const content = (
            <img 
                src={currentLogo} 
                alt='Company Logo' 
                className={`${className} ${enableLink ? 'cursor-pointer' : ''}`}
                onError={() => setCurrentLogo(null)}
            />
        );
        return enableLink ? <Link href={href}>{content}</Link> : content;
    }

    const content = <div className={fallbackClassName}>COMPANY LOGO</div>;
    return enableLink ? <Link href={href} className="cursor-pointer">{content}</Link> : content;
};

export default CompanyLogo;
