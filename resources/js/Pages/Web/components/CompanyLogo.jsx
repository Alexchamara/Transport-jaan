import React, { useState, useEffect } from 'react';

const CompanyLogo = ({ className = 'h-[40px] object-contain', fallbackClassName = 'text-white text-[25px] font-bold poppins' }) => {
    const [currentLogo, setCurrentLogo] = useState(null);
    const [loading, setLoading] = useState(true);

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
        return <div className={fallbackClassName}>COMPANY LOGO</div>;
    }

    if (currentLogo) {
        return (
            <img 
                src={currentLogo} 
                alt='Company Logo' 
                className={className}
                onError={() => setCurrentLogo(null)}
            />
        );
    }

    return <div className={fallbackClassName}>COMPANY LOGO</div>;
};

export default CompanyLogo;
