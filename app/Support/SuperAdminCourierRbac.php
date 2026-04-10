<?php

namespace App\Support;

use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class SuperAdminCourierRbac
{
    public const GUARD = 'web';
    public const DEFAULT_PERMISSION_PREFIX = 'superadmin.courier.';

    public static function permissions(): array
    {
        return [
            self::permissionName('reports.view'),
            self::permissionName('cod.settings.view'),
            self::permissionName('cod.settings.update'),
            self::permissionName('cod.capabilities.review'),
            self::permissionName('cod.incidents.manage'),
            self::permissionName('cod.compliance.export'),
            self::permissionName('payments.view'),
        ];
    }

    public static function roleMap(): array
    {
        return [
            'superadmin_courier_readonly' => [
                self::permissionName('reports.view'),
                self::permissionName('cod.settings.view'),
            ],
            'superadmin_courier_ops' => [
                self::permissionName('reports.view'),
                self::permissionName('cod.settings.view'),
                self::permissionName('cod.capabilities.review'),
                self::permissionName('cod.incidents.manage'),
            ],
            'superadmin_courier_finance' => [
                self::permissionName('reports.view'),
                self::permissionName('cod.settings.view'),
                self::permissionName('cod.settings.update'),
                self::permissionName('cod.compliance.export'),
                self::permissionName('payments.view'),
            ],
            'superadmin_courier_compliance' => [
                self::permissionName('reports.view'),
                self::permissionName('cod.settings.view'),
                self::permissionName('cod.capabilities.review'),
                self::permissionName('cod.incidents.manage'),
                self::permissionName('cod.compliance.export'),
            ],
        ];
    }

    public static function permissionPrefix(): string
    {
        return (string) config('courier.superadmin_rbac.permission_prefix', self::DEFAULT_PERMISSION_PREFIX);
    }

    public static function permissionName(string $suffix): string
    {
        return self::permissionPrefix() . ltrim($suffix, '.');
    }

    public static function ensureDefinitionsExist(): void
    {
        app(PermissionRegistrar::class)->setPermissionsTeamId(null);
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (self::permissions() as $permissionName) {
            Permission::findOrCreate($permissionName, self::GUARD);
        }

        foreach (self::roleMap() as $roleName => $rolePermissions) {
            $role = Role::query()->firstOrCreate(
                [
                    'name' => $roleName,
                    'guard_name' => self::GUARD,
                    config('permission.column_names.team_foreign_key', 'service_workspace_id') => null,
                ]
            );

            $role->syncPermissions($rolePermissions);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
