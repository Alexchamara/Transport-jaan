<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ServiceCategory;
use App\Models\ServiceSubCategory;

class ServiceCategorySeeder extends Seeder
{
    public function run(): void
    {
        // ================================================================
        // 1. WAREHOUSING
        // ================================================================
        $warehousing = ServiceCategory::create([
            'name' => 'Warehousing',
            'slug' => 'warehousing',
            'description' => 'Warehouse storage and logistics services',
            'icon' => 'warehouse',
            'display_order' => 1,
            'is_active' => true,
        ]);

        ServiceSubCategory::create([
            'service_category_id' => $warehousing->id,
            'name' => 'Customs Bonded Warehouse',
            'slug' => 'customs-bonded-warehouse',
            'description' => 'Customs bonded warehouse facilities',
            'display_order' => 1,
            'required_fields' => [
                ['key' => 'business_incorporation', 'label' => 'Business Incorporation', 'type' => 'file', 'required' => true],
                ['key' => 'customs_bonded_warehouse_license', 'label' => 'Customs Bonded Warehouse License', 'type' => 'file_with_dates', 'required' => true],
                ['key' => 'fire_safety_certificate', 'label' => 'Fire Safety Certificate', 'type' => 'checkbox', 'required' => true],
                ['key' => 'cctv', 'label' => 'CCTV', 'type' => 'checkbox', 'required' => true],
                ['key' => 'pest_control', 'label' => 'Pest Control', 'type' => 'checkbox', 'required' => true],
                ['key' => 'insurance_policies', 'label' => 'Insurance Policies', 'type' => 'checkbox', 'required' => true],
                ['key' => 'slffa_membership', 'label' => 'SLFFA Membership', 'type' => 'checkbox', 'required' => true],
            ],
        ]);

        ServiceSubCategory::create([
            'service_category_id' => $warehousing->id,
            'name' => 'Specialized Functional Warehouse',
            'slug' => 'specialized-functional-warehouse',
            'description' => 'Specialized sector warehouse facilities',
            'display_order' => 2,
            'required_fields' => [
                ['key' => 'business_incorporation', 'label' => 'Business Incorporation', 'type' => 'file', 'required' => true],
                ['key' => 'specialized_sector_licenses', 'label' => 'Specialized Sector Licenses', 'type' => 'file_with_dates', 'required' => true],
                ['key' => 'fire_safety_certificate', 'label' => 'Fire Safety Certificate', 'type' => 'checkbox', 'required' => true],
                ['key' => 'cctv', 'label' => 'CCTV', 'type' => 'checkbox', 'required' => true],
                ['key' => 'pest_control', 'label' => 'Pest Control', 'type' => 'checkbox', 'required' => true],
                ['key' => 'insurance_policies', 'label' => 'Insurance Policies', 'type' => 'checkbox', 'required' => true],
            ],
        ]);

        ServiceSubCategory::create([
            'service_category_id' => $warehousing->id,
            'name' => 'BOI Warehouse',
            'slug' => 'boi-warehouse',
            'description' => 'Board of Investment warehouse facilities',
            'display_order' => 3,
            'required_fields' => [
                ['key' => 'boi_certificate', 'label' => 'BOI Certificate of Registration / Developer Permit', 'type' => 'file_with_dates', 'required' => true],
                ['key' => 'customs_bonded_approval', 'label' => 'Customs "Bonded" Approval', 'type' => 'file_with_dates', 'required' => true],
                ['key' => 'fire_safety_certificate', 'label' => 'Fire Safety Certificate', 'type' => 'checkbox', 'required' => true],
                ['key' => 'cctv', 'label' => 'CCTV', 'type' => 'checkbox', 'required' => true],
                ['key' => 'pest_control', 'label' => 'Pest Control', 'type' => 'checkbox', 'required' => true],
                ['key' => 'insurance_policies', 'label' => 'Insurance Policies', 'type' => 'checkbox', 'required' => true],
            ],
        ]);

        ServiceSubCategory::create([
            'service_category_id' => $warehousing->id,
            'name' => 'Commercial & 3PL Warehouses',
            'slug' => 'commercial-3pl-warehouses',
            'description' => 'Commercial and third-party logistics warehouses',
            'display_order' => 4,
            'required_fields' => [
                ['key' => 'business_incorporation', 'label' => 'Business Incorporation', 'type' => 'file', 'required' => true],
                ['key' => 'slffa_membership', 'label' => 'SLFFA Membership', 'type' => 'checkbox', 'required' => true],
                ['key' => 'fire_safety_certificate', 'label' => 'Fire Safety Certificate', 'type' => 'checkbox', 'required' => true],
                ['key' => 'cctv', 'label' => 'CCTV', 'type' => 'checkbox', 'required' => true],
                ['key' => 'pest_control', 'label' => 'Pest Control', 'type' => 'checkbox', 'required' => true],
                ['key' => 'insurance_policies', 'label' => 'Insurance Policies', 'type' => 'checkbox', 'required' => true],
            ],
        ]);

        ServiceSubCategory::create([
            'service_category_id' => $warehousing->id,
            'name' => 'Properties for Warehousing Purposes',
            'slug' => 'properties-for-warehousing',
            'description' => 'Land and property for warehousing purposes',
            'display_order' => 5,
            'required_fields' => [
                ['key' => 'land_only', 'label' => 'Land Only', 'type' => 'checkbox', 'required' => false],
                ['key' => 'land_with_building', 'label' => 'Land with Building', 'type' => 'checkbox', 'required' => false],
            ],
        ]);

        // ================================================================
        // 2. COURIER SERVICES
        // ================================================================
        $courier = ServiceCategory::create([
            'name' => 'Courier Services',
            'slug' => 'courier-services',
            'description' => 'Domestic and logistic courier services',
            'icon' => 'truck',
            'display_order' => 2,
            'is_active' => true,
        ]);

        ServiceSubCategory::create([
            'service_category_id' => $courier->id,
            'name' => 'Domestic',
            'slug' => 'domestic',
            'description' => 'Domestic courier services within Sri Lanka',
            'display_order' => 1,
            'required_fields' => [
                ['key' => 'business_incorporation', 'label' => 'Business Incorporation', 'type' => 'file', 'required' => true],
                ['key' => 'courier_service_license', 'label' => 'Courier Service License', 'type' => 'file_with_dates', 'required' => true],
            ],
        ]);

        ServiceSubCategory::create([
            'service_category_id' => $courier->id,
            'name' => 'Logistic',
            'slug' => 'logistic',
            'description' => 'Logistic courier services',
            'display_order' => 2,
            'required_fields' => [
                ['key' => 'business_incorporation', 'label' => 'Business Incorporation', 'type' => 'file', 'required' => true],
                ['key' => 'courier_service_license', 'label' => 'Courier Service License', 'type' => 'file_with_dates', 'required' => true],
                ['key' => 'customs_registration', 'label' => 'Sri Lanka Customs Registration (Only for Logistic)', 'type' => 'file', 'required' => true],
            ],
        ]);

        // ================================================================
        // 3. VEHICLE RENTAL
        // ================================================================
        $vehicleRental = ServiceCategory::create([
            'name' => 'Vehicle Rental',
            'slug' => 'vehicle-rental',
            'description' => 'Vehicle rental and transportation services',
            'icon' => 'car',
            'display_order' => 3,
            'is_active' => true,
        ]);

        ServiceSubCategory::create([
            'service_category_id' => $vehicleRental->id,
            'name' => 'Local Transportation',
            'slug' => 'local-transportation',
            'description' => 'Local vehicle transportation services',
            'display_order' => 1,
            'required_fields' => [
                ['key' => 'business_incorporation', 'label' => 'Business Incorporation', 'type' => 'file', 'required' => true],
                ['key' => 'trade_license', 'label' => 'Trade License', 'type' => 'file_with_dates', 'required' => true],
            ],
        ]);

        ServiceSubCategory::create([
            'service_category_id' => $vehicleRental->id,
            'name' => 'Tourism Purpose',
            'slug' => 'tourism-purpose',
            'description' => 'Tourism-related vehicle rental services',
            'display_order' => 2,
            'required_fields' => [
                ['key' => 'business_incorporation', 'label' => 'Business Incorporation', 'type' => 'file', 'required' => true],
                ['key' => 'trade_license', 'label' => 'Trade License', 'type' => 'file_with_dates', 'required' => true],
                ['key' => 'sltda_registration', 'label' => 'SLTDA Registration (If available)', 'type' => 'file_with_dates', 'required' => false],
            ],
        ]);

        // ================================================================
        // 4. AVIATION SERVICE
        // ================================================================
        $aviation = ServiceCategory::create([
            'name' => 'Aviation Service',
            'slug' => 'aviation-service',
            'description' => 'Domestic and international aviation services',
            'icon' => 'plane',
            'display_order' => 4,
            'is_active' => true,
        ]);

        ServiceSubCategory::create([
            'service_category_id' => $aviation->id,
            'name' => 'Domestic Air Transport Provider',
            'slug' => 'domestic-air-transport',
            'description' => 'Domestic air transport services',
            'display_order' => 1,
            'required_fields' => [
                ['key' => 'business_incorporation', 'label' => 'Business Incorporation', 'type' => 'file', 'required' => true],
                ['key' => 'air_operator_certificate', 'label' => 'Air Operator Certificate (AOC)', 'type' => 'file', 'required' => true],
                ['key' => 'air_transport_providers_licence', 'label' => 'Air Transport Providers Licence (ATPL)', 'type' => 'file_with_dates', 'required' => true],
                ['key' => 'aviation_liability_insurance', 'label' => 'Aviation Liability Insurance', 'type' => 'file_with_dates', 'required' => true],
            ],
        ]);

        ServiceSubCategory::create([
            'service_category_id' => $aviation->id,
            'name' => 'International Airline',
            'slug' => 'international-airline',
            'description' => 'International airline services',
            'display_order' => 2,
            'required_fields' => [
                ['key' => 'business_incorporation', 'label' => 'Business Incorporation', 'type' => 'file', 'required' => true],
                ['key' => 'home_state_aoc', 'label' => 'Home State AOC', 'type' => 'file', 'required' => true],
                ['key' => 'foreign_air_operator_certificate', 'label' => 'Foreign Air Operator Certificate (FAOC)', 'type' => 'file', 'required' => true],
                ['key' => 'foreign_airline_licence', 'label' => 'Foreign Airline Licence (FAL)', 'type' => 'file_with_dates', 'required' => true],
                ['key' => 'air_transport_providers_licence', 'label' => 'Air Transport Providers Licence (ATPL)', 'type' => 'file_with_dates', 'required' => true],
                ['key' => 'insurance_cover', 'label' => 'Insurance Cover', 'type' => 'file_with_dates', 'required' => true],
            ],
        ]);

        // ================================================================
        // 5. RAILWAY SERVICE
        // ================================================================
        $railway = ServiceCategory::create([
            'name' => 'Railway Service',
            'slug' => 'railway-service',
            'description' => 'Public and private railway services',
            'icon' => 'train',
            'display_order' => 5,
            'is_active' => true,
        ]);

        ServiceSubCategory::create([
            'service_category_id' => $railway->id,
            'name' => 'Public (Government-operated)',
            'slug' => 'public-government',
            'description' => 'Government-operated railway services - no vendor registration required',
            'display_order' => 1,
            'required_fields' => [],
        ]);

        ServiceSubCategory::create([
            'service_category_id' => $railway->id,
            'name' => 'Private',
            'slug' => 'private',
            'description' => 'Private railway services',
            'display_order' => 2,
            'required_fields' => [
                ['key' => 'business_incorporation', 'label' => 'Business Incorporation', 'type' => 'file', 'required' => true],
                ['key' => 'administrative_registrations', 'label' => 'Administrative Registrations', 'type' => 'file_with_dates', 'required' => true],
                ['key' => 'operational_permits', 'label' => 'Operational Permits', 'type' => 'file_with_dates', 'required' => true],
            ],
        ]);

        // ================================================================
        // 6. WATERBORNE TRANSPORT
        // ================================================================
        $waterborne = ServiceCategory::create([
            'name' => 'Waterborne Transport',
            'slug' => 'waterborne-transport',
            'description' => 'Cruise line and private yacht/boat services',
            'icon' => 'ship',
            'display_order' => 6,
            'is_active' => true,
        ]);

        ServiceSubCategory::create([
            'service_category_id' => $waterborne->id,
            'name' => 'Cruise Line',
            'slug' => 'cruise-line',
            'description' => 'Cruise line services',
            'display_order' => 1,
            'required_fields' => [
                ['key' => 'business_incorporation', 'label' => 'Business Incorporation', 'type' => 'file', 'required' => true],
                ['key' => 'administrative_registrations', 'label' => 'Administrative Registrations', 'type' => 'file_with_dates', 'required' => true],
                ['key' => 'operational_permits', 'label' => 'Operational Permits', 'type' => 'file_with_dates', 'required' => true],
            ],
        ]);

        ServiceSubCategory::create([
            'service_category_id' => $waterborne->id,
            'name' => 'Private Yacht or Boat Services',
            'slug' => 'private-yacht-boat',
            'description' => 'Private yacht and boat rental services',
            'display_order' => 2,
            'required_fields' => [
                ['key' => 'business_incorporation', 'label' => 'Business Incorporation', 'type' => 'file', 'required' => true],
                ['key' => 'administrative_registrations', 'label' => 'Administrative Registrations', 'type' => 'file_with_dates', 'required' => true],
                ['key' => 'operational_permits', 'label' => 'Operational Permits', 'type' => 'file_with_dates', 'required' => true],
            ],
        ]);
    }
}
