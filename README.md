# 🏃‍♂️ Lotus Fitness Center Management System

A comprehensive offline-first fitness center management application built with React 18, TypeScript, and modern web technologies. Designed for single-user operation by fitness center staff with complete local data management.

![Build Status](https://img.shields.io/badge/build-passing-green)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Tech Stack](https://img.shields.io/badge/React-18.3.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 👤 User Management
- **Single User Profile**: Receptionist/owner profile with preferences
- **Theme Settings**: Light/dark mode with system preference detection
- **Auto-save Configuration**: Customizable auto-save intervals (1-30 minutes)

### 👥 Member Management
- **Complete Member Profiles**: Name, age, gender, contact, membership plans
- **Status Tracking**: Active, Expired, Trial, Suspended status management
- **Advanced Search & Filtering**: Debounced search with multiple filter options
- **Expiring Memberships**: Smart alerts for renewals (3, 7, 30-day warnings)
- **Bulk Actions**: Contact multiple members, export lists

### 📋 Membership Plans
- **Plan Creation**: Flexible plan duration and pricing
- **Auto-calculation**: Automatic expiry date calculation
- **Revenue Analytics**: Plan performance and revenue projections
- **Plan Assignment**: Easy member-to-plan association

### 🏋️ Trainer Management
- **Trainer Profiles**: Name, expertise, contact information
- **Class Assignment**: Link trainers to multiple classes
- **Workload Analytics**: Track trainer schedules and capacity
- **Certification Tracking**: Monitor trainer qualifications

### 📅 Class Scheduling
- **Interactive Calendar**: Weekly view with drag-and-drop functionality
- **Class Management**: Create, edit, delete fitness classes
- **Member Enrollment**: Assign members to classes with capacity limits
- **Schedule Conflicts**: Automatic conflict detection

### 📊 Attendance Tracking
- **Daily Attendance**: Mark present/absent for each class
- **Historical Data**: View daily, weekly, monthly attendance logs
- **Member Attendance**: Individual attendance history and statistics
- **Class Statistics**: Track class popularity and attendance rates

### 🖨️ Printable Outputs
- **Membership Cards**: Professional member ID cards with QR codes
- **Receipts**: Class booking and payment receipts
- **Attendance Reports**: Comprehensive attendance summaries
- **Analytics Reports**: Exportable business intelligence reports

### 📈 Analytics Dashboard
- **Real-time Metrics**: Active members, revenue, class popularity
- **Membership Trends**: Growth rates, renewal patterns, churn analysis
- **Revenue Projections**: Monthly/quarterly revenue forecasting
- **Trainer Analytics**: Workload distribution and performance metrics
- **Interactive Charts**: Built with Recharts for data visualization

### 💾 Data Management
- **Local Storage**: All data stored in browser localStorage
- **Auto-sync**: Configurable auto-save (default: 5 minutes)
- **Manual Save**: Instant save with Ctrl+S shortcut
- **JSON Export**: Complete dataset backup to JSON files
- **JSON Import**: Restore from backup files with validation
- **Data Reset**: Clear all data with confirmation prompts

### ⚡ User Experience
- **Progressive Web App**: Installable on desktop and mobile
- **Offline-first**: Complete functionality without internet
- **Responsive Design**: Optimized for all screen sizes
- **Context Menus**: Right-click quick actions on all cards
- **Keyboard Shortcuts**: Power user keyboard navigation
- **Toast Notifications**: Real-time feedback for all actions
- **Smooth Animations**: Framer Motion page transitions
- **Search Everything**: Global search across all entities

## 🚀 Quick Start

### Prerequisites
- **Bun** (recommended) or Node.js 18+
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd lotus-fitness-center-ms

# Install dependencies (with Bun - recommended)
bun install

# Or with npm
npm install

# Start development server
bun run dev

# Or with npm
npm run dev
```

### Build for Production

```bash
# Build the application
bun run build

# Preview production build
bun run preview

# Run linter
bun run lint
```

## 📁 Project Structure

```
src/
├── components/
│   ├── analytics/          # Analytics and reporting components
│   ├── attendance/         # Attendance tracking components
│   ├── classes/           # Class management components
│   ├── forms/             # Form components and validation
│   ├── members/           # Member management components
│   ├── plans/             # Membership plans components
│   ├── trainers/          # Trainer management components
│   └── ui/                # Reusable UI components
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── Layout/                # Layout components and HOCs
├── Pages/                 # Main page components
├── Reusable_Components/   # Generic reusable components
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions

public/
├── manifest.json          # PWA manifest
├── sw.js                 # Service worker
├── logo.png              # App logo
└── dataset.json          # Sample dataset
```

## ⌨️ Keyboard Shortcuts

### Global Navigation
- `Ctrl + 1` - Dashboard
- `Ctrl + 2` - Members
- `Ctrl + 3` - Classes
- `Ctrl + 4` - Trainers
- `Ctrl + 5` - Plans
- `Ctrl + 6` - Attendance
- `Ctrl + 7` - Analytics

### Global Actions
- `Ctrl + S` - Manual save
- `Ctrl + F` - Focus search
- `Ctrl + K` - Show shortcuts help
- `Ctrl + Shift + T` - Toggle theme
- `Ctrl + Shift + E` - Export data

### Page-Specific (Members)
- `/` - Focus search
- `A` - Add new member
- `P` - Print member list
- `X` - Clear all filters
- `1-4` - Filter by status (Active/Trial/Expired/Suspended)

## 🎨 Customization

### Theme Configuration
The app uses DaisyUI themes. Available themes:
- `light` - Default light theme
- `dark` - Default dark theme
- `cupcake` - Soft pastel theme
- `corporate` - Professional theme
- And 20+ more DaisyUI themes

### Auto-save Settings
Configure auto-save interval in User Settings:
- Range: 1-30 minutes
- Default: 5 minutes
- Manual save always available with `Ctrl + S`

### PWA Installation
Install as desktop app:
1. Open app in browser
2. Look for "Install" prompt or menu option
3. Click "Install" to add to desktop/app drawer

## 💾 Data Management

### Export Data
1. Go to Settings page
2. Click "Export Data" or use `Ctrl + Shift + E`
3. Choose export format (complete dataset or specific entities)
4. Save JSON file to desired location

### Import Data
1. Go to Settings page
2. Click "Import Data"
3. Select JSON file from computer
4. Confirm import (this will replace current data)
5. Data validation ensures file format correctness

### Sample Dataset
A comprehensive sample dataset is included at `public/dataset.json` with:
- 50+ realistic UK-based members
- 15+ fitness classes with schedules
- 8+ certified trainers
- 5+ membership plans
- Historical attendance data

## 📊 Analytics Features

### Dashboard Metrics
- **Active Members**: Current active membership count
- **Revenue This Month**: Monthly recurring revenue
- **Classes Today**: Today's scheduled classes
- **Expiring Soon**: Members requiring renewal attention

### Advanced Analytics
- **Membership Trends**: Growth rates and retention analysis
- **Revenue Forecasting**: Projected monthly/quarterly revenue
- **Class Popularity**: Most attended classes and optimal scheduling
- **Trainer Workload**: Balanced trainer assignment analytics
- **Renewal Tracking**: Member lifecycle and renewal patterns

## 🔧 Technical Details

### Tech Stack
- **Frontend**: React 18.3.1 + TypeScript + Vite + SWC
- **Styling**: Tailwind CSS + DaisyUI 5.0
- **State Management**: React Context API with useReducer
- **Animations**: Framer Motion 12.23
- **Charts**: Recharts 3.1
- **Utilities**: Lodash 4.17, date-fns 4.1
- **Printing**: react-to-print 3.1
- **Notifications**: react-hot-toast 2.5
- **Icons**: React Icons 5.4 (Heroicons v2)

### Performance Optimizations
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Components loaded on demand
- **Memoization**: Strategic use of useMemo and useCallback
- **Debounced Search**: 300ms debounce for all search inputs
- **Virtual Scrolling**: Large lists optimized for performance
- **Service Worker**: Aggressive caching for offline performance

### Browser Compatibility
- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License. See `LICENSE` file for details.

## 🆘 Support

For issues, questions, or feature requests:
1. Check existing issues in the repository
2. Create new issue with detailed description
3. Include browser version and steps to reproduce

## 🎯 Future Enhancements

- **Multi-location Support**: Manage multiple fitness center branches
- **Payment Integration**: Built-in payment processing
- **Email Automation**: Automated renewal and class reminders
- **Mobile App**: React Native companion app
- **Advanced Reporting**: PDF report generation
- **API Integration**: Optional backend synchronization

---

Built with ❤️ by Lotus Fitness Center Team