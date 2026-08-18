import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';
import { User, Camera, Building2, BookOpen, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    institution: user?.institution || '',
    bio: user?.bio || '',
    avatar_url: user?.avatar_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authService.updateProfile(form);
      toast.success('Profile updated successfully!');
      setSaved(true);
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
          <User size={20} className="text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-textPrimary">My Profile</h1>
          <p className="text-sm text-textSecondary">Manage your personal information</p>
        </div>
      </div>

      {/* Avatar card */}
      <div className="glass-card rounded-2xl p-6 flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.full_name?.[0]?.toUpperCase() || 'U'
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent rounded-full border-2 border-bgCard flex items-center justify-center cursor-pointer">
            <Camera size={13} className="text-white" />
          </div>
        </div>
        <div>
          <h2 className="font-bold text-lg text-textPrimary">{user?.full_name}</h2>
          <p className="text-sm text-textSecondary">{user?.email}</p>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 capitalize">
            {user?.provider || 'local'} account
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="glass-card rounded-2xl p-6 space-y-5">
        <h3 className="text-sm font-bold text-textPrimary">Personal Information</h3>

        <div>
          <label className="block text-xs font-medium text-textSecondary mb-1">Full Name</label>
          <div className="relative">
            <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" />
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Dr. Jane Smith"
              className="form-input pl-9"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-textSecondary mb-1">Institution</label>
          <div className="relative">
            <Building2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" />
            <input
              name="institution"
              value={form.institution}
              onChange={handleChange}
              placeholder="University of Technology"
              className="form-input pl-9"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-textSecondary mb-1">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={3}
            placeholder="AI researcher specializing in NLP and computer vision..."
            className="form-input resize-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-accent hover:bg-accentHover text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : saved ? (
              <>
                <CheckCircle2 size={14} />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>

      {/* Account info */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-bold text-textPrimary mb-4">Account Information</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {[
            { label: 'Username', value: user?.username },
            { label: 'Email', value: user?.email },
            { label: 'Member since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-' },
            { label: 'Auth provider', value: user?.provider || 'local' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-bgInput p-3 rounded-lg">
              <p className="text-textMuted mb-0.5">{label}</p>
              <p className="font-semibold text-textPrimary capitalize">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
