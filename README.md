# Ntechzy Store

Full-stack e-commerce app: **React (Vite)** + **Node/Express** + **MongoDB**.

## Features

- Product listing (seeded into MongoDB from local data)
- Search & category filters via API
- Cart persisted in MongoDB
- Checkout with dummy payment (orders in MongoDB)
- Order confirmation
- Register / Login with JWT
- Responsive UI

## Setup

```bash
cp .env.example .env
# Add MONGODB_URI and JWT_SECRET

npm install
npm run dev
```

- Frontend: http://localhost:3000  
- API: http://localhost:5001/api/health  

## Deploy (Vercel)

Add env vars `MONGODB_URI` and `JWT_SECRET`, then deploy. Allow Atlas network access from `0.0.0.0/0`.
