/**
 * LoginPage.jsx
 * ─────────────────────────────────────────────────────
 * Premium split-layout login page with Google OAuth Sign-In.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, BookOpen, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const FEATURES = [
  { icon: '📄', text: 'Upload and organize research papers' },
  { icon: '🔍', text: 'Semantic search across your library' },
  { icon: '🤖', text: 'AI-powered paper analysis & summaries' },
  { icon: '📊', text: 'Knowledge graphs (Stage 2)' },
];

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email.';
    if (!formData.password) newErrors.password = 'Password is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back! 👋', { duration: 2000 });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err?.response?.data?.detail || 'Login failed. Please check credentials.';
      toast.error(message);
      setErrors({ password: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-bgMain font-sans">
      {/* ── Left Panel (Hero) ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1040] via-[#0f1117] to-[#0c1526]" />
        <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-indigo-600/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-purple-600/15 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 flex flex-col flex-1 p-12">
          <div className="flex items-center gap-3 mb-auto">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-glow">
              <BookOpen size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">ScholarMind AI</span>
          </div>

          <div className="mb-auto">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 mb-8">
              <Sparkles size={14} className="text-indigo-400" />
              <span className="text-sm text-indigo-300 font-medium">Stage 1 AI Research Platform</span>
            </div>

            <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
              Accelerate your{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                research analysis
              </span>
            </h1>

            <p className="text-lg text-slate-400 mb-10 max-w-md leading-relaxed">
              Upload papers, extract structured AI summaries, and manage research projects effortlessly.
            </p>

            <ul className="space-y-4">
              {FEATURES.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <span className="text-xl">{f.icon}</span>
                  <span className="text-sm">{f.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-12 text-xs text-slate-500">
            B.Tech Computer Science Major Project · 2026
          </div>
        </div>
      </div>

      {/* ── Right Panel (Form) ───────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 lg:p-12 lg:max-w-xl">
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <BookOpen size={16} className="text-white" />
          </div>
          <span className="font-bold text-white">ScholarMind AI</span>
        </div>

        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-textPrimary mb-2">Welcome back</h2>
            <p className="text-textSecondary">Sign in to your research workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-textSecondary mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="researcher@university.edu"
                  className={`form-input pl-10 ${errors.email ? 'border-danger focus:border-danger' : ''}`}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-danger">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-textSecondary mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`form-input pl-10 pr-10 ${errors.password ? 'border-danger focus:border-danger' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textMuted hover:text-textSecondary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-danger">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border bg-bgInput text-accent focus:ring-accent focus:ring-offset-0"
                />
                <span className="text-textSecondary">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-accent hover:text-accentHover font-medium transition-colors">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent hover:bg-accentHover text-white rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-60 shadow-glow"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Continue with Google button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => toast.error('Google Client ID configuration required in .env for Google OAuth.')}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-bgCard hover:bg-bgCardHover border border-border text-textPrimary rounded-lg font-medium text-sm transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-bgMain px-3 text-textMuted">or</span>
            </div>
          </div>

          <p className="text-center text-sm text-textSecondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent hover:text-accentHover font-semibold transition-colors">
              Create one free →
            </Link>
          </p>

          <div className="mt-6 p-4 rounded-lg bg-bgCard border border-border">
            <p className="text-xs text-textMuted text-center">
              <span className="font-medium text-textSecondary">Demo credentials: </span>
              demo@scholarmind.ai / Scholar@123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
