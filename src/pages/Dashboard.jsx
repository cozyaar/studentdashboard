import React, { useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GradeDistribution from '../components/Analytics/GradeDistribution';
import ProjectWidget from '../components/Analytics/ProjectWidget';
import AttendanceCgpaAnalytics from '../components/Analytics/AttendanceCgpaAnalytics';
import HackathonAnalytics from '../components/Analytics/HackathonAnalytics';

const Dashboard = () => {
  useEffect(() => {
    // Data filtering/processing can be done here if needed
    // But DataService already handles the aggregation and seeding for demo accounts
  }, []);
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-1">Academic Overview</h2>
          <p className="text-zinc-400 font-bold text-xs uppercase tracking-[0.3em]">Track your performance and network activity</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-[10px] uppercase font-black text-white tracking-widest shadow-xl hover:bg-zinc-800 transition-all flex items-center gap-2">
            <Calendar size={14} /> Last 6 Months
          </button>
          <button className="px-6 py-3 bg-blue-600 rounded-2xl text-[10px] uppercase font-black text-white tracking-widest shadow-[0_4px_20px_rgba(37,99,235,0.4)] hover:bg-blue-700 transition-all">
            Generate Report
          </button>
        </div>
      </div>

      {/* Top widgets row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GradeDistribution />
        <div className="h-full">
          <ProjectWidget />
        </div>
      </div>

      {/* Full-width Analytics */}
      <div className="w-full">
        <AttendanceCgpaAnalytics />
      </div>

      {/* Hackathon Analytics */}
      <div className="w-full">
        <HackathonAnalytics />
      </div>
    </div>
  );
};

export default Dashboard;
