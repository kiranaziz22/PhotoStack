# PhotoStack Azure Deployment (PowerShell)
# Run: .\deploy-azure.ps1

$ErrorActionPreference = "Stop"

# Configuration
$RESOURCE_GROUP = "photostack-rg"
$LOCATION = "uksouth"
$APP_SERVICE_PLAN = "photostack-plan"
$BACKEND_APP = "photostack-api"
$STORAGE_ACCOUNT = "photostackstorage"
$COGNITIVE_NAME = "photostack-cognitive"

Write-Host "🚀 Starting PhotoStack Azure Deployment..." -ForegroundColor Cyan

# Login check
Write-Host "📋 Checking Azure login..." -ForegroundColor Yellow
try {
    az account show 2>$null | Out-Null
} catch {
    az login
}

# Create Resource Group
Write-Host "📦 Creating Resource Group..." -ForegroundColor Yellow
az group create --name $RESOURCE_GROUP --location $LOCATION --output none

# Create App Service Plan (Free tier)
Write-Host "📋 Creating App Service Plan..." -ForegroundColor Yellow
az appservice plan create `
    --name $APP_SERVICE_PLAN `
    --resource-group $RESOURCE_GROUP `
    --sku F1 `
    --is-linux `
    --output none

# Create Backend Web App
Write-Host "🖥️ Creating Backend App Service..." -ForegroundColor Yellow
az webapp create `
    --name $BACKEND_APP `
    --resource-group $RESOURCE_GROUP `
    --plan $APP_SERVICE_PLAN `
    --runtime "NODE:20-lts" `
    --output none

# Configure Backend Environment Variables
Write-Host "⚙️ Configuring Backend Environment..." -ForegroundColor Yellow
az webapp config appsettings set `
    --name $BACKEND_APP `
    --resource-group $RESOURCE_GROUP `
    --settings NODE_ENV=production WEBSITE_NODE_DEFAULT_VERSION="~20" `
    --output none

# Create Cognitive Services
Write-Host "🧠 Creating Cognitive Services..." -ForegroundColor Yellow
try {
    az cognitiveservices account create `
        --name $COGNITIVE_NAME `
        --resource-group $RESOURCE_GROUP `
        --kind ComputerVision `
        --sku F0 `
        --location $LOCATION `
        --yes `
        --output none
} catch {
    Write-Host "Cognitive Services may already exist or F0 tier unavailable" -ForegroundColor DarkYellow
}

# Get Cognitive Services details
try {
    $COGNITIVE_ENDPOINT = az cognitiveservices account show `
        --name $COGNITIVE_NAME `
        --resource-group $RESOURCE_GROUP `
        --query "properties.endpoint" -o tsv
    
    $COGNITIVE_KEY = az cognitiveservices account keys list `
        --name $COGNITIVE_NAME `
        --resource-group $RESOURCE_GROUP `
        --query "key1" -o tsv
} catch {
    $COGNITIVE_ENDPOINT = ""
    $COGNITIVE_KEY = ""
}

# Get Storage Connection String
$STORAGE_CONNECTION = az storage account show-connection-string `
    --name $STORAGE_ACCOUNT `
    --resource-group $RESOURCE_GROUP `
    --query connectionString -o tsv

Write-Host ""
Write-Host "✅ Azure Resources Created!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Add these to your backend .env or App Service Configuration:" -ForegroundColor Cyan
Write-Host "==============================================================" -ForegroundColor Cyan
Write-Host "AZURE_COGNITIVE_ENDPOINT=$COGNITIVE_ENDPOINT"
Write-Host "AZURE_COGNITIVE_KEY=$COGNITIVE_KEY"
Write-Host "AZURE_STORAGE_CONNECTION_STRING=$STORAGE_CONNECTION"
Write-Host ""
Write-Host "🌐 Backend URL: https://$BACKEND_APP.azurewebsites.net" -ForegroundColor Green
Write-Host ""
Write-Host "📤 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Configure App Service settings in Azure Portal"
Write-Host "2. Deploy backend using VS Code Azure Extension or GitHub Actions"
Write-Host "3. Create Static Web App in Azure Portal for frontend"
Write-Host "4. Update frontend VITE_API_URL to: https://$BACKEND_APP.azurewebsites.net/api"

# Save configuration to file
$config = @"
# PhotoStack Azure Configuration
# Generated: $(Get-Date)

AZURE_COGNITIVE_ENDPOINT=$COGNITIVE_ENDPOINT
AZURE_COGNITIVE_KEY=$COGNITIVE_KEY
AZURE_STORAGE_CONNECTION_STRING=$STORAGE_CONNECTION
BACKEND_URL=https://$BACKEND_APP.azurewebsites.net
"@

$config | Out-File -FilePath "azure-config.txt"
Write-Host ""
Write-Host "💾 Configuration saved to azure-config.txt" -ForegroundColor Green
