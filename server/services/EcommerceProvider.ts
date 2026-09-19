import { AIAnalysisResult, Product, StoreName } from '../../src/types/index.js';
import { MOCK_CATALOG } from '../data/mockProductsCatalog.js';

export interface ProviderSearchParams {
  query: string;
  category?: string;
  colors?: string[];
  limit?: number;
  analysis?: AIAnalysisResult;
}

/**
 * EcommerceProvider Interface
 * Designed to allow clean integration of official merchant APIs, affiliate feeds (e.g. Amazon Product Advertising API,
 * Flipkart Affiliate API, Meesho Partner Feed, Myntra Partner APIs), or licensed product feeds.
 *
 * NOTE: Scraping or bypassing anti-bot systems is strictly prohibited.
 * All future providers connect through authorized OAuth/API endpoints.
 */
export interface EcommerceProvider {
  name: StoreName;
  isMock: boolean;
  searchProducts(params: ProviderSearchParams): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
}

/**
 * Mock Provider representing unified prototype catalog across Meesho, Amazon, Flipkart, Myntra, Ajio
 */
export class MockProvider implements EcommerceProvider {
  name: StoreName = 'Amazon';
  isMock: boolean = true;
  private catalog: Product[];

  constructor(catalog: Product[] = MOCK_CATALOG) {
    this.catalog = catalog;
  }

  async searchProducts(params: ProviderSearchParams): Promise<Product[]> {
    const q = (params.query || '').toLowerCase().trim();
    if (!q) return this.catalog;

    return this.catalog.filter((item) => {
      const matchName = item.name.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q) || item.subcategory.toLowerCase().includes(q);
      const matchKeywords = item.searchKeywords.some((k) => k.toLowerCase().includes(q) || q.includes(k.toLowerCase()));
      return matchName || matchCat || matchKeywords;
    });
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.catalog.find((p) => p.id === id) || null;
  }
}

/**
 * Architectural skeleton for future authorized store providers.
 * Each provider connects to official partner APIs when credentials and feeds are provisioned.
 */
export class MeeshoProvider implements EcommerceProvider {
  name: StoreName = 'Meesho';
  isMock: boolean = false;

  async searchProducts(params: ProviderSearchParams): Promise<Product[]> {
    // In production: Connect to Meesho Partner/Affiliate API with official client credentials
    return MOCK_CATALOG.filter((p) => p.store === 'Meesho');
  }

  async getProductById(id: string): Promise<Product | null> {
    return MOCK_CATALOG.find((p) => p.store === 'Meesho' && p.id === id) || null;
  }
}

export class AmazonProvider implements EcommerceProvider {
  name: StoreName = 'Amazon';
  isMock: boolean = false;

  async searchProducts(params: ProviderSearchParams): Promise<Product[]> {
    // In production: Connect to Amazon Product Advertising API (PA-API v5) with AWS keys
    return MOCK_CATALOG.filter((p) => p.store === 'Amazon');
  }

  async getProductById(id: string): Promise<Product | null> {
    return MOCK_CATALOG.find((p) => p.store === 'Amazon' && p.id === id) || null;
  }
}

export class FlipkartProvider implements EcommerceProvider {
  name: StoreName = 'Flipkart';
  isMock: boolean = false;

  async searchProducts(params: ProviderSearchParams): Promise<Product[]> {
    // In production: Connect to Flipkart Affiliate / Marketplace API
    return MOCK_CATALOG.filter((p) => p.store === 'Flipkart');
  }

  async getProductById(id: string): Promise<Product | null> {
    return MOCK_CATALOG.find((p) => p.store === 'Flipkart' && p.id === id) || null;
  }
}

export class MyntraProvider implements EcommerceProvider {
  name: StoreName = 'Myntra';
  isMock: boolean = false;

  async searchProducts(params: ProviderSearchParams): Promise<Product[]> {
    // In production: Connect to Myntra Catalog API
    return MOCK_CATALOG.filter((p) => p.store === 'Myntra');
  }

  async getProductById(id: string): Promise<Product | null> {
    return MOCK_CATALOG.find((p) => p.store === 'Myntra' && p.id === id) || null;
  }
}

export class AjioProvider implements EcommerceProvider {
  name: StoreName = 'Ajio';
  isMock: boolean = false;

  async searchProducts(params: ProviderSearchParams): Promise<Product[]> {
    // In production: Connect to Ajio Partner API
    return MOCK_CATALOG.filter((p) => p.store === 'Ajio');
  }

  async getProductById(id: string): Promise<Product | null> {
    return MOCK_CATALOG.find((p) => p.store === 'Ajio' && p.id === id) || null;
  }
}
