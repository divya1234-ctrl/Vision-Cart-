import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { analyzeProductImage } from '../ai/geminiClient.js';
import { defaultProductSearchService } from '../services/ProductSearchService.js';
import { generateLiveStoreLinks, calculateStorePriceBenchmark } from '../services/LiveStoreSearchService.js';
import { VisualSearchResult } from '../../src/types/index.js';

export const apiRouter = Router();

// Max allowed base64 length (~10MB binary image data)
const MAX_BASE64_LENGTH = 14 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Health check endpoint
 */
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'VisionCart API',
    timestamp: new Date().toISOString(),
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY),
  });
});

/**
 * GET /api/products
 * Retrieve mock catalog items with optional filtering
 */
apiRouter.get('/products', async (req: Request, res: Response) => {
  try {
    const { store, category, q } = req.query;
    let products = await defaultProductSearchService.getAllProducts();

    if (store && typeof store === 'string' && store !== 'All') {
      products = products.filter((p) => p.store.toLowerCase() === store.toLowerCase());
    }

    if (category && typeof category === 'string' && category !== 'All') {
      products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (q && typeof q === 'string') {
      const query = q.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.searchKeywords.some((k) => k.toLowerCase().includes(query))
      );
    }

    res.json({
      success: true,
      count: products.length,
      products,
      isMockData: true,
      disclaimer: 'Mock catalog data for prototype demonstration. Not connected to live store checkout.',
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve products', message: error.message });
  }
});

/**
 * POST /api/analyze-image
 * Multimodal vision analysis to detect attributes and multi-object products
 */
apiRouter.post('/analyze-image', async (req: Request, res: Response) => {
  try {
    const { image, mimeType = 'image/jpeg', focusObjectName } = req.body;

    if (!image || typeof image !== 'string') {
      return res.status(400).json({
        error: 'No image provided',
        message: 'Please provide a base64 encoded image string.',
      });
    }

    if (image.length > MAX_BASE64_LENGTH) {
      return res.status(413).json({
        error: 'Image too large',
        message: 'The uploaded image exceeds the 10MB limit. Please upload a smaller image.',
      });
    }

    // Basic MIME validation
    if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
      return res.status(400).json({
        error: 'Invalid file type',
        message: `Supported image formats are JPEG, PNG, WEBP, and GIF. Received: ${mimeType}`,
      });
    }

    const analysis = await analyzeProductImage(image, mimeType, focusObjectName);

    res.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error('Image analysis route error:', error);
    res.status(500).json({
      error: 'AI analysis failed',
      message: error?.message || 'Unable to process image at this time.',
    });
  }
});

/**
 * POST /api/search-products
 * Search and rank catalog products against structured AI analysis
 */
apiRouter.post('/search-products', async (req: Request, res: Response) => {
  try {
    const { analysis, storeFilter, minMatchScore, limit } = req.body;

    if (!analysis) {
      return res.status(400).json({
        error: 'Missing analysis object',
        message: 'Analysis metadata is required to search and rank products.',
      });
    }

    const ranked = await defaultProductSearchService.searchByAnalysis(analysis, {
      storeFilter,
      minMatchScore,
      limit,
    });

    res.json({
      success: true,
      totalCount: ranked.length,
      products: ranked,
    });
  } catch (error: any) {
    console.error('Search products route error:', error);
    res.status(500).json({
      error: 'Product search failed',
      message: error?.message || 'Unable to search catalog.',
    });
  }
});

/**
 * POST /api/visual-search
 * Combined end-to-end endpoint: Upload Image -> AI Vision -> Catalog Search & Ranking -> Results
 * Perfect for both the Web UI and future Chrome Extension.
 */
apiRouter.post('/visual-search', async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    const { image, mimeType = 'image/jpeg', focusObjectName, storeFilter, limit } = req.body;

    if (!image || typeof image !== 'string') {
      return res.status(400).json({
        error: 'No image provided',
        message: 'Please provide a base64 encoded image string.',
      });
    }

    if (image.length > MAX_BASE64_LENGTH) {
      return res.status(413).json({
        error: 'Image too large',
        message: 'The uploaded image exceeds the 10MB limit. Please upload a smaller image.',
      });
    }

    // Step 1: AI Vision Analysis
    const analysis = await analyzeProductImage(image, mimeType, focusObjectName);

    // Step 2: Catalog Search and Relevance Ranking
    const rankedProducts = await defaultProductSearchService.searchByAnalysis(analysis, {
      storeFilter,
      limit: limit || 50,
    });

    // Step 3: Real Live Store Search Links & Price Benchmarks
    const liveStoreLinks = generateLiveStoreLinks(analysis);
    const priceBenchmark = calculateStorePriceBenchmark(analysis);

    const executionTimeMs = Date.now() - startTime;

    const result: VisualSearchResult = {
      analysis,
      products: rankedProducts,
      totalCount: rankedProducts.length,
      executionTimeMs,
      querySummary: `${analysis.color?.join(', ') || ''} ${analysis.style || ''} ${analysis.product_type || analysis.category}`.trim(),
      liveStoreLinks,
      priceBenchmark,
    };

    res.json({
      success: true,
      ...result,
      isMockData: false,
    });
  } catch (error: any) {
    console.error('Visual search route error:', error);
    res.status(500).json({
      error: 'Visual search failed',
      message: error?.message || 'Failed to complete visual search.',
    });
  }
});

/**
 * GET /api/download-extension
 * Generates and downloads the complete ready-to-load Chrome Extension ZIP package.
 * Dynamically injects the caller's server URL so it works instantly without configuration!
 */
apiRouter.get('/download-extension', async (req: Request, res: Response) => {
  try {
    const extensionDir = path.join(process.cwd(), 'extension');
    if (!fs.existsSync(extensionDir)) {
      return res.status(404).json({ error: 'Extension files not found' });
    }

    // Determine current caller origin (Cloud Run host or localhost)
    const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
    const host = (req.headers['x-forwarded-host'] as string) || req.get('host') || 'localhost:3000';
    const currentHostUrl = `${proto}://${host}`.replace(/\/$/, '');

    const zip = new JSZip();

    function addDirectoryToZip(dirPath: string, zipFolder: JSZip) {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          const subFolder = zipFolder.folder(entry.name);
          if (subFolder) addDirectoryToZip(fullPath, subFolder);
        } else {
          // If JS config file, dynamically substitute server URL with the caller's active URL
          if (['content.js', 'background.js', 'popup.js'].includes(entry.name)) {
            let content = fs.readFileSync(fullPath, 'utf8');
            content = content
              .replace(
                /https:\/\/ais-(dev|pre)-[a-zA-Z0-9_-]+\.asia-east1\.run\.app/g,
                currentHostUrl
              )
              .replace(
                /const DEFAULT_BACKEND_URL = "[^"]+";/g,
                `const DEFAULT_BACKEND_URL = "${currentHostUrl}";`
              )
              .replace(
                /const DEFAULT_SERVER_URL = "[^"]+";/g,
                `const DEFAULT_SERVER_URL = "${currentHostUrl}";`
              );
            zipFolder.file(entry.name, content);
          } else {
            const fileData = fs.readFileSync(fullPath);
            zipFolder.file(entry.name, fileData);
          }
        }
      }
    }

    addDirectoryToZip(extensionDir, zip);

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="visioncart-chrome-extension.zip"');
    res.setHeader('Content-Length', zipBuffer.length);
    res.end(zipBuffer);
  } catch (error: any) {
    console.error('Extension zip generation error:', error);
    res.status(500).json({
      error: 'Failed to generate extension zip',
      message: error.message,
    });
  }
});

