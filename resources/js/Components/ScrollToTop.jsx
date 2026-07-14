import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTop({ className = '', threshold = 300 }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > threshold) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        
        // Initial check in case the user reloads the page while already scrolled down
        toggleVisibility();

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, [threshold]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <button
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className={`
                fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 p-3 
                rounded-full bg-gray-800 text-white 
                shadow-lg transition-all duration-300 ease-in-out
                hover:bg-gray-700 hover:shadow-xl hover:-translate-y-1
                focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                ${isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}
                ${className}
            `}
        >
            <ChevronUp className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
        </button>
    );
}
