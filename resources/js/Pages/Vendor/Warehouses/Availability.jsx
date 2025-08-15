import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
    'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

export default function Availability({ warehouse }) {
    const [showModal, setShowModal] = useState(false);
    const [selectedDates, setSelectedDates] = useState({
        start: null,
        end: null,
    });

    const { data, setData, post, processing, errors, reset } = useForm({
        start_date: '',
        end_date: '',
        status: 'blocked',
        notes: '',
    });

    const events = warehouse.availability.map(item => ({
        id: item.id,
        title: `${item.status.toUpperCase()}${item.notes ? ': ' + item.notes : ''}`,
        start: new Date(item.start_date),
        end: new Date(item.end_date),
        status: item.status,
    }));

    const handleSelect = ({ start, end }) => {
        setSelectedDates({ start, end });
        setData({
            start_date: format(start, 'yyyy-MM-dd'),
            end_date: format(end, 'yyyy-MM-dd'),
            status: 'blocked',
            notes: '',
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('vendor.warehouses.availability.update', warehouse.id), {
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        });
    };

    const eventStyleGetter = (event) => {
        let style = {
            backgroundColor: '#3182ce', // default blue
        };

        switch (event.status) {
            case 'blocked':
                style.backgroundColor = '#e53e3e'; // red
                break;
            case 'maintenance':
                style.backgroundColor = '#d69e2e'; // yellow
                break;
            case 'available':
                style.backgroundColor = '#38a169'; // green
                break;
        }

        return {
            style,
        };
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold text-gray-800">
                    Manage Availability: {warehouse.name}
                </h2>
            }
        >
            <Head title={`Manage Availability: ${warehouse.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div style={{ height: '600px' }}>
                            <Calendar
                                localizer={localizer}
                                events={events}
                                startAccessor="start"
                                endAccessor="end"
                                selectable
                                onSelectSlot={handleSelect}
                                eventPropGetter={eventStyleGetter}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Availability Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Update Availability
                        </h3>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Status
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={e => setData('status', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="available">Available</option>
                                        <option value="blocked">Blocked</option>
                                        <option value="maintenance">Maintenance</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={data.start_date}
                                        onChange={e => setData('start_date', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={data.end_date}
                                        onChange={e => setData('end_date', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Notes
                                    </label>
                                    <textarea
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Optional notes about this availability period"
                                    />
                                </div>

                                {errors.dates && (
                                    <p className="text-sm text-red-600">{errors.dates}</p>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
} 