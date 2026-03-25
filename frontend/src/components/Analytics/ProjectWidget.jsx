import React, { useState, useEffect } from 'react';
import { Folder, Clock, CheckCircle2, AlertTriangle, Target, ArrowRight, ChevronLeft, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProjectWidget = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = () => {
      try {
        const saved = localStorage.getItem('student_projects');
        if (saved) {
          const loaded = JSON.parse(saved);
          if (Array.isArray(loaded)) {
             setProjects(loaded);
          }
        }
      } catch (error) {
        console.error("Widget Data Error", error);
      }
    };

    fetchProjects();
    
    // Listen for storage events cross-tab or manually dispatched
    window.addEventListener('storage', fetchProjects);
    return () => window.removeEventListener('storage', fetchProjects);
  }, []);

  // Update selectedProject individually when projects array changes
  useEffect(() => {
     if (selectedProject) {
         const updated = projects.find(p => p.id === selectedProject.id);
         if (updated) {
             // Only update if it actually changed to prevent loops
             if (JSON.stringify(updated) !== JSON.stringify(selectedProject)) {
                 setSelectedProject(updated);
             }
         } else {
             setSelectedProject(null);
         }
     }
  }, [projects]);

  const getFullAlert = (project) => {
    if (!project) return null;
    const today = new Date();
    today.setHours(0,0,0,0);
    const subDate = new Date(project.submissionDate);
    
    let missedReview = (project.reviews || []).find(r => !r.completed && r.date && new Date(r.date) < today);
    if (missedReview) {
      return { type: 'danger', message: `Missed milestone: ${missedReview.title}`, color: 'bg-red-50 text-red-600 border-red-200' };
    }

    let upcomingReview = (project.reviews || []).find(r => !r.completed && r.date && new Date(r.date) >= today);
    if (upcomingReview) {
      const diff = Math.ceil((new Date(upcomingReview.date) - today) / (1000 * 60 * 60 * 24));
      if (diff <= 3) {
        return { type: 'warning', message: `Upcoming review in ${diff} days`, color: 'bg-amber-50 text-amber-600 border-amber-200' };
      }
    }

    const subDiff = Math.ceil((subDate - today) / (1000 * 60 * 60 * 24));
    if (subDiff < 0) {
      return { type: 'success', message: 'Project timeline passed', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
    } else if (subDiff <= 7) {
      return { type: 'warning', message: `Final deadline approaching (${subDiff}d)`, color: 'bg-amber-50 text-amber-600 border-amber-200' };
    } else {
      return { type: 'info', message: 'Project is on track', color: 'bg-blue-50 text-blue-600 border-blue-200' };
    }
  };

  if (projects.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm h-full flex flex-col justify-center items-center text-center">
        <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
          <Folder size={24} />
        </div>
        <h3 className="text-slate-700 font-bold mb-1">No Active Projects</h3>
        <p className="text-slate-400 text-xs mb-4">Add a project to track milestones.</p>
        <button onClick={() => navigate('/projects')} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
          Manage Projects
        </button>
      </div>
    );
  }

  // --- DETAILED VIEW ---
  if (selectedProject) {
    const statusAlert = getFullAlert(selectedProject);
    const completedCount = (selectedProject.reviews || []).filter(r => r.completed).length;
    const totalReviews = (selectedProject.reviews || []).length;
    const progress = Math.round((completedCount / totalReviews) * 100) || 0;

    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col items-start gap-2">
            <button onClick={() => setSelectedProject(null)} className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-500 transition-colors">
              <ChevronLeft size={12}/> Back to all
            </button>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-lg ${selectedProject.type === 'Major' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                {selectedProject.type}
              </span>
            </h3>
            <p className="text-slate-700 text-sm font-bold truncate max-w-[200px]">{selectedProject.projectName}</p>
          </div>
          <button onClick={() => navigate('/projects')} className="p-2 transition-colors hover:bg-slate-50 rounded-lg text-slate-400 hover:text-blue-500">
            <ArrowRight size={20} />
          </button>
        </div>

        {statusAlert && (
          <div className={`mb-6 p-3 rounded-xl border flex items-center gap-2 text-xs font-bold ${statusAlert.color}`}>
            {statusAlert.type === 'danger' && <AlertTriangle size={14} />}
            {statusAlert.type === 'warning' && <Clock size={14} />}
            {statusAlert.type === 'success' && <CheckCircle2 size={14} />}
            {statusAlert.type === 'info' && <Target size={14} />}
            {statusAlert.message}
          </div>
        )}

        <div className="flex-1">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Milestones</span>
            <span className="text-xs font-black text-slate-900">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
          </div>

          <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
            {(selectedProject.reviews || []).slice(0, 2).map((r, i) => (
              <div key={r.id} className="relative flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white ${r.completed ? 'border-emerald-500 text-emerald-500' : 'border-slate-300 text-slate-300'}`}>
                     {r.completed ? <CheckCircle2 size={12} className="text-emerald-500"/> : <Clock size={10} />}
                  </div>
                  <span className={`text-xs font-bold ${r.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{r.title}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500">
                  {r.date ? new Date(r.date).toLocaleDateString('en-GB') : 'TBA'}
                </span>
              </div>
            ))}
            {(selectedProject.reviews || []).length > 2 && (
               <div className="text-[10px] font-bold text-slate-400 pl-8 italic">+ {(selectedProject.reviews || []).length - 2} more reviews</div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 border-dashed flex items-center justify-between">
           <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Target size={14} className="text-blue-500"/> Final Deadline</span>
           <span className="text-xs font-black text-slate-900">{new Date(selectedProject.submissionDate).toLocaleDateString('en-GB')}</span>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col max-h-[450px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
           Project Tracker
        </h3>
        <button onClick={() => navigate('/projects')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-500 transition-colors">
          Manage All
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {projects.map(project => {
            const statusAlert = getFullAlert(project);
            
            // Calculate remaining days
            const today = new Date();
            today.setHours(0,0,0,0);
            const subdate = new Date(project.submissionDate);
            const daysLeft = Math.ceil((subdate - today) / (1000 * 60 * 60 * 24));
            
            return (
              <div 
                key={project.id} 
                onClick={() => setSelectedProject(project)}
                className="group cursor-pointer border border-slate-100 bg-slate-50 rounded-2xl p-4 transition-all hover:border-blue-200 hover:shadow-md hover:bg-white"
              >
                  <div className="flex justify-between items-start mb-2">
                       <span className={`text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-lg ${project.type === 'Major' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                         {project.type}
                       </span>
                       <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Calendar size={10} className="text-slate-400"/>
                          {daysLeft < 0 ? 'Ended' : `${daysLeft}d left`}
                       </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 line-clamp-1 mb-3 group-hover:text-blue-600 transition-colors">{project.projectName}</h4>
                  
                  {statusAlert && (
                      <div className={`text-[10px] font-black uppercase tracking-wide px-2 py-1 rounded-md border flex items-center gap-1 w-fit ${statusAlert.color}`}>
                          {statusAlert.type === 'danger' && <AlertTriangle size={10} />}
                          {statusAlert.type === 'warning' && <Clock size={10} />}
                          {statusAlert.type === 'success' && <CheckCircle2 size={10} />}
                          {statusAlert.type === 'info' && <Target size={10} />}
                          {statusAlert.message.split(':')[0]} {/* Shorten the message for the tiny block */}
                      </div>
                  )}
              </div>
            );
        })}
      </div>
    </div>
  );
};

export default ProjectWidget;
