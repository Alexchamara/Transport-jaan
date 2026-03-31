Warehouse booking
    - npm install react-toastify

icket generation system with PDF and QR codes
    composer require barryvdh/laravel-dompdf simplesoftwareio/simple-qrcode

RABC depencency:
    composer require spatie/laravel-permission

    php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider" --tag="permission-config" && php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider" --tag="permission-migrations"


.env =====================================>

ZOHO_CLIENT_ID=1000.HQHOL1211FBHHU0MMQXOJ4JZI6BM1P
ZOHO_CLIENT_SECRET=9b28df527f31c834c7d93118d0289a78ea236cfa26
ZOHO_REFRESH_TOKEN=1000.c3ab43eba974eecedd67c787c452fbe4.b41bcb47a8852c62aa88273a292f44fd
ZOHO_ACCOUNT_ID=3299935000000008002
ZOHO_FROM_ADDRESS=no.reply@xsarva.com
ZOHO_FROM_NAME=XSarva

MAIL_MAILER=smtp
MAIL_HOST=smtp.zoho.com
MAIL_PORT=465
MAIL_SCHEME=smtps
MAIL_USERNAME=no.reply@xsarva.com
MAIL_PASSWORD=3JUaJDFJsBrk
MAIL_FROM_ADDRESS=no.reply@xsarva.com
MAIL_FROM_NAME="XSarva"

# Google Map API Key
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBWjVf-wK6rdmSON8eOXJCgxq2MI10QasE 

# City Search API (Vendor Profile)
VITE_CITY_SEARCH_API_URL=https://nominatim.openstreetmap.org/search
VITE_CITY_SEARCH_LIMIT=8

# Courier break-glass alert channels
COURIER_BREAK_GLASS_ALERT_EMAILS=
COURIER_BREAK_GLASS_WEBHOOK_URL=
