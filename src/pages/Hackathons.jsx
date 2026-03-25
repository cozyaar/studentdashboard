import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy, Calendar, Users, Image as ImageIcon, FileText, X, Edit2, Trash2, Plus, Code, Award, Target, Loader2 } from 'lucide-react';
import { DataService } from '../utils/DataService';

const Hackathons = () => {
  const { token, hackathons, setHackathons } = useAuth(); // Assume hackathons and setHackathons are provided by context, or we can fetch locally.
  const [localHackathons, setLocalHackathons] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '', organizer: '', startDate: '', endDate: '', role: 'Participant',
    teamSize: '1', description: '', skills: '', certificateUrl: '', certificateType: ''
  });

  const fileInputRef = useRef(null);

  // Fetch hackathons on mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await DataService.getDashboardData();
        setLocalHackathons(data.hackathons || []);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load hackathons", err);
      }
    };
    fetchData();
    window.addEventListener('storage', fetchData);
    return () => window.removeEventListener('storage', fetchData);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev, 
          certificateUrl: reader.result,
          certificateType: file.type.startsWith('image/') ? 'image' : 'pdf'
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', organizer: '', startDate: '', endDate: '', role: 'Participant',
      teamSize: '1', description: '', skills: '', certificateUrl: '', certificateType: ''
    });
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openModal = (hackathon = null) => {
    if (hackathon) {
      setFormData({
        ...hackathon,
        skills: hackathon.skills ? hackathon.skills.join(', ') : '',
        startDate: hackathon.startDate ? new Date(hackathon.startDate).toISOString().split('T')[0] : '',
        endDate: hackathon.endDate ? new Date(hackathon.endDate).toISOString().split('T')[0] : ''
      });
      setEditingId(hackathon._id);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = {
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      if (editingId) {
        await DataService.updateHackathon(editingId, payload, token);
      } else {
        await DataService.addHackathon(payload, token);
      }
      
      const freshData = await DataService.getDashboardData(token);
      setLocalHackathons(freshData.hackathons || []);
      if (setHackathons) setHackathons(freshData.hackathons || []); // Update context as well
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error submitting hackathon:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this hackathon?')) {
      setIsLoading(true);
      try {
        await DataService.deleteHackathon(id, token);
        setLocalHackathons(prev => prev.filter(h => h._id !== id));
        if (setHackathons) setHackathons(prev => prev.filter(h => h._id !== id)); // Update context as well
      } catch (error) {
        console.error("Error deleting hackathon:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Winner': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Finalist': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95"
          >
            <Plus size={18} /> Add Hackathon
          </button>
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center gap-4">
            <Code className="text-blue-500" size={36} /> Hackathon Matrix
          </h2>
          <p className="text-zinc-400 font-bold text-xs uppercase tracking-[0.3em] mt-2">Manage your extracurricular tech achievements</p>
        </div>
        </div>
        
        <div className="bg-[#0a0a0a] border border-zinc-900 px-8 py-4 rounded-[32px] shadow-2xl flex items-center gap-8">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-500">
               <Trophy size={20} />
             </div>
             <div>
               <p className="text-[10px] uppercase font-black text-zinc-500 mb-0.5 tracking-widest">Total Wins</p>
               <p className="text-2xl font-black text-white leading-none">{localHackathons.filter(h => h.role === 'Winner').length}</p>
             </div>
           </div>
           <div className="w-px h-12 bg-zinc-900"></div>
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center text-indigo-500">
               <Target size={20} />
             </div>
             <div>
               <p className="text-[10px] uppercase font-black text-zinc-500 mb-0.5 tracking-widest">Growth Nodes</p>
               <p className="text-2xl font-black text-white leading-none">{localHackathons.length}</p>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {localHackathons.map((hackathon) => (
          <div key={hackathon._id} className="group bg-white rounded-[24px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex flex-col h-full">
            <div className="relative h-48 bg-slate-50 flex items-center justify-center border-b border-slate-100 overflow-hidden">
              {hackathon.certificateUrl ? (
                hackathon.certificateType === 'image' ? (
                  <img src={hackathon.certificateUrl} alt="Certificate" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <FileText size={48} className="text-blue-400" />
                    <span className="text-sm font-medium">PDF Certificate</span>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-300">
                  <ImageIcon size={40} />
                  <span className="text-sm font-medium">No Certificate</span>
                </div>
              )}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openModal(hackathon)} className="w-8 h-8 rounded-full bg-white/90 backdrop-blur text-slate-600 flex items-center justify-center hover:bg-white hover:text-blue-600 shadow-sm transition-colors">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(hackathon._id)} className="w-8 h-8 rounded-full bg-white/90 backdrop-blur text-slate-600 flex items-center justify-center hover:bg-white hover:text-red-500 shadow-sm transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{hackathon.name}</h3>
                  <p className="text-sm font-medium text-slate-500">{hackathon.organizer}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-black rounded-full border ${getRoleBadgeColor(hackathon.role)}`}>
                  {hackathon.role}
                </span>
              </div>
              
              <div className="flex items-center gap-4 mb-4 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg">
                  <Calendar size={14} className="text-slate-400" />
                  {hackathon.startDate ? new Date(hackathon.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric'}) : 'No date'}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg">
                  <Users size={14} className="text-slate-400" />
                  Team: {hackathon.teamSize || 1}
                </div>
              </div>
              
              <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">
                {hackathon.description || 'No description provided.'}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-auto">
                {hackathon.skills && hackathon.skills.map((skill, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[11px] font-bold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {!isLoading && localHackathons.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
              <Trophy size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Hackathons Yet</h3>
            <p className="text-slate-500 text-center max-w-sm mb-6">Start building your extracurricular portfolio by adding your first hackathon participation.</p>
            <button 
              onClick={() => openModal()}
              className="bg-white text-slate-700 font-bold px-6 py-2.5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors"
            >
              Add Your First Hackathon
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {editingId ? <Edit2 size={18} className="text-blue-500" /> : <Plus size={18} className="text-blue-500" />}
                {editingId ? 'Edit Hackathon' : 'Add New Hackathon'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="hackathon-form" onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Hackathon Name</label>
                    <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" placeholder="E.g. ETHGlobal" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Organization / Platform</label>
                    <input name="organizer" value={formData.organizer} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" placeholder="E.g. Devfolio" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Duration</label>
                    <div className="flex items-center gap-2">
                      <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-600" />
                      <span className="text-slate-400">-</span>
                      <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-600" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Role</label>
                    <div className="relative">
                      <select name="role" value={formData.role} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium appearance-none">
                        <option value="Participant">Participant</option>
                        <option value="Finalist">Finalist</option>
                        <option value="Winner">Winner</option>
                      </select>
                      <Award size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Team Size</label>
                    <input type="number" min="1" name="teamSize" value={formData.teamSize} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium resize-none" placeholder="What did you build? What was your contribution?"></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Skills Used (comma separated)</label>
                  <input name="skills" value={formData.skills} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium" placeholder="React, Node.js, Web3" />
                </div>

                <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors relative">
                  <input type="file" accept="image/*,.pdf" onChange={handleFileChange} ref={fileInputRef} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  {formData.certificateUrl ? (
                    <div className="flex flex-col items-center gap-3 relative z-10">
                      {formData.certificateType === 'image' ? (
                        <div className="w-32 h-20 rounded-lg overflow-hidden border border-slate-200 shadow-sm relative group">
                          <img src={formData.certificateUrl} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit2 size={16} className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 bg-white px-4 py-2 border border-slate-200 rounded-lg shadow-sm">
                          <FileText className="text-blue-500" />
                          <span className="text-sm font-medium text-slate-600">PDF Document</span>
                        </div>
                      )}
                      <p className="text-xs font-medium text-slate-500">Click to change certificate</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                      <div className="w-12 h-12 bg-white rounded-full border border-slate-100 shadow-sm flex items-center justify-center text-blue-500 mb-2">
                        <ImageIcon size={20} />
                      </div>
                      <p className="text-sm font-bold text-slate-700">Upload Certificate</p>
                      <p className="text-xs font-medium text-slate-400">PDF, JPG or PNG (max 5MB)</p>
                    </div>
                  )}
                </div>

              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button form="hackathon-form" type="submit" className="px-5 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-colors">
                {editingId ? 'Save Changes' : 'Add Hackathon'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global styles for the scrollbar inside modal */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
      `}} />
    </div>
  );
};

export default Hackathons;
