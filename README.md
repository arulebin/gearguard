# GearGuard - The Ultimate Maintenance Tracker

A production-ready Maintenance Management System built with Next.js 14, featuring a Kanban board, calendar scheduling, and comprehensive equipment tracking.

## Features

- 🔧 **Kanban Board** - Drag & drop maintenance requests between stages
- 📅 **Calendar View** - Schedule preventive maintenance
- 🏭 **Equipment Management** - Track all equipment with smart buttons
- 👥 **Team Management** - Organize technicians by specialization
- 📊 **Reports & Analytics** - Visual charts and statistics
- 🔐 **Role-based Access** - Employee, Technician, Manager roles

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- PostgreSQL + Prisma ORM

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update `DATABASE_URL` in `.env` with your PostgreSQL connection string.

4. Set up the database:
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Seed the database with demo data:
   ```bash
   npm run db:seed
   ```
   Or visit: `http://localhost:3000/api/seed` (POST request)

7. Open [http://localhost:3000](http://localhost:3000)

## Business Logic

### Request Flow

**Corrective (Breakdown):**
1. Any user creates request → Stage: NEW
2. Team technician picks up → Stage: IN_PROGRESS
3. Technician completes with duration → Stage: REPAIRED

**Preventive (Scheduled):**
1. Manager creates with scheduled date → Stage: NEW
2. Appears in calendar view
3. Follow same flow as corrective

### Scrap Logic
- When marked as SCRAP, equipment is flagged as scrapped
- Future maintenance requests are blocked for scrapped equipment

### Overdue Detection
- Requests past scheduled date (not REPAIRED/SCRAP) show red indicator

## Project Structure

```
/app              # Next.js App Router pages
/components       # React components
  /ui            # Reusable UI components
  /layout        # Layout components
  /maintenance   # Maintenance-specific components
  /calendar      # Calendar components
  /equipment     # Equipment components
  /reports       # Report components
/lib              # Utilities and database
/prisma           # Database schema
/types            # TypeScript types
```

## License

MIT
