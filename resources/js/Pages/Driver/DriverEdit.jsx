import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function DriverEdit({ auth, driver }) {
  const { data, setData, post, progress, errors } = useForm({
    dob: driver?.dob || '',
    license_number: driver?.license_number || '',
    nic: null,
    profile_photo: null,
    license: null,
    police_clearance: null,
    certifications: null,
  });

  const handleChange = (e) => {
    const { name, type, value, files } = e.target;
    setData(name, type === 'file' ? files[0] : value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('driver.update'), {
      forceFormData: true,
    });
  };

  const getInputClassName = (fieldName) => {
    const baseClass = "w-full px-4 py-3 border rounded-lg shadow-sm focus:ring focus:ring-blue-200 focus:outline-none";
    return errors[fieldName]
      ? `${baseClass} border-red-500 focus:ring-red-200`
      : `${baseClass} border-gray-300`;
  };

  const getFileInputClassName = (fieldName) => {
    const baseClass = "w-full px-4 py-2 border rounded-lg shadow-sm bg-white focus:ring focus:ring-blue-200 focus:outline-none";
    return errors[fieldName]
      ? `${baseClass} border-red-500 focus:ring-red-200`
      : `${baseClass} border-gray-300`;
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Edit Driver Profile" />
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-8 md:p-12 mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 border-b pb-4">✏️ Edit Driver Profile</h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Left Column: Personal Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">👤 Personal Information</h3>

            {/* Read-only User Info */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
              <input
                type="text"
                value={driver.user?.name || ''}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <input
                type="email"
                value={driver.user?.email || ''}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
              <input
                type="text"
                value={driver.user?.phone || ''}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
              <input
                type="text"
                value={driver.user?.address || ''}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            {/* Editable Driver Info */}
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-600 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={data.dob}
                onChange={handleChange}
                className={getInputClassName('dob')}
                required
              />
              {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob}</p>}
            </div>

            <div>
              <label htmlFor="license_number" className="block text-sm font-medium text-gray-600 mb-1">
                License Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="license_number"
                name="license_number"
                value={data.license_number}
                onChange={handleChange}
                className={getInputClassName('license_number')}
                required
              />
              {errors.license_number && <p className="mt-1 text-sm text-red-600">{errors.license_number}</p>}
            </div>
          </div>

          {/* Right Column: File Uploads */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">📎 Update Documents</h3>

            {[
              {
                name: 'nic',
                label: 'NIC',
                required: false,
                path: driver.nic_path
              },
              {
                name: 'profile_photo',
                label: 'Profile Photo',
                required: false,
                preview: driver.profile_photo
              },
              {
                name: 'license',
                label: 'Driver License',
                required: false,
                path: driver.license_path
              },
              {
                name: 'police_clearance',
                label: 'Police Clearance',
                required: false,
                path: driver.police_clearance_path
              },
              {
                name: 'certifications',
                label: 'Certifications',
                required: false,
                path: driver.certifications
              },
            ].map((file) => (
              <div key={file.name}>
                <label htmlFor={file.name} className="block text-sm font-medium text-gray-600 mb-1">
                  {file.label} {file.required && <span className="text-red-500">*</span>}
                  <span className="text-xs text-gray-500 ml-2">(Optional - leave empty to keep current)</span>
                </label>
                <input
                  type="file"
                  id={file.name}
                  name={file.name}
                  accept={file.name === 'profile_photo' ? 'image/jpeg,image/png,image/jpg' : 'image/jpeg,image/png,application/pdf'}
                  onChange={handleChange}
                  className={getFileInputClassName(file.name)}
                />

                {/* Show current file preview/link */}
                {file.preview && file.name === 'profile_photo' && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Current photo:</p>
                    <img
                      src={`/storage/${file.preview}`}
                      className="w-24 h-24 rounded-full border object-cover"
                      alt="Current profile"
                    />
                  </div>
                )}
                {file.path && file.name !== 'profile_photo' && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Current file:</p>
                    <a
                      href={`/storage/${file.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Current {file.label} →
                    </a>
                  </div>
                )}

                {errors[file.name] && (
                  <p className="mt-1 text-sm text-red-600">{errors[file.name]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 text-right mt-8">
            <button
              type="submit"
              disabled={progress}
              className="bg-green-600 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {progress ? `💾 Updating... ${progress.percentage}%` : '💾 Update Profile'}
            </button>
          </div>
        </form>

        {progress && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm text-blue-700">
                Uploading files... {progress.percentage}%
              </span>
            </div>
            <div className="mt-2 bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
