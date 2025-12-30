# Auto-Fix GitHub Authentication
# This script will open all pages and provide exact values

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "GitHub Auth Auto-Fix Script" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

# Store credentials
$clientId = "Ov23libXyrlVAl14z2Fe"
$clientSecret = "a5e1f2c808036afff849ab573de7291b9bf077d0"
$callbackUrl = "https://embujgkwtuazdcmodqst.supabase.co/auth/v1/callback"
$homepageUrl = "http://localhost:4323"

Write-Host "[STEP 1] GitHub OAuth App Setup" -ForegroundColor Yellow
Write-Host "`nOpening GitHub OAuth Apps..." -ForegroundColor Gray
Start-Process "https://github.com/settings/developers"

Write-Host "`nYour GitHub OAuth App should have:" -ForegroundColor White
Write-Host "Homepage URL: $homepageUrl" -ForegroundColor Green
Write-Host "Callback URL: $callbackUrl" -ForegroundColor Green
Write-Host "`nClient ID: $clientId" -ForegroundColor Cyan
Write-Host "Client Secret: $clientSecret" -ForegroundColor Cyan

# Copy callback URL
Set-Clipboard -Value $callbackUrl
Write-Host "`n[OK] Callback URL copied to clipboard!" -ForegroundColor Green

Read-Host "`nPress ENTER to continue to Supabase setup"

Write-Host "`n[STEP 2] Enable GitHub in Supabase" -ForegroundColor Yellow
Write-Host "`nOpening Supabase Authentication Providers..." -ForegroundColor Gray
Start-Process "https://embujgkwtuazdcmodqst.supabase.co/project/_/auth/providers"

Write-Host "`n>>> IMPORTANT: Follow these EXACT steps:" -ForegroundColor Red
Write-Host "`n1. Scroll down and find 'GitHub'" -ForegroundColor White
Write-Host "2. Click the toggle switch (should turn GREEN)" -ForegroundColor White
Write-Host "3. Enter Client ID (copying to clipboard now...)" -ForegroundColor White

# Copy Client ID
Set-Clipboard -Value $clientId
Start-Sleep -Seconds 2
Write-Host "   [OK] Client ID in clipboard: $clientId" -ForegroundColor Green
Write-Host "   Paste it now, then press ENTER here" -ForegroundColor Yellow
Read-Host

Write-Host "`n4. Enter Client Secret (copying to clipboard now...)" -ForegroundColor White
# Copy Client Secret
Set-Clipboard -Value $clientSecret
Start-Sleep -Seconds 2
Write-Host "   [OK] Client Secret in clipboard: $clientSecret" -ForegroundColor Green
Write-Host "   Paste it now" -ForegroundColor Yellow

Read-Host "`n5. Did you click SAVE at the bottom? (Press ENTER after saving)"

Write-Host "`n[STEP 3] Configure Redirect URLs" -ForegroundColor Yellow
Write-Host "`nOpening Supabase URL Configuration..." -ForegroundColor Gray
Start-Process "https://embujgkwtuazdcmodqst.supabase.co/project/_/auth/url-configuration"

$redirectUrls = @"
http://localhost:4323/admin
http://localhost:4323/admin/login
"@

Set-Clipboard -Value $redirectUrls
Write-Host "`n[OK] Redirect URLs copied to clipboard!" -ForegroundColor Green

Write-Host "`n>>> In Supabase URL Configuration:" -ForegroundColor Red
Write-Host "1. Site URL: http://localhost:4323" -ForegroundColor White
Write-Host "2. Paste redirect URLs (in clipboard)" -ForegroundColor White
Write-Host "3. Click SAVE" -ForegroundColor White

Read-Host "`nPress ENTER after saving redirect URLs"

Write-Host "`n[STEP 4] Test Login" -ForegroundColor Yellow
Write-Host "`nOpening login page..." -ForegroundColor Gray
Start-Sleep -Seconds 2
Start-Process "http://localhost:4323/admin/login"

Write-Host "`n======================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "`nClick 'Continue with GitHub' to test" -ForegroundColor Yellow
Write-Host "`nIf you still get an error, the GitHub provider" -ForegroundColor Red
Write-Host "was NOT actually enabled. You MUST:" -ForegroundColor Red
Write-Host "1. Toggle the switch to GREEN" -ForegroundColor White
Write-Host "2. Fill in BOTH credentials" -ForegroundColor White
Write-Host "3. Click SAVE button" -ForegroundColor White
Write-Host "4. Wait for success message" -ForegroundColor White
Write-Host "`n" -ForegroundColor White
