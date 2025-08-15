import { usePage } from '@inertiajs/react';
import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { FaStar, FaUserCircle, FaStarHalfAlt, FaQuoteRight } from 'react-icons/fa';

export default function ReviewsRatings() {
  const { props } = usePage();
  const successMessage = props.flash?.success;

  const reviews = props.reviews || []; // Replace with actual reviews data
  const stats = props.stats || {
    totalReviews: 45,
    averageRating: 4.6,
    fiveStars: 30,
    oneStars: 2,
  };

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-500 to-gray-700 py-10 px-4">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* Header */}
          <div className="bg-white shadow-xl rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <FaStar className="text-yellow-500 text-4xl" />
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                Reviews & Ratings
              </h1>
            </div>
          </div>

          {/* Flash Message */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow">
              ✅ {successMessage}
            </div>
          )}

          {/* Review Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Total Reviews" value={stats.totalReviews} />
            <StatCard label="Average Rating" value={`${stats.averageRating} / 5`} />
            <StatCard label="5-Star Reviews" value={stats.fiveStars} />
            <StatCard label="1-Star Reviews" value={stats.oneStars} />
          </div>

          {/* Review Feed */}
          <div className="bg-white rounded-3xl shadow p-6 space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaQuoteRight className="text-indigo-500" />
              Customer Feedback
            </h2>

            {reviews.length > 0 ? (
              <ul className="space-y-6">
                {reviews.map((review, index) => (
                  <li key={index} className="bg-gray-50 border rounded-xl p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center gap-4 mb-2">
                      <FaUserCircle className="text-gray-400 text-3xl" />
                      <div>
                        <p className="font-semibold text-gray-700">{review.customer_name}</p>
                        <p className="text-sm text-gray-500">Vehicle: {review.vehicle_name}</p>
                      </div>
                      <div className="ml-auto text-sm text-gray-400">{review.date}</div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500 mb-2">
                      {Array.from({ length: 5 }, (_, i) => (
                        i < Math.floor(review.rating) ? <FaStar key={i} /> : i < review.rating ? <FaStarHalfAlt key={i} /> : <FaStar key={i} className="text-gray-300" />
                      ))}
                      <span className="ml-2 text-gray-600 text-sm">{review.rating.toFixed(1)} / 5</span>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No reviews available yet.</p>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

// 📦 StatCard Component
function StatCard({ label, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow flex flex-col justify-center hover:shadow-lg transition">
      <p className="text-sm text-gray-500">{label}</p>
      <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
    </div>
  );
}
