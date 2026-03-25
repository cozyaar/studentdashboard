import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Target, Zap, ArrowRight, CheckCircle2, AlertTriangle, TrendingUp, Cpu, Shield, Code2, LineChart, Globe, BrainCircuit } from 'lucide-react';

const CAREER_DEFINITIONS = [
  {
    id: "web-dev",
    title: "Web Developer",
    description: "Architect and maintain responsive, scalable web applications.",
    icon: <Globe size={24} className="text-blue-500" />,
    colorClasses: "group-hover:bg-blue-50 group-hover:text-blue-500",
    requiredSkills: ["react", "javascript", "node.js", "html/css", "tailwind", "express", "mongodb"],
    keySubjects: ["software engineering", "web programming"]
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    description: "Extract actionable insights from complex datasets and statistics.",
    icon: <LineChart size={24} className="text-emerald-500" />,
    colorClasses: "group-hover:bg-emerald-50 group-hover:text-emerald-500",
    requiredSkills: ["python", "sql", "machine learning", "data analysis", "statistics", "pandas"],
    keySubjects: ["data structures", "database systems", "mathematics"]
  },
  {
    id: "ai-ml",
    title: "AI/ML Engineer",
    description: "Design and implement intelligent models and neural networks.",
    icon: <Cpu size={24} className="text-purple-500" />,
    colorClasses: "group-hover:bg-purple-50 group-hover:text-purple-500",
    requiredSkills: ["python", "machine learning", "deep learning", "tensorflow/pytorch", "nlp"],
    keySubjects: ["data structures", "algorithms", "artificial intelligence"]
  },
  {
    id: "software-dev",
    title: "Software Developer",
    description: "Engineer core systems, backend logic, and software architecture.",
    icon: <Code2 size={24} className="text-amber-500" />,
    colorClasses: "group-hover:bg-amber-50 group-hover:text-amber-500",
    requiredSkills: ["java", "c++", "python", "git", "sql", "docker", "system design"],
    keySubjects: ["data structures", "operating systems", "computer networks", "software engineering"]
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity Analyst",
    description: "Secure infrastructure, perform audits, and mitigate vulnerabilities.",
    icon: <Shield size={24} className="text-red-500" />,
    color: "red",
    colorClasses: "group-hover:bg-red-50 group-hover:text-red-500",
    requiredSkills: ["linux", "networking", "security", "python", "cryptography", "bash"],
    keySubjects: ["computer networks", "cryptography", "operating systems"]
  }
];

const COLOR_MAP = {
  blue: "bg-blue-50 text-blue-500",
  emerald: "bg-emerald-50 text-emerald-500",
  purple: "bg-purple-50 text-purple-500",
  amber: "bg-amber-50 text-amber-500",
  red: "bg-red-50 text-red-500",
};

const GRADE_POINTS = { 'S': 10, 'O': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'F': 0 };

