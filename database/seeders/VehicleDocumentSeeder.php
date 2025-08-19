<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vehicle;
use App\Models\VehicleDocument;
use Illuminate\Support\Carbon;

class VehicleDocumentSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $map = [
            'ABC-1234' => [
                ['doc_type' => 'insurance', 'provider_name' => 'AIA', 'policy_or_doc_number' => 'AIA-INS-001', 'issue_date' => $now->copy()->subMonths(6)->toDateString(), 'expiry_date' => $now->copy()->addMonths(6)->toDateString(), 'file_path' => 'docs/ABC-1234/insurance.pdf'],
                ['doc_type' => 'registration', 'provider_name' => 'RMV', 'policy_or_doc_number' => 'REG-ABC-1234', 'issue_date' => $now->copy()->subYears(3)->toDateString(), 'expiry_date' => null, 'file_path' => 'docs/ABC-1234/registration.pdf'],
            ],
            '4R-ABC' => [
                ['doc_type' => 'insurance', 'provider_name' => 'Allianz', 'policy_or_doc_number' => 'ALL-INS-100', 'issue_date' => $now->copy()->subMonths(6)->toDateString(), 'expiry_date' => $now->copy()->addMonths(6)->toDateString(), 'file_path' => 'docs/4R-ABC/insurance.pdf'],
                ['doc_type' => 'airworthiness', 'provider_name' => 'CAA', 'policy_or_doc_number' => 'CAA-AIRW-100', 'issue_date' => $now->copy()->subMonths(4)->toDateString(), 'expiry_date' => $now->copy()->addMonths(8)->toDateString(), 'file_path' => 'docs/4R-ABC/airworthiness.pdf'],
            ],
            'SL-YAC-8899' => [
                ['doc_type' => 'insurance', 'provider_name' => 'Orient', 'policy_or_doc_number' => 'ORI-INS-900', 'issue_date' => $now->copy()->subMonths(6)->toDateString(), 'expiry_date' => $now->copy()->addMonths(6)->toDateString(), 'file_path' => 'docs/SL-YAC-8899/insurance.pdf'],
                ['doc_type' => 'coast_guard', 'provider_name' => 'SL Coast Guard', 'policy_or_doc_number' => 'CG-REG-8899', 'issue_date' => $now->copy()->subYears(1)->toDateString(), 'expiry_date' => $now->copy()->addYears(1)->toDateString(), 'file_path' => 'docs/SL-YAC-8899/coast_guard.pdf'],
            ],
        ];

        foreach ($map as $reg => $docs) {
            $vehicle = Vehicle::where('registration_number', $reg)->first();
            if (!$vehicle) continue;

            foreach ($docs as $d) {
                VehicleDocument::firstOrCreate(
                    ['vehicle_id' => $vehicle->id, 'doc_type' => $d['doc_type'], 'policy_or_doc_number' => $d['policy_or_doc_number']],
                    $d + ['vehicle_id' => $vehicle->id]
                );
            }
        }
    }
}
