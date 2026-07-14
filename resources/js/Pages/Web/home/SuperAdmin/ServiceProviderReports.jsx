import React from 'react';
import UserReportTemplate from './UserReportTemplate';

const ServiceProviderReports = ({ providers = [], stats = {} }) => {
  const statsCards = [
    { label: 'Total Providers', value: stats.totalProviders || 0, subtext: 'All service providers' },
    { label: 'Verified', value: stats.verifiedProviders || 0, subtext: 'Verified providers' },
    { label: 'In Review', value: stats.inReviewProviders || 0, subtext: 'Pending review' },
    { label: 'Unverified', value: stats.unverifiedProviders || 0, subtext: 'Unverified providers' },
  ];

  const columns = [
    { key: 'id', label: 'Provider ID' },
    { key: 'name', label: 'Provider Name' },
    { key: 'email', label: 'Email' },
    { key: 'vendor_type', label: 'Vendor Type' },
    { key: 'status', label: 'Status' },
    { key: 'submission_status', label: 'Submission' },
    { key: 'created_at', label: 'Registered Date' },
  ];

  return (
    <UserReportTemplate
      title='Service Provider Report'
      subtitle='Comprehensive report of all registered service providers.'
      rows={providers}
      statsCards={statsCards}
      columns={columns}
      searchFields={['id', 'name', 'email', 'vendor_type', 'status', 'submission_status']}
      statusField='status'
      typeField='vendor_type'
      typeLabel='Vendor Types'
      exportFilePrefix='service-provider-report'
      emptyMessage='No service provider report data available.'
    />
  );
};

export default ServiceProviderReports;
