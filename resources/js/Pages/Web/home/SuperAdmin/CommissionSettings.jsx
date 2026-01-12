import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import SideMenu from '../../components/SuperAdmin/Dashboard1/SideMenu';

const CommissionSettings = ({ commissions: initialCommissions, serviceTypes }) => {
    const [commissions, setCommissions] = useState(initialCommissions || []);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        service_type: '',
        commission_percentage: '',
        fixed_amount: '',
        description: '',
        is_active: true,
    });

    // Fetch commissions on mount
    useEffect(() => {
        fetchCommissions();
    }, []);

    const getCsrfToken = () => {
        return document.querySelector('meta[name="csrf-token"]')?.content || '';
    };

    const fetchCommissions = async () => {
        try {
            const response = await fetch('/superadmin/commissions', {
                headers: {
                    'Accept': 'application/json',
                },
            });
            const result = await response.json();
            setCommissions(result.data || []);
        } catch (err) {
            console.error('Error fetching commissions:', err);
            setError('Failed to load commissions');
        }
    };

    const resetForm = () => {
        setFormData({
            service_type: '',
            commission_percentage: '',
            fixed_amount: '',
            description: '',
            is_active: true,
        });
        setEditingId(null);
        setError('');
    };

    const openModal = (commission = null) => {
        if (commission) {
            setFormData({
                service_type: commission.service_type,
                commission_percentage: commission.commission_percentage,
                fixed_amount: commission.fixed_amount,
                description: commission.description,
                is_active: commission.is_active,
            });
            setEditingId(commission.id);
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const csrfToken = getCsrfToken();
            const url = editingId
                ? `/superadmin/commissions/${editingId}`
                : '/superadmin/commissions';

            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to save commission');
            }

            setSuccess(result.message || 'Commission saved successfully');
            fetchCommissions();
            closeModal();

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this commission?')) {
            try {
                setError('');
                const csrfToken = getCsrfToken();
                const response = await fetch(`/superadmin/commissions/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'Failed to delete commission');
                }

                setSuccess('Commission deleted successfully');
                fetchCommissions();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                console.error('Error:', err);
                setError(err.message || 'An error occurred');
            }
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            setError('');
            const csrfToken = getCsrfToken();
            const response = await fetch(`/superadmin/commissions/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ is_active: newStatus }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update status');
            }

            setSuccess('Status updated successfully');
            fetchCommissions();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'An error occurred');
        }
    };

    return (
        <>
            <Head title="Commission Settings" />

            <div className='flex flex-row bg-[#081028] min-h-screen poppins'>
                <div className='sm:w-full md:w-auto lg:w-auto'>
                    <SideMenu />
                </div>

                <div className='flex-1 p-8'>
                    <div className='max-w-6xl mx-auto'>
                        {/* Header */}
                        <div className='mb-8 flex justify-between items-center'>
                            <div>
                                <h1 className='text-3xl font-bold text-white mb-2'>Commission Settings</h1>
                                <p className='text-gray-400'>Manage commission rates for each service type</p>
                            </div>
                            <button
                                onClick={() => openModal()}
                                className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200'
                            >
                                <Plus size={18} />
                                Create Commission
                            </button>
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

                        {/* Commissions Table */}
                        <div className='bg-[#0A1330] border border-gray-700 rounded-lg overflow-hidden'>
                            {commissions.length > 0 ? (
                                <div className='overflow-x-auto'>
                                    <table className='w-full'>
                                        <thead>
                                            <tr className='border-b border-gray-700 bg-[#181A2A]'>
                                                <th className='px-6 py-4 text-left text-sm font-semibold text-gray-200'>Service Type</th>
                                                <th className='px-6 py-4 text-left text-sm font-semibold text-gray-200'>Commission %</th>
                                                <th className='px-6 py-4 text-left text-sm font-semibold text-gray-200'>Fixed Amount</th>
                                                <th className='px-6 py-4 text-left text-sm font-semibold text-gray-200'>Description</th>
                                                <th className='px-6 py-4 text-left text-sm font-semibold text-gray-200'>Status</th>
                                                <th className='px-6 py-4 text-center text-sm font-semibold text-gray-200'>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {commissions.map((commission) => (
                                                <tr key={commission.id} className='border-b border-gray-700 hover:bg-[#181A2A] transition-colors duration-150'>
                                                    <td className='px-6 py-4 text-sm text-gray-300'>
                                                        <span className='px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-medium'>
                                                            {serviceTypes[commission.service_type] || commission.service_type}
                                                        </span>
                                                    </td>
                                                    <td className='px-6 py-4 text-sm text-gray-300 font-medium'>
                                                        {parseFloat(commission.commission_percentage).toFixed(2)}%
                                                    </td>
                                                    <td className='px-6 py-4 text-sm text-gray-300'>
                                                        {commission.fixed_amount ? `$${parseFloat(commission.fixed_amount).toFixed(2)}` : '-'}
                                                    </td>
                                                    <td className='px-6 py-4 text-sm text-gray-400 truncate max-w-xs'>
                                                        {commission.description || '-'}
                                                    </td>
                                                    <td className='px-6 py-4 text-sm'>
                                                        <button
                                                            onClick={() => handleStatusChange(commission.id, !commission.is_active)}
                                                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                                                                commission.is_active
                                                                    ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                                                                    : 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                                                            }`}
                                                        >
                                                            {commission.is_active ? 'Active' : 'Inactive'}
                                                        </button>
                                                    </td>
                                                    <td className='px-6 py-4 text-sm'>
                                                        <div className='flex gap-2 justify-center'>
                                                            <button
                                                                onClick={() => openModal(commission)}
                                                                className='p-2 hover:bg-blue-600/20 rounded-md text-blue-400 hover:text-blue-300 transition-colors duration-200'
                                                                title='Edit'
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(commission.id)}
                                                                className='p-2 hover:bg-red-600/20 rounded-md text-red-400 hover:text-red-300 transition-colors duration-200'
                                                                title='Delete'
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className='p-8 text-center text-gray-400'>
                                    <p className='mb-4'>No commissions set up yet</p>
                                    <button
                                        onClick={() => openModal()}
                                        className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200'
                                    >
                                        <Plus size={18} />
                                        Create First Commission
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Information Box */}
                        <div className='mt-8 bg-[#0A1330] border border-gray-700 rounded-lg p-6'>
                            <h3 className='text-lg font-semibold text-white mb-3'>How It Works</h3>
                            <div className='space-y-3 text-sm text-gray-300'>
                                <div className='flex items-start space-x-2'>
                                    <div className='w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0'></div>
                                    <p>Set commission rates for different service types (Vehicle, Warehouse, Courier, Freight, Ticket).</p>
                                </div>
                                <div className='flex items-start space-x-2'>
                                    <div className='w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0'></div>
                                    <p>Commission percentage is calculated on the booking amount. Optional fixed amount applies additionally.</p>
                                </div>
                                <div className='flex items-start space-x-2'>
                                    <div className='w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0'></div>
                                    <p>You can activate or deactivate commissions per service type independently.</p>
                                </div>
                                <div className='flex items-start space-x-2'>
                                    <div className='w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0'></div>
                                    <p>Each service type can only have one commission rate. Update existing to change rates.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-[#0A1330] border border-gray-700 rounded-lg max-w-md w-full'>
                        {/* Modal Header */}
                        <div className='border-b border-gray-700 px-6 py-4 flex justify-between items-center'>
                            <h2 className='text-xl font-bold text-white'>
                                {editingId ? 'Edit Commission' : 'Create Commission'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className='text-gray-400 hover:text-white transition-colors'
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className='px-6 py-4 space-y-4'>
                            {/* Service Type */}
                            <div className='space-y-2'>
                                <label className='block text-sm font-medium text-gray-200'>
                                    Service Type <span className='text-red-400'>*</span>
                                </label>
                                <select
                                    name='service_type'
                                    value={formData.service_type}
                                    onChange={handleInputChange}
                                    disabled={!!editingId}
                                    className='w-full px-3 py-2 bg-[#081028] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed'
                                >
                                    <option value=''>Select Service Type</option>
                                    {Object.entries(serviceTypes).map(([key, label]) => (
                                        <option key={key} value={key}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Commission Percentage */}
                            <div className='space-y-2'>
                                <label className='block text-sm font-medium text-gray-200'>
                                    Commission Percentage <span className='text-red-400'>*</span>
                                </label>
                                <input
                                    type='number'
                                    name='commission_percentage'
                                    value={formData.commission_percentage}
                                    onChange={handleInputChange}
                                    step='0.01'
                                    min='0'
                                    max='100'
                                    placeholder='e.g., 5.50'
                                    className='w-full px-3 py-2 bg-[#081028] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                />
                                <p className='text-xs text-gray-400'>Percentage of booking amount (0-100)</p>
                            </div>

                            {/* Fixed Amount */}
                            <div className='space-y-2'>
                                <label className='block text-sm font-medium text-gray-200'>
                                    Fixed Amount (Optional)
                                </label>
                                <input
                                    type='number'
                                    name='fixed_amount'
                                    value={formData.fixed_amount}
                                    onChange={handleInputChange}
                                    step='0.01'
                                    min='0'
                                    placeholder='e.g., 10.00'
                                    className='w-full px-3 py-2 bg-[#081028] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                />
                                <p className='text-xs text-gray-400'>Flat amount added to percentage commission</p>
                            </div>

                            {/* Description */}
                            <div className='space-y-2'>
                                <label className='block text-sm font-medium text-gray-200'>
                                    Description (Optional)
                                </label>
                                <textarea
                                    name='description'
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder='e.g., Standard rate for vehicle bookings'
                                    rows='3'
                                    className='w-full px-3 py-2 bg-[#081028] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
                                ></textarea>
                            </div>

                            {/* Active Status */}
                            <div className='flex items-center space-x-2'>
                                <input
                                    type='checkbox'
                                    id='is_active'
                                    name='is_active'
                                    checked={formData.is_active}
                                    onChange={handleInputChange}
                                    className='rounded'
                                />
                                <label htmlFor='is_active' className='text-sm font-medium text-gray-200'>
                                    Active
                                </label>
                            </div>

                            {/* Modal Footer */}
                            <div className='flex gap-3 justify-end pt-4 border-t border-gray-700'>
                                <button
                                    type='button'
                                    onClick={closeModal}
                                    className='px-4 py-2 text-gray-200 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-200'
                                >
                                    Cancel
                                </button>
                                <button
                                    type='submit'
                                    disabled={isLoading}
                                    className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#081028] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2'
                                >
                                    {isLoading ? 'Saving...' : 'Save Commission'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default CommissionSettings;
