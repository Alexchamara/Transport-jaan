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
            self::permissionName('cod.settlement.batch.manage'),
            self::permissionName('cod.settlement.line.reconcile'),
            self::permissionName('cod.settlement.dispute.manage'),
            self::permissionName('cod.settlement.export'),
            self::permissionName('payments.view'),
            self::permissionName('operations.view'),
            self::permissionName('operations.reassign'),
            self::permissionName('operations.force_transition'),
            self::permissionName('operations.freeze'),
            self::permissionName('operations.cancel_override'),
            self::permissionName('operations.audit.view'),
            self::permissionName('pricing.governance.view'),
            self::permissionName('pricing.governance.policy.manage'),
            self::permissionName('pricing.governance.review'),
            self::permissionName('pricing.governance.override'),
            self::permissionName('pricing.governance.audit.view'),
        ];
    }

    public static function roleMap(): array
    {
        return [
            'superadmin_courier_readonly' => [
                self::permissionName('reports.view'),
                self::permissionName('cod.settings.view'),
                self::permissionName('operations.view'),
                self::permissionName('operations.audit.view'),
                self::permissionName('pricing.governance.view'),
                self::permissionName('pricing.governance.audit.view'),
            ],
            'superadmin_courier_ops' => [
                self::permissionName('reports.view'),
                self::permissionName('cod.settings.view'),
                self::permissionName('cod.capabilities.review'),
                self::permissionName('cod.incidents.manage'),
                self::permissionName('cod.settlement.line.reconcile'),
                self::permissionName('cod.settlement.dispute.manage'),
                self::permissionName('operations.view'),
                self::permissionName('operations.reassign'),
                self::permissionName('operations.force_transition'),
                self::permissionName('operations.freeze'),
                self::permissionName('operations.cancel_override'),
                self::permissionName('operations.audit.view'),
                self::permissionName('pricing.governance.view'),
                self::permissionName('pricing.governance.review'),
                self::permissionName('pricing.governance.override'),
                self::permissionName('pricing.governance.audit.view'),
            ],
            'superadmin_courier_finance' => [
                self::permissionName('reports.view'),
                self::permissionName('cod.settings.view'),
                self::permissionName('cod.settings.update'),
                self::permissionName('cod.compliance.export'),
                self::permissionName('cod.settlement.batch.manage'),
                self::permissionName('cod.settlement.line.reconcile'),
                self::permissionName('cod.settlement.dispute.manage'),
                self::permissionName('cod.settlement.export'),
                self::permissionName('payments.view'),
                self::permissionName('operations.view'),
                self::permissionName('operations.audit.view'),
                self::permissionName('pricing.governance.view'),
                self::permissionName('pricing.governance.policy.manage'),
                self::permissionName('pricing.governance.audit.view'),
            ],
            'superadmin_courier_compliance' => [
                self::permissionName('reports.view'),
                self::permissionName('cod.settings.view'),
                self::permissionName('cod.capabilities.review'),
                self::permissionName('cod.incidents.manage'),
                self::permissionName('cod.compliance.export'),
                self::permissionName('cod.settlement.line.reconcile'),
                self::permissionName('cod.settlement.dispute.manage'),
                self::permissionName('operations.view'),
                self::permissionName('operations.freeze'),
                self::permissionName('operations.audit.view'),
                self::permissionName('pricing.governance.view'),
                self::permissionName('pricing.governance.review'),
                self::permissionName('pricing.governance.audit.view'),
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
