import { AIAnalysisResult, MatchScoreBreakdown, MatchTier, Product, RankedProduct } from '../../src/types/index.js';

export function calculateProductMatch(
  product: Product,
  analysis: AIAnalysisResult
): { score: number; tier: MatchTier; breakdown: MatchScoreBreakdown } {
  const reasons: string[] = [];

  // 1. Category Similarity (Max 30 pts)
  let categoryScore = 0;
  const prodCat = product.category.toLowerCase();
  const prodSub = product.subcategory.toLowerCase();
  const aiCat = (analysis.category || '').toLowerCase();
  const aiSub = (analysis.subcategory || '').toLowerCase();
  const aiType = (analysis.product_type || '').toLowerCase();

  if (prodSub && (aiSub.includes(prodSub) || prodSub.includes(aiSub) || prodSub.includes(aiType) || aiType.includes(prodSub))) {
    categoryScore = 30;
    reasons.push(`Direct subcategory match: ${product.subcategory}`);
  } else if (prodCat && aiCat && (prodCat.includes(aiCat) || aiCat.includes(prodCat))) {
    categoryScore = 20;
    reasons.push(`Category match: ${product.category}`);
  } else if (aiType && product.name.toLowerCase().includes(aiType)) {
    categoryScore = 15;
    reasons.push(`Type match in title: ${analysis.product_type}`);
  } else {
    categoryScore = 5;
  }

  // 2. Keyword Similarity (Max 25 pts)
  let keywordScore = 0;
  const aiKeywords = (analysis.search_keywords || []).map((k) => k.toLowerCase().trim());
  const prodKeywords = (product.searchKeywords || []).map((k) => k.toLowerCase().trim());
  const prodNameWords = product.name.toLowerCase().split(/\W+/).filter(Boolean);

  let matchKeywordCount = 0;
  for (const ak of aiKeywords) {
    const isMatched = prodKeywords.some((pk) => pk.includes(ak) || ak.includes(pk)) ||
      prodNameWords.some((nw) => ak.includes(nw) || nw.includes(ak));
    if (isMatched) {
      matchKeywordCount++;
    }
  }

  const keywordRatio = aiKeywords.length > 0 ? matchKeywordCount / Math.min(aiKeywords.length, 6) : 0;
  keywordScore = Math.min(25, Math.round(keywordRatio * 25));
  if (matchKeywordCount > 0) {
    reasons.push(`${matchKeywordCount} matching visual & search tags`);
  }

  // 3. Color Similarity (Max 15 pts)
  let colorScore = 0;
  const aiColors = (analysis.color || []).map((c) => c.toLowerCase().trim());
  const prodColors = (product.color || []).map((c) => c.toLowerCase().trim());

  const directColorMatches = aiColors.filter((ac) =>
    prodColors.some((pc) => pc.includes(ac) || ac.includes(pc))
  );

  if (directColorMatches.length > 0) {
    colorScore = 15;
    reasons.push(`Exact color match: ${directColorMatches.join(', ')}`);
  } else {
    // Check related/neutral tones
    const isDarkMatch = aiColors.some((c) => ['black', 'dark', 'charcoal', 'navy'].includes(c)) &&
      prodColors.some((c) => ['black', 'charcoal', 'grey', 'dark grey'].includes(c));
    const isLightMatch = aiColors.some((c) => ['white', 'cream', 'ivory', 'beige'].includes(c)) &&
      prodColors.some((c) => ['white', 'off-white', 'cream', 'beige'].includes(c));

    if (isDarkMatch || isLightMatch) {
      colorScore = 10;
      reasons.push(`Harmonious color palette`);
    } else {
      colorScore = 2;
    }
  }

  // 4. Style Similarity (Max 10 pts)
  let styleScore = 0;
  const aiStyle = (analysis.style || '').toLowerCase();
  const prodStyle = (product.style || '').toLowerCase();

  const styleTokens = aiStyle.split(/\W+/).filter((w) => w.length > 3);
  let styleMatchCount = 0;
  for (const token of styleTokens) {
    if (prodStyle.includes(token) || product.name.toLowerCase().includes(token)) {
      styleMatchCount++;
    }
  }

  if (styleMatchCount >= 2) {
    styleScore = 10;
    reasons.push(`High style aesthetic alignment: ${product.style}`);
  } else if (styleMatchCount === 1) {
    styleScore = 7;
    reasons.push(`Style alignment: ${product.style}`);
  } else {
    styleScore = 3;
  }

  // 5. Material Similarity (Max 10 pts)
  let materialScore = 0;
  const aiMaterial = (analysis.material || '').toLowerCase();
  const prodMaterial = (product.material || '').toLowerCase();

  const matTokens = aiMaterial.split(/\W+/).filter((w) => w.length > 3);
  const matchedMat = matTokens.some((m) => prodMaterial.includes(m) || product.description.toLowerCase().includes(m));

  if (matchedMat) {
    materialScore = 10;
    reasons.push(`Material match: ${product.material}`);
  } else if (aiMaterial && prodMaterial) {
    materialScore = 4;
  } else {
    materialScore = 2;
  }

  // 6. Description / Semantic Token Similarity (Max 10 pts)
  let descriptionScore = 0;
  const aiDescTokens = (analysis.description || '').toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const prodDescTokens = product.description.toLowerCase().split(/\W+/).filter((w) => w.length > 3);

  let descCommon = 0;
  for (const dt of aiDescTokens) {
    if (prodDescTokens.includes(dt)) {
      descCommon++;
    }
  }

  descriptionScore = Math.min(10, Math.round((descCommon / Math.max(aiDescTokens.length, 1)) * 20));
  if (descCommon > 2) {
    reasons.push(`High semantic contextual similarity`);
  }

  const rawScore = categoryScore + keywordScore + colorScore + styleScore + materialScore + descriptionScore;
  const finalScore = Math.max(15, Math.min(99, rawScore));

  let tier: MatchTier = 'Alternative';
  if (finalScore >= 90) {
    tier = 'Very strong match';
  } else if (finalScore >= 75) {
    tier = 'Strong match';
  } else if (finalScore >= 60) {
    tier = 'Similar';
  } else {
    tier = 'Alternative';
  }

  return {
    score: finalScore,
    tier,
    breakdown: {
      categoryScore,
      keywordScore,
      colorScore,
      styleScore,
      materialScore,
      descriptionScore,
      reasons: reasons.slice(0, 4),
    },
  };
}

export function rankProducts(catalog: Product[], analysis: AIAnalysisResult): RankedProduct[] {
  const ranked = catalog.map((product) => {
    const { score, tier, breakdown } = calculateProductMatch(product, analysis);
    return {
      ...product,
      matchScore: score,
      matchTier: tier,
      matchBreakdown: breakdown,
    };
  });

  // Sort descending by matchScore
  return ranked.sort((a, b) => b.matchScore - a.matchScore);
}
