<?php

namespace App\Services\Rbac;

use App\Models\ServiceWorkspace;
use App\Models\User;
use App\Models\VendorServiceRegistration;
use App\Models\VendorUserMembership;
use Spatie\Permission\PermissionRegistrar;

class ServiceWorkspaceManager
{
    public const COURIER_SERVICE_KEY = 'courier_service';

    public function resolveVendorUserForActor(User $actor): ?User
    {
        if ($actor->role === 'vendor') {
            return $actor;
        }

        $membership = VendorUserMembership::query()
            ->where('user_id', $actor->id)
            ->where('status', 'active')
            ->first();

        return $membership?->vendorUser;
    }

    public function ensureWorkspaceForVendor(User $vendorUser, string $serviceKey): ServiceWorkspace
    {
        $workspaceName = match ($serviceKey) {
            self::COURIER_SERVICE_KEY => 'Courier Service Workspace',
            default => ucfirst(str_replace('_', ' ', $serviceKey)) . ' Workspace',
        };

        $workspace = ServiceWorkspace::query()->firstOrCreate(
            [
                'vendor_user_id' => $vendorUser->id,
                'service_key' => $serviceKey,
            ],
            [
                'name' => $workspaceName,
                'owner_user_id' => $vendorUser->id,
                'status' => 'active',
            ],
        );

        $this->ensureOwnerMembership($vendorUser);
        $this->ensureOwnerRole($workspace, $vendorUser);

        return $workspace;
    }

    public function hasApprovedService(User $vendorUser, string $serviceKey): bool
    {
        $requiredSlug = match ($serviceKey) {
            self::COURIER_SERVICE_KEY => 'courier-services',
            default => null,
        };

        if (!$requiredSlug) {
            return false;
        }

        return VendorServiceRegistration::query()
            ->where('user_id', $vendorUser->id)
            ->where('status', 'approved')
            ->whereHas('serviceCategory', function ($query) use ($requiredSlug) {
                $query->where('slug', $requiredSlug);
            })
            ->exists();
    }

    private function ensureOwnerMembership(User $vendorUser): void
    {
        VendorUserMembership::query()->updateOrCreate(
            ['user_id' => $vendorUser->id],
            [
                'vendor_user_id' => $vendorUser->id,
                'membership_role' => 'owner',
                'status' => 'active',
                'blocked_service_keys' => [],
            ],
        );
    }

    private function ensureOwnerRole(ServiceWorkspace $workspace, User $vendorUser): void
    {
        $registrar = app(PermissionRegistrar::class);
        $registrar->setPermissionsTeamId($workspace->id);

        if (!$vendorUser->hasRole('courier_owner')) {
            $vendorUser->assignRole('courier_owner');
        }
    }
}
