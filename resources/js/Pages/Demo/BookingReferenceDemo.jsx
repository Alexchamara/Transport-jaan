import React, { useState } from 'react';
import BookingReferenceDisplay from '../../Components/BookingReferenceDisplay';
import BookingReferenceInput from '../../Components/BookingReferenceInput';

/**
 * Booking Reference Components Demo Page
 * 
 * Demonstrates the security-enhanced booking reference components
 */
const BookingReferenceDemo = () => {
    const [inputValue, setInputValue] = useState('');
    const [isValidInput, setIsValidInput] = useState(null);

    // Example references
    const secureReference = 'BUS-Q2TK88-56';
    const oldReference = 'BUS-EXPIRED-693AE52E4E182';
    const invalidReference = 'BUS-ABCDEF-99';

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        🔒 Booking Reference Security Components
                    </h1>
                    <p className="text-xl text-gray-600">
                        Enhanced security with cryptographic validation and user-friendly interface
                    </p>
                </div>

                {/* Component 1: Display Component */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        1. BookingReferenceDisplay Component
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Displays booking references with validation indicators, copy functionality, and format highlighting.
                    </p>

                    <div className="space-y-8">
                        {/* Secure Format Example */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                ✅ Secure Format (New)
                            </h3>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <BookingReferenceDisplay
                                    reference={secureReference}
                                    size="large"
                                    showCopy={true}
                                    showValidation={true}
                                />
                            </div>
                            <div className="mt-3 text-sm text-gray-600 space-y-1">
                                <p>• Format: <code className="bg-gray-100 px-2 py-1 rounded">PREFIX-XXXXXX-YY</code></p>
                                <p>• Cryptographically secure random generation</p>
                                <p>• Checksum validation (last 2 digits)</p>
                                <p>• 2.1 billion possible combinations</p>
                            </div>
                        </div>

                        {/* Old Format Example */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                ⚠️ Legacy Format (Still Valid)
                            </h3>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                                <BookingReferenceDisplay
                                    reference={oldReference}
                                    size="large"
                                    showCopy={true}
                                    showValidation={true}
                                />
                            </div>
                            <div className="mt-3 text-sm text-gray-600">
                                <p>• Old format using <code className="bg-gray-100 px-2 py-1 rounded">uniqid()</code></p>
                                <p>• Still accepted for backward compatibility</p>
                            </div>
                        </div>

                        {/* Size Variants */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                Size Variants
                            </h3>
                            <div className="space-y-4">
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-2">Small</p>
                                    <BookingReferenceDisplay reference={secureReference} size="small" />
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-2">Medium</p>
                                    <BookingReferenceDisplay reference={secureReference} size="medium" />
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-2">Large</p>
                                    <BookingReferenceDisplay reference={secureReference} size="large" />
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-2">X-Large</p>
                                    <BookingReferenceDisplay reference={secureReference} size="xlarge" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Component 2: Input Component */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        2. BookingReferenceInput Component
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Input field with real-time validation, auto-formatting, and checksum verification.
                    </p>

                    <div className="space-y-6">
                        {/* Interactive Input */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                Try It Out
                            </h3>
                            <BookingReferenceInput
                                value={inputValue}
                                onChange={setInputValue}
                                onValidate={setIsValidInput}
                                label="Enter Booking Reference"
                                placeholder="BUS-XXXXXX-YY"
                                required={true}
                            />
                            
                            {/* Validation Status */}
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm font-semibold text-gray-700 mb-2">Validation Status:</p>
                                <div className="flex items-center gap-2">
                                    {isValidInput === true && (
                                        <span className="text-green-600 font-medium">✓ Valid reference</span>
                                    )}
                                    {isValidInput === false && (
                                        <span className="text-red-600 font-medium">✗ Invalid reference</span>
                                    )}
                                    {isValidInput === null && (
                                        <span className="text-gray-500">Waiting for input...</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Test Buttons */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">
                                Quick Test
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setInputValue(secureReference)}
                                    className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-sm font-medium"
                                >
                                    Try Valid Reference
                                </button>
                                <button
                                    onClick={() => setInputValue(invalidReference)}
                                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-medium"
                                >
                                    Try Invalid Checksum
                                </button>
                                <button
                                    onClick={() => setInputValue('BUS-ABC123')}
                                    className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg text-sm font-medium"
                                >
                                    Try Invalid Format
                                </button>
                                <button
                                    onClick={() => setInputValue('')}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Overview */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Security Features
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Cryptographic Security</h3>
                                <p className="text-sm text-gray-600">Uses PHP's random_bytes() for unpredictable generation</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Checksum Validation</h3>
                                <p className="text-sm text-gray-600">Detects 97% of typos and invalid references</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Auto-Formatting</h3>
                                <p className="text-sm text-gray-600">Automatically formats input with proper hyphens</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Visual Feedback</h3>
                                <p className="text-sm text-gray-600">Real-time validation with color-coded indicators</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">One-Click Copy</h3>
                                <p className="text-sm text-gray-600">Easy clipboard copy with confirmation feedback</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Responsive Design</h3>
                                <p className="text-sm text-gray-600">Works seamlessly on all device sizes</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Usage Examples */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Usage Examples
                    </h2>
                    
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Display Component</h3>
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`<BookingReferenceDisplay 
    reference="BUS-Q2TK88-56"
    size="large"
    showCopy={true}
    showValidation={true}
/>`}
                            </pre>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Input Component</h3>
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`<BookingReferenceInput
    value={value}
    onChange={setValue}
    onValidate={setIsValid}
    label="Booking Reference"
    required={true}
/>`}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingReferenceDemo;
