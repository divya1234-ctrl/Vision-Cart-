import { AIAnalysisResult, Product, RankedProduct, VisualSearchResult } from '../types/index.js';

export async function performVisualSearch(params: {
  image: string;
  mimeType?: string;
  focusObjectName?: string;
  storeFilter?: string;
}): Promise<VisualSearchResult> {
  const response = await fetch('/api/visual-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `Visual search failed with status ${response.status}`);
  }

  return response.json();
}

export async function performImageAnalysis(params: {
  image: string;
  mimeType?: string;
  focusObjectName?: string;
}): Promise<AIAnalysisResult> {
  const response = await fetch('/api/analyze-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `Image analysis failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.analysis;
}

export async function searchCatalogWithAnalysis(params: {
  analysis: AIAnalysisResult;
  storeFilter?: string;
  minMatchScore?: number;
}): Promise<RankedProduct[]> {
  const response = await fetch('/api/search-products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `Catalog search failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.products;
}

export async function getCatalogProducts(query?: string, store?: string, category?: string): Promise<Product[]> {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (store && store !== 'All') params.set('store', store);
  if (category && category !== 'All') params.set('category', category);

  const response = await fetch(`/api/products?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to load catalog products`);
  }
  const data = await response.json();
  return data.products;
}

export async function getSystemHealth(): Promise<{ status: string; geminiEnabled: boolean }> {
  try {
    const res = await fetch('/api/health');
    return await res.json();
  } catch {
    return { status: 'offline', geminiEnabled: false };
  }
}
