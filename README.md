# Neon POS (MERN + Tailwind)

Point of sale with a register screen, inventory management, sales history and printable receipts.

## Stack
- **Server:** Node, Express, MongoDB (Mongoose), JWT auth, bcrypt
- **Client:** React 18, Vite, React Router, Tailwind CSS v4

## Setup

### 1. API
```bash
cd server
npm install
cp .env.example .env     # set MONGO_URI and JWT_SECRET
npm run seed             # creates admin + sample products
npm run dev              # http://localhost:5000
```

### 2. Client
```bash
cd client
npm install
npm run dev              # http://localhost:5173 (proxies /api to :5000)
```

Login: `admin@pos.local` / `admin123`. Change this password after first login.

## Features
- Register: product grid, search, category filter, cart, discount, tax, cash/card/wallet, receipt print
- Server-side pricing and totals; stock is reserved atomically at checkout (no overselling)
- Inventory (admin): add, edit, delete products, low-stock highlight (5 or fewer)
- Sales (admin): today's orders and revenue, last 100 orders, reopen any receipt
- Roles: `admin` (everything) and `cashier` (register only)

## Config
- `TAX_RATE` in `server/.env` (e.g. `0.17` for 17%)
- Currency: `CURRENCY` constant in `client/src/api.js`
- Atlas DNS error on Windows (`querySrv ECONNREFUSED`): set `USE_GOOGLE_DNS=true`

## API
| Method | Route | Access |
|---|---|---|
| POST | /api/auth/login | public |
| POST | /api/auth/register | admin |
| GET | /api/products | signed in |
| POST/PUT/DELETE | /api/products(/:id) | admin |
| POST | /api/orders | signed in |
| GET | /api/orders, /api/orders/summary | admin |
