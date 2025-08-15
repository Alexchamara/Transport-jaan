import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function DriverRegisterForm({ user, errors = {}, flash = {} }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dob: '',
    address: user?.address || '',
    license_number: '',
    nic: null,
    profile_photo: null,
    license: null,
    police_clearance: null,
    certifications: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });

    // Clear specific field error when user starts typing/selecting
    if (errors[name]) {
      delete errors[name];
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = new FormData();

    // Append all form data, including null values for optional fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        form.append(key, value);
      }
    });

    router.post('/driver/driver-store', form, {
      forceFormData: true,
      preserveState: false,
      preserveScroll: false,
      onSuccess: (page) => {
        setIsSubmitting(false);
        // Reset form data
        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          dob: '',
          address: user?.address || '',
          license_number: '',
          nic: null,
          profile_photo: null,
          license: null,
          police_clearance: null,
          certifications: null,
        });
        // Clear file inputs
        document.querySelectorAll('input[type="file"]').forEach((input) => (input.value = ''));

        // Show success message
        if (flash.success) {
          alert('✅ ' + flash.success);
        } else {
          alert('✅ Driver registered successfully!');
        }
      },
      onError: (errors) => {
        setIsSubmitting(false);
        // Display specific validation errors
        const errorMessages = Object.values(errors).flat();
        if (errorMessages.length > 0) {
          alert('❌ Registration failed:\n' + errorMessages.join('\n'));
        } else {
          alert('❌ Failed to register. Please check your inputs.');
        }
      },
      onFinish: () => {
        setIsSubmitting(false);
      }
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
    <AuthenticatedLayout>
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-8 md:p-12 mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 border-b pb-4">🚗 Driver Registration</h2>

        {/* Display flash messages */}
        {flash.success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            ✅ {flash.success}
          </div>
        )}

        {flash.error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            ❌ {flash.error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          encType="multipart/form-data"
        >
          {/* Left Column: Personal Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">👤 Personal Information</h3>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                required
                readOnly
                className={getInputClassName('name') + ' bg-gray-50'}
                onChange={handleChange}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                required
                readOnly
                className={getInputClassName('email') + ' bg-gray-50'}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-600 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                required
                maxLength="20"
                className={getInputClassName('phone')}
                onChange={handleChange}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-600 mb-1">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                placeholder="Full Address"
                value={formData.address}
                required
                rows="3"
                className={getInputClassName('address')}
                onChange={handleChange}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address}</p>
              )}
            </div>

            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-600 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                id="dob"
                type="date"
                name="dob"
                value={formData.dob}
                required
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                className={getInputClassName('dob')}
                onChange={handleChange}
              />
              {errors.dob && (
                <p className="mt-1 text-sm text-red-600">{errors.dob}</p>
              )}
            </div>

            <div>
              <label htmlFor="license_number" className="block text-sm font-medium text-gray-600 mb-1">
                License Number <span className="text-red-500">*</span>
              </label>
              <input
                id="license_number"
                type="text"
                name="license_number"
                placeholder="Driver's License Number"
                value={formData.license_number}
                required
                maxLength="100"
                className={getInputClassName('license_number')}
                onChange={handleChange}
              />
              {errors.license_number && (
                <p className="mt-1 text-sm text-red-600">{errors.license_number}</p>
              )}
            </div>
          </div>

          {/* Right Column: File Uploads */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">📎 Upload Documents</h3>

            <div>
              <label htmlFor="profile_photo" className="block text-sm font-medium text-gray-600 mb-1">
                Profile Photo
              </label>
              <input
                id="profile_photo"
                type="file"
                name="profile_photo"
                accept="image/jpeg,image/jpg,image/png"
                className={getFileInputClassName('profile_photo')}
                onChange={handleChange}
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional. Accepted formats: JPEG, JPG, PNG. Max size: 2MB
              </p>
              {errors.profile_photo && (
                <p className="mt-1 text-sm text-red-600">{errors.profile_photo}</p>
              )}
            </div>

            <div>
              <label htmlFor="nic" className="block text-sm font-medium text-gray-600 mb-1">
                NIC (National Identity Card) <span className="text-red-500">*</span>
              </label>
              <input
                id="nic"
                type="file"
                name="nic"
                accept="image/jpeg,image/png,application/pdf"
                required
                className={getFileInputClassName('nic')}
                onChange={handleChange}
              />
              <p className="mt-1 text-xs text-gray-500">
                Required. Accepted formats: JPEG, PNG, PDF. Max size: 2MB
              </p>
              {errors.nic && (
                <p className="mt-1 text-sm text-red-600">{errors.nic}</p>
              )}
            </div>

            <div>
              <label htmlFor="license" className="block text-sm font-medium text-gray-600 mb-1">
                Driver's License <span className="text-red-500">*</span>
              </label>
              <input
                id="license"
                type="file"
                name="license"
                accept="image/jpeg,image/png,application/pdf"
                required
                className={getFileInputClassName('license')}
                onChange={handleChange}
              />
              <p className="mt-1 text-xs text-gray-500">
                Required. Accepted formats: JPEG, PNG, PDF. Max size: 2MB
              </p>
              {errors.license && (
                <p className="mt-1 text-sm text-red-600">{errors.license}</p>
              )}
            </div>

            <div>
              <label htmlFor="police_clearance" className="block text-sm font-medium text-gray-600 mb-1">
                Police Clearance Certificate <span className="text-red-500">*</span>
              </label>
              <input
                id="police_clearance"
                type="file"
                name="police_clearance"
                accept="image/jpeg,image/png,application/pdf"
                required
                className={getFileInputClassName('police_clearance')}
                onChange={handleChange}
              />
              <p className="mt-1 text-xs text-gray-500">
                Required. Accepted formats: JPEG, PNG, PDF. Max size: 2MB
              </p>
              {errors.police_clearance && (
                <p className="mt-1 text-sm text-red-600">{errors.police_clearance}</p>
              )}
            </div>

            <div>
              <label htmlFor="certifications" className="block text-sm font-medium text-gray-600 mb-1">
                Additional Certifications
              </label>
              <input
                id="certifications"
                type="file"
                name="certifications"
                accept="image/jpeg,image/png,application/pdf"
                className={getFileInputClassName('certifications')}
                onChange={handleChange}
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional. Accepted formats: JPEG, PNG, PDF. Max size: 2MB
              </p>
              {errors.certifications && (
                <p className="mt-1 text-sm text-red-600">{errors.certifications}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 text-right mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`font-semibold px-8 py-3 rounded-lg shadow-md transition duration-300 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Processing...
                </>
              ) : (
                '✅ Register Driver'
              )}
            </button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}
