# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lotus Fitness Center Management System is a React-based fitness center management application built with modern TypeScript and Vite. It's designed as an offline-capable PWA for small fitness centers that need a complete management solution without cloud dependencies.

**Tech Stack:**
- Frontend: React 18 + TypeScript + Vite + SWC
- Styling: Tailwind CSS + DaisyUI + Framer Motion (animations)
- State: React Context API with useReducer pattern + localStorage persistence
- Routing: React Router v7
- Build: Bun (preferred) or npm
- Testing: Vitest + Testing Library
- Charts: Recharts for analytics visualization
- Utilities: Lodash, date-fns, crypto-js for security

## Development Commands

```bash
# Development server
bun run dev  # or npm run dev

# Build for production
bun run build  # or npm run build

# Lint code
bun run lint  # or npm run lint

# Preview production build
bun run preview  # or npm run preview

# Run tests
bun run test  # Run all tests
bun run test:ui  # Run tests with UI
bun run test:run  # Run tests once
bun run test:coverage  # Run tests with coverage
```

**Important**: Use build commands instead of dev server when testing fixes, as dev server may cause Claude to exit due to console errors.

## Architecture

### State Management Pattern
The app uses a sophisticated React Context + useReducer pattern with automatic localStorage persistence:
- **DatasetContext**: Centralized state for all entities (members, trainers, classes, plans, attendance)
- **Split Context Pattern**: Separate contexts for state and dispatch to prevent unnecessary re-renders
- **Automatic Persistence**: All state changes are immediately saved to localStorage
- **Immutable Updates**: Using Lodash for safe data manipulation
- **Selector Hooks**: Performance-optimized hooks like `useMembers()`, `useMemberById()`, etc.

### Authentication & Data Flow
- **Offline-First Design**: No backend required, works completely offline
- **Encrypted Auth**: localStorage-based authentication with crypto-js encryption
- **Default Credentials**: Username: `admin`, Password: `lotus2024`
- **HOC Pattern**: `WithAuthAndDataset` wraps all protected pages
- **Data Initialization**: App starts with default trainers and membership plans
- **Import/Export**: Optional JSON backup/restore functionality for data migration

### Routing Structure
```
/ → Dashboard (with auth + layout)
/login → Login page (no auth required)
/manageclasses → Classes management
/managemembers → Members management  
/manageplans → Membership plans management
/managetrainers → Trainers management
/attendance → Attendance tracking
/profile → User profile & data management
* → 404 page (with auth + layout)
```

### Component Architecture
- **Layout System**: Main layout with responsive sidebar navigation
- **Page Components**: Located in `src/Pages/[PageName]/`
- **Feature Components**: Organized by domain (`src/components/members/`, `src/components/classes/`)
- **Reusable UI**: Generic components in `src/components/ui/`
- **Forms**: Dedicated form components in `src/components/forms/`
- **Modals & Overlays**: Context menus, modals, and interactive components

### Data Models (Key Interfaces)
Located in `src/types/index.ts`:

- **Member**: Complete member profile with `membershipPlanId` (references plan by ID)
- **FitnessClass**: Classes with `trainerId` and structured `schedule` object
- **Trainer**: Enhanced with `hiredDate`, `experience`, `bio`, `rating` fields  
- **MembershipPlan**: Plans with `features[]` and pricing
- **AttendanceRecord**: Daily attendance tracking
- **UserProfile**: Admin user configuration and preferences

### Performance Optimizations
- **Context Split Pattern**: State and dispatch in separate contexts
- **Memoized Selectors**: All data access hooks use useMemo
- **React 18 Features**: Concurrent rendering, Suspense boundaries
- **SWC Compilation**: Fast build times with SWC instead of Babel
- **Bundle Optimization**: Code splitting and tree shaking
- **Lodash Integration**: Efficient data operations

## Key Architectural Decisions

### State vs Props Philosophy
- **Context for Global Data**: Members, trainers, classes always accessed via context
- **Props for Configuration**: Component behavior and callbacks passed as props
- **Local State for UI**: Form data, modals, temporary UI state only

### Data Consistency Patterns
- **ID-Based References**: Use IDs to reference related entities (e.g., `membershipPlanId`, `trainerId`)
- **Lookup by ID**: Components receive IDs and use selector hooks to get full objects
- **Single Source of Truth**: All entity data lives in DatasetContext, no duplication

