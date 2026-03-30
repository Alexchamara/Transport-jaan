<?php

namespace App\Http\Middleware;

use App\Services\Courier\CourierApiServiceAccessService;
use App\Services\Courier\CourierTeamSecurityAuditService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CourierServiceApiKeyAuth
{
    public function handle(Request $request, Closure $next, string $scope, string $webhookScope = null): Response
    {
        $rawKey = trim((string) $request->header('X-Courier-Api-Key'));
        if ($rawKey === '') {
            $authHeader = trim((string) $request->header('Authorization'));
            if (str_starts_with(strtolower($authHeader), 'bearer ')) {
                $rawKey = trim(substr($authHeader, 7));
            }
        }

        $result = app(CourierApiServiceAccessService::class)->authenticateApiRequest(
            $request,
            $rawKey,
            $scope,
            $webhookScope ?: null
        );

        if (!(bool) ($result['ok'] ?? false)) {
            $credential = $result['credential'] ?? null;
            if ($credential) {
                $request->attributes->set('vendor_user_id', (int) $credential->vendor_user_id);
                $request->attributes->set('service_workspace_id', (int) $credential->service_workspace_id);
            }

            app(CourierTeamSecurityAuditService::class)->recordPermissionDenied(
                $request,
                (string) ($result['code'] ?? 'api_key_denied'),
                [
                    'required_scope' => $scope,
                    'required_webhook_scope' => $webhookScope,
                ]
            );

            return response()->json([
                'message' => (string) ($result['message'] ?? 'Unauthorized API access.'),
                'code' => (string) ($result['code'] ?? 'api_unauthorized'),
            ], (int) ($result['status'] ?? 401));
        }

        $credential = $result['credential'];

        $request->attributes->set('vendor_user_id', (int) $credential->vendor_user_id);
        $request->attributes->set('service_workspace_id', (int) $credential->service_workspace_id);
        $request->attributes->set('courier_api_credential_id', (int) $credential->id);
        $request->attributes->set('courier_api_scope', $scope);
        if ($webhookScope !== null && $webhookScope !== '') {
            $request->attributes->set('courier_webhook_scope', $webhookScope);
        }

        return $next($request);
    }
}
