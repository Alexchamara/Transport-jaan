<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; font-family: "DejaVu Sans", Arial, sans-serif; color: #0f172a; font-size: 10px; }
        .sheet { width: 100%; min-height: 100%; padding: 4mm; }
        .header { border: 0.25mm solid #64748b; border-radius: 1.5mm; padding: 3mm; margin-bottom: 3mm; }
        .title { font-size: 14px; font-weight: 700; color: #1e3a8a; }
        .meta { margin-top: 2mm; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2mm; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 0.2mm solid #94a3b8; padding: 1.4mm 1mm; text-align: left; font-size: 9px; }
        th { background: #e2e8f0; font-weight: 700; }
    </style>
</head>
<body>
<div class="sheet">
    <div class="header">
        <div class="title">MANIFEST / BATCH SHEET</div>
        <div class="meta">
            <div><strong>Batch:</strong> {{ $payload['batchNumber'] ?? ($payload['trackingNumber'] ?? '-') }}</div>
            <div><strong>Route:</strong> {{ $payload['routeCode'] ?? '-' }}</div>
            <div><strong>Date:</strong> {{ $payload['issuedDate'] ?? now()->format('Y-m-d') }}</div>
        </div>
    </div>

    <table>
        <thead>
        <tr>
            <th>Tracking</th>
            <th>Sender</th>
            <th>Receiver</th>
            <th>City</th>
            <th>Weight</th>
            <th>COD</th>
        </tr>
        </thead>
        <tbody>
        <tr>
            <td>{{ $payload['trackingNumber'] ?? '-' }}</td>
            <td>{{ $payload['sender']['name'] ?? '-' }}</td>
            <td>{{ $payload['recipient']['name'] ?? '-' }}</td>
            <td>{{ $payload['nearestCity'] ?? '-' }}</td>
            <td>{{ isset($payload['weightKg']) ? number_format((float) $payload['weightKg'], 2) . ' kg' : '-' }}</td>
            <td>{{ $payload['codAmount'] !== null ? number_format((float) $payload['codAmount'], 2) . ' ' . ($payload['currencyCode'] ?? 'LKR') : '-' }}</td>
        </tr>
        </tbody>
    </table>
</div>
</body>
</html>
