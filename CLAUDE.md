# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Health CRM system built with Next.js 14 and TypeScript, specifically designed for USANA supplement product management and customer health tracking. The application uses Chinese localization and focuses on sales relationship management for health products.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Seed database with test data
npm run seed

# Windows batch scripts
install.bat    # Complete setup (install + seed)
start.bat      # Quick development start
```

## Architecture

### Tech Stack
- **Next.js 14** with App Router
- **MongoDB** with Mongoose ODM
- **JWT authentication** (custom implementation)
- **Tailwind CSS** for styling
- **TypeScript** for type safety

### Key Directories
- `src/app/` - Next.js App Router pages and API routes
- `src/models/` - MongoDB data models (User, Customer, Product, Patient, etc.)
- `src/lib/` - Utilities (auth.ts, mongodb.ts, types.ts)
- `scripts/` - Database seeding scripts

## Data Models

### User System
- Role hierarchy: `system_admin` > `admin` > `customer`
- Employee ID auto-generation (EMP001, EMP002...)
- Sales performance tracking

### Customer Management
- Customer categories: potential, new, regular, vip, inactive
- Health profiles with BMI, allergies, medications
- USANA product usage tracking with effectiveness ratings
- Follow-up scheduling with priority levels

### Products (USANA Focus)
- Categories: vitamins, minerals, antioxidants, skincare, etc.
- Three pricing tiers: retail, wholesale, preferred customer
- Stock status and target audience tracking

## Authentication

Custom JWT implementation in `src/lib/auth.ts`:
- Token verification with `verifyToken()`
- Role-based access with `requireRole()`
- 7-day token expiration
- bcrypt password hashing (12 rounds)

## API Routes

RESTful endpoints under `src/app/api/`:
- `/api/auth/login` - Authentication
- `/api/customers/[id]` - Customer CRUD
- `/api/users/[id]` - User management
- `/api/dashboard/stats` - Dashboard metrics
- `/api/patients/[id]` - Patient records

## Database

MongoDB Atlas with connection caching in `src/lib/mongodb.ts`. Database name: `health_crm`

Required environment variables:
```env
MONGODB_URI=mongodb+srv://...
DB_NAME=health_crm
NEXTAUTH_SECRET=your-jwt-secret
```

## Test Data

Use `npm run seed` to populate with test users:
- System Admin: sysadmin@healthcrm.com / admin123
- Manager: manager.zhang@healthcrm.com / admin123
- Sales Rep: sales.li@healthcrm.com / admin123
- Customer: wang.ming@customer.com / customer123

## Development Notes

- App uses Chinese localization and names
- Role-based access control throughout
- Comprehensive error handling in API routes
- TypeScript types defined in `src/lib/types.ts`
- Form validation with React Hook Form
- Charts/analytics with Recharts library

## Testing

No automated tests configured. Manual testing using seeded data and test credentials above.