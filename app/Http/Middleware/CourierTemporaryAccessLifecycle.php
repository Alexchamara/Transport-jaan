<?php

namespace App\Http\Middleware;

use App\Services\Courier\CourierTemporaryAccessService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CourierTemporaryAccessLifecycle
{
    public function handle(Request $request, Closure $next)
    {
        $vendorUserId = (int) $request->attributes->get('vendor_user_id');
        $workspaceId = $request->attributes->get('service_workspace_id');
        $workspaceId = $workspaceId !== null ? (int) $workspaceId : null;

        if ($vendorUserId > 0) {
            try {
                app(CourierTemporaryAccessService::class)->revokeExpiredForWorkspace($vendorUserId, $workspaceId);
            } catch (\Throwable $exception) {
                Log::warning('Courier temporary access lifecycle revoke failed', [
                    'vendor_user_id' => $vendorUserId,
                    'workspace_id' => $workspaceId,
                    'error' => $exception->getMessage(),
                ]);
            }
        }

        return $next($request);
    }
}
