import { useEffect, useState } from "react";
import type { Product, PriceResult, Reason } from "../../src/types";
import sample from "../../data/products.json";

const products = sample as Product[];

const REASON_LABEL: Record<Reason, string> = {
  UNDERCUT: "Ниже конкурента",
  AT_MIN: "Достигнут минимум",
  AT_MAX: "Достигнут максимум",
  NO_COMPETITORS: "Нет конкурентов",
};

const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₸";

export function App() {
  const [results, setResults] = useState<PriceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reprice() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/reprice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(products),
      });
      if (!res.ok) throw new Error(`Ошибка сервера: ${res.status}`);
      setResults((await res.json()) as PriceResult[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void reprice(); }, []);

  const nameBySku = new Map(products.map((p) => [p.sku, p.name]));

  return (
    <main>
      <h1>SaleScout — прайс-бот</h1>
      <button onClick={reprice} disabled={loading}>
        {loading ? "Считаем…" : "Пересчитать"}
      </button>
      {error && <p className="error">{error} (запущен ли сервер на :3001?)</p>}
      <table>
        <thead>
          <tr><th>SKU</th><th>Название</th><th>Старая цена</th><th>Новая цена</th><th>Причина</th></tr>
        </thead>
        <tbody>
          {results.map((r) => {
            const diff = r.newPrice - r.oldPrice;
            return (
              <tr key={r.sku}>
                <td>{r.sku}</td>
                <td>{nameBySku.get(r.sku)}</td>
                <td>{fmt(r.oldPrice)}</td>
                <td className={diff < 0 ? "down" : diff > 0 ? "up" : ""}>{fmt(r.newPrice)}</td>
                <td><span className={`badge ${r.reason}`}>{REASON_LABEL[r.reason]}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
