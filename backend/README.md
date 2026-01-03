# PhotoStack Backend API

Cloud-native photo sharing platform backend built with Node.js, Express, and Azure services.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     PhotoStack Backend                       │
├─────────────────────────────────────────────────────────────┤
│  Express.js REST API                                         │
│  ├── Authentication (Azure AD B2C / JWT)                    │
│  ├── Role-based Access Control (Creator/Consumer)           │
│  └── Request Validation & Error Handling                    │
├─────────────────────────────────────────────────────────────┤
│  Azure Services Integration                                  │
│  ├── Cosmos DB (MongoDB API) - Data persistence             │
│  ├── Blob Storage - Image storage                           │
│  ├── Cognitive Services - Image analysis                    │
│  └── Text Analytics - Sentiment analysis                    │
└─────────────────────────────────────────────────────────────┘
```

## Features

### User Roles
- **Creator**: Can upload, edit, delete photos with metadata
- **Consumer**: Can browse, search, comment, and rate photos

### API Endpoints

#### Photos
- `GET /api/photos` - List all photos (paginated)
- `GET /api/photos/search` - Search photos by text, tags, location
- `GET /api/photos/trending` - Get trending photos
- `GET /api/photos/:id` - Get photo details
- `POST /api/photos` - Upload photo (Creator only)
- `PUT /api/photos/:id` - Update photo (Creator only)
- `DELETE /api/photos/:id` - Delete photo (Creator only)

#### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update profile
- `GET /api/users/creators` - List creators

#### Comments
- `GET /api/photos/:photoId/comments` - Get comments
- `POST /api/photos/:photoId/comments` - Add comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

#### Ratings
- `GET /api/photos/:photoId/ratings` - Get ratings
- `POST /api/photos/:photoId/ratings` - Add/update rating
- `DELETE /api/photos/:photoId/ratings` - Remove rating

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local) or Azure Cosmos DB
- Azure Storage Account
- Azure AD B2C (optional for auth)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your .env file with Azure credentials

# Start development server
npm run dev

# Start production server
npm start
```

### Environment Variables

See `.env.example` for all configuration options.

## Scalability Features

- **Connection Pooling**: MongoDB connection pooling for scalability
- **Indexed Queries**: Proper database indexes for efficient queries
- **Blob Storage**: Scalable image storage with CDN support
- **Stateless API**: Ready for horizontal scaling
- **Caching Headers**: Proper cache control headers

## Advanced Features

1. **AI Image Analysis** (Azure Cognitive Services)
   - Auto-tagging of images
   - Content moderation
   - Color extraction
   - Image description generation

2. **Sentiment Analysis** (Azure Text Analytics)
   - Comment sentiment detection
   - Automatic classification (positive/neutral/negative)

## Project Structure

```
backend/
├── config/
│   ├── db.js           # Database connection
│   └── index.js        # Configuration management
├── controller/
│   ├── photoController.js
│   ├── userController.js
│   ├── commentController.js
│   └── ratingController.js
├── middleware/
│   ├── auth.js         # JWT authentication
│   ├── upload.js       # File upload handling
│   └── errorHandler.js # Error handling
├── models/
│   ├── Photo.js
│   ├── User.js
│   ├── Comment.js
│   └── Rating.js
├── routes/
│   ├── photoRoutes.js
│   ├── userRoutes.js
│   ├── commentRoutes.js
│   └── ratingRoutes.js
├── services/
│   ├── blobService.js      # Azure Blob Storage
│   └── cognitiveService.js # Azure AI services
├── server.js
└── package.json
```

## Deployment

### Azure App Service

1. Create Azure App Service (Node.js)
2. Configure environment variables in App Settings
3. Deploy via GitHub Actions or Azure CLI

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```
