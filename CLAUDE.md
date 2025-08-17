# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lotus Fitness Center Management System 2.0 is a production-ready, offline-capable fitness center management application built with modern React technologies. It's designed as a comprehensive PWA solution for fitness centers requiring complete data autonomy without cloud dependencies.

**Tech Stack:**
- Frontend: React 18 + TypeScript + Vite + SWC
- Styling: Tailwind CSS + DaisyUI + Framer Motion (animations)
- State: React Context API with useReducer pattern + localStorage persistence
- Routing: React Router v7  
- Build: Bun (preferred) or npm
- Testing: Vitest + Testing Library + jsdom
- Charts: Recharts for analytics visualization
- Storage: Advanced localStorage management with size optimization
- Security: Crypto-js for encryption, PBKDF2 password hashing
- Utilities: Lodash, date-fns, clsx, react-hot-toast, react-to-print

## Development Commands

```bash
# Development server
bun run dev  # or npm run dev (runs on http://localhost:5173)

# Build for production
bun run build  # or npm run build

# Lint code
bun run lint  # or npm run lint

# Preview production build
bun run preview  # or npm run preview

# Run tests
bun run test  # Run all tests in watch mode
bun run test:ui  # Run tests with Vitest UI
bun run test:run  # Run tests once without watch
bun run test:coverage  # Run tests with coverage report
```

**Important**: 
- Use build commands instead of dev server when testing fixes, as dev server may cause Claude to exit due to console errors
- Bun is the preferred package manager for faster installs and builds
- The app runs on localhost:5173 by default in development

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
- **Encrypted Auth**: localStorage-based authentication with crypto-js encryption and PBKDF2 hashing
- **Default Credentials**: Username: `admin`, Password: `lotus2024`
- **HOC Pattern**: `WithAuthAndDataset` wraps all protected pages
- **Data Initialization**: App starts with default trainers and membership plans
- **Import/Export**: Professional JSON backup/restore with metadata validation and size checking
- **Storage Management**: Advanced localStorage utilities with quota monitoring and optimization

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

- `src/contexts/DatasetContext.tsx` - State management core with all business logic and default data initialization
- `src/types/index.ts` - Complete TypeScript definitions (always check this for interfaces)
- `src/Layout/WithAuthAndDataset.tsx` - Authentication HOC wrapper that provides auth + dataset context
- `src/utils/auth.ts` - Authentication utilities with PBKDF2 encryption and session management
- `src/utils/storageManager.ts` - localStorage management, size checking, quota monitoring, and data optimization
- `src/utils/reportExporter.ts` - Excel export functionality with 9 different report types using xlsx library
- `src/hooks/useDashboardStats.ts` - Analytics calculations and dashboard statistical data
- `src/components/forms/` - All entity forms (Member, Trainer, Class, Plan forms) with validation
- `src/components/reports/ReportGenerationModal.tsx` - Comprehensive report generation interface with date ranges
- `src/components/ui/Modal.tsx` - Standardized modal component used throughout the app (important for consistent UX)
- `src/Pages/Profile/Profile.tsx` - User profile and data management interface with import/export functionality
- `public/lotus-fitness-demo-2025.json` - Demo dataset with 2025 data for testing/demonstrations (~1.3MB optimized)

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

## Storage Management

### localStorage Optimization
The app includes advanced localStorage management utilities in `src/utils/storageManager.ts`:

- **Size Monitoring**: Real-time tracking of localStorage usage with 5MB limit awareness
- **Quota Management**: Automatic detection and handling of storage quota exceeded errors
- **Data Optimization**: Smart compression and data reduction for large datasets
- **Import Validation**: Pre-import size checking to prevent app crashes

### Demo Data Handling
- **Demo Dataset**: `public/lotus-fitness-demo-2025.json` contains comprehensive test data
- **Format Compliance**: Demo data matches exact export format with metadata structure
- **Size Optimization**: Demo data optimized to stay within localStorage limits (~1.3MB)
- **Realistic Patterns**: Includes seasonal attendance patterns and proper member enrollments

