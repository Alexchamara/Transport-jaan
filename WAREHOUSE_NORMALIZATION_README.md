# Warehouse Database Normalization

This document outlines the database normalization changes made to the warehouse system for better data organization, performance, and maintainability.

## Overview

The original `warehouse_units` table contained JSON fields for amenities, images, and documents, which made querying, indexing, and maintaining data difficult. This normalization breaks down the monolithic table into several related tables.

## New Database Structure

### 1. Main Table: `warehouse_units`
**Purpose**: Core warehouse information
**Key Changes**:
- Removed JSON fields (`amenities`, `images`, `documents`)
- Added proper data types for pricing fields
- Added availability and contact information
- Added comprehensive indexing

**New Fields**:
- `capacity_unit` - Unit of measurement for capacity
- `base_price` - Renamed from `price` for clarity
- `currency` - Currency code (default: USD)
- `contact_person`, `contact_phone`, `contact_email` - Contact details
- `is_available` - Availability status
- `available_from`, `available_until` - Availability dates
- `operating_hours` - JSON field for operating hours
- `special_requirements`, `restrictions` - Additional info fields

### 2. `warehouse_amenities`
**Purpose**: Manage amenities with proper relationships
**Features**:
- Individual amenity records
- Cost management (included vs additional cost)
- Availability tracking
- Proper indexing for queries

### 3. `warehouse_images`
**Purpose**: Image management with metadata
**Features**:
- Image categorization (main, gallery, floor_plan, etc.)
- Sort ordering
- File metadata (size, dimensions, mime type)
- Multiple storage disk support
- Active/inactive status

### 4. `warehouse_documents`
**Purpose**: Document management system
**Features**:
- Document categorization
- Version control
- Expiry date tracking
- Public/private access control
- Required document flagging
- Upload tracking

### 5. `warehouse_approvals`
**Purpose**: Approval workflow tracking
**Features**:
- Status history tracking
- Approval expiry management
- Checklist support
- Multiple reviewer support
- Metadata storage for additional workflow data

## Benefits of Normalization

### 1. **Better Performance**
- Proper indexing on related tables
- Faster queries without JSON parsing
- Better join performance

### 2. **Data Integrity**
- Foreign key constraints
- Proper data types
- Validation at database level

### 3. **Easier Maintenance**
- Individual record management
- Bulk operations on specific data types
- Better backup/restore capabilities

### 4. **Enhanced Features**
- Image sorting and categorization
- Document version control
- Amenity cost management
- Approval workflow tracking

### 5. **Scalability**
- Independent scaling of related data
- Better caching strategies
- Reduced data duplication

## Migration Process

### 1. Run New Migrations
```bash
php artisan migrate
```

### 2. Data Migration
The system includes a data migration script that will:
- Convert JSON amenities to individual records
- Migrate image data with proper categorization
- Move documents to the new structure
- Create approval records from existing status

### 3. Update Application Code
- Use new Eloquent relationships
- Update forms and controllers
- Modify API responses

### 4. Clean up (Optional)
After ensuring data migration is successful, you can remove old JSON columns:
```php
Schema::table('warehouse_units', function (Blueprint $table) {
    $table->dropColumn(['amenities', 'images', 'documents', 'approval_status', 'approved_at', 'approved_by', 'rejection_reason']);
});
```

## Updated Eloquent Models

### WarehouseUnit Model
```php
// Relationships
$warehouse->amenities;          // All amenities
$warehouse->includedAmenities;  // Free amenities
$warehouse->paidAmenities;      // Paid amenities
$warehouse->images;             // All images
$warehouse->mainImage;          // Primary image
$warehouse->galleryImages;      // Gallery images
$warehouse->documents;          // All documents
$warehouse->publicDocuments;    // Customer-accessible documents
$warehouse->approvals;          // Approval history
$warehouse->currentApproval;    // Latest approval status

// Scopes
WarehouseUnit::active();
WarehouseUnit::available();
WarehouseUnit::approved();
WarehouseUnit::byType('cold_storage');
WarehouseUnit::inPriceRange(100, 500);
WarehouseUnit::nearLocation($lat, $lng, 50);
```

### New Models
- `WarehouseAmenity`
- `WarehouseImage`
- `WarehouseDocument`
- `WarehouseApproval`

## API Response Example

### Before (Old Structure)
```json
{
  "id": 1,
  "name": "Cold Storage Unit A",
  "amenities": ["Forklift", "24/7 Access", "CCTV"],
  "images": ["/storage/warehouse1.jpg", "/storage/warehouse2.jpg"],
  "approval_status": "approved"
}
```

### After (New Structure)
```json
{
  "id": 1,
  "name": "Cold Storage Unit A",
  "amenities": [
    {"id": 1, "name": "Forklift", "is_included": true, "additional_cost": null},
    {"id": 2, "name": "24/7 Access", "is_included": false, "additional_cost": 50.00}
  ],
  "images": [
    {
      "id": 1, 
      "type": "main", 
      "url": "/storage/warehouse1.jpg",
      "alt_text": "Main warehouse view"
    }
  ],
  "current_approval": {
    "status": "approved",
    "approved_at": "2025-09-01T10:00:00Z",
    "approved_by": {"name": "Admin User"}
  }
}
```

## Performance Improvements

### Indexing Strategy
- `warehouse_units`: Indexed on location, type, pricing, availability
- `warehouse_amenities`: Indexed on warehouse_unit_id, availability
- `warehouse_images`: Indexed on warehouse_unit_id, type, sort_order
- `warehouse_documents`: Indexed on warehouse_unit_id, type, expiry
- `warehouse_approvals`: Indexed on warehouse_unit_id, status, dates

### Query Optimization
- Use proper joins instead of JSON queries
- Leverage eager loading for relationships
- Implement query scopes for common filters

## Future Enhancements

1. **Full-text Search**: Add search indexes for better text searching
2. **Audit Trail**: Track all changes to warehouse data
3. **API Versioning**: Maintain backward compatibility
4. **Image Processing**: Add automatic thumbnail generation
5. **Document OCR**: Extract text from uploaded documents
6. **Geospatial Queries**: Implement proper spatial indexing for location searches

## Backward Compatibility

The migration maintains backward compatibility by:
- Keeping original field names where possible
- Providing accessor methods for common operations
- Maintaining existing API endpoints (with enhanced responses)
- Including data migration for existing records

## Testing

Ensure to test:
1. Data migration accuracy
2. Model relationships
3. API responses
4. Performance improvements
5. Search functionality
6. File upload/download operations

## Support

For questions or issues related to this migration, please contact the development team or refer to the Laravel documentation for database relationships and migrations.