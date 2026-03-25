# 🚀 Student Performance & Academic Dashboard

A premium, full-stack **MERN** (MongoDB, Express, React, Node) application designed for high-performance students. This dashboard provides deep academic analytics, project tracking, attendance monitoring, and career path optimization with a stunning, neon-dark glassmorphic aesthetic.

---

## ✨ Key Features

- **🏆 Dynamic Dashboard**: Real-time visualization of academic performance, attendance, and upcoming milestones.
- **📈 Attendance Tracker**: Detailed daily scheduling with a powerful "Remaining Classes" calculator for goal attainment.
- **📂 Project Portfolio**: Comprehensive management of mini and major projects with milestone tracking and progress bars.
- **🚀 Skill Gap Analysis**: Aggregated views of current technical skills compared to industry benchmarks for target roles (Web Dev, Data Science, AI/ML, etc.).
- **🔮 Career Trajectory**: AI-driven career path recommendations based on academic history, project contributions, and extracurricular achievements.
- **⚙️ Account Control Center**: Personalized profile management with photo upload, security controls, and session management.

---

## 🎨 Design Aesthetic
- **Neon Dark Mode**: High-contrast, vibrant visual language designed for readability and focus.
- **Glassmorphism**: Elegant semi-transparent components with backdrop-blur effects for a premium feel.
- **Dynamic Animations**: Smooth transitions and interactive elements for a cohesive, alive user experience.
- **Typography-Focused**: Heavy use of bold, uppercase, and wide-spaced fonts to ensure clarity on all screens.

---

## 🛠️ Technology Stack
- **Frontend**: React JS, Vite, Pure CSS, Lucide React, Recharts.
- **Backend**: Node.js, Express JS, JWT (Authentication), MongoDB (Mongoose).
- **Deployment**: Fully **Vercel-ready** with separate backend/frontend configurations.

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local instance or Cloud cluster via URI)

### 2. Backend Setup
```bash
cd backend
npm install
npm start # Starts the API on http://localhost:5001
```
*Note: Create a `.env` file in the backend root with `MONGO_URI` and `JWT_SECRET`.*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev # Starts the Dev server on http://localhost:5173
```

---

## 📂 Project Structure
```text
├── frontend/          # React application (Vite-powered)
│   ├── src/pages/     # All main views (Dashboard, Skills, etc.)
│   ├── src/components/# Reusable UI elements
│   └── vercel.json    # Frontend Vercel configuration
├── backend/           # Node.js/Express Server
│   ├── models/        # MongoDB schemas (User, Attendance, etc.)
│   ├── routes/        # API endpoints
│   └── vercel.json    # Backend Vercel configuration
└── walkthrough.md     # Detailed architecture explanation
```

---


### **Student Syllabus Compliance**
*This project strictly avoids TypeScript and other external compilers. It uses standard HTML5, CSS3, JavaScript (ES6+), React JS, and Node.js to align with standard web development academic requirements.*

Built for Excellence
