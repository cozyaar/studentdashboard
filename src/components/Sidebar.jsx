import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  UserCheck, 
  FolderGit2, 
  Trophy, 
  BrainCircuit, 
  Lightbulb, 
  Settings as SettingsIcon,
  User as UserIcon
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const [profilePic, setProfilePic] = React.useState(localStorage.getItem('student_profile_pic') || '');

  React.useEffect(() => {
    const handleStorage = () => {
      setProfilePic(localStorage.getItem('student_profile_pic') || '');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const menuItems = [
    { icon: <LayoutDashboard size={18} />, label: 'Dashboard', path: '/' },
    { icon: <UserCheck size={18} />, label: 'Attendance', path: '/attendance' },
    { icon: <FolderGit2 size={18} />, label: 'Projects', path: '/projects' },
    { icon: <Trophy size={18} />, label: 'Hackathons', path: '/hackathons' },
    { icon: <BrainCircuit size={18} />, label: 'Skills', path: '/skills' },
    { icon: <Lightbulb size={18} />, label: 'Career Insights', path: '/career' },
    { icon: <SettingsIcon size={18} />, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="w-72 bg-[#050505] border-r border-[#151515] flex flex-col h-screen fixed lg:static z-50">
      {/* User Profile Header */}
      <div className="p-8 border-b border-[#151515] bg-gradient-to-b from-blue-900/5 to-transparent">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[#121212] border-2 border-zinc-800 rounded-2xl flex items-center justify-center text-zinc-600 font-bold overflow-hidden cursor-pointer hover:border-blue-500 transition-all duration-500 group shadow-2xl">
             {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
             ) : (
                <UserIcon size={24} className="group-hover:text-blue-500 transition-colors" />
             )}
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="text-sm font-black text-white leading-tight truncate">{user?.name || 'VIT Student'}</h4>
            <p className="text-[9px] text-zinc-500 mt-0.5 uppercase tracking-[0.2em] font-black">B.TECH CSE</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 mt-8 px-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 font-black text-[11px] uppercase tracking-widest
              ${isActive 
                ? 'bg-blue-600 text-white shadow-[0_4px_15px_rgba(37,99,235,0.4)]' 
                : 'text-zinc-500 hover:text-white hover:bg-white/[0.03]'}
            `}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer / App Name */}
      <div className="p-8 mt-auto">
        <div className="flex items-center gap-3 opacity-20">
            <div className="w-6 h-1 bg-blue-600 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">V1.0.4</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
