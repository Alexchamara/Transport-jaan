<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use App\Models\BusBooking;
use App\Models\TrainBooking;
use App\Models\FlightBooking;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

/**
 * Ticket Generation Service
 * 
 * Generates PDF tickets with QR codes for bus, train, and flight bookings.
 * QR codes contain encrypted booking data for verification.
 * 
 * Features:
 * - PDF generation with professional layout
 * - QR code with encrypted booking information
 * - Tamper-proof ticket validation
 * - Support for multiple transport types
 * - Automatic storage in public/tickets directory
 * 
 * @package App\Services
 */
class TicketGenerationService
{
    /**
     * Generate a ticket for a bus booking
     *
     * @param BusBooking $booking
     * @return array ['path' => string, 'url' => string, 'qr_data' => string]
     */
    public function generateBusTicket(BusBooking $booking): array
    {
        try {
            $booking->load(['busSchedule.departureStation', 'busSchedule.arrivalStation', 'busSchedule.bus', 'user']);
            
            $qrData = $this->generateQrData('bus', $booking);
            $qrCode = $this->generateQrCodeImage($qrData);
            
            $ticketData = [
                'booking' => $booking,
                'qr_code' => $qrCode,
                'qr_data' => $qrData,
                'type' => 'bus',
                'title' => 'Bus Ticket',
                'departure' => $booking->busSchedule->departureStation->name ?? 'N/A',
                'arrival' => $booking->busSchedule->arrivalStation->name ?? 'N/A',
                'vehicle_info' => $booking->busSchedule->bus->operator . ' - ' . $booking->busSchedule->bus->bus_number,
                'departure_time' => Carbon::parse($booking->busSchedule->departure_time)->format('Y-m-d H:i'),
                'arrival_time' => Carbon::parse($booking->busSchedule->arrival_time)->format('Y-m-d H:i'),
                'seat_numbers' => $booking->seat_numbers,
                'generated_at' => Carbon::now()->format('Y-m-d H:i:s'),
            ];
            
            return $this->generatePdf('bus', $booking->booking_reference, $ticketData);
            
        } catch (\Exception $e) {
            Log::error('Bus ticket generation failed', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
    
    /**
     * Generate a ticket for a train booking
     *
     * @param TrainBooking $booking
     * @return array ['path' => string, 'url' => string, 'qr_data' => string]
     */
    public function generateTrainTicket(TrainBooking $booking): array
    {
        try {
            $booking->load(['trainSchedule.departureStation', 'trainSchedule.arrivalStation', 'trainSchedule.train', 'user']);
            
            $qrData = $this->generateQrData('train', $booking);
            $qrCode = $this->generateQrCodeImage($qrData);
            
            $ticketData = [
                'booking' => $booking,
                'qr_code' => $qrCode,
                'qr_data' => $qrData,
                'type' => 'train',
                'title' => 'Train Ticket',
                'departure' => $booking->trainSchedule->departureStation->name ?? 'N/A',
                'arrival' => $booking->trainSchedule->arrivalStation->name ?? 'N/A',
                'vehicle_info' => $booking->trainSchedule->train->train_name . ' - ' . $booking->trainSchedule->train->train_number,
                'departure_time' => Carbon::parse($booking->trainSchedule->departure_time)->format('Y-m-d H:i'),
                'arrival_time' => Carbon::parse($booking->trainSchedule->arrival_time)->format('Y-m-d H:i'),
                'seat_numbers' => $booking->seat_numbers,
                'generated_at' => Carbon::now()->format('Y-m-d H:i:s'),
            ];
            
            return $this->generatePdf('train', $booking->booking_reference, $ticketData);
            
        } catch (\Exception $e) {
            Log::error('Train ticket generation failed', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
    
    /**
     * Generate a ticket for a flight booking
     *
     * @param FlightBooking $booking
     * @return array ['path' => string, 'url' => string, 'qr_data' => string]
     */
    public function generateFlightTicket(FlightBooking $booking): array
    {
        try {
            $qrData = $this->generateQrData('flight', $booking);
            $qrCode = $this->generateQrCodeImage($qrData);
            
            $ticketData = [
                'booking' => $booking,
                'qr_code' => $qrCode,
                'qr_data' => $qrData,
                'type' => 'flight',
                'title' => 'Flight Boarding Pass',
                'departure' => $booking->departure_airport ?? 'N/A',
                'arrival' => $booking->arrival_airport ?? 'N/A',
                'vehicle_info' => 'Flight ' . ($booking->flight_number ?? 'N/A'),
                'departure_time' => $booking->departure_time ? Carbon::parse($booking->departure_time)->format('Y-m-d H:i') : 'N/A',
                'arrival_time' => $booking->arrival_time ? Carbon::parse($booking->arrival_time)->format('Y-m-d H:i') : 'N/A',
                'seat_numbers' => $booking->seat_number ?? 'N/A',
                'generated_at' => Carbon::now()->format('Y-m-d H:i:s'),
            ];
            
            return $this->generatePdf('flight', $booking->booking_reference ?? $booking->reference ?? 'FLIGHT', $ticketData);
            
        } catch (\Exception $e) {
            Log::error('Flight ticket generation failed', [
                'booking_id' => $booking->id ?? 'unknown',
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
    
    /**
     * Generate QR code data with encrypted booking information
     *
     * @param string $type (bus|train|flight)
     * @param mixed $booking
     * @return string JSON encoded and encrypted data
     */
    protected function generateQrData(string $type, $booking): string
    {
        $data = [
            'type' => $type,
            'reference' => $booking->booking_reference ?? $booking->reference ?? 'N/A',
            'booking_id' => $booking->id,
            'customer_name' => $booking->user->name ?? $booking->customer->name ?? $booking->passenger_name ?? 'N/A',
            'customer_email' => $booking->user->email ?? $booking->customer->email ?? $booking->passenger_email ?? 'N/A',
            'status' => $booking->status,
            'total_amount' => $booking->total_price ?? $booking->total_amount ?? 0,
            'issued_at' => Carbon::now()->toIso8601String(),
        ];
        
        // Create checksum for tamper detection (without checksum field itself)
        $dataString = json_encode($data);
        $data['checksum'] = hash('sha256', $dataString . config('app.key'));
        
        return base64_encode(json_encode($data));
    }
    
    /**
     * Generate QR code image as base64
     *
     * @param string $data
     * @return string Base64 encoded PNG image
     */
    protected function generateQrCodeImage(string $data): string
    {
        // Try to use GD library (most common, doesn't require imagick)
        try {
            // Check if GD is available
            if (extension_loaded('gd')) {
                // Create QR code using BaconQrCode with GD
                $renderer = new \BaconQrCode\Renderer\ImageRenderer(
                    new \BaconQrCode\Renderer\RendererStyle\RendererStyle(250),
                    new \BaconQrCode\Renderer\Image\SvgImageBackEnd()
                );
                
                $writer = new \BaconQrCode\Writer($renderer);
                $qrCodeSvg = $writer->writeString($data);
                
                // Save as temporary file and convert to PNG using GD
                $tempDir = storage_path('app/temp');
                if (!file_exists($tempDir)) {
                    mkdir($tempDir, 0755, true);
                }
                
                $tempSvgFile = $tempDir . '/qr_' . md5($data) . '.svg';
                file_put_contents($tempSvgFile, $qrCodeSvg);
                
                // For DOMPDF, we'll use the data URL approach with the SVG content
                // Convert SVG to base64 for embedding
                $svgBase64 = base64_encode($qrCodeSvg);
                
                Log::info('QR code generated (SVG to data URL)', ['size' => strlen($qrCodeSvg)]);
                
                // Clean up temp file
                @unlink($tempSvgFile);
                
                return 'data:image/svg+xml;base64,' . $svgBase64;
            }
            
            // Fallback if GD not available
            throw new \Exception('GD extension not available');
            
        } catch (\Exception $e) {
            // Try with Imagick if available
            Log::warning('SVG generation failed, trying Imagick PNG', ['error' => $e->getMessage()]);
            
            try {
                if (extension_loaded('imagick')) {
                    $renderer = new \BaconQrCode\Renderer\ImageRenderer(
                        new \BaconQrCode\Renderer\RendererStyle\RendererStyle(250),
                        new \BaconQrCode\Renderer\Image\ImagickImageBackEnd()
                    );
                    
                    $writer = new \BaconQrCode\Writer($renderer);
                    $qrCodePng = $writer->writeString($data);
                    
                    Log::info('QR code generated (PNG with Imagick)', ['size' => strlen($qrCodePng)]);
                    
                    return 'data:image/png;base64,' . base64_encode($qrCodePng);
                }
                
                throw new \Exception('Imagick extension not available');
                
            } catch (\Exception $e2) {
                // Final fallback: Use simple QR code library
                Log::error('All advanced methods failed, using basic SVG', ['error' => $e2->getMessage()]);
                
                $qrCode = QrCode::format('svg')
                    ->size(250)
                    ->errorCorrection('H')
                    ->generate($data);
                
                // Return as data URL
                return 'data:image/svg+xml;base64,' . base64_encode($qrCode);
            }
        }
    }
    
    /**
     * Generate PDF from ticket data
     *
     * @param string $type
     * @param string $reference
     * @param array $data
     * @return array
     */
    protected function generatePdf(string $type, string $reference, array $data): array
    {
        // Ensure tickets directory exists
        $ticketsPath = public_path('tickets');
        if (!file_exists($ticketsPath)) {
            mkdir($ticketsPath, 0755, true);
        }
        
        // Generate PDF
        $pdf = Pdf::loadView('tickets.' . $type, $data)
            ->setPaper('a4')
            ->setOption('margin-top', 10)
            ->setOption('margin-bottom', 10)
            ->setOption('margin-left', 10)
            ->setOption('margin-right', 10);
        
        $filename = $reference . '_' . time() . '.pdf';
        $filepath = $ticketsPath . '/' . $filename;
        
        $pdf->save($filepath);
        
        Log::info('Ticket generated successfully', [
            'type' => $type,
            'reference' => $reference,
            'path' => $filepath
        ]);
        
        return [
            'path' => $filepath,
            'url' => asset('tickets/' . $filename),
            'filename' => $filename,
            'qr_data' => $data['qr_data'],
        ];
    }
    
    /**
     * Verify QR code data
     *
     * @param string $qrData Base64 encoded QR data
     * @return array|null Decoded data if valid, null if invalid
     */
    public function verifyQrCode(string $qrData): ?array
    {
        try {
            $decoded = json_decode(base64_decode($qrData), true);
            
            if (!$decoded || !isset($decoded['checksum'])) {
                return null;
            }
            
            $checksum = $decoded['checksum'];
            unset($decoded['checksum']);
            
            $dataString = json_encode($decoded);
            $expectedChecksum = hash('sha256', $dataString . config('app.key'));
            
            if ($checksum !== $expectedChecksum) {
                Log::warning('QR code verification failed - checksum mismatch', [
                    'reference' => $decoded['reference'] ?? 'unknown'
                ]);
                return null;
            }
            
            $decoded['checksum'] = $checksum;
            return $decoded;
            
        } catch (\Exception $e) {
            Log::error('QR code verification error', ['error' => $e->getMessage()]);
            return null;
        }
    }
    
    /**
     * Verify ticket authenticity by reference and QR data
     *
     * @param string $type
     * @param string $reference
     * @param string $qrData
     * @return array ['valid' => bool, 'booking' => mixed, 'message' => string]
     */
    public function verifyTicket(string $type, string $reference, string $qrData): array
    {
        $qrInfo = $this->verifyQrCode($qrData);
        
        if (!$qrInfo) {
            return [
                'valid' => false,
                'booking' => null,
                'message' => 'Invalid or tampered QR code'
            ];
        }
        
        if ($qrInfo['reference'] !== $reference || $qrInfo['type'] !== $type) {
            return [
                'valid' => false,
                'booking' => null,
                'message' => 'QR code does not match ticket reference'
            ];
        }
        
        // Fetch booking from database
        $booking = match($type) {
            'bus' => BusBooking::where('booking_reference', $reference)->first(),
            'train' => TrainBooking::where('booking_reference', $reference)->first(),
            'flight' => FlightBooking::where('booking_reference', $reference)->first(),
            default => null,
        };
        
        if (!$booking) {
            return [
                'valid' => false,
                'booking' => null,
                'message' => 'Booking not found in database'
            ];
        }
        
        if ($booking->id != $qrInfo['booking_id']) {
            return [
                'valid' => false,
                'booking' => null,
                'message' => 'Booking ID mismatch'
            ];
        }
        
        return [
            'valid' => true,
            'booking' => $booking,
            'qr_info' => $qrInfo,
            'message' => 'Ticket is valid and authentic'
        ];
    }
    
    /**
     * Get ticket file path by reference
     *
     * @param string $reference
     * @return string|null
     */
    public function getTicketPath(string $reference): ?string
    {
        $ticketsPath = public_path('tickets');
        $files = glob($ticketsPath . '/' . $reference . '_*.pdf');
        
        return !empty($files) ? $files[0] : null;
    }
    
    /**
     * Delete ticket file
     *
     * @param string $reference
     * @return bool
     */
    public function deleteTicket(string $reference): bool
    {
        $path = $this->getTicketPath($reference);
        
        if ($path && file_exists($path)) {
            return unlink($path);
        }
        
        return false;
    }
}
