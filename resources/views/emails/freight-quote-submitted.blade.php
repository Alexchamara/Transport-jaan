<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Freight Quote Request</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
            padding: 20px;
        }
        
        .email-container {
            max-width: 700px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .quote-id {
            background: rgba(255, 255, 255, 0.2);
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        
        .content {
            padding: 40px;
        }
        
        .route-section {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .route {
            font-size: 20px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
        }
        
        .route-arrow {
            background: rgba(255, 255, 255, 0.3);
            padding: 8px 12px;
            border-radius: 50px;
            font-size: 16px;
        }
        
        .details-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin-bottom: 30px;
        }
        
        .detail-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            transition: all 0.2s ease;
        }
        
        .detail-card:hover {
            background: #f1f5f9;
            border-color: #cbd5e1;
            transform: translateY(-1px);
        }
        
        .detail-label {
            font-size: 12px;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }
        
        .detail-value {
            font-size: 16px;
            font-weight: 600;
            color: #1e293b;
            word-break: break-word;
        }
        
        .dimensions {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
        }
        
        .dimension-item {
            background: #e0e7ff;
            color: #3730a3;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 600;
        }
        
        .notes-section {
            background: #fefce8;
            border: 1px solid #fde047;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }
        
        .notes-section h3 {
            color: #a16207;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .notes-content {
            color: #a16207;
            font-size: 15px;
            line-height: 1.6;
        }
        
        .status-footer {
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            padding: 25px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #065f46;
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-icon {
            width: 20px;
            height: 20px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }
        
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
            margin: 30px 0;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            
            .content {
                padding: 20px;
            }
            
            .header {
                padding: 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .route {
                font-size: 18px;
                flex-direction: column;
                gap: 10px;
            }
            
            .details-grid {
                grid-template-columns: 1fr;
                gap: 15px;
            }
            
            .dimensions {
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>New Freight Quote Request</h1>
            <div class="quote-id">Quote #{{ $quote->id }}</div>
        </div>
        
        <div class="content">
            <div class="route-section">
                <div class="route">
                    <span>{{ $quote->origin }}</span>
                    <div class="route-arrow">→</div>
                    <span>{{ $quote->destination }}</span>
                </div>
            </div>
            
            <div class="details-grid">
                <div class="detail-card">
                    <div class="detail-label">Load Type</div>
                    <div class="detail-value">{{ $quote->load_type }}</div>
                </div>
                
                <div class="detail-card">
                    <div class="detail-label">Goods Description</div>
                    <div class="detail-value">{{ $quote->goods_description }}</div>
                </div>
                
                <div class="detail-card">
                    <div class="detail-label">Dimensions (cm)</div>
                    <div class="detail-value">
                        <div class="dimensions">
                            <div class="dimension-item">L: {{ $quote->length_cm ?? '-' }}</div>
                            <div class="dimension-item">W: {{ $quote->width_cm ?? '-' }}</div>
                            <div class="dimension-item">H: {{ $quote->height_cm ?? '-' }}</div>
                        </div>
                    </div>
                </div>
                
                <div class="detail-card">
                    <div class="detail-label">Total Weight</div>
                    <div class="detail-value">{{ rtrim(rtrim(number_format($quote->total_weight_kg, 2, '.', ''), '0'), '.') }} kg</div>
                </div>
                
                <div class="detail-card">
                    <div class="detail-label">Preferred Method</div>
                    <div class="detail-value">{{ $quote->preferred_method }}</div>
                </div>
                
                <div class="detail-card">
                    <div class="detail-label">Shipping Date</div>
                    <div class="detail-value">{{ \Illuminate\Support\Carbon::parse($quote->shipping_date)->toFormattedDateString() }}</div>
                </div>
            </div>
            
            @if($quote->notes)
            <div class="notes-section">
                <h3>Additional Notes</h3>
                <div class="notes-content">{{ $quote->notes }}</div>
            </div>
            @endif
        </div>
        
        <div class="status-footer">
            <div class="status-badge">
                <div class="status-icon">✓</div>
                Status: {{ ucfirst($quote->status) }}
            </div>
        </div>
    </div>
</body>
</html>