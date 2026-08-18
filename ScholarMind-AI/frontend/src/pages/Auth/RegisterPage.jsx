/**
 * RegisterPage.jsx
 * ─────────────────────────────────────────────────────
 * User registration page with real-time strength meter, field-level inline error
 * validation, backend error extraction, loading states, and responsive styling.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';
import toast from 'react-hot-toast';
import { BookOpen, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    confirm: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // ── Password strength evaluation ──────────────────────────────────────────
  const calculatePasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score; // 0 to 5
  };

  const strengthScore = calculatePasswordStrength(formData.password);

  const getStrengthLabel = (score) => {
    if (score <= 1) return { label: 'Very Weak', color: 'bg-red-500' };
    if (score === 2) return { label: 'Weak', color: 'bg-orange-500' };
    if (score === 3) return { label: 'Medium', color: 'bg-yellow-500' };
    if (score === 4) return { label: 'Strong', color: 'bg-emerald-500' };
    return { label: 'Very Strong', color: 'bg-indigo-500' };
  };

  // ── Client side validation ───────────────────────────────────────────────
  const validateForm = () => {
    const errs = {};

    if (!formData.full_name.trim()) {
      errs.full_name = 'Full name is required.';
    }

    if (!formData.username.trim()) {
      errs.username = 'Username is required.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errs.username = 'Only letters, numbers, and underscores allowed.';
    } else if (formData.username.length < 3) {
      errs.username = 'Username must be at least 3 characters.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters long.';
    } else if (formData.password.length > 128) {
      errs.password = 'Password cannot exceed 128 characters.';
    } else if (!/[A-Z]/.test(formData.password)) {
      errs.password = 'Must contain at least one uppercase letter.';
    } else if (!/[a-z]/.test(formData.password)) {
      errs.password = 'Must contain at least one lowercase letter.';
    } else if (!/\d/.test(formData.password)) {
      errs.password = 'Must contain at least one number.';
    }

    if (formData.password !== formData.confirm) {
      errs.confirm = 'Passwords do not match.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // ── Form submission ──────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Backend schema expects: full_name, username, email, password
      const payload = {
        full_name: formData.full_name.trim(),
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      await register(payload);
      toast.success('Registration successful! Please sign in.', { duration: 4000 });
      navigate('/login', { replace: true });
    } catch (err) {
      const resp = err?.response?.data;

      if (resp?.detail) {
        const detailMsg = typeof resp.detail === 'string' ? resp.detail : JSON.stringify(resp.detail);
        toast.error(detailMsg);

        if (detailMsg.toLowerCase().includes('email')) {
          setErrors((prev) => ({ ...prev, email: detailMsg }));
        } else if (detailMsg.toLowerCase().includes('username')) {
          setErrors((prev) => ({ ...prev, username: detailMsg }));
        }
      } else if (resp?.errors && Array.isArray(resp.errors)) {
        // FastAPI 422 validation array
        const firstError = resp.errors[0]?.message || 'Validation error.';
        toast.error(firstError);
      } else {
        toast.error('Registration failed. Please check your inputs and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const strengthInfo = getStrengthLabel(strengthScore);

  return (
    <div className="min-h-screen flex bg-bgMain font-sans">
      {/* ── Left Hero Panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden bg-gradient-to-br from-[#1a1040] via-[#0f1117] to-[#0c1526] p-12 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-glow">
            <BookOpen size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">ScholarMind AI</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Join thousands of academic researchers.
          </h1>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed">
            Create an account to start managing research papers, discovering paper recommendations, and organizing projects.
          </p>

          <div className="space-y-3">
            {[
              'Upload and manage PDFs up to 50MB',
              'Organize papers by research projects',
              'Track research history and bookmarks',
              'Secure JWT authentication',
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-3 text-slate-300 text-sm">
                <CheckCircle2 size={16} className="text-accent shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500">
          Stage 1 Prototype · Production Ready Authentication
        </div>
      </div>

      {/* ── Right Registration Form ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md bg-card p-8 rounded-xl border border-border shadow-card">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-textPrimary mb-1">Create Account</h2>
            <p className="text-xs text-textSecondary">Enter your details to register as a researcher</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Input
              label="Full Name"
              name="full_name"
              placeholder="e.g. Dr. Alex Morgan"
              value={formData.full_name}
              onChange={handleChange}
              error={errors.full_name}
              required
            />

            <Input
              label="Username"
              name="username"
              placeholder="e.g. alex_morgan"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              required
            />

            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="alex@university.edu"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />

            <div className="flex flex-col gap-1.5">
              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="At least 8 chars (Upper, lower, digit)"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
              />

              {/* Password strength meter */}
              {formData.password && (
                <div className="mt-1">
                  <div className="flex items-center justify-between text-[11px] text-textMuted mb-1">
                    <span>Password strength:</span>
                    <span className="font-semibold text-textSecondary">{strengthInfo.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-full flex-1 transition-all duration-300 ${
                          level <= strengthScore ? strengthInfo.color : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              name="confirm"
              placeholder="Re-enter your password"
              value={formData.confirm}
              onChange={handleChange}
              error={errors.confirm}
              required
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-textSecondary">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:underline font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
