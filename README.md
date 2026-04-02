# FootballFanStore

FootballFanStore is now a polished storefront MVP for football jerseys with a real TypeScript backend, shared catalog data, guest checkout, newsletter signup, contact capture, and a cleaner vanilla frontend.

## What's New

- Rebuilt the landing page into a data-driven storefront
- Fixed broken encoding issues such as rupee symbols and corrupted promo text
- Removed demo-only login/signup behavior and replaced it with guest checkout
- Added a persistent cart using `localStorage`
- Replaced `alert` and `prompt` flows with:
  - live search modal
  - quick view modal
  - cart drawer
  - toast notifications
- Added backend endpoints for:
  - products
  - orders
  - newsletter subscriptions
  - contact messages
  - health checks
- Centralized product content in `data/products.json`

## Stack

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: TypeScript on Node.js
- Persistence: JSON files in `data/`

## Project Structure

```text
footballfanstoreraw/
|- data/
|  |- contacts.json
|  |- newsletter.json
|  |- orders.json
|  `- products.json
|- images/
|- src/
|  |- lib/
|  |  `- store.ts
|  |- server.ts
|  `- types.ts
|- index.html
|- package.json
|- script.js
|- style.css
|- tsconfig.json
`- README.md
```

## API Endpoints

- `GET /api/health`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/orders`
- `POST /api/newsletter`
- `POST /api/contact`

### Example Order Payload

```json
{
  "items": [
    {
      "productId": "wc2026-argentina-home",
      "quantity": 1,
      "size": "M"
    }
  ],
  "customer": {
    "fullName": "Alex Fan",
    "email": "alex@example.com",
    "phone": "+91 99999 99999",
    "city": "Mumbai",
    "address": "Bandra West",
    "pincode": "400050",
    "notes": "Leave with security if unavailable"
  }
}
```

## Run Locally

Node.js is required.

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the app:

```text
http://localhost:3000
```

## Production Build

```bash
npm run build
npm start
```

## Data Notes

- `data/products.json` is the shared catalog source for both frontend and backend
- `data/orders.json` stores mock checkout submissions
- `data/newsletter.json` stores newsletter signups
- `data/contacts.json` stores support and custom-order requests

## Current MVP Scope

- Guest checkout only
- No payment gateway
- No user accounts or admin panel
- File-based persistence instead of a database

## Suggested Next Steps

- Add order management or admin views
- Introduce product filtering by size and price
- Move persistence to SQLite or Postgres when multi-user traffic matters
- Add automated API and frontend tests once Node is installed in the environment
