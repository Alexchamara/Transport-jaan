import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import SideMenu from '../../components/SuperAdmin/Dashboard1/SideMenu';

const Profile = ({ auth, adminProfile, errors }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(
        adminProfile?.avatar ? `/storage/${adminProfile.avatar}` : null
    );
    
    const { data, setData, post, processing } = useForm({
        name: adminProfile?.name || auth.user.name || '',
        email: adminProfile?.email || auth.user.email || '',
        phone: adminProfile?.phone || '',
        bio: adminProfile?.bio || '',
        department: adminProfile?.department || '',
        position: adminProfile?.position || '',
        avatar: null,
        password: '',
        password_confirmation: '',
        _method: 'PUT',
    });

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('avatar', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('superadmin.profile.update'), {
            onSuccess: () => {
                setIsEditing(false);
                setData('password', '');
                setData('password_confirmation', '');
            },
        });
    };

    return (
        <>
            <Head title="Profile" />
            <div className="flex flex-row bg-[#081028] min-h-screen poppins">
                <div className="sm:w-full md:w-auto lg:w-auto">
                    <SideMenu />
                </div>

                <div className="flex flex-col gap-5 poppins w-full px-12 py-8">
                    {/* Header */}
                    <div className="flex flex-row justify-between items-center mb-6">
                        <h1 className="text-white text-[24px] font-poppins">My Profile</h1>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-6 py-2 bg-[#0E43FB] text-white text-[14px] rounded-[5px] hover:bg-[#0E43FB]/80 transition-colors"
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>

                    {/* Profile Card */}
                    <div className="max-w-3xl">
                        <div className="border border-[#343B4F] bg-[#0B1739] rounded-[10px] p-8">
                            <form onSubmit={handleSubmit}>
                                {/* Profile Picture Section */}
                                <div className="flex items-center gap-6 mb-8 pb-8 border-b border-[#343B4F]">
                                    <div className="relative">
                                        <div className="w-24 h-24 bg-[#343B4F] rounded-full flex items-center justify-center overflow-hidden">
                                            {avatarPreview ? (
                                                <img
                                                    src={avatarPreview}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-white text-3xl font-semibold">
                                                    {auth.user.name?.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        {isEditing && (
                                            <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#0E43FB] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#0E43FB]/80 transition-colors">
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M14 6.33333L9.66667 2L1.33333 10.3333V14.6667H5.66667L14 6.33333Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <path d="M8 3.66667L12.3333 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleAvatarChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-white text-xl font-semibold">
                                            {adminProfile?.name || auth.user.name}
                                        </h2>
                                        <p className="text-[#AEB9E1] text-sm">
                                            {adminProfile?.email || auth.user.email}
                                        </p>
                                        <span className="inline-block mt-2 px-3 py-1 bg-[#0E43FB]/20 text-[#0E43FB] text-xs rounded-full">
                                            Super Admin
                                        </span>
                                        {isEditing && (
                                            <p className="text-[#AEB9E1] text-xs mt-2">Click the edit icon to change profile picture</p>
                                        )}
                                    </div>
                                </div>

                                {/* Profile Information */}
                                <div className="space-y-6">
                                    {/* Name Field */}
                                    <div>
                                        <label className="block text-[#AEB9E1] text-sm mb-2">
                                            Full Name
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="w-full px-4 py-3 bg-[#0B1739] border border-[#343B4F] rounded-[5px] text-white text-sm focus:outline-none focus:border-[#0E43FB]"
                                                required
                                            />
                                        ) : (
                                            <p className="text-white text-sm px-4 py-3 bg-[#0B1739] border border-[#343B4F] rounded-[5px]">
                                                {adminProfile?.name || auth.user.name}
                                            </p>
                                        )}
                                        {errors.name && (
                                            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                                        )}
                                    </div>

                                    {/* Email Field */}
                                    <div>
                                        <label className="block text-[#AEB9E1] text-sm mb-2">
                                            Email Address
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="w-full px-4 py-3 bg-[#0B1739] border border-[#343B4F] rounded-[5px] text-white text-sm focus:outline-none focus:border-[#0E43FB]"
                                                required
                                            />
                                        ) : (
                                            <p className="text-white text-sm px-4 py-3 bg-[#0B1739] border border-[#343B4F] rounded-[5px]">
                                                {adminProfile?.email || auth.user.email}
                                            </p>
                                        )}
                                        {errors.email && (
                                            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                        )}
                                    </div>

                                    {/* Phone Field */}
                                    <div>
                                        <label className="block text-[#AEB9E1] text-sm mb-2">
                                            Phone Number
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                className="w-full px-4 py-3 bg-[#0B1739] border border-[#343B4F] rounded-[5px] text-white text-sm focus:outline-none focus:border-[#0E43FB]"
                                            />
                                        ) : (
                                            <p className="text-white text-sm px-4 py-3 bg-[#0B1739] border border-[#343B4F] rounded-[5px]">
                                                {adminProfile?.phone || 'Not set'}
                                            </p>
                                        )}
                                        {errors.phone && (
                                            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                                        )}
                                    </div>

                                    {/* Password Change Section - Only visible when editing */}
                                    {isEditing && (
                                        <>
                                            <div className="pt-6 border-t border-[#343B4F]">
                                                <h3 className="text-white text-lg mb-4">Change Password</h3>
                                                
                                                {/* New Password */}
                                                <div className="mb-4">
                                                    <label className="block text-[#AEB9E1] text-sm mb-2">
                                                        New Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={data.password}
                                                        onChange={(e) => setData('password', e.target.value)}
                                                        className="w-full px-4 py-3 bg-[#0B1739] border border-[#343B4F] rounded-[5px] text-white text-sm focus:outline-none focus:border-[#0E43FB]"
                                                        placeholder="Enter new password"
                                                    />
                                                    {errors.password && (
                                                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                                                    )}
                                                </div>

                                                {/* Confirm Password */}
                                                <div>
                                                    <label className="block text-[#AEB9E1] text-sm mb-2">
                                                        Confirm New Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={data.password_confirmation}
                                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                                        className="w-full px-4 py-3 bg-[#0B1739] border border-[#343B4F] rounded-[5px] text-white text-sm focus:outline-none focus:border-[#0E43FB]"
                                                        placeholder="Confirm new password"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Action Buttons - Only visible when editing */}
                                    {isEditing && (
                                        <div className="flex gap-4 pt-6">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="px-6 py-3 bg-[#0E43FB] text-white text-sm rounded-[5px] hover:bg-[#0E43FB]/80 transition-colors disabled:opacity-50"
                                            >
                                                {processing ? 'Saving...' : 'Save Changes'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setData({
                                                        name: adminProfile?.name || auth.user.name || '',
                                                        email: adminProfile?.email || auth.user.email || '',
                                                        phone: adminProfile?.phone || '',
                                                        bio: adminProfile?.bio || '',
                                                        department: adminProfile?.department || '',
                                                        position: adminProfile?.position || '',
                                                        avatar: null,
                                                        password: '',
                                                        password_confirmation: '',
                                                        _method: 'PUT',
                                                    });
                                                }}
                                                className="px-6 py-3 bg-[#343B4F] text-white text-sm rounded-[5px] hover:bg-[#343B4F]/80 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;
