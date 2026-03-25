import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { logout, user } = useAuth();

  return (
    <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-20">
      <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-6 py-3 rounded-2xl w-[500px] group transition-all duration-300">
        <Search size={18} className="text-slate-400 group-focus-within:text-blue-600 transition-colors" />
        <input 
          type="text" 
          placeholder="Search analytics, projects..." 
          className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 text-slate-700 font-medium"
        />
      </div>

      <div className="flex items-center gap-8">
        <button className="relative w-12 h-12 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-300">
          <Bell size={22} />
          <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-[3px] border-white"></span>
        </button>

        <div className="flex items-center gap-5 border-l border-slate-100 pl-8">
          <div className="text-right">
            <h4 className="text-base font-black text-slate-900 leading-tight">{user?.name || 'VIT Student'}</h4>
            <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest font-black">B.TECH CSE</p>
          </div>
          <div className="w-14 h-14 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-600 font-bold overflow-hidden cursor-pointer hover:border-blue-300 transition-all duration-300">
            <UserIcon size={28} className="text-slate-400" />
          </div>
          <button 
            onClick={logout}
            className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300"
            title="Logout"
          >
            <LogOut size={22} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
