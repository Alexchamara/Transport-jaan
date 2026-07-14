<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            padding: 0;
            font-family: "DejaVu Sans", Arial, sans-serif;
            color: #111827;
        }
        .label {
            width: 100%;
            height: 100%;
            padding: 12px;
            position: relative;
        }
        .label-background {
            position: absolute;
            inset: 0;
            background-size: cover;
            background-position: center;
            opacity: 0.1;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
        }
        .tracking {
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        .service {
            font-size: 12px;
            text-transform: uppercase;
            font-weight: 600;
            color: #374151;
        }
        .section {
            margin-top: 10px;
        }
        .section-title {
            font-size: 10px;
            text-transform: uppercase;
            color: #6B7280;
            margin-bottom: 4px;
        }
        .address {
            font-size: 12px;
            line-height: 1.4;
        }
        .row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
        }
        .block {
            flex: 1;
        }
        .qr {
            width: 90px;
            height: 90px;
        }
        .meta {
            font-size: 11px;
            color: #4B5563;
        }
        .barcode {
            margin-top: 8px;
            font-size: 12px;
            letter-spacing: 1px;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="label">
        @if(!empty($backgroundUrl))
            <div class="label-background" style="background-image: url('{{ $backgroundUrl }}');"></div>
        @endif

        <div class="header">
            <div>
                <div class="tracking">{{ $payload['trackingNumber'] ?? '' }}</div>
                <div class="service">{{ $payload['serviceLevel'] ?? '' }}</div>
                <div class="barcode">{{ $payload['reference'] ?? '' }}</div>
            </div>
            @if(!empty($payload['qrCode']))
                <img class="qr" src="{{ $payload['qrCode'] }}" alt="QR" />
            @endif
        </div>

        <div class="section">
            <div class="section-title">From</div>
            <div class="address">
                <strong>{{ $payload['sender']['name'] ?? '' }}</strong><br />
                {{ $payload['sender']['company'] ?? '' }}<br />
                {{ $payload['sender']['address']['line1'] ?? '' }}<br />
                {{ $payload['sender']['address']['line2'] ?? '' }}
                {{ $payload['sender']['address']['city'] ?? '' }}
                {{ $payload['sender']['address']['state'] ?? '' }}
                {{ $payload['sender']['address']['postalCode'] ?? '' }}<br />
                {{ $payload['sender']['address']['country'] ?? '' }}<br />
                {{ $payload['sender']['phone'] ?? '' }}
            </div>
        </div>

        <div class="section">
            <div class="section-title">To</div>
            <div class="address">
                <strong>{{ $payload['recipient']['name'] ?? '' }}</strong><br />
                {{ $payload['recipient']['company'] ?? '' }}<br />
                {{ $payload['recipient']['address']['line1'] ?? '' }}<br />
                {{ $payload['recipient']['address']['line2'] ?? '' }}
                {{ $payload['recipient']['address']['city'] ?? '' }}
                {{ $payload['recipient']['address']['state'] ?? '' }}
                {{ $payload['recipient']['address']['postalCode'] ?? '' }}<br />
                {{ $payload['recipient']['address']['country'] ?? '' }}<br />
                {{ $payload['recipient']['phone'] ?? '' }}
            </div>
        </div>

        <div class="section">
            <div class="row">
                <div class="block">
                    <div class="section-title">Package</div>
                    <div class="meta">
                        {{ $payload['package']['type'] ?? '' }}
                        @if(!empty($payload['package']['weightKg']))
                            | {{ $payload['package']['weightKg'] }} kg
                        @endif
                        @if(!empty($payload['package']['dimensions']['lengthCm']))
                            | {{ $payload['package']['dimensions']['lengthCm'] }}x{{ $payload['package']['dimensions']['widthCm'] }}x{{ $payload['package']['dimensions']['heightCm'] }} cm
                        @endif
                    </div>
                </div>
                <div class="block">
                    <div class="section-title">Generated</div>
                    <div class="meta">{{ $payload['generatedAt'] ?? '' }}</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
