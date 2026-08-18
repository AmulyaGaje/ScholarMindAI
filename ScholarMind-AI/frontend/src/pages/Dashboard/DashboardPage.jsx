import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, FolderKanban, Upload, HardDrive, RotateCw, AlertTriangle, ArrowRight, ExternalLink, Trash2 } from 'lucide-react';

import WelcomeBanner from '../../components/Dashboard/WelcomeBanner';
import StatsCard from '../../components/Dashboard/StatsCard';
import QuickActions from '../../components/Dashboard/QuickActions';
import RecentActivity from '../../components/Dashboard/RecentActivity';
import Spinner from '../../components/UI/Spinner';
import EmptyState from '../../components/UI/EmptyState';
import UploadModal from '../../components/Papers/UploadModal';
import CreateProjectModal from '../../components/Projects/CreateProjectModal';

import statsService from '../../services/statsService';
import projectService from '../../services/projectService';
import paperService from '../../services/paperService';
import historyService from '../../services/historyService';

import toast from 'react-hot-toast';

export default function DashboardPage() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recentPapers, setRecentPapers] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isUploadOpen, setUploadOpen] = useState(false);
  const [isProjectOpen, setProjectOpen] = useState(false);

  // Refetch all metrics and lists in parallel using existing domain services
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsRes, projectsRes, papersRes, historyRes] = await Promise.allSettled([
        statsService.getStats(),
        projectService.list(),
        paperService.list(),
        historyService.list(),
      ]);

      // 1. Stats response
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      } else {
        throw new Error('Failed to load statistics from backend.');
      }

      // 2. Projects response (slice top 4 for recent grid)
      if (projectsRes.status === 'fulfilled') {
        const projList = Array.isArray(projectsRes.value) ? projectsRes.value : [];
        setRecentProjects(projList.slice(0, 4));
      } else {
        setRecentProjects([]);
      }

      // 3. Papers response (slice top 6 for recent grid)
      if (papersRes.status === 'fulfilled') {
        const paperList = Array.isArray(papersRes.value)
          ? papersRes.value
          : (papersRes.value?.items || []);
        setRecentPapers(paperList.slice(0, 6));
      } else {
        setRecentPapers([]);
      }

      // 4. History response (slice top 10 for recent activity feed)
      if (historyRes.status === 'fulfilled') {
        const histList = Array.isArray(historyRes.value) ? historyRes.value : [];
        setRecentActivities(histList.slice(0, 10));
      } else {
        setRecentActivities([]);
      }
    } catch (err) {
      const msg = err?.message || 'Failed to load dashboard data.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDeletePaper = async (paperId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this paper?')) return;
    try {
      await paperService.delete(paperId);
      toast.success('Paper deleted successfully.');
      fetchDashboardData();
    } catch {
      toast.error('Failed to delete paper.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
        <p className="text-sm text-textMuted mt-4 animate-pulse">Loading dashboard metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] glass-card p-8 max-w-md mx-auto text-center">
        <AlertTriangle size={44} className="text-danger mb-3" />
        <h3 className="text-base font-bold text-textPrimary mb-1">Failed to Load Dashboard</h3>
        <p className="text-xs text-textSecondary mb-5">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accentHover text-white rounded-lg text-xs font-semibold transition-colors"
        >
          <RotateCw size={14} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* Top Controls & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-textPrimary tracking-tight">Overview</h2>
          <p className="text-xs text-textSecondary">Real-time statistics from PostgreSQL</p>
        </div>
        <QuickActions onUpload={() => setUploadOpen(true)} onCreateProject={() => setProjectOpen(true)} />
      </div>

      {/* Live Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Papers"
          value={stats?.total_papers ?? 0}
          subtext="In research library"
          icon={FileText}
          color="indigo"
        />
        <StatsCard
          title="Active Projects"
          value={stats?.active_projects ?? stats?.total_projects ?? 0}
          subtext="Active workspaces"
          icon={FolderKanban}
          color="purple"
        />
        <StatsCard
          title="Recent Uploads"
          value={stats?.recent_uploads ?? 0}
          subtext="Uploaded past 7 days"
          icon={Upload}
          color="emerald"
        />
        <StatsCard
          title="Storage Used"
          value={stats?.storage_used || '0 MB'}
          subtext={`${(stats?.storage_used_bytes ?? 0).toLocaleString()} bytes`}
          icon={HardDrive}
          color="amber"
        />
      </div>

      {/* Main Grid: Recent Papers & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Papers */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-textPrimary flex items-center gap-2">
                <FileText size={18} className="text-accent" />
                <span>Recent Papers</span>
              </h3>
              <button
                onClick={() => navigate('/library')}
                className="text-xs text-accent hover:text-accentHover font-semibold flex items-center gap-1 transition-colors"
              >
                <span>View Library</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {recentPapers.length === 0 ? (
              <EmptyState
                title="No Papers Uploaded"
                description="Upload your first research paper PDF to begin."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentPapers.map((paper) => (
                  <div
                    key={paper.id}
                    onClick={() => navigate('/library')}
                    className="p-4 rounded-xl bg-bgInput/40 border border-border hover:border-accent/50 transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm font-bold text-textPrimary group-hover:text-accent transition-colors line-clamp-2">
                          {paper.title || paper.file_name}
                        </h4>
                        <button
                          onClick={(e) => handleDeletePaper(paper.id, e)}
                          className="text-textMuted hover:text-danger p-1 rounded transition-colors"
                          title="Delete paper"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-textMuted pt-3 border-t border-border/40 mt-2">
                      <span>{new Date(paper.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1 text-accent font-medium">
                        Open <ExternalLink size={12} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Projects */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-textPrimary flex items-center gap-2">
                <FolderKanban size={18} className="text-purple-400" />
                <span>Recent Projects</span>
              </h3>
              <button
                onClick={() => navigate('/projects')}
                className="text-xs text-accent hover:text-accentHover font-semibold flex items-center gap-1 transition-colors"
              >
                <span>View All Projects</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {recentProjects.length === 0 ? (
              <EmptyState
                title="No Active Projects"
                description="Create a project workspace to organize your papers."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentProjects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => navigate(`/projects/${proj.id}`)}
                    className="p-4 rounded-xl bg-bgInput/40 border border-border hover:border-purple-500/50 transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2.5 mb-2">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: proj.color || '#6366f1' }}
                        />
                        <h4 className="text-sm font-bold text-textPrimary group-hover:text-purple-400 transition-colors truncate">
                          {proj.name}
                        </h4>
                      </div>
                      <p className="text-xs text-textSecondary line-clamp-2 mb-3">
                        {proj.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-textMuted pt-2 border-t border-border/40">
                      <span>{proj.paper_count ?? 0} {proj.paper_count === 1 ? 'paper' : 'papers'}</span>
                      <span>Updated {new Date(proj.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Activity Feed */}
        <div className="lg:col-span-1">
          <RecentActivity activities={recentActivities} />
        </div>
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={fetchDashboardData}
      />
      <CreateProjectModal
        isOpen={isProjectOpen}
        onClose={() => setProjectOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}
