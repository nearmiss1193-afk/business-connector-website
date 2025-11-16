/**
 * Lead Scoring Algorithm
 * Calculates property and lead scores based on multiple factors
 */

interface ScoringFactors {
  views: number;
  leads: number;
  conversions: number;
  marketTrend: number;
  priceCompetitiveness: number;
  daysOnMarket: number;
  engagementRate: number;
}

interface LeadScoringInput {
  propertyViews: number;
  totalLeads: number;
  conversions: number;
  viewToLeadRate: number;
  leadToConversionRate: number;
  avgLeadsPerDay: number;
  marketHeat: 'cold' | 'warm' | 'hot' | 'very_hot';
  daysOnMarket: number;
  pricePercentilInMarket: number; // 0-100, where 50 is median
  leadEngagementTime: number; // seconds
  leadSource: string;
}

/**
 * Calculate property lead score (0-100)
 * Weighted scoring based on multiple factors
 */
export function calculatePropertyScore(input: LeadScoringInput): {
  score: number;
  factors: ScoringFactors;
} {
  const factors: ScoringFactors = {
    views: 0,
    leads: 0,
    conversions: 0,
    marketTrend: 0,
    priceCompetitiveness: 0,
    daysOnMarket: 0,
    engagementRate: 0,
  };

  // 1. View Score (20% weight) - More views = higher score
  // Normalize: 0 views = 0, 100+ views = 20 points
  factors.views = Math.min((input.propertyViews / 100) * 20, 20);

  // 2. Lead Score (30% weight) - More leads = higher score
  // Normalize: 0 leads = 0, 50+ leads = 30 points
  factors.leads = Math.min((input.totalLeads / 50) * 30, 30);

  // 3. Conversion Score (20% weight) - Higher conversion rate = higher score
  // Normalize: 0% = 0, 10%+ = 20 points
  factors.conversions = Math.min((input.leadToConversionRate / 10) * 20, 20);

  // 4. Market Trend Score (10% weight)
  const marketHeatScores = {
    cold: 2,
    warm: 5,
    hot: 8,
    very_hot: 10,
  };
  factors.marketTrend = marketHeatScores[input.marketHeat];

  // 5. Price Competitiveness (10% weight)
  // Properties priced near median (40-60 percentile) score higher
  const priceDistance = Math.abs(input.pricePercentilInMarket - 50);
  factors.priceCompetitiveness = Math.max(10 - (priceDistance / 50) * 10, 0);

  // 6. Days on Market (5% weight)
  // Newer listings score higher
  // 0-7 days = 5, 8-30 days = 3, 31+ days = 1
  if (input.daysOnMarket <= 7) {
    factors.daysOnMarket = 5;
  } else if (input.daysOnMarket <= 30) {
    factors.daysOnMarket = 3;
  } else {
    factors.daysOnMarket = 1;
  }

  // 7. Engagement Rate (5% weight)
  // View to lead conversion rate
  factors.engagementRate = Math.min((input.viewToLeadRate / 20) * 5, 5);

  // Sum all factors (max 100)
  const totalScore =
    factors.views +
    factors.leads +
    factors.conversions +
    factors.marketTrend +
    factors.priceCompetitiveness +
    factors.daysOnMarket +
    factors.engagementRate;

  return {
    score: Math.min(Math.round(totalScore * 10) / 10, 100),
    factors,
  };
}

interface IndividualLeadScoringInput {
  propertyScore: number;
  leadEngagementTime: number; // seconds spent on property
  leadSource: 'property_detail' | 'search' | 'email' | 'ad' | 'other';
  leadQualificationData?: {
    priceRange?: [number, number];
    bedroomNeeds?: number;
    timelineMonths?: number;
    preApproved?: boolean;
  };
  marketHeat: 'cold' | 'warm' | 'hot' | 'very_hot';
  competingLeads?: number; // Number of other leads on same property
}

/**
 * Calculate individual lead quality score (0-100)
 */
