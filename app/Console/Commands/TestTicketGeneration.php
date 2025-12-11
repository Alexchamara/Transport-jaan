<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\TicketGenerationService;
use App\Models\BusBooking;
use App\Models\TrainBooking;
use App\Models\FlightBooking;
use Carbon\Carbon;

/**
 * Test Ticket Generation Command
 * 
 * Automated testing for PDF ticket generation with QR codes
 */
class TestTicketGeneration extends Command
{
    protected $signature = 'test:ticket-generation {--type=all : bus|train|flight|all}';
    protected $description = 'Test PDF ticket generation with QR codes for all transport types';
    
    protected $ticketService;
    protected $results = [];
    
    public function __construct(TicketGenerationService $ticketService)
    {
        parent::__construct();
        $this->ticketService = $ticketService;
    }
    
    public function handle()
    {
        $this->info('🎫 TICKET GENERATION TESTING');
        $this->info('=' . str_repeat('=', 50));
        $this->newLine();
        
        $type = $this->option('type');
        
        if ($type === 'all' || $type === 'bus') {
            $this->testBusTickets();
        }
        
        if ($type === 'all' || $type === 'train') {
            $this->testTrainTickets();
        }
        
        if ($type === 'all' || $type === 'flight') {
            $this->testFlightTickets();
        }
        
        $this->newLine();
        $this->showSummary();
        
        return 0;
    }
    
    /**
     * Test bus ticket generation
     */
    protected function testBusTickets()
    {
        $this->info('TEST 1: Bus Ticket Generation');
        $this->newLine();
        
        try {
            // Get a confirmed bus booking
            $booking = BusBooking::where('status', 'confirmed')
                ->with(['busSchedule.departureStation', 'busSchedule.arrivalStation', 'busSchedule.bus', 'user'])
                ->first();
            
            if (!$booking) {
                $this->addResult('Bus Ticket - No Booking', false, 'No confirmed bus booking found in database');
                return;
            }
            
            // Generate ticket
            $reference = $booking->booking_reference ?? 'UNKNOWN';
            $this->line("  Generating ticket for: {$reference}");
            $result = $this->ticketService->generateBusTicket($booking);
            
            // Verify file exists
            if (!file_exists($result['path'])) {
                $this->addResult('Bus Ticket - File', false, 'PDF file not created');
                return;
            }
            
            $fileSize = filesize($result['path']);
            $this->addResult('Bus Ticket - Generated', true, "PDF created ({$fileSize} bytes)");
            $this->line("  📄 Path: {$result['path']}");
            $this->line("  🌐 URL: {$result['url']}");
            
            // Test QR verification
            $qrVerified = $this->ticketService->verifyQrCode($result['qr_data']);
            if ($qrVerified) {
                $this->addResult('Bus Ticket - QR Valid', true, 'QR code verified successfully');
                $this->line("  ✓ QR Data: Reference={$qrVerified['reference']}, Checksum Valid");
            } else {
                $this->addResult('Bus Ticket - QR Valid', false, 'QR verification failed');
                $this->line("  Debug: QR data length = " . strlen($result['qr_data']));
                $this->line("  Debug: First 100 chars = " . substr($result['qr_data'], 0, 100));
            }
            
            // Test full ticket verification
            $ticketVerified = $this->ticketService->verifyTicket('bus', $booking->booking_reference, $result['qr_data']);
            if ($ticketVerified['valid']) {
                $this->addResult('Bus Ticket - Full Verification', true, 'Ticket authenticity confirmed');
            } else {
                $this->addResult('Bus Ticket - Full Verification', false, $ticketVerified['message']);
            }
            
        } catch (\Exception $e) {
            $this->addResult('Bus Ticket - Error', false, $e->getMessage());
        }
        
        $this->newLine();
    }
    
