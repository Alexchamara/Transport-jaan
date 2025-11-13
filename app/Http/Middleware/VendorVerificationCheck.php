<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class VendorVerificationCheck
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Allow guests to proceed to login
        if (!Auth::check()) {
            return redirect()->route('signin.signin')->with('message', 'Please log in to access the dashboard.');
        }

        // Check if user is a vendor
        if (Auth::user()->role !== 'vendor') {
            return redirect()->route('signin.signin')->with('error', 'Access denied. Vendor access required.');
        }

        // If vendor is logged in but not verified, redirect to approval pending page
        if (Auth::user()->status !== 'verified') {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Your vendor account is pending approval from admin.'], 403);
            }

            return redirect()->route('approval.pending');
        }

        return $next($request);
    }
}