import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  MapPin, 
  Clock, 
  User as UserIcon, 
  Plus, 
  X, 
  ChevronDown, 
  ChevronUp,
  RotateCcw,
  Trash2,
  Calendar,
  AlertCircle,
  TrendingUp,
  History
} from 'lucide-react';

const Attendance = () => {
  const { token, user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('MON');
  const [lastInstructionalDay, setLastInstructionalDay] = useState(
    localStorage.getItem('lastInstructionalDay') || '2026-05-15'
  );
  const [semesterStartDate, setSemesterStartDate] = useState(
    localStorage.getItem('semesterStartDate') || '2026-01-15'
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCgpaModal, setShowCgpaModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmClear, setConfirmClear] = useState(null);
  
  // CGPA Calculator States
  const [pastCgpa, setPastCgpa] = useState(parseFloat(localStorage.getItem('past_cgpa')) || 0);
  const [pastCredits, setPastCredits] = useState(parseFloat(localStorage.getItem('past_credits')) || 0);
  const [includePast, setIncludePast] = useState(localStorage.getItem('include_past') !== 'false');
  const [currentSubjects, setCurrentSubjects] = useState(() => {
    try {
        const saved = localStorage.getItem('current_subjects');
        return saved ? JSON.parse(saved) : [];
    } catch(e) { return []; }
  });
  const [targetCgpa, setTargetCgpa] = useState(parseFloat(localStorage.getItem('target_cgpa')) || 9.0);
  const [cgpa, setCgpa] = useState(localStorage.getItem('user_cgpa') || '0.00');
  const [confirmUpdateCgpa, setConfirmUpdateCgpa] = useState(false);

  const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

  useEffect(() => {
    fetchAttendance();
  }, [token]);

  useEffect(() => {
    localStorage.setItem('lastInstructionalDay', lastInstructionalDay);
  }, [lastInstructionalDay]);

  useEffect(() => {
    localStorage.setItem('semesterStartDate', semesterStartDate);
  }, [semesterStartDate]);

  useEffect(() => {
    localStorage.setItem('user_cgpa', cgpa);
  }, [cgpa]);

  useEffect(() => {
    localStorage.setItem('past_cgpa', pastCgpa);
    localStorage.setItem('past_credits', pastCredits);
    localStorage.setItem('include_past', includePast);
    localStorage.setItem('current_subjects', JSON.stringify(currentSubjects));
    localStorage.setItem('target_cgpa', targetCgpa);
  }, [pastCgpa, pastCredits, includePast, currentSubjects, targetCgpa]);

  const fetchAttendance = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/student/dashboard', {
        headers: { 'x-auth-token': token }
      });
      const data = await res.json();
      
      const processed = (data.attendance || []).map(a => {
          const stats = getCalculatedStats(a);
          return { ...a, attendedClasses: stats.attended, totalClasses: stats.total };
      });
      
      setAttendance(processed);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newClass = {
      subject: formData.get('subject'),
      room: formData.get('room'),
      slot: formData.get('slot') || '',
      faculty: formData.get('faculty') || '',
      time: formData.get('time') || '',
      days: daysOfWeek.filter(day => formData.get(day) === 'on'),
      courseCode: formData.get('courseCode') || '',
      credits: Number(formData.get('credits')) || 3,
      history: [],
      attendedClasses: 0,
      totalClasses: 0
    };

    if (!newClass.subject || !newClass.room) {
        alert("Name and Room Number are mandatory!");
        return;
    }

    try {
      const res = await fetch('http://localhost:5001/api/student/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(newClass)
      });
      const savedClass = await res.json();
      setAttendance([...attendance, savedClass]);
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const getCalculatedStats = (courseData) => {
    if (!courseData) return { attended: 0, total: 0 };
    const dayMap = { 'SUN': 0, 'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5, 'SAT': 6 };
    const targetDays = (courseData.days || []).map(d => dayMap[d.toUpperCase()]);
    
    let cur = new Date(semesterStartDate);
    const end = new Date();
    end.setHours(0,0,0,0);

    let attended = 0;
    let total = 0;

    while (cur <= end) {
      if (targetDays.includes(cur.getDay())) {
        const dateStr = cur.toISOString().split('T')[0];
        const existing = courseData.history.find(h => h.date === dateStr);
        const status = existing ? existing.status : 'Present';
        
        if (status !== 'Ignored') {
            total++;
            if (status === 'Present' || status === 'On Duty') {
                attended++;
            }
        }
      }
      cur.setDate(cur.getDate() + 1);
    }
    return { attended, total };
  };

  const updateAttendanceItem = async (updatedItem) => {
    try {
      const res = await fetch(`http://localhost:5001/api/student/attendance/${updatedItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(updatedItem)
      });
      const data = await res.json();
      setAttendance(attendance.map(a => a._id === data._id ? data : a));
      if (selectedClass?._id === data._id) setSelectedClass(data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCourse = async (id) => {
    try {
      await fetch(`http://localhost:5001/api/student/attendance/${id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      setAttendance(attendance.filter(a => a._id !== id));
      setSelectedClass(null);
      setConfirmDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const resetCourseHistory = async (id) => {
    try {
        const item = attendance.find(a => a._id === id);
        if (!item) return;
        const updatedItem = { ...item, history: [], attendedClasses: 0, totalClasses: 0 };
        updateAttendanceItem(updatedItem);
        setConfirmClear(null);
    } catch (err) {
        console.error(err);
    }
  };

  const toggleHistoryStatus = (item, dateStr) => {
    const statuses = ['Present', 'Absent', 'Ignored', 'On Duty'];
    const currentEntry = item.history.find(h => h.date === dateStr);
    const currentStatus = currentEntry ? currentEntry.status : 'Present';
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];

    const todayStr = new Date().toISOString().split('T')[0];

    if (dateStr > todayStr) {
      const newAttendance = attendance.map(a => {
        if (a._id !== item._id) return a;
        let newHistory = [...a.history];
        const idx = newHistory.findIndex(h => h.date === dateStr);
        
        if (nextStatus === 'Ignored') {
            newHistory = newHistory.filter(h => h.date !== dateStr);
        } else {
            if (idx > -1) {
                newHistory[idx] = { ...newHistory[idx], status: nextStatus };
            } else {
                newHistory.push({ date: dateStr, status: nextStatus });
            }
        }

        const stats = getCalculatedStats({ ...a, history: newHistory });
        const updated = { ...a, history: newHistory, attendedClasses: stats.attended, totalClasses: stats.total };
        if (selectedClass?._id === a._id) setSelectedClass(updated);
        return updated;
      });
      setAttendance(newAttendance);
      return;
    }

    let newHistory = [...item.history];
    const index = newHistory.findIndex(h => h.date === dateStr);
    
    if (nextStatus === 'Ignored') {
        newHistory = newHistory.filter(h => h.date !== dateStr);
    } else {
        if (index > -1) {
            newHistory[index] = { ...newHistory[index], status: nextStatus };
        } else {
            newHistory.push({ date: dateStr, status: nextStatus });
        }
    }

    const itemWithNewHistory = { ...item, history: newHistory };
    const stats = getCalculatedStats(itemWithNewHistory);
    updateAttendanceItem({ ...itemWithNewHistory, attendedClasses: stats.attended, totalClasses: stats.total });
  };

  const calculateRemainingClasses = (days) => {
    if (!days || days.length === 0) return 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    const lastDay = new Date(lastInstructionalDay);
    if (today > lastDay) return 0;
    
    let count = 0;
    let cur = new Date(today);
    cur.setDate(cur.getDate() + 1); 
    
    const dayMap = { 'SUN': 0, 'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5, 'SAT': 6 };
    const activeDays = days.map(d => dayMap[d.toUpperCase()]);

    while (cur <= lastDay) {
      if (activeDays.includes(cur.getDay())) {
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  };

  const calculateSafeMargin = (course) => {
    if (!course) return { safe: true, text: '', value: 0 };
    const remaining = calculateRemainingClasses(course.days || []);
    const totalPotential = course.totalClasses + remaining;
    const currentMissed = course.totalClasses - course.attendedClasses;
    
    const maxMissable = Math.floor(totalPotential * 0.25);
    const freedom = maxMissable - currentMissed;

    if (freedom < 0) {
       if (course.attendedClasses + remaining < Math.ceil(totalPotential * 0.75)) {
           return { safe: false, text: "DEBARRED", value: Math.abs(freedom) };
       }
       return { safe: false, text: "SHORTAGE", value: Math.abs(freedom) };
    }
    return { safe: true, text: "CAN SKIP", value: freedom };
  };

  const GRADE_POINTS = { 'S': 10, 'O': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'F': 0 };

  const calculateCgpaMetrics = () => {
    const pCgpa = parseFloat(pastCgpa) || 0;
    const pCredits = parseFloat(pastCredits) || 0;
    const tCgpa = parseFloat(targetCgpa) || 0;

    const currentCredits = currentSubjects.reduce((sum, s) => sum + (parseFloat(s.credits) || 0), 0);
    const currentPoints = currentSubjects.reduce((sum, s) => sum + ((parseFloat(s.credits) || 0) * (GRADE_POINTS[s.grade] || 0)), 0);
    const semGpa = currentCredits > 0 ? (currentPoints / currentCredits) : 0;

    let totalPoints = currentPoints;
    let totalCredits = currentCredits;

    if (includePast && pCredits > 0) {
        totalPoints += (pCgpa * pCredits);
        totalCredits += pCredits;
    }

    const overallCgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
    const requiredPoints = tCgpa * (pCredits + currentCredits) - (pCgpa * pCredits);
    const requiredSgpa = currentCredits > 0 ? (requiredPoints / currentCredits) : 0;

    return { semGpa, overallCgpa, currentCredits, totalCredits, requiredSgpa };
  };

  const getFullHistoryForCourse = (course) => {
    if (!course) return [];
    const dates = [];
    const dayMap = { 'SUN': 0, 'MON': 1, 'TUE': 2, 'WED': 3, 'THU': 4, 'FRI': 5, 'SAT': 6 };
    const targetDays = (course.days || []).map(d => dayMap[d.toUpperCase()]);
    
    let cur = new Date(semesterStartDate);
    const end = new Date(lastInstructionalDay);
    const todayStr = new Date().toISOString().split('T')[0];

    while (cur <= end) {
      if (targetDays.includes(cur.getDay())) {
        const dateStr = cur.toISOString().split('T')[0];
        const existing = (course.history || []).find(h => h.date === dateStr);
        dates.push({
          date: dateStr,
          status: existing ? existing.status : (dateStr <= todayStr ? 'Present' : 'Predicted'),
          isFuture: dateStr > todayStr,
          isToday: dateStr === todayStr
        });
      }
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  };

  const getDayAttendance = useMemo(() => {
    return attendance.filter(item => item.days.includes(selectedDay));
  }, [attendance, selectedDay]);

  const overallStats = useMemo(() => {
    let totalAttended = 0;
    let totalHeld = 0;
    attendance.forEach(item => {
      totalAttended += item.attendedClasses;
      totalHeld += item.totalClasses;
    });
    const percent = totalHeld > 0 ? (totalAttended / totalHeld) * 100 : 0;
    return { attended: totalAttended, held: totalHeld, percent: percent.toFixed(1) };
  }, [attendance]);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Attendance...</div>;

  return (
    <div className="-m-6 bg-black min-h-screen text-slate-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Aggregate Stats */}
          <div className="group relative bg-[#0a0a0a] border border-white/5 p-8 rounded-[40px] shadow-2xl transition-all hover:scale-[1.02] duration-500">
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em]">Aggregate Attendance</p>
                <h2 className="text-6xl font-black text-white tracking-tighter">{overallStats.percent}%</h2>
                <div className="flex items-center gap-2.5 pt-2">
                    <Clock size={16} className="text-blue-500" />
                    <p className="text-[11px] font-black text-white/50 uppercase tracking-widest">{overallStats.attended} / {overallStats.held} Attended</p>
                </div>
              </div>
              <div className="w-28 h-28 relative">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.03)" strokeWidth="12" fill="transparent" />
                    <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="12" fill="transparent" 
                        strokeDasharray={301.6} 
                        strokeDashoffset={301.6 - (301.6 * parseFloat(overallStats.percent)) / 100}
                        className="text-blue-500 transition-all duration-1000 ease-out" 
                    />
                </svg>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[40px] shadow-2xl col-span-1 lg:col-span-2">
            <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] mb-8">Academic Timeline</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-4">
                  <p className="text-[11px] text-white/60 uppercase font-black tracking-widest">Semester Start</p>
                  <input type="date" value={semesterStartDate} onChange={(e) => setSemesterStartDate(e.target.value)} className="w-full bg-[#121212] text-white rounded-3xl px-6 py-5 text-base font-black border border-white/5 focus:outline-none" />
               </div>
               <div className="space-y-4">
                  <p className="text-[11px] text-white/60 uppercase font-black tracking-widest">Last Instructional Day</p>
                  <input type="date" value={lastInstructionalDay} onChange={(e) => setLastInstructionalDay(e.target.value)} className="w-full bg-[#121212] text-white rounded-3xl px-6 py-5 text-base font-black border border-white/5 focus:outline-none" />
               </div>
            </div>
          </div>

          {/* GPA Widget */}
          <div onClick={() => setShowCgpaModal(true)} className="group bg-[#0a0a0a] border border-white/5 p-8 rounded-[40px] flex items-center justify-between cursor-pointer hover:border-blue-500/30 transition-all shadow-2xl">
            <div>
              <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] mb-3">Current Standing</p>
              <div className="flex items-baseline gap-3">
                <p className="text-6xl font-black text-white tracking-tighter">{cgpa}</p>
                <p className="text-xl font-black text-white/20 uppercase">GPA</p>
              </div>
            </div>
            <GraduationCap className="text-white/5" size={80} />
          </div>
        </div>

        {/* Schedule */}
        <div className="pt-10 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-1.5 h-10 bg-blue-600 rounded-full" />
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-white uppercase">Schedule Tracker</h2>
                        <p className="text-[10px] text-white/40 font-black tracking-[0.2em] uppercase mt-1">Daily Status</p>
                    </div>
                </div>
                <div className="flex bg-[#0a0a0a] p-2 rounded-3xl border border-white/5 shadow-2xl">
                    {daysOfWeek.map(day => (
                        <button key={day} onClick={() => setSelectedDay(day)} className={`px-8 py-3 rounded-2xl font-black text-[11px] tracking-[0.1em] transition-all ${selectedDay === day ? 'bg-blue-600 text-white' : 'text-white/30'}`}>
                            {day}
                        </button>
                    ))}
                </div>
            </div>

            {getDayAttendance.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
                    {getDayAttendance.map((item) => {
                        const percent = item.totalClasses > 0 ? (item.attendedClasses / item.totalClasses) * 100 : 0;
                        const statusColor = percent >= 85 ? 'text-emerald-500' : percent >= 75 ? 'text-blue-500' : 'text-red-500';
                        return (
                            <div key={item._id} onClick={() => setSelectedClass(item)} className="group bg-[#0a0a0a] border border-white/5 p-10 rounded-[48px] hover:border-white/10 transition-all cursor-pointer flex flex-col h-full shadow-2xl">
                                <div className="flex justify-between items-start mb-8">
                                    <h3 className="text-2xl font-black text-white tracking-tight">{item.subject}</h3>
                                    <div className={`text-xl font-black ${statusColor}`}>{Math.round(percent)}%</div>
                                </div>
                                <div className="space-y-3 mb-8 opacity-60">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2"><MapPin size={12}/>{item.room}</p>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2"><Clock size={12}/>{item.time || '08:00 AM'}</p>
                                </div>
                                <div className="mt-auto pt-6 border-t border-white/5">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase text-white/30">
                                        <span>Attendance</span>
                                        <span>{item.attendedClasses} / {item.totalClasses}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-[#0a0a0a] border border-dashed border-white/5 rounded-[60px]">
                    <p className="text-white/20 text-sm font-black uppercase tracking-[0.4em] mb-12">No classes scheduled for {selectedDay}</p>
                    <div onClick={() => setShowAddModal(true)} className="group bg-black border border-white/5 p-10 rounded-[40px] flex items-center gap-4 cursor-pointer hover:border-blue-600 transition-all shadow-2xl">
                        <Plus size={24} className="text-blue-500" />
                        <p className="text-sm font-black text-white uppercase tracking-widest">Enroll New Course</p>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* CGPA MODAL */}
      {showCgpaModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-in fade-in zoom-in duration-300">
            <div className="bg-[#050505] border border-zinc-900 w-full max-w-5xl rounded-[48px] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
                <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-3xl font-black text-white tracking-tight">Sync Academic Data</h3>
                        <button onClick={() => setShowCgpaModal(false)} className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-white transition-all"><X size={24}/></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-[32px]">
                            <label className="block text-[8px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4">Past CGPA</label>
                            <input type="number" step="0.01" value={pastCgpa} onChange={(e) => setPastCgpa(parseFloat(e.target.value))} className="text-4xl font-black text-white bg-transparent outline-none w-full" />
                        </div>
                        <div className="p-6 bg-zinc-900/30 border border-zinc-900 rounded-[32px]">
                            <label className="block text-[8px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4">Total Credits</label>
                            <input type="number" value={pastCredits} onChange={(e) => setPastCredits(parseInt(e.target.value))} className="text-4xl font-black text-white bg-transparent outline-none w-full" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        {currentSubjects.map((s, i) => (
                            <div key={i} className="flex gap-4 items-center bg-zinc-900/20 p-4 rounded-3xl border border-zinc-900/50">
                                <input placeholder="Subject" className="flex-1 bg-transparent text-sm font-bold text-white outline-none" value={s.name} onChange={(e) => {
                                    const next = [...currentSubjects];
                                    next[i].name = e.target.value;
                                    setCurrentSubjects(next);
                                }}/>
                                <input type="number" className="w-14 bg-zinc-900 text-center py-2 rounded-xl text-xs font-black text-white" value={s.credits} onChange={(e) => {
                                    const next = [...currentSubjects];
                                    next[i].credits = e.target.value;
                                    setCurrentSubjects(next);
                                }}/>
                                <select className="bg-zinc-900 text-xs font-black text-white px-3 py-2 rounded-xl outline-none" value={s.grade} onChange={(e) => {
                                    const next = [...currentSubjects];
                                    next[i].grade = e.target.value;
                                    setCurrentSubjects(next);
                                }}>
                                    {Object.keys(GRADE_POINTS).map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                                <button onClick={() => setCurrentSubjects(currentSubjects.filter((_, idx) => idx !== i))} className="text-zinc-700 hover:text-red-500"><X size={16}/></button>
                            </div>
                        ))}
                    </div>
                    <p onClick={() => setCurrentSubjects([...currentSubjects, { name: '', credits: 3, grade: 'S' }])} className="mt-6 text-center text-[10px] font-black text-blue-500 uppercase tracking-widest cursor-pointer hover:text-blue-400">+ Add Subject</p>
                </div>
                <div className="w-full md:w-[400px] bg-[#080808] p-8 md:p-12 flex flex-col">
                    <div className="mb-10 p-6 bg-zinc-900/30 border border-zinc-900 rounded-[32px]">
                        <label className="block text-[8px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4">Set Target CGPA</label>
                        <input type="number" step="0.01" value={targetCgpa} onChange={(e) => setTargetCgpa(parseFloat(e.target.value))} className="text-4xl font-black text-white bg-transparent outline-none w-full" />
                    </div>
                    <div className="space-y-6 flex-1">
                        <div className="flex justify-between items-end border-b border-zinc-900 pb-4">
                            <div>
                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Sem Credits</p>
                                <p className="text-xl font-black text-white">{calculateCgpaMetrics().currentCredits}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Sem GPA</p>
                                <p className="text-xl font-black text-emerald-500">{calculateCgpaMetrics().semGpa.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="mt-8 p-6 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-[32px]">
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Required SGPA for Target</p>
                            <span className="text-5xl font-black text-white">{calculateCgpaMetrics().requiredSgpa.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="mt-10">
                        <button onClick={() => { setCgpa(calculateCgpaMetrics().overallCgpa.toFixed(2)); setShowCgpaModal(false); }} className="w-full py-5 rounded-[24px] font-black uppercase tracking-widest text-[10px] bg-blue-600 text-white shadow-xl hover:bg-blue-700 transition-all">Update Global CGPA</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Course Detail Modal */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-2 md:p-6 animate-in fade-in duration-300">
          <div className="relative bg-[#050505] border border-zinc-900 w-full max-w-5xl rounded-[40px] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
            <div className="p-6 md:p-8 border-b border-zinc-900/50 flex items-center justify-between bg-[#080808]">
                <div className="flex items-center gap-6">
                    <button onClick={() => setSelectedClass(null)} className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-white transition-all"><X size={20}/></button>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight leading-none">{selectedClass.subject}</h2>
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mt-2">{selectedClass.courseCode || 'GENERAL'}</p>
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-10 gap-2.5">
                    {getFullHistoryForCourse(selectedClass).map((h, i) => (
                        <div key={i} onClick={() => toggleHistoryStatus(selectedClass, h.date)} className={`h-11 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${h.status === 'Present' ? 'bg-emerald-500/90 text-white border-emerald-400' : h.status === 'Absent' ? 'bg-red-600/90 text-white border-red-500' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                            <span className="text-[11px] font-black">{h.date.split('-')[2]}</span>
                            <span className="text-[7px] font-bold uppercase">{new Date(h.date).toLocaleDateString('en', {month: 'short'})}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={() => deleteCourse(selectedClass._id)} className="py-4 rounded-2xl bg-red-900/10 border border-red-900/30 text-red-500 font-black uppercase tracking-widest text-[10px] hover:bg-red-600 hover:text-white transition-all">Delete Course Profile</button>
                    <button onClick={() => resetCourseHistory(selectedClass._id)} className="py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all">Clear All Logs</button>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="bg-[#0a0a0a] border border-zinc-800 w-full max-w-xl rounded-[48px] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-zinc-900 flex justify-between items-center">
              <h2 className="text-2xl font-black text-white">Enroll New Course</h2>
              <button onClick={() => setShowAddModal(false)} className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-white"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddClass} className="p-8 space-y-6">
              <div className="space-y-4">
                <input name="subject" placeholder="Course Name" required className="w-full bg-[#121212] border border-zinc-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-blue-500" />
                <input name="room" placeholder="Room Number" required className="w-full bg-[#121212] border border-zinc-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-blue-500" />
                <div className="grid grid-cols-2 gap-4">
                  <input name="courseCode" placeholder="Code (e.g. CSE1001)" className="bg-[#121212] border border-zinc-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-blue-500" />
                  <input name="credits" type="number" placeholder="Credits" className="bg-[#121212] border border-zinc-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map(day => (
                  <label key={day} className="flex-1">
                    <input type="checkbox" name={day} className="sr-only peer" />
                    <div className="py-3 text-center rounded-xl bg-zinc-900 border border-zinc-800 text-[10px] font-black text-zinc-500 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-500 cursor-pointer transition-all">{day}</div>
                  </label>
                ))}
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-[24px] shadow-xl transition-all mt-4 uppercase tracking-widest">Register Profile</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
