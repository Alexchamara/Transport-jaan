<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

// Override PHP settings for file uploads
ini_set('upload_max_filesize', '50M');
ini_set('post_max_size', '100M');
ini_set('max_file_uploads', '20');
ini_set('max_execution_time', '0');
ini_set('memory_limit', '512M');

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\RefreshSessionOnAuth::class,
            \App\Http\Middleware\EnsureVendorHasApprovedServiceAccess::class,
        ]);

        // Exclude specific URIs from CSRF verification
        $middleware->validateCsrfTokens(except: [
            'logout-alt',
            'csrf-token',
        ]);

        // Add CORS middleware to API routes
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
            'superadmin' => \App\Http\Middleware\SuperAdminMiddleware::class,
            'vendor.verified' => \App\Http\Middleware\VendorVerificationCheck::class,
            'vendor.service.approved' => \App\Http\Middleware\EnsureVendorHasApprovedServiceAccess::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
