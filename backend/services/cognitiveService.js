const config = require('../config');

class CognitiveService {
    constructor() {
        this.endpoint = config.cognitiveServices.endpoint;
        this.key = config.cognitiveServices.key;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        if (!this.endpoint || !this.key) {
            console.warn('Azure Cognitive Services not configured. Image analysis will be skipped.');
            return;
        }

        this.initialized = true;
        console.log('Azure Cognitive Services initialized');
    }

    /**
     * Analyze an image using Azure Computer Vision
     * @param {string} imageUrl - URL of the image to analyze
     * @returns {Object} - Analysis results
     */
    async analyzeImage(imageUrl) {
        await this.initialize();

        if (!this.initialized) {
            return this.getDefaultAnalysis();
        }

        try {
            const analyzeUrl = `${this.endpoint}/vision/v3.2/analyze`;
            
            const response = await fetch(`${analyzeUrl}?visualFeatures=Tags,Description,Color,Adult`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Ocp-Apim-Subscription-Key': this.key
                },
                body: JSON.stringify({ url: imageUrl })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Cognitive Services error:', errorText);
                return this.getDefaultAnalysis();
            }

            const data = await response.json();

            return {
                tags: data.tags?.map(t => t.name) || [],
                description: data.description?.captions?.[0]?.text || '',
                dominantColors: data.color?.dominantColors || [],
                isAdultContent: data.adult?.isAdultContent || false,
                isRacyContent: data.adult?.isRacyContent || false,
                confidence: data.description?.captions?.[0]?.confidence || 0
            };
        } catch (error) {
            console.error('Error analyzing image:', error.message);
            return this.getDefaultAnalysis();
        }
    }

    getDefaultAnalysis() {
        return {
            tags: [],
            description: '',
            dominantColors: [],
            isAdultContent: false,
            isRacyContent: false,
            confidence: 0
        };
    }
}

class TextAnalyticsService {
    constructor() {
        this.endpoint = config.textAnalytics.endpoint;
        this.key = config.textAnalytics.key;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        if (!this.endpoint || !this.key) {
            console.warn('Azure Text Analytics not configured. Sentiment analysis will be skipped.');
            return;
        }

        this.initialized = true;
        console.log('Azure Text Analytics initialized');
    }

    /**
     * Analyze sentiment of text (for comments)
     * @param {string} text - Text to analyze
     * @returns {Object} - Sentiment analysis result
     */
    async analyzeSentiment(text) {
        await this.initialize();

        if (!this.initialized) {
            return { sentiment: 'unknown', score: 0 };
        }

        try {
            const sentimentUrl = `${this.endpoint}/text/analytics/v3.1/sentiment`;
            
            const response = await fetch(sentimentUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Ocp-Apim-Subscription-Key': this.key
                },
                body: JSON.stringify({
                    documents: [{ id: '1', text: text, language: 'en' }]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Text Analytics error:', errorText);
                return { sentiment: 'unknown', score: 0 };
            }

            const data = await response.json();
            const doc = data.documents?.[0];

            if (doc) {
                return {
                    sentiment: doc.sentiment,
                    score: doc.confidenceScores?.[doc.sentiment] || 0
                };
            }

            return { sentiment: 'unknown', score: 0 };
        } catch (error) {
            console.error('Error analyzing sentiment:', error.message);
            return { sentiment: 'unknown', score: 0 };
        }
    }
}

module.exports = {
    cognitiveService: new CognitiveService(),
    textAnalyticsService: new TextAnalyticsService()
};
