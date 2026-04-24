Warehouse booking
    - npm install react-toastify

ticket generation system with PDF and QR codes
    composer require barryvdh/laravel-dompdf simplesoftwareio/simple-qrcode

RABC depencency:
    composer require spatie/laravel-permission

    php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider" --tag="permission-config" && php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider" --tag="permission-migrations"

Pricing import adapter depencency:
    composer require phpoffice/phpspreadsheet smalot/pdfparser --no-interaction

Global dashboard search (Scout + Meilisearch):

    composer require spatie/laravel-permission:^7.2 --no-interaction
    composer require spatie/laravel-permission:^6.25 --no-interaction
    php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider" --force

    composer require laravel/scout
    php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"

    # Start Meilisearch (choose one)
    brew install meilisearch
    meilisearch

    # or Docker
    docker run -it --rm -p 7700:7700 -e MEILI_NO_ANALYTICS=true getmeili/meilisearch:latest

    # Recommended .env values
    SCOUT_DRIVER=meilisearch
    MEILISEARCH_HOST=http://127.0.0.1:7700
    MEILISEARCH_KEY=
    SCOUT_QUEUE=false

    # Optional bulk reindex for global dashboard search models
    php artisan scout:flush "App\Models\Courier\CourierShipment"
    php artisan scout:flush "App\Models\Courier\CourierVendorCodCapability"
    php artisan scout:flush "App\Models\User"
    php artisan scout:flush "App\Models\Booking"
    php artisan scout:flush "App\Models\AirVehicleBookings"
    php artisan scout:flush "App\Models\SeaVehicleBookings"
    php artisan scout:flush "App\Models\TrainBooking"
    php artisan scout:flush "App\Models\BusBooking"
    php artisan scout:flush "App\Models\FlightBooking"
    php artisan scout:flush "App\Models\Warehouse\WarehouseBooking"

    php artisan scout:import "App\Models\Courier\CourierShipment"
    php artisan scout:import "App\Models\Courier\CourierVendorCodCapability"
    php artisan scout:import "App\Models\User"
    php artisan scout:import "App\Models\Booking"
    php artisan scout:import "App\Models\AirVehicleBookings"
    php artisan scout:import "App\Models\SeaVehicleBookings"
    php artisan scout:import "App\Models\TrainBooking"
    php artisan scout:import "App\Models\BusBooking"
    php artisan scout:import "App\Models\FlightBooking"
    php artisan scout:import "App\Models\Warehouse\WarehouseBooking"


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

# Courier payments (PayHere)
COURIER_PAYMENTS_ENABLED=true

COURIER_PAYHERE_ENABLED=true
PAYHERE_MERCHANT_ID=1234045
PAYHERE_MERCHANT_SECRET=MzcxMDA1Njc1ODIyOTI2MzA5NTEyNjE1MzUxOTQzODUwNTcwMjA2
PAYHERE_NOTIFY_SECRET=MzcxMDA1Njc1ODIyOTI2MzA5NTEyNjE1MzUxOTQzODUwNTcwMjA2
PAYHERE_APP_ID=4OVycDliqjA4JH5EsPS2c43LM
PAYHERE_APP_SECRET=8MQsBRKL8ny4qD9ihNJz5E4uPZ8FyqMHk4qC4HcmqN0d
PAYHERE_SANDBOX=true
PAYHERE_CHECKOUT_BASE_URL=https://sandbox.payhere.lk/pay/checkout
