import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register({ countries = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        address: '',
        country: '',
        phone: '',
        role_type: 'user',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h2>
                        <p className="text-gray-600">Join us today and start your journey</p>
                    </div>

                    {/* Main Form Card */}
                    <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
                        <form onSubmit={submit} className="space-y-8">
                            {/* Personal Information Section */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <InputLabel htmlFor="name" value="Full Name" className="text-sm font-medium text-gray-700" />
                                        <TextInput
                                            id="name"
                                            name="name"
                                            value={data.name}
                                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            autoComplete="name"
                                            isFocused={true}
                                            onChange={(e) => setData('name', e.target.value)}
                                            required
                                            placeholder="Enter your full name"
                                        />
                                        <InputError message={errors.name} className="mt-2" />
                                    </div>

                                    <div className="space-y-2">
                                        <InputLabel htmlFor="email" value="Email Address" className="text-sm font-medium text-gray-700" />
                                        <TextInput
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            autoComplete="username"
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                            placeholder="Enter your email address"
                                        />
                                        <InputError message={errors.email} className="mt-2" />
                                    </div>

                                    <div className="space-y-2">
                                        <InputLabel htmlFor="phone" value="Phone Number" className="text-sm font-medium text-gray-700" />
                                        <TextInput
                                            id="phone"
                                            name="phone"
                                            value={data.phone}
                                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            onChange={(e) => setData('phone', e.target.value)}
                                            required
                                            placeholder="Enter your phone number"
                                        />
                                        <InputError message={errors.phone} className="mt-2" />
                                    </div>

                                    <div className="space-y-2">
                                        <InputLabel htmlFor="role_type" value="Account Type" className="text-sm font-medium text-gray-700" />
                                        <select
                                            id="role_type"
                                            name="role_type"
                                            value={data.role_type}
                                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-white"
                                            onChange={(e) => setData('role_type', e.target.value)}
                                            required
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                            <option value="superadmin">Super Admin</option>
                                            <option value="vendor">Vendor</option>
                                            <option value="driver">Driver</option>
                                        </select>
                                        <InputError message={errors.role_type} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Location Information Section */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                                    Location Information
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-2 lg:col-span-1">
                                        <InputLabel htmlFor="country" value="Country" className="text-sm font-medium text-gray-700" />
                                        {/* <select
                                            id="country"
                                            name="country"
                                            value={data.country}
                                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-white"
                                            onChange={(e) => setData('country', e.target.value)}
                                            required
                                        >
                                            <option value="">Select your country...</option>
                                            {countries.map((country) => (
                                                <option key={country} value={country}>
                                                    {country}
                                                </option>
                                            ))}
                                        </select> */}



          <select
    id="country"
    name="country"
    value={data.country}
    onChange={(e) => setData('country', e.target.value)}
      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 bg-white"
    required
>
    <option value="">Select your country...</option>
    {countries.map((country) => (
        <option key={country.code} value={country.code}>
            {country.name}
        </option>
    ))}
</select>


                                        <InputError message={errors.country} className="mt-2" />
                                    </div>

                                    <div className="space-y-2 lg:col-span-1">
                                        <InputLabel htmlFor="address" value="Address" className="text-sm font-medium text-gray-700" />
                                        <TextInput
                                            id="address"
                                            name="address"
                                            value={data.address}
                                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            onChange={(e) => setData('address', e.target.value)}
                                            required
                                            placeholder="Enter your address"
                                        />
                                        <InputError message={errors.address} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Security Section */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                                    Security Information
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <InputLabel htmlFor="password" value="Password" className="text-sm font-medium text-gray-700" />
                                        <TextInput
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={data.password}
                                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            autoComplete="new-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                            required
                                            placeholder="Enter a strong password"
                                        />
                                        <InputError message={errors.password} className="mt-2" />
                                        <p className="text-xs text-gray-500 mt-1">Password should be at least 8 characters long</p>
                                    </div>

                                    <div className="space-y-2">
                                        <InputLabel
                                            htmlFor="password_confirmation"
                                            value="Confirm Password"
                                            className="text-sm font-medium text-gray-700"
                                        />
                                        <TextInput
                                            id="password_confirmation"
                                            type="password"
                                            name="password_confirmation"
                                            value={data.password_confirmation}
                                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                                            autoComplete="new-password"
                                            onChange={(e) =>
                                                setData('password_confirmation', e.target.value)
                                            }
                                            required
                                            placeholder="Confirm your password"
                                        />
                                        <InputError
                                            message={errors.password_confirmation}
                                            className="mt-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Section */}
                            <div className="pt-6 border-t border-gray-200">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <Link
                                        href={route('login')}
                                        className="text-sm text-indigo-600 hover:text-indigo-500 font-medium transition-colors duration-200 flex items-center gap-1"
                                    >
                                        ← Already have an account? Sign in
                                    </Link>

                                    <PrimaryButton
                                        className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 rounded-lg font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Creating Account...
                                            </span>
                                        ) : (
                                            'Create Account'
                                        )}
                                    </PrimaryButton>
                                </div>

                                <p className="text-xs text-gray-500 text-center mt-4">
                                    By creating an account, you agree to our Terms of Service and Privacy Policy
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
