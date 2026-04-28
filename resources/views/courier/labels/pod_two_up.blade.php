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
            color: #0f172a;
        }
        .sheet {
            width: 100%;
            min-height: 100%;
            padding: 5mm 4mm;
        }
        .copy {
            border: 0.3mm solid #64748b;
            border-radius: 2mm;
            padding: 2.5mm;
            height: 68mm;
            margin-bottom: 3mm;
        }
        .copy:last-child {
            margin-bottom: 0;
        }
        .row {
            display: table;
            width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
        }
        .cell {
            display: table-cell;
            vertical-align: top;
            border: 0.2mm solid #94a3b8;
            padding: 1.8mm;
            font-size: 9px;
            line-height: 1.25;
        }
        .left { width: 58%; }
        .right { width: 42%; }
        .header {
            border: 0.2mm solid #94a3b8;
            padding: 2mm;
            margin-bottom: 1.6mm;
        }
        .title {
            text-align: right;
            font-size: 16px;
            font-weight: 700;
            letter-spacing: 0.3px;
            color: #334155;
        }
        .brand {
            font-size: 14px;
            font-weight: 700;
            color: #1e3a8a;
        }
        .muted {
            color: #475569;
            font-size: 8px;
        }
        .field {
            margin-bottom: 1.8mm;
        }
        .field-label {
            font-weight: 700;
            color: #334155;
        }
        .signature-block .line {
            border-bottom: 0.2mm solid #94a3b8;
            min-height: 4.5mm;
            margin-bottom: 1.2mm;
        }
        .barcode {
            width: 100%;
            height: 20mm;
            object-fit: contain;
        }
        .qr {
            width: 18mm;
            height: 18mm;
            object-fit: contain;
        }
    </style>
</head>
<body>
<div class="sheet">
    @for ($copy = 0; $copy < 2; $copy++)
        <div class="copy">
            <div class="row" style="margin-bottom: 1.8mm;">
                <div class="cell left" style="border-right: 0;">
                    <div class="brand">{{ $payload['brand']['name'] ?? 'Courier Service' }}</div>
                    <div class="muted">{{ $payload['brand']['address'] ?? '' }}</div>
                    <div class="muted">{{ $payload['brand']['contactLine'] ?? '' }}</div>
                </div>
                <div class="cell right" style="border-left: 0; text-align:right;">
                    @if (($schema['showProofOfDeliveryTitle'] ?? true) === true)
                        <div class="title">PROOF OF DELIVERY</div>
                    @endif
                    @if (($schema['showQrCode'] ?? true) === true && !empty($payload['qrCode']))
                        <img class="qr" src="{{ $payload['qrCode'] }}" alt="QR" />
                    @endif
                </div>
            </div>

            <div class="row">
                <div class="cell left">
                    <div class="field"><span class="field-label">From:</span> {{ $payload['sender']['name'] ?? '' }}</div>
                    <div class="field"><span class="field-label">Contact Number:</span> {{ $payload['sender']['phone'] ?? '' }}</div>
                    <div class="field"><span class="field-label">Issued Date:</span> {{ $payload['issuedDate'] ?? '' }}</div>
                    <div class="field"><span class="field-label">To:</span> {{ $payload['recipient']['name'] ?? '' }}</div>
                    <div class="field"><span class="field-label">Address:</span> {{ $payload['recipient']['address'] ?? '' }}</div>
                    <div class="field"><span class="field-label">Phone 01:</span> {{ $payload['recipient']['phonePrimary'] ?? '' }}</div>
                    <div class="field"><span class="field-label">Phone 02:</span> {{ $payload['recipient']['phoneSecondary'] ?? '' }}</div>
                    @if (($schema['showDescription'] ?? true) === true)
                        <div class="field"><span class="field-label">Description:</span> {{ $payload['description'] ?? '' }}</div>
                    @endif
                </div>
                <div class="cell right">
                    @if (($schema['showCodAmount'] ?? true) === true)
                        <div class="field"><span class="field-label">COD AMOUNT:</span> {{ $payload['codAmount'] !== null ? number_format((float) $payload['codAmount'], 2) . ' ' . ($payload['currencyCode'] ?? 'LKR') : '-' }}</div>
                    @endif
                    @if (($schema['showOrderNumber'] ?? true) === true)
                        <div class="field"><span class="field-label">Order No:</span> {{ $payload['orderNumber'] ?? '' }}</div>
                    @endif
                    @if (($schema['showWeight'] ?? true) === true)
                        <div class="field"><span class="field-label">Weight:</span> {{ $payload['weightKg'] !== null ? number_format((float) $payload['weightKg'], 2) . ' kg' : '-' }}</div>
                    @endif
                    @if (($schema['showDistrict'] ?? true) === true)
                        <div class="field"><span class="field-label">District:</span> {{ $payload['district'] ?? '' }}</div>
                    @endif
                    @if (($schema['showNearestCity'] ?? true) === true)
                        <div class="field"><span class="field-label">Nearest City:</span> {{ $payload['nearestCity'] ?? '' }}</div>
                    @endif
                    <div class="field"><span class="field-label">Name:</span> {{ $payload['pod']['receiverName'] ?? '' }}</div>
                    <div class="field"><span class="field-label">NIC Number:</span> {{ $payload['pod']['receiverNic'] ?? ($payload['recipient']['nic'] ?? '') }}</div>
                    <div class="field"><span class="field-label">Date:</span> {{ $payload['pod']['date'] ?? '' }}</div>
                    @if (($schema['showSignatureBlock'] ?? true) === true)
                        <div class="signature-block">
                            <div class="field-label">Signature:</div>
                            <div class="line"></div>
                        </div>
                    @endif
                </div>
            </div>

            @if (($schema['showBarcode'] ?? true) === true && !empty($payload['code128Svg']))
                <div style="margin-top: 1.8mm; border: 0.2mm solid #94a3b8; padding: 1mm;">
                    <img class="barcode" src="{{ $payload['code128Svg'] }}" alt="Code128" />
                </div>
            @endif
        </div>
    @endfor
</div>
</body>
</html>
