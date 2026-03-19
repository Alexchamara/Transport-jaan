<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureServicePermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        if (!Auth::check()) {
            return redirect()->route('signin.signin')->with('message', 'Please log in to continue.');
        }

        $user = Auth::user();

        if (!$user->can($permission)) {
            abort(403, 'Missing required permission: ' . $permission);
        }

        return $next($request);
    }
}
