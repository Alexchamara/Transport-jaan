<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class CourierRbacSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'courier.dashboard.view',
            'courier.reports.export',
            'courier.bookings.view',
            'courier.bookings.manage_lifecycle',
            'courier.bookings.bulk_update',
            'courier.shipments.view',
            'courier.shipments.create',
            'courier.shipments.update_stage',
            'courier.shipments.bulk_update',
            'courier.tracking.view',
            'courier.clients.view',
            'courier.clients.manage',
            'courier.settings.view',
            'courier.settings.update',
            'courier.profile.view',
            'courier.profile.update',
            'courier.finance.view',
            'courier.calendar.view',
            'courier.team.view',
            'courier.team.create_user',
            'courier.team.assign_role',
            'courier.team.assign_permissions',
            'courier.team.manage_status',
            'courier.team.sessions.view',
            'courier.team.sessions.revoke',
            'courier.team.transfer_ownership',
        ];

        foreach ($permissions as $permissionName) {
            Permission::findOrCreate($permissionName, 'web');
        }

        $roleMap = [
            'courier_owner' => $permissions,
            'courier_admin' => array_values(array_diff($permissions, ['courier.team.transfer_ownership'])),
            'courier_dispatcher' => [
                'courier.dashboard.view',
                'courier.bookings.view',
                'courier.bookings.manage_lifecycle',
                'courier.bookings.bulk_update',
                'courier.shipments.view',
                'courier.shipments.update_stage',
                'courier.shipments.bulk_update',
                'courier.tracking.view',
                'courier.clients.view',
                'courier.calendar.view',
                'courier.profile.view',
                'courier.profile.update',
            ],
            'courier_tracking_officer' => [
                'courier.dashboard.view',
                'courier.tracking.view',
                'courier.shipments.view',
                'courier.clients.view',
                'courier.profile.view',
                'courier.profile.update',
            ],
            'courier_support' => [
                'courier.dashboard.view',
                'courier.clients.view',
                'courier.clients.manage',
                'courier.tracking.view',
                'courier.profile.view',
                'courier.profile.update',
            ],
            'courier_viewer' => [
                'courier.dashboard.view',
                'courier.bookings.view',
                'courier.shipments.view',
                'courier.tracking.view',
                'courier.clients.view',
                'courier.profile.view',
                'courier.profile.update',
            ],
        ];

        foreach ($roleMap as $roleName => $rolePermissions) {
            $role = Role::findOrCreate($roleName, 'web');
            $role->syncPermissions($rolePermissions);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
