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
            color: #1e293b;
            font-size: 8.8px;
            line-height: 1.2;
        }

        .sheet {
            width: 100%;
            min-height: 100%;
            padding: 2mm;
        }

        .copy {
            border: 0.25mm solid #6b7e99;
            border-radius: 1.2mm;
            overflow: hidden;
        }

        .copy:last-child {
            margin-bottom: 0;
        }

        .header {
            height: 18mm;
            border-bottom: 0.2mm solid #8ea0b7;
            display: table;
            width: 100%;
            table-layout: fixed;
        }

        .header-left,
        .header-right {
            display: table-cell;
            vertical-align: top;
            padding: 1.5mm;
        }

        .header-left {
            width: 58%;
            border-right: 0.2mm solid #8ea0b7;
        }

        .header-right {
            width: 42%;
            text-align: right;
        }

        .brand-name {
            font-weight: 700;
            font-size: 6.8mm;
            color: #21428c;
            line-height: 1;
            margin-bottom: 0.8mm;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .brand-line {
            color: #334155;
            font-size: 8px;
            line-height: 1.2;
            max-height: 6.2mm;
            overflow: hidden;
        }

        .pod-title {
            font-size: 5.2mm;
            font-weight: 700;
            letter-spacing: 0.4px;
            color: #314a73;
            line-height: 1;
            margin-bottom: 1mm;
        }

        .qr {
            width: 16.5mm;
            height: 16.5mm;
            object-fit: contain;
        }

        .content {
            height: 39mm;
            display: table;
            width: 100%;
            table-layout: fixed;
        }

        .content-left,
        .content-right {
            display: table-cell;
            vertical-align: top;
            padding: 1.5mm;
            border-top: 0.2mm solid #8ea0b7;
        }

        .content-left {
            width: 58%;
            border-right: 0.2mm solid #8ea0b7;
        }

        .content-right {
            width: 42%;
        }

        .row {
            display: table;
            width: 100%;
            table-layout: fixed;
            margin-bottom: 1.2mm;
        }

        .key,
        .value {
            display: table-cell;
            vertical-align: top;
        }

        .key {
            width: 33%;
            font-weight: 700;
            color: #243b61;
            white-space: nowrap;
        }

        .value {
            width: 67%;
            color: #0f172a;
            word-break: break-word;
            max-height: 5.6mm;
            overflow: hidden;
        }

        .value.long {
            max-height: 7.5mm;
        }

        .signature-box {
            margin-top: 1.2mm;
            border-top: 0.2mm solid #a0aec0;
            padding-top: 1mm;
        }

        .sig-line {
            border-bottom: 0.2mm solid #9fb0c4;
            height: 4.8mm;
        }

        .description {
            height: 6mm;
            border-top: 0.2mm solid #8ea0b7;
            padding: 1mm 1.5mm;
            display: table;
            width: 100%;
            table-layout: fixed;
        }

        .description .key { width: 20%; }
        .description .value {
            width: 80%;
            max-height: 4mm;
            overflow: hidden;
        }

        .footer {
            height: 9mm;
            border-top: 0.2mm solid #8ea0b7;
            display: table;
            width: 100%;
            table-layout: fixed;
            padding: 0 1.2mm;
        }

        .barcode-wrap {
            display: table-cell;
            width: 78%;
            vertical-align: middle;
            padding-right: 1mm;
        }

        .footer-qr-wrap {
            display: table-cell;
            width: 22%;
            vertical-align: middle;
            text-align: right;
        }

        .barcode {
            width: 100%;
            height: 7.2mm;
            object-fit: contain;
        }

        .track {
            font-weight: 700;
            font-size: 4mm;
            letter-spacing: 0.4px;
            color: #1e3558;
            margin-top: 0.2mm;
        }

        .qr-small {
            width: 7.6mm;
            height: 7.6mm;
            object-fit: contain;
        }
    </style>
</head>
<body>
<div class="sheet">
    @php
        $copyCount = (int) ($layout['copyCount'] ?? 2);
        $copyHeightMm = (float) ($layout['copyHeightMm'] ?? 74);
        $verticalGapMm = (float) ($layout['verticalGapMm'] ?? 4);
    @endphp

    @for ($copy = 0; $copy < $copyCount; $copy++)
        <div class="copy" style="height: {{ $copyHeightMm }}mm; margin-bottom: {{ $copy === $copyCount - 1 ? 0 : $verticalGapMm }}mm;">
            <div class="header">
                <div class="header-left">
                    <div class="brand-name">{{ $payload['brand']['name'] ?? 'Courier Service' }}</div>
                    <div class="brand-line">{{ $payload['brand']['address'] ?? '' }}</div>
                    <div class="brand-line">{{ $payload['brand']['contactLine'] ?? '' }}</div>
                </div>
                <div class="header-right">
                    @if (($schema['showProofOfDeliveryTitle'] ?? true) === true)
                        <div class="pod-title">PROOF OF DELIVERY</div>
                    @endif
                    @if (($schema['showQrCode'] ?? true) === true && !empty($payload['qrCode']))
                        <img class="qr" src="{{ $payload['qrCode'] }}" alt="QR" />
                    @endif
                </div>
            </div>

            <div class="content">
                <div class="content-left">
                    <div class="row"><div class="key">From:</div><div class="value">{{ $payload['sender']['name'] ?? '' }}</div></div>
                    <div class="row"><div class="key">Contact Number:</div><div class="value">{{ $payload['sender']['phone'] ?? '' }}</div></div>
                    <div class="row"><div class="key">Issued Date:</div><div class="value">{{ $payload['issuedDate'] ?? '' }}</div></div>
                    <div class="row"><div class="key">To:</div><div class="value">{{ $payload['recipient']['name'] ?? '' }}</div></div>
                    <div class="row"><div class="key">Address:</div><div class="value long">{{ $payload['recipient']['address'] ?? '' }}</div></div>
                    <div class="row"><div class="key">Phone 01:</div><div class="value">{{ $payload['recipient']['phonePrimary'] ?? '' }}</div></div>
                    <div class="row" style="margin-bottom:0;"><div class="key">Phone 02:</div><div class="value">{{ $payload['recipient']['phoneSecondary'] ?? '' }}</div></div>
                </div>

                <div class="content-right">
                    @if (($schema['showCodAmount'] ?? true) === true)
                        <div class="row"><div class="key">COD AMOUNT:</div><div class="value">{{ $payload['codAmount'] !== null ? number_format((float) $payload['codAmount'], 2) . ' ' . ($payload['currencyCode'] ?? 'LKR') : '-' }}</div></div>
                    @endif
                    @if (($schema['showOrderNumber'] ?? true) === true)
                        <div class="row"><div class="key">Order No:</div><div class="value">{{ $payload['orderNumber'] ?? '' }}</div></div>
                    @endif
                    @if (($schema['showWeight'] ?? true) === true)
                        <div class="row"><div class="key">Weight:</div><div class="value">{{ $payload['weightKg'] !== null ? number_format((float) $payload['weightKg'], 2) . ' kg' : '-' }}</div></div>
                    @endif
                    @if (($schema['showDistrict'] ?? true) === true)
                        <div class="row"><div class="key">District:</div><div class="value">{{ $payload['district'] ?? '' }}</div></div>
                    @endif
                    @if (($schema['showNearestCity'] ?? true) === true)
                        <div class="row"><div class="key">Nearest City:</div><div class="value">{{ $payload['nearestCity'] ?? '' }}</div></div>
                    @endif
                    <div class="row"><div class="key">Name:</div><div class="value">{{ $payload['pod']['receiverName'] ?? '' }}</div></div>
                    <div class="row"><div class="key">NIC Number:</div><div class="value">{{ $payload['pod']['receiverNic'] ?? ($payload['recipient']['nic'] ?? '') }}</div></div>
                    <div class="row"><div class="key">Date:</div><div class="value">{{ $payload['pod']['date'] ?? '' }}</div></div>
                    @if (($schema['showSignatureBlock'] ?? true) === true)
                        <div class="signature-box">
                            <div class="key" style="display:block; width:auto; margin-bottom:0.6mm;">Signature:</div>
                            <div class="sig-line"></div>
                        </div>
                    @endif
                </div>
            </div>

            @if (($schema['showDescription'] ?? true) === true)
                <div class="description">
                    <div class="key">Description:</div>
                    <div class="value">{{ $payload['description'] ?? '' }}</div>
                </div>
            @endif

            @if (($schema['showBarcode'] ?? true) === true && !empty($payload['code128Svg']))
                <div class="footer">
                    <div class="barcode-wrap">
                        <img class="barcode" src="{{ $payload['code128Svg'] }}" alt="Code128" />
                        <div class="track">{{ $payload['trackingNumber'] ?? '' }}</div>
                    </div>
                    <div class="footer-qr-wrap">
                        @if (($schema['showQrCode'] ?? true) === true && !empty($payload['qrCode']))
                            <img class="qr-small" src="{{ $payload['qrCode'] }}" alt="QR" />
                        @endif
                    </div>
                </div>
            @endif
        </div>
    @endfor
</div>
</body>
</html>