### Form Handling Strategy
- **Controlled Components**: All forms use controlled inputs with local state
- **Context Integration**: Form submission dispatches actions to update global state  
- **Validation**: Client-side validation with real-time error display
- **Type Safety**: Forms match their corresponding TypeScript interfaces exactly

## Key Files and Their Purposes

- `src/contexts/DatasetContext.tsx` - State management core with all business logic
- `src/types/index.ts` - Complete TypeScript definitions (always check this for interfaces)
- `src/Layout/WithAuthAndDataset.tsx` - Authentication HOC wrapper
- `src/utils/auth.ts` - Authentication utilities and encryption
- `src/hooks/useDashboardStats.ts` - Analytics calculations and dashboard data
- `src/components/forms/` - All entity forms (Member, Trainer, Class, Plan forms)

## Data Structure

The app expects a JSON dataset with this structure:

```json
{
  "userProfile": {
    "id": number,
    "name": string,
    "email": string,
    "phone": string,
    "role": "Owner" | "Receptionist",
    "preferences": {
      "theme": string,
      "autoSaveInterval": number,
      "defaultView": "dashboard" | "members" | "classes"
    }
  },
  "members": [
    {
      "id": number,
      "name": string,
      "email": string,
      "phone": string,
      "age": number,
      "gender": "Male" | "Female" | "Other",
      "membershipPlanId": number,
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "status": "Active" | "Expired" | "Trial" | "Suspended",
      "renewalCount"?: number,
      "lastRenewalDate"?: "YYYY-MM-DD"
    }
  ],
  "classes": [
    {
      "id": number,
      "name": string,
      "trainerId": number,
      "schedule": {
        "dayOfWeek": number,
        "startTime": string,
        "endTime": string,
        "duration": number
      },
      "capacity": number,
      "enrolled": number[],
      "description"?: string
    }
  ],
  "membershipPlans": [
    {
      "id": number,
      "name": string,
      "duration": number,
      "cost": number,
      "description": string,
      "features": string[],
      "isActive": boolean
    }
  ],
  "trainers": [
    {
      "id": number,
      "name": string,
      "email": string,
      "phone": string,
      "expertise": string[],
      "assignedClasses": number[],
      "hourlyRate"?: number,
      "certifications": string[],
      "isActive": boolean,
      "hiredDate"?: "YYYY-MM-DD",
      "experience"?: number,
      "bio"?: string,
      "rating"?: number
    }
  ],
  "attendance": [
    {
      "id": number,
      "memberId": number,
      "classId": number,
      "date": "YYYY-MM-DD",
      "status": "Present" | "Absent" | "Late",
      "checkedInAt"?: "ISO datetime string"
    }
  ]
}
```

## Common Development Patterns

### Adding New Features
1. **Define Types First**: Add interfaces to `src/types/index.ts`
2. **Update Context**: Add actions, reducer cases, and selector hooks to DatasetContext
3. **Create Forms**: Build form components that match the interface exactly
4. **Build UI Components**: Create display components that use selector hooks
5. **Test Integration**: Verify data flows from form → context → display

### Debugging Data Issues
1. **Check Interface Alignment**: Compare form data structure with TypeScript interface
2. **Verify Context Usage**: Ensure components use selector hooks, not direct context access
3. **Validate Actions**: Confirm dispatch calls use correct action creators
4. **Test localStorage**: Check if data persists correctly across page refreshes

### Testing Approach
- **Business Logic**: Test utility functions and data transformations
- **Component Integration**: Test form submission and context updates
- **Authentication**: Test login flow and session management
- **Data Persistence**: Test import/export and localStorage operations

## Performance Considerations
- **Avoid Direct Context Access**: Always use selector hooks to prevent unnecessary re-renders
- **Memoize Calculations**: Use useMemo for expensive computations like statistics
- **Batch Updates**: Combine multiple state changes when possible
- **Optimize Animations**: Use Framer Motion's layout animations sparingly

## Security Features
- **Encrypted Authentication**: Passwords hashed with PBKDF2, stored encrypted in localStorage
- **Session Management**: Automatic logout after inactivity
- **Input Validation**: Comprehensive client-side validation for all forms
- **Data Integrity**: JSON schema validation for import/export operations