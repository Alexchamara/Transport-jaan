<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Override PHP settings for file uploads
        ini_set('upload_max_filesize', '50M');
        ini_set('post_max_size', '100M');
        ini_set('max_file_uploads', '20');
        ini_set('max_execution_time', '0');
        ini_set('memory_limit', '512M');
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        
        $this->app['router']->aliasMiddleware('role', \App\Http\Middleware\CheckRole::class);
    }
}
