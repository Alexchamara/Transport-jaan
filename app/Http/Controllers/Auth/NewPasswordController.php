<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Rules\PasswordStrength;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class NewPasswordController extends Controller
{
    /**
     * Display the password reset view.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]);
    }

    /**
     * Handle an incoming new password request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()->mixedCase()->numbers()->symbols()->uncompromised(), new PasswordStrength()],
        ]);

        Log::info('Password reset submission attempt.', ['email' => $request->email, 'ip' => $request->ip()]);

        // Here we will attempt to reset the user's password. If it is successful we
        // will update the password on an actual user model and persist it to the
        // database. Otherwise we will parse the error and return the response.
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));

                // Log out other devices using the new password to secure account immediately
                Auth::logoutOtherDevices($request->password);
            }
        );

        if ($status == Password::PASSWORD_RESET) {
            Log::info('Password reset completed successfully.', ['email' => $request->email]);
            return redirect()->route('signin')->with('status', __($status));
        }

        Log::warning('Password reset failed.', ['email' => $request->email, 'reason' => trans($status)]);

        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }
}
