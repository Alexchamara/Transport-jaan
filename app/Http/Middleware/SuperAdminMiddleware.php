<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SuperAdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return redirect()->route('signin.signin')->with('error', 'Please login to access this area.');
        }

        // Check if user has SuperAdmin role
        if (Auth::user()->role !== 'SuperAdmin') {
            abort(403, 'Access denied. Super Admin privileges required.');
        }

        return $next($request);
    }
}
