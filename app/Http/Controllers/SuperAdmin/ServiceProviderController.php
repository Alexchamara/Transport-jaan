<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\ServiceCategory;
use App\Models\User;
use App\Models\VendorActivityLog;
use App\Models\VendorProfile;
use App\Models\VendorServiceRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use ZipArchive;

class ServiceProviderController extends Controller
{
    /**
     * Enhanced service providers listing with vendor profile and service data.
     */
    public function index(Request $request)
    {
        $search = $request->get('search', '');
        $statusFilter = $request->get('status', 'all');
        $submissionFilter = $request->get('submission_status', 'all');
        $serviceCategoryFilter = $request->get('service_category', 'all');
        $vendorTypeFilter = $request->get('vendor_type', 'all');
        $perPage = $request->get('per_page', 10);

        $query = User::where('role', 'vendor')
            ->with(['vendorProfile', 'serviceRegistrations.serviceCategory', 'serviceRegistrations.serviceSubCategory']);

        // Search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhereHas('vendorProfile', function ($vp) use ($search) {
                        $vp->where('company_name', 'like', "%{$search}%");
                    });
            });
        }

        // User status filter
        if ($statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        // Submission status filter
        if ($submissionFilter !== 'all') {
            $query->whereHas('vendorProfile', function ($q) use ($submissionFilter) {
                $q->where('submission_status', $submissionFilter);
            });
        }

        // Service category filter
        if ($serviceCategoryFilter !== 'all') {
            $query->whereHas('serviceRegistrations', function ($q) use ($serviceCategoryFilter) {
                $q->where('service_category_id', $serviceCategoryFilter);
            });
        }

        // Vendor type filter
        if ($vendorTypeFilter !== 'all') {
            $query->where('vendor_type', $vendorTypeFilter);
        }

        $paginatedUsers = $query->orderBy('created_at', 'desc')->paginate($perPage);

        $users = $paginatedUsers->getCollection()->map(function ($user) {
            $profile = $user->vendorProfile;
            $registrations = $user->serviceRegistrations;

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? 'N/A',
                'vendor_type' => $user->vendor_type ?? 'individual',
                'role' => $user->role,
                'status' => $user->status,
                'regDate' => $user->created_at->format('Y-m-d'),
                'created_at' => $user->created_at->diffForHumans(),
                'company_name' => $profile->company_name ?? 'N/A',
                'submission_status' => $profile->submission_status ?? 'not_started',
                'submitted_at' => $profile?->submitted_at?->format('Y-m-d H:i') ?? null,
                'reviewed_at' => $profile?->reviewed_at?->format('Y-m-d H:i') ?? null,
                'services_count' => $registrations->count(),
                'services_approved' => $registrations->where('status', 'approved')->count(),
                'services_pending' => $registrations->where('status', 'submitted')->count(),
                'services_rejected' => $registrations->where('status', 'rejected')->count(),
                'service_categories' => $registrations->map(function ($reg) {
                    return $reg->serviceCategory?->name;
                })->unique()->filter()->values()->toArray(),
            ];
        });

        // Counts
        $totalVendors = User::where('role', 'vendor')->count();
        $pendingReview = User::where('role', 'vendor')->where('status', 'inreview')->count();
        $verified = User::where('role', 'vendor')->where('status', 'verified')->count();
        $rejected = User::where('role', 'vendor')->where('status', 'rejected')->count();
        $blocked = User::where('role', 'vendor')->where('status', 'blocked')->count();

        // Service categories for filter dropdown
        $serviceCategories = ServiceCategory::active()->ordered()->get(['id', 'name']);

        return Inertia::render('Web/home/SuperAdmin/ServiceProviders', [
            'users' => $users->values(),
            'pagination' => [
                'current_page' => $paginatedUsers->currentPage(),
                'last_page' => $paginatedUsers->lastPage(),
                'per_page' => $paginatedUsers->perPage(),
                'total' => $paginatedUsers->total(),
                'from' => $paginatedUsers->firstItem(),
                'to' => $paginatedUsers->lastItem(),
            ],
            'counts' => [
                'total' => $totalVendors,
                'pending_review' => $pendingReview,
                'verified' => $verified,
                'rejected' => $rejected,
                'blocked' => $blocked,
            ],
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
                'submission_status' => $submissionFilter,
                'service_category' => $serviceCategoryFilter,
                'vendor_type' => $vendorTypeFilter,
                'per_page' => $perPage,
            ],
            'serviceCategories' => $serviceCategories,
        ]);
    }

    /**
     * Detailed vendor review page.
     */
    public function show(User $user)
    {
        if ($user->role !== 'vendor') {
            abort(404);
        }

        $user->load(['vendorProfile.reviewer']);

        $vendorProfile = $user->vendorProfile;

        $serviceRegistrations = VendorServiceRegistration::where('user_id', $user->id)
            ->with(['serviceCategory', 'serviceSubCategory'])
            ->get()
            ->map(function ($reg) {
                $subCat = $reg->serviceSubCategory;
                return [
                    'id' => $reg->id,
                    'service_category' => $reg->serviceCategory?->name,
                    'service_category_slug' => $reg->serviceCategory?->slug,
                    'service_sub_category' => $subCat?->name,
                    'service_sub_category_slug' => $subCat?->slug,
                    'required_fields' => $subCat?->required_fields ?? [],
                    'field_values' => $reg->field_values ?? [],
                    'status' => $reg->status,
                    'admin_notes' => $reg->admin_notes,
                    'submitted_at' => $reg->submitted_at?->format('Y-m-d H:i'),
                    'reviewed_at' => $reg->reviewed_at?->format('Y-m-d H:i'),
                ];
            });

        $activityLogs = VendorActivityLog::where('vendor_id', $user->id)
            ->with('admin:id,name')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'description' => $log->description,
                    'admin_name' => $log->admin?->name ?? 'System',
                    'metadata' => $log->metadata,
                    'created_at' => $log->created_at->format('Y-m-d H:i'),
                    'time_ago' => $log->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('Web/home/SuperAdmin/ServiceProviderReview', [
            'vendor' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'vendor_type' => $user->vendor_type ?? 'individual',
                'status' => $user->status,
                'created_at' => $user->created_at->format('Y-m-d H:i'),
                'registered_ago' => $user->created_at->diffForHumans(),
            ],
            'vendorProfile' => $vendorProfile ? [
                'id' => $vendorProfile->id,
                'company_name' => $vendorProfile->company_name,
                'business_registration_no' => $vendorProfile->business_registration_no,
                'tax_id' => $vendorProfile->tax_id,
                'business_type' => $vendorProfile->business_type,
                'description' => $vendorProfile->description,
                'logo' => $vendorProfile->logo,
                'website' => $vendorProfile->website,
                'established_year' => $vendorProfile->established_year,
                'employee_count' => $vendorProfile->employee_count,
                'address_line1' => $vendorProfile->address_line1,
                'address_line2' => $vendorProfile->address_line2,
                'city' => $vendorProfile->city,
                'state' => $vendorProfile->state,
                'postal_code' => $vendorProfile->postal_code,
                'country' => $vendorProfile->country,
                'contact_person' => $vendorProfile->contact_person,
                'contact_phone' => $vendorProfile->contact_phone,
                'contact_email' => $vendorProfile->contact_email,
                'submission_status' => $vendorProfile->submission_status,
                'admin_notes' => $vendorProfile->admin_notes,
                'submitted_at' => $vendorProfile->submitted_at?->format('Y-m-d H:i'),
                'reviewed_at' => $vendorProfile->reviewed_at?->format('Y-m-d H:i'),
                'reviewer_name' => $vendorProfile->reviewer?->name,
            ] : null,
            'serviceRegistrations' => $serviceRegistrations,
            'activityLogs' => $activityLogs,
        ]);
    }

    /**
     * Approve a specific service registration.
     */
    public function approveService(Request $request, VendorServiceRegistration $registration)
    {
        $admin = Auth::user();

        $registration->update([
            'status' => 'approved',
            'admin_notes' => $request->input('admin_notes', $registration->admin_notes),
            'reviewed_at' => now(),
            'reviewed_by' => $admin->id,
        ]);

        VendorActivityLog::create([
            'vendor_id' => $registration->user_id,
            'admin_id' => $admin->id,
            'action' => 'service_approved',
            'target_type' => 'vendor_service_registration',
            'target_id' => $registration->id,
            'description' => "Service '{$registration->serviceSubCategory?->name}' approved.",
            'metadata' => [
                'service_name' => $registration->serviceSubCategory?->name,
                'category_name' => $registration->serviceCategory?->name,
            ],
        ]);

        // Check if all services are now approved → auto-approve profile
        $this->checkAutoApproveVendor($registration->user_id, $admin);

        return redirect()->back()->with('success', 'Service registration approved.');
    }

    /**
     * Reject a specific service registration.
     */
    public function rejectService(Request $request, VendorServiceRegistration $registration)
    {
        $request->validate([
            'admin_notes' => 'required|string|max:1000',
        ]);

        $admin = Auth::user();

        $registration->update([
            'status' => 'rejected',
            'admin_notes' => $request->input('admin_notes'),
            'reviewed_at' => now(),
            'reviewed_by' => $admin->id,
        ]);

        VendorActivityLog::create([
            'vendor_id' => $registration->user_id,
            'admin_id' => $admin->id,
            'action' => 'service_rejected',
            'target_type' => 'vendor_service_registration',
            'target_id' => $registration->id,
            'description' => "Service '{$registration->serviceSubCategory?->name}' rejected.",
            'metadata' => [
                'service_name' => $registration->serviceSubCategory?->name,
                'reason' => $request->input('admin_notes'),
            ],
        ]);

        return redirect()->back()->with('success', 'Service registration rejected.');
    }

    /**
     * Request revision for a specific service registration.
     */
    public function requestServiceRevision(Request $request, VendorServiceRegistration $registration)
    {
        $request->validate([
            'admin_notes' => 'required|string|max:1000',
        ]);

        $admin = Auth::user();

        $registration->update([
            'status' => 'revision_requested',
            'admin_notes' => $request->input('admin_notes'),
            'reviewed_at' => now(),
            'reviewed_by' => $admin->id,
        ]);

        VendorActivityLog::create([
            'vendor_id' => $registration->user_id,
            'admin_id' => $admin->id,
            'action' => 'service_revision_requested',
            'target_type' => 'vendor_service_registration',
            'target_id' => $registration->id,
            'description' => "Revision requested for '{$registration->serviceSubCategory?->name}'.",
            'metadata' => [
                'service_name' => $registration->serviceSubCategory?->name,
                'reason' => $request->input('admin_notes'),
            ],
        ]);

        return redirect()->back()->with('success', 'Revision requested for service registration.');
    }

    /**
     * Approve all pending service registrations for a vendor.
     */
    public function approveAll(Request $request, User $user)
    {
        $admin = Auth::user();

        $pendingRegistrations = VendorServiceRegistration::where('user_id', $user->id)
            ->where('status', 'submitted')
            ->get();

        if ($pendingRegistrations->isEmpty()) {
            return redirect()->back()->with('error', 'No pending service registrations to approve.');
        }

        DB::transaction(function () use ($pendingRegistrations, $user, $admin, $request) {
            foreach ($pendingRegistrations as $reg) {
                $reg->update([
                    'status' => 'approved',
                    'admin_notes' => $request->input('admin_notes'),
                    'reviewed_at' => now(),
                    'reviewed_by' => $admin->id,
                ]);
            }

            // Approve the vendor profile
            $profile = VendorProfile::where('user_id', $user->id)->first();
            if ($profile) {
                $profile->update([
                    'submission_status' => 'approved',
                    'admin_notes' => $request->input('admin_notes'),
                    'reviewed_at' => now(),
                    'reviewed_by' => $admin->id,
                ]);
            }

            // Verify the user
            $user->update(['status' => 'verified']);

            VendorActivityLog::create([
                'vendor_id' => $user->id,
                'admin_id' => $admin->id,
                'action' => 'all_services_approved',
                'target_type' => 'user',
                'target_id' => $user->id,
                'description' => "All services approved and vendor verified. ({$pendingRegistrations->count()} services)",
                'metadata' => [
                    'services_count' => $pendingRegistrations->count(),
                    'services' => $pendingRegistrations->map(fn($r) => $r->serviceSubCategory?->name)->toArray(),
                ],
            ]);
        });

        return redirect()->back()->with('success', 'All services approved and vendor verified.');
    }

    /**
     * Reject all pending services and the vendor.
     */
    public function rejectAll(Request $request, User $user)
    {
        $request->validate([
            'admin_notes' => 'required|string|max:1000',
        ]);

        $admin = Auth::user();

        DB::transaction(function () use ($user, $admin, $request) {
            VendorServiceRegistration::where('user_id', $user->id)
                ->where('status', 'submitted')
                ->update([
                    'status' => 'rejected',
                    'admin_notes' => $request->input('admin_notes'),
                    'reviewed_at' => now(),
                    'reviewed_by' => $admin->id,
                ]);

            $profile = VendorProfile::where('user_id', $user->id)->first();
            if ($profile) {
                $profile->update([
                    'submission_status' => 'rejected',
                    'admin_notes' => $request->input('admin_notes'),
                    'reviewed_at' => now(),
                    'reviewed_by' => $admin->id,
                ]);
            }

            $user->update(['status' => 'rejected']);

            VendorActivityLog::create([
                'vendor_id' => $user->id,
                'admin_id' => $admin->id,
                'action' => 'all_services_rejected',
                'target_type' => 'user',
                'target_id' => $user->id,
                'description' => 'All services rejected and vendor application denied.',
                'metadata' => ['reason' => $request->input('admin_notes')],
            ]);
        });

        return redirect()->back()->with('success', 'All services rejected.');
    }

    /**
     * Request revision for entire vendor profile.
     */
    public function requestRevision(Request $request, User $user)
    {
        $request->validate([
            'admin_notes' => 'required|string|max:1000',
        ]);

        $admin = Auth::user();

        DB::transaction(function () use ($user, $admin, $request) {
            $profile = VendorProfile::where('user_id', $user->id)->first();
            if ($profile) {
                $profile->update([
                    'submission_status' => 'revision_requested',
                    'admin_notes' => $request->input('admin_notes'),
                    'reviewed_at' => now(),
                    'reviewed_by' => $admin->id,
                ]);
            }

            // Set service registrations that are submitted/rejected to revision_requested
            VendorServiceRegistration::where('user_id', $user->id)
                ->whereIn('status', ['submitted', 'rejected'])
                ->update([
                    'status' => 'revision_requested',
                    'admin_notes' => $request->input('admin_notes'),
                    'reviewed_at' => now(),
                    'reviewed_by' => $admin->id,
                ]);

            // Set user status back to unverified so vendor can edit
            $user->update(['status' => 'unverified']);

            VendorActivityLog::create([
                'vendor_id' => $user->id,
                'admin_id' => $admin->id,
                'action' => 'revision_requested',
                'target_type' => 'user',
                'target_id' => $user->id,
                'description' => 'Revision requested for vendor profile and services.',
                'metadata' => ['reason' => $request->input('admin_notes')],
            ]);
        });

        return redirect()->back()->with('success', 'Revision requested. Vendor can now edit and resubmit.');
    }

    /**
     * Add admin note to a vendor profile.
     */
    public function addNote(Request $request, User $user)
    {
        $request->validate([
            'admin_notes' => 'required|string|max:2000',
        ]);

        $admin = Auth::user();

        $profile = VendorProfile::where('user_id', $user->id)->first();
        if ($profile) {
            $profile->update(['admin_notes' => $request->input('admin_notes')]);
        }

        VendorActivityLog::create([
            'vendor_id' => $user->id,
            'admin_id' => $admin->id,
            'action' => 'note_added',
            'target_type' => 'vendor_profile',
            'target_id' => $profile?->id,
            'description' => 'Admin note updated.',
            'metadata' => ['note' => $request->input('admin_notes')],
        ]);

        return redirect()->back()->with('success', 'Note saved.');
    }

    /**
     * Block a vendor.
     */
    public function blockVendor(User $user)
    {
        $admin = Auth::user();

        $user->update(['status' => 'blocked']);

        VendorActivityLog::create([
            'vendor_id' => $user->id,
            'admin_id' => $admin->id,
            'action' => 'vendor_blocked',
            'target_type' => 'user',
            'target_id' => $user->id,
            'description' => 'Vendor account blocked.',
        ]);

        return redirect()->back()->with('success', 'Vendor blocked.');
    }

    /**
     * Unblock a vendor.
     */
    public function unblockVendor(User $user)
    {
        $admin = Auth::user();

        $user->update(['status' => 'verified']);

        VendorActivityLog::create([
            'vendor_id' => $user->id,
            'admin_id' => $admin->id,
            'action' => 'vendor_unblocked',
            'target_type' => 'user',
            'target_id' => $user->id,
            'description' => 'Vendor account unblocked.',
        ]);

        return redirect()->back()->with('success', 'Vendor unblocked.');
    }

    /**
     * Download a specific document from a service registration.
     */
    public function downloadDocument(VendorServiceRegistration $registration, string $fieldKey)
    {
        $fieldValues = $registration->field_values ?? [];

        if (!isset($fieldValues[$fieldKey]['file'])) {
            abort(404, 'Document not found.');
        }

        $filePath = $fieldValues[$fieldKey]['file'];
        $originalName = $fieldValues[$fieldKey]['original_name'] ?? basename($filePath);

        if (!Storage::disk('public')->exists($filePath)) {
            abort(404, 'File not found on disk.');
        }

        return Storage::disk('public')->download($filePath, $originalName);
    }

    /**
     * Download all documents for a vendor as ZIP.
     */
    public function downloadAllDocuments(User $user)
    {
        $registrations = VendorServiceRegistration::where('user_id', $user->id)
            ->with('serviceSubCategory')
            ->get();

        $tempFile = tempnam(sys_get_temp_dir(), 'vendor_docs_');
        $zip = new ZipArchive();
        $zip->open($tempFile, ZipArchive::CREATE | ZipArchive::OVERWRITE);

        $hasFiles = false;

        foreach ($registrations as $reg) {
            $subCatName = $reg->serviceSubCategory?->name ?? 'unknown';
            $fieldValues = $reg->field_values ?? [];

            foreach ($fieldValues as $key => $value) {
                if (isset($value['file']) && Storage::disk('public')->exists($value['file'])) {
                    $originalName = $value['original_name'] ?? basename($value['file']);
                    $zip->addFromString(
                        "{$subCatName}/{$originalName}",
                        Storage::disk('public')->get($value['file'])
                    );
                    $hasFiles = true;
                }
            }
        }

        // Add vendor logo
        $profile = VendorProfile::where('user_id', $user->id)->first();
        if ($profile && $profile->logo && Storage::disk('public')->exists($profile->logo)) {
            $zip->addFromString('logo/' . basename($profile->logo), Storage::disk('public')->get($profile->logo));
            $hasFiles = true;
        }

        $zip->close();

        if (!$hasFiles) {
            unlink($tempFile);
            return redirect()->back()->with('error', 'No documents found.');
        }

        $vendorName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $user->name);
        return response()->download($tempFile, "vendor_{$vendorName}_documents.zip")->deleteFileAfterSend(true);
    }

    /**
     * Get pending vendors count for dashboard widget.
     */
    public static function getPendingReviewCount(): int
    {
        return User::where('role', 'vendor')->where('status', 'inreview')->count();
    }

    /**
     * Auto-approve vendor if all their services are approved.
     */
    private function checkAutoApproveVendor(int $userId, $admin): void
    {
        $allRegistrations = VendorServiceRegistration::where('user_id', $userId)->get();

        if ($allRegistrations->isEmpty()) {
            return;
        }

        $allApproved = $allRegistrations->every(fn($r) => $r->status === 'approved');

        if ($allApproved) {
            $profile = VendorProfile::where('user_id', $userId)->first();
            if ($profile) {
                $profile->update([
                    'submission_status' => 'approved',
                    'reviewed_at' => now(),
                    'reviewed_by' => $admin->id,
                ]);
            }

            $user = User::find($userId);
            if ($user) {
                $user->update(['status' => 'verified']);

                VendorActivityLog::create([
                    'vendor_id' => $userId,
                    'admin_id' => $admin->id,
                    'action' => 'vendor_auto_verified',
                    'target_type' => 'user',
                    'target_id' => $userId,
                    'description' => 'Vendor auto-verified: all services approved.',
                ]);
            }
        }
    }
}
