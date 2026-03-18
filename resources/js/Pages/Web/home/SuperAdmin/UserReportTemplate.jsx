import React, { useMemo, useState } from 'react';
import SideMenu from '../../components/SuperAdmin/Dashboard1/SideMenu';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const UserReportTemplate = ({
  title,
  subtitle,
  rows = [],
  statsCards = [],
  columns = [],
  searchFields = [],
  statusField = 'status',
  typeField = null,
  typeLabel = 'Type',
  exportFilePrefix = 'report',
  emptyMessage = 'No report data available.',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [showExportModal, setShowExportModal] = useState(false);

  // ── Chart colour palettes ────────────────────────────────────────────
  const CHART_COLORS = ['#0E43FB', '#14CA74', '#FDB52A', '#FF5A65', '#AB47BC', '#00C2FF', '#FF9800', '#26A69A'];
  const STATUS_COLOR_MAP = {
    verified: '#14CA74',
    active: '#14CA74',
    Active: '#14CA74',
    confirmed: '#14CA74',
    inreview: '#FDB52A',
    'in-review': '#FDB52A',
    InReview: '#FDB52A',
    pending: '#FDB52A',
    unverified: '#0E43FB',
    Unverified: '#0E43FB',
    inactive: '#FF5A65',
    Inactive: '#FF5A65',
    blocked: '#FF5A65',
    rejected: '#AB47BC',
  };

  // Monthly registrations – last 12 calendar months
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        month: d.toLocaleString('default', { month: 'short' }),
        count: 0,
      });
    }
    rows.forEach((row) => {
      if (!row.created_at) return;
      const d = new Date(row.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const entry = months.find((m) => m.key === key);
      if (entry) entry.count += 1;
    });
    return months;
  }, [rows]);

  // Status distribution for donut chart
  const statusData = useMemo(() => {
    const counts = {};
    rows.forEach((row) => {
      const s = row?.[statusField] ?? 'unknown';
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).map(([label, count], i) => ({
      label,
      count,
      color: STATUS_COLOR_MAP[label] || CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [rows, statusField]);

  // Type distribution for bar chart (only when typeField is set)
  const typeData = useMemo(() => {
    if (!typeField) return [];
    const counts = {};
    rows.forEach((row) => {
      const t = row?.[typeField] ?? 'Unknown';
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts).map(([label, count], i) => ({
      label,
      count,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [rows, typeField]);

  const ChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1A2233] border border-[#343B4F] rounded-lg p-3 shadow-xl">
          <p className="text-white text-xs font-medium mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs" style={{ color: entry.color || entry.fill }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const statusOptions = useMemo(() => {
    const values = Array.from(new Set(rows.map((row) => row?.[statusField]).filter(Boolean)));
    return values;
  }, [rows, statusField]);

  const typeOptions = useMemo(() => {
    if (!typeField) return [];
    return Array.from(new Set(rows.map((row) => row?.[typeField]).filter(Boolean)));
  }, [rows, typeField]);

  const matchesDateFilter = (createdAt) => {
    if (dateFilter === 'All') return true;
    if (!createdAt) return false;

    const createdDate = new Date(createdAt);
    if (Number.isNaN(createdDate.getTime())) return false;

    const now = new Date();
    const diffDays = (now - createdDate) / (1000 * 60 * 60 * 24);

    if (dateFilter === 'Last 7 Days') return diffDays <= 7;
    if (dateFilter === 'Last 30 Days') return diffDays <= 30;
    if (dateFilter === 'This Year') return createdDate.getFullYear() === now.getFullYear();

    return true;
  };

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return rows.filter((row) => {
      const searchText = searchFields
        .map((field) => row?.[field])
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = !query || searchText.includes(query);
      const matchesStatus = statusFilter === 'All' || String(row?.[statusField] ?? '') === statusFilter;
      const matchesType = !typeField || typeFilter === 'All' || String(row?.[typeField] ?? '') === typeFilter;
      const matchesDate = matchesDateFilter(row?.created_at);

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [rows, searchFields, searchTerm, statusFilter, typeFilter, typeField, statusField, dateFilter]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setTypeFilter('All');
    setDateFilter('All');
  };

  const getCellValue = (row, col) => {
    if (typeof col.accessor === 'function') return col.accessor(row);
    return row?.[col.key] ?? 'N/A';
  };

  const handleExport = (format) => {
    const headers = columns.map((col) => col.label);
    const tableRows = filteredRows.map((row) =>
      columns.map((col) => String(getCellValue(row, col) ?? ''))
    );

    if (format === 'csv' || format === 'excel') {
      const csv = [headers, ...tableRows]
        .map((line) => line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      const blob = new Blob([csv], {
        type: format === 'excel' ? 'application/vnd.ms-excel' : 'text/csv;charset=utf-8;'
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${exportFilePrefix}.${format === 'excel' ? 'xls' : 'csv'}`;
      link.click();
      URL.revokeObjectURL(url);
    }

    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(title, 14, 20);

      autoTable(doc, {
        head: [headers],
        body: tableRows,
        startY: 30,
        theme: 'grid',
        headStyles: {
          fillColor: [14, 67, 251],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        styles: {
          cellPadding: 3,
          fontSize: 9,
        },
      });

      doc.save(`${exportFilePrefix}.pdf`);
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
          <h1 className='text-white text-3xl font-bold mb-3'>{title}</h1>
          <p className='text-gray-400 mb-8'>{subtitle}</p>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            {statsCards.map((card) => (
              <div key={card.label} className='bg-[#0B1739] rounded-lg p-6 border border-[#343B4F] hover:border-[#0E43FB]/50 transition-all duration-300'>
                <h3 className='text-[#AEB9E1] text-sm mb-2'>{card.label}</h3>
                <p className='text-white text-2xl font-bold'>{card.value}</p>
                <p className='text-[#14CA74] text-sm mt-2'>{card.subtext}</p>
              </div>
            ))}
          </div>

          {/* ── Charts Section ──────────────────────────────────────────── */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
            {/* Registrations Over Time – Area Chart */}
            <div className='bg-[#0B1739] border border-[#343B4F] rounded-lg p-5'>
              <div className='mb-4'>
                <h3 className='text-white text-sm font-medium'>Registrations Over Time</h3>
                <p className='text-[#AEB9E1] text-xs mt-0.5'>Last 12 months</p>
              </div>
              <div className='h-[220px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id='regGrad' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='0%' stopColor='#0E43FB' stopOpacity={0.4} />
                        <stop offset='100%' stopColor='#0E43FB' stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' stroke='#343B4F' />
                    <XAxis dataKey='month' stroke='#AEB9E1' tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis stroke='#AEB9E1' tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type='monotone' dataKey='count' name='Registrations' stroke='#0E43FB' fill='url(#regGrad)' strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Distribution – Donut Chart */}
            <div className='bg-[#0B1739] border border-[#343B4F] rounded-lg p-5'>
              <div className='mb-4'>
                <h3 className='text-white text-sm font-medium'>Status Distribution</h3>
                <p className='text-[#AEB9E1] text-xs mt-0.5'>Breakdown by account status</p>
              </div>
              <div className='flex items-center gap-4 h-[220px]'>
                <div className='flex-1 h-full'>
                  {statusData.length > 0 ? (
                    <ResponsiveContainer width='100%' height='100%'>
                      <PieChart>
                        <Pie
                          data={statusData}
                          dataKey='count'
                          nameKey='label'
                          cx='50%'
                          cy='50%'
                          innerRadius={55}
                          outerRadius={85}
                          strokeWidth={0}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className='flex items-center justify-center h-full'>
                      <p className='text-[#AEB9E1] text-xs'>No data</p>
                    </div>
                  )}
                </div>
                <div className='flex flex-col gap-2 min-w-[110px]'>
                  {statusData.map((item, i) => (
                    <div key={i} className='flex items-center gap-2'>
                      <span className='w-2.5 h-2.5 rounded-full flex-shrink-0' style={{ backgroundColor: item.color }} />
                      <span className='text-[#AEB9E1] text-[11px] capitalize'>{item.label}</span>
                      <span className='text-white text-[11px] font-medium ml-auto'>{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Type Distribution Bar Chart (shown only when typeField is set) */}
          {typeField && typeData.length > 0 && (
            <div className='bg-[#0B1739] border border-[#343B4F] rounded-lg p-5 mb-6'>
              <div className='mb-4'>
                <h3 className='text-white text-sm font-medium'>{typeLabel} Distribution</h3>
                <p className='text-[#AEB9E1] text-xs mt-0.5'>Count by {typeLabel.toLowerCase()}</p>
              </div>
              <div className='h-[200px]'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={typeData} margin={{ left: 0 }}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#343B4F' />
                    <XAxis dataKey='label' stroke='#AEB9E1' tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis stroke='#AEB9E1' tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey='count' name='Count' radius={[4, 4, 0, 0]} barSize={32}>
                      {typeData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className='bg-[#0F1A3A] rounded-lg p-4 border border-gray-700 mb-6'>
            <div className='flex flex-wrap gap-4 items-center'>
              <div className='flex-1 min-w-[200px]'>
                <input
                  className='w-full bg-[#0B1739] border border-gray-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#0E43FB]'
                  placeholder='Search report data...'
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
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              {typeField && (
                <select
                  className='bg-[#0B1739] border border-gray-700 text-white rounded-md px-3 py-2 text-sm'
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                >
                  <option value='All'>All {typeLabel}</option>
                  {typeOptions.map((typeValue) => (
                    <option key={typeValue} value={typeValue}>{typeValue}</option>
                  ))}
                </select>
              )}

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
                Export
              </button>
            </div>
          </div>

          <div className='bg-[#181A2A] rounded-lg p-6 border border-gray-700'>
            <h3 className='text-white text-lg font-semibold mb-4'>Report Data</h3>

            {filteredRows.length > 0 ? (
              <div className='overflow-x-auto'>
                <table className='w-full text-left'>
                  <thead>
                    <tr className='border-b border-gray-700'>
                      {columns.map((col) => (
                        <th key={col.key || col.label} className='text-gray-400 pb-3 px-2'>
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row, index) => (
                      <tr key={row.id || index} className='border-b border-gray-800'>
                        {columns.map((col) => (
                          <td key={`${row.id || index}-${col.key || col.label}`} className='text-white py-3 px-2'>
                            {getCellValue(row, col)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className='text-gray-400'>{emptyMessage}</p>
            )}
          </div>
        </div>
      </div>

      {showExportModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-xl w-[420px] p-6'>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold text-gray-900'>Export Report</h2>
              <button onClick={() => setShowExportModal(false)} className='text-gray-400 hover:text-gray-600'>×</button>
            </div>
            <p className='text-sm text-gray-600 mb-6'>Export all {filteredRows.length} filtered records</p>
            <div className='space-y-3'>
              <button onClick={() => handleExport('pdf')} className='w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left'>Export as PDF</button>
              <button onClick={() => handleExport('excel')} className='w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left'>Export as Excel</button>
              <button onClick={() => handleExport('csv')} className='w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left'>Export as CSV</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReportTemplate;
