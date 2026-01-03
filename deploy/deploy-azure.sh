#!/bin/bash

# PhotoStack Azure Deployment Script
# Run: chmod +x deploy.sh && ./deploy.sh

set -e

# Configuration
RESOURCE_GROUP="photostack-rg"
LOCATION="uksouth"
APP_SERVICE_PLAN="photostack-plan"
BACKEND_APP="photostack-api"
STORAGE_ACCOUNT="photostackstorage"
COGNITIVE_NAME="photostack-cognitive"

echo "🚀 Starting PhotoStack Azure Deployment..."

# Login check
echo "📋 Checking Azure login..."
az account show > /dev/null 2>&1 || az login

# Create Resource Group
echo "📦 Creating Resource Group..."
az group create --name $RESOURCE_GROUP --location $LOCATION --output none

# Create App Service Plan (Free tier)
echo "📋 Creating App Service Plan..."
az appservice plan create \
    --name $APP_SERVICE_PLAN \
    --resource-group $RESOURCE_GROUP \
    --sku F1 \
    --is-linux \
    --output none

# Create Backend Web App
echo "🖥️ Creating Backend App Service..."
az webapp create \
    --name $BACKEND_APP \
    --resource-group $RESOURCE_GROUP \
    --plan $APP_SERVICE_PLAN \
    --runtime "NODE:20-lts" \
    --output none

# Configure Backend Environment Variables
echo "⚙️ Configuring Backend Environment..."
az webapp config appsettings set \
    --name $BACKEND_APP \
    --resource-group $RESOURCE_GROUP \
    --settings \
        NODE_ENV=production \
        WEBSITE_NODE_DEFAULT_VERSION=~20 \
    --output none

# Create Cognitive Services
echo "🧠 Creating Cognitive Services..."
az cognitiveservices account create \
    --name $COGNITIVE_NAME \
    --resource-group $RESOURCE_GROUP \
    --kind ComputerVision \
    --sku F0 \
    --location $LOCATION \
    --yes \
    --output none || echo "Cognitive Services may already exist or F0 tier unavailable"

# Get Cognitive Services details
COGNITIVE_ENDPOINT=$(az cognitiveservices account show \
    --name $COGNITIVE_NAME \
    --resource-group $RESOURCE_GROUP \
    --query "properties.endpoint" -o tsv 2>/dev/null || echo "")

COGNITIVE_KEY=$(az cognitiveservices account keys list \
    --name $COGNITIVE_NAME \
    --resource-group $RESOURCE_GROUP \
    --query "key1" -o tsv 2>/dev/null || echo "")

# Get Storage Connection String
STORAGE_CONNECTION=$(az storage account show-connection-string \
    --name $STORAGE_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --query connectionString -o tsv)

echo ""
echo "✅ Azure Resources Created!"
echo ""
echo "📝 Add these to your backend .env or App Service Configuration:"
echo "=============================================================="
echo "AZURE_COGNITIVE_ENDPOINT=$COGNITIVE_ENDPOINT"
echo "AZURE_COGNITIVE_KEY=$COGNITIVE_KEY"
echo "AZURE_STORAGE_CONNECTION_STRING=$STORAGE_CONNECTION"
echo ""
echo "🌐 Backend URL: https://$BACKEND_APP.azurewebsites.net"
echo ""
echo "📤 Next Steps:"
echo "1. Deploy backend: az webapp deploy --src-path ./backend --name $BACKEND_APP --resource-group $RESOURCE_GROUP"
echo "2. Create Static Web App in Azure Portal for frontend"
echo "3. Update frontend VITE_API_URL to: https://$BACKEND_APP.azurewebsites.net/api"
