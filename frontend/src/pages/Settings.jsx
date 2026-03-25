import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Trash2, 
  Save, 
  BookOpen, 
  UserCheck, 
  FolderGit2, 
  Trophy, 
  Award, 
  BrainCircuit,
  CheckCircle2,
  LogOut,
  ShieldAlert,
  User as UserIcon,
  Camera
} from 'lucide-react';

import { API_URL } from '../utils/config';

const Settings = () => {
  const { token, logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('attendance');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [profilePic, setProfilePic] = useState(localStorage.getItem('student_profile_pic') || '');

  // Form States
  const [gradeForm, setGradeForm] = useState({ semester: 'Sem 1', subject: '', grade: 'S', credits: 4 });
  const [attendanceForm, setAttendanceForm] = useState({ subject: '', attendancePercent: 85 });
  const [projectForm, setProjectForm] = useState({ projectName: '', description: '', techStack: '', githubLink: '', status: 'In Progress' });
  const [skillForm, setSkillForm] = useState({ skillName: '', level: 5 });

  const notify = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfilePic(base64String);
        localStorage.setItem('student_profile_pic', base64String);
        window.dispatchEvent(new Event('storage'));
        notify('Profile picture updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async (endpoint, body, resetForm) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/student/${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        notify(`${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)} added successfully!`);
        resetForm();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <UserIcon size={18} /> },
    { id: 'attendance', label: 'Attendance', icon: <UserCheck size={18} /> },
    { id: 'projects', label: 'Projects', icon: <FolderGit2 size={18} /> },
    { id: 'skills', label: 'Skills', icon: <BrainCircuit size={18} /> },
  ];

  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Account Settings</h2>
          <p className="text-zinc-500 mt-2 font-black text-[10px] uppercase tracking-[0.3em]">Configure academic data & session parameters</p>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-500/10 text-emerald-500 p-6 rounded-[32px] text-xs font-black border border-emerald-500/20 flex items-center gap-3 animate-in zoom-in duration-300">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      {/* Main Data Section */}
      <div className="bg-[#0a0a0a] rounded-[48px] border border-zinc-900 shadow-2xl overflow-hidden">
        <div className="flex border-b border-zinc-900 p-4 gap-4 bg-zinc-900/20 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-8 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-[0_10px_25px_rgba(37,99,235,0.4)]' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-10">
          {activeTab === 'profile' && (
            <div className="space-y-10 py-4 flex flex-col items-center justify-center text-center">
                <div className="relative group">
                    <div className="w-40 h-40 rounded-[48px] border-4 border-zinc-900 bg-[#121212] flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:border-blue-600 shadow-2xl">
                        {profilePic ? (
                            <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon size={64} className="text-zinc-800" />
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <label className="cursor-pointer flex flex-col items-center">
                                <Camera className="text-white mb-2" size={32} />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Update Photo</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">{user?.name || 'VIT Student'}</h3>
                    <p className="text-blue-500 font-black text-xs uppercase tracking-[0.3em] mt-2">B.Tech Computer Science & Engineering</p>
                    <p className="text-zinc-600 text-[10px] font-medium mt-6 max-w-sm mx-auto uppercase tracking-widest leading-relaxed">
                        Your profile identity is used across the dashboard for personalization and academic reports.
                    </p>
                </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Subject Title</label>
                    <input 
                      type="text"
                      placeholder="Operating Systems"
                      className="w-full bg-[#121212] border border-zinc-800 rounded-3xl px-8 py-5 text-white font-black placeholder:text-zinc-800 focus:border-blue-500 outline-none transition-all"
                      value={attendanceForm.subject}
                      onChange={e => setAttendanceForm({...attendanceForm, subject: e.target.value})}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Threshold (%)</label>
                    <div className="flex items-center gap-8 bg-[#121212] p-2 rounded-3xl border border-zinc-800">
                      <input 
                        type="range"
                        min="0" max="100"
                        className="flex-1 accent-blue-600 ml-6"
                        value={attendanceForm.attendancePercent}
                        onChange={e => setAttendanceForm({...attendanceForm, attendancePercent: parseInt(e.target.value)})}
                      />
                      <span className="text-2xl font-black text-blue-500 w-24 text-right pr-6">{attendanceForm.attendancePercent}%</span>
                    </div>
                  </div>
              </div>
              <button 
                onClick={() => handleAdd('attendance', attendanceForm, () => setAttendanceForm({ ...attendanceForm, subject: '' }))}
                className="w-full bg-zinc-900 border border-zinc-800 text-white py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] hover:bg-blue-600 hover:border-blue-500 transition-all shadow-2xl"
              >
                Sync Attendance Profile
              </button>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Deployment Name</label>
                    <input 
                      type="text"
                      placeholder="Project Alpha"
                      className="w-full bg-[#121212] border border-zinc-800 rounded-3xl px-8 py-5 text-white font-black placeholder:text-zinc-800 focus:border-blue-500 outline-none transition-all"
                      value={projectForm.projectName}
                      onChange={e => setProjectForm({...projectForm, projectName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Technology Stack</label>
                    <input 
                      type="text"
                      placeholder="React, Node, Python"
                      className="w-full bg-[#121212] border border-zinc-800 rounded-3xl px-8 py-5 text-white font-black placeholder:text-zinc-800 focus:border-blue-500 outline-none transition-all"
                      value={projectForm.techStack}
                      onChange={e => setProjectForm({...projectForm, techStack: e.target.value})}
                    />
                  </div>
              </div>
              <button 
                onClick={() => handleAdd('project', { ...projectForm, techStack: projectForm.techStack.split(',').map(s => s.trim()) }, () => setProjectForm({ ...projectForm, projectName: '', techStack: '' }))}
                className="w-full bg-zinc-900 border border-zinc-800 text-white py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] hover:bg-emerald-600 hover:border-emerald-500 transition-all shadow-2xl"
              >
                Register Project Node
              </button>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Ability Module</label>
                    <input 
                      type="text"
                      placeholder="Neural Networks"
                      className="w-full bg-[#121212] border border-zinc-800 rounded-3xl px-8 py-5 text-white font-black placeholder:text-zinc-800 focus:border-blue-500 outline-none transition-all"
                      value={skillForm.skillName}
                      onChange={e => setSkillForm({...skillForm, skillName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Expertise (1-10)</label>
                    <div className="flex items-center gap-8 bg-[#121212] p-2 rounded-3xl border border-zinc-800">
                      <input 
                        type="range"
                        min="1" max="10"
                        className="flex-1 accent-blue-600 ml-6"
                        value={skillForm.level}
                        onChange={e => setSkillForm({...skillForm, level: parseInt(e.target.value)})}
                      />
                      <span className="text-2xl font-black text-purple-500 w-24 text-right pr-6">{skillForm.level}/10</span>
                    </div>
                  </div>
              </div>
              <button 
                onClick={() => handleAdd('skill', skillForm, () => setSkillForm({ ...skillForm, skillName: '' }))}
                className="w-full bg-zinc-900 border border-zinc-800 text-white py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] hover:bg-purple-600 hover:border-purple-500 transition-all shadow-2xl"
              >
                Incorporate Skill Data
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Session Controls */}
      <div className="space-y-6">
          <div className="flex items-center gap-4">
              <ShieldAlert className="text-red-500" size={24} />
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Security & Session</h3>
          </div>
          <div className="bg-[#0a0a0a] border border-red-500/10 p-10 rounded-[48px] flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                  <h4 className="text-lg font-black text-white uppercase">Terminate Active Session</h4>
                  <p className="text-zinc-600 text-xs mt-1 font-black uppercase tracking-widest">Clears authentication tokens and redirects to portal entry</p>
              </div>
              <button 
                onClick={logout}
                className="group flex items-center gap-4 px-10 py-5 bg-red-600/10 border border-red-600/20 text-red-500 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all duration-500 shadow-2xl"
              >
                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                Sign Out from Dashboard
              </button>
          </div>
      </div>
    </div>
  );
};

export default Settings;
