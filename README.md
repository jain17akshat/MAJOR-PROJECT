# Aadish Traders IMS — Startup Guide

## Prerequisites
- Node.js v18+
- MongoDB running locally on port 27017 (or update MONGODB_URI in backend/.env)

---

## Step 1 — Install Backend Dependencies
```
cd backend
npm install
```

## Step 2 — Install Frontend Dependencies
```
cd frontend
npm install
```

## Step 3 — Seed the Database (First Run)
```
cd backend
npm run seed
```
This creates:
- 20 grocery products (rice, wheat, pulses, oils, spices, etc.)
- 4 suppliers
- 30 days of sales history
- Demo users

## Step 4 — Start Backend
```
cd backend
npm run dev
```
Backend runs on: http://localhost:5000

## Step 5 — Start Frontend (new terminal)
```
cd frontend
npm run dev
```
Frontend runs on: http://localhost:5173

---

## Features Available
- Dashboard with KPI cards and live charts
- Products — add/edit/delete, filter by category/stock/expiry, export XLSX
- Stock — stock-in and stock-out with transaction history
- Sales — new sale form with real-time totals, sales history
- Analytics — trends, top products, slow moving, restock suggestions
- Reports — one-click Excel export
- Suppliers — full CRUD
- Notifications — low stock and expiry alerts
- Audit Logs — all changes tracked
- Users — user management
- Settings — language switcher (EN/HI/MR)

## API Health Check
http://localhost:5000/api/health
