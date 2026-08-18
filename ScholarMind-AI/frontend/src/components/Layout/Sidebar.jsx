/**
 * Sidebar.jsx
 * ─────────────────────────────────────────────────────
 * Premium collapsible sidebar inspired by ChatGPT and NotebookLM.
 * Features:
 *   - Collapsible to icon-only mode (persisted to localStorage)
 *   - Active route highlighting with indigo pill
 *   - Hover micro-animations
 *   - "AI Assistant" disabled with "Soon" badge
 *   - User profile section at bottom
 */

import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Search, BookOpen, FolderKanban, Sparkles, Clock, Bookmark,
  Upload, Settings, User, LogOut, ChevronLeft, ChevronRight,
  GraduationCap, LayoutDashboard,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

// ── Navigation Items ──────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/search',       icon: Search,          label: 'Search' },
  { to: '/library',      icon: BookOpen,        label: 'My Library' },
  { to: '/projects',     icon: FolderKanban,    label: 'Projects' },
  { to: '/ai-assistant', icon: Sparkles,        label: 'AI Assistant', badge: 'Stage 2' },
  { to: '/history',      icon: Clock,           label: 'History' },
  { to: '/bookmarks',    icon: Bookmark,        label: 'Bookmarks' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sidebar_collapsed')) ?? false; }
    catch { return false; }
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Persist collapse state
  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    } catch {
      toast.error('Logout failed');
    }
  };

  // Avatar initials
  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'SM';

  return (
    <aside
      className={clsx(
        'flex flex-col h-screen transition-all duration-300 ease-in-out',
        'border-r border-border bg-bgSidebar relative shrink-0',
        collapsed ? 'w-16' : 'w-64',
      )}
      aria-label="Main navigation"
    >
      {/* ── Logo / Brand ─────────────────────────────────────────────────── */}
      <div className={clsx(
        'flex items-center h-14 border-b border-border shrink-0',
        collapsed ? 'justify-center px-2' : 'px-4 gap-3',
      )}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-glow">
          <GraduationCap size={17} className="text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-textPrimary tracking-tight leading-none">ScholarMind</span>
            <span className="text-[10px] text-accent font-medium tracking-wide">AI</span>
          </div>
        )}
      </div>

      {/* ── Collapse Toggle ───────────────────────────────────────────────── */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className={clsx(
          'absolute -right-3 top-16 z-10',
          'w-6 h-6 rounded-full border border-border bg-bgSidebar',
          'flex items-center justify-center',
          'text-textMuted hover:text-textPrimary hover:bg-bgCard',
          'transition-all duration-200 shadow-card',
        )}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed
          ? <ChevronRight size={12} />
          : <ChevronLeft size={12} />
        }
      </button>

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 space-y-0.5 px-2">
        {NAV_ITEMS.map((item, i) => {
          if (item.disabled) {
            return (
              <div
                key={i}
                className={clsx(
                  'flex items-center gap-3 px-2.5 py-2.5 rounded-lg',
                  'text-textMuted cursor-not-allowed opacity-60 select-none',
                  collapsed && 'justify-center',
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && (
                  <>
                    <span className="text-sm flex-1 truncate">{item.label}</span>
                    <span className="text-[9px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">
                      {item.badge}
                    </span>
                  </>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={i}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) => clsx(
                'group flex items-center gap-3 px-2.5 py-2.5 rounded-lg',
                'text-sm transition-all duration-150 relative',
                collapsed && 'justify-center',
                isActive
                  ? 'bg-accent/15 text-accent font-medium'
                  : 'text-textSecondary hover:bg-bgCard hover:text-textPrimary',
              )}
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-r-full" />
                  )}
                  <item.icon
                    size={18}
                    className={clsx(
                      'shrink-0 transition-transform duration-150',
                      'group-hover:scale-110',
                      isActive ? 'text-accent' : '',
                    )}
                  />
                  {!collapsed && (
                    <>
                      <span className="truncate flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="text-[9px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Bottom Section ─────────────────────────────────────────────────── */}
      <div className="border-t border-border p-2 space-y-0.5 shrink-0">
        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) => clsx(
            'group w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg',
            'text-sm transition-colors duration-150',
            collapsed && 'justify-center',
            isActive
              ? 'bg-accent/15 text-accent font-medium'
              : 'text-textSecondary hover:bg-bgCard hover:text-textPrimary',
          )}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings size={18} className="shrink-0 group-hover:rotate-45 transition-transform duration-300" />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        {/* User profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) => clsx(
            'flex items-center gap-3 px-2.5 py-2.5 rounded-lg cursor-pointer',
            'transition-colors duration-150',
            collapsed && 'justify-center',
            isActive
              ? 'bg-accent/15 text-accent'
              : 'hover:bg-bgCard',
          )}
          title={collapsed ? user?.full_name : undefined}
        >
          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 overflow-hidden">
            {user?.avatar_url
              ? <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              : <span className="text-xs font-bold text-white">{initials}</span>
            }
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-textPrimary truncate">{user?.full_name || 'Researcher'}</p>
              <p className="text-xs text-textMuted truncate">{user?.email || ''}</p>
            </div>
          )}
        </NavLink>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={clsx(
            'group w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg',
            'text-sm text-danger/70 hover:text-danger hover:bg-danger/10',
            'transition-colors duration-150',
            collapsed && 'justify-center',
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} className="shrink-0 group-hover:-translate-x-0.5 transition-transform duration-150" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
