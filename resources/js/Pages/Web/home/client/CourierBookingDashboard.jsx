import React, { useEffect, useMemo, useState } from 'react'
import { useForm, usePage, Link, router } from '@inertiajs/react';
import Header from "./ClientHeader";
import HeroEnhanced from "../../components/client/courierBooking/HeroEnhanced";

const FAVORITES_PAGE_SIZE = 2;

const CourierBookingDashboard = () => {
    const { shipments, statistics, monthlyData, favoriteRecipients = [], countries = [] } = usePage().props;
    const [showAddModal, setShowAddModal] = useState(false);
    const [favoritesPage, setFavoritesPage] = useState(1);
    const defaultCountry = countries[0] || 'US';
    const countryOptions = countries.length > 0 ? countries : [defaultCountry];
    const buildFavoriteForm = () => ({
        recipient: {
            name: '',
            email: '',
            phone: '',
            company: '',
            address: {
                line1: '',
                line2: '',
                city: '',
                state: '',
                postalCode: '',
                country: defaultCountry,
                instructions: '',
            },
        },
    });

    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm(buildFavoriteForm());

    const formatFavoriteAddress = (address) => {
        if (!address) {
            return '';
        }

        const street = [address.line1, address.line2].filter(Boolean).join(', ');
        const locality = [address.city, address.state, address.postalCode].filter(Boolean).join(', ');
        const country = address.country;

        return [street, locality, country].filter(Boolean).join(', ');
    };

    const handleRemoveFavorite = (recipientId) => {
        if (!recipientId) {
            return;
        }

        router.delete(`/couriers/favorites/${recipientId}`, {
            preserveScroll: true,
        });
    };

    const favoriteTotalPages = useMemo(() => {
        return Math.max(1, Math.ceil(favoriteRecipients.length / FAVORITES_PAGE_SIZE));
    }, [favoriteRecipients.length]);

    useEffect(() => {
        setFavoritesPage((prev) => Math.min(Math.max(1, prev), favoriteTotalPages));
    }, [favoriteTotalPages]);

    const paginatedFavorites = useMemo(() => {
        const start = (favoritesPage - 1) * FAVORITES_PAGE_SIZE;
        return favoriteRecipients.slice(start, start + FAVORITES_PAGE_SIZE);
    }, [favoriteRecipients, favoritesPage]);

    const handleOpenAddModal = () => {
        setData(buildFavoriteForm());
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
    };

    const updateFavoriteField = (path, value) => {
        setData((previous) => {
            const next = { ...previous };
            const keys = path.split('.');
            let cursor = next;

            keys.forEach((key, index) => {
                if (index === keys.length - 1) {
                    cursor[key] = value;
                    return;
                }

                const current = cursor[key];
                cursor[key] = current ? { ...current } : {};
                cursor = cursor[key];
            });

            return next;
        });
    };

    const handleSaveFavorite = () => {
        post('/couriers/favorites', {
            preserveScroll: true,
            onSuccess: () => {
                setShowAddModal(false);
                setData(buildFavoriteForm());
            },
        });
    };

    const favoriteErrorFor = (field) => errors[field];

    const favoritesSection = (
        <div className="w-full max-w-[870px]">
            <div className="rounded-2xl border border-[#DDE7F5] bg-white p-3 shadow-sm">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-[#0B1739]">Saved recipients</h2>
                        <p className="text-[11px] text-[#5B6887]">Manage your favorite delivery contacts.</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="inline-flex items-center justify-center rounded-[10px] border border-[#0955AC] bg-[#0955AC] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0a4b93]"
                    >
                        Add recipient
                    </button>
                </div>
                {favoriteRecipients.length === 0 ? (
                    <div className="mt-3 rounded-lg bg-[#F9FBFF] p-3 text-[11px] text-[#5B6887]">
                        No saved recipients yet. Add one from the courier details page.
                    </div>
                ) : (
                    <>
                        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                            {paginatedFavorites.map((recipient) => (
                                <div
                                    key={`favorite-recipient-${recipient.id}`}
                                    className="rounded-xl border border-[#E3EAF5] bg-[#F9FBFF] p-3 text-[11px] text-[#0B1739]"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-semibold">{recipient.name || 'Recipient'}</p>
                                            {recipient.company && (
                                                <p className="text-[11px] text-[#6B7893]">{recipient.company}</p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFavorite(recipient.id)}
                                            className="rounded-[5px] border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <div className="mt-2 space-y-1 text-[11px] text-[#5B6887]">
                                        {recipient.email && <p>Email: {recipient.email}</p>}
                                        {recipient.phone && <p>Phone: {recipient.phone}</p>}
                                        {recipient.address && (
                                            <p>Address: {formatFavoriteAddress(recipient.address)}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {favoriteRecipients.length >= 2 && (
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#5B6887]">
                                <button
                                    type="button"
                                    onClick={() => setFavoritesPage((prev) => Math.max(1, prev - 1))}
                                    disabled={favoritesPage <= 1}
                                    className={`rounded-[5px] border px-3 py-1 font-semibold ${favoritesPage <= 1 ? 'cursor-not-allowed border-[#E3EAF5] text-[#A0AEC0]' : 'border-[#D6DEEB] text-[#0B1739] hover:border-[#0955AC]'}`}
                                >
                                    Previous
                                </button>
                                <span>Page {favoritesPage} of {favoriteTotalPages}</span>
                                <button
                                    type="button"
                                    onClick={() => setFavoritesPage((prev) => Math.min(favoriteTotalPages, prev + 1))}
                                    disabled={favoritesPage >= favoriteTotalPages}
                                    className={`rounded-[5px] border px-3 py-1 font-semibold ${favoritesPage >= favoriteTotalPages ? 'cursor-not-allowed border-[#E3EAF5] text-[#A0AEC0]' : 'border-[#D6DEEB] text-[#0B1739] hover:border-[#0955AC]'}`}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-[#E5E5E5] min-h-screen">
            <Header />

            {/* Back Button */}
            <div className="md:px-20">
                <div className="mx-auto max-w-[1300px] py-1">
                    <Link
                        href="/clientAllBookings"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Main Dashboard
                    </Link>
                </div>
            </div>

            <HeroEnhanced
                shipments={shipments || []}
                statistics={statistics || {}}
                monthlyData={monthlyData || []}
                leftColumnSlot={favoritesSection}
            />

            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
                    <div className="w-full max-w-3xl rounded-2xl bg-white p-5 shadow-xl">
                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-[#0B1739]">Add favorite recipient</h3>
                                <p className="text-xs text-[#5B6887]">Enter recipient details to save for later.</p>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseAddModal}
                                className="rounded-[5px] border border-[#D6DEEB] px-3 py-1 text-xs font-semibold text-[#0B1739] hover:border-[#0955AC]"
                            >
                                Close
                            </button>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-medium">Name *</label>
                                    <input
                                        type="text"
                                        value={data.recipient.name}
                                        onChange={(event) => updateFavoriteField('recipient.name', event.target.value)}
                                        className="w-full rounded-lg border border-[#D6DEEB] px-3 py-2 text-sm focus:border-[#0955AC] focus:outline-none"
                                        placeholder="Michael Brown"
                                        required
                                    />
                                    {favoriteErrorFor('recipient.name') && (
                                        <p className="mt-1 text-xs text-red-500">{favoriteErrorFor('recipient.name')}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium">Phone</label>
                                    <input
                                        type="text"
                                        value={data.recipient.phone}
                                        onChange={(event) => updateFavoriteField('recipient.phone', event.target.value)}
                                        className="w-full rounded-lg border border-[#D6DEEB] px-3 py-2 text-sm focus:border-[#0955AC] focus:outline-none"
                                        placeholder="+44 20 7946 0958"
                                    />
                                    {favoriteErrorFor('recipient.phone') && (
                                        <p className="mt-1 text-xs text-red-500">{favoriteErrorFor('recipient.phone')}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-medium">Email</label>
                                    <input
                                        type="email"
                                        value={data.recipient.email}
                                        onChange={(event) => updateFavoriteField('recipient.email', event.target.value)}
                                        className="w-full rounded-lg border border-[#D6DEEB] px-3 py-2 text-sm focus:border-[#0955AC] focus:outline-none"
                                        placeholder="michael@example.com"
                                    />
                                    {favoriteErrorFor('recipient.email') && (
                                        <p className="mt-1 text-xs text-red-500">{favoriteErrorFor('recipient.email')}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium">Company</label>
                                    <input
                                        type="text"
                                        value={data.recipient.company}
                                        onChange={(event) => updateFavoriteField('recipient.company', event.target.value)}
                                        className="w-full rounded-lg border border-[#D6DEEB] px-3 py-2 text-sm focus:border-[#0955AC] focus:outline-none"
                                        placeholder="Recipient Inc."
                                    />
                                    {favoriteErrorFor('recipient.company') && (
                                        <p className="mt-1 text-xs text-red-500">{favoriteErrorFor('recipient.company')}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium">Address line 1 *</label>
                                <input
                                    type="text"
                                    value={data.recipient.address.line1}
                                    onChange={(event) => updateFavoriteField('recipient.address.line1', event.target.value)}
                                    className="w-full rounded-lg border border-[#D6DEEB] px-3 py-2 text-sm focus:border-[#0955AC] focus:outline-none"
                                    placeholder="45 Oxford Street"
                                    required
                                />
                                {favoriteErrorFor('recipient.address.line1') && (
                                    <p className="mt-1 text-xs text-red-500">{favoriteErrorFor('recipient.address.line1')}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium">Address line 2</label>
                                <input
                                    type="text"
                                    value={data.recipient.address.line2}
                                    onChange={(event) => updateFavoriteField('recipient.address.line2', event.target.value)}
                                    className="w-full rounded-lg border border-[#D6DEEB] px-3 py-2 text-sm focus:border-[#0955AC] focus:outline-none"
                                    placeholder="Floor 2"
                                />
                                {favoriteErrorFor('recipient.address.line2') && (
                                    <p className="mt-1 text-xs text-red-500">{favoriteErrorFor('recipient.address.line2')}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-medium">City *</label>
                                    <input
                                        type="text"
                                        value={data.recipient.address.city}
                                        onChange={(event) => updateFavoriteField('recipient.address.city', event.target.value)}
                                        className="w-full rounded-lg border border-[#D6DEEB] px-3 py-2 text-sm focus:border-[#0955AC] focus:outline-none"
                                        placeholder="Kandy"
                                        required
                                    />
                                    {favoriteErrorFor('recipient.address.city') && (
                                        <p className="mt-1 text-xs text-red-500">{favoriteErrorFor('recipient.address.city')}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium">Country *</label>
                                    <select
                                        value={data.recipient.address.country}
                                        onChange={(event) => updateFavoriteField('recipient.address.country', event.target.value.toUpperCase())}
                                        className="w-full rounded-lg border border-[#D6DEEB] px-3 py-2 text-sm focus:border-[#0955AC] focus:outline-none"
                                        required
                                    >
                                        {countryOptions.map((countryCode) => (
                                            <option key={`favorite-country-${countryCode}`} value={countryCode}>
                                                {countryCode}
                                            </option>
                                        ))}
                                    </select>
                                    {favoriteErrorFor('recipient.address.country') && (
                                        <p className="mt-1 text-xs text-red-500">{favoriteErrorFor('recipient.address.country')}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-medium">State / Province</label>
                                    <input
                                        type="text"
                                        value={data.recipient.address.state}
                                        onChange={(event) => updateFavoriteField('recipient.address.state', event.target.value)}
                                        className="w-full rounded-lg border border-[#D6DEEB] px-3 py-2 text-sm focus:border-[#0955AC] focus:outline-none"
                                        placeholder="Greater London"
                                    />
                                    {favoriteErrorFor('recipient.address.state') && (
                                        <p className="mt-1 text-xs text-red-500">{favoriteErrorFor('recipient.address.state')}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium">Postal code</label>
                                    <input
                                        type="text"
                                        value={data.recipient.address.postalCode}
                                        onChange={(event) => updateFavoriteField('recipient.address.postalCode', event.target.value)}
                                        className="w-full rounded-lg border border-[#D6DEEB] px-3 py-2 text-sm focus:border-[#0955AC] focus:outline-none"
                                    />
                                    {favoriteErrorFor('recipient.address.postalCode') && (
                                        <p className="mt-1 text-xs text-red-500">{favoriteErrorFor('recipient.address.postalCode')}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium">Delivery instructions</label>
                                <textarea
                                    rows="2"
                                    value={data.recipient.address.instructions}
                                    onChange={(event) => updateFavoriteField('recipient.address.instructions', event.target.value)}
                                    className="w-full rounded-lg border border-[#D6DEEB] px-3 py-2 text-sm focus:border-[#0955AC] focus:outline-none"
                                    placeholder="Leave with reception, call on arrival, etc."
                                />
                                {favoriteErrorFor('recipient.address.instructions') && (
                                    <p className="mt-1 text-xs text-red-500">{favoriteErrorFor('recipient.address.instructions')}</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col justify-end gap-2 sm:flex-row">
                            <button
                                type="button"
                                onClick={handleCloseAddModal}
                                className="rounded-lg border border-[#D6DEEB] px-4 py-2 text-xs font-semibold text-[#0B1739] hover:border-[#0955AC]"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveFavorite}
                                disabled={processing}
                                className={`rounded-lg bg-[#0955AC] px-5 py-2 text-xs font-semibold text-white hover:bg-[#0a4b93] ${processing ? 'cursor-not-allowed opacity-60' : ''}`}
                            >
                                {processing ? 'Saving...' : 'Save recipient'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CourierBookingDashboard;
