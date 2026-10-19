import type { Product, PriceResult } from "./types";

// Защита от ошибок float: 10.3 - 0.3 = 9.999999999999998, а должно быть 10.
const EPS = 1e-9;

/**
 * Чистая функция: рассчитывает новую цену для одного товара.
 * Правила — см. README, раздел «Правила расчёта цены».
 */
export function calculatePrice(product: Product): PriceResult {
  const { sku, myPrice, minPrice, maxPrice, step, competitors } = product;
  const base = { sku, oldPrice: myPrice };

  const prices = competitors.filter((c) => c.inStock).map((c) => c.price);
  if (prices.length === 0) {
    return { ...base, newPrice: maxPrice, reason: "NO_COMPETITORS" };
  }

  const best = Math.min(...prices);
  const candidate = Math.floor(best - step + EPS);

  if (candidate < minPrice) return { ...base, newPrice: minPrice, reason: "AT_MIN" };
  if (candidate > maxPrice) return { ...base, newPrice: maxPrice, reason: "AT_MAX" };
  return { ...base, newPrice: candidate, reason: "UNDERCUT" };
}
