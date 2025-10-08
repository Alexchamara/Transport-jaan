<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckUserStatus
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Allow guests to proceed
        if (!Auth::check()) {
            return $next($request);
        }

        // If user is logged in but unverified, redirect to approval pending page
        if (Auth::user()->status === 'unverified') {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Your account is pending approval.'], 403);
            }

            return redirect()->route('approval.pending');
        }

        // Check if user is blocked or rejected
        if (Auth::user()->status === 'blocked' || Auth::user()->status === 'rejected') {
            Auth::logout();

            if ($request->expectsJson()) {
                return response()->json(['message' => 'Your account has been deactivated.'], 403);
            }

            return redirect()->route('login')
                ->with('status', 'Your account has been deactivated. Please contact admin for assistance.');
        }

        return $next($request);
    }
}
