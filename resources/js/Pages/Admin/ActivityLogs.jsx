import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useState, useEffect } from "react";

export default function ActivityLogs({ logs, actions, filters }) {
    const [filter, setFilter] = useState(filters || {});
    const [searchName, setSearchName] = useState(filters?.search_name || '');
    
    const applyFilter = (newFilter) => {
        const updatedFilter = { ...filter, ...newFilter };
        router.get(route('admin.activity-logs'), updatedFilter);
    };
    
    // Add function to handle name search
    const handleNameSearch = () => {
        applyFilter({ search_name: searchName || undefined });
    };
    
    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleNameSearch();
        }
    };
    
    function formatDateTime(dateString) {
        return new Date(dateString).toLocaleString();
    }
    
    function getActionDisplayName(action) {
        return action.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    function getModelName(fullClassName) {
        if (!fullClassName) return 'System';
        const parts = fullClassName.split('\\');
        return parts[parts.length - 1];
    }

    return (
        <AuthenticatedLayout>
            <Head title="Activity Logs" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h1 className="text-2xl font-semibold mb-6">Activity Logs</h1>
                        
                        {/* Filters */}
                        <div className="mb-6 flex flex-wrap gap-4 bg-gray-50 p-4 rounded-lg">
                            {/* Add search by user name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Search by User Name
                                </label>
                                <div className="flex">
                                    <input
                                        type="text"
                                        value={searchName}
                                        onChange={(e) => setSearchName(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Enter user name..."
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-l-md"
                                    />
                                    <button
                                        onClick={handleNameSearch}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
                                    >
                                        Search
                                    </button>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Action Type
                                </label>
                                <select 
                                    value={filter.action || ''}
                                    onChange={(e) => applyFilter({ action: e.target.value || undefined })}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                >
                                    <option value="">All Actions</option>
                                    {actions.map(action => (
                                        <option key={action} value={action}>
                                            {getActionDisplayName(action)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    User Type
                                </label>
                                <select 
                                    value={filter.user_type || ''}
                                    onChange={(e) => applyFilter({ user_type: e.target.value || undefined })}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                >
                                    <option value="">All Users</option>
                                    <option value="vendor">Vendors</option>
                                    <option value="driver">Drivers</option>
                                </select>
                            </div>
                            
                            <div className="flex items-end">
                                <button
                                    onClick={() => {
                                        setSearchName('');
                                        router.get(route('admin.activity-logs'), {});
                                    }}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                        
                        {/* Logs Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Action
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subject
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Details
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {logs.data.map(log => (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDateTime(log.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {log.causer?.name || 'System'}
                                                </div>
                                                {log.causer_type && (
                                                    <div className="text-xs text-gray-500">
                                                        {getModelName(log.causer_type)}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {getActionDisplayName(log.action)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.subject_type ? (
                                                    <>
                                                        <div>{getModelName(log.subject_type)}</div>
                                                        <div className="text-xs">ID: {log.subject_id}</div>
                                                    </>
                                                ) : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div>{log.description || 'No description'}</div>
                                                {log.properties && Object.keys(log.properties).length > 0 && (
                                                    <details className="mt-1">
                                                        <summary className="text-xs text-blue-600 cursor-pointer">
                                                            View details
                                                        </summary>
                                                        <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-60">
                                                            {JSON.stringify(log.properties, null, 2)}
                                                        </pre>
                                                    </details>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    
                                    {logs.data.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                                No activity logs found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Pagination */}
                        {logs.links && logs.links.length > 3 && (
                            <div className="mt-4 flex justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing {logs.from} to {logs.to} of {logs.total} results
                                </div>
                                <div className="flex">
                                    {logs.links.map((link, i) => (
                                        <button
                                            key={i}
                                            onClick={() => link.url && router.visit(link.url)}
                                            className={`px-3 py-1 border ${
                                                link.active
                                                    ? 'bg-blue-50 text-blue-600 border-blue-500'
                                                    : 'text-gray-500 hover:bg-gray-50'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}