# SaleScout — мини прайс-бот

Мини-версия бота, который выставляет цену на 1 шаг ниже самого дешёвого конкурента в наличии, не выходя за `minPrice` / `maxPrice`.

- `src/pricing.ts` — чистая функция `calculatePrice`
- `server/` — Express API (`POST /reprice`)
- `web/` — React + Vite, таблица «было / стало»
- тесты: vitest (`src/pricing.test.ts`, `server/app.test.ts`)

## Запуск (Node.js 20+)

```bash
npm install
npm --prefix web install

npm test            # тесты
npm run server      # API на http://localhost:3001
npm run web         # фронтенд на http://localhost:5173 (в другом терминале)
```

Фронтенд проксирует `/reprice` на `localhost:3001`, поэтому сначала запустите сервер.

## API

```bash
curl -X POST localhost:3001/reprice -H 'Content-Type: application/json' -d @data/products.json
```

- `200` — `PriceResult[]` в том же порядке
- `400` — тело не массив, невалидный товар или битый JSON

## Заметки по расчёту

`floor(best - step)` считается с поправкой `1e-9`, чтобы погрешность float (`10.3 - 0.3 = 9.999999999999998`) не давала лишний тенге вниз.
