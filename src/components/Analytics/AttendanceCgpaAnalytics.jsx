import React, { useState, useEffect, useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ZAxis, ReferenceLine,
  LineChart, Line, Legend, Area, AreaChart, ComposedChart, Brush
} from 'recharts';
import {
  TrendingUp, BarChart2, Activity, AlertCircle,
  CheckCircle2, Filter, RefreshCw, ArrowUpRight, Zap
} from 'lucide-react';

const GRADE_POINTS = { 'S': 10, 'O': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'F': 0 };

import { API_URL } from '../../utils/config';

/* ─────────────────────────────── helpers ─────────────────────────────── */
function pearsonR(pts) {
  if (pts.length < 2) return 0;
  const n = pts.length;
  let sx = 0, sy = 0, sxy = 0, sx2 = 0, sy2 = 0;
  pts.forEach(({ x, y }) => { sx += x; sy += y; sxy += x * y; sx2 += x * x; sy2 += y * y; });
  const num = n * sxy - sx * sy;
  const den = Math.sqrt((n * sx2 - sx * sx) * (n * sy2 - sy * sy));
  return den === 0 ? 0 : num / den;
}

function olsLine(pts) {
  if (pts.length < 2) return [];
  const n = pts.length;
  let sx = 0, sy = 0, sxy = 0, sx2 = 0;
  pts.forEach(({ x, y }) => { sx += x; sy += y; sxy += x * y; sx2 += x * x; });
  const slope = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
  const intercept = (sy - slope * sx) / n;
  return [
    { attendance: 40, cgpa: Math.max(0, Math.min(10, slope * 40 + intercept)) },
    { attendance: 100, cgpa: Math.max(0, Math.min(10, slope * 100 + intercept)) }
  ];
}

function dotColor(att, cgpa) {
  if (att < 75) return '#ef4444';
  if (cgpa > 8) return '#10b981';
  return '#3b82f6';
}

function rLabel(r) {
  const abs = Math.abs(r);
  if (abs >= 0.7) return 'Strong Positive';
  if (abs >= 0.3) return 'Moderate Positive';
  return 'Weak Correlation';
}

