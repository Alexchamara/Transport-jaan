import React, { useState, useEffect } from 'react';

/**
 * BookingReferenceInput Component
 * 
 * Input field with real-time validation for booking references
 * Features:
 * - Format validation
 * - Checksum verification
 * - Auto-formatting (uppercase, hyphen insertion)
 * - Visual feedback
 * - Error messages
 */
const BookingReferenceInput = ({ 
    value, 
    onChange, 
    onValidate,
    label = "Booking Reference",
    placeholder = "BUS-XXXXXX-YY",
    error,
    className = "",
    required = false,
    disabled = false
}) => {
    const [localValue, setLocalValue] = useState(value || '');
    const [isValid, setIsValid] = useState(null);
    const [formatError, setFormatError] = useState('');

    // Validate reference format and checksum
    const validateReference = (ref) => {
        if (!ref) {
            setIsValid(null);
            setFormatError('');
            return null;
        }

        // Format: PREFIX-XXXXXX-YY
        const regex = /^[A-Z]{3,4}-[A-Z0-9]{6}-[0-9]{2}$/;
        
        if (!regex.test(ref)) {
            // Check if it's an old format (still valid)
            const oldFormatRegex = /^[A-Z]{3,4}-.+$/;
            if (oldFormatRegex.test(ref)) {
                setIsValid(true);
                setFormatError('');
                return true;
            }
            
            setIsValid(false);
            setFormatError('Invalid format. Expected: PREFIX-XXXXXX-YY');
            return false;
        }

        // Validate checksum
        const parts = ref.split('-');
        if (parts.length === 3) {
            const code = parts[1];
            const providedChecksum = parts[2];
            const calculatedChecksum = calculateChecksum(code);
            
            if (calculatedChecksum !== providedChecksum) {
                setIsValid(false);
                setFormatError('Invalid checksum. Please check the reference.');
                return false;
            }
        }

        setIsValid(true);
        setFormatError('');
        return true;
    };

    // Calculate checksum (matches backend logic)
    const calculateChecksum = (input) => {
        let sum = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input[i];
            let value = isNaN(char) ? char.charCodeAt(0) - 65 + 10 : parseInt(char);
            if (i % 2 === 0) {
                value *= 2;
            }
            sum += value;
        }
        return (sum % 100).toString().padStart(2, '0');
    };

    // Auto-format input
    const formatInput = (input) => {
        // Remove spaces and convert to uppercase
        let formatted = input.toUpperCase().replace(/\s/g, '');
        
        // Remove existing hyphens
        formatted = formatted.replace(/-/g, '');
        
        // Add hyphens at appropriate positions
        if (formatted.length > 3) {
            const prefix = formatted.substring(0, 3);
            const rest = formatted.substring(3);
            
            if (rest.length > 6) {
                const code = rest.substring(0, 6);
                const checksum = rest.substring(6, 8);
                formatted = `${prefix}-${code}${checksum ? '-' + checksum : ''}`;
            } else {
                formatted = `${prefix}-${rest}`;
            }
        }
        
        return formatted;
    };

    const handleChange = (e) => {
        let newValue = e.target.value;
        
        // Auto-format
        if (newValue) {
            newValue = formatInput(newValue);
        }
        
        setLocalValue(newValue);
        
        // Validate
        const valid = validateReference(newValue);
        
        // Call parent onChange
        if (onChange) {
            onChange(newValue);
        }
        
        // Call parent onValidate
        if (onValidate) {
            onValidate(valid);
        }
    };

    // Update local value when prop changes
    useEffect(() => {
        if (value !== localValue) {
            setLocalValue(value || '');
            validateReference(value);
        }
    }, [value]);

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Label */}
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Input with validation indicator */}
            <div className="relative">
                <input
                    type="text"
                    value={localValue}
                    onChange={handleChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`
                        w-full px-4 py-2 pr-12 
                        font-mono text-lg
                        border rounded-lg 
                        focus:ring-2 focus:outline-none
                        transition-colors duration-200
                        ${isValid === true 
                            ? 'border-green-300 focus:ring-green-200 bg-green-50' 
                            : isValid === false 
                            ? 'border-red-300 focus:ring-red-200 bg-red-50' 
                            : 'border-gray-300 focus:ring-blue-200'
                        }
                        ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
                    `}
                    maxLength={15}
                />
                
                {/* Validation Icon */}
                {localValue && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {isValid === true ? (
                            <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : isValid === false ? (
                            <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg className="h-6 w-6 text-gray-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>
                )}
            </div>

            {/* Error Messages */}
            {(error || formatError) && (
                <div className="flex items-start gap-2 text-sm text-red-600">
                    <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error || formatError}</span>
                </div>
            )}

            {/* Success Message */}
            {isValid === true && !error && (
                <div className="flex items-start gap-2 text-sm text-green-600">
                    <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Valid booking reference</span>
                </div>
            )}

            {/* Helper Text */}
            {!localValue && !error && (
                <p className="text-xs text-gray-500">
                    Format: PREFIX-XXXXXX-YY (e.g., BUS-A1B2C3-45)
                </p>
            )}
        </div>
    );
};

export default BookingReferenceInput;
