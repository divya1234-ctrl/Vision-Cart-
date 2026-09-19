export type StoreName = 'Meesho' | 'Amazon' | 'Flipkart' | 'Myntra' | 'Ajio';

export type AvailabilityStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export type MatchTier = 'Very strong match' | 'Strong match' | 'Similar' | 'Alternative';

export interface Product {
  id: string;
  name: string;
  store: StoreName;
  category: string;
  subcategory: string;
  price: number;
  currency: string;
  originalPrice?: number;
  image: string;
  productUrl: string;
  availability: AvailabilityStatus;
  rating: number;
  reviewCount: number;
  description: string;
  color: string[];
  material: string;
  style: string;
  searchKeywords: string[];
}

export interface DetectedObject {
  id: string;
  name: string;
  category: string;
  confidence?: number;
  color?: string;
  description?: string;
}

export interface AIAnalysisResult {
  category: string;
  subcategory: string;
  product_type: string;
  color: string[];
  material: string;
  style: string;
  pattern: string;
  brand: string;
  gender: string;
  description: string;
  search_keywords: string[];
  detected_objects: DetectedObject[];
  is_multi_product: boolean;
  selected_object_id?: string;
}

export interface MatchScoreBreakdown {
  categoryScore: number;
  keywordScore: number;
  colorScore: number;
  styleScore: number;
  materialScore: number;
  descriptionScore: number;
  reasons: string[];
}

export interface RankedProduct extends Product {
  matchScore: number; // 0 - 100
  matchTier: MatchTier;
  matchBreakdown: MatchScoreBreakdown;
}

export interface LiveStoreLink {
  store: StoreName | 'Google Shopping' | 'Tata CLiQ';
  name: string;
  searchUrl: string;
  accentColor: string;
  badge: string;
  typicalPriceRange: string;
  avgEstimatedPrice: number;
  keyAdvantage: string;
  shippingInfo: string;
  icon: string;
}

export interface StorePriceBenchmark {
  cheapestStore: string;
  estimatedLowestPrice: number;
  highestStore: string;
  estimatedHighestPrice: number;
  potentialSavings: number;
  potentialSavingsPercent: number;
  benchmarks: {
    store: string;
    priceRange: string;
    avgPrice: number;
    valueProposition: string;
  }[];
}

export interface VisualSearchResult {
  analysis: AIAnalysisResult;
  products: RankedProduct[];
  totalCount: number;
  executionTimeMs: number;
  querySummary?: string;
  liveStoreLinks?: LiveStoreLink[];
  priceBenchmark?: StorePriceBenchmark;
}

export interface SearchFilterState {
  selectedStore: StoreName | 'All';
  selectedTier: MatchTier | 'All';
  sortBy: 'match' | 'price-asc' | 'price-desc' | 'rating';
  searchQuery: string;
  minPrice?: number;
  maxPrice?: number;
}
