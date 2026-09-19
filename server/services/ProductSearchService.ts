import { AIAnalysisResult, Product, RankedProduct } from '../../src/types/index.js';
import { MOCK_CATALOG } from '../data/mockProductsCatalog.js';
import { rankProducts } from './rankingEngine.js';

export interface SearchOptions {
  focusObjectId?: string;
  storeFilter?: string;
  minMatchScore?: number;
  limit?: number;
}

/**
 * ProductSearchService
 * Standardized search interface decoupling the visual search pipeline from
 * the underlying index implementation (Mock vs. Vector Database).
 */
export interface ProductSearchService {
  /**
   * Search products given structured visual analysis
   */
  searchByAnalysis(analysis: AIAnalysisResult, options?: SearchOptions): Promise<RankedProduct[]>;

  /**
   * Retrieve catalog inventory
   */
  getAllProducts(): Promise<Product[]>;

  /**
   * Lookup single product by ID
   */
  getProductById(id: string): Promise<Product | null>;
}

/**
 * MockProductSearchService (V1 Implementation)
 * Uses high-fidelity multi-attribute semantic scoring across the 34-item catalog.
 */
export class MockProductSearchService implements ProductSearchService {
  private catalog: Product[];

  constructor(catalog: Product[] = MOCK_CATALOG) {
    this.catalog = catalog;
  }

  async getAllProducts(): Promise<Product[]> {
    return [...this.catalog];
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.catalog.find((p) => p.id === id) || null;
  }

  async searchByAnalysis(analysis: AIAnalysisResult, options?: SearchOptions): Promise<RankedProduct[]> {
    let pool = [...this.catalog];

    if (options?.storeFilter && options.storeFilter !== 'All') {
      pool = pool.filter((p) => p.store.toLowerCase() === options.storeFilter?.toLowerCase());
    }

    // Rank catalog items using multi-attribute relevance engine
    let ranked = rankProducts(pool, analysis);

    if (options?.minMatchScore !== undefined) {
      ranked = ranked.filter((p) => p.matchScore >= options.minMatchScore!);
    }

    if (options?.limit && options.limit > 0) {
      ranked = ranked.slice(0, options.limit);
    }

    return ranked;
  }
}

/**
 * VectorProductSearchService (Future V2 Implementation Outline)
 * Demonstrates architectural drop-in replacement where visual features are projected
 * into high-dimensional vector space (e.g., using Gemini Embeddings) and queried via ANN.
 *
 * Flow:
 * Image -> Multimodal Image Embedding -> Pinecone/pgvector Nearest-Neighbor -> Reranking
 */
export class VectorProductSearchService implements ProductSearchService {
  constructor(private vectorDbEndpoint?: string) {}

  async searchByAnalysis(analysis: AIAnalysisResult, options?: SearchOptions): Promise<RankedProduct[]> {
    // 1. Generate text/visual query embedding vector
    // 2. Query Vector DB (Cosine similarity / dot product)
    // 3. Return ranked nearest neighbors
    throw new Error('VectorProductSearchService requires vector DB credentials. Use MockProductSearchService for V1.');
  }

  async getAllProducts(): Promise<Product[]> {
    return MOCK_CATALOG;
  }

  async getProductById(id: string): Promise<Product | null> {
    return MOCK_CATALOG.find((p) => p.id === id) || null;
  }
}

// Default singleton instance for the app
export const defaultProductSearchService = new MockProductSearchService();
