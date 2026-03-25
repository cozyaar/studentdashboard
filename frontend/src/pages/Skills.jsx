import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { BrainCircuit, Target, Zap, ArrowRight, ArrowUpRight, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

const REQUIRED_CAREERS = {
  "Frontend Developer": {
    "React": 90, "JavaScript": 90, "HTML/CSS": 95, "Tailwind": 85, "TypeScript": 80, "Node.js": 50
  },
  "Backend Developer": {
    "Node.js": 90, "Python": 85, "MongoDB": 85, "Express": 85, "SQL": 80, "React": 40
  },
  "Full Stack Developer": {
    "React": 85, "Node.js": 85, "MongoDB": 80, "JavaScript": 90, "Express": 80, "SQL": 70
  },
  "Data Scientist": {
    "Python": 95, "Machine Learning": 85, "SQL": 90, "Data Analysis": 90, "Statistics": 85, "R": 70
  },
  "AI Engineer": {
    "Python": 95, "Machine Learning": 90, "Deep Learning": 85, "TensorFlow/PyTorch": 85, "Data Processing": 80, "Mathematics": 80
  }
};

const calculateLevel = (count) => {
  if (count === 0) return 0;
  if (count === 1) return 30;
  if (count === 2) return 55;
  if (count === 3) return 75;
  if (count === 4) return 90;
  return 100;
};

import { API_URL } from '../utils/config';

const Skills = () => {
  const { token } = useAuth();
  const [selectedCareer, setSelectedCareer] = useState("Full Stack Developer");
  const [hackathonSkills, setHackathonSkills] = useState([]);
  const [projectSkills, setProjectSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Hackathons
        const res = await fetch(`${API_URL}/api/student/dashboard`, {
          headers: { 'x-auth-token': token }
        });
        if (res.ok) {
          const data = await res.json();
          // Map skills from hackathons
          const hSkills = (data.hackathons || []).flatMap(h => h.skills || []);
          
          // Map manually added skills from Settings
          // A skill added with level 5 gets injected 5 times so its frequency boosts its calculated level
          const mSkills = (data.skills || []).flatMap(s => Array(Math.max(1, s.level || 1)).fill(s.skillName));
          
          setHackathonSkills([...hSkills, ...mSkills]
            .filter(s => typeof s === 'string')
            .map(s => s.trim().toLowerCase())
          );
        }

        // Fetch Projects from LocalStorage
        const savedProjects = localStorage.getItem('student_projects');
        if (savedProjects) {
          try {
             const parsed = JSON.parse(savedProjects);
             const pSkills = (parsed || []).flatMap(p => p.techStack || []);
             setProjectSkills(pSkills.filter(s => typeof s === 'string').map(s => s.trim().toLowerCase()));
          } catch(e) {}
        }

      } catch (err) {
        console.error("Failed to load skills data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.addEventListener('storage', fetchData);
    return () => window.removeEventListener('storage', fetchData);
  }, [token]);

  // Aggregate current skills mapping
  const currentSkillsCount = useMemo(() => {
    const counts = {};
    const allSkills = [...hackathonSkills, ...projectSkills];
    
    // Custom mapping for varied inputs (e.g. "html", "css" -> "html/css")
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

    allSkills.forEach(s => {
      const norm = normalize(s);
      counts[norm] = (counts[norm] || 0) + 1;
    });

    return counts;
  }, [hackathonSkills, projectSkills]);

  // Main Radar Chart & Gap Analysis Data
  const analysisData = useMemo(() => {
    const required = REQUIRED_CAREERS[selectedCareer] || {};
    const data = [];
    
    Object.keys(required).forEach(skill => {
      const reqVal = required[skill];
      const matchKey = skill.toLowerCase();
      
      const count = currentSkillsCount[matchKey] || 0;
      const curVal = calculateLevel(count);

      data.push({
        subject: skill,
        Required: reqVal,
        Current: curVal,
        gap: reqVal - curVal
      });
    });

    return data;
  }, [selectedCareer, currentSkillsCount]);

  const readinessScore = useMemo(() => {
    if (analysisData.length === 0) return 0;
    
    let totalReq = 0;
    let totalCur = 0;
    
    analysisData.forEach(d => {
      totalReq += d.Required;
      totalCur += Math.min(d.Current, d.Required); // Don't overflow readiness if they over-perform
    });

    return Math.round((totalCur / totalReq) * 100);
  }, [analysisData]);

  const insights = useMemo(() => {
    const statements = [];
    const strong = analysisData.filter(d => d.Current >= d.Required);
    const weak = analysisData.filter(d => d.gap >= 30);
    const moderate = analysisData.filter(d => d.gap > 0 && d.gap < 30);

    if (readinessScore >= 80) {
      statements.push({ type: 'success', icon: <CheckCircle2 size={16}/>, msg: `You are ${readinessScore}% ready for a ${selectedCareer} role!` });
    } else if (readinessScore >= 50) {
      statements.push({ type: 'warning', icon: <TrendingUp size={16}/>, msg: `You are on the right track! ${readinessScore}% match for this role.` });
    } else {
      statements.push({ type: 'danger', icon: <AlertTriangle size={16}/>, msg: `You're currently at a ${readinessScore}% match. Significant skill gaps identified.` });
    }

    if (strong.length > 0) {
      statements.push({ type: 'info', icon: <Zap size={16}/>, msg: `You are exceptionally strong in ${strong.map(s => s.subject).join(', ')}.` });
    }

    if (weak.length > 0) {
      statements.push({ type: 'danger', icon: <Target size={16}/>, msg: `Critical improvement needed in: ${weak.map(s => s.subject).join(', ')}.` });
    }

    return statements;
  }, [analysisData, readinessScore, selectedCareer]);

  const recommendations = useMemo(() => {
    const list = [];
    const gaps = [...analysisData].sort((a, b) => b.gap - a.gap);
    
    // Take top 3 gaps
    const topGaps = gaps.filter(g => g.gap > 0).slice(0, 3);
    
    topGaps.forEach(g => {
      if (g.gap >= 50) list.push(`Start learning the fundamentals of ${g.subject}. It is highly required for your career.`);
      else if (g.gap >= 20) list.push(`Build more mini-projects leveraging ${g.subject} to increase your proficiency.`);
      else list.push(`You form a good base in ${g.subject}, but require advanced practice via Hackathons.`);
    });
    
    if (list.length === 0) list.push(`You meet all the baseline metric requirements. Keep practicing!`);
    
    return list;
  }, [analysisData]);


  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-bold">Evaluating Skill Matrices...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center gap-4">
            <BrainCircuit className="text-blue-500" size={36} /> Skill Gap Analysis
          </h2>
          <p className="text-zinc-400 font-bold text-xs uppercase tracking-[0.3em] mt-2">Evaluate matrices against industry role benchmarks</p>
        </div>
        
        <div className="bg-white px-4 py-2 border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Target Career:</span>
          <select 
            value={selectedCareer}
            onChange={(e) => setSelectedCareer(e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-blue-700 outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {Object.keys(REQUIRED_CAREERS).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* RADAR CHART PANEL */}
        <div className="xl:col-span-2 bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 flex flex-col h-full min-h-[500px]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Career Proficiency Radar</h3>
              <p className="text-sm text-slate-500 mt-1">Plotted against Top 6 Core Skills for {selectedCareer}</p>
            </div>
            
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 block mb-1">Readiness</span>
              <div className="flex items-center gap-2">
                <span className={`text-4xl font-black ${readinessScore >= 80 ? 'text-emerald-600' : readinessScore >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                  {readinessScore}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={analysisData}>
                <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3"/>
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Required Level" dataKey="Required" stroke="#94a3b8" strokeWidth={2} fill="#94a3b8" fillOpacity={0.1} />
                <Radar name="Your Current Level" dataKey="Current" stroke="#3b82f6" strokeWidth={3} fill="#3b82f6" fillOpacity={0.5} activeDot={{ r: 6 }}/>
                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700, paddingTop: '20px' }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SIDE PANELS */}
        <div className="flex flex-col gap-8">
          
          {/* BREAKDOWN LIST */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Target size={18} className="text-slate-400" /> Skill Breakdown
            </h3>
            
            <div className="space-y-5">
              {analysisData.map(stat => {
                const isStrong = stat.Current >= stat.Required;
                const isWeak = stat.gap >= 30;
                const isModerate = !isStrong && !isWeak;

                return (
                  <div key={stat.subject}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-bold text-slate-700">{stat.subject}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase text-slate-400">Req: {stat.Required}</span>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                          isStrong ? 'bg-emerald-100 text-emerald-700' : 
                          isModerate ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {stat.Current}
                        </span>
                      </div>
                    </div>
                    {/* Progress bars overlapping */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
                      <div className="absolute top-0 left-0 h-full bg-slate-300 rounded-full" style={{ width: `${stat.Required}%` }} />
                      <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${
                        isStrong ? 'bg-emerald-500' : isModerate ? 'bg-amber-500' : 'bg-red-500'
                      }`} style={{ width: `${stat.Current}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* INSIGHTS */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] shadow-xl p-8 border border-slate-700 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <BrainCircuit size={200} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 relative z-10">
            <Zap size={20} className="text-amber-400" /> AI Insights Engine
          </h3>
          <div className="space-y-4 relative z-10">
            {insights.map((ins, i) => {
              const colors = {
                success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                danger: 'bg-red-500/20 text-red-300 border-red-500/30',
                info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
              };
              return (
                <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-sm ${colors[ins.type]}`}>
                  <div className="mt-0.5">{ins.icon}</div>
                  <p className="font-semibold text-sm leading-snug">{ins.msg}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* RECOMMENDATIONS */}
        <div className="bg-blue-50 rounded-[32px] border border-blue-100 shadow-sm p-8">
          <h3 className="text-lg font-bold text-blue-900 mb-6 flex items-center gap-2">
            <ArrowUpRight size={20} className="text-blue-600" /> Improvement Plan
          </h3>
          <div className="space-y-4">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-4 bg-white p-5 rounded-2xl border border-blue-100 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-black flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-slate-700 font-medium text-sm pt-1.5 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

export default Skills;
