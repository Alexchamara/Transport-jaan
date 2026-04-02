import React, { useState } from 'react';
import SideMenu from '../../components/SuperAdmin/Dashboard1/SideMenu';

const ClientReport = ({ stats = {}, data = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  return (
    <div className="flex bg-[#070B1D] min-h-screen text-white">
      {/* Sidebar */}
      <SideMenu />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Client Report</h1>
            <p className="text-[#AEB9E1] mt-2">View and manage client-related data</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#0B1739] border border-[#343B4F] rounded-lg p-6">
              <div className="text-[#AEB9E1] text-sm font-semibold">Total Clients</div>
              <div className="text-3xl font-bold text-white mt-2">0</div>
            </div>
            <div className="bg-[#0B1739] border border-[#343B4F] rounded-lg p-6">
              <div className="text-[#AEB9E1] text-sm font-semibold">Active Clients</div>
              <div className="text-3xl font-bold text-white mt-2">0</div>
            </div>
            <div className="bg-[#0B1739] border border-[#343B4F] rounded-lg p-6">
              <div className="text-[#AEB9E1] text-sm font-semibold">Total Revenue</div>
              <div className="text-3xl font-bold text-white mt-2">$0</div>
            </div>
            <div className="bg-[#0B1739] border border-[#343B4F] rounded-lg p-6">
              <div className="text-[#AEB9E1] text-sm font-semibold">Average Order Value</div>
              <div className="text-3xl font-bold text-white mt-2">$0</div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-[#0B1739] border border-[#343B4F] rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 bg-[#181A2A] border border-[#343B4F] rounded text-white placeholder-[#AEB9E1]"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-[#181A2A] border border-[#343B4F] rounded text-white"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-[#0B1739] border border-[#343B4F] rounded-lg p-6">
            <div className="text-white">
              {data.length === 0 ? (
                <div className="text-center py-8 text-[#AEB9E1]">
                  No client data available yet
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#343B4F]">
                      <th className="text-left py-3 px-4 text-[#AEB9E1]">Client Name</th>
                      <th className="text-left py-3 px-4 text-[#AEB9E1]">Email</th>
                      <th className="text-left py-3 px-4 text-[#AEB9E1]">Total Bookings</th>
                      <th className="text-left py-3 px-4 text-[#AEB9E1]">Total Spent</th>
                      <th className="text-left py-3 px-4 text-[#AEB9E1]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Data rows will be populated here */}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientReport;
