import React from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  HelpCircle,
  LogOut,
  ChevronRight,
  UserCircle,
  Mail,
  Lock,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { FirebaseUser } from '../firebase';
import { Theme } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SettingsProps {
  user: FirebaseUser;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onLogout: () => void;
}

export default function Settings({ user, theme, setTheme, onLogout }: SettingsProps) {
  const sections = [
    {
      title: 'Account',
      items: [
        { id: 'profile', label: 'Profile Information', icon: UserCircle, value: user.displayName || 'Set Display Name' },
        { id: 'email', label: 'Email Address', icon: Mail, value: user.email },
      ]
    }
  ];

  const themes: { id: Theme; label: string; icon: any }[] = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="p-8 space-y-12 bg-zinc-950 min-h-screen text-zinc-100 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-zinc-500 mt-1">Manage your account and app preferences.</p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="p-8 bg-zinc-900 rounded-3xl border border-zinc-800 flex items-center gap-6 group">
          <div className="relative">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}`} 
              alt="Profile" 
              className="w-24 h-24 rounded-3xl border-2 border-zinc-800 group-hover:border-emerald-500/50 transition-all duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/20">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold tracking-tight">{user.displayName || 'Zenith User'}</h3>
            <p className="text-zinc-500 font-medium">{user.email}</p>
          </div>
        </div>

        <div className="space-y-6">
          {sections.map((section, idx) => ( section.title && (
            <div key={idx} className="space-y-4">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-2">{section.title}</h4>
              <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden divide-y divide-zinc-800/50">
                {section.items.map((item) => (
                  <button 
                    key={item.id}
                    className="w-full flex items-center justify-between p-6 hover:bg-zinc-800/30 transition-all group"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 group-hover:border-emerald-500/30 transition-all">
                        <item.icon className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <div>
                        <p className="font-bold text-zinc-100 tracking-tight">{item.label}</p>
                        <p className="text-sm text-zinc-500">{item.value}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )))}
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 p-6 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white font-bold rounded-3xl border border-rose-500/20 transition-all duration-300 group shadow-lg shadow-rose-500/5 active:scale-95"
        >
          <LogOut className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-lg">Sign Out of Zenith</span>
        </button>
      </div>
    </div>
  );
}
