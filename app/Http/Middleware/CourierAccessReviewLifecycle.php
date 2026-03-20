<?php

namespace App\Http\Middleware;

use App\Services\Courier\CourierAccessReviewService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CourierAccessReviewLifecycle
{
    public function handle(Request $request, Closure $next)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $workspaceId = (int) $request->attributes->get('service_workspace_id');

        if ($vendorUserId > 0 && $workspaceId > 0) {
            try {
                app(CourierAccessReviewService::class)->runLifecycle(
                    $vendorUserId,
                    $workspaceId,
                    (int) optional($request->user())->id
                );
            } catch (\Throwable $exception) {
                Log::warning('Courier access review lifecycle failed.', [
                    'vendor_user_id' => $vendorUserId,
                    'workspace_id' => $workspaceId,
                    'error' => $exception->getMessage(),
                ]);
            }
        }

        return $next($request);
    }
}
