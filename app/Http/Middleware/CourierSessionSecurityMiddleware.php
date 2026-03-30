<?php

namespace App\Http\Middleware;

use App\Services\Courier\CourierSessionSecurityService;
use Closure;
use Illuminate\Http\Request;

class CourierSessionSecurityMiddleware
{
    private const EXEMPT_ROUTE_NAMES = [
        'courierService.security.step-up.request',
        'courierService.security.step-up.verify',
        'courierService.security.device.trust',
        'courierService.security.status',
    ];

    public function handle(Request $request, Closure $next)
    {
        $routeName = (string) optional($request->route())->getName();
        if (in_array($routeName, self::EXEMPT_ROUTE_NAMES, true)) {
            return $next($request);
        }

        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $workspaceId = (int) $request->attributes->get('service_workspace_id');

        if ($vendorUserId > 0 && $workspaceId > 0 && $request->user()) {
            $result = app(CourierSessionSecurityService::class)->enforce($request, $vendorUserId, $workspaceId);
            if (!(bool) ($result['ok'] ?? false)) {
                $status = (int) ($result['status'] ?? 403);
                $message = (string) ($result['message'] ?? 'Request blocked by session security policy.');

                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => $message,
                        'code' => (string) ($result['code'] ?? 'session_security_blocked'),
                        'requiresTwoFactor' => (bool) ($result['requiresTwoFactor'] ?? false),
                    ], $status);
                }

                return back()->with('error', $message);
            }
        }

        return $next($request);
    }
}
