# Gear-Manager (GURPS Tactical Logistics / GearForge)

A modern, browser-first, open-source GURPS TTRPG Assistant with Tarkov-style volumetric grid inventory management. The flagship feature is a video-game-feel Gear & Equipment Manager deeply integrated with full GURPS simulation (Basic Lift, five encumbrance levels, hit-location armor, TL/LC/quality, nested containers, multi-location logistics, crafting/alchemy, real-time GM sync).

## 🎯 Project Vision

Gear-Manager aims to bring the precision and depth of GURPS 4e rules to a modern, intuitive web interface. The volumetric grid inventory system provides a tactile, game-like experience for managing equipment, while maintaining full fidelity to GURPS mechanics.

## 🛠️ Tech Stack

- **Next.js 15.1+** (App Router, React 19, Server Components by default)
- **TypeScript** (strict mode)
- **Tailwind CSS 3.4+** + **shadcn/ui** (latest)
- **PixiJS 8.x** (@pixi/react) – 60 fps drag-rotate-collision grids
- **Supabase** (Auth, PostgreSQL, Realtime, Edge Functions)
- **Prisma** (schema & type generation; Supabase as production DB)
- **Zustand** (state management + middleware for inventory)
- **react-hook-form** + **Zod** (forms & validation)
- **lucide-react**, **sonner** (toasts), **next-themes** (dark tactical HUD default)
- **next-pwa** (PWA support)
- **dnd-kit** (grid drag/drop), **date-fns**, **clsx**, **tailwind-merge**

## 📁 Project Structure

```
Gear-Manager/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   ├── (dashboard)/              # Main application routes
│   │   ├── inventory/page.tsx   # Inventory management
│   │   ├── crafting/page.tsx     # Crafting system
│   │   └── gm-tools/page.tsx     # GM utilities
│   ├── api/                      # API routes
│   └── layout.tsx                # Root layout
├── components/
│   ├── ui/                       # shadcn components
│   ├── inventory/                # Inventory components
│   │   ├── GridContainer.tsx     # PixiJS grid
│   │   ├── ItemSprite.tsx         # Item rendering
│   │   ├── PaperDoll.tsx         # Character paper doll
│   │   └── QuickAccessBelt.tsx   # Quick access items
│   ├── gurps/                    # GURPS-specific components
│   │   └── EncumbranceDisplay.tsx
│   └── common/                    # Shared components
├── lib/
│   ├── gurps/                    # Core GURPS rules engine
│   │   ├── index.ts
│   │   ├── encumbrance.ts        # Basic Lift, encumbrance levels
│   │   └── itemTypes.ts          # Item definitions
│   ├── inventory/                # Inventory logic
│   │   ├── gridEngine.ts         # Collision, rotation, placement
│   │   └── itemModel.ts          # Item utilities
│   ├── supabaseClient.ts         # Supabase client
│   └── utils.ts                  # Utilities
├── prisma/
│   └── schema.prisma             # Database schema
├── types/
│   └── index.ts                  # TypeScript types
└── public/
    └── icons/                    # Tactical HUD assets
```

## 🚀 Local Setup

### Prerequisites

- Node.js 18+ and npm
- Supabase account (or local Supabase instance)
- PostgreSQL database (via Supabase or local)

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd ~/Dropbox/Projects/Gear-Manager
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`

3. **Initialize Prisma:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Dropbox + Git Best Practices

This project is designed to work with **Dropbox for file syncing** and **Git for version control**.

### Important Notes:

- ✅ **DO commit:** Source code, configuration files, documentation
- ❌ **DO NOT commit:**
  - `node_modules/`
  - `.next/`
  - `.env*` files (use `.env.local` which is gitignored)
  - Large binaries
  - Build artifacts

### Git Workflow:

1. **Initial setup (one-time):**
   ```bash
   git init
   git branch -M main
   git add .
   git commit -m "Initial commit: Next.js 15 + shadcn + PixiJS scaffolding for Gear-Manager"
   ```

2. **Connect to remote repository:**
   ```bash
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

3. **Daily workflow:**
   ```bash
   git pull origin main
   # Make changes...
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```

### Dropbox Sync:

- Dropbox automatically syncs the project folder across devices
- Git handles version control and collaboration
- Never commit secrets or sensitive data (use `.env.local`)

## 🎮 Features

### Current Implementation

- ✅ Volumetric grid inventory (8×6 tactical vest)
- ✅ Drag & drop items with collision detection
- ✅ 90° rotation support
- ✅ GURPS encumbrance calculations (Basic Lift, 5 levels)
- ✅ Real-time encumbrance display with modifiers
- ✅ Dark tactical HUD theme (Liquid Glass effect)
- ✅ Sample items (M4, magazines, medkit, tactical vest)
- ✅ TypeScript strict mode with full type safety

### Planned Features

- [ ] Supabase integration (auth, database, real-time sync)
- [ ] Nested containers (items inside items)
- [ ] Paper doll for equipped armor
- [ ] Crafting/alchemy system
- [ ] GM tools (real-time character sync)
- [ ] PWA support (offline mode)
- [ ] Multi-character support
- [ ] Item catalog with search/filter
- [ ] Hit location armor management
- [ ] Quality and TL/LC tracking

## 🧪 GURPS Rules Implementation

### Encumbrance System

Based on GURPS 4e Basic Set (p. 17):

- **Basic Lift (BL):** `(ST × ST) / 5` lbs
- **Encumbrance Levels:**
  - None: ≤ BL
  - Light: ≤ BL × 2
  - Medium: ≤ BL × 3
  - Heavy: ≤ BL × 6
  - Extra-Heavy: > BL × 6

Each level applies movement and dodge modifiers.

### Inventory Grid

- Volumetric grid system (like Escape from Tarkov)
- Items occupy space based on `gridWidth × gridHeight`
- Rotation in 90° increments
- Collision detection prevents overlapping items
- Nested containers supported (coming soon)

## 📝 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Create migration
- `npm run db:studio` - Open Prisma Studio

### Code Style

- TypeScript strict mode
- Server Components by default (mark client components with `"use client"`)
- Tailwind CSS for styling
- Functional components with hooks
- Type-safe GURPS calculations

## 🤝 Contributing

This is an open-source project. Contributions welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [GURPS 4e Basic Set](https://www.sjgames.com/gurps/books/basic/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [PixiJS Documentation](https://pixijs.com/)

---

**Built with ❤️ for the GURPS community**
