<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ClientDashboardController extends Controller
{
    public function dashboard(Request $request)
    {
        // Ensure user is authenticated
        if (!Auth::check()) {
            return redirect()->route('signin.signin')->with('message', 'Please log in to access the dashboard.');
        }

        // Refresh session to prevent expiration during use
        $request->session()->regenerate(false);

        $user = Auth::user();

        // Check if user is verified by admin
        if ($user->status !== 'verified') {
            return redirect()->route('approval.pending');
        }

        // User is verified, show the dashboard with fresh CSRF token
        return Inertia::render('Web/home/client/ClientMainDashboard', [
            'user' => $user,
            'csrf_token' => csrf_token(),
        ]);
    }
}
