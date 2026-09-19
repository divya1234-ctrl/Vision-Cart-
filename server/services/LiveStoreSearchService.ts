import { AIAnalysisResult, StoreName } from '../../src/types/index.js';

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

/**
 * Clean and format search query for specific e-commerce platforms
 */
export function buildOptimizedQuery(analysis: AIAnalysisResult, platform?: string): string {
  const parts: string[] = [];

  // Color
  if (analysis.color && analysis.color.length > 0) {
    const mainColor = analysis.color[0].toLowerCase();
    if (mainColor !== 'unknown' && mainColor !== 'various') {
      parts.push(mainColor);
    }
  }

  // Style or Pattern
  if (analysis.style && !['casual', 'standard', 'regular', 'plain'].includes(analysis.style.toLowerCase())) {
    parts.push(analysis.style);
  }

  // Product Type (e.g. Hoodie, Sneakers, Handbag)
  const productType = analysis.product_type || analysis.category;
  parts.push(productType);

  // Gender or Demographic if applicable
  if (analysis.gender && ['Men', 'Women'].includes(analysis.gender)) {
    parts.push(analysis.gender);
  }

  // Material if distinctive
  if (analysis.material && ['leather', 'denim', 'silk', 'linen', 'wool', 'velvet'].some(m => analysis.material.toLowerCase().includes(m))) {
    parts.push(analysis.material);
  }

  let clean = parts.join(' ').replace(/\s+/g, ' ').trim();
  if (!clean || clean.length < 3) {
    clean = analysis.description?.slice(0, 40) || 'fashion clothing';
  }

  return clean;
}

/**
 * Generate direct verified search links for real-world e-commerce stores
 */
export function generateLiveStoreLinks(analysis: AIAnalysisResult, customQuery?: string): LiveStoreLink[] {
  const query = customQuery || buildOptimizedQuery(analysis);
  const encoded = encodeURIComponent(query);

  // Estimate price tiers based on category
  const cat = (analysis.category || '').toLowerCase();
  const isFootwear = cat.includes('footwear') || cat.includes('shoe');
  const isElectronics = cat.includes('electronic') || cat.includes('watch');
  const isAccessories = cat.includes('accessor') || cat.includes('bag');

  let basePrice = 799;
  if (isFootwear) basePrice = 1299;
  if (isElectronics) basePrice = 1899;
  if (isAccessories) basePrice = 599;

  return [
    {
      store: 'Meesho',
      name: 'Meesho',
      searchUrl: `https://www.meesho.com/search?q=${encoded}`,
      accentColor: '#f43f5e',
      badge: 'Wholesale Direct',
      typicalPriceRange: `₹${Math.round(basePrice * 0.45)} - ₹${Math.round(basePrice * 0.7)}`,
      avgEstimatedPrice: Math.round(basePrice * 0.55),
      keyAdvantage: 'Direct from manufacturers, zero commission, lowest wholesale prices',
      shippingInfo: 'Free Delivery • Cash on Delivery',
      icon: '🛍️',
    },
    {
      store: 'Amazon',
      name: 'Amazon India',
      searchUrl: `https://www.amazon.in/s?k=${encoded}`,
      accentColor: '#f59e0b',
      badge: 'Prime 1-Day',
      typicalPriceRange: `₹${Math.round(basePrice * 0.9)} - ₹${Math.round(basePrice * 1.6)}`,
      avgEstimatedPrice: Math.round(basePrice * 1.2),
      keyAdvantage: 'Prime ultra-fast delivery, buyer protection, verified customer reviews',
      shippingInfo: 'Free 1-Day with Prime • Easy 7-day returns',
      icon: '📦',
    },
    {
      store: 'Flipkart',
      name: 'Flipkart',
      searchUrl: `https://www.flipkart.com/search?q=${encoded}`,
      accentColor: '#3b82f6',
      badge: 'F-Assured Deals',
      typicalPriceRange: `₹${Math.round(basePrice * 0.75)} - ₹${Math.round(basePrice * 1.35)}`,
      avgEstimatedPrice: Math.round(basePrice * 0.95),
      keyAdvantage: 'Plus verified sellers, bank discount offers, festive price drops',
      shippingInfo: 'Fast delivery • Assured quality checks',
      icon: '⚡',
    },
    {
      store: 'Myntra',
      name: 'Myntra',
      searchUrl: `https://www.myntra.com/search?q=${encoded}`,
      accentColor: '#ec4899',
      badge: '100% Original Brands',
      typicalPriceRange: `₹${Math.round(basePrice * 1.1)} - ₹${Math.round(basePrice * 2.2)}`,
      avgEstimatedPrice: Math.round(basePrice * 1.45),
      keyAdvantage: 'Curated premium fashion, authentic licensed brands, latest runway drops',
      shippingInfo: 'Try & Buy available • 14-day hassle-free return',
      icon: '👗',
    },
    {
      store: 'Ajio',
      name: 'Ajio',
      searchUrl: `https://www.ajio.com/search/?text=${encoded}`,
      accentColor: '#06b6d4',
      badge: 'Trends & Discounts',
      typicalPriceRange: `₹${Math.round(basePrice * 0.85)} - ₹${Math.round(basePrice * 1.8)}`,
      avgEstimatedPrice: Math.round(basePrice * 1.15),
      keyAdvantage: 'Reliance Trends collection, exclusive international indie brands, coupon codes',
      shippingInfo: 'Doorstep pickup • Instant refund',
      icon: '✨',
    },
    {
      store: 'Google Shopping',
      name: 'Google Shopping',
      searchUrl: `https://www.google.com/search?tbm=shop&q=${encoded}`,
      accentColor: '#10b981',
      badge: '100+ Stores Indexed',
      typicalPriceRange: `₹${Math.round(basePrice * 0.45)} - ₹${Math.round(basePrice * 2.2)}`,
      avgEstimatedPrice: Math.round(basePrice * 1.05),
      keyAdvantage: 'Cross-web price comparison across hundreds of verified Indian & global merchants',
      shippingInfo: 'Aggregated store results & merchant ratings',
      icon: '🌐',
    },
  ];
}

