# 📊 VIT Student Performance & Academic Dashboard

A sleek, premium MERN-stack dashboard designed for VIT students to track attendance, calculate CGPAs, analyze skill gaps, and manage technical accomplishments in one unified interface.

---

## 🚀 1-Click Vercel Hosting (No MongoDB Required)

This project has been optimized for **instant zero-config deployment** on Vercel. 

- **Frontend**: Full-featured React app with Glassmorphism and Neon-Dark aesthetics.
- **Backend (Node.js)**: Integrated serverless API handles dashboard logic.
- **Data Persistence**: Uses a custom **`DataService`** (located at `src/utils/DataService.js`) that leverages the browser's `localStorage` for high-speed persistence, completely removing the complexity of MongoDB and JWT for student submissions.

---

## 🔥 Key Features

### 📅 Advanced Attendance Tracker
- **Real-time Percentage Calculation**: Automatically calculates attendance based on your semester start and instructional days.
- **Skips & Freedoms**: Tells you exactly how many classes you can afford to skip without dropping below 75% or 80%.
- **Interactive Logs**: Click any day in the grid to toggle status (Present, Absent, On Duty, Ignored).

### 📈 CGPA / SGPA Dynamic Calculator
- **Future GPA Prediction**: Set a target CGPA and find out exactly what SGPA you need for the current semester to reach it.
- **Credits & Grade Sync**: Syncs with your dashboard metrics to provide real-time academic standing.

### 🧠 Skill Gap & Career Insights
- **Proficiency Radar**: Plotted against industry role benchmarks (Frontend, AI, Data Science).
- **Automated Insights**: Identifies your strengths and highlights critical improvement areas based on your projects and hackathons.

### 🏆 Hackathon & Project Management
- **Achievement Vault**: Store hackathon roles, certificates, and team details.
- **Project Milestones**: Track progress and timelines for major/minor projects.

---

## 🛠️ Tech Stack (Syllabus Compliant)

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Recharts (for Analytics)
- **Backend Architecture**: Node.js (Vercel Serverless API)
- **Deployment**: Vercel (Production Ready)
- **Languages**: HTML5, CSS3, JavaScript (ES6+)

---

## 🏗️ Getting Started Locally

1. **Clone the Repo**:
   ```bash
   git clone https://github.com/cozyaar/studentdashboard.git
   cd studentdashboard
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

4. **Access the Portal**:
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Deployment Instructions

Just import the root of this repository into your Vercel account. 
- Vercel will automatically detect the **Vite** frontend and the **`/api`** folder.
- No environment variables are required for basic usage.

---

Developed for VIT Academic Project.
Made with ❤️ for Students.
