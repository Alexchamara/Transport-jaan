<?php

namespace App\Http\Controllers\CourierControllers\Vendor;

use App\Http\Controllers\Controller;
use App\Jobs\CourierGeneratePodLabelJob;
use App\Models\Courier\CourierLabelPrintItem;
use App\Models\Courier\CourierLabelPrintJob;
use App\Models\Courier\CourierLabelSize;
use App\Models\Courier\CourierLabelTemplate;
use App\Models\Courier\CourierPackage;
use App\Models\Courier\CourierShipment;
use App\Models\Courier\VendorCourierSetting;
use App\Models\VendorServiceRegistration;
use App\Services\Courier\CourierPodLabelService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VendorCourierPodLabelController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
        $this->middleware('service.workspace:courier_service');
    }

    public function catalog(Request $request, CourierPodLabelService $service)
    {
        $vendorId = $this->resolveVendorId($request);
        $this->assertApprovedRegistration($vendorId);

        $sizes = CourierLabelSize::query()
            ->where('vendor_user_id', $vendorId)
            ->orderByDesc('is_system')
            ->orderBy('name')
            ->get()
            ->map(fn (CourierLabelSize $size) => $this->transformSize($size))
            ->values();

        $templates = CourierLabelTemplate::query()
            ->with('size:id,name,width_mm,height_mm,is_active,is_system')
            ->where('vendor_user_id', $vendorId)
            ->orderByDesc('is_system')
            ->orderByDesc('version')
            ->orderBy('name')
            ->get()
            ->map(fn (CourierLabelTemplate $template) => $this->transformTemplate($template))
            ->values();

        $settings = $this->resolveLabelSettings($vendorId);

        return response()->json([
            'sizes' => $sizes,
            'templates' => $templates,
            'defaults' => $settings['defaults'],
            'policy' => $settings['policy'],
            'tokens' => $this->availableTokens(),
            'layoutPresets' => [CourierPodLabelService::LAYOUT_POD_TWO_UP_CONTINUOUS],
            'templateSchemaDefaults' => $service->defaultTemplateSchema(),
        ]);
    }

    public function listSizes(Request $request)
    {
        $vendorId = $this->resolveVendorId($request);
        $this->assertApprovedRegistration($vendorId);

        $sizes = CourierLabelSize::query()
            ->where('vendor_user_id', $vendorId)
            ->orderByDesc('is_system')
            ->orderBy('name')
            ->get()
            ->map(fn (CourierLabelSize $size) => $this->transformSize($size))
            ->values();

        return response()->json(['sizes' => $sizes]);
    }

    public function storeSize(Request $request)
    {
        $vendorId = $this->resolveVendorId($request);
        $actorId = (int) optional($request->user())->id;
        $this->assertApprovedRegistration($vendorId);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'widthMm' => ['required', 'numeric', 'min:1', 'max:500'],
            'heightMm' => ['required', 'numeric', 'min:1', 'max:500'],
            'unit' => ['nullable', 'string', Rule::in(['mm', 'cm', 'in'])],
        ]);

        $size = CourierLabelSize::create([
            'vendor_user_id' => $vendorId,
            'name' => (string) $validated['name'],
            'width_mm' => (float) $validated['widthMm'],
            'height_mm' => (float) $validated['heightMm'],
            'is_active' => true,
            'is_system' => false,
            'created_by_user_id' => $actorId ?: null,
            'updated_by_user_id' => $actorId ?: null,
            'metadata' => ['unit' => (string) ($validated['unit'] ?? 'mm')],
        ]);

        return response()->json(['size' => $this->transformSize($size)], 201);
    }

    public function updateSize(Request $request, CourierLabelSize $size)
    {
        $vendorId = $this->resolveVendorId($request);
        $actorId = (int) optional($request->user())->id;
        $this->assertApprovedRegistration($vendorId);
        if ((int) $size->vendor_user_id !== $vendorId) {
            abort(404);
        }

        if ($size->is_system) {
            return response()->json(['message' => 'System sizes cannot be modified.'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'widthMm' => ['required', 'numeric', 'min:1', 'max:500'],
            'heightMm' => ['required', 'numeric', 'min:1', 'max:500'],
            'unit' => ['nullable', 'string', Rule::in(['mm', 'cm', 'in'])],
            'isActive' => ['nullable', 'boolean'],
        ]);

        $metadata = is_array($size->metadata) ? $size->metadata : [];
        if (isset($validated['unit'])) {
            $metadata['unit'] = (string) $validated['unit'];
        }

        $size->update([
            'name' => (string) $validated['name'],
            'width_mm' => (float) $validated['widthMm'],
            'height_mm' => (float) $validated['heightMm'],
            'is_active' => (bool) ($validated['isActive'] ?? $size->is_active),
            'updated_by_user_id' => $actorId ?: null,
            'metadata' => $metadata,
        ]);

        return response()->json(['size' => $this->transformSize($size->fresh())]);
    }

    public function deleteSize(Request $request, CourierLabelSize $size)
    {
        $vendorId = $this->resolveVendorId($request);
        $this->assertApprovedRegistration($vendorId);
        if ((int) $size->vendor_user_id !== $vendorId) {
            abort(404);
        }

        if ($size->is_system) {
            return response()->json(['message' => 'System sizes cannot be removed.'], 403);
        }

        $size->delete();

        return response()->json(['ok' => true]);
    }

    public function listTemplates(Request $request)
    {
        $vendorId = $this->resolveVendorId($request);
        $this->assertApprovedRegistration($vendorId);

        $templates = CourierLabelTemplate::query()
            ->with('size:id,name,width_mm,height_mm,is_active,is_system,metadata')
            ->where('vendor_user_id', $vendorId)
            ->orderByDesc('is_system')
            ->orderByDesc('version')
            ->orderBy('name')
            ->get()
            ->map(fn (CourierLabelTemplate $template) => $this->transformTemplate($template))
            ->values();

        return response()->json(['templates' => $templates]);
    }

    public function storeTemplate(Request $request, CourierPodLabelService $service)
    {
        $vendorId = $this->resolveVendorId($request);
        $actorId = (int) optional($request->user())->id;
        $this->assertApprovedRegistration($vendorId);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'sizeId' => ['nullable', 'integer'],
            'size_id' => ['nullable', 'integer'],
            'categoryScope' => ['nullable', 'string', Rule::in(['all', 'domestic', 'international'])],
            'category_scope' => ['nullable', 'string', Rule::in(['all', 'domestic', 'international'])],
            'layoutPreset' => ['nullable', 'string', Rule::in([CourierPodLabelService::LAYOUT_POD_TWO_UP_CONTINUOUS])],
            'orientation' => ['nullable', 'string', Rule::in(['portrait', 'landscape'])],
            'schema' => ['nullable', 'array'],
            'builderSchema' => ['nullable'],
            'builder_schema' => ['nullable'],
            'isActive' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'templateType' => ['nullable', 'string'],
            'template_type' => ['nullable', 'string'],
            'background' => ['nullable', 'file'],
        ]);

        $sizeId = isset($validated['sizeId']) ? (int) $validated['sizeId'] : (isset($validated['size_id']) ? (int) $validated['size_id'] : null);
        $size = $sizeId
            ? CourierLabelSize::query()->where('vendor_user_id', $vendorId)->findOrFail($sizeId)
            : null;

        $scope = (string) ($validated['categoryScope'] ?? $validated['category_scope'] ?? 'all');
        $layout = (string) ($validated['layoutPreset'] ?? CourierPodLabelService::LAYOUT_POD_TWO_UP_CONTINUOUS);
        $rawSchema = $validated['schema'] ?? $validated['builderSchema'] ?? $validated['builder_schema'] ?? [];
        if (is_string($rawSchema)) {
            $decoded = json_decode($rawSchema, true);
            $rawSchema = is_array($decoded) ? $decoded : [];
        }
        $schema = array_replace($service->defaultTemplateSchema(), is_array($rawSchema) ? $rawSchema : []);

        $version = (int) (CourierLabelTemplate::query()
            ->where('vendor_user_id', $vendorId)
            ->where('name', (string) $validated['name'])
            ->max('version') ?? 0) + 1;

        $template = CourierLabelTemplate::create([
            'vendor_user_id' => $vendorId,
            'size_id' => $size?->id,
            'name' => (string) $validated['name'],
            'category_scope' => $scope,
            'layout_preset' => $layout,
            'orientation' => (string) ($validated['orientation'] ?? 'portrait'),
            'version' => $version,
            'schema' => $schema,
            'is_active' => (bool) ($validated['isActive'] ?? $validated['is_active'] ?? true),
            'is_system' => false,
            'created_by_user_id' => $actorId ?: null,
            'updated_by_user_id' => $actorId ?: null,
        ]);

        if ($template->is_active) {
            $this->deactivateSiblingTemplates($template);
        }

        return response()->json([
            'template' => $this->transformTemplate($template->load('size:id,name,width_mm,height_mm,is_active,is_system,metadata')),
        ], 201);
    }

    public function updateTemplate(Request $request, CourierLabelTemplate $template, CourierPodLabelService $service)
    {
        $vendorId = $this->resolveVendorId($request);
        $actorId = (int) optional($request->user())->id;
        $this->assertApprovedRegistration($vendorId);
        $this->assertTemplateOwnership($template, $vendorId);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'sizeId' => ['nullable', 'integer'],
            'size_id' => ['nullable', 'integer'],
            'categoryScope' => ['nullable', 'string', Rule::in(['all', 'domestic', 'international'])],
            'category_scope' => ['nullable', 'string', Rule::in(['all', 'domestic', 'international'])],
            'layoutPreset' => ['nullable', 'string', Rule::in([CourierPodLabelService::LAYOUT_POD_TWO_UP_CONTINUOUS])],
            'orientation' => ['nullable', 'string', Rule::in(['portrait', 'landscape'])],
            'schema' => ['nullable', 'array'],
            'builderSchema' => ['nullable'],
            'builder_schema' => ['nullable'],
            'isActive' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'templateType' => ['nullable', 'string'],
            'template_type' => ['nullable', 'string'],
        ]);

        $sizeId = isset($validated['sizeId']) ? (int) $validated['sizeId'] : (isset($validated['size_id']) ? (int) $validated['size_id'] : null);
        if ($sizeId !== null) {
            CourierLabelSize::query()->where('vendor_user_id', $vendorId)->findOrFail($sizeId);
        }

        $rawSchema = $validated['schema'] ?? $validated['builderSchema'] ?? $validated['builder_schema'] ?? (is_array($template->schema) ? $template->schema : []);
        if (is_string($rawSchema)) {
            $decoded = json_decode($rawSchema, true);
            $rawSchema = is_array($decoded) ? $decoded : [];
        }

        $template->update([
            'name' => (string) $validated['name'],
            'size_id' => $sizeId,
            'category_scope' => (string) ($validated['categoryScope'] ?? $validated['category_scope'] ?? $template->category_scope),
            'layout_preset' => (string) ($validated['layoutPreset'] ?? $template->layout_preset),
            'orientation' => (string) ($validated['orientation'] ?? $template->orientation),
            'schema' => array_replace($service->defaultTemplateSchema(), is_array($rawSchema) ? $rawSchema : []),
            'is_active' => (bool) ($validated['isActive'] ?? $validated['is_active'] ?? $template->is_active),
            'updated_by_user_id' => $actorId ?: null,
        ]);

        if ($template->is_active) {
            $this->deactivateSiblingTemplates($template);
        }

        return response()->json([
            'template' => $this->transformTemplate($template->fresh()->load('size:id,name,width_mm,height_mm,is_active,is_system,metadata')),
        ]);
    }

    public function deleteTemplate(Request $request, CourierLabelTemplate $template)
    {
        $vendorId = $this->resolveVendorId($request);
        $this->assertApprovedRegistration($vendorId);
        $this->assertTemplateOwnership($template, $vendorId);

        if ($template->is_system) {
            return response()->json(['message' => 'System template cannot be deleted.'], 403);
        }

        $template->delete();

        return response()->json(['ok' => true]);
    }

    public function preview(Request $request, CourierPodLabelService $service)
    {
        $vendorId = $this->resolveVendorId($request);
        $this->assertApprovedRegistration($vendorId);

        $validated = $request->validate([
            'templateId' => ['required', 'integer'],
            'sizeId' => ['nullable', 'integer'],
            'shipmentId' => ['nullable', 'integer'],
            'packageId' => ['nullable', 'integer'],
        ]);

        $template = CourierLabelTemplate::query()
            ->with('size')
            ->where('vendor_user_id', $vendorId)
            ->findOrFail((int) $validated['templateId']);

        $size = null;
        if (!empty($validated['sizeId'])) {
            $size = CourierLabelSize::query()->where('vendor_user_id', $vendorId)->findOrFail((int) $validated['sizeId']);
        }
        if (!$size) {
            $size = $template->size ?: $service->makeFallbackSize();
        }

        $payload = $this->samplePayload($vendorId, $service);

        if (!empty($validated['shipmentId'])) {
            $shipment = CourierShipment::query()
                ->with(['sender', 'recipient', 'senderAddress', 'recipientAddress', 'packages'])
                ->where('assigned_vendor_user_id', $vendorId)
                ->findOrFail((int) $validated['shipmentId']);

            $package = $shipment->packages->firstWhere('id', (int) ($validated['packageId'] ?? 0)) ?: $shipment->packages->first();

            if (!$package) {
                return response()->json(['message' => 'Shipment has no package available for preview.'], 422);
            }

            $payload = $service->buildPayload($shipment, $package, $vendorId);
        }

        $html = $service->renderLabelHtml($payload, $template);
        $pdf = $service->renderLabelsPdf([$html], $size, (string) $template->orientation);

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="pod-label-preview.pdf"',
        ]);
    }

    public function storeJob(Request $request, CourierPodLabelService $service)
    {
        $vendorId = $this->resolveVendorId($request);
        $actorId = (int) optional($request->user())->id;
        $this->assertApprovedRegistration($vendorId);

        $validated = $request->validate([
            'shipmentIds' => ['nullable', 'array'],
            'shipmentIds.*' => ['integer', 'min:1'],
            'packageIds' => ['nullable', 'array'],
            'packageIds.*' => ['integer', 'min:1'],
            'templateId' => ['nullable', 'integer'],
            'sizeId' => ['nullable', 'integer'],
            'outputFormat' => ['nullable', 'string', Rule::in([CourierPodLabelService::OUTPUT_FORMAT_PDF])],
        ]);

        $shipmentIds = collect($validated['shipmentIds'] ?? [])->map(fn ($id) => (int) $id)->filter()->values();
        $packageIds = collect($validated['packageIds'] ?? [])->map(fn ($id) => (int) $id)->filter()->values();

        if ($shipmentIds->isEmpty() && $packageIds->isEmpty()) {
            return response()->json(['message' => 'Select at least one shipment or package.'], 422);
        }

        $packages = $this->loadPackages($vendorId, $shipmentIds->all(), $packageIds->all());
        if ($packages->isEmpty()) {
            return response()->json(['message' => 'No matching packages found.'], 404);
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

        $policy = $this->resolveLabelSettings($vendorId)['policy'];
        if ($count > $policy['hardLimit']) {
            return response()->json([
                'message' => 'Print request exceeds hard limit of ' . $policy['hardLimit'] . ' labels.',
            ], 422);
        }

        $template = $this->resolveTemplate($vendorId, $validated['templateId'] ?? null, $packages, $service);
        if (!$template) {
            return response()->json(['message' => 'No active POD template found for this selection.'], 422);
        }

        $size = $this->resolveSize($vendorId, $validated['sizeId'] ?? null, $template, $service);

        $mode = $count > $policy['syncThreshold'] ? CourierPodLabelService::MODE_ASYNC : CourierPodLabelService::MODE_SYNC;

        $job = CourierLabelPrintJob::create([
            'vendor_user_id' => $vendorId,
            'template_id' => $template->id,
            'size_id' => $size->id ?? null,
            'status' => 'queued',
            'mode' => $mode,
            'output_format' => CourierPodLabelService::OUTPUT_FORMAT_PDF,
            'total_items' => $count,
            'generated_items' => 0,
            'failed_items' => 0,
            'requested_by_user_id' => $actorId ?: null,
        ]);

        $items = [];
        foreach ($packages->values() as $index => $package) {
            $items[] = [
                'print_job_id' => $job->id,
                'vendor_user_id' => $vendorId,
                'shipment_id' => (int) $package->shipment_id,
                'package_id' => (int) $package->id,
                'item_index' => $index + 1,
                'page_number' => $index + 1,
                'status' => 'queued',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        CourierLabelPrintItem::query()->insert($items);

        if ($mode === CourierPodLabelService::MODE_ASYNC) {
            CourierGeneratePodLabelJob::dispatch($job->id, $vendorId);

            return response()->json([
                'status' => 'queued',
                'jobId' => $job->id,
                'message' => 'POD labels queued for generation.',
            ], 202);
        }

        $job->load([
            'template.size',
            'size',
            'items.shipment.sender',
            'items.shipment.recipient',
            'items.shipment.senderAddress',
            'items.shipment.recipientAddress',
            'items.package',
        ]);

        $pages = [];
        $failed = 0;

        foreach ($job->items as $item) {
            $shipment = $item->shipment;
            $package = $item->package;
            if (!$shipment || !$package) {
                $item->update([
                    'status' => 'failed',
                    'error_code' => 'missing_context',
                    'error_message' => 'Shipment/package not found.',
                ]);
                $failed++;
                continue;
            }

            $payload = $service->buildPayload($shipment, $package, $vendorId);
            $item->update([
                'status' => 'generated',
                'payload_snapshot' => $payload,
                'generated_at' => now(),
                'printed_at' => now(),
            ]);
            $pages[] = $service->renderLabelHtml($payload, $template);
        }

        if (count($pages) === 0) {
            $job->update(['status' => 'failed']);
            return response()->json(['message' => 'No printable items generated.'], 422);
        }

        $pdf = $service->renderLabelsPdf($pages, $size, (string) $template->orientation);
        $stored = $service->storePdf($pdf, $vendorId, 'pod_labels');
        $service->markJobGenerated($job, $stored, $count, $failed);

        return response()->json([
            'status' => 'ready',
            'jobId' => $job->id,
            'url' => $stored['url'],
            'failedItems' => $failed,
        ]);
    }

    public function print(Request $request, CourierPodLabelService $service)
    {
        return $this->storeJob($request, $service);
    }

    public function showJob(Request $request, CourierLabelPrintJob $job, CourierPodLabelService $service)
    {
        $vendorId = $this->resolveVendorId($request);
        $this->assertApprovedRegistration($vendorId);

        if ((int) $job->vendor_user_id !== $vendorId) {
            abort(404);
        }

        $job->load('items:id,print_job_id,shipment_id,package_id,status,error_code,error_message,item_index,page_number,generated_at,printed_at');

        return response()->json([
            'job' => [
                'id' => $job->id,
                'status' => $job->status,
                'mode' => $job->mode,
                'totalItems' => (int) $job->total_items,
                'generatedItems' => (int) $job->generated_items,
                'failedItems' => (int) $job->failed_items,
                'url' => $service->buildJobArtifactUrl($job),
                'generatedAt' => optional($job->generated_at)->toIso8601String(),
                'printedAt' => optional($job->printed_at)->toIso8601String(),
                'items' => $job->items,
            ],
        ]);
    }

    private function resolveTemplate(int $vendorId, ?int $templateId, $packages, CourierPodLabelService $service): ?CourierLabelTemplate
    {
        if ($templateId) {
            $template = CourierLabelTemplate::query()
                ->with('size')
                ->where('vendor_user_id', $vendorId)
                ->where('is_active', true)
                ->findOrFail($templateId);

            $this->assertTemplateScopeMatchesPackages($template, $packages, $service);

            return $template;
        }

        $categories = $packages
            ->map(fn (CourierPackage $package) => $service->resolveCategory($package->shipment))
            ->unique()
            ->values();

        $scope = $categories->count() > 1 ? 'all' : (string) $categories->first();

        return CourierLabelTemplate::query()
            ->with('size')
            ->where('vendor_user_id', $vendorId)
            ->where('is_active', true)
            ->where(function (Builder $query) use ($scope) {
                $query->where('category_scope', 'all')
                    ->orWhere('category_scope', $scope);
            })
            ->orderByDesc('category_scope')
            ->orderByDesc('version')
            ->first();
    }

    private function resolveSize(int $vendorId, ?int $sizeId, ?CourierLabelTemplate $template, CourierPodLabelService $service): CourierLabelSize
    {
        if ($sizeId) {
            return CourierLabelSize::query()
                ->where('vendor_user_id', $vendorId)
                ->where('is_active', true)
                ->findOrFail($sizeId);
        }

        if ($template?->size) {
            return $template->size;
        }

        return $service->makeFallbackSize();
    }

    private function loadPackages(int $vendorId, array $shipmentIds, array $packageIds)
    {
        $query = CourierPackage::query()
            ->with([
                'shipment.sender',
                'shipment.recipient',
                'shipment.senderAddress',
                'shipment.recipientAddress',
            ])
            ->whereHas('shipment', function (Builder $builder) use ($vendorId) {
                $builder->where('assigned_vendor_user_id', $vendorId);
            });

        if (!empty($packageIds)) {
            $query->whereIn('id', $packageIds);
        }

        if (!empty($shipmentIds)) {
            $query->whereIn('shipment_id', $shipmentIds);
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
            $status = (string) ($package->shipment?->status ?? '');
            if (!in_array($status, $allowedStatuses, true)) {
                $blocked++;
                return false;
            }

            return true;
        });

        return ['packages' => $eligible->values(), 'blocked' => $blocked];
    }

    private function resolveLabelSettings(int $vendorId): array
    {
        $record = VendorCourierSetting::query()->where('vendor_user_id', $vendorId)->first();
        $settings = is_array($record?->settings) ? $record->settings : [];
        $labels = is_array($settings['labels'] ?? null) ? $settings['labels'] : [];

        $defaults = is_array($labels['defaults'] ?? null) ? $labels['defaults'] : [];
        $policy = is_array($labels['printPolicy'] ?? null) ? $labels['printPolicy'] : [];

        return [
            'defaults' => [
                'domestic' => [
                    'templateId' => isset($defaults['domestic']['templateId']) ? (int) $defaults['domestic']['templateId'] : null,
                    'sizeId' => isset($defaults['domestic']['sizeId']) ? (int) $defaults['domestic']['sizeId'] : null,
                ],
                'international' => [
                    'templateId' => isset($defaults['international']['templateId']) ? (int) $defaults['international']['templateId'] : null,
                    'sizeId' => isset($defaults['international']['sizeId']) ? (int) $defaults['international']['sizeId'] : null,
                ],
            ],
            'policy' => [
                'syncThreshold' => max(1, (int) ($policy['syncThreshold'] ?? $policy['bulkAsyncThreshold'] ?? 25)),
                'hardLimit' => max(25, (int) ($policy['hardLimit'] ?? $policy['bulkHardLimit'] ?? 500)),
            ],
        ];
    }

    private function assertApprovedRegistration(int $vendorId): void
    {
        $ok = VendorServiceRegistration::query()
            ->where('user_id', $vendorId)
            ->where('status', 'approved')
            ->whereHas('serviceCategory', function (Builder $query) {
                $query->where('slug', 'courier-services');
            })
            ->exists();

        if (!$ok) {
            abort(403, 'Courier service registration approval is required to manage labels.');
        }
    }

    private function assertTemplateOwnership(CourierLabelTemplate $template, int $vendorId): void
    {
        if ((int) $template->vendor_user_id !== $vendorId) {
            abort(404);
        }
    }

    private function deactivateSiblingTemplates(CourierLabelTemplate $template): void
    {
        CourierLabelTemplate::query()
            ->where('vendor_user_id', $template->vendor_user_id)
            ->where('id', '!=', $template->id)
            ->where('name', $template->name)
            ->where('category_scope', $template->category_scope)
            ->where('size_id', $template->size_id)
            ->update(['is_active' => false]);
    }

    private function availableTokens(): array
    {
        return [
            'trackingNumber',
            'reference',
            'orderNumber',
            'serviceLevel',
            'issuedDate',
            'codAmount',
            'currencyCode',
            'weightKg',
            'district',
            'nearestCity',
            'description',
            'sender.name',
            'sender.phone',
            'sender.address',
            'recipient.name',
            'recipient.phonePrimary',
            'recipient.phoneSecondary',
            'recipient.address',
            'recipient.nic',
            'pod.receiverName',
            'pod.receiverNic',
            'brand.name',
            'brand.address',
            'brand.contactLine',
        ];
    }

    private function samplePayload(int $vendorId, CourierPodLabelService $service): array
    {
        $shipment = new CourierShipment([
            'reference' => 'CR-SAMPLE01',
            'order_number' => 'ORD-1001',
            'service_level' => 'Express',
            'destination_district' => 'Colombo',
            'destination_nearest_city' => 'Pita Kotte',
            'recipient_alt_phone' => '+94 77 000 1111',
            'recipient_nic' => '901234567V',
            'pod_receiver_name' => '',
            'pod_receiver_nic' => '',
            'is_cod_enabled' => true,
            'cod_requested_amount' => 1250,
            'currency_code' => 'LKR',
        ]);

        $shipment->setRelation('sender', (object) ['name' => 'Sender Name', 'phone' => '+94 11 123 4567']);
        $shipment->setRelation('recipient', (object) ['name' => 'Recipient Name', 'phone' => '+94 77 888 9999']);
        $shipment->setRelation('senderAddress', (object) [
            'line1' => 'No. 25, Epitamulla Road',
            'line2' => '',
            'city' => 'Pita Kotte',
            'state' => '',
            'postal_code' => '10100',
            'country' => 'LK',
        ]);
        $shipment->setRelation('recipientAddress', (object) [
            'line1' => 'No. 10, Main Street',
            'line2' => '',
            'city' => 'Kandy',
            'state' => '',
            'postal_code' => '20000',
            'country' => 'LK',
        ]);

        $package = new CourierPackage([
            'weight_kg' => 2.3,
            'description' => 'Documents / small parcel',
        ]);

        return $service->buildPayload($shipment, $package, $vendorId);
    }

    private function assertTemplateScopeMatchesPackages(CourierLabelTemplate $template, $packages, CourierPodLabelService $service): void
    {
        if ($template->category_scope === 'all') {
            return;
        }

        $categories = $packages
            ->map(fn (CourierPackage $package) => $service->resolveCategory($package->shipment))
            ->unique()
            ->values();

        if ($categories->count() > 1 || (string) $categories->first() !== (string) $template->category_scope) {
            abort(422, 'Selected template does not match shipment category.');
        }
    }

    private function resolveVendorId(Request $request): int
    {
        $vendorId = (int) $request->attributes->get('vendor_user_id');
        if ($vendorId > 0) {
            return $vendorId;
        }

        return (int) optional($request->user())->id;
    }

    private function transformSize(CourierLabelSize $size): array
    {
        $metadata = is_array($size->metadata) ? $size->metadata : [];

        return [
            'id' => $size->id,
            'name' => $size->name,
            'width_mm' => (float) $size->width_mm,
            'height_mm' => (float) $size->height_mm,
            'widthMm' => (float) $size->width_mm,
            'heightMm' => (float) $size->height_mm,
            'unit' => (string) ($metadata['unit'] ?? 'mm'),
            'is_active' => (bool) $size->is_active,
            'isActive' => (bool) $size->is_active,
            'is_system' => (bool) $size->is_system,
            'isSystem' => (bool) $size->is_system,
            'metadata' => $metadata,
        ];
    }

    private function transformTemplate(CourierLabelTemplate $template): array
    {
        return [
            'id' => $template->id,
            'name' => $template->name,
            'size_id' => $template->size_id,
            'sizeId' => $template->size_id,
            'category_scope' => $template->category_scope,
            'categoryScope' => $template->category_scope,
            'layout_preset' => $template->layout_preset,
            'layoutPreset' => $template->layout_preset,
            'orientation' => $template->orientation,
            'schema' => is_array($template->schema) ? $template->schema : [],
            'builder_schema' => is_array($template->schema) ? $template->schema : [],
            'template_type' => 'builder',
            'version' => (int) $template->version,
            'is_active' => (bool) $template->is_active,
            'isActive' => (bool) $template->is_active,
            'is_system' => (bool) $template->is_system,
            'isSystem' => (bool) $template->is_system,
            'size' => $template->size ? $this->transformSize($template->size) : null,
        ];
    }
}
