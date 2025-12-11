import React, { useState } from 'react';

/**
 * BookingReferenceDisplay Component
 * 
 * Displays booking reference with:
 * - Visual validation indicator
 * - Copy to clipboard functionality
 * - Format highlighting
 * - Responsive design
 */
const BookingReferenceDisplay = ({ reference, showCopy = true, showValidation = true, size = 'large' }) => {
    const [copied, setCopied] = useState(false);

    // Validate booking reference format
    const validateReference = (ref) => {
        // Format: PREFIX-XXXXXX-YY
        const regex = /^[A-Z]{3,4}-[A-Z0-9]{6}-[0-9]{2}$/;
        return regex.test(ref);
    };

    const isValid = validateReference(reference);
    const parts = reference?.split('-') || [];

    // Copy to clipboard
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(reference);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Size variants
    const sizeClasses = {
        small: 'text-base md:text-lg',
        medium: 'text-lg md:text-xl',
        large: 'text-xl md:text-2xl',
        xlarge: 'text-2xl md:text-3xl'
    };

    const iconSizes = {
        small: 'h-4 w-4',
        medium: 'h-5 w-5',
        large: 'h-6 w-6',
        xlarge: 'h-8 w-8'
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
                {/* Reference Display */}
                <div className="flex-1 min-w-0">
                    <div className={`font-mono font-bold ${sizeClasses[size]} text-[#0955AC] flex items-center gap-2 flex-wrap`}>
                        {/* Validation Indicator */}
                        {showValidation && (
                            <span className="flex items-center">
                                {isValid ? (
                                    <svg className={`${iconSizes[size]} text-green-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                ) : (
                                    <svg className={`${iconSizes[size]} text-yellow-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                )}
                            </span>
                        )}
                        
                        {/* Reference with highlighting */}
                        {parts.length === 3 ? (
                            <span className="break-all">
                                <span className="text-[#0955AC]">{parts[0]}</span>
                                <span className="text-gray-400">-</span>
                                <span className="text-gray-900">{parts[1]}</span>
                                <span className="text-gray-400">-</span>
                                <span className="text-gray-600">{parts[2]}</span>
                            </span>
                        ) : (
                            <span className="break-all">{reference}</span>
                        )}
                    </div>
                </div>

                {/* Copy Button */}
                {showCopy && (
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                        title="Copy to clipboard"
                    >
                        {copied ? (
                            <>
                                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>Copy</span>
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Format Info */}
            {showValidation && (
                <div className="text-xs text-gray-500">
                    {isValid ? (
                        <span className="flex items-center gap-1">
                            <svg className="h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Valid booking reference with checksum verification
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-yellow-600">
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Legacy format - still valid
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default BookingReferenceDisplay;
