import React from 'react';
import UserReportTemplate from './UserReportTemplate';

const DriverReports = ({ drivers = [], stats = {} }) => {
  const statsCards = [
    { label: 'Total Drivers', value: stats.totalDrivers || 0, subtext: 'All registered drivers' },
    { label: 'Active', value: stats.activeDrivers || 0, subtext: 'Currently active' },
    { label: 'Inactive', value: stats.inactiveDrivers || 0, subtext: 'Currently inactive' },
    { label: 'License Expiring Soon', value: stats.expiringSoon || 0, subtext: 'Within next 30 days' },
  ];

  const columns = [
    { key: 'id', label: 'Driver ID' },
    { key: 'name', label: 'Driver Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'vehicle_type', label: 'Vehicle Type' },
    { key: 'status', label: 'Status' },
    { key: 'license_expiry', label: 'License Expiry' },
    { key: 'created_at', label: 'Registered Date' },
  ];

  return (
    <UserReportTemplate
      title='Drivers Report'
      subtitle='Comprehensive report of all registered drivers and license status.'
      rows={drivers}
      statsCards={statsCards}
      columns={columns}
      searchFields={['id', 'name', 'email', 'phone', 'vehicle_type', 'status', 'license_expiry']}
      statusField='status'
      typeField='vehicle_type'
      typeLabel='Vehicle Types'
      exportFilePrefix='drivers-report'
      emptyMessage='No driver report data available.'
    />
  );
};

export default DriverReports;
