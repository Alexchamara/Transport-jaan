import { usePage, Link } from '@inertiajs/react';
import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function VendorDashboard() {
  const { props } = usePage();
  const successMessage = props.flash?.success;

  const dashboardCards = [
    {
      title: "Vehicle Management",
      description: "Manage your registered vehicles, add new ones, and check availability.",
      href: "/vendor/vehicles",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      gradient: "from-indigo-500 to-purple-600",
      bgPattern: "bg-gradient-to-br from-indigo-50 to-purple-50",
      stats: "12 Active"
    },
    {
      title: "Booking Management",
      description: "View and manage bookings, accept or reject reservations, and track status.",
      href: "/vendor/booking-management",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      gradient: "from-amber-500 to-orange-600",
      bgPattern: "bg-gradient-to-br from-amber-50 to-orange-50",
      stats: "8 Pending"
    },
    {
      title: "Earnings & Payouts",
      description: "Track your earnings, request payouts, and view detailed payment history.",
      href: "/vendor/earning-management",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-emerald-500 to-teal-600",
      bgPattern: "bg-gradient-to-br from-emerald-50 to-teal-50",
      stats: "$12,450"
    },
    {
      title: "Session Management",
      description: "Control booking sessions, manage availability windows and scheduling.",
      href: "/vendor/bookingsession-management",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      gradient: "from-cyan-500 to-blue-600",
      bgPattern: "bg-gradient-to-br from-cyan-50 to-blue-50",
      stats: "24 Sessions"
    },
    {
      title: "Promotions & Discounts",
      description: "Create compelling offers and manage discounts to attract more customers.",
      href: "/vendor/promotion-management",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      gradient: "from-rose-500 to-pink-600",
      bgPattern: "bg-gradient-to-br from-rose-50 to-pink-50",
      stats: "5 Active"
    },
    {
      title: "Reports & Analytics",
      description: "Analyze business performance, view trends, and optimize your operations.",
      href: "/vendor/report-management",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: "from-violet-500 to-purple-600",
      bgPattern: "bg-gradient-to-br from-violet-50 to-purple-50",
      stats: "↗ 23%"
    },
    {
      title: "Reviews & Ratings",
      description: "Monitor customer feedback and maintain your reputation with excellence.",
      href: "/vendor/review-management",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      gradient: "from-blue-500 to-indigo-600",
      bgPattern: "bg-gradient-to-br from-blue-50 to-indigo-50",
      stats: "4.8★ Rating"
    },
    {
      title: "Warehouse Management",
      description: "Optimize your storage spaces, manage inventory and track utilization.",
      href: "/vendor/warehouses",
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      gradient: "from-green-500 to-emerald-600",
      bgPattern: "bg-gradient-to-br from-green-50 to-emerald-50",
      stats: "85% Full"
    }
  ];

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">

            {/* Enhanced Header Section */}
            <div className="mb-12">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
                      Vendor Dashboard
                    </h1>
                  </div>
                  <p className="text-lg text-gray-600 max-w-2xl">
                    Welcome to your command center. Manage your vehicle rental business with powerful tools and insights.
                  </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                  <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl shadow-lg animate-slide-in-right">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="font-medium">{successMessage}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Stats Bar */}
              <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Revenue", value: "$45,230", change: "+12.5%", positive: true },
                  { label: "Active Bookings", value: "23", change: "+3", positive: true },
                  { label: "Fleet Utilization", value: "87%", change: "+5%", positive: true },
                  { label: "Customer Rating", value: "4.9", change: "+0.2", positive: true }
                ].map((stat, index) => (
                  <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${stat.positive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {stat.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Dashboard Cards Grid */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {dashboardCards.map((card, index) => (
                <Link
                  href={card.href}
                  key={index}
                  className="group block"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`relative h-full ${card.bgPattern} rounded-3xl shadow-lg border border-white/50 overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:-translate-y-2 animate-fade-in-up`}>

                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                    {/* Floating orb decoration */}
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:bg-white/30 transition-all duration-500"></div>

                    <div className="relative p-8">
                      {/* Icon with gradient background */}
                      <div className={`w-16 h-16 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                        <div className="text-white">
                          {card.icon}
                        </div>
                      </div>

                      {/* Stats badge */}
                      <div className="absolute top-6 right-6 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-md">
                        {card.stats}
                      </div>

                      {/* Content */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-300">
                          {card.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                          {card.description}
                        </p>

                        {/* Action indicator */}
                        <div className="flex items-center justify-between pt-4">
                          <div className="flex items-center text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                            <span>Manage</span>
                            <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>

                          {/* Floating action button */}
                          <div className={`w-10 h-10 bg-gradient-to-br ${card.gradient} rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-500`}>
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Bottom Section - Quick Actions */}
            <div className="mt-16 bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Add Vehicle", icon: "M12 4v16m8-8H4" },
                  { label: "Create Promotion", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
                  { label: "View Reports", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
                  { label: "Support", icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }
                ].map((action, index) => (
                  <button key={index} className="flex flex-col items-center p-4 rounded-2xl hover:bg-white/80 transition-all duration-300 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={action.icon} />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </AuthenticatedLayout>
  );
}
