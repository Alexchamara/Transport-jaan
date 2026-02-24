import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Upload, X, Save } from 'lucide-react';
import SideMenu from '../../components/SuperAdmin/Dashboard1/SideMenu';

const WebsiteSettings = () => {
    const { props } = usePage();
    const [websiteLogoPreview, setWebsiteLogoPreview] = useState(null);
    const [websiteLogoFile, setWebsiteLogoFile] = useState(null);
    const [logoUploading, setLogoUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [currentLogo, setCurrentLogo] = useState(null);
    const [logoLoadError, setLogoLoadError] = useState(false);

    // Fetch current logo on mount
    useEffect(() => {
        fetchCurrentLogo();
    }, []);

    // Reset logo load error when currentLogo changes
    useEffect(() => {
        if (currentLogo) {
            setLogoLoadError(false);
        }
    }, [currentLogo]);

    const getCsrfToken = () => {
        // Try multiple methods to get CSRF token
        const metaToken = document.querySelector('meta[name="csrf-token"]')?.content;
        const inputToken = document.querySelector('input[name="_token"]')?.value;
        const propsToken = props?.csrf_token;
        
        const token = metaToken || inputToken || propsToken || '';
        
        console.log('CSRF Token Sources:', {
            metaToken: !!metaToken,
            inputToken: !!inputToken,
            propsToken: !!propsToken,
            selectedToken: token ? token.substring(0, 10) + '...' : 'NONE'
        });
        
        if (!token) {
            console.error('CSRF token not found! This will cause 419 errors.');
        }
        return token;
    };

    const fetchCurrentLogo = async () => {
        try {
            const response = await fetch('/superadmin/settings/website/current-logo', {
                headers: {
                    'Accept': 'application/json',
                },
            });
            const result = await response.json();
            console.log('Current logo response:', result);
            if (result.logo) {
                console.log('Setting current logo to:', result.logo);
                setCurrentLogo(result.logo);
            }
        } catch (err) {
            console.error('Error fetching current logo:', err);
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        setWebsiteLogoFile(file);
        setError('');
        setLogoLoadError(false);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setWebsiteLogoPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleLogoUpload = async () => {
        if (!websiteLogoFile) {
            setError('Please select a logo file');
            return;
        }

        setLogoUploading(true);
        const formDataToSend = new FormData();
        formDataToSend.append('logo', websiteLogoFile);

        const csrfToken = getCsrfToken();
        console.log('Upload attempt with CSRF token:', csrfToken ? 'TOKEN FOUND' : 'NO TOKEN!');

        try {
            const response = await fetch('/superadmin/settings/website/logo', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: formDataToSend,
            });

            const contentType = response.headers.get('content-type');
            console.log('Upload response status:', response.status);
            console.log('Content-Type:', contentType);

            if (!response.ok) {
                const text = await response.text();
                console.error('Response text:', text.substring(0, 200));
                throw new Error(`Upload failed with status ${response.status}`);
            }

            const result = await response.json();
            console.log('Upload result:', result);

            if (!result.success) {
                throw new Error(result.message || 'Failed to upload logo');
            }

            setSuccess('Logo uploaded successfully');
            setWebsiteLogoFile(null);
            setWebsiteLogoPreview(null);
            setLogoLoadError(false);
            setCurrentLogo(result.logo);
            // Dispatch custom event to update sidebar logo
            window.dispatchEvent(new CustomEvent('logoUpdated', { detail: result.logo }));
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload logo');
        } finally {
            setLogoUploading(false);
        }
    };

    const handleCancelUpload = () => {
        setWebsiteLogoFile(null);
        setWebsiteLogoPreview(null);
        setLogoLoadError(false);
        setError('');
    };

    return (
        <>
            <Head title="Website Settings" />

            <div className='flex flex-row bg-[#081028] min-h-screen poppins'>
                <div className='sm:w-full md:w-auto lg:w-auto'>
                    <SideMenu />
                </div>

                <div className='flex-1 p-8'>
                    <div className='max-w-6xl mx-auto'>
                        {/* Header */}
                        <div className='mb-8'>
                            <h1 className='text-3xl font-bold text-white mb-2'>Website Settings</h1>
                            <p className='text-gray-400'>Manage your website branding and configuration</p>
                        </div>

                        {/* Success Message */}
                        {success && (
                            <div className='mb-6 bg-green-600/20 border border-green-600 text-green-400 px-4 py-3 rounded-lg flex justify-between items-center'>
                                {success}
                                <button onClick={() => setSuccess('')} className='text-green-400 hover:text-green-300'>
                                    <X size={18} />
                                </button>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className='mb-6 bg-red-600/20 border border-red-600 text-red-400 px-4 py-3 rounded-lg flex justify-between items-center'>
                                {error}
                                <button onClick={() => setError('')} className='text-red-400 hover:text-red-300'>
                                    <X size={18} />
                                </button>
                            </div>
                        )}

                        {/* Logo Settings Section */}
                        <div className='bg-[#0A1330] border border-gray-700 rounded-lg p-8'>
                            <h2 className='text-2xl font-semibold text-white mb-6'>Website Logo</h2>
                            
                            <div className='space-y-6'>
                                {/* Current Logo Display */}
                                {(currentLogo || websiteLogoPreview) && (
                                    <div className='space-y-3'>
                                        <p className='text-sm font-medium text-gray-200'>Current Logo</p>
                                        <div className='w-48 h-48 bg-[#081028] border border-gray-600 rounded-lg flex items-center justify-center overflow-hidden'>
                                            {websiteLogoPreview ? (
                                                <img 
                                                    src={websiteLogoPreview} 
                                                    alt='Logo Preview' 
                                                    className='w-full h-full object-contain p-4'
                                                    onError={(e) => {
                                                        console.error('Logo preview failed to load:', websiteLogoPreview);
                                                        setLogoLoadError(true);
                                                    }}
                                                />
                                            ) : currentLogo && !logoLoadError ? (
                                                <img 
                                                    src={currentLogo} 
                                                    alt='Current Logo' 
                                                    className='w-full h-full object-contain p-4'
                                                    onError={(e) => {
                                                        console.error('Current logo failed to load:', currentLogo, 'Error:', e);
                                                        setLogoLoadError(true);
                                                    }}
                                                />
                                            ) : (
                                                <div className='text-center text-gray-500'>
                                                    <Upload className='w-8 h-8 mx-auto mb-2' />
                                                    <p className='text-xs'>No logo available</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Upload Section */}
                                <div className='space-y-4'>
                                    <div className='space-y-2'>
                                        <label className='block text-sm font-medium text-gray-200'>
                                            Upload Logo
                                        </label>
                                        <p className='text-xs text-gray-400'>
                                            Recommended size: 200x200px or higher
                                            <br />
                                            Supported formats: PNG, JPG, GIF, SVG
                                            <br />
                                            Maximum file size: 5MB
                                        </p>
                                    </div>

                                    <div className='relative'>
                                        <input
                                            type='file'
                                            id='logo-input'
                                            accept='image/*'
                                            onChange={handleLogoChange}
                                            className='hidden'
                                        />
                                        <label 
                                            htmlFor='logo-input'
                                            className='flex items-center justify-center px-6 py-3 bg-[#081028] border-2 border-dashed border-gray-600 rounded-lg text-white cursor-pointer hover:bg-[#0F1A35] hover:border-gray-500 transition-colors duration-200'
                                        >
                                            <Upload className='w-5 h-5 mr-2' />
                                            Choose Logo File
                                        </label>
                                    </div>

                                    {websiteLogoFile && (
                                        <div className='space-y-3 p-4 bg-[#081028] border border-gray-600 rounded-lg'>
                                            <div className='text-sm text-gray-300'>
                                                <p className='font-medium mb-1'>Selected File:</p>
                                                <p className='text-gray-400'>{websiteLogoFile.name}</p>
                                                <p className='text-gray-400 text-xs mt-1'>
                                                    Size: {(websiteLogoFile.size / 1024).toFixed(2)} KB
                                                </p>
                                            </div>
                                            
                                            <div className='flex gap-2'>
                                                <button
                                                    onClick={handleLogoUpload}
                                                    disabled={logoUploading}
                                                    className='flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'
                                                >
                                                    <Save className='w-4 h-4 mr-2' />
                                                    {logoUploading ? 'Uploading...' : 'Upload Logo'}
                                                </button>
                                                <button
                                                    onClick={handleCancelUpload}
                                                    className='px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors duration-200'
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className='mt-8 bg-[#0A1330] border border-gray-700 rounded-lg p-6'>
                            <h3 className='text-lg font-semibold text-white mb-3'>Logo Guidelines</h3>
                            <div className='space-y-3 text-sm text-gray-300'>
                                <div className='flex items-start space-x-2'>
                                    <div className='w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0'></div>
                                    <p>The logo will be displayed in the website header and footer</p>
                                </div>
                                <div className='flex items-start space-x-2'>
                                    <div className='w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0'></div>
                                    <p>Use a high-resolution image for better quality (preferably PNG with transparent background)</p>
                                </div>
                                <div className='flex items-start space-x-2'>
                                    <div className='w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0'></div>
                                    <p>Recommended dimensions: 200x200px (square) or 400x100px (landscape)</p>
                                </div>
                                <div className='flex items-start space-x-2'>
                                    <div className='w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0'></div>
                                    <p>Maximum file size is 5MB. Larger files will be rejected</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WebsiteSettings;
