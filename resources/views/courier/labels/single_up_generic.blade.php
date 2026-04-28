<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; font-family: "DejaVu Sans", Arial, sans-serif; color: #0f172a; font-size: 10px; }
        .sheet { width: 100%; min-height: 100%; padding: 4mm; }
        .label { border: 0.25mm solid #64748b; border-radius: 1.5mm; padding: 3mm; }
        .top { display: flex; justify-content: space-between; gap: 6mm; }
        .title { font-size: 16px; font-weight: 700; color: #1e3a8a; }
        .muted { color: #475569; font-size: 9px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm 6mm; margin-top: 3mm; }
        .key { font-weight: 700; color: #334155; }
        .value { word-break: break-word; }
        .barcode { margin-top: 4mm; width: 100%; max-height: 17mm; object-fit: contain; }
        .qr { width: 20mm; height: 20mm; object-fit: contain; }
    </style>
</head>
<body>
<div class="sheet">
    <div class="label">
        <div class="top">
            <div>
                <div class="title">{{ strtoupper(str_replace('_', ' ', (string) ($template->label_type ?? 'LABEL'))) }}</div>
                <div class="muted">{{ $payload['brand']['name'] ?? 'Courier Service' }}</div>
                <div class="muted">{{ $payload['brand']['contactLine'] ?? '' }}</div>
            </div>
            @if (($schema['showQrCode'] ?? true) && !empty($payload['qrCode']))
                <img class="qr" src="{{ $payload['qrCode'] }}" alt="QR">
            @endif
        </div>

        <div class="grid">
            <div><span class="key">Tracking:</span> <span class="value">{{ $payload['trackingNumber'] ?? '-' }}</span></div>
            <div><span class="key">Order:</span> <span class="value">{{ $payload['orderNumber'] ?? '-' }}</span></div>
            <div><span class="key">From:</span> <span class="value">{{ $payload['sender']['name'] ?? '-' }}</span></div>
            <div><span class="key">To:</span> <span class="value">{{ $payload['recipient']['name'] ?? '-' }}</span></div>
            <div><span class="key">District:</span> <span class="value">{{ $payload['district'] ?? '-' }}</span></div>
            <div><span class="key">City:</span> <span class="value">{{ $payload['nearestCity'] ?? '-' }}</span></div>
            <div><span class="key">Weight:</span> <span class="value">{{ isset($payload['weightKg']) ? number_format((float) $payload['weightKg'], 2) . ' kg' : '-' }}</span></div>
            <div><span class="key">COD:</span> <span class="value">{{ $payload['codAmount'] !== null ? number_format((float) $payload['codAmount'], 2) . ' ' . ($payload['currencyCode'] ?? 'LKR') : '-' }}</span></div>
        </div>

        @if (($schema['showDescription'] ?? true) && !empty($payload['description']))
            <div style="margin-top: 3mm;">
                <span class="key">Description:</span>
                <span class="value">{{ $payload['description'] }}</span>
            </div>
        @endif

        @if (($schema['showBarcode'] ?? true) && !empty($payload['code128Svg']))
            <img class="barcode" src="{{ $payload['code128Svg'] }}" alt="Code128">
        @endif
    </div>
</div>
</body>
</html>