### Data Export Format
```json
{
  "metadata": {
    "exportDate": "ISO datetime string",
    "version": "2.0.0", 
    "appVersion": "Lotus Fitness Center Management System 2.0",
    "exportedBy": "admin",
    "totalRecords": number
  },
  "data": {
    "userProfile": {...},
    "members": [...],
    "classes": [...],
    "membershipPlans": [...], 
    "trainers": [...],
    "attendance": [...]
  }
}
```

## UI/UX Development Guidelines

### Modal Component Usage
- **Always use `src/components/ui/Modal.tsx`** for consistent modal behavior and backdrop positioning
- Modal component automatically handles backdrop gaps and proper centering
- Use `Modal.Footer` pattern for consistent action button layouts

### Button Group Patterns
- Use `btn-group gap-0` for connected buttons (theme toggles, filters, single/bulk toggles)
- Add responsive classes `flex-1 sm:flex-none` for mobile-friendly button groups
- Example: `<div className="btn-group gap-0 w-full sm:w-auto">`

### Stats Cards Alignment  
- Always use `grid-cols-1 sm:grid-cols-2 lg:grid-cols-[N]` pattern for responsive stats
- Add `className="h-full"` to motion wrappers for consistent card heights
- Example: `<motion.div className="h-full"><StatCard {...stat} /></motion.div>`

### Form Styling Consistency
- Forms should use standardized Modal component with proper size props
- Grid layouts should be `grid-cols-1 md:grid-cols-2` for form fields
- All forms must include proper validation and error handling

## Performance Considerations
- **Avoid Direct Context Access**: Always use selector hooks to prevent unnecessary re-renders
- **Memoize Calculations**: Use useMemo for expensive computations like statistics  
- **Batch Updates**: Combine multiple state changes when possible
- **Optimize Animations**: Use Framer Motion's layout animations sparingly
- **Storage Efficiency**: Use storageManager utilities for large data operations

## Report Generation System
The app includes a comprehensive Excel export system accessible via Dashboard "Generate Report" button:
- **9 Report Types**: Members, attendance, classes, trainers, revenue analysis
- **Date Range Selection**: Flexible filtering with start/end dates
- **Professional Formatting**: Uses xlsx library for rich Excel file generation
- **File Naming**: Automatic timestamping (e.g., `members-report-2025-01-13-1430.xlsx`)

## Security Features
- **Encrypted Authentication**: Passwords hashed with PBKDF2, stored encrypted in localStorage
- **Session Management**: Automatic logout after inactivity
- **Input Validation**: Comprehensive client-side validation for all forms
- **Data Integrity**: JSON schema validation for import/export operations  
- **Storage Security**: Encrypted data persistence with crypto-js

## Recent Updates & Fixes

### Demo Data Quality (2025-08-17)
The demo dataset (`public/lotus-fitness-demo-2025.json`) has been optimized with realistic capacity/enrollment ratios:
- All 22 classes now have proper capacity values that exceed enrollment by 15-30%
- Capacity values range from realistic minimums (109) to large class sizes (282)
- Data maintains ~1.3MB size while providing authentic demonstration scenarios

### Known UI Areas for Future Enhancement
- Plan creation form layout: Description textarea spacing and status toggle positioning (MembershipPlanForm.tsx:164-171, 147-158)
- Trainer card alignment consistency across different screen sizes (TrainerCard component)

### Development Notes
- When testing fixes that generate console errors, prefer using `bun run build` over `bun run dev` to avoid Claude exit issues
- The app includes comprehensive Excel export functionality via `src/utils/reportExporter.ts` with 9 different report types
- All forms use the standardized `src/components/ui/Modal.tsx` component for consistent UX
- Demo data can be imported via Profile → Data Management for comprehensive testing scenarios