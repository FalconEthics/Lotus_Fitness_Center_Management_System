Assignment: Lotus Fitness Center Management System (Offline Edition)
Overview
You are tasked with building an offline-first, single-user web application for a small fitness center.
This app will be used only by the receptionist/owner on a single device, with no customer-facing interface.
The goal is to create a feature-rich, responsive, and user-friendly application that stores all data locally in the browser, with the option to import/export datasets as JSON files for backup.

No backend is required — everything will run entirely in the browser using localStorage as the database.

Requirements
Core Features
User Profiles (Single User)
The app should support one user profile for the receptionist/owner.
Store: name, contact details, and app preferences (e.g., theme, auto-save interval).
Member Management
Add/Edit/Delete members.
Store: Name, Age, Gender, Contact, Membership Plan, Start Date, End Date, Status.
Status options: Active, Expired, Trial, Suspended.
Search and filter members.
Membership Plans
Create/Edit/Delete plans.
Store: Name, Duration, Cost, Description.
Auto-calculate expiry dates based on plan duration.
Class Scheduling & Assignment
Create/Edit/Delete classes (e.g., Yoga, HIIT).
Assign trainers and members to classes.
Weekly calendar view with drag-and-drop class rearrangement.
Trainer Management
Add/Edit/Delete trainers.
Store: Name, Expertise, Contact Info, Assigned Classes.
Attendance Tracking
Mark attendance for members per class.
View daily, weekly, and monthly attendance logs.
Printable Outputs
Membership Card – name, plan, expiry date.
Class Booking Receipt – member name, class name, date, trainer.
Attendance Summary – per member or per class.
All printables should be styled cleanly and generated via react-to-print.
Analytics Dashboard (TanStack React Charts)
Current active members count.
Memberships expiring soon (7 / 30 days).
Class popularity.
Trainer workload.
Data Handling
All data is kept in memory via Context API.
Data is auto-synced to localStorage at intervals (default: 5 minutes).
User can manually trigger save at any time.
Auto-save interval is configurable from settings.
Data can be exported to a .json file.
Data can be imported from a .json file to replace the current dataset.
UI/UX Requirements
Fully responsive design using TailwindCSS + DaisyUI.
Smooth animations using Framer Motion.
Debounced search and filters using Lodash.
Light/Dark mode toggle (via DaisyUI themes).
Context menus for quick actions.
Keyboard shortcuts for power use (e.g., Ctrl+M = Add Member).
PWA support for installability and offline use.
Tech Stack
Runtime: Bun
Frontend: React 19 + Vite + SWC
State Management: Context API
UI: TailwindCSS + DaisyUI
Animations: Framer Motion
Charts: TanStack React Charts
Utilities: Lodash
Printing: react-to-print
Storage: localStorage (primary), JSON import/export (backup)
Deliverables
A fully functional offline app meeting all requirements.
Clean, well-structured React component architecture.
Well-commented code and clear variable naming.
A README.md explaining:
Project overview
Installation steps
Feature list
How to change the auto-save interval
How to import/export data
Bonus Points
Implement drag-and-drop in the class scheduler.
Add animated transitions between dashboard sections.
Show toast notifications for actions like save success, import complete, auto-save triggered.

