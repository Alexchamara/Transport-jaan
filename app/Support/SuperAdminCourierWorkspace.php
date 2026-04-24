<?php

namespace App\Support;

use App\Models\ServiceWorkspace;
use App\Models\User;

class SuperAdminCourierWorkspace
{
    public const DEFAULT_SERVICE_KEY = 'superadmin_courier_access';
    public const DEFAULT_WORKSPACE_NAME = 'SuperAdmin Courier Access';

    public static function serviceKey(): string
    {
        return (string) config('courier.superadmin_rbac.service_key', self::DEFAULT_SERVICE_KEY);
    }

    public static function workspaceName(): string
    {
        return (string) config('courier.superadmin_rbac.workspace_name', self::DEFAULT_WORKSPACE_NAME);
    }

    public static function forUser(User $user): ServiceWorkspace
    {
        return ServiceWorkspace::query()->firstOrCreate(
            [
                'vendor_user_id' => (int) $user->id,
                'service_key' => self::serviceKey(),
            ],
            [
                'owner_user_id' => (int) $user->id,
                'name' => self::workspaceName(),
                'status' => 'active',
            ]
        );
    }

    public static function idForUser(User $user): int
    {
        return (int) self::forUser($user)->id;
    }
}
