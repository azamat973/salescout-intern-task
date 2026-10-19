import express from "express";
import { calculatePrice } from "../src/pricing";
import type { Product } from "../src/types";

function isProduct(p: unknown): p is Product {
  if (typeof p !== "object" || p === null) return false;
  const o = p as Record<string, unknown>;
  const nums = ["myPrice", "minPrice", "maxPrice", "step"];
  return (
    typeof o.sku === "string" &&
    typeof o.name === "string" &&
    nums.every((k) => typeof o[k] === "number" && Number.isFinite(o[k] as number)) &&
    Array.isArray(o.competitors) &&
    o.competitors.every(
      (c) =>
        typeof c === "object" && c !== null &&
        typeof (c as Record<string, unknown>).price === "number" &&
        typeof (c as Record<string, unknown>).inStock === "boolean",
    )
  );
}

export function createApp() {
  const app = express();
  app.use(express.json({ limit: "5mb" }));

  app.post("/reprice", (req, res) => {
    const body: unknown = req.body;
    if (!Array.isArray(body)) {
      res.status(400).json({ error: "Body must be an array of products" });
      return;
    }
    const bad = body.findIndex((p) => !isProduct(p));
    if (bad !== -1) {
      res.status(400).json({ error: `Invalid product at index ${bad}` });
      return;
    }
    res.json((body as Product[]).map(calculatePrice));
  });

  // Некорректный JSON -> 400 вместо 500
  app.use((err: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(err.status === 400 ? 400 : 500).json({ error: err.message });
  });
  return app;
}
