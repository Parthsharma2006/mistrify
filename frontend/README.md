# CoopGig — Cooperative Gig Services Platform

> A cooperative-owned digital marketplace connecting verified skilled workers from Labour Cooperative Societies with customers who need household and community services.

Built for **Smart India Hackathon (SIH)**.

---

## 🏗️ Technology Stack

| Layer | Technology |
|:---|:---|
| **Framework** | Next.js 14 (App Router) + TypeScript |
| **UI** | Tailwind CSS v4 + Framer Motion |
| **Database** | PostgreSQL + Prisma ORM v5 |
| **Authentication** | NextAuth.js v5 (Auth.js) — Credentials Provider + JWT |
| **Validation** | Zod |
| **Icons** | Lucide React |
| **Language** | TypeScript (strict mode) |

---

## 📁 Project Structure

```
cooperative-platform/
├── prisma/
│   ├── schema.prisma          # Database schema (6 models)
│   ├── seed.ts                # Seed data script
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── (dashboard)/       # Protected dashboards
│   │   │   ├── customer/      # Customer dashboard + profile
│   │   │   ├── worker/        # Worker dashboard + profile + orders + earnings + history
│   │   │   ├── admin/         # Admin dashboard
│   │   │   └── layout.tsx     # Shared auth guard + top nav
│   │   ├── api/               # API route handlers
│   │   │   ├── auth/          # Registration + NextAuth
│   │   │   ├── users/         # User profile
│   │   │   ├── customers/     # Customer profile
│   │   │   ├── workers/       # Worker profile
│   │   │   ├── categories/    # Service categories
│   │   │   ├── cooperatives/  # Cooperatives list
│   │   │   └── admin/         # Admin stats
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Global styles + theme
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── utils.ts           # Utility functions
│   │   └── validations/       # Zod validation schemas
│   ├── types/                 # TypeScript types
│   ├── constants/             # App constants
│   └── i18n/                  # Translation files (en, hi)
├── .env.example               # Environment variable template
├── .env.local                 # Local environment (gitignored)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **PostgreSQL** installed and running
- **npm** (comes with Node.js)

### 1. Clone & Install

```bash
cd cooperative-platform
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/cooperative_platform?schema=public"
NEXTAUTH_SECRET="generate-a-random-32-char-string"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Set Up Database

Create the PostgreSQL database:

```bash
# In psql or pgAdmin, create the database:
CREATE DATABASE cooperative_platform;
```

Push the schema and seed data:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with demo data
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Demo Credentials

| Role | Mobile | Password |
|:---|:---|:---|
| **Customer** | `9876543210` | `Demo@1234` |
| **Worker** | `9876543211` | `Demo@1234` |
| **Admin** | `9876543212` | `Admin@5678` |

> ⚠️ These are for development only. Never use these in production.

---

## 📊 Database Entities

| Entity | Description |
|:---|:---|
| **User** | Core user model with role (CUSTOMER/WORKER/ADMIN), mobile, email, password hash |
| **CustomerProfile** | Customer-specific data — address, city, state, pincode |
| **WorkerProfile** | Worker-specific data — category, experience, cooperative, verification status |
| **Cooperative** | Labour cooperative society details |
| **ServiceCategory** | 10 service categories (Electrician, Plumber, etc.) |
| **ServiceSubcategory** | Sub-services under each category |

---

## 🔗 API Routes

### Authentication
| Method | Route | Description |
|:---|:---|:---|
| POST | `/api/auth/[...nextauth]` | NextAuth (login/logout/session) |
| POST | `/api/auth/register/customer` | Customer registration |
| POST | `/api/auth/register/worker` | Worker registration |

### Profiles
| Method | Route | Description |
|:---|:---|:---|
| GET/PUT | `/api/users/me` | Current user profile |
| GET/PUT | `/api/customers/profile` | Customer profile (CUSTOMER only) |
| GET/PUT | `/api/workers/profile` | Worker profile (WORKER only) |

