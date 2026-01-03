# PhotoStack - Build and Deploy to Azure App Service
# This script builds the frontend and prepares for deployment

Write-Host "🚀 PhotoStack Deployment Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Step 1: Build Frontend
Write-Host "`n📦 Building Frontend..." -ForegroundColor Yellow
Set-Location -Path "frontend"

# Install dependencies if needed
if (!(Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Gray
    npm install
}

# Build the React app
npm run build

if (!(Test-Path "dist")) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend built successfully!" -ForegroundColor Green

# Step 2: Copy build to backend/public
Write-Host "`n📁 Copying frontend build to backend..." -ForegroundColor Yellow
Set-Location -Path ".."

# Remove old public folder if exists
if (Test-Path "backend/public") {
    Remove-Item -Path "backend/public" -Recurse -Force
}

# Copy dist to backend/public
Copy-Item -Path "frontend/dist" -Destination "backend/public" -Recurse

Write-Host "✅ Frontend copied to backend/public!" -ForegroundColor Green

# Step 3: Create deployment package
Write-Host "`n📦 Creating deployment package..." -ForegroundColor Yellow
Set-Location -Path "backend"

# Create zip for deployment (excluding node_modules and .env)
$excludeFiles = @("node_modules", ".env", "*.log")
$deployFolder = "../deploy-package"

if (Test-Path $deployFolder) {
    Remove-Item -Path $deployFolder -Recurse -Force
}

New-Item -ItemType Directory -Path $deployFolder -Force | Out-Null

# Copy all files except excluded
Get-ChildItem -Path "." -Exclude $excludeFiles | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $deployFolder -Recurse -Force
}

Write-Host "✅ Deployment package created!" -ForegroundColor Green

Set-Location -Path ".."

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ BUILD COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "`n📤 Next Steps to Deploy:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 1: VS Code Azure Extension (Recommended)" -ForegroundColor White
Write-Host "  1. Install 'Azure App Service' extension in VS Code"
Write-Host "  2. Right-click on 'backend' folder"
Write-Host "  3. Select 'Deploy to Web App...'"
Write-Host "  4. Choose 'photostack-api'"
Write-Host ""
Write-Host "Option 2: Azure CLI" -ForegroundColor White
Write-Host "  cd backend"
Write-Host "  az webapp up --name photostack-api --resource-group photostack-rg"
Write-Host ""
Write-Host "Option 3: ZIP Deploy" -ForegroundColor White
Write-Host "  1. Zip the 'deploy-package' folder"
Write-Host "  2. Go to Azure Portal > photostack-api > Deployment Center"
Write-Host "  3. Use 'Local Git' or 'Manual deploy' option"
Write-Host ""
Write-Host "🌐 Your app will be at: https://photostack-api.azurewebsites.net" -ForegroundColor Green
