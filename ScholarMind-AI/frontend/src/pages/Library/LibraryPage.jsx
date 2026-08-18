import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/Layout/PageHeader';
import Button from '../../components/UI/Button';
import PaperCard from '../../components/Papers/PaperCard';
import UploadModal from '../../components/Papers/UploadModal';
import PaperAnalysisModal from '../../components/Papers/PaperAnalysisModal';
import EmptyState from '../../components/UI/EmptyState';
import Spinner from '../../components/UI/Spinner';
import paperService from '../../services/paperService';
import bookmarkService from '../../services/bookmarkService';
import { UploadCloud, Search, ArrowUpDown, Filter, RotateCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LibraryPage() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isUploadOpen, setUploadOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_desc'); // date_desc, date_asc, title_asc, title_desc
  const [filterBookmarked, setFilterBookmarked] = useState(false);

  const fetchPapers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await paperService.list();
      const items = Array.isArray(res) ? res : res?.items || [];
      setPapers(items);
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to load research papers library.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  const handleOpenAnalysis = (paper) => {
    setSelectedPaper(paper);
    setIsAnalysisOpen(true);
  };

  const handleDeletePaper = async (id) => {
    if (!window.confirm('Are you sure you want to delete this research paper?')) return;
    try {
      await paperService.delete(id);
      toast.success('Paper deleted from library.');
      fetchPapers();
    } catch {
      toast.error('Failed to delete paper.');
    }
  };

  const handleToggleBookmark = async (paper) => {
    try {
      if (paper.is_bookmarked) {
        // Find existing bookmark and remove it
        const bookmarks = await bookmarkService.list();
        const found = bookmarks.find((b) => b.paper_id === paper.id);
        if (found) {
          await bookmarkService.remove(found.id);
        }
        // Locally toggle state or refetch
        setPapers(prev => prev.map(p => p.id === paper.id ? { ...p, is_bookmarked: false } : p));
        toast.success('Bookmark removed.');
      } else {
        await bookmarkService.add(paper.id);
        setPapers(prev => prev.map(p => p.id === paper.id ? { ...p, is_bookmarked: true } : p));
        toast.success('Paper bookmarked successfully.');
      }
    } catch (err) {
      toast.error('Failed to update bookmark.');
    }
  };

  // Sort & filter logic
  const filteredPapers = papers
    .filter((p) => {
      if (filterBookmarked && !p.is_bookmarked) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const titleMatch = p.title?.toLowerCase().includes(q);
      const authorMatch = Array.isArray(p.authors)
        ? p.authors.some((a) => a.toLowerCase().includes(q))
        : p.authors?.toLowerCase().includes(q);
      return titleMatch || authorMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'title_asc') {
        return (a.title || '').localeCompare(b.title || '');
      } else if (sortBy === 'title_desc') {
        return (b.title || '').localeCompare(a.title || '');
      } else if (sortBy === 'date_asc') {
        return new Date(a.created_at) - new Date(b.created_at);
      } else {
        // default date_desc
        return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="My Library" description="Manage, view, and analyze your uploaded research paper PDFs.">
        <Button onClick={() => setUploadOpen(true)} className="flex items-center gap-2">
          <UploadCloud size={16} />
          <span>Upload Paper</span>
        </Button>
      </PageHeader>

      {/* Toolbar / Search, Sort, Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-card p-4">
        {/* Search */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" />
          <input
            type="text"
            placeholder="Search papers by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-10 py-2 text-xs"
          />
        </div>

        {/* Sort & Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Bookmark filter */}
          <button
            onClick={() => setFilterBookmarked(!filterBookmarked)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filterBookmarked
                ? 'bg-amber-400/10 border-amber-400/40 text-amber-400'
                : 'border-border text-textSecondary hover:bg-bgCard'
            }`}
          >
            <span>Bookmarked Only</span>
          </button>

          {/* Sort dropdown */}
          <div className="relative flex items-center gap-1 bg-bgCard border border-border px-3 py-1.5 rounded-lg text-xs">
            <ArrowUpDown size={13} className="text-textMuted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-textSecondary font-semibold focus:outline-none cursor-pointer"
            >
              <option value="date_desc">Newest Uploaded</option>
              <option value="date_asc">Oldest Uploaded</option>
              <option value="title_asc">Title (A-Z)</option>
              <option value="title_desc">Title (Z-A)</option>
            </select>
          </div>

          <div className="text-xs text-textMuted font-medium">
            {filteredPapers.length} {filteredPapers.length === 1 ? 'paper' : 'papers'}
          </div>
        </div>
      </div>

      {/* Library Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <Spinner size="lg" />
          <p className="text-sm text-textMuted mt-4 animate-pulse">Loading research library...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] glass-card p-8 max-w-md mx-auto text-center">
          <h3 className="text-base font-bold text-textPrimary mb-1">Failed to Load Library</h3>
          <p className="text-xs text-textSecondary mb-5">{error}</p>
          <button
            onClick={fetchPapers}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accentHover text-white rounded-lg text-xs font-semibold"
          >
            <RotateCw size={14} />
            <span>Retry</span>
          </button>
        </div>
      ) : filteredPapers.length === 0 ? (
        <EmptyState
          title="No Research Papers Found"
          description={searchQuery ? 'No papers match your search query.' : 'Upload your first PDF research paper to get started.'}
          actionLabel={searchQuery ? undefined : 'Upload PDF'}
          onAction={searchQuery ? undefined : () => setUploadOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPapers.map((p) => (
            <PaperCard 
              key={p.id} 
              paper={p} 
              onOpen={handleOpenAnalysis} 
              onDelete={handleDeletePaper}
              onToggleBookmark={handleToggleBookmark} 
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <UploadModal isOpen={isUploadOpen} onClose={() => setUploadOpen(false)} onSuccess={fetchPapers} />

      {selectedPaper && (
        <PaperAnalysisModal
          paper={selectedPaper}
          isOpen={isAnalysisOpen}
          onClose={() => {
            setIsAnalysisOpen(false);
            setSelectedPaper(null);
            fetchPapers(); // refresh states
          }}
        />
      )}
    </div>
  );
}
