import React, { useState, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis, ReferenceLine } from 'recharts';
import { Filter, Eye, AlertCircle, Award } from 'lucide-react';

const AttendanceCorrelation = ({ data = [] }) => {
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');

  // Multi-Student Scatter Plot Data Format Expected:
  // { name: "John Doe", attendance: 85, cgpa: 8.2, semester: "4", subject: "DAA" }

  const filteredData = useMemo(() => {
    return data.filter(d => 
      (semesterFilter === 'All' || d.semester === semesterFilter) &&
      (subjectFilter === 'All' || d.subject === subjectFilter)
    );
  }, [data, semesterFilter, subjectFilter]);

  // Statistics Calculation
  const stats = useMemo(() => {
    if (filteredData.length === 0) return { r: 0, intercept: 0, slope: 0 };
    
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    const n = filteredData.length;

    filteredData.forEach(p => {
      const x = p.attendance;
      const y = p.cgpa;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
      sumY2 += y * y;
    });

    // Pearson Correlation Coefficient (r)
    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const r = denominator === 0 ? 0 : numerator / denominator;

    // Ordinary Least Squares (OLS) Regression
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { 
      r: r.toFixed(2), 
      slope, 
      intercept,
      strength: r > 0.7 ? 'Strong Positive' : r > 0.3 ? 'Moderate' : 'Weak or None'
    };
  }, [filteredData]);

  // Generate trendline points
  const trendLine = [
    { attendance: 0, cgpa: stats.intercept },
    { attendance: 100, cgpa: stats.intercept + (stats.slope * 100) }
  ];

  const getColor = (attendance, cgpa) => {
    if (attendance < 75) return '#ef4444'; // Red - At risk
    if (cgpa > 8) return '#10b981'; // Green - High performer
    return '#3b82f6'; // Blue - Standard
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-2xl flex flex-col gap-1">
          <p className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-1">{data.name}</p>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{data.subject}</p>
          <div className="flex gap-4 mt-1">
            <span className="text-sm font-semibold text-slate-700">Att: <span className="text-slate-900 font-black">{data.attendance}%</span></span>
            <span className="text-sm font-semibold text-slate-700">CGPA: <span className="text-slate-900 font-black">{data.cgpa}</span></span>
          </div>
        </div>
      );
    }
    return null;
  };

  const semesters = [...new Set(data.map(d => d.semester))];
  const subjects = [...new Set(data.map(d => d.subject))];

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Cohorts Correlation <Eye size={18} className="text-blue-500"/>
          </h3>
          <p className="text-sm text-slate-500 font-medium">Visualizing attendance vs CGPA performance across students.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Semesters</option>
              {semesters.map(s => <option key={s} value={s}>Sem {s}</option>)}
            </select>
          </div>
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2">
          <span className="text-[10px] uppercase font-black tracking-widest text-blue-500">Correlation (r)</span>
          <span className="text-sm font-black text-blue-700">{stats.r}</span>
          <span className="textxs font-bold text-slate-500 px-2 py-0.5 bg-white rounded-md ml-1">{stats.strength}</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
           <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"/> At Risk ({"<"}75%)</span>
           <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"/> High Performer (CGPA {">"}8)</span>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              type="number" 
              dataKey="attendance" 
              name="Attendance" 
              domain={[0, 100]} 
              tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
              label={{ value: "Attendance %", position: 'insideBottom', offset: -15, fill: '#64748b', fontSize: 12, fontWeight: 700 }}
            />
            <YAxis 
              type="number" 
              dataKey="cgpa" 
              name="CGPA" 
              domain={[0, 10]} 
              tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
            />
            <ZAxis type="number" range={[60, 60]} /> {/* Lock dot size */}
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }} />
            
            {/* Draw Scatter Points */}
            <Scatter name="Students" data={filteredData}>
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.attendance, entry.cgpa)} />
              ))}
            </Scatter>

            {/* Regression Line */}
            {stats.r > 0 && (
                <ReferenceLine 
                    segment={trendLine} 
                    stroke="#cbd5e1" 
                    strokeDasharray="4 4" 
                    strokeWidth={2} 
                />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
         <span className="flex items-center gap-1"><AlertCircle size={14} className="text-amber-500"/> OLS regression trendline shown for context.</span>
         <span className="font-bold">{filteredData.length} students plotted</span>
      </div>
    </div>
  );
};

export default AttendanceCorrelation;
