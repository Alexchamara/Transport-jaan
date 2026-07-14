<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flight Booking Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            background: #286BB6;
            color: white;
            padding: 20px;
            text-align: center;
            margin: -30px -30px 30px -30px;
            border-radius: 10px 10px 0 0;
        }
        .booking-details {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            border-bottom: 1px solid #eee;
            padding-bottom: 8px;
        }
        .label {
            font-weight: bold;
            color: #286BB6;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Flight Booking Confirmation</h1>
            <p>Thank you for your flight booking request!</p>
        </div>

        <p>Dear {{ $booking->name }},</p>

        <p>We have received your flight booking request and our team will review it shortly. Below are the details of your booking:</p>

        <div class="booking-details">
            <h3>Booking Details</h3>

            <div class="detail-row">
                <span class="label">Booking ID:</span>
                <span>#{{ $booking->id }}</span>
            </div>

            <div class="detail-row">
                <span class="label">Name:</span>
                <span>{{ $booking->name }}</span>
            </div>

            <div class="detail-row">
                <span class="label">Email:</span>
                <span>{{ $booking->email }}</span>
            </div>

            <div class="detail-row">
                <span class="label">Phone:</span>
                <span>{{ $booking->phone }}</span>
            </div>

            <div class="detail-row">
                <span class="label">Subject:</span>
                <span>{{ $booking->subject }}</span>
            </div>

            <div class="detail-row">
                <span class="label">Trip Type:</span>
                <span>{{ ucfirst($booking->trip_type) }}</span>
            </div>

            <div class="detail-row">
                <span class="label">Departure Airport:</span>
                <span>{{ $booking->departure_airport }}</span>
            </div>

            <div class="detail-row">
                <span class="label">Arriving Airport:</span>
                <span>{{ $booking->arriving_airport }}</span>
            </div>

            <div class="detail-row">
                <span class="label">Departure Date:</span>
                <span>{{ $booking->departure_date->format('F j, Y') }}</span>
            </div>

            @if($booking->return_date)
            <div class="detail-row">
                <span class="label">Return Date:</span>
                <span>{{ $booking->return_date->format('F j, Y') }}</span>
            </div>
            @endif

            @if($booking->special_requests)
            <div class="detail-row">
                <span class="label">Special Requests:</span>
                <span>{{ $booking->special_requests }}</span>
            </div>
            @endif

            <div class="detail-row">
                <span class="label">Status:</span>
                <span>{{ ucfirst($booking->status) }}</span>
            </div>

            <div class="detail-row">
                <span class="label">Submitted:</span>
                <span>{{ $booking->created_at->format('F j, Y \a\t g:i A') }}</span>
            </div>
        </div>

        <p><strong>What's Next?</strong></p>
        <ul>
            <li>Our team will review your booking request within 24 hours</li>
            <li>We will contact you via phone or email to confirm availability and pricing</li>
            <li>Once confirmed, we will provide you with detailed booking information and payment instructions</li>
        </ul>

        <p>If you have any questions or need to make changes to your booking, please contact us immediately.</p>

        <div class="footer">
            <p>Thank you for choosing Transport Jaan!</p>
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
