import React from 'react';
import { 
  LayoutDashboard, 
  ListTodo, 
  Kanban, 
  History, 
  Settings as SettingsIcon, 
  LogOut,
  Plus,
  ChevronRight
} from 'lucide-react';
import { ViewMode } from '../types';
import { FirebaseUser } from '../firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
  user: FirebaseUser;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ 
  currentView, 
  setView, 
  user, 
  onLogout,
  isOpen,
  onClose
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'list', label: 'Task List', icon: ListTodo },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 text-zinc-400 flex flex-col border-r border-zinc-800 transition-transform duration-300 lg:relative lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Zenith</h1>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-900 rounded-lg lg:hidden text-zinc-500"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <div className="py-4">
            <p className="px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Views</p>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id as ViewMode)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group",
                  currentView === item.id 
                    ? "bg-zinc-800 text-emerald-400" 
                    : "hover:bg-zinc-900 hover:text-zinc-200"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5",
                  currentView === item.id ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300"
                )} />
                <span className="font-medium">{item.label}</span>
                {currentView === item.id && (
                  <ChevronRight className="ml-auto w-4 h-4" />
                )}
              </button>
            ))}
          </div>

        </nav>

        <div className="p-4 border-t border-zinc-900 bg-zinc-950/50 w-full">
          <button 
            onClick={() => setView('settings')}
            className="flex items-center gap-3 mb-4 px-2 w-full text-left hover:bg-zinc-900 p-2 rounded-xl transition-colors group"
          >
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}`} 
              alt="Profile" 
              className="w-10 h-10 rounded-full border border-zinc-800 group-hover:border-emerald-500/50 transition-all"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">{user.displayName || 'User'}</p>
              <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            </div>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
