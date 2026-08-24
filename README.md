<div align="center">

# 🏫 Elswedy Biometric Faculty Attendance Management System
### ⚡ Modern Real-Time Enterprise Faculty Attendance & Biometric Turnstile Portal

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Cloudflare Pages](https://img.shields.io/badge/Deployed_on-Cloudflare_Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)

**Engineered by [Eng. Ahmed Raafat](https://ahmedraafat.me)**

---

</div>

## 📖 Overview

The **Elswedy Biometric Faculty Attendance Management System** is a next-generation web application designed for **Elswedy International Applied Technology Schools (IATS)**. It provides real-time monitoring of campus turnstiles, biometric fingerprint verification, automated tardiness and deduction calculations, role-based governance, and comprehensive faculty analytics.

Built with a modern decoupled architecture, the frontend communicates seamlessly with an **ASP.NET Core (.NET 10)** backend deployed across high-performance enterprise cloud hosting.

---

## ✨ Key Features

- 🕒 **Live Biometric Turnstile Telemetry**: Real-time event ingestion via Server-Sent Events (SSE) displaying instantaneous teacher check-ins, gate statuses, and confidence scores.
- 👥 **Faculty Directory & Management**: 
  - Comprehensive profiles for 42+ technical instructors and department heads.
  - Search, filter by department, account status toggle (Active / Suspended), password management, and biometric template registration.
- 🏢 **Multi-Department Academic Support**:
  - Robotics & Industrial Automation
  - Computer Engineering & AI Systems
  - Electrical Power & Renewable Energy
  - Mechatronics & Smart Maintenance
  - Applied Sciences & Technical Mathematics
- 📋 **Attendance & Exception Correction Hub**:
  - Live registers with automatic grace period calculation (07:30 - 07:45).
  - Manual correction workflow with mandatory justification and audit logging.
  - Direct CSV/Excel export for payroll and administration.
- 🌴 **Leave Request Management**: Full lifecycle workflow for Casual, Sick, Annual, and Official Duty leaves with HR Admin approvals.
- 📡 **Biometric Hardware Simulator**: Interactive turnstile terminal simulation allowing manual badge/fingerprint test triggers with sound and visual feedback.
- 🔐 **Triple-Tier Role-Based Access Control (RBAC)**:
  - **HR Admin (`hr_admin`)**: Full read/write authority, corrections, faculty management, and system configuration.
  - **Board Executive (`board`)**: High-level analytical overview with read-only protections.
  - **Faculty Employee (`employee`)**: Personalized portal displaying individual attendance history and leave status.
- 🛠️ **Hidden Developer Diagnostics Hub (`/dev`)**:
  - Real-time backend ping latency monitor (ms gauge).
  - Server health & environment metadata inspector.
  - Interactive Database Handshake & Seed Data reset triggers.
  - Real-time SSE stream packet analyzer.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/) + [TypeScript 5.7](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 6](https://vitejs.dev/) |
| **Styling & Design** | [Tailwind CSS v4](https://tailwindcss.com/) with Dark/Light mode |
| **Animations** | [Motion (Framer Motion)](https://motion.dev/) |
| **Icons & Visuals** | [Lucide React](https://lucide.dev/) |
| **Charts & Metrics** | [Recharts](https://recharts.org/) |
| **Real-time Protocol** | Server-Sent Events (`EventSource`) with automatic HTTPS/WSS auto-upgrades |

---

## 📁 Project Structure

```
frontend/
├── components/
│   ├── common/              # Reusable UI primitives (Toast, Pagination, Modal, etc.)
│   ├── layout/              # Header, Navigation, Sidebar, Role Badges
│   └── views/               # Main Application Views
│       ├── DashboardView.tsx         # Executive Overview & Live Metrics
│       ├── TeachersView.tsx          # Faculty Management & Registration
│       ├── AttendanceView.tsx        # Daily Attendance Log & Corrections
│       ├── ScannerSimulatorView.tsx  # Biometric Hardware Terminal Simulator
│       ├── LeavesView.tsx            # Leave Request Workflow
│       ├── ReportsView.tsx           # Analytics & CSV Export
│       ├── DevicesView.tsx           # Turnstile Hardware Status & Sync
│       ├── SettingsView.tsx          # Academic & Biometric Policies
│       ├── AuditLogsView.tsx         # Enterprise Security Trail
│       └── DevDiagnosticsView.tsx    # Secret Developer Hub (/dev)
├── services/
│   └── api.ts               # Resilient API Client with JWT & HTTPS Auto-Upgrade
├── types/
│   └── index.ts             # Strict TypeScript Models & Interfaces
├── App.tsx                  # Core Root Container & Route Handlers
├── index.html               # HTML5 Entry Point
└── package.json             # Dependencies and Scripts
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root of the `frontend` folder:

```env
# Backend API Base URL (Must use HTTPS in production to prevent Mixed Content)
VITE_API_URL=https://attendancesystembackendwebite-monsterasp.tryasp.net/api
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```
The optimized bundle will be generated in the `dist/` directory.

---

## 🌐 Production Deployment

### Cloudflare Pages
1. Connect your repository to **Cloudflare Pages**.
2. Set Build Command: `npm run build`
3. Set Output Directory: `dist`
4. Set Environment Variable: `VITE_API_URL` = `https://your-backend-domain.com/api`

### Netlify
1. Build Command: `npm run build`
2. Publish Directory: `dist`

---

## 👨‍💻 Author & Lead Engineer

**Eng. Ahmed Raafat**  
- 🌐 Portfolio: [ahmedraafat.me](https://ahmedraafat.me)  
- 💼 Senior Software Engineer & Solution Architect  
- 🎓 Elswedy International Applied Technology Schools Graduation Project

---

## 📄 License
This project is proprietary and developed for Elswedy International Applied Technology Schools.
