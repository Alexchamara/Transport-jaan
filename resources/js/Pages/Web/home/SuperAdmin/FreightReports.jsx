import React, { useMemo, useState, useEffect } from 'react';
import SideMenu from '../../components/SuperAdmin/Dashboard1/SideMenu';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const FreightReports = ({ bookings = [], stats = {} }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [showExportModal, setShowExportModal] = useState(false);
  const [statusOptions, setStatusOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);
  const [dateOptions, setDateOptions] = useState(['All', 'Last 7 Days', 'Last 30 Days', 'This Year']);

  // Fetch filter options from database
  useEffect(() => {
    fetch('/superadmin/reports/filter-options')
      .then(res => res.json())
      .then(data => {
        setStatusOptions(data.freightStatuses || []);
        setDateOptions(['All', 'Last 7 Days', 'Last 30 Days', 'This Year']);
      })
      .catch(err => console.error('Failed to fetch filter options:', err));
  }, []);

  // Extract cargo types from bookings data
  useEffect(() => {
    const cargoTypes = Array.from(new Set(bookings.map((booking) => booking.cargo_type).filter(Boolean)));
    setTypeOptions(cargoTypes);
  }, [bookings]);

  const matchesDateFilter = (createdAt) => {
    if (dateFilter === 'All') return true;
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffDays = (now - createdDate) / (1000 * 60 * 60 * 24);

    if (dateFilter === 'Last 7 Days') return diffDays <= 7;
    if (dateFilter === 'Last 30 Days') return diffDays <= 30;
    if (dateFilter === 'This Year') return createdDate.getFullYear() === now.getFullYear();

    return true;
  };

  const filteredBookings = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase();

    return bookings.filter((booking) => {
      const searchTarget = [
        booking.quote_reference,
        booking.company_name,
        booking.origin,
        booking.destination,
        booking.cargo_type,
        booking.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = !searchValue || searchTarget.includes(searchValue);
      const matchesStatus = statusFilter === 'All' || booking.status === statusFilter;
      const matchesCargo = typeFilter === 'All' || booking.cargo_type === typeFilter;
      const matchesDate = matchesDateFilter(booking.created_at);

      return matchesSearch && matchesStatus && matchesCargo && matchesDate;
    });
  }, [bookings, searchTerm, statusFilter, typeFilter, dateFilter]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setTypeFilter('All');
    setDateFilter('All');
  };

  const handleExport = (format) => {
    const headers = ['Quote Ref', 'Company', 'Origin', 'Destination', 'Cargo Type', 'Weight', 'Status', 'Date'];
    const rows = filteredBookings.map((booking) => [
      booking.quote_reference,
      booking.company_name,
      booking.origin,
      booking.destination,
      booking.cargo_type,
      `${booking.weight} kg`,
      booking.status,
      new Date(booking.created_at).toLocaleDateString(),
    ]);

    if (format === 'csv') {
      const csv = [headers, ...rows]
        .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'freight-reports.csv';
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'excel') {
      const excel = [headers.join('\t'), ...rows.map(row => row.join('\t'))].join('\n');
      const blob = new Blob([excel], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'freight-reports.xls';
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'pdf') {
      const doc = new jsPDF('landscape');
      doc.setFontSize(18);
      doc.text('Freight Quotes Report', 14, 20);
      
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 30,
        theme: 'grid',
        headStyles: {
          fillColor: [14, 67, 251],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        styles: {
          cellPadding: 3,
          fontSize: 10,
          textColor: [0, 0, 0],
        },
      });
      
      doc.save('freight-reports.pdf');
    }
    setShowExportModal(false);
  };
  return (
    <div className='flex flex-row bg-[#081028] min-h-screen sm:flex-col md:flex-row lg:flex-row poppins'>
      <div className='sm:w-full md:w-auto lg:w-auto'>
        <SideMenu />
      </div>
      <div className='flex-1 p-8'>
        <div className='max-w-7xl mx-auto'>
          <h1 className='text-white text-3xl font-bold mb-6'>Freight Bookings Report</h1>
          <p className='text-gray-400 mb-8'>Comprehensive report of all freight bookings.</p>
          
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            <div className='bg-[#181A2A] rounded-lg p-6 border border-gray-700'>
              <h3 className='text-gray-400 text-sm mb-2'>Total Quotes</h3>
              <p className='text-white text-2xl font-bold'>{stats.totalQuotes || 0}</p>
            </div>
            <div className='bg-[#181A2A] rounded-lg p-6 border border-gray-700'>
              <h3 className='text-gray-400 text-sm mb-2'>Total Weight (kg)</h3>
              <p className='text-white text-2xl font-bold'>{(stats.totalWeight || 0).toLocaleString()}</p>
            </div>
            <div className='bg-[#181A2A] rounded-lg p-6 border border-gray-700'>
              <h3 className='text-gray-400 text-sm mb-2'>Pending</h3>
              <p className='text-white text-2xl font-bold'>{stats.pendingQuotes || 0}</p>
            </div>
            <div className='bg-[#181A2A] rounded-lg p-6 border border-gray-700'>
              <h3 className='text-gray-400 text-sm mb-2'>Approved</h3>
              <p className='text-white text-2xl font-bold'>{stats.approvedQuotes || 0}</p>
            </div>
          </div>

          <div className='bg-[#0F1A3A] rounded-lg p-4 border border-gray-700 mb-6'>
            <div className='flex flex-wrap gap-4 items-center'>
              <div className='flex-1 min-w-[200px]'>
                <input
                  className='w-full bg-[#0B1739] border border-gray-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0E43FB]'
                  placeholder='Search quotes...'
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <select
                className='bg-[#0B1739] border border-gray-700 text-white rounded-md px-3 py-2 text-sm'
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value='All'>All Statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <select
                className='bg-[#0B1739] border border-gray-700 text-white rounded-md px-3 py-2 text-sm'
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <option value='All'>All Cargo Types</option>
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <select
                className='bg-[#0B1739] border border-gray-700 text-white rounded-md px-3 py-2 text-sm'
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
              >
                <option value='All'>All Dates</option>
                <option value='Last 7 Days'>Last 7 Days</option>
                <option value='Last 30 Days'>Last 30 Days</option>
                <option value='This Year'>This Year</option>
              </select>
              <button
                type='button'
                className='bg-[#1C2A52] text-white px-4 py-2 rounded-md text-sm border border-gray-700 hover:bg-[#223464]'
                onClick={resetFilters}
              >
                Reset Filters
              </button>
              <button
                type='button'
                className='flex items-center gap-2 bg-[#0E43FB] text-white px-4 py-2 rounded-md text-sm hover:bg-[#0A36D6]'
                onClick={() => setShowExportModal(true)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 10V2M8 10L10.5 7.5M8 10L5.5 7.5M2 14H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Export
              </button>
            </div>
          </div>
          
          <div className='bg-[#181A2A] rounded-lg p-6 border border-gray-700'>
            <h3 className='text-white text-lg font-semibold mb-4'>Recent Quotes</h3>
            {filteredBookings && filteredBookings.length > 0 ? (
              <div className='overflow-x-auto'>
                <table className='w-full text-left'>
                  <thead>
                    <tr className='border-b border-gray-700'>
                      <th className='text-gray-400 pb-3 px-2'>Quote Ref</th>
                      <th className='text-gray-400 pb-3 px-2'>Company</th>
                      <th className='text-gray-400 pb-3 px-2'>Route</th>
                      <th className='text-gray-400 pb-3 px-2'>Cargo Type</th>
                      <th className='text-gray-400 pb-3 px-2'>Weight</th>
                      <th className='text-gray-400 pb-3 px-2'>Status</th>
                      <th className='text-gray-400 pb-3 px-2'>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking, index) => (
                      <tr key={index} className='border-b border-gray-800'>
                        <td className='text-white py-3 px-2'>{booking.quote_reference}</td>
                        <td className='text-gray-300 py-3 px-2'>{booking.company_name || 'N/A'}</td>
                        <td className='text-gray-300 py-3 px-2'>{(booking.origin || 'N/A') + ' → ' + (booking.destination || 'N/A')}</td>
                        <td className='text-gray-300 py-3 px-2'>{booking.cargo_type || 'N/A'}</td>
                        <td className='text-gray-300 py-3 px-2'>{booking.weight} kg</td>
                        <td className='py-3 px-2'>
                          <span className={`px-2 py-1 rounded text-xs ${
                            booking.status === 'approved' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className='text-gray-400 py-3 px-2'>{new Date(booking.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className='text-gray-400'>No freight quote data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[420px] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Export Freight Reports</h2>
              <button 
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Export all {filteredBookings.length} filtered bookings
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleExport('pdf')}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 2H14L18 6V16C18 17.1046 17.1046 18 16 18H4C2.89543 18 2 17.1046 2 16V4C2 2.89543 2.89543 2 4 2H6Z" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Export as PDF</p>
                    <p className="text-sm text-gray-500">Printable document format</p>
                  </div>
                </div>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 2H14L18 6V16C18 17.1046 17.1046 18 16 18H4C2.89543 18 2 17.1046 2 16V4C2 2.89543 2.89543 2 4 2H6Z" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Export as Excel</p>
                    <p className="text-sm text-gray-500">Spreadsheet format (.xlsx)</p>
                  </div>
                </div>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 2H14L18 6V16C18 17.1046 17.1046 18 16 18H4C2.89543 18 2 17.1046 2 16V4C2 2.89543 2.89543 2 4 2H6Z" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Export as CSV</p>
                    <p className="text-sm text-gray-500">Comma-separated values</p>
                  </div>
                </div>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreightReports;
