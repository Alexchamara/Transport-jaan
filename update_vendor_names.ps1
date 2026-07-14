# Script to update hardcoded vendor names to use authenticated user data

$files = Get-ChildItem -Path "d:\work\Transport-jaan\resources\js\Pages\Web\components\vendors" -Recurse -Filter "*.jsx" |
    Where-Object { (Get-Content $_.FullName -Raw) -match "Steve Gibson" }

$updatedCount = 0
$errorCount = 0

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw
        $originalContent = $content
        $modified = $false

        # Check if file already has usePage import
        if ($content -notmatch "usePage.*@inertiajs/react") {
            # Add usePage to existing React import or create new import
            if ($content -match 'import\s+React[^;]*from\s+"react";') {
                # Has React import, add usePage import after it
                $content = $content -replace '(import\s+React[^;]*from\s+"react";)', "`$1`nimport { usePage } from `"@inertiajs/react`";"
                $modified = $true
            }
            elseif ($content -match 'import.*from\s+"react";') {
                # Has some React import
                $content = $content -replace '(import.*from\s+"react";)', "`$1`nimport { usePage } from `"@inertiajs/react`";"
                $modified = $true
            }
        }

        # Find the main component function and add user extraction
        # Pattern: export default function ComponentName() { or const ComponentName = () => {
        if ($content -match '((?:export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{|const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{))') {
            $componentStart = $matches[1]

            # Check if user extraction already exists
            if ($content -notmatch 'const\s+\{\s*auth\s*\}\s*=\s*usePage\(\)\.props') {
                # Add user extraction right after component declaration
                $userExtraction = "`n  const { auth } = usePage().props;`n  const user = auth?.user;`n"
                $content = $content -replace '((?:export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{|const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{))', "`$1$userExtraction"
                $modified = $true
            }
        }

        # Replace "Steve Gibson" with dynamic user name in JSX
        if ($content -match '<h1[^>]*>Steve Gibson</h1>') {
            $content = $content -replace '<h1([^>]*)>Steve Gibson</h1>', '<h1$1>{user?.name || ''Vendor''}</h1>'
            $modified = $true
        }

        # Replace in text content
        if ($content -match '>Steve Gibson<') {
            $content = $content -replace '>Steve Gibson<', '>{user?.name || ''Vendor''}<'
            $modified = $true
        }

        # Update: Steve Gibson in template literals or strings (calendar data, etc.)
        # Skip these as they might be customer/booking data

        if ($modified) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            $updatedCount++
            Write-Host "Updated: $($file.FullName)" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "Error updating $($file.FullName): $_" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "Files updated: $updatedCount" -ForegroundColor Green
Write-Host "Errors: $errorCount" -ForegroundColor Red
