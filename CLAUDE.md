# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lotus Fitness Center Management System is a React-based fitness center management application built with modern TypeScript and Vite. It manages members and fitness classes with a JSON-based data persistence model.

**Tech Stack:**
- Frontend: React 18 + TypeScript + Vite + SWC
- Styling: Tailwind CSS + Framer Motion (animations)
- State: React Context API with reducer pattern
- Routing: React Router v7
- Build: Bun (preferred) or npm
- Utilities: Lodash for data manipulation

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
```

## Architecture

### State Management
The app uses React Context with useReducer for state management:
- **DatasetContext**: Centralized state for members and classes data
- **Location**: `src/contexts/DatasetContext.tsx`
- **Pattern**: Redux-like actions with immutable updates using Lodash
- **Key hooks**: `useDataset()`, `useDatasetDispatch()`, selector hooks like `useMemberById()`

### Authentication & Data Flow
- **HOC Pattern**: `WithAuthAndDataset` wraps protected pages
- **Auth**: Simple localStorage-based authentication (`auth: 'true'`)
- **Data**: JSON file upload required on first load (expects `public/dataset.json` format)
- **Persistence**: No backend - relies on file uploads and local state

### Routing Structure
```
/ → Dashboard (with auth + dataset)
/login → Login page
/manageclasses → Classes management (with auth + dataset)
/managemembers → Members management (with auth + dataset)
* → 404 page (with auth + dataset)
```

### Component Architecture
- **Layout**: Main layout wrapper with sidebar navigation
- **Pages**: Dashboard, Login, Classes, Members, InvalidRoute
- **Components**: Organized by feature (`components/classes/`, `components/members/`)
- **UI Components**: Reusable components in `components/ui/`
- **Reusable**: Generic components in `Reusable_Components/`

### Data Models
Key types defined in `src/types/index.ts`:
- **Member**: id, name, email, phone, membershipType, startDate
- **FitnessClass**: id, name, instructor, schedule, capacity, enrolled[]
- **Dataset**: Contains members[] and classes[]

### Performance Optimizations
- Context split pattern (state + dispatch contexts)
- useMemo for expensive computations
- React.Suspense with loading states
- Lodash for efficient data operations
- SWC for fast compilation

## Key Files

- `src/App.tsx` - Main app router with page transitions
- `src/contexts/DatasetContext.tsx` - State management core
- `src/Layout/WithAuthAndDataset.tsx` - Auth + data loading HOC
- `src/types/index.ts` - TypeScript definitions
- `public/dataset.json` - Sample data structure

## Data Structure

The app expects a JSON dataset with this structure:
```json
{
  "members": [
    {
      "id": number,
      "name": string,
      "email": string,
      "phone": string,
      "membershipType": "Basic" | "Premium" | "VIP",
      "startDate": "YYYY-MM-DD"
    }
  ],
  "classes": [
    {
      "id": number,
      "name": string,
      "instructor": string,
      "schedule": string,
      "capacity": number,
      "enrolled": number[]
    }
  ]
}
```

## Development Notes

- No backend/database - uses JSON file uploads for data
- Mobile-responsive design with dedicated mobile CSS
- Framer Motion for page transitions and animations
- Error boundaries for better UX
- TypeScript strict mode enabled
- Uses React 18 features (Suspense, concurrent features)