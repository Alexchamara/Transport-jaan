<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ClientDashboardController extends Controller
{
    public function dashboard()
    {
        // Ensure user is authenticated
        if (!Auth::check()) {
            return redirect()->route('signin.signin')->with('message', 'Please log in to access the dashboard.');
        }

        // Check if user is verified by admin
        if (Auth::user()->status !== 'verified') {
            return redirect()->route('approval.pending');
        }

        // User is verified, show the dashboard
        return Inertia::render('Web/home/client/ClientMainDashboard');
    }
}
