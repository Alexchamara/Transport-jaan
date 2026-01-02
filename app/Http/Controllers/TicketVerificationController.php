<?php

namespace App\Http\Controllers;

use App\Services\TicketGenerationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

/**
 * Ticket Verification Controller
 * 
 * Handles QR code scanning and ticket verification
 */
class TicketVerificationController extends Controller
{
    protected $ticketService;
    
    public function __construct(TicketGenerationService $ticketService)
    {
        $this->ticketService = $ticketService;
    }
    
    /**
     * Show QR scanner page
     */
    public function scanner()
    {
        return Inertia::render('Admin/TicketScanner');
    }
    
    /**
     * Verify a ticket by scanning QR code
     */
    public function verify(Request $request)
    {
        $request->validate([
            'qr_data' => 'required|string',
            'type' => 'required|in:bus,train,flight',
            'reference' => 'required|string',
        ]);
        
        try {
            $result = $this->ticketService->verifyTicket(
                $request->type,
                $request->reference,
                $request->qr_data
            );
            
            if ($result['valid']) {
                Log::info('Ticket verified successfully', [
                    'reference' => $request->reference,
                    'type' => $request->type
                ]);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Ticket is valid and authentic',
                    'booking' => $result['booking'],
                    'qr_info' => $result['qr_info'] ?? null,
                ]);
            } else {
                Log::warning('Ticket verification failed', [
                    'reference' => $request->reference,
                    'type' => $request->type,
                    'reason' => $result['message']
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => $result['message'],
                ], 400);
            }
            
        } catch (\Exception $e) {
            Log::error('Ticket verification error', [
                'reference' => $request->reference,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Verification failed: ' . $e->getMessage(),
            ], 500);
        }
    }
    
    /**
     * Quick verify - just check QR code validity
     */
    public function quickVerify(Request $request)
    {
        $request->validate([
            'qr_data' => 'required|string',
        ]);
        
        $qrInfo = $this->ticketService->verifyQrCode($request->qr_data);
        
        if ($qrInfo) {
            return response()->json([
                'success' => true,
                'data' => $qrInfo,
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'Invalid or tampered QR code',
        ], 400);
    }
}
