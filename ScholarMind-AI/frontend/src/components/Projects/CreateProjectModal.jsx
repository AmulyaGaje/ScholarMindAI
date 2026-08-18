import React, { useState } from 'react';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import Button from '../UI/Button';
import projectService from '../../services/projectService';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
];

export default function CreateProjectModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Project name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: trimmedName,
        description: description.trim() || null,
        color: color,
        icon: 'folder',
      };

      const newProject = await projectService.create(payload);
      toast.success(`Project "${newProject.name}" created successfully!`);

      // Reset local state
      setName('');
      setDescription('');
      setColor('#6366f1');

      // Execute parent callback and close modal
      if (onSuccess) onSuccess(newProject);
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to create project. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-bold text-textPrimary mb-1">Create Research Project</h2>
      <p className="text-xs text-textSecondary mb-5">Organize research papers and references into a shared workspace.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Project Name"
          placeholder="e.g. Deep Learning Architectures"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          error={error}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-textSecondary dark:text-slate-300">Description</label>
          <textarea
            className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-slate-100 dark:bg-bgInput text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all resize-none h-20 placeholder-slate-400 dark:placeholder-slate-500"
            placeholder="Add an optional overview for this research project..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Color Tag Picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-textSecondary dark:text-slate-300">Color Tag</label>
          <div className="flex items-center gap-2.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  color === c ? 'ring-2 ring-accent ring-offset-2 ring-offset-bgCard scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
                title={`Select color ${c}`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[100px] flex justify-center items-center gap-2">
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              'Create Project'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
