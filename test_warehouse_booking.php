<?php

require_once 'vendor/autoload.php';

use App\Models\Warehouse\WarehouseUnit;
use App\Models\Warehouse\WarehouseBooking;
use App\Models\User;

// Initialize Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Testing Warehouse Booking Amount Calculations\n";
echo "============================================\n\n";

// Get the warehouse unit
$warehouse = WarehouseUnit::find(1);
if (!$warehouse) {
    echo "Error: Warehouse unit not found\n";
    exit(1);
}

echo "Warehouse Unit Data:\n";
echo "- Monthly Rate: $" . $warehouse->monthly_rate . "\n";
echo "- Security Deposit: $" . $warehouse->security_deposit . "\n";
echo "- Setup Fee: $" . $warehouse->setup_fee . "\n";
echo "- Tax Rate: " . $warehouse->tax_rate . "%\n\n";

// Simulate frontend pricing calculation
$requiredSpace = 56.00;
$durationMonths = 36;

// Calculate pricing (simulating frontend logic)
$monthlyRate = floatval($warehouse->monthly_rate) * $requiredSpace;
$securityDeposit = floatval($warehouse->security_deposit) * $requiredSpace;
$setupFee = floatval($warehouse->setup_fee);
$taxRate = floatval($warehouse->tax_rate) / 100; // Convert percentage to decimal

$subtotal = ($monthlyRate * $durationMonths) + $securityDeposit + $setupFee;
$taxAmount = $subtotal * $taxRate;
$finalAmount = $subtotal + $taxAmount;

echo "Calculated Pricing:\n";
echo "- Monthly Rate (per space): $" . number_format($monthlyRate, 2) . "\n";
echo "- Security Deposit (per space): $" . number_format($securityDeposit, 2) . "\n";
echo "- Setup Fee: $" . number_format($setupFee, 2) . "\n";
echo "- Subtotal: $" . number_format($subtotal, 2) . "\n";
echo "- Tax Amount (" . ($taxRate * 100) . "%): $" . number_format($taxAmount, 2) . "\n";
echo "- Final Amount: $" . number_format($finalAmount, 2) . "\n\n";

// Create test booking data
$user = User::first();
if (!$user) {
    echo "Error: No user found\n";
    exit(1);
}

$bookingData = [
    'user_id' => $user->id,
    'warehouse_unit_id' => $warehouse->id,
    'booking_reference' => 'TEST-' . strtoupper(substr(md5(time()), 0, 8)),
    'status' => 'pending',
    'company_name' => 'Test Company LLC',
    'contact_person' => 'John Doe',
    'phone' => '1234567890',
    'email' => 'test@example.com',
    'storage_type' => $warehouse->type,
    'required_space' => $requiredSpace,
    'goods_type' => 'General',
    'goods_description' => 'Test goods',
    'amenities' => json_encode(['Loading Dock', 'Fire Safety']),
    'start_date' => '2025-10-10',
    'end_date' => '2028-10-10',
    'duration_months' => $durationMonths,
    'access_hours' => '24/7',
    'monthly_rate' => $monthlyRate,
    'security_deposit' => $securityDeposit,
    'setup_fee' => $setupFee,
    'total_amount' => $subtotal,
    'tax_amount' => $taxAmount,
    'final_amount' => $finalAmount,
    'payment_method' => 'credit_card',
    'payment_status' => 'pending',
    'payment_option' => 'full',
    'terms_accepted' => true,
    'insurance_required' => false,
];

echo "Creating test booking...\n";

try {
    $booking = WarehouseBooking::create($bookingData);
    
    echo "✓ Booking created successfully!\n";
    echo "Booking ID: " . $booking->id . "\n";
    echo "Booking Reference: " . $booking->booking_reference . "\n\n";
    
    echo "Saved Amount Values:\n";
    echo "- Monthly Rate: $" . $booking->monthly_rate . "\n";
    echo "- Security Deposit: $" . $booking->security_deposit . "\n";
    echo "- Setup Fee: $" . $booking->setup_fee . "\n";
    echo "- Total Amount: $" . $booking->total_amount . "\n";
    echo "- Tax Amount: $" . $booking->tax_amount . "\n";
    echo "- Final Amount: $" . $booking->final_amount . "\n\n";
    
    // Check if amounts match
    $monthlyRateMatches = abs(floatval($booking->monthly_rate) - $monthlyRate) < 0.01;
    $securityDepositMatches = abs(floatval($booking->security_deposit) - $securityDeposit) < 0.01;
    $setupFeeMatches = abs(floatval($booking->setup_fee) - $setupFee) < 0.01;
    $totalAmountMatches = abs(floatval($booking->total_amount) - $subtotal) < 0.01;
    $taxAmountMatches = abs(floatval($booking->tax_amount) - $taxAmount) < 0.01;
    $finalAmountMatches = abs(floatval($booking->final_amount) - $finalAmount) < 0.01;
    
    echo "Validation Results:\n";
    echo ($monthlyRateMatches ? "✓" : "✗") . " Monthly Rate matches\n";
    echo ($securityDepositMatches ? "✓" : "✗") . " Security Deposit matches\n";
    echo ($setupFeeMatches ? "✓" : "✗") . " Setup Fee matches\n";
    echo ($totalAmountMatches ? "✓" : "✗") . " Total Amount matches\n";
    echo ($taxAmountMatches ? "✓" : "✗") . " Tax Amount matches\n";
    echo ($finalAmountMatches ? "✓" : "✗") . " Final Amount matches\n\n";
    
    if ($monthlyRateMatches && $securityDepositMatches && $setupFeeMatches && 
        $totalAmountMatches && $taxAmountMatches && $finalAmountMatches) {
        echo "🎉 ALL AMOUNT CALCULATIONS ARE CORRECT!\n";
    } else {
        echo "❌ Some amount calculations don't match. Check the frontend logic.\n";
    }
    
} catch (Exception $e) {
    echo "✗ Error creating booking: " . $e->getMessage() . "\n";
}