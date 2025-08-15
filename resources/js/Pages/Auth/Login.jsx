import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            {/* Header Section */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome Back
                </h1>
                <p className="text-gray-600">
                    Sign in to your account to continue
                </p>
            </div>

            {/* Status Message */}
            {status && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.53 10.22a.75.75 0 00-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">
                                {status}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Login Form */}
            <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
                <form onSubmit={submit} className="space-y-6">
                    {/* Email Field */}
                    <div className="space-y-2">
                        <InputLabel
                            htmlFor="email"
                            value="Email Address"
                            className="text-sm font-semibold text-gray-700"
                        />
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                            </div>
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-200"
                                autoComplete="username"
                                isFocused={true}
                                placeholder="Enter your email"
                                onChange={(e) => setData('email', e.target.value)}
                            />
                        </div>
                        <InputError message={errors.email} className="mt-1" />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <InputLabel
                            htmlFor="password"
                            value="Password"
                            className="text-sm font-semibold text-gray-700"
                        />
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition duration-200"
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                        </div>
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center group cursor-pointer">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                            <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-800 transition duration-200">
                                Remember me
                            </span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium transition duration-200 hover:underline"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <PrimaryButton
                            className="w-full justify-center py-3 px-4 text-base font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-200 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            disabled={processing}
                        >
                            {processing ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </PrimaryButton>
                    </div>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link
                            href={route('register')}
                            className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-200"
                        >
                            Sign up here
                        </Link>
                    </p>
                </div>
            </div>

            {/* Additional Security Notice */}
            <div className="mt-6 text-center">
                <div className="flex items-center justify-center text-xs text-gray-500">
                    <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Your information is protected with enterprise-grade security
                </div>
            </div>
        </GuestLayout>
    );
}
