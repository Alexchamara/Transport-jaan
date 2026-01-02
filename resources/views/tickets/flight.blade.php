<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Boarding Pass - {{ $booking->reference }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            color: #333;
            line-height: 1.4;
        }
        
        .boarding-pass {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #dc2626;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            margin-bottom: 5px;
        }
        
        .header .subtitle {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .reference-bar {
            background: #7f1d1d;
            color: white;
            padding: 10px 20px;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            letter-spacing: 2px;
        }
        
        .pass-body {
            display: table;
            width: 100%;
        }
        
        .left-section {
            display: table-cell;
            width: 65%;
            padding: 20px;
            vertical-align: top;
        }
        
        .right-section {
            display: table-cell;
            width: 35%;
            padding: 20px;
            border-left: 2px dashed #cbd5e1;
            text-align: center;
            vertical-align: top;
            background: #fef2f2;
        }
        
        .info-row {
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #fee2e2;
        }
        
        .info-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        
        .info-label {
            font-size: 10px;
            color: #dc2626;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 3px;
        }
        
        .info-value {
            font-size: 14px;
            font-weight: bold;
            color: #1e293b;
        }
        
        .flight-route {
            background: #fef2f2;
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 15px;
        }
        
        .route-display {
            display: table;
            width: 100%;
        }
        
        .airport-info {
            display: table-cell;
            width: 45%;
        }
        
        .route-divider {
            display: table-cell;
            width: 10%;
            text-align: center;
            vertical-align: middle;
        }
        
        .plane-icon {
            font-size: 24px;
            color: #dc2626;
        }
        
        .airport-code {
            font-size: 32px;
            font-weight: bold;
            color: #991b1b;
            margin-bottom: 5px;
        }
        
        .airport-name {
            font-size: 12px;
            color: #64748b;
        }
        
        .time-large {
            font-size: 20px;
            font-weight: bold;
            color: #1e293b;
            margin-top: 8px;
        }
        
        .gate-section {
            background: #fef3c7;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 15px;
        }
        
        .gate-info {
            display: table;
            width: 100%;
        }
        
        .gate-item {
            display: table-cell;
            width: 50%;
            text-align: center;
        }
        
        .gate-label {
            font-size: 10px;
            color: #92400e;
            margin-bottom: 5px;
        }
        
        .gate-value {
            font-size: 24px;
            font-weight: bold;
            color: #78350f;
        }
        
        .qr-section h3 {
            font-size: 12px;
            color: #dc2626;
            margin-bottom: 10px;
        }
        
        .qr-code {
            margin: 10px auto;
            max-width: 200px;
        }
        
        .qr-code img {
            width: 100%;
            height: auto;
        }
        
        .scan-instruction {
            font-size: 9px;
            color: #64748b;
            margin-top: 10px;
            line-height: 1.3;
        }
        
        .passenger-box {
            background: #fee2e2;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 15px;
        }
        
        .footer {
            background: #fef2f2;
            padding: 15px 20px;
            border-top: 2px solid #fee2e2;
            text-align: center;
        }
        
        .footer-notice {
            font-size: 9px;
            color: #64748b;
            line-height: 1.4;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .status-confirmed {
            background: #dcfce7;
            color: #166534;
        }
        
        .status-pending {
            background: #fef3c7;
            color: #92400e;
        }
        
        .grid-2 {
            display: table;
            width: 100%;
        }
        
        .grid-col {
            display: table-cell;
            width: 50%;
            padding-right: 10px;
        }
        
        .grid-col:last-child {
            padding-right: 0;
            padding-left: 10px;
        }
        
        .warning-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 10px;
            margin-top: 15px;
            font-size: 10px;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="boarding-pass">
        <!-- Header -->
        <div class="header">
            <h1>✈️ BOARDING PASS</h1>
            <div class="subtitle">Transport-Jaan Airways - Flying High Together</div>
        </div>
        
        <!-- Reference Bar -->
        <div class="reference-bar">
            CONFIRMATION: {{ $booking->reference }}
        </div>
        
        <!-- Body -->
        <div class="pass-body">
            <!-- Left Section -->
            <div class="left-section">
                <!-- Flight Route -->
                <div class="flight-route">
                    <div class="route-display">
                        <div class="airport-info">
                            <div class="airport-code">{{ $departure }}</div>
                            <div class="airport-name">Departure</div>
                            <div class="time-large">{{ $departure_time }}</div>
                        </div>
                        <div class="route-divider">
                            <div class="plane-icon">✈</div>
                        </div>
                        <div class="airport-info">
                            <div class="airport-code">{{ $arrival }}</div>
                            <div class="airport-name">Arrival</div>
                            <div class="time-large">{{ $arrival_time }}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Gate & Seat Section -->
                <div class="gate-section">
                    <div class="gate-info">
                        <div class="gate-item">
                            <div class="gate-label">SEAT</div>
                            <div class="gate-value">{{ $seat_numbers }}</div>
                        </div>
                        <div class="gate-item">
                            <div class="gate-label">GATE</div>
                            <div class="gate-value">-</div>
                        </div>
                    </div>
                </div>
                
                <!-- Passenger Info -->
                <div class="passenger-box">
                    <div class="info-row">
                        <div class="info-label">Passenger Name</div>
                        <div class="info-value">{{ $booking->passenger_name ?? 'N/A' }}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Contact</div>
                        <div class="info-value">{{ $booking->passenger_email ?? 'N/A' }}</div>
                    </div>
                </div>
                
                <!-- Flight Details Grid -->
                <div class="grid-2">
                    <div class="grid-col">
                        <div class="info-row">
                            <div class="info-label">Flight Number</div>
                            <div class="info-value">{{ $vehicle_info }}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Ticket Price</div>
                            <div class="info-value">LKR {{ number_format($booking->total_price ?? 0, 2) }}</div>
                        </div>
                    </div>
                    <div class="grid-col">
                        <div class="info-row">
                            <div class="info-label">Status</div>
                            <div class="info-value">
                                <span class="status-badge status-{{ $booking->status }}">{{ ucfirst($booking->status) }}</span>
                            </div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Booking Date</div>
                            <div class="info-value">{{ \Carbon\Carbon::parse($booking->created_at)->format('Y-m-d H:i') }}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Warning Box -->
                <div class="warning-box">
                    <strong>⚠️ Check-in Reminder:</strong> Please complete online check-in 24 hours before departure. 
                    Arrive at airport 3 hours before international flights, 2 hours before domestic flights.
                </div>
            </div>
            
            <!-- Right Section (QR Code) -->
            <div class="right-section">
                <div class="qr-section">
                    <h3>BOARDING PASS QR</h3>
                    <div class="qr-code">
                        <img src="{{ $qr_code }}" alt="Boarding Pass QR" style="width: 200px; height: 200px; display: block; margin: 0 auto;">
                    </div>
                    <div class="scan-instruction">
                        Scan this code at security checkpoints and boarding gate. Keep this pass accessible throughout your journey.
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-notice">
                <strong>Important:</strong> This is your boarding pass. Printed or digital version must be presented at check-in, 
                security, and boarding gate. Valid photo ID required. Baggage allowance and terms apply as per fare conditions.
                <br><br>
                Issued: {{ $generated_at }} | Customer Care: +94 11 773 5000 | Email: flights@transport-jaan.com
            </div>
        </div>
    </div>
</body>
</html>
