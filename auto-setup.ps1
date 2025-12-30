# Flaco Admin Dashboard - Auto Setup Script
# PowerShell script for Windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Flaco Admin Dashboard - Auto Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: GitHub OAuth App
Write-Host "[Step 1/3] Creating GitHub OAuth App..." -ForegroundColor Yellow
Write-Host "`nOpening GitHub OAuth Apps page..." -ForegroundColor Gray
Start-Process "https://github.com/settings/developers"

Write-Host "`n>>> Click 'New OAuth App' and fill in:" -ForegroundColor Green
Write-Host ""
Write-Host "Application name: Flaco Admin Dashboard" -ForegroundColor White
Write-Host "Homepage URL: http://localhost:4322" -ForegroundColor White
Write-Host "Callback URL: https://embujgkwtuazdcmodqst.supabase.co/auth/v1/callback" -ForegroundColor White
Write-Host ""

# Copy callback URL to clipboard
Set-Clipboard -Value "https://embujgkwtuazdcmodqst.supabase.co/auth/v1/callback"
Write-Host "[OK] Callback URL copied to clipboard!" -ForegroundColor Green

Read-Host "`nPress ENTER after creating the OAuth app and copying Client ID + Secret"

# Step 2: Supabase GitHub Provider
Write-Host "`n[Step 2/3] Configuring Supabase..." -ForegroundColor Yellow
Write-Host "`nOpening Supabase Authentication Providers..." -ForegroundColor Gray
Start-Process "https://embujgkwtuazdcmodqst.supabase.co/project/_/auth/providers"

Write-Host "`n>>> In Supabase:" -ForegroundColor Green
Write-Host "1. Find 'GitHub' and toggle Enable" -ForegroundColor White
Write-Host "2. Paste your Client ID" -ForegroundColor White
Write-Host "3. Paste your Client Secret" -ForegroundColor White
Write-Host "4. Click 'Save'" -ForegroundColor White

Read-Host "`nPress ENTER after enabling GitHub provider"

# Step 3: Redirect URLs
Write-Host "`n[Step 3/3] Setting Redirect URLs..." -ForegroundColor Yellow
Write-Host "`nOpening Supabase URL Configuration..." -ForegroundColor Gray
Start-Process "https://embujgkwtuazdcmodqst.supabase.co/project/_/auth/url-configuration"

$redirectUrls = @"
http://localhost:4322/admin
http://localhost:4322/admin/login
"@

Set-Clipboard -Value $redirectUrls
Write-Host "`n[OK] Redirect URLs copied to clipboard!" -ForegroundColor Green

Write-Host "`n>>> In Supabase:" -ForegroundColor Green
Write-Host "1. Set Site URL: http://localhost:4322" -ForegroundColor White
Write-Host "2. Paste redirect URLs (already in clipboard)" -ForegroundColor White
Write-Host "3. Click 'Save'" -ForegroundColor White

Read-Host "`nPress ENTER after configuring redirect URLs"

# Test login
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup Complete! Opening login page..." -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Start-Sleep -Seconds 2
Start-Process "http://localhost:4322/admin/login"

Write-Host "[OK] Login page opened" -ForegroundColor Green
Write-Host "[OK] Click 'Continue with GitHub' to test" -ForegroundColor Green
Write-Host "`nIf login works, you're all set!`n" -ForegroundColor Yellow
