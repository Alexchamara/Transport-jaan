<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * This migration helps migrate data from old JSON fields to normalized tables
     */
    public function up(): void
    {
        // Only run if the old structure exists
        if (Schema::hasColumn('warehouse_units', 'amenities')) {
            $this->migrateAmenities();
        }
        
        if (Schema::hasColumn('warehouse_units', 'images')) {
            $this->migrateImages();
        }
        
        if (Schema::hasColumn('warehouse_units', 'documents')) {
            $this->migrateDocuments();
        }
        
        if (Schema::hasColumn('warehouse_units', 'approval_status')) {
            $this->migrateApprovals();
        }
    }

    /**
     * Migrate amenities from JSON to separate table
     */
    private function migrateAmenities(): void
    {
        $warehouses = DB::table('warehouse_units')
            ->whereNotNull('amenities')
            ->where('amenities', '!=', '[]')
            ->where('amenities', '!=', 'null')
            ->get();

        foreach ($warehouses as $warehouse) {
            $amenities = json_decode($warehouse->amenities, true);
            
            if (is_array($amenities)) {
                foreach ($amenities as $index => $amenity) {
                    if (is_string($amenity)) {
                        // Simple string amenity
                        DB::table('warehouse_amenities')->insert([
                            'warehouse_unit_id' => $warehouse->id,
                            'name' => $amenity,
                            'is_included' => true,
                            'is_available' => true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    } elseif (is_array($amenity) && isset($amenity['name'])) {
                        // Structured amenity data
                        DB::table('warehouse_amenities')->insert([
                            'warehouse_unit_id' => $warehouse->id,
                            'name' => $amenity['name'],
                            'description' => $amenity['description'] ?? null,
                            'is_included' => $amenity['is_included'] ?? true,
                            'additional_cost' => $amenity['cost'] ?? null,
                            'cost_frequency' => $amenity['frequency'] ?? null,
                            'is_available' => $amenity['is_available'] ?? true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }
        }
    }

    /**
     * Migrate images from JSON to separate table
     */
    private function migrateImages(): void
    {
        $warehouses = DB::table('warehouse_units')
            ->whereNotNull('images')
            ->where('images', '!=', '[]')
            ->where('images', '!=', 'null')
            ->get();

        foreach ($warehouses as $warehouse) {
            $images = json_decode($warehouse->images, true);
            
            if (is_array($images)) {
                foreach ($images as $index => $image) {
                    if (is_string($image)) {
                        // Simple file path
                        DB::table('warehouse_images')->insert([
                            'warehouse_unit_id' => $warehouse->id,
                            'file_path' => $image,
                            'original_name' => basename($image),
                            'type' => $index === 0 ? 'main' : 'gallery',
                            'sort_order' => $index,
                            'mime_type' => $this->getMimeTypeFromPath($image),
                            'file_size' => 0, // Will need to be updated manually
                            'is_active' => true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    } elseif (is_array($image) && isset($image['path'])) {
                        // Structured image data
                        DB::table('warehouse_images')->insert([
                            'warehouse_unit_id' => $warehouse->id,
                            'file_path' => $image['path'],
                            'original_name' => $image['name'] ?? basename($image['path']),
                            'alt_text' => $image['alt'] ?? null,
                            'caption' => $image['caption'] ?? null,
                            'type' => $image['type'] ?? ($index === 0 ? 'main' : 'gallery'),
                            'sort_order' => $image['order'] ?? $index,
                            'mime_type' => $image['mime_type'] ?? $this->getMimeTypeFromPath($image['path']),
                            'file_size' => $image['size'] ?? 0,
                            'is_active' => $image['is_active'] ?? true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }
        }
    }

    /**
     * Migrate documents from JSON to separate table
     */
    private function migrateDocuments(): void
    {
        $warehouses = DB::table('warehouse_units')
            ->whereNotNull('documents')
            ->where('documents', '!=', '[]')
            ->where('documents', '!=', 'null')
            ->get();

        foreach ($warehouses as $warehouse) {
            $documents = json_decode($warehouse->documents, true);
            
            if (is_array($documents)) {
                foreach ($documents as $document) {
                    if (is_string($document)) {
                        // Simple file path
                        DB::table('warehouse_documents')->insert([
                            'warehouse_unit_id' => $warehouse->id,
                            'file_path' => $document,
                            'original_name' => basename($document),
                            'document_title' => basename($document, '.' . pathinfo($document, PATHINFO_EXTENSION)),
                            'type' => 'other',
                            'mime_type' => $this->getMimeTypeFromPath($document),
                            'file_size' => 0,
                            'is_public' => false,
                            'is_required' => false,
                            'version' => 1,
                            'is_active' => true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    } elseif (is_array($document) && isset($document['path'])) {
                        // Structured document data
                        DB::table('warehouse_documents')->insert([
                            'warehouse_unit_id' => $warehouse->id,
                            'file_path' => $document['path'],
                            'original_name' => $document['name'] ?? basename($document['path']),
                            'document_title' => $document['title'] ?? basename($document['path']),
                            'description' => $document['description'] ?? null,
                            'type' => $document['type'] ?? 'other',
                            'mime_type' => $document['mime_type'] ?? $this->getMimeTypeFromPath($document['path']),
                            'file_size' => $document['size'] ?? 0,
                            'is_public' => $document['is_public'] ?? false,
                            'is_required' => $document['is_required'] ?? false,
                            'version' => $document['version'] ?? 1,
                            'is_active' => $document['is_active'] ?? true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }
        }
    }

    /**
     * Migrate approval status to separate table
     */
    private function migrateApprovals(): void
    {
        $warehouses = DB::table('warehouse_units')->get();

        foreach ($warehouses as $warehouse) {
            DB::table('warehouse_approvals')->insert([
                'warehouse_unit_id' => $warehouse->id,
                'status' => $warehouse->approval_status ?? 'pending',
                'rejection_reason' => $warehouse->rejection_reason ?? null,
                'approved_by' => $warehouse->approved_by ?? null,
                'approved_at' => $warehouse->approved_at ?? null,
                'reviewed_at' => $warehouse->approved_at ?? null,
                'reviewed_by' => $warehouse->approved_by ?? null,
                'created_at' => $warehouse->created_at ?? now(),
                'updated_at' => $warehouse->updated_at ?? now(),
            ]);
        }
    }

    /**
     * Get MIME type from file path (basic implementation)
     */
    private function getMimeTypeFromPath(string $path): string
    {
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        
        $mimeTypes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt' => 'text/plain',
        ];

        return $mimeTypes[$extension] ?? 'application/octet-stream';
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: This will only clear the new tables, not restore the old JSON data
        DB::table('warehouse_amenities')->delete();
        DB::table('warehouse_images')->delete();
        DB::table('warehouse_documents')->delete();
        DB::table('warehouse_approvals')->delete();
    }
};