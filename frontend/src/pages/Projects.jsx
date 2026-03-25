import React, { useState, useEffect } from 'react';
import { 
  Folder, Plus, Trash2, Calendar, Target, Clock, AlertCircle, 
  CheckCircle2, XCircle, Code2, AlignLeft, Info 
} from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('student_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse projects from local storage");
      }
    }
    
    // Seed with two requested mocked projects if completely empty
    return [
      {
        id: "mock1",
        projectName: "Student Analytics Engine",
        subject: "Software Engineering",
        type: "Major",
        startDate: "2026-03-01",
        submissionDate: "2026-05-15",
        description: "A comprehensive dashboard for academic insights and predictive modeling.",
        techStack: ["React", "Tailwind", "Node.js"],
        reviews: [
          { id: "r1", title: "Review 1", date: "2026-03-10", completed: true },
          { id: "r2", title: "Review 2", date: "2026-04-10", completed: false },
          { id: "r3", title: "Review 3", date: "2026-05-01", completed: false }
        ]
      },
      {
        id: "mock2",
        projectName: "Secure File Transfer Protocol",
        subject: "Computer Networks",
        type: "Mini",
        startDate: "2026-03-15",
        submissionDate: "2026-04-20",
        description: "Implementing encrypted file transfer using AES-256 and WebSockets.",
        techStack: ["Python", "Cryptography", "Sockets"],
        reviews: [
          { id: "r4", title: "Review 1", date: "2026-03-25", completed: false },
          { id: "r5", title: "Review 2", date: "2026-04-05", completed: false },
          { id: "r6", title: "Review 3", date: "2026-04-15", completed: false }
        ]
      }
    ];
  });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    id: '',
    projectName: '',
    subject: '',
    type: 'Mini',
    startDate: '',
    submissionDate: '',
    description: '',
    techStack: [],
    reviews: [{ id: Date.now(), title: 'Review 1', date: '', completed: false }]
  });
  
  const [techInput, setTechInput] = useState('');

  // Persist to local storage continuously
  useEffect(() => {
    localStorage.setItem('student_projects', JSON.stringify(projects));
    // Manually trigger a storage event so Dashboard widgets update in real-time
    window.dispatchEvent(new Event('storage'));
  }, [projects]);

  // Form Handlers
  const handleTechKeyDown = (e) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault();
      if (!formData.techStack.includes(techInput.trim())) {
        setFormData({ ...formData, techStack: [...formData.techStack, techInput.trim()] });
      }
      setTechInput('');
    }
  };

  const removeTech = (tech) => {
    setFormData({ ...formData, techStack: formData.techStack.filter(t => t !== tech) });
  };

  const addReview = () => {
    setFormData({
      ...formData,
      reviews: [...formData.reviews, { id: Date.now(), title: `Review ${formData.reviews.length + 1}`, date: '', completed: false }]
    });
  };

  const removeReview = (id) => {
    if (formData.reviews.length <= 1) return;
    const filtered = formData.reviews.filter(r => r.id !== id);
    // Re-title them
    const mapped = filtered.map((r, i) => ({ ...r, title: `Review ${i + 1}` }));
    setFormData({ ...formData, reviews: mapped });
  };

  const updateReview = (id, field, value) => {
    setFormData({
      ...formData,
      reviews: formData.reviews.map(r => r.id === id ? { ...r, [field]: value } : r)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.projectName || !formData.subject || !formData.startDate || !formData.submissionDate) {
      alert("Please fill all required fields.");
      return;
    }

    if (formData.id) {
      // Update
      setProjects(projects.map(p => p.id === formData.id ? { ...formData } : p));
    } else {
      // Create
      setProjects([...projects, { ...formData, id: Date.now().toString() }]);
    }

    resetForm();
    setIsFormOpen(false);
  };

  const resetForm = () => {
    setFormData({
      id: '',
      projectName: '',
      subject: '',
      type: 'Mini',
      startDate: '',
      submissionDate: '',
      description: '',
      techStack: [],
      reviews: [{ id: Date.now(), title: 'Review 1', date: '', completed: false }]
    });
  };

  const editProject = (project) => {
    setFormData({
      ...project,
      techStack: project.techStack || [],
      reviews: project.reviews || []
    });
    setIsFormOpen(true);
  };

  const deleteProject = (id) => {
    if(window.confirm("Are you sure you want to delete this project?")) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const toggleReviewCompletion = (projectId, reviewId) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          reviews: (p.reviews || []).map(r => r.id === reviewId ? { ...r, completed: !r.completed } : r)
        };
      }
      return p;
    }));
  };

  const getStatusColor = (dateString, completed) => {
    if (completed) return 'text-emerald-500 bg-emerald-50 border-emerald-200';
    if (!dateString) return 'text-slate-400 bg-slate-50 border-slate-200';
    
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (date < today) return 'text-red-500 bg-red-50 border-red-200'; // Missed
    
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 3) return 'text-amber-500 bg-amber-50 border-amber-200'; // Upcoming soon
    return 'text-blue-500 bg-blue-50 border-blue-200'; // Scheduled
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center gap-4">
            <Folder className="text-blue-500" size={36} /> Project Portfolio
          </h2>
          <p className="text-zinc-400 font-bold text-xs uppercase tracking-[0.3em] mt-2">Manage academic architecture and milestone tracking</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="px-8 py-4 bg-blue-600 rounded-[20px] text-[10px] font-black text-white uppercase tracking-widest shadow-[0_4px_20px_rgba(37,99,235,0.4)] hover:bg-blue-700 transition-all flex items-center gap-3 active:scale-95"
        >
          <Plus size={16} /> New Deployment
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-8 animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Folder className="text-blue-500" /> {formData.id ? 'Edit Project' : 'Create New Project'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Project Name *</label>
                  <input 
                    type="text" required value={formData.projectName} onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="E.g., Secure Cloud File Storage"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Subject *</label>
                  <select 
                    required value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="" disabled>Select Subject</option>
                    <option value="Data Structures">Data Structures</option>
                    <option value="Operating Systems">Operating Systems</option>
                    <option value="Computer Networks">Computer Networks</option>
                    <option value="Database Systems">Database Systems</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Project Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl flex-1 hover:bg-blue-50 transition-colors">
                    <input type="radio" name="type" className="accent-blue-600" checked={formData.type === 'Mini'} onChange={() => setFormData({...formData, type: 'Mini'})} />
                    <span className="text-sm font-bold text-slate-700">Mini Project</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl flex-1 hover:bg-blue-50 transition-colors">
                    <input type="radio" name="type" className="accent-blue-600" checked={formData.type === 'Major'} onChange={() => setFormData({...formData, type: 'Major'})} />
                    <span className="text-sm font-bold text-slate-700">Major Project</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Calendar size={14}/> Start Date *</label>
                  <input 
                    type="date" required value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Target size={14}/> Final Submission *</label>
                  <input 
                    type="date" required value={formData.submissionDate} onChange={(e) => setFormData({...formData, submissionDate: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><AlignLeft size={14}/> Description</label>
                <textarea 
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Summarize the core objective of your project..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Code2 size={14}/> Tech Stack</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.techStack.map(tech => (
                    <span key={tech} className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      {tech} <button type="button" onClick={() => removeTech(tech)}><XCircle size={12} className="hover:text-blue-900"/></button>
                    </span>
                  ))}
                </div>
                <input 
                  type="text" value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={handleTechKeyDown}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Type a technology and press Enter (e.g., React, Node.js)"
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-900 flex items-center gap-2"><Clock size={16} className="text-blue-500"/> Project Milestones & Reviews</label>
                  <button type="button" onClick={addReview} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                    + Add Review
                  </button>
                </div>
                
                {formData.reviews.map((review, index) => (
                  <div key={review.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-sm font-bold text-slate-500 w-20">{review.title}</span>
                    <input 
                      type="date" required value={review.date} onChange={(e) => updateReview(review.id, 'date', e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <button type="button" onClick={() => removeReview(review.id)} className="text-red-400 hover:text-red-600 disabled:opacity-30" disabled={formData.reviews.length <= 1}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 transition-colors">
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Cards */}
      {projects.length === 0 ? (
        <div className="bg-white border text-center border-slate-100 rounded-3xl p-12 shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500">
            <Folder size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Projects Found</h3>
          <p className="text-slate-500 text-sm max-w-sm mb-6">You haven't added any academic projects yet. Start tracking your mini and major projects today.</p>
          <button onClick={() => { resetForm(); setIsFormOpen(true); }} className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
            Create First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {projects.map(project => {
            const reviewsList = project.reviews || [];
            const completedReviews = reviewsList.filter(r => r.completed).length;
            const totalMilestones = reviewsList.length;
            const progress = totalMilestones > 0 ? Math.round((completedReviews / totalMilestones) * 100) : 0;

            return (
              <div key={project.id} className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => editProject(project)} className="text-blue-500 hover:underline text-xs font-bold">Edit</button>
                  <button onClick={() => deleteProject(project.id)} className="text-red-500 hover:underline text-xs font-bold">Delete</button>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${project.type === 'Major' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    <Folder size={24} />
                  </div>
                  <div>
                    <div className="flex gap-2 items-center mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${project.type === 'Major' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                        {project.type} Project
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-lg">
                        {project.subject}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight pr-16">{project.projectName}</h3>
                  </div>
                </div>

                {project.description && (
                  <p className="text-slate-500 text-sm font-medium mb-6 line-clamp-2">{project.description}</p>
                )}

                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Progress</span>
                    <span className="text-xs font-black text-slate-900">{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                {(project.techStack || []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(project.techStack || []).map(t => (
                      <span key={t} className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md">{t}</span>
                    ))}
                  </div>
                )}

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Clock size={12}/> Milestone Tracker</p>
                  
                  {reviewsList.map(review => {
                    const statusClass = getStatusColor(review.date, review.completed);
                    return (
                      <div key={review.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => toggleReviewCompletion(project.id, review.id)}
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${review.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300 hover:border-blue-500'}`}
                          >
                            {review.completed && <CheckCircle2 size={12} />}
                          </button>
                          <span className={`text-sm font-bold ${review.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{review.title}</span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-md border ${statusClass}`}>
                          {review.date ? new Date(review.date).toLocaleDateString('en-GB') : 'TBA'}
                        </span>
                      </div>
                    );
                  })}
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 mt-3 border-dashed">
                    <div className="flex items-center gap-2">
                      <Target size={16} className="text-blue-500" />
                      <span className="text-sm font-bold text-slate-900">Final Submission</span>
                    </div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-1 rounded-md">
                      {project.submissionDate ? new Date(project.submissionDate).toLocaleDateString('en-GB') : 'TBA'}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Projects;
