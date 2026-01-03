const { BlobServiceClient } = require('@azure/storage-blob');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');

class AzureBlobService {
    constructor() {
        this.blobServiceClient = null;
        this.containerClient = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            if (!config.azureStorage.connectionString) {
                throw new Error('Azure Storage connection string not configured');
            }

            this.blobServiceClient = BlobServiceClient.fromConnectionString(
                config.azureStorage.connectionString
            );
            
            this.containerClient = this.blobServiceClient.getContainerClient(
                config.azureStorage.containerName
            );

            // Create container if it doesn't exist
            await this.containerClient.createIfNotExists({
                access: 'blob' // Public read access for blobs
            });

            this.initialized = true;
            console.log(`Azure Blob Storage initialized. Container: ${config.azureStorage.containerName}`);
        } catch (error) {
            console.error('Failed to initialize Azure Blob Storage:', error.message);
            throw error;
        }
    }

    /**
     * Upload an image to Azure Blob Storage
     * @param {Buffer} buffer - The file buffer
     * @param {string} originalName - Original filename
     * @param {string} mimeType - MIME type of the file
     * @param {string} creatorId - ID of the creator uploading
     * @returns {Object} - Upload result with URL and blob name
     */
    async uploadImage(buffer, originalName, mimeType, creatorId) {
        await this.initialize();

        // Generate unique blob name with folder structure
        const extension = originalName.split('.').pop();
        const blobName = `${creatorId}/${uuidv4()}.${extension}`;

        const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

        // Upload with proper content type
        await blockBlobClient.uploadData(buffer, {
            blobHTTPHeaders: {
                blobContentType: mimeType,
                blobCacheControl: 'public, max-age=31536000' // 1 year cache
            },
            metadata: {
                originalName: originalName,
                uploadedBy: creatorId,
                uploadedAt: new Date().toISOString()
            }
        });

        return {
            blobUrl: blockBlobClient.url,
            blobName: blobName,
            containerName: config.azureStorage.containerName
        };
    }

    /**
     * Delete an image from Azure Blob Storage
     * @param {string} blobName - The blob name to delete
     */
    async deleteImage(blobName) {
        await this.initialize();

        const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
        
        try {
            await blockBlobClient.deleteIfExists();
            console.log(`Deleted blob: ${blobName}`);
            return true;
        } catch (error) {
            console.error(`Failed to delete blob ${blobName}:`, error.message);
            throw error;
        }
    }

    /**
     * Generate a SAS URL for temporary access (if container is private)
     * @param {string} blobName - The blob name
     * @param {number} expiryMinutes - Minutes until expiry
     * @returns {string} - SAS URL
     */
    async generateSasUrl(blobName, expiryMinutes = 60) {
        await this.initialize();

        const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
        
        const startsOn = new Date();
        const expiresOn = new Date(startsOn.getTime() + expiryMinutes * 60 * 1000);

        const sasUrl = await blockBlobClient.generateSasUrl({
            permissions: 'r', // Read only
            startsOn,
            expiresOn
        });

        return sasUrl;
    }

    /**
     * Get blob properties
     * @param {string} blobName - The blob name
     * @returns {Object} - Blob properties
     */
    async getBlobProperties(blobName) {
        await this.initialize();

        const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
        const properties = await blockBlobClient.getProperties();
        
        return {
            contentType: properties.contentType,
            contentLength: properties.contentLength,
            createdOn: properties.createdOn,
            metadata: properties.metadata
        };
    }

    /**
     * List all blobs for a creator
     * @param {string} creatorId - The creator's ID
     * @returns {Array} - List of blob info
     */
    async listCreatorBlobs(creatorId) {
        await this.initialize();

        const blobs = [];
        const prefix = `${creatorId}/`;

        for await (const blob of this.containerClient.listBlobsFlat({ prefix })) {
            blobs.push({
                name: blob.name,
                contentLength: blob.properties.contentLength,
                contentType: blob.properties.contentType,
                createdOn: blob.properties.createdOn
            });
        }

        return blobs;
    }
}

// Export singleton instance
module.exports = new AzureBlobService();
