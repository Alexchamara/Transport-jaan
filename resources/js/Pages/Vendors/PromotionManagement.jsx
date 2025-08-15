import { usePage, Link } from '@inertiajs/react';
import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { FaBullhorn, FaPlus, FaEdit, FaTrashAlt } from 'react-icons/fa';
// import CalendarView from './CalendarView'; // Optional if using a calendar component

export default function PromotionManagement() {
  const { props } = usePage();
  const successMessage = props.flash?.success;

  const promotions = props.promotions || []; // Replace with actual promotions passed from controller

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-500 to-gray-600 py-10 px-4">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* Header Section */}
          <div className="bg-white shadow-xl rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <FaBullhorn className="text-orange-500 text-4xl" />
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                Promotions & Discounts
              </h1>
            </div>
            <Link
              href="/promotions/create"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-orange-600 transition"
            >
              <FaPlus />
              Create New Promotion
            </Link>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow">
              ✅ {successMessage}
            </div>
          )}

          {/* Promotions Table */}
          <div className="bg-white rounded-3xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Current Promotions</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto text-left">
                <thead>
                  <tr className="bg-gray-100 text-sm text-gray-600 uppercase">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Discount</th>
                    <th className="px-4 py-3">Valid From</th>
                    <th className="px-4 py-3">Valid To</th>
                    <th className="px-4 py-3">Usage</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.length > 0 ? (
                    promotions.map((promo) => (
                      <tr key={promo.id} className="border-b hover:bg-gray-50 text-gray-700">
                        <td className="px-4 py-3">{promo.title}</td>
                        <td className="px-4 py-3">{promo.promo_code || '-'}</td>
                        <td className="px-4 py-3">
                          {promo.discount_type === 'percentage'
                            ? `${promo.discount_value}%`
                            : `LKR ${promo.discount_value}`}
                        </td>
                        <td className="px-4 py-3">{promo.start_date}</td>
                        <td className="px-4 py-3">{promo.end_date}</td>
                        <td className="px-4 py-3">{promo.times_used} / {promo.usage_limit || '∞'}</td>
                        <td className="px-4 py-3 space-x-2">
                          <Link href={`/promotions/${promo.id}/edit`} className="text-blue-500 hover:text-blue-700">
                            <FaEdit />
                          </Link>
                          <Link href={`/promotions/${promo.id}/delete`} method="delete" as="button" className="text-red-500 hover:text-red-700">
                            <FaTrashAlt />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-6 text-center text-gray-500" colSpan={7}>
                        No promotions available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calendar Placeholder */}
          <div className="bg-white rounded-3xl shadow-md p-6 text-center text-gray-600">
            📆 <strong>Calendar View</strong> coming soon: Visualize active promotions on a calendar!
            {/* <CalendarView /> */}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
