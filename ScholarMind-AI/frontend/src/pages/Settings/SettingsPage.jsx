import React, { useState } from 'react';
import { Settings, Moon, Sun, Bell, Shield, LogOut, Info } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function SettingRow({ icon: Icon, title, description, action }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-bgInput/60 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
          <Icon size={16} className="text-accent" />
        </div>
        <div>
          <p className="text-sm font-semibold text-textPrimary">{title}</p>
          <p className="text-xs text-textSecondary">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

export default function SettingsPage() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully.');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-500/10 flex items-center justify-center">
          <Settings size={20} className="text-slate-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-textPrimary">Settings</h1>
          <p className="text-sm text-textSecondary">Customize your ScholarMind AI experience</p>
        </div>
      </div>

      {/* Appearance */}
      <div className="glass-card rounded-2xl p-4 space-y-1">
        <h3 className="text-xs font-bold text-textMuted uppercase tracking-widest px-4 py-2">Appearance</h3>
        <SettingRow
          icon={Moon}
          title="Dark Mode"
          description="Toggle between light and dark theme"
          action={
            <button
              onClick={toggleTheme}
              className={`relative w-11 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-accent' : 'bg-border'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  theme === 'dark' ? 'translate-x-5' : ''
                }`}
              />
            </button>
          }
        />
      </div>

      {/* Notifications */}
      <div className="glass-card rounded-2xl p-4 space-y-1">
        <h3 className="text-xs font-bold text-textMuted uppercase tracking-widest px-4 py-2">Notifications</h3>
        <SettingRow
          icon={Bell}
          title="Analysis Complete Notifications"
          description="Get notified when AI analysis finishes"
          action={
            <span className="text-xs font-semibold text-textMuted border border-border px-2 py-1 rounded-md">
              Coming Soon
            </span>
          }
        />
      </div>

      {/* Security */}
      <div className="glass-card rounded-2xl p-4 space-y-1">
        <h3 className="text-xs font-bold text-textMuted uppercase tracking-widest px-4 py-2">Security</h3>
        <SettingRow
          icon={Shield}
          title="Change Password"
          description="Update your account password"
          action={
            <button
              onClick={() => toast.error('Password change coming soon.')}
              className="text-xs font-semibold text-accent hover:underline"
            >
              Update
            </button>
          }
        />
      </div>

      {/* About */}
      <div className="glass-card rounded-2xl p-4 space-y-1">
        <h3 className="text-xs font-bold text-textMuted uppercase tracking-widest px-4 py-2">About</h3>
        <SettingRow
          icon={Info}
          title="ScholarMind AI Stage 1"
          description="B.Tech Major Project — Intelligent Research Paper Analysis with LLMs"
          action={
            <span className="text-xs text-textMuted">v1.0.0</span>
          }
        />
      </div>

      {/* Danger Zone */}
      <div className="glass-card rounded-2xl p-4 border border-danger/20">
        <h3 className="text-xs font-bold text-danger uppercase tracking-widest px-4 py-2">Session</h3>
        <SettingRow
          icon={LogOut}
          title="Logout"
          description="End your current session"
          action={
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 bg-danger/10 text-danger border border-danger/30 hover:bg-danger hover:text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Logout
            </button>
          }
        />
      </div>
    </div>
  );
}