/**
 * Calculate market price benchmarks & potential savings across retailers
 */
export function calculateStorePriceBenchmark(analysis: AIAnalysisResult, customQuery?: string): StorePriceBenchmark {
  const links = generateLiveStoreLinks(analysis, customQuery);

  const meesho = links.find((l) => l.store === 'Meesho')!;
  const myntra = links.find((l) => l.store === 'Myntra')!;
  const amazon = links.find((l) => l.store === 'Amazon')!;
  const flipkart = links.find((l) => l.store === 'Flipkart')!;
  const ajio = links.find((l) => l.store === 'Ajio')!;

  const lowest = meesho.avgEstimatedPrice;
  const highest = Math.max(myntra.avgEstimatedPrice, amazon.avgEstimatedPrice);
  const savings = highest - lowest;
  const savingsPercent = Math.round((savings / highest) * 100);

  return {
    cheapestStore: 'Meesho',
    estimatedLowestPrice: lowest,
    highestStore: myntra.avgEstimatedPrice >= amazon.avgEstimatedPrice ? 'Myntra' : 'Amazon',
    estimatedHighestPrice: highest,
    potentialSavings: savings,
    potentialSavingsPercent: savingsPercent,
    benchmarks: [
      {
        store: 'Meesho',
        priceRange: meesho.typicalPriceRange,
        avgPrice: meesho.avgEstimatedPrice,
        valueProposition: 'Direct from manufacturer wholesale',
      },
      {
        store: 'Flipkart',
        priceRange: flipkart.typicalPriceRange,
        avgPrice: flipkart.avgEstimatedPrice,
        valueProposition: 'Mass market competitive deals',
      },
      {
        store: 'Ajio',
        priceRange: ajio.typicalPriceRange,
        avgPrice: ajio.avgEstimatedPrice,
        valueProposition: 'Reliance Trends & coupon discounts',
      },
      {
        store: 'Amazon',
        priceRange: amazon.typicalPriceRange,
        avgPrice: amazon.avgEstimatedPrice,
        valueProposition: 'Prime delivery & brand assurance',
      },
      {
        store: 'Myntra',
        priceRange: myntra.typicalPriceRange,
        avgPrice: myntra.avgEstimatedPrice,
        valueProposition: 'Curated premium fashion & runway collections',
      },
    ],
  };
}
