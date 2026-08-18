import React, { useState } from 'react';
import PageHeader from '../../components/Layout/PageHeader';
import Button from '../../components/UI/Button';
import ProjectCard from '../../components/Projects/ProjectCard';
import CreateProjectModal from '../../components/Projects/CreateProjectModal';
import EmptyState from '../../components/UI/EmptyState';
import Spinner from '../../components/UI/Spinner';
import { useProjects } from '../../hooks/useProjects';
import { Plus, RotateCw, AlertTriangle } from 'lucide-react';

export default function ProjectsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const { projects, loading, error, refresh } = useProjects();

  const handleProjectCreated = (newProject) => {
    refresh();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Projects" description="Organize your research papers into collaborative topic workspaces.">
        <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2">
          <Plus size={16} />
          <span>Create Project</span>
        </Button>
      </PageHeader>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <Spinner size="lg" />
          <p className="text-sm text-textMuted mt-4 animate-pulse">Loading research projects...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] glass-card p-8 max-w-md mx-auto text-center">
          <AlertTriangle size={44} className="text-danger mb-3" />
          <h3 className="text-base font-bold text-textPrimary mb-1">Failed to Load Projects</h3>
          <p className="text-xs text-textSecondary mb-5">{error}</p>
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accentHover text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <RotateCw size={14} />
            <span>Retry</span>
          </button>
        </div>
      ) : !projects || projects.length === 0 ? (
        <EmptyState
          title="No Projects Found"
          description="Create your first research project to group and organize related papers."
          actionLabel="Create Project"
          onAction={() => setIsOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={handleProjectCreated}
      />
    </div>
  );
}
