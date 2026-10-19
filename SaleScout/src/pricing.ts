
export interface Competitor {
  price: number;
}

export interface Product {
  sku: string;
  name: string;
  currentPrice: number;
  competitors: Competitor[];
  minPrice?: number;
  maxPrice?: number;
  undercutAmount?: number;
}

export interface PricingResult {
  sku: string;
  name: string;
  oldPrice: number;
  newPrice: number;
  reason: string;
}

export function calculatePrice(product: Product): PricingResult {
  const {
    sku,
    name,
    currentPrice,
    competitors,
    minPrice = 0,
    maxPrice = Number.MAX_SAFE_INTEGER,
    undercutAmount = 1,
  } = product;

  if (!sku || !name.trim()) {
    throw new Error("SKU and product name are required");
  }

  if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
    throw new Error("Current price must be positive");
  }

  if (
    !Number.isFinite(minPrice) ||
    !Number.isFinite(maxPrice) ||
    minPrice < 0 ||
    maxPrice < minPrice
  ) {
    throw new Error("Invalid price limits");
  }

  if (!Number.isFinite(undercutAmount) || undercutAmount < 0) {
    throw new Error("Undercut amount cannot be negative");
  }

  const validPrices = competitors
    .map((competitor) => competitor.price)
    .filter((price) => Number.isFinite(price) && price > 0);

  const cheapestCompetitor = validPrices.length
    ? Math.min(...validPrices)
    : null;

  let targetPrice = currentPrice;
  let reason = "No valid competitor prices; price unchanged";

  if (cheapestCompetitor !== null) {
    targetPrice = cheapestCompetitor - undercutAmount;
    reason = "Priced below the cheapest competitor";
  }

  const newPrice = Math.min(
    maxPrice,
    Math.max(minPrice, targetPrice),
  );

  return {
    sku,
    name,
    oldPrice: currentPrice,
    newPrice,
    reason:
      newPrice === targetPrice
        ? reason
        : "Price adjusted to configured limits",
  };
}
