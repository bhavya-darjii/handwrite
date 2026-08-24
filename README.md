# Handwrite

Handwrite is a web application that transforms digital text into realistic handwriting. Built with React, TypeScript, and Vite, it allows users to type or paste text and export it as handwritten documents (PDF or images). 

## 🌟 Features

- **Text to Handwriting**: Convert typed text into a natural-looking handwriting font (uses Google Fonts' Caveat and others).
- **Export Options**: Download your creations as PDF documents using `jspdf` and `html2canvas` or export to Microsoft Word (`docx`).
- **User Authentication**: Secure signup and login powered by Firebase Authentication.
- **User Dashboard**: Manage your projects and view your usage statistics.
- **Admin Dashboard**: Centralized dashboard for administration and overview.
- **Payments Integration**: Premium features gated by a payment wall using Razorpay.
- **Beautiful UI**: Fluid animations powered by Framer Motion and WebGL effects via OGL.

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Authentication**: Firebase
- **Payments**: Razorpay
- **Animations**: Framer Motion, OGL
- **PDF Generation**: jsPDF, html2canvas, docx
- **Charts**: Recharts

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

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

3. **Environment Variables:**
   Create a `.env` file in the root directory (never commit this file) and configure your keys:
   ```env
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## 📂 Project Structure

```
handwrite/
├── public/                 # Static assets
├── src/
│   ├── AdminDashboard/     # Admin facing dashboard components
│   ├── Dashboard/          # User facing dashboard components
│   ├── Legal Pages/        # Privacy Policy, Terms of Use, etc.
│   ├── New Project/        # Core editor and PDF generation engine
│   ├── Onboarding/         # Login and Signup components
│   ├── Payment Wall/       # Razorpay integration and checkout
│   ├── App.tsx             # Main application router
│   ├── firebase.ts         # Firebase configuration and initialization
│   └── main.tsx            # React application entry point
├── package.json            # Project dependencies and scripts
└── vite.config.ts          # Vite configuration
```

## 📜 License

This project is licensed under the MIT License.
