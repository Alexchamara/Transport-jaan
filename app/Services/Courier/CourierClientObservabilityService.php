<?php

namespace App\Services\Courier;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CourierClientObservabilityService
{
    private const DENIAL_WINDOW_MINUTES = 15;
    private const DENIAL_ALERT_THRESHOLD = 5;

    public function logCreateViewOpened(Request $request, array $context = []): void
    {
        Log::info('COURIER CLIENT CREATE VIEW OPENED', $this->context($request, $context));
    }

    public function logDetailsViewOpened(Request $request, array $context = []): void
    {
        Log::info('COURIER CLIENT DETAILS VIEW OPENED', $this->context($request, $context));
    }

    public function logDetailRead(Request $request, int $shipmentId, array $context = []): void
    {
        Log::info('COURIER CLIENT DETAIL READ', $this->context($request, array_merge([
            'shipment_id' => $shipmentId,
        ], $context)));
    }

    public function logStoreAttempt(Request $request, array $context = []): void
    {
        Log::info('COURIER CLIENT STORE ATTEMPT', $this->context($request, $context));
    }

    public function logStoreSucceeded(Request $request, int $shipmentId, array $context = []): void
    {
        Log::info('COURIER CLIENT STORE SUCCESS', $this->context($request, array_merge([
            'shipment_id' => $shipmentId,
        ], $context)));
    }

    public function logStoreFailed(Request $request, string $reason, array $context = []): void
    {
        Log::warning('COURIER CLIENT STORE FAILURE', $this->context($request, array_merge([
            'reason' => $reason,
        ], $context)));
    }

    public function recordOwnershipFailure(Request $request, string $resourceType, int $resourceId, array $context = []): void
    {
        Log::warning('COURIER CLIENT OWNERSHIP FAILURE', $this->context($request, array_merge([
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
        ], $context)));

        $this->recordAuthorizationDenial($request, 'ownership_failure', array_merge([
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
        ], $context));
    }

    public function recordAuthorizationDenial(Request $request, string $reason, array $context = []): void
    {
        $key = $this->authorizationDenialCacheKey($request, $reason);
        $ttl = now()->addMinutes(self::DENIAL_WINDOW_MINUTES);

        if (!Cache::has($key)) {
            Cache::put($key, 0, $ttl);
        }

        $attemptCount = (int) Cache::increment($key);
        Cache::put($key, $attemptCount, $ttl);

        $denialContext = $this->context($request, array_merge([
            'reason' => $reason,
            'attempt_count' => $attemptCount,
            'window_minutes' => self::DENIAL_WINDOW_MINUTES,
        ], $context));

        Log::warning('COURIER CLIENT AUTHORIZATION DENIED', $denialContext);

        if ($attemptCount >= self::DENIAL_ALERT_THRESHOLD) {
            Log::error('COURIER CLIENT REPEATED AUTHORIZATION DENIALS', $denialContext);
        }
    }

    public function reportPricingException(Request $request, string $phase, string $message, array $context = []): void
    {
        Log::error('COURIER CLIENT PRICING EXCEPTION', $this->context($request, array_merge([
            'phase' => $phase,
            'message' => $message,
        ], $context)));
    }

    private function authorizationDenialCacheKey(Request $request, string $reason): string
    {
        $actorId = (int) optional($request->user())->id;
        $actorKey = $actorId > 0 ? 'user_' . $actorId : 'ip_' . sha1((string) $request->ip());

        $routeName = (string) optional($request->route())->getName();
        if ($routeName === '') {
            $routeName = $request->path();
        }

        return 'courier:client:auth_denial:' . sha1($actorKey . '|' . $reason . '|' . $routeName);
    }

    private function context(Request $request, array $context = []): array
    {
        return array_merge([
            'actor_user_id' => (int) optional($request->user())->id ?: null,
            'route_name' => optional($request->route())->getName(),
            'path' => $request->path(),
            'ip_address' => $request->ip(),
            'user_agent' => mb_substr((string) $request->userAgent(), 0, 255),
        ], $context);
    }
}
