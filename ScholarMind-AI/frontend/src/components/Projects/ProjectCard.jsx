import React from 'react';
import { Folder, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProjectCard({ project }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/projects/${project?.id}`)}
      className="glass-card p-5 rounded-xl border border-border hover:border-purple-500/50 cursor-pointer transition-all flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
            style={{ backgroundColor: `${project?.color || '#6366f1'}20`, color: project?.color || '#6366f1' }}
          >
            <Folder size={20} />
          </div>
          <h3 className="font-bold text-base text-textPrimary group-hover:text-purple-400 transition-colors truncate">
            {project?.name || 'Untitled Project'}
          </h3>
        </div>

        <p className="text-xs text-textSecondary mb-4 line-clamp-2 leading-relaxed">
          {project?.description || 'No description provided for this research project.'}
        </p>
      </div>

      <div className="flex items-center justify-between text-[11px] text-textMuted pt-3 border-t border-border/40">
        <span>{project?.paper_count ?? 0} {project?.paper_count === 1 ? 'paper' : 'papers'}</span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {project?.updated_at ? new Date(project.updated_at).toLocaleDateString() : 'Recently'}
        </span>
      </div>
    </div>
  );
}