export function calculateLeadScore(input: IndividualLeadScoringInput): {
  score: number;
  quality: 'hot' | 'warm' | 'cold' | 'unqualified';
  factors: {
    propertyScore: number;
    engagementScore: number;
    sourceScore: number;
    qualificationScore: number;
    competitionScore: number;
  };
} {
  const factors = {
    propertyScore: 0,
    engagementScore: 0,
    sourceScore: 0,
    qualificationScore: 0,
    competitionScore: 0,
  };

  // 1. Property Score (40% weight)
  factors.propertyScore = input.propertyScore * 0.4;

  // 2. Engagement Score (25% weight)
  // More time spent = higher engagement
  // 0-30 sec = 5, 30-120 sec = 15, 120+ sec = 25
  let engagementPoints = 0;
  if (input.leadEngagementTime < 30) {
    engagementPoints = 5;
  } else if (input.leadEngagementTime < 120) {
    engagementPoints = 15;
  } else {
    engagementPoints = 25;
  }
  factors.engagementScore = engagementPoints;

  // 3. Lead Source Score (15% weight)
  const sourceScores = {
    property_detail: 15, // Direct property page = most qualified
    search: 12, // Found through search
    email: 10, // Email campaign
    ad: 8, // Paid ad
    other: 5,
  };
  factors.sourceScore = sourceScores[input.leadSource];

  // 4. Qualification Score (15% weight)
  let qualificationPoints = 0;
  if (input.leadQualificationData) {
    const { priceRange, bedroomNeeds, timelineMonths, preApproved } =
      input.leadQualificationData;

    if (priceRange) qualificationPoints += 3;
    if (bedroomNeeds) qualificationPoints += 3;
    if (timelineMonths && timelineMonths <= 3) qualificationPoints += 5;
    if (preApproved) qualificationPoints += 4;
  }
  factors.qualificationScore = Math.min(qualificationPoints, 15);

  // 5. Competition Score (5% weight)
  // Fewer competing leads = higher priority
  let competitionPoints = 5;
  if (input.competingLeads && input.competingLeads > 0) {
    competitionPoints = Math.max(5 - input.competingLeads, 0);
  }
  factors.competitionScore = competitionPoints;

  // Calculate total score
  const totalScore =
    factors.propertyScore +
    factors.engagementScore +
    factors.sourceScore +
    factors.qualificationScore +
    factors.competitionScore;

  // Determine quality tier
  let quality: 'hot' | 'warm' | 'cold' | 'unqualified';
  if (totalScore >= 75) {
    quality = 'hot';
  } else if (totalScore >= 50) {
    quality = 'warm';
  } else if (totalScore >= 25) {
    quality = 'cold';
  } else {
    quality = 'unqualified';
  }

  return {
    score: Math.round(totalScore * 10) / 10,
    quality,
    factors,
  };
}

/**
 * Calculate market heat score (0-100)
 */
export function calculateMarketHeat(input: {
  totalProperties: number;
  activeListings: number;
  avgDaysOnMarket: number;
  priceChangePercent: number;
  leadsPerProperty: number;
  conversionRate: number;
}): {
  score: number;
  heat: 'cold' | 'warm' | 'hot' | 'very_hot';
} {
  let score = 50; // Start at neutral

  // 1. Days on Market (lower = hotter)
  if (input.avgDaysOnMarket < 7) score += 20;
  else if (input.avgDaysOnMarket < 14) score += 15;
  else if (input.avgDaysOnMarket < 30) score += 10;
  else if (input.avgDaysOnMarket < 60) score += 5;

  // 2. Price Appreciation (positive = hotter)
  if (input.priceChangePercent > 5) score += 15;
  else if (input.priceChangePercent > 2) score += 10;
  else if (input.priceChangePercent > 0) score += 5;
  else if (input.priceChangePercent < -5) score -= 15;
  else if (input.priceChangePercent < -2) score -= 10;

  // 3. Leads Per Property (higher = hotter)
  if (input.leadsPerProperty > 3) score += 15;
  else if (input.leadsPerProperty > 2) score += 10;
  else if (input.leadsPerProperty > 1) score += 5;

  // 4. Conversion Rate (higher = hotter)
  if (input.conversionRate > 20) score += 10;
  else if (input.conversionRate > 10) score += 5;

  // 5. Inventory Ratio (lower = hotter)
  const inventoryRatio = input.activeListings / input.totalProperties;
  if (inventoryRatio < 0.05) score += 15;
  else if (inventoryRatio < 0.1) score += 10;
  else if (inventoryRatio < 0.15) score += 5;

  // Clamp score between 0-100
  score = Math.max(0, Math.min(100, score));

  // Determine heat level
  let heat: 'cold' | 'warm' | 'hot' | 'very_hot';
  if (score >= 80) {
    heat = 'very_hot';
  } else if (score >= 60) {
    heat = 'hot';
  } else if (score >= 40) {
    heat = 'warm';
  } else {
    heat = 'cold';
  }

  return {
    score: Math.round(score * 10) / 10,
    heat,
  };
}

/**
 * Rank properties within a market
 */
export function rankPropertiesInMarket(
  properties: Array<{ id: number; score: number }>
): Array<{ id: number; score: number; rank: number; percentile: number }> {
  // Sort by score descending
  const sorted = [...properties].sort((a, b) => b.score - a.score);

  // Calculate ranks and percentiles
  return sorted.map((prop, index) => ({
    ...prop,
    rank: index + 1,
    percentile: Math.round(((sorted.length - index) / sorted.length) * 100),
  }));
}

/**
 * Predict lead conversion probability (0-100%)
 */
export function predictConversionProbability(input: {
  leadScore: number;
  leadQuality: 'hot' | 'warm' | 'cold' | 'unqualified';
  propertyScore: number;
  marketHeat: 'cold' | 'warm' | 'hot' | 'very_hot';
  historicalConversionRate: number;
}): number {
  let probability = input.historicalConversionRate || 15;

  // Adjust based on lead quality
  const qualityMultipliers = {
    hot: 3.0,
    warm: 1.5,
    cold: 0.7,
    unqualified: 0.2,
  };
  probability *= qualityMultipliers[input.leadQuality];

  // Adjust based on property score
  probability *= 1 + (input.propertyScore - 50) / 100;

  // Adjust based on market heat
  const heatMultipliers = {
    very_hot: 1.4,
    hot: 1.2,
    warm: 1.0,
    cold: 0.8,
  };
  probability *= heatMultipliers[input.marketHeat];

  // Clamp between 0-100
  return Math.max(0, Math.min(100, Math.round(probability * 10) / 10));
}
