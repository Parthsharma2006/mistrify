# Backend — Prisma Database Schema

Contains the full Prisma database schema for the Mistrify platform.

## Models
- **User** — Customers, Workers, Admins
- **WorkerProfile** — Skills, Cooperative, Verification
- **CustomerProfile** — Address, Preferences
- **Booking** — Service requests with status machine
- **Payment** & **Invoice** — Online payments
- **Review** — Customer ratings for workers
- **Cooperative** — 20+ Indian Labour Societies
- **ServiceCategory** & **Subcategory** — Service catalog
- **TestQuestion** & **TestAttempt** — Worker skill MCQ
- **Notification** — In-app notifications

## Setup
```bash
npm install prisma @prisma/client
cp .env.example .env
# Set DATABASE_URL in .env
npx prisma db push
npx prisma generate
```