### Data
| Method | Route | Description |
|:---|:---|:---|
| GET | `/api/categories` | All service categories |
| GET | `/api/categories/[id]/subcategories` | Subcategories for a category |
| GET | `/api/cooperatives` | Active cooperatives |
| GET | `/api/admin/stats` | Dashboard statistics (ADMIN only) |

---

## 🛡️ Security & Authorization

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Sessions**: 24-hour expiry, role embedded in token
- **Middleware Protection**: Server-side route guards enforce role-based access
- **API Authorization**: Every protected endpoint verifies session and role
- **Input Validation**: Zod schemas on both frontend and API
- **No plaintext secrets**: All secrets via environment variables

### Role-Based Access Control

| Route | CUSTOMER | WORKER | ADMIN |
|:---|:---|:---|:---|
| `/customer/*` | ✅ | ❌ Redirect | ❌ Redirect |
| `/worker/*` | ❌ Redirect | ✅ | ❌ Redirect |
| `/admin/*` | ❌ Redirect | ❌ Redirect | ✅ |

---

## 🌐 Internationalization

Foundation prepared for English and Hindi:

- `src/i18n/en.json` — English translations
- `src/i18n/hi.json` — Hindi translations

Translation keys cover: navigation, auth forms, dashboards, errors.

---

## 🎨 UI/UX Design

- **Dark theme** with teal/cyan gradient accents
- **Glassmorphism** cards with backdrop blur
- **Framer Motion** animations throughout
- **Mobile-first** responsive design
- **Bottom navigation** on mobile for worker/customer dashboards
- **Sidebar navigation** for admin dashboard
- **Animated gradient** hero section
- **Real-time search** filtering on categories

---

## 📋 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio (DB GUI)
npm run db:migrate   # Run migrations
```

---

## 🏛️ Architecture Decisions

1. **Monolithic Next.js App**: Single codebase for frontend + API. Simplifies deployment and development for hackathon MVP. The modular folder structure allows extracting microservices later.

2. **App Router**: Using Next.js App Router with route groups `(auth)` and `(dashboard)` for clean separation of concerns.

3. **Credentials Provider**: Using mobile + password authentication (suitable for Indian market). Can add OTP, Google OAuth in later phases.

4. **Prisma ORM**: Type-safe database access with auto-generated types. Easy migration path for schema changes in future phases.

5. **Database-Driven Categories**: Service categories stored in database (not hardcoded) — administrators can add/edit categories in future phases.

6. **Verification Pipeline**: Workers start with `PENDING` verification status. Admin verification workflow will be added in Phase 2.

---

## 📅 Phase 1 Completed Features

- ✅ Project architecture and folder structure
- ✅ PostgreSQL database with 6 entities
- ✅ User authentication (signup, login, logout, sessions)
- ✅ Role-based access control (CUSTOMER, WORKER, ADMIN)
- ✅ Customer registration with multi-step form
- ✅ Worker registration with database-driven category selection
- ✅ Admin login (via seed — no public signup)
- ✅ Customer dashboard with service categories from DB
- ✅ Worker dashboard with verification status banner
- ✅ Admin dashboard with real database statistics
- ✅ Profile pages with edit functionality
- ✅ Protected routes (middleware + API level)
- ✅ Seed data (10 categories, subcategories, demo users)
- ✅ Input validation (frontend + backend)
- ✅ Error handling with user-friendly messages
- ✅ i18n foundation (English + Hindi)
- ✅ Environment variable configuration
- ✅ Super cool UI with animations

## 🚫 Intentionally Postponed (Future Phases)

- GPS tracking & Google Maps
- Worker matching algorithm
- AI demand forecasting
- Dynamic pricing
- Emergency services
- Zone management
- ITI certificate verification
- Skill tests
- Work portfolio
- Payments (UPI, digital)
- Digital invoices
- Ratings & reviews
- Before/after photo evidence
- Push notifications
- Insurance integration

---

## 📄 License

Built for Smart India Hackathon — Educational/Competition purposes.
