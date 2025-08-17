<a name="readme-top"></a>
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![GNU License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/FalconEthics/Lotus_Fitness_Center_Management_System">
    <img src="src/assets/logo.png" alt="Logo" width="100" height="100">
  </a>

<h3 align="center">Lotus Fitness Center Management System 2.0</h3>

  <p align="center">
    A comprehensive, secure, and offline-capable fitness center management system built with modern React technologies.
  <p align="center">
    <a href="https://lotus-fitness-center-management-system.vercel.app/">View Demo</a>
    ·
    <a href="https://github.com/FalconEthics/Lotus_Fitness_Center_Management_System/issues">Report Bug</a>
    ·
    <a href="https://github.com/FalconEthics/Lotus_Fitness_Center_Management_System/issues">Request Feature</a>
  </p>
</div>

## <a href="https://lotus-fitness-center-management-system.vercel.app/">🚀 Live Demo</a>

<!-- ABOUT THE PROJECT -->

## About The Project

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
        <li><a href="#key-features">Key Features</a></li>
      </ul>
    </li>
    <li><a href="#installation">Installation</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#security-features">Security Features</a></li>
    <li><a href="#testing">Testing</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<img src="src/assets/screenshot.png">

Lotus Fitness Center Management System 2.0 is a production-ready, offline-capable single-page application (SPA) designed to manage all aspects of a fitness center. This comprehensive system features advanced security, real-time analytics, and seamless data management capabilities.

### 🎯 Key Features

- **🔒 Advanced Security**: Encrypted authentication system with PBKDF2 hashing and password strength validation
- **📱 PWA Support**: Install as a mobile/desktop app with offline functionality
- **📊 Real-time Analytics**: Interactive charts and comprehensive reporting
- **👥 Member Management**: Complete member lifecycle with renewals and status tracking
- **🏋️ Class Scheduling**: Drag-and-drop calendar with trainer assignments
- **📈 Attendance Tracking**: Daily, weekly, and monthly attendance analytics
- **📄 Excel Export**: Professional report generation with 9 different report types (members, attendance, revenue, etc.)
- **💾 Smart Storage**: Advanced localStorage management with quota monitoring and optimization
- **🎨 Modern UI/UX**: Beautiful, responsive design with light/dark themes
- **⚡ Performance Optimized**: Built with React 18, SWC, and modern best practices
- **🧪 Fully Tested**: Comprehensive test suite for business logic and security

### Built With

* ![React][React.com] - React 18 with latest features and concurrent rendering
* ![TypeScript][TypeScript.com] - Full TypeScript support for type safety
* ![Tailwind][Tailwind.com] - Modern CSS framework with DaisyUI components
* ![Vite][Vite.com] - Lightning-fast build tool with SWC compiler
* ![Context API][Context.com] - Advanced state management with useReducer pattern
* ![Framer Motion][FramerMotion.com] - Smooth animations and page transitions
* ![Recharts][Recharts.com] - Interactive data visualization and analytics
* ![React Router][ReactRouter.com] - Modern routing with React Router v7
* ![Date-fns][DateFns.com] - Modern date utility library
* ![Lodash][Lodash.com] - Utility library for data manipulation
* ![Crypto-js][CryptoJS.com] - Secure encryption for authentication
* ![React Hot Toast][ReactHotToast.com] - Beautiful toast notifications
* ![Vitest][Vitest.com] - Fast unit testing framework

<p align="right"><a href="#readme-top">˄ back to top</a></p>

<!-- INSTALLATION -->

## Installation

To get a local copy up and running follow these simple steps.

### Prerequisites

- **Bun** (recommended) or npm
  ```sh
  curl -fsSL https://bun.sh/install | bash
  ```
  or
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/FalconEthics/Lotus_Fitness_Center_Management_System.git
   ```

2. Navigate to the project directory
   ```sh
   cd Lotus_Fitness_Center_Management_System
   ```

3. Install dependencies
   ```sh
   bun install
   # or
   npm install
   ```

4. Start the development server
   ```sh
   bun run dev
   # or
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

<p align="right"><a href="#readme-top">˄ back to top</a></p>

## Usage

### 🔐 Default Credentials
- **Username**: `admin`
- **Password**: `lotus2024`

### 🚀 Getting Started

1. **First Login**: Use the default credentials to access the system
2. **Change Credentials**: Immediately change username and password in Profile settings
3. **Import Demo Data** (Optional): Import the comprehensive demo dataset from `public/lotus-fitness-demo-2025.json` via Profile → Data Management - includes realistic 2025 data with proper class capacity ratios
4. **Start Fresh**: Begin adding members, trainers, and classes from scratch

### 📋 Core Workflows

**Member Management**:
- Add new members with complete profile information
- Track membership status (Active, Expired, Trial, Suspended)
- Monitor membership renewals and expiry alerts
- Generate membership cards and receipts

**Class Scheduling**:
- Create classes with trainer assignments
- Set capacity limits and enrollment management
- Track class popularity and attendance rates
- Calendar view with drag-and-drop functionality

**Attendance Tracking**:
- Mark daily attendance for members
- Generate attendance reports and analytics
- Track attendance trends and patterns
- Export attendance data for analysis

**Analytics & Reporting**:
- Real-time dashboard with key metrics
- Revenue tracking by membership plans
- Member demographics and statistics
- Class popularity and utilization reports
- Excel export with 9 professional report types
- Date range filtering for comprehensive analysis

<p align="right"><a href="#readme-top">˄ back to top</a></p>

## 🔒 Security Features

### Advanced Authentication
- **Encrypted Storage**: All authentication data is encrypted using AES encryption
- **Password Security**: PBKDF2 hashing with salt for password protection
- **Session Management**: Secure session handling with expiration
- **Account Protection**: Automatic account lockout after failed attempts
- **Password Strength**: Real-time validation with strength indicators

### Data Security
- **Local Encryption**: Sensitive data encrypted before localStorage storage
- **Secure Backup**: Professional backup format with metadata validation
- **Smart Storage Management**: Automatic quota monitoring and data optimization
- **Input Validation**: Comprehensive client-side data validation
- **Session Timeout**: Automatic logout after inactivity periods

<p align="right"><a href="#readme-top">˄ back to top</a></p>

## 🧪 Testing

The project includes comprehensive tests for business logic and security features.

### Running Tests

```sh
# Run all tests in watch mode
bun run test

# Run tests once without watch
bun run test:run

# Run tests with UI
bun run test:ui

# Run tests with coverage
bun run test:coverage
```

### Test Coverage

- **Authentication System**: Login, logout, password management, session handling
- **Business Logic**: Data validation, member management, class scheduling
- **Data Management**: Import/export, localStorage operations, storage quota management
- **Storage Utilities**: Data compression, size optimization, quota monitoring
- **Edge Cases**: Error handling, corrupted data recovery, validation failures

<p align="right"><a href="#readme-top">˄ back to top</a></p>

## 🏗️ Architecture

### Tech Stack Details

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite with SWC compiler
- **Styling**: Tailwind CSS + DaisyUI components
- **State Management**: React Context API with useReducer
- **Routing**: React Router v7
- **Animations**: Framer Motion
- **Data Visualization**: Recharts
- **Storage**: Advanced localStorage management with quota monitoring
- **Testing**: Vitest + Testing Library + jsdom
- **Security**: Crypto-js with PBKDF2 hashing

### Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── Pages/              # Page components
├── types/              # TypeScript type definitions
├── utils/              # Utility functions (including storageManager)
├── tests/              # Test files
└── assets/             # Static assets
```

<p align="right"><a href="#readme-top">˄ back to top</a></p>

## 🌟 Key Improvements in 2.0

- **🔒 Advanced Security**: Complete authentication system overhaul with PBKDF2 hashing
- **📱 Offline Capability**: Full PWA support with service workers
- **🎨 Modern Design**: Updated UI with DaisyUI and improved UX
- **📊 Enhanced Analytics**: Rich data visualization and reporting
- **⚡ Performance**: React 18 optimizations and SWC compilation
- **💾 Smart Storage**: Advanced localStorage management with quota monitoring and optimization
- **🧪 Test Coverage**: Comprehensive test suite for reliability
- **🔄 Data Persistence**: Robust data management with professional backup/restore format
- **🌙 Themes**: Light/dark mode with system preference detection
- **📄 Export System**: Professional Excel reporting with 9 different report types
- **✨ Polished UI**: Refined form layouts and component alignment for optimal user experience

<p align="right"><a href="#readme-top">˄ back to top</a></p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any
contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also
simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch
   ```sh
   git checkout -b feature/AmazingFeature
   ```
3. Commit your Changes
   ```sh
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the Branch
   ```sh
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request

<p align="right"><a href="#readme-top">˄ back to top</a></p>

<!-- LICENSE -->

## License

Distributed under the GNU License. See `LICENSE.txt` for more information.

<p align="right"><a href="#readme-top">˄ back to top</a></p>

<!-- CONTACT -->

## Contact

<ul>
<li><a href="https://www.linkedin.com/in/soumik-das-profile/"> LinkedIn Profile</a></li>
<li><a href="https://mrsoumikdas.com/"> Portfolio Site</a></li>
<li><a href="https://www.instagram.com/account.soumik.das/"> Instagram Handle</a></li>
</ul>

~ wanna checkout my other projects: [https://github.com/FalconEthics](https://github.com/FalconEthics)

<p align="right"><a href="#readme-top">˄ back to top</a></p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

This project showcases modern React development practices, advanced security implementation, and production-ready application architecture. It demonstrates expertise in full-stack development, user experience design, and system security.

<p align="right"><a href="#readme-top">˄ back to top</a></p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/FalconEthics/Lotus_Fitness_Center_Management_System.svg?style=for-the-badge

[contributors-url]: https://github.com/FalconEthics/Lotus_Fitness_Center_Management_System/graphs/contributors

[forks-shield]: https://img.shields.io/github/forks/FalconEthics/Lotus_Fitness_Center_Management_System.svg?style=for-the-badge

[forks-url]: https://github.com/FalconEthics/Lotus_Fitness_Center_Management_System/network/members

[stars-shield]: https://img.shields.io/github/stars/FalconEthics/Lotus_Fitness_Center_Management_System.svg?style=for-the-badge

[stars-url]: https://github.com/FalconEthics/Lotus_Fitness_Center_Management_System/stargazers

[issues-shield]: https://img.shields.io/github/issues/FalconEthics/Lotus_Fitness_Center_Management_System.svg?style=for-the-badge

[issues-url]: https://github.com/FalconEthics/Lotus_Fitness_Center_Management_System/issues

[license-shield]: https://img.shields.io/github/license/FalconEthics/Lotus_Fitness_Center_Management_System.svg?style=for-the-badge

[license-url]: https://github.com/FalconEthics/Lotus_Fitness_Center_Management_System/blob/main/LICENSE

[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555

[linkedin-url]: https://www.linkedin.com/in/soumik-das-profile/

[product-screenshot]: ./screenshot1.png

[React.com]: https://img.shields.io/badge/React_18-0187ce?style=for-the-badge&logo=react&logoColor=white

[TypeScript.com]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white

[Tailwind.com]: https://img.shields.io/badge/tailwind_css-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white

[Vite.com]: https://img.shields.io/badge/Vite-646cff?style=for-the-badge&logo=vite&logoColor=white

[Context.com]: https://img.shields.io/badge/Context_API-61DAFB?style=for-the-badge&logo=react&logoColor=white

[FramerMotion.com]: https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white

[Recharts.com]: https://img.shields.io/badge/Recharts-FF6B6B?style=for-the-badge&logo=chart.js&logoColor=white

[ReactRouter.com]: https://img.shields.io/badge/React_Router_v7-CA4245?style=for-the-badge&logo=react-router&logoColor=white

[DateFns.com]: https://img.shields.io/badge/date--fns-770C56?style=for-the-badge&logo=date-fns&logoColor=white

[Lodash.com]: https://img.shields.io/badge/Lodash-3492FF?style=for-the-badge&logo=lodash&logoColor=white

[CryptoJS.com]: https://img.shields.io/badge/Crypto--js-F7931E?style=for-the-badge&logo=bitcoin&logoColor=white

[ReactHotToast.com]: https://img.shields.io/badge/React_Hot_Toast-FF4B4B?style=for-the-badge&logo=react&logoColor=white

[Vitest.com]: https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white