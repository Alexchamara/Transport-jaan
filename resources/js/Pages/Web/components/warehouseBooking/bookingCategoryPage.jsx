import React from 'react';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import { Warehouse, Snowflake, Package } from 'lucide-react';

export default function WarehouseBookingCategoryPage() {
  return (
    <div className="bg-gradient-to-br from-gray-100 via-white to-gray-50 min-h-screen flex flex-col justify-between">
      <Header />

      <main className="py-16 px-4 sm:px-8 lg:px-20">
        <div className='max-w-7xl mx-auto px-10 py-6'>
          <a href="/" className="mb-6">
            <button>
              <div className="flex items-center justify-between mb-6 text-gray-800 font-semibold text-lg">
                <h2> ⬅️ Back</h2>
              </div>
            </button>
          </a>
        </div>

        <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-16 tracking-tight">
          Select Your Warehouse Type
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Cold Storage */}
          <a href="/warehouse-bookings/bookings/cold-storage">
            <div className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-blue-200 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <Snowflake className="w-10 h-10 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                  Cold Storage
                </h3>
                
                <p className="text-gray-600 text-center leading-relaxed">
                  Temperature-controlled facilities perfect for perishable goods, pharmaceuticals, and frozen items. Maintain optimal conditions for your sensitive inventory.
                </p>
                
                <div className="mt-6 text-center">
                  <span className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                    Temperature Controlled
                  </span>
                </div>
              </div>
            </div>
          </a>

          {/* Dry Storage */}
          <a href="/warehouse-bookings/bookings/dry-storage">
            <div className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-green-200 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-400 opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <Package className="w-10 h-10 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                  Dry Storage
                </h3>
                
                <p className="text-gray-600 text-center leading-relaxed">
                  Standard warehouse facilities ideal for non-perishable goods, equipment, and general inventory storage. Secure and cost-effective solutions.
                </p>
                
                <div className="mt-6 text-center">
                  <span className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                    General Storage
                  </span>
                </div>
              </div>
            </div>
          </a>

          {/* Bonded Warehouse */}
          <a href="/warehouse-bookings/bookings/bonded-warehouse">
            <div className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-purple-200 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-400 opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full mb-6 mx-auto group-hover:scale-110 transition-transform">
                  <Warehouse className="w-10 h-10 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                  Bonded Warehouse
                </h3>
                
                <p className="text-gray-600 text-center leading-relaxed">
                  Customs-approved facilities for import/export goods. Store your international inventory while managing duties and compliance requirements.
                </p>
                
                <div className="mt-6 text-center">
                  <span className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                    Customs Approved
                  </span>
                </div>
              </div>
            </div>
          </a>
        </div>

        {/* Features Section */}
        <div className="mt-20 bg-white rounded-3xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Our Warehouse Solutions?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Flexible Terms</h3>
              <p className="text-gray-600">Short-term and long-term storage options to match your business needs</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Safe</h3>
              <p className="text-gray-600">24/7 security monitoring and climate-controlled environments</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick Setup</h3>
              <p className="text-gray-600">Fast booking process with immediate availability confirmation</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}