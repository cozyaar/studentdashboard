import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieChartIcon, Info, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GradeDistribution = () => {
  const [gradeData, setGradeData] = useState([]);
  const [totalSubjects, setTotalSubjects] = useState(0);
  const navigate = useNavigate();

  // Define grade categories and colors
  // A/S/O -> Green, B -> Blue, C -> Yellow, D/E/F -> Red
  const categoryMap = {
    'S': { label: 'A (Excellent)', category: 'A', color: '#10b981' },
    'O': { label: 'A (Excellent)', category: 'A', color: '#10b981' },
    'A': { label: 'A (Excellent)', category: 'A', color: '#10b981' },
    'B': { label: 'B (Good)', category: 'B', color: '#3b82f6' },
    'C': { label: 'C (Average)', category: 'C', color: '#f59e0b' },
    'D': { label: 'D (Needs Improvement)', category: 'D', color: '#ef4444' },
    'E': { label: 'D (Needs Improvement)', category: 'D', color: '#ef4444' },
    'F': { label: 'F (Fail)', category: 'F', color: '#b91c1c' },
  };

  useEffect(() => {
    // Read from CGPA engine's localStorage
    const loadGrades = () => {
      try {
        const savedSubjects = localStorage.getItem('current_subjects');
        if (!savedSubjects) return;

        const subjects = JSON.parse(savedSubjects);
        if (!Array.isArray(subjects) || subjects.length === 0) return;

        setTotalSubjects(subjects.length);

        // Aggregate by category
        const counts = { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
        subjects.forEach(sub => {
          const map = categoryMap[sub.grade?.toUpperCase()];
          if (map) counts[map.category]++;
        });

        const formattedData = [
          { name: 'Grade A', value: counts['A'], color: '#10b981' },
          { name: 'Grade B', value: counts['B'], color: '#3b82f6' },
          { name: 'Grade C', value: counts['C'], color: '#f59e0b' },
          { name: 'Grade D/E', value: counts['D'], color: '#ef4444' },
          { name: 'Fail', value: counts['F'], color: '#b91c1c' }
        ].filter(item => item.value > 0); // Only keep active slices

        setGradeData(formattedData);
      } catch (error) {
        console.error("Failed to parse grades:", error);
      }
    };

    loadGrades();
    // Re-check periodically if user navigated back
    window.addEventListener('storage', loadGrades);
    return () => window.removeEventListener('storage', loadGrades);
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalSubjects) * 100).toFixed(0);
      return (
        <div className="bg-white border border-slate-100 p-3 rounded-2xl shadow-xl backdrop-blur-md">
          <p className="font-bold text-slate-900 mb-1" style={{ color: data.color }}>{data.name}</p>
          <div className="flex flex-col gap-1 text-xs font-medium">
            <p className="flex justify-between gap-4 text-slate-500">
              Subjects: <span className="text-slate-900">{data.value}</span>
            </p>
            <p className="flex justify-between gap-4 text-slate-500">
              Percentage: <span className="text-slate-900">{percentage}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Generate Insight
  const getInsight = () => {
    if (gradeData.length === 0) return "Add subjects in the CGPA engine to see insights.";
    
    // Find dominant
    const dominant = [...gradeData].sort((a, b) => b.value - a.value)[0];
    const weakCount = gradeData.find(g => g.name === 'Grade D/E')?.value || 0;
    const failCount = gradeData.find(g => g.name === 'Fail')?.value || 0;

    if (failCount > 0) return `Critical Alert: You are failing in ${failCount} subject(s).`;
    if (weakCount > 0) return `You have ${weakCount} weak subject(s) needing attention.`;
    return `Excellent! Most of your subjects are tracking as ${dominant.name}.`;
  };

  return (
    <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col h-full min-h-[460px]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Grade Distribution</h3>
          <p className="text-slate-500 mt-1 text-sm font-medium">Breakdown of your current academic performance</p>
        </div>
        <button 
          onClick={() => navigate('/attendance')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-bold text-blue-600 transition-colors cursor-pointer"
        >
          Open CGPA Engine <ArrowRight size={14} />
        </button>
      </div>

      {gradeData.length > 0 ? (
        <div className="flex flex-col md:flex-row items-center justify-between flex-1 gap-8">
          {/* Chart */}
          <div className="h-[280px] w-full md:w-1/2 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  isAnimationActive={true}
                  animationBegin={200}
                  animationDuration={1200}
                >
                  {gradeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" className="hover:opacity-80 transition-opacity outline-none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-slate-900">{totalSubjects}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total Subjects</span>
            </div>
          </div>

          {/* Details & Insight */}
          <div className="w-full md:w-1/2 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              {gradeData.map((data, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }}></div>
                  <div>
                    <p className="text-xs font-bold text-slate-500">{data.name}</p>
                    <p className="text-lg font-bold text-slate-900">{data.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-start gap-3 mt-auto">
              <div className="bg-blue-100 p-2 rounded-xl text-blue-600 mt-0.5"><Info size={16} /></div>
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Analyzer Insight</h4>
                <p className="text-sm text-slate-700 font-medium leading-snug">{getInsight()}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center mt-8 p-12 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
          <PieChartIcon size={48} className="text-slate-300 mb-4" />
          <h4 className="text-slate-600 font-bold mb-2">No Grade Data Available</h4>
          <p className="text-slate-400 text-sm text-center max-w-sm mb-6">
            Go to the Attendance page and open the CGPA Engine widget to input your current subjects and grades.
          </p>
          <button 
            onClick={() => navigate('/attendance')}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors"
          >
            Launch CGPA Engine
          </button>
        </div>
      )}
    </div>
  );
};

export default GradeDistribution;
