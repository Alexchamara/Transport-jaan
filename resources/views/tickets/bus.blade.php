<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Bus Ticket - {{ $booking->reference }}</title>
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
        
        .ticket {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #2563eb;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
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
            background: #1e3a8a;
            color: white;
            padding: 10px 20px;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            letter-spacing: 2px;
        }
        
        .ticket-body {
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
            background: #f8fafc;
        }
        
        .info-row {
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .info-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        
        .info-label {
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 3px;
        }
        
        .info-value {
            font-size: 14px;
            font-weight: bold;
            color: #1e293b;
        }
        
        .route-section {
            background: #eff6ff;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 15px;
        }
        
        .route-display {
            display: table;
            width: 100%;
        }
        
        .route-point {
            display: table-cell;
            width: 45%;
        }
        
        .route-arrow {
            display: table-cell;
            width: 10%;
            text-align: center;
            vertical-align: middle;
            font-size: 20px;
            color: #2563eb;
        }
        
        .location {
            font-size: 16px;
            font-weight: bold;
            color: #1e293b;
        }
        
        .time {
            font-size: 12px;
            color: #64748b;
            margin-top: 3px;
        }
        
        .seats-section {
            background: #fef3c7;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 15px;
            text-align: center;
        }
        
        .seats-label {
            font-size: 10px;
            color: #92400e;
            margin-bottom: 5px;
        }
        
        .seats-numbers {
            font-size: 24px;
            font-weight: bold;
            color: #78350f;
            letter-spacing: 2px;
        }
        
        .qr-section h3 {
            font-size: 12px;
            color: #475569;
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
        
        .passenger-info {
            background: #f1f5f9;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 15px;
        }
        
        .footer {
            background: #f8fafc;
            padding: 15px 20px;
            border-top: 2px solid #e2e8f0;
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
        
        .divider {
            height: 1px;
            background: #e2e8f0;
            margin: 15px 0;
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
    </style>
</head>
<body>
    <div class="ticket">
        <!-- Header -->
        <div class="header">
            <h1>🚌 BUS TICKET</h1>
            <div class="subtitle">Transport-Jaan - Your Journey, Our Priority</div>
        </div>
        
        <!-- Reference Bar -->
        <div class="reference-bar">
            BOOKING REFERENCE: {{ $booking->booking_reference }}
        </div>
        
        <!-- Body -->
        <div class="ticket-body">
            <!-- Left Section -->
            <div class="left-section">
                <!-- Route Section -->
                <div class="route-section">
                    <div class="route-display">
                        <div class="route-point">
                            <div class="info-label">From</div>
                            <div class="location">{{ $departure }}</div>
                            <div class="time">{{ $departure_time }}</div>
                        </div>
                        <div class="route-arrow">&rarr;</div>
                        <div class="route-point">
                            <div class="info-label">To</div>
                            <div class="location">{{ $arrival }}</div>
                            <div class="time">{{ $arrival_time }}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Seats Section -->
                <div class="seats-section">
                    <div class="seats-label">SEAT NUMBER(S)</div>
                    <div class="seats-numbers">{{ is_array($seat_numbers) ? implode(', ', $seat_numbers) : $seat_numbers }}</div>
                </div>
                
                <!-- Passenger Info -->
                <div class="passenger-info">
                    <div class="info-row">
                        <div class="info-label">Passenger Name</div>
                        <div class="info-value">{{ $booking->user->name ?? $booking->passenger_name ?? 'N/A' }}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Contact</div>
                        <div class="info-value">{{ $booking->user->email ?? $booking->passenger_email ?? 'N/A' }}</div>
                    </div>
                </div>
                
                <!-- Booking Details Grid -->
                <div class="grid-2">
                    <div class="grid-col">
                        <div class="info-row">
                            <div class="info-label">Bus Operator</div>
                            <div class="info-value">{{ $vehicle_info }}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Total Amount</div>
                            <div class="info-value">LKR {{ number_format($booking->total_price ?? 0, 2) }}</div>
                        </div>
                    </div>
                    <div class="grid-col">
                        <div class="info-row">
                            <div class="info-label">Booking Status</div>
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
            </div>
            
            <!-- Right Section (QR Code) -->
            <div class="right-section">
                <div class="qr-section">
                    <h3>SCAN TO VERIFY</h3>
                    <div class="qr-code">
                        <img src="{{ $qr_code }}" alt="QR Code" style="width: 200px; height: 200px; display: block; margin: 0 auto;">
                    </div>
                    <div class="scan-instruction">
                        Scan this QR code at the boarding point for verification. This ticket is valid only for the specified date, time, and seats.
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-notice">
                <strong>Important Notice:</strong> Please arrive at the departure point at least 15 minutes before departure time. 
                This ticket is non-transferable. Present this ticket along with a valid ID at the time of boarding.
                <br><br>
                Generated: {{ $generated_at }} | For support: support@transport-jaan.com | Tel: +94 11 234 5678
            </div>
        </div>
    </div>
</body>
</html>
