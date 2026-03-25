import React, { useEffect } from 'react';
import { Calendar } from 'lucide-react';
import GradeDistribution from '../components/Analytics/GradeDistribution';
import ProjectWidget from '../components/Analytics/ProjectWidget';
import AttendanceCgpaAnalytics from '../components/Analytics/AttendanceCgpaAnalytics';
import HackathonAnalytics from '../components/Analytics/HackathonAnalytics';

const Dashboard = () => {
  useEffect(() => {
    // Seed localStorage for demo if empty
    let changed = false;
    
    const storedProjects = localStorage.getItem('student_projects');
    if (!storedProjects || !JSON.parse(storedProjects) || JSON.parse(storedProjects).length === 0) {
      const demoProjects = [
        {
          id: 'proj1',
          projectName: 'AI Student Analyzer',
          type: 'Major',
          submissionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          reviews: [
            { id: 'r1', title: 'Proposal', completed: true, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
            { id: 'r2', title: 'Mid Review', completed: false, date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() }
          ]
        },
        {
          id: 'proj2',
          projectName: 'Web3 Wallet Dashboard',
          type: 'Minor',
          submissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          reviews: [
             { id: 'r1', title: 'Final Review', completed: true, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() }
          ]
        }
      ];
      localStorage.setItem('student_projects', JSON.stringify(demoProjects));
      changed = true;
    }

    const storedGrades = localStorage.getItem('current_subjects');
    if (!storedGrades || !JSON.parse(storedGrades) || JSON.parse(storedGrades).length === 0) {
      const demoGrades = [
        { name: 'Data Structures', credits: 4, grade: 'A' },
        { name: 'Operating Systems', credits: 3, grade: 'C' },
        { name: 'Computer Networks', credits: 4, grade: 'S' },
        { name: 'Database Systems', credits: 4, grade: 'O' },
        { name: 'Software Engineering', credits: 3, grade: 'D' }
      ];
      localStorage.setItem('current_subjects', JSON.stringify(demoGrades));
      localStorage.setItem('semesterStartDate', '2026-01-01');
      localStorage.setItem('lastInstructionalDay', '2026-04-30');
      changed = true;
    }
    
    if (changed) {
      window.dispatchEvent(new Event('storage'));
    }
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
