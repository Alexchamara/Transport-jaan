import React from 'react';
import { Head, Link } from '@inertiajs/react';
import SideMenu from '../../components/SuperAdmin/Dashboard1/SideMenu';

const Payments = ({
    bookingPayments = [],
    airVehiclePayments = [],
    seaVehiclePayments = [],
    warehousePayments = [],
    courierCardPayments = [],
    codSettlementSummary = {},
    recentCodSettlementBatches = [],
}) => {
    const getStatusBadge = (status) => {
        const statusConfig = {
            paid: 'bg-green-600 text-white',
            pending: 'bg-yellow-600 text-white',
            cancelled: 'bg-red-600 text-white',
            failed: 'bg-red-600 text-white'
        };
        return statusConfig[status?.toLowerCase()] || 'bg-gray-600 text-white';
    };

    const formatDate = (dateString) => {
        if (!dateString) {
            return '-';
        }

        try {
            const parsedDate = new Date(dateString);
            if (Number.isNaN(parsedDate.getTime())) {
                return dateString;
            }

            return parsedDate.toLocaleString();
        } catch {
            return dateString;
        }
    };

    const formatAmount = (value) => {
        const numericValue = Number(value || 0);
        if (Number.isNaN(numericValue)) {
            return '0.00';
        }

        return numericValue.toFixed(2);
    };

    const PaymentTable = ({ title, payments, emptyMessage = "No payments found", showCompanyName = false }) => (
        <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">{title}</h2>
            <div className="bg-[#0A1330] border border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#1E40AF] text-white">
                                <th className="px-4 py-3 text-left font-semibold rounded-tl-lg">ID</th>
                                <th className="px-4 py-3 text-left font-semibold">Method</th>
                                <th className="px-4 py-3 text-left font-semibold">Option</th>
                                <th className="px-4 py-3 text-left font-semibold">Amount Paid</th>
                                <th className="px-4 py-3 text-left font-semibold">Status</th>
                                {showCompanyName && <th className="px-4 py-3 text-left font-semibold">Company</th>}
                                <th className="px-4 py-3 text-left font-semibold rounded-tr-lg">Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments && payments.length > 0 ? (
                                payments.map((payment, index) => (
                                    <tr 
                                        key={payment.id} 
                                        className={`${index % 2 === 0 ? 'bg-[#081028]' : 'bg-[#0A1330]'} hover:bg-[#1E40AF]/20 transition-colors duration-200 border-b border-gray-600`}
                                    >
                                        <td className="px-4 py-3 text-white">{payment.id}</td>
                                        <td className="px-4 py-3 text-gray-300">{payment.method || 'N/A'}</td>
                                        <td className="px-4 py-3 text-gray-300">{payment.option || 'N/A'}</td>
                                        <td className="px-4 py-3 text-green-400 font-semibold">
                                            {(payment.currency_code || 'LKR').toUpperCase()} {typeof payment.amount_paid === 'number' ? payment.amount_paid.toFixed(2) : parseFloat(payment.amount_paid || 0).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(payment.status)}`}>
                                                {payment.status ? payment.status.charAt(0).toUpperCase() + payment.status.slice(1) : 'Unknown'}
                                            </span>
                                        </td>
                                        {showCompanyName && <td className="px-4 py-3 text-gray-300">{payment.company_name || 'N/A'}</td>}
                                        <td className="px-4 py-3 text-gray-400">
                                            {formatDate(payment.created_at)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={showCompanyName ? "7" : "6"} className="px-4 py-8 text-center text-gray-400">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const CourierCardPaymentTable = ({ title, payments, emptyMessage = "No courier card payments found" }) => (
        <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">{title}</h2>
            <div className="bg-[#0A1330] border border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1400px]">
                        <thead>
                            <tr className="bg-[#1E40AF] text-white">
                                <th className="px-4 py-3 text-left font-semibold rounded-tl-lg">Payment ID</th>
                                <th className="px-4 py-3 text-left font-semibold">Shipment Ref</th>
                                <th className="px-4 py-3 text-left font-semibold">Method</th>
                                <th className="px-4 py-3 text-left font-semibold">Provider</th>
                                <th className="px-4 py-3 text-left font-semibold">Amount</th>
                                <th className="px-4 py-3 text-left font-semibold">Status</th>
                                <th className="px-4 py-3 text-left font-semibold">Order Ref</th>
                                <th className="px-4 py-3 text-left font-semibold">Gateway Ref</th>
                                <th className="px-4 py-3 text-left font-semibold">Txn Ref</th>
                                <th className="px-4 py-3 text-left font-semibold">Initiated</th>
                                <th className="px-4 py-3 text-left font-semibold">Paid At</th>
                                <th className="px-4 py-3 text-left font-semibold">Failed At</th>
                                <th className="px-4 py-3 text-left font-semibold">Last Notified</th>
                                <th className="px-4 py-3 text-left font-semibold rounded-tr-lg">Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments && payments.length > 0 ? (
                                payments.map((payment, index) => (
                                    <tr
                                        key={payment.id}
                                        className={`${index % 2 === 0 ? 'bg-[#081028]' : 'bg-[#0A1330]'} hover:bg-[#1E40AF]/20 transition-colors duration-200 border-b border-gray-600`}
                                    >
                                        <td className="px-4 py-3 text-white">{payment.id}</td>
                                        <td className="px-4 py-3 text-gray-300">{payment.shipment_reference || 'N/A'}</td>
                                        <td className="px-4 py-3 text-gray-300 uppercase">{payment.method || 'N/A'}</td>
                                        <td className="px-4 py-3 text-gray-300 uppercase">{payment.option || 'N/A'}</td>
                                        <td className="px-4 py-3 text-green-400 font-semibold">
                                            {(payment.currency_code || 'LKR').toUpperCase()} {typeof payment.amount_paid === 'number' ? payment.amount_paid.toFixed(2) : parseFloat(payment.amount_paid || 0).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(payment.status)}`}>
                                                {payment.status ? payment.status.charAt(0).toUpperCase() + payment.status.slice(1) : 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-300">{payment.gateway_order_id || 'N/A'}</td>
                                        <td className="px-4 py-3 text-gray-300">{payment.gateway_payment_id || 'N/A'}</td>
                                        <td className="px-4 py-3 text-gray-300">{payment.tx_reference || 'N/A'}</td>
                                        <td className="px-4 py-3 text-gray-400">{formatDate(payment.initiated_at)}</td>
                                        <td className="px-4 py-3 text-gray-400">{formatDate(payment.paid_at)}</td>
                                        <td className="px-4 py-3 text-gray-400">{formatDate(payment.failed_at)}</td>
                                        <td className="px-4 py-3 text-gray-400">{formatDate(payment.last_notified_at)}</td>
                                        <td className="px-4 py-3 text-gray-400">{formatDate(payment.created_at)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="14" className="px-4 py-8 text-center text-gray-400">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <Head title="Payments - SuperAdmin" />
            
            <div className='flex flex-row bg-[#081028] min-h-screen poppins'>
                <div className='sm:w-full md:w-auto lg:w-auto'>
                    <SideMenu />
                </div>
                
                <div className='flex-1 p-8'>
                    <div className='max-w-7xl mx-auto'>
                        {/* Header */}
                        <div className='mb-8'>
                            <h1 className='text-3xl font-bold text-white mb-2'>Payments</h1>
                            <p className='text-gray-400'>View and manage all payment transactions across booking types</p>
                        </div>

                        <div className='mb-8 rounded-lg border border-cyan-800/60 bg-cyan-900/10 p-6'>
                            <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
                                <div>
                                    <h2 className='text-xl font-semibold text-cyan-200'>COD Settlement Reconciliation</h2>
                                    <p className='mt-1 text-sm text-cyan-100/80'>Phase 6 settlement pipeline status and payout-readiness.</p>
                                </div>

                                {codSettlementSummary?.route && (
                                    <Link
                                        href={codSettlementSummary.route}
                                        className='inline-flex items-center rounded-md border border-cyan-500 px-4 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-900/30'
                                    >
                                        Open COD Settlement Workspace
                                    </Link>
                                )}
                            </div>

                            <div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-4'>
                                <div className='rounded-md border border-gray-700 bg-[#081028] px-4 py-3'>
                                    <p className='text-[11px] uppercase tracking-wide text-gray-400'>Open Batches</p>
                                    <p className='mt-1 text-xl font-semibold text-white'>{Number(codSettlementSummary?.openBatchCount || 0)}</p>
                                </div>
                                <div className='rounded-md border border-gray-700 bg-[#081028] px-4 py-3'>
                                    <p className='text-[11px] uppercase tracking-wide text-gray-400'>Ready For Payout</p>
                                    <p className='mt-1 text-xl font-semibold text-emerald-300'>{Number(codSettlementSummary?.readyForPayoutBatchCount || 0)}</p>
                                </div>
                                <div className='rounded-md border border-gray-700 bg-[#081028] px-4 py-3'>
                                    <p className='text-[11px] uppercase tracking-wide text-gray-400'>Open Disputes</p>
                                    <p className='mt-1 text-xl font-semibold text-amber-300'>{Number(codSettlementSummary?.openDisputeCount || 0)}</p>
                                </div>
                                <div className='rounded-md border border-gray-700 bg-[#081028] px-4 py-3'>
                                    <p className='text-[11px] uppercase tracking-wide text-gray-400'>Payout Ready Amount</p>
                                    <p className='mt-1 text-xl font-semibold text-cyan-200'>LKR {formatAmount(codSettlementSummary?.payoutReadyAmount)}</p>
                                </div>
                            </div>

                            <div className='mt-4 rounded-md border border-gray-700 bg-[#081028] p-4'>
                                <h3 className='text-sm font-semibold uppercase tracking-wide text-gray-300'>Recent COD Settlement Batches</h3>

                                {Array.isArray(recentCodSettlementBatches) && recentCodSettlementBatches.length > 0 ? (
                                    <div className='mt-3 space-y-2'>
                                        {recentCodSettlementBatches.map((batch) => (
                                            <div key={batch.id} className='flex flex-col gap-1 rounded-md border border-gray-700 bg-[#03091E] px-3 py-2 text-xs md:flex-row md:items-center md:justify-between'>
                                                <div className='text-gray-200'>
                                                    <span className='font-semibold text-white'>{batch.reference}</span>
                                                    <span className='mx-2 text-gray-500'>|</span>
                                                    <span>{batch.statusLabel}</span>
                                                    <span className='mx-2 text-gray-500'>|</span>
                                                    <span>{batch.reconciliationStatusLabel}</span>
                                                </div>
                                                <div className='text-gray-300'>
                                                    {batch.currencyCode || 'LKR'} {formatAmount(batch.netPayoutAmount)}
                                                    <span className='mx-2 text-gray-500'>|</span>
                                                    {batch.generatedAt || '-'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className='mt-3 text-sm text-gray-400'>No settlement batches available yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Payment Tables */}
                        <div id="payments-section" className="space-y-8">
                            <PaymentTable 
                                title="Land Booking Payments" 
                                payments={bookingPayments}
                                emptyMessage="No booking payments found"
                            />
                            
                            <PaymentTable 
                                title="Air Vehicle Payments" 
                                payments={airVehiclePayments}
                                emptyMessage="No air vehicle payments found"
                            />
                            
                            <PaymentTable 
                                title="Sea Vehicle Payments" 
                                payments={seaVehiclePayments}
                                emptyMessage="No sea vehicle payments found"
                            />

                            <PaymentTable 
                                title="Warehouse Booking Payments" 
                                payments={warehousePayments}
                                emptyMessage="No warehouse payments found"
                                showCompanyName={true}
                            />

                            <CourierCardPaymentTable
                                title="Courier Card Payments"
                                payments={courierCardPayments}
                                emptyMessage="No courier card payments found"
                            />
                        </div>

                        {/* Usage Information */}
                        <div className='mt-8 bg-[#0A1330] border border-gray-700 rounded-lg p-6'>
                            <h3 className='text-lg font-semibold text-white mb-3'>Payment Statistics</h3>
                            <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
                                <div className='space-y-1'>
                                    <h4 className='text-sm font-medium text-blue-400'>Land Booking Payments</h4>
                                    <p className='text-sm text-gray-300'>
                                        Total: {bookingPayments?.length || 0} transactions
                                    </p>
                                </div>
                                <div className='space-y-1'>
                                    <h4 className='text-sm font-medium text-green-400'>Air Vehicle Payments</h4>
                                    <p className='text-sm text-gray-300'>
                                        Total: {airVehiclePayments?.length || 0} transactions
                                    </p>
                                </div>
                                <div className='space-y-1'>
                                    <h4 className='text-sm font-medium text-purple-400'>Sea Vehicle Payments</h4>
                                    <p className='text-sm text-gray-300'>
                                        Total: {seaVehiclePayments?.length || 0} transactions
                                    </p>
                                </div>
                                <div className='space-y-1'>
                                    <h4 className='text-sm font-medium text-orange-400'>Warehouse Payments</h4>
                                    <p className='text-sm text-gray-300'>
                                        Total: {warehousePayments?.length || 0} transactions
                                    </p>
                                </div>
                                <div className='space-y-1'>
                                    <h4 className='text-sm font-medium text-cyan-400'>Courier Card Payments</h4>
                                    <p className='text-sm text-gray-300'>
                                        Total: {courierCardPayments?.length || 0} transactions
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Payments;