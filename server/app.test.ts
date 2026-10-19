import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "./app";
import products from "../data/products.json";
import expected from "../data/expected.json";

describe("POST /reprice", () => {
  const app = createApp();
  it("200 и результаты в том же порядке", async () => {
    const res = await request(app).post("/reprice").send(products);
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expected);
  });
  it("400 если тело не массив", async () => {
    expect((await request(app).post("/reprice").send({ a: 1 })).status).toBe(400);
  });
  it("400 на невалидный товар", async () => {
    expect((await request(app).post("/reprice").send([{ sku: 1 }])).status).toBe(400);
  });
  it("400 на битый JSON", async () => {
    const res = await request(app).post("/reprice").set("Content-Type", "application/json").send("{bad");
    expect(res.status).toBe(400);
  });
});