const CareerInsights = () => {
  const { token } = useAuth();
  
  const [dataPayload, setDataPayload] = useState({
    skills: [],
    projects: [],
    hackathons: [],
    grades: [],
    attendanceOver80: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // DB Fetch
        const dbRes = await fetch('http://localhost:5001/api/student/dashboard', {
          headers: { 'x-auth-token': token }
        });
        
        let hData = [], aData = [], sData = [];
        if (dbRes.ok) {
          try {
             const json = await dbRes.json();
             hData = Array.isArray(json.hackathons) ? json.hackathons : [];
             aData = Array.isArray(json.attendance) ? json.attendance : [];
             sData = Array.isArray(json.skills) ? json.skills : [];
          } catch(e) {}
        }

        // Local Storage Fetch
        const rawProjects = localStorage.getItem('student_projects');
        let pData = [];
        try { pData = JSON.parse(rawProjects) || []; } catch(e) {}

        const rawGrades = localStorage.getItem('current_subjects');
        let gData = [];
        try { gData = JSON.parse(rawGrades) || []; } catch(e) {}

        // Aggregate All Skills safely
        const hSkills = hData.flatMap(h => h.skills || []);
        const pSkills = pData.flatMap(p => p.techStack || []);
        const mSkills = sData.flatMap(s => Array(Math.max(1, s.level || 1)).fill(s.skillName));
        
        // Normalize unique skills mapped
        const allSkillsRaw = [...hSkills, ...pSkills, ...mSkills]
          .filter(s => typeof s === 'string')
          .map(s => s.trim().toLowerCase());
        const normalize = (val) => {
          if (val === 'html' || val === 'css') return 'html/css';
          if (val === 'js') return 'javascript';
          if (val === 'react.js') return 'react';
          if (val === 'node' || val === 'nodejs') return 'node.js';
          if (val === 'ml' || val === 'artificial intelligence') return 'machine learning';
          if (val === 'dl') return 'deep learning';
          if (val === 'tf' || val === 'pytorch') return 'tensorflow/pytorch';
          return val;
        };
        const normalizedSkills = allSkillsRaw.map(normalize);

        // Attendance metric
        let strongAttCount = 0;
        aData.forEach(item => {
           let att = 0, tot = 0;
           (item.history || []).forEach(h => {
             if (h.status !== 'Ignored') { tot++; if (h.status === 'Present') att++; }
           });
           if (tot > 0 && (att/tot) >= 0.8) strongAttCount++;
        });

        setDataPayload({
          skills: [...new Set(normalizedSkills)], // Unique skills owned
          projects: pData,
          hackathons: hData,
          grades: gData,
          attendanceOver80: strongAttCount
        });

      } catch (err) {
        console.error("Failed fetching career insights", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.addEventListener('storage', fetchData);
    return () => window.removeEventListener('storage', fetchData);
  }, [token]);

  // Compute Career Matches
  const careerMatches = useMemo(() => {
    return CAREER_DEFINITIONS.map(career => {
      // 1. Skill Match (%)
      const matchedSkills = career.requiredSkills.filter(req => dataPayload.skills.includes(req));
      const skillScore = career.requiredSkills.length > 0 
        ? (matchedSkills.length / career.requiredSkills.length) * 100 
        : 0;

      // 2. Academic Match Modifier 
      // Check if they got A/S/O in key subjects related to this field
      let academicBoost = 0;
      let strongSubjects = [];
      career.keySubjects.forEach(ks => {
        const matchingSubject = (dataPayload.grades || []).find(g => (g.name || "").toLowerCase().includes(ks));
        if (matchingSubject && GRADE_POINTS[matchingSubject.grade] >= 8) {
          academicBoost += 10;
          strongSubjects.push(matchingSubject.name);
        }
      });
      
      // 3. Activity Boost
      let activityBoost = 0;
      let relevantProjects = [];
      (dataPayload.projects || []).forEach(p => {
         const pTech = (p.techStack || []).filter(t => typeof t === 'string').map(t => t.toLowerCase());
         const overlap = pTech.filter(t => career.requiredSkills.includes(t));
         if (overlap.length > 0) {
           activityBoost += 5;
           relevantProjects.push(p.projectName);
         }
      });

      const totalScore = Math.min(100, Math.round(skillScore * 0.7 + academicBoost + activityBoost));

      // Calculate Gap
      const missingSkills = career.requiredSkills.filter(req => !dataPayload.skills.includes(req));

      return {
        ...career,
        matchScore: totalScore,
        matchedSkills,
        missingSkills,
        reasoning: {
          strongSubjects,
          relevantProjects: [...new Set(relevantProjects)],
          hackathonCount: dataPayload.hackathons.length,
          disciplined: dataPayload.attendanceOver80 >= 3
        }
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [dataPayload]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-bold">Analyzing your career trajectory...</div>;
  }

  const overallAvg = careerMatches.length > 0 
    ? Math.round(careerMatches.reduce((acc, c) => acc + c.matchScore, 0) / careerMatches.length) 
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center gap-4">
            <Briefcase className="text-blue-500" size={36} /> Career Trajectory
          </h2>
          <p className="text-zinc-400 font-bold text-xs uppercase tracking-[0.3em] mt-2">Optimization based on multidimensional academic analytics</p>
        </div>
        
        <div className="bg-slate-900 p-4 rounded-2xl flex items-center gap-6 text-white shadow-xl shadow-blue-900/10">
           <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-blue-300 flex items-center justify-center font-black text-sm">
             {overallAvg}%
           </div>
           <div>
             <h4 className="font-bold text-sm tracking-wide">Overall Readiness</h4>
             <p className="text-xs text-slate-400">Aggregated across top tech domains</p>
           </div>
        </div>
      </div>

      {/* TOP RECOMMENDATION SPOTLIGHT */}
      {careerMatches.length > 0 && (
        <div className="bg-white rounded-[32px] border border-blue-100 shadow-xl shadow-blue-500/5 p-8 relative overflow-hidden">
           <div className="absolute -right-16 -top-16 opacity-5 pointer-events-none scale-150">
              {careerMatches[0].icon}
           </div>

           <div className="flex items-center gap-3 mb-6 relative z-10">
             <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1">
                <Target size={12}/> #1 Recommended Path
             </div>
           </div>

           <div className="flex flex-col lg:flex-row gap-10 relative z-10">
              <div className="flex-1">
                 <div className="flex items-start gap-4 mb-4">
                    <div className={`p-4 rounded-2xl flex items-center justify-center ${COLOR_MAP[careerMatches[0].color] || 'bg-slate-50 text-slate-500'}`}>
                       {careerMatches[0].icon}
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-900">{careerMatches[0].title}</h3>
                       <p className="text-slate-500 font-medium">{careerMatches[0].description}</p>
                    </div>
                 </div>

                 <div className="mt-8 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Why this fits you</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {careerMatches[0].matchedSkills.length > 0 && (
                         <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                            <CheckCircle2 size={18} className="text-emerald-500 mt-0.5" />
                            <div>
                               <p className="text-sm font-bold text-emerald-900">Strong Skill Overlap</p>
                               <p className="text-xs font-medium text-emerald-700 mt-1">Proficient in {careerMatches[0].matchedSkills.join(', ')}.</p>
                            </div>
                         </div>
                       )}

                       {careerMatches[0].reasoning.relevantProjects.length > 0 && (
                         <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                            <Code2 size={18} className="text-blue-500 mt-0.5" />
                            <div>
                               <p className="text-sm font-bold text-blue-900">Relevant Experience</p>
                               <p className="text-xs font-medium text-blue-700 mt-1">Found inside "{careerMatches[0].reasoning.relevantProjects.slice(0,2).join('", "')}".</p>
                            </div>
                         </div>
                       )}

                       {careerMatches[0].reasoning.strongSubjects.length > 0 && (
                         <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-start gap-3">
                            <BrainCircuit size={18} className="text-purple-500 mt-0.5" />
                            <div>
                               <p className="text-sm font-bold text-purple-900">Academic Alignment</p>
                               <p className="text-xs font-medium text-purple-700 mt-1">High grades detected in {careerMatches[0].reasoning.strongSubjects.join(', ')}.</p>
                            </div>
                         </div>
                       )}

                       {careerMatches[0].reasoning.hackathonCount > 0 && (
                         <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                            <Zap size={18} className="text-amber-500 mt-0.5" />
                            <div>
                               <p className="text-sm font-bold text-amber-900">Competitive Edge</p>
                               <p className="text-xs font-medium text-amber-700 mt-1">Applied skills practically in {careerMatches[0].reasoning.hackathonCount} hackathon(s).</p>
                            </div>
                         </div>
                       )}
                    </div>
                 </div>
              </div>

              {/* ACTION PLAN */}
              <div className="w-full lg:w-80 bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col">
                 <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-bold text-slate-800">Readiness</span>
                    <span className="text-2xl font-black text-blue-600">{careerMatches[0].matchScore}%</span>
                 </div>
                 <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-8">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${careerMatches[0].matchScore}%` }} />
                 </div>

                 <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-1.5"><AlertTriangle size={14}/> Critical Skill Gap</h4>
                 <div className="flex flex-wrap gap-2 mb-8">
                    {careerMatches[0].missingSkills.length > 0 ? careerMatches[0].missingSkills.slice(0, 4).map(ms => (
                       <span key={ms} className="text-[10px] font-bold px-2 py-1 bg-red-50 text-red-600 border border-red-100 rounded-md">
                          Needs {ms}
                       </span>
                    )) : (
                       <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md">
                          No major functional gaps!
                       </span>
                    )}
                 </div>

                 <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 mt-auto">Action Plan</h4>
                 <ul className="space-y-3">
                    {careerMatches[0].missingSkills.slice(0, 2).map((ms, i) => (
                      <li key={i} className="text-xs font-semibold text-slate-700 flex items-start gap-2">
                         <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-[9px] font-black">{i+1}</div>
                         Complete a certification or course dedicated to {ms}.
                      </li>
                    ))}
                    <li className="text-xs font-semibold text-slate-700 flex items-start gap-2">
                       <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-[9px] font-black">▶</div>
                       Deploy 1-2 major projects in this specific domain to solidify your portfolio.
                    </li>
                 </ul>
              </div>
           </div>
        </div>
      )}

      {/* REMAINING PATHS */}
      <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-12 mb-6">Alternative Career Pathways</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {careerMatches.slice(1).map((career, idx) => (
          <div key={career.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow group flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                 <div className={`p-3 rounded-xl bg-slate-50 text-slate-500 transition-colors ${career.colorClasses || ''}`}>
                    {career.icon}
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-slate-900">{career.title}</h3>
                    <p className="text-xs font-bold text-slate-400">{career.matchScore}% Match</p>
                 </div>
              </div>
              <div className="w-10 h-10 rounded-full border-4 border-slate-100 relative flex items-center justify-center">
                 {/* CSS Pie Chart Approximation */}
                 <div 
                   className="absolute inset-0 rounded-full border-4 border-blue-500 opacity-20" 
                 />
                 <span className="text-[10px] font-black text-slate-700">{career.matchScore}</span>
              </div>
            </div>
            
            <p className="text-sm font-medium text-slate-500 mb-6">{career.description}</p>
            
            <div className="mt-auto space-y-4 border-t border-slate-50 pt-4">
               <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Current Strengths</span>
                  <div className="flex flex-wrap gap-1.5">
                    {career.matchedSkills.length > 0 ? career.matchedSkills.slice(0,3).map(s => (
                       <span key={s} className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{s}</span>
                    )) : <span className="text-[10px] text-slate-400 font-semibold italic">No direct overlap detected</span>}
                  </div>
               </div>

               <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Skill Gaps to Close</span>
                  <div className="flex flex-wrap gap-1.5">
                    {career.missingSkills.length > 0 ? career.missingSkills.slice(0,3).map(ms => (
                       <span key={ms} className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100">{ms}</span>
                    )) : <span className="text-[10px] text-slate-400 font-semibold italic">None</span>}
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerInsights;
