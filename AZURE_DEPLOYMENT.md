# PhotoStack - Azure Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Azure Cloud                               │
│                                                                  │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   Static     │     │    App       │     │   Cosmos DB  │    │
│  │   Web Apps   │────▶│   Service    │────▶│  (MongoDB)   │    │
│  │  (Frontend)  │     │  (Backend)   │     │              │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐    │
│  │   AD B2C     │     │    Blob      │     │  Cognitive   │    │
│  │   (Auth)     │     │   Storage    │     │  Services    │    │
│  │              │     │  (Images)    │     │  (AI Tags)   │    │
│  └──────────────┘     └──────────────┘     └──────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Services Used

| Service | Purpose | Pricing Tier |
|---------|---------|--------------|
| Azure Static Web Apps | Host React frontend | Free |
| Azure App Service | Host Node.js API | F1 (Free) / B1 |
| Azure Cosmos DB | MongoDB-compatible database | Already using Atlas |
| Azure Blob Storage | Store uploaded photos | Standard |
| Azure Cognitive Services | AI image analysis & tagging | Free tier (20 calls/min) |
| Azure AD B2C | User authentication | Free (50K users) |

## Quick Deployment Commands

```bash
# Login to Azure
az login

# Create Resource Group
az group create --name photostack-rg --location uksouth

# Deploy all services
./deploy/deploy-all.sh
```

## Step-by-Step Setup

### 1. Azure Cognitive Services (AI Tagging)
See: `docs/setup-cognitive-services.md`

### 2. Azure App Service (Backend)
See: `docs/setup-app-service.md`

### 3. Azure Static Web Apps (Frontend)
See: `docs/setup-static-web-apps.md`

### 4. Azure AD B2C (Authentication)
See: `docs/setup-ad-b2c.md`

## Environment Variables

### Backend (.env)
```
NODE_ENV=production
PORT=8080
MONGODB_URI=<your-mongodb-atlas-uri>
AZURE_STORAGE_CONNECTION_STRING=<your-storage-connection-string>
AZURE_STORAGE_CONTAINER_NAME=photos
AZURE_STORAGE_ACCOUNT_NAME=photostackstorage
AZURE_COGNITIVE_ENDPOINT=<your-cognitive-endpoint>
AZURE_COGNITIVE_KEY=<your-cognitive-key>
```

### Frontend (.env)
```
VITE_API_URL=https://photostack-api.azurewebsites.net/api
```
