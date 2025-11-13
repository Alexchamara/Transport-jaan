@component('mail::message')
# Booking Update

Hi {{ $user->name }},

Your booking **#{{ $booking->id }}** for **{{ $vehicle->manufacturer ?? '' }} {{ $vehicle->model ?? '' }}** is affected because the vehicle will be **inactive for maintenance** from **{{ \Carbon\Carbon::parse($start)->toFormattedDateString() }}** to **{{ \Carbon\Carbon::parse($end)->toFormattedDateString() }}**.

**Reason:** {{ $reason }}

You can book another available vehicle instead during those dates.

@component('mail::button', ['url' => $altUrl])
See Available Vehicles
@endcomponent

Sorry for the inconvenience, and thank you for understanding.

Thanks,<br>
{{ config('app.name') }}
@endcomponent
