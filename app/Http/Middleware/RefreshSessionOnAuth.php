<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RefreshSessionOnAuth
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // If user is authenticated and session is close to expiring, refresh it
        if (Auth::check() && $request->session()->has('_token')) {
            // Only refresh session for dashboard routes to avoid excessive regeneration
            if ($request->is('client/*') || $request->is('vendors/*') || $request->is('user/*') || $request->is('superadmin/*')) {
                // Refresh the session to prevent expiration (without destroying existing data)
                $request->session()->migrate(false);
            }
        }

        return $next($request);
    }
}
