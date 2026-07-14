import React from 'react';
import UserReportTemplate from './UserReportTemplate';

const ClientReports = ({ users = [], stats = {} }) => {
  const statsCards = [
    { label: 'Total Clients', value: stats.totalUsers || 0, subtext: 'All client accounts' },
    { label: 'Verified', value: stats.verifiedUsers || 0, subtext: 'Verified accounts' },
    { label: 'In Review', value: stats.inReviewUsers || 0, subtext: 'Pending verification' },
    { label: 'Blocked/Rejected', value: stats.blockedUsers || 0, subtext: 'Restricted accounts' },
  ];

  const columns = [
    { key: 'id', label: 'Client ID' },
    { key: 'name', label: 'Client Name' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' },
    { key: 'country', label: 'Country' },
    { key: 'created_at', label: 'Registered Date' },
  ];

  return (
    <UserReportTemplate
      title='Client Report'
      subtitle='Comprehensive report of all client users and account statuses.'
      rows={users}
      statsCards={statsCards}
      columns={columns}
      searchFields={['id', 'name', 'email', 'status', 'country']}
      statusField='status'
      exportFilePrefix='client-report'
      emptyMessage='No client report data available.'
    />
  );
};

export default ClientReports;
