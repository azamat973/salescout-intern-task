import { describe, it, expect } from "vitest";
import { calculatePrice } from "./pricing";
import type { Product } from "./types";
import products from "../data/products.json";
import expected from "../data/expected.json";

const make = (over: Partial<Product>): Product => ({
  sku: "X", name: "X", myPrice: 1000, minPrice: 100, maxPrice: 200, step: 1, competitors: [], ...over,
});
const comp = (price: number, inStock = true) => ({ seller: "s", price, inStock });

describe("calculatePrice", () => {
  it("совпадает с data/expected.json", () => {
    expect((products as Product[]).map(calculatePrice)).toEqual(expected);
  });
  it("UNDERCUT", () => {
    const r = calculatePrice(make({ minPrice: 370000, maxPrice: 420000, step: 10, competitors: [comp(384990), comp(386500)] }));
    expect(r).toMatchObject({ newPrice: 384980, reason: "UNDERCUT" });
  });
  it("AT_MIN", () => {
    const r = calculatePrice(make({ minPrice: 180000, maxPrice: 210000, step: 100, competitors: [comp(175000)] }));
    expect(r).toMatchObject({ newPrice: 180000, reason: "AT_MIN" });
  });
  it("AT_MAX", () => {
    const r = calculatePrice(make({ minPrice: 100000, maxPrice: 125000, step: 1, competitors: [comp(150000)] }));
    expect(r).toMatchObject({ newPrice: 125000, reason: "AT_MAX" });
  });
  it("дробные цена и шаг округляются вниз", () => {
    const r = calculatePrice(make({ minPrice: 330000, maxPrice: 380000, step: 0.5, competitors: [comp(349999.9)] }));
    expect(r).toMatchObject({ newPrice: 349999, reason: "UNDERCUT" });
  });
  it("NO_COMPETITORS: пустой список", () => {
    expect(calculatePrice(make({}))).toMatchObject({ newPrice: 200, reason: "NO_COMPETITORS" });
  });
  it("NO_COMPETITORS: все не в наличии игнорируются", () => {
    const r = calculatePrice(make({ competitors: [comp(10, false), comp(20, false)] }));
    expect(r).toMatchObject({ newPrice: 200, reason: "NO_COMPETITORS" });
  });
  it("товар не в наличии не влияет на best", () => {
    const r = calculatePrice(make({ minPrice: 0, maxPrice: 1000, step: 0, competitors: [comp(50, false), comp(150)] }));
    expect(r).toMatchObject({ newPrice: 150, reason: "UNDERCUT" });
  });
  it("границы включительно", () => {
    expect(calculatePrice(make({ step: 0, competitors: [comp(100)] }))).toMatchObject({ newPrice: 100, reason: "UNDERCUT" });
    expect(calculatePrice(make({ step: 0, competitors: [comp(200)] }))).toMatchObject({ newPrice: 200, reason: "UNDERCUT" });
  });
  it("не ломается на float-погрешности (10.3 - 0.3)", () => {
    const r = calculatePrice(make({ minPrice: 0, maxPrice: 100, step: 0.3, competitors: [comp(10.3)] }));
    expect(r.newPrice).toBe(10);
  });
  it("oldPrice = myPrice и не влияет на расчёт", () => {
    const a = calculatePrice(make({ myPrice: 1, competitors: [comp(150)] }));
    const b = calculatePrice(make({ myPrice: 999999, competitors: [comp(150)] }));
    expect(a.oldPrice).toBe(1);
    expect(b.oldPrice).toBe(999999);
    expect(a.newPrice).toBe(b.newPrice);
  });
});
