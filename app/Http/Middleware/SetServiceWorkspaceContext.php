<?php

namespace App\Http\Middleware;

use App\Models\ServiceWorkspace;
use App\Models\VendorUserMembership;
use App\Services\Rbac\ServiceWorkspaceManager;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\PermissionRegistrar;
use Symfony\Component\HttpFoundation\Response;

class SetServiceWorkspaceContext
{
    public function __construct(
        private readonly ServiceWorkspaceManager $workspaceManager,
    ) {
    }

    public function handle(Request $request, Closure $next, string $serviceKey): Response
    {
        if (!Auth::check()) {
            return redirect()->route('signin.signin')->with('message', 'Please log in to continue.');
        }

        $actor = Auth::user();
        $vendorUser = $this->workspaceManager->resolveVendorUserForActor($actor);

        if (!$vendorUser) {
            abort(403, 'You are not assigned to any vendor workspace.');
        }

        if (!$this->workspaceManager->hasApprovedService($vendorUser, $serviceKey)) {
            abort(403, 'Selected service is not approved for this vendor.');
        }

        $workspace = $this->workspaceManager->ensureWorkspaceForVendor($vendorUser, $serviceKey);

        if (!$workspace->isActive()) {
            abort(403, 'Service workspace is not active.');
        }

        if ($actor->id !== $vendorUser->id) {
            $membership = VendorUserMembership::query()
                ->where('vendor_user_id', $vendorUser->id)
                ->where('user_id', $actor->id)
                ->where('status', 'active')
                ->first();

            if (!$membership) {
                abort(403, 'You are not an active member of this vendor team.');
            }

            if ($membership->isBlockedForService($serviceKey)) {
                abort(403, 'Your access to this service is blocked by admin.');
            }
        }

        app(PermissionRegistrar::class)->setPermissionsTeamId($workspace->id);

        $request->attributes->set('service_workspace_id', $workspace->id);
        $request->attributes->set('service_key', $serviceKey);
        $request->attributes->set('vendor_user_id', $vendorUser->id);

        return $next($request);
    }
}
