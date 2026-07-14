@component('mail::message')
# New Booking Received

Hi {{ $vendorName }},

You've received a new **{{ ucfirst($bookingKind) }}** vehicle booking.

- **Reference:** {{ $bookingRef }}
- **Vehicle:** {{ $vehicleName }}
- **Customer:** {{ $clientName }}
- **Dates:** {{ $pickupAt }} &rarr; {{ $dropoffAt }}
- **Total:** {{ $currency }} {{ $totalAmount }}

@component('mail::button', ['url' => $actionUrl])
View Booking
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent
