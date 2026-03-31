<?php

namespace App\Http\Controllers\CourierControllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Courier\CourierPackage;
use App\Models\Courier\CourierShipment;
use App\Models\Courier\VendorCourierLabel;
use App\Models\Courier\VendorCourierLabelSize;
use App\Models\Courier\VendorCourierLabelTemplate;
use App\Models\VendorServiceRegistration;
use App\Services\Courier\CourierLabelService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class VendorCourierLabelController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('service.workspace:courier_service');
    }

    public function listSizes(Request $request)
    {
        $vendorId = (int) $request->attributes->get('vendor_user_id');
        $this->assertApprovedRegistration($vendorId);

        $sizes = VendorCourierLabelSize::query()
            ->where('vendor_user_id', $vendorId)
            ->orderByDesc('is_system')
            ->orderBy('name')
            ->get();

        return response()->json([
            'sizes' => $sizes,
        ]);
    }

    public function storeSize(Request $request, CourierLabelService $labelService)
    {
        $vendorId = (int) $request->attributes->get('vendor_user_id');
        $this->assertApprovedRegistration($vendorId);
        $settings = $labelService->resolveLabelSettings($vendorId);
        $policy = $labelService->normalizePrintPolicy($settings['printPolicy'] ?? []);

        if (!$policy['allowCustomSizes']) {
            abort(403, 'Custom label sizes are disabled by policy.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'widthMm' => ['required', 'numeric', 'min:1', 'max:500'],
            'heightMm' => ['required', 'numeric', 'min:1', 'max:500'],
            'unit' => ['nullable', 'string', Rule::in(CourierLabelService::SIZE_UNITS)],
        ]);

        $size = VendorCourierLabelSize::create([
            'vendor_user_id' => $vendorId,
            'name' => (string) $validated['name'],
            'width_mm' => (float) $validated['widthMm'],
            'height_mm' => (float) $validated['heightMm'],
            'unit' => (string) ($validated['unit'] ?? 'mm'),
            'is_active' => true,
            'is_system' => false,
            'created_by_user_id' => optional($request->user())->id,
            'updated_by_user_id' => optional($request->user())->id,
        ]);

        return response()->json([
            'size' => $size,
        ], 201);
    }

    public function updateSize(Request $request, VendorCourierLabelSize $size, CourierLabelService $labelService)
    {
        $vendorId = (int) $request->attributes->get('vendor_user_id');
        $this->assertApprovedRegistration($vendorId);
        $this->assertOwnership($size->vendor_user_id, $vendorId);

        $settings = $labelService->resolveLabelSettings($vendorId);
        $policy = $labelService->normalizePrintPolicy($settings['printPolicy'] ?? []);

        if (!$policy['allowCustomSizes']) {
            abort(403, 'Custom label sizes are disabled by policy.');
        }

        if ($size->is_system) {
            return response()->json([
                'message' => 'System sizes cannot be modified.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'widthMm' => ['required', 'numeric', 'min:1', 'max:500'],
            'heightMm' => ['required', 'numeric', 'min:1', 'max:500'],
            'unit' => ['nullable', 'string', Rule::in(CourierLabelService::SIZE_UNITS)],
            'isActive' => ['nullable', 'boolean'],
        ]);

        $size->update([
            'name' => (string) $validated['name'],
            'width_mm' => (float) $validated['widthMm'],
            'height_mm' => (float) $validated['heightMm'],
            'unit' => (string) ($validated['unit'] ?? $size->unit ?? 'mm'),
            'is_active' => (bool) ($validated['isActive'] ?? $size->is_active),
            'updated_by_user_id' => optional($request->user())->id,
        ]);

        return response()->json([
            'size' => $size->refresh(),
        ]);
    }

    public function deleteSize(Request $request, VendorCourierLabelSize $size)
    {
        $vendorId = (int) $request->attributes->get('vendor_user_id');
        $this->assertApprovedRegistration($vendorId);
        $this->assertOwnership($size->vendor_user_id, $vendorId);

        if ($size->is_system) {
            return response()->json([
                'message' => 'System sizes cannot be removed.',
            ], 403);
        }

        $size->delete();

        return response()->json([
            'ok' => true,
        ]);
    }

    public function listTemplates(Request $request)
    {
        $vendorId = (int) $request->attributes->get('vendor_user_id');
        $this->assertApprovedRegistration($vendorId);

        $templates = VendorCourierLabelTemplate::query()
            ->with(['size:id,name,width_mm,height_mm,unit'])
            ->where('vendor_user_id', $vendorId)
            ->orderByDesc('is_system')
            ->orderBy('name')
            ->get();

        return response()->json([
            'templates' => $templates,
        ]);
    }

    public function storeTemplate(Request $request, CourierLabelService $labelService)
    {
        $vendorId = (int) $request->attributes->get('vendor_user_id');
        $this->assertApprovedRegistration($vendorId);
        $settings = $labelService->resolveLabelSettings($vendorId);
        $policy = $labelService->normalizePrintPolicy($settings['printPolicy'] ?? []);

        if (!$policy['allowTemplateUpload']) {
            abort(403, 'Template uploads are disabled by policy.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'templateType' => ['required', 'string', Rule::in(CourierLabelService::TEMPLATE_TYPES)],
            'categoryScope' => ['nullable', 'string', Rule::in(['all', 'domestic', 'logistic'])],
            'sizeId' => ['nullable', 'integer'],
            'orientation' => ['nullable', 'string', Rule::in(['portrait', 'landscape'])],
            'builderSchema' => ['nullable', 'array'],
            'htmlTemplate' => ['nullable', 'string'],
            'cssTemplate' => ['nullable', 'string'],
            'fieldOverrides' => ['nullable', 'array'],
            'background' => ['nullable', 'file', 'mimes:png,jpg,jpeg,webp,pdf', 'max:4096'],
        ]);

        if ($validated['templateType'] === 'html' && !$policy['allowHtmlTemplates']) {
            abort(403, 'HTML templates are disabled by policy.');
        }

        if ($validated['templateType'] === 'html' && empty($validated['htmlTemplate'])) {
            return response()->json([
                'message' => 'HTML template content is required.',
            ], 422);
        }

        if ($validated['templateType'] === 'builder' && empty($validated['builderSchema'])) {
            return response()->json([
                'message' => 'Builder schema is required.',
            ], 422);
        }

        $sizeId = isset($validated['sizeId']) ? (int) $validated['sizeId'] : null;
        if ($sizeId) {
            $this->assertSizeOwnership($vendorId, $sizeId);
        }

        $backgroundPath = $this->storeBackgroundFile($request, $vendorId, $policy);

        $template = VendorCourierLabelTemplate::create([
            'vendor_user_id' => $vendorId,
            'size_id' => $sizeId,
            'name' => (string) $validated['name'],
            'template_type' => (string) $validated['templateType'],
            'category_scope' => (string) ($validated['categoryScope'] ?? 'all'),
            'orientation' => (string) ($validated['orientation'] ?? ''),
            'builder_schema' => $validated['builderSchema'] ?? null,
            'html_template' => $validated['htmlTemplate'] ?? null,
            'css_template' => $validated['cssTemplate'] ?? null,
            'background_path' => $backgroundPath,
            'field_overrides' => $validated['fieldOverrides'] ?? null,
            'is_active' => true,
            'is_system' => false,
            'created_by_user_id' => optional($request->user())->id,
            'updated_by_user_id' => optional($request->user())->id,
        ]);

        return response()->json([
            'template' => $template->load('size:id,name,width_mm,height_mm,unit'),
        ], 201);
    }

    public function updateTemplate(Request $request, VendorCourierLabelTemplate $template, CourierLabelService $labelService)
    {
        $vendorId = (int) $request->attributes->get('vendor_user_id');
        $this->assertApprovedRegistration($vendorId);
        $this->assertOwnership($template->vendor_user_id, $vendorId);

        if ($template->is_system) {
            return response()->json([
                'message' => 'System templates cannot be modified.',
            ], 403);
        }

        $settings = $labelService->resolveLabelSettings($vendorId);
        $policy = $labelService->normalizePrintPolicy($settings['printPolicy'] ?? []);

        if (!$policy['allowTemplateUpload']) {
            abort(403, 'Template uploads are disabled by policy.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'templateType' => ['required', 'string', Rule::in(CourierLabelService::TEMPLATE_TYPES)],
            'categoryScope' => ['nullable', 'string', Rule::in(['all', 'domestic', 'logistic'])],
            'sizeId' => ['nullable', 'integer'],
            'orientation' => ['nullable', 'string', Rule::in(['portrait', 'landscape'])],
            'builderSchema' => ['nullable', 'array'],
            'htmlTemplate' => ['nullable', 'string'],
            'cssTemplate' => ['nullable', 'string'],
            'fieldOverrides' => ['nullable', 'array'],
            'background' => ['nullable', 'file', 'mimes:png,jpg,jpeg,webp,pdf', 'max:4096'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        if ($validated['templateType'] === 'html' && !$policy['allowHtmlTemplates']) {
            abort(403, 'HTML templates are disabled by policy.');
        }

        if ($validated['templateType'] === 'html' && empty($validated['htmlTemplate'])) {
            return response()->json([
                'message' => 'HTML template content is required.',
            ], 422);
        }

        if ($validated['templateType'] === 'builder' && empty($validated['builderSchema'])) {
            return response()->json([
                'message' => 'Builder schema is required.',
            ], 422);
        }

        $sizeId = isset($validated['sizeId']) ? (int) $validated['sizeId'] : null;
        if ($sizeId) {
            $this->assertSizeOwnership($vendorId, $sizeId);
        }

        $backgroundPath = $template->background_path;
        $uploadedPath = $this->storeBackgroundFile($request, $vendorId, $policy);
        if ($uploadedPath) {
            if ($backgroundPath) {
                Storage::disk('public')->delete($backgroundPath);
            }
            $backgroundPath = $uploadedPath;
        }

        $template->update([
            'name' => (string) $validated['name'],
            'template_type' => (string) $validated['templateType'],
            'category_scope' => (string) ($validated['categoryScope'] ?? 'all'),
            'size_id' => $sizeId,
            'orientation' => (string) ($validated['orientation'] ?? ''),
            'builder_schema' => $validated['builderSchema'] ?? null,
            'html_template' => $validated['htmlTemplate'] ?? null,
            'css_template' => $validated['cssTemplate'] ?? null,
            'background_path' => $backgroundPath,
            'field_overrides' => $validated['fieldOverrides'] ?? null,
            'is_active' => (bool) ($validated['isActive'] ?? $template->is_active),
            'updated_by_user_id' => optional($request->user())->id,
        ]);

        return response()->json([
            'template' => $template->refresh()->load('size:id,name,width_mm,height_mm,unit'),
        ]);
    }

    public function deleteTemplate(Request $request, VendorCourierLabelTemplate $template)
    {
        $vendorId = (int) $request->attributes->get('vendor_user_id');
        $this->assertApprovedRegistration($vendorId);
        $this->assertOwnership($template->vendor_user_id, $vendorId);

        if ($template->is_system) {
            return response()->json([
                'message' => 'System templates cannot be removed.',
            ], 403);
        }

        if ($template->background_path) {
            Storage::disk('public')->delete($template->background_path);
        }

        $template->delete();

        return response()->json([
            'ok' => true,
        ]);
    }

    public function previewTemplate(Request $request, CourierLabelService $labelService)
    {
        $vendorId = (int) $request->attributes->get('vendor_user_id');
        $this->assertApprovedRegistration($vendorId);

        $validated = $request->validate([
            'templateId' => ['nullable', 'integer'],
            'sizeId' => ['nullable', 'integer'],
            'shipmentId' => ['nullable', 'integer'],
            'packageId' => ['nullable', 'integer'],
        ]);

        $template = null;
        if (!empty($validated['templateId'])) {
            $template = VendorCourierLabelTemplate::query()
                ->where('vendor_user_id', $vendorId)
                ->findOrFail((int) $validated['templateId']);
        }

        $size = null;
        if (!empty($validated['sizeId'])) {
            $size = VendorCourierLabelSize::query()
                ->where('vendor_user_id', $vendorId)
                ->findOrFail((int) $validated['sizeId']);
        }

        if (!$size && $template && $template->size_id) {
            $size = VendorCourierLabelSize::query()
                ->where('vendor_user_id', $vendorId)
                ->find($template->size_id);
        }

        if (!$size) {
            $size = $labelService->makeFallbackSize();
        }

        $payload = null;
        if (!empty($validated['shipmentId'])) {
            $shipment = CourierShipment::query()
                ->with(['sender', 'recipient', 'senderAddress', 'recipientAddress', 'packages'])
                ->where('assigned_vendor_user_id', $vendorId)
                ->findOrFail((int) $validated['shipmentId']);

            $package = $this->resolvePackageForShipment($shipment, $validated['packageId'] ?? null);
            if (!$package) {
                return response()->json([
                    'message' => 'Shipment has no packages available for label preview.',
                ], 422);
            }
            $payload = $labelService->buildLabelPayload($shipment, $package, 1);
        }

        if (!$payload) {
            $payload = $labelService->buildSamplePayload();
        }

        $html = $labelService->renderLabelHtml($template, $payload);
        $pdfBinary = $labelService->renderLabelsPdf([$html], $size, $template?->orientation);

        return response($pdfBinary, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="label-preview.pdf"',
        ]);
    }

    public function printLabels(Request $request, CourierLabelService $labelService)
    {
        $vendorId = (int) $request->attributes->get('vendor_user_id');
        $actorId = (int) optional($request->user())->id;
        $this->assertApprovedRegistration($vendorId);
        $labelSettings = $labelService->resolveLabelSettings($vendorId);
        $policy = $labelService->normalizePrintPolicy($labelSettings['printPolicy'] ?? []);

        $validated = $request->validate([
            'shipmentIds' => ['nullable', 'array'],
            'shipmentIds.*' => ['integer', 'min:1'],
            'packageIds' => ['nullable', 'array'],
            'packageIds.*' => ['integer', 'min:1'],
            'templateId' => ['nullable', 'integer'],
            'sizeId' => ['nullable', 'integer'],
            'outputFormat' => ['nullable', 'string', Rule::in([CourierLabelService::OUTPUT_FORMAT_PDF])],
        ]);

        $shipmentIds = collect($validated['shipmentIds'] ?? [])->map(fn ($id) => (int) $id)->filter()->values();
        $packageIds = collect($validated['packageIds'] ?? [])->map(fn ($id) => (int) $id)->filter()->values();

        if ($shipmentIds->isEmpty() && $packageIds->isEmpty()) {
            return response()->json([
                'message' => 'Select at least one shipment or package to print labels.',
            ], 422);
        }

        $packages = $this->loadPackages($vendorId, $shipmentIds->all(), $packageIds->all());

        if ($packages->isEmpty()) {
            return response()->json([
                'message' => 'No matching packages found for label generation.',
            ], 404);
        }

        $eligible = $this->filterEligiblePackages($packages);
        if ($eligible['blocked'] > 0) {
            return response()->json([
                'message' => 'Some packages are not eligible for label printing until bookings are confirmed.',
                'blockedCount' => $eligible['blocked'],
            ], 422);
        }

        $packages = $eligible['packages'];
        $count = $packages->count();

        if ($count > $policy['bulkHardLimit']) {
            return response()->json([
                'message' => 'Bulk label print exceeds the hard limit of ' . $policy['bulkHardLimit'] . ' labels.',
            ], 422);
        }

        $template = $this->resolveTemplate($vendorId, $labelSettings, $packages, $validated['templateId'] ?? null, $labelService);
        $size = $this->resolveSize($vendorId, $labelSettings, $packages, $validated['sizeId'] ?? null, $template, $labelService, $policy);

        if (!$template || !$size) {
            return response()->json([
                'message' => 'A label template and size are required for printing.',
            ], 422);
        }

        if ($template->template_type === 'html' && !$policy['allowHtmlTemplates']) {
            abort(403, 'HTML templates are disabled by policy.');
        }

        if ($template->background_path && Str::endsWith(strtolower($template->background_path), '.pdf') && !$policy['allowPdfBackground']) {
            abort(403, 'PDF backgrounds are disabled by policy.');
        }

        $this->assertTemplateScope($template, $packages, $labelService);

        $isAsync = $count > $policy['bulkAsyncThreshold'];
        $labelRows = $packages->values()->map(function (CourierPackage $package) use ($vendorId, $actorId, $template, $size, $labelService, $isAsync) {
            $shipment = $package->shipment;
            $category = $labelService->resolveCategory($shipment);

            $label = VendorCourierLabel::create([
                'vendor_user_id' => $vendorId,
                'shipment_id' => $shipment->id,
                'package_id' => $package->id,
                'template_id' => $template->id,
                'size_id' => $size->id,
                'category' => $category,
                'output_format' => CourierLabelService::OUTPUT_FORMAT_PDF,
                'status' => $isAsync ? 'queued' : 'generating',
                'created_by_user_id' => $actorId ?: null,
            ]);

            return [
                'label' => $label,
                'shipment' => $shipment,
                'package' => $package,
            ];
        });

        $labelIds = $labelRows->pluck('label')->pluck('id')->all();

        if ($isAsync) {
            \App\Jobs\CourierGenerateLabelsJob::dispatch($labelIds, $vendorId);

            return response()->json([
                'status' => 'queued',
                'labelIds' => $labelIds,
                'message' => 'Labels queued for generation. You will be notified when ready.',
            ], 202);
        }

        $htmlPages = $labelRows->values()->map(function (array $row, int $index) use ($labelService, $template) {
            $payload = $labelService->buildLabelPayload($row['shipment'], $row['package'], $index + 1);

            return $labelService->renderLabelHtml($template, $payload);
        })->all();

        $pdfBinary = $labelService->renderLabelsPdf($htmlPages, $size, $template->orientation);
        $stored = $labelService->storePdf($pdfBinary, $vendorId, 'labels');

        VendorCourierLabel::query()
            ->whereIn('id', $labelIds)
            ->update([
                'status' => 'generated',
                'file_disk' => $stored['disk'],
                'file_path' => $stored['path'],
                'file_name' => $stored['name'],
                'generated_at' => now(),
                'printed_at' => now(),
            ]);

        return response()->json([
            'status' => 'ready',
            'labelIds' => $labelIds,
            'url' => $stored['url'],
        ]);
    }

    private function loadPackages(int $vendorId, array $shipmentIds, array $packageIds)
    {
        $query = CourierPackage::query()
            ->with([
                'shipment.sender',
                'shipment.recipient',
                'shipment.senderAddress',
                'shipment.recipientAddress',
                'shipment.packages',
            ])
            ->whereHas('shipment', function (Builder $builder) use ($vendorId) {
                $builder->where('assigned_vendor_user_id', $vendorId);
            });

        if (!empty($packageIds)) {
            $query->whereIn('id', $packageIds);
        }

        if (!empty($shipmentIds)) {
            $query->whereHas('shipment', function (Builder $builder) use ($shipmentIds) {
                $builder->whereIn('id', $shipmentIds);
            });
        }

        return $query->get();
    }

    private function filterEligiblePackages($packages): array
    {
        $allowedStatuses = [
            CourierShipment::STATUS_CONFIRMED,
            CourierShipment::STATUS_IN_TRANSIT,
            CourierShipment::STATUS_DELIVERED,
        ];

        $blocked = 0;
        $eligible = $packages->filter(function (CourierPackage $package) use (&$blocked, $allowedStatuses) {
            $status = $package->shipment?->status;
            if (!in_array($status, $allowedStatuses, true)) {
                $blocked++;
                return false;
            }

            return true;
        });

        return ['packages' => $eligible->values(), 'blocked' => $blocked];
    }

    private function resolvePackageForShipment(CourierShipment $shipment, $packageId = null): ?CourierPackage
    {
        if ($packageId) {
            $match = $shipment->packages->firstWhere('id', (int) $packageId);
            if ($match) {
                return $match;
            }
        }

        return $shipment->packages->first();
    }

    private function resolveTemplate(
        int $vendorId,
        array $settings,
        $packages,
        $requestedTemplateId,
        CourierLabelService $labelService
    ): ?VendorCourierLabelTemplate {
        if ($requestedTemplateId) {
            return VendorCourierLabelTemplate::query()
            ->where('vendor_user_id', $vendorId)
            ->where('is_active', true)
                ->with('size')
                ->findOrFail((int) $requestedTemplateId);
        }

        $categories = $packages->map(fn (CourierPackage $package) => $labelService->resolveCategory($package->shipment))
            ->unique()
            ->values();

        if ($categories->count() > 1) {
            return null;
        }

        $defaults = $labelService->resolveDefaultsForCategory($settings, (string) $categories->first());
        if (empty($defaults['templateId'])) {
            return null;
        }

        return VendorCourierLabelTemplate::query()
            ->where('vendor_user_id', $vendorId)
            ->where('is_active', true)
            ->with('size')
            ->find((int) $defaults['templateId']);
    }

    private function resolveSize(
        int $vendorId,
        array $settings,
        $packages,
        $requestedSizeId,
        ?VendorCourierLabelTemplate $template,
        CourierLabelService $labelService,
        array $policy
    ): ?VendorCourierLabelSize {
        if ($requestedSizeId) {
            $size = VendorCourierLabelSize::query()
                ->where('vendor_user_id', $vendorId)
                ->where('is_active', true)
                ->find((int) $requestedSizeId);

            if ($size && !$policy['allowCustomSizes'] && !$size->is_system) {
                return null;
            }

            return $size;
        }

        if ($template && $template->size_id) {
            $size = VendorCourierLabelSize::query()
                ->where('vendor_user_id', $vendorId)
                ->where('is_active', true)
                ->find($template->size_id);

            if ($size && !$policy['allowCustomSizes'] && !$size->is_system) {
                return null;
            }

            return $size;
        }

        $categories = $packages->map(fn (CourierPackage $package) => $labelService->resolveCategory($package->shipment))
            ->unique()
            ->values();

        if ($categories->count() > 1) {
            return null;
        }

        $defaults = $labelService->resolveDefaultsForCategory($settings, (string) $categories->first());
        if (empty($defaults['sizeId'])) {
            return null;
        }

        $size = VendorCourierLabelSize::query()
            ->where('vendor_user_id', $vendorId)
            ->where('is_active', true)
            ->find((int) $defaults['sizeId']);

        if ($size && !$policy['allowCustomSizes'] && !$size->is_system) {
            return null;
        }

        return $size;
    }

    private function storeBackgroundFile(Request $request, int $vendorId, array $policy): ?string
    {
        if (!$request->hasFile('background')) {
            return null;
        }

        $file = $request->file('background');
        if (!$file) {
            return null;
        }

        $extension = strtolower((string) $file->getClientOriginalExtension());
        if ($extension === 'pdf' && !$policy['allowPdfBackground']) {
            abort(403, 'PDF background uploads are disabled by policy.');
        }

        return $file->store('courier/label-templates/' . $vendorId, 'public');
    }

    private function assertOwnership(int $ownerId, int $vendorId): void
    {
        if ($ownerId !== $vendorId) {
            abort(404);
        }
    }

    private function assertSizeOwnership(int $vendorId, int $sizeId): void
    {
        $size = VendorCourierLabelSize::query()
            ->where('vendor_user_id', $vendorId)
            ->find($sizeId);

        if (!$size) {
            abort(404, 'Label size not found.');
        }
    }

    private function hasApprovedCourierRegistration(int $vendorId): bool
    {
        if ($vendorId <= 0) {
            return false;
        }

        return VendorServiceRegistration::query()
            ->where('user_id', $vendorId)
            ->where('status', 'approved')
            ->whereHas('serviceCategory', function (Builder $query) {
                $query->where('slug', 'courier-services');
            })
            ->exists();
    }

    private function assertApprovedRegistration(int $vendorId): void
    {
        if (!$this->hasApprovedCourierRegistration($vendorId)) {
            abort(403, 'Courier service registration approval is required to manage labels.');
        }
    }

    private function assertTemplateScope(
        VendorCourierLabelTemplate $template,
        $packages,
        CourierLabelService $labelService
    ): void {
        if ($template->category_scope === 'all') {
            return;
        }

        $categories = $packages->map(fn (CourierPackage $package) => $labelService->resolveCategory($package->shipment))
            ->unique()
            ->values();

        if ($categories->count() > 1 || (string) $categories->first() !== $template->category_scope) {
            abort(422, 'Selected template does not match the shipment category.');
        }
    }
}