    /**
     * Test train ticket generation
     */
    protected function testTrainTickets()
    {
        $this->info('TEST 2: Train Ticket Generation');
        $this->newLine();
        
        try {
            // Get a confirmed train booking
            $booking = TrainBooking::where('status', 'confirmed')
                ->with(['trainSchedule.departureStation', 'trainSchedule.arrivalStation', 'trainSchedule.train', 'user'])
                ->first();
            
            if (!$booking) {
                $this->addResult('Train Ticket - No Booking', false, 'No confirmed train booking found in database');
                return;
            }
            
            // Generate ticket
            $reference = $booking->booking_reference ?? 'UNKNOWN';
            $this->line("  Generating ticket for: {$reference}");
            $result = $this->ticketService->generateTrainTicket($booking);
            
            // Verify file exists
            if (!file_exists($result['path'])) {
                $this->addResult('Train Ticket - File', false, 'PDF file not created');
                return;
            }
            
            $fileSize = filesize($result['path']);
            $this->addResult('Train Ticket - Generated', true, "PDF created ({$fileSize} bytes)");
            $this->line("  📄 Path: {$result['path']}");
            $this->line("  🌐 URL: {$result['url']}");
            
            // Test QR verification
            $qrVerified = $this->ticketService->verifyQrCode($result['qr_data']);
            if ($qrVerified) {
                $this->addResult('Train Ticket - QR Valid', true, 'QR code verified successfully');
                $this->line("  ✓ QR Data: Reference={$qrVerified['reference']}, Checksum Valid");
            } else {
                $this->addResult('Train Ticket - QR Valid', false, 'QR verification failed');
            }
            
            // Test full ticket verification
            $ticketVerified = $this->ticketService->verifyTicket('train', $booking->booking_reference, $result['qr_data']);
            if ($ticketVerified['valid']) {
                $this->addResult('Train Ticket - Full Verification', true, 'Ticket authenticity confirmed');
            } else {
                $this->addResult('Train Ticket - Full Verification', false, $ticketVerified['message']);
            }
            
        } catch (\Exception $e) {
            $this->addResult('Train Ticket - Error', false, $e->getMessage());
        }
        
        $this->newLine();
    }
    
    /**
     * Test flight ticket generation
     */
    protected function testFlightTickets()
    {
        $this->info('TEST 3: Flight Ticket Generation');
        $this->newLine();
        
        try {
            // Get a confirmed flight booking
            $booking = FlightBooking::where('status', 'confirmed')->first();
            
            if (!$booking) {
                $this->addResult('Flight Ticket - No Booking', false, 'No confirmed flight booking found in database');
                return;
            }
            
            // Generate ticket
            $reference = $booking->booking_reference ?? $booking->reference ?? 'UNKNOWN';
            $this->line("  Generating boarding pass for: {$reference}");
            $result = $this->ticketService->generateFlightTicket($booking);
            
            // Verify file exists
            if (!file_exists($result['path'])) {
                $this->addResult('Flight Ticket - File', false, 'PDF file not created');
                return;
            }
            
            $fileSize = filesize($result['path']);
            $this->addResult('Flight Ticket - Generated', true, "PDF created ({$fileSize} bytes)");
            $this->line("  📄 Path: {$result['path']}");
            $this->line("  🌐 URL: {$result['url']}");
            
            // Test QR verification
            $qrVerified = $this->ticketService->verifyQrCode($result['qr_data']);
            if ($qrVerified) {
                $this->addResult('Flight Ticket - QR Valid', true, 'QR code verified successfully');
                $this->line("  ✓ QR Data: Reference={$qrVerified['reference']}, Checksum Valid");
            } else {
                $this->addResult('Flight Ticket - QR Valid', false, 'QR verification failed');
            }
            
            // Test full ticket verification
            $ticketVerified = $this->ticketService->verifyTicket('flight', $booking->booking_reference ?? $booking->reference ?? 'UNKNOWN', $result['qr_data']);
            if ($ticketVerified['valid']) {
                $this->addResult('Flight Ticket - Full Verification', true, 'Ticket authenticity confirmed');
            } else {
                $this->addResult('Flight Ticket - Full Verification', false, $ticketVerified['message']);
            }
            
        } catch (\Exception $e) {
            $this->addResult('Flight Ticket - Error', false, $e->getMessage());
        }
        
        $this->newLine();
    }
    
    /**
     * Add test result
     */
    protected function addResult(string $test, bool $passed, string $message)
    {
        $this->results[] = [
            'test' => $test,
            'passed' => $passed,
            'message' => $message,
        ];
        
        if ($passed) {
            $this->line("  <fg=green>✅ {$test}</> - {$message}");
        } else {
            $this->line("  <fg=red>❌ {$test}</> - {$message}");
        }
    }
    
    /**
     * Show test summary
     */
    protected function showSummary()
    {
        $total = count($this->results);
        $passed = count(array_filter($this->results, fn($r) => $r['passed']));
        $failed = $total - $passed;
        $successRate = $total > 0 ? round(($passed / $total) * 100, 1) : 0;
        
        $this->info('📊 TEST SUMMARY');
        $this->info('=' . str_repeat('=', 50));
        $this->line("Total Tests: <fg=cyan>{$total}</>");
        $this->line("Passed: <fg=green>{$passed}</>");
        $this->line("Failed: <fg=red>{$failed}</>");
        $this->line("Success Rate: <fg=yellow>{$successRate}%</>");
        $this->newLine();
        
        if ($failed > 0) {
            $this->error('Some tests failed:');
            foreach ($this->results as $result) {
                if (!$result['passed']) {
                    $this->line("  ❌ {$result['test']}: {$result['message']}");
                }
            }
        } else {
            $this->info('🎉 All tests passed!');
            $this->line('All tickets generated successfully with valid QR codes.');
        }
        
        $this->newLine();
        $this->line('💡 View generated tickets in: public/tickets/');
    }
}
