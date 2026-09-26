# Mistrify — Cooperative Services Platform

A full-stack mobile-first platform connecting customers with verified cooperative workers across India.

## 📁 Monorepo Structure

```
mistrify/
├── frontend/   # Next.js 15 App (UI + API Routes)
└── backend/    # Prisma Schema + Database
```

---

## 🚀 Frontend — Next.js App

**Location:** `frontend/`

Built with **Next.js 15**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and **Capacitor** for native Android/iOS support.

### Run locally
```bash
cd frontend
npm install
npm run dev
```

### Tech Stack
- Next.js 15 (App Router)
- Prisma ORM (SQLite dev / PostgreSQL prod)
- NextAuth.js (Session management)
- Tailwind CSS + Framer Motion
- Capacitor (Android native)
- Lucide React Icons

---

## 🗄️ Backend — Database Schema

**Location:** `backend/prisma/`

Prisma schema with full relational model for:
- Users (Customer / Worker / Admin roles)
- Bookings & Status History
- Payments & Invoices
- Reviews & Ratings
- Cooperatives & Worker Profiles
- Notifications
- Service Categories & Subcategories
- Test Questions & Assessments

### Setup
```bash
cd backend
cp .env.example .env
# Add DATABASE_URL to .env
npx prisma db push
npx prisma generate
```

---

## 📱 Features

- 🔐 Role-based auth (Customer / Worker / Admin)
- 📍 Real-time GPS-based worker tracking
- 💳 Online payment with invoice generation
- ⭐ Customer reviews visible on worker profile
- 🏛️ 20+ Indian Labour Cooperative Societies integrated
- 📋 Worker skill assessment MCQ system
- 🌏 Multi-language support (EN, HI, MR, GU, TA)
- 📲 Native Android app via Capacitor

---

## 🔧 Environment Variables

Create `.env.local` in `frontend/`:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

---

*Built for Hackathon — Mistrify Technologies 2026*
