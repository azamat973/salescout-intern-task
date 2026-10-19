
import { describe, expect, it } from "vitest";
import { calculatePrice } from "./pricing";

describe("calculatePrice", () => {
  it("undercuts the cheapest competitor", () => {
    const result = calculatePrice({
      sku: "SKU-1",
      name: "Product",
      currentPrice: 1000,
      competitors: [{ price: 900 }, { price: 950 }],
      undercutAmount: 1,
    });

    expect(result.newPrice).toBe(899);
  });

  it("keeps the price when there are no competitors", () => {
    const result = calculatePrice({
      sku: "SKU-2",
      name: "Product",
      currentPrice: 1000,
      competitors: [],
    });

    expect(result.newPrice).toBe(1000);
  });

  it("does not go below the minimum price", () => {
    const result = calculatePrice({
      sku: "SKU-3",
      name: "Product",
      currentPrice: 1000,
      competitors: [{ price: 500 }],
      minPrice: 600,
    });

    expect(result.newPrice).toBe(600);
  });

  it("rejects a non-positive current price", () => {
    expect(() =>
      calculatePrice({
        sku: "SKU-4",
        name: "Product",
        currentPrice: 0,
        competitors: [],
      }),
    ).toThrow();
  });
});
