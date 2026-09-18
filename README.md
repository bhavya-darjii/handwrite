# Handwrite

<div align="center">

**Digital Handwriting Synthesis & Document Generation Engine**

[![Private & Proprietary](https://img.shields.io/badge/Status-Private%20%26%20Proprietary-red?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-18.0-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-Build_Tool-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Backend-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)

</div>

---

## Overview

**Handwrite** is a digital productivity application engineered to convert standard digital typography into natural, realistic handwritten documents. By bridging customizable handwriting typography engines with client-side document rendering, users can draft text, adjust styling parameters, and export print-ready manuscripts, assignments, or legal paperwork directly to PDF or Microsoft Word formats.

The application incorporates complete user account management, project state persistence via Firebase, tiered subscription gating via Razorpay, and hardware-accelerated animations using WebGL and Framer Motion.

---

## Features

- **Text to Handwriting Synthesis**: Convert typed text and long-form documents into organic handwriting styles with configurable letter spacing, line height, and page layouts.
- **Multi-Format Document Export**: High-fidelity client-side document rendering to PDF via jsPDF and html2canvas, along with structured Word (.docx) document compilation.
- **User Authentication**: Account onboarding, credential storage, and session lifecycle secured by Firebase Authentication.
- **Interactive User Dashboard**: Centralized management interface for personal draft history, exported projects, and account metrics.
- **Administrative Command Center**: Operational overview interface for user account auditing and platform statistics.
- **Payment & Subscription Gateway**: Integrated Razorpay payment wall protecting premium handwriting styles and bulk export pipelines.
- **Interactive Visual Aesthetics**: Fluid interface transitions with Framer Motion and GPU-accelerated background shaders powered by OGL.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Routing | React Router DOM |
| State & Auth | Firebase Authentication & Cloud Services |
| Document Rendering | jsPDF, html2canvas, docx, file-saver |
| Animations & Shaders | Framer Motion, Motion, OGL (WebGL) |
| Payments | Razorpay API |
| Analytics & Visualization | Recharts |

---

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Firebase project credentials
- Razorpay API keys (for payment workflows)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bhavya-darjii/handwrite.git
   cd handwrite
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Razorpay Credentials
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Running the Application

```bash
# Start the local development server
npm run dev

# Build for production deployment
npm run build
```

The application will be accessible at `http://localhost:5173`.

---

## Project Structure

```
handwrite/
├── public/                 # Static public assets and fonts
├── src/
│   ├── AdminDashboard/     # Administrative control views
│   ├── Dashboard/          # User project workspace & history
│   ├── Legal Pages/        # Terms of Service, Privacy Policy, and Compliance
│   ├── New Project/        # Handwriting synthesis canvas & export pipeline
│   ├── Onboarding/         # Authentication and registration views
│   ├── Payment Wall/       # Razorpay checkout and membership handling
│   ├── App.tsx             # Core application routing
│   ├── firebase.ts         # Firebase SDK configuration
│   └── main.tsx            # Application bootstrapping
├── package.json            # Dependencies and scripts
└── vite.config.ts          # Vite build parameters
```

---

## License

**Copyright © 2026 Bhavya Darji. All Rights Reserved.**

This project and its underlying source code are **confidential, private, and proprietary**. Unauthorized copying, modification, distribution, public display, or commercial use of this software, via any medium, is strictly prohibited without explicit prior written authorization from the copyright holder.

---

## Author & Contact

**Bhavya Darji**  
- **Portfolio:** [bhavya-darji.vercel.app](https://bhavya-darji.vercel.app/)  
- **GitHub:** [@bhavya-darjii](https://github.com/bhavya-darjii)  
- **LinkedIn:** [Bhavya Darji](https://www.linkedin.com/in/bhavya-darji-181573242/)  
- **Email:** [bhavyadarji462@gmail.com](mailto:bhavyadarji462@gmail.com)

---

<p align="center">Made with ❤️ by <a href="https://bhavya-darji.vercel.app/" target="_blank" rel="noopener noreferrer"><strong>Bhavya Darji</strong></a></p>
