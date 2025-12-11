<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Your Bus Ticket</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #0955AC 0%, #074489 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f8f9fa;
            padding: 30px;
            border: 1px solid #dee2e6;
            border-top: none;
        }
        .booking-ref {
            background: white;
            padding: 15px;
            border-left: 4px solid #0955AC;
            margin: 20px 0;
            font-size: 18px;
            font-weight: bold;
        }
        .details {
            background: white;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .details table {
            width: 100%;
            border-collapse: collapse;
        }
        .details td {
            padding: 10px;
            border-bottom: 1px solid #dee2e6;
        }
        .details td:first-child {
            font-weight: bold;
            color: #0955AC;
            width: 40%;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            background: #0955AC;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚌 Your Bus Ticket</h1>
        <p>Transport-Jaan - Your Journey, Our Priority</p>
    </div>

    <div class="content">
        <p>Dear {{ $booking->passenger_name }},</p>
        
        <p>Thank you for booking with Transport-Jaan! Your bus ticket is attached to this email.</p>

        <div class="booking-ref">
            Booking Reference: {{ $reference }}
        </div>

        <div class="details">
            <table>
                <tr>
                    <td>From</td>
                    <td>{{ $booking->busSchedule->departureStation->name }}</td>
                </tr>
                <tr>
                    <td>To</td>
                    <td>{{ $booking->busSchedule->arrivalStation->name }}</td>
                </tr>
                <tr>
                    <td>Date</td>
                    <td>{{ \Carbon\Carbon::parse($booking->busSchedule->date)->format('j M Y') }}</td>
                </tr>
                <tr>
                    <td>Departure Time</td>
                    <td>{{ \Carbon\Carbon::parse($booking->busSchedule->departure_time)->format('g:i A') }}</td>
                </tr>
                <tr>
                    <td>Seat Numbers</td>
                    <td>{{ is_array($booking->seat_numbers) ? implode(', ', $booking->seat_numbers) : $booking->seat_numbers }}</td>
                </tr>
                <tr>
                    <td>Bus Operator</td>
                    <td>{{ $booking->busSchedule->bus->operator }}</td>
                </tr>
                <tr>
                    <td>Total Amount</td>
                    <td>LKR {{ number_format($booking->total_price, 2) }}</td>
                </tr>
            </table>
        </div>

        <h3>Important Information:</h3>
        <ul>
            <li>Please arrive at the bus station at least 30 minutes before departure.</li>
            <li>Present this ticket (attached PDF) at the boarding point.</li>
            <li>Your booking reference is: <strong>{{ $reference }}</strong></li>
            <li>Luggage allowance: 2 pieces per passenger, not exceeding 20kg total.</li>
        </ul>

        <div style="text-align: center;">
            <a href="{{ config('app.url') }}" class="button">Visit Transport-Jaan</a>
        </div>
    </div>

    <div class="footer">
        <p>
            For support, contact us at support@transport-jaan.com<br>
            Tel: +94 11 234 5678
        </p>
        <p>
            &copy; {{ date('Y') }} Transport-Jaan. All rights reserved.
        </p>
    </div>
</body>
</html>