/* ─────────────────────────────── custom tooltip ─────────────────────────────── */
const ScatterTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-100 shadow-2xl rounded-2xl p-4 min-w-[180px]">
      <p className="font-black text-slate-900 text-sm mb-2">{d.name}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-6 text-xs font-semibold text-slate-600">
          <span>Attendance</span><span className="font-black text-slate-900">{d.attendance}%</span>
        </div>
        <div className="flex justify-between gap-6 text-xs font-semibold text-slate-600">
          <span>CGPA</span><span className="font-black text-slate-900">{d.cgpa?.toFixed(2)}</span>
        </div>
        {d.semester && (
          <div className="flex justify-between gap-6 text-xs font-semibold text-slate-500">
            <span>Semester</span><span>{d.semester}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const LineTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 shadow-2xl rounded-2xl p-4 min-w-[160px]">
      <p className="font-black text-slate-600 text-xs uppercase tracking-widest mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex justify-between gap-6 text-xs font-semibold" style={{ color: p.color }}>
          <span>{p.name}</span><span className="font-black">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
const AttendanceCgpaAnalytics = () => {
  const [view, setView] = useState('scatter'); // 'scatter' | 'trend'
  const [scatterData, setScatterData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  /* ── fetch & merge real data ── */
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        const semStart = localStorage.getItem('semesterStartDate') || '2026-01-01';
        const dayMap = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };

        // Load CGPA subjects from localStorage (semester subjects with grades)
        let gradeMap = {};
        try {
          const subs = JSON.parse(localStorage.getItem('current_subjects') || '[]');
          subs.forEach(s => {
            if (s.name && s.grade) {
              gradeMap[s.name.trim().toLowerCase()] = GRADE_POINTS[s.grade] ?? null;
            }
          });
        } catch (_) {}

        let attendanceItems = [];
        if (token) {
          const res = await fetch(`${API_URL}/api/student/dashboard`, {
            headers: { 'x-auth-token': token }
          });
          if (res.ok) {
            const json = await res.json();
            attendanceItems = json.attendance || [];
          }
        }

        // Build scatter data (subject-wise)
        const scatter = attendanceItems.map((item, idx) => {
          const targetDays = (item.days || []).map(d => dayMap[d.toUpperCase()]);
          let attended = 0, total = 0;
          let cur = new Date(semStart);
          const today = new Date(); today.setHours(0, 0, 0, 0);

          while (cur <= today) {
            if (targetDays.includes(cur.getDay())) {
              const ds = cur.toISOString().split('T')[0];
              const entry = item.history?.find(h => h.date === ds);
              const status = entry?.status ?? 'Present';
              if (status !== 'Ignored') {
                total++;
                if (status === 'Present' || status === 'On Duty') attended++;
              }
            }
            cur.setDate(cur.getDate() + 1);
          }

          const attPct = total > 0 ? Math.round((attended / total) * 100) : 0;
          const subjectKey = item.subject?.trim().toLowerCase();
          const cgpaVal = gradeMap[subjectKey] ?? null;

          return {
            name: item.subject,
            attendance: attPct,
            cgpa: cgpaVal,
            semester: item.slot || 'Current',
            subject: item.subject
          };
        }).filter(d => d.cgpa !== null);

        setScatterData(scatter);

        // Build time-trend data (week-by-week average attendance across all subjects)
        const weekMap = {};
        attendanceItems.forEach(item => {
          const targetDays = (item.days || []).map(d => dayMap[d.toUpperCase()]);
          (item.history || []).forEach(h => {
            if (h.status === 'Ignored') return;
            const d = new Date(h.date);
            // ISO week number
            const jan1 = new Date(d.getFullYear(), 0, 1);
            const weekNum = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
            const key = `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;

            if (!weekMap[key]) weekMap[key] = { total: 0, attended: 0, cgpaSum: 0, cgpaCount: 0 };
            weekMap[key].total++;
            if (h.status === 'Present' || h.status === 'On Duty') weekMap[key].attended++;

            const cgpaVal = gradeMap[item.subject?.trim().toLowerCase()];
            if (cgpaVal != null) { weekMap[key].cgpaSum += cgpaVal; weekMap[key].cgpaCount++; }
          });
        });

        const trend = Object.entries(weekMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([week, d]) => ({
            week,
            attendance: d.total > 0 ? Math.round((d.attended / d.total) * 100) : 0,
            cgpa: d.cgpaCount > 0 ? parseFloat((d.cgpaSum / d.cgpaCount).toFixed(2)) : null
          }))
          .filter(d => d.cgpa !== null);

        setTrendData(trend);
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  /* ── filtering ── */
  const filteredScatter = useMemo(() => {
    return scatterData.filter(d =>
      (semesterFilter === 'All' || d.semester === semesterFilter) &&
      (subjectFilter === 'All' || d.subject === subjectFilter)
    );
  }, [scatterData, semesterFilter, subjectFilter]);

  /* ── pearson & trend line ── */
  const r = useMemo(() => {
    const pts = filteredScatter.map(d => ({ x: d.attendance, y: d.cgpa }));
    return pearsonR(pts);
  }, [filteredScatter]);

  const trendLine = useMemo(() => {
    const pts = filteredScatter.map(d => ({ x: d.attendance, y: d.cgpa }));
    return olsLine(pts);
  }, [filteredScatter]);

  const semesters = [...new Set(scatterData.map(d => d.semester))];
  const subjects = [...new Set(scatterData.map(d => d.subject))];

  /* ── Insight generation ── */
  const insights = useMemo(() => {
    const list = [];
    const atRisk = filteredScatter.filter(d => d.attendance < 75);
    const highPerf = filteredScatter.filter(d => d.cgpa > 8);
    if (atRisk.length > 0) list.push({ type: 'danger', text: `${atRisk.length} subject(s) with attendance < 75% — risk of debarment.` });
    if (highPerf.length > 0) list.push({ type: 'success', text: `${highPerf.length} subject(s) with CGPA > 8 — excellent performance!` });
    if (Math.abs(r) >= 0.5) list.push({ type: 'info', text: 'Regular attendance shows a strong link with higher CGPA.' });
    if (Math.abs(r) >= 0.3 && Math.abs(r) < 0.5) list.push({ type: 'warning', text: 'Moderate correlation — improving attendance may improve grades.' });
    if (filteredScatter.length > 0 && Math.abs(r) < 0.3) list.push({ type: 'info', text: 'Weak correlation — other factors may influence performance.' });
    return list;
  }, [filteredScatter, r]);

  /* ─────────── render ─────────── */
  if (loading) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-10 shadow-sm flex flex-col items-center justify-center h-72">
        <RefreshCw size={24} className="animate-spin text-blue-500 mb-3" />
        <p className="text-slate-400 font-semibold text-sm">Loading analytics…</p>
      </div>
    );
  }

  const hasData = filteredScatter.length > 0;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex flex-col xl:flex-row justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Activity size={20} className="text-blue-500" /> Attendance vs CGPA Analytics
          </h3>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            How your attendance patterns correlate with academic performance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View toggle */}
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setView('scatter')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${view === 'scatter' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <BarChart2 size={14} /> Correlation
            </button>
            <button
              onClick={() => setView('trend')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${view === 'trend' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <TrendingUp size={14} /> Trend
            </button>
          </div>

          {/* Semester Filter */}
          <div className="relative">
            <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={semesterFilter}
              onChange={e => setSemesterFilter(e.target.value)}
              className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Semesters</option>
              {semesters.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Subject Filter */}
          <div className="relative">
            <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={subjectFilter}
              onChange={e => setSubjectFilter(e.target.value)}
              className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Stats banner ── */}
      {hasData && (
        <div className="flex flex-wrap gap-3">
          {/* Pearson r */}
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 px-4 py-2.5 rounded-2xl">
            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
              <BarChart2 size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Pearson r</p>
              <p className="text-sm font-black text-blue-900">
                {r >= 0 ? '+' : ''}{r.toFixed(2)} &nbsp;
                <span className="font-bold text-blue-600">{rLabel(r)}</span>
              </p>
            </div>
          </div>

          {/* At-risk counter */}
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 px-4 py-2.5 rounded-2xl">
            <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle size={16} className="text-red-500" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-red-400">At Risk</p>
              <p className="text-sm font-black text-red-700">
                {filteredScatter.filter(d => d.attendance < 75).length} subjects &lt; 75%
              </p>
            </div>
          </div>

          {/* High performers */}
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 px-4 py-2.5 rounded-2xl">
            <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={16} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">High CGPA</p>
              <p className="text-sm font-black text-emerald-700">
                {filteredScatter.filter(d => d.cgpa > 8).length} subjects &gt; 8.0
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Chart Area ── */}
      <div className="w-full min-h-[380px]">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center h-72 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
              <BarChart2 size={32} />
            </div>
            <h4 className="font-bold text-slate-700 mb-1">No Matching Data</h4>
            <p className="text-slate-400 text-sm max-w-xs">
              Add courses with subjects matching your CGPA calculator grades to see the correlation.
            </p>
          </div>
        ) : view === 'scatter' ? (
          /* ─── SCATTER PLOT ─── */
          <ResponsiveContainer width="100%" height={380}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                type="number" dataKey="attendance" name="Attendance" domain={[40, 100]}
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
                tickLine={false} axisLine={false}
                label={{ value: 'Attendance %', position: 'insideBottom', offset: -18, fill: '#64748b', fontSize: 12, fontWeight: 700 }}
              />
              <YAxis
                type="number" dataKey="cgpa" name="CGPA" domain={[4, 10]}
                tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
                tickLine={false} axisLine={false}
                label={{ value: 'CGPA', angle: -90, position: 'insideLeft', offset: 10, fill: '#64748b', fontSize: 12, fontWeight: 700 }}
              />
              <ZAxis type="number" range={[80, 80]} />
              <Tooltip content={<ScatterTip />} cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }} />

              {/* OLS Trend Line */}
              {trendLine.length > 0 && (
                <ReferenceLine
                  segment={trendLine}
                  stroke="#94a3b8"
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  label={{ value: `r = ${r.toFixed(2)}`, position: 'right', fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                />
              )}

              {/* 75% boundary line */}
              <ReferenceLine x={75} stroke="#fca5a5" strokeDasharray="4 4" strokeWidth={1.5}
                label={{ value: '75% min', position: 'top', fill: '#ef4444', fontSize: 10, fontWeight: 700 }} />

              <Scatter name="Subjects" data={filteredScatter}>
                {filteredScatter.map((entry, idx) => (
                  <Cell key={idx} fill={dotColor(entry.attendance, entry.cgpa)} fillOpacity={0.85} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        ) : (
          /* ─── TREND LINE CHART ─── */
          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart data={trendData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="att" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} tickLine={false} axisLine={false}
                label={{ value: 'Attendance %', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
              <YAxis yAxisId="gpa" orientation="right" domain={[0, 10]} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} tickLine={false} axisLine={false}
                label={{ value: 'CGPA', angle: 90, position: 'insideRight', fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
              <Tooltip content={<LineTip />} />
              <Legend wrapperStyle={{ fontSize: 12, fontWeight: 700 }} />

              <ReferenceLine yAxisId="att" y={75} stroke="#fca5a5" strokeDasharray="4 4" label={{ value: '75%', fill: '#ef4444', fontSize: 10 }} />

              <Area yAxisId="att" type="monotone" dataKey="attendance" name="Attendance %" stroke="#3b82f6" fill="#eff6ff" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              <Line yAxisId="gpa" type="monotone" dataKey="cgpa" name="Avg CGPA" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />

              {trendData.length > 6 && <Brush dataKey="week" height={20} travellerWidth={6} fill="#f8fafc" stroke="#e2e8f0" />}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Legend (scatter only) ── */}
      {view === 'scatter' && hasData && (
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> At Risk (Att &lt; 75%)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> High Performer (CGPA &gt; 8)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Standard</span>
          <span className="flex items-center gap-1.5 ml-auto"><span className="w-8 border-t-2 border-dashed border-slate-300 inline-block" /> OLS Trend Line</span>
        </div>
      )}

      {/* ── Insights Engine ── */}
      {insights.length > 0 && (
        <div className="border-t border-slate-100 pt-6 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <Zap size={12} className="text-amber-500" /> Smart Insights
          </p>
          {insights.map((ins, i) => {
            const map = {
              danger: 'bg-red-50 border-red-200 text-red-700',
              success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
              warning: 'bg-amber-50 border-amber-200 text-amber-700',
              info: 'bg-blue-50 border-blue-200 text-blue-700',
            };
            const icons = { danger: <AlertCircle size={13} />, success: <CheckCircle2 size={13} />, warning: <AlertCircle size={13} />, info: <ArrowUpRight size={13} /> };
            return (
              <div key={i} className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold ${map[ins.type]}`}>
                {icons[ins.type]}
                {ins.text}
              </div>
            );
          })}
          {/* Predictive hint */}
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl border border-violet-200 bg-violet-50 text-xs font-semibold text-violet-700">
            <TrendingUp size={13} />
            Predictive: Improving attendance by 10% may increase CGPA by ~{(Math.abs(r) * 0.8).toFixed(1)} points based on current trend.
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceCgpaAnalytics;
